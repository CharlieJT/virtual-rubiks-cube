import { useRef, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import RubiksCube3D from "./components/RubiksCube3D_Simple";
import ControlPanel from "./components/ControlPanel";
// import { MoveButtonsPanel } from "./components/MoveButtonsPanel";
import { CubeJSWrapper } from "./utils/cubejsWrapper";
import cubejsTo3D from "./utils/cubejsTo3D";
import { AnimationHelper } from "./utils/animationHelper";
import type { CubeMove, Solution } from "./types/cube";
import ConfirmModal from "./components/ConfirmModal";

const App = () => {
  const cubeRef = useRef(new CubeJSWrapper());
  const [cube3D, setCube3D] = useState(() =>
    cubejsTo3D(cubeRef.current.getCube())
  );
  const [isScrambled, setIsScrambled] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [lastSolvedState, setLastSolvedState] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState<CubeMove | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [orbitControlsEnabled, setOrbitControlsEnabled] = useState(true);
  const orbitControlsRef = useRef<any>(null);

  const lastMoveTimeRef = useRef(0);
  const moveQueueRef = useRef<CubeMove[]>([]);
  const lastMoveSourceRef = useRef<"queue" | "manual" | null>(null);
  // Track which sequence the current queue represents for accurate highlighting
  const currentRunRef = useRef<null | "scramble" | "solve">(null);
  const [scrambleMoves, setScrambleMoves] = useState<string[] | null>(null);
  const [scrambleIndex, setScrambleIndex] = useState<number>(-1);
  const [solutionIndex, setSolutionIndex] = useState<number>(-1);
  const [isScramblingState, setIsScramblingState] = useState(false);
  // Track remaining scramble moves to robustly end scrambling across devices
  const scrambleRemainingRef = useRef(0);

  // Mirror state into refs to avoid stale-closure checks during async retries
  const isAnimatingRef = useRef(isAnimating);
  const pendingMoveRef = useRef<CubeMove | null>(pendingMove);
  isAnimatingRef.current = isAnimating;
  pendingMoveRef.current = pendingMove;

  const pumpQueue = useCallback(() => {
    if (isAnimatingRef.current || AnimationHelper.isLocked()) return;
    if (pendingMoveRef.current) return;
    const next = moveQueueRef.current.shift();
    if (next) {
      // Advance the appropriate highlight index based on current run type
      if (currentRunRef.current === "scramble") {
        setScrambleIndex((i) =>
          Math.min(i + 1, (scrambleMoves?.length ?? 1) - 1)
        );
      } else if (currentRunRef.current === "solve") {
        setSolutionIndex((i) =>
          Math.min(i + 1, (solution?.steps.length ?? 1) - 1)
        );
      }
      lastMoveSourceRef.current = "queue";
      // Set state and ref together to avoid race on mobile
      setPendingMove(next);
      pendingMoveRef.current = next;
    } else {
      // No more moves queued; end-of-run cleanup will be handled in handleMoveAnimationDone
    }
  }, [scrambleMoves, scrambleIndex, solution, solutionIndex]);

  // Retry pumping until AnimationHelper unlocks to avoid stalling after first move
  const pumpQueueSoon = useCallback(() => {
    const attempt = () => {
      // Wait until animation system is unlocked and there's no pending move
      if (
        AnimationHelper.isLocked() ||
        isAnimatingRef.current ||
        pendingMoveRef.current
      ) {
        setTimeout(attempt, 0);
        return;
      }
      pumpQueue();
    };
    // Ensure we give React a tick to commit state before first attempt
    setTimeout(attempt, 0);
  }, [pumpQueue]);

  const enqueueMoves = useCallback(
    (moves: string[]) => {
      const normalized = moves as CubeMove[];
      moveQueueRef.current.push(...normalized);
      // try to start now
      pumpQueue();
    },
    [pumpQueue]
  );

  const handleScramble = useCallback(() => {
    if (isAnimating || AnimationHelper.isLocked()) return;
    setPendingMove(null);

    // Get a random scramble without mutating current cube immediately
    const scramble = cubeRef.current.generateScramble(20);
    // Reset indices before we start so first pump sets 0 and isn't overridden
    setScrambleIndex(-1);
    setSolutionIndex(-1);
    // Mark this run before enqueuing so highlighting starts with the first move
    currentRunRef.current = "scramble";
    setIsScramblingState(true);
    // Track remaining scramble moves explicitly
    scrambleRemainingRef.current = scramble.length;
    // Apply & animate on the visual cube and mutate cubeRef in onMoveAnimationDone
    enqueueMoves(scramble);
    setIsScrambled(true);
    setSolution(null);
    setLastSolvedState(null);
    setScrambleMoves(scramble);
    // Index will become 0 when the first move starts
  }, [enqueueMoves, isAnimating]);

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
      lastMoveSourceRef.current = "manual";
      setPendingMove(move as CubeMove);
    },
    [isAnimating]
  );

  const handleMoveAnimationDone = useCallback(
    (move: CubeMove) => {
      const isWholeCubeRotation =
        move === "x" ||
        move === "x'" ||
        move === "y" ||
        move === "y'" ||
        move === "z" ||
        move === "z'";

      if (!isWholeCubeRotation) {
        // Execute the move in the logical state
        cubeRef.current.move(move);

        // Immediately update the visual representation with the new colors
        // Important: This must happen synchronously before the meshes are repositioned
        // to avoid color flickering
        setCube3D(cubejsTo3D(cubeRef.current.getCube()));
        // Update scrambled/solved status
        const solved = cubeRef.current.isSolved();
        setIsScrambled(!solved);

        // Decrement scramble remaining if we are in a scramble run
        if (currentRunRef.current === "scramble") {
          scrambleRemainingRef.current = Math.max(
            0,
            scrambleRemainingRef.current - 1
          );
        }

        // If this was a manual twist, invalidate any cached solution/scramble sequence
        if (lastMoveSourceRef.current === "manual") {
          setSolution(null);
          setLastSolvedState(null);
          setSolutionIndex(-1);
          // Scramble list no longer represents current state after manual edits
          setScrambleMoves(null);
          setScrambleIndex(-1);
        }
      }

      // Reset animation state
      setPendingMove(null);
      pendingMoveRef.current = null;
      setIsAnimating(false);
      isAnimatingRef.current = false;

      // continue queue if any (retry until unlock)
      pumpQueueSoon();
      if (moveQueueRef.current.length === 0) {
        // End of a run
        if (currentRunRef.current === "scramble") {
          // Clear scrambling when all expected scramble moves have finished
          if (scrambleRemainingRef.current <= 0) {
            setIsScramblingState(false);
            currentRunRef.current = null;
          }
        }
        if (currentRunRef.current === "solve") {
          setIsSolving(false);
          currentRunRef.current = null;
        }
        // End of a run; reset highlight after a tick
        setTimeout(() => {
          setScrambleIndex(-1);
          setSolutionIndex(-1);
        }, 0);
      }
    },
    [pumpQueueSoon]
  );

  const handleOrbitControlsChange = useCallback((enabled: boolean) => {
    setOrbitControlsEnabled(enabled);
    // Also directly disable the controls if we have a ref
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = enabled;
    }
  }, []);

  const handleStartAnimation = useCallback(() => {
    setIsAnimating(true);
    isAnimatingRef.current = true;
  }, []);

  const [confirmSolveOpen, setConfirmSolveOpen] = useState(false);

  const handleGenerateSolution = useCallback(() => {
    // Solve current state using cubejs built-in kociemba
    const moves = cubeRef.current.solve();
    const algo = moves.join(" ");
    const steps = moves.map((m) => ({
      move: m as CubeMove,
      description: "",
    }));
    setSolution({ steps, moveCount: moves.length, algorithm: algo });
    setLastSolvedState(cubeRef.current.getState());
    setSolutionIndex(-1);
  }, []);

  const handleSolve = useCallback(() => {
    if (isAnimating || AnimationHelper.isLocked()) return;
    // Show loader in the modal immediately
    setIsSolving(true);
    // Defer heavy solve work to next tick so the spinner can render first
    setTimeout(() => {
      const currentState = cubeRef.current.getState();
      let movesToRun: string[];

      if (!solution || lastSolvedState !== currentState) {
        // Generate a fresh solution for the current cube state
        const fresh = cubeRef.current.solve();
        const algo = fresh.join(" ");
        const steps = fresh.map((m) => ({
          move: m as CubeMove,
          description: "",
        }));
        setSolution({ steps, moveCount: fresh.length, algorithm: algo });
        setLastSolvedState(currentState);
        movesToRun = fresh;
      } else {
        movesToRun = solution.steps.map((s) => s.move);
      }

      // Reset index before we enqueue so first pump isn't overridden
      setSolutionIndex(-1);
      // Mark this run before enqueuing so highlighting starts with the first move
      currentRunRef.current = "solve";
      enqueueMoves(movesToRun);
      // Close modal after work is queued
      setConfirmSolveOpen(false);
    }, 0);
  }, [enqueueMoves, isAnimating, solution, lastSolvedState]);

  // Use explicit scrambling state to avoid flicker and ensure re-enable
  const isScrambling = isScramblingState;
  return (
    <>
      <div className="min-h-[105dvh] flex flex-col bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 pb-28">
        {/* Header at top */}
        <div className="text-center py-4 shrink-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1 drop-shadow-lg">
            Tipton's Solver
          </h1>
          <p className="text-white/80 text-xs">
            Drag to rotate • Click faces to twist
          </p>
        </div>

        {/* Cube container fills available space */}
        <div className="flex-1 flex items-center justify-center px-4 min-h-0 mb-8">
          <div className="w-full max-w-4xl mx-auto relative bg-black/20 rounded-2xl overflow-hidden backdrop-blur-sm border border-white/20 shadow-2xl flex items-center justify-center h-full min-h-[300px]">
            {/* Status indicator - bottom left of cube container */}
            <div className="absolute left-4 bottom-4 z-30 pointer-events-none">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-base md:text-sm ${
                  isSolving
                    ? "bg-yellow-400 text-yellow-900"
                    : isScrambled
                    ? "bg-red-400 text-red-900"
                    : "bg-green-400 text-green-900"
                }`}
              >
                <span>{isSolving ? "⚡" : isScrambled ? "🔀" : "✅"}</span>
                {isSolving ? "Solving" : isScrambled ? "Scrambled" : "Solved"}
              </div>
            </div>
            {/* Floating Scramble/Solution overlay */}
            {scrambleMoves && scrambleMoves.length > 0 && !isSolving && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 bg-white/20 rounded-lg p-2 md:p-3 shadow-xl backdrop-blur-md flex flex-col items-center w-full max-w-[95vw] text-[1em] md:text-base">
                <h4 className="text-white font-semibold mb-1 text-[0.85em] md:text-lg flex items-center gap-2">
                  <span>🎲</span>
                  Scramble:
                </h4>
                <div className="flex flex-wrap gap-1 text-[0.8em] md:text-base">
                  {scrambleMoves.map((move, i) => (
                    <span
                      key={i}
                      className={`px-1 py-0.5 md:px-2 md:py-1 rounded font-mono transition-colors ${
                        i === scrambleIndex
                          ? "bg-yellow-400 text-yellow-900"
                          : "bg-white/30 text-white"
                      }`}
                    >
                      {move}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {solution &&
              solution.steps.length > 0 &&
              (isSolving || (!isSolving && scrambleMoves == null)) && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 bg-white/20 rounded-lg p-2 md:p-3 shadow-xl backdrop-blur-md flex flex-col items-center w-full max-w-[95vw] text-[1em] md:text-base">
                  <div className="flex items-center justify-between mb-1 md:mb-2 w-full">
                    <h4 className="text-white font-semibold text-[0.85em] md:text-lg flex items-center gap-2">
                      <span>🧠</span>
                      Solution:
                    </h4>
                    <span className="bg-purple-500 text-white px-1 py-0.5 md:px-2 md:py-1 rounded text-[0.8em] md:text-base font-semibold">
                      {solution.moveCount} moves
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 text-[0.8em] md:text-base">
                    {solution.steps.map((step, i) => (
                      <span
                        key={i}
                        className={`px-1 py-0.5 md:px-2 md:py-1 rounded font-mono transition-colors ${
                          i === solutionIndex
                            ? "bg-purple-400 text-purple-900"
                            : "bg-white/30 text-white"
                        }`}
                      >
                        {step.move}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            <Canvas
              camera={{ position: [5, 5, 5], fov: 60 }}
              className="w-full h-full"
            >
              <spotLight position={[-30, 20, 60]} intensity={0.3} castShadow />
              <ambientLight intensity={0.9} color="#eeeeee" />
              <RubiksCube3D
                cubeState={cube3D}
                pendingMove={pendingMove}
                onMoveAnimationDone={handleMoveAnimationDone}
                onStartAnimation={handleStartAnimation}
                isAnimating={isAnimating}
                onOrbitControlsChange={handleOrbitControlsChange}
                onDragMove={handleButtonMove}
              />
              <OrbitControls
                ref={orbitControlsRef}
                enabled={orbitControlsEnabled}
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
          </div>
        </div>
      </div>

      {/* Control panel fixed at bottom (mobile-safe) */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="w-full max-w-6xl mx-auto px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
          <ControlPanel
            onScramble={handleScramble}
            onSolve={() => {
              console.log("Solve button clicked, opening modal");
              setConfirmSolveOpen(true);
            }}
            onGenerateSolution={handleGenerateSolution}
            solution={solution}
            isScrambled={isScrambled}
            isSolving={isSolving}
            isScrambling={isScrambling}
            scrambleMoves={scrambleMoves}
            scrambleIndex={scrambleIndex}
            solutionIndex={solutionIndex}
          />
        </div>
      </div>

      {/* Modal stays above everything */}
      <ConfirmModal
        isOpen={confirmSolveOpen}
        title="Ready to Solve?"
        message="This will run the solver and execute all moves step-by-step until your cube is solved!"
        confirmText="Solve It!"
        cancelText="Cancel"
        onCancel={() => {
          console.log("Modal cancelled");
          setConfirmSolveOpen(false);
        }}
        onConfirm={handleSolve}
        isSolving={isSolving}
      />
    </>
  );
};

export default App;
