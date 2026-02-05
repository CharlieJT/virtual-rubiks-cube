import { useState } from "react";

const useUIState = () => {
  const [showBestTimesModal, setShowBestTimesModal] = useState(false);
  const [showLearnToSolveModal, setShowLearnToSolveModal] = useState(false);
  const [tutorialLessonId, setTutorialLessonId] = useState<string | null>(null);

  return {
    showBestTimesModal,
    setShowBestTimesModal,
    showLearnToSolveModal,
    setShowLearnToSolveModal,
    tutorialLessonId,
    setTutorialLessonId,
  };
};

export default useUIState;
