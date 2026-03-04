import { useCallback } from "react";
import type { CubeMove, Solution } from "@/types/cube";
import { AnimationHelper } from "@utils/animationHelper";
import type { CubeJSWrapper } from "@utils/cubejsWrapper";
import type { OrbitControlsInstance } from "@/types/orbitControls";

interface UseScrambleLogicParams {
  isAnimating: boolean;
  inputDisabled: boolean;
  isScramblingState: boolean;
  cubeRef: React.MutableRefObject<CubeJSWrapper>;
  currentRunRef: React.MutableRefObject<null | "scramble" | "solve" | "auto-orient">;
  lastScrambleStartedAtRef: React.MutableRefObject<number>;
  scrambleRequestPendingRef: React.MutableRefObject<boolean>;
  scrambleRemainingRef: React.MutableRefObject<number>;
  solutionOverlaySourceRef: React.MutableRefObject<"generate" | "solve" | null>;
  sessionPhaseRef: React.MutableRefObject<"idle" | "transition" | "scramble">;
  orbitControlsRef: React.RefObject<OrbitControlsInstance | null>;
  enqueueMoves: (moves: string[], fast?: boolean, fastMs?: number | null) => void;
  clearMoveHistory: () => void;
  resetTimer: () => void;
  setPendingMove: React.Dispatch<React.SetStateAction<CubeMove | null>>;
  setScrambleIndex: React.Dispatch<React.SetStateAction<number>>;
  setSolutionIndex: React.Dispatch<React.SetStateAction<number>>;
  setIsScramblingState: React.Dispatch<React.SetStateAction<boolean>>;
  setIsScrambled: React.Dispatch<React.SetStateAction<boolean>>;
  setSolution: React.Dispatch<React.SetStateAction<Solution | null>>;
  setLastSolvedState: React.Dispatch<React.SetStateAction<string | null>>;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSolutionGeneratedModal: React.Dispatch<React.SetStateAction<boolean>>;
  setScrambleMoves: React.Dispatch<React.SetStateAction<string[] | null>>;
  setShowScrambleOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSolutionOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTimerEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setInputDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  setOrbitControlsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

const useScrambleLogic = ({
  isAnimating,
  inputDisabled,
  isScramblingState,
  cubeRef,
  currentRunRef,
  lastScrambleStartedAtRef,
  scrambleRequestPendingRef,
  scrambleRemainingRef,
  solutionOverlaySourceRef,
  sessionPhaseRef,
  orbitControlsRef,
  enqueueMoves,
  clearMoveHistory,
  resetTimer,
  setPendingMove,
  setScrambleIndex,
  setSolutionIndex,
  setIsScramblingState,
  setIsScrambled,
  setSolution,
  setLastSolvedState,
  setIsGenerating,
  setShowSolutionGeneratedModal,
  setScrambleMoves,
  setShowScrambleOverlay,
  setShowSolutionOverlay,
  setIsTimerEnabled,
  setInputDisabled,
  setOrbitControlsEnabled,
}: UseScrambleLogicParams) => {
  const executeScramble = useCallback(() => {
    if (isAnimating || AnimationHelper.isLocked()) return;
    if (currentRunRef.current === "scramble" || isScramblingState) return;
    const now = Date.now();
    if (now - lastScrambleStartedAtRef.current < 400) return;
    setPendingMove(null);

    const scramble = cubeRef.current.generateScramble(20);
    setScrambleIndex(-1);
    setSolutionIndex(-1);
    currentRunRef.current = "scramble";
    setIsScramblingState(true);
    scrambleRequestPendingRef.current = false;
    lastScrambleStartedAtRef.current = now;
    scrambleRemainingRef.current = scramble.length;
    enqueueMoves(scramble);
    setIsScrambled(true);
    sessionPhaseRef.current = "scramble";
    setSolution(null);
    setLastSolvedState(null);
    setIsGenerating(false);
    setShowSolutionGeneratedModal(false);
    setScrambleMoves(scramble);
    setShowScrambleOverlay(true);
    setShowSolutionOverlay(false);
    solutionOverlaySourceRef.current = null;
  }, [enqueueMoves, isAnimating]);

  const handleScramble = useCallback(
    (keepTimerMode = false, allowDuringLock = false) => {
      if (
        (inputDisabled || sessionPhaseRef.current !== "idle") &&
        !allowDuringLock
      )
        return;
      if (isAnimating || AnimationHelper.isLocked()) return;
      resetTimer();
      if (!keepTimerMode) setIsTimerEnabled(false);
      clearMoveHistory();
      executeScramble();
    },
    [isAnimating, resetTimer, executeScramble, clearMoveHistory, inputDisabled],
  );

  const performAnimatedScramble = useCallback(() => {
    const startScramble = () => {
      setInputDisabled(false);
      setOrbitControlsEnabled(true);
      if (orbitControlsRef.current) {
        orbitControlsRef.current.enabled = true;
        if (typeof orbitControlsRef.current.update === "function")
          orbitControlsRef.current.update();
      }
      sessionPhaseRef.current = "idle";
      executeScramble();
    };
    const delayMs = 400;
    setTimeout(startScramble, delayMs);
  }, [executeScramble]);

  return { executeScramble, handleScramble, performAnimatedScramble };
};

export default useScrambleLogic;
