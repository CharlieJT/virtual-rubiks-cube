import { useRef, useState } from "react";
import { CubeJSWrapper } from "@utils/cubejsWrapper";
import cubejsTo3D from "@utils/cubejsTo3D";
import type { CubeMove, CubeState, Solution } from "@/types/cube";

const useCubeState = () => {
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

  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [queueFast, setQueueFast] = useState(false);
  const [queueFastMs, setQueueFastMs] = useState<number | null>(null);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [scrambleMoves, setScrambleMoves] = useState<string[] | null>(null);
  const [showScrambleOverlay, setShowScrambleOverlay] = useState(false);
  const [showSolutionOverlay, setShowSolutionOverlay] = useState(false);
  const [scrambleIndex, setScrambleIndex] = useState<number>(-1);
  const [solutionIndex, setSolutionIndex] = useState<number>(-1);
  const [isScramblingState, setIsScramblingState] = useState(false);

  const [previousCube3D, setPreviousCube3D] = useState<CubeState[][][] | null>(null);
  const [baselineCube3D, setBaselineCube3D] = useState<CubeState[][][] | null>(null);
  const [stickerGreyMap, setStickerGreyMap] = useState<Map<string, boolean>>(new Map());
  const [colorFadeProgress, setColorFadeProgress] = useState(0);

  const lastMoveTimeRef = useRef(0);
  const moveQueueRef = useRef<CubeMove[]>([]);
  const lastMoveSourceRef = useRef<"queue" | "manual" | "undo" | "redo" | null>(null);
  const currentRunRef = useRef<null | "scramble" | "solve" | "auto-orient">(null);
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

  isAnimatingRef.current = isAnimating;
  pendingMoveRef.current = pendingMove;

  return {
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
  };
};

export default useCubeState;
