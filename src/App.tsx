import { useRef, useState, useCallback, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { TrackballControls, PerformanceMonitor } from "@react-three/drei";
import RubiksCube3D from "@components/RubiksCube3D";
import ControlPanel from "@components/ControlPanel";
import cubejsTo3D from "@utils/cubejsTo3D";
import { AnimationHelper } from "@utils/animationHelper";
import type { CubeMove, CubeState } from "@/types/cube";
import CUBE_COLORS from "@/consts/cubeColours";
import ConfirmModal from "@components/UI/modals/shared/ConfirmModal";
import InfoModal from "@components/UI/modals/shared/InfoModal";
import MoveOverlay from "@components/MoveOverlay";
import StatusBadge from "@components/UI/StatusBadge";
import Header from "@components/UI/Header";
import Footer from "@components/UI/Footer";
import SpinTrackpad from "@components/UI/SpinTrackpad";
import TimerModal from "@components/UI/modals/timer/TimerModal";
import QuitTimerModal from "@components/UI/modals/timer/QuitTimerModal";
import ResetTimerModal from "@components/UI/modals/timer/ResetTimerModal";
import TimerDisplay from "@components/TimerDisplay";
import SolveSuccessModal from "@components/UI/modals/solution/SolveSuccessModal";
import SolutionGeneratedModal from "@components/UI/modals/solution/SolutionGeneratedModal";
import SolutionAlreadyGeneratedModal from "@components/UI/modals/solution/SolutionAlreadyGeneratedModal";
import BestTimesModal from "@components/UI/modals/shared/BestTimesModal";
import LearnToSolveModal from "@components/UI/modals/shared/LearnToSolveModal";
import renderLesson from "@components/lessons";
import BestTimesButton from "@components/UI/BestTimesButton";
import useIsTouchDevice from "@/hooks/useIsTouchDevice";
import useTimer from "@/hooks/useTimer";
import { useBestTimes } from "@/hooks/useBestTimes";
import useDprManager from "@/hooks/useDprManager";
import usePrecisionMode from "@/hooks/usePrecisionMode";
import useTwoFingerSpin from "@/hooks/useTwoFingerSpin";
import useTrackpadHandlers from "@/hooks/useTrackpadHandlers";
import type { RubiksCube3DHandle } from "@components/RubiksCube3D/types";
import InfoButton from "@components/UI/InfoButton";
import type { OrbitControlsInstance } from "./types/orbitControls";
import type { CustomWindowType } from "./types/window";
import { useAppState } from "./App/AppState";

const App = () => {
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
  } = useAppState();

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

  const formatTimerMs = useCallback((ms: number): string => {
    const totalSeconds = ms / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toFixed(2)
      .padStart(5, "0")}`;
  }, []);

  const getInverseMove = useCallback((move: string): string => {
    if (move.endsWith("'")) return move.slice(0, -1);
    if (move.endsWith("2")) return move;
    return move + "'";
  }, []);

  const orbitControlsRef = useRef<OrbitControlsInstance | null>(null);
  const cubeViewRef = useRef<RubiksCube3DHandle | null>(null);
  const cubeContainerRef = useRef<HTMLDivElement | null>(null);

  const { precisionActive, handleContainerDoubleClick } = usePrecisionMode(
    cubeContainerRef as React.RefObject<HTMLElement>
  );

  isAnimatingRef.current = isAnimating;
  pendingMoveRef.current = pendingMove;

  useEffect(() => {
    scrambleMovesRef.current = scrambleMoves;
  }, [scrambleMoves]);
  useEffect(() => {
    solutionRef.current = solution;
  }, [solution]);

  const pumpQueue = useCallback(() => {
    if (isAnimatingRef.current || AnimationHelper.isLocked()) return;
    if (pendingMoveRef.current) return;
    const next = moveQueueRef.current.shift();
    if (next) {
      if (currentRunRef.current === "scramble") {
        setScrambleIndex((i) => Math.min(i + 1, (scrambleMovesRef.current?.length ?? 1) - 1));
      } else if (currentRunRef.current === "solve") {
        setSolutionIndex((i) => Math.min(i + 1, (solutionRef.current?.steps.length ?? 1) - 1));
      }
      lastMoveSourceRef.current = "queue";
      setPendingMove(next);
      pendingMoveRef.current = next;
    }
  }, []);

  const pumpQueueSoon = useCallback(() => {
    const attempt = () => {
      if (AnimationHelper.isLocked() || isAnimatingRef.current || pendingMoveRef.current) {
        setTimeout(attempt, 0);
        return;
      }
      pumpQueue();
    };
    setTimeout(attempt, 0);
  }, [pumpQueue]);

  const enqueueMoves = useCallback(
    (moves: string[], fast: boolean = false, fastMs?: number | null) => {
      if (fast) setQueueFast(true);
      if (typeof fastMs === "number") setQueueFastMs(fastMs);
      moveQueueRef.current.push(...(moves as CubeMove[]));
      pumpQueueSoon();
    },
    [pumpQueueSoon]
  );

  const executeScramble = useCallback(() => {
    if (isAnimating || AnimationHelper.isLocked()) return;
    if (currentRunRef.current === "scramble" || isScramblingState) return;
    const now = Date.now();
    if (now - lastScrambleStartedAtRef.current < 400) return;
    setPendingMove(null);

    const scramble = cubeRef.current.generateScramble(20);
    setScrambleIndex(-1);
    setSolutionIndex(-1);
    currentRunRef.current = "scramble";
    setIsScramblingState(true);
    scrambleRequestPendingRef.current = false;
    lastScrambleStartedAtRef.current = now;
    scrambleRemainingRef.current = scramble.length;
    enqueueMoves(scramble);
    setIsScrambled(true);
    sessionPhaseRef.current = "scramble";
    setSolution(null);
    setLastSolvedState(null);
    setIsGenerating(false);
    setShowSolutionGeneratedModal(false);
    setScrambleMoves(scramble);
    setShowScrambleOverlay(true);
    setShowSolutionOverlay(false);
    solutionOverlaySourceRef.current = null;
  }, [enqueueMoves, isAnimating]);

  const clearMoveHistory = useCallback(() => {
    setMoveHistory([]);
    setHistoryIndex(-1);
  }, []);

  const fadeToSolvedState = useCallback(
    (onComplete?: () => void) => {
      moveQueueRef.current = [];
      currentRunRef.current = null;
      scrambleRemainingRef.current = 0;
      setScrambleMoves(null);
      setShowScrambleOverlay(false);
      setScrambleIndex(-1);
      setSolution(null);
      setShowSolutionOverlay(false);
      setSolutionIndex(-1);
      solutionOverlaySourceRef.current = null;
      setIsSolving(false);
      setIsAutoOrienting(false);
      setPendingMove(null);
      pendingMoveRef.current = null;
      setIsAnimating(false);
      isAnimatingRef.current = false;
      lastMoveSourceRef.current = null;
      clearMoveHistory();
      setInputDisabled(true);
      sessionPhaseRef.current = "transition";

      const currentCube3D = cube3D;
      setPreviousCube3D(currentCube3D);

      const solvedCube = new (cubeRef.current.constructor as typeof import("@utils/cubejsWrapper").CubeJSWrapper)();
      const solvedCube3D = cubejsTo3D(solvedCube.getCube());
      setBaselineCube3D(solvedCube3D);

      const greyMap = new Map<string, boolean>();
      const faceKeys: Array<keyof CubeState["colors"]> = ["front", "back", "left", "right", "top", "bottom"];

      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
          for (let z = 0; z < 3; z++) {
            const currentPiece = currentCube3D[x]?.[y]?.[z];
            const solvedPiece = solvedCube3D[x]?.[y]?.[z];
            if (currentPiece && solvedPiece) {
              for (const face of faceKeys) {
                const currentColor = currentPiece.colors[face] || CUBE_COLORS.BLACK;
                const solvedColor = solvedPiece.colors[face] || CUBE_COLORS.BLACK;
                const key = `${x},${y},${z},${face}`;
                if (currentColor !== CUBE_COLORS.BLACK && currentColor !== solvedColor) {
                  greyMap.set(key, true);
                }
              }
            }
          }
        }
      }

      setStickerGreyMap(greyMap);
      setColorFadeProgress(0);

      if (cubeViewRef.current) {
        cubeViewRef.current.resetToInitialPosition(
          orbitControlsRef as unknown as React.RefObject<OrbitControlsInstance>,
          cubeRef,
          undefined
        );
      }

      const phase1Duration = 120;
      const phase2Delay = 120;
      const phase2Duration = 120;
      const totalFadeDuration = phase1Duration + phase2Delay + phase2Duration;
      let startTime: number | null = null;

      const animateFade = (timestamp: number) => {
        if (startTime === null) startTime = timestamp;
        const elapsed = timestamp - startTime;

        let progress = 0;
        if (elapsed < phase1Duration) {
          progress = (elapsed / phase1Duration) * 0.5;
        } else if (elapsed < phase1Duration + phase2Delay) {
          progress = 0.5;
        } else {
          const phase2Elapsed = elapsed - (phase1Duration + phase2Delay);
          progress = 0.5 + (phase2Elapsed / phase2Duration) * 0.5;
        }

        setColorFadeProgress(Math.min(1, progress));

        if (elapsed < totalFadeDuration) {
          requestAnimationFrame(animateFade);
        } else {
          cubeRef.current.reset();
          setCube3D(cubejsTo3D(cubeRef.current.getCube()));
          setPreviousCube3D(null);
          setBaselineCube3D(null);
          setStickerGreyMap(new Map());
          setColorFadeProgress(0);
          setIsScrambled(false);
          setLastSolvedState(cubeRef.current.getState());

          if (onComplete) {
            onComplete();
          } else {
            setInputDisabled(false);
            setOrbitControlsEnabled(true);
            if (orbitControlsRef.current) {
              orbitControlsRef.current.enabled = true;
              if (typeof orbitControlsRef.current.update === "function") orbitControlsRef.current.update();
            }
            sessionPhaseRef.current = "idle";
          }
        }
      };
      requestAnimationFrame(animateFade);
    },
    [cube3D, clearMoveHistory]
  );

  const handleScramble = useCallback(
    (keepTimerMode = false, allowDuringLock = false) => {
      if ((inputDisabled || sessionPhaseRef.current !== "idle") && !allowDuringLock) return;
      if (isAnimating || AnimationHelper.isLocked()) return;
      resetTimer();
      if (!keepTimerMode) setIsTimerEnabled(false);
      clearMoveHistory();
      executeScramble();
    },
    [isAnimating, resetTimer, executeScramble, clearMoveHistory, inputDisabled]
  );

  const handleStartTimer = useCallback(() => setShowTimerModal(true), []);

  const performAnimatedScramble = useCallback(() => {
    setInputDisabled(false);
    setOrbitControlsEnabled(true);
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = true;
      if (typeof orbitControlsRef.current.update === "function") orbitControlsRef.current.update();
    }
    sessionPhaseRef.current = "idle";
    executeScramble();
  }, [executeScramble]);

  const handleTimerModalYes = useCallback(() => {
    setIsStartingSession(true);
    setIsTimerEnabled(true);
    setShowTimerModal(false);
    setTimeout(() => {
      setIsStartingSession(false);
      fadeToSolvedState(performAnimatedScramble);
    }, 300);
  }, [fadeToSolvedState, performAnimatedScramble]);

  const handleTimerModalNo = useCallback(() => setShowTimerModal(false), []);
  const handleTimerQuit = useCallback(() => setShowQuitTimerModal(true), []);

  const handleQuitTimerConfirm = useCallback(() => {
    setIsQuittingSession(true);
    setIsTimerEnabled(false);
    cancelTimer();
    setShowQuitTimerModal(false);
    setTimeout(() => {
      setIsQuittingSession(false);
      fadeToSolvedState();
    }, 300);
  }, [cancelTimer, fadeToSolvedState]);

  const handleQuitTimerCancel = useCallback(() => setShowQuitTimerModal(false), []);
  const handleTimerResetNew = useCallback(() => setShowResetTimerModal(true), []);

  const handleResetTimerConfirm = useCallback(() => {
    setIsResettingSession(true);
    setIsTimerEnabled(true);
    resetTimer();
    setShowResetTimerModal(false);
    setTimeout(() => {
      setIsResettingSession(false);
      fadeToSolvedState(performAnimatedScramble);
    }, 300);
  }, [resetTimer, fadeToSolvedState, performAnimatedScramble]);

  const handleResetTimerCancel = useCallback(() => setShowResetTimerModal(false), []);

  const handleSolveSuccessTryAgain = useCallback(() => {
    setIsTimerEnabled(true);
    resetTimer();
    setShowSolveSuccessModal(false);
    setTimeout(() => {
      fadeToSolvedState(performAnimatedScramble);
    }, 300);
  }, [resetTimer, fadeToSolvedState, performAnimatedScramble]);

  const handleSolveSuccess = useCallback(
    (finalTime?: string) => {
      if (finalTime) {
        setFinalSolveTime(finalTime);
        if (isTimerActive) {
          const timeMs = timerState.startTime ? Date.now() - timerState.startTime : 0;
          if (timeMs > 0) {
            const result = addBestTime(finalTime, timeMs);
            setBestTimeResult(result);
          }
        } else {
          setBestTimeResult(null);
        }
      }
      if (cubeViewRef.current) {
        cubeViewRef.current.celebratorySpin(() => setShowSolveSuccessModal(true));
      } else {
        setShowSolveSuccessModal(true);
      }
    },
    [isTimerActive, timerState.startTime, addBestTime]
  );

  const handleSolveSuccessClose = useCallback(() => {
    setIsTimerEnabled(false);
    resetTimer();
    setShowSolveSuccessModal(false);
    setTimeout(() => {
      fadeToSolvedState();
    }, 300);
  }, [resetTimer, fadeToSolvedState]);

  const handleBestTimesOpen = useCallback(() => setShowBestTimesModal(true), []);
  const handleBestTimesClose = useCallback(() => setShowBestTimesModal(false), []);
  const handleBestTimesReset = useCallback(() => { resetBestTimes(); setShowBestTimesModal(false); }, [resetBestTimes]);
  const handleLearnToSolveOpen = useCallback(() => setShowLearnToSolveModal(true), []);
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
      const canvas = cubeContainerRef.current.querySelector("canvas") as HTMLElement | null;
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
          const canvas = cubeContainerRef.current.querySelector("canvas") as HTMLElement | null;
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
          const lockedOverlay = cubeContainerRef.current.querySelector('[data-locked-overlay="true"]');
          if (lockedOverlay) {
            (lockedOverlay as HTMLElement).remove();
          }
        }
      };
      restoreTouchEvents();
    }, 500);
  }, [setOrbitControlsEnabled]);
  
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
      if (typeof orbitControlsRef.current.update === "function") orbitControlsRef.current.update();
    }
    if (cubeContainerRef.current) {
      const canvas = cubeContainerRef.current.querySelector("canvas") as HTMLElement | null;
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
      const lockedOverlay = cubeContainerRef.current.querySelector('[data-locked-overlay="true"]');
      if (lockedOverlay) {
        (lockedOverlay as HTMLElement).remove();
      }
    }
    if (cubeViewRef.current) {
      cubeViewRef.current.resetToInitialPosition(
        orbitControlsRef as unknown as React.RefObject<OrbitControlsInstance>,
        cubeRef,
        undefined
      );
    }
  }, [clearMoveHistory, setCube3D, setOrbitControlsEnabled, setQueueFast, setQueueFastMs]);
  
  const handleTutorialStart = useCallback((lessonId: string) => {
    resetMainCube();
    setTutorialLessonId(lessonId);
    setShowLearnToSolveModal(false);
  }, [resetMainCube]);

  const tutorialLessonIdRef = useRef<string | null>(null);
  useEffect(() => { tutorialLessonIdRef.current = tutorialLessonId; }, [tutorialLessonId]);

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
          const canvas = cubeContainerRef.current.querySelector("canvas") as HTMLElement | null;
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
          const lockedOverlay = cubeContainerRef.current.querySelector('[data-locked-overlay="true"]');
          if (lockedOverlay) {
            (lockedOverlay as HTMLElement).remove();
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

  const handleUndo = useCallback(() => {
    if (undoInProgressRef.current || isAnimating) return;
    undoInProgressRef.current = true;
    if (historyIndex >= 0 && moveHistory.length > 0) {
      const inverseMove = getInverseMove(moveHistory[historyIndex]);
      lastMoveSourceRef.current = "undo";
      setPendingMove(inverseMove as CubeMove);
      setHistoryIndex(historyIndex - 1);
      setTimeout(() => { undoInProgressRef.current = false; }, 120);
    } else {
      undoInProgressRef.current = false;
    }
  }, [historyIndex, moveHistory, getInverseMove, isAnimating]);

  const handleRedo = useCallback(() => {
    if (redoInProgressRef.current || isAnimating) return;
    redoInProgressRef.current = true;
    if (historyIndex < moveHistory.length - 1) {
      const newIndex = historyIndex + 1;
      lastMoveSourceRef.current = "redo";
      setPendingMove(moveHistory[newIndex] as CubeMove);
      setHistoryIndex(newIndex);
      setTimeout(() => { redoInProgressRef.current = false; }, 120);
    }
  }, [historyIndex, moveHistory, isAnimating]);

  const moveHistoryRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const addingToHistoryRef = useRef(false);

  useEffect(() => { moveHistoryRef.current = moveHistory; }, [moveHistory]);
  useEffect(() => { historyIndexRef.current = historyIndex; }, [historyIndex]);

  const addMoveToHistory = useCallback((move: string) => {
    if (addingToHistoryRef.current) return;
    addingToHistoryRef.current = true;
    const currentIndex = historyIndexRef.current;
    const currentHistory = moveHistoryRef.current;
    const newHistory = currentIndex === currentHistory.length - 1
      ? [...currentHistory, move]
      : [...currentHistory.slice(0, currentIndex + 1), move];
    const newIndex = newHistory.length - 1;
    setMoveHistory(newHistory);
    setHistoryIndex(newIndex);
    moveHistoryRef.current = newHistory;
    historyIndexRef.current = newIndex;
    setTimeout(() => { addingToHistoryRef.current = false; }, 100);
  }, []);

  const handleButtonMove = useCallback(
    (move: string) => {
      const now = Date.now();
      if (isAnimating || AnimationHelper.isLocked() || now - lastMoveTimeRef.current < 100) {
        requestAnimationFrame(() => handleButtonMove(move));
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
      const isWholeCubeRotation = ["x", "x'", "y", "y'", "z", "z'"].includes(move);

      if (!isWholeCubeRotation) {
        cubeRef.current.move(move);
        setCube3D(cubejsTo3D(cubeRef.current.getCube()));
        const solved = cubeRef.current.isSolved();
        setIsScrambled(!solved);

        const isManualMove = (window as CustomWindowType).__isManualDragMove || lastMoveSourceRef.current === "manual";
        if (isTimerEnabled && !isTimerActive && isManualMove) startTimer();

        if (solved && isTimerActive) {
          const finalTime = stopTimer();
          const waitForStableState = () => {
            if (isAnimatingRef.current || AnimationHelper.isLocked() || pendingMoveRef.current) {
              setTimeout(waitForStableState, 50);
              return;
            }
            handleSolveSuccess(finalTime);
          };
          setTimeout(waitForStableState, 200);
        }

        if (currentRunRef.current === "scramble") {
          scrambleRemainingRef.current = Math.max(0, scrambleRemainingRef.current - 1);
        }

        if (isManualMove) {
          if (solutionOverlaySourceRef.current === "solve") {
            setSolution(null);
            setLastSolvedState(null);
            setSolutionIndex(-1);
            setIsGenerating(false);
            setShowSolutionGeneratedModal(false);
            setShowSolutionAlreadyGeneratedModal(false);
            solutionOverlaySourceRef.current = null;
          }
          setScrambleMoves(null);
          setScrambleIndex(-1);
          setShowScrambleOverlay(false);
          addMoveToHistory(move);
        }
      }

      setPendingMove(null);
      pendingMoveRef.current = null;
      setIsAnimating(false);
      isAnimatingRef.current = false;
      pumpQueueSoon();

      if (moveQueueRef.current.length === 0) {
        setQueueFast(false);
        setQueueFastMs(null);
        if (currentRunRef.current === "scramble" && scrambleRemainingRef.current <= 0) {
          setIsScramblingState(false);
          currentRunRef.current = null;
          setInputDisabled(false);
          sessionPhaseRef.current = "idle";
        }
        if (currentRunRef.current === "solve") { setIsSolving(false); currentRunRef.current = null; }
        if (currentRunRef.current === "auto-orient") { setIsAutoOrienting(false); currentRunRef.current = null; }
        setTimeout(() => { setScrambleIndex(-1); setSolutionIndex(-1); }, 0);
      }
    },
    [pumpQueueSoon, isTimerEnabled, isTimerActive, startTimer, stopTimer, timerState, formatTimerMs]
  );

  const handleOrbitControlsChange = useCallback((enabled: boolean) => {
    setOrbitControlsEnabled(enabled);
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = enabled;
      if (typeof orbitControlsRef.current.update === "function") orbitControlsRef.current.update();
    }
  }, []);

  const handleStartAnimation = useCallback(() => {
    setIsAnimating(true);
    isAnimatingRef.current = true;
  }, []);

  const [confirmSolveOpen, setConfirmSolveOpen] = useState(false);

  const handleGenerateSolution = useCallback(() => {
    const currentState = cubeRef.current.getState();
    if (solution && lastSolvedState === currentState && showSolutionOverlay) {
      setShowSolutionAlreadyGeneratedModal(true);
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
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
      solutionOverlaySourceRef.current = "generate";
      setIsGenerating(false);
      setShowSolutionGeneratedModal(true);
    }, 1500);
  }, [solution, lastSolvedState, showSolutionOverlay]);

  const handleSolve = useCallback(() => {
    if (isAnimating || AnimationHelper.isLocked()) return;
    clearMoveHistory();
    setIsSolving(true);
    requestAnimationFrame(() => {
      setTimeout(() => {
        const currentState = cubeRef.current.getState();
        let movesToRun: string[];
        if (!solution || lastSolvedState !== currentState) {
          const fresh = cubeRef.current.solve();
          const algo = fresh.join(" ");
          const steps = fresh.map((m) => ({ move: m as CubeMove, description: "" }));
          setSolution({ steps, moveCount: fresh.length, algorithm: algo });
          setLastSolvedState(currentState);
          movesToRun = fresh;
        } else {
          movesToRun = solution.steps.map((s) => s.move);
        }
        setSolutionIndex(-1);
        currentRunRef.current = "solve";
        enqueueMoves(movesToRun);
        setShowScrambleOverlay(false);
        setScrambleMoves(null);
        setScrambleIndex(-1);
        setShowSolutionOverlay(true);
        solutionOverlaySourceRef.current = "solve";
        setConfirmSolveOpen(false);
      }, 0);
    });
  }, [enqueueMoves, isAnimating, solution, lastSolvedState, clearMoveHistory]);

  const isScrambling = isScramblingState;

  const [touchHookKey, setTouchHookKey] = useState(0);
  const [modalCloseCooldown, setModalCloseCooldown] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    if (!tutorialLessonId) {
      setCanvasReady(false);
      setTouchHookKey(prev => prev + 1);
    }
  }, [tutorialLessonId]);

  const { touchCount } = useTwoFingerSpin(
    cubeContainerRef as React.RefObject<HTMLDivElement>,
    cubeViewRef as React.RefObject<RubiksCube3DHandle>,
    precisionActive,
    handleOrbitControlsChange,
    touchHookKey,
    modalCloseCooldown || !canvasReady
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
        const lockedOverlay = container.querySelector('[data-locked-overlay="true"]');
        if (lockedOverlay) {
          (lockedOverlay as HTMLElement).remove();
        }
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
      const { moves, fast } = event.detail as { moves: string[]; fast?: boolean };
      if (moves && moves.length > 0) enqueueMoves(moves, !!fast);
    };
    window.addEventListener("queueSolutionMoves", handleSolutionQueue as EventListener);
    return () => window.removeEventListener("queueSolutionMoves", handleSolutionQueue as EventListener);
  }, [enqueueMoves]);

  const {
    onPointerDown: handleTrackpadPointerDown,
    onPointerMove: handleTrackpadPointerMove,
    onPointerUp: handleTrackpadPointerUp,
  } = useTrackpadHandlers(cubeViewRef as React.RefObject<RubiksCube3DHandle>, precisionActive);

  const isTouchDevice = useIsTouchDevice();
  const { canvasDpr, attachSetDpr, setInteractiveDpr, onDecline, onIncline } = useDprManager(isTouchDevice);

  const [infoOpen, setInfoOpen] = useState(false);
  if (tutorialLessonId) {
    return renderLesson({ lessonId: tutorialLessonId, onBack: handleTutorialBack });
  }

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
        <Header />
        <BestTimesButton onClick={handleBestTimesOpen} />
        <InfoButton onClick={() => setInfoOpen(true)} />
        <div className="flex-1 flex items-center justify-center px-2 min-h-0">
          <div
            key={tutorialLessonId ? 'tutorial' : 'main'}
            ref={cubeContainerRef}
            onDoubleClick={handleContainerDoubleClick}
            className="w-full max-w-6xl mx-auto relative bg-black/20 rounded-2xl overflow-hidden backdrop-blur-sm border border-white/20 shadow-2xl flex items-center justify-center h-full min-h-[300px]"
            style={{ pointerEvents: canvasReady ? "auto" : "none" }}
          >
            <StatusBadge
              isScrambling={isScrambling}
              isSolving={isSolving}
              isAutoOrienting={isAutoOrienting}
              isScrambled={isScrambled}
            />
            {isTimerEnabled ? (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
                <TimerDisplay
                  time={getCurrentTime()}
                  isActive={isTimerActive}
                  hasStarted={isTimerActive}
                  isScrambling={isScrambling}
                />
              </div>
            ) : (
              <>
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
              style={{ touchAction: "none", pointerEvents: canvasReady ? "auto" : "none" }}
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
                const onRestored = () => { try { state.gl.resetState(); } catch {} };
                canvas.addEventListener("webglcontextlost", onLost, false);
                canvas.addEventListener("webglcontextrestored", onRestored, false);
                setTimeout(() => {
                  setCanvasReady(true);
                }, 800);
              }}
              onPointerDownCapture={(e) => {
                setInteractiveDpr();
                cubeViewRef.current?.handlePointerDown(e);
              }}
              onPointerMoveCapture={() => { setInteractiveDpr(); }}
              onPointerUpCapture={() => {
                setInteractiveDpr();
                cubeViewRef.current?.handlePointerUp?.();
              }}
            >
              <PerformanceMonitor onDecline={onDecline} onIncline={onIncline} />
              <spotLight position={[-30, 20, 60]} intensity={0.3} />
              <ambientLight intensity={1.2} color={"#fff"} />
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
                  ref={orbitControlsRef as unknown as React.RefObject<any>}
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
        initialLessonId={(window as CustomWindowType).__tutorialBackLessonId || undefined}
      />

      <Footer />
    </>
  );
};

export default App;
