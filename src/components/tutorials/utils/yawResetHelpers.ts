/**
 * Resets all yaw change refs for a given slide ID
 */
const resetYawRefsForSlide = (
  slideId: string | undefined,
  slideSpecificState: ReturnType<typeof import("@components/tutorials/hooks/useSlideSpecificState").default>
): void => {
  if (!slideId) return;

  const {
    slide8YawChangedRef,
    slide6YawChangedRef,
    slide8WhiteCrossYawStateRef,
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
  } = slideSpecificState;

  switch (slideId) {
    case "yellow-edges-one-correct":
      yellowEdges2YawChangedRef.current = false;
      break;
    case "yellow-edges-zero-correct":
      yellowEdges3YawChangedRef.current = false;
      break;
    case "yellow-edges-two-opposite":
      yellowEdges4YawChangedRef.current = false;
      break;
    case "yellow-corners-zero-correct":
      yellowCorners2YawChangedRef.current = false;
      break;
    case "yellow-corners-zero-repeated":
      yellowCorners3YawChangedRef.current = false;
      break;
    case "midlayer-green-white-extraction":
      slide8WhiteCrossYawStateRef.current = 0;
      break;
    case "misaligned-green-white":
    case "flipped-misoriented-misaligned-green-white":
      slide6YawChangedRef.current = false;
      break;
    case "corner-move-to-correct":
      slide8YawChangedRef.current = false;
      break;
    case "edge-insert-left":
      secondLayerSetupYawChangedRef.current = false;
      break;
    case "edge-insert-right":
      secondLayerSetup2YawChangedRef.current = false;
      break;
    case "edge-remove-reinsert":
      secondLayerSetup3YawChangedRef.current = 0;
      break;
    case "edge-flipped-in-position":
      secondLayerSetup4YawChangedRef.current = 0;
      break;
    case "orient-two-corners":
      orientTwoCornersYawChangedRef.current = 0;
      break;
    case "orient-three-corners":
      orientThreeCornersYawChangedRef.current = 0;
      break;
    case "orient-four-corners":
      orientFourCornersYawChangedRef.current = 0;
      break;
    case "corner-insert-two-pieces":
      practiceSetupSolution9YawChangedRef.current = 0;
      break;
    case "two-edges-reposition-blue-front":
    case "solve-blue-and-red-together":
      intermediateWhiteCrossSlide8YawStateRef.current = 0;
      break;
    case "solve-red-and-blue-together":
      intermediateWhiteCrossSlide11YawStateRef.current = 0;
      break;
    case "solve-green-and-orange-together":
      intermediateWhiteCrossSlide13YawStateRef.current = 0;
      break;
  }
};

export default resetYawRefsForSlide;
