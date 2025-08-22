import { useCallback, useRef } from "react";
import type { RubiksCube3DHandle } from "@components/RubiksCube3D/types";

const useTrackpadHandlers = (
  cubeViewRef: React.RefObject<RubiksCube3DHandle>,
  precisionActive: boolean
) => {
  const trackpadDragRef = useRef<{ active: boolean; lastX: number } | null>(
    null
  );

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    trackpadDragRef.current = { active: true, lastX: e.clientX };
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!trackpadDragRef.current?.active) return;
      const dx = e.clientX - trackpadDragRef.current.lastX;
      trackpadDragRef.current.lastX = e.clientX;
      const base = 0.004;
      const sensitivity = base * (precisionActive ? 0.4 : 1.0);
      const angle = dx * sensitivity;
      cubeViewRef.current?.spinAroundViewAxis(angle);
    },
    [precisionActive, cubeViewRef]
  );

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    trackpadDragRef.current = { active: false, lastX: 0 };
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp } as const;
};

export default useTrackpadHandlers;
