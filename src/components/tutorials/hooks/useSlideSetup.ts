import { useEffect } from "react";
import cubejsTo3D from "@utils/cubejsTo3D";
import type { CubeJSWrapper } from "@utils/cubejsWrapper";
import type { Slide } from "@components/tutorials/slideDefinitions";
import type { CubeState } from "@/types/cube";

interface UseSlideSetupParams {
  activeSlide: Slide | undefined;
  cubeRef: React.RefObject<CubeJSWrapper>;
  setCube3D: (cube3D: CubeState[][][]) => void;
  setMoveHistory: (history: string[]) => void;
  setHistoryIndex: (index: number) => void;
  moveHistoryRef: React.RefObject<string[]>;
  historyIndexRef: React.RefObject<number>;
  setPracticeCompleted: (completed: boolean) => void;
  setPracticeShowTick: (show: boolean) => void;
  setPracticeInitialCrossState: (state: boolean | null) => void;
  setPracticeSetupComplete: (complete: boolean) => void;
  setPracticeTickProgress: (progress: boolean) => void;
  setPracticeTickLine: (line: boolean) => void;
  isTransitioningRef: React.RefObject<boolean>;
}

const useSlideSetup = ({
  activeSlide,
  cubeRef,
  setCube3D,
  setMoveHistory,
  setHistoryIndex,
  moveHistoryRef,
  historyIndexRef,
  setPracticeCompleted,
  setPracticeShowTick,
  setPracticeInitialCrossState,
  setPracticeSetupComplete,
  setPracticeTickProgress,
  setPracticeTickLine,
  isTransitioningRef,
}: UseSlideSetupParams) => {
  useEffect(() => {
    if (!activeSlide || !activeSlide.setup) {
      // No setup needed, allow validation immediately
      isTransitioningRef.current = false;
      return;
    }

    activeSlide.setup(cubeRef.current);
    const updated = cubejsTo3D(cubeRef.current.getCube());
    setCube3D(updated);

    // Clear history so undo/redo aligns with the new slide's baseline state
    setMoveHistory([]);
    setHistoryIndex(-1);
    moveHistoryRef.current = [];
    historyIndexRef.current = -1;
    setPracticeCompleted(false);
    setPracticeShowTick(false);
    setPracticeInitialCrossState(null);

    setPracticeSetupComplete(true);
    queueMicrotask(() => {
      isTransitioningRef.current = false;
    });
    setPracticeTickProgress(false);
    setPracticeTickLine(false);
  }, [
    activeSlide,
    cubeRef,
    setCube3D,
    setMoveHistory,
    setHistoryIndex,
    moveHistoryRef,
    historyIndexRef,
    setPracticeCompleted,
    setPracticeShowTick,
    setPracticeInitialCrossState,
    setPracticeSetupComplete,
    setPracticeTickProgress,
    setPracticeTickLine,
    isTransitioningRef,
  ]);
};

export default useSlideSetup;
