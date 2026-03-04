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
import type { OrbitControlsInstance } from "@/types/orbitControls";

const _mouse = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();
const _viewAxis = new THREE.Vector3();
const _viewQuat = new THREE.Quaternion();
const _yAxis = new THREE.Vector3(0, 1, 0);
const _yQuat = new THREE.Quaternion();

const useAnimation = (
  trackingStateRef: React.RefObject<TrackingStateRef>,
  cleanupDragState: () => void,
  commitMoveOnce: (move: CubeMove) => void
) => {
  const updateSnappingAnimation = () => {
    if (
      trackingStateRef.current?.isSnapping &&
      trackingStateRef.current?.dragGroup
    ) {
      const dragState = trackingStateRef.current;
      const elapsed = Date.now() - dragState.snapAnimationStartTime;
      const progress = Math.min(elapsed / dragState.snapAnimationDuration, 1);

      // Quadratic easing out for smooth feel
      const easedProgress = 1 - Math.pow(1 - progress, 2);

      const currentRotation =
        dragState.snapStartRotation +
        (dragState.snapTargetRotation - dragState.snapStartRotation) *
          easedProgress;

      dragState.currentRotation = currentRotation;

      if (dragState.dragGroup) {
        dragState.dragGroup.setRotationFromAxisAngle(
          dragState.rotationAxis,
          currentRotation
        );
      }

      if (progress >= 1) {
        // Guard so we run this block only once
        if (dragState._snapCompleted) return;
        dragState._snapCompleted = true;

        if (dragState.finalMove && commitMoveOnce) {
          const moveToExecute = dragState.finalMove;
          commitMoveOnce(moveToExecute);

          setTimeout(() => {
            cleanupDragState();
            if (trackingStateRef.current) {
              trackingStateRef.current.isSnapping = false;
            }
          }, 0);
        } else {
          cleanupDragState();
          if (trackingStateRef.current) {
            trackingStateRef.current.isSnapping = false;
          }
        }
      }
    }
  };

  const updateDragRotation = () => {
    if (
      trackingStateRef.current?.isDragging &&
      trackingStateRef.current?.dragGroup
    ) {
      const dragState = trackingStateRef.current;
      const rotation = dragState.currentRotation;

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

  const snapDuration = isTimerMode ? 60 : 120;

  const handleBoundaryPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!groupRef.current || !camera || !gl) return;

      const native = e.nativeEvent as PointerEvent | TouchEvent | undefined;
      const touchesLen: number =
        (native && "touches" in native
          ? (native as TouchEvent).touches.length
          : 0) ||
        (touchCount ?? 0);

      // When input disabled or cube is animating (scramble/solve), allow orbit and two-finger spin only
      if (inputDisabled || isAnimating) {
        if (touchesLen >= 2) {
          onOrbitControlsChange?.(false);
          return;
        }
        onOrbitControlsChange?.(true);
        return;
      }

      // Detect multi-touch early and force-disable orbits during 2+ fingers
      const pointerType: string | undefined =
        (native && "pointerType" in native ? native.pointerType : undefined) ||
        ("pointerType" in e ? (e as unknown as PointerEvent).pointerType : undefined);
      if (pointerType === "touch" && touchesLen >= 2) {
        onOrbitControlsChange?.(false);
        return;
      }

      const rect = gl.domElement.getBoundingClientRect();
      _mouse.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      _raycaster.setFromCamera(_mouse, camera);

      const targets: THREE.Mesh[] = [];
      groupRef.current!.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          targets.push(child);
        }
      });

      const intersects = _raycaster.intersectObjects(targets);

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
    if (inputDisabled || isAnimating) {
      onOrbitControlsChange?.(true);
      return;
    }
    if ((touchCount ?? 0) <= 1) {
      onOrbitControlsChange?.(true);
    }
  }, [isAnimating, onOrbitControlsChange, touchCount, inputDisabled]);

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
        if (AnimationHelper.isLocked() && !isAnimating) return;
        camera.getWorldDirection(_viewAxis).normalize();
        _viewQuat.setFromAxisAngle(_viewAxis, angleRad);
        groupRef.current.quaternion.premultiply(_viewQuat);
        groupRef.current.updateMatrixWorld(true);
      },
      spinAroundYAxis: (angleRad: number) => {
        if (!groupRef.current) return;
        if (
          trackingStateRef.current?.isDragging ||
          trackingStateRef.current?.isSnapping
        )
          return;
        if (AnimationHelper.isLocked() && !isAnimating) return;
        _yAxis.set(0, 1, 0);
        _yQuat.setFromAxisAngle(_yAxis, angleRad);
        groupRef.current.quaternion.premultiply(_yQuat);
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

        const initialQuaternion = new THREE.Quaternion(0, 0, 0, 1);
        const currentQuaternion = groupRef.current.quaternion.clone();

        let animationFrame = 0;
        const totalFrames = 60; // 1 second at 60fps

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

            const baseInterpolation = currentQuaternion
              .clone()
              .slerp(initialQuaternion, easedProgress);

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
        orbitControlsRef?: React.RefObject<OrbitControlsInstance | null>,
        _cubeRef?: React.RefObject<CubeJSWrapper | null>,
        onComplete?: () => void,
        instant?: boolean
      ) => {
        if (!orbitControlsRef?.current || !groupRef.current) {
          onComplete?.();
          return;
        }

        const controls = orbitControlsRef.current;
        const cubeGroup = groupRef.current;

        // Solver moves (if needed) are enqueued in ensureSolvedThen() to avoid conflicts.
        const camera = controls.object;
        const currentCubeQuaternion = cubeGroup.quaternion.clone();

        // Calculate the target cube orientation based on current camera position
        // Goal: white on top AND side faces aligned (fix yaw around Y after orbiting)
        // OR yellow on top if flipUpsideDown is requested
        let targetCubeQuaternion: THREE.Quaternion;

        const camPos = camera.position.clone();
        const camTarget = controls.target.clone();
        const camForward = camTarget.clone().sub(camPos).normalize(); // direction from camera to cube
        const camUp = camera.up.clone().normalize();

        const extraOpts = controls.__resetOpts || {} as NonNullable<OrbitControlsInstance['__resetOpts']>;

        // Step 1: align cube's +Y (white) to camera up, OR -Y (yellow) if flipping
        // Use EXACTLY the same computation for both cases - just use different local vector
        // This ensures orbit is handled identically for normal and flipped slides
        const cubeUpLocal = extraOpts.flipUpsideDown
          ? new THREE.Vector3(0, -1, 0) // Align yellow (bottom) to camera up when flipping
          : new THREE.Vector3(0, 1, 0); // Align white (top) to camera up normally

        // Must apply pitch to targetCamUp BEFORE computing the up-alignment quaternion
        let targetCamUp = camUp.clone();
        if (typeof extraOpts.extraPitchDeg === "number") {
          const pitchRad = THREE.MathUtils.degToRad(extraOpts.extraPitchDeg);
          const camRight = new THREE.Vector3()
            .crossVectors(camForward, camUp)
            .normalize();
          if (camRight.lengthSq() < 1e-6) {
            camRight.set(1, 0, 0).normalize();
          }
          const pitchQuat = new THREE.Quaternion().setFromAxisAngle(
            camRight,
            pitchRad
          );
          targetCamUp.applyQuaternion(pitchQuat).normalize();
        }

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

        const yOffsetRad =
          typeof extraOpts.extraYawRad === "number"
            ? extraOpts.extraYawRad
            : THREE.MathUtils.degToRad(-45);
        const extraYaw = new THREE.Quaternion().setFromAxisAngle(
          targetCamUp,
          yOffsetRad
        );
        targetCubeQuaternion.premultiply(extraYaw);

        // E-rotation: rotate around cube's Y-axis AFTER all previous rotations.
        // For flipped slides, cube's +Y is -targetCamUp; for normal it's targetCamUp.
        if (typeof extraOpts.extraERotationDeg === "number") {
          const eRotationRad = THREE.MathUtils.degToRad(
            extraOpts.extraERotationDeg
          );
          const rotationAxis = extraOpts.flipUpsideDown
            ? targetCamUp.clone().negate()
            : targetCamUp.clone();
          const eRotationQuat = new THREE.Quaternion().setFromAxisAngle(
            rotationAxis,
            eRotationRad
          );
          targetCubeQuaternion.premultiply(eRotationQuat);
        }

        if ((controls).__resetOpts) delete (controls).__resetOpts;

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

          const newCameraPosition = startCameraPosition;
          const newCameraTarget = startCameraTarget;

          camera.position.copy(newCameraPosition);
          controls.target.copy(newCameraTarget);
          camera.lookAt(newCameraTarget);
          camera.updateMatrixWorld(true);
          if (controls.update) controls.update();

          const interpolatedCubeQuaternion = currentCubeQuaternion
            .clone()
            .slerp(targetCubeQuaternion, easedProgress);
          cubeGroup.quaternion.copy(interpolatedCubeQuaternion);

          if (progress >= 1) {
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
