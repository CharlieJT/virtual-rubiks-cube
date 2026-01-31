import { useCallback } from "react";
import type React from "react";
import type { Slide } from "@components/tutorials/slideDefinitions";
import type { CubeMove } from "@/types/cube";
import {
  isPracticeSlide as checkIsPracticeSlide,
  requiresSetupDelay,
} from "@components/tutorials/consts/tutorialSlideConfig";
import type { RubiksCube3DHandle } from "@components/RubiksCube3D/types";

interface UseTutorialResetParams {
  slides: Slide[];
  currentSlide: number;
  disableOrbitTemporarily: () => void;
  cubeViewRef: React.RefObject<RubiksCube3DHandle | null>;
  isTransitioningRef: React.RefObject<boolean>;
  isResettingRef: React.RefObject<boolean>;
  setInputDisabled: (value: boolean) => void;
  setFixIndex: (value: number | ((prev: number) => number)) => void;
  setFixDoublePartialDir: React.Dispatch<React.SetStateAction<0 | 1 | -1>>;
  setFixShowTick: (value: boolean) => void;
  setFixTickAnimKey: (value: number | ((prev: number) => number)) => void;
  setFixTickProgress: (value: boolean) => void;
  setFixTickLine: (value: boolean) => void;
  setFixFirstTickPlayed: (value: boolean) => void;
  setFixFirstTickProgress: (value: boolean) => void;
  setFixFirstTickLine: (value: boolean) => void;
  setFixSecondTickPlayed: (value: boolean) => void;
  setFixSecondTickProgress: (value: boolean) => void;
  setFixSecondTickLine: (value: boolean) => void;
  resetFixState: () => void;
  resetMidStageTicks: () => void;
  resetSlideSpecificState: () => void;
  resetPracticeCompletion: () => void;
  setMoveHistory: (history: string[]) => void;
  setHistoryIndex: (index: number) => void;
  moveHistoryRef: React.RefObject<string[]>;
  historyIndexRef: React.RefObject<number>;
  setResetQueue: (queue: string[] | null) => void;
  resetIndexRef: React.RefObject<number>;
  setPendingMove: (move: CubeMove | null) => void;
  setIsAnimating: (value: boolean) => void;
  isAnimatingRef: React.RefObject<boolean>;
  setPracticeSetupComplete: (value: boolean) => void;
  showErrorFade: (wrongMove: CubeMove | null) => void;
}

export const useTutorialReset = ({
  slides,
  currentSlide,
  disableOrbitTemporarily,
  cubeViewRef,
  isTransitioningRef,
  isResettingRef,
  setInputDisabled,
  setFixIndex,
  setFixDoublePartialDir,
  setFixShowTick,
  setFixTickAnimKey,
  setFixTickProgress,
  setFixTickLine,
  setFixFirstTickPlayed,
  setFixFirstTickProgress,
  setFixFirstTickLine,
  setFixSecondTickPlayed,
  setFixSecondTickProgress,
  setFixSecondTickLine,
  resetFixState,
  resetMidStageTicks,
  resetSlideSpecificState,
  resetPracticeCompletion,
  setMoveHistory,
  setHistoryIndex,
  moveHistoryRef,
  historyIndexRef,
  setResetQueue,
  resetIndexRef,
  setPendingMove,
  setIsAnimating,
  isAnimatingRef,
  setPracticeSetupComplete,
  showErrorFade,
}: UseTutorialResetParams) => {
  const resetToSlideBaseline = useCallback(
    async (skipFixIndexReset = false) => {
      showErrorFade(null);
      await new Promise((resolve) => setTimeout(resolve, 350));

      isTransitioningRef.current = true;
      setInputDisabled(true);
      disableOrbitTemporarily();
      if (!skipFixIndexReset) {
        setFixIndex(0);
      }
      setFixDoublePartialDir(0);

      isResettingRef.current = true;
      setPendingMove(null);
      setIsAnimating(false);
      isAnimatingRef.current = false;
      if (!skipFixIndexReset) {
        resetFixState();
      } else {
        setFixDoublePartialDir(0);
        setFixShowTick(false);
        setFixTickAnimKey((k: number) => k + 1);
        setFixTickProgress(false);
        setFixTickLine(false);
        setFixFirstTickPlayed(false);
        setFixFirstTickProgress(false);
        setFixFirstTickLine(false);
        setFixSecondTickPlayed(false);
        setFixSecondTickProgress(false);
        setFixSecondTickLine(false);
      }
      resetMidStageTicks();
      resetSlideSpecificState();
      resetPracticeCompletion();

      setMoveHistory([]);
      setHistoryIndex(-1);
      moveHistoryRef.current = [];
      historyIndexRef.current = -1;
      setResetQueue(null);
      resetIndexRef.current = 0;

      cubeViewRef.current?.resetLogo();

      isResettingRef.current = false;

      const s = slides[currentSlide];
      if (checkIsPracticeSlide(s?.id)) {
        setTimeout(() => {
          setPracticeSetupComplete(true);
        }, 100);
      }

      if (requiresSetupDelay(s?.id)) {
        setPracticeSetupComplete(true);
      }
    },
    [
      slides,
      currentSlide,
      disableOrbitTemporarily,
      setInputDisabled,
      showErrorFade,
      resetFixState,
      resetMidStageTicks,
      resetSlideSpecificState,
      resetPracticeCompletion,
      setFixIndex,
      setFixDoublePartialDir,
      setFixShowTick,
      setFixTickAnimKey,
      setFixTickProgress,
      setFixTickLine,
      setFixFirstTickPlayed,
      setFixFirstTickProgress,
      setFixFirstTickLine,
      setFixSecondTickPlayed,
      setFixSecondTickProgress,
      setFixSecondTickLine,
      cubeViewRef,
      setMoveHistory,
      setHistoryIndex,
      moveHistoryRef,
      historyIndexRef,
      setResetQueue,
      resetIndexRef,
      setPendingMove,
      setIsAnimating,
      isAnimatingRef,
      setPracticeSetupComplete,
    ]
  );

  return { resetToSlideBaseline };
};
