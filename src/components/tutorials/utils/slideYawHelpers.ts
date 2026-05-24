/**
 * Utilities for handling slide-specific yaw changes during fix sequence progression
 */

import type { RefObject, MutableRefObject } from "react";
import type { RubiksCube3DHandle } from "@components/RubiksCube3D/types";
import { CubeJSWrapper } from "@utils/cubejsWrapper";
import type { OrbitControlsInstance } from "@/types/orbitControls";

export interface YawChangeConfig {
  extraYawRad?: number;
  flipUpsideDown?: boolean;
  extraERotationDeg?: number;
  extraPitchDeg?: number;
  slideId: string;
}

/**
 * Applies a yaw change to the cube view
 */
export const applyYawChange = (
  orbitControlsRef: RefObject<OrbitControlsInstance>,
  cubeViewRef: RefObject<RubiksCube3DHandle | null>,
  cubeRef: RefObject<CubeJSWrapper>,
  config: YawChangeConfig,
  callback?: () => void,
): void => {
  if (!orbitControlsRef.current || !cubeViewRef.current) return;

  const c: OrbitControlsInstance = orbitControlsRef.current;
  c.__resetOpts = config;
  cubeViewRef.current.resetToInitialPosition(
    orbitControlsRef,
    cubeRef,
    callback,
  );
};

/**
 * Check if a yaw change should be applied for midlayer-green-white-extraction slide
 * at specific fix sequence indices
 */
export const shouldChangeYawForMidlayerGreenWhiteExtraction = (
  slideId: string | undefined,
  lessonId: string,
  nextIndex: number,
  slide8WhiteCrossYawStateRef: MutableRefObject<number>,
): YawChangeConfig | null => {
  if (
    slideId !== "midlayer-green-white-extraction" ||
    lessonId !== "white-cross"
  ) {
    return null;
  }

  if (nextIndex === 3 && slide8WhiteCrossYawStateRef.current === 0) {
    slide8WhiteCrossYawStateRef.current = 1;
    return {
      extraYawRad: Math.PI / 180,
      extraERotationDeg: -60,
      extraPitchDeg: -10,
      slideId: slideId,
    };
  }

  if (nextIndex === 4 && slide8WhiteCrossYawStateRef.current === 1) {
    slide8WhiteCrossYawStateRef.current = 2;
    return {
      extraYawRad: 0,
      slideId: slideId,
    };
  }

  return null;
};

/**
 * Check if a yaw change should be applied for misaligned-green-white slide
 */
export const shouldChangeYawForMisalignedGreenWhite = (
  slideId: string | undefined,
  nextIndex: number,
  slide6YawChangedRef: MutableRefObject<boolean>,
): YawChangeConfig | null => {
  if (
    slideId !== "misaligned-green-white" ||
    nextIndex !== 1 ||
    slide6YawChangedRef.current
  ) {
    return null;
  }

  slide6YawChangedRef.current = true;
  return {
    extraYawRad: 0,
    slideId: slideId,
  };
};

/**
 * Check if a yaw change should be applied for flipped-misoriented-misaligned-green-white slide
 */
export const shouldChangeYawForFlippedMisalignedGreenWhite = (
  slideId: string | undefined,
  nextIndex: number,
  slide6YawChangedRef: MutableRefObject<boolean>,
): YawChangeConfig | null => {
  if (
    slideId !== "flipped-misoriented-misaligned-green-white" ||
    nextIndex !== 1 ||
    slide6YawChangedRef.current
  ) {
    return null;
  }

  slide6YawChangedRef.current = true;
  return {
    extraYawRad: 0,
    slideId: slideId,
  };
};

/**
 * Check if a yaw change should be applied for practice-setup-solution-6 slide
 */
export const shouldChangeYawForPracticeSetupSolution6 = (
  slideId: string | undefined,
  nextIndex: number,
  slide8YawChangedRef: MutableRefObject<boolean>,
): YawChangeConfig | null => {
  if (
    slideId !== "corner-move-to-correct" ||
    nextIndex !== 5 ||
    slide8YawChangedRef.current
  ) {
    return null;
  }

  slide8YawChangedRef.current = true;
  return {
    extraYawRad: 0,
    flipUpsideDown: true,
    extraERotationDeg: -60,
    extraPitchDeg: -10,
    slideId: slideId,
  };
};

/**
 * Check if a yaw change should be applied for practice-setup-solution-9 slide
 */
export const shouldChangeYawForPracticeSetupSolution9 = (
  slideId: string | undefined,
  nextIndex: number,
  yawStateRef: MutableRefObject<number>,
): YawChangeConfig | null => {
  if (slideId !== "corner-insert-two-pieces") {
    return null;
  }

  if (nextIndex === 1 && yawStateRef.current === 0) {
    yawStateRef.current = 1;
    return {
      extraYawRad: (Math.PI / 180) * (-30 + 120),
      flipUpsideDown: true,
      extraERotationDeg: 120,
      extraPitchDeg: -10,
      slideId: slideId,
    };
  }

  if (nextIndex === 6 && yawStateRef.current === 1) {
    yawStateRef.current = 2;
    return {
      extraYawRad: (Math.PI / 180) * 210,
      flipUpsideDown: true,
      extraERotationDeg: 180,
      extraPitchDeg: -10,
      slideId: slideId,
    };
  }

  return null;
};

export const shouldChangeYawForIntermediateWhiteCrossSlide8 = (
  slideId: string | undefined,
  nextIndex: number,
  yawStateRef: MutableRefObject<number>,
): YawChangeConfig | null => {
  if (slideId !== "two-edges-reposition-blue-front") {
    return null;
  }

  if (nextIndex === 1 && yawStateRef.current === 0) {
    yawStateRef.current = 1;
    return {
      extraYawRad: 0,
      flipUpsideDown: true,
      extraERotationDeg: -180,
      extraPitchDeg: 0,
      slideId,
    };
  }

  if (nextIndex === 2 && yawStateRef.current === 1) {
    yawStateRef.current = 2;
    return {
      extraYawRad: 0,
      flipUpsideDown: true,
      extraERotationDeg: -145,
      extraPitchDeg: -10,
      slideId,
    };
  }

  if (nextIndex === 3 && yawStateRef.current === 2) {
    yawStateRef.current = 3;
    return {
      extraYawRad: 0,
      flipUpsideDown: true,
      extraERotationDeg: -215,
      extraPitchDeg: -10,
      slideId,
    };
  }

  return null;
};

export const shouldChangeYawForIntermediateWhiteCrossSlide10 = (
  slideId: string | undefined,
  nextIndex: number,
  yawStateRef: MutableRefObject<number>,
): YawChangeConfig | null => {
  if (slideId !== "solve-blue-and-red-together") {
    return null;
  }

  if (nextIndex === 2 && yawStateRef.current === 0) {
    yawStateRef.current = 1;
    return {
      extraYawRad: 0,
      flipUpsideDown: true,
      extraERotationDeg: -145,
      extraPitchDeg: -10,
      slideId,
    };
  }

  return null;
};

export const shouldChangeYawForIntermediateWhiteCrossSlide11 = (
  slideId: string | undefined,
  nextIndex: number,
  yawStateRef: MutableRefObject<number>,
): YawChangeConfig | null => {
  if (slideId !== "solve-red-and-blue-together") {
    return null;
  }

  if (nextIndex === 1 && yawStateRef.current === 0) {
    yawStateRef.current = 1;
    return {
      extraYawRad: 0,
      flipUpsideDown: true,
      extraERotationDeg: -125,
      extraPitchDeg: -10,
      slideId,
    };
  }

  return null;
};

export const shouldChangeYawForIntermediateWhiteCrossSlide13 = (
  slideId: string | undefined,
  nextIndex: number,
  yawStateRef: MutableRefObject<number>,
): YawChangeConfig | null => {
  if (slideId !== "solve-green-and-orange-together") {
    return null;
  }

  if (nextIndex === 1 && yawStateRef.current === 0) {
    yawStateRef.current = 1;
    return {
      extraYawRad: 0,
      flipUpsideDown: true,
      extraERotationDeg: 30,
      extraPitchDeg: -10,
      slideId,
    };
  }

  return null;
};

/**
 * Check if a yaw change should be applied for second-layer-setup-solution slide
 */
export const shouldChangeYawForSecondLayerSetupSolution = (
  slideId: string | undefined,
  nextIndex: number,
  secondLayerSetupYawChangedRef: MutableRefObject<boolean>,
): YawChangeConfig | null => {
  if (
    slideId !== "edge-insert-left" ||
    nextIndex !== 5 ||
    secondLayerSetupYawChangedRef.current
  ) {
    return null;
  }

  secondLayerSetupYawChangedRef.current = true;
  return {
    extraYawRad: 0,
    flipUpsideDown: true,
    extraERotationDeg: -60,
    extraPitchDeg: -10,
    slideId: slideId,
  };
};

/**
 * Check if a yaw change should be applied for second-layer-setup-solution-2 slide
 */
export const shouldChangeYawForSecondLayerSetupSolution2 = (
  slideId: string | undefined,
  nextIndex: number,
  secondLayerSetup2YawChangedRef: MutableRefObject<boolean>,
): YawChangeConfig | null => {
  if (
    slideId !== "edge-insert-right" ||
    nextIndex !== 5 ||
    secondLayerSetup2YawChangedRef.current
  ) {
    return null;
  }

  secondLayerSetup2YawChangedRef.current = true;
  return {
    extraYawRad: 0,
    flipUpsideDown: true,
    extraERotationDeg: -30,
    extraPitchDeg: -10,
    slideId: slideId,
  };
};

/**
 * Check if a yaw change should be applied for second-layer-setup-solution-3 slide
 */
export const shouldChangeYawForSecondLayerSetupSolution3 = (
  slideId: string | undefined,
  nextIndex: number,
  secondLayerSetup3YawChangedRef: MutableRefObject<number>,
): YawChangeConfig | null => {
  if (slideId !== "edge-remove-reinsert") {
    return null;
  }

  if (nextIndex === 5 && secondLayerSetup3YawChangedRef.current === 0) {
    secondLayerSetup3YawChangedRef.current = 1;
    return {
      extraYawRad: 0,
      flipUpsideDown: true,
      extraERotationDeg: 60,
      extraPitchDeg: -10,
      slideId: slideId,
    };
  }

  if (nextIndex === 10 && secondLayerSetup3YawChangedRef.current === 1) {
    secondLayerSetup3YawChangedRef.current = 2;
    return {
      extraYawRad: (Math.PI / 180) * -90,
      flipUpsideDown: true,
      extraERotationDeg: 210,
      extraPitchDeg: -10,
      slideId: slideId,
    };
  }

  if (nextIndex === 15 && secondLayerSetup3YawChangedRef.current === 2) {
    secondLayerSetup3YawChangedRef.current = 3;
    return {
      extraYawRad: 0,
      flipUpsideDown: true,
      extraERotationDeg: -30,
      extraPitchDeg: -10,
      slideId: slideId,
    };
  }

  return null;
};

/**
 * Check if a yaw change should be applied for second-layer-setup-solution-4 slide
 */
export const shouldChangeYawForSecondLayerSetupSolution4 = (
  slideId: string | undefined,
  nextIndex: number,
  secondLayerSetup4YawChangedRef: MutableRefObject<number>,
): YawChangeConfig | null => {
  if (slideId !== "edge-flipped-in-position") {
    return null;
  }

  if (nextIndex === 5 && secondLayerSetup4YawChangedRef.current < 5) {
    secondLayerSetup4YawChangedRef.current = 5;
    return {
      extraYawRad: 0,
      flipUpsideDown: true,
      extraERotationDeg: -30,
      extraPitchDeg: -10,
      slideId: slideId,
    };
  }

  if (nextIndex === 10 && secondLayerSetup4YawChangedRef.current < 10) {
    secondLayerSetup4YawChangedRef.current = 10;
    return {
      extraYawRad: 0,
      flipUpsideDown: true,
      extraERotationDeg: -60,
      extraPitchDeg: -10,
      slideId: slideId,
    };
  }

  if (nextIndex === 15 && secondLayerSetup4YawChangedRef.current < 15) {
    secondLayerSetup4YawChangedRef.current = 15;
    return {
      extraYawRad: 0,
      flipUpsideDown: true,
      extraERotationDeg: -30,
      extraPitchDeg: -10,
      slideId: slideId,
    };
  }

  return null;
};

/**
 * Check if a yaw change should be applied for yellow-edges-solution-2 slide
 */
export const shouldChangeYawForYellowEdgesSolution2 = (
  slideId: string | undefined,
  nextIndex: number,
  yellowEdges2YawChangedRef: MutableRefObject<boolean>,
): YawChangeConfig | null => {
  if (
    slideId !== "yellow-edges-one-correct" ||
    nextIndex !== 1 ||
    yellowEdges2YawChangedRef.current
  ) {
    return null;
  }

  yellowEdges2YawChangedRef.current = true;
  return {
    extraYawRad: (Math.PI / 180) * -45,
    flipUpsideDown: true,
    extraERotationDeg: -45,
    slideId: slideId,
  };
};

/**
 * Check if a yaw change should be applied for yellow-edges-solution-3 slide
 */
export const shouldChangeYawForYellowEdgesSolution3 = (
  slideId: string | undefined,
  nextIndex: number,
  yellowEdges3YawChangedRef: MutableRefObject<boolean>,
): YawChangeConfig | null => {
  if (
    slideId !== "yellow-edges-zero-correct" ||
    nextIndex !== 1 ||
    yellowEdges3YawChangedRef.current
  ) {
    return null;
  }

  yellowEdges3YawChangedRef.current = true;
  return {
    extraYawRad: (Math.PI / 180) * 135,
    flipUpsideDown: true,
    extraERotationDeg: -45,
    slideId: slideId,
  };
};

/**
 * Check if a yaw change should be applied for yellow-edges-solution-4 slide
 */
export const shouldChangeYawForYellowEdgesSolution4 = (
  slideId: string | undefined,
  nextIndex: number,
  yellowEdges4YawChangedRef: MutableRefObject<boolean>,
): YawChangeConfig | null => {
  if (
    slideId !== "yellow-edges-two-opposite" ||
    nextIndex !== 7 ||
    yellowEdges4YawChangedRef.current
  ) {
    return null;
  }

  yellowEdges4YawChangedRef.current = true;
  return {
    extraYawRad: (Math.PI / 180) * -90,
    flipUpsideDown: true,
    extraERotationDeg: 90,
    slideId: slideId,
  };
};

/**
 * Check if a yaw change should be applied for yellow-corners-solution-2 slide
 */
export const shouldChangeYawForYellowCornersSolution2 = (
  slideId: string | undefined,
  nextIndex: number,
  yellowCorners2YawChangedRef: MutableRefObject<boolean>,
): YawChangeConfig | null => {
  if (
    slideId !== "yellow-corners-zero-correct" ||
    nextIndex !== 8 ||
    yellowCorners2YawChangedRef.current
  ) {
    return null;
  }

  yellowCorners2YawChangedRef.current = true;
  return {
    extraYawRad: (Math.PI / 180) * 135,
    flipUpsideDown: true,
    extraERotationDeg: -45,
    slideId: slideId,
  };
};

/**
 * Check if a yaw change should be applied for yellow-corners-solution-3 slide
 */
export const shouldChangeYawForYellowCornersSolution3 = (
  slideId: string | undefined,
  nextIndex: number,
  yellowCorners3YawChangedRef: MutableRefObject<boolean>,
): YawChangeConfig | null => {
  if (
    slideId !== "yellow-corners-zero-repeated" ||
    nextIndex !== 8 ||
    yellowCorners3YawChangedRef.current
  ) {
    return null;
  }

  yellowCorners3YawChangedRef.current = true;
  return {
    extraYawRad: (Math.PI / 180) * 225,
    flipUpsideDown: true,
    extraERotationDeg: -45,
    slideId: slideId,
  };
};

/**
 * Check if a yaw change should be applied for orient-two-corners slide
 */
export const shouldChangeYawForOrientTwoCorners = (
  slideId: string | undefined,
  nextIndex: number,
  orientTwoCornersYawChangedRef: MutableRefObject<number>,
): YawChangeConfig | null => {
  if (slideId !== "orient-two-corners") {
    return null;
  }

  if (nextIndex === 16 && orientTwoCornersYawChangedRef.current < 16) {
    orientTwoCornersYawChangedRef.current = 16;
    return {
      extraYawRad: 0,
      flipUpsideDown: false,
      extraERotationDeg: -30,
      extraPitchDeg: -60,
      slideId: slideId,
    };
  }

  if (nextIndex === 17 && orientTwoCornersYawChangedRef.current < 17) {
    orientTwoCornersYawChangedRef.current = 17;
    return {
      extraYawRad: 0,
      flipUpsideDown: false,
      extraERotationDeg: -30,
      extraPitchDeg: -10,
      slideId: slideId,
    };
  }

  if (nextIndex === 25 && orientTwoCornersYawChangedRef.current < 25) {
    orientTwoCornersYawChangedRef.current = 25;
    return {
      extraYawRad: 0,
      flipUpsideDown: false,
      extraERotationDeg: -30,
      extraPitchDeg: -60,
      slideId: slideId,
    };
  }

  if (nextIndex === 26 && orientTwoCornersYawChangedRef.current < 26) {
    orientTwoCornersYawChangedRef.current = 26;
    return {
      extraYawRad: 0,
      flipUpsideDown: false,
      extraERotationDeg: -45,
      extraPitchDeg: 0,
      slideId: slideId,
    };
  }

  return null;
};

/**
 * Check if a yaw change should be applied for orient-three-corners slide
 */
export const shouldChangeYawForOrientThreeCorners = (
  slideId: string | undefined,
  nextIndex: number,
  orientThreeCornersYawChangedRef: MutableRefObject<number>,
): YawChangeConfig | null => {
  if (slideId !== "orient-three-corners") {
    return null;
  }

  if (nextIndex === 8 && orientThreeCornersYawChangedRef.current < 8) {
    orientThreeCornersYawChangedRef.current = 8;
    return {
      extraYawRad: 0,
      flipUpsideDown: false,
      extraERotationDeg: -30,
      extraPitchDeg: -60,
      slideId: slideId,
    };
  }

  if (nextIndex === 9 && orientThreeCornersYawChangedRef.current < 9) {
    orientThreeCornersYawChangedRef.current = 9;
    return {
      extraYawRad: 0,
      flipUpsideDown: false,
      extraERotationDeg: -30,
      extraPitchDeg: -10,
      slideId: slideId,
    };
  }

  if (nextIndex === 17 && orientThreeCornersYawChangedRef.current < 17) {
    orientThreeCornersYawChangedRef.current = 17;
    return {
      extraYawRad: 0,
      flipUpsideDown: false,
      extraERotationDeg: -30,
      extraPitchDeg: -60,
      slideId: slideId,
    };
  }

  if (nextIndex === 18 && orientThreeCornersYawChangedRef.current < 18) {
    orientThreeCornersYawChangedRef.current = 18;
    return {
      extraYawRad: 0,
      flipUpsideDown: false,
      extraERotationDeg: -30,
      extraPitchDeg: -10,
      slideId: slideId,
    };
  }

  if (nextIndex === 26 && orientThreeCornersYawChangedRef.current < 26) {
    orientThreeCornersYawChangedRef.current = 26;
    return {
      extraYawRad: 0,
      flipUpsideDown: false,
      extraERotationDeg: -30,
      extraPitchDeg: -60,
      slideId: slideId,
    };
  }

  if (nextIndex === 27 && orientThreeCornersYawChangedRef.current < 27) {
    orientThreeCornersYawChangedRef.current = 27;
    return {
      extraYawRad: 0,
      flipUpsideDown: false,
      extraERotationDeg: -45,
      extraPitchDeg: 0,
      slideId: slideId,
    };
  }

  return null;
};

/**
 * Check if a yaw change should be applied for orient-four-corners slide
 */
export const shouldChangeYawForOrientFourCorners = (
  slideId: string | undefined,
  nextIndex: number,
  orientFourCornersYawChangedRef: MutableRefObject<number>,
): YawChangeConfig | null => {
  if (slideId !== "orient-four-corners") {
    return null;
  }

  if (nextIndex === 16 && orientFourCornersYawChangedRef.current < 16) {
    orientFourCornersYawChangedRef.current = 16;
    return {
      extraYawRad: 0,
      flipUpsideDown: false,
      extraERotationDeg: -30,
      extraPitchDeg: -60,
      slideId: slideId,
    };
  }

  if (nextIndex === 17 && orientFourCornersYawChangedRef.current < 17) {
    orientFourCornersYawChangedRef.current = 17;
    return {
      extraYawRad: 0,
      flipUpsideDown: false,
      extraERotationDeg: -30,
      extraPitchDeg: -10,
      slideId: slideId,
    };
  }

  if (nextIndex === 25 && orientFourCornersYawChangedRef.current < 25) {
    orientFourCornersYawChangedRef.current = 25;
    return {
      extraYawRad: 0,
      flipUpsideDown: false,
      extraERotationDeg: -30,
      extraPitchDeg: -60,
      slideId: slideId,
    };
  }

  if (nextIndex === 26 && orientFourCornersYawChangedRef.current < 26) {
    orientFourCornersYawChangedRef.current = 26;
    return {
      extraYawRad: 0,
      flipUpsideDown: false,
      extraERotationDeg: -30,
      extraPitchDeg: -10,
      slideId: slideId,
    };
  }

  if (nextIndex === 34 && orientFourCornersYawChangedRef.current < 34) {
    orientFourCornersYawChangedRef.current = 34;
    return {
      extraYawRad: 0,
      flipUpsideDown: false,
      extraERotationDeg: -30,
      extraPitchDeg: -60,
      slideId: slideId,
    };
  }

  if (nextIndex === 35 && orientFourCornersYawChangedRef.current < 35) {
    orientFourCornersYawChangedRef.current = 35;
    return {
      extraYawRad: 0,
      flipUpsideDown: false,
      extraERotationDeg: -30,
      extraPitchDeg: -10,
      slideId: slideId,
    };
  }

  if (nextIndex === 51 && orientFourCornersYawChangedRef.current < 51) {
    orientFourCornersYawChangedRef.current = 51;
    return {
      extraYawRad: 0,
      flipUpsideDown: false,
      extraERotationDeg: -30,
      extraPitchDeg: -60,
      slideId: slideId,
    };
  }

  if (nextIndex === 52 && orientFourCornersYawChangedRef.current < 52) {
    orientFourCornersYawChangedRef.current = 52;
    return {
      extraYawRad: 0,
      flipUpsideDown: false,
      extraERotationDeg: -45,
      extraPitchDeg: 0,
      slideId: slideId,
    };
  }

  return null;
};

/**
 * Main function to check and apply yaw changes based on slide and progress
 */
export const checkAndApplyYawChange = (
  slideId: string | undefined,
  lessonId: string,
  nextIndex: number,
  orbitControlsRef: RefObject<OrbitControlsInstance>,
  cubeViewRef: RefObject<RubiksCube3DHandle | null>,
  cubeRef: RefObject<CubeJSWrapper>,
  yawStateRefs: {
    slide8WhiteCrossYawStateRef?: MutableRefObject<number>;
    slide6YawChangedRef?: MutableRefObject<boolean>;
    slide8YawChangedRef?: MutableRefObject<boolean>;
    secondLayerSetupYawChangedRef?: MutableRefObject<boolean>;
    secondLayerSetup2YawChangedRef?: MutableRefObject<boolean>;
    secondLayerSetup3YawChangedRef?: MutableRefObject<number>;
    secondLayerSetup4YawChangedRef?: MutableRefObject<number>;
    yellowEdges2YawChangedRef?: MutableRefObject<boolean>;
    yellowEdges3YawChangedRef?: MutableRefObject<boolean>;
    yellowEdges4YawChangedRef?: MutableRefObject<boolean>;
    yellowCorners2YawChangedRef?: MutableRefObject<boolean>;
    yellowCorners3YawChangedRef?: MutableRefObject<boolean>;
    orientTwoCornersYawChangedRef?: MutableRefObject<number>;
    orientThreeCornersYawChangedRef?: MutableRefObject<number>;
    orientFourCornersYawChangedRef?: MutableRefObject<number>;
    practiceSetupSolution9YawChangedRef?: MutableRefObject<number>;
    intermediateWhiteCrossSlide8YawStateRef?: MutableRefObject<number>;
    intermediateWhiteCrossSlide11YawStateRef?: MutableRefObject<number>;
    intermediateWhiteCrossSlide13YawStateRef?: MutableRefObject<number>;
  },
): boolean => {
  if (!slideId) return false;

  let config: YawChangeConfig | null = null;

  config =
    shouldChangeYawForMidlayerGreenWhiteExtraction(
      slideId,
      lessonId,
      nextIndex,
      yawStateRefs.slide8WhiteCrossYawStateRef!,
    ) ||
    shouldChangeYawForMisalignedGreenWhite(
      slideId,
      nextIndex,
      yawStateRefs.slide6YawChangedRef!,
    ) ||
    shouldChangeYawForFlippedMisalignedGreenWhite(
      slideId,
      nextIndex,
      yawStateRefs.slide6YawChangedRef!,
    ) ||
    shouldChangeYawForPracticeSetupSolution6(
      slideId,
      nextIndex,
      yawStateRefs.slide8YawChangedRef!,
    ) ||
    shouldChangeYawForSecondLayerSetupSolution(
      slideId,
      nextIndex,
      yawStateRefs.secondLayerSetupYawChangedRef!,
    ) ||
    shouldChangeYawForSecondLayerSetupSolution2(
      slideId,
      nextIndex,
      yawStateRefs.secondLayerSetup2YawChangedRef!,
    ) ||
    shouldChangeYawForSecondLayerSetupSolution3(
      slideId,
      nextIndex,
      yawStateRefs.secondLayerSetup3YawChangedRef!,
    ) ||
    shouldChangeYawForSecondLayerSetupSolution4(
      slideId,
      nextIndex,
      yawStateRefs.secondLayerSetup4YawChangedRef!,
    ) ||
    shouldChangeYawForYellowEdgesSolution2(
      slideId,
      nextIndex,
      yawStateRefs.yellowEdges2YawChangedRef!,
    ) ||
    shouldChangeYawForYellowEdgesSolution3(
      slideId,
      nextIndex,
      yawStateRefs.yellowEdges3YawChangedRef!,
    ) ||
    shouldChangeYawForYellowEdgesSolution4(
      slideId,
      nextIndex,
      yawStateRefs.yellowEdges4YawChangedRef!,
    ) ||
    shouldChangeYawForYellowCornersSolution2(
      slideId,
      nextIndex,
      yawStateRefs.yellowCorners2YawChangedRef!,
    ) ||
    shouldChangeYawForYellowCornersSolution3(
      slideId,
      nextIndex,
      yawStateRefs.yellowCorners3YawChangedRef!,
    ) ||
    shouldChangeYawForOrientTwoCorners(
      slideId,
      nextIndex,
      yawStateRefs.orientTwoCornersYawChangedRef!,
    ) ||
    shouldChangeYawForOrientThreeCorners(
      slideId,
      nextIndex,
      yawStateRefs.orientThreeCornersYawChangedRef!,
    ) ||
    shouldChangeYawForOrientFourCorners(
      slideId,
      nextIndex,
      yawStateRefs.orientFourCornersYawChangedRef!,
    ) ||
    shouldChangeYawForPracticeSetupSolution9(
      slideId,
      nextIndex,
      yawStateRefs.practiceSetupSolution9YawChangedRef!,
    ) ||
    shouldChangeYawForIntermediateWhiteCrossSlide8(
      slideId,
      nextIndex,
      yawStateRefs.intermediateWhiteCrossSlide8YawStateRef!,
    ) ||
    shouldChangeYawForIntermediateWhiteCrossSlide10(
      slideId,
      nextIndex,
      yawStateRefs.intermediateWhiteCrossSlide8YawStateRef!,
    ) ||
    shouldChangeYawForIntermediateWhiteCrossSlide11(
      slideId,
      nextIndex,
      yawStateRefs.intermediateWhiteCrossSlide11YawStateRef!,
    ) ||
    shouldChangeYawForIntermediateWhiteCrossSlide13(
      slideId,
      nextIndex,
      yawStateRefs.intermediateWhiteCrossSlide13YawStateRef!,
    );

  if (config) {
    applyYawChange(orbitControlsRef, cubeViewRef, cubeRef, config);
    return true;
  }

  return false;
};
