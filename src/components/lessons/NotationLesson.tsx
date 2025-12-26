import TutorialPage from "../TutorialPage";

interface NotationLessonProps {
  onBack: () => void;
}

export default function NotationLesson({ onBack }: NotationLessonProps) {
  return <TutorialPage lessonId="notation" title="Notation" onBack={onBack} />;
}
