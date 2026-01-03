import { useRef, useCallback, useState } from "react";
import type { Slide } from "@components/tutorials/slideDefinitions";

interface UseTutorialOrbitControlsProps {
  activeSlide: Slide | undefined;
  orbitControlsRef: React.RefObject<any>;
  isTransitioningRef: React.MutableRefObject<boolean>;
  forceOrbitDisabledRef: React.MutableRefObject<boolean>;
}

export const useTutorialOrbitControls = ({
  activeSlide,
  orbitControlsRef,
  isTransitioningRef,
  forceOrbitDisabledRef,
}: UseTutorialOrbitControlsProps) => {
  const [orbitControlsEnabled, setOrbitControlsEnabled] = useState(true);
  const orbitPrevRef = useRef<any>(null);

  const handleOrbitControlsChange = useCallback(
    (enabled: boolean) => {
      // Always disable orbit during transitions
      if (isTransitioningRef.current) {
        if (orbitControlsRef.current) {
          orbitControlsRef.current.enabled = false;
          if (typeof orbitControlsRef.current.update === "function") {
            orbitControlsRef.current.update();
          }
        }
        return;
      }
      // Never enable orbits on the locked slide; otherwise keep orbit on for slides
      // that don't allow face moves (view-only), and defer to caller for others.
      let next: boolean;
      if (forceOrbitDisabledRef.current) {
        next = false;
      } else {
        // No slides are locked anymore - notation-protip should allow orbit
        // (orbit can still be disabled by forceOrbitDisabledRef or if allowFaceMoves is false)
        if (activeSlide && !activeSlide.allowFaceMoves) {
          next = true;
        } else {
          next = enabled;
        }
      }
      setOrbitControlsEnabled(next);
      if (orbitControlsRef.current) {
        orbitControlsRef.current.enabled = next;
        if (typeof orbitControlsRef.current.update === "function") {
          orbitControlsRef.current.update();
        }
      }
    },
    [activeSlide, orbitControlsRef, isTransitioningRef, forceOrbitDisabledRef]
  );

  const disableOrbitTemporarily = useCallback(() => {
    const controls: any = orbitControlsRef.current;
    if (!controls) return;
    // If we're already in a controlled transition, don't re-snapshot/override
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    orbitPrevRef.current = {
      enabled: Boolean(controls.enabled),
      noRotate: Boolean(controls.noRotate),
      damping: Number(controls.dynamicDampingFactor ?? 0.35),
      staticMoving: Boolean(controls.staticMoving),
      rotateSpeed: Number(controls.rotateSpeed ?? 1.2),
    };
    // Fully disable user input and internal momentum
    controls.enabled = false;
    controls.noRotate = true;
    if (typeof controls.staticMoving === "boolean")
      controls.staticMoving = true;
    if (typeof controls.dynamicDampingFactor === "number")
      controls.dynamicDampingFactor = 0;
    if (typeof controls.rotateSpeed === "number") controls.rotateSpeed = 0;
    if (typeof controls.update === "function") controls.update();
  }, [orbitControlsRef, isTransitioningRef]);

  const clearControlsInternal = useCallback(() => {
    const controls: any = orbitControlsRef.current;
    if (!controls) return;
    // TrackballControls internals
    if (controls.movePrev?.set) controls.movePrev.set(0, 0);
    if (controls.moveCurr?.set) controls.moveCurr.set(0, 0);
    if (controls.lastAxis?.set) controls.lastAxis.set(0, 0, 0);
    if (typeof controls.lastAngle === "number") controls.lastAngle = 0;
    if (typeof controls.touchZoomDistanceStart === "number")
      controls.touchZoomDistanceStart = 0;
    if (typeof controls.touchZoomDistanceEnd === "number")
      controls.touchZoomDistanceEnd = 0;
    if (controls.panStart?.set) controls.panStart.set(0, 0);
    if (controls.panEnd?.set) controls.panEnd.set(0, 0);
    if (controls.zoomStart?.set) controls.zoomStart.set(0, 0);
    if (controls.zoomEnd?.set) controls.zoomEnd.set(0, 0);
    // OrbitControls fields (noop for Trackball, safe to set)
    if (controls.rotateStart?.set) controls.rotateStart.set(0, 0);
    if (controls.rotateEnd?.set) controls.rotateEnd.set(0, 0);
    if (typeof controls.state !== "undefined") controls.state = -1; // STATE.NONE
    // Sync lastPosition/quaternion to current camera to avoid immediate correction
    if (controls.object) {
      if (controls.lastPosition?.copy)
        controls.lastPosition.copy(controls.object.position);
      if (controls.lastQuaternion?.copy)
        controls.lastQuaternion.copy(controls.object.quaternion);
    }
    if (controls.update) controls.update();
  }, [orbitControlsRef]);

  return {
    orbitControlsEnabled,
    setOrbitControlsEnabled,
    handleOrbitControlsChange,
    disableOrbitTemporarily,
    clearControlsInternal,
    orbitPrevRef,
  };
};
