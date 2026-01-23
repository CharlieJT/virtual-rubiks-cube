import { useState, useMemo } from "react";
import type { CubeState } from "@/types/cube";
import type { CubeJSWrapper } from "@utils/cubejsWrapper";

interface WhiteCrossLessonProps {
  title: string;
  onBack: () => void;
}

type Slide = {
  id: string;
  title: string;
  description: string;
  allowFaceMoves: boolean;
  setup?: (cube: CubeJSWrapper) => void;
  filter?: (piece: CubeState) => boolean;
};

export default function WhiteCrossLesson({
  title,
  onBack,
}: WhiteCrossLessonProps) {
  const slides: Slide[] = useMemo(() => {
    const s: Slide[] = [];
    return s;
  }, []);

  const [currentSlide, setCurrentSlide] = useState(0);
  const activeSlide = slides[currentSlide];

  return (
    <div className="h-full flex flex-col">
      {/* White Cross Lesson UI will be implemented here */}
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <p>
          Slide {currentSlide + 1} of {slides.length}
        </p>
        <p>Current slide: {activeSlide?.title || "Loading..."}</p>

        <div className="mt-4">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 mr-2"
          >
            Back
          </button>
          <button
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 mr-2"
          >
            Previous
          </button>
          <button
            onClick={() =>
              setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))
            }
            disabled={currentSlide === slides.length - 1}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
