import Modal from "@components/UI/Modal";

interface LearnToSolveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTutorial: (lessonId: string) => void;
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
    description: "Create a yellow cross on the top face",
    icon: "✟",
  },
  {
    id: "yellow-edges",
    title: "6. Yellow Edges",
    description: "Position yellow edges correctly",
    icon: "🔄",
  },
  {
    id: "yellow-corners",
    title: "7. Yellow Corners",
    description: "Position yellow corner pieces",
    icon: "📐",
  },
  {
    id: "orient-yellow-corners",
    title: "8. Orient Yellow Corners",
    description: "Orient the final corner pieces to solve the cube",
    icon: "🎯",
  },
];

const LearnToSolveModal = ({
  isOpen,
  onClose,
  onStartTutorial,
}: LearnToSolveModalProps) => {
  const handleLessonSelect = (lessonId: LessonType) => {
    onStartTutorial(lessonId);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Learn to Solve">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Beginner's Method
            </h2>
            <p className="text-gray-600">
              Learn to solve the Rubik's cube step by step using the
              layer-by-layer method. Select a lesson below to get started with
              an interactive tutorial!
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {lessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => handleLessonSelect(lesson.id)}
                className="text-left p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lesson.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 group-hover:text-blue-600">
                      {lesson.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {lesson.description}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <h3 className="font-semibold text-blue-800 mb-2">
              Interactive Learning
            </h3>
            <p className="text-blue-700 text-sm">
              Each lesson includes an interactive 3D cube that highlights only
              the relevant pieces for that step. You can practice moves,
              scramble, and reset the cube while following the tutorial
              instructions.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LearnToSolveModal;
