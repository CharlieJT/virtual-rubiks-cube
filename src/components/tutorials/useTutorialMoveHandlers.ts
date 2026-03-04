import { useCallback } from "react";
import { flushSync } from "react-dom";
import type { CubeMove, CubeState } from "@/types/cube";
import { CubeJSWrapper } from "@utils/cubejsWrapper";
import { AnimationHelper } from "@utils/animationHelper";
import cubejsTo3D from "@utils/cubejsTo3D";
import type { CustomWindowType } from "@/types/window";
import { isPracticeSlide as checkIsPracticeSlide } from "@components/tutorials/consts/tutorialSlideConfig";
import { parseMove, eqMove, mapMidlayerConceptual } from "@components/tutorials/utils/moveValidationHelpers";
import { isSliceMove, getSliceMoveInverse } from "@components/tutorials/utils/sliceMoveHelpers";
import type { Slide } from "@components/tutorials/slideDefinitions";

interface UseTutorialMoveHandlersParams {
  fixSequence: string[];
  fixIndex: number;
  fixDoublePartialDir: number;
  activeSlide: Slide | undefined;
  isAnimating: boolean;
  isAnimatingRef: React.RefObject<boolean>;
  lastMoveTimeRef: React.RefObject<number>;
  lastMoveSourceRef: React.RefObject<"queue" | "manual" | "undo" | "redo" | null>;
  moveHistoryRef: React.RefObject<string[]>;
  historyIndexRef: React.RefObject<number>;
  resetQueue: string[] | null;
  resetIndexRef: React.RefObject<number>;
  fixCompleted: boolean;
  practiceCompleted: boolean;
  cubeRef: React.RefObject<CubeJSWrapper>;
  setCube3D: (cube: CubeState[][][]) => void;
  setPendingMove: (move: CubeMove | null) => void;
  setIsAnimating: (value: boolean) => void;
  setMoveHistory: (history: string[]) => void;
  setHistoryIndex: (index: number) => void;
  setResetQueue: (queue: string[] | null) => void;
  setIsResetting: (value: boolean) => void;
  setInputDisabled: (value: boolean) => void;
  forceOrbitDisabledRef: React.RefObject<boolean>;
  handleOrbitControlsChange: (enabled: boolean) => void;
  validateMove: (move: CubeMove, wasManual: boolean) => void;
  isResettingRef: React.RefObject<boolean>;
}

const useTutorialMoveHandlers = ({
  fixSequence,
  fixIndex,
  fixDoublePartialDir,
  activeSlide,
  isAnimating,
  isAnimatingRef,
  lastMoveTimeRef,
  lastMoveSourceRef,
  moveHistoryRef,
  historyIndexRef,
  resetQueue,
  resetIndexRef,
  fixCompleted,
  practiceCompleted,
  cubeRef,
  setCube3D,
  setPendingMove,
  setIsAnimating,
  setMoveHistory,
  setHistoryIndex,
  setResetQueue,
  setIsResetting,
  forceOrbitDisabledRef,
  handleOrbitControlsChange,
  validateMove,
  isResettingRef,
}: UseTutorialMoveHandlersParams) => {
  const handleButtonMove = useCallback(
    (move: string) => {
      if (fixCompleted) return;
      const isPracticeSlide = checkIsPracticeSlide(activeSlide?.id);
      if (isPracticeSlide && practiceCompleted) return;
      const now = Date.now();
      if (
        isAnimating ||
        AnimationHelper.isLocked() ||
        now - lastMoveTimeRef.current < 100
      ) {
        requestAnimationFrame(() => handleButtonMove(move));
        return;
      }
      lastMoveTimeRef.current = now;
      lastMoveSourceRef.current = "manual";
      setPendingMove(move as CubeMove);
    },
    [isAnimating, fixCompleted, activeSlide?.id, practiceCompleted]
  );

  const handleMoveAnimationDone = useCallback(
    (move: CubeMove) => {
      if (isResettingRef.current) {
        setPendingMove(null);
        setIsAnimating(false);
        isAnimatingRef.current = false;
        lastMoveSourceRef.current = null;
        return;
      }
      const isWholeCubeRotation =
        move === "x" ||
        move === "x'" ||
        move === "y" ||
        move === "y'" ||
        move === "z" ||
        move === "z'";

      const wasManual =
        (window as CustomWindowType).__isManualDragMove ||
        lastMoveSourceRef.current === "manual";

      if (!isWholeCubeRotation) {
        const isManualMove = wasManual;
        const isUndoRedo =
          lastMoveSourceRef.current === "undo" ||
          lastMoveSourceRef.current === "redo";

        let shouldApplyMove = true;
        if (fixSequence.length > 0 && isManualMove && !isUndoRedo) {
          const expected = fixSequence[fixIndex];
          if (expected) {
            const exp = parseMove(expected);
            const mappedMove = mapMidlayerConceptual(
              move as string,
              activeSlide?.id,
              fixIndex
            );
            const got = parseMove(mappedMove);
            const mappedMoveForEq = mapMidlayerConceptual(
              move as string,
              activeSlide?.id,
              fixIndex
            );

            let isCorrect = false;
            if (exp.mod === "2") {
              if (fixDoublePartialDir !== 0) {
                const expectedDir = fixDoublePartialDir;
                const gotDir = got.mod === "'" ? -1 : got.mod === "2" ? 0 : 1;
                isCorrect =
                  got.base === exp.base && gotDir !== 0 && gotDir === expectedDir;
              } else {
                if (got.base === exp.base && got.mod === "2") {
                  isCorrect = true;
                } else if (
                  got.base === exp.base &&
                  (got.mod === "" || got.mod === "'")
                ) {
                  isCorrect = true;
                } else {
                  isCorrect = false;
                }
              }
            } else {
              isCorrect = eqMove(mappedMoveForEq, expected);
            }

            if (!isCorrect) {
              cubeRef.current.move(move);
              flushSync(() => {
                setCube3D(cubejsTo3D(cubeRef.current.getCube()));
              });

              const isSlice = isSliceMove(move);
              const inverseMove = isSlice
                ? getSliceMoveInverse(move)
                : (() => {
                    if (move.endsWith("'")) return move.slice(0, -1) as CubeMove;
                    if (move.endsWith("2")) return move as CubeMove;
                    return (move + "'") as CubeMove;
                  })();
              if (inverseMove) {
                cubeRef.current.move(inverseMove);
              }

              shouldApplyMove = false;
              (window as CustomWindowType).__isWrongMove = true;
              validateMove(move, wasManual);
            }
          }
        }

        if (shouldApplyMove) {
          cubeRef.current.move(move);
          setCube3D(cubejsTo3D(cubeRef.current.getCube()));
        }

        if (isManualMove && !isUndoRedo) {
          const currHistory = moveHistoryRef.current;
          const currIndex = historyIndexRef.current;
          const base =
            currIndex === -1 ? currHistory : currHistory.slice(0, currIndex + 1);
          const nextHistory = [...base, move];
          setMoveHistory(nextHistory);
          setHistoryIndex(nextHistory.length - 1);
          moveHistoryRef.current = nextHistory;
          historyIndexRef.current = nextHistory.length - 1;
        }
      }

      setPendingMove(null);
      setIsAnimating(false);
      isAnimatingRef.current = false;
      forceOrbitDisabledRef.current = false;

      if (activeSlide?.allowFaceMoves !== false) {
        handleOrbitControlsChange(true);
      }

      if (resetQueue && resetQueue.length > 0) {
        const nextIdx = resetIndexRef.current + 1;
        if (nextIdx < resetQueue.length) {
          resetIndexRef.current = nextIdx;
          lastMoveSourceRef.current = "queue";
          setPendingMove(resetQueue[nextIdx] as CubeMove);
        } else {
          setResetQueue(null);
          resetIndexRef.current = 0;
          lastMoveSourceRef.current = null;
          setIsResetting(false);
          setCube3D(cubejsTo3D(cubeRef.current.getCube()));
        }
      } else {
        lastMoveSourceRef.current = null;
      }

      const wasWrongMove = (window as CustomWindowType).__isWrongMove;
      if (fixSequence.length > 0 && wasManual && !wasWrongMove) {
        validateMove(move, wasManual);
      }
      (window as CustomWindowType).__isWrongMove = false;
    },
    [
      resetQueue,
      fixSequence,
      fixIndex,
      fixDoublePartialDir,
      activeSlide,
      validateMove,
      handleOrbitControlsChange,
      cubeRef,
      setCube3D,
      setPendingMove,
      setIsAnimating,
      setMoveHistory,
      setHistoryIndex,
      setResetQueue,
      setIsResetting,
      isResettingRef,
    ]
  );

  return { handleButtonMove, handleMoveAnimationDone };
};

export default useTutorialMoveHandlers;
