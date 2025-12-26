import TutorialPage from "../TutorialPage";

interface YellowCornersLessonProps {
  onBack: () => void;
}

export default function YellowCornersLesson({
  onBack,
}: YellowCornersLessonProps) {
  return (
    <TutorialPage
      lessonId="yellow-corners"
      title="Yellow Corners"
      onBack={onBack}
    />
  );
}
