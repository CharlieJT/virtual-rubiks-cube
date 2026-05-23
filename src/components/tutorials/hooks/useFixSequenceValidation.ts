import { useCallback } from "react";
import type { RefObject, MutableRefObject } from "react";
import { flushSync } from "react-dom";
import {
  parseMove,
  eqMove,
  mapMidlayerConceptual,
} from "@components/tutorials/utils/moveValidationHelpers";
import { checkAndApplyYawChange } from "@components/tutorials/utils/slideYawHelpers";
import type { RubiksCube3DHandle } from "@components/RubiksCube3D/types";
import { CubeJSWrapper } from "@utils/cubejsWrapper";
import type { CubeMove, CubeState } from "@/types/cube";
import type { OrbitControlsInstance } from "@/types/orbitControls";

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
  orbitControlsRef: RefObject<OrbitControlsInstance | null>;
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
  intermediateWhiteCrossSlide8YawStateRef: MutableRefObject<number>;
  intermediateWhiteCrossSlide11YawStateRef: MutableRefObject<number>;
  intermediateWhiteCrossSlide13YawStateRef: MutableRefObject<number>;
  animateMidlayerStage: (stage: 1 | 2 | 3 | 4 | 5) => void;
  triggerFixTick: () => void;
  resetToSlideBaseline: (skipFixIndexReset?: boolean, previousState?: CubeState[][][]) => Promise<void>;
  showErrorFade: (
    wrongMove: CubeMove | null,
    slide16FadeSideCentersFromColorOverride?: boolean,
  ) => void;
  slide16FadeFromFullColorRef?: MutableRefObject<boolean>;
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

const useFixSequenceValidation = ({
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
  intermediateWhiteCrossSlide8YawStateRef,
  intermediateWhiteCrossSlide11YawStateRef,
  intermediateWhiteCrossSlide13YawStateRef,
  animateMidlayerStage,
  triggerFixTick,
  resetToSlideBaseline,
  showErrorFade,
  slide16FadeFromFullColorRef,
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
        const wrongMoveIndex = fixIndex;
        const wrongMoveAttempted = move;
        setFixDoublePartialDir(0);
        setFixShowTick(false);
        if (activeSlideId === "yellow-edges-one-correct") {
          setShowSecondSequenceYellowEdges2?.(false);
          setSecondSequenceYellowEdges2Locked?.(false);
          yellowEdges2YawChangedRef.current = false;
        }
        if (activeSlideId === "yellow-edges-zero-correct") {
          yellowEdges3YawChangedRef.current = false;
        }
        if (activeSlideId === "yellow-edges-two-opposite") {
          yellowEdges4YawChangedRef.current = false;
        }
        if (activeSlideId === "yellow-corners-zero-correct") {
          yellowCorners2YawChangedRef.current = false;
        }
        setFixErrorPulse(true);
        const slide16FadeCapture =
          slide16FadeFromFullColorRef?.current ?? false;
        showErrorFade(wrongMoveAttempted, slide16FadeCapture);
        flushSync(() => {
          setFixIndex(wrongMoveIndex);
          setFixErrorPulse(true);
        });
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
          activeSlideId === "corner-white-facing-up" &&
          (nextIndex === 4 || nextIndex === 7)
        ) {
          animateMidlayerStage(nextIndex === 4 ? 1 : 2);
        }
        if (
          activeSlideId === "corner-remove-reinsert" &&
          (nextIndex === 4 || nextIndex === 7)
        ) {
          animateMidlayerStage(nextIndex === 4 ? 1 : 2);
        }
        if (
          activeSlideId === "corner-remove-reinsert-alt" &&
          (nextIndex === 4 || nextIndex === 8 || nextIndex === 11)
        ) {
          animateMidlayerStage(nextIndex === 4 ? 1 : nextIndex === 8 ? 2 : 3);
        }
        if (
          activeSlideId === "corner-move-to-correct" &&
          (nextIndex === 4 || nextIndex === 5 || nextIndex === 8)
        ) {
          animateMidlayerStage(nextIndex === 4 ? 1 : nextIndex === 5 ? 2 : 3);
        }
        if (
          activeSlideId === "edge-insert-left" &&
          (nextIndex === 5 || nextIndex === 8)
        ) {
          animateMidlayerStage(nextIndex === 5 ? 1 : 2);
        }
        if (
          activeSlideId === "edge-insert-right" &&
          (nextIndex === 5 || nextIndex === 8)
        ) {
          animateMidlayerStage(nextIndex === 5 ? 1 : 2);
        }
        if (
          activeSlideId === "edge-remove-reinsert" &&
          (nextIndex === 5 || nextIndex === 8)
        ) {
          animateMidlayerStage(nextIndex === 5 ? 1 : 2);
        }
        if (
          activeSlideId === "edge-flipped-in-position" &&
          (nextIndex === 5 || nextIndex === 8 || nextIndex === 9)
        ) {
          if (nextIndex === 9) {
            animateMidlayerStage(3);
          } else {
            animateMidlayerStage(nextIndex === 5 ? 1 : 2);
          }
        }
        if (
          activeSlideId === "edge-flipped-in-position" &&
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
          activeSlideId === "yellow-edges-one-correct" &&
          (nextIndex === 1 || nextIndex === 9)
        ) {
          animateMidlayerStage(nextIndex === 1 ? 1 : 2);
          if (nextIndex === 9) {
            setSecondSequenceYellowEdges2Locked?.(true);
          }
        }
        if (activeSlideId === "yellow-edges-zero-correct") {
          if (nextIndex === 1) {
            animateMidlayerStage(1);
          } else if (nextIndex === 9) {
            animateMidlayerStage(2);
          }
        }
        if (
          activeSlideId === "yellow-corners-zero-correct" &&
          (nextIndex === 8 || nextIndex === 16)
        ) {
          animateMidlayerStage(nextIndex === 8 ? 1 : 2);
        }
        if (
          activeSlideId === "yellow-corners-zero-repeated" &&
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
          orbitControlsRef as unknown as React.RefObject<OrbitControlsInstance>,
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
            intermediateWhiteCrossSlide8YawStateRef,
            intermediateWhiteCrossSlide11YawStateRef,
            intermediateWhiteCrossSlide13YawStateRef,
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
          const expectedDir = fixDoublePartialDir;
          const gotDir = got.mod === "'" ? -1 : got.mod === "2" ? 0 : 1;
          if (got.base === exp.base && gotDir !== 0 && gotDir === expectedDir) {
            const nextIndex = fixIndex + 1;
            handleMoveSuccess(nextIndex);
          } else {
            resetWithError();
          }
        } else {
          if (got.base === exp.base && got.mod === "2") {
            const nextIndex = fixIndex + 1;
            handleMoveSuccess(nextIndex);
          } else if (
            got.base === exp.base &&
            (got.mod === "" || got.mod === "'")
          ) {
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
      intermediateWhiteCrossSlide8YawStateRef,
      intermediateWhiteCrossSlide11YawStateRef,
      intermediateWhiteCrossSlide13YawStateRef,
      yellowEdges2YawChangedRef,
      yellowEdges3YawChangedRef,
      yellowCorners2YawChangedRef,
      yellowCorners3YawChangedRef,
      animateMidlayerStage,
      triggerFixTick,
      resetToSlideBaseline,
      showErrorFade,
      slide16FadeFromFullColorRef,
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

export default useFixSequenceValidation;
