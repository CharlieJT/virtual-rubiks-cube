import { useState, useEffect } from "react";
import {
  isPracticeSlide,
  isPracticeWhiteCornersSlide,
  isPracticeSecondLayerSlide,
} from "@components/tutorials/consts/tutorialSlideConfig";
import type { CubeState } from "@/types/cube";

interface UsePracticeSlideCompletionProps {
  activeSlideId: string | undefined;
  cube3D: CubeState[][][];
  moveHistory: string[];
  isWhiteCrossSolved: () => boolean;
  isWhiteCornersSolved: () => boolean;
  isSecondLayerSolved: () => boolean;
  isCubeFullySolved?: () => boolean;
}

const usePracticeSlideCompletion = ({
  activeSlideId,
  cube3D,
  moveHistory,
  isWhiteCrossSolved,
  isWhiteCornersSolved,
  isSecondLayerSolved,
  isCubeFullySolved,
}: UsePracticeSlideCompletionProps) => {
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  const [practiceShowTick, setPracticeShowTick] = useState(false);
  const [practiceTickProgress, setPracticeTickProgress] = useState(false);
  const [practiceTickLine, setPracticeTickLine] = useState(false);
  const [practiceTickAnimKey, setPracticeTickAnimKey] = useState(0);
  const [practiceSetupComplete, setPracticeSetupComplete] = useState(false);
  const [practiceInitialCrossState, setPracticeInitialCrossState] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    if (!isPracticeSlide(activeSlideId)) return;
    if (!practiceSetupComplete) return;

    const isWhiteCornersPractice = isPracticeWhiteCornersSlide(activeSlideId);
    const isSecondLayerPractice = isPracticeSecondLayerSlide(activeSlideId);
    const isBonusHalfwaySolve = activeSlideId === "bonus-halfway-solve";
    const isLastThreeSteps = activeSlideId === "practice-last-three-steps";
    const isFullCube = activeSlideId === "practice-full-cube";

    const crossSolved = isWhiteCrossSolved();
    const cornersSolved = isWhiteCornersSolved();
    const secondLayerSolved = isSecondLayerSolved();
    const fullSolved =
      isCubeFullySolved != null ? isCubeFullySolved() : false;

    const isSolved =
      isLastThreeSteps || isFullCube
        ? fullSolved
        : isBonusHalfwaySolve
      ? crossSolved && cornersSolved && secondLayerSolved
      : isWhiteCornersPractice
      ? crossSolved && cornersSolved
      : isSecondLayerPractice
      ? secondLayerSolved
      : crossSolved;

    if (practiceInitialCrossState === null) {
      setPracticeInitialCrossState(isSolved);
      return;
    }

    if (isSolved && !practiceCompleted) {
      if (!practiceInitialCrossState || moveHistory.length > 0) {
        setPracticeCompleted(true);
        setPracticeShowTick(true);
        setPracticeTickAnimKey((k) => k + 1);
        setPracticeTickProgress(false);
        setPracticeTickLine(false);
        setTimeout(() => setPracticeTickProgress(true), 50);
        setTimeout(() => setPracticeTickLine(true), 300);
      }
    }
  }, [
    activeSlideId,
    cube3D,
    isWhiteCrossSolved,
    isWhiteCornersSolved,
    isSecondLayerSolved,
    isCubeFullySolved,
    practiceCompleted,
    practiceSetupComplete,
    practiceInitialCrossState,
    moveHistory.length,
  ]);

  useEffect(() => {
    setPracticeCompleted(false);
    setPracticeShowTick(false);
    setPracticeTickProgress(false);
    setPracticeTickLine(false);
    setPracticeTickAnimKey((k) => k + 1);
    setPracticeInitialCrossState(null);
    setPracticeSetupComplete(false);
  }, [activeSlideId]);

  const resetPracticeCompletion = (): void => {
    setPracticeCompleted(false);
    setPracticeShowTick(false);
    setPracticeTickProgress(false);
    setPracticeTickLine(false);
    setPracticeTickAnimKey((k) => k + 1);
    setPracticeInitialCrossState(null);
    setPracticeSetupComplete(false);
  };

  return {
    practiceCompleted,
    setPracticeCompleted,
    practiceShowTick,
    setPracticeShowTick,
    practiceTickProgress,
    setPracticeTickProgress,
    practiceTickLine,
    setPracticeTickLine,
    practiceTickAnimKey,
    setPracticeTickAnimKey,
    practiceSetupComplete,
    setPracticeSetupComplete,
    practiceInitialCrossState,
    setPracticeInitialCrossState,
    resetPracticeCompletion,
  };
};

export default usePracticeSlideCompletion;
