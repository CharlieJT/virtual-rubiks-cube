import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { flushSync } from "react-dom";
import { Vector3 } from "three";
import type { RubiksCube3DHandle } from "@components/RubiksCube3D/types";
import type { CubeMove, CubeState } from "@/types/cube";
import { CubeJSWrapper } from "@utils/cubejsWrapper";
import { AnimationHelper } from "@utils/animationHelper";
import cubejsTo3D from "@utils/cubejsTo3D";
import useIsTouchDevice from "@/hooks/useIsTouchDevice";
import useTwoFingerSpin from "@/hooks/useTwoFingerSpin";
import useTrackpadHandlers from "@/hooks/useTrackpadHandlers";
import useDprManager from "@/hooks/useDprManager";
import { useTutorialOrbitControls } from "@/hooks/useTutorialOrbitControls";
import getSlidesForLesson, {
  type Slide,
} from "@components/tutorials/slideDefinitions";
import {
  isWhiteCrossSolved as checkWhiteCrossSolved,
  isWhiteCornersSolved as checkWhiteCornersSolved,
  isSecondLayerSolved as checkSecondLayerSolved,
  isCubeFullySolved as checkCubeFullySolved,
  getSlideCameraConfig,
  createTutorialCubeState,
  getCubieColorSet,
} from "@/utils/tutorialHelpers";
import CUBE_COLORS from "@/consts/cubeColours";
import {
  getFixSequence,
  getFixSequenceDisplay,
} from "@/utils/fixSequenceHelpers";
import {
  isPracticeSlide as checkIsPracticeSlide,
  isRecapSlide as checkIsRecapSlide,
  requiresSetupDelay,
} from "@/consts/tutorialSlideConfig";
import { hasActiveHighlightBorder } from "@/consts/tutorialSlideConstants";
import { useFixSequenceState } from "@/hooks/useFixSequenceState";
import { useMidStageTicks } from "@/hooks/useMidStageTicks";
import { useSlideSpecificState } from "@/hooks/useSlideSpecificState";
import { usePracticeSlideCompletion } from "@/hooks/usePracticeSlideCompletion";
import { useSlideTransition } from "@/hooks/useSlideTransition";
import { useFixSequenceValidation } from "@/hooks/useFixSequenceValidation";
import { useYellowIndicators } from "@/hooks/useYellowIndicators";
import { useSequencePortalPosition } from "@/hooks/useSequencePortalPosition";
import { useTutorialCube3D } from "@/hooks/useTutorialCube3D";
import { useSlideInteractionRules } from "@/hooks/useSlideInteractionRules";
import { useSlideSetup } from "@/hooks/useSlideSetup";
import { makeCentersGrey } from "@/utils/makeCentersGrey";
import { parseMove, eqMove, mapMidlayerConceptual } from "@/utils/moveValidationHelpers";
import TutorialCubeView from "@components/tutorials/TutorialCubeView";
import SlideFooter from "@components/tutorials/SlideFooter";
import SlideSidePanel from "@components/tutorials/SlideSidePanel";
import ConfettiOverlay from "@components/tutorials/ConfettiOverlay";
import TutorialHeader from "@components/tutorials/TutorialHeader";

interface TutorialPageProps {
  lessonId: string;
  title: string;
  onBack: () => void;
}

const TutorialPage = ({ lessonId, title, onBack }: TutorialPageProps) => {
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
  const orbitControlsRef = useRef<any>(null);
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

  // Reset logo when slide changes
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
    fixTickAnimKey,
    setFixTickAnimKey,
    fixTickProgress,
    setFixTickProgress,
    fixTickLine,
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

  const isWhiteCrossSolved = useCallback(() => {
    return checkWhiteCrossSolved(cube3D);
  }, [cube3D]);

  const isWhiteCornersSolved = useCallback(() => {
    return checkWhiteCornersSolved(cube3D);
  }, [cube3D]);

  const isSecondLayerSolved = useCallback(() => {
    return checkSecondLayerSolved(cube3D);
  }, [cube3D]);

  const isCubeFullySolved = useCallback(() => {
    return checkCubeFullySolved(cube3D);
  }, [cube3D]);

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

  // Keep ref in sync with tutorialCube3D for use in callbacks
  useEffect(() => {
    tutorialCube3DRef.current = tutorialCube3D;
  }, [tutorialCube3D]);

  const { combinedPieceChildren } = useYellowIndicators({
    lessonId,
    activeSlideId: activeSlide?.id,
    cube3D,
    fixIndex,
  });

  const {
    orbitControlsEnabled,
    setOrbitControlsEnabled,
    handleOrbitControlsChange,
    disableOrbitTemporarily,
    clearControlsInternal,
    orbitPrevRef,
  } = useTutorialOrbitControls({
    activeSlide,
    orbitControlsRef,
    isTransitioningRef,
    forceOrbitDisabledRef,
  });

  const fixSequenceDisplay: string[] = useMemo(
    () => getFixSequenceDisplay(activeSlide?.id, fixSequence),
    [activeSlide?.id, fixSequence]
  );

  useSlideTransition({
    currentSlide,
    slides,
    lessonId,
    orbitControlsRef,
    cubeViewRef,
    cubeRef,
    transitionIdRef,
    isTransitioningRef,
    setIsTransitioning,
    setInputDisabled,
    setOrbitControlsEnabled,
    disableOrbitTemporarily,
    clearControlsInternal,
    orbitPrevRef,
  });

  const { touchCount } = useTwoFingerSpin(
    cubeContainerRef as React.RefObject<HTMLDivElement>,
    cubeViewRef as React.RefObject<RubiksCube3DHandle>,
    precisionActive,
    (enabled) => handleOrbitControlsChange(enabled)
  );
  const {
    onPointerDown: handleTrackpadPointerDown,
    onPointerMove: handleTrackpadPointerMove,
    onPointerUp: handleTrackpadPointerUp,
  } = useTrackpadHandlers(
    cubeViewRef as React.RefObject<RubiksCube3DHandle>,
    precisionActive
  );

  useSlideInteractionRules({
    activeSlide,
    isResetting,
    practiceCompleted,
    setInputDisabled,
    setOrbitControlsEnabled,
    handleOrbitControlsChange,
  });

  useSlideSetup({
    activeSlide,
    cubeRef,
    setCube3D,
    setMoveHistory,
    setHistoryIndex,
    moveHistoryRef,
    historyIndexRef,
    setPracticeCompleted,
    setPracticeShowTick,
    setPracticeInitialCrossState,
    setPracticeSetupComplete,
    setPracticeTickProgress,
    setPracticeTickLine,
    isTransitioningRef,
  });

  const handlePracticeOrbitChange = useCallback(
    (enabled: boolean) => {
      const isPracticeSlide10_11_12 = checkIsPracticeSlide(activeSlide?.id);

      if (activeSlide?.id === "find-green-white") {
        if (
          !enabled &&
          !forceOrbitDisabledRef.current &&
          !isTransitioningRef.current
        ) {
          handleOrbitControlsChange(true);
        } else if (enabled) {
          handleOrbitControlsChange(enabled);
        } else {
          if (!isTransitioningRef.current && !forceOrbitDisabledRef.current) {
            handleOrbitControlsChange(true);
          } else {
            handleOrbitControlsChange(enabled);
          }
        }
      } else if (isPracticeSlide10_11_12) {
        if (
          !enabled &&
          practiceCompleted &&
          !forceOrbitDisabledRef.current &&
          !isTransitioningRef.current
        ) {
          handleOrbitControlsChange(true);
        } else {
          handleOrbitControlsChange(enabled);
        }
      } else {
        handleOrbitControlsChange(enabled);
      }
    },
    [activeSlide?.id, practiceCompleted, handleOrbitControlsChange]
  );

  const handleButtonMove = useCallback(
    (move: string) => {
      if (fixCompleted) return;
      const isPracticeSlide = checkIsPracticeSlide(activeSlide?.id);
      if (isPracticeSlide && practiceCompleted) return;
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
    [isAnimating, fixCompleted, activeSlide?.id, practiceCompleted]
  );

  // Helper function to detect if a move is a slice move (M, E, S)
  const isSliceMove = useCallback((move: CubeMove | null): boolean => {
    if (!move) return false;
    const moveStr = move.toUpperCase();
    const baseMove = moveStr.replace(/['2]/g, "");
    return baseMove === "M" || baseMove === "E" || baseMove === "S";
  }, []);

  // Helper function to get the inverse of a slice move
  const getSliceMoveInverse = useCallback((move: CubeMove): CubeMove | null => {
    if (!isSliceMove(move)) return null;
    const moveStr = move.toUpperCase();
    if (moveStr.includes("2")) {
      // M2, E2, S2 are their own inverses
      return move;
    } else if (moveStr.includes("'")) {
      // M' -> M, E' -> E, S' -> S
      return moveStr.replace("'", "") as CubeMove;
    } else {
      // M -> M', E -> E', S -> S'
      return `${moveStr}'` as CubeMove;
    }
  }, [isSliceMove]);

  const showErrorFade = useCallback((wrongMove: CubeMove | null = null, fixSequence: string[] = [], fixIndex: number = 0) => {
    // Check if wrong move is a slice move
    const wrongMoveIsSlice = wrongMove ? isSliceMove(wrongMove) : false;
    
    // Debug: log the wrong move to verify it's being detected
    if (wrongMove) {
      console.log('[showErrorFade] Wrong move:', wrongMove, 'Is slice move:', wrongMoveIsSlice);
    }
    
    // Reset all yaw change refs so yaw changes can apply again after error
    // This ensures that when the user does the sequence again correctly,
    // the yaw changes will apply properly (same behavior as reset button)
    const currentSlideData = slides[currentSlide];
    if (currentSlideData?.id === "yellow-edges-solution-2") {
      yellowEdges2YawChangedRef.current = false;
    }
    if (currentSlideData?.id === "yellow-edges-solution-3") {
      yellowEdges3YawChangedRef.current = false;
    }
    if (currentSlideData?.id === "yellow-edges-solution-4") {
      yellowEdges4YawChangedRef.current = false;
    }
    if (currentSlideData?.id === "yellow-corners-solution-2") {
      yellowCorners2YawChangedRef.current = false;
    }
    if (currentSlideData?.id === "yellow-corners-solution-3") {
      yellowCorners3YawChangedRef.current = false;
    }
    if (currentSlideData?.id === "midlayer-green-white-extraction") {
      slide8WhiteCrossYawStateRef.current = 0;
    }
    if (currentSlideData?.id === "misaligned-green-white" || currentSlideData?.id === "flipped-misoriented-misaligned-green-white") {
      slide6YawChangedRef.current = false;
    }
    if (currentSlideData?.id === "practice-setup-solution-6") {
      slide8YawChangedRef.current = false;
    }
    if (currentSlideData?.id === "second-layer-setup-solution") {
      secondLayerSetupYawChangedRef.current = false;
    }
    if (currentSlideData?.id === "second-layer-setup-solution-2") {
      secondLayerSetup2YawChangedRef.current = false;
    }
    if (currentSlideData?.id === "second-layer-setup-solution-3") {
      secondLayerSetup3YawChangedRef.current = 0;
    }
    if (currentSlideData?.id === "second-layer-setup-solution-4") {
      secondLayerSetup4YawChangedRef.current = 0;
    }
    if (currentSlideData?.id === "orient-two-corners") {
      orientTwoCornersYawChangedRef.current = 0;
    }
    if (currentSlideData?.id === "orient-three-corners") {
      orientThreeCornersYawChangedRef.current = 0;
    }
    if (currentSlideData?.id === "orient-four-corners") {
      orientFourCornersYawChangedRef.current = 0;
    }
    if (currentSlideData?.id === "practice-setup-solution-9") {
      practiceSetupSolution9YawChangedRef.current = 0;
    }
    
    // For wrong moves: apply the wrong move temporarily to get the state with the wrong move for the fade
    // For reset (wrongMove is null): use current state directly
    if (wrongMove) {
      // IMPORTANT: The wrong move was NOT applied to cubeRef.current in handleMoveAnimationDone
      // (we validated it before applying). So we need to apply it now to get the state with the wrong move for the fade
      // We'll update the visual state synchronously to prevent flash
      // Apply wrong move to logical state
      cubeRef.current.move(wrongMove);
      // Update visual state synchronously with wrong move to start fade from correct state
      // Use flushSync to ensure this happens immediately in the same frame, preventing any flash
      // This must happen BEFORE any other React updates to prevent the flash
      flushSync(() => {
        setCube3D(cubejsTo3D(cubeRef.current.getCube()));
      });
    }
    
    // For slice moves, we need to remove x rotation from visual state FIRST
    // so the fade happens in the correct orientation (without x rotation)
    // This ensures the fade is smooth and the orientation is correct throughout
    
    // For slice moves, remove x rotation from cubeRef and update visual state
    // so both are in the correct orientation (without x rotation) for the fade
    if (wrongMoveIsSlice && wrongMove) {
      const baseMove = wrongMove.toUpperCase().replace(/['2]/g, "");
      const isPrime = wrongMove.includes("'");
      const isDouble = wrongMove.includes("2");
      
      // Determine the x rotation that needs to be removed
      let xRotationToRemove: CubeMove | null = null;
      if (baseMove === "M") {
        if (isDouble) xRotationToRemove = "x2";
        else if (isPrime) xRotationToRemove = "x'";
        else xRotationToRemove = "x";
      } else if (baseMove === "E") {
        if (isDouble) xRotationToRemove = "y2";
        else if (isPrime) xRotationToRemove = "y'";
        else xRotationToRemove = "y";
      } else if (baseMove === "S") {
        if (isDouble) xRotationToRemove = "z2";
        else if (isPrime) xRotationToRemove = "z";
        else xRotationToRemove = "z'";
      }
      
      // Remove x rotation from logical state
      if (xRotationToRemove) {
        if (xRotationToRemove === "x") cubeRef.current.move("x'");
        else if (xRotationToRemove === "x'") cubeRef.current.move("x");
        else if (xRotationToRemove === "x2") cubeRef.current.move("x2");
        else if (xRotationToRemove === "y") cubeRef.current.move("y'");
        else if (xRotationToRemove === "y'") cubeRef.current.move("y");
        else if (xRotationToRemove === "y2") cubeRef.current.move("y2");
        else if (xRotationToRemove === "z") cubeRef.current.move("z'");
        else if (xRotationToRemove === "z'") cubeRef.current.move("z");
        else if (xRotationToRemove === "z2") cubeRef.current.move("z2");
        
        // Update visual state synchronously to match (without x rotation now)
        flushSync(() => {
          setCube3D(cubejsTo3D(cubeRef.current.getCube()));
        });
      }
    }
    
    // Capture current state WITH the wrong move but WITHOUT x rotation (aligned with baseline)
    // This ensures the fade happens in the correct orientation
    const currentCubeStateWithWrongMove = cubejsTo3D(cubeRef.current.getCube());
    
    // Both current and baseline states are now in the same orientation (without x rotation)
    // So we can use them directly for comparison and fade
    const currentCubeStateForComparison = currentCubeStateWithWrongMove;
    
    // Debug: Check if the wrong move is actually in the cube state
    // For M move, check if centers are rotated
    if (wrongMoveIsSlice && wrongMove) {
      const baseMove = wrongMove.toUpperCase().replace(/['2]/g, "");
      if (baseMove === "M") {
        // M move rotates front/back/top/bottom centers
        // Check front center color and cubejs state string
        const frontCenter = currentCubeStateWithWrongMove[1]?.[1]?.[2];
        const currentCubejsState = cubeRef.current.getState();
        console.log('[showErrorFade] Current state front center:', frontCenter?.colors?.front);
        console.log('[showErrorFade] Current cubejs state (first 20 chars):', currentCubejsState.substring(0, 20));
      }
    }
    
    // Compute filtered state synchronously using the visual state (what's on screen)
    // This ensures the fade starts from what the user actually sees
    const base = createTutorialCubeState(lessonId, currentCubeStateWithWrongMove);
    const grey = "#808080";
    
    // Apply filter if it exists
    let filtered = base;
    if (activeSlide?.filter) {
      filtered = base.map((layer) =>
        layer.map((row) =>
          row.map((piece) => {
            const visible = activeSlide.filter!(piece);
            if (visible) {
              return piece;
            }
            return {
              ...piece,
              colors: {
                front: grey,
                back: grey,
                left: grey,
                right: grey,
                top: grey,
                bottom: grey,
              },
            };
          })
        )
      );
    }
    
    // Apply yellow-cross lesson specific filtering
    if (lessonId === "yellow-cross") {
      filtered = filtered.map((layer) =>
        layer.map((row) =>
          row.map((piece) => {
            const set = getCubieColorSet(piece);
            if (set.size === 2 && set.has(CUBE_COLORS.YELLOW)) {
              const newColors = { ...piece.colors };
              const faceKeys: Array<keyof typeof piece.colors> = [
                "front", "back", "left", "right", "top", "bottom",
              ];
              for (const face of faceKeys) {
                const color = piece.colors[face];
                if (
                  color &&
                  color !== CUBE_COLORS.YELLOW &&
                  color !== grey &&
                  color !== CUBE_COLORS.BLACK
                ) {
                  newColors[face] = grey;
                }
              }
              return { ...piece, colors: newColors };
            }
            return piece;
          })
        )
      );
    }
    
    // Apply makeCentersGrey if needed
    const finalFiltered = 
      lessonId === "rubiks-cube-introduction" &&
      (activeSlide?.id === "edge-pieces" || activeSlide?.id === "corner-pieces")
        ? makeCentersGrey(filtered)
        : filtered;
    
    setPreviousTutorialCube3D(finalFiltered);
    
    // Compute baseline filtered state (what the cube SHOULD be - the reset state)
    // The baseline is just the slide setup (no moves), like the reset button
    // This ensures that when a wrong move is made, ALL moves are reverted, not just the wrong one
    const slide = slides[currentSlide];
    const tempCubeRef = new CubeJSWrapper();
    tempCubeRef.reset();
    if (slide?.setup) {
      tempCubeRef.reset();
      slide.setup(tempCubeRef);
    }
    
    // Don't apply any correct moves - baseline is just slide setup
    // This makes the error fade behave like the reset button
    
    // Baseline is the correct target state (without wrong move, without x rotation)
    const baselineCubeState = cubejsTo3D(tempCubeRef.getCube());
    const baselineCubejsState = tempCubeRef.getState();
    
    // Debug: Check baseline state for M move
    if (wrongMoveIsSlice && wrongMove) {
      const baseMove = wrongMove.toUpperCase().replace(/['2]/g, "");
      if (baseMove === "M") {
        const currentCubejsState = cubeRef.current.getState();
        console.log('[showErrorFade] Baseline front center (no x rotation):', baselineCubeState[1]?.[1]?.[2]?.colors?.front);
        console.log('[showErrorFade] Baseline cubejs state (first 20 chars):', baselineCubejsState.substring(0, 20));
        console.log('[showErrorFade] Current cubejs state (first 20 chars):', currentCubejsState.substring(0, 20));
        console.log('[showErrorFade] States are equal?', currentCubejsState === baselineCubejsState);
        console.log('[showErrorFade] Baseline computed with fixIndex:', fixIndex, 'fixSequence length:', fixSequence.length);
      }
    }
    
    // Both current and baseline states are now in the same orientation (no x rotation)
    // So we can compare directly
    const baselineBase = createTutorialCubeState(lessonId, baselineCubeState);
    let baselineFiltered = baselineBase;
    if (activeSlide?.filter) {
      baselineFiltered = baselineBase.map((layer) =>
        layer.map((row) =>
          row.map((piece) => {
            const visible = activeSlide.filter!(piece);
            if (visible) {
              return piece;
            }
            return {
              ...piece,
              colors: {
                front: grey,
                back: grey,
                left: grey,
                right: grey,
                top: grey,
                bottom: grey,
              },
            };
          })
        )
      );
    }
    
    if (lessonId === "yellow-cross") {
      baselineFiltered = baselineFiltered.map((layer) =>
        layer.map((row) =>
          row.map((piece) => {
            const set = getCubieColorSet(piece);
            if (set.size === 2 && set.has(CUBE_COLORS.YELLOW)) {
              const newColors = { ...piece.colors };
              const faceKeys: Array<keyof typeof piece.colors> = [
                "front", "back", "left", "right", "top", "bottom",
              ];
              for (const face of faceKeys) {
                const color = piece.colors[face];
                if (
                  color &&
                  color !== CUBE_COLORS.YELLOW &&
                  color !== grey &&
                  color !== CUBE_COLORS.BLACK
                ) {
                  newColors[face] = grey;
                }
              }
              return { ...piece, colors: newColors };
            }
            return piece;
          })
        )
      );
    }
    
    const finalBaselineFiltered = 
      lessonId === "rubiks-cube-introduction" &&
      (activeSlide?.id === "edge-pieces" || activeSlide?.id === "corner-pieces")
        ? makeCentersGrey(baselineFiltered)
        : baselineFiltered;
    
    // Compare previous state with baseline and create grey map
    const greyMap = new Map<string, boolean>();
    
    // If wrong move is a slice move, determine which slice layer to check
    let isInSliceLayer: ((x: number, y: number, z: number) => boolean) | null = null;
    
    if (wrongMoveIsSlice && wrongMove) {
      const baseMove = wrongMove.toUpperCase().replace(/['2]/g, "");
      // Define which pieces are in each slice layer
      switch (baseMove) {
        case "M":
          // M slice: middle layer between L and R (x === 1)
          isInSliceLayer = (x) => x === 1;
          break;
        case "E":
          // E slice: equatorial layer between U and D (y === 1)
          isInSliceLayer = (_x, y) => y === 1;
          break;
        case "S":
          // S slice: standing layer between F and B (z === 1)
          isInSliceLayer = (_x, _y, z) => z === 1;
          break;
      }
    }
    
    // Both current and baseline states are now in the same orientation (without x rotation)
    // So we can use them directly for the fade
    let finalBaselineFilteredForSlice = finalBaselineFiltered;
    let finalPreviousFilteredForSlice = finalFiltered;
    
    // Debug: Check if M slice colors differ between previous and baseline
    if (wrongMoveIsSlice && wrongMove) {
      const baseMove = wrongMove.toUpperCase().replace(/['2]/g, "");
      if (baseMove === "M") {
        console.log('[showErrorFade] Checking M slice color differences...');
        // Check a few M slice pieces
        const mSlicePositions = [[1, 1, 2], [1, 2, 1], [1, 0, 1], [1, 1, 0]];
        for (const [x, y, z] of mSlicePositions) {
          const prev = finalPreviousFilteredForSlice[x]?.[y]?.[z];
          const base = finalBaselineFilteredForSlice[x]?.[y]?.[z];
          if (prev && base) {
            const prevFront = prev.colors.front || CUBE_COLORS.BLACK;
            const baseFront = base.colors.front || CUBE_COLORS.BLACK;
            const prevTop = prev.colors.top || CUBE_COLORS.BLACK;
            const baseTop = base.colors.top || CUBE_COLORS.BLACK;
            console.log(`[${x},${y},${z}] Prev: front=${prevFront}, top=${prevTop}`);
            console.log(`[${x},${y},${z}] Base: front=${baseFront}, top=${baseTop}`);
            console.log(`[${x},${y},${z}] Front differs: ${prevFront !== baseFront}, Top differs: ${prevTop !== baseTop}`);
          }
        }
      }
    }
    
    console.log('[showErrorFade] Setting previousTutorialCube3D:', finalPreviousFilteredForSlice ? 'has data' : 'null');
    console.log('[showErrorFade] Setting baselineTutorialCube3D:', finalBaselineFilteredForSlice ? 'has data' : 'null');
    console.log('[showErrorFade] M slice [1,1,2] previous:', finalPreviousFilteredForSlice?.[1]?.[1]?.[2]?.colors?.front);
    console.log('[showErrorFade] M slice [1,1,2] baseline:', finalBaselineFilteredForSlice?.[1]?.[1]?.[2]?.colors?.front);
    
    setPreviousTutorialCube3D(finalPreviousFilteredForSlice);
    setBaselineTutorialCube3D(finalBaselineFilteredForSlice);
    
    // Both current and baseline states are in the same orientation (without x rotation)
    // So we can use them directly for comparison
    let comparisonFiltered = finalFiltered;
    if (wrongMoveIsSlice) {
      // Create filtered state from comparison state (without x rotation) for finding differences
      const comparisonBase = createTutorialCubeState(lessonId, currentCubeStateForComparison);
      let comparisonFilteredTemp = comparisonBase;
      if (activeSlide?.filter) {
        const grey = "#808080";
        comparisonFilteredTemp = comparisonBase.map((layer) =>
          layer.map((row) =>
            row.map((piece) => {
              const visible = activeSlide.filter!(piece);
              if (visible) {
                return piece;
              }
              return {
                ...piece,
                colors: {
                  front: grey,
                  back: grey,
                  left: grey,
                  right: grey,
                  top: grey,
                  bottom: grey,
                },
              };
            })
          )
        );
      }
      if (lessonId === "yellow-cross") {
        comparisonFilteredTemp = comparisonFilteredTemp.map((layer) =>
          layer.map((row) =>
            row.map((piece) => {
              const set = getCubieColorSet(piece);
              if (set.size === 2 && set.has(CUBE_COLORS.YELLOW)) {
                const newColors = { ...piece.colors };
                const faceKeys: Array<keyof typeof piece.colors> = [
                  "front", "back", "left", "right", "top", "bottom",
                ];
                for (const face of faceKeys) {
                  const color = piece.colors[face];
                  if (
                    color &&
                    color !== CUBE_COLORS.YELLOW &&
                    color !== "#808080" &&
                    color !== CUBE_COLORS.BLACK
                  ) {
                    newColors[face] = "#808080";
                  }
                }
                return { ...piece, colors: newColors };
              }
              return piece;
            })
          )
        );
      }
      comparisonFiltered = 
        lessonId === "rubiks-cube-introduction" &&
        (activeSlide?.id === "edge-pieces" || activeSlide?.id === "corner-pieces")
          ? makeCentersGrey(comparisonFilteredTemp)
          : comparisonFilteredTemp;
    }
    
    // Compare ALL pieces and mark all that differ for fade
    // This ensures that if correct moves were made before a wrong move (slice or regular),
    // all affected pieces fade correctly
    let sliceLayerDiffCount = 0;
    let otherLayerDiffCount = 0;
    
    // Use comparison state (aligned with baseline) to find differences
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
          const previousPiece = comparisonFiltered[x]?.[y]?.[z];
          const baselinePiece = finalBaselineFiltered[x]?.[y]?.[z];
          if (previousPiece && baselinePiece) {
            const inSlice = wrongMoveIsSlice && isInSliceLayer ? isInSliceLayer(x, y, z) : false;
            const faceKeys: Array<keyof typeof previousPiece.colors> = [
              "front", "back", "left", "right", "top", "bottom",
            ];
            for (const face of faceKeys) {
              const previousColor = previousPiece.colors[face] || CUBE_COLORS.BLACK;
              const baselineColor = baselinePiece.colors[face] || CUBE_COLORS.BLACK;
              const key = `${x},${y},${z},${face}`;
              const differs = previousColor !== CUBE_COLORS.BLACK && previousColor !== baselineColor;
              if (differs) {
                greyMap.set(key, true);
                if (inSlice) {
                  sliceLayerDiffCount++;
                } else {
                  otherLayerDiffCount++;
                }
              }
            }
          }
        }
      }
    }
    
    // Debug: log what we found
    if (wrongMoveIsSlice) {
      console.log('[showErrorFade] Slice layer differences:', sliceLayerDiffCount, 'Other layer differences:', otherLayerDiffCount);
      console.log('[showErrorFade] Grey map size:', greyMap.size);
      // Log some example differences in M slice for debugging
      if (wrongMove && wrongMove.toUpperCase().replace(/['2]/g, "") === "M") {
        console.log('[showErrorFade] Checking M slice centers...');
        // Check centers in M slice (x === 1)
        const mSliceCenters = [
          [1, 1, 2], // front center
          [1, 2, 1], // top center
          [1, 1, 0], // back center
          [1, 0, 1], // bottom center
        ];
        for (const [x, y, z] of mSliceCenters) {
          const prev = finalFiltered[x]?.[y]?.[z];
          const base = finalBaselineFiltered[x]?.[y]?.[z];
          if (prev && base) {
            const prevFront = prev.colors.front || CUBE_COLORS.BLACK;
            const baseFront = base.colors.front || CUBE_COLORS.BLACK;
            const prevTop = prev.colors.top || CUBE_COLORS.BLACK;
            const baseTop = base.colors.top || CUBE_COLORS.BLACK;
            console.log(`[${x},${y},${z}] Front: prev=${prevFront}, base=${baseFront}, diff=${prevFront !== baseFront}`);
            console.log(`[${x},${y},${z}] Top: prev=${prevTop}, base=${baseTop}, diff=${prevTop !== baseTop}`);
          }
        }
      }
    }
    
    console.log('[showErrorFade] Final grey map size:', greyMap.size);
    console.log('[showErrorFade] Setting previousTutorialCube3D and baselineTutorialCube3D');
    setStickerGreyMap(greyMap);
    setColorFadeProgress(0);
    
    // Reset orbit/yaw to original position (same as resetToSlideBaseline does)
    disableOrbitTemporarily();
    if (orbitControlsRef.current) {
      const c: any = orbitControlsRef.current;
      if (!c.target) c.target = new Vector3(0, 0, 0);
      else c.target.set(0, 0, 0);
      if (c.update) c.update();
      clearControlsInternal();
      const slide = slides[currentSlide];
      c.__resetOpts = getSlideCameraConfig(slide?.id, lessonId);
    }
    setIsResettingOrbit(true);
    cubeViewRef.current?.resetToInitialPosition(
      orbitControlsRef,
      cubeRef,
      () => {
        setIsResettingOrbit(false);
        const controls: any = orbitControlsRef.current;
        setInputDisabled(false);
        if (controls) {
          controls.enabled = true;
          controls.noRotate = false;
          if (typeof controls.staticMoving === "boolean")
            controls.staticMoving = false;
          if (typeof controls.dynamicDampingFactor === "number")
            controls.dynamicDampingFactor = 0.35;
          if (typeof controls.rotateSpeed === "number")
            controls.rotateSpeed = 1.2;
          setOrbitControlsEnabled(true);
          if (typeof controls.update === "function") controls.update();
        }
        orbitPrevRef.current = null;
        isTransitioningRef.current = false;
      }
    );
    
    // Animate fade from 0 to 1 (Phase 1: 0-0.5, delay, Phase 2: 0.5-1.0)
    const phase1Duration = 120; // milliseconds for Phase 1
    const phase2Delay = 120; // milliseconds delay before Phase 2
    const phase2Duration = 120; // milliseconds for Phase 2
    const totalFadeDuration = phase1Duration + phase2Delay + phase2Duration; // 300ms total
    let startTime: number | null = null;
    console.log('[showErrorFade] Starting fade animation, grey map size:', greyMap.size);
    const animateFade = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp;
        console.log('[showErrorFade] Fade animation started');
      }
      const elapsed = timestamp - startTime;
      
      // Calculate progress with delay: Phase 1 (0-0.5), delay (stay at 0.5), Phase 2 (0.5-1.0)
      let progress = 0;
      if (elapsed < phase1Duration) {
        // Phase 1: 0 to 0.5
        progress = (elapsed / phase1Duration) * 0.5;
      } else if (elapsed < phase1Duration + phase2Delay) {
        // Delay: stay at 0.5
        progress = 0.5;
      } else {
        // Phase 2: 0.5 to 1.0
        const phase2Elapsed = elapsed - (phase1Duration + phase2Delay);
        progress = 0.5 + (phase2Elapsed / phase2Duration) * 0.5;
      }
      
      progress = Math.min(1, progress);
      setColorFadeProgress(progress);
      
      // Debug: log progress occasionally
      if (Math.floor(progress * 10) % 2 === 0 && elapsed % 50 < 20) {
        console.log('[showErrorFade] Fade progress:', progress.toFixed(2), 'elapsed:', elapsed.toFixed(0));
      }
      
      if (elapsed < totalFadeDuration) {
        requestAnimationFrame(animateFade);
      } else {
        console.log('[showErrorFade] Fade animation complete');
        // Fade complete - reset the cube's logical state to baseline
        const slide = slides[currentSlide];
        
        // Reset the cube's logical state to baseline
        // The baseline is just the slide setup (no moves), like the reset button
        cubeRef.current.reset();
        if (slide?.setup) {
          cubeRef.current.reset();
          slide.setup(cubeRef.current);
        }
        
        // Clear fade state first (before updating visual state to avoid flicker)
        setPreviousTutorialCube3D(null);
        setBaselineTutorialCube3D(null);
        setStickerGreyMap(new Map());
        setColorFadeProgress(0);
        
        // Update visual state to match logical state (baseline without x rotation)
        // The fade has already transitioned the colors, so this just syncs positions
        setCube3D(cubejsTo3D(cubeRef.current.getCube()));
      }
    };
    requestAnimationFrame(animateFade);
  }, [lessonId, activeSlide, slides, currentSlide, cubeRef, createTutorialCubeState, getCubieColorSet, makeCentersGrey, disableOrbitTemporarily, clearControlsInternal, orbitControlsRef, cubeViewRef, setInputDisabled, setOrbitControlsEnabled, getSlideCameraConfig, orbitPrevRef, isTransitioningRef, isSliceMove, getSliceMoveInverse]);

  const resetToSlideBaseline = useCallback(async (skipFixIndexReset = false) => {
    // Use the same fade behavior as wrong moves
    // Call showErrorFade with null wrongMove to trigger the fade from current state to baseline
    // showErrorFade will handle the fade animation and reset the cube
    showErrorFade(null, [], 0);
    
    // Wait for fade to complete before continuing with reset logic
    // The fade animation is 300ms total (100ms phase 1 + 100ms delay + 100ms phase 2)
    await new Promise(resolve => setTimeout(resolve, 350));
    
    // Now continue with the rest of the reset logic (but NOT cube reset - showErrorFade already did that)
    isTransitioningRef.current = true;
    setInputDisabled(true);
    disableOrbitTemporarily();
    if (!skipFixIndexReset) {
      setFixIndex(0);
    }
    setFixDoublePartialDir(0);

    setIsResetting(true);
    isResettingRef.current = true;
    setPendingMove(null);
    setIsAnimating(false);
    isAnimatingRef.current = false;
    if (!skipFixIndexReset) {
      resetFixState();
    } else {
      // When skipping fixIndex reset, still reset other fix state but preserve fixIndex and fixErrorPulse
      setFixDoublePartialDir(0);
      setFixShowTick(false);
      setFixTickAnimKey((k: number) => k + 1);
      setFixTickProgress(false);
      setFixTickLine(false);
      setFixFirstTickPlayed(false);
      setFixFirstTickProgress(false);
      setFixFirstTickLine(false);
      setFixSecondTickPlayed(false);
      setFixSecondTickProgress(false);
      setFixSecondTickLine(false);
    }
    resetMidStageTicks();
    resetSlideSpecificState();
    resetPracticeCompletion();
    
    setMoveHistory([]);
    setHistoryIndex(-1);
    moveHistoryRef.current = [];
    historyIndexRef.current = -1;
    setResetQueue(null);
    resetIndexRef.current = 0;

    // Reset logo to default position
    cubeViewRef.current?.resetLogo();

    setIsResetting(false);
    isResettingRef.current = false;

    // Note: showErrorFade already handles orbit reset, so we don't need to do it again here
    // But we still need to handle the completion callback for practice slides
    const s = slides[currentSlide];
    if (checkIsPracticeSlide(s?.id)) {
      setTimeout(() => {
        setPracticeSetupComplete(true);
      }, 100);
    }

    if (requiresSetupDelay(s?.id)) {
      setPracticeSetupComplete(true);
    }
  }, [slides, currentSlide, disableOrbitTemporarily, lessonId, activeSlide, cubeRef, showErrorFade, resetFixState, resetMidStageTicks, resetSlideSpecificState, resetPracticeCompletion, setFixIndex, setFixDoublePartialDir, setFixShowTick, setFixTickAnimKey, setFixTickProgress, setFixTickLine, setFixFirstTickPlayed, setFixFirstTickProgress, setFixFirstTickLine, setFixSecondTickPlayed, setFixSecondTickProgress, setFixSecondTickLine, cubeViewRef, setInputDisabled, setPracticeSetupComplete]);

  const { validateMove } = useFixSequenceValidation({
    fixSequence,
    fixIndex,
    fixDoublePartialDir,
    activeSlideId: activeSlide?.id,
    lessonId,
    isTransitioningRef,
    setFixIndex,
    setFixDoublePartialDir,
    setFixErrorPulse,
    setFixShowTick,
    orbitControlsRef,
    cubeViewRef,
    cubeRef,
    slide8WhiteCrossYawStateRef,
    slide6YawChangedRef,
    slide8YawChangedRef,
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
    animateMidlayerStage,
    triggerFixTick,
    resetToSlideBaseline,
    showErrorFade,
    setFixFirstTickProgress,
    setFixFirstTickLine,
    setFixFirstTickPlayed,
    setFixSecondTickProgress,
    setFixSecondTickLine,
    setFixSecondTickPlayed,
    fixFirstTickPlayed,
    fixSecondTickPlayed,
    setShowSecondSequenceYellowEdges2,
    setSecondSequenceYellowEdges2Locked,
  });

  const handleStartAnimation = useCallback(() => {
    setIsAnimating(true);
    isAnimatingRef.current = true;
    forceOrbitDisabledRef.current = true;
    handleOrbitControlsChange(false);
  }, [handleOrbitControlsChange]);

  const handleMoveAnimationDone = useCallback(
    (move: CubeMove) => {
      if (isResettingRef.current) {
        setPendingMove(null);
        setIsAnimating(false);
        isAnimatingRef.current = false;
        lastMoveSourceRef.current = null;
        return;
      }
      const isWholeCubeRotation =
        move === "x" ||
        move === "x'" ||
        move === "y" ||
        move === "y'" ||
        move === "z" ||
        move === "z'";

      const wasManual =
        (window as Window & { __isManualDragMove?: boolean })
          .__isManualDragMove || lastMoveSourceRef.current === "manual";

      if (!isWholeCubeRotation) {
        const isManualMove = wasManual;
        const isUndoRedo =
          lastMoveSourceRef.current === "undo" ||
          lastMoveSourceRef.current === "redo";
        
        // Validate move BEFORE applying to logical state to prevent flash
        let shouldApplyMove = true;
        if (fixSequence.length > 0 && isManualMove && !isUndoRedo) {
          // Check if move is wrong BEFORE applying it
          const expected = fixSequence[fixIndex];
          if (expected) {
            const exp = parseMove(expected);
            const mappedMove = mapMidlayerConceptual(
              move as string,
              activeSlide?.id,
              fixIndex
            );
            const got = parseMove(mappedMove);
            const mappedMoveForEq = mapMidlayerConceptual(
              move as string,
              activeSlide?.id,
              fixIndex
            );
            
            // Check if move matches expected (handling double moves)
            // Note: We only check here to prevent wrong moves from being applied
            // The actual validation and fixIndex update happens in validateMove
            let isCorrect = false;
            if (exp.mod === "2") {
              if (fixDoublePartialDir !== 0) {
                // We're in the middle of a double move - check if this move completes it
                const expectedDir = fixDoublePartialDir;
                const gotDir = got.mod === "'" ? -1 : got.mod === "2" ? 0 : 1;
                isCorrect = got.base === exp.base && gotDir !== 0 && gotDir === expectedDir;
              } else {
                // No partial move yet - check if this is a complete double move
                // OR if it's the first part of a double move (R or R')
                // Both are considered "correct" - validateMove will handle the fixIndex update
                if (got.base === exp.base && got.mod === "2") {
                  // Complete double move - correct, validateMove will increment fixIndex by 1
                  isCorrect = true;
                } else if (got.base === exp.base && (got.mod === "" || got.mod === "'")) {
                  // First part of a double move - also correct, validateMove will set fixDoublePartialDir
                  isCorrect = true;
                } else {
                  isCorrect = false;
                }
              }
            } else {
              isCorrect = eqMove(mappedMoveForEq, expected);
            }
            
            if (!isCorrect) {
              // Move is wrong - apply it temporarily to get wrong state, update visual immediately
              // This must happen BEFORE any other React updates to prevent flash
              cubeRef.current.move(move);
              flushSync(() => {
                setCube3D(cubejsTo3D(cubeRef.current.getCube()));
              });
              
              // Now revert from logical state (visual state already shows wrong move)
              const isSlice = isSliceMove(move);
              const inverseMove = isSlice ? getSliceMoveInverse(move) : (() => {
                if (move.endsWith("'")) return move.slice(0, -1) as CubeMove;
                if (move.endsWith("2")) return move as CubeMove;
                return (move + "'") as CubeMove;
              })();
              if (inverseMove) {
                cubeRef.current.move(inverseMove);
              }
              
              shouldApplyMove = false;
              // Mark that validateMove was called for wrong move
              (window as any).__isWrongMove = true;
              // Call validateMove synchronously to start error fade immediately
              // showErrorFade will re-apply the move (it's already in visual state) and handle fade
              validateMove(move, wasManual);
            }
          }
        }
        
        // Only apply move to logical state if it's correct
        if (shouldApplyMove) {
          cubeRef.current.move(move);
          setCube3D(cubejsTo3D(cubeRef.current.getCube()));
        }

        if (isManualMove && !isUndoRedo) {
          const currHistory = moveHistoryRef.current;
          const currIndex = historyIndexRef.current;
          const base =
            currIndex === -1
              ? currHistory
              : currHistory.slice(0, currIndex + 1);
          const nextHistory = [...base, move];
          setMoveHistory(nextHistory);
          setHistoryIndex(nextHistory.length - 1);
          moveHistoryRef.current = nextHistory;
          historyIndexRef.current = nextHistory.length - 1;
        }
      }

      setPendingMove(null);
      setIsAnimating(false);
      isAnimatingRef.current = false;
      forceOrbitDisabledRef.current = false;
      handleOrbitControlsChange(true);

      if (resetQueue && resetQueue.length > 0) {
        const nextIdx = resetIndexRef.current + 1;
        if (nextIdx < resetQueue.length) {
          resetIndexRef.current = nextIdx;
          lastMoveSourceRef.current = "queue";
          setPendingMove(resetQueue[nextIdx] as CubeMove);
        } else {
          setResetQueue(null);
          resetIndexRef.current = 0;
          lastMoveSourceRef.current = null;
          setIsResetting(false);
          setCube3D(cubejsTo3D(cubeRef.current.getCube()));
        }
      } else {
        lastMoveSourceRef.current = null;
      }

      // Only call validateMove if we haven't already called it for a wrong move
      // (wrong moves are validated immediately above to prevent flash)
      const wasWrongMove = (window as any).__isWrongMove;
      if (fixSequence.length > 0 && wasManual && !wasWrongMove) {
        validateMove(move, wasManual);
      }
      // Clear the flag
      (window as any).__isWrongMove = false;
    },
    [resetQueue, fixSequence, validateMove, handleOrbitControlsChange]
  );

  const hasInteractedGloballyRef = useRef(false);

  useEffect(() => {
    hasInteractedGloballyRef.current = false;
  }, [currentSlide]);

  const sequencePortalPosition = useSequencePortalPosition({
    fixSequenceLength: fixSequence.length,
    activeSlideId: activeSlide?.id,
    cubeContainerRef,
  });

  return (
    <div
      className="min-h-[100dvh] flex flex-col relative"
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
      {fixErrorPulse && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            zIndex: 0,
            background: `
              radial-gradient(
                circle at 50% 50%,
                rgba(255,0,0,0) 0%,
                rgba(255,0,0,0) 20%,
                rgba(255,0,0,0.1) 50%,
                rgba(255,0,0,0.15) 70%,
                rgba(220,0,0,0.2) 85%,
                rgba(180,0,0,0.25) 100%
              ),
              linear-gradient(45deg, rgba(255,107,107,0.3) 0%, rgba(220,38,38,0.35) 50%, rgba(153,27,27,0.4) 100%)
            `,
            backgroundBlendMode: "normal",
            opacity: 0.8,
            transition: "opacity 0.15s ease-in-out",
          }}
        />
      )}
      <TutorialHeader title={title} onBack={onBack} />

      <div
        className={`relative flex flex-1 min-h-0 ${
          checkIsRecapSlide(activeSlide?.id)
            ? "h-[100dvh] overflow-hidden"
            : "overflow-hidden"
        }`}
      >
        {activeSlide?.showConfetti && (
          <ConfettiOverlay active={!!activeSlide.showConfetti} />
        )}
        <TutorialCubeView
          cubeContainerRef={cubeContainerRef}
          overlayContainerRef={overlayContainerRef}
          canvasRef={canvasRef}
          cubeViewRef={cubeViewRef}
          orbitControlsRef={orbitControlsRef}
          orbitControlsEnabled={orbitControlsEnabled}
          canvasDpr={canvasDpr}
          attachSetDpr={attachSetDpr}
          setInteractiveDpr={setInteractiveDpr}
          onDecline={onDecline}
          onIncline={onIncline}
          isTouchDevice={isTouchDevice}
          hasInteractedGloballyRef={hasInteractedGloballyRef}
          tutorialCube3D={tutorialCube3D}
          previousCube3D={previousTutorialCube3D}
          baselineCube3D={baselineTutorialCube3D}
          stickerGreyMap={stickerGreyMap}
          colorFadeProgress={colorFadeProgress}
          touchCount={touchCount}
          pendingMove={pendingMove}
          isAnimating={isAnimating}
          handleMoveAnimationDone={handleMoveAnimationDone}
          handleStartAnimation={handleStartAnimation}
          handlePracticeOrbitChange={handlePracticeOrbitChange}
          handleButtonMove={handleButtonMove}
          lastMoveSourceRef={lastMoveSourceRef}
          queueFast={queueFast}
          queueFastMs={queueFastMs}
          activeSlideId={activeSlide?.id}
          activeSlideAllowFaceMoves={activeSlide?.allowFaceMoves}
          activeSlideAllowSliceMoves={activeSlide?.allowSliceMoves}
          lessonId={lessonId}
          practiceCompleted={practiceCompleted}
          fixCompleted={fixCompleted}
          inputDisabled={inputDisabled}
          combinedPieceChildren={combinedPieceChildren}
          practiceShowTick={practiceShowTick}
          practiceTickAnimKey={practiceTickAnimKey}
          practiceTickProgress={practiceTickProgress}
          practiceTickLine={practiceTickLine}
          currentSlide={currentSlide}
          slidesLength={slides.length}
          setCurrentSlide={setCurrentSlide}
          isResetting={isResetting}
          isResettingOrbit={isResettingOrbit}
          isTransitioning={isTransitioning}
          resetToSlideBaseline={resetToSlideBaseline}
          cubeRef={cubeRef}
          handleTrackpadPointerDown={handleTrackpadPointerDown}
          handleTrackpadPointerMove={handleTrackpadPointerMove}
          handleTrackpadPointerUp={handleTrackpadPointerUp}
          fixIndex={fixIndex}
          fixDoublePartialDir={fixDoublePartialDir}
          fixSequence={fixSequence}
          fixSequenceDisplay={fixSequenceDisplay}
          fixErrorPulse={fixErrorPulse}
          hasActiveHighlightBorder={hasActiveHighlightBorder}
          fixSequenceLength={fixSequence.length}
          sequencePortalPosition={sequencePortalPosition}
          midStage1Key={midStage1Key}
          midStage1Progress={midStage1Progress}
          midStage1Line={midStage1Line}
          midStage2Key={midStage2Key}
          midStage2Progress={midStage2Progress}
          midStage2Line={midStage2Line}
          midStage3Key={midStage3Key}
          midStage3Progress={midStage3Progress}
          midStage3Line={midStage3Line}
          midStage4Key={midStage4Key}
          midStage4Progress={midStage4Progress}
          midStage4Line={midStage4Line}
          midStage5Key={midStage5Key}
          midStage5Progress={midStage5Progress}
          midStage5Line={midStage5Line}
          midStage6Key={midStage6Key}
          midStage6Progress={midStage6Progress}
          midStage6Line={midStage6Line}
          midStage7Key={midStage7Key}
          midStage7Progress={midStage7Progress}
          midStage7Line={midStage7Line}
        />
        <SlideSidePanel
          activeSlide={activeSlide}
          currentSlide={currentSlide}
          totalSlides={slides.length}
        />
      </div>
      <SlideFooter
        activeSlide={activeSlide}
        currentSlide={currentSlide}
        totalSlides={slides.length}
        onPrev={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
        onNext={() =>
          setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))
        }
        onBack={onBack}
      />
    </div>
  );
};

export default TutorialPage;
