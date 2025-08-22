import { useCallback, useRef } from "react";

const useDprManager = (isTouchDevice: boolean) => {
  const setDprRef = useRef<((dpr: number) => void) | null>(null);
  const dprTimerRef = useRef<number | null>(null);

  const canvasDpr: [number, number] = isTouchDevice ? [2.3, 2.3] : [1.5, 1.5];

  const attachSetDpr = useCallback((setter: (dpr: number) => void) => {
    setDprRef.current = setter;
  }, []);

  const setInteractiveDpr = useCallback(() => {
    const interDpr = isTouchDevice ? 2.3 : 1.5;
    setDprRef.current?.(interDpr);
    if (dprTimerRef.current) window.clearTimeout(dprTimerRef.current);
    dprTimerRef.current = window.setTimeout(() => {
      const idleDpr = isTouchDevice ? 2.3 : 1.5;
      setDprRef.current?.(idleDpr);
      dprTimerRef.current = null;
    }, 900);
  }, [isTouchDevice]);

  const onDecline = useCallback(
    () => setDprRef.current?.(isTouchDevice ? 2.3 : 1.5),
    [isTouchDevice]
  );
  const onIncline = useCallback(
    () => setDprRef.current?.(isTouchDevice ? 2.3 : 1.5),
    [isTouchDevice]
  );

  return {
    canvasDpr,
    attachSetDpr,
    setInteractiveDpr,
    onDecline,
    onIncline,
  } as const;
};

export default useDprManager;
