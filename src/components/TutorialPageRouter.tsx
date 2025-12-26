import WhiteCrossLesson from "./WhiteCrossLesson";

interface TutorialPageProps {
  lessonId: string;
  title: string;
  onBack: () => void;
}

export default function TutorialPage({
  lessonId,
  title,
  onBack,
}: TutorialPageProps) {
  switch (lessonId) {
    case "white-cross":
      return <WhiteCrossLesson title={title} onBack={onBack} />;
    default:
      return (
        <div className="h-full flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Lesson Not Found</h1>
          <p className="text-gray-600 mb-4">
            The lesson "{lessonId}" is not implemented yet.
          </p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      );
  }
}
