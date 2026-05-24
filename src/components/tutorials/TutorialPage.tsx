import {
  useRef,
  useCallback,
  useMemo,
  useEffect,
  useLayoutEffect,
} from "react";
import { flushSync } from "react-dom";
import type { RubiksCube3DHandle } from "@components/RubiksCube3D/types";
import useTwoFingerSpin from "@/hooks/useTwoFingerSpin";
import useTrackpadHandlers from "@/hooks/useTrackpadHandlers";
import useTutorialOrbitControls from "@components/tutorials/hooks/useTutorialOrbitControls";
import { getFixSequenceDisplay } from "@components/tutorials/utils/fixSequenceHelpers";
import {
  isRecapSlide as checkIsRecapSlide,
  isPracticeSlide as checkIsPracticeSlide,
} from "@components/tutorials/consts/tutorialSlideConfig";
import { hasActiveHighlightBorder } from "@components/tutorials/consts/tutorialSlideConstants";
import useSlideTransition from "@components/tutorials/hooks/useSlideTransition";
import useFixSequenceValidation from "@components/tutorials/hooks/useFixSequenceValidation";
import useYellowIndicators from "@components/tutorials/hooks/useYellowIndicators";
import useSequencePortalPosition from "@components/tutorials/hooks/useSequencePortalPosition";
import useSlideInteractionRules from "@components/tutorials/hooks/useSlideInteractionRules";
import useSlideSetup from "@components/tutorials/hooks/useSlideSetup";
import useTutorialPageState from "@components/tutorials/TutorialPageState";
import { getDullAndOpacityForSlide } from "@/hooks/useRubiksCube3DProps";
import {
  runColorFadeAnimation,
  SLIDE_FADE_DURATION_MS,
} from "@components/tutorials/utils/runColorFadeAnimation";
import {
  buildSlideTransitionFadeBuffers,
  buildStickerGreyMap,
} from "@components/tutorials/utils/slideTransitionFadeHelpers";
import { getTutorialCubeStateForSlide } from "@components/tutorials/utils/tutorialHelpers";
import {
  makeSideCentersGrey,
  restoreSideCenterColorsFromCube,
} from "@/utils/makeCentersGrey";
import useTutorialErrorFade from "@components/tutorials/useTutorialErrorFade";
import useTutorialReset from "@components/tutorials/useTutorialReset";
import useTutorialMoveHandlers from "@components/tutorials/useTutorialMoveHandlers";
import TutorialCubeView from "@components/tutorials/components/TutorialCubeView";
import SlideFooter from "@components/tutorials/components/SlideFooter";
import SlideSidePanel from "@components/tutorials/components/SlideSidePanel";
import ConfettiOverlay from "@components/tutorials/components/ConfettiOverlay";
import TutorialHeader from "@components/tutorials/components/TutorialHeader";

interface TutorialPageProps {
  lessonId: string;
  title: string;
  onBack: () => void;
}

const TutorialPage = ({ lessonId, title, onBack }: TutorialPageProps) => {
  const state = useTutorialPageState(lessonId);
  const {
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
    previousDullOthersIntensity,
    setPreviousDullOthersIntensity,
    previousCubeOpacity,
    setPreviousCubeOpacity,
    previousSlideId,
    setPreviousSlideId,
    pendingMove,
    setPendingMove,
    isAnimating,
    setIsAnimating,
    isAnimatingRef,
    lastMoveTimeRef,
    lastMoveSourceRef,
    setMoveHistory,
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
    intermediateWhiteCrossSlide8YawStateRef,
    intermediateWhiteCrossSlide11YawStateRef,
    intermediateWhiteCrossSlide13YawStateRef,
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
    tutorialCube3DRef,
    isTouchDevice,
    setSlide16CenterRevealComplete,
    slide16FadeFromFullColorRef,
  } = state;

  const slide16PrevFixRef = useRef(-1);

  const getDisplayCubeState = useCallback(
    () => tutorialCube3DRef.current ?? cube3D,
    [cube3D, tutorialCube3DRef],
  );

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
    orbitControlsRef: orbitControlsRef,
    isTransitioningRef,
    forceOrbitDisabledRef,
  });

  const { showErrorFade } = useTutorialErrorFade({
    lessonId,
    activeSlide,
    slides,
    currentSlide,
    cubeRef,
    orbitControlsRef: orbitControlsRef,
    cubeViewRef,
    isTransitioningRef,
    slide16FadeFromFullColorRef,
    slideSpecificState: {
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
      intermediateWhiteCrossSlide8YawStateRef,
      intermediateWhiteCrossSlide11YawStateRef,
      intermediateWhiteCrossSlide13YawStateRef,
      resetSlideSpecificState,
      showSecondSequenceYellowEdges2: false,
      secondSequenceYellowEdges2Locked: false,
    },
    setCube3D,
    setPreviousTutorialCube3D,
    setBaselineTutorialCube3D,
    setStickerGreyMap,
    setColorFadeProgress,
    setIsResettingOrbit,
    setInputDisabled,
    setOrbitControlsEnabled,
    disableOrbitTemporarily,
    clearControlsInternal,
    orbitPrevRef,
  });

  const { resetToSlideBaseline } = useTutorialReset({
    slides,
    currentSlide,
    disableOrbitTemporarily,
    cubeViewRef,
    isTransitioningRef,
    isResettingRef,
    setInputDisabled,
    setFixDoublePartialDir,
    setFixShowTick,
    setFixTickAnimKey,
    setFixTickProgress,
    setFixTickLine,
    setFixFirstTickPlayed,
    setFixFirstTickProgress,
    setFixFirstTickLine,
    setFixSecondTickPlayed,
    setFixSecondTickProgress,
    setFixSecondTickLine,
    resetFixState,
    resetMidStageTicks,
    resetSlideSpecificState,
    resetPracticeCompletion,
    setMoveHistory,
    setHistoryIndex,
    moveHistoryRef,
    historyIndexRef,
    setResetQueue,
    resetIndexRef,
    setPendingMove,
    setIsAnimating,
    isAnimatingRef,
    setPracticeSetupComplete,
    slide16FadeFromFullColorRef,
    showErrorFade,
  });

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
    orbitControlsRef: orbitControlsRef,
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
    intermediateWhiteCrossSlide8YawStateRef,
    intermediateWhiteCrossSlide11YawStateRef,
    intermediateWhiteCrossSlide13YawStateRef,
    animateMidlayerStage,
    triggerFixTick,
    resetToSlideBaseline,
    showErrorFade,
    slide16FadeFromFullColorRef,
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

  const { handleButtonMove, handleMoveAnimationDone } = useTutorialMoveHandlers(
    {
      fixSequence,
      fixIndex,
      fixDoublePartialDir,
      activeSlide,
      isAnimating,
      isAnimatingRef,
      lastMoveTimeRef,
      lastMoveSourceRef,
      moveHistoryRef,
      historyIndexRef,
      resetQueue,
      resetIndexRef,
      fixCompleted,
      practiceCompleted,
      cubeRef,
      setCube3D,
      setPendingMove,
      setIsAnimating,
      setMoveHistory,
      setHistoryIndex,
      setResetQueue,
      setIsResetting,
      setInputDisabled,
      forceOrbitDisabledRef,
      handleOrbitControlsChange,
      validateMove,
      isResettingRef,
      getDisplayCubeState,
    },
  );

  const fixSequenceDisplay: string[] = useMemo(
    () => getFixSequenceDisplay(activeSlide?.id, fixSequence),
    [activeSlide?.id, fixSequence],
  );

  const isInitializingRef = useRef(false);

  const wrappedSetCurrentSlide = useCallback(
    (nextOrUpdater: number | ((prev: number) => number)) => {
      const next =
        typeof nextOrUpdater === "function"
          ? nextOrUpdater(currentSlide)
          : nextOrUpdater;
      if (next === currentSlide) return;

      const prevCube = tutorialCube3D;
      const nextSlide = slides[next];
      const { baseline, greyMap } = buildSlideTransitionFadeBuffers(
        prevCube,
        nextSlide,
        lessonId,
      );
      const { dull, opacity } = getDullAndOpacityForSlide(
        activeSlide?.id,
        lessonId,
      );

      flushSync(() => {
        setPreviousTutorialCube3D(prevCube);
        setBaselineTutorialCube3D(baseline);
        setStickerGreyMap(greyMap);
        setPreviousDullOthersIntensity(dull);
        setPreviousCubeOpacity(opacity ?? 1);
        setPreviousSlideId(activeSlide?.id ?? null);
        setColorFadeProgress(0);
        setCurrentSlide(next);
      });

      runColorFadeAnimation(
        setColorFadeProgress,
        () => {
          setPreviousTutorialCube3D(null);
          setBaselineTutorialCube3D(null);
          setStickerGreyMap(new Map());
          setPreviousDullOthersIntensity(null);
          setPreviousCubeOpacity(null);
          setPreviousSlideId(null);
          setColorFadeProgress(0);
        },
        SLIDE_FADE_DURATION_MS,
      );
    },
    [
      currentSlide,
      tutorialCube3D,
      activeSlide?.id,
      lessonId,
      slides,
      setCurrentSlide,
      setPreviousTutorialCube3D,
      setBaselineTutorialCube3D,
      setStickerGreyMap,
      setPreviousDullOthersIntensity,
      setPreviousCubeOpacity,
      setPreviousSlideId,
      setColorFadeProgress,
    ],
  );

  useSlideTransition({
    currentSlide,
    slides,
    lessonId,
    orbitControlsRef: orbitControlsRef,
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
    isInitializingRef,
    handleOrbitControlsChange,
  });

  useLayoutEffect(() => {
    const slide = slides[currentSlide];
    if (slide?.id !== "bogr-insert-align-red-green") {
      slide16PrevFixRef.current = fixIndex;
      return;
    }
    if (
      fixIndex === 4 &&
      slide16PrevFixRef.current === 3 &&
      !isTransitioningRef.current
    ) {
      const filteredBase = getTutorialCubeStateForSlide(
        lessonId,
        slide,
        cube3D,
      );
      const filtered = restoreSideCenterColorsFromCube(filteredBase, cube3D);
      const prevGrey = makeSideCentersGrey(filtered);
      const greyMap = buildStickerGreyMap(prevGrey, filtered);
      setPreviousTutorialCube3D(prevGrey);
      setBaselineTutorialCube3D(filtered);
      setStickerGreyMap(greyMap);
      setColorFadeProgress(0);
      runColorFadeAnimation(
        setColorFadeProgress,
        () => {
          setPreviousTutorialCube3D(null);
          setBaselineTutorialCube3D(null);
          setStickerGreyMap(new Map());
          setColorFadeProgress(0);
          setSlide16CenterRevealComplete(true);
        },
        SLIDE_FADE_DURATION_MS,
      );
    }
    slide16PrevFixRef.current = fixIndex;
  }, [
    fixIndex,
    currentSlide,
    slides,
    cube3D,
    lessonId,
    isTransitioningRef,
    setPreviousTutorialCube3D,
    setBaselineTutorialCube3D,
    setStickerGreyMap,
    setColorFadeProgress,
    setSlide16CenterRevealComplete,
  ]);

  const { touchCount } = useTwoFingerSpin(
    cubeContainerRef as React.RefObject<HTMLDivElement>,
    cubeViewRef as React.RefObject<RubiksCube3DHandle>,
    precisionActive,
    (enabled) => handleOrbitControlsChange(enabled),
  );
  const {
    onPointerDown: handleTrackpadPointerDown,
    onPointerMove: handleTrackpadPointerMove,
    onPointerUp: handleTrackpadPointerUp,
  } = useTrackpadHandlers(
    cubeViewRef as React.RefObject<RubiksCube3DHandle>,
    precisionActive,
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

      if (activeSlide?.allowFaceMoves === false && enabled) {
        return;
      }

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
    [
      activeSlide?.id,
      activeSlide?.allowFaceMoves,
      practiceCompleted,
      handleOrbitControlsChange,
      forceOrbitDisabledRef,
      isTransitioningRef,
    ],
  );

  const handleStartAnimation = useCallback(() => {
    setIsAnimating(true);
    isAnimatingRef.current = true;
    forceOrbitDisabledRef.current = true;
    handleOrbitControlsChange(false);
  }, [
    handleOrbitControlsChange,
    setIsAnimating,
    isAnimatingRef,
    forceOrbitDisabledRef,
  ]);

  // Removed old showErrorFade - now provided by useTutorialErrorFade hook
  // Removed old resetToSlideBaseline - now provided by useTutorialReset hook
  // Removed old handleMoveAnimationDone - now provided by useTutorialMoveHandlers hook

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
          previousDullOthersIntensity={previousDullOthersIntensity}
          previousCubeOpacity={previousCubeOpacity}
          previousSlideId={previousSlideId}
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
          setCurrentSlide={wrappedSetCurrentSlide}
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
        onPrev={() => wrappedSetCurrentSlide(Math.max(0, currentSlide - 1))}
        onNext={() =>
          wrappedSetCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))
        }
        onBack={onBack}
      />
    </div>
  );
};

export default TutorialPage;
