interface TutorialIndexProps {
  onSelectLesson: (lessonId: string) => void;
  onBack: () => void;
}

type LessonType =
  | "notation"
  | "white-cross"
  | "white-corners"
  | "second-layer"
  | "yellow-cross"
  | "yellow-edges"
  | "yellow-corners"
  | "orient-yellow-corners";

interface Lesson {
  id: LessonType;
  title: string;
  description: string;
  icon: string;
}

const lessons: Lesson[] = [
  {
    id: "notation",
    title: "1. Notation",
    description: "Learn the basic cube notation and move symbols",
    icon: "📝",
  },
  {
    id: "white-cross",
    title: "2. White Cross",
    description: "Form a white cross on the bottom face",
    icon: "✚",
  },
  {
    id: "white-corners",
    title: "3. White Corners",
    description: "Complete the white face by placing corner pieces",
    icon: "🔲",
  },
  {
    id: "second-layer",
    title: "4. Second Layer",
    description: "Solve the middle layer edge pieces",
    icon: "🟦",
  },
  {
    id: "yellow-cross",
    title: "5. Yellow Cross",
    description: "Form a yellow cross on the top face",
    icon: "✚",
  },
  {
    id: "yellow-edges",
    title: "6. Yellow Edges",
    description: "Position the yellow cross edges correctly",
    icon: "🔄",
  },
  {
    id: "yellow-corners",
    title: "7. Yellow Corners",
    description: "Position the yellow corner pieces",
    icon: "📐",
  },
  {
    id: "orient-yellow-corners",
    title: "8. Orient Yellow Corners",
    description: "Complete the cube by orienting yellow corners",
    icon: "🎯",
  },
];

export default function TutorialIndex({
  onSelectLesson,
  onBack,
}: TutorialIndexProps) {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Learn to Solve</h2>
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ✕
          </button>
        </div>
        <p className="text-gray-600">
          Master the Rubik's cube with our step-by-step tutorial system. Each
          lesson builds on the previous one.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            onClick={() => onSelectLesson(lesson.id)}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer bg-white"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{lesson.icon}</span>
              <h3 className="text-lg font-semibold text-gray-900">
                {lesson.title}
              </h3>
            </div>
            <p className="text-gray-600 text-sm">{lesson.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Getting Started</h3>
        <p className="text-blue-800 text-sm">
          New to cubing? Start with <strong>Notation</strong> to learn the basic
          moves, then proceed through the lessons in order. Each tutorial
          includes interactive examples and guided practice.
        </p>
      </div>
    </div>
  );
}
