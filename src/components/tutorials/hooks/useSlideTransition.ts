import { useEffect, useRef } from "react";
import { Vector3 } from "three";
import type { RubiksCube3DHandle } from "@components/RubiksCube3D/types";
import { CubeJSWrapper } from "@utils/cubejsWrapper";
import { getSlideCameraConfig } from "@components/tutorials/utils/tutorialHelpers";
import type { Slide } from "@components/tutorials/slideDefinitions";
import type { OrbitControlsInstance } from "@/types/orbitControls";

interface UseSlideTransitionProps {
  currentSlide: number;
  slides: Slide[];
  lessonId: string;
  orbitControlsRef: React.RefObject<OrbitControlsInstance | null>;
  cubeViewRef: React.RefObject<RubiksCube3DHandle | null>;
  cubeRef: React.RefObject<CubeJSWrapper>;
  transitionIdRef: React.RefObject<number>;
  isTransitioningRef: React.RefObject<boolean>;
  setIsTransitioning?: (transitioning: boolean) => void;
  setInputDisabled: (disabled: boolean) => void;
  setOrbitControlsEnabled: (enabled: boolean) => void;
  disableOrbitTemporarily: () => void;
  clearControlsInternal: () => void;
  orbitPrevRef: React.RefObject<Record<string, unknown> | null>;
  isInitializingRef?: React.RefObject<boolean>;
  handleOrbitControlsChange?: (enabled: boolean) => void;
}

const useSlideTransition = ({
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
  isInitializingRef,
  handleOrbitControlsChange,
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
      const c: OrbitControlsInstance = orbitControlsRef.current;
      c.__resetOpts = cameraConfig;
    }

    if (!cubeViewRef.current) {
      let retryCount = 0;
      const maxRetries = 10;
      const tryReset = () => {
        if (cubeViewRef.current && orbitControlsRef.current) {
          const c = orbitControlsRef.current;
          c.__resetOpts = cameraConfig;
          cubeViewRef.current.resetToInitialPosition(
            orbitControlsRef,
            cubeRef,
            undefined,
            isInitialMount,
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
      if (isInitializingRef) isInitializingRef.current = true;
      cubeViewRef.current.resetToInitialPosition(
        orbitControlsRef,
        cubeRef,
        () => {
          const controls = orbitControlsRef.current;
          setInputDisabled(false);
          if (controls) {
            const shouldEnableOrbit = true;
            controls.enabled = shouldEnableOrbit;
            controls.noRotate = !shouldEnableOrbit;
            if (typeof controls.staticMoving === "boolean")
              controls.staticMoving = false;
            if (typeof controls.dynamicDampingFactor === "number")
              controls.dynamicDampingFactor = 0.35;
            if (typeof controls.rotateSpeed === "number")
              controls.rotateSpeed = 1.2;
            setOrbitControlsEnabled(shouldEnableOrbit);
            if (handleOrbitControlsChange) {
              handleOrbitControlsChange(shouldEnableOrbit);
            }
            if (typeof controls.update === "function") controls.update();
            // Force update to ensure controls are active
            requestAnimationFrame(() => {
              if (controls && controls.update) {
                controls.update();
              }
              if (isInitializingRef) isInitializingRef.current = false;
            });
          } else {
            if (isInitializingRef) isInitializingRef.current = false;
          }
          isTransitioningRef.current = false;
          setIsTransitioning?.(false);
        },
        true,
      );
      return;
    }

    const myTransitionId = ++transitionIdRef.current;
    isTransitioningRef.current = true;
    setIsTransitioning?.(true);
    disableOrbitTemporarily();
    if (orbitControlsRef.current) {
      const c = orbitControlsRef.current;
      if (!c.target) c.target = new Vector3(0, 0, 0);
      else c.target.set(0, 0, 0);
      if (c.update) c.update();
      clearControlsInternal();
    }
    cubeViewRef.current.resetToInitialPosition(
      orbitControlsRef,
      cubeRef,
      () => {
        if (transitionIdRef.current !== myTransitionId) return;
        const controls = orbitControlsRef.current;
        setInputDisabled(false);
        if (controls) {
          const shouldEnableOrbit = true;
          controls.enabled = shouldEnableOrbit;
          controls.noRotate = !shouldEnableOrbit;
          if (typeof controls.staticMoving === "boolean")
            controls.staticMoving = false;
          if (typeof controls.dynamicDampingFactor === "number")
            controls.dynamicDampingFactor = 0.35;
          if (typeof controls.rotateSpeed === "number")
            controls.rotateSpeed = 1.2;
          setOrbitControlsEnabled(shouldEnableOrbit);
          if (handleOrbitControlsChange) {
            handleOrbitControlsChange(shouldEnableOrbit);
          }
          if (typeof controls.update === "function") controls.update();
        }
        orbitPrevRef.current = null;
        isTransitioningRef.current = false;
        setIsTransitioning?.(false);
      },
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
    handleOrbitControlsChange,
  ]);
};

export default useSlideTransition;
