import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { TrackballControls, PerformanceMonitor } from "@react-three/drei";
import RubiksCube3D from "@components/RubiksCube3D";
import type { RubiksCube3DHandle } from "@components/RubiksCube3D/types";
import type { CubeMove, CubeState } from "@/types/cube";
import CUBE_COLORS from "@/consts/cubeColours";
import PracticeStatusIndicator from "@components/tutorials/components/PracticeStatusIndicator";
import SlideControls from "@components/tutorials/components/SlideControls";
import SpinTrackpad from "@components/UI/SpinTrackpad";
import FixBoxContent from "@components/tutorials/components/FixBoxContent";
import PracticeMovesPanel from "@components/tutorials/components/PracticeMovesPanel";
import {
  isPracticeSlide as checkIsPracticeSlide,
  isRecapSlide as checkIsRecapSlide,
} from "@components/tutorials/consts/tutorialSlideConfig";
import { getSlideCameraConfig } from "@components/tutorials/utils/tutorialHelpers";
import BeginnersMethodGrid from "@components/tutorials/components/BeginnersMethodGrid";
import YellowCrossCasesGrid from "@components/tutorials/components/YellowCrossCasesGrid";
import { useRubiksCube3DProps } from "@/hooks/useRubiksCube3DProps";
import { useTutorialPointerHandler } from "@components/tutorials/hooks/useTutorialPointerHandler";
import { useGhostPieceIndicator } from "@components/tutorials/hooks/useGhostPieceIndicator";
import GhostPieceIndicator from "@components/tutorials/components/GhostPieceIndicator";
import type { OrbitControlsInstance } from "@/types/orbitControls";

interface TutorialCubeViewProps {
  cubeContainerRef: React.RefObject<HTMLDivElement | null>;
  overlayContainerRef: React.RefObject<HTMLDivElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  cubeViewRef: React.RefObject<RubiksCube3DHandle | null>;
  orbitControlsRef: React.RefObject<OrbitControlsInstance | null>;
  orbitControlsEnabled: boolean;
  canvasDpr: [number, number];
  attachSetDpr: (setDpr: (dpr: number) => void) => void;
  setInteractiveDpr: () => void;
  onDecline: () => void;
  onIncline: () => void;
  isTouchDevice: boolean;
  hasInteractedGloballyRef: React.RefObject<boolean>;
  tutorialCube3D: CubeState[][][];
  previousCube3D?: CubeState[][][] | null;
  baselineCube3D?: CubeState[][][] | null;
  stickerGreyMap?: Map<string, boolean>;
  colorFadeProgress?: number;
  touchCount: number;
  pendingMove: CubeMove | null;
  isAnimating: boolean;
  handleMoveAnimationDone: (move: CubeMove) => void;
  handleStartAnimation: () => void;
  handlePracticeOrbitChange: (enabled: boolean) => void;
  handleButtonMove: (move: string) => void;
  lastMoveSourceRef: React.RefObject<
    "queue" | "manual" | "undo" | "redo" | null
  >;
  queueFast: boolean;
  queueFastMs: number | null;
  activeSlideId: string | undefined;
  activeSlideAllowFaceMoves?: boolean;
  activeSlideAllowSliceMoves?: boolean;
  lessonId: string;
  practiceCompleted: boolean;
  fixCompleted: boolean;
  inputDisabled: boolean;
  combinedPieceChildren?:
    | ((x: number, y: number, z: number, piece: CubeState) => React.ReactNode)
    | undefined;
  practiceShowTick: boolean;
  practiceTickAnimKey: number;
  practiceTickProgress: boolean;
  practiceTickLine: boolean;
  currentSlide: number;
  slidesLength: number;
  setCurrentSlide: (slide: number | ((prev: number) => number)) => void;
  isResetting: boolean;
  isResettingOrbit: boolean;
  isTransitioning: boolean;
  resetToSlideBaseline: () => Promise<void>;
  cubeRef: React.RefObject<any>;
  handleTrackpadPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  handleTrackpadPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  handleTrackpadPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
  fixIndex: number;
  fixDoublePartialDir: 0 | 1 | -1;
  fixSequence: string[];
  fixSequenceDisplay: string[];
  fixErrorPulse: boolean;
  hasActiveHighlightBorder: (slideId: string) => boolean;
  fixSequenceLength: number;
  sequencePortalPosition: { top: number; left: number } | null;
  midStage1Key: number;
  midStage1Progress: boolean;
  midStage1Line: boolean;
  midStage2Key: number;
  midStage2Progress: boolean;
  midStage2Line: boolean;
  midStage3Key: number;
  midStage3Progress: boolean;
  midStage3Line: boolean;
  midStage4Key: number;
  midStage4Progress: boolean;
  midStage4Line: boolean;
  midStage5Key: number;
  midStage5Progress: boolean;
  midStage5Line: boolean;
  midStage6Key: number;
  midStage6Progress: boolean;
  midStage6Line: boolean;
  midStage7Key: number;
  midStage7Progress: boolean;
  midStage7Line: boolean;
}

const TutorialCubeView = ({
  cubeContainerRef,
  overlayContainerRef,
  canvasRef,
  cubeViewRef,
  orbitControlsRef,
  orbitControlsEnabled,
  canvasDpr,
  attachSetDpr,
  setInteractiveDpr,
  onDecline,
  onIncline,
  isTouchDevice,
  hasInteractedGloballyRef,
  tutorialCube3D,
  previousCube3D,
  baselineCube3D,
  stickerGreyMap,
  colorFadeProgress = 0,
  touchCount,
  pendingMove,
  isAnimating,
  handleMoveAnimationDone,
  handleStartAnimation,
  handlePracticeOrbitChange,
  handleButtonMove,
  lastMoveSourceRef,
  queueFast,
  queueFastMs,
  activeSlideId,
  activeSlideAllowFaceMoves,
  activeSlideAllowSliceMoves,
  lessonId,
  practiceCompleted,
  fixCompleted,
  inputDisabled,
  combinedPieceChildren,
  practiceShowTick,
  practiceTickAnimKey,
  practiceTickProgress,
  practiceTickLine,
  currentSlide,
  isResetting,
  isResettingOrbit,
  isTransitioning,
  resetToSlideBaseline,
  cubeRef,
  handleTrackpadPointerDown,
  handleTrackpadPointerMove,
  handleTrackpadPointerUp,
  fixIndex,
  fixDoublePartialDir,
  fixSequence,
  fixSequenceDisplay,
  fixErrorPulse,
  hasActiveHighlightBorder,
  fixSequenceLength,
  sequencePortalPosition,
  midStage1Key,
  midStage1Progress,
  midStage1Line,
  midStage2Key,
  midStage2Progress,
  midStage2Line,
  midStage3Key,
  midStage3Progress,
  midStage3Line,
  midStage4Key,
  midStage4Progress,
  midStage4Line,
  midStage5Key,
  midStage5Progress,
  midStage5Line,
  midStage6Key,
  midStage6Progress,
  midStage6Line,
  midStage7Key,
  midStage7Progress,
  midStage7Line,
}: TutorialCubeViewProps) => {
  const isRecapSlide = checkIsRecapSlide(activeSlideId);
  const isPracticeSlide = checkIsPracticeSlide(activeSlideId);
  const showYellowCrossStates = activeSlideId === "yellow-cross-states";
  const showBeginnersMethodGrid = activeSlideId === "beginners-method-overview";
  const hideLogo = true; // Hide logo in tutorial lessons - show plain white centers

  const {
    handlePointerDown: baseHandlePointerDown,
    handlePointerMove,
    handlePointerUp: baseHandlePointerUp,
  } = useTutorialPointerHandler({
    isTouchDevice,
    setInteractiveDpr,
    hasInteractedGloballyRef,
    activeSlideId,
    activeSlideAllowFaceMoves,
    practiceCompleted,
    fixCompleted,
    cubeViewRef,
  });

  const [isInteractingWithCube, setIsInteractingWithCube] = useState(false);

  const {
    opacity: ghostOpacity,
    rotationProgress: ghostRotationProgress,
    isAnimatingMove: ghostIsAnimatingMove,
    handleCubeInteraction,
    showHint,
    isVisible: ghostIsVisible,
    isAnimating: ghostIsAnimating,
  } = useGhostPieceIndicator({
    activeSlideId,
    fixCompleted,
    isInteracting: isInteractingWithCube,
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    baseHandlePointerDown(e);
  };

  const handlePointerUp = () => {
    baseHandlePointerUp();
  };

  const handlePracticeOrbitChangeWithGhost = (enabled: boolean) => {
    // When orbit is disabled, it means user is interacting with cube
    // When orbit is enabled, user is not interacting (just orbiting)
    setIsInteractingWithCube(!enabled);
    if (!enabled) {
      handleCubeInteraction();
    }
    handlePracticeOrbitChange(enabled);
  };

  const {
    inputDisabled: inputDisabledValue,
    disableSliceDrag,
    preventSliceMoves,
    highlightIntensity,
    highlightPositions,
    dullOthersIntensity,
  } = useRubiksCube3DProps({
    activeSlideId,
    activeSlideAllowFaceMoves,
    activeSlideAllowSliceMoves,
    lessonId,
    tutorialCube3D,
    isRecapSlide,
    isPracticeSlide,
    practiceCompleted,
    fixCompleted,
    inputDisabled: inputDisabled || ghostIsVisible,
  });

  // Show overlay when cube is animating, resetting (including orbit), transitioning between slides, error pulsing, or ghost piece is animating
  const showOverlay =
    isAnimating ||
    isResetting ||
    isResettingOrbit ||
    isTransitioning ||
    fixErrorPulse ||
    ghostIsAnimating;

  return (
    <div className="flex-1 relative min-h-0">
      {/* Overlay to block interactions during transitions */}
      {showOverlay && (
        <div className="absolute inset-0 bg-black/0 z-40 pointer-events-auto" />
      )}
      <div className="relative w-full h-full">
        <div
          ref={cubeContainerRef}
          className="relative w-full h-full bg-black/20 backdrop-blur-sm border border-white/20"
        >
          <div
            className="absolute -top-1 w-full h-full"
            ref={overlayContainerRef}
          >
            <Canvas
              ref={canvasRef}
              camera={{
                position: [4, 4, 4],
                fov: 60,
              }}
              className="w-full h-full transition-opacity duration-500 ease-in-out"
              style={{
                background: "transparent",
                touchAction: "none",
                opacity: isRecapSlide ? 0 : 1,
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
                state.gl.localClippingEnabled = true;
                const canvas = state.gl.domElement as HTMLCanvasElement;
                const onLost = (ev: Event) => ev.preventDefault();
                const onRestored = () => {
                  try {
                    state.gl.resetState();
                  } catch {}
                };
                canvas.addEventListener(
                  "webglcontextlost",
                  onLost,
                  false
                );
                canvas.addEventListener(
                  "webglcontextrestored",
                  onRestored,
                  false
                );
              }}
              onPointerDownCapture={handlePointerDown}
              onPointerMoveCapture={handlePointerMove}
              onPointerUpCapture={handlePointerUp}
            >
              <PerformanceMonitor onDecline={onDecline} onIncline={onIncline} />
              <spotLight position={[-30, 20, 60]} intensity={0.3} />
              <ambientLight
                intensity={isRecapSlide ? 0.95 : 1.2}
                color={CUBE_COLORS.WHITE}
              />
              <TrackballControls
                ref={orbitControlsRef as unknown as React.RefObject<any>}
                enabled={orbitControlsEnabled}
                noRotate={isRecapSlide ? true : !orbitControlsEnabled}
                noZoom={true}
                noPan={true}
                staticMoving={false}
                dynamicDampingFactor={0.35}
                rotateSpeed={1.2}
                zoomSpeed={1.2}
                panSpeed={4.0}
                minDistance={3}
                maxDistance={15}
              />
              <RubiksCube3D
                ref={cubeViewRef}
                cubeState={tutorialCube3D}
                previousCube3D={previousCube3D}
                baselineCube3D={baselineCube3D}
                stickerGreyMap={stickerGreyMap}
                colorFadeProgress={colorFadeProgress}
                touchCount={touchCount}
                pendingMove={pendingMove}
                onMoveAnimationDone={handleMoveAnimationDone}
                onStartAnimation={handleStartAnimation}
                isAnimating={isAnimating}
                onOrbitControlsChange={handlePracticeOrbitChangeWithGhost}
                onDragMove={handleButtonMove}
                isTimerMode={false}
                moveSource={lastMoveSourceRef.current}
                queueFast={queueFast}
                queueFastMs={queueFastMs}
                onDragMoveStart={() => {
                  lastMoveSourceRef.current = "manual";
                }}
                inputDisabled={inputDisabledValue}
                disableSliceDrag={disableSliceDrag}
                preventSliceMoves={preventSliceMoves}
                highlightIntensity={highlightIntensity}
                highlightPositions={highlightPositions}
                dullOthersIntensity={dullOthersIntensity}
                pieceChildren={combinedPieceChildren}
                hideLogo={hideLogo}
                errorFlash={fixErrorPulse}
                hideRightFace={
                  (activeSlideId === "notation-clockwise-r" ||
                    activeSlideId === "notation-prime-r" ||
                    ((activeSlideId === "notation-sequences" ||
                      activeSlideId === "notation-sequences-longer") &&
                      fixSequence[fixIndex] !== undefined &&
                      (fixSequence[fixIndex] === "R" ||
                        fixSequence[fixIndex] === "R'" ||
                        fixSequence[fixIndex] === "R2"))) &&
                  ghostOpacity > 0.9 &&
                  ghostIsAnimatingMove
                }
                hideFrontFace={
                  (activeSlideId === "notation-clockwise-f" ||
                    activeSlideId === "notation-prime-f" ||
                    activeSlideId === "notation-double" ||
                    ((activeSlideId === "notation-sequences" ||
                      activeSlideId === "notation-sequences-longer") &&
                      fixSequence[fixIndex] !== undefined &&
                      (fixSequence[fixIndex] === "F" ||
                        fixSequence[fixIndex] === "F'" ||
                        fixSequence[fixIndex] === "F2"))) &&
                  ghostOpacity > 0.9 &&
                  ghostIsAnimatingMove
                }
                hideLeftFace={
                  (activeSlideId === "notation-clockwise-l" ||
                    activeSlideId === "notation-prime-l" ||
                    activeSlideId === "notation-double-l" ||
                    ((activeSlideId === "notation-sequences" ||
                      activeSlideId === "notation-sequences-longer") &&
                      fixSequence[fixIndex] !== undefined &&
                      (fixSequence[fixIndex] === "L" ||
                        fixSequence[fixIndex] === "L'" ||
                        fixSequence[fixIndex] === "L2"))) &&
                  ghostOpacity > 0.9 &&
                  ghostIsAnimatingMove
                }
                hideBackFace={
                  (activeSlideId === "notation-clockwise-b" ||
                    activeSlideId === "notation-prime-b" ||
                    ((activeSlideId === "notation-sequences" ||
                      activeSlideId === "notation-sequences-longer") &&
                      fixSequence[fixIndex] !== undefined &&
                      (fixSequence[fixIndex] === "B" ||
                        fixSequence[fixIndex] === "B'" ||
                        fixSequence[fixIndex] === "B2"))) &&
                  ghostOpacity > 0.9 &&
                  ghostIsAnimatingMove
                }
                hideTopFace={
                  (activeSlideId === "notation-clockwise-u" ||
                    activeSlideId === "notation-prime-u" ||
                    ((activeSlideId === "notation-sequences" ||
                      activeSlideId === "notation-sequences-longer") &&
                      fixSequence[fixIndex] !== undefined &&
                      (fixSequence[fixIndex] === "U" ||
                        fixSequence[fixIndex] === "U'" ||
                        fixSequence[fixIndex] === "U2"))) &&
                  ghostOpacity > 0.9 &&
                  ghostIsAnimatingMove
                }
                hideBottomFace={
                  (activeSlideId === "notation-clockwise-d" ||
                    activeSlideId === "notation-prime-d" ||
                    activeSlideId === "notation-double-d" ||
                    ((activeSlideId === "notation-sequences" ||
                      activeSlideId === "notation-sequences-longer") &&
                      fixSequence[fixIndex] !== undefined &&
                      (fixSequence[fixIndex] === "D" ||
                        fixSequence[fixIndex] === "D'" ||
                        fixSequence[fixIndex] === "D2"))) &&
                  ghostOpacity > 0.9 &&
                  ghostIsAnimatingMove
                }
              />
              {(activeSlideId === "notation-clockwise-f" ||
                activeSlideId === "notation-prime-f" ||
                activeSlideId === "notation-clockwise-r" ||
                activeSlideId === "notation-prime-r" ||
                activeSlideId === "notation-clockwise-l" ||
                activeSlideId === "notation-prime-l" ||
                activeSlideId === "notation-clockwise-u" ||
                activeSlideId === "notation-prime-u" ||
                activeSlideId === "notation-clockwise-d" ||
                activeSlideId === "notation-prime-d" ||
                activeSlideId === "notation-clockwise-b" ||
                activeSlideId === "notation-prime-b" ||
                activeSlideId === "notation-double" ||
                activeSlideId === "notation-double-l" ||
                activeSlideId === "notation-double-d" ||
                activeSlideId === "notation-sequences" ||
                activeSlideId === "notation-sequences-longer") && (
                <GhostPieceIndicator
                  cubeState={tutorialCube3D}
                  opacity={ghostOpacity}
                  rotationProgress={ghostRotationProgress}
                  isAnimatingMove={ghostIsAnimatingMove}
                  cubeViewRef={cubeViewRef}
                  move={
                    activeSlideId === "notation-clockwise-f"
                      ? "F"
                      : activeSlideId === "notation-prime-f"
                      ? "F'"
                      : activeSlideId === "notation-clockwise-r"
                      ? "R"
                      : activeSlideId === "notation-prime-r"
                      ? "R'"
                      : activeSlideId === "notation-clockwise-l"
                      ? "L"
                      : activeSlideId === "notation-prime-l"
                      ? "L'"
                      : activeSlideId === "notation-clockwise-u"
                      ? "U"
                      : activeSlideId === "notation-prime-u"
                      ? "U'"
                      : activeSlideId === "notation-clockwise-d"
                      ? "D"
                      : activeSlideId === "notation-prime-d"
                      ? "D'"
                      : activeSlideId === "notation-clockwise-b"
                      ? "B"
                      : activeSlideId === "notation-prime-b"
                      ? "B'"
                      : activeSlideId === "notation-double"
                      ? fixDoublePartialDir === 1
                        ? "F"
                        : fixDoublePartialDir === -1
                        ? "F'"
                        : "F2"
                      : activeSlideId === "notation-double-l"
                      ? fixDoublePartialDir === 1
                        ? "L"
                        : fixDoublePartialDir === -1
                        ? "L'"
                        : "L2"
                      : activeSlideId === "notation-double-d"
                      ? fixDoublePartialDir === 1
                        ? "D"
                        : fixDoublePartialDir === -1
                        ? "D'"
                        : "D2"
                      : activeSlideId === "notation-sequences" ||
                        activeSlideId === "notation-sequences-longer"
                      ? (() => {
                          // Get the next move from the sequence based on fixIndex
                          const nextMove = fixSequence[fixIndex];
                          if (!nextMove) return "F";

                          // If it's a double move (U2, D2, etc.) and we're partway through
                          if (
                            nextMove.includes("2") &&
                            fixDoublePartialDir !== 0
                          ) {
                            const baseMove = nextMove.replace("2", "");
                            if (fixDoublePartialDir === 1) {
                              if (baseMove === "F") return "F";
                              if (baseMove === "R") return "R";
                              if (baseMove === "L") return "L";
                              if (baseMove === "U") return "U";
                              if (baseMove === "D") return "D";
                              if (baseMove === "B") return "B";
                            } else {
                              if (baseMove === "F") return "F'";
                              if (baseMove === "R") return "R'";
                              if (baseMove === "L") return "L'";
                              if (baseMove === "U") return "U'";
                              if (baseMove === "D") return "D'";
                              if (baseMove === "B") return "B'";
                            }
                          }

                          // Map the move to a valid type
                          if (nextMove === "F") return "F";
                          if (nextMove === "F'") return "F'";
                          if (nextMove === "R") return "R";
                          if (nextMove === "R'") return "R'";
                          if (nextMove === "L") return "L";
                          if (nextMove === "L'") return "L'";
                          if (nextMove === "U") return "U";
                          if (nextMove === "U'") return "U'";
                          if (nextMove === "D") return "D";
                          if (nextMove === "D'") return "D'";
                          if (nextMove === "B") return "B";
                          if (nextMove === "B'") return "B'";
                          if (nextMove === "F2") return "F2";
                          if (nextMove === "R2") return "R2";
                          if (nextMove === "L2") return "L2";
                          if (nextMove === "U2") return "U2";
                          if (nextMove === "D2") return "D2";
                          if (nextMove === "B2") return "B2";

                          return "F";
                        })()
                      : "F"
                  }
                />
              )}
            </Canvas>
          </div>
        </div>

        {isPracticeSlide && (
          <PracticeStatusIndicator
            isSolved={practiceCompleted}
            showTick={practiceShowTick}
            tickAnimKey={practiceTickAnimKey}
            tickProgress={practiceTickProgress}
            tickLine={practiceTickLine}
          />
        )}

        {showBeginnersMethodGrid ||
          (showYellowCrossStates && (
            <BeginnersMethodGrid
              steps={[
                { title: "White Cross" },
                { title: "White Corners" },
                { title: "Second Layer" },
                { title: "Yellow Cross" },
                { title: "Yellow Edges" },
                { title: "Yellow Corners", description: "Position" },
                { title: "Yellow Corners", description: "Orientation" },
              ]}
            />
          ))}

        {showYellowCrossStates && (
          <YellowCrossCasesGrid
            cases={[
              {
                title: "Cross Case",
                image: "/assets/yellow-cross-case-image.png",
              },
              {
                title: "Line Case",
                image: "/assets/yellow-line-case-image.png",
              },
              {
                title: "Triangle Case",
                image: "/assets/yellow-triangle-case-image.png",
              },
              {
                title: "Dot Case",
                image: "/assets/yellow-dot-case-image.png",
              },
            ]}
          />
        )}

        {!isRecapSlide && (
          <div className="pointer-events-none absolute inset-0">
            <SlideControls
              lessonId={lessonId}
              activeSlideId={activeSlideId}
              currentSlide={currentSlide}
              isAnimating={isAnimating}
              isResetting={isResetting}
              isResettingOrbit={isResettingOrbit}
              onReset={resetToSlideBaseline}
              onReposition={() => {
                const c = orbitControlsRef.current;
                if (!c) return;
                c.__resetOpts = getSlideCameraConfig(activeSlideId, lessonId);
                cubeViewRef.current?.resetToInitialPosition(
                  orbitControlsRef as unknown as React.RefObject<OrbitControlsInstance>,
                  cubeRef,
                  undefined,
                  false
                );
              }}
              onShowHint={showHint}
              showHintButton={
                activeSlideId === "notation-clockwise-f" ||
                activeSlideId === "notation-prime-f" ||
                activeSlideId === "notation-clockwise-r" ||
                activeSlideId === "notation-prime-r" ||
                activeSlideId === "notation-clockwise-l" ||
                activeSlideId === "notation-prime-l" ||
                activeSlideId === "notation-clockwise-u" ||
                activeSlideId === "notation-prime-u" ||
                activeSlideId === "notation-clockwise-d" ||
                activeSlideId === "notation-prime-d" ||
                activeSlideId === "notation-clockwise-b" ||
                activeSlideId === "notation-prime-b" ||
                activeSlideId === "notation-double" ||
                activeSlideId === "notation-double-l" ||
                activeSlideId === "notation-double-d" ||
                activeSlideId === "notation-sequences" ||
                activeSlideId === "notation-sequences-longer"
              }
              fixCompleted={fixCompleted}
            />
            {!isTouchDevice && activeSlideId !== "find-green-white" && (
              <div className="absolute left-2 md:right-3 bottom-28 md:bottom-3 z-20 pointer-events-auto">
                <SpinTrackpad
                  onPointerDown={handleTrackpadPointerDown}
                  onPointerMove={handleTrackpadPointerMove}
                  onPointerUp={handleTrackpadPointerUp}
                  onPointerCancel={handleTrackpadPointerUp}
                  isTouchDevice={isTouchDevice}
                />
              </div>
            )}
          </div>
        )}

        <FixBoxContent
          activeSlideId={activeSlideId}
          lessonId={lessonId}
          fixIndex={fixIndex}
          fixDoublePartialDir={fixDoublePartialDir}
          fixSequence={fixSequence}
          fixSequenceDisplay={fixSequenceDisplay}
          fixErrorPulse={fixErrorPulse}
          hasActiveHighlightBorder={
            activeSlideId ? hasActiveHighlightBorder(activeSlideId) : false
          }
          fixSequenceLength={fixSequenceLength}
          deferMeasurements={!hasInteractedGloballyRef.current}
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

        <PracticeMovesPanel
          activeSlideId={activeSlideId}
          activeSlideAllowFaceMoves={activeSlideAllowFaceMoves}
          currentSlide={currentSlide}
          isAnimating={isAnimating}
          inputDisabled={inputDisabled}
          onMove={handleButtonMove}
        />
      </div>
    </div>
  );
};

export default TutorialCubeView;
