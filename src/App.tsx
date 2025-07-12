import { useRef, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import RubiksCube3D from "./components/RubiksCube3D";
import ControlPanel from "./components/ControlPanel";
import { MoveButtonsPanel } from "./components/MoveButtonsPanel";
import { CubeJSWrapper } from "./utils/cubejsWrapper";
import cubejsTo3D from "./utils/cubejsTo3D";
import { AnimationHelper } from "./utils/animationHelper";
import type { Solution, CubeMove } from "./types/cube";

const App = () => {
  const cubeRef = useRef(new CubeJSWrapper());
  const [cube3D, setCube3D] = useState(() =>
    cubejsTo3D(cubeRef.current.getCube())
  );
  const [isScrambled, setIsScrambled] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [pendingMove, setPendingMove] = useState<CubeMove | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Simple debouncing with last move time
  const lastMoveTimeRef = useRef(0);

  const handleScramble = useCallback(() => {
    if (isAnimating) return;

    setPendingMove(null);

    cubeRef.current.scramble();
    setCube3D(cubejsTo3D(cubeRef.current.getCube()));
    setIsScrambled(true);
    setSolution(null);
  }, [isAnimating]);

  const handleButtonMove = useCallback(
    (move: string) => {
      // Moderate debouncing - prevent rapid hammering but allow normal use
      const now = Date.now();
      if (
        isAnimating ||
        AnimationHelper.isLocked() ||
        now - lastMoveTimeRef.current < 100
      ) {
        return;
      }

      lastMoveTimeRef.current = now;

      // Just start the animation - update cube state after animation like before
      setPendingMove(move as CubeMove);
    },
    [isAnimating]
  );

  // Called by RubiksCube3D after animation completes
  const handleMoveAnimationDone = useCallback((move: CubeMove) => {
    // Update cube state after animation completes
    cubeRef.current.move(move);
    setCube3D(cubejsTo3D(cubeRef.current.getCube()));
    setIsScrambled(true);
    setSolution(null);
    setPendingMove(null);
    setIsAnimating(false);

    // Fail-safe unlock
    AnimationHelper.unlock();
  }, []);

  const handleStartAnimation = useCallback(() => {
    setIsAnimating(true);
  }, []);

  const handleGenerateSolution = useCallback(() => {
    setSolution(null);
  }, []);

  const handleSolve = useCallback(async () => {
    setIsSolving(false);
  }, []);

  return (
    <div className="w-full h-full flex">
      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <Canvas
          camera={{ position: [5, 5, 5], fov: 60 }}
          className="bg-gradient-to-br from-slate-900 to-slate-700"
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />
          <RubiksCube3D
            cubeState={cube3D}
            pendingMove={pendingMove}
            onMoveAnimationDone={handleMoveAnimationDone}
            onStartAnimation={handleStartAnimation}
            isAnimating={isAnimating}
          />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={15}
            minPolarAngle={0}
            maxPolarAngle={Math.PI}
          />
        </Canvas>
        {/* Overlay title */}
        <div className="absolute top-4 left-4 z-10">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">
            Virtual Rubik's Cube
          </h1>
          <p className="text-lg text-gray-300 drop-shadow">
            Drag to rotate • Click faces to twist
          </p>
        </div>
      </div>
      {/* Control Panel */}
      <div className="w-80 p-6 flex flex-col items-center">
        <MoveButtonsPanel onMove={handleButtonMove} />
        <ControlPanel
          onScramble={handleScramble}
          onSolve={handleSolve}
          onGenerateSolution={handleGenerateSolution}
          solution={solution}
          isScrambled={isScrambled}
          isSolving={isSolving}
        />
      </div>
    </div>
  );
};

export default App;
