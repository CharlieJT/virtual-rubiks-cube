import TutorialPage from "../TutorialPage";

interface WhiteCornersLessonProps {
  onBack: () => void;
}

export default function WhiteCornersLesson({
  onBack,
}: WhiteCornersLessonProps) {
  return (
    <TutorialPage
      lessonId="white-corners"
      title="White Corners"
      onBack={onBack}
    />
  );
}
