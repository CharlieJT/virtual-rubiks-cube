import TutorialPage from "../TutorialPage";

interface HowRubiksCubeWorksLessonProps {
  onBack: () => void;
}

export default function HowRubiksCubeWorksLesson({
  onBack,
}: HowRubiksCubeWorksLessonProps) {
  return (
    <TutorialPage
      lessonId="rubiks-cube-introduction"
      title="Rubik's Cube Introduction"
      onBack={onBack}
    />
  );
}
