import { useRef, useState, useCallback, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
import RubiksCube3D, {
  type RubiksCube3DHandle,
} from "./components/RubiksCube3D_Simple";
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
  const cubeViewRef = useRef<RubiksCube3DHandle | null>(null);
  const cubeContainerRef = useRef<HTMLDivElement | null>(null);
  const pinchRef = useRef<{
    active: boolean;
    startDist: number;
    lastPinchTime: number;
  }>({ active: false, startDist: 0, lastPinchTime: 0 });
  // when two-finger spin mode is active we temporarily disable orbit controls - no extra state needed

  // Precision orbit mode: toggle for fine adjustments
  const [precisionMode, setPrecisionMode] = useState(false);
  const [precisionHold, setPrecisionHold] = useState(false); // active while holding Shift
  const lastTwoFingerTapRef = useRef<number>(0);
  const precisionActive = precisionMode || precisionHold;
  type OrbitFeel = "normal" | "snappy" | "smooth";
  const [orbitFeel, setOrbitFeel] = useState<OrbitFeel>("normal");

  const lastMoveTimeRef = useRef(0);
  const moveQueueRef = useRef<CubeMove[]>([]);
  const lastMoveSourceRef = useRef<"queue" | "manual" | null>(null);
  // Track which sequence the current queue represents for accurate highlighting
  const currentRunRef = useRef<null | "scramble" | "solve">(null);
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

  // Desktop: hold Shift for temporary precision
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") setPrecisionHold(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") setPrecisionHold(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // Mobile: two-finger double-tap toggles precision mode
  useEffect(() => {
    const el = cubeContainerRef.current;
    if (!el) return;
    const onTouchStart = (e: TouchEvent) => {
      // Only consider two-finger tap start (not moving yet)
      if (e.touches.length === 2) {
        const now = Date.now();
        if (now - lastTwoFingerTapRef.current < 350) {
          setPrecisionMode((p) => !p);
          lastTwoFingerTapRef.current = 0; // reset
        } else {
          lastTwoFingerTapRef.current = now;
        }
      }
    };
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart as any);
    };
  }, []);

  // Desktop: double-click anywhere in the cube container toggles precision mode
  const handleContainerDoubleClick = useCallback(() => {
    setPrecisionMode((p) => !p);
  }, []);

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

  // Touch handlers: detect pinch and double-pinch to toggle a spin between two orientations.
  const computeTouchDistance = (t0: Touch, t1: Touch) => {
    const dx = t0.clientX - t1.clientX;
    const dy = t0.clientY - t1.clientY;
    return Math.hypot(dx, dy);
  };

  useEffect(() => {
    const el = cubeContainerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Start pinch
        pinchRef.current.active = true;
        pinchRef.current.startDist = computeTouchDistance(
          e.touches[0],
          e.touches[1]
        );
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      // Prevent native pinch-zoom in mobile Safari
      if (e.touches.length >= 2) e.preventDefault();
    };

    const onTouchEnd = (e: TouchEvent) => {
      void e; // parameter intentionally unused
      // If we ended a pinch gesture, treat as one pinch
      if (pinchRef.current.active) {
        const now = Date.now();
        const since = now - pinchRef.current.lastPinchTime;
        if (since > 0 && since < 400) {
          // Double-pinch detected: toggle spin between two orientations (flip 180°)
          // Use the cube view ref to spin by 180° around view axis
          cubeViewRef.current?.spinAroundViewAxis(Math.PI);
          // reset lastPinchTime so triple doesn't retrigger
          pinchRef.current.lastPinchTime = 0;
        } else {
          pinchRef.current.lastPinchTime = now;
        }
      }
      pinchRef.current.active = false;
      pinchRef.current.startDist = 0;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);

    return () => {
      el.removeEventListener("touchstart", onTouchStart as any);
      el.removeEventListener("touchmove", onTouchMove as any);
      el.removeEventListener("touchend", onTouchEnd as any);
    };
  }, []);

  // Trackpad overlay drag state
  const trackpadDragRef = useRef<{ active: boolean; lastX: number } | null>(
    null
  );
  const handleTrackpadPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      trackpadDragRef.current = { active: true, lastX: e.clientX };
    },
    []
  );
  const handleTrackpadPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!trackpadDragRef.current?.active) return;
      const dx = e.clientX - trackpadDragRef.current.lastX;
      trackpadDragRef.current.lastX = e.clientX;
      // Convert pixels to radians; scale with precision mode for finer control
      const base = 0.004; // rad/px baseline
      const sensitivity = base * (precisionActive ? 0.4 : 1.0);
      // UX: dragging left should spin CW (negative angle), right = CCW (positive)
      const angle = dx * sensitivity;
      cubeViewRef.current?.spinAroundViewAxis(angle);
    },
    [precisionActive]
  );
  const handleTrackpadPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      trackpadDragRef.current = { active: false, lastX: 0 };
    },
    []
  );

  return (
    <>
      <div className="min-h-[108dvh] md:min-h-[105dvh] flex flex-col bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 pb-28">
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
          <div
            ref={cubeContainerRef}
            onDoubleClick={handleContainerDoubleClick}
            className="w-full max-w-4xl mx-auto relative bg-black/20 rounded-2xl overflow-hidden backdrop-blur-sm border border-white/20 shadow-2xl flex items-center justify-center h-full min-h-[300px]"
          >
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
            {/* Precision mode indicator */}
            {precisionActive && (
              <div className="absolute left-4 bottom-16 z-30 pointer-events-none">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-base md:text-sm bg-blue-400 text-blue-900">
                  <span>🎯</span>
                  Precision
                </div>
              </div>
            )}
            {/* Orbit feel selector */}
            <div className="absolute left-4 bottom-28 z-30">
              <div className="bg-white/80 backdrop-blur px-2 py-1 rounded-lg shadow flex items-center gap-1 text-xs md:text-sm">
                <span className="text-gray-800 font-semibold mr-1">Orbit:</span>
                {(
                  [
                    { k: "normal", label: "Normal" },
                    { k: "snappy", label: "Snappy" },
                    { k: "smooth", label: "Smooth" },
                  ] as Array<{ k: OrbitFeel; label: string }>
                ).map((opt) => (
                  <button
                    key={opt.k}
                    onClick={() => setOrbitFeel(opt.k)}
                    className={`px-2 py-0.5 rounded font-semibold transition ${
                      orbitFeel === opt.k
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 hover:bg-blue-100"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Scramble overlay stays after scrambling until X is clicked, Solution overlay after solve/generate until X is clicked */}
            {scrambleMoves &&
              scrambleMoves.length > 0 &&
              showScrambleOverlay &&
              !showSolutionOverlay && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 bg-white/20 rounded-lg p-2 md:p-3 shadow-xl backdrop-blur-md flex flex-col items-center w-full max-w-[95vw] text-[1em] md:text-base">
                  <div className="flex justify-between items-center w-full mb-1">
                    <h4 className="text-white font-semibold text-[0.85em] md:text-lg flex items-center gap-2">
                      <span>🎲</span>
                      Scramble:
                    </h4>
                    <button
                      className="ml-2 text-white/80 hover:text-white text-lg font-bold px-2 py-0.5 rounded transition"
                      aria-label="Close scramble overlay"
                      onClick={() => setShowScrambleOverlay(false)}
                    >
                      ×
                    </button>
                  </div>
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
            {solution && solution.steps.length > 0 && showSolutionOverlay && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 bg-white/20 rounded-lg p-2 md:p-3 shadow-xl backdrop-blur-md flex flex-col items-center w-full max-w-[95vw] text-[1em] md:text-base">
                <div className="flex items-center justify-between mb-1 md:mb-2 w-full">
                  <h4 className="text-white font-semibold text-[0.85em] md:text-lg flex items-center gap-2">
                    <span>🧠</span>
                    Solution:
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="bg-purple-500 text-white px-1 py-0.5 md:px-2 md:py-1 rounded text-[0.8em] md:text-base font-semibold">
                      {solution.moveCount} moves
                    </span>
                    <button
                      className="ml-2 text-white/80 hover:text-white text-lg font-bold px-2 py-0.5 rounded transition"
                      aria-label="Close solution overlay"
                      onClick={() => setShowSolutionOverlay(false)}
                    >
                      ×
                    </button>
                  </div>
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
              camera={{ position: [5, 5, 5], fov: 55 }}
              className="w-full h-full pt-3"
              // prevent default touch-action on canvas
              style={{ touchAction: "none" }}
            >
              <spotLight position={[-30, 20, 60]} intensity={0.3} castShadow />
              <ambientLight intensity={0.9} color="#eeeeee" />
              <RubiksCube3D
                ref={cubeViewRef}
                cubeState={cube3D}
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
                // TrackballControls props
                noRotate={false}
                noZoom={true}
                noPan={false}
                // Feel tuning
                staticMoving={orbitFeel === "snappy"}
                dynamicDampingFactor={(() => {
                  const base =
                    orbitFeel === "smooth"
                      ? 0.2
                      : orbitFeel === "snappy"
                      ? 0.05
                      : 0.1;
                  return precisionActive ? Math.min(0.3, base + 0.1) : base;
                })()}
                rotateSpeed={(() => {
                  const base =
                    orbitFeel === "snappy"
                      ? 1.6
                      : orbitFeel === "smooth"
                      ? 0.6
                      : 1.0;
                  return base * (precisionActive ? 0.5 : 1.0);
                })()}
                zoomSpeed={(() => {
                  const base =
                    orbitFeel === "snappy"
                      ? 1.6
                      : orbitFeel === "smooth"
                      ? 0.8
                      : 1.2;
                  return base * (precisionActive ? 0.6 : 1.0);
                })()}
                panSpeed={(() => {
                  const base =
                    orbitFeel === "snappy"
                      ? 1.4
                      : orbitFeel === "smooth"
                      ? 0.8
                      : 1.0;
                  return base * (precisionActive ? 0.6 : 1.0);
                })()}
                minDistance={3}
                maxDistance={15}
              />
            </Canvas>
            {/* Spin Trackpad - bottom right */}
            <div
              className="absolute right-3 bottom-3 z-30 select-none"
              aria-label="Spin trackpad"
            >
              <div
                onPointerDown={handleTrackpadPointerDown}
                onPointerMove={handleTrackpadPointerMove}
                onPointerUp={handleTrackpadPointerUp}
                onPointerCancel={handleTrackpadPointerUp}
                className="w-28 h-14 md:w-32 md:h-16 rounded-xl bg-white/30 backdrop-blur-md border border-white/40 shadow-lg flex items-center justify-center text-white text-xs md:text-sm font-semibold cursor-ew-resize"
                title="Drag left/right to spin"
              >
                ↺↻ Spin
              </div>
            </div>
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
