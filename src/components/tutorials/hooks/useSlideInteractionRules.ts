import { useEffect } from "react";
import { isPracticeSlide as checkIsPracticeSlide } from "@components/tutorials/consts/tutorialSlideConfig";
import type { Slide } from "@components/tutorials/slideDefinitions";

interface UseSlideInteractionRulesParams {
  activeSlide: Slide | undefined;
  isResetting: boolean;
  practiceCompleted: boolean;
  setInputDisabled: (disabled: boolean) => void;
  setOrbitControlsEnabled: (enabled: boolean) => void;
  handleOrbitControlsChange: (enabled: boolean) => void;
}

export const useSlideInteractionRules = ({
  activeSlide,
  isResetting,
  practiceCompleted,
  setInputDisabled,
  setOrbitControlsEnabled,
  handleOrbitControlsChange,
}: UseSlideInteractionRulesParams) => {
  useEffect(() => {
    if (!activeSlide) return;
    const isPracticeSlide10_11_12 = checkIsPracticeSlide(activeSlide.id);

    if (activeSlide.id === "find-green-white") {
      setInputDisabled(false);
      setOrbitControlsEnabled(true);
      handleOrbitControlsChange(true);
    } else if (isPracticeSlide10_11_12 && practiceCompleted) {
      setInputDisabled(true);
      setOrbitControlsEnabled(true);
    } else if (activeSlide.id === "mechanical-approach") {
      setInputDisabled(true);
      setOrbitControlsEnabled(true);
    } else {
      const shouldDisableInput =
        !activeSlide.allowFaceMoves ||
        (isPracticeSlide10_11_12 && practiceCompleted);

      setInputDisabled(shouldDisableInput);
      
      if (activeSlide.allowFaceMoves === false) {
        setOrbitControlsEnabled(false);
        handleOrbitControlsChange(false);
      } else {
        setOrbitControlsEnabled(true);
      }
    }
  }, [activeSlide, isResetting, practiceCompleted, setInputDisabled, setOrbitControlsEnabled, handleOrbitControlsChange]);
};

