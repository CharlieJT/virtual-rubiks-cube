import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Canvas } from "@react-three/fiber";
import { Vector3 } from "three";
import { TrackballControls, PerformanceMonitor } from "@react-three/drei";
import RubiksCube3D from "@components/RubiksCube3D";
import type { RubiksCube3DHandle } from "@components/RubiksCube3D/types";
import type { CubeMove, CubeState } from "@/types/cube";
import { CubeJSWrapper } from "@utils/cubejsWrapper";
import { AnimationHelper } from "@utils/animationHelper";
import Button from "@components/UI/Button";
import cubejsTo3D from "@utils/cubejsTo3D";
import LessonContent from "@components/LessonContent";
import useIsTouchDevice from "@/hooks/useIsTouchDevice";
import useTwoFingerSpin from "@/hooks/useTwoFingerSpin";
import useTrackpadHandlers from "@/hooks/useTrackpadHandlers";
import SpinTrackpad from "@components/UI/SpinTrackpad";
import useDprManager from "@/hooks/useDprManager";
import CUBE_COLORS from "@/consts/cubeColours";
import TutorialResetModal from "@components/TutorialResetModal";

// Typewriter effect for slide descriptions
import { useState as useReactState, useEffect as useReactEffect } from "react";

function TypewriterText({ text, keyProp }: { text: string; keyProp: any }) {
  const [displayed, setDisplayed] = useReactState("");
  // Increase minHeight for all slides (e.g. 10em for more comfort)
  const minHeight = "8.6em";
  useReactEffect(() => {
    let i = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 15);
    return () => clearInterval(interval);
  }, [text, keyProp]);
  return (
    <span
      className="text-sm md:text-md text-gray-700 whitespace-pre-line block"
      style={{ minHeight, display: "block" }}
    >
      {displayed}
    </span>
  );
}

function getCubieColorSet(piece: CubeState): Set<string> {
  return new Set(Object.values(piece.colors));
}

interface WhiteCrossLessonProps {
  title: string;
  onBack: () => void;
}

export default function WhiteCrossLesson({
  title,
  onBack,
}: WhiteCrossLessonProps) {
  // Core cube state/refs
  const orbitPrevRef = useRef<any>(null);
  const cubeRef = useRef(new CubeJSWrapper());
  const [cube3D, setCube3D] = useState(() =>
    cubejsTo3D(cubeRef.current.getCube())
  );

  // Animation/move state
  const [pendingMove, setPendingMove] = useState<CubeMove | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const isAnimatingRef = useRef(false);
  const lastMoveTimeRef = useRef(0);
  const lastMoveSourceRef = useRef<"queue" | "manual" | "undo" | "redo" | null>(
    null
  );

  // Undo/Redo
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const moveHistoryRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);

  // Practice slide completion state
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  const [practiceShowTick, setPracticeShowTick] = useState(false);
  const [practiceTickProgress, setPracticeTickProgress] = useState(false);
  const [practiceTickLine, setPracticeTickLine] = useState(false);
  const [practiceTickAnimKey, setPracticeTickAnimKey] = useState(0);
  const [practiceSetupComplete, setPracticeSetupComplete] = useState(false);
  const [practiceInitialCrossState, setPracticeInitialCrossState] = useState<
    boolean | null
  >(null);

  // Slides for this lesson
  type Slide = {
    id: string;
    title: string;
    description: string;
    allowFaceMoves: boolean;
    setup?: (cube: CubeJSWrapper) => void;
    filter?: (piece: CubeState) => boolean;
  };

  const slides: Slide[] = useMemo(() => {
    const s: Slide[] = [];
    // White cross lesson slides will be defined here
    // This will be a substantial copy from the original TutorialPage

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
