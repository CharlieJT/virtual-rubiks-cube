import { useEffect, useRef } from "react";
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

const useSlideInteractionRules = ({
  activeSlide,
  isResetting,
  practiceCompleted,
  setInputDisabled,
  setOrbitControlsEnabled,
  handleOrbitControlsChange,
}: UseSlideInteractionRulesParams) => {
  const previousSlideIdRef = useRef<string | undefined>(undefined);
  
  useEffect(() => {
    if (!activeSlide) return;
    
    // Skip entirely on first mount - useSlideTransition handles initial setup
    if (previousSlideIdRef.current === undefined) {
      previousSlideIdRef.current = activeSlide.id;
      return;
    }
    
    // Only run when slide actually changes (not on first mount)
    if (previousSlideIdRef.current === activeSlide.id) {
      return;
    }
    
    previousSlideIdRef.current = activeSlide.id;
    
    const isPracticeSlide10_11_12 = checkIsPracticeSlide(activeSlide.id);

    if (activeSlide.id === "find-green-white") {
      setInputDisabled(false);
      setOrbitControlsEnabled(true);
      handleOrbitControlsChange(true);
    } else if (isPracticeSlide10_11_12 && practiceCompleted) {
      setInputDisabled(true);
      setOrbitControlsEnabled(true);
      handleOrbitControlsChange(true);
    } else if (activeSlide.id === "mechanical-approach") {
      setInputDisabled(true);
      setOrbitControlsEnabled(true);
      handleOrbitControlsChange(true);
    } else {
      const shouldDisableInput =
        !activeSlide.allowFaceMoves ||
        (isPracticeSlide10_11_12 && practiceCompleted);

      setInputDisabled(shouldDisableInput);
      setOrbitControlsEnabled(true);
      handleOrbitControlsChange(true);
    }
  }, [activeSlide?.id, isResetting, practiceCompleted, setInputDisabled, setOrbitControlsEnabled, handleOrbitControlsChange]);
};

export default useSlideInteractionRules;

