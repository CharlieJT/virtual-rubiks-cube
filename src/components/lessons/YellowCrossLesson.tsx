import TutorialPage from "../TutorialPage";

interface YellowCrossLessonProps {
  onBack: () => void;
}

export default function YellowCrossLesson({ onBack }: YellowCrossLessonProps) {
  return (
    <TutorialPage
      lessonId="yellow-cross"
      title="Yellow Cross"
      onBack={onBack}
    />
  );
}
