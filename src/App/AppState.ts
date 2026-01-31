import { useRef, useState } from "react";
import { CubeJSWrapper } from "@utils/cubejsWrapper";
import cubejsTo3D from "@utils/cubejsTo3D";
import type { CubeMove, Solution } from "@/types/cube";
import type { BestTimeResult } from "@/hooks/useBestTimes";

export const useAppState = () => {
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

  // UI states
  const [showBestTimesModal, setShowBestTimesModal] = useState(false);
  const [showLearnToSolveModal, setShowLearnToSolveModal] = useState(false);
  const [tutorialLessonId, setTutorialLessonId] = useState<string | null>(null);

  // Move history for undo/redo functionality
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1); // -1 means at the end of history

  // Move queue and scramble states
  const [queueFast, setQueueFast] = useState(false);
  const [queueFastMs, setQueueFastMs] = useState<number | null>(null);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [scrambleMoves, setScrambleMoves] = useState<string[] | null>(null);
  const [showScrambleOverlay, setShowScrambleOverlay] = useState(false);
  const [showSolutionOverlay, setShowSolutionOverlay] = useState(false);
  const [scrambleIndex, setScrambleIndex] = useState<number>(-1);
  const [solutionIndex, setSolutionIndex] = useState<number>(-1);
  const [isScramblingState, setIsScramblingState] = useState(false);

  // Refs
  const lastMoveTimeRef = useRef(0);
  const moveQueueRef = useRef<CubeMove[]>([]);
  const lastMoveSourceRef = useRef<"queue" | "manual" | "undo" | "redo" | null>(
    null
  );
  const currentRunRef = useRef<null | "scramble" | "solve" | "auto-orient">(
    null
  );
  const solutionOverlaySourceRef = useRef<"generate" | "solve" | null>(null);
  const scrambleMovesRef = useRef<string[] | null>(null);
  const solutionRef = useRef<Solution | null>(null);
  const scrambleRemainingRef = useRef(0);
  const scrambleRequestPendingRef = useRef(false);
  const lastScrambleStartedAtRef = useRef<number>(0);
  const sessionPhaseRef = useRef<"idle" | "transition" | "scramble">("idle");
  const isAnimatingRef = useRef(isAnimating);
  const pendingMoveRef = useRef<CubeMove | null>(pendingMove);
  const undoInProgressRef = useRef(false);
  const redoInProgressRef = useRef(false);

  // Keep refs in sync with state
  isAnimatingRef.current = isAnimating;
  pendingMoveRef.current = pendingMove;

  return {
    // Cube state
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

    // Timer states
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

    // Solution generation states
    isGenerating,
    setIsGenerating,
    showSolutionGeneratedModal,
    setShowSolutionGeneratedModal,
    showSolutionAlreadyGeneratedModal,
    setShowSolutionAlreadyGeneratedModal,

    // UI states
    showBestTimesModal,
    setShowBestTimesModal,
    showLearnToSolveModal,
    setShowLearnToSolveModal,
    tutorialLessonId,
    setTutorialLessonId,

    // Move history
    moveHistory,
    setMoveHistory,
    historyIndex,
    setHistoryIndex,

    // Move queue and scramble states
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

    // Refs
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
  };
};
