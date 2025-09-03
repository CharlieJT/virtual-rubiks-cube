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
import TimerModal from "@components/TimerModal";
import QuitTimerModal from "@components/QuitTimerModal";
import ResetTimerModal from "@components/ResetTimerModal";
import TimerDisplay from "@components/TimerDisplay";
import SolveSuccessModal from "@components/SolveSuccessModal";
import SolutionGeneratedModal from "@components/SolutionGeneratedModal";
import SolutionAlreadyGeneratedModal from "@components/SolutionAlreadyGeneratedModal";
import BestTimesModal from "@components/BestTimesModal";
import BestTimesButton from "@components/UI/BestTimesButton";
import useIsTouchDevice from "@/hooks/useIsTouchDevice";
import useTimer from "@/hooks/useTimer";
import { useBestTimes, type BestTimeResult } from "@/hooks/useBestTimes";
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

  // Timer states
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [showQuitTimerModal, setShowQuitTimerModal] = useState(false);
  const [isQuittingSession, setIsQuittingSession] = useState(false);
  const [showResetTimerModal, setShowResetTimerModal] = useState(false);
  const [isResettingSession, setIsResettingSession] = useState(false);
  const [showSolveSuccessModal, setShowSolveSuccessModal] = useState(false);
  const [finalSolveTime, setFinalSolveTime] = useState<string>("");
  const [isTimerEnabled, setIsTimerEnabled] = useState(false);
  const [bestTimeResult, setBestTimeResult] = useState<BestTimeResult | null>(
    null
  );

  // Solution generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSolutionGeneratedModal, setShowSolutionGeneratedModal] =
    useState(false);
  const [
    showSolutionAlreadyGeneratedModal,
    setShowSolutionAlreadyGeneratedModal,
  ] = useState(false);

  // Timer hook
  const {
    timerState,
    getCurrentTime,
    startTimer,
    stopTimer,
    cancelTimer,
    resetTimer,
    isTimerActive,
  } = useTimer();

  // Best times hook
  const { addBestTime, resetBestTimes, getFormattedBestTimes, hasTimes } =
    useBestTimes();

  // UI states
  const [showBestTimesModal, setShowBestTimesModal] = useState(false);

  // Move history for undo/redo functionality
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1); // -1 means at the end of history

  // Format timer milliseconds to MM:SS.ss (same logic as in useTimer)
  const formatTimerMs = useCallback((ms: number): string => {
    const totalSeconds = ms / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    // Always format as MM:SS.ss with leading zeros
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toFixed(2)
      .padStart(5, "0")}`;
  }, []);

  // Helper function to get the inverse of a move
  const getInverseMove = useCallback((move: string): string => {
    if (move.endsWith("'")) {
      // Prime moves become normal moves
      return move.slice(0, -1);
    } else if (move.endsWith("2")) {
      // Double moves stay the same
      return move;
    } else {
      // Normal moves become prime moves
      return move + "'";
    }
  }, []);
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
  const lastMoveSourceRef = useRef<"queue" | "manual" | "undo" | "redo" | null>(
    null
  );
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
  // Prevent duplicate scramble starts (e.g., first start double-trigger)
  const scrambleRequestPendingRef = useRef(false);
  // Debounce extremely rapid duplicate scramble invocations
  const lastScrambleStartedAtRef = useRef<number>(0);
  // Track high-level session phase to gate actions
  const sessionPhaseRef = useRef<"idle" | "transition" | "scramble">("idle");

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

  const [queueFast, setQueueFast] = useState(false);
  const [queueFastMs, setQueueFastMs] = useState<number | null>(null);
  const [inputDisabled, setInputDisabled] = useState(false);

  const enqueueMoves = useCallback(
    (moves: string[], fast: boolean = false, fastMs?: number | null) => {
      if (fast) setQueueFast(true);
      if (typeof fastMs === "number") setQueueFastMs(fastMs);
      const normalized = moves as CubeMove[];
      moveQueueRef.current.push(...normalized);
      // robustly try to start now (retry until unlocked)
      pumpQueueSoon();
    },
    [pumpQueueSoon]
  );

  // Actual scramble execution
  const executeScramble = useCallback(() => {
    if (isAnimating || AnimationHelper.isLocked()) return;
    // Guard: if a scramble is already in progress, do not start another one
    if (currentRunRef.current === "scramble" || isScramblingState) {
      return;
    }
    // Debounce: if a scramble started very recently, ignore duplicate
    const now = Date.now();
    if (now - lastScrambleStartedAtRef.current < 400) {
      return;
    }
    setPendingMove(null);

    // Get a random scramble without mutating current cube immediately
    const scramble = cubeRef.current.generateScramble(20);
    // Reset indices before we start so first pump sets 0 and isn't overridden
    setScrambleIndex(-1);
    setSolutionIndex(-1);
    // Mark this run before enqueuing so highlighting starts with the first move
    currentRunRef.current = "scramble";
    setIsScramblingState(true);
    // Clear any pending scramble request now that we have actually started
    scrambleRequestPendingRef.current = false;
    // Record start time to prevent rapid duplicates
    lastScrambleStartedAtRef.current = now;
    // Track remaining scramble moves explicitly
    scrambleRemainingRef.current = scramble.length;
    // Apply & animate on the visual cube and mutate cubeRef in onMoveAnimationDone
    enqueueMoves(scramble);
    setIsScrambled(true);
    // Enter scramble phase (input remains disabled; will re-enable on completion)
    sessionPhaseRef.current = "scramble";
    setSolution(null);
    setLastSolvedState(null);
    // Reset solution generation states
    setIsGenerating(false);
    setShowSolutionGeneratedModal(false);
    setScrambleMoves(scramble);
    setShowScrambleOverlay(true);
    setShowSolutionOverlay(false);
    // Index will become 0 when the first move starts
  }, [enqueueMoves, isAnimating]);

  // Clear move history (called when scrambling or solving)
  const clearMoveHistory = useCallback(() => {
    setMoveHistory([]);
    setHistoryIndex(-1);
  }, []);

  // Clear move history (called when scrambling or solving)
  const ensureSolvedThen = useCallback(
    (
      next?: () => void,
      opts?: { fastMs?: number; afterSolvePauseMs?: number }
    ) => {
      const attempt = () => {
        if (
          AnimationHelper.isLocked() ||
          isAnimatingRef.current ||
          pendingMoveRef.current
        ) {
          setTimeout(attempt, 0);
          return;
        }

        // Stop any queued moves/runs
        moveQueueRef.current = [];
        currentRunRef.current = null;
        scrambleRemainingRef.current = 0;

        // Clear overlays and indices for a clean session
        setScrambleMoves(null);
        setShowScrambleOverlay(false);
        setScrambleIndex(-1);
        setSolution(null);
        setShowSolutionOverlay(false);
        setSolutionIndex(-1);
        setIsSolving(false);
        setIsAutoOrienting(false);

        // Clear animation/pending state
        setPendingMove(null);
        pendingMoveRef.current = null;
        setIsAnimating(false);
        isAnimatingRef.current = false;
        lastMoveSourceRef.current = null;

        // Clear history so new session starts clean
        clearMoveHistory();

        // If cube is not solved, compute real solution and enqueue fast moves for animated playback
        let enqueuedSolution = false;
        const fastMs = opts?.fastMs;
        try {
          if (!cubeRef.current.isSolved()) {
            const solutionMoves = cubeRef.current.solve();
            if (solutionMoves && solutionMoves.length > 0) {
              enqueuedSolution = true;
              // Mark a transient 'solve' run to isolate indices/highlights
              currentRunRef.current = "solve";
              setSolutionIndex(-1);
              enqueueMoves(solutionMoves, true /* fast */, fastMs);
              // Close modals when solution moves are enqueued
              setShowTimerModal(false);
              setIsStartingSession(false);
              setShowQuitTimerModal(false);
              setIsQuittingSession(false);
              setShowResetTimerModal(false);
              setIsResettingSession(false);
            }
          }
        } catch (e) {
          console.warn("Failed to compute solution for visual solve:", e);
        }

        // If no solution moves were enqueued (already solved), close the modals now
        if (!enqueuedSolution) {
          setShowTimerModal(false);
          setIsStartingSession(false);
          setShowQuitTimerModal(false);
          setIsQuittingSession(false);
          setShowResetTimerModal(false);
          setIsResettingSession(false);
        }

        const waitForQueueEmptyThen = (cb: () => void) => {
          const check = () => {
            if (
              AnimationHelper.isLocked() ||
              isAnimatingRef.current ||
              pendingMoveRef.current ||
              moveQueueRef.current.length > 0
            ) {
              setTimeout(check, 15);
              return;
            }
            cb();
          };
          check();
        };

        const proceed = () => {
          // Sync visual cube state into our cube3D snapshot and flags
          setCube3D(cubejsTo3D(cubeRef.current.getCube()));
          setIsScrambled(false);
          setLastSolvedState(cubeRef.current.getState());

          if (next) {
            next();
          } else {
            // No follow-up action (e.g., quit) — re-enable input now
            setInputDisabled(false);
            // Also restore orbit controls immediately
            handleOrbitControlsChange(true);
            sessionPhaseRef.current = "idle";
          }
        };

        // Reset cube visual position to initial orientation while the fast solve plays
        if (cubeViewRef.current) {
          // Disable input for the duration of solve + pause + scramble
          setInputDisabled(true);
          // Enter transition phase
          sessionPhaseRef.current = "transition";
          cubeViewRef.current.resetToInitialPosition(
            orbitControlsRef,
            cubeRef,
            () => {
              if (enqueuedSolution) {
                // Wait until the fast solve queue finishes before proceeding
                waitForQueueEmptyThen(() => {
                  // Optional slight pause after solve before next action
                  const pause = opts?.afterSolvePauseMs ?? 0;
                  setTimeout(() => {
                    // Reset fast flags after drain so future queued moves use normal speed
                    setQueueFast(false);
                    setQueueFastMs(null);
                    // Clear transient solve run state
                    if (currentRunRef.current === "solve") {
                      currentRunRef.current = null;
                    }
                    proceed();
                    // Re-enable input shortly after scramble starts (handled by caller)
                    // We'll re-enable in executeScramble's completion logic when next triggers a scramble
                  }, pause);
                });
              } else {
                proceed();
              }
            }
          );
        } else {
          if (enqueuedSolution) {
            waitForQueueEmptyThen(() => {
              const pause = opts?.afterSolvePauseMs ?? 0;
              setTimeout(() => {
                setQueueFast(false);
                setQueueFastMs(null);
                if (currentRunRef.current === "solve") {
                  currentRunRef.current = null;
                }
                proceed();
              }, pause);
            });
          } else {
            proceed();
          }
        }
      };
      // Defer to next tick to avoid races with current handlers
      setTimeout(attempt, 0);
    },
    [clearMoveHistory, enqueueMoves, isStartingSession]
  );

  const handleScramble = useCallback(
    (keepTimerMode = false, allowDuringLock = false) => {
      // Block user-initiated scrambles during transition/lock
      if (
        (inputDisabled || sessionPhaseRef.current !== "idle") &&
        !allowDuringLock
      ) {
        return;
      }
      if (isAnimating || AnimationHelper.isLocked()) return;

      // Reset timer state first
      resetTimer();
      if (!keepTimerMode) {
        setIsTimerEnabled(false);
      }

      // Clear move history on scramble
      clearMoveHistory();

      // Execute scramble directly - timer modal will show when scrambling is complete
      executeScramble();
    },
    [isAnimating, resetTimer, executeScramble, clearMoveHistory, inputDisabled]
  );

  // Robust starter that waits until the system is fully idle, then scrambles
  const startScrambleAfterUnlock = useCallback(
    (keepTimerMode = false) => {
      // If a scramble request is already pending, ignore duplicates
      if (scrambleRequestPendingRef.current) return;
      // Mark a pending request; it will be cleared when executeScramble actually starts
      scrambleRequestPendingRef.current = true;
      const attempt = () => {
        // Only proceed from the intended transition phase
        if (sessionPhaseRef.current !== "transition") {
          scrambleRequestPendingRef.current = false;
          return;
        }
        if (
          AnimationHelper.isLocked() ||
          isAnimatingRef.current ||
          pendingMoveRef.current
        ) {
          setTimeout(attempt, 15);
          return;
        }
        handleScramble(keepTimerMode, true);
      };
      // Defer by a tick to allow any final state updates to settle
      setTimeout(attempt, 0);
    },
    [handleScramble]
  );

  // Timer modal handlers
  const handleStartTimer = useCallback(() => {
    // Show the timer modal with Yes/No options
    setShowTimerModal(true);
  }, []);

  const handleTimerModalYes = useCallback(() => {
    // Keep modal open and show loading spinner while preparing session
    setIsStartingSession(true);
    setIsTimerEnabled(true);
    // Ensure we begin from a solved cube (quick), slight pause, then scramble
    // Defer heavy work to next frame so the spinner can render immediately
    requestAnimationFrame(() => {
      ensureSolvedThen(() => startScrambleAfterUnlock(true), {
        fastMs: 30,
        afterSolvePauseMs: 120,
      });
    });
  }, []);

  const handleTimerModalNo = useCallback(() => {
    setShowTimerModal(false);
    // Just close modal, no timer needed
  }, []);

  // New timer control handlers
  const handleTimerQuit = useCallback(() => {
    setShowQuitTimerModal(true);
  }, []);

  const handleQuitTimerConfirm = useCallback(() => {
    setIsQuittingSession(true);
    setIsTimerEnabled(false);
    cancelTimer();
    // Defer heavy work to next frame so the spinner can render immediately
    requestAnimationFrame(() => {
      // Exiting timer mode: quick solve only, no scramble
      ensureSolvedThen(undefined, { fastMs: 30 });
    });
  }, [cancelTimer, ensureSolvedThen]);

  const handleQuitTimerCancel = useCallback(() => {
    setShowQuitTimerModal(false);
  }, []);

  const handleTimerResetNew = useCallback(() => {
    setShowResetTimerModal(true);
  }, []);

  const handleResetTimerConfirm = useCallback(() => {
    setIsResettingSession(true);
    // Keep timer enabled for new session
    setIsTimerEnabled(true);
    // Reset timer but stay in timer mode
    resetTimer();
    // Defer heavy work to next frame so the spinner can render immediately
    requestAnimationFrame(() => {
      // Ensure solved baseline (quick), slight pause, then start a fresh scramble in timer mode
      ensureSolvedThen(() => startScrambleAfterUnlock(true), {
        fastMs: 30,
        afterSolvePauseMs: 120,
      });
    });
  }, [resetTimer, ensureSolvedThen, startScrambleAfterUnlock]);

  const handleResetTimerCancel = useCallback(() => {
    setShowResetTimerModal(false);
  }, []);

  const handleSolveSuccessTryAgain = useCallback(() => {
    setShowSolveSuccessModal(false);
    // Keep timer enabled for new session
    setIsTimerEnabled(true);
    // Reset timer but stay in timer mode
    resetTimer();
    setShowTimerModal(false); // Ensure timer modal is closed
    // Start next timed attempt from solved, then scramble
    ensureSolvedThen(() => startScrambleAfterUnlock(true), {
      fastMs: 30,
      afterSolvePauseMs: 120,
    });
  }, [resetTimer, handleScramble]);

  const handleSolveSuccess = useCallback(
    (finalTime?: string) => {
      if (finalTime) {
        setFinalSolveTime(finalTime);

        // Record this time as a best time if it came from a timer session
        if (isTimerActive) {
          // Parse the time string to get milliseconds for sorting
          const timeMs = timerState.startTime
            ? Date.now() - timerState.startTime
            : 0;

          if (timeMs > 0) {
            const result = addBestTime(finalTime, timeMs);
            setBestTimeResult(result);
          }
        } else {
          setBestTimeResult(null);
        }
      }

      // Add celebratory spinning animation when completing a timed solve
      if (cubeViewRef.current) {
        cubeViewRef.current.celebratorySpin(() => {
          setShowSolveSuccessModal(true);
        });
      } else {
        // Fallback if ref not available
        setShowSolveSuccessModal(true);
      }
    },
    [isTimerActive, timerState.startTime, addBestTime]
  );

  const handleSolveSuccessClose = useCallback(() => {
    setShowSolveSuccessModal(false);
    setIsTimerEnabled(false);
    resetTimer();
    // After finishing a timed solve and exiting timer mode, return to solved
    ensureSolvedThen();
  }, [resetTimer]);

  // Best times modal handlers
  const handleBestTimesOpen = useCallback(() => {
    setShowBestTimesModal(true);
  }, []);

  const handleBestTimesClose = useCallback(() => {
    setShowBestTimesModal(false);
  }, []);

  const handleBestTimesReset = useCallback(() => {
    resetBestTimes();
    setShowBestTimesModal(false);
  }, [resetBestTimes]);

  // Undo/Redo handlers
  const handleUndo = useCallback(() => {
    // Prevent rapid clicking
    if (undoInProgressRef.current || isAnimating) {
      return;
    }

    undoInProgressRef.current = true;

    if (historyIndex >= 0 && moveHistory.length > 0) {
      // Get the move to undo (current position in history)
      const moveToUndo = moveHistory[historyIndex];
      const inverseMove = getInverseMove(moveToUndo);

      // Execute the inverse move
      lastMoveSourceRef.current = "undo";
      setPendingMove(inverseMove as CubeMove);

      // Move backwards in history
      setHistoryIndex(historyIndex - 1);

      // Reset flag after animation would complete (80ms animation + small buffer)
      setTimeout(() => {
        undoInProgressRef.current = false;
      }, 120);
    } else {
      undoInProgressRef.current = false;
    }
  }, [historyIndex, moveHistory, getInverseMove, isAnimating]);

  const handleRedo = useCallback(() => {
    // Prevent rapid clicking
    if (redoInProgressRef.current || isAnimating) {
      return;
    }

    redoInProgressRef.current = true;

    if (historyIndex < moveHistory.length - 1) {
      // Move forward in history
      const newIndex = historyIndex + 1;
      const moveToRedo = moveHistory[newIndex];

      // Execute the move
      lastMoveSourceRef.current = "redo";
      setPendingMove(moveToRedo as CubeMove);

      // Move forward in history
      setHistoryIndex(newIndex);

      // Reset flag after animation would complete (80ms animation + small buffer)
      setTimeout(() => {
        redoInProgressRef.current = false;
      }, 120);
    }
  }, [historyIndex, moveHistory, isAnimating]);

  // Add move to history (called when a manual move is made)
  // Refs to track the actual current state for undo/redo
  const moveHistoryRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);

  // Keep refs in sync with state
  useEffect(() => {
    moveHistoryRef.current = moveHistory;
  }, [moveHistory]);

  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);

  // Flag to prevent multiple calls to addMoveToHistory
  const addingToHistoryRef = useRef(false);

  // Flags to prevent rapid undo/redo clicks
  const undoInProgressRef = useRef(false);
  const redoInProgressRef = useRef(false);

  const addMoveToHistory = useCallback((move: string) => {
    // Prevent multiple calls
    if (addingToHistoryRef.current) {
      return;
    }

    addingToHistoryRef.current = true;

    // Use ref values for current state (always up to date)
    const currentIndex = historyIndexRef.current;
    const currentHistory = moveHistoryRef.current;

    // Calculate new history
    const newHistory =
      currentIndex === currentHistory.length - 1
        ? [...currentHistory, move] // At end, just add
        : [...currentHistory.slice(0, currentIndex + 1), move]; // In middle, slice and add

    const newIndex = newHistory.length - 1;

    // ...removed debug log...

    // Update both states
    setMoveHistory(newHistory);
    setHistoryIndex(newIndex);

    // Update refs immediately so next call sees the right values
    moveHistoryRef.current = newHistory;
    historyIndexRef.current = newIndex;

    // Reset flag after a brief delay to allow for the next move
    setTimeout(() => {
      addingToHistoryRef.current = false;
    }, 100);
  }, []); // No dependencies needed since we use refs

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

        // Timer logic: start timer on first manual move if timing is enabled
        // Check if this is a manual drag move or a manual button move
        const isManualMove =
          (window as any).__isManualDragMove ||
          lastMoveSourceRef.current === "manual";
        if (isTimerEnabled && !isTimerActive && isManualMove) {
          startTimer();
        }

        // Timer logic: stop timer if cube is solved during a timer session
        if (solved && isTimerActive) {
          // Stop the timer and get the exact final time
          const finalTime = stopTimer();

          // Ensure all animations are complete and cube is in stable state
          // Wait longer and ensure AnimationHelper is not locked
          const waitForStableState = () => {
            if (
              isAnimatingRef.current ||
              AnimationHelper.isLocked() ||
              pendingMoveRef.current
            ) {
              // Still animating, wait longer
              setTimeout(waitForStableState, 50);
              return;
            }
            // Now cube is in stable state, proceed with reset animation
            handleSolveSuccess(finalTime);
          };

          // Start checking for stable state
          setTimeout(waitForStableState, 200);
        }

        // For slice moves, apply the equivalent logical rotation to the cube's 3D orientation
        // applySliceMoveLogicalRotation(move);

        // Decrement scramble remaining if we are in a scramble run
        if (currentRunRef.current === "scramble") {
          scrambleRemainingRef.current = Math.max(
            0,
            scrambleRemainingRef.current - 1
          );
        }

        // Clear any generated solution when the user changes the cube via manual or undo/redo
        const isUndoRedo =
          lastMoveSourceRef.current === "undo" ||
          lastMoveSourceRef.current === "redo";
        if (isManualMove || isUndoRedo) {
          setSolution(null);
          setLastSolvedState(null);
          setSolutionIndex(-1);
          // Reset solution generation states
          setIsGenerating(false);
          setShowSolutionGeneratedModal(false);
          setShowSolutionAlreadyGeneratedModal(false);
          // Scramble list no longer represents current state after manual edits or undo/redo
          setScrambleMoves(null);
          setScrambleIndex(-1);

          // Add only manual moves to history
          if (isManualMove) {
            addMoveToHistory(move);
          }
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
            // Re-enable input after scramble completes
            setInputDisabled(false);
            sessionPhaseRef.current = "idle";
            // Don't show timer modal after regular scramble - only when explicitly starting timer session
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
    [
      pumpQueueSoon,
      isTimerEnabled,
      isTimerActive,
      startTimer,
      stopTimer,
      timerState,
      formatTimerMs,
    ]
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
    const currentState = cubeRef.current.getState();

    // Check if solution already exists for current cube state AND is currently being shown
    if (solution && lastSolvedState === currentState && showSolutionOverlay) {
      // Solution already exists for this scramble and is visible
      setShowSolutionAlreadyGeneratedModal(true);
      return;
    }

    setIsGenerating(true);

    // Simulate generation time with setTimeout for user feedback
    setTimeout(() => {
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

      // Update generation states
      setIsGenerating(false);
      setShowSolutionGeneratedModal(true);
    }, 1500); // 1.5 second delay for better UX
  }, [solution, lastSolvedState, showSolutionOverlay]);

  const handleSolve = useCallback(() => {
    if (isAnimating || AnimationHelper.isLocked()) return;

    // Clear move history on solve
    clearMoveHistory();

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
  }, [enqueueMoves, isAnimating, solution, lastSolvedState, clearMoveHistory]);

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

  // Listen for solution queue events from resetToInitialPosition
  useEffect(() => {
    const handleSolutionQueue = (event: CustomEvent) => {
      const { moves, fast } = event.detail as {
        moves: string[];
        fast?: boolean;
      };
      if (moves && moves.length > 0) {
        // Queue the solution moves for visual animation
        enqueueMoves(moves, !!fast);
      }
    };

    window.addEventListener(
      "queueSolutionMoves",
      handleSolutionQueue as EventListener
    );
    return () => {
      window.removeEventListener(
        "queueSolutionMoves",
        handleSolutionQueue as EventListener
      );
    };
  }, [enqueueMoves]);

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
        {/* Best Times button - top left */}
        <BestTimesButton onClick={handleBestTimesOpen} />
        {/* Info icon top right */}
        <InfoButton onClick={() => setInfoOpen(true)} />
        {/* Cube container fills available space */}
        <div className="flex-1 flex items-center justify-center px-2 min-h-0">
          <div
            ref={cubeContainerRef}
            onDoubleClick={handleContainerDoubleClick}
            className="w-full max-w-6xl mx-auto relative bg-black/20 rounded-2xl overflow-hidden backdrop-blur-sm border border-white/20 shadow-2xl flex items-center justify-center h-full min-h-[300px]"
          >
            {/* Undo/Redo now live in the ControlPanel */}
            {/* Status indicator - bottom left of cube container */}
            <StatusBadge
              isScrambling={isScrambling}
              isSolving={isSolving}
              isAutoOrienting={isAutoOrienting}
              isScrambled={isScrambled}
            />
            {/* Orbit and precision UI moved into ControlPanel for layout consistency */}
            {/* Timer display takes priority over overlays when timer is enabled */}
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
                    !!(
                      solution &&
                      solution.steps.length > 0 &&
                      showSolutionOverlay
                    )
                  }
                  onClose={() => setShowSolutionOverlay(false)}
                  colorTheme="solution"
                />
              </>
            )}
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
                isTimerMode={isTimerEnabled}
                moveSource={lastMoveSourceRef.current}
                queueFast={queueFast}
                queueFastMs={queueFastMs}
                inputDisabled={inputDisabled}
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

      {/* Timer Modals */}
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

      <Footer />
    </>
  );
};

export default App;
