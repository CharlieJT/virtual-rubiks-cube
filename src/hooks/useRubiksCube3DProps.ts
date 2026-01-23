import { useMemo } from "react";
import type { CubeState } from "@/types/cube";
import {
  isPracticeSlide as checkIsPracticeSlide,
  isRecapSlide as checkIsRecapSlide,
  isHighlightIntensitySlide,
} from "@/consts/tutorialSlideConfig";
import {
  findWhiteGreenRedCorner,
  findRedGreenSecondLayerEdge,
  findGreenWhiteEdge,
} from "@/utils/tutorialHelpers";

interface UseRubiksCube3DPropsParams {
  activeSlideId: string | undefined;
  activeSlideAllowFaceMoves?: boolean;
  activeSlideAllowSliceMoves?: boolean;
  lessonId: string;
  tutorialCube3D: CubeState[][][];
  isRecapSlide: boolean;
  isPracticeSlide: boolean;
  practiceCompleted: boolean;
  fixCompleted: boolean;
  inputDisabled: boolean;
}

export const useRubiksCube3DProps = ({
  activeSlideId,
  activeSlideAllowFaceMoves,
  activeSlideAllowSliceMoves,
  lessonId,
  tutorialCube3D,
  isRecapSlide,
  isPracticeSlide,
  practiceCompleted,
  fixCompleted,
  inputDisabled,
}: UseRubiksCube3DPropsParams) => {
  const inputDisabledValue = useMemo(() => {
    if (isRecapSlide) return true;
    if (isPracticeSlide && practiceCompleted) return true;
    return inputDisabled;
  }, [isRecapSlide, isPracticeSlide, practiceCompleted, inputDisabled]);

  const disableSliceDrag = useMemo(() => {
    return (
      isRecapSlide ||
      activeSlideId === "intro" ||
      activeSlideId === "mechanical-approach" ||
      activeSlideId === "find-green-white" ||
      fixCompleted ||
      (isPracticeSlide && practiceCompleted)
    );
  }, [
    isRecapSlide,
    activeSlideId,
    fixCompleted,
    isPracticeSlide,
    practiceCompleted,
  ]);

  const preventSliceMoves = useMemo(() => {
    if (activeSlideAllowSliceMoves) {
      return false;
    }
    return (
      isRecapSlide ||
      !activeSlideAllowFaceMoves ||
      activeSlideId === "mechanical-approach" ||
      (isPracticeSlide && practiceCompleted)
    );
  }, [
    isRecapSlide,
    activeSlideAllowFaceMoves,
    activeSlideAllowSliceMoves,
    activeSlideId,
    isPracticeSlide,
    practiceCompleted,
  ]);

  const highlightIntensity = useMemo(() => {
    return isHighlightIntensitySlide(activeSlideId) ? 1 : 0;
  }, [activeSlideId]);

  const highlightPositions = useMemo((): [number, number, number][] | undefined => {
    if (activeSlideId === "mechanical-approach" && lessonId === "white-corners") {
      const pos = findWhiteGreenRedCorner(tutorialCube3D);
      return pos ? [pos] : [];
    }
    if (activeSlideId === "mechanical-approach" && lessonId === "second-layer") {
      const pos = findRedGreenSecondLayerEdge(tutorialCube3D);
      return pos ? [pos] : [];
    }
    if (activeSlideId === "find-green-white" && lessonId === "white-cross") {
      const pos = findGreenWhiteEdge(tutorialCube3D);
      return pos ? [pos] : [];
    }
    return undefined;
  }, [activeSlideId, lessonId, tutorialCube3D]);

  const dullOthersIntensity = useMemo(() => {
    if (
      activeSlideId === "mechanical-approach" &&
      (lessonId === "white-corners" || lessonId === "second-layer")
    ) {
      return 0.75;
    }
    if (activeSlideId === "find-green-white" && lessonId === "white-cross") {
      return 0.75;
    }
    return 0;
  }, [activeSlideId, lessonId]);

  return {
    inputDisabled: inputDisabledValue,
    disableSliceDrag,
    preventSliceMoves,
    highlightIntensity,
    highlightPositions,
    dullOthersIntensity,
  };
};

