import { useMemo } from "react";
import type { CubeState } from "@/types/cube";
import {
  findWhiteGreenRedCorner,
  findRedGreenSecondLayerEdge,
  findGreenWhiteEdge,
} from "@components/tutorials/utils/tutorialHelpers";

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

export const getHighlightPositionsForSlide = (
  slideId: string | undefined,
  lessonId: string,
  tutorialCube3D: CubeState[][][],
): [number, number, number][] | undefined => {
  if (slideId === "center-order-bogr") {
    return [
      [1, 1, 0],
      [1, 1, 2],
      [0, 1, 1],
      [2, 1, 1],
    ];
  }
  if (slideId === "bogr-edges-focus") {
    return [
      [1, 2, 2],
      [2, 2, 1],
      [1, 2, 0],
      [0, 2, 1],
    ];
  }
  if (slideId === "mechanical-approach" && lessonId === "white-corners") {
    const pos = findWhiteGreenRedCorner(tutorialCube3D);
    return pos ? [pos] : [];
  }
  if (slideId === "mechanical-approach" && lessonId === "second-layer") {
    const pos = findRedGreenSecondLayerEdge(tutorialCube3D);
    return pos ? [pos] : [];
  }
  if (slideId === "find-green-white" && lessonId === "white-cross") {
    const pos = findGreenWhiteEdge(tutorialCube3D);
    return pos ? [pos] : [];
  }
  return undefined;
};

const useRubiksCube3DProps = ({
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
      !activeSlideAllowFaceMoves ||
      activeSlideId === "intro" ||
      activeSlideId === "mechanical-approach" ||
      activeSlideId === "find-green-white" ||
      fixCompleted ||
      (isPracticeSlide && practiceCompleted)
    );
  }, [
    isRecapSlide,
    activeSlideAllowFaceMoves,
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
    return 0;
  }, [activeSlideId]);

  const highlightPositions = useMemo(():
    | [number, number, number][]
    | undefined => {
    return getHighlightPositionsForSlide(
      activeSlideId,
      lessonId,
      tutorialCube3D,
    );
  }, [activeSlideId, lessonId, tutorialCube3D]);

  const dullOthersIntensity = useMemo(() => {
    if (activeSlideId === "center-order-bogr" || activeSlideId === "bogr-edges-focus") {
      return 0.75;
    }
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

  const doubleSidedStickerKeys = useMemo(() => {
    if (activeSlideId !== "center-order-bogr") return undefined;
    return new Set<string>(["1,1,0", "1,1,2", "0,1,1", "2,1,1"]);
  }, [activeSlideId]);

  const doubleSidedStickerKeysForEdges = useMemo(() => {
    if (activeSlideId !== "bogr-edges-focus") return undefined;
    return new Set<string>([
      "1,2,2:front",
      "2,2,1:right",
      "1,2,0:back",
      "0,2,1:left",
    ]);
  }, [activeSlideId]);

  const cubeOpacity = useMemo(() => {
    if (activeSlideId === "center-order-bogr" || activeSlideId === "bogr-edges-focus")
      return 0.65;
    return undefined;
  }, [activeSlideId]);

  return {
    inputDisabled: inputDisabledValue,
    disableSliceDrag,
    preventSliceMoves,
    highlightIntensity,
    highlightPositions,
    dullOthersIntensity,
    doubleSidedStickerKeys,
    doubleSidedStickerKeysForEdges,
    cubeOpacity,
  };
};

export const getDullAndOpacityForSlide = (
  slideId: string | undefined,
  lessonId: string
): { dull: number; opacity: number | undefined } => {
  let dull = 0;
  let opacity: number | undefined;
  if (slideId === "center-order-bogr" || slideId === "bogr-edges-focus") {
    dull = 0.75;
    opacity = 0.65;
  } else if (
    slideId === "mechanical-approach" &&
    (lessonId === "white-corners" || lessonId === "second-layer")
  ) {
    dull = 0.75;
  } else if (slideId === "find-green-white" && lessonId === "white-cross") {
    dull = 0.75;
  }
  return { dull, opacity };
};

export default useRubiksCube3DProps;
