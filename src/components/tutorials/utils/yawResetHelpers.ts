/**
 * Resets all yaw change refs for a given slide ID
 */
export const resetYawRefsForSlide = (
  slideId: string | undefined,
  slideSpecificState: ReturnType<typeof import("@components/tutorials/hooks/useSlideSpecificState").useSlideSpecificState>
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
  } = slideSpecificState;

  switch (slideId) {
    case "yellow-edges-solution-2":
      yellowEdges2YawChangedRef.current = false;
      break;
    case "yellow-edges-solution-3":
      yellowEdges3YawChangedRef.current = false;
      break;
    case "yellow-edges-solution-4":
      yellowEdges4YawChangedRef.current = false;
      break;
    case "yellow-corners-solution-2":
      yellowCorners2YawChangedRef.current = false;
      break;
    case "yellow-corners-solution-3":
      yellowCorners3YawChangedRef.current = false;
      break;
    case "midlayer-green-white-extraction":
      slide8WhiteCrossYawStateRef.current = 0;
      break;
    case "misaligned-green-white":
    case "flipped-misoriented-misaligned-green-white":
      slide6YawChangedRef.current = false;
      break;
    case "practice-setup-solution-6":
      slide8YawChangedRef.current = false;
      break;
    case "second-layer-setup-solution":
      secondLayerSetupYawChangedRef.current = false;
      break;
    case "second-layer-setup-solution-2":
      secondLayerSetup2YawChangedRef.current = false;
      break;
    case "second-layer-setup-solution-3":
      secondLayerSetup3YawChangedRef.current = 0;
      break;
    case "second-layer-setup-solution-4":
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
    case "practice-setup-solution-9":
      practiceSetupSolution9YawChangedRef.current = 0;
      break;
  }
};
