import { useCallback, useRef, useMemo } from "react";

const getDevicePixelRatio = () => {
  if (typeof window !== "undefined") {
    return Math.min(window.devicePixelRatio || 1, 2);
  }
  return 1;
};

const useDprManager = () => {
  const setDprRef = useRef<((dpr: number) => void) | null>(null);
  const currentDprRef = useRef<number>(0);

  // Calculate DPR config inside hook to ensure proper hydration
  const config = useMemo(() => {
    const dpr = getDevicePixelRatio();
    return {
      // Full quality (idle) - kept constant to avoid visual inconsistency
      idle: dpr,
      minimum: 1,
    };
  }, []);

  const canvasDpr: [number, number] = [config.idle, config.idle];

  const attachSetDpr = useCallback((setter: (dpr: number) => void) => {
    setDprRef.current = setter;
    setter(config.idle);
    currentDprRef.current = config.idle;
  }, [config.idle]);

  // No-op - kept for API compatibility but does nothing
  // Interactive/idle switching disabled to keep borders consistent
  const setInteractiveDpr = useCallback(() => {}, []);

  // Called by PerformanceMonitor when FPS drops
  const onDecline = useCallback(() => {
    if (setDprRef.current) {
      setDprRef.current(config.minimum);
      currentDprRef.current = config.minimum;
    }
  }, [config.minimum]);
  
  // Called by PerformanceMonitor when FPS recovers
  const onIncline = useCallback(() => {
    if (setDprRef.current) {
      setDprRef.current(config.idle);
      currentDprRef.current = config.idle;
    }
  }, [config.idle]);

  return {
    canvasDpr,
    attachSetDpr,
    setInteractiveDpr,
    onDecline,
    onIncline,
  } as const;
};

export default useDprManager;
