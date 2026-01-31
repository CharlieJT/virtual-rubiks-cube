import { useCallback, useImperativeHandle } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { AnimationHelper } from "@utils/animationHelper";
import type {
  RubiksCube3DHandle,
  TrackingStateRef,
} from "../components/RubiksCube3D/types";
import type { CubeMove } from "@/types/cube";
import type { CubeJSWrapper } from "@/utils/cubejsWrapper";

const useAnimation = (
  trackingStateRef: React.RefObject<TrackingStateRef>,
  cleanupDragState: () => void,
  commitMoveOnce: (move: CubeMove) => void
) => {
  // Update snapping animation logic
  const updateSnappingAnimation = () => {
    // Update snapping animation if active
    if (
      trackingStateRef.current?.isSnapping &&
      trackingStateRef.current?.dragGroup
    ) {
      const dragState = trackingStateRef.current;
      const elapsed = Date.now() - dragState.snapAnimationStartTime;
      const progress = Math.min(elapsed / dragState.snapAnimationDuration, 1);

      // Quadratic easing out for smooth feel
      const easedProgress = 1 - Math.pow(1 - progress, 2);

      // Calculate current rotation based on progress
      const currentRotation =
        dragState.snapStartRotation +
        (dragState.snapTargetRotation - dragState.snapStartRotation) *
          easedProgress;

      // Update the current rotation
      dragState.currentRotation = currentRotation;

      // Apply rotation to the drag group
      if (dragState.dragGroup) {
        dragState.dragGroup.setRotationFromAxisAngle(
          dragState.rotationAxis,
          currentRotation
        );
      }

      // Animation complete - execute the final move
      if (progress >= 1) {
        // Guard so we run this block only once
        if (dragState._snapCompleted) return;
        dragState._snapCompleted = true;

        if (dragState.finalMove && commitMoveOnce) {
          // Store the move to be executed
          const moveToExecute = dragState.finalMove;

          // Use the same debounced commit function
          commitMoveOnce(moveToExecute);

          // Clean up visual state
          setTimeout(() => {
            cleanupDragState();
            // Reset snapping state
            if (trackingStateRef.current) {
              trackingStateRef.current.isSnapping = false;
            }
          }, 0);
        } else {
          // No final move, just cleanup
          cleanupDragState();
          // Reset snapping state
          if (trackingStateRef.current) {
            trackingStateRef.current.isSnapping = false;
          }
        }
      }
    }
  };

  // Update drag rotation if active
  const updateDragRotation = () => {
    if (
      trackingStateRef.current?.isDragging &&
      trackingStateRef.current?.dragGroup
    ) {
      const dragState = trackingStateRef.current;
      const rotation = dragState.currentRotation;

      // Apply rotation to the drag group
      if (dragState.dragGroup) {
        dragState.dragGroup.setRotationFromAxisAngle(
          dragState.rotationAxis,
          rotation
        );
      }
    }
  };

  return {
    updateSnappingAnimation,
    updateDragRotation,
  };
};

export const useImperativeHandle3D = (
  ref: React.ForwardedRef<RubiksCube3DHandle>,
  groupRef: React.RefObject<THREE.Group | null>,
  trackingStateRef: React.RefObject<TrackingStateRef>,
  cleanupDragState: () => void,
  touchCount: number,
  isAnimating?: boolean,
  onOrbitControlsChange?: (enabled: boolean) => void,
  isTimerMode: boolean = false,
  inputDisabled: boolean = false,
  resetLogo?: () => void
) => {
  const { camera, gl } = useThree();

  // Calculate duration based on timer mode
  const snapDuration = isTimerMode ? 60 : 120;

  // New handler for boundary pointer down detection (cleaned up)
  const handleBoundaryPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!groupRef.current || !camera || !gl) return;

      // If input is disabled, ensure orbits are off and ignore interactions
      if (inputDisabled) {
        onOrbitControlsChange?.(false);
        return;
      }

      // Detect multi-touch early and force-disable orbits during 2+ fingers
      const native = e.nativeEvent as PointerEvent | TouchEvent | undefined;
      const pointerType: string | undefined =
        (native && "pointerType" in native ? native.pointerType : undefined) ||
        ("pointerType" in e ? (e as unknown as PointerEvent).pointerType : undefined);
      const touchesLen: number =
        (native && "touches" in native
          ? (native as TouchEvent).touches.length
          : 0) ||
        (touchCount ?? 0);
      if (pointerType === "touch" && touchesLen >= 2) {
        onOrbitControlsChange?.(false);
        return;
      }

      const rect = gl.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2();
      mouse.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      // Check for intersection with any cube meshes (cached list)
      const targets: THREE.Mesh[] = [];
      groupRef.current!.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          targets.push(child);
        }
      });

      const intersects = raycaster.intersectObjects(targets);

      if (intersects.length > 0) {
        // Disable orbit when pressing on the cube, but let the event continue
        // so the cubie's own onPointerDown can initiate slice dragging.
        onOrbitControlsChange?.(false);
      } else {
        if (!isAnimating && touchesLen < 2) {
          onOrbitControlsChange?.(true);
        }
      }
    },
    [
      camera,
      gl,
      onOrbitControlsChange,
      isAnimating,
      touchCount,
      groupRef,
      inputDisabled,
    ]
  );

  const handleBoundaryPointerUp = useCallback(() => {
    if (inputDisabled) {
      // Keep orbits disabled while input is disabled
      onOrbitControlsChange?.(false);
      return;
    }
    if (!isAnimating && (touchCount ?? 0) <= 1) {
      onOrbitControlsChange?.(true);
    }
  }, [isAnimating, onOrbitControlsChange, touchCount, inputDisabled]);

  // Now that boundary handlers are defined, expose them via the imperative handle
  useImperativeHandle(
    ref,
    () => ({
      spinAroundViewAxis: (angleRad: number) => {
        if (!groupRef.current) return;
        // Respect global input lock (e.g., tutorial locked slide)
        if (inputDisabled) return;
        if (
          trackingStateRef.current?.isDragging ||
          trackingStateRef.current?.isSnapping
        )
          return;
        if (AnimationHelper.isLocked()) return;
        const axisWorld = camera
          .getWorldDirection(new THREE.Vector3())
          .normalize();
        const q = new THREE.Quaternion().setFromAxisAngle(axisWorld, angleRad);
        groupRef.current.quaternion.premultiply(q);
        groupRef.current.updateMatrixWorld(true);
      },
      spinAroundYAxis: (angleRad: number) => {
        if (!groupRef.current) return;
        // Respect global input lock (e.g., tutorial locked slide)
        if (inputDisabled) return;
        if (
          trackingStateRef.current?.isDragging ||
          trackingStateRef.current?.isSnapping
        )
          return;
        if (AnimationHelper.isLocked()) return;
        const yAxis = new THREE.Vector3(0, 1, 0);
        const q = new THREE.Quaternion().setFromAxisAngle(yAxis, angleRad);
        groupRef.current.quaternion.premultiply(q);
        groupRef.current.updateMatrixWorld(true);
      },
      abortActiveDrag: () => {
        window.removeEventListener("pointermove", () => {});
        window.removeEventListener("pointerup", () => {});
        if (
          trackingStateRef.current?.isDragging ||
          trackingStateRef.current?.dragGroup
        ) {
          const current = trackingStateRef.current?.currentRotation || 0;
          if (trackingStateRef.current) {
            trackingStateRef.current.isDragging = false;
            trackingStateRef.current.isSnapping = true;
            trackingStateRef.current.snapAnimationStartTime = Date.now();
            trackingStateRef.current.snapAnimationDuration = snapDuration;
            trackingStateRef.current.snapStartRotation = current;
            trackingStateRef.current.snapTargetRotation = 0;
            trackingStateRef.current.finalMove = "";
          }
        } else {
          cleanupDragState();
          if (trackingStateRef.current) {
            trackingStateRef.current.isTracking = false;
          }
        }
      },
      isDraggingSlice: () => !!trackingStateRef.current?.isDragging,
      getCurrentRotation: () => {
        return groupRef.current ? groupRef.current.quaternion.clone() : null;
      },
      celebratorySpin: (onComplete?: () => void) => {
        if (!groupRef.current) {
          onComplete?.();
          return;
        }

        const initialQuaternion = new THREE.Quaternion(0, 0, 0, 1); // Identity quaternion
        const currentQuaternion = groupRef.current.quaternion.clone();

        let animationFrame = 0;
        const totalFrames = 60; // 1 second at 60fps - make it slower and more visible

        const animate = () => {
          if (animationFrame < totalFrames && groupRef.current) {
            const progress = animationFrame / totalFrames;
            // Ease in & out effect using smoothstep function
            const easedProgress = progress * progress * (8 - 2 * progress);

            // Add some extra rotation to make the movement more dramatic
            const extraRotation = new THREE.Quaternion();
            extraRotation.setFromAxisAngle(
              new THREE.Vector3(0, 1, 0),
              Math.PI * 2 * progress
            ); // Full Y rotation

            // Interpolate between current rotation and initial rotation
            const baseInterpolation = currentQuaternion
              .clone()
              .slerp(initialQuaternion, easedProgress);

            // Combine the interpolation with the extra rotation for dramatic effect
            const finalQuaternion = baseInterpolation
              .clone()
              .multiply(extraRotation);

            groupRef.current.quaternion.copy(finalQuaternion);

            animationFrame++;
            requestAnimationFrame(animate);
          } else {
            // Animation complete, ensure we're exactly at identity
            if (groupRef.current) {
              groupRef.current.quaternion.copy(initialQuaternion);
            }
            onComplete?.();
          }
        };

        animate();
      },
      resetToInitialPosition: (
        orbitControlsRef?: React.RefObject<any>,
        _cubeRef?: React.RefObject<CubeJSWrapper>,
        onComplete?: () => void,
        instant?: boolean
      ) => {
        if (!orbitControlsRef?.current || !groupRef.current) {
          onComplete?.();
          return;
        }

        const controls = orbitControlsRef.current;
        const cubeGroup = groupRef.current;

        // Note: We don't dispatch any extra moves here; real solver moves (if needed)
        // are enqueued in ensureSolvedThen() so they don't conflict with this rotation.

        // Instead of trying to animate the camera ourselves, let's directly set the controls
        // to their target state and animate only the cube rotation
        const camera = controls.object;

        // Log current state

        // Capture current cube rotation
        const currentCubeQuaternion = cubeGroup.quaternion.clone();

        // Instead of using quaternion math, let's use center-based detection
        // similar to how auto-orient works

        // Calculate the target cube orientation based on current camera position
        // Goal: white on top AND side faces aligned (fix yaw around Y after orbiting)
        // OR yellow on top if flipUpsideDown is requested
        let targetCubeQuaternion: THREE.Quaternion;

        // Camera vectors
        const camPos = camera.position.clone();
        const camTarget = controls.target.clone();
        const camForward = camTarget.clone().sub(camPos).normalize(); // direction from camera to cube
        const camUp = camera.up.clone().normalize();

        // Get options first to check if we need to flip
        const extraOpts = (controls).__resetOpts || {};

        // Step 1: align cube's +Y (white) to camera up, OR -Y (yellow) if flipping
        // Use EXACTLY the same computation for both cases - just use different local vector
        // This ensures orbit is handled identically for normal and flipped slides
        const cubeUpLocal = extraOpts.flipUpsideDown
          ? new THREE.Vector3(0, -1, 0) // Align yellow (bottom) to camera up when flipping
          : new THREE.Vector3(0, 1, 0); // Align white (top) to camera up normally

        // Apply extraPitchDeg if requested (vertical pitch - rotation around horizontal axis)
        // This rotates around the camera's right vector (horizontal axis perpendicular to forward and up)
        // to tilt the view up/down. Positive values tilt up (look more from above), negative values tilt down
        // We need to apply this to the target camera up vector BEFORE computing the alignment
        let targetCamUp = camUp.clone();
        if (typeof extraOpts.extraPitchDeg === "number") {
          const pitchRad = THREE.MathUtils.degToRad(extraOpts.extraPitchDeg);
          // Calculate right vector (horizontal axis perpendicular to camera forward and up)
          // This is the axis we rotate around to tilt the view vertically
          const camRight = new THREE.Vector3()
            .crossVectors(camForward, camUp)
            .normalize();
          // If camRight is zero (forward and up are parallel), use a default right vector
          if (camRight.lengthSq() < 1e-6) {
            camRight.set(1, 0, 0).normalize();
          }
          // Rotate the target camera up vector around the right axis to tilt the view
          const pitchQuat = new THREE.Quaternion().setFromAxisAngle(
            camRight,
            pitchRad
          );
          targetCamUp.applyQuaternion(pitchQuat).normalize();
        }

        // Compute target orientation relative to camera (identical method for both cases)
        const alignUpQuat = new THREE.Quaternion().setFromUnitVectors(
          cubeUpLocal,
          targetCamUp
        );

        // Step 2: compute yaw so cube's +Z (green/front) aligns to camera forward projected in the up plane
        const cubeFront = new THREE.Vector3(0, 0, 1).applyQuaternion(
          alignUpQuat
        );
        const frontProj = cubeFront
          .clone()
          .projectOnPlane(targetCamUp)
          .normalize();
        const viewProj = camForward
          .clone()
          .negate()
          .projectOnPlane(targetCamUp)
          .normalize();

        let yawQuat = new THREE.Quaternion();
        if (viewProj.lengthSq() > 1e-6 && frontProj.lengthSq() > 1e-6) {
          const cross = new THREE.Vector3().copy(frontProj).cross(viewProj);
          const sin = THREE.MathUtils.clamp(cross.dot(targetCamUp), -1, 1);
          const cos = THREE.MathUtils.clamp(frontProj.dot(viewProj), -1, 1);
          const angle = Math.atan2(sin, cos);
          yawQuat.setFromAxisAngle(targetCamUp, angle);
        }

        // Final target quaternion: first align up, then yaw around that up
        targetCubeQuaternion = yawQuat.clone().multiply(alignUpQuat);

        // Apply additional yaw offset if requested (same for both cases)
        const yOffsetRad =
          typeof extraOpts.extraYawRad === "number"
            ? extraOpts.extraYawRad
            : THREE.MathUtils.degToRad(-45);
        const extraYaw = new THREE.Quaternion().setFromAxisAngle(
          targetCamUp,
          yOffsetRad
        );
        targetCubeQuaternion.premultiply(extraYaw);

        // Apply extraERotationDeg if requested (rotation around cube's Y axis / E direction)
        // We want to rotate around the cube's Y-axis AFTER all previous rotations
        // Since the cube's Y-axis (for normal) or -Y axis (for flipped) is aligned with targetCamUp after previous rotations,
        // we can rotate around targetCamUp (or -targetCamUp for flipped) to rotate around the cube's Y-axis
        if (typeof extraOpts.extraERotationDeg === "number") {
          const eRotationRad = THREE.MathUtils.degToRad(
            extraOpts.extraERotationDeg
          );
          // For flipped slides: cube's -Y aligns with targetCamUp, so cube's +Y is -targetCamUp
          // We want to rotate around cube's +Y, so use -targetCamUp
          // For normal slides: cube's +Y aligns with targetCamUp
          const rotationAxis = extraOpts.flipUpsideDown
            ? targetCamUp.clone().negate()
            : targetCamUp.clone();
          const eRotationQuat = new THREE.Quaternion().setFromAxisAngle(
            rotationAxis,
            eRotationRad
          );
          // Apply E-rotation after previous rotations by composing it correctly
          // We want: targetCubeQuaternion * eRotationQuat (apply targetCubeQuaternion, then eRotationQuat)
          // But multiply() does: eRotationQuat * targetCubeQuaternion (apply targetCubeQuaternion, then eRotationQuat) - wait, that's backwards
          // Actually multiply() does: targetCubeQuaternion * eRotationQuat in the sense that it applies eRotationQuat first, then targetCubeQuaternion
          // So we need to use premultiply to get the correct order
          targetCubeQuaternion.premultiply(eRotationQuat);
        }

        // Clear one-shot options
        if ((controls).__resetOpts) delete (controls).__resetOpts;

        // If instant is true, set rotation directly without animation
        if (instant) {
          cubeGroup.quaternion.copy(targetCubeQuaternion);
          cubeGroup.updateMatrixWorld(true);
          onComplete?.();
          return;
        }

        // Don't move the camera - keep it at current position
        // Only rotate the cube to show white on top from current camera angle
        const startCameraPosition = camera.position.clone();
        const startCameraTarget = controls.target.clone();

        // Use time-based animation instead of frame-based for consistent duration across devices
        const duration = 600; // 600ms for consistent speed on all devices
        const startTime = performance.now();

        const animate = () => {
          const elapsed = performance.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Stronger ease-in-out curve (quintic)
          const easedProgress =
            progress < 0.5
              ? 16 * progress * progress * progress * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 5) / 2;

          // Don't animate camera - keep it at current position
          // Only animate cube rotation
          const newCameraPosition = startCameraPosition;
          const newCameraTarget = startCameraTarget;

          // Set camera position directly
          camera.position.copy(newCameraPosition);
          controls.target.copy(newCameraTarget);

          // Force camera to look at target and update controls
          camera.lookAt(newCameraTarget);
          camera.updateMatrixWorld(true);

          // Update controls to match the new state
          controls.update();

          // Animate cube rotation
          const interpolatedCubeQuaternion = currentCubeQuaternion
            .clone()
            .slerp(targetCubeQuaternion, easedProgress);
          cubeGroup.quaternion.copy(interpolatedCubeQuaternion);

          if (progress >= 1) {
            // Animation is complete
            onComplete?.();
          } else {
            requestAnimationFrame(animate);
          }
        };

        animate();
      },
      handlePointerDown: handleBoundaryPointerDown,
      handlePointerUp: handleBoundaryPointerUp,
      resetLogo: () => {
        resetLogo?.();
      },
    }),
    [
      camera,
      handleBoundaryPointerDown,
      handleBoundaryPointerUp,
      groupRef,
      trackingStateRef,
      cleanupDragState,
      resetLogo,
    ]
  );

  return {
    handleBoundaryPointerDown,
    handleBoundaryPointerUp,
  };
};

export default useAnimation;
