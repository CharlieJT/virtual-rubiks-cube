import { useEffect, useRef } from "react";
import { Vector3 } from "three";
import type { RubiksCube3DHandle } from "@components/RubiksCube3D/types";
import { CubeJSWrapper } from "@utils/cubejsWrapper";
import { getSlideCameraConfig } from "@/utils/tutorialHelpers";
import type { Slide } from "@components/tutorials/slideDefinitions";

interface UseSlideTransitionProps {
  currentSlide: number;
  slides: Slide[];
  lessonId: string;
  orbitControlsRef: React.RefObject<any>;
  cubeViewRef: React.RefObject<RubiksCube3DHandle | null>;
  cubeRef: React.RefObject<CubeJSWrapper>;
  transitionIdRef: React.MutableRefObject<number>;
  isTransitioningRef: React.MutableRefObject<boolean>;
  setIsTransitioning?: (transitioning: boolean) => void;
  setInputDisabled: (disabled: boolean) => void;
  setOrbitControlsEnabled: (enabled: boolean) => void;
  disableOrbitTemporarily: () => void;
  clearControlsInternal: () => void;
  orbitPrevRef: React.MutableRefObject<any>;
}

export const useSlideTransition = ({
  currentSlide,
  slides,
  lessonId,
  orbitControlsRef,
  cubeViewRef,
  cubeRef,
  transitionIdRef,
  isTransitioningRef,
  setIsTransitioning,
  setInputDisabled,
  setOrbitControlsEnabled,
  disableOrbitTemporarily,
  clearControlsInternal,
  orbitPrevRef,
}: UseSlideTransitionProps) => {
  const prevSlideRef = useRef<number>(-1);
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    if (prevSlideRef.current === currentSlide && prevSlideRef.current !== -1)
      return;

    const isInitialMount = isInitialMountRef.current;
    isInitialMountRef.current = false;
    prevSlideRef.current = currentSlide;

    const slide = slides[currentSlide];
    const cameraConfig = getSlideCameraConfig(slide?.id, lessonId);

    if (orbitControlsRef.current) {
      const c: any = orbitControlsRef.current;
      c.__resetOpts = cameraConfig;
    }

    if (!cubeViewRef.current) {
      let retryCount = 0;
      const maxRetries = 10;
      const tryReset = () => {
        if (cubeViewRef.current && orbitControlsRef.current) {
          const c: any = orbitControlsRef.current;
          c.__resetOpts = cameraConfig;
          cubeViewRef.current.resetToInitialPosition(
            orbitControlsRef,
            cubeRef,
            undefined,
            isInitialMount
          );
        } else if (retryCount < maxRetries) {
          retryCount++;
          requestAnimationFrame(tryReset);
        }
      };
      requestAnimationFrame(tryReset);
      return;
    }

    if (isInitialMount) {
      cubeViewRef.current.resetToInitialPosition(
        orbitControlsRef,
        cubeRef,
        () => {
          const controls: any = orbitControlsRef.current;
          setInputDisabled(false);
          if (controls) {
            controls.enabled = true;
            controls.noRotate = false;
            if (typeof controls.staticMoving === "boolean")
              controls.staticMoving = false;
            if (typeof controls.dynamicDampingFactor === "number")
              controls.dynamicDampingFactor = 0.35;
            if (typeof controls.rotateSpeed === "number")
              controls.rotateSpeed = 1.2;
            setOrbitControlsEnabled(true);
            if (typeof controls.update === "function") controls.update();
          }
          isTransitioningRef.current = false;
          setIsTransitioning?.(false);
        },
        true
      );
      return;
    }

    const myTransitionId = ++transitionIdRef.current;
    isTransitioningRef.current = true;
    setIsTransitioning?.(true);
    disableOrbitTemporarily();
    if (orbitControlsRef.current) {
      const c: any = orbitControlsRef.current;
      if (!c.target) c.target = new Vector3(0, 0, 0);
      else c.target.set(0, 0, 0);
      if (c.update) c.update();
      clearControlsInternal();
      // Camera config already set above
    }
    cubeViewRef.current.resetToInitialPosition(
      orbitControlsRef,
      cubeRef,
      () => {
        if (transitionIdRef.current !== myTransitionId) return;
        const controls: any = orbitControlsRef.current;
        setInputDisabled(false);
        if (controls) {
          controls.enabled = true;
          controls.noRotate = false;
          if (typeof controls.staticMoving === "boolean")
            controls.staticMoving = false;
          if (typeof controls.dynamicDampingFactor === "number")
            controls.dynamicDampingFactor = 0.35;
          if (typeof controls.rotateSpeed === "number")
            controls.rotateSpeed = 1.2;
          setOrbitControlsEnabled(true);
          if (typeof controls.update === "function") controls.update();
        }
        orbitPrevRef.current = null;
        isTransitioningRef.current = false;
        setIsTransitioning?.(false);
      }
    );
  }, [
    currentSlide,
    slides,
    lessonId,
    orbitControlsRef,
    cubeViewRef,
    cubeRef,
    transitionIdRef,
    isTransitioningRef,
    setIsTransitioning,
    setInputDisabled,
    setOrbitControlsEnabled,
    disableOrbitTemporarily,
    clearControlsInternal,
    orbitPrevRef,
  ]);
};
