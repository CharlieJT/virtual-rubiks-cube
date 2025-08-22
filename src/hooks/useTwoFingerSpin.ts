import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { activeTouches } from "@utils/touchState";
import type { RubiksCube3DHandle } from "@components/RubiksCube3D/types";

export const useTwoFingerSpin = (
  cubeContainerRef: RefObject<HTMLDivElement>,
  cubeViewRef: RefObject<RubiksCube3DHandle>,
  precisionActive: boolean,
  onOrbitControlsChange: (enabled: boolean) => void
) => {
  const [touchCount, setTouchCount] = useState(0);
  const pinchRef = useRef<{
    active: boolean;
    startDist: number;
    prevAngle?: number;
  }>({ active: false, startDist: 0 });
  const [, setTwoFingerMode] = useState(false);

  const computeTouchDistance = (t0: Touch, t1: Touch) => {
    const dx = t0.clientX - t1.clientX;
    const dy = t0.clientY - t1.clientY;
    return Math.hypot(dx, dy);
  };

  useEffect(() => {
    const el = cubeContainerRef.current;
    if (!el) return;

    const initiateTwoFingerMode = (e: TouchEvent) => {
      pinchRef.current.active = true;
      pinchRef.current.startDist = computeTouchDistance(
        e.touches[0],
        e.touches[1]
      );
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      pinchRef.current.prevAngle = Math.atan2(dy, dx);
      setTwoFingerMode(true);
      onOrbitControlsChange(false);
      const elCanvas = el.querySelector("canvas") as HTMLElement | null;
      if (elCanvas) elCanvas.style.pointerEvents = "none";
    };

    const onTouchStart = (e: TouchEvent) => {
      setTouchCount(e.touches.length);
      activeTouches.count = e.touches.length;
      if (e.touches.length === 2) {
        if (cubeViewRef.current?.isDraggingSlice?.()) {
          setTimeout(() => {
            if (
              activeTouches.count >= 2 &&
              cubeViewRef.current?.isDraggingSlice?.()
            ) {
              cubeViewRef.current?.abortActiveDrag();
              initiateTwoFingerMode(e);
            }
          }, 100);
          return;
        }
        initiateTwoFingerMode(e);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      activeTouches.count = e.touches.length;
      if (e.touches.length >= 2) {
        e.preventDefault();
        if (!pinchRef.current.active) return;
        const dx = e.touches[1].clientX - e.touches[0].clientX;
        const dy = e.touches[1].clientY - e.touches[0].clientY;
        const nowAngle = Math.atan2(dy, dx);
        const prev = pinchRef.current.prevAngle;
        if (prev !== undefined) {
          let delta = nowAngle - prev;
          while (delta > Math.PI) delta -= Math.PI * 2;
          while (delta < -Math.PI) delta += Math.PI * 2;
          cubeViewRef.current?.spinAroundViewAxis(delta);
        }
        pinchRef.current.prevAngle = nowAngle;
      }
      setTouchCount(e.touches.length);
    };

    const onTouchEnd = (e: TouchEvent) => {
      setTouchCount(e.touches.length);
      activeTouches.count = e.touches.length;
      if (e.touches.length === 0) {
        pinchRef.current = { active: false, startDist: 0 };
        setTwoFingerMode(false);
        onOrbitControlsChange(true);
        const elCanvas = el.querySelector("canvas") as HTMLElement | null;
        if (elCanvas) elCanvas.style.pointerEvents = "auto";
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);

    const winTouchStart = (e: TouchEvent) => {
      activeTouches.count = e.touches.length;
      setTouchCount(e.touches.length);
      if (e.touches.length >= 2) {
        cubeViewRef.current?.abortActiveDrag?.();
        onOrbitControlsChange(false);
        const elCanvas = cubeContainerRef.current?.querySelector(
          "canvas"
        ) as HTMLElement | null;
        if (elCanvas) elCanvas.style.pointerEvents = "none";
      }
    };
    const winTouchMove = (e: TouchEvent) => {
      activeTouches.count = e.touches.length;
      setTouchCount(e.touches.length);
      if (e.touches.length >= 2) {
        onOrbitControlsChange(false);
      }
    };
    const winTouchEnd = (e: TouchEvent) => {
      activeTouches.count = e.touches.length;
      setTouchCount(e.touches.length);
      if (e.touches.length === 0) {
        onOrbitControlsChange(true);
        const elCanvas = cubeContainerRef.current?.querySelector(
          "canvas"
        ) as HTMLElement | null;
        if (elCanvas) elCanvas.style.pointerEvents = "auto";
      }
    };
    window.addEventListener("touchstart", winTouchStart, { passive: false });
    window.addEventListener("touchmove", winTouchMove, { passive: false });
    window.addEventListener("touchend", winTouchEnd);

    return () => {
      el.removeEventListener("touchstart", onTouchStart as any);
      el.removeEventListener("touchmove", onTouchMove as any);
      el.removeEventListener("touchend", onTouchEnd as any);
      window.removeEventListener("touchstart", winTouchStart as any);
      window.removeEventListener("touchmove", winTouchMove as any);
      window.removeEventListener("touchend", winTouchEnd as any);
    };
  }, [cubeContainerRef, cubeViewRef, onOrbitControlsChange, precisionActive]);

  return { touchCount } as const;
};
