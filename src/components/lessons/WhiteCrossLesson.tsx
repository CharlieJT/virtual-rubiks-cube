import TutorialPage from "../TutorialPage";

interface WhiteCrossLessonProps {
  onBack: () => void;
}

export default function WhiteCrossLesson({ onBack }: WhiteCrossLessonProps) {
  return (
    <TutorialPage lessonId="white-cross" title="White Cross" onBack={onBack} />
  );
}
