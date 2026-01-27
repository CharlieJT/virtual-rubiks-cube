import { useCallback } from "react";
import type { RefObject, MutableRefObject } from "react";
import { flushSync } from "react-dom";
import {
  parseMove,
  eqMove,
  mapMidlayerConceptual,
} from "@/utils/moveValidationHelpers";
import { checkAndApplyYawChange } from "@/utils/slideYawHelpers";
import type { RubiksCube3DHandle } from "@components/RubiksCube3D/types";
import { CubeJSWrapper } from "@utils/cubejsWrapper";
import type { CubeMove } from "@/types/cube";

interface UseFixSequenceValidationProps {
  fixSequence: string[];
  fixIndex: number;
  fixDoublePartialDir: 0 | 1 | -1;
  activeSlideId: string | undefined;
  lessonId: string;
  isTransitioningRef: MutableRefObject<boolean>;
  setFixIndex: (index: number | ((prev: number) => number)) => void;
  setFixDoublePartialDir: (dir: 0 | 1 | -1) => void;
  setFixErrorPulse: (pulse: boolean) => void;
  setFixShowTick: (show: boolean) => void;
  orbitControlsRef: RefObject<any>;
  cubeViewRef: RefObject<RubiksCube3DHandle | null>;
  cubeRef: RefObject<CubeJSWrapper>;
  slide8WhiteCrossYawStateRef: MutableRefObject<number>;
  slide6YawChangedRef: MutableRefObject<boolean>;
  slide8YawChangedRef: MutableRefObject<boolean>;
  secondLayerSetupYawChangedRef: MutableRefObject<boolean>;
  secondLayerSetup2YawChangedRef: MutableRefObject<boolean>;
  secondLayerSetup3YawChangedRef: MutableRefObject<number>;
  secondLayerSetup4YawChangedRef: MutableRefObject<number>;
  yellowEdges2YawChangedRef: MutableRefObject<boolean>;
  yellowEdges3YawChangedRef: MutableRefObject<boolean>;
  yellowEdges4YawChangedRef: MutableRefObject<boolean>;
  yellowCorners2YawChangedRef: MutableRefObject<boolean>;
  yellowCorners3YawChangedRef: MutableRefObject<boolean>;
  orientTwoCornersYawChangedRef: MutableRefObject<number>;
  orientThreeCornersYawChangedRef: MutableRefObject<number>;
  orientFourCornersYawChangedRef: MutableRefObject<number>;
  practiceSetupSolution9YawChangedRef: MutableRefObject<number>;
  animateMidlayerStage: (stage: 1 | 2 | 3 | 4 | 5) => void;
  triggerFixTick: () => void;
  resetToSlideBaseline: (skipFixIndexReset?: boolean, previousState?: any) => Promise<void>;
  showErrorFade: (wrongMove: CubeMove | null, fixSequence: string[], fixIndex: number) => void;
  setFixFirstTickProgress: (progress: boolean) => void;
  setFixFirstTickLine: (line: boolean) => void;
  setFixFirstTickPlayed: (played: boolean) => void;
  setFixSecondTickProgress: (progress: boolean) => void;
  setFixSecondTickLine: (line: boolean) => void;
  setFixSecondTickPlayed: (played: boolean) => void;
  fixFirstTickPlayed: boolean;
  fixSecondTickPlayed: boolean;
  setShowSecondSequenceYellowEdges2?: (show: boolean) => void;
  setSecondSequenceYellowEdges2Locked?: (locked: boolean) => void;
}

export const useFixSequenceValidation = ({
  fixSequence,
  fixIndex,
  fixDoublePartialDir,
  activeSlideId,
  lessonId,
  isTransitioningRef,
  setFixIndex,
  setFixDoublePartialDir,
  setFixErrorPulse,
  setFixShowTick,
  orbitControlsRef,
  cubeViewRef,
  cubeRef,
  slide8WhiteCrossYawStateRef,
  slide6YawChangedRef,
  slide8YawChangedRef,
  secondLayerSetupYawChangedRef,
  secondLayerSetup2YawChangedRef,
  secondLayerSetup3YawChangedRef,
  secondLayerSetup4YawChangedRef,
  yellowEdges2YawChangedRef,
  yellowEdges3YawChangedRef,
  yellowEdges4YawChangedRef,
  yellowCorners2YawChangedRef,
  yellowCorners3YawChangedRef,
  orientTwoCornersYawChangedRef,
  orientThreeCornersYawChangedRef,
  orientFourCornersYawChangedRef,
  practiceSetupSolution9YawChangedRef,
  animateMidlayerStage,
  triggerFixTick,
  resetToSlideBaseline,
  showErrorFade,
  setFixFirstTickProgress,
  setFixFirstTickLine,
  setFixFirstTickPlayed,
  setFixSecondTickProgress,
  setFixSecondTickLine,
  setFixSecondTickPlayed,
  fixFirstTickPlayed,
  fixSecondTickPlayed,
  setShowSecondSequenceYellowEdges2,
  setSecondSequenceYellowEdges2Locked,
}: UseFixSequenceValidationProps) => {
  const validateMove = useCallback(
    (move: CubeMove, wasManual: boolean) => {
      if (
        fixSequence.length === 0 ||
        !wasManual ||
        isTransitioningRef.current
      ) {
        return;
      }

      const expected = fixSequence[fixIndex];
      if (!expected) {
        return;
      }

      const exp = parseMove(expected);
      const mappedMove = mapMidlayerConceptual(
        move as string,
        activeSlideId,
        fixIndex
      );
      const got = parseMove(mappedMove);

      const resetWithError = async () => {
        // Store the wrong move index so we can show error on it
        const wrongMoveIndex = fixIndex;
        // Get the wrong move that was attempted (the move parameter passed to validateMove)
        const wrongMoveAttempted = move;
        // Reset cube state and orbit immediately
        setFixDoublePartialDir(0);
        setFixShowTick(false);
        if (activeSlideId === "yellow-edges-solution-2") {
          setShowSecondSequenceYellowEdges2?.(false);
          setSecondSequenceYellowEdges2Locked?.(false);
          yellowEdges2YawChangedRef.current = false;
        }
        if (activeSlideId === "yellow-edges-solution-3") {
          yellowEdges3YawChangedRef.current = false;
        }
        if (activeSlideId === "yellow-edges-solution-4") {
          yellowEdges4YawChangedRef.current = false;
        }
        if (activeSlideId === "yellow-corners-solution-2") {
          yellowCorners2YawChangedRef.current = false;
        }
        // Set error pulse BEFORE reset so it's visible during reset
        setFixErrorPulse(true);
        // Show error fade (grey fade on mismatched stickers) WITHOUT resetting the cube
        // Pass the wrong move, fixSequence, and fixIndex so showErrorFade can compute the correct baseline
        showErrorFade(wrongMoveAttempted, fixSequence, fixIndex);
        // Restore fixIndex and error pulse
        flushSync(() => {
          setFixIndex(wrongMoveIndex);
          setFixErrorPulse(true);
        });
        // After flash duration, reset fixIndex and turn off error flash
        setTimeout(() => {
          setFixIndex(0);
          setFixErrorPulse(false);
        }, 350);
      };

      const handleMoveSuccess = (nextIndex: number) => {
        setFixIndex(nextIndex);
        setFixDoublePartialDir(0);

        if (
          activeSlideId === "midlayer-green-white-extraction" &&
          (nextIndex === 3 || nextIndex === 4 || nextIndex === 5)
        ) {
          animateMidlayerStage(nextIndex === 3 ? 1 : nextIndex === 4 ? 2 : 3);
        }
        if (
          activeSlideId === "practice-setup-solution-3" &&
          (nextIndex === 4 || nextIndex === 7)
        ) {
          animateMidlayerStage(nextIndex === 4 ? 1 : 2);
        }
        if (
          activeSlideId === "practice-setup-solution-4" &&
          (nextIndex === 4 || nextIndex === 7)
        ) {
          animateMidlayerStage(nextIndex === 4 ? 1 : 2);
        }
        if (
          activeSlideId === "practice-setup-solution-5" &&
          (nextIndex === 4 || nextIndex === 8 || nextIndex === 11)
        ) {
          animateMidlayerStage(nextIndex === 4 ? 1 : nextIndex === 8 ? 2 : 3);
        }
        if (
          activeSlideId === "practice-setup-solution-6" &&
          (nextIndex === 4 || nextIndex === 5 || nextIndex === 8)
        ) {
          animateMidlayerStage(nextIndex === 4 ? 1 : nextIndex === 5 ? 2 : 3);
        }
        if (
          activeSlideId === "second-layer-setup-solution" &&
          (nextIndex === 5 || nextIndex === 8)
        ) {
          animateMidlayerStage(nextIndex === 5 ? 1 : 2);
        }
        if (
          activeSlideId === "second-layer-setup-solution-2" &&
          (nextIndex === 5 || nextIndex === 8)
        ) {
          animateMidlayerStage(nextIndex === 5 ? 1 : 2);
        }
        if (
          activeSlideId === "second-layer-setup-solution-3" &&
          (nextIndex === 5 || nextIndex === 8)
        ) {
          animateMidlayerStage(nextIndex === 5 ? 1 : 2);
        }
        if (
          activeSlideId === "second-layer-setup-solution-4" &&
          (nextIndex === 5 || nextIndex === 8 || nextIndex === 9)
        ) {
          if (nextIndex === 9) {
            animateMidlayerStage(3);
          } else {
            animateMidlayerStage(nextIndex === 5 ? 1 : 2);
          }
        }
        if (
          activeSlideId === "second-layer-setup-solution-4" &&
          (nextIndex === 14 || nextIndex === 17)
        ) {
          animateMidlayerStage(nextIndex === 14 ? 4 : 5);
        }
        if (
          activeSlideId === "yellow-cross-triangle" &&
          (nextIndex === 6 || nextIndex === 12)
        ) {
          animateMidlayerStage(nextIndex === 6 ? 1 : 2);
        }
        if (
          activeSlideId === "yellow-cross-dot" &&
          (nextIndex === 6 ||
            nextIndex === 7 ||
            nextIndex === 13 ||
            nextIndex === 19)
        ) {
          if (nextIndex === 7) {
            animateMidlayerStage(2);
          } else {
            animateMidlayerStage(
              nextIndex === 6 ? 1 : nextIndex === 13 ? 3 : 4
            );
          }
        }
        if (
          activeSlideId === "yellow-edges-solution-2" &&
          (nextIndex === 1 || nextIndex === 9)
        ) {
          animateMidlayerStage(nextIndex === 1 ? 1 : 2);
          if (nextIndex === 9) {
            setSecondSequenceYellowEdges2Locked?.(true);
          }
        }
        if (activeSlideId === "yellow-edges-solution-3") {
          if (nextIndex === 1) {
            animateMidlayerStage(1);
          } else if (nextIndex === 9) {
            animateMidlayerStage(2);
          }
        }
        if (
          activeSlideId === "yellow-corners-solution-2" &&
          (nextIndex === 8 || nextIndex === 16)
        ) {
          animateMidlayerStage(nextIndex === 8 ? 1 : 2);
        }
        if (
          activeSlideId === "yellow-corners-solution-3" &&
          (nextIndex === 8 || nextIndex === 16 || nextIndex === 24)
        ) {
          if (nextIndex === 8) {
            animateMidlayerStage(1);
          } else if (nextIndex === 16) {
            animateMidlayerStage(2);
          } else if (nextIndex === 24) {
            animateMidlayerStage(3);
          }
        }

        checkAndApplyYawChange(
          activeSlideId,
          lessonId,
          nextIndex,
          orbitControlsRef,
          cubeViewRef,
          cubeRef,
          {
            slide8WhiteCrossYawStateRef,
            slide6YawChangedRef,
            slide8YawChangedRef,
            secondLayerSetupYawChangedRef,
            secondLayerSetup2YawChangedRef,
            secondLayerSetup3YawChangedRef,
            secondLayerSetup4YawChangedRef,
            yellowEdges2YawChangedRef,
            yellowEdges3YawChangedRef,
            yellowEdges4YawChangedRef,
            yellowCorners2YawChangedRef,
            yellowCorners3YawChangedRef,
            orientTwoCornersYawChangedRef,
            orientThreeCornersYawChangedRef,
            orientFourCornersYawChangedRef,
            practiceSetupSolution9YawChangedRef,
          }
        );

        if (
          (activeSlideId === "flipped-misoriented-green-white" ||
            activeSlideId === "misaligned-green-white") &&
          fixIndex === 0 &&
          !fixFirstTickPlayed
        ) {
          setFixFirstTickProgress(false);
          setFixFirstTickLine(false);
          setTimeout(() => setFixFirstTickProgress(true), 50);
          setTimeout(() => setFixFirstTickLine(true), 300);
          setTimeout(() => setFixFirstTickPlayed(true), 700);
        } else if (
          activeSlideId === "flipped-misoriented-misaligned-green-white" &&
          fixIndex === 1 &&
          !fixSecondTickPlayed
        ) {
          setFixSecondTickProgress(false);
          setFixSecondTickLine(false);
          setTimeout(() => setFixSecondTickProgress(true), 50);
          setTimeout(() => setFixSecondTickLine(true), 300);
          setTimeout(() => setFixSecondTickPlayed(true), 700);
        } else if (
          (activeSlideId === "flipped-misoriented-green-white" ||
            activeSlideId === "misaligned-green-white" ||
            activeSlideId === "flipped-misoriented-misaligned-green-white") &&
          nextIndex === 1 &&
          !fixFirstTickPlayed
        ) {
          setFixFirstTickProgress(false);
          setFixFirstTickLine(false);
          setTimeout(() => setFixFirstTickProgress(true), 50);
          setTimeout(() => setFixFirstTickLine(true), 300);
          setTimeout(() => setFixFirstTickPlayed(true), 700);
        } else if (
          activeSlideId === "flipped-misoriented-misaligned-green-white" &&
          (nextIndex === 2 || (fixIndex === 1 && nextIndex === 2)) &&
          !fixSecondTickPlayed
        ) {
          setFixSecondTickProgress(false);
          setFixSecondTickLine(false);
          setTimeout(() => setFixSecondTickProgress(true), 50);
          setTimeout(() => setFixSecondTickLine(true), 300);
          setTimeout(() => setFixSecondTickPlayed(true), 700);
        }

        if (nextIndex >= fixSequence.length) {
          triggerFixTick();
        }
      };

      if (exp.mod === "2") {
        if (fixDoublePartialDir !== 0) {
          // We're in the middle of a double move - check if this move completes it
          const expectedDir = fixDoublePartialDir;
          const gotDir = got.mod === "'" ? -1 : got.mod === "2" ? 0 : 1;
          if (got.base === exp.base && gotDir !== 0 && gotDir === expectedDir) {
            // Complete the double move - increment fixIndex by 1
            const nextIndex = fixIndex + 1;
            handleMoveSuccess(nextIndex);
          } else {
            resetWithError();
          }
        } else {
          // No partial move yet - check if this is a complete double move or first part
          if (got.base === exp.base && got.mod === "2") {
            // Complete double move done in one go (e.g., user did F2 when F2 was expected)
            // This is ONE move in the sequence, so increment fixIndex by 1
            const nextIndex = fixIndex + 1;
            handleMoveSuccess(nextIndex);
          } else if (
            got.base === exp.base &&
            (got.mod === "" || got.mod === "'")
          ) {
            // First part of a double move (e.g., user did F when F2 was expected)
            // Set fixDoublePartialDir and wait for second part - don't increment fixIndex yet
            const dir = got.mod === "'" ? -1 : 1;
            setFixDoublePartialDir(dir);
          } else {
            resetWithError();
          }
        }
      } else {
        const mappedMoveForEq = mapMidlayerConceptual(
          move as string,
          activeSlideId,
          fixIndex
        );
        if (eqMove(mappedMoveForEq, expected)) {
          const next = fixIndex + 1;
          handleMoveSuccess(next);
        } else {
          resetWithError();
        }
      }
    },
    [
      fixSequence,
      fixIndex,
      fixDoublePartialDir,
      activeSlideId,
      lessonId,
      isTransitioningRef,
      setFixIndex,
      setFixDoublePartialDir,
      setFixErrorPulse,
      setFixShowTick,
      orbitControlsRef,
      cubeViewRef,
      cubeRef,
      slide8WhiteCrossYawStateRef,
      slide6YawChangedRef,
      slide8YawChangedRef,
      yellowEdges2YawChangedRef,
      yellowEdges3YawChangedRef,
      yellowCorners2YawChangedRef,
      yellowCorners3YawChangedRef,
      animateMidlayerStage,
      triggerFixTick,
      resetToSlideBaseline,
      setFixFirstTickProgress,
      setFixFirstTickLine,
      setFixFirstTickPlayed,
      setFixSecondTickProgress,
      setFixSecondTickLine,
      setFixSecondTickPlayed,
      fixFirstTickPlayed,
      fixSecondTickPlayed,
      setShowSecondSequenceYellowEdges2,
      setSecondSequenceYellowEdges2Locked,
    ]
  );

  return { validateMove };
};
