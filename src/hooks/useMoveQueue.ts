import { useCallback } from "react";
import type { CubeMove, Solution } from "@/types/cube";
import { AnimationHelper } from "@utils/animationHelper";

interface UseMoveQueueParams {
  isAnimatingRef: React.RefObject<boolean>;
  pendingMoveRef: React.MutableRefObject<CubeMove | null>;
  moveQueueRef: React.MutableRefObject<CubeMove[]>;
  currentRunRef: React.MutableRefObject<null | "scramble" | "solve" | "auto-orient">;
  scrambleMovesRef: React.MutableRefObject<string[] | null>;
  solutionRef: React.MutableRefObject<Solution | null>;
  lastMoveSourceRef: React.MutableRefObject<"queue" | "manual" | "undo" | "redo" | null>;
  setScrambleIndex: React.Dispatch<React.SetStateAction<number>>;
  setSolutionIndex: React.Dispatch<React.SetStateAction<number>>;
  setPendingMove: React.Dispatch<React.SetStateAction<CubeMove | null>>;
  setQueueFast: React.Dispatch<React.SetStateAction<boolean>>;
  setQueueFastMs: React.Dispatch<React.SetStateAction<number | null>>;
}

const useMoveQueue = ({
  isAnimatingRef,
  pendingMoveRef,
  moveQueueRef,
  currentRunRef,
  scrambleMovesRef,
  solutionRef,
  lastMoveSourceRef,
  setScrambleIndex,
  setSolutionIndex,
  setPendingMove,
  setQueueFast,
  setQueueFastMs,
}: UseMoveQueueParams) => {
  const pumpQueue = useCallback(() => {
    if (isAnimatingRef.current || AnimationHelper.isLocked()) return;
    if (pendingMoveRef.current) return;
    const next = moveQueueRef.current.shift();
    if (next) {
      if (currentRunRef.current === "scramble") {
        setScrambleIndex((i) =>
          Math.min(i + 1, (scrambleMovesRef.current?.length ?? 1) - 1),
        );
      } else if (currentRunRef.current === "solve") {
        setSolutionIndex((i) =>
          Math.min(i + 1, (solutionRef.current?.steps.length ?? 1) - 1),
        );
      }
      lastMoveSourceRef.current = "queue";
      setPendingMove(next);
      pendingMoveRef.current = next;
    }
  }, []);

  const pumpQueueSoon = useCallback(() => {
    const attempt = () => {
      if (
        AnimationHelper.isLocked() ||
        isAnimatingRef.current ||
        pendingMoveRef.current
      ) {
        queueMicrotask(attempt);
        return;
      }
      pumpQueue();
    };
    queueMicrotask(attempt);
  }, [pumpQueue]);

  const enqueueMoves = useCallback(
    (moves: string[], fast: boolean = false, fastMs?: number | null) => {
      if (fast) setQueueFast(true);
      if (typeof fastMs === "number") setQueueFastMs(fastMs);
      moveQueueRef.current.push(...(moves as CubeMove[]));
      pumpQueueSoon();
    },
    [pumpQueueSoon],
  );

  return { pumpQueue, pumpQueueSoon, enqueueMoves };
};

export default useMoveQueue;
