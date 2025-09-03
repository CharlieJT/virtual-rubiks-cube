import { useCallback, useImperativeHandle } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { AnimationHelper } from "@utils/animationHelper";
import type {
  RubiksCube3DHandle,
  TrackingStateRef,
} from "../components/RubiksCube3D/types";

const useAnimation = (
  trackingStateRef: React.RefObject<TrackingStateRef>,
  cleanupDragState: () => void,
  commitMoveOnce: (move: any) => void
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
  inputDisabled: boolean = false
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
      const native = (e as any).nativeEvent ?? e;
      const pointerType: string | undefined =
        (native && (native as any).pointerType) || (e as any).pointerType;
      const touchesLen: number =
        (native && (native as any).touches
          ? (native as any).touches.length
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
        _cubeRef?: React.RefObject<any>,
        onComplete?: () => void
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
        let targetCubeQuaternion: THREE.Quaternion;

        // Camera vectors
        const camPos = camera.position.clone();
        const camTarget = controls.target.clone();
        const camForward = camTarget.clone().sub(camPos).normalize(); // direction from camera to cube
        const camUp = camera.up.clone().normalize();

        // Step 1: align cube's +Y (white) to camera up
        const cubeUp = new THREE.Vector3(0, 1, 0);
        const alignUpQuat = new THREE.Quaternion().setFromUnitVectors(
          cubeUp,
          camUp
        );

        // Step 2: compute yaw so cube's +Z (green/front) aligns to camera forward projected in the up plane
        const cubeFront = new THREE.Vector3(0, 0, 1).applyQuaternion(
          alignUpQuat
        );
        const frontProj = cubeFront.clone().projectOnPlane(camUp).normalize();
        // We want the cube front to face the camera, i.e., toward -camForward
        const viewProj = camForward
          .clone()
          .negate()
          .projectOnPlane(camUp)
          .normalize();

        let yawQuat = new THREE.Quaternion();
        // Handle degenerate case: if viewProj is near zero (camera looking straight up/down), skip yaw
        if (viewProj.lengthSq() > 1e-6 && frontProj.lengthSq() > 1e-6) {
          // Signed angle from frontProj to viewProj around camUp
          const cross = new THREE.Vector3().copy(frontProj).cross(viewProj);
          const sin = THREE.MathUtils.clamp(cross.dot(camUp), -1, 1);
          const cos = THREE.MathUtils.clamp(frontProj.dot(viewProj), -1, 1);
          const angle = Math.atan2(sin, cos);
          yawQuat.setFromAxisAngle(camUp, angle);
        } else {
          yawQuat.identity();
        }

        // Final target quaternion: first align up, then yaw around that up
        targetCubeQuaternion = yawQuat.clone().multiply(alignUpQuat);

        // Apply an additional fixed yaw offset to match the expected Y-layer orientation
        // Adjust sign if needed (+/- 45°). Using +45° by default per observation.
        const yOffsetRad = THREE.MathUtils.degToRad(-45);
        const extraYaw = new THREE.Quaternion().setFromAxisAngle(
          camUp,
          yOffsetRad
        );
        targetCubeQuaternion.premultiply(extraYaw);

        // Don't move the camera - keep it at current position
        // Only rotate the cube to show white on top from current camera angle
        const startCameraPosition = camera.position.clone();
        const startCameraTarget = controls.target.clone();

        let animationFrame = 0;
        const totalFrames = 60; // 1 second at 60fps

        const animate = () => {
          if (animationFrame <= totalFrames) {
            const progress = animationFrame / totalFrames;
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

            if (animationFrame === totalFrames) {
              // Last frame - animation is complete
              onComplete?.();
            } else {
              animationFrame++;
              requestAnimationFrame(animate);
            }
          }
        };

        animate();
      },
      handlePointerDown: handleBoundaryPointerDown,
      handlePointerUp: handleBoundaryPointerUp,
    }),
    [
      camera,
      handleBoundaryPointerDown,
      handleBoundaryPointerUp,
      groupRef,
      trackingStateRef,
      cleanupDragState,
    ]
  );

  return {
    handleBoundaryPointerDown,
    handleBoundaryPointerUp,
  };
};

export default useAnimation;
