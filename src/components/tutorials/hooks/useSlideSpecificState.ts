import { useState, useEffect, useRef } from "react";

export interface UseSlideSpecificStateReturn {
  showSecondSequenceYellowEdges2: boolean;
  setShowSecondSequenceYellowEdges2: React.Dispatch<React.SetStateAction<boolean>>;
  secondSequenceYellowEdges2Locked: boolean;
  setSecondSequenceYellowEdges2Locked: React.Dispatch<React.SetStateAction<boolean>>;
  slide8YawChangedRef: React.RefObject<boolean>;
  slide6YawChangedRef: React.RefObject<boolean>;
  slide8WhiteCrossYawStateRef: React.RefObject<number>;
  secondLayerSetupYawChangedRef: React.RefObject<boolean>;
  secondLayerSetup2YawChangedRef: React.RefObject<boolean>;
  secondLayerSetup3YawChangedRef: React.RefObject<number>;
  secondLayerSetup4YawChangedRef: React.RefObject<number>;
  yellowEdges2YawChangedRef: React.RefObject<boolean>;
  yellowEdges3YawChangedRef: React.RefObject<boolean>;
  yellowEdges4YawChangedRef: React.RefObject<boolean>;
  yellowCorners2YawChangedRef: React.RefObject<boolean>;
  yellowCorners3YawChangedRef: React.RefObject<boolean>;
  orientTwoCornersYawChangedRef: React.RefObject<number>;
  orientThreeCornersYawChangedRef: React.RefObject<number>;
  orientFourCornersYawChangedRef: React.RefObject<number>;
  practiceSetupSolution9YawChangedRef: React.RefObject<number>;
  resetSlideSpecificState: () => void;
}

export const useSlideSpecificState = (activeSlideId: string | undefined): UseSlideSpecificStateReturn => {
  const [showSecondSequenceYellowEdges2, setShowSecondSequenceYellowEdges2] =
    useState(false);
  const [
    secondSequenceYellowEdges2Locked,
    setSecondSequenceYellowEdges2Locked,
  ] = useState(false);

  const slide8YawChangedRef = useRef(false);
  const slide6YawChangedRef = useRef(false);
  const slide8WhiteCrossYawStateRef = useRef(0);
  const secondLayerSetupYawChangedRef = useRef(false);
  const secondLayerSetup2YawChangedRef = useRef(false);
  const secondLayerSetup3YawChangedRef = useRef(0);
  const secondLayerSetup4YawChangedRef = useRef(0);
  const yellowEdges2YawChangedRef = useRef(false);
  const yellowEdges3YawChangedRef = useRef(false);
  const yellowEdges4YawChangedRef = useRef(false);
  const yellowCorners2YawChangedRef = useRef(false);
  const yellowCorners3YawChangedRef = useRef(false);
  const orientTwoCornersYawChangedRef = useRef(0);
  const orientThreeCornersYawChangedRef = useRef(0);
  const orientFourCornersYawChangedRef = useRef(0);
  const practiceSetupSolution9YawChangedRef = useRef(0);

  useEffect(() => {
    setShowSecondSequenceYellowEdges2(false);
    setSecondSequenceYellowEdges2Locked(false);
    slide8YawChangedRef.current = false;
    slide6YawChangedRef.current = false;
    slide8WhiteCrossYawStateRef.current = 0;
    secondLayerSetupYawChangedRef.current = false;
    secondLayerSetup2YawChangedRef.current = false;
    secondLayerSetup3YawChangedRef.current = 0;
    secondLayerSetup4YawChangedRef.current = 0;
    yellowEdges2YawChangedRef.current = false;
    yellowEdges3YawChangedRef.current = false;
    yellowEdges4YawChangedRef.current = false;
    yellowCorners2YawChangedRef.current = false;
    yellowCorners3YawChangedRef.current = false;
    orientTwoCornersYawChangedRef.current = 0;
    orientThreeCornersYawChangedRef.current = 0;
    orientFourCornersYawChangedRef.current = 0;
    practiceSetupSolution9YawChangedRef.current = 0;
  }, [activeSlideId]);

  const resetSlideSpecificState = (): void => {
    setShowSecondSequenceYellowEdges2(false);
    setSecondSequenceYellowEdges2Locked(false);
    slide8YawChangedRef.current = false;
    slide6YawChangedRef.current = false;
    slide8WhiteCrossYawStateRef.current = 0;
    secondLayerSetupYawChangedRef.current = false;
    secondLayerSetup2YawChangedRef.current = false;
    secondLayerSetup3YawChangedRef.current = 0;
    secondLayerSetup4YawChangedRef.current = 0;
    yellowEdges2YawChangedRef.current = false;
    yellowEdges3YawChangedRef.current = false;
    yellowEdges4YawChangedRef.current = false;
    yellowCorners2YawChangedRef.current = false;
    yellowCorners3YawChangedRef.current = false;
    orientTwoCornersYawChangedRef.current = 0;
    orientThreeCornersYawChangedRef.current = 0;
    orientFourCornersYawChangedRef.current = 0;
    practiceSetupSolution9YawChangedRef.current = 0;
  };

  return {
    showSecondSequenceYellowEdges2,
    setShowSecondSequenceYellowEdges2,
    secondSequenceYellowEdges2Locked,
    setSecondSequenceYellowEdges2Locked,
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
    resetSlideSpecificState,
  };
};
