import * as THREE from "three";
import type { RefObject } from "react";
import type { CubeMove } from "@/types/cube";
import type { ExtendedTrackingState } from "./useDragState";
import { DRAG_SENSITIVITY } from "@/components/RubiksCube3D/geometry";

interface UseSnapLogicParams {
  trackingStateRef: RefObject<ExtendedTrackingState>;
  groupRef: RefObject<THREE.Group | null>;
  baseMoveToAxis: (baseMove: string) => "x" | "y" | "z";
  getDragParity: (face: string, axis: "x" | "y" | "z") => number;
  snapDuration: number;
  snapDurationSlow: number;
}

const useSnapLogic = ({
  trackingStateRef,
  groupRef,
  baseMoveToAxis,
  getDragParity,
  snapDuration,
  snapDurationSlow,
}: UseSnapLogicParams) => {
  const updateDragRotation = (dragVector: THREE.Vector2) => {
    if (!trackingStateRef.current.isDragging) return;

    const axisLock = trackingStateRef.current._axisLock;
    const faceRight = trackingStateRef.current._screenFaceRight;
    const faceUp = trackingStateRef.current._screenFaceUp;

    let signedProjection = 0;
    if (axisLock === "horizontal" && faceRight) {
      signedProjection = dragVector.dot(faceRight);
    } else if (axisLock === "vertical" && faceUp) {
      signedProjection = dragVector.dot(faceUp);
    } else {
      signedProjection =
        Math.abs(dragVector.x) > Math.abs(dragVector.y)
          ? Math.sign(dragVector.x) * dragVector.length()
          : Math.sign(dragVector.y) * dragVector.length();
    }

    // Parity: re-evaluate based on the face and base move axis for consistency
    const parity =
      trackingStateRef.current._dragSignParity ??
      getDragParity(
        trackingStateRef.current.clickedFace,
        baseMoveToAxis(trackingStateRef.current._baseMove || "F")
      );

    // Rotation is from drag projection with parity fix; axis sign stays fixed to base move
    trackingStateRef.current.currentRotation =
      DRAG_SENSITIVITY * signedProjection * parity;

    // Apply immediately to avoid one-frame delay waiting for useFrame
    const dg = trackingStateRef.current.dragGroup;
    if (dg) {
      dg.setRotationFromAxisAngle(
        trackingStateRef.current.rotationAxis,
        trackingStateRef.current.currentRotation
      );
    }
  };

  const finalizeDragWithSnapping = () => {
    if (!trackingStateRef.current.isDragging || !groupRef.current) return;

    const baseMove =
      trackingStateRef.current._baseMove ||
      trackingStateRef.current.lockedMoveType.replace(/['2]/g, "");
    const expectedSign = trackingStateRef.current._expectedBaseSign || 1;

    // Wrap current rotation to [-π, π] to avoid long spins
    const twoPi = Math.PI * 2;
    const normalizeAngle = (a: number) => {
      const m = (((a + Math.PI) % twoPi) + twoPi) % twoPi; // [0, 2π)
      return m - Math.PI; // (-π, π]
    };

    let currentRotation = normalizeAngle(
      trackingStateRef.current.currentRotation
    );
    // Update stored rotation and group to the wrapped angle (visually identical)
    trackingStateRef.current.currentRotation = currentRotation;
    if (trackingStateRef.current.dragGroup) {
      trackingStateRef.current.dragGroup.setRotationFromAxisAngle(
        trackingStateRef.current.rotationAxis,
        currentRotation
      );
    }

    const snapIncrement = Math.PI / 2;

    const stepsFloat = currentRotation / snapIncrement;
    const baseSteps = Math.round(stepsFloat); // -2..2

    // Distance-based control for 180°: require a long drag; flick can only add a single quarter step
    const velocity = trackingStateRef.current.dragVelocity || 0;
    const velocityThreshold = 100;

    const startPos = trackingStateRef.current.startPosition;
    const curPos = trackingStateRef.current.currentPosition;
    const dragVecPx = curPos.clone().sub(startPos);
    let axisProjPx = 0;
    const axisLock = trackingStateRef.current._axisLock;
    const faceRight = trackingStateRef.current._screenFaceRight;
    const faceUp = trackingStateRef.current._screenFaceUp;
    if (axisLock === "horizontal" && faceRight) {
      axisProjPx = dragVecPx.dot(faceRight);
    } else if (axisLock === "vertical" && faceUp) {
      axisProjPx = dragVecPx.dot(faceUp);
    } else {
      axisProjPx =
        Math.abs(dragVecPx.x) >= Math.abs(dragVecPx.y)
          ? Math.sign(dragVecPx.x) * dragVecPx.length()
          : Math.sign(dragVecPx.y) * dragVecPx.length();
    }
    const axisProjAbsPx = Math.abs(axisProjPx);

    // Only allow 180° if user dragged a long distance (or angle clearly near 180°)
    const TWO_TURN_STEPS_MIN = 1.5; // at least 135° in angle
    const TWO_TURN_PX_MIN = 180; // or ~180px along the locked axis
    const allowTwoTurn =
      Math.abs(stepsFloat) >= TWO_TURN_STEPS_MIN ||
      axisProjAbsPx >= TWO_TURN_PX_MIN;

    let targetSteps = baseSteps;
    let flickInfluenced = false;

    // Compute instantaneous axis-projected velocity near release (px/sec)
    let axisVelPxPerSec = 0;
    const times = trackingStateRef.current.dragTimestamps;
    const positions = trackingStateRef.current.dragPositions;
    if (times && positions && times.length >= 2) {
      const i2 = times.length - 1;
      // Find a sample ~40-70ms back to estimate instantaneous speed
      let j2 = i2 - 1;
      for (let k = i2 - 1; k >= 0; k--) {
        const dtMs = times[i2] - times[k];
        if (dtMs >= 40) {
          j2 = k;
          break;
        }
      }
      const dtMs = Math.max(1, times[i2] - times[j2]);
      const dp = positions[i2].clone().sub(positions[j2]);
      const axisDir =
        axisLock === "horizontal" && faceRight
          ? faceRight
          : axisLock === "vertical" && faceUp
          ? faceUp
          : undefined;
      const proj = axisDir
        ? dp.dot(axisDir)
        : Math.abs(dp.x) >= Math.abs(dp.y)
        ? Math.sign(dp.x) * dp.length()
        : Math.sign(dp.y) * dp.length();
      axisVelPxPerSec = (proj * 1000) / dtMs;
    }

    // Apply drag parity to flick direction so it matches drag orientation per face/axis
    let flickParity = trackingStateRef.current._dragSignParity ?? 1;
    const axisVelSigned = axisVelPxPerSec * flickParity;

    // Flick behavior: move to the next 90° in the flick direction RELATIVE to the current angle
    const SINGLE_FLICK_VEL_MIN = 100; // px/sec threshold for flick
    const SINGLE_FLICK_MIN_PX = 25; // minimal axis-projected distance to qualify
    const flickDir = Math.sign(axisVelSigned);
    if (
      flickDir !== 0 &&
      axisProjAbsPx > SINGLE_FLICK_MIN_PX &&
      (Math.abs(axisVelSigned) > SINGLE_FLICK_VEL_MIN ||
        Math.abs(velocity) > velocityThreshold)
    ) {
      const nextStepInFlickDir =
        flickDir > 0 ? Math.ceil(stepsFloat) : Math.floor(stepsFloat);
      targetSteps = nextStepInFlickDir;
      flickInfluenced = true;
    }

    // If base rounding produced a 180° but drag wasn't long enough, demote to 90°
    if (Math.abs(targetSteps) === 2 && !allowTwoTurn) {
      targetSteps = Math.sign(targetSteps); // ±1
    }

    // If flick influenced and we are at a quarter turn, keep direction consistent with flick
    if (flickInfluenced && Math.abs(targetSteps) === 1) {
      const dir = Math.sign(axisVelSigned) || Math.sign(targetSteps) || 1;
      targetSteps = dir;
    }

    // Clamp to valid range (allow half-turns again when thresholds permit)
    targetSteps = Math.max(-2, Math.min(2, targetSteps));

    const signedSteps = targetSteps; // -2,-1,0,1,2

    let finalMove = "";
    let targetAngle = 0;
    if (signedSteps === 0) {
      trackingStateRef.current.isDragging = false;
      trackingStateRef.current.isSnapping = true;
      trackingStateRef.current.snapAnimationStartTime = performance.now();
      trackingStateRef.current.snapAnimationDuration = snapDurationSlow;
      trackingStateRef.current.snapStartRotation =
        trackingStateRef.current.currentRotation;
      trackingStateRef.current.snapTargetRotation = 0;
      trackingStateRef.current.finalMove = "";
      return;
    }

    if (Math.abs(signedSteps) === 2) {
      finalMove = baseMove + "2";
      const baseTarget = Math.sign(currentRotation) * Math.PI || Math.PI;
      const k = Math.round((currentRotation - baseTarget) / twoPi);
      targetAngle = baseTarget + k * twoPi;
    } else {
      const quarterSign = flickInfluenced
        ? Math.sign(axisVelSigned) || 1
        : Math.sign(signedSteps) || 1;
      finalMove = quarterSign === expectedSign ? baseMove : baseMove + "'";
      const baseTarget = signedSteps * snapIncrement; // -π/2 or +π/2
      const k = Math.round((currentRotation - baseTarget) / twoPi);
      targetAngle = baseTarget + k * twoPi;
    }

    trackingStateRef.current.isDragging = false;
    trackingStateRef.current.isSnapping = true;
    trackingStateRef.current.snapAnimationStartTime = performance.now();
    trackingStateRef.current.snapAnimationDuration = snapDuration;
    trackingStateRef.current.snapStartRotation =
      trackingStateRef.current.currentRotation;
    trackingStateRef.current.snapTargetRotation = targetAngle;
    trackingStateRef.current.finalMove = finalMove as CubeMove;
  };

  return { updateDragRotation, finalizeDragWithSnapping };
};

export default useSnapLogic;
