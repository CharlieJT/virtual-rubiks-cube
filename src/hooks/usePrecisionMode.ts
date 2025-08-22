import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

const usePrecisionMode = (cubeContainerRef: RefObject<HTMLElement>) => {
  const [precisionMode, setPrecisionMode] = useState(false);
  const [precisionHold, setPrecisionHold] = useState(false);
  const lastTwoFingerTapRef = useRef<number>(0);

  const precisionActive = precisionMode || precisionHold;

  // Desktop: hold Shift for temporary precision
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") setPrecisionHold(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") setPrecisionHold(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // Mobile: two-finger double-tap toggles precision mode
  useEffect(() => {
    const el = cubeContainerRef.current;
    if (!el) return;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const now = Date.now();
        if (now - lastTwoFingerTapRef.current < 350) {
          setPrecisionMode((p) => !p);
          lastTwoFingerTapRef.current = 0;
        } else {
          lastTwoFingerTapRef.current = now;
        }
      }
    };
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart as any);
    };
  }, [cubeContainerRef]);

  const handleContainerDoubleClick = useCallback(() => {
    setPrecisionMode((p) => !p);
  }, []);

  return { precisionActive, handleContainerDoubleClick } as const;
};

export default usePrecisionMode;
