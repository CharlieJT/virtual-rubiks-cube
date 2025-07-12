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
      const now = Date.now();
      if (
        isAnimating ||
        AnimationHelper.isLocked() ||
        now - lastMoveTimeRef.current < 100
      ) {
        return;
      }

      lastMoveTimeRef.current = now;

      setPendingMove(move as CubeMove);
    },
    [isAnimating]
  );

  const handleMoveAnimationDone = useCallback((move: CubeMove) => {
    const isWholeCubeRotation =
      move === "x" ||
      move === "x'" ||
      move === "y" ||
      move === "y'" ||
      move === "z" ||
      move === "z'";

    if (!isWholeCubeRotation) {
      cubeRef.current.move(move);
      setCube3D(cubejsTo3D(cubeRef.current.getCube()));
      setIsScrambled(true);
      setSolution(null);
    }

    setPendingMove(null);
    setIsAnimating(false);

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
      <div className="flex-1 relative">
        <Canvas
          camera={{ position: [5, 5, 5], fov: 60 }}
          className="bg-gradient-to-br from-slate-900 to-slate-700"
        >
          <spotLight position={[-30, 20, 60]} intensity={0.3} castShadow />
          <ambientLight intensity={0.9} color="#eeeeee" />
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
            enableDamping={false}
            minDistance={3}
            maxDistance={15}
            minPolarAngle={0}
            maxPolarAngle={Math.PI}
          />
        </Canvas>
        <div className="absolute top-4 left-4 z-10">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">
            Virtual Rubik's Cube
          </h1>
          <p className="text-lg text-gray-300 drop-shadow">
            Drag to rotate • Click faces to twist
          </p>
        </div>
      </div>
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
