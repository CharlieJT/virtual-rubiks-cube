import { useCallback, useRef, useMemo } from "react";

// Get device pixel ratio safely (works in SSR and browser)
const getDevicePixelRatio = () => {
  if (typeof window !== "undefined") {
    return Math.min(window.devicePixelRatio || 1, 2);
  }
  return 1;
};

const useDprManager = (isTouchDevice: boolean) => {
  const setDprRef = useRef<((dpr: number) => void) | null>(null);
  const dprTimerRef = useRef<number | null>(null);
  const currentDprRef = useRef<number>(0);

  // Calculate DPR config inside hook to ensure proper hydration
  const config = useMemo(() => {
    const dpr = getDevicePixelRatio();
    return {
      // Full quality when idle
      idle: dpr,
      // Slightly lower during interaction for smoother performance
      interactive: isTouchDevice ? dpr : Math.max(1, dpr * 0.8),
      // Minimum when performance is struggling
      minimum: 1,
    };
  }, [isTouchDevice]);

  const canvasDpr: [number, number] = [config.idle, config.idle];

  const attachSetDpr = useCallback((setter: (dpr: number) => void) => {
    setDprRef.current = setter;
    currentDprRef.current = config.idle;
  }, [config.idle]);

  const setInteractiveDpr = useCallback(() => {
    // Lower DPR during interaction for smoother dragging/animation
    if (currentDprRef.current !== config.interactive) {
      setDprRef.current?.(config.interactive);
      currentDprRef.current = config.interactive;
    }
    
    // Clear existing timer
    if (dprTimerRef.current) window.clearTimeout(dprTimerRef.current);
    
    // Restore higher quality after interaction stops
    dprTimerRef.current = window.setTimeout(() => {
      if (currentDprRef.current !== config.idle) {
        setDprRef.current?.(config.idle);
        currentDprRef.current = config.idle;
      }
      dprTimerRef.current = null;
    }, 600);
  }, [config.interactive, config.idle]);

  // Called by PerformanceMonitor when FPS drops
  const onDecline = useCallback(() => {
    setDprRef.current?.(config.minimum);
    currentDprRef.current = config.minimum;
  }, [config.minimum]);
  
  // Called by PerformanceMonitor when FPS recovers
  const onIncline = useCallback(() => {
    setDprRef.current?.(config.idle);
    currentDprRef.current = config.idle;
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
