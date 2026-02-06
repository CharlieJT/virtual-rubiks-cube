import { useEffect, useMemo, useRef, useState } from "react";
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
  const windowLessonId = (window as CustomWindowType).__tutorialBackLessonId;
  
  const initialLessonId = useMemo(() => {
    if (windowLessonId) {
      return windowLessonId;
    }
    return propInitialLessonId;
  }, [propInitialLessonId, windowLessonId]);
  
  useEffect(() => {
    if (!isOpen && (window as CustomWindowType).__tutorialBackLessonId) {
      delete (window as CustomWindowType).__tutorialBackLessonId;
    }
  }, [isOpen]);

  // Key to force remount and reset state when modal closes
  const [modalKey, setModalKey] = useState(0);

  const [blockInteractions, setBlockInteractions] = useState(() => {
    return !!initialLessonId;
  });

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
  
  useEffect(() => {
    if (initialLessonId || windowLessonId) {
      setBlockInteractions(true);
      blockRef.current = true;
      const timeout = setTimeout(() => {
        setBlockInteractions(false);
        blockRef.current = false;
      }, 500);
      return () => clearTimeout(timeout);
    } else {
      setBlockInteractions(false);
      blockRef.current = false;
    }
  }, [initialLessonId, windowLessonId]);

  const shouldBlockNow = !!initialLessonId;
  const blockRef = useRef(shouldBlockNow);
  if (shouldBlockNow) {
    blockRef.current = true;
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="" 
      fullHeight={true}
      disableBackdropClick={shouldBlockNow || blockInteractions || blockRef.current}
      disableTransition={!!initialLessonId}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
        }}
      >
      <LessonSelector
          key={modalKey}
        onSelectLesson={onStartTutorial}
        initialLessonId={initialLessonId}
      />
      </div>
    </Modal>
  );
};

export default LearnToSolveModal;
