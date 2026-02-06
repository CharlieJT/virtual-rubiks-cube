import { useCallback } from "react";
import type { RubiksCube3DHandle } from "@components/RubiksCube3D/types";
import {
  isPracticeSlide as checkIsPracticeSlide,
  isRecapSlide as checkIsRecapSlide,
} from "@components/tutorials/consts/tutorialSlideConfig";

interface UseTutorialPointerHandlerParams {
  isTouchDevice: boolean;
  setInteractiveDpr: () => void;
  hasInteractedGloballyRef: React.RefObject<boolean>;
  activeSlideId: string | undefined;
  activeSlideAllowFaceMoves?: boolean;
  practiceCompleted: boolean;
  fixCompleted: boolean;
  cubeViewRef: React.RefObject<RubiksCube3DHandle | null>;
}

export const useTutorialPointerHandler = ({
  isTouchDevice,
  setInteractiveDpr,
  hasInteractedGloballyRef,
  activeSlideId,
  activeSlideAllowFaceMoves,
  practiceCompleted,
  fixCompleted,
  cubeViewRef,
}: UseTutorialPointerHandlerParams) => {
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isTouchDevice) setInteractiveDpr();
      if (!hasInteractedGloballyRef.current) {
        hasInteractedGloballyRef.current = true;
      }
      const isPracticeSlideValue = checkIsPracticeSlide(activeSlideId);
      const isRecapSlideValue = checkIsRecapSlide(activeSlideId);
      const dragAllowed =
        !!activeSlideAllowFaceMoves &&
        !(isPracticeSlideValue && practiceCompleted) &&
        !fixCompleted &&
        !isRecapSlideValue;
      if (dragAllowed) {
        cubeViewRef.current?.handlePointerDown(e);
      }
    },
    [
      isTouchDevice,
      setInteractiveDpr,
      hasInteractedGloballyRef,
      activeSlideId,
      activeSlideAllowFaceMoves,
      practiceCompleted,
      fixCompleted,
      cubeViewRef,
    ]
  );

  const handlePointerMove = useCallback(() => {
    if (isTouchDevice) setInteractiveDpr();
  }, [isTouchDevice, setInteractiveDpr]);

  const handlePointerUp = useCallback(() => {
    if (isTouchDevice) setInteractiveDpr();
    cubeViewRef.current?.handlePointerUp?.();
  }, [isTouchDevice, setInteractiveDpr, cubeViewRef]);

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
};

