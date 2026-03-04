import { useRef, useState, useCallback, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { TrackballControls, PerformanceMonitor } from "@react-three/drei";
import RubiksCube3D from "@components/RubiksCube3D";
import ControlPanel from "@components/ControlPanel";
import cubejsTo3D from "@utils/cubejsTo3D";
import { AnimationHelper } from "@utils/animationHelper";
import type { CubeMove } from "@/types/cube";
import ConfirmModal from "@components/UI/modals/shared/ConfirmModal";
import InfoModal from "@components/UI/modals/shared/InfoModal";
import MoveOverlay from "@components/MoveOverlay";
import DiceIcon from "@components/UI/Icons/DiceIcon";
import BrainIcon from "@components/UI/Icons/BrainIcon";
import StatusBadge from "@components/UI/StatusBadge";
import Header from "@components/UI/Header";
import Footer from "@components/UI/Footer";
import SpinTrackpad from "@components/UI/SpinTrackpad";
import TimerModal from "@components/UI/modals/timer/TimerModal";
import QuitTimerModal from "@components/UI/modals/timer/QuitTimerModal";
import ResetTimerModal from "@components/UI/modals/timer/ResetTimerModal";
import TimerDisplayContainer from "@components/TimerDisplayContainer";
import SolveSuccessModal from "@components/UI/modals/solution/SolveSuccessModal";
import SolutionGeneratedModal from "@components/UI/modals/solution/SolutionGeneratedModal";
import SolutionAlreadyGeneratedModal from "@components/UI/modals/solution/SolutionAlreadyGeneratedModal";
import BestTimesModal from "@components/UI/modals/shared/BestTimesModal";
import LearnToSolveModal from "@components/UI/modals/shared/LearnToSolveModal";
import renderLesson from "@components/lessons";
import BestTimesButton from "@components/UI/BestTimesButton";
import useIsTouchDevice from "@/hooks/useIsTouchDevice";
import useTimer from "@/hooks/useTimer";
import useBestTimes from "@/hooks/useBestTimes";
import useDprManager from "@/hooks/useDprManager";
import usePrecisionMode from "@/hooks/usePrecisionMode";
import useTwoFingerSpin from "@/hooks/useTwoFingerSpin";
import useTrackpadHandlers from "@/hooks/useTrackpadHandlers";
import useMoveQueue from "@/hooks/useMoveQueue";
import useUndoRedo from "@/hooks/useUndoRedo";
import useFadeToSolved from "@/hooks/useFadeToSolved";
import useScrambleLogic from "@/hooks/useScrambleLogic";
import useTimerSessionHandlers from "@/hooks/useTimerSessionHandlers";
import useSolveHandlers from "@/hooks/useSolveHandlers";
import type { RubiksCube3DHandle } from "@components/RubiksCube3D/types";
import InfoButton from "@components/UI/InfoButton";
import type { OrbitControlsInstance } from "./types/orbitControls";
import type { CustomWindowType } from "./types/window";
import useAppState from "./App/AppState";

const App = () => {
  const appState = useAppState();
  const {
    cubeRef,
    cube3D,
    setCube3D,
    isScrambled,
    setIsScrambled,
    isSolving,
    setIsSolving,
    isAutoOrienting,
    setIsAutoOrienting,
    solution,
    setSolution,
    lastSolvedState,
    setLastSolvedState,
    pendingMove,
    setPendingMove,
    isAnimating,
    setIsAnimating,
    orbitControlsEnabled,
    setOrbitControlsEnabled,
    showTimerModal,
    setShowTimerModal,
    isStartingSession,
    setIsStartingSession,
    showQuitTimerModal,
    setShowQuitTimerModal,
    isQuittingSession,
    setIsQuittingSession,
    showResetTimerModal,
    setShowResetTimerModal,
    isResettingSession,
    setIsResettingSession,
    showSolveSuccessModal,
    setShowSolveSuccessModal,
    finalSolveTime,
    setFinalSolveTime,
    isTimerEnabled,
    setIsTimerEnabled,
    bestTimeResult,
    setBestTimeResult,
    isGenerating,
    setIsGenerating,
    showSolutionGeneratedModal,
    setShowSolutionGeneratedModal,
    showSolutionAlreadyGeneratedModal,
    setShowSolutionAlreadyGeneratedModal,
    showBestTimesModal,
    setShowBestTimesModal,
    showLearnToSolveModal,
    setShowLearnToSolveModal,
    tutorialLessonId,
    setTutorialLessonId,
    moveHistory,
    setMoveHistory,
    historyIndex,
    setHistoryIndex,
    queueFast,
    setQueueFast,
    queueFastMs,
    setQueueFastMs,
    inputDisabled,
    setInputDisabled,
    scrambleMoves,
    setScrambleMoves,
    showScrambleOverlay,
    setShowScrambleOverlay,
    showSolutionOverlay,
    setShowSolutionOverlay,
    scrambleIndex,
    setScrambleIndex,
    solutionIndex,
    setSolutionIndex,
    isScramblingState,
    setIsScramblingState,
    previousCube3D,
    setPreviousCube3D,
    baselineCube3D,
    setBaselineCube3D,
    stickerGreyMap,
    setStickerGreyMap,
    colorFadeProgress,
    setColorFadeProgress,
    lastMoveTimeRef,
    moveQueueRef,
    lastMoveSourceRef,
    currentRunRef,
    solutionOverlaySourceRef,
    scrambleMovesRef,
    solutionRef,
    scrambleRemainingRef,
    scrambleRequestPendingRef,
    lastScrambleStartedAtRef,
    sessionPhaseRef,
    isAnimatingRef,
    pendingMoveRef,
    undoInProgressRef,
    redoInProgressRef,
  } = appState;

  const {
    timerState,
    getCurrentTime,
    startTimer,
    stopTimer,
    cancelTimer,
    resetTimer,
    isTimerActive,
  } = useTimer();

  const { addBestTime, resetBestTimes, getFormattedBestTimes, hasTimes } =
    useBestTimes();

  const orbitControlsRef = useRef<OrbitControlsInstance | null>(null);
  const cubeViewRef = useRef<RubiksCube3DHandle | null>(null);
  const cubeContainerRef = useRef<HTMLDivElement | null>(null);

  const { precisionActive, handleContainerDoubleClick } = usePrecisionMode(
    cubeContainerRef as React.RefObject<HTMLElement>,
  );

  isAnimatingRef.current = isAnimating;
  pendingMoveRef.current = pendingMove;

  useEffect(() => {
    scrambleMovesRef.current = scrambleMoves;
  }, [scrambleMoves]);
  useEffect(() => {
    solutionRef.current = solution;
  }, [solution]);

  const { pumpQueueSoon, enqueueMoves } = useMoveQueue({
    isAnimatingRef,
    pendingMoveRef,
    moveQueueRef,
    currentRunRef,
    scrambleMovesRef,
    solutionRef,
    lastMoveSourceRef,
    setScrambleIndex,
    setSolutionIndex,
    setPendingMove,
    setQueueFast,
    setQueueFastMs,
  });

  const { handleUndo, handleRedo, addMoveToHistory, clearMoveHistory } =
    useUndoRedo({
      moveHistory,
      historyIndex,
      isAnimating,
      setMoveHistory,
      setHistoryIndex,
      setPendingMove,
      lastMoveSourceRef,
      undoInProgressRef,
      redoInProgressRef,
    });

  const { fadeToSolvedState } = useFadeToSolved({
    cube3D,
    cubeRef,
    cubeViewRef,
    orbitControlsRef,
    moveQueueRef,
    currentRunRef,
    scrambleRemainingRef,
    solutionOverlaySourceRef,
    lastMoveSourceRef,
    isAnimatingRef,
    pendingMoveRef,
    sessionPhaseRef,
    clearMoveHistory,
    setCube3D,
    setPreviousCube3D,
    setBaselineCube3D,
    setStickerGreyMap,
    setColorFadeProgress,
    setScrambleMoves,
    setShowScrambleOverlay,
    setScrambleIndex,
    setSolution,
    setShowSolutionOverlay,
    setSolutionIndex,
    setIsSolving,
    setIsAutoOrienting,
    setPendingMove,
    setIsAnimating,
    setInputDisabled,
    setIsScrambled,
    setLastSolvedState,
    setOrbitControlsEnabled,
  });

  const { handleScramble, performAnimatedScramble } = useScrambleLogic({
    isAnimating,
    inputDisabled,
    isScramblingState,
    cubeRef,
    currentRunRef,
    lastScrambleStartedAtRef,
    scrambleRequestPendingRef,
    scrambleRemainingRef,
    solutionOverlaySourceRef,
    sessionPhaseRef,
    orbitControlsRef,
    enqueueMoves,
    clearMoveHistory,
    resetTimer,
    setPendingMove,
    setScrambleIndex,
    setSolutionIndex,
    setIsScramblingState,
    setIsScrambled,
    setSolution,
    setLastSolvedState,
    setIsGenerating,
    setShowSolutionGeneratedModal,
    setScrambleMoves,
    setShowScrambleOverlay,
    setShowSolutionOverlay,
    setIsTimerEnabled,
    setInputDisabled,
    setOrbitControlsEnabled,
  });

  const {
    handleStartTimer,
    handleTimerModalYes,
    handleTimerModalNo,
    handleTimerQuit,
    handleQuitTimerConfirm,
    handleQuitTimerCancel,
    handleTimerResetNew,
    handleResetTimerConfirm,
    handleResetTimerCancel,
    handleSolveSuccessTryAgain,
    handleSolveSuccessClose,
  } = useTimerSessionHandlers({
    fadeToSolvedState,
    performAnimatedScramble,
    resetTimer,
    cancelTimer,
    setShowTimerModal,
    setIsStartingSession,
    setIsTimerEnabled,
    setShowQuitTimerModal,
    setIsQuittingSession,
    setShowResetTimerModal,
    setIsResettingSession,
    setShowSolveSuccessModal,
  });

  const [confirmSolveOpen, setConfirmSolveOpen] = useState(false);

  const { handleMoveAnimationDone, handleGenerateSolution, handleSolve } =
    useSolveHandlers({
      isAnimating,
      isTimerEnabled,
      isTimerActive,
      solution,
      lastSolvedState,
      showSolutionOverlay,
      timerStartTime: timerState.startTime,
      cubeRef,
      cubeViewRef,
      currentRunRef,
      scrambleRemainingRef,
      solutionOverlaySourceRef,
      lastMoveSourceRef,
      isAnimatingRef,
      pendingMoveRef,
      moveQueueRef,
      sessionPhaseRef,
      enqueueMoves,
      pumpQueueSoon,
      clearMoveHistory,
      addMoveToHistory,
      startTimer,
      stopTimer,
      addBestTime,
      setCube3D,
      setPendingMove,
      setIsAnimating,
      setIsScrambled,
      setIsSolving,
      setIsAutoOrienting,
      setSolution,
      setLastSolvedState,
      setSolutionIndex,
      setScrambleIndex,
      setScrambleMoves,
      setShowScrambleOverlay,
      setShowSolutionOverlay,
      setIsScramblingState,
      setInputDisabled,
      setQueueFast,
      setQueueFastMs,
      setIsGenerating,
      setShowSolutionGeneratedModal,
      setShowSolutionAlreadyGeneratedModal,
      setShowSolveSuccessModal,
      setFinalSolveTime,
      setBestTimeResult,
      setConfirmSolveOpen,
    });

  const handleButtonMove = useCallback(
    (move: string) => {
      const now = Date.now();
      if (
        isAnimating ||
        AnimationHelper.isLocked() ||
        now - lastMoveTimeRef.current < 100
      ) {
        requestAnimationFrame(() => handleButtonMove(move));
        return;
      }
      lastMoveTimeRef.current = now;
      lastMoveSourceRef.current = "manual";
      setPendingMove(move as CubeMove);
    },
    [isAnimating],
  );

  const handleOrbitControlsChange = useCallback((enabled: boolean) => {
    setOrbitControlsEnabled(enabled);
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = enabled;
      if (typeof orbitControlsRef.current.update === "function")
        orbitControlsRef.current.update();
    }
  }, []);

  const handleStartAnimation = useCallback(() => {
    setIsAnimating(true);
    isAnimatingRef.current = true;
  }, []);

  const handleBestTimesOpen = useCallback(
    () => setShowBestTimesModal(true),
    [],
  );
  const handleBestTimesClose = useCallback(
    () => setShowBestTimesModal(false),
    [],
  );
  const handleBestTimesReset = useCallback(() => {
    resetBestTimes();
    setShowBestTimesModal(false);
  }, [resetBestTimes]);
  const handleLearnToSolveOpen = useCallback(
    () => setShowLearnToSolveModal(true),
    [],
  );

  const resetMainCube = useCallback(() => {
    AnimationHelper.forceUnlock();
    cubeRef.current.reset();
    setCube3D(cubejsTo3D(cubeRef.current.getCube()));
    clearMoveHistory();
    setPendingMove(null);
    pendingMoveRef.current = null;
    setIsAnimating(false);
    isAnimatingRef.current = false;
    lastMoveSourceRef.current = null;
    moveQueueRef.current = [];
    currentRunRef.current = null;
    scrambleRemainingRef.current = 0;
    setQueueFast(false);
    setQueueFastMs(null);
    setScrambleMoves(null);
    setShowScrambleOverlay(false);
    setScrambleIndex(-1);
    setSolution(null);
    setShowSolutionOverlay(false);
    setSolutionIndex(-1);
    solutionOverlaySourceRef.current = null;
    setIsSolving(false);
    setIsAutoOrienting(false);
    setIsScrambled(false);
    setIsScramblingState(false);
    setPreviousCube3D(null);
    setBaselineCube3D(null);
    setStickerGreyMap(new Map());
    setColorFadeProgress(0);
    setInputDisabled(false);
    sessionPhaseRef.current = "idle";
    setOrbitControlsEnabled(true);
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = true;
      if (typeof orbitControlsRef.current.update === "function")
        orbitControlsRef.current.update();
    }
    if (cubeContainerRef.current) {
      const canvas = cubeContainerRef.current.querySelector(
        "canvas",
      ) as HTMLElement | null;
      if (canvas) {
        canvas.style.pointerEvents = "auto";
        canvas.style.touchAction = "none";
      }
      const container = cubeContainerRef.current;
      if (container) {
        container.style.pointerEvents = "auto";
        container.style.touchAction = "none";
        container.style.userSelect = "none";
        container.style.webkitUserSelect = "none";
      }
    }
    if (cubeViewRef.current) {
      cubeViewRef.current.resetToInitialPosition(
        orbitControlsRef as unknown as React.RefObject<OrbitControlsInstance>,
        cubeRef,
        undefined,
      );
    }
  }, [
    clearMoveHistory,
    setCube3D,
    setOrbitControlsEnabled,
    setQueueFast,
    setQueueFastMs,
  ]);

  const [modalCloseCooldown, setModalCloseCooldown] = useState(false);

  const handleLearnToSolveClose = useCallback(() => {
    setShowLearnToSolveModal(false);
    setModalCloseCooldown(true);
    setCanvasReady(false);
    setOrbitControlsEnabled(false);
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = false;
    }
    if (cubeContainerRef.current) {
      cubeContainerRef.current.style.pointerEvents = "none";
      const canvas = cubeContainerRef.current.querySelector(
        "canvas",
      ) as HTMLElement | null;
      if (canvas) {
        canvas.style.pointerEvents = "none";
      }
    }
    setTimeout(() => {
      setModalCloseCooldown(false);
      setCanvasReady(true);
      const restoreTouchEvents = () => {
        setOrbitControlsEnabled(true);
        if (orbitControlsRef.current) {
          orbitControlsRef.current.enabled = true;
          if (typeof orbitControlsRef.current.update === "function") {
            orbitControlsRef.current.update();
          }
        }
        if (cubeContainerRef.current) {
          const canvas = cubeContainerRef.current.querySelector(
            "canvas",
          ) as HTMLElement | null;
          if (canvas) {
            canvas.style.pointerEvents = "auto";
            canvas.style.touchAction = "none";
          }
          const container = cubeContainerRef.current;
          if (container) {
            container.style.pointerEvents = "auto";
            container.style.touchAction = "none";
            container.style.userSelect = "none";
            container.style.webkitUserSelect = "none";
          }
        }
      };
      restoreTouchEvents();
    }, 500);
  }, [setOrbitControlsEnabled]);

  const handleTutorialStart = useCallback(
    (lessonId: string) => {
      resetMainCube();
      setTutorialLessonId(lessonId);
      setShowLearnToSolveModal(false);
    },
    [resetMainCube],
  );

  const tutorialLessonIdRef = useRef<string | null>(null);
  useEffect(() => {
    tutorialLessonIdRef.current = tutorialLessonId;
  }, [tutorialLessonId]);

  useEffect(() => {
    if (!tutorialLessonId && !showLearnToSolveModal) {
      const restoreEvents = () => {
        setOrbitControlsEnabled(true);
        if (orbitControlsRef.current) {
          orbitControlsRef.current.enabled = true;
          if (typeof orbitControlsRef.current.update === "function") {
            orbitControlsRef.current.update();
          }
        }
        if (cubeContainerRef.current) {
          const canvas = cubeContainerRef.current.querySelector(
            "canvas",
          ) as HTMLElement | null;
          if (canvas) {
            canvas.style.pointerEvents = "auto";
            canvas.style.touchAction = "none";
          }
          const container = cubeContainerRef.current;
          if (container) {
            container.style.pointerEvents = "auto";
            container.style.touchAction = "none";
            container.style.userSelect = "none";
            container.style.webkitUserSelect = "none";
          }
        }
      };
      setTimeout(restoreEvents, 100);
      setTimeout(restoreEvents, 400);
    }
  }, [tutorialLessonId, showLearnToSolveModal, setOrbitControlsEnabled]);

  const handleTutorialBack = useCallback(() => {
    const currentLessonId = tutorialLessonIdRef.current;
    setTutorialLessonId(null);
    (window as CustomWindowType).__tutorialBackLessonId = currentLessonId;
    resetMainCube();
    setShowLearnToSolveModal(true);
  }, [resetMainCube]);

  const isScrambling = isScramblingState;

  const [touchHookKey, setTouchHookKey] = useState(0);
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    if (!tutorialLessonId) {
      setCanvasReady(false);
      setTouchHookKey((prev) => prev + 1);
    }
  }, [tutorialLessonId]);

  const { touchCount } = useTwoFingerSpin(
    cubeContainerRef as React.RefObject<HTMLDivElement>,
    cubeViewRef as React.RefObject<RubiksCube3DHandle>,
    precisionActive,
    handleOrbitControlsChange,
    touchHookKey,
    modalCloseCooldown || !canvasReady,
  );

  useEffect(() => {
    const el = cubeContainerRef.current;
    if (!el) return;
    const onWheel = (ev: WheelEvent) => ev.preventDefault();
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel as EventListener);
  }, []);

  useEffect(() => {
    if (!tutorialLessonId) {
      const ensureTouchEvents = () => {
        const container = cubeContainerRef.current;
        if (!container) return;
        const canvas = container.querySelector("canvas") as HTMLElement | null;
        if (canvas) {
          canvas.style.pointerEvents = "auto";
          canvas.style.touchAction = "none";
        }
        container.style.pointerEvents = "auto";
        container.style.touchAction = "none";
      };
      const timeout1 = setTimeout(ensureTouchEvents, 50);
      const timeout2 = setTimeout(ensureTouchEvents, 200);
      const timeout3 = setTimeout(ensureTouchEvents, 500);
      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
        clearTimeout(timeout3);
      };
    }
  }, [tutorialLessonId]);

  useEffect(() => {
    const handleSolutionQueue = (event: CustomEvent) => {
      const { moves, fast } = event.detail as {
        moves: string[];
        fast?: boolean;
      };
      if (moves && moves.length > 0) enqueueMoves(moves, !!fast);
    };
    window.addEventListener(
      "queueSolutionMoves",
      handleSolutionQueue as EventListener,
    );
    return () =>
      window.removeEventListener(
        "queueSolutionMoves",
        handleSolutionQueue as EventListener,
      );
  }, [enqueueMoves]);

  const {
    onPointerDown: handleTrackpadPointerDown,
    onPointerMove: handleTrackpadPointerMove,
    onPointerUp: handleTrackpadPointerUp,
  } = useTrackpadHandlers(
    cubeViewRef as React.RefObject<RubiksCube3DHandle>,
    precisionActive,
  );

  const isTouchDevice = useIsTouchDevice();
  const { canvasDpr, attachSetDpr, setInteractiveDpr, onDecline, onIncline } =
    useDprManager();

  const [infoOpen, setInfoOpen] = useState(false);
  if (tutorialLessonId) {
    return renderLesson({
      lessonId: tutorialLessonId,
      onBack: handleTutorialBack,
    });
  }

  return (
    <>
      <div
        className="min-h-[100dvh] flex flex-col"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 10%, rgba(41,121,255,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 70% 50% at 85% 80%, rgba(255,23,68,0.1) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 60% 90%, rgba(255,145,0,0.08) 0%, transparent 50%),
            radial-gradient(ellipse 60% 50% at 10% 70%, rgba(0,230,118,0.06) 0%, transparent 50%),
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
        <Header />
        <BestTimesButton onClick={handleBestTimesOpen} />
        <InfoButton onClick={() => setInfoOpen(true)} />
        <div className="flex-1 flex items-center justify-center px-2 min-h-0">
          <div
            key={tutorialLessonId ? "tutorial" : "main"}
            ref={cubeContainerRef}
            onDoubleClick={handleContainerDoubleClick}
            className="w-full max-w-6xl mx-auto relative bg-black/15 rounded-2xl overflow-hidden backdrop-blur-sm border border-white/[0.08] flex items-center justify-center h-full min-h-[300px]"
            style={{
              pointerEvents: canvasReady ? "auto" : "none",
              boxShadow:
                "0 25px 60px -12px rgba(0,0,0,0.4), 0 0 80px -20px rgba(41,121,255,0.06)",
            }}
          >
            {/* Transparent overlay during timer session transitions (start/quit/reset) and fade — blocks interaction like in lessons */}
            {(isStartingSession ||
              isQuittingSession ||
              isResettingSession ||
              inputDisabled) && (
              <div
                className="absolute inset-0 z-40 pointer-events-auto"
                data-locked-overlay="true"
                aria-hidden
              />
            )}
            <StatusBadge
              isScrambling={isScrambling}
              isSolving={isSolving}
              isAutoOrienting={isAutoOrienting}
              isScrambled={isScrambled}
            />
            {isTimerEnabled ? (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
                <TimerDisplayContainer
                  getCurrentTime={getCurrentTime}
                  isTimerActive={isTimerActive}
                  isScrambling={isScrambling}
                />
              </div>
            ) : (
              <>
                <MoveOverlay
                  title="Scramble:"
                  icon={<DiceIcon size={20} className="inline-block" />}
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
                  icon={<BrainIcon size={20} className="inline-block" />}
                  moves={solution ? solution.steps.map((s) => s.move) : []}
                  highlightIndex={solutionIndex}
                  moveCount={solution?.moveCount}
                  show={
                    !!(
                      solution &&
                      solution.steps.length > 0 &&
                      showSolutionOverlay
                    )
                  }
                  onClose={() => {
                    setShowSolutionOverlay(false);
                    solutionOverlaySourceRef.current = null;
                  }}
                  colorTheme="solution"
                />
              </>
            )}
            <Canvas
              camera={{ position: [5, 5, 5], fov: 53 }}
              className="w-full h-full pt-9"
              style={{
                touchAction: "none",
                pointerEvents: canvasReady ? "auto" : "none",
              }}
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
                const canvas = state.gl.domElement as HTMLCanvasElement;
                const onLost = (ev: Event) => ev.preventDefault();
                const onRestored = () => {
                  try {
                    state.gl.resetState();
                  } catch {}
                };
                canvas.addEventListener("webglcontextlost", onLost, false);
                canvas.addEventListener(
                  "webglcontextrestored",
                  onRestored,
                  false,
                );
                setTimeout(() => {
                  setCanvasReady(true);
                }, 800);
              }}
              onPointerDownCapture={(e) => {
                setInteractiveDpr();
                cubeViewRef.current?.handlePointerDown(e);
              }}
              onPointerMoveCapture={() => {
                setInteractiveDpr();
              }}
              onPointerUpCapture={() => {
                setInteractiveDpr();
                cubeViewRef.current?.handlePointerUp?.();
              }}
            >
              <PerformanceMonitor onDecline={onDecline} onIncline={onIncline} />
              <spotLight position={[-30, 20, 60]} intensity={0.35} />
              <ambientLight intensity={1.25} color={"#fff"} />
              <pointLight
                position={[0, -8, 4]}
                intensity={0.15}
                color="#FF9100"
                distance={20}
              />
              <RubiksCube3D
                ref={cubeViewRef}
                cubeState={cube3D}
                previousCube3D={previousCube3D}
                baselineCube3D={baselineCube3D}
                stickerGreyMap={stickerGreyMap}
                colorFadeProgress={colorFadeProgress}
                touchCount={touchCount}
                pendingMove={pendingMove}
                onMoveAnimationDone={handleMoveAnimationDone}
                onStartAnimation={handleStartAnimation}
                isAnimating={isAnimating}
                onOrbitControlsChange={handleOrbitControlsChange}
                onDragMove={handleButtonMove}
                isTimerMode={isTimerEnabled}
                moveSource={lastMoveSourceRef.current}
                queueFast={queueFast}
                queueFastMs={queueFastMs}
                inputDisabled={inputDisabled}
              />
              {canvasReady && (
                <TrackballControls
                  ref={
                    orbitControlsRef as unknown as React.ComponentRef<
                      typeof TrackballControls
                    >
                  }
                  enabled={orbitControlsEnabled && !modalCloseCooldown}
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
              )}
            </Canvas>
            {!inputDisabled && (
              <SpinTrackpad
                onPointerDown={handleTrackpadPointerDown}
                onPointerMove={handleTrackpadPointerMove}
                onPointerUp={handleTrackpadPointerUp}
                onPointerCancel={handleTrackpadPointerUp}
                isTouchDevice={isTouchDevice}
              />
            )}
          </div>
        </div>

        <ControlPanel
          onScramble={handleScramble}
          onSolve={() => setConfirmSolveOpen(true)}
          onGenerateSolution={handleGenerateSolution}
          onStartTimer={handleStartTimer}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={moveHistory.length > 0 && historyIndex >= 0}
          canRedo={historyIndex < moveHistory.length - 1}
          onTimerQuit={handleTimerQuit}
          onTimerReset={handleTimerResetNew}
          isTimerRunning={isTimerActive}
          solution={solution}
          isScrambled={isScrambled}
          isSolving={isSolving}
          isScrambling={isScrambling}
          scrambleMoves={scrambleMoves}
          scrambleIndex={scrambleIndex}
          solutionIndex={solutionIndex}
          isTimerActive={isTimerEnabled}
          isGenerating={isGenerating}
          showSolutionGeneratedModal={showSolutionGeneratedModal}
          showSolutionAlreadyGeneratedModal={showSolutionAlreadyGeneratedModal}
          inputDisabled={inputDisabled}
          onLearnToSolve={handleLearnToSolveOpen}
        />

        <Footer />
      </div>

      <ConfirmModal
        isOpen={confirmSolveOpen}
        title="Ready to Solve?"
        message="This will run the solver and execute all moves step-by-step until your cube is solved!"
        confirmText="Solve It!"
        cancelText="Cancel"
        onCancel={() => setConfirmSolveOpen(false)}
        onConfirm={handleSolve}
        isSolving={isSolving}
        theme="green"
      />
      <InfoModal isOpen={infoOpen} onClose={() => setInfoOpen(false)} />

      <TimerModal
        isOpen={showTimerModal}
        onClose={() => setShowTimerModal(false)}
        onStartTimer={handleTimerModalYes}
        onSkip={handleTimerModalNo}
        isStarting={isStartingSession}
      />
      <QuitTimerModal
        isOpen={showQuitTimerModal}
        onClose={handleQuitTimerCancel}
        onConfirm={handleQuitTimerConfirm}
        isQuitting={isQuittingSession}
      />
      <ResetTimerModal
        isOpen={showResetTimerModal}
        onClose={handleResetTimerCancel}
        onConfirm={handleResetTimerConfirm}
        isResetting={isResettingSession}
      />
      <SolveSuccessModal
        isOpen={showSolveSuccessModal}
        time={finalSolveTime}
        onTryAgain={handleSolveSuccessTryAgain}
        onClose={handleSolveSuccessClose}
        bestTimeResult={bestTimeResult}
      />
      <SolutionGeneratedModal
        isOpen={showSolutionGeneratedModal}
        onClose={() => setShowSolutionGeneratedModal(false)}
      />
      <SolutionAlreadyGeneratedModal
        isOpen={showSolutionAlreadyGeneratedModal}
        onClose={() => setShowSolutionAlreadyGeneratedModal(false)}
      />
      <BestTimesModal
        isOpen={showBestTimesModal}
        onClose={handleBestTimesClose}
        bestTimes={getFormattedBestTimes()}
        hasTimes={hasTimes}
        onReset={handleBestTimesReset}
      />
      <LearnToSolveModal
        isOpen={showLearnToSolveModal}
        onClose={handleLearnToSolveClose}
        onStartTutorial={handleTutorialStart}
        initialLessonId={
          (window as CustomWindowType).__tutorialBackLessonId || undefined
        }
      />
    </>
  );
};

export default App;
