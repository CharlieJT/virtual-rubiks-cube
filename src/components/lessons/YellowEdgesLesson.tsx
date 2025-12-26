import TutorialPage from "../TutorialPage";

interface YellowEdgesLessonProps {
  onBack: () => void;
}

export default function YellowEdgesLesson({ onBack }: YellowEdgesLessonProps) {
  return (
    <TutorialPage
      lessonId="yellow-edges"
      title="Yellow Edges"
      onBack={onBack}
    />
  );
}
