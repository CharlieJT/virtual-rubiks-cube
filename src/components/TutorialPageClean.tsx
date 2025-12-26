import { useRef, useState, useCallback, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
import RubiksCube3D from "@components/RubiksCube3D";
import type { RubiksCube3DHandle } from "@components/RubiksCube3D/types";
import type { CubeMove, CubeState } from "@/types/cube";
import { CubeJSWrapper } from "@utils/cubejsWrapper";
import Button from "@components/UI/Button";
import cubejsTo3D from "@utils/cubejsTo3D";
import LessonContent from "@components/LessonContent";

interface TutorialPageProps {
  lessonId: string;
  title: string;
  onBack: () => void;
}

// Tutorial-specific cube state filtering
const createTutorialCubeState = (
  lessonId: string,
  baseCube: CubeState[][][]
): CubeState[][][] => {
  const greyColor = "#808080"; // Grey color for inactive pieces

  // Helper function to determine if a piece should be colored based on lesson
  const shouldShowColor = (
    x: number,
    y: number,
    z: number,
    face: string
  ): boolean => {
    switch (lessonId) {
      case "notation":
        // Show all colors for notation
        return true;

      case "white-cross":
        // Temporarily show all colors to debug orientation
        return true;

      case "white-corners":
        // Show white center, completed white cross, and white corner pieces
        if (x === 1 && y === 2 && z === 1) return true; // White center piece (all faces)
        // White edges (from previous step)
        if (
          y === 2 &&
          ((x === 1 && z === 0) ||
            (x === 2 && z === 1) ||
            (x === 1 && z === 2) ||
            (x === 0 && z === 1))
        ) {
          return (
            face === "top" ||
            face === "front" ||
            face === "right" ||
            face === "back" ||
            face === "left"
          );
        }
        // White corners
        if (
          y === 2 &&
          ((x === 0 && z === 0) ||
            (x === 2 && z === 0) ||
            (x === 2 && z === 2) ||
            (x === 0 && z === 2))
        ) {
          return (
            face === "top" ||
            face === "front" ||
            face === "right" ||
            face === "back" ||
            face === "left"
          );
        }
        return false;

      case "second-layer":
        // Show completed white face (top layer) and middle layer edges
        if (y === 2) return true; // Complete white/top face
        // Middle layer edges (y=1 layer)
        if (
          y === 1 &&
          ((x === 1 && z === 0) ||
            (x === 2 && z === 1) ||
            (x === 1 && z === 2) ||
            (x === 0 && z === 1))
        ) {
          return (
            face === "front" ||
            face === "right" ||
            face === "back" ||
            face === "left"
          );
        }
        return false;

      case "yellow-cross":
        // Show completed first two layers and yellow center + edges
        if (y === 2 || y === 1) return true; // First two layers
        if (x === 1 && y === 0 && z === 1) return true; // Yellow center piece (all faces)
        // Yellow edges on bottom layer
        if (
          y === 0 &&
          ((x === 1 && z === 0) ||
            (x === 2 && z === 1) ||
            (x === 1 && z === 2) ||
            (x === 0 && z === 1))
        ) {
          return (
            face === "bottom" ||
            face === "front" ||
            face === "right" ||
            face === "back" ||
            face === "left"
          );
        }
        return false;

      case "yellow-edges":
        // Show completed first two layers, yellow center, yellow cross, and focus on edge alignment
        if (y === 2 || y === 1) return true; // First two layers
        if (x === 1 && y === 0 && z === 1) return true; // Yellow center piece (all faces)
        // Yellow edges - show all faces of yellow edges
        if (
          y === 0 &&
          ((x === 1 && z === 0) ||
            (x === 2 && z === 1) ||
            (x === 1 && z === 2) ||
            (x === 0 && z === 1))
        ) {
          return true; // Show all faces of yellow edges
        }
        return false;

      case "yellow-corners":
        // Show everything except corner orientations
        if (y === 2 || y === 1) return true; // First two layers
        if (y === 0) {
          // Yellow center and edges
          if (x === 1 && z === 1) return true; // Yellow center piece (all faces)
          if (
            (x === 1 && z === 0) ||
            (x === 2 && z === 1) ||
            (x === 1 && z === 2) ||
            (x === 0 && z === 1)
          ) {
            return true; // Yellow edges
          }
          // Yellow corners - show position but focus on positioning
          if (
            (x === 0 && z === 0) ||
            (x === 2 && z === 0) ||
            (x === 2 && z === 2) ||
            (x === 0 && z === 2)
          ) {
            return (
              face === "bottom" ||
              face === "front" ||
              face === "right" ||
              face === "back" ||
              face === "left"
            );
          }
        }
        return false;

      case "orient-yellow-corners":
        // Show everything - final step
        return true;

      default:
        return true;
    }
  };

  // Create a deep copy of the cube state with selective greying
  return baseCube.map((layer, y) =>
    layer.map((row, z) =>
      row.map((piece, x) => ({
        ...piece,
        colors: {
          front: shouldShowColor(x, y, z, "front")
            ? piece.colors.front
            : greyColor,
          back: shouldShowColor(x, y, z, "back")
            ? piece.colors.back
            : greyColor,
          left: shouldShowColor(x, y, z, "left")
            ? piece.colors.left
            : greyColor,
          right: shouldShowColor(x, y, z, "right")
            ? piece.colors.right
            : greyColor,
          top: shouldShowColor(x, y, z, "top") ? piece.colors.top : greyColor,
          bottom: shouldShowColor(x, y, z, "bottom")
            ? piece.colors.bottom
            : greyColor,
        },
      }))
    )
  );
};

const TutorialPage = ({ lessonId, title, onBack }: TutorialPageProps) => {
  const cubeRef = useRef(new CubeJSWrapper());
  const [cube3D, setCube3D] = useState(() =>
    createTutorialCubeState(lessonId, cubejsTo3D(cubeRef.current.getCube()))
  );
  const [pendingMove, setPendingMove] = useState<CubeMove | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [orbitControlsEnabled, setOrbitControlsEnabled] = useState(true);

  const cube3DRef = useRef<RubiksCube3DHandle>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orbitControlsRef = useRef<any>(null);

  // Update cube when lesson changes
  useEffect(() => {
    const newCube = createTutorialCubeState(
      lessonId,
      cubejsTo3D(cubeRef.current.getCube())
    );
    setCube3D(newCube);
  }, [lessonId]);

  // Handle cube moves
  const handleMove = useCallback(
    (move: string) => {
      if (isAnimating || pendingMove) return;

      // Don't apply move to logical state yet - wait for animation to complete
      setPendingMove(move as CubeMove);
    },
    [isAnimating, pendingMove]
  );

  // Animation callbacks
  const handleAnimationStart = useCallback(() => {
    setIsAnimating(true);
  }, []);

  const handleAnimationDone = useCallback(() => {
    if (pendingMove) {
      // Now apply the move to the logical state
      cubeRef.current.move(pendingMove);
      const newCube = createTutorialCubeState(
        lessonId,
        cubejsTo3D(cubeRef.current.getCube())
      );
      setCube3D(newCube);
    }
    setPendingMove(null);
    setIsAnimating(false);
  }, [pendingMove, lessonId]);

  // Scramble function for tutorial
  const handleScramble = useCallback(() => {
    if (isAnimating) return;

    cubeRef.current.scramble();
    const newCube = createTutorialCubeState(
      lessonId,
      cubejsTo3D(cubeRef.current.getCube())
    );
    setCube3D(newCube);
  }, [isAnimating, lessonId]);

  // Reset to solved state
  const handleReset = useCallback(() => {
    if (isAnimating) return;

    cubeRef.current.reset();
    const newCube = createTutorialCubeState(
      lessonId,
      cubejsTo3D(cubeRef.current.getCube())
    );
    setCube3D(newCube);
  }, [isAnimating, lessonId]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="hidden sm:inline">Back to Lessons</span>
              <span className="sm:hidden">Back</span>
            </button>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate mx-2">
            {title}
          </h1>
          <div className="w-12 sm:w-24"></div>{" "}
          {/* Spacer for center alignment */}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Cube Area */}
        <div className="flex-1 relative min-h-0">
          <Canvas
            ref={canvasRef}
            camera={{
              position: [2, 4, 2], // Higher Y position to emphasize white face on top
              fov: 75,
              near: 0.1,
              far: 1000,
            }}
            style={{
              background: `linear-gradient(
                135deg, 
                rgb(219, 234, 254) 0%, 
                rgb(199, 210, 254) 50%, 
                rgb(221, 214, 254) 100%
              )`,
            }}
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <TrackballControls
              ref={orbitControlsRef}
              enabled={orbitControlsEnabled}
              dynamicDampingFactor={0.3}
              maxDistance={10}
              minDistance={2}
            />
            <RubiksCube3D
              ref={cube3DRef}
              cubeState={cube3D}
              pendingMove={pendingMove}
              onMoveAnimationDone={handleAnimationDone}
              onStartAnimation={handleAnimationStart}
              isAnimating={isAnimating}
              onOrbitControlsChange={setOrbitControlsEnabled}
              onDragMove={handleMove}
            />
          </Canvas>

          {/* Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex gap-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
              <Button
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-2 px-3 sm:px-4 rounded transition-all text-sm shadow-md"
                onClick={handleScramble}
                disabled={isAnimating}
              >
                Scramble
              </Button>
              <Button
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-2 px-3 sm:px-4 rounded transition-all text-sm shadow-md"
                onClick={handleReset}
                disabled={isAnimating}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Tutorial Content Sidebar - responsive */}
        <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 overflow-y-auto max-h-64 lg:max-h-none">
          <div className="p-4 lg:p-6">
            <LessonContent lessonId={lessonId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialPage;
