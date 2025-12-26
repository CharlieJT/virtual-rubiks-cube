import TutorialPage from "../TutorialPage";

interface OrientYellowCornersLessonProps {
  onBack: () => void;
}

export default function OrientYellowCornersLesson({
  onBack,
}: OrientYellowCornersLessonProps) {
  return (
    <TutorialPage
      lessonId="orient-yellow-corners"
      title="Orient Yellow Corners"
      onBack={onBack}
    />
  );
}
