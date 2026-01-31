import { useEffect, useMemo, useState } from "react";
import Modal from "@components/UI/Modal";
import LessonSelector from "@components/tutorials/LessonSelector";
import type { CustomWindowType } from "@/types/window";

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
  const initialLessonId = useMemo(() => {
    const backLessonId = (window as CustomWindowType).__tutorialBackLessonId;
    if (backLessonId) {
      // Clear it after reading
      delete (window as CustomWindowType).__tutorialBackLessonId;
      return backLessonId;
    }
    return propInitialLessonId;
  }, [propInitialLessonId, isOpen]);

  // Key to force remount and reset state when modal closes
  const [modalKey, setModalKey] = useState(0);

  // Reset scroll and remount component when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Small delay to ensure modal content is still mounted
      setTimeout(() => {
        const modalScroll = document.querySelector(".modal-scroll");
        if (modalScroll) {
          // Find the actual scrollable container (parent with overflow-y-auto)
          const scrollContainer = modalScroll.parentElement;
          if (scrollContainer && scrollContainer.classList.contains("overflow-y-auto")) {
            scrollContainer.scrollTop = 0;
          } else {
            // Fallback: traverse up to find scrollable parent
            let parent = modalScroll.parentElement;
            while (parent) {
              const style = window.getComputedStyle(parent);
              if (style.overflowY === "auto" || style.overflowY === "scroll") {
                parent.scrollTop = 0;
                break;
              }
              parent = parent.parentElement;
            }
          }
        }
        // Clear stored scroll positions when modal closes
        delete (window as CustomWindowType).__lessonSelectorScrollPositions;
        // Force remount to reset all state
        setModalKey((prev) => prev + 1);
      }, 100);
    } else {
      // Reset key when modal opens fresh (not from a lesson back)
      if (!initialLessonId) {
        // Clear stored scroll positions when opening fresh
        delete (window as CustomWindowType).__lessonSelectorScrollPositions;
        setModalKey((prev) => prev + 1);
      }
    }
  }, [isOpen, initialLessonId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" fullHeight={true}>
      <LessonSelector
        key={modalKey}
        onSelectLesson={onStartTutorial}
        initialLessonId={initialLessonId}
      />
    </Modal>
  );
};

export default LearnToSolveModal;
