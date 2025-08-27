import { useRef, useState, useCallback, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { TrackballControls, PerformanceMonitor } from "@react-three/drei";
import RubiksCube3D from "@components/RubiksCube3D";
import ControlPanel from "@components/ControlPanel";
import { CubeJSWrapper } from "@utils/cubejsWrapper";
import cubejsTo3D from "@utils/cubejsTo3D";
import { AnimationHelper } from "@utils/animationHelper";
import type { CubeMove, Solution } from "@/types/cube";
import ConfirmModal from "@components/ConfirmModal";
import InfoModal from "@components/InfoModal";
import MoveOverlay from "@components/MoveOverlay";
import StatusBadge from "@components/UI/StatusBadge";
import Header from "@components/UI/Header";
import Footer from "@components/UI/Footer";
import SpinTrackpad from "@components/UI/SpinTrackpad";
import useIsTouchDevice from "@/hooks/useIsTouchDevice";
import CUBE_COLORS from "@/consts/cubeColours";
import useDprManager from "@/hooks/useDprManager";
import usePrecisionMode from "@/hooks/usePrecisionMode";
import useTwoFingerSpin from "@/hooks/useTwoFingerSpin";
import useTrackpadHandlers from "@/hooks/useTrackpadHandlers";
import type { RubiksCube3DHandle } from "@components/RubiksCube3D/types";
import InfoButton from "@components/UI/InfoButton";

const App = () => {
  const cubeRef = useRef(new CubeJSWrapper());
  const [cube3D, setCube3D] = useState(() =>
    cubejsTo3D(cubeRef.current.getCube())
  );
  const [isScrambled, setIsScrambled] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  const [isAutoOrienting, setIsAutoOrienting] = useState(false);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [lastSolvedState, setLastSolvedState] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState<CubeMove | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [orbitControlsEnabled, setOrbitControlsEnabled] = useState(true);
  const orbitControlsRef = useRef<any>(null);
  const cubeViewRef = useRef<RubiksCube3DHandle | null>(null);
  // touch count will be provided by the touch hook

  const cubeContainerRef = useRef<HTMLDivElement | null>(null);

  // Precision controls via hook
  const { precisionActive, handleContainerDoubleClick } = usePrecisionMode(
    cubeContainerRef as React.RefObject<HTMLElement>
  );

  const lastMoveTimeRef = useRef(0);
  const moveQueueRef = useRef<CubeMove[]>([]);
  const lastMoveSourceRef = useRef<"queue" | "manual" | null>(null);
  // Track which sequence the current queue represents for accurate highlighting
  const currentRunRef = useRef<null | "scramble" | "solve" | "auto-orient">(
    null
  );
  const [scrambleMoves, setScrambleMoves] = useState<string[] | null>(null);
  const [showScrambleOverlay, setShowScrambleOverlay] = useState(false);
  const [showSolutionOverlay, setShowSolutionOverlay] = useState(false);
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
    setShowScrambleOverlay(true);
    setShowSolutionOverlay(false);
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
        // If the system is not ready, retry the move on the next frame
        requestAnimationFrame(() => {
          handleButtonMove(move);
        });
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

        // For slice moves, apply the equivalent logical rotation to the cube's 3D orientation
        // applySliceMoveLogicalRotation(move);

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
        if (currentRunRef.current === "auto-orient") {
          setIsAutoOrienting(false);
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
    // keep React state in sync for UI/props and set the live controls instance immediately
    setOrbitControlsEnabled(enabled);
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = enabled;
      // optional: ensure a tick to apply damping changes
      if (typeof orbitControlsRef.current.update === "function") {
        orbitControlsRef.current.update();
      }
    }
  }, []);

  const handleStartAnimation = useCallback(() => {
    setIsAnimating(true);
    isAnimatingRef.current = true;
  }, []);

  const [confirmSolveOpen, setConfirmSolveOpen] = useState(false);

  const handleGenerateSolution = useCallback(() => {
    // Always compute and show solution for current cube state
    const moves = cubeRef.current.solve();
    const algo = moves.join(" ");
    const steps = moves.map((m) => ({
      move: m as CubeMove,
      description: "",
    }));
    setSolution({ steps, moveCount: moves.length, algorithm: algo });
    setLastSolvedState(cubeRef.current.getState());
    setSolutionIndex(-1);
    setShowSolutionOverlay(true);
  }, []);

  const handleSolve = useCallback(() => {
    if (isAnimating || AnimationHelper.isLocked()) return;
    // Step 1: Show loader and keep modal open immediately
    setIsSolving(true);
    // Step 2: After a frame, compute solution and close modal
    requestAnimationFrame(() => {
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
        // Clear scramble overlay and state immediately
        setShowScrambleOverlay(false);
        setScrambleMoves(null);
        setScrambleIndex(-1);
        setShowSolutionOverlay(true);
        // Now close modal and hide spinner
        setConfirmSolveOpen(false);
      }, 0);
    });
  }, [enqueueMoves, isAnimating, solution, lastSolvedState]);

  // Use explicit scrambling state to avoid flicker and ensure re-enable
  const isScrambling = isScramblingState;

  // precision keyboard/tap handlers moved into usePrecisionMode
  const { touchCount } = useTwoFingerSpin(
    cubeContainerRef as React.RefObject<HTMLDivElement>,
    cubeViewRef as React.RefObject<RubiksCube3DHandle>,
    precisionActive,
    handleOrbitControlsChange
  );

  // Prevent wheel from resizing/zooming the cube or scrolling the page
  useEffect(() => {
    const el = cubeContainerRef.current;
    if (!el) return;
    const onWheel = (ev: WheelEvent) => {
      // Prevent page scroll and Trackball zoom via wheel
      ev.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel as any);
  }, []);

  // touch/pinch logic moved to useTwoFingerSpin

  const {
    onPointerDown: handleTrackpadPointerDown,
    onPointerMove: handleTrackpadPointerMove,
    onPointerUp: handleTrackpadPointerUp,
  } = useTrackpadHandlers(
    cubeViewRef as React.RefObject<RubiksCube3DHandle>,
    precisionActive
  );

  const isTouchDevice = useIsTouchDevice();
  const { canvasDpr, attachSetDpr, setInteractiveDpr, onDecline, onIncline } =
    useDprManager(isTouchDevice);

  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <div
        className="min-h-[103.5dvh] flex flex-col pb-28"
        style={{
          background: `
            radial-gradient(
              circle at 50% 50%,
              rgba(0,0,0,0) 0%,
              rgba(0,0,0,0) 15%,
              rgba(0,0,0,0.45) 50%,
              rgba(0,0,0,0.6) 65%,
              rgba(0,0,0,0.7) 72%,
              #000000cf 80%,
              #000000 100%
            ),
            linear-gradient(45deg, #aee5ff 0%, #5b8bff 50%, #c86cff 100%)
          `,
          backgroundBlendMode: "normal",
        }}
      >
        {/* Header at top */}
        <Header />
        {/* Info icon top right */}
        <InfoButton onClick={() => setInfoOpen(true)} />
        {/* Cube container fills available space */}
        <div className="flex-1 flex items-center justify-center px-2 min-h-0">
          <div
            ref={cubeContainerRef}
            onDoubleClick={handleContainerDoubleClick}
            className="w-full max-w-6xl mx-auto relative bg-black/20 rounded-2xl overflow-hidden backdrop-blur-sm border border-white/20 shadow-2xl flex items-center justify-center h-full min-h-[300px]"
          >
            {/* Status indicator - bottom left of cube container */}
            <StatusBadge
              isScrambling={isScrambling}
              isSolving={isSolving}
              isAutoOrienting={isAutoOrienting}
              isScrambled={isScrambled}
            />
            {/* Orbit and precision UI moved into ControlPanel for layout consistency */}
            {/* Scramble overlay stays after scrambling until X is clicked, Solution overlay after solve/generate until X is clicked */}
            <MoveOverlay
              title="Scramble:"
              icon={<span>🎲</span>}
              moves={scrambleMoves || []}
              highlightIndex={scrambleIndex}
              show={
                !!(
                  scrambleMoves &&
                  scrambleMoves.length > 0 &&
                  showScrambleOverlay &&
                  !showSolutionOverlay
                )
              }
              onClose={() => setShowScrambleOverlay(false)}
              colorTheme="scramble"
            />
            <MoveOverlay
              title="Solution:"
              icon={<span>🧠</span>}
              moves={solution ? solution.steps.map((s) => s.move) : []}
              highlightIndex={solutionIndex}
              moveCount={solution?.moveCount}
              show={
                !!(solution && solution.steps.length > 0 && showSolutionOverlay)
              }
              onClose={() => setShowSolutionOverlay(false)}
              colorTheme="solution"
            />
            <Canvas
              camera={{ position: [5, 5, 5], fov: 53 }}
              className="w-full h-full pt-9"
              style={{ touchAction: "none" }}
              dpr={canvasDpr}
              gl={{
                antialias: true,
                powerPreference: "high-performance",
                alpha: true,
                stencil: false,
                depth: true,
                preserveDrawingBuffer: false,
              }}
              onCreated={(state) => {
                attachSetDpr(state.setDpr);
                // Add WebGL context loss handling to avoid full page reloads on iOS
                const canvas = state.gl.domElement as HTMLCanvasElement;
                const onLost = (ev: Event) => {
                  // Prevent default to allow manual restore
                  ev.preventDefault();
                };
                const onRestored = () => {
                  try {
                    state.gl.resetState();
                  } catch {}
                };
                canvas.addEventListener(
                  "webglcontextlost",
                  onLost as any,
                  false
                );
                canvas.addEventListener(
                  "webglcontextrestored",
                  onRestored as any,
                  false
                );
              }}
              onPointerDownCapture={(e) => {
                // Only adjust DPR on mobile for performance, not on desktop
                if (isTouchDevice) {
                  setInteractiveDpr();
                }
                cubeViewRef.current?.handlePointerDown(e);
              }}
              onPointerMoveCapture={() => {
                // Only adjust DPR on mobile for performance, not on desktop
                if (isTouchDevice) {
                  setInteractiveDpr();
                }
              }}
              onPointerUpCapture={() => {
                // Only adjust DPR on mobile for performance, not on desktop
                if (isTouchDevice) {
                  setInteractiveDpr();
                }
                cubeViewRef.current?.handlePointerUp?.();
              }}
            >
              <PerformanceMonitor onDecline={onDecline} onIncline={onIncline} />
              <spotLight position={[-30, 20, 60]} intensity={0.3} castShadow />
              <ambientLight intensity={1.1} color={CUBE_COLORS.WHITE} />
              <RubiksCube3D
                ref={cubeViewRef}
                cubeState={cube3D}
                touchCount={touchCount}
                pendingMove={pendingMove}
                onMoveAnimationDone={handleMoveAnimationDone}
                onStartAnimation={handleStartAnimation}
                isAnimating={isAnimating}
                onOrbitControlsChange={handleOrbitControlsChange}
                onDragMove={handleButtonMove}
              />
              <TrackballControls
                ref={orbitControlsRef}
                enabled={orbitControlsEnabled}
                noRotate={false}
                noZoom={true}
                noPan={false}
                staticMoving={false}
                dynamicDampingFactor={0.35}
                rotateSpeed={1.2}
                zoomSpeed={1.2}
                panSpeed={4.0}
                minDistance={3}
                maxDistance={15}
              />
            </Canvas>
            <SpinTrackpad
              onPointerDown={handleTrackpadPointerDown}
              onPointerMove={handleTrackpadPointerMove}
              onPointerUp={handleTrackpadPointerUp}
              onPointerCancel={handleTrackpadPointerUp}
              isTouchDevice={isTouchDevice}
            />
          </div>
        </div>
      </div>

      <ControlPanel
        onScramble={handleScramble}
        onSolve={() => setConfirmSolveOpen(true)}
        onGenerateSolution={handleGenerateSolution}
        solution={solution}
        isScrambled={isScrambled}
        isSolving={isSolving}
        isScrambling={isScrambling}
        scrambleMoves={scrambleMoves}
        scrambleIndex={scrambleIndex}
        solutionIndex={solutionIndex}
      />

      {/* Modal stays above everything */}
      <ConfirmModal
        isOpen={confirmSolveOpen}
        title="Ready to Solve?"
        message="This will run the solver and execute all moves step-by-step until your cube is solved!"
        confirmText="Solve It!"
        cancelText="Cancel"
        onCancel={() => setConfirmSolveOpen(false)}
        onConfirm={handleSolve}
        isSolving={isSolving}
      />
      <InfoModal isOpen={infoOpen} onClose={() => setInfoOpen(false)} />
      <Footer />
    </>
  );
};

export default App;
