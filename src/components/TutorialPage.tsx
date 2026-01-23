import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { Vector3 } from "three";
import type { RubiksCube3DHandle } from "@components/RubiksCube3D/types";
import type { CubeMove } from "@/types/cube";
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
  getSlideCameraConfig,
} from "@/utils/tutorialHelpers";
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
import TutorialCubeView from "@components/tutorials/TutorialCubeView";
import SlideFooter from "@components/tutorials/SlideFooter";
import SlideSidePanel from "@components/tutorials/SlideSidePanel";
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

  const practiceCompletion = usePracticeSlideCompletion({
    activeSlideId: activeSlide?.id,
    cube3D,
    moveHistory,
    isWhiteCrossSolved,
    isWhiteCornersSolved,
    isSecondLayerSolved,
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

  const resetToSlideBaseline = useCallback(async () => {
    isTransitioningRef.current = true;
    setInputDisabled(true);
    disableOrbitTemporarily();
    setFixIndex(0);
    setFixDoublePartialDir(0);

    setIsResetting(true);
    isResettingRef.current = true;
    setPendingMove(null);
    setIsAnimating(false);
    isAnimatingRef.current = false;
    resetFixState();
    resetMidStageTicks();
    resetSlideSpecificState();
    resetPracticeCompletion();
    await new Promise((r) => requestAnimationFrame(r));
    const slide = slides[currentSlide];

    setMoveHistory([]);
    setHistoryIndex(-1);
    moveHistoryRef.current = [];
    historyIndexRef.current = -1;
    setResetQueue(null);
    resetIndexRef.current = 0;

    cubeRef.current.reset();

    if (slide?.setup) {
      cubeRef.current.reset();
      slide.setup(cubeRef.current);
    }

    // Reset logo to default position
    cubeViewRef.current?.resetLogo();

    const updatedCube3D = cubejsTo3D(cubeRef.current.getCube());
    setCube3D(updatedCube3D);

    setIsResetting(false);
    isResettingRef.current = false;

    const myTransitionId = ++transitionIdRef.current;
    disableOrbitTemporarily();
    if (orbitControlsRef.current) {
      const c: any = orbitControlsRef.current;
      if (!c.target) c.target = new Vector3(0, 0, 0);
      else c.target.set(0, 0, 0);
      if (c.update) c.update();
      clearControlsInternal();
      c.__resetOpts = getSlideCameraConfig(slide?.id, lessonId);
    }
    setIsResettingOrbit(true);
    cubeViewRef.current?.resetToInitialPosition(
      orbitControlsRef,
      cubeRef,
      () => {
        if (transitionIdRef.current !== myTransitionId) return;

        setIsResettingOrbit(false);
        const s = slides[currentSlide];
        if (checkIsPracticeSlide(s?.id)) {
          setTimeout(() => {
            setPracticeSetupComplete(true);
          }, 100);
        }

        if (requiresSetupDelay(s?.id)) {
          setPracticeSetupComplete(true);
        }

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
  }, [slides, currentSlide, disableOrbitTemporarily, clearControlsInternal]);

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

      if (!isWholeCubeRotation) {
        cubeRef.current.move(move);
        setCube3D(cubejsTo3D(cubeRef.current.getCube()));

        const isManualMove =
          (window as Window & { __isManualDragMove?: boolean })
            .__isManualDragMove || lastMoveSourceRef.current === "manual";
        const isUndoRedo =
          lastMoveSourceRef.current === "undo" ||
          lastMoveSourceRef.current === "redo";
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

      const wasManual =
        (window as Window & { __isManualDragMove?: boolean })
          .__isManualDragMove || lastMoveSourceRef.current === "manual";

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

      if (fixSequence.length > 0 && wasManual) {
        validateMove(move, wasManual);
      }
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
      className="min-h-[100dvh] flex flex-col"
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
      <TutorialHeader title={title} onBack={onBack} />

      <div
        className={`flex flex-1 min-h-0 ${
          checkIsRecapSlide(activeSlide?.id)
            ? "h-[100dvh] overflow-hidden"
            : "overflow-hidden"
        }`}
      >
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
