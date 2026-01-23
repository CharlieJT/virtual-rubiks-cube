import React from "react";
import Modal from "@components/UI/Modal";
import TutorialIndex from "@components/TutorialIndex";

interface LearnToSolveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTutorial: (lessonId: string) => void;
  initialLessonId?: string;
}

const LearnToSolveModal = ({
  isOpen,
  onClose,
  onStartTutorial,
  initialLessonId: propInitialLessonId,
}: LearnToSolveModalProps) => {
  // Get initial lesson ID from window (set when navigating back from tutorial)
  const initialLessonId = React.useMemo(() => {
    const backLessonId = (window as any).__tutorialBackLessonId;
    if (backLessonId) {
      // Clear it after reading
      delete (window as any).__tutorialBackLessonId;
      return backLessonId;
    }
    return propInitialLessonId;
  }, [propInitialLessonId, isOpen]);

  // Reset scroll when modal closes (only if no initialLessonId, meaning it's a fresh open)
  React.useEffect(() => {
    if (!isOpen && !initialLessonId) {
      // Small delay to ensure modal content is still mounted
      setTimeout(() => {
        const scrollContainer = document.querySelector(".modal-scroll");
        if (scrollContainer) {
          scrollContainer.scrollTop = 0;
        }
      }, 100);
    }
  }, [isOpen, initialLessonId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" fullHeight={true}>
      <TutorialIndex
        onSelectLesson={onStartTutorial}
        initialLessonId={initialLessonId}
      />
    </Modal>
  );
};

export default LearnToSolveModal;
