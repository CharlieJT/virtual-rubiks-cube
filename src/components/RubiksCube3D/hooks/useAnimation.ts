import { useCallback, useImperativeHandle } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { AnimationHelper } from "@utils/animationHelper";
import type { RubiksCube3DHandle, TrackingStateRef } from "../types";

export const useAnimation = (
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
  onOrbitControlsChange?: (enabled: boolean) => void
) => {
  const { camera, gl } = useThree();

  // New handler for boundary pointer down detection (cleaned up)
  const handleBoundaryPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!groupRef.current || !camera || !gl) return;

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
    [camera, gl, onOrbitControlsChange, isAnimating, touchCount, groupRef]
  );

  const handleBoundaryPointerUp = useCallback(() => {
    if (!isAnimating && (touchCount ?? 0) <= 1) {
      onOrbitControlsChange?.(true);
    }
  }, [isAnimating, onOrbitControlsChange, touchCount]);

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
            trackingStateRef.current.snapAnimationDuration = 120;
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
