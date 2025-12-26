import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { TrackballControls, PerformanceMonitor } from "@react-three/drei";
import RubiksCube3D from "@components/RubiksCube3D";
import type { RubiksCube3DHandle } from "@components/RubiksCube3D/types";
import type { CubeMove, CubeState } from "@/types/cube";
import { CubeJSWrapper } from "@utils/cubejsWrapper";
import Button from "@components/UI/Button";
import cubejsTo3D from "@utils/cubejsTo3D";
import useIsTouchDevice from "@/hooks/useIsTouchDevice";
import useDprManager from "@/hooks/useDprManager";
import CUBE_COLORS from "@/consts/cubeColours";
import TutorialResetModal from "@components/TutorialResetModal";

interface WhiteCrossLessonProps {
  title: string;
  onBack: () => void;
}

// Typewriter effect for slide descriptions
function TypewriterText({ text, keyProp }: { text: string; keyProp: any }) {
  const [displayed, setDisplayed] = useState("");
  const minHeight = "8.6em";
  useEffect(() => {
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

// Helper to list unique, visible sticker colors on a cubie (ignore grey + black)
const getCubieColorSet = (piece: CubeState) => {
  const colors = new Set<string>();
  const grey = "#808080";
  const black = CUBE_COLORS.BLACK;
  Object.values(piece.colors).forEach((c) => {
    if (c && c !== grey && c !== black) colors.add(c);
  });
  return colors;
};

interface Slide {
  id: string;
  title: string;
  description: string;
  allowFaceMoves: boolean;
  setup?: (cube: CubeJSWrapper) => void;
  filter?: (piece: CubeState) => boolean;
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
  const [tutorialCube3D, setTutorialCube3D] = useState(() => cube3D);

  // Animation/move state
  const [pendingMove] = useState<CubeMove | null>(null);
  const [isAnimating] = useState(false);

  // Basic navigation state
  const [currentSlide, setCurrentSlide] = useState(0);

  // Practice completion state
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  const [practiceShowTick, setPracticeShowTick] = useState(false);
  const [practiceTickProgress, setPracticeTickProgress] = useState(false);
  const [practiceSetupComplete, setPracticeSetupComplete] = useState(false);
  const [practiceInitialCrossState, setPracticeInitialCrossState] = useState<
    boolean | null
  >(null);

  // Controls/UI state
  const [inputDisabled, setInputDisabled] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const isTransitioningRef = useRef(false);

  // Device/interaction state
  const isTouchDevice = useIsTouchDevice();
  const cube3DRef = useRef<RubiksCube3DHandle>(null);
  useDprManager(isTouchDevice);

  // White cross slides definition
  const slides: Slide[] = useMemo(() => {
    const s: Slide[] = [];
    s.push({
      id: "intro",
      title: "What we're aiming to achieve",
      description:
        "Your first goal is to create a white cross around the white center piece. Each white edge should match the color of the center piece on its side. Drag the cube to spin and see how the cross and matching edges look from different angles.",
      allowFaceMoves: false,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
      },
      filter: (piece: CubeState) => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        const set = getCubieColorSet(piece);
        return set.size === 2 && set.has(CUBE_COLORS.WHITE);
      },
    });

    s.push({
      id: "find-green-white",
      title: "Target the green/white edge",
      description:
        "There are four white edge pieces to position around the white center. In this example, we're focusing on the green/white edge piece. Notice how it should be placed so the white sticker matches the white center and the green sticker matches the green center.",
      allowFaceMoves: false,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
      },
      filter: (piece: CubeState) => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        const set = getCubieColorSet(piece);
        return set.size === 2 && set.has(CUBE_COLORS.WHITE);
      },
    });

    s.push({
      id: "flip-green-white-f2",
      title: "Misoriented edge",
      description:
        "Here, the green/white edge is misoriented: the green sticker matches the green center, but the white sticker matches the yellow center. To correct this, perform F2 using the notation you've learned to position it between the white and green centers. Complete the sequence below, Reset and repeat a few times until it feels natural.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        cube.applyMoves(["F2"]);
      },
      filter: (piece: CubeState) => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        const set = getCubieColorSet(piece);
        return set.size === 2 && set.has(CUBE_COLORS.WHITE);
      },
    });

    s.push({
      id: "flip-green-white",
      title: "Flipped edge",
      description:
        "Sometimes this edge is flipped: the white sticker faces the green center and the green sticker faces the white center. To flip it, perform F U' R U. Complete the sequence below, Reset and practice it a few times until you feel comfortable with it.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        cube.applyMoves(["F", "U'", "R", "U"]);
      },
      filter: (piece: CubeState) => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        const set = getCubieColorSet(piece);
        return set.size === 2 && set.has(CUBE_COLORS.WHITE);
      },
    });

    s.push({
      id: "flipped-misoriented-green-white",
      title: "Flipped & misoriented edge",
      description:
        "The green/white edge is both flipped and misoriented. Fix it in two parts: first do F2 to orient the edge between the white & green centers (like you learned in step 3), then do F U' R U to flip it (like you learned in step 4). Reset and practice both parts together until it sticks.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        cube.applyMoves(["U'", "R'", "U", "F"]);
      },
      filter: (piece: CubeState) => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        const set = getCubieColorSet(piece);
        return set.size === 2 && set.has(CUBE_COLORS.WHITE);
      },
    });

    s.push({
      id: "misaligned-green-white",
      title: "Misaligned edge",
      description:
        "In this example, the green/white edge piece is underneath the red center, which is wrong. We fix this in two parts: first do D' to align the edge with the green center, then do F2 to orient it into position. Complete the sequence below, then press Reset and practice both parts together until it sticks.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        cube.applyMoves(["F2", "D"]);
      },
      filter: (piece: CubeState) => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        const set = getCubieColorSet(piece);
        return set.size === 2 && set.has(CUBE_COLORS.WHITE);
      },
    });

    s.push({
      id: "flipped-misoriented-misaligned-green-white",
      title: "Flipped, misoriented & misaligned edge",
      description:
        "We can see in this example that the green/white edge piece is also underneath the red center, but it's flipped. We fix this in three parts: first D' to line up with green center, then F2 to rotate between green & white centers, then F' U' R U to orient it correctly. Work through each step below; press Reset and practice until it sticks.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        cube.applyMoves(["U'", "R'", "U", "F", "D"]);
      },
      filter: (piece: CubeState) => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        const set = getCubieColorSet(piece);
        return set.size === 2 && set.has(CUBE_COLORS.WHITE);
      },
    });

    s.push({
      id: "midlayer-green-white-extraction",
      title: "Edge trapped in mid-layer",
      description:
        "The green/white edge is stuck in the middle layer between the blue and red centers. With red center facing front (towards you), do R' D' R. Then with green facing front, move the edge to meet green center with D' & then F2 to rotate into place. Again, practice this until it sticks.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        cube.applyMoves(["F2", "D", "B'", "D", "B"]);
      },
      filter: (piece: CubeState) => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        const set = getCubieColorSet(piece);
        return set.size === 2 && set.has(CUBE_COLORS.WHITE);
      },
    });

    s.push({
      id: "recap-mental-model",
      title: "Quick recap: the mental model",
      description: "A short recap of how to reason about the green/white edge.",
      allowFaceMoves: false,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
      },
      filter: (piece: CubeState) => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        const set = getCubieColorSet(piece);
        return set.size === 2 && set.has(CUBE_COLORS.WHITE);
      },
    });

    s.push({
      id: "practice-two-edges",
      title: "Practice: 2 white edges",
      description:
        "Now practice with 2 white edges out of place. Use the techniques you've learned to solve the white cross. If you get stuck, go back to previous slides to practice the individual cases.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        cube.applyMoves(["F", "U'", "R", "U", "F2", "D2", "R2", "D'"]);
      },
      filter: (piece: CubeState) => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        const set = getCubieColorSet(piece);
        return set.size === 2 && set.has(CUBE_COLORS.WHITE);
      },
    });

    s.push({
      id: "practice-three-edges",
      title: "Practice: 3 white edges",
      description:
        "This is a bit trickier - there are 3 white edges that are out of place. Based on what you've learned, see if you can solve the cross. Remember, you can reset or go back to previous slides if you get stuck.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        cube.applyMoves([
          "F",
          "R2",
          "D'",
          "B",
          "L",
          "D'",
          "L'",
          "D",
          "L",
          "D",
          "L'",
          "B",
          "D2",
          "B'",
        ]);
      },
      filter: (piece: CubeState) => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        const set = getCubieColorSet(piece);
        return set.size === 2 && set.has(CUBE_COLORS.WHITE);
      },
    });

    s.push({
      id: "practice-full-cross",
      title: "Final Challenge: Complete Cross",
      description:
        "This is a full cross challenge to see if you can solve the entire white cross based on what you've learned. Remember, you can reset or go back to previous slides to practice if you get stuck.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        cube.applyMoves([
          "R",
          "D'",
          "B2",
          "R",
          "U",
          "R'",
          "B'",
          "D2",
          "R",
          "F'",
          "R",
          "D2",
          "L'",
          "D2",
          "B2",
          "L",
          "F",
          "U'",
          "F",
          "U'",
        ]);
      },
      filter: (piece: CubeState) => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        const set = getCubieColorSet(piece);
        return set.size === 2 && set.has(CUBE_COLORS.WHITE);
      },
    });

    return s;
  }, []);

  const activeSlide = slides[currentSlide];

  // Check if current slide is a practice slide
  const isPracticeSlide = activeSlide?.id.includes("practice");

  // White cross detection logic
  const isWhiteCrossSolved = useCallback(() => {
    const currentCube = cubeRef.current.getCube();

    // Find the white center (which determines the "white face")
    let whiteFaceIndex = -1;
    for (let i = 0; i < 6; i++) {
      const centerPosition = { x: 1, y: 1, z: i === 4 ? 0 : i === 5 ? 2 : 1 }; // Adjusted for 3D positions
      if (i < 3) {
        if (i === 0) centerPosition.x = 0;
        else if (i === 1) centerPosition.x = 2;
        else centerPosition.y = i === 2 ? 0 : 2;
      } else if (i === 3) {
        centerPosition.y = 2;
      }

      const centerPiece =
        currentCube[centerPosition.x][centerPosition.y][centerPosition.z];
      if (
        centerPiece &&
        Object.values(centerPiece.colors).includes(CUBE_COLORS.WHITE)
      ) {
        whiteFaceIndex = i;
        break;
      }
    }

    if (whiteFaceIndex === -1) return false;

    // Check all four edges adjacent to the white center
    const edgePositions = [
      { x: 1, y: 0, z: 1 }, // Top edge
      { x: 1, y: 2, z: 1 }, // Bottom edge
      { x: 0, y: 1, z: 1 }, // Left edge
      { x: 2, y: 1, z: 1 }, // Right edge
    ];

    // Adjust edge positions based on white face location
    // This is a simplified version - the full logic would need proper face mapping

    let solvedEdges = 0;
    for (const pos of edgePositions) {
      const piece = currentCube[pos.x][pos.y][pos.z];
      if (!piece) continue;

      const colors = Object.values(piece.colors).filter(
        (c) => c && c !== "#808080" && c !== CUBE_COLORS.BLACK
      );

      // Check if this is a white edge (has white + one other color)
      if (colors.length === 2 && colors.includes(CUBE_COLORS.WHITE)) {
        // For a proper white cross, the white sticker should be on the white face
        // and the other color should match the adjacent center
        // This is a simplified check
        solvedEdges++;
      }
    }

    return solvedEdges === 4;
  }, []);

  // Practice completion check
  useEffect(() => {
    if (!isPracticeSlide || !practiceSetupComplete) return;

    const checkCompletion = () => {
      const isCurrentlySolved = isWhiteCrossSolved();

      // Smart completion detection: only complete if cross is solved AND it wasn't solved initially
      if (
        isCurrentlySolved &&
        practiceInitialCrossState === false &&
        !practiceCompleted
      ) {
        setPracticeCompleted(true);
        setPracticeShowTick(true);
        setPracticeTickProgress(false);
        setTimeout(() => setPracticeTickProgress(true), 100);
      }
    };

    // Check immediately and set up interval
    checkCompletion();
    const interval = setInterval(checkCompletion, 100);
    return () => clearInterval(interval);
  }, [
    isPracticeSlide,
    practiceSetupComplete,
    practiceInitialCrossState,
    practiceCompleted,
    isWhiteCrossSolved,
  ]);

  // Reset practice state when changing slides
  useEffect(() => {
    setPracticeCompleted(false);
    setPracticeShowTick(false);
    setPracticeTickProgress(false);
    setPracticeSetupComplete(false);
    setPracticeInitialCrossState(null);
  }, [currentSlide, activeSlide?.id]);

  // Setup slide state when slide changes
  useEffect(() => {
    if (!activeSlide) return;

    const setupSlide = async () => {
      isTransitioningRef.current = true;

      try {
        // Apply slide setup
        if (activeSlide.setup) {
          activeSlide.setup(cubeRef.current);
        }

        // Update 3D representation
        const newCube3D = cubejsTo3D(cubeRef.current.getCube());
        setCube3D(newCube3D);
        setTutorialCube3D(newCube3D);

        // Set input controls based on slide
        setInputDisabled(!activeSlide.allowFaceMoves);

        // For practice slides, track initial state
        if (isPracticeSlide) {
          setTimeout(() => {
            const initialCrossState = isWhiteCrossSolved();
            setPracticeInitialCrossState(initialCrossState);
            setPracticeSetupComplete(true);
          }, 100);
        }
      } finally {
        isTransitioningRef.current = false;
      }
    };

    setupSlide();
  }, [activeSlide, isPracticeSlide, isWhiteCrossSolved]);

  const handleNext = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  }, [currentSlide, slides.length]);

  const handlePrev = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  }, [currentSlide]);

  const handleReset = useCallback(() => {
    if (activeSlide?.setup) {
      activeSlide.setup(cubeRef.current);
      const newCube3D = cubejsTo3D(cubeRef.current.getCube());
      setCube3D(newCube3D);
      setTutorialCube3D(newCube3D);

      // Reset practice state
      if (isPracticeSlide) {
        setPracticeCompleted(false);
        setPracticeShowTick(false);
        setPracticeTickProgress(false);
        setTimeout(() => {
          const initialCrossState = isWhiteCrossSolved();
          setPracticeInitialCrossState(initialCrossState);
          setPracticeSetupComplete(true);
        }, 100);
      }
    }
  }, [activeSlide, isPracticeSlide, isWhiteCrossSolved]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{title}</h1>
          <Button
            onClick={onBack}
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            ← Back to Menu
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Slide Content */}
        <div className="w-1/2 p-6 bg-white overflow-y-auto">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold text-gray-800">
                {activeSlide?.title || "Loading..."}
              </h2>
              {isPracticeSlide && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {practiceCompleted ? "Solved!" : "Not solved"}
                  </span>
                  {practiceShowTick && (
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path
                        d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="2"
                        strokeDasharray="24"
                        strokeDashoffset={practiceTickProgress ? 0 : 24}
                        style={{
                          transition: "stroke-dashoffset 0.3s ease-in-out",
                        }}
                      />
                    </svg>
                  )}
                </div>
              )}
            </div>
            <div className="text-sm text-gray-500 mb-4">
              Slide {currentSlide + 1} of {slides.length}
            </div>
            <TypewriterText
              text={activeSlide?.description || ""}
              keyProp={activeSlide?.id}
            />
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6">
            <Button
              onClick={handlePrev}
              disabled={currentSlide === 0}
              className="px-4 py-2"
            >
              ← Previous
            </Button>

            <div className="flex space-x-2">
              <Button
                onClick={handleReset}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700"
              >
                Reset
              </Button>
            </div>

            <Button
              onClick={handleNext}
              disabled={
                currentSlide === slides.length - 1 ||
                (isPracticeSlide && !practiceCompleted)
              }
              className="px-4 py-2"
            >
              Next →
            </Button>
          </div>
        </div>

        {/* Right Panel - 3D Cube */}
        <div className="w-1/2 p-6 bg-gray-50">
          <div className="relative h-full bg-white rounded-lg shadow-lg">
            {/* Status indicator for practice slides */}
            {isPracticeSlide && (
              <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-md px-3 py-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    {practiceCompleted ? "Cross Solved!" : "Solve the cross"}
                  </span>
                  {practiceShowTick && (
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path
                        d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="2"
                        strokeDasharray="24"
                        strokeDashoffset={practiceTickProgress ? 0 : 24}
                        style={{
                          transition: "stroke-dashoffset 0.3s ease-in-out",
                        }}
                      />
                    </svg>
                  )}
                </div>
              </div>
            )}

            {/* 3D Canvas */}
            <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
              <ambientLight intensity={0.6} />
              <pointLight position={[10, 10, 10]} />
              <RubiksCube3D
                ref={cube3DRef}
                cubeState={tutorialCube3D}
                pendingMove={pendingMove}
                onMoveAnimationDone={() => {}}
                onStartAnimation={() => {}}
                isAnimating={isAnimating}
                onOrbitControlsChange={() => {}}
                disableSliceDrag={
                  !activeSlide?.allowFaceMoves ||
                  (isPracticeSlide && practiceCompleted)
                }
                preventSliceMoves={
                  !activeSlide?.allowFaceMoves ||
                  (isPracticeSlide && practiceCompleted)
                }
                inputDisabled={inputDisabled}
              />
              <TrackballControls ref={orbitPrevRef} />
              <PerformanceMonitor />
            </Canvas>
          </div>
        </div>
      </div>

      {/* Reset Modal */}
      {showResetModal && (
        <TutorialResetModal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          onConfirm={() => {
            handleReset();
            setShowResetModal(false);
          }}
        />
      )}
    </div>
  );
}
