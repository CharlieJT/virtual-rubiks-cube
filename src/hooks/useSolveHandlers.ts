import { useCallback } from "react";
import cubejsTo3D from "@utils/cubejsTo3D";
import { AnimationHelper } from "@utils/animationHelper";
import type { CubeMove, CubeState, Solution } from "@/types/cube";
import type { CubeJSWrapper } from "@utils/cubejsWrapper";
import type { RubiksCube3DHandle } from "@components/RubiksCube3D/types";
import type { CustomWindowType } from "@/types/window";
import type { BestTimeResult } from "@/hooks/useBestTimes";

interface UseSolveHandlersParams {
  isAnimating: boolean;
  isTimerEnabled: boolean;
  isTimerActive: boolean;
  solution: Solution | null;
  lastSolvedState: string | null;
  showSolutionOverlay: boolean;
  timerStartTime: number | null;
  cubeRef: React.MutableRefObject<CubeJSWrapper>;
  cubeViewRef: React.RefObject<RubiksCube3DHandle | null>;
  currentRunRef: React.MutableRefObject<null | "scramble" | "solve" | "auto-orient">;
  scrambleRemainingRef: React.MutableRefObject<number>;
  solutionOverlaySourceRef: React.MutableRefObject<"generate" | "solve" | null>;
  lastMoveSourceRef: React.MutableRefObject<"queue" | "manual" | "undo" | "redo" | null>;
  isAnimatingRef: React.MutableRefObject<boolean>;
  pendingMoveRef: React.MutableRefObject<CubeMove | null>;
  moveQueueRef: React.MutableRefObject<CubeMove[]>;
  sessionPhaseRef: React.MutableRefObject<"idle" | "transition" | "scramble">;
  enqueueMoves: (moves: string[], fast?: boolean, fastMs?: number | null) => void;
  pumpQueueSoon: () => void;
  clearMoveHistory: () => void;
  addMoveToHistory: (move: string) => void;
  startTimer: () => void;
  stopTimer: () => string;
  addBestTime: (timeStr: string, timeMs: number) => BestTimeResult;
  setCube3D: React.Dispatch<React.SetStateAction<CubeState[][][]>>;
  setPendingMove: React.Dispatch<React.SetStateAction<CubeMove | null>>;
  setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>;
  setIsScrambled: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSolving: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAutoOrienting: React.Dispatch<React.SetStateAction<boolean>>;
  setSolution: React.Dispatch<React.SetStateAction<Solution | null>>;
  setLastSolvedState: React.Dispatch<React.SetStateAction<string | null>>;
  setSolutionIndex: React.Dispatch<React.SetStateAction<number>>;
  setScrambleIndex: React.Dispatch<React.SetStateAction<number>>;
  setScrambleMoves: React.Dispatch<React.SetStateAction<string[] | null>>;
  setShowScrambleOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSolutionOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  setIsScramblingState: React.Dispatch<React.SetStateAction<boolean>>;
  setInputDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  setQueueFast: React.Dispatch<React.SetStateAction<boolean>>;
  setQueueFastMs: React.Dispatch<React.SetStateAction<number | null>>;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSolutionGeneratedModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSolutionAlreadyGeneratedModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSolveSuccessModal: React.Dispatch<React.SetStateAction<boolean>>;
  setFinalSolveTime: React.Dispatch<React.SetStateAction<string>>;
  setBestTimeResult: React.Dispatch<React.SetStateAction<BestTimeResult | null>>;
  setConfirmSolveOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const useSolveHandlers = ({
  isAnimating,
  isTimerEnabled,
  isTimerActive,
  solution,
  lastSolvedState,
  showSolutionOverlay,
  timerStartTime,
  cubeRef,
  cubeViewRef,
  currentRunRef,
  scrambleRemainingRef,
  solutionOverlaySourceRef,
  lastMoveSourceRef,
  isAnimatingRef,
  pendingMoveRef,
  moveQueueRef,
  sessionPhaseRef,
  enqueueMoves,
  pumpQueueSoon,
  clearMoveHistory,
  addMoveToHistory,
  startTimer,
  stopTimer,
  addBestTime,
  setCube3D,
  setPendingMove,
  setIsAnimating,
  setIsScrambled,
  setIsSolving,
  setIsAutoOrienting,
  setSolution,
  setLastSolvedState,
  setSolutionIndex,
  setScrambleIndex,
  setScrambleMoves,
  setShowScrambleOverlay,
  setShowSolutionOverlay,
  setIsScramblingState,
  setInputDisabled,
  setQueueFast,
  setQueueFastMs,
  setIsGenerating,
  setShowSolutionGeneratedModal,
  setShowSolutionAlreadyGeneratedModal,
  setShowSolveSuccessModal,
  setFinalSolveTime,
  setBestTimeResult,
  setConfirmSolveOpen,
}: UseSolveHandlersParams) => {
  const handleSolveSuccess = useCallback(
    (finalTime?: string) => {
      if (finalTime) {
        setFinalSolveTime(finalTime);
        if (isTimerActive) {
          const timeMs = timerStartTime
            ? Date.now() - timerStartTime
            : 0;
          if (timeMs > 0) {
            const result = addBestTime(finalTime, timeMs);
            setBestTimeResult(result);
          }
        } else {
          setBestTimeResult(null);
        }
      }
      if (cubeViewRef.current) {
        cubeViewRef.current.celebratorySpin(() =>
          setShowSolveSuccessModal(true),
        );
      } else {
        setShowSolveSuccessModal(true);
      }
    },
    [isTimerActive, timerStartTime, addBestTime],
  );

  const handleMoveAnimationDone = useCallback(
    (move: CubeMove) => {
      const isWholeCubeRotation = ["x", "x'", "y", "y'", "z", "z'"].includes(
        move,
      );

      if (!isWholeCubeRotation) {
        cubeRef.current.move(move);
        setCube3D(cubejsTo3D(cubeRef.current.getCube()));
        const solved = cubeRef.current.isSolved();
        setIsScrambled(!solved);

        const isManualMove =
          (window as CustomWindowType).__isManualDragMove ||
          lastMoveSourceRef.current === "manual";
        if (isTimerEnabled && !isTimerActive && isManualMove) startTimer();

        if (solved && isTimerActive) {
          const finalTime = stopTimer();
          const waitForStableState = () => {
            if (
              isAnimatingRef.current ||
              AnimationHelper.isLocked() ||
              pendingMoveRef.current
            ) {
              setTimeout(waitForStableState, 50);
              return;
            }
            handleSolveSuccess(finalTime);
          };
          setTimeout(waitForStableState, 200);
        }

        if (currentRunRef.current === "scramble") {
          scrambleRemainingRef.current = Math.max(
            0,
            scrambleRemainingRef.current - 1,
          );
        }

        if (isManualMove) {
          if (solutionOverlaySourceRef.current === "solve") {
            setSolution(null);
            setLastSolvedState(null);
            setSolutionIndex(-1);
            setIsGenerating(false);
            setShowSolutionGeneratedModal(false);
            setShowSolutionAlreadyGeneratedModal(false);
            solutionOverlaySourceRef.current = null;
          }
          setScrambleMoves(null);
          setScrambleIndex(-1);
          setShowScrambleOverlay(false);
          addMoveToHistory(move);
        }
      }

      setPendingMove(null);
      pendingMoveRef.current = null;
      setIsAnimating(false);
      isAnimatingRef.current = false;
      pumpQueueSoon();

      if (moveQueueRef.current.length === 0) {
        setQueueFast(false);
        setQueueFastMs(null);
        if (
          currentRunRef.current === "scramble" &&
          scrambleRemainingRef.current <= 0
        ) {
          setIsScramblingState(false);
          currentRunRef.current = null;
          setInputDisabled(false);
          sessionPhaseRef.current = "idle";
        }
        if (currentRunRef.current === "solve") {
          setIsSolving(false);
          currentRunRef.current = null;
        }
        if (currentRunRef.current === "auto-orient") {
          setIsAutoOrienting(false);
          currentRunRef.current = null;
        }
        setTimeout(() => {
          setScrambleIndex(-1);
          setSolutionIndex(-1);
        }, 0);
      }
    },
    [
      pumpQueueSoon,
      isTimerEnabled,
      isTimerActive,
      startTimer,
      stopTimer,
      handleSolveSuccess,
    ],
  );

  const handleGenerateSolution = useCallback(() => {
    const currentState = cubeRef.current.getState();
    if (solution && lastSolvedState === currentState && showSolutionOverlay) {
      setShowSolutionAlreadyGeneratedModal(true);
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const moves = cubeRef.current.solve();
      const algo = moves.join(" ");
      const steps = moves.map((m) => ({
        move: m as CubeMove,
        description: "",
      }));
      setSolution({ steps, moveCount: moves.length, algorithm: algo });
      setLastSolvedState(cubeRef.current.getState());
      setSolutionIndex(-1);
      setShowSolutionOverlay(true);
      solutionOverlaySourceRef.current = "generate";
      setIsGenerating(false);
      setShowSolutionGeneratedModal(true);
    }, 1500);
  }, [solution, lastSolvedState, showSolutionOverlay]);

  const handleSolve = useCallback(() => {
    if (isAnimating || AnimationHelper.isLocked()) return;
    clearMoveHistory();
    setIsSolving(true);
    requestAnimationFrame(() => {
      setTimeout(() => {
        const currentState = cubeRef.current.getState();
        let movesToRun: string[];
        if (!solution || lastSolvedState !== currentState) {
          const fresh = cubeRef.current.solve();
          const algo = fresh.join(" ");
          const steps = fresh.map((m) => ({
            move: m as CubeMove,
            description: "",
          }));
          setSolution({ steps, moveCount: fresh.length, algorithm: algo });
          setLastSolvedState(currentState);
          movesToRun = fresh;
        } else {
          movesToRun = solution.steps.map((s) => s.move);
        }
        setSolutionIndex(-1);
        currentRunRef.current = "solve";
        enqueueMoves(movesToRun);
        setShowScrambleOverlay(false);
        setScrambleMoves(null);
        setScrambleIndex(-1);
        setShowSolutionOverlay(true);
        solutionOverlaySourceRef.current = "solve";
        setConfirmSolveOpen(false);
      }, 0);
    });
  }, [enqueueMoves, isAnimating, solution, lastSolvedState, clearMoveHistory]);

  return {
    handleSolveSuccess,
    handleMoveAnimationDone,
    handleGenerateSolution,
    handleSolve,
  };
};

export default useSolveHandlers;
