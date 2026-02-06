import { useRef, useState, useMemo, useEffect } from "react";
import type { CubeState } from "@/types/cube";
import { CubeJSWrapper } from "@utils/cubejsWrapper";
import cubejsTo3D from "@utils/cubejsTo3D";
import useIsTouchDevice from "@/hooks/useIsTouchDevice";
import useDprManager from "@/hooks/useDprManager";
import type { OrbitControlsInstance } from "@/types/orbitControls";
import type { RubiksCube3DHandle } from "@components/RubiksCube3D/types";
import getSlidesForLesson, { type Slide } from "@components/tutorials/slideDefinitions";
import { useFixSequenceState } from "@components/tutorials/hooks/useFixSequenceState";
import { useMidStageTicks } from "@components/tutorials/hooks/useMidStageTicks";
import { useSlideSpecificState } from "@components/tutorials/hooks/useSlideSpecificState";
import { usePracticeSlideCompletion } from "@components/tutorials/hooks/usePracticeSlideCompletion";
import { useTutorialCube3D } from "@components/tutorials/hooks/useTutorialCube3D";
import { getFixSequence } from "@components/tutorials/utils/fixSequenceHelpers";
import { makeCentersGrey } from "@/utils/makeCentersGrey";
import {
  isWhiteCrossSolved as checkWhiteCrossSolved,
  isWhiteCornersSolved as checkWhiteCornersSolved,
  isSecondLayerSolved as checkSecondLayerSolved,
  isCubeFullySolved as checkCubeFullySolved,
} from "@components/tutorials/utils/tutorialHelpers";
import type { CubeMove } from "@/types/cube";

export const useTutorialPageState = (lessonId: string) => {
  const cubeRef = useRef(new CubeJSWrapper());
  const [cube3D, setCube3D] = useState(() =>
    cubejsTo3D(cubeRef.current.getCube())
  );
  const [previousTutorialCube3D, setPreviousTutorialCube3D] = useState<CubeState[][][] | null>(null);
  const [baselineTutorialCube3D, setBaselineTutorialCube3D] = useState<CubeState[][][] | null>(null);
  const [stickerGreyMap, setStickerGreyMap] = useState<Map<string, boolean>>(new Map());
  const [colorFadeProgress, setColorFadeProgress] = useState(0);
  const colorFadeProgressRef = useRef(0);
  const tutorialCube3DRef = useRef<CubeState[][][] | null>(null);
  useEffect(() => {
    colorFadeProgressRef.current = colorFadeProgress;
  }, [colorFadeProgress]);

  const [pendingMove, setPendingMove] = useState<CubeMove | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const isAnimatingRef = useRef(false);
  const lastMoveTimeRef = useRef(0);
  const lastMoveSourceRef = useRef<"queue" | "manual" | "undo" | "redo" | null>(
    null
  );

  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const moveHistoryRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  useEffect(() => {
    moveHistoryRef.current = moveHistory;
  }, [moveHistory]);
  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);

  const [isResetting, setIsResetting] = useState(false);
  const [isResettingOrbit, setIsResettingOrbit] = useState(false);
  const [resetQueue, setResetQueue] = useState<string[] | null>(null);
  const resetIndexRef = useRef(0);
  const isResettingRef = useRef(false);
  useEffect(() => {
    isResettingRef.current = isResetting;
  }, [isResetting]);

  const [inputDisabled, setInputDisabled] = useState(false);
  const queueFast = false;
  const queueFastMs: number | null = null;
  const isTransitioningRef = useRef(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const cubeViewRef = useRef<RubiksCube3DHandle | null>(null);
  const orbitControlsRef = useRef<OrbitControlsInstance | null>(null);
  const cubeContainerRef = useRef<HTMLDivElement | null>(null);
  const overlayContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const transitionIdRef = useRef(0);

  const isTouchDevice = useIsTouchDevice();
  const { canvasDpr, attachSetDpr, setInteractiveDpr, onDecline, onIncline } =
    useDprManager(isTouchDevice);
  const [precisionActive] = useState(false);
  const forceOrbitDisabledRef = useRef(false);

  const slides: Slide[] = useMemo(() => {
    return getSlidesForLesson(lessonId);
  }, [lessonId]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const activeSlide = slides[currentSlide];

  useEffect(() => {
    cubeViewRef.current?.resetLogo();
  }, [currentSlide]);

  const fixSequence: string[] = useMemo(
    () => getFixSequence(activeSlide?.id),
    [activeSlide?.id]
  );

  const fixSequenceState = useFixSequenceState(
    activeSlide?.id,
    fixSequence.length
  );
  const {
    fixIndex,
    setFixIndex,
    fixDoublePartialDir,
    setFixDoublePartialDir,
    fixErrorPulse,
    setFixErrorPulse,
    setFixShowTick,
    setFixTickAnimKey,
    setFixTickProgress,
    setFixTickLine,
    fixFirstTickPlayed,
    setFixFirstTickPlayed,
    setFixFirstTickProgress,
    setFixFirstTickLine,
    fixSecondTickPlayed,
    setFixSecondTickPlayed,
    setFixSecondTickProgress,
    setFixSecondTickLine,
    fixCompleted,
    triggerFixTick,
    resetFixState,
  } = fixSequenceState;

  const midStageTicks = useMidStageTicks(activeSlide?.id);
  const {
    midStage1Progress,
    midStage1Line,
    midStage1Key,
    midStage2Progress,
    midStage2Line,
    midStage2Key,
    midStage3Progress,
    midStage3Line,
    midStage3Key,
    midStage4Progress,
    midStage4Line,
    midStage4Key,
    midStage5Progress,
    midStage5Line,
    midStage5Key,
    midStage6Key,
    midStage6Progress,
    midStage6Line,
    midStage7Key,
    midStage7Progress,
    midStage7Line,
    resetMidStageTicks,
    animateMidlayerStage,
  } = midStageTicks;

  const slideSpecificState = useSlideSpecificState(activeSlide?.id);
  const {
    setShowSecondSequenceYellowEdges2,
    setSecondSequenceYellowEdges2Locked,
    slide8YawChangedRef,
    slide6YawChangedRef,
    slide8WhiteCrossYawStateRef,
    secondLayerSetupYawChangedRef,
    secondLayerSetup2YawChangedRef,
    secondLayerSetup3YawChangedRef,
    secondLayerSetup4YawChangedRef,
    yellowEdges2YawChangedRef,
    yellowEdges3YawChangedRef,
    yellowEdges4YawChangedRef,
    yellowCorners2YawChangedRef,
    yellowCorners3YawChangedRef,
    orientTwoCornersYawChangedRef,
    orientThreeCornersYawChangedRef,
    orientFourCornersYawChangedRef,
    practiceSetupSolution9YawChangedRef,
    resetSlideSpecificState,
  } = slideSpecificState;

  const isWhiteCrossSolved = () => checkWhiteCrossSolved(cube3D);
  const isWhiteCornersSolved = () => checkWhiteCornersSolved(cube3D);
  const isSecondLayerSolved = () => checkSecondLayerSolved(cube3D);
  const isCubeFullySolved = () => checkCubeFullySolved(cube3D);

  const practiceCompletion = usePracticeSlideCompletion({
    activeSlideId: activeSlide?.id,
    cube3D,
    moveHistory,
    isWhiteCrossSolved,
    isWhiteCornersSolved,
    isSecondLayerSolved,
    isCubeFullySolved,
  });
  const {
    practiceCompleted,
    setPracticeCompleted,
    practiceShowTick,
    setPracticeShowTick,
    practiceTickProgress,
    setPracticeTickProgress,
    practiceTickLine,
    setPracticeTickLine,
    practiceTickAnimKey,
    setPracticeSetupComplete,
    setPracticeInitialCrossState,
    resetPracticeCompletion,
  } = practiceCompletion;

  const baseTutorialCube3D = useTutorialCube3D({
    lessonId,
    cube3D,
    activeSlideFilter: activeSlide?.filter,
  });

  const tutorialCube3D = useMemo(() => {
    if (
      lessonId === "rubiks-cube-introduction" &&
      (activeSlide?.id === "edge-pieces" || activeSlide?.id === "corner-pieces")
    ) {
      return makeCentersGrey(baseTutorialCube3D);
    }
    return baseTutorialCube3D;
  }, [lessonId, activeSlide?.id, baseTutorialCube3D]);

  useEffect(() => {
    tutorialCube3DRef.current = tutorialCube3D;
  }, [tutorialCube3D]);

  return {
    cubeRef,
    cube3D,
    setCube3D,
    previousTutorialCube3D,
    setPreviousTutorialCube3D,
    baselineTutorialCube3D,
    setBaselineTutorialCube3D,
    stickerGreyMap,
    setStickerGreyMap,
    colorFadeProgress,
    setColorFadeProgress,
    colorFadeProgressRef,
    tutorialCube3DRef,
    pendingMove,
    setPendingMove,
    isAnimating,
    setIsAnimating,
    isAnimatingRef,
    lastMoveTimeRef,
    lastMoveSourceRef,
    moveHistory,
    setMoveHistory,
    historyIndex,
    setHistoryIndex,
    moveHistoryRef,
    historyIndexRef,
    isResetting,
    setIsResetting,
    isResettingOrbit,
    setIsResettingOrbit,
    resetQueue,
    setResetQueue,
    resetIndexRef,
    isResettingRef,
    inputDisabled,
    setInputDisabled,
    queueFast,
    queueFastMs,
    isTransitioningRef,
    isTransitioning,
    setIsTransitioning,
    cubeViewRef,
    orbitControlsRef,
    cubeContainerRef,
    overlayContainerRef,
    canvasRef,
    transitionIdRef,
    isTouchDevice,
    canvasDpr,
    attachSetDpr,
    setInteractiveDpr,
    onDecline,
    onIncline,
    precisionActive,
    forceOrbitDisabledRef,
    slides,
    currentSlide,
    setCurrentSlide,
    activeSlide,
    fixSequence,
    fixIndex,
    setFixIndex,
    fixDoublePartialDir,
    setFixDoublePartialDir,
    fixErrorPulse,
    setFixErrorPulse,
    setFixShowTick,
    setFixTickAnimKey,
    setFixTickProgress,
    setFixTickLine,
    fixFirstTickPlayed,
    setFixFirstTickPlayed,
    setFixFirstTickProgress,
    setFixFirstTickLine,
    fixSecondTickPlayed,
    setFixSecondTickPlayed,
    setFixSecondTickProgress,
    setFixSecondTickLine,
    fixCompleted,
    triggerFixTick,
    resetFixState,
    midStage1Progress,
    midStage1Line,
    midStage1Key,
    midStage2Progress,
    midStage2Line,
    midStage2Key,
    midStage3Progress,
    midStage3Line,
    midStage3Key,
    midStage4Progress,
    midStage4Line,
    midStage4Key,
    midStage5Progress,
    midStage5Line,
    midStage5Key,
    midStage6Key,
    midStage6Progress,
    midStage6Line,
    midStage7Key,
    midStage7Progress,
    midStage7Line,
    resetMidStageTicks,
    animateMidlayerStage,
    setShowSecondSequenceYellowEdges2,
    setSecondSequenceYellowEdges2Locked,
    slide8YawChangedRef,
    slide6YawChangedRef,
    slide8WhiteCrossYawStateRef,
    secondLayerSetupYawChangedRef,
    secondLayerSetup2YawChangedRef,
    secondLayerSetup3YawChangedRef,
    secondLayerSetup4YawChangedRef,
    yellowEdges2YawChangedRef,
    yellowEdges3YawChangedRef,
    yellowEdges4YawChangedRef,
    yellowCorners2YawChangedRef,
    yellowCorners3YawChangedRef,
    orientTwoCornersYawChangedRef,
    orientThreeCornersYawChangedRef,
    orientFourCornersYawChangedRef,
    practiceSetupSolution9YawChangedRef,
    resetSlideSpecificState,
    practiceCompleted,
    setPracticeCompleted,
    practiceShowTick,
    setPracticeShowTick,
    practiceTickProgress,
    setPracticeTickProgress,
    practiceTickLine,
    setPracticeTickLine,
    practiceTickAnimKey,
    setPracticeSetupComplete,
    setPracticeInitialCrossState,
    resetPracticeCompletion,
    tutorialCube3D,
  };
};
