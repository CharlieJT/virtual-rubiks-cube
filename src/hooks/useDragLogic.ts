import { useRef, useCallback } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import type { TrackingStateRef } from "../components/RubiksCube3D/types";
import type { CubeMove, SwipeDirection } from "@/types/cube";
import { AnimationHelper, type AnimatedCubie } from "@utils/animationHelper";
import {
  POSITION_MOVE_MAPPING,
  type PositionMoveKey,
} from "@/maps/positionMoveMapping";
import {
  DRAG_SENSITIVITY,
  LOCK_PRIMARY_PX,
} from "../components/RubiksCube3D/geometry";

const useDragLogic = (
  groupRef: React.RefObject<THREE.Group | null>,
  cubiesRef: React.RefObject<AnimatedCubie[]>,
  _commitMoveOnce: (move: CubeMove) => void,
  isTimerMode: boolean = false
) => {
  const { camera, gl } = useThree();

  // Animation durations based on timer mode
  const snapDuration = isTimerMode ? 60 : 120; // Default snap duration
  const snapDurationSlow = isTimerMode ? 75 : 150; // Slower snaps
  const snapDurationFast = isTimerMode ? 50 : 100; // Faster snaps

  // Enhanced position tracking with drag mechanics
  const trackingStateRef = useRef<
    TrackingStateRef & {
      dragTimestamps?: number[];
      dragPositions?: THREE.Vector2[];
      dragVelocity?: number;
    }
  >({
    isTracking: false,
    startPosition: new THREE.Vector2(),
    currentPosition: new THREE.Vector2(),
    cubiePosition: [0, 0, 0],
    clickedFace: "",
    uniquePieceId: "",
    isDragging: false,
    lockedMoveType: "",
    lockedDirection: "up",
    initialSwipeDirection: "up",
    dragGroup: null,
    affectedCubies: [],
    rotationAxis: new THREE.Vector3(),
    currentRotation: 0,
    hasStartedDrag: false,
    // Snapping animation state
    isSnapping: false,
    snapAnimationStartTime: 0,
    snapAnimationDuration: snapDuration, // Default duration based on timer mode
    snapStartRotation: 0,
    snapTargetRotation: 0,
    finalMove: "",
    _axisLock: undefined,
    _initialDragDirection: undefined,
    _allowedMoves: [],
    // Face-local axes in screen space, captured at pointer down
    _screenFaceRight: undefined,
    _screenFaceUp: undefined,
    _lockThresholdPx: 0,
    // Canonical base move and expected sign (from AnimationHelper) used to interpret rotation
    _baseMove: undefined,
    _expectedBaseSign: undefined,
    // Parity to fix sign per face/axis
    _dragSignParity: 1,
    // Guard
    _snapCompleted: false,
  });

  // Build a face-local basis (right/up) in cube local space
  const getFaceBasisLocal = useCallback((face: string) => {
    const normal =
      face === "front"
        ? new THREE.Vector3(0, 0, 1)
        : face === "back"
        ? new THREE.Vector3(0, 0, -1)
        : face === "right"
        ? new THREE.Vector3(1, 0, 0)
        : face === "left"
        ? new THREE.Vector3(-1, 0, 0)
        : face === "top"
        ? new THREE.Vector3(0, 1, 0)
        : new THREE.Vector3(0, -1, 0);

    const globalUp = new THREE.Vector3(0, 1, 0);
    let right = new THREE.Vector3().crossVectors(globalUp, normal);
    if (right.lengthSq() < 1e-6) {
      // normal nearly collinear with up, use forward as fallback
      const forward = new THREE.Vector3(0, 0, 1);
      right = new THREE.Vector3().crossVectors(forward, normal);
    }
    right.normalize();
    const up = new THREE.Vector3().crossVectors(normal, right).normalize();
    return { normal, right, up };
  }, []);

  // Project a local-space direction to a 2D screen-space vector
  const projectLocalDirToScreen = useCallback(
    (dirLocal: THREE.Vector3) => {
      if (!groupRef.current) return new THREE.Vector2(0, 0);
      const originWorld = groupRef.current.getWorldPosition(
        new THREE.Vector3()
      );
      const dirWorld = dirLocal
        .clone()
        .applyQuaternion(groupRef.current.quaternion);
      const endWorld = originWorld.clone().add(dirWorld);
      const originNdc = originWorld.clone().project(camera);
      const endNdc = endWorld.clone().project(camera);
      const ndcDelta = new THREE.Vector2(
        endNdc.x - originNdc.x,
        endNdc.y - originNdc.y
      );
      // Convert NDC to pixel space and invert Y to match browser coordinates
      const rect = gl.domElement.getBoundingClientRect();
      return new THREE.Vector2(
        ndcDelta.x * (rect.width / 2),
        -ndcDelta.y * (rect.height / 2)
      );
    },
    [camera, gl, groupRef]
  );

  // Helper: base move to axis char
  const baseMoveToAxis = (baseMove: string): "x" | "y" | "z" => {
    const b = baseMove.toUpperCase();
    if (b === "R" || b === "L" || b === "M" || b === "X") return "x";
    if (b === "U" || b === "D" || b === "E" || b === "Y") return "y";
    return "z"; // F, B, S, Z
  };

  // Helper: determine drag sign parity by face and axis to align visual drag with move direction
  const getDragParity = (face: string, axis: "x" | "y" | "z"): number => {
    // Default: no parity flip
    let parity = 1;

    switch (face) {
      case "front":
        // Horizontal drags on the front face tend to feel reversed relative to rotation sign
        if (axis === "x") parity = -1;
        break;
      case "left":
        // Z-axis rotations initiated from the left face need inversion
        if (axis === "z") parity = -1;
        break;
      case "bottom":
        // Bottom face: vertical and horizontal gestures often read inverted
        if (axis === "y" || axis === "x") parity = -1;
        break;
      // Intentionally leave top/right/back with default parity to avoid regressions
      default:
        break;
    }

    return parity;
  };

  // Generate unique piece identifier based on grid position and face
  const generateUniquePieceId = (
    gridPos: [number, number, number],
    face: string
  ) => {
    const [x, y, z] = gridPos;

    // Create a unique identifier that represents the physical position on the cube
    // This will never change regardless of cube state/colors
    let pieceType = "";
    let positionId = "";

    // Determine piece type and position
    const numNonZero = [x, y, z].filter((coord) => coord !== 0).length;

    if (numNonZero === 3) {
      // Corner piece
      pieceType = "corner";
      positionId = `${x > 0 ? "R" : "L"}${y > 0 ? "U" : "D"}${
        z > 0 ? "F" : "B"
      }`;
    } else if (numNonZero === 2) {
      // Edge piece
      pieceType = "edge";
      if (x === 0) positionId = `M${y > 0 ? "U" : "D"}${z > 0 ? "F" : "B"}`;
      else if (y === 0)
        positionId = `${x > 0 ? "R" : "L"}E${z > 0 ? "F" : "B"}`;
      else if (z === 0)
        positionId = `${x > 0 ? "R" : "L"}${y > 0 ? "U" : "D"}S`;
    } else if (numNonZero === 1) {
      // Center piece
      pieceType = "center";
      if (x !== 0) positionId = x > 0 ? "R" : "L";
      else if (y !== 0) positionId = y > 0 ? "U" : "D";
      else if (z !== 0) positionId = z > 0 ? "F" : "B";
    }

    return `${pieceType}_${positionId}_${face}`;
  };

  // Get affected cubies based on the face and move type - using AnimationHelper logic
  const getAffectedCubiesForMove = (moveType: string) => {
    return (
      cubiesRef.current?.filter((cubie) => {
        // Use the exact same logic as AnimationHelper.isCubieInMove

        switch (moveType) {
          case "F":
            return cubie.z === 2; // Front face
          case "B":
            return cubie.z === 0; // Back face
          case "R":
            return cubie.x === 2; // Right face
          case "L":
            return cubie.x === 0; // Left face
          case "U":
            return cubie.y === 2; // Top face
          case "D":
            return cubie.y === 0; // Bottom face
          case "M": // Middle slice (between L and R)
            return cubie.x === 1;

          case "E": // Equatorial slice (between U and D)
            return cubie.y === 1;
          case "S": // Standing slice (between F and B)
            return cubie.z === 1;
          default:
            return false;
        }
      }) || []
    );
  };

  // Helper function to clean up drag state
  const cleanupDragState = () => {
    // Clean up drag group if it exists
    const dragGroup = trackingStateRef.current.dragGroup;
    if (dragGroup && groupRef.current) {
      const tempGroup = dragGroup;
      trackingStateRef.current.dragGroup = null;
      const meshesToMove: THREE.Mesh[] = [];
      tempGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          meshesToMove.push(child);
        }
      });

      meshesToMove.forEach((mesh) => {
        const cubie = trackingStateRef.current.affectedCubies.find(
          (c) => c.mesh === mesh
        );
        if (cubie) {
          tempGroup.remove(mesh);
          groupRef.current!.add(mesh);
          mesh.position.copy(cubie.originalPosition);
          mesh.rotation.set(0, 0, 0);
        }
      });

      groupRef.current.remove(tempGroup);
    }

    // Reset animation state properties
    trackingStateRef.current.isSnapping = false;
    trackingStateRef.current.snapAnimationStartTime = 0;
    trackingStateRef.current.snapStartRotation = 0;
    trackingStateRef.current.snapTargetRotation = 0;

    // Re-enable orbit controls
    AnimationHelper.unlock();
  };

  // Helper function to start drag animation
  const startDragAnimation = (
    suggestedMove: string,
    swipeDirection: SwipeDirection
  ) => {
    if (!groupRef.current || trackingStateRef.current.hasStartedDrag) return;

    // Determine canonical base move (strip prime/2)
    const baseMove = suggestedMove.replace(/['2]/g, "");
    trackingStateRef.current._baseMove = baseMove;

    // Use the base move's axis and expected sign
    const [axis, totalRotation] = AnimationHelper.getMoveAxisAndDir(
      baseMove as CubeMove
    );
    trackingStateRef.current.rotationAxis = axis.clone();
    trackingStateRef.current._expectedBaseSign = Math.sign(totalRotation) || 1;

    // Determine parity from face/axis to align drag with expected visual direction
    const baseAxis = baseMoveToAxis(baseMove);
    trackingStateRef.current._dragSignParity = getDragParity(
      trackingStateRef.current.clickedFace,
      baseAxis
    );

    // Lock base move type (non-prime) – prime will be resolved by drag sign at release
    trackingStateRef.current.lockedMoveType = baseMove;
    trackingStateRef.current.lockedDirection = swipeDirection;
    trackingStateRef.current.initialSwipeDirection = swipeDirection;
    trackingStateRef.current.isDragging = true;
    trackingStateRef.current.hasStartedDrag = true;

    // Get affected cubies based on the base move type
    const affectedCubies = getAffectedCubiesForMove(baseMove);
    trackingStateRef.current.affectedCubies = affectedCubies;

    // Create a new group for dragging
    const dragGroup = new THREE.Group();

    // Add affected cubie meshes to the drag group
    affectedCubies.forEach((cubie) => {
      if (cubie.mesh.parent === groupRef.current) {
        const originalPosition = cubie.mesh.position.clone();
        groupRef.current!.remove(cubie.mesh);
        dragGroup.add(cubie.mesh);
        cubie.mesh.position.copy(originalPosition);
      }
    });

    // Add drag group to main group
    groupRef.current.add(dragGroup);
    trackingStateRef.current.dragGroup = dragGroup;

    // Lock animations during drag
    AnimationHelper.lock();
  };

  // Replace drag rotation to be based on signed projection along locked axis
  const updateDragRotation = (dragVector: THREE.Vector2) => {
    if (!trackingStateRef.current.isDragging) return;

    // Signed projection onto locked axis
    const axisLock = trackingStateRef.current._axisLock;
    const faceRight = trackingStateRef.current._screenFaceRight;
    const faceUp = trackingStateRef.current._screenFaceUp;

    let signedProjection = 0;
    if (axisLock === "horizontal" && faceRight) {
      signedProjection = dragVector.dot(faceRight);
    } else if (axisLock === "vertical" && faceUp) {
      signedProjection = dragVector.dot(faceUp);
    } else {
      // Fallback to dominant axis of drag
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

  // Simplify finalize snapping: rely on accumulated rotation/sign
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

    // Base rounding to nearest step
    const stepsFloat = currentRotation / snapIncrement;
    const baseSteps = Math.round(stepsFloat); // -2..2

    // Distance-based control for 180°: require a long drag; flick can only add a single quarter step
    const velocity = trackingStateRef.current.dragVelocity || 0;
    const velocityThreshold = 100; // keep prior feel

    // Compute axis-projected drag distance in pixels
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

    // Start from base rounding
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
    // This ensures a small opposite-direction flick from -50° snaps to 0°, not to +90°.
    const SINGLE_FLICK_VEL_MIN = 100; // px/sec threshold for flick
    const SINGLE_FLICK_MIN_PX = 25; // minimal axis-projected distance to qualify
    const flickDir = Math.sign(axisVelSigned);
    if (
      flickDir !== 0 &&
      axisProjAbsPx > SINGLE_FLICK_MIN_PX &&
      (Math.abs(axisVelSigned) > SINGLE_FLICK_VEL_MIN ||
        Math.abs(velocity) > velocityThreshold)
    ) {
      // Compute the next integer step boundary in the flick direction
      // stepsFloat is the current angle in quarter-turn units (-2..2), e.g., -0.55 for ~-50°
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
      // No move, snap back
      trackingStateRef.current.isDragging = false;
      trackingStateRef.current.isSnapping = true;
      trackingStateRef.current.snapAnimationStartTime = Date.now();
      trackingStateRef.current.snapAnimationDuration = snapDurationSlow;
      trackingStateRef.current.snapStartRotation =
        trackingStateRef.current.currentRotation;
      trackingStateRef.current.snapTargetRotation = 0;
      trackingStateRef.current.finalMove = "";
      return;
    }

    if (Math.abs(signedSteps) === 2) {
      // Half turn
      finalMove = baseMove + "2";
      const baseTarget = Math.sign(currentRotation) * Math.PI || Math.PI;
      const k = Math.round((currentRotation - baseTarget) / twoPi);
      targetAngle = baseTarget + k * twoPi;
    } else {
      // Quarter turn
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
    trackingStateRef.current.snapAnimationStartTime = Date.now();
    trackingStateRef.current.snapAnimationDuration = snapDuration;
    trackingStateRef.current.snapStartRotation =
      trackingStateRef.current.currentRotation;
    trackingStateRef.current.snapTargetRotation = targetAngle;
    trackingStateRef.current.finalMove = finalMove as CubeMove;
  };

  // Perf helpers for pointer move throttling & object reuse
  const lastPointerProcessTimeRef = useRef(0);
  const pointerFrameBudgetMs = 12; // ~80 Hz max processing
  const tmpVec2A = useRef(new THREE.Vector2());
  const tmpVec2B = useRef(new THREE.Vector2());

  const handlePointerMove = (e: PointerEvent) => {
    if (!trackingStateRef.current.isTracking) return;
    // Ignore moves from non-initiating pointers (e.g., a second finger)
    if (
      trackingStateRef.current._pointerId != null &&
      e.pointerId !== trackingStateRef.current._pointerId
    ) {
      return;
    }

    // Reuse vector object to reduce GC pressure
    const currentPos = trackingStateRef.current.currentPosition;
    currentPos.set(e.clientX, e.clientY);

    // Throttle heavy math when not yet dragging to keep initial touch ultra responsive
    const nowTs = performance.now();
    const isDragging = trackingStateRef.current.isDragging;
    if (
      !isDragging &&
      nowTs - lastPointerProcessTimeRef.current < pointerFrameBudgetMs
    ) {
      return; // skip this frame's processing
    }
    lastPointerProcessTimeRef.current = nowTs;

    // Flick sampling
    if (
      trackingStateRef.current.dragTimestamps &&
      trackingStateRef.current.dragPositions &&
      trackingStateRef.current.isDragging
    ) {
      // Only sample for flick velocity once dragging actually started
      trackingStateRef.current.dragTimestamps.push(Date.now());
      // Reuse temp vector
      const sample = tmpVec2A.current.set(currentPos.x, currentPos.y);
      trackingStateRef.current.dragPositions.push(sample.clone());
      if (trackingStateRef.current.dragTimestamps.length > 6) {
        trackingStateRef.current.dragTimestamps.shift();
        trackingStateRef.current.dragPositions.shift();
      }
    }

    const dragVector = tmpVec2B.current
      .set(currentPos.x, currentPos.y)
      .sub(trackingStateRef.current.startPosition);

    // Skip tiny movements early (noise filtering) to feel more "snappy"
    if (!isDragging && dragVector.lengthSq() < 4) {
      return;
    }

    // Always keep face-aligned screen axes up-to-date to account for whole-cube spins mid-gesture
    if (groupRef.current) {
      const { right, up } = getFaceBasisLocal(
        trackingStateRef.current.clickedFace
      );
      const r2 = projectLocalDirToScreen(right);
      const u2 = projectLocalDirToScreen(up);
      if (r2.lengthSq() > 1e-6)
        trackingStateRef.current._screenFaceRight = r2.clone().normalize();
      if (u2.lengthSq() > 1e-6)
        trackingStateRef.current._screenFaceUp = u2.clone().normalize();
    }

    if (!trackingStateRef.current.hasStartedDrag) {
      // Use cached face axes; if missing, compute now
      let faceRight = trackingStateRef.current._screenFaceRight;
      let faceUp = trackingStateRef.current._screenFaceUp;
      if ((!faceRight || !faceUp) && groupRef.current) {
        const { right, up } = getFaceBasisLocal(
          trackingStateRef.current.clickedFace
        );
        faceRight = projectLocalDirToScreen(right).normalize();
        faceUp = projectLocalDirToScreen(up).normalize();
      }

      const rDot = faceRight ? dragVector.dot(faceRight) : dragVector.x;
      const uDot = faceUp ? dragVector.dot(faceUp) : dragVector.y;

      const axisLock =
        Math.abs(rDot) >= Math.abs(uDot) ? "horizontal" : "vertical";
      const moveDirection: SwipeDirection =
        axisLock === "horizontal"
          ? rDot >= 0
            ? "right"
            : "left"
          : uDot >= 0
          ? "up"
          : "down";

      const positionKey = trackingStateRef.current
        .uniquePieceId as PositionMoveKey;
      const suggestedMove = POSITION_MOVE_MAPPING[positionKey]?.[moveDirection];

      // Start only when we have a mapping and the primary-axis projected movement exceeds threshold
      if (!suggestedMove) {
        return;
      }
      // Compute primary-axis projected movement (px) to avoid tiny accidental drags
      const primaryProjPx = Math.abs(axisLock === "horizontal" ? rDot : uDot);
      if (primaryProjPx < LOCK_PRIMARY_PX) {
        // not moved enough yet
        return;
      }

      trackingStateRef.current._axisLock = axisLock;
      trackingStateRef.current.lockedDirection = moveDirection;
      trackingStateRef.current._initialDragDirection = moveDirection;
      trackingStateRef.current._allowedMoves = [
        suggestedMove,
        suggestedMove.endsWith("'")
          ? suggestedMove.replace("'", "")
          : suggestedMove + "'",
      ];
      startDragAnimation(suggestedMove, moveDirection);
      // Apply initial rotation immediately to avoid 1-frame delay
      updateDragRotation(dragVector);
      return;
    }

    // After lock, we no longer switch move types mid-drag; rotation sign determines prime vs non-prime
    updateDragRotation(dragVector);
  };

  const handlePointerUp = (e: PointerEvent) => {
    // Only respond to the initiating pointer's up event
    if (
      trackingStateRef.current._pointerId != null &&
      e.pointerId !== trackingStateRef.current._pointerId
    ) {
      return;
    }
    // Now safe to remove listeners
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);

    if (!trackingStateRef.current.isTracking) {
      return;
    }

    // Flick gesture: calculate drag velocity on release
    if (
      trackingStateRef.current.dragTimestamps &&
      trackingStateRef.current.dragPositions
    ) {
      const times = trackingStateRef.current.dragTimestamps;
      const positions = trackingStateRef.current.dragPositions;
      if (times.length >= 2 && positions.length >= 2) {
        const dt = (times[times.length - 1] - times[0]) / 800; // seconds (restore previous scaling)
        const dp = positions[times.length - 1].clone().sub(positions[0]);
        const velocity = dt > 0 ? dp.length() / dt : 0; // px/sec
        trackingStateRef.current.dragVelocity = velocity;
      } else {
        trackingStateRef.current.dragVelocity = 0;
      }
    }

    if (trackingStateRef.current.isDragging) {
      finalizeDragWithSnapping();
    } else {
      if (trackingStateRef.current.dragGroup) {
        cleanupDragState();
      }
    }

    if (!trackingStateRef.current.isSnapping) {
      trackingStateRef.current = {
        isTracking: false,
        startPosition: new THREE.Vector2(),
        currentPosition: new THREE.Vector2(),
        cubiePosition: [0, 0, 0],
        clickedFace: "",
        uniquePieceId: "",
        isDragging: false,
        lockedMoveType: "",
        lockedDirection: "up",
        initialSwipeDirection: "up",
        dragGroup: null,
        affectedCubies: [],
        rotationAxis: new THREE.Vector3(),
        currentRotation: 0,
        hasStartedDrag: false,
        isSnapping: false,
        snapAnimationStartTime: 0,
        snapAnimationDuration: snapDurationFast,
        snapStartRotation: 0,
        snapTargetRotation: 0,
        finalMove: "",
        dragTimestamps: [],
        dragPositions: [],
        dragVelocity: 0,
      };
    }
  };

  // Detect which face of the cubie was clicked and determine move parameters
  const detectFaceAndMove = (
    position: [number, number, number],
    intersectionPointWorld: THREE.Vector3
  ) => {
    const [x, y, z] = position;
    const gridX = Math.round(x / 1.05 + 1);
    const gridY = Math.round(y / 1.05 + 1);
    const gridZ = Math.round(z / 1.05 + 1);

    // Convert the world intersection point to cube-local coordinates to be rotation invariant
    let pointInCubeLocal = intersectionPointWorld.clone();
    if (groupRef.current) {
      pointInCubeLocal = groupRef.current.worldToLocal(pointInCubeLocal);
    }
    // Now compute local offset from the cubie's static local center (position is cube-local)
    const localPoint = pointInCubeLocal.sub(new THREE.Vector3(x, y, z));

    // Determine which face was clicked based on the dominant local axis
    const absX = Math.abs(localPoint.x);
    const absY = Math.abs(localPoint.y);
    const absZ = Math.abs(localPoint.z);

    let clickedFace = "front";
    if (absX > absY && absX > absZ) {
      clickedFace = localPoint.x > 0 ? "right" : "left";
    } else if (absY > absX && absY > absZ) {
      clickedFace = localPoint.y > 0 ? "top" : "bottom";
    } else {
      clickedFace = localPoint.z > 0 ? "front" : "back";
    }

    return { clickedFace, gridX, gridY, gridZ };
  };

  const processPointerDown = (
    e: React.PointerEvent,
    pos: [number, number, number],
    intersectionPoint: THREE.Vector3,
    onOrbitControlsChange?: (enabled: boolean) => void
  ) => {
    // Disable orbit controls immediately when clicking on a cube piece
    onOrbitControlsChange?.(false);

    // Detect which face was clicked
    const { clickedFace } = detectFaceAndMove(pos, intersectionPoint);

    // Convert position to grid coordinates
    const [x, y, z] = pos;
    const gridX = Math.round(x / 1.05 + 1);
    const gridY = Math.round(y / 1.05 + 1);
    const gridZ = Math.round(z / 1.05 + 1);
    const gridPos: [number, number, number] = [gridX - 1, gridY - 1, gridZ - 1];

    // Generate unique piece identifier
    const uniquePieceId = generateUniquePieceId(gridPos, clickedFace);

    const startPos = new THREE.Vector2(e.clientX, e.clientY);
    const now = Date.now();

    // Compute and cache face-local screen axes
    let screenFaceRight: THREE.Vector2 | undefined;
    let screenFaceUp: THREE.Vector2 | undefined;
    if (groupRef.current) {
      const { right, up } = getFaceBasisLocal(clickedFace);
      const right2D = projectLocalDirToScreen(right);
      const up2D = projectLocalDirToScreen(up);
      screenFaceRight =
        right2D.lengthSq() > 1e-6 ? right2D.clone().normalize() : undefined;
      screenFaceUp =
        up2D.lengthSq() > 1e-6 ? up2D.clone().normalize() : undefined;
    }

    trackingStateRef.current = {
      isTracking: true,
      startPosition: startPos,
      currentPosition: startPos.clone(),
      cubiePosition: pos,
      clickedFace,
      uniquePieceId,
      isDragging: false,
      _pointerId:
        (e && (e.pointerId ?? e?.nativeEvent?.pointerId)) || undefined,
      lockedMoveType: "",
      lockedDirection: "up",
      initialSwipeDirection: "up",
      dragGroup: null,
      affectedCubies: [],
      rotationAxis: new THREE.Vector3(),
      currentRotation: 0,
      hasStartedDrag: false,
      isSnapping: false,
      snapAnimationStartTime: 0,
      snapAnimationDuration: snapDuration,
      snapStartRotation: 0,
      snapTargetRotation: 0,
      finalMove: "",
      dragTimestamps: [now],
      dragPositions: [startPos.clone()],
      dragVelocity: 0,
      _axisLock: undefined,
      _initialDragDirection: undefined,
      _allowedMoves: [],
      _screenFaceRight: screenFaceRight,
      _screenFaceUp: screenFaceUp,
      _lockThresholdPx: 0,
      _dragSignParity: 1,
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  return {
    trackingStateRef,
    processPointerDown,
    cleanupDragState,
    updateDragRotation,
    finalizeDragWithSnapping,
    generateUniquePieceId,
    detectFaceAndMove,
    getFaceBasisLocal,
    projectLocalDirToScreen,
  };
};

export default useDragLogic;
