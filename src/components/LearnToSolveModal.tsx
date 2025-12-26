import Modal from "@components/UI/Modal";
import TutorialIndex from "@components/TutorialIndex";

interface LearnToSolveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTutorial: (lessonId: string) => void;
}

const LearnToSolveModal = ({
  isOpen,
  onClose,
  onStartTutorial,
}: LearnToSolveModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <TutorialIndex onSelectLesson={onStartTutorial} onBack={onClose} />
    </Modal>
  );
};

export default LearnToSolveModal;
