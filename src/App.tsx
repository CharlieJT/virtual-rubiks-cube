import { useRef, useState, useCallback, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { TrackballControls, PerformanceMonitor } from "@react-three/drei";
import RubiksCube3D, {
  type RubiksCube3DHandle,
} from "@components/RubiksCube3D";
import ControlPanel from "@components/ControlPanel";
import { CubeJSWrapper } from "@utils/cubejsWrapper";
import cubejsTo3D from "@utils/cubejsTo3D";
import { AnimationHelper } from "@utils/animationHelper";
import { activeTouches } from "@utils/touchState";
import type { CubeMove, Solution } from "@/types/cube";
import ConfirmModal from "@components/ConfirmModal";
import MoveOverlay from "@components/MoveOverlay";
import StatusBadge from "@components/UI/StatusBadge";
import Header from "@components/UI/Header";
import SpinTrackpad from "@components/UI/SpinTrackpad";
import useIsTouchDevice from "@/hooks/useIsTouchDevice";
import CUBE_COLORS from "./consts/cubeColours";

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
  const [touchCount, setTouchCount] = useState(0);
  const cubeContainerRef = useRef<HTMLDivElement | null>(null);

  const pinchRef = useRef<{
    active: boolean;
    startDist: number;
    lastPinchTime: number;
  }>({ active: false, startDist: 0, lastPinchTime: 0 });
  // when two-finger spin mode is active we temporarily disable orbit controls
  // only need the setter to toggle side-effects; value itself is unused
  const [, setTwoFingerMode] = useState(false);

  // Precision orbit mode: toggle for fine adjustments
  const [precisionMode, setPrecisionMode] = useState(false);
  const [precisionHold, setPrecisionHold] = useState(false); // active while holding Shift
  const lastTwoFingerTapRef = useRef<number>(0);
  const precisionActive = precisionMode || precisionHold;

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
      // mirror active touch count for child components
      setTouchCount(e.touches.length);
      activeTouches.count = e.touches.length;
      if (e.touches.length === 2) {
        // If a slice drag is active, give it a chance to complete before switching to spin mode
        // Don't immediately abort - let the second touch potentially start a new move
        if (cubeViewRef.current?.isDraggingSlice?.()) {
          // Wait a bit to see if a second move starts, if not, then switch to spin mode
          setTimeout(() => {
            // Only switch to spin mode if still 2+ touches and still only one drag active
            if (
              activeTouches.count >= 2 &&
              cubeViewRef.current?.isDraggingSlice?.()
            ) {
              // Second touch didn't start a move, switch to spin mode
              cubeViewRef.current?.abortActiveDrag();
              initiateTwoFingerMode(e);
            }
          }, 100);
          return;
        }
        // No active drag, start two-finger mode immediately
        initiateTwoFingerMode(e);
      }
    };

    const initiateTwoFingerMode = (e: TouchEvent) => {
      // Enter explicit two-finger spin mode
      pinchRef.current.active = true;
      pinchRef.current.startDist = computeTouchDistance(
        e.touches[0],
        e.touches[1]
      );
      // store previous angle between the two touches for incremental rotation
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      (pinchRef.current as any).prevAngle = Math.atan2(dy, dx);
      setTwoFingerMode(true);
      setOrbitControlsEnabled(false);
      if (orbitControlsRef.current) orbitControlsRef.current.enabled = false;
      // disable pointer events on canvas so single-pointer handlers don't fire
      const elCanvas = el.querySelector("canvas") as HTMLElement | null;
      if (elCanvas) elCanvas.style.pointerEvents = "none";
    };

    const onTouchMove = (e: TouchEvent) => {
      // keep shared synchronous state in sync for mid-gesture checks
      activeTouches.count = e.touches.length;
      if (e.touches.length >= 2) {
        // Prevent native pinch-zoom/page scroll
        e.preventDefault();
        if (!pinchRef.current.active) return;
        // Compute current angle between touches
        const dx = e.touches[1].clientX - e.touches[0].clientX;
        const dy = e.touches[1].clientY - e.touches[0].clientY;
        const nowAngle = Math.atan2(dy, dx);
        const prevAngle = (pinchRef.current as any).prevAngle as
          | number
          | undefined;
        if (prevAngle !== undefined) {
          // compute smallest signed delta
          let delta = nowAngle - prevAngle;
          // normalize to [-π, π]
          while (delta > Math.PI) delta -= Math.PI * 2;
          while (delta < -Math.PI) delta += Math.PI * 2;
          // convert to cube spin: use delta directly so clockwise finger twist produces clockwise cube spin
          const spin = delta;
          cubeViewRef.current?.spinAroundViewAxis(spin);
        }
        (pinchRef.current as any).prevAngle = nowAngle;
      }
      // update active touch count during move
      setTouchCount(e.touches.length);
    };

    const onTouchEnd = (e: TouchEvent) => {
      // do not trigger any automatic spin on touchend; user-controlled spinning only
      // Only re-enable when no touches remain (both fingers truly off screen)
      // update active touch count
      setTouchCount(e.touches.length);
      activeTouches.count = e.touches.length;
      if (e.touches.length === 0) {
        pinchRef.current.active = false;
        pinchRef.current.startDist = 0;
        (pinchRef.current as any).prevAngle = undefined;
        setTwoFingerMode(false);
        setOrbitControlsEnabled(true);
        if (orbitControlsRef.current) orbitControlsRef.current.enabled = true;
        const elCanvas = el.querySelector("canvas") as HTMLElement | null;
        if (elCanvas) elCanvas.style.pointerEvents = "auto";
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);

    // Also listen on window so multi-touch anywhere (e.g., second finger outside cube) toggles two-finger mode.
    const winTouchStart = (e: TouchEvent) => {
      activeTouches.count = e.touches.length;
      setTouchCount(e.touches.length);
      // If a second (or more) finger lands anywhere, force-disable orbit to prevent floating
      if (e.touches.length >= 2) {
        // Abort any active slice drag to avoid conflicting states
        cubeViewRef.current?.abortActiveDrag?.();
        // Disable orbit immediately
        setOrbitControlsEnabled(false);
        if (orbitControlsRef.current) orbitControlsRef.current.enabled = false;
        // Disable pointer events on canvas so single-pointer handlers don't fire
        const elCanvas = cubeContainerRef.current?.querySelector(
          "canvas"
        ) as HTMLElement | null;
        if (elCanvas) elCanvas.style.pointerEvents = "none";
      }
    };

    const winTouchMove = (e: TouchEvent) => {
      activeTouches.count = e.touches.length;
      setTouchCount(e.touches.length);
      // Keep orbit disabled while multi-touch is active
      if (e.touches.length >= 2) {
        setOrbitControlsEnabled(false);
        if (orbitControlsRef.current) orbitControlsRef.current.enabled = false;
      }
    };

    const winTouchEnd = (e: TouchEvent) => {
      activeTouches.count = e.touches.length;
      setTouchCount(e.touches.length);
      // Re-enable orbit and canvas interactivity only when all touches are lifted
      if (e.touches.length === 0) {
        setOrbitControlsEnabled(true);
        if (orbitControlsRef.current) orbitControlsRef.current.enabled = true;
        const elCanvas = cubeContainerRef.current?.querySelector(
          "canvas"
        ) as HTMLElement | null;
        if (elCanvas) elCanvas.style.pointerEvents = "auto";
      }
    };
    window.addEventListener("touchstart", winTouchStart, { passive: false });
    window.addEventListener("touchmove", winTouchMove, { passive: false });
    window.addEventListener("touchend", winTouchEnd);

    return () => {
      el.removeEventListener("touchstart", onTouchStart as any);
      el.removeEventListener("touchmove", onTouchMove as any);
      el.removeEventListener("touchend", onTouchEnd as any);
      window.removeEventListener("touchstart", winTouchStart as any);
      window.removeEventListener("touchmove", winTouchMove as any);
      window.removeEventListener("touchend", winTouchEnd as any);
    };
  }, [precisionActive]);

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

  const isTouchDevice = useIsTouchDevice();
  // High quality with enhanced anti-aliasing: higher DPR + better sampling for smooth edges
  const canvasDpr: [number, number] = isTouchDevice ? [2.3, 3.0] : [1.5, 2.2];
  // Allow dynamic DPR tuning based on performance
  const setDprRef = useRef<((dpr: number) => void) | null>(null);
  // Interaction-aware DPR: lower during interaction, raise a bit when idle
  const dprTimerRef = useRef<number | null>(null);
  const setInteractiveDpr = useCallback(() => {
    // Lower DPR a touch while interacting; raise when idle for clarity
    const interDpr = isTouchDevice ? 2.2 : 1.0;
    setDprRef.current?.(interDpr);
    if (dprTimerRef.current) window.clearTimeout(dprTimerRef.current);
    dprTimerRef.current = window.setTimeout(() => {
      const idleDpr = isTouchDevice ? 3.0 : 1.3;
      setDprRef.current?.(idleDpr);
      dprTimerRef.current = null;
    }, 900);
  }, [isTouchDevice]);

  return (
    <>
      <div
        className="min-h-[105dvh] flex flex-col pb-28"
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
        {/* Cube container fills available space */}
        <div className="flex-1 flex items-center justify-center px-2 min-h-0">
          <div
            ref={cubeContainerRef}
            onDoubleClick={handleContainerDoubleClick}
            className="w-full max-w-4xl mx-auto relative bg-black/20 rounded-2xl overflow-hidden backdrop-blur-sm border border-white/20 shadow-2xl flex items-center justify-center h-full min-h-[300px]"
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
                setDprRef.current = state.setDpr;
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
              <PerformanceMonitor
                onDecline={() => setDprRef.current?.(isTouchDevice ? 1.8 : 1.2)}
                onIncline={() => setDprRef.current?.(isTouchDevice ? 2.8 : 2.0)}
              />
              <spotLight position={[-30, 20, 60]} intensity={0.3} castShadow />
              <ambientLight intensity={0.95} color={CUBE_COLORS.WHITE} />
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
    </>
  );
};

export default App;
