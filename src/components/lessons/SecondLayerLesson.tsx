import TutorialPage from "../TutorialPage";

interface SecondLayerLessonProps {
  onBack: () => void;
}

export default function SecondLayerLesson({ onBack }: SecondLayerLessonProps) {
  return (
    <TutorialPage
      lessonId="second-layer"
      title="Second Layer"
      onBack={onBack}
    />
  );
}
