import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Canvas } from "@react-three/fiber";
import { Vector3 } from "three";
import { TrackballControls, PerformanceMonitor, Html } from "@react-three/drei";
import RubiksCube3D from "@components/RubiksCube3D";
import type { RubiksCube3DHandle } from "@components/RubiksCube3D/types";
import type { CubeMove, CubeState } from "@/types/cube";
import { CubeJSWrapper } from "@utils/cubejsWrapper";
import { AnimationHelper } from "@utils/animationHelper";
import Button from "@components/UI/Button";
import cubejsTo3D from "@utils/cubejsTo3D";
import LessonContent from "@components/LessonContent";
import useIsTouchDevice from "@/hooks/useIsTouchDevice";
import useTwoFingerSpin from "@/hooks/useTwoFingerSpin";
import useTrackpadHandlers from "@/hooks/useTrackpadHandlers";
import SpinTrackpad from "@components/UI/SpinTrackpad";
import useDprManager from "@/hooks/useDprManager";
import { useTutorialOrbitControls } from "@/hooks/useTutorialOrbitControls";
import CUBE_COLORS from "@/consts/cubeColours";
import TypewriterText from "@components/tutorials/TypewriterText";
import PracticeStatusIndicator from "@components/tutorials/PracticeStatusIndicator";
import CompletionTick from "@components/tutorials/CompletionTick";
import AlgorithmSequence from "@components/tutorials/AlgorithmSequence";
import MultiPartSequence from "@components/tutorials/MultiPartSequence";
import getSlidesForLesson, {
  type Slide,
} from "@components/tutorials/slideDefinitions";
import {
  createTutorialCubeState,
  isWhiteCrossSolved as checkWhiteCrossSolved,
  isWhiteCornersSolved as checkWhiteCornersSolved,
  isSecondLayerSolved as checkSecondLayerSolved,
  getSlideCameraConfig,
  findWhiteGreenRedCorner,
  findRedGreenSecondLayerEdge,
  findGreenWhiteEdge,
  getCubieColorSet,
} from "@/utils/tutorialHelpers";
import {
  isYellowCrossSolved,
  getYellowEdgeMatchStatus,
} from "@/utils/yellowEdgesHelpers";
import { CUBIE_SIZE, STICKER_LIFT } from "@components/RubiksCube3D/geometry";

interface TutorialPageProps {
  lessonId: string;
  title: string;
  onBack: () => void;
}

const TutorialPage = ({ lessonId, title, onBack }: TutorialPageProps) => {
  // Core cube state/refs
  const cubeRef = useRef(new CubeJSWrapper());
  const [cube3D, setCube3D] = useState(() =>
    cubejsTo3D(cubeRef.current.getCube())
  );

  // Animation/move state
  const [pendingMove, setPendingMove] = useState<CubeMove | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const isAnimatingRef = useRef(false);
  const lastMoveTimeRef = useRef(0);
  const lastMoveSourceRef = useRef<"queue" | "manual" | "undo" | "redo" | null>(
    null
  );

  // Undo/Redo
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

  // Reset-to-solved queue
  // Reset modal removed; no state needed
  const [isResetting, setIsResetting] = useState(false);
  const [resetQueue, setResetQueue] = useState<string[] | null>(null);
  const resetIndexRef = useRef(0);
  // Mirror isResetting in a ref so callbacks can read the latest value
  const isResettingRef = useRef(false);
  useEffect(() => {
    isResettingRef.current = isResetting;
  }, [isResetting]);

  // UI/controls
  const [inputDisabled, setInputDisabled] = useState(false);
  const [showLessonContent, setShowLessonContent] = useState(false);
  const queueFast = false;
  const queueFastMs: number | null = null;
  // Guard to ignore orbit toggles during controlled transitions
  const isTransitioningRef = useRef(false);

  // Refs for 3D/controls
  const cubeViewRef = useRef<RubiksCube3DHandle | null>(null);
  const orbitControlsRef = useRef<any>(null);
  const cubeContainerRef = useRef<HTMLDivElement | null>(null);
  const overlayContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<any>(null);
  // Transition token to prevent stale callbacks from overriding latest state
  const transitionIdRef = useRef(0);

  // Device flags and DPR manager (independent of orbit callback)
  const isTouchDevice = useIsTouchDevice();
  const { canvasDpr, attachSetDpr, setInteractiveDpr, onDecline, onIncline } =
    useDprManager(isTouchDevice);
  const [precisionActive] = useState(false);
  // Force-disable orbit while animating moves (so view-only slides don't keep it enabled)
  const forceOrbitDisabledRef = useRef(false);

  // Fix box: per-slide step-by-step sequence tracking (declare types/states here, configure after activeSlide below)
  const [fixIndex, setFixIndex] = useState(0);
  const [fixDoublePartialDir, setFixDoublePartialDir] = useState<0 | 1 | -1>(0);
  const [fixErrorPulse, setFixErrorPulse] = useState(false);
  const [fixShowTick, setFixShowTick] = useState(false);
  const [fixTickAnimKey, setFixTickAnimKey] = useState(0);
  const [fixTickProgress, setFixTickProgress] = useState(false);
  const [fixTickLine, setFixTickLine] = useState(false);
  // One-time inline tick for step 5 (animate only once when first earned)
  const [fixFirstTickPlayed, setFixFirstTickPlayed] = useState(false);
  const [fixFirstTickProgress, setFixFirstTickProgress] = useState(false);
  const [fixFirstTickLine, setFixFirstTickLine] = useState(false);
  // One-time inline tick for a second mid-stage (used on slide 7)
  const [fixSecondTickPlayed, setFixSecondTickPlayed] = useState(false);
  const [fixSecondTickProgress, setFixSecondTickProgress] = useState(false);
  const [fixSecondTickLine, setFixSecondTickLine] = useState(false);
  // (Removed generic third tick in favor of midlayer-specific states)
  // Midlayer-specific stage tick states (avoid reusing earlier slide flags so animations replay)
  const [midStage1Played, setMidStage1Played] = useState(false);
  const [midStage1Progress, setMidStage1Progress] = useState(false);
  const [midStage1Line, setMidStage1Line] = useState(false);
  const [midStage2Played, setMidStage2Played] = useState(false);
  const [midStage2Progress, setMidStage2Progress] = useState(false);
  const [midStage2Line, setMidStage2Line] = useState(false);
  const [midStage3Played, setMidStage3Played] = useState(false);
  const [midStage3Progress, setMidStage3Progress] = useState(false);
  const [midStage3Line, setMidStage3Line] = useState(false);
  const [midStage4Played, setMidStage4Played] = useState(false);
  const [midStage4Progress, setMidStage4Progress] = useState(false);
  const [midStage4Line, setMidStage4Line] = useState(false);
  const [midStage5Played, setMidStage5Played] = useState(false);
  const [midStage5Progress, setMidStage5Progress] = useState(false);
  const [midStage5Line, setMidStage5Line] = useState(false);
  // Remount keys to force fresh SVG mount per stage (ensures dash animation reliably fires like slide 7)
  const [midStage1Key, setMidStage1Key] = useState(0);
  const [midStage2Key, setMidStage2Key] = useState(0);
  const [midStage3Key, setMidStage3Key] = useState(0);
  const [midStage4Key, setMidStage4Key] = useState(0);
  const [midStage5Key, setMidStage5Key] = useState(0);
  // Track which sequence is showing for second-layer-setup-solution-4
  const [showSecondSequence, setShowSecondSequence] = useState(false);
  const [secondSequenceLocked, setSecondSequenceLocked] = useState(false);
  // Track which sequence is showing for yellow-cross-dot
  const [showSecondSequenceDot, setShowSecondSequenceDot] = useState(false);
  const [secondSequenceDotLocked, setSecondSequenceDotLocked] = useState(false);
  // Track which sequence is showing for yellow-edges-solution-2
  const [showSecondSequenceYellowEdges2, setShowSecondSequenceYellowEdges2] =
    useState(false);
  const [
    secondSequenceYellowEdges2Locked,
    setSecondSequenceYellowEdges2Locked,
  ] = useState(false);
  // Track if yaw has been changed for slide 8 (practice-setup-solution-6)
  const slide8YawChangedRef = useRef(false);
  // Track if yaw has been changed for slide 6 (midlayer-green-white-extraction)
  const slide6YawChangedRef = useRef(false);
  // Track yaw state for slide 8 of white cross (midlayer-green-white-extraction): 0=initial(-90deg), 1=after first seq(0deg), 2=after second D'(0deg)
  const slide8WhiteCrossYawStateRef = useRef(0);
  // Track if yaw has been changed for yellow-edges-solution-2
  const yellowEdges2YawChangedRef = useRef(false);
  // Track if yaw has been changed for yellow-edges-solution-3
  const yellowEdges3YawChangedRef = useRef(false);

  // Practice slide completion state
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  const [practiceShowTick, setPracticeShowTick] = useState(false);
  const [practiceTickProgress, setPracticeTickProgress] = useState(false);
  const [practiceTickLine, setPracticeTickLine] = useState(false);
  const [practiceTickAnimKey, setPracticeTickAnimKey] = useState(0);
  const [practiceSetupComplete, setPracticeSetupComplete] = useState(false);
  const [practiceInitialCrossState, setPracticeInitialCrossState] = useState<
    boolean | null
  >(null);

  // end fix box state  // Slides for this lesson
  const slides: Slide[] = useMemo(() => {
    return getSlidesForLesson(lessonId);
  }, [lessonId]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const activeSlide = slides[currentSlide];

  // Derive tutorialCube3D from cube3D using useMemo to ensure they're always in sync
  const tutorialCube3D = useMemo(() => {
    const base = createTutorialCubeState(lessonId, cube3D);
    const grey = "#808080";

    // Apply filter first if it exists
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

    // For yellow-cross lesson, grey out non-yellow colors on yellow edge pieces
    // This runs after filtering so we only process visible pieces
    if (lessonId === "yellow-cross") {
      return filtered.map((layer) =>
        layer.map((row) =>
          row.map((piece) => {
            const set = getCubieColorSet(piece);
            // Check if this is a yellow edge piece (2 colors, one is yellow)
            if (set.size === 2 && set.has(CUBE_COLORS.YELLOW)) {
              // This is a yellow edge piece - grey out the non-yellow color, keep yellow
              const newColors = { ...piece.colors };
              // Find which color is not yellow and grey it out
              const faceKeys: Array<keyof typeof piece.colors> = [
                "front",
                "back",
                "left",
                "right",
                "top",
                "bottom",
              ];
              for (const face of faceKeys) {
                const color = piece.colors[face];
                // Only grey out colors that are NOT yellow (preserve yellow)
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

    return filtered;
  }, [lessonId, cube3D, activeSlide]);

  // Check if we should show yellow edge indicators on slide 2 and slide 3
  const shouldShowYellowEdgeIndicators = useMemo(() => {
    return (
      lessonId === "yellow-edges" &&
      (activeSlide?.id === "yellow-edges-solution" ||
        activeSlide?.id === "yellow-edges-solution-2" ||
        activeSlide?.id === "yellow-edges-solution-3") &&
      checkSecondLayerSolved(cube3D) &&
      isYellowCrossSolved(cube3D)
    );
  }, [lessonId, activeSlide?.id, cube3D]);

  // Get yellow edge match status
  const yellowEdgeMatchStatus = useMemo(() => {
    if (!shouldShowYellowEdgeIndicators) return new Map<string, boolean>();
    return getYellowEdgeMatchStatus(cube3D);
  }, [shouldShowYellowEdgeIndicators, cube3D]);

  // Function to render piece children for yellow edge indicators
  const yellowEdgePieceChildren = useMemo(() => {
    if (!shouldShowYellowEdgeIndicators) return undefined;
    return (x: number, y: number, z: number, piece: CubeState) => {
      // Only render indicators for yellow edge pieces on bottom face (y=0) with yellow on bottom
      if (y !== 0) return null;
      const set = getCubieColorSet(piece);
      if (
        set.size !== 2 ||
        !set.has(CUBE_COLORS.YELLOW) ||
        piece.colors.bottom !== CUBE_COLORS.YELLOW
      ) {
        return null;
      }

      const key = `${x},${y},${z}`;
      const matches = yellowEdgeMatchStatus.get(key) ?? false;
      const half = CUBIE_SIZE / 2;
      const stickerY = -(half + STICKER_LIFT); // Bottom face sticker position

      return (
        <group
          position={[0, stickerY - 0.02, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <Html
            center
            transform
            distanceFactor={0}
            occlude
            style={{ pointerEvents: "none" }}
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                backgroundColor: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${
                  matches ? CUBE_COLORS.GREEN : CUBE_COLORS.RED
                }`,
                // boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                opacity: 1,
                background: matches ? CUBE_COLORS.GREEN : CUBE_COLORS.RED,
              }}
            >
              {matches ? (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transform: "rotate(270deg)" }}
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
            </div>
          </Html>
        </group>
      );
    };
  }, [shouldShowYellowEdgeIndicators, cube3D, yellowEdgeMatchStatus]);

  // Orbit controls hook
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

  // Expected Fix sequence for the current slide
  const fixSequence: string[] = useMemo(() => {
    switch (activeSlide?.id) {
      // Notation intro/faces: no specific sequence; free play
      case "notation-intro":
      case "notation-faces":
        return [];
      // Notation: use Fix-like confirmation for Try sequences
      case "notation-turns":
        return ["F", "F'", "F2"];
      case "notation-example":
        return ["R", "U", "R'", "U'"];
      case "notation-example-2":
        return ["F", "R", "U", "R'", "U'", "F'"];
      case "notation-example-3":
        return ["R", "U2", "R'", "U'"];
      case "notation-10-step":
        return ["F", "U", "R", "U'", "R'", "F'", "R", "U", "R'", "U'"];
      case "recap-mental-model":
      case "recap-white-corners":
      case "second-layer-recap":
      case "practice-two-edges":
      case "practice-three-edges":
      case "practice-full-cross":
      case "practice-white-corners":
      case "practice-white-corners-2":
      case "practice-white-corners-3":
      case "practice-second-layer":
      case "practice-second-layer-2":
      case "practice-second-layer-3":
        return [];
      case "flip-green-white-f2":
        return ["F2"];
      case "misaligned-green-white":
        return ["D'", "F2"];
      case "flip-green-white":
        return ["F", "U'", "R", "U"];
      case "flipped-misoriented-green-white":
        // Teach as combination: F2, then F U' R U
        return ["F2", "F", "U'", "R", "U"];
      case "flipped-misoriented-misaligned-green-white":
        return ["D'", "F2", "F", "U'", "R", "U"];
      case "midlayer-green-white-extraction":
        // Three conceptual stages: (B' D' B) free (displayed as R' D' R), then D' align, then F2 place
        return ["B'", "D'", "B", "D'", "F2"];
      case "practice-setup-solution":
        // Solution sequence: R U R' relative to yellow top/red front (visual)
        // Logical state is white top/green front, so remap: R→F (red front to green front), U→D
        // So remap: R U R' → F D F'
        return ["F", "D", "F'"];
      case "practice-setup-solution-2":
        // Solution sequence: L' U' L relative to yellow top/green front (visual)
        // Logical state is white top/green front, so remap: L→R (when flipped, L and R swap), U→D
        // So remap: L' U' L → R' D' R
        return ["R'", "D'", "R"];
      case "practice-setup-solution-3":
        // Two-part solution (both relative to yellow top/red front, visual):
        // Part 1: R U2 R' U' → Logical: F D2 F' D'
        // Part 2: R U R' → Logical: F D F'
        return ["F", "D2", "F'", "D'", "F", "D", "F'"];
      case "practice-setup-solution-4":
        // Two-part solution (both relative to yellow top/red front, visual):
        // Part 1: R U R' U' → Logical: F D F' D'
        // Part 2: R U R' → Logical: F D F'
        return ["F", "D", "F'", "D'", "F", "D", "F'"];
      case "practice-setup-solution-5":
        // Three-part solution (all relative to yellow top/red front, visual):
        // Part 1: R U R' U' → Logical: F D F' D'
        // Part 2: R U2 R' U' → Logical: F D2 F' D'
        // Part 3: R U R' → Logical: F D F'
        return ["F", "D", "F'", "D'", "F", "D2", "F'", "D'", "F", "D", "F'"];
      case "yellow-cross-line":
        // Solution sequence: F R U R' U' F' relative to yellow top/green front (visual)
        // Logical state is white top/green front, so remap: F→R, R→F, U→D
        // So remap: F R U R' U' F' → R F D F' D' R' (logical for tracking)
        // Display: F R U R' U' F' (visual notation shown to user)
        return ["R", "F", "D", "F'", "D'", "R'"];
      case "yellow-cross-triangle":
        // Solution: F R U R' U' F' / F R U R' U' F' relative to yellow top/red front (visual)
        // Logical state is white top/green front, so remap: F→R, R→F, U→D (same as line)
        // So remap: F R U R' U' F' → R F D F' D' R' (twice for tracking)
        return [
          "R",
          "F",
          "D",
          "F'",
          "D'",
          "R'",
          "R",
          "F",
          "D",
          "F'",
          "D'",
          "R'",
        ];
      case "yellow-cross-dot":
        // Solution: F R U R' U' F' / U2 / F R U R' U' F' / F R U R' U' F' relative to yellow top/red front (visual)
        // Logical state is white top/green front, so remap: F→R, R→F, U→D
        // So remap: F R U R' U' F' → R F D F' D' R', U2 → D2
        // Parts: 1) R F D F' D' R' (6 moves), 2) D2 (1 move), 3) R F D F' D' R' (6 moves), 4) R F D F' D' R' (6 moves)
        return [
          "R",
          "F",
          "D",
          "F'",
          "D'",
          "R'",
          "D2",
          "R",
          "F",
          "D",
          "F'",
          "D'",
          "R'",
          "R",
          "F",
          "D",
          "F'",
          "D'",
          "R'",
        ];
      case "yellow-edges-solution":
        // Solution: R U R' U R U2 R' U relative to yellow top/red front (visual)
        // Logical state is white top/green front, so remap: R→F, U→D
        // So remap: R U R' U R U2 R' U → F D F' D F D2 F' D
        return ["F", "D", "F'", "D", "F", "D2", "F'", "D"];
      case "yellow-edges-solution-2":
        // Multi-part solution:
        // Part 1: U relative to yellow top/red front (visual) → D (logical, yellow top = bottom)
        // Part 2: R U R' U R U2 R' U relative to yellow top/green front (visual)
        //   Logical: yellow top/green front → white top/green front, so U→D, R→L
        //   So: R U R' U R U2 R' U → L D L' D L D2 L' D
        // Total: D (part 1) + L D L' D L D2 L' D (part 2) = 9 moves
        return ["D", "L", "D", "L'", "D", "L", "D2", "L'", "D"];
      case "yellow-edges-solution-3":
        // Multi-part solution:
        // Part 1: U2 relative to yellow top/red front (visual) → D2 (logical, yellow top = bottom)
        // Part 2: R U R' U R U2 R' U relative to yellow top/blue front (visual)
        //   Logical: yellow top/blue front → white top/green front, so U→D, R→R (blue front maps to blue front)
        //   So: R U R' U R U2 R' U → R D R' D R D2 R' D
        // Total: D2 (part 1) + R D R' D R D2 R' D (part 2) = 9 moves
        return ["D2", "R", "D", "R'", "D", "R", "D2", "R'", "D"];
      case "second-layer-setup-solution-3":
        // Two-part solution:
        // Part 1: U R U R' U' relative to yellow top/green front (visual)
        //   When yellow top/green front (visual): green is front, orange is right
        //   In logical (white top/green front): green is front, red is right, orange is left
        //   So visual R (orange) → logical L (orange left), U→D
        //   Therefore: U R U R' U' → D L D L' D' (logical)
        // Part 2: L' U' L relative to yellow top/orange front (visual)
        //   When yellow top/orange front (visual): orange is front, blue is right
        //   In logical (white top/green front): green is front, red is right, orange is left, blue is back
        //   So visual L (green) → logical F (green front), U→D
        //   Therefore: L' U' L → F' D' F (logical)
        return ["D", "L", "D", "L'", "D'", "F'", "D'", "F"];
      case "practice-setup-solution-6":
        // Three-part solution:
        // Part 1: R U R' U' relative to yellow top/green front (visual)
        // When flipped, visual R → logical L (left and right swap)
        // Logical: L D L' D' (white top/green front, flipped)
        // Part 2: U relative to yellow top/green front (visual)
        // Logical: D (white top/green front, flipped)
        // Part 3: R U R' relative to yellow top/red front (visual)
        // Logical: F D F' (white top/green front, red front to green front, flipped)
        return ["L", "D", "L'", "D'", "D", "F", "D", "F'"];
      case "second-layer-setup-solution":
        // Two-part solution:
        // Part 1: U' L' U' L U relative to yellow top/green front (visual)
        // When flipped, visual L → logical R (left and right swap), U→D
        // Logical: D' R' D' R D (white top/green front, flipped)
        // Part 2: R U R' relative to yellow top/red front (visual)
        // Logical: F D F' (white top/green front, red front to green front, flipped)
        return ["D'", "R'", "D'", "R", "D", "F", "D", "F'"];
      case "second-layer-setup-solution-2":
        // Two-part solution:
        // Part 1: U R U R' U' relative to yellow top/red front (visual)
        // Logical: R→F, U→D → D F D F' D'
        // Part 2: L' U' L relative to yellow top/green front (visual)
        // Logical: L→R (when flipped, L and R swap), U→D → R' D' R
        return ["D", "F", "D", "F'", "D'", "R'", "D'", "R"];
      case "second-layer-setup-solution-4":
        // Five-part solution:
        // Part 1: U R U R' U' relative to yellow top/red front (visual)
        //   Logical: R→F, U→D → D F D F' D'
        // Part 2: L' U' L relative to yellow top/green front (visual)
        //   Logical: L→R (when yellow top/green front, visual L maps to logical R), U→D → R' D' R
        // Part 3: U2 relative to yellow top/green front (visual)
        //   Logical: U→D → D2
        // Part 4: U R U R' U' relative to yellow top/red front (visual) - same as Part 1
        //   Logical: D F D F' D'
        // Part 5: L' U' L relative to yellow top/green front (visual) - same as Part 2
        //   Logical: R' D' R
        return [
          "D",
          "F",
          "D",
          "F'",
          "D'",
          "R'",
          "D'",
          "R",
          "D2",
          "D",
          "F",
          "D",
          "F'",
          "D'",
          "R'",
          "D'",
          "R",
        ];
      default:
        return [];
    }
  }, [activeSlide?.id]);

  // Display sequence for Fix box (what user sees)
  const fixSequenceDisplay: string[] = useMemo(() => {
    if (activeSlide?.id === "practice-setup-solution") {
      // Show R U R' (visual notation, yellow top/red front) in Fix box
      return ["R", "U", "R'"];
    }
    if (activeSlide?.id === "practice-setup-solution-2") {
      // Show L' U' L (visual notation, yellow top/green front) in Fix box
      return ["L'", "U'", "L"];
    }
    if (activeSlide?.id === "yellow-cross-line") {
      // Show F R U R' U' F' (visual notation, yellow top/green front) in Fix box
      return ["F", "R", "U", "R'", "U'", "F'"];
    }
    if (activeSlide?.id === "yellow-edges-solution") {
      // Show R U R' U R U2 R' U (visual notation, yellow top/red front) in Fix box
      return ["R", "U", "R'", "U", "R", "U2", "R'", "U"];
    }
    // Note: practice-setup-solution-3, -4, -5, -6 use MultiPartSequence, so fixSequenceDisplay not needed here
    // yellow-cross-triangle also uses MultiPartSequence
    return fixSequence;
  }, [activeSlide?.id, fixSequence]);

  // Show second sequence for second-layer-setup-solution-4 when fixIndex reaches 9 (with delay)
  useEffect(() => {
    if (
      activeSlide?.id === "second-layer-setup-solution-4" &&
      fixIndex === 9 &&
      !showSecondSequence &&
      !secondSequenceLocked
    ) {
      // Add 500ms delay before showing second sequence
      const timer = setTimeout(() => {
        setShowSecondSequence(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeSlide?.id, fixIndex, showSecondSequence, secondSequenceLocked]);

  // Show second sequence for yellow-cross-dot when fixIndex reaches 7 (with delay)
  useEffect(() => {
    if (
      activeSlide?.id === "yellow-cross-dot" &&
      fixIndex === 7 &&
      !showSecondSequenceDot &&
      !secondSequenceDotLocked
    ) {
      // Add 500ms delay before showing second sequence
      const timer = setTimeout(() => {
        setShowSecondSequenceDot(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [
    activeSlide?.id,
    fixIndex,
    showSecondSequenceDot,
    secondSequenceDotLocked,
  ]);

  // Reset fix progress whenever slide changes
  useEffect(() => {
    setFixIndex(0);
    setFixDoublePartialDir(0);
    setFixErrorPulse(false);
    setFixShowTick(false);
    setFixTickAnimKey((k) => k + 1);
    setFixTickProgress(false);
    setFixTickLine(false);
    // Reset first inline tick state so it can animate again on new runs
    setFixFirstTickPlayed(false);
    setFixFirstTickProgress(false);
    setFixFirstTickLine(false);
    // Reset second inline tick state for multi-stage slides
    setFixSecondTickPlayed(false);
    setFixSecondTickProgress(false);
    setFixSecondTickLine(false);
    setMidStage1Played(false);
    setMidStage1Progress(false);
    setMidStage1Line(false);
    setMidStage2Played(false);
    setMidStage2Progress(false);
    setMidStage2Line(false);
    setMidStage3Played(false);
    setMidStage3Progress(false);
    setMidStage3Line(false);
    setMidStage4Played(false);
    setMidStage4Progress(false);
    setMidStage4Line(false);
    setMidStage5Played(false);
    setMidStage5Progress(false);
    setMidStage5Line(false);
    setMidStage1Key(0);
    setMidStage2Key(0);
    setMidStage3Key(0);
    setMidStage4Key(0);
    setMidStage5Key(0);
    // Reset sequence visibility for second-layer-setup-solution-4 (instant, no delay)
    setShowSecondSequence(false);
    setSecondSequenceLocked(false);
    // Reset sequence visibility for yellow-cross-dot (instant, no delay)
    setShowSecondSequenceDot(false);
    setSecondSequenceDotLocked(false);
    // Reset sequence visibility for yellow-edges-solution-2 (instant, no delay)
    setShowSecondSequenceYellowEdges2(false);
    setSecondSequenceYellowEdges2Locked(false);
  }, [activeSlide?.id, fixSequence.length]);

  // Trigger a tick animation (can be used mid-sequence and at completion)
  const triggerFixTick = useCallback(() => {
    setFixShowTick(true);
    setFixTickProgress(false);
    setFixTickLine(false);
    setFixTickAnimKey((k) => k + 1);
    setTimeout(() => setFixTickProgress(true), 100);
    setTimeout(() => setFixTickLine(true), 300);
  }, []);

  // Derived flag: when Fix sequence finished for this slide, lock face moves but keep orbit enabled
  const fixCompleted = fixSequence.length > 0 && fixIndex >= fixSequence.length;

  // (Removed camera direction tween to avoid double transitions)

  // When changing slides, animate the cube back to its original orientation (like timer flows)
  const prevSlideRef = useRef<number>(-1); // Initialize to -1 so initial mount is not skipped
  const isInitialMountRef = useRef(true); // Track if this is the very first mount
  useEffect(() => {
    // Skip if slide hasn't actually changed (but allow initial mount when prevSlideRef is -1)
    if (prevSlideRef.current === currentSlide && prevSlideRef.current !== -1)
      return;
    const isInitialMount = isInitialMountRef.current;
    isInitialMountRef.current = false;
    prevSlideRef.current = currentSlide;

    const slide = slides[currentSlide];
    const cameraConfig = getSlideCameraConfig(slide?.id, lessonId);

    // Set camera config on orbit controls immediately, even if cube ref isn't ready yet
    // This ensures the config is available when the cube becomes ready
    if (orbitControlsRef.current) {
      const c: any = orbitControlsRef.current;
      c.__resetOpts = cameraConfig;
    }

    // If cube ref isn't ready yet, retry using requestAnimationFrame
    if (!cubeViewRef.current) {
      let retryCount = 0;
      const maxRetries = 10; // Try up to 10 times (~160ms at 60fps)
      const tryReset = () => {
        if (cubeViewRef.current && orbitControlsRef.current) {
          const c: any = orbitControlsRef.current;
          c.__resetOpts = cameraConfig;
          // Use instant mode for initial mount
          cubeViewRef.current.resetToInitialPosition(
            orbitControlsRef,
            cubeRef,
            undefined,
            isInitialMount
          );
        } else if (retryCount < maxRetries) {
          retryCount++;
          requestAnimationFrame(tryReset);
        }
      };
      requestAnimationFrame(tryReset);
      return;
    }

    // For initial mount, set rotation instantly without animation
    if (isInitialMount) {
      cubeViewRef.current.resetToInitialPosition(
        orbitControlsRef,
        cubeRef,
        () => {
          // Re-evaluate input rules for the new slide after reset completes
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
          isTransitioningRef.current = false;
        },
        true // instant mode
      );
      return;
    }

    // Bump transition token so only the latest completion callback applies
    const myTransitionId = ++transitionIdRef.current;
    // Set transitioning flag to prevent validation during transition
    isTransitioningRef.current = true;
    // Temporarily disable input during the reset animation
    setInputDisabled(true);
    // Also lock orbit to avoid momentum fighting the transition
    disableOrbitTemporarily();
    // Hard-set controls to a neutral target before resetting cube to avoid post-anim snaps
    if (orbitControlsRef.current) {
      const c: any = orbitControlsRef.current;
      if (!c.target) c.target = new Vector3(0, 0, 0);
      else c.target.set(0, 0, 0);
      if (c.update) c.update();
      clearControlsInternal();
      // Camera config already set above
    }
    cubeViewRef.current.resetToInitialPosition(
      orbitControlsRef,
      cubeRef,
      () => {
        // Ignore callbacks from stale transitions
        if (transitionIdRef.current !== myTransitionId) return;
        // Re-evaluate input rules for the new slide after reset completes
        const controls: any = orbitControlsRef.current;
        // notation-protip no longer locks input - cube should be enabled
        setInputDisabled(false);
        // Explicitly set final orbit state to avoid races
        if (controls) {
          // Always enable orbit controls (notation-protip no longer locks)
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
        // End controlled transition
        orbitPrevRef.current = null;
        isTransitioningRef.current = false;
      }
    );
  }, [
    currentSlide,
    isResetting,
    slides,
    disableOrbitTemporarily,
    clearControlsInternal,
    lessonId,
  ]);

  // Device/interaction hooks that rely on handleOrbitControlsChange
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

  // Enforce slide interaction rules and lock/allow per slide
  useEffect(() => {
    if (!activeSlide) return;
    // Practice slides 10, 11, 12: always enable orbit (for both white cross and white corners)
    const isPracticeSlide10_11_12 =
      activeSlide.id === "practice-two-edges" ||
      activeSlide.id === "practice-three-edges" ||
      activeSlide.id === "practice-full-cross" ||
      activeSlide.id === "practice-white-corners" ||
      activeSlide.id === "practice-white-corners-2" ||
      activeSlide.id === "practice-white-corners-3" ||
      activeSlide.id === "practice-second-layer" ||
      activeSlide.id === "practice-second-layer-2" ||
      activeSlide.id === "practice-second-layer-3";

    // Slide 2 (find-green-white): disable face moves but allow orbit (use disableSliceDrag, not inputDisabled)
    if (activeSlide.id === "find-green-white") {
      setInputDisabled(false); // Don't disable input - disableSliceDrag will handle preventing moves
      setOrbitControlsEnabled(true);
      // Explicitly enable orbit by calling the handler
      handleOrbitControlsChange(true);
    } else if (isPracticeSlide10_11_12 && practiceCompleted) {
      // Practice slide when completed: disable face moves but allow orbit
      setInputDisabled(true);
      setOrbitControlsEnabled(true);
    } else if (activeSlide.id === "mechanical-approach") {
      // White corners slide 2: disable face moves but allow orbit (same as intro)
      setInputDisabled(true);
      setOrbitControlsEnabled(true);
    } else {
      // Slide 1 (intro): allow orbit spin but no face moves
      // Slide 3+: fully interactive per allowFaceMoves
      // Practice slide: also disable when completed
      const shouldDisableInput =
        !activeSlide.allowFaceMoves ||
        (isPracticeSlide10_11_12 && practiceCompleted);

      setInputDisabled(shouldDisableInput);
      // Always enable orbit for practice slides 10, 11, 12, otherwise enable for all other slides
      setOrbitControlsEnabled(true);
    }
  }, [activeSlide, isResetting, practiceCompleted, handleOrbitControlsChange]);

  // Optional per-slide setup (instant)
  useEffect(() => {
    // Reset setup state when slide changes
    setPracticeSetupComplete(false);
    // Reset yaw change tracking for slide 8 when slide changes
    slide8YawChangedRef.current = false;
    // Reset yaw change tracking for slide 6 when slide changes
    slide6YawChangedRef.current = false;
    // Reset yaw state for slide 8 of white cross when slide changes
    slide8WhiteCrossYawStateRef.current = 0;
    // Reset yaw change tracking for yellow-edges-solution-2
    yellowEdges2YawChangedRef.current = false;
    // Reset yaw change tracking for yellow-edges-solution-3
    yellowEdges3YawChangedRef.current = false;

    if (!activeSlide || !activeSlide.setup) {
      // No setup needed, allow validation immediately
      isTransitioningRef.current = false;
      return;
    }

    activeSlide.setup(cubeRef.current);
    const updated = cubejsTo3D(cubeRef.current.getCube());
    setCube3D(updated);

    // Clear history so undo/redo aligns with the new slide's baseline state
    setMoveHistory([]);
    setHistoryIndex(-1);
    moveHistoryRef.current = [];
    historyIndexRef.current = -1;
    // Clear practice completion state when changing slides
    setPracticeCompleted(false);
    setPracticeShowTick(false);
    setPracticeInitialCrossState(null);

    // Mark setup complete immediately
    setPracticeSetupComplete(true);
    // Allow validation after setup completes (use microtask to ensure state is settled)
    queueMicrotask(() => {
      isTransitioningRef.current = false;
    });
    setPracticeTickProgress(false);
    setPracticeTickLine(false);
  }, [activeSlide]);

  // Wrapper for orbit controls change that enables orbit for practice slides 10, 11, 12
  // when completed, and for find-green-white (allows normal disable during animations/transitions/drags)
  const handlePracticeOrbitChange = useCallback(
    (enabled: boolean) => {
      const isPracticeSlide10_11_12 =
        activeSlide?.id === "practice-two-edges" ||
        activeSlide?.id === "practice-three-edges" ||
        activeSlide?.id === "practice-full-cross" ||
        activeSlide?.id === "practice-white-corners" ||
        activeSlide?.id === "practice-white-corners-2" ||
        activeSlide?.id === "practice-white-corners-3" ||
        activeSlide?.id === "practice-second-layer" ||
        activeSlide?.id === "practice-second-layer-2" ||
        activeSlide?.id === "practice-second-layer-3";

      // For find-green-white: always allow orbit to be enabled
      if (activeSlide?.id === "find-green-white") {
        // Always enable orbit for find-green-white (override any disable requests)
        if (
          !enabled &&
          !forceOrbitDisabledRef.current &&
          !isTransitioningRef.current
        ) {
          // RubiksCube3D trying to disable - override to keep enabled
          handleOrbitControlsChange(true);
        } else if (enabled) {
          // Pass through enable requests
          handleOrbitControlsChange(enabled);
        } else {
          // During transitions or when force disabled, still try to enable if not transitioning
          if (!isTransitioningRef.current && !forceOrbitDisabledRef.current) {
            handleOrbitControlsChange(true);
          } else {
            handleOrbitControlsChange(enabled);
          }
        }
      } else if (isPracticeSlide10_11_12) {
        // For practice slides 10-12: only override disable requests when:
        // - Slide is completed (practiceCompleted is true)
        // - Not animating/transitioning
        // - Request is to disable (RubiksCube3D trying to disable due to inputDisabled)
        // Otherwise, pass through all requests to allow normal behavior (disable during drags/animations)
        if (
          !enabled &&
          practiceCompleted &&
          !forceOrbitDisabledRef.current &&
          !isTransitioningRef.current
        ) {
          // Slide is completed and RubiksCube3D trying to disable due to inputDisabled - override to keep enabled
          handleOrbitControlsChange(true);
        } else {
          // Normal request (during animations, drags, or when not completed) - pass through
          handleOrbitControlsChange(enabled);
        }
      } else {
        handleOrbitControlsChange(enabled);
      }
    },
    [activeSlide?.id, practiceCompleted, handleOrbitControlsChange]
  );

  // (moved handleOrbitControlsChange above)
  // Trigger a move via buttons/drag
  const handleButtonMove = useCallback(
    (move: string) => {
      // Block manual move buttons after Fix completion or practice completion
      if (fixCompleted) return;
      const isPracticeSlide =
        activeSlide?.id === "practice-two-edges" ||
        activeSlide?.id === "practice-three-edges" ||
        activeSlide?.id === "practice-full-cross" ||
        activeSlide?.id === "practice-white-corners" ||
        activeSlide?.id === "practice-white-corners-2" ||
        activeSlide?.id === "practice-white-corners-3" ||
        activeSlide?.id === "practice-second-layer" ||
        activeSlide?.id === "practice-second-layer-2" ||
        activeSlide?.id === "practice-second-layer-3";
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

  // Undo/Redo removed on tutorial page

  // Reset to the current slide's baseline state (instant, no animation)
  const resetToSlideBaseline = useCallback(async () => {
    console.log("[RESET] Reset called, current fixIndex:", fixIndex);
    // Prevent validation during reset
    isTransitioningRef.current = true;
    // Disable input and orbit during transition
    setInputDisabled(true);
    disableOrbitTemporarily();
    // IMPORTANT: Reset fixIndex FIRST to unlock the cube immediately
    // This must happen before any other state updates to ensure fixCompleted becomes false
    setFixIndex(0);
    setFixDoublePartialDir(0);
    console.log("[RESET] Set fixIndex to 0");

    // Don't wait - update state immediately

    setIsResetting(true);
    isResettingRef.current = true;
    // Cancel any in-flight or queued move to avoid races with baseline reset
    setPendingMove(null);
    setIsAnimating(false);
    isAnimatingRef.current = false;
    // Clear Fix progress (already cleared above, but clear other related state)
    setFixErrorPulse(false);
    setFixShowTick(false);
    setFixTickAnimKey((k) => k + 1);
    setFixTickProgress(false);
    setFixTickLine(false);
    // Also clear first inline tick so it can re-animate after reset
    setFixFirstTickPlayed(false);
    setFixFirstTickProgress(false);
    setFixFirstTickLine(false);
    // And clear second inline tick state
    setFixSecondTickPlayed(false);
    setFixSecondTickProgress(false);
    setFixSecondTickLine(false);
    setMidStage1Played(false);
    setMidStage1Progress(false);
    setMidStage1Line(false);
    setMidStage2Played(false);
    setMidStage2Progress(false);
    setMidStage2Line(false);
    setMidStage3Played(false);
    setMidStage3Progress(false);
    setMidStage3Line(false);
    setMidStage4Played(false);
    setMidStage4Progress(false);
    setMidStage4Line(false);
    setMidStage5Played(false);
    setMidStage5Progress(false);
    setMidStage5Line(false);
    setMidStage1Key(0);
    setMidStage2Key(0);
    setMidStage3Key(0);
    setMidStage4Key(0);
    setMidStage5Key(0);
    // Reset sequence visibility for second-layer-setup-solution-4 (instant, no delay)
    setShowSecondSequence(false);
    setSecondSequenceLocked(false);
    // Reset sequence visibility for yellow-cross-dot (instant, no delay)
    setShowSecondSequenceDot(false);
    setSecondSequenceDotLocked(false);
    setShowSecondSequenceYellowEdges2(false);
    setSecondSequenceYellowEdges2Locked(false);
    // Reset yaw change tracking for slide 8
    slide8YawChangedRef.current = false;
    // Reset yaw change tracking for slide 6
    slide6YawChangedRef.current = false;
    // Reset yaw state for slide 8 of white cross
    slide8WhiteCrossYawStateRef.current = 0;
    // Reset yaw change tracking for yellow-edges-solution-2
    yellowEdges2YawChangedRef.current = false;
    // Reset yaw change tracking for yellow-edges-solution-3
    yellowEdges3YawChangedRef.current = false;
    // Clear practice slide progress
    setPracticeCompleted(false);
    setPracticeShowTick(false);
    setPracticeTickProgress(false);
    setPracticeTickLine(false);
    setPracticeTickAnimKey((k) => k + 1);
    setPracticeInitialCrossState(null);
    setPracticeSetupComplete(false); // Reset setup state to trigger re-initialization
    await new Promise((r) => requestAnimationFrame(r));
    const slide = slides[currentSlide];

    // Clear history and any pending queues
    setMoveHistory([]);
    setHistoryIndex(-1);
    moveHistoryRef.current = [];
    historyIndexRef.current = -1;
    setResetQueue(null);
    resetIndexRef.current = 0;

    // Reset logical cube to solved state first
    // Note: Some setup functions call reset() internally, but we reset here first
    // to ensure a clean slate before applying setup
    cubeRef.current.reset();

    // Apply slide setup moves IMMEDIATELY (don't wait for animation)
    // The setup function will reset again if needed, then apply setup moves
    if (slide?.setup) {
      // Make sure cube is reset before calling setup
      cubeRef.current.reset();
      console.log("[RESET] Cube reset, calling setup for slide:", slide.id);
      slide.setup(cubeRef.current);
      console.log("[RESET] Setup complete");
    }

    // Update visual state immediately to show the reset + setup
    // tutorialCube3D will be automatically updated via useMemo when cube3D changes
    const updatedCube3D = cubejsTo3D(cubeRef.current.getCube());
    console.log("[RESET] Updating cube3D state");
    setCube3D(updatedCube3D);

    // Mark reset as complete immediately since we've updated all state synchronously
    setIsResetting(false);
    isResettingRef.current = false;

    // Also navigate the camera/orbit back to the slide's initial spot (same as slide change)
    const myTransitionId = ++transitionIdRef.current;
    // Lock orbit during transition and neutralize controls
    disableOrbitTemporarily();
    if (orbitControlsRef.current) {
      const c: any = orbitControlsRef.current;
      if (!c.target) c.target = new Vector3(0, 0, 0);
      else c.target.set(0, 0, 0);
      if (c.update) c.update();
      clearControlsInternal();
      // Match slide-facing rules (same as slide transition)
      // Get camera configuration for this slide
      c.__resetOpts = getSlideCameraConfig(slide?.id, lessonId);
    }
    cubeViewRef.current?.resetToInitialPosition(
      orbitControlsRef,
      cubeRef,
      () => {
        if (transitionIdRef.current !== myTransitionId) return;
        // Animation complete - no need to apply setup again (already done above)
        // Note: isResetting was already set to false immediately after state updates

        // For practice slides, mark setup complete after a short delay
        const s = slides[currentSlide];
        if (
          s?.id === "practice-two-edges" ||
          s?.id === "practice-three-edges" ||
          s?.id === "practice-full-cross" ||
          s?.id === "practice-white-corners" ||
          s?.id === "practice-white-corners-2" ||
          s?.id === "practice-white-corners-3" ||
          s?.id === "practice-second-layer" ||
          s?.id === "practice-second-layer-2" ||
          s?.id === "practice-second-layer-3"
        ) {
          setTimeout(() => {
            setPracticeSetupComplete(true);
          }, 100);
        }

        // Also mark practice-setup-solution slides as complete
        if (
          s?.id === "practice-setup-solution" ||
          s?.id === "practice-setup-solution-2" ||
          s?.id === "practice-setup-solution-3" ||
          s?.id === "practice-setup-solution-4" ||
          s?.id === "practice-setup-solution-5" ||
          s?.id === "practice-setup-solution-6" ||
          s?.id === "second-layer-setup-solution" ||
          s?.id === "second-layer-setup-solution-2" ||
          s?.id === "second-layer-setup-solution-3" ||
          s?.id === "second-layer-setup-solution-4" ||
          s?.id === "yellow-cross-triangle" ||
          s?.id === "yellow-cross-dot"
        ) {
          setPracticeSetupComplete(true);
        }

        const controls: any = orbitControlsRef.current;
        // notation-protip no longer locks input - cube should be enabled
        setInputDisabled(false);
        if (controls) {
          // Always enable orbit controls (notation-protip no longer locks)
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
        // End controlled transition
        orbitPrevRef.current = null;
        // Ensure validation is enabled after reset completes
        isTransitioningRef.current = false;
      }
    );
  }, [slides, currentSlide, disableOrbitTemporarily, clearControlsInternal]);

  // Animation lifecycle
  const handleStartAnimation = useCallback(() => {
    setIsAnimating(true);
    isAnimatingRef.current = true;
    // While a move is animating, temporarily disable orbiting (override view-only rule)
    forceOrbitDisabledRef.current = true;
    handleOrbitControlsChange(false);
  }, [handleOrbitControlsChange]);

  const handleMoveAnimationDone = useCallback(
    (move: CubeMove) => {
      const runStageAnimation = (
        played: boolean,
        setKey: React.Dispatch<React.SetStateAction<number>>,
        setProgress: React.Dispatch<React.SetStateAction<boolean>>,
        setLine: React.Dispatch<React.SetStateAction<boolean>>,
        setPlayed: React.Dispatch<React.SetStateAction<boolean>>
      ) => {
        if (
          (activeSlide?.id !== "midlayer-green-white-extraction" &&
            activeSlide?.id !== "practice-setup-solution-3" &&
            activeSlide?.id !== "practice-setup-solution-4" &&
            activeSlide?.id !== "practice-setup-solution-5" &&
            activeSlide?.id !== "practice-setup-solution-6" &&
            activeSlide?.id !== "second-layer-setup-solution" &&
            activeSlide?.id !== "second-layer-setup-solution-2" &&
            activeSlide?.id !== "second-layer-setup-solution-3" &&
            activeSlide?.id !== "second-layer-setup-solution-4" &&
            activeSlide?.id !== "yellow-cross-triangle" &&
            activeSlide?.id !== "yellow-cross-dot" &&
            activeSlide?.id !== "yellow-edges-solution-2" &&
            activeSlide?.id !== "yellow-edges-solution-3") ||
          played
        )
          return;
        setKey((k) => k + 1);
        setProgress(false);
        setLine(false);
        setTimeout(() => setProgress(true), 50); // circle draws
        setTimeout(() => setLine(true), 300); // checkmark draws
        setTimeout(() => setPlayed(true), 700); // mark done
      };
      const animateMidlayerStage = (stage: 1 | 2 | 3 | 4 | 5) => {
        if (stage === 1)
          runStageAnimation(
            midStage1Played,
            setMidStage1Key,
            setMidStage1Progress,
            setMidStage1Line,
            setMidStage1Played
          );
        else if (stage === 2)
          runStageAnimation(
            midStage2Played,
            setMidStage2Key,
            setMidStage2Progress,
            setMidStage2Line,
            setMidStage2Played
          );
        else if (stage === 3)
          runStageAnimation(
            midStage3Played,
            setMidStage3Key,
            setMidStage3Progress,
            setMidStage3Line,
            setMidStage3Played
          );
        else if (stage === 4)
          runStageAnimation(
            midStage4Played,
            setMidStage4Key,
            setMidStage4Progress,
            setMidStage4Line,
            setMidStage4Played
          );
        else
          runStageAnimation(
            midStage5Played,
            setMidStage5Key,
            setMidStage5Progress,
            setMidStage5Line,
            setMidStage5Played
          );
      };
      // If a baseline reset is in progress, ignore stale animation completions
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
        // Update logical cube
        // Note: With flipUpsideDown, yellow is visually on top but logically still at bottom
        // The drag system detects moves based on logical positions
        // When user drags on yellow (visual top, logical bottom), system detects D moves
        // This is correct - no remapping needed, just execute the detected move
        cubeRef.current.move(move);
        // Update cube3D - tutorialCube3D will be automatically updated via useMemo
        // This ensures they're always in sync and prevents flicker
        setCube3D(cubejsTo3D(cubeRef.current.getCube()));

        // Add to history if manual (not undo/redo)
        const isManualMove =
          (window as any).__isManualDragMove ||
          lastMoveSourceRef.current === "manual";
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

      // Record whether this came from manual interaction before the ref is cleared
      const wasManual =
        (window as any).__isManualDragMove ||
        lastMoveSourceRef.current === "manual";

      setPendingMove(null);
      setIsAnimating(false);
      isAnimatingRef.current = false;
      // Re-enable orbiting after the move concludes (respects locked slides)
      forceOrbitDisabledRef.current = false;
      handleOrbitControlsChange(true);

      // Advance reset queue if applicable
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

      // Fix box validation: only when on an active fix slide and move was manual
      // Skip validation if we're still transitioning between slides
      if (fixSequence.length > 0 && wasManual && !isTransitioningRef.current) {
        // Helper parsers
        const parseMove = (m: string) => {
          const base = m[0];
          const mod = m.length > 1 ? m.slice(1) : ""; // "'" or "2"
          return { base, mod } as { base: string; mod: "" | "'" | "2" };
        };
        const eqMove = (a: string, b: string) => a === b;

        // Map conceptual -> internal for midlayer slide (display R' D' R but internal sequence B' D' B)
        const mapMidlayerConceptual = (m: string) => {
          if (activeSlide?.id === "midlayer-green-white-extraction") {
            if (m === "R'") return "B'";
            if (m === "R") return "B";
          }
          if (activeSlide?.id === "practice-setup-solution") {
            // Visual R (yellow top/red front) maps to logical F (white top/green front)
            if (m === "R'") return "F'";
            if (m === "R") return "F";
          }
          if (activeSlide?.id === "practice-setup-solution-2") {
            // Visual L (yellow top/green front) maps to logical R (white top/green front, when flipped L and R swap)
            if (m === "L'") return "R'";
            if (m === "L") return "R";
          }
          if (activeSlide?.id === "practice-setup-solution-6") {
            // Parts 1 and 2 (fixIndex < 5): yellow top/green front
            // When flipped (yellow top/green front), L and R swap: visual L → logical R
            // Visual R (green front) → logical L (when flipped, R becomes L)
            // Part 3 (fixIndex >= 5): yellow top/red front
            // R (red front) → F (logical, red front to green front)
            if (fixIndex < 5) {
              // Parts 1 and 2: green front, when flipped L and R swap
              // Visual R → Logical L (right becomes left when flipped) - matches fixSequence, pass through
              // Visual L → Logical R (left becomes right when flipped) - remap to L to match fixSequence
              // fixSequence expects L, so:
              // - L (from visual R) → pass through as L ✓
              // - R (from visual L) → remap to L
              if (m === "R'") return "L'";
              if (m === "R") return "L";
              // L passes through unchanged (visual R detected as logical L matches fixSequence)
            } else {
              // Part 3: red front, so R→F
              if (m === "R'") return "F'";
              if (m === "R") return "F";
            }
          }
          if (activeSlide?.id === "second-layer-setup-solution") {
            // Part 1 (fixIndex < 5): yellow top/green front
            // When flipped (yellow top/green front), L and R swap: visual L → logical R
            // Part 2 (fixIndex >= 5): yellow top/red front
            // R (red front) → F (logical, red front to green front)
            if (fixIndex < 5) {
              // Part 1: green front, when flipped L and R swap
              // Visual L → Logical R (left becomes right when flipped)
              if (m === "L'") return "R'";
              if (m === "L") return "R";
            } else {
              // Part 2: red front, so R→F
              if (m === "R'") return "F'";
              if (m === "R") return "F";
            }
          }
          if (activeSlide?.id === "second-layer-setup-solution-2") {
            // Part 1 (fixIndex < 5): yellow top/red front
            // R→F, U→D (when yellow top/red front)
            // Part 2 (fixIndex >= 5): yellow top/green front
            // L→R (when flipped, L and R swap), U→D
            if (fixIndex < 5) {
              // Part 1: red front, R→F
              if (m === "R'") return "F'";
              if (m === "R") return "F";
            } else {
              // Part 2: green front, when flipped L and R swap
              if (m === "L'") return "R'";
              if (m === "L") return "R";
            }
          }
          if (activeSlide?.id === "second-layer-setup-solution-4") {
            // Parts 1 and 4: yellow top/red front, R→F, U→D
            // Parts 2 and 5: yellow top/green front, L→R, U→D
            // Part 3: yellow top/green front, U2→D2
            if (fixIndex < 5 || (fixIndex >= 9 && fixIndex < 13)) {
              // Parts 1 and 4: red front, R→F
              if (m === "R'") return "F'";
              if (m === "R") return "F";
            } else if (fixIndex >= 5 && fixIndex < 9) {
              // Parts 2 and 3: green front, when flipped L and R swap
              if (m === "L'") return "R'";
              if (m === "L") return "R";
            } else if (fixIndex >= 13) {
              // Part 5: green front, when flipped L and R swap
              if (m === "L'") return "R'";
              if (m === "L") return "R";
            }
          }
          // For flipped slides, convert detected U moves (white top) to D moves (yellow top logical bottom)
          // This handles the case where move detection sees yellow as "top" but logically it's "bottom"
          if (
            activeSlide?.id === "practice-setup-solution" ||
            activeSlide?.id === "practice-setup-solution-2" ||
            activeSlide?.id === "practice-setup-solution-6" ||
            activeSlide?.id === "second-layer-setup-solution" ||
            activeSlide?.id === "second-layer-setup-solution-2" ||
            activeSlide?.id === "second-layer-setup-solution-4"
          ) {
            if (m === "U'") return "D'";
            if (m === "U") return "D";
            if (m === "U2") return "D2";
          }
          return m;
        };

        const expected = fixSequence[fixIndex];
        if (!expected) {
          // Already complete; ignore
          return;
        }
        const exp = parseMove(expected);
        // For practice-setup-solution, moves are already in logical form (D' R' D R)
        // The move detected is already logical (D' when dragging on yellow), so no remapping needed
        const got = parseMove(mapMidlayerConceptual(move as string));

        const resetWithError = async () => {
          setFixErrorPulse(true);
          setTimeout(() => setFixErrorPulse(false), 600);
          setFixIndex(0);
          setFixDoublePartialDir(0);
          setFixShowTick(false);
          // Go back to first sequence on error for second-layer-setup-solution-4 (instant, no delay)
          if (activeSlide?.id === "second-layer-setup-solution-4") {
            setShowSecondSequence(false);
            setSecondSequenceLocked(false);
          }
          // Go back to first sequence on error for yellow-cross-dot (instant, no delay)
          if (activeSlide?.id === "yellow-cross-dot") {
            setShowSecondSequenceDot(false);
            setSecondSequenceDotLocked(false);
          }
          // Go back to first sequence on error for yellow-edges-solution-2 (instant, no delay)
          if (activeSlide?.id === "yellow-edges-solution-2") {
            setShowSecondSequenceYellowEdges2(false);
            setSecondSequenceYellowEdges2Locked(false);
            // Reset yaw change tracking so yaw can change again after reset
            yellowEdges2YawChangedRef.current = false;
          }
          // Reset yaw change tracking for yellow-edges-solution-3 on error
          if (activeSlide?.id === "yellow-edges-solution-3") {
            yellowEdges3YawChangedRef.current = false;
          }
          await resetToSlideBaseline();
        };

        // Case: double move expected
        if (exp.mod === "2") {
          // If we already have a partial quarter for this step
          if (fixDoublePartialDir !== 0) {
            // Expect exactly the same base and same direction as first partial, and not a double
            const expectedDir = fixDoublePartialDir; // 1 for CW (no prime), -1 for CCW (prime)
            const gotDir = got.mod === "'" ? -1 : got.mod === "2" ? 0 : 1;
            if (
              got.base === exp.base &&
              gotDir !== 0 &&
              gotDir === expectedDir
            ) {
              const nextIndex = fixIndex + 1;
              setFixIndex(nextIndex);
              if (
                activeSlide?.id === "midlayer-green-white-extraction" &&
                (nextIndex === 3 || nextIndex === 4 || nextIndex === 5)
              ) {
                animateMidlayerStage(
                  nextIndex === 3 ? 1 : nextIndex === 4 ? 2 : 3
                );
              }
              // Change yaw for slide 8 of white cross (midlayer-green-white-extraction)
              if (
                activeSlide?.id === "midlayer-green-white-extraction" &&
                lessonId === "white-cross"
              ) {
                // After first sequence (R' D' R) completes, reach index 3: change to -45 degrees (45 degrees to the right)
                if (
                  nextIndex === 3 &&
                  slide8WhiteCrossYawStateRef.current === 0
                ) {
                  slide8WhiteCrossYawStateRef.current = 1;
                  if (orbitControlsRef.current && cubeViewRef.current) {
                    const c: any = orbitControlsRef.current;
                    c.__resetOpts = {
                      extraYawRad: (Math.PI / 180) * -45,
                      slideId: activeSlide.id,
                    };
                    cubeViewRef.current.resetToInitialPosition(
                      orbitControlsRef,
                      cubeRef,
                      () => {
                        // Yaw change complete
                      }
                    );
                  }
                }
                // After second sequence (D') completes, reach index 4: change to 0 degrees (same as slides 6 & 7)
                if (
                  nextIndex === 4 &&
                  slide8WhiteCrossYawStateRef.current === 1
                ) {
                  slide8WhiteCrossYawStateRef.current = 2;
                  if (orbitControlsRef.current && cubeViewRef.current) {
                    const c: any = orbitControlsRef.current;
                    c.__resetOpts = {
                      extraYawRad: 0,
                      slideId: activeSlide.id,
                    };
                    cubeViewRef.current.resetToInitialPosition(
                      orbitControlsRef,
                      cubeRef,
                      () => {
                        // Yaw change complete
                      }
                    );
                  }
                }
              }
              // Change yaw for slide 6 (misaligned-green-white) when reaching index 1 (after first D' move at index 0)
              if (
                activeSlide?.id === "misaligned-green-white" &&
                nextIndex === 1 &&
                !slide6YawChangedRef.current
              ) {
                slide6YawChangedRef.current = true;
                // Change to 0 degrees (no yaw change)
                if (orbitControlsRef.current && cubeViewRef.current) {
                  const c: any = orbitControlsRef.current;
                  c.__resetOpts = {
                    extraYawRad: 0,
                    slideId: activeSlide.id,
                  };
                  cubeViewRef.current.resetToInitialPosition(
                    orbitControlsRef,
                    cubeRef,
                    () => {
                      // Yaw change complete
                    }
                  );
                }
              }
              // Change yaw for slide 7 (flipped-misoriented-misaligned-green-white) when reaching index 1 (after first D' move at index 0)
              if (
                activeSlide?.id ===
                  "flipped-misoriented-misaligned-green-white" &&
                nextIndex === 1 &&
                !slide6YawChangedRef.current
              ) {
                slide6YawChangedRef.current = true;
                // Change to 0 degrees (no yaw change)
                if (orbitControlsRef.current && cubeViewRef.current) {
                  const c: any = orbitControlsRef.current;
                  c.__resetOpts = {
                    extraYawRad: 0,
                    slideId: activeSlide.id,
                  };
                  cubeViewRef.current.resetToInitialPosition(
                    orbitControlsRef,
                    cubeRef,
                    () => {
                      // Yaw change complete
                    }
                  );
                }
              }
              if (
                activeSlide?.id === "practice-setup-solution-3" &&
                (nextIndex === 4 || nextIndex === 7)
              ) {
                animateMidlayerStage(nextIndex === 4 ? 1 : 2);
              }
              if (
                activeSlide?.id === "practice-setup-solution-4" &&
                (nextIndex === 4 || nextIndex === 7)
              ) {
                animateMidlayerStage(nextIndex === 4 ? 1 : 2);
              }
              if (
                activeSlide?.id === "practice-setup-solution-5" &&
                (nextIndex === 4 || nextIndex === 8 || nextIndex === 11)
              ) {
                animateMidlayerStage(
                  nextIndex === 4 ? 1 : nextIndex === 8 ? 2 : 3
                );
              }
              if (
                activeSlide?.id === "practice-setup-solution-6" &&
                (nextIndex === 4 || nextIndex === 5 || nextIndex === 8)
              ) {
                animateMidlayerStage(
                  nextIndex === 4 ? 1 : nextIndex === 5 ? 2 : 3
                );
                // Change yaw when reaching index 5 (after U move)
                if (nextIndex === 5 && !slide8YawChangedRef.current) {
                  slide8YawChangedRef.current = true;
                  // Change to match slides 3-7: extraYawRad: 0, extraERotationDeg: -45
                  if (orbitControlsRef.current && cubeViewRef.current) {
                    const c: any = orbitControlsRef.current;
                    c.__resetOpts = {
                      extraYawRad: 0,
                      flipUpsideDown: true,
                      extraERotationDeg: -45,
                      slideId: activeSlide.id,
                    };
                    cubeViewRef.current.resetToInitialPosition(
                      orbitControlsRef,
                      cubeRef,
                      () => {
                        // Yaw change complete
                      }
                    );
                  }
                }
              }
              if (
                activeSlide?.id === "second-layer-setup-solution" &&
                (nextIndex === 5 || nextIndex === 8)
              ) {
                animateMidlayerStage(nextIndex === 5 ? 1 : 2);
              }
              if (
                activeSlide?.id === "second-layer-setup-solution-2" &&
                (nextIndex === 5 || nextIndex === 8)
              ) {
                animateMidlayerStage(nextIndex === 5 ? 1 : 2);
              }
              if (
                activeSlide?.id === "second-layer-setup-solution-4" &&
                (nextIndex === 5 || nextIndex === 8 || nextIndex === 9)
              ) {
                if (nextIndex === 9) {
                  animateMidlayerStage(3);
                  // Show second sequence after parts 1-3 complete (delay handled in useEffect)
                  // Don't set it here - let the useEffect handle it with delay
                } else {
                  animateMidlayerStage(nextIndex === 5 ? 1 : 2);
                }
              }
              if (
                activeSlide?.id === "yellow-cross-dot" &&
                (nextIndex === 6 ||
                  nextIndex === 7 ||
                  nextIndex === 13 ||
                  nextIndex === 19)
              ) {
                animateMidlayerStage(
                  nextIndex === 6
                    ? 1
                    : nextIndex === 7
                    ? 2
                    : nextIndex === 13
                    ? 3
                    : 4
                );
                if (nextIndex === 7) {
                  // Show second sequence after parts 1-2 complete (delay handled in useEffect)
                  // Don't set it here - let the useEffect handle it with delay
                }
              }
              if (
                activeSlide?.id === "yellow-edges-solution-3" &&
                nextIndex === 1
              ) {
                animateMidlayerStage(1);
                // Change yaw from +45 to +135 after first U2 move completes (90 degrees in opposite direction from slide 3)
                if (!yellowEdges3YawChangedRef.current) {
                  yellowEdges3YawChangedRef.current = true;
                  if (orbitControlsRef.current && cubeViewRef.current) {
                    const c: any = orbitControlsRef.current;
                    c.__resetOpts = {
                      extraYawRad: (Math.PI / 180) * 135, // 135 degrees to the right (positive)
                      flipUpsideDown: true,
                      extraERotationDeg: -45,
                      slideId: activeSlide.id,
                    };
                    cubeViewRef.current.resetToInitialPosition(
                      orbitControlsRef,
                      cubeRef,
                      () => {
                        // Yaw change complete
                      }
                    );
                  }
                }
              }
              setFixDoublePartialDir(0);
              if (
                (activeSlide?.id === "flipped-misoriented-green-white" ||
                  activeSlide?.id === "misaligned-green-white") &&
                fixIndex === 0 &&
                !fixFirstTickPlayed
              ) {
                // Animate the small inline tick once
                setFixFirstTickProgress(false);
                setFixFirstTickLine(false);
                // start circle
                setTimeout(() => setFixFirstTickProgress(true), 50);
                // draw check
                setTimeout(() => setFixFirstTickLine(true), 300);
                // mark as played after animation
                setTimeout(() => setFixFirstTickPlayed(true), 700);
              } else if (
                activeSlide?.id ===
                  "flipped-misoriented-misaligned-green-white" &&
                fixIndex === 1 &&
                !fixSecondTickPlayed
              ) {
                // Slide 7: animate second-stage small tick when F2 completes as second step
                setFixSecondTickProgress(false);
                setFixSecondTickLine(false);
                setTimeout(() => setFixSecondTickProgress(true), 50);
                setTimeout(() => setFixSecondTickLine(true), 300);
                setTimeout(() => setFixSecondTickPlayed(true), 700);
              }
              if (fixIndex + 1 >= fixSequence.length) {
                triggerFixTick();
              }
            } else {
              resetWithError();
            }
          } else {
            // No partial yet: accept either the full double or a single quarter in any direction
            if (got.base === exp.base && got.mod === "2") {
              const nextIndex = fixIndex + 1;
              setFixIndex(nextIndex);
              if (
                activeSlide?.id === "midlayer-green-white-extraction" &&
                (nextIndex === 3 || nextIndex === 4 || nextIndex === 5)
              ) {
                animateMidlayerStage(
                  nextIndex === 3 ? 1 : nextIndex === 4 ? 2 : 3
                );
              }
              if (
                activeSlide?.id === "practice-setup-solution-3" &&
                (nextIndex === 4 || nextIndex === 7)
              ) {
                animateMidlayerStage(nextIndex === 4 ? 1 : 2);
              }
              if (
                activeSlide?.id === "practice-setup-solution-4" &&
                (nextIndex === 4 || nextIndex === 7)
              ) {
                animateMidlayerStage(nextIndex === 4 ? 1 : 2);
              }
              if (
                activeSlide?.id === "yellow-cross-triangle" &&
                (nextIndex === 6 || nextIndex === 12)
              ) {
                animateMidlayerStage(nextIndex === 6 ? 1 : 2);
              }
              if (
                activeSlide?.id === "yellow-cross-dot" &&
                (nextIndex === 6 ||
                  nextIndex === 7 ||
                  nextIndex === 13 ||
                  nextIndex === 19)
              ) {
                if (nextIndex === 7) {
                  animateMidlayerStage(2);
                  // Show second sequence after parts 1-2 complete (delay handled in useEffect)
                  // Don't set it here - let the useEffect handle it with delay
                } else {
                  animateMidlayerStage(
                    nextIndex === 6 ? 1 : nextIndex === 13 ? 3 : 4
                  );
                }
              }
              if (
                activeSlide?.id === "practice-setup-solution-5" &&
                (nextIndex === 4 || nextIndex === 8 || nextIndex === 11)
              ) {
                animateMidlayerStage(
                  nextIndex === 4 ? 1 : nextIndex === 8 ? 2 : 3
                );
              }
              if (
                activeSlide?.id === "practice-setup-solution-6" &&
                (nextIndex === 4 || nextIndex === 5 || nextIndex === 8)
              ) {
                animateMidlayerStage(
                  nextIndex === 4 ? 1 : nextIndex === 5 ? 2 : 3
                );
              }
              if (
                activeSlide?.id === "second-layer-setup-solution-3" &&
                (nextIndex === 5 || nextIndex === 8)
              ) {
                animateMidlayerStage(nextIndex === 5 ? 1 : 2);
              }
              if (
                activeSlide?.id === "second-layer-setup-solution-4" &&
                (nextIndex === 5 || nextIndex === 8 || nextIndex === 9)
              ) {
                if (nextIndex === 9) {
                  animateMidlayerStage(3);
                  // Show second sequence after parts 1-3 complete (delay handled in useEffect)
                  // Don't set it here - let the useEffect handle it with delay
                } else {
                  animateMidlayerStage(nextIndex === 5 ? 1 : 2);
                }
              }
              if (
                activeSlide?.id === "second-layer-setup-solution-4" &&
                (nextIndex === 14 || nextIndex === 17)
              ) {
                animateMidlayerStage(nextIndex === 14 ? 4 : 5);
                if (nextIndex === 17) {
                  // Lock second sequence when complete
                  setSecondSequenceLocked(true);
                }
              }
              if (
                activeSlide?.id === "yellow-edges-solution-3" &&
                nextIndex === 1
              ) {
                animateMidlayerStage(1);
                // Change yaw from +45 to +135 after first U2 move completes (90 degrees in opposite direction from slide 3)
                if (!yellowEdges3YawChangedRef.current) {
                  yellowEdges3YawChangedRef.current = true;
                  if (orbitControlsRef.current && cubeViewRef.current) {
                    const c: any = orbitControlsRef.current;
                    c.__resetOpts = {
                      extraYawRad: (Math.PI / 180) * 135, // 135 degrees to the right (positive)
                      flipUpsideDown: true,
                      extraERotationDeg: -45,
                      slideId: activeSlide.id,
                    };
                    cubeViewRef.current.resetToInitialPosition(
                      orbitControlsRef,
                      cubeRef,
                      () => {
                        // Yaw change complete
                      }
                    );
                  }
                }
              }
              setFixDoublePartialDir(0);
              // For steps with two-stage UI (5 and 6), animate the small inline first tick once when the first stage completes via full double
              if (
                (activeSlide?.id === "flipped-misoriented-green-white" ||
                  activeSlide?.id === "misaligned-green-white") &&
                !fixFirstTickPlayed
              ) {
                setFixFirstTickProgress(false);
                setFixFirstTickLine(false);
                setTimeout(() => setFixFirstTickProgress(true), 50);
                setTimeout(() => setFixFirstTickLine(true), 300);
                setTimeout(() => setFixFirstTickPlayed(true), 700);
              } else if (
                activeSlide?.id ===
                  "flipped-misoriented-misaligned-green-white" &&
                nextIndex === 2 &&
                !fixSecondTickPlayed
              ) {
                // Slide 7: second-stage tick when F2 completes as step 2 in one go
                setFixSecondTickProgress(false);
                setFixSecondTickLine(false);
                setTimeout(() => setFixSecondTickProgress(true), 50);
                setTimeout(() => setFixSecondTickLine(true), 300);
                setTimeout(() => setFixSecondTickPlayed(true), 700);
              }
              if (fixIndex + 1 >= fixSequence.length) triggerFixTick();
            } else if (
              got.base === exp.base &&
              (got.mod === "" || got.mod === "'")
            ) {
              const dir = got.mod === "'" ? -1 : 1;
              setFixDoublePartialDir(dir);
            } else {
              resetWithError();
            }
          }
        } else {
          // Single quarter expected: must match exactly
          if (eqMove(mapMidlayerConceptual(move as string), expected)) {
            const next = fixIndex + 1;
            setFixIndex(next);
            if (
              activeSlide?.id === "midlayer-green-white-extraction" &&
              (next === 3 || next === 4 || next === 5)
            ) {
              animateMidlayerStage(next === 3 ? 1 : next === 4 ? 2 : 3);
            }
            // Change yaw for slide 8 of white cross (midlayer-green-white-extraction)
            if (
              activeSlide?.id === "midlayer-green-white-extraction" &&
              lessonId === "white-cross"
            ) {
              // After first sequence (R' D' R) completes, reach index 3: change to -45 degrees (45 degrees to the right)
              if (next === 3 && slide8WhiteCrossYawStateRef.current === 0) {
                slide8WhiteCrossYawStateRef.current = 1;
                if (orbitControlsRef.current && cubeViewRef.current) {
                  const c: any = orbitControlsRef.current;
                  c.__resetOpts = {
                    extraYawRad: (Math.PI / 180) * -45,
                    slideId: activeSlide.id,
                  };
                  cubeViewRef.current.resetToInitialPosition(
                    orbitControlsRef,
                    cubeRef,
                    () => {
                      // Yaw change complete
                    }
                  );
                }
              }
              // After second sequence (D') completes, reach index 4: change to 0 degrees (same as slides 6 & 7)
              if (next === 4 && slide8WhiteCrossYawStateRef.current === 1) {
                slide8WhiteCrossYawStateRef.current = 2;
                if (orbitControlsRef.current && cubeViewRef.current) {
                  const c: any = orbitControlsRef.current;
                  c.__resetOpts = {
                    extraYawRad: 0,
                    slideId: activeSlide.id,
                  };
                  cubeViewRef.current.resetToInitialPosition(
                    orbitControlsRef,
                    cubeRef,
                    () => {
                      // Yaw change complete
                    }
                  );
                }
              }
            }
            // Change yaw for slide 6 (misaligned-green-white) when reaching index 1 (after first D' move at index 0)
            if (
              activeSlide?.id === "misaligned-green-white" &&
              next === 1 &&
              !slide6YawChangedRef.current
            ) {
              slide6YawChangedRef.current = true;
              // Change to 0 degrees (no yaw change)
              if (orbitControlsRef.current && cubeViewRef.current) {
                const c: any = orbitControlsRef.current;
                c.__resetOpts = {
                  extraYawRad: 0,
                  slideId: activeSlide.id,
                };
                cubeViewRef.current.resetToInitialPosition(
                  orbitControlsRef,
                  cubeRef,
                  () => {
                    // Yaw change complete
                  }
                );
              }
            }
            // Change yaw for slide 7 (flipped-misoriented-misaligned-green-white) when reaching index 1 (after first D' move at index 0)
            if (
              activeSlide?.id ===
                "flipped-misoriented-misaligned-green-white" &&
              next === 1 &&
              !slide6YawChangedRef.current
            ) {
              slide6YawChangedRef.current = true;
              // Change to 0 degrees (no yaw change)
              if (orbitControlsRef.current && cubeViewRef.current) {
                const c: any = orbitControlsRef.current;
                c.__resetOpts = {
                  extraYawRad: 0,
                  slideId: activeSlide.id,
                };
                cubeViewRef.current.resetToInitialPosition(
                  orbitControlsRef,
                  cubeRef,
                  () => {
                    // Yaw change complete
                  }
                );
              }
            }
            if (
              activeSlide?.id === "practice-setup-solution-3" &&
              (next === 4 || next === 7)
            ) {
              animateMidlayerStage(next === 4 ? 1 : 2);
            }
            if (
              activeSlide?.id === "practice-setup-solution-4" &&
              (next === 4 || next === 7)
            ) {
              animateMidlayerStage(next === 4 ? 1 : 2);
            }
            if (
              activeSlide?.id === "yellow-cross-triangle" &&
              (next === 6 || next === 12)
            ) {
              animateMidlayerStage(next === 6 ? 1 : 2);
            }
            if (activeSlide?.id === "yellow-edges-solution-3" && next === 1) {
              animateMidlayerStage(1);
              // Change yaw from +45 to +135 after first U2 move completes (90 degrees in opposite direction from slide 3)
              if (!yellowEdges3YawChangedRef.current) {
                yellowEdges3YawChangedRef.current = true;
                if (orbitControlsRef.current && cubeViewRef.current) {
                  const c: any = orbitControlsRef.current;
                  c.__resetOpts = {
                    extraYawRad: (Math.PI / 180) * 135, // 135 degrees to the right (positive)
                    flipUpsideDown: true,
                    extraERotationDeg: -45,
                    slideId: activeSlide.id,
                  };
                  cubeViewRef.current.resetToInitialPosition(
                    orbitControlsRef,
                    cubeRef,
                    () => {
                      // Yaw change complete
                    }
                  );
                }
              }
            }
            if (
              activeSlide?.id === "practice-setup-solution-5" &&
              (next === 4 || next === 8 || next === 11)
            ) {
              animateMidlayerStage(next === 4 ? 1 : next === 8 ? 2 : 3);
            }
            if (
              activeSlide?.id === "second-layer-setup-solution-3" &&
              (next === 5 || next === 8)
            ) {
              animateMidlayerStage(next === 5 ? 1 : 2);
            }
            if (
              activeSlide?.id === "second-layer-setup-solution-4" &&
              (next === 5 || next === 8 || next === 9)
            ) {
              animateMidlayerStage(next === 5 ? 1 : next === 8 ? 2 : 3);
            }
            if (
              activeSlide?.id === "yellow-edges-solution-2" &&
              (next === 1 || next === 9)
            ) {
              animateMidlayerStage(next === 1 ? 1 : 2);
              // Change yaw from +45 to -45 after first U move completes
              if (next === 1 && !yellowEdges2YawChangedRef.current) {
                yellowEdges2YawChangedRef.current = true;
                if (orbitControlsRef.current && cubeViewRef.current) {
                  const c: any = orbitControlsRef.current;
                  c.__resetOpts = {
                    extraYawRad: (Math.PI / 180) * -45, // 45 degrees to the left (negative)
                    flipUpsideDown: true,
                    extraERotationDeg: -45,
                    slideId: activeSlide.id,
                  };
                  cubeViewRef.current.resetToInitialPosition(
                    orbitControlsRef,
                    cubeRef,
                    () => {
                      // Yaw change complete
                    }
                  );
                }
              }
              if (next === 9) {
                // Lock second sequence when complete (but we don't use progressive reveal anymore)
                // This is kept for consistency but not actually used
                setSecondSequenceYellowEdges2Locked(true);
              }
            }
            if (activeSlide?.id === "yellow-edges-solution-3" && next === 9) {
              // Second part completes (single moves), animate second tick
              animateMidlayerStage(2);
            }
            if (
              activeSlide?.id === "second-layer-setup-solution-4" &&
              (next === 14 || next === 17)
            ) {
              animateMidlayerStage(next === 14 ? 4 : 5);
              if (next === 17) {
                // Lock second sequence when complete
                setSecondSequenceLocked(true);
              }
            }
            if (
              activeSlide?.id === "yellow-cross-dot" &&
              (next === 6 || next === 7 || next === 13 || next === 19)
            ) {
              animateMidlayerStage(
                next === 6 ? 1 : next === 7 ? 2 : next === 13 ? 3 : 4
              );
              if (next === 19) {
                // Lock second sequence when complete
                setSecondSequenceDotLocked(true);
              }
            }
            if (
              activeSlide?.id === "practice-setup-solution-6" &&
              (next === 4 || next === 5 || next === 8)
            ) {
              animateMidlayerStage(next === 4 ? 1 : next === 5 ? 2 : 3);
              // Change yaw when reaching index 5 (after U move)
              if (next === 5 && !slide8YawChangedRef.current) {
                slide8YawChangedRef.current = true;
                // Change to match slides 3-7: extraYawRad: 0, extraERotationDeg: -45
                if (orbitControlsRef.current && cubeViewRef.current) {
                  const c: any = orbitControlsRef.current;
                  c.__resetOpts = {
                    extraYawRad: 0,
                    flipUpsideDown: true,
                    extraERotationDeg: -45,
                    slideId: activeSlide.id,
                  };
                  cubeViewRef.current.resetToInitialPosition(
                    orbitControlsRef,
                    cubeRef,
                    () => {
                      // Yaw change complete
                    }
                  );
                }
              }
            }
            if (
              activeSlide?.id === "second-layer-setup-solution" &&
              (next === 5 || next === 8)
            ) {
              animateMidlayerStage(next === 5 ? 1 : 2);
            }
            if (
              activeSlide?.id === "second-layer-setup-solution-2" &&
              (next === 5 || next === 8)
            ) {
              animateMidlayerStage(next === 5 ? 1 : 2);
            }
            setFixDoublePartialDir(0);
            if (
              (activeSlide?.id === "flipped-misoriented-green-white" ||
                activeSlide?.id === "misaligned-green-white" ||
                activeSlide?.id ===
                  "flipped-misoriented-misaligned-green-white") &&
              next === 1 && // after completing first stage (D')
              !fixFirstTickPlayed
            ) {
              setFixFirstTickProgress(false);
              setFixFirstTickLine(false);
              setTimeout(() => setFixFirstTickProgress(true), 50);
              setTimeout(() => setFixFirstTickLine(true), 300);
              setTimeout(() => setFixFirstTickPlayed(true), 700);
            }
            if (next >= fixSequence.length) triggerFixTick();
          } else {
            resetWithError();
          }
        }
      }
    },
    [
      resetQueue,
      fixSequence,
      fixIndex,
      fixDoublePartialDir,
      resetToSlideBaseline,
      activeSlide?.id,
      activeSlide,
      lessonId,
      triggerFixTick,
      midStage1Played,
      midStage2Played,
      midStage3Played,
      handleOrbitControlsChange,
    ]
  );

  // Midlayer staged tick effect removed; handled inline in move handler

  // Helper: is cube solved
  const isSolved = useCallback(() => cubeRef.current.isSolved(), [cube3D]);

  // Helper: check if white cross is solved (proper detection)
  const isWhiteCrossSolved = useCallback(() => {
    return checkWhiteCrossSolved(cube3D);
  }, [cube3D]);

  // Helper: check if white corners are solved (proper detection)
  const isWhiteCornersSolved = useCallback(() => {
    return checkWhiteCornersSolved(cube3D);
  }, [cube3D]);

  // Helper: check if second layer is solved (proper detection)
  const isSecondLayerSolved = useCallback(() => {
    return checkSecondLayerSolved(cube3D);
  }, [cube3D]);

  // Monitor practice slide completion
  useEffect(() => {
    const isPracticeSlide =
      activeSlide?.id === "practice-two-edges" ||
      activeSlide?.id === "practice-three-edges" ||
      activeSlide?.id === "practice-full-cross" ||
      activeSlide?.id === "practice-white-corners" ||
      activeSlide?.id === "practice-white-corners-2" ||
      activeSlide?.id === "practice-white-corners-3" ||
      activeSlide?.id === "practice-second-layer" ||
      activeSlide?.id === "practice-second-layer-2" ||
      activeSlide?.id === "practice-second-layer-3";
    if (!isPracticeSlide) return;
    if (!practiceSetupComplete) return; // Wait for setup to complete

    const isWhiteCornersPractice =
      activeSlide?.id === "practice-white-corners" ||
      activeSlide?.id === "practice-white-corners-2" ||
      activeSlide?.id === "practice-white-corners-3";
    const isSecondLayerPractice =
      activeSlide?.id === "practice-second-layer" ||
      activeSlide?.id === "practice-second-layer-2" ||
      activeSlide?.id === "practice-second-layer-3";

    const crossSolved = isWhiteCrossSolved();
    const cornersSolved = isWhiteCornersSolved();
    const secondLayerSolved = isSecondLayerSolved();

    const isSolved = isWhiteCornersPractice
      ? crossSolved && cornersSolved
      : isSecondLayerPractice
      ? secondLayerSolved
      : crossSolved;

    // Record the initial state after setup
    if (practiceInitialCrossState === null) {
      setPracticeInitialCrossState(isSolved);
      return; // Don't process completion on initial state
    }

    // Only mark as completed if:
    // 1. Both cross and corners are solved (for practice-white-corners) or just cross (for others) AND
    // 2. Either it wasn't initially solved, OR the user has made moves (indicating active solving)
    if (isSolved && !practiceCompleted) {
      if (!practiceInitialCrossState || moveHistory.length > 0) {
        setPracticeCompleted(true);
        setPracticeShowTick(true);
        setPracticeTickAnimKey((k) => k + 1);

        // Animate the tick
        setPracticeTickProgress(false);
        setPracticeTickLine(false);
        setTimeout(() => setPracticeTickProgress(true), 50);
        setTimeout(() => setPracticeTickLine(true), 300);
      }
    }
  }, [
    activeSlide?.id,
    cube3D,
    isWhiteCrossSolved,
    isWhiteCornersSolved,
    isSecondLayerSolved,
    practiceCompleted,
    practiceSetupComplete,
    practiceInitialCrossState,
    moveHistory.length,
  ]);

  // Removed old findGreenWhiteEdgeIndex; now we highlight all four white edges instead
  // Helper functions moved to utils/tutorialHelpers.ts

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
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <Button onClick={onBack} className="text-blue-600 hover:text-blue-800">
          ← Back to Lessons
        </Button>
        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        <Button
          onClick={() => setShowLessonContent(!showLessonContent)}
          className="text-blue-600 hover:text-blue-800 md:hidden"
        >
          {showLessonContent ? "Hide" : "Help"}
        </Button>
        <div className="w-20 hidden md:block"></div>{" "}
        {/* Spacer for center alignment */}
      </div>

      {/* Main content */}
      <div
        className={`flex flex-1 min-h-0 ${
          activeSlide?.id === "recap-mental-model" ||
          activeSlide?.id === "recap-white-corners" ||
          activeSlide?.id === "second-layer-recap" ||
          activeSlide?.id === "yellow-cross-states"
            ? "h-[100dvh] overflow-hidden"
            : "overflow-hidden"
        }`}
      >
        {/* Lesson content sidebar - responsive (hidden on recap slide) */}
        {activeSlide?.id !== "recap-mental-model" &&
          activeSlide?.id !== "recap-white-corners" &&
          activeSlide?.id !== "second-layer-recap" && (
            <div
              className={`${
                showLessonContent ? "block" : "hidden"
              } md:block w-full md:w-80 bg-gray-50 border-r overflow-y-auto ${
                showLessonContent ? "absolute md:relative z-10 h-full" : ""
              }`}
            >
              <LessonContent lessonId={lessonId} />
            </div>
          )}

        {/* Viewer area: always render the cube, recap overlay on top when needed */}
        <div className="flex-1 relative min-h-0">
          <div className="relative w-full h-full">
            {/* Background cube - always rendered */}
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
                  className="w-full h-full"
                  style={{ background: "transparent", touchAction: "none" }}
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
                    if (isTouchDevice) setInteractiveDpr();
                    const isPracticeSlide =
                      activeSlide?.id === "practice-two-edges" ||
                      activeSlide?.id === "practice-three-edges" ||
                      activeSlide?.id === "practice-full-cross" ||
                      activeSlide?.id === "practice-white-corners" ||
                      activeSlide?.id === "practice-white-corners-2" ||
                      activeSlide?.id === "practice-white-corners-3" ||
                      activeSlide?.id === "practice-second-layer" ||
                      activeSlide?.id === "practice-second-layer-2" ||
                      activeSlide?.id === "practice-second-layer-3";
                    const isRecapSlide =
                      activeSlide?.id === "recap-mental-model" ||
                      activeSlide?.id === "recap-white-corners" ||
                      activeSlide?.id === "second-layer-recap" ||
                      activeSlide?.id === "yellow-cross-states";
                    const dragAllowed =
                      !!activeSlide?.allowFaceMoves &&
                      !(isPracticeSlide && practiceCompleted) &&
                      !fixCompleted &&
                      !isRecapSlide;
                    if (dragAllowed) {
                      cubeViewRef.current?.handlePointerDown(e);
                    }
                  }}
                  onPointerMoveCapture={() => {
                    if (isTouchDevice) setInteractiveDpr();
                  }}
                  onPointerUpCapture={() => {
                    if (isTouchDevice) setInteractiveDpr();
                    cubeViewRef.current?.handlePointerUp?.();
                  }}
                >
                  <PerformanceMonitor
                    onDecline={onDecline}
                    onIncline={onIncline}
                  />
                  <spotLight
                    position={[-30, 20, 60]}
                    intensity={0.3}
                    castShadow
                  />
                  <ambientLight
                    intensity={
                      activeSlide?.id === "recap-mental-model" ||
                      activeSlide?.id === "recap-white-corners" ||
                      activeSlide?.id === "second-layer-recap" ||
                      activeSlide?.id === "yellow-cross-states"
                        ? 0.95
                        : 1.1
                    }
                    color={CUBE_COLORS.WHITE}
                  />
                  <TrackballControls
                    ref={orbitControlsRef}
                    enabled={orbitControlsEnabled}
                    noRotate={(() => {
                      const isRecapSlide =
                        activeSlide?.id === "recap-mental-model" ||
                        activeSlide?.id === "recap-white-corners" ||
                        activeSlide?.id === "second-layer-recap" ||
                        activeSlide?.id === "yellow-cross-states";
                      return isRecapSlide ? true : !orbitControlsEnabled;
                    })()}
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
                    touchCount={touchCount}
                    pendingMove={pendingMove}
                    onMoveAnimationDone={handleMoveAnimationDone}
                    onStartAnimation={handleStartAnimation}
                    isAnimating={isAnimating}
                    onOrbitControlsChange={handlePracticeOrbitChange}
                    onDragMove={handleButtonMove}
                    isTimerMode={false}
                    moveSource={lastMoveSourceRef.current}
                    queueFast={queueFast}
                    queueFastMs={queueFastMs}
                    inputDisabled={(() => {
                      // Recap slides: always disabled
                      if (
                        activeSlide?.id === "recap-mental-model" ||
                        activeSlide?.id === "recap-white-corners" ||
                        activeSlide?.id === "second-layer-recap" ||
                        activeSlide?.id === "yellow-cross-states"
                      ) {
                        return true;
                      }
                      // Practice slides when completed: disable moves
                      const isPracticeSlide =
                        activeSlide?.id === "practice-two-edges" ||
                        activeSlide?.id === "practice-three-edges" ||
                        activeSlide?.id === "practice-full-cross" ||
                        activeSlide?.id === "practice-white-corners" ||
                        activeSlide?.id === "practice-white-corners-2" ||
                        activeSlide?.id === "practice-white-corners-3" ||
                        activeSlide?.id === "practice-second-layer" ||
                        activeSlide?.id === "practice-second-layer-2" ||
                        activeSlide?.id === "practice-second-layer-3";
                      if (isPracticeSlide && practiceCompleted) {
                        return true;
                      }
                      // Otherwise use the state value
                      return inputDisabled || isTransitioningRef.current;
                    })()}
                    disableSliceDrag={
                      activeSlide?.id === "recap-mental-model" ||
                      activeSlide?.id === "recap-white-corners" ||
                      activeSlide?.id === "second-layer-recap" ||
                      activeSlide?.id === "yellow-cross-states"
                        ? true
                        : activeSlide?.id === "intro" ||
                          activeSlide?.id === "mechanical-approach" ||
                          activeSlide?.id === "find-green-white" ||
                          fixCompleted ||
                          ((activeSlide?.id === "practice-two-edges" ||
                            activeSlide?.id === "practice-three-edges" ||
                            activeSlide?.id === "practice-full-cross" ||
                            activeSlide?.id === "practice-white-corners" ||
                            activeSlide?.id === "practice-white-corners-2" ||
                            activeSlide?.id === "practice-white-corners-3" ||
                            activeSlide?.id === "practice-second-layer" ||
                            activeSlide?.id === "practice-second-layer-2" ||
                            activeSlide?.id === "practice-second-layer-3") &&
                            practiceCompleted)
                    }
                    preventSliceMoves={
                      activeSlide?.id === "recap-mental-model" ||
                      activeSlide?.id === "recap-white-corners" ||
                      activeSlide?.id === "second-layer-recap" ||
                      activeSlide?.id === "yellow-cross-states"
                        ? true
                        : !activeSlide?.allowFaceMoves ||
                          activeSlide?.id === "mechanical-approach" ||
                          ((activeSlide?.id === "practice-two-edges" ||
                            activeSlide?.id === "practice-three-edges" ||
                            activeSlide?.id === "practice-full-cross" ||
                            activeSlide?.id === "practice-white-corners" ||
                            activeSlide?.id === "practice-white-corners-2" ||
                            activeSlide?.id === "practice-white-corners-3" ||
                            activeSlide?.id === "practice-second-layer" ||
                            activeSlide?.id === "practice-second-layer-2" ||
                            activeSlide?.id === "practice-second-layer-3") &&
                            practiceCompleted)
                    }
                    highlightIntensity={(() => {
                      const ids = new Set([
                        "flip-green-white",
                        "flip-green-white-f2",
                        "misaligned-green-white",
                        "flipped-misoriented-green-white",
                        "flipped-misoriented-misaligned-green-white",
                        "midlayer-green-white-extraction",
                        "practice-two-edges",
                      ]);
                      return activeSlide?.id && ids.has(activeSlide.id) ? 1 : 0;
                    })()}
                    highlightPositions={(() => {
                      // For white corners mechanical-approach: mark white/green/red corner (to keep it undimmed)
                      if (
                        activeSlide?.id === "mechanical-approach" &&
                        lessonId === "white-corners"
                      ) {
                        const pos = findWhiteGreenRedCorner(tutorialCube3D);
                        return pos ? [pos] : [];
                      }
                      // For second layer mechanical-approach: mark red/green edge (to keep it undimmed)
                      if (
                        activeSlide?.id === "mechanical-approach" &&
                        lessonId === "second-layer"
                      ) {
                        const pos = findRedGreenSecondLayerEdge(tutorialCube3D);
                        return pos ? [pos] : [];
                      }
                      // For white cross find-green-white: mark green/white edge (to keep it undimmed)
                      if (
                        activeSlide?.id === "find-green-white" &&
                        lessonId === "white-cross"
                      ) {
                        const pos = findGreenWhiteEdge(tutorialCube3D);
                        return pos ? [pos] : [];
                      }
                      return undefined;
                    })()}
                    dullOthersIntensity={(() => {
                      // Dim visible (non-highlighted) pieces for mechanical-approach slides
                      // The target piece will remain undimmed because it's in highlightPositions
                      if (
                        activeSlide?.id === "mechanical-approach" &&
                        (lessonId === "white-corners" ||
                          lessonId === "second-layer")
                      ) {
                        return 0.75; // Increased from 0.5 to 0.75 for darker dimming
                      }
                      // Dim visible (non-highlighted) pieces for find-green-white slide in white cross
                      // The target piece will remain undimmed because it's in highlightPositions
                      if (
                        activeSlide?.id === "find-green-white" &&
                        lessonId === "white-cross"
                      ) {
                        return 0.75; // Same dimming intensity as mechanical-approach slides
                      }
                      return 0;
                    })()}
                    pieceChildren={yellowEdgePieceChildren}
                  />
                </Canvas>
              </div>
            </div>

            {/* Status indicator for practice slides */}
            {(activeSlide?.id === "practice-two-edges" ||
              activeSlide?.id === "practice-three-edges" ||
              activeSlide?.id === "practice-full-cross" ||
              activeSlide?.id === "practice-white-corners" ||
              activeSlide?.id === "practice-white-corners-2" ||
              activeSlide?.id === "practice-white-corners-3" ||
              activeSlide?.id === "practice-second-layer" ||
              activeSlide?.id === "practice-second-layer-2" ||
              activeSlide?.id === "practice-second-layer-3") && (
              <PracticeStatusIndicator
                isSolved={practiceCompleted}
                showTick={practiceShowTick}
                tickAnimKey={practiceTickAnimKey}
                tickProgress={practiceTickProgress}
                tickLine={practiceTickLine}
              />
            )}

            {/* Scrollable recap overlay - positioned absolutely on top when needed */}
            {(activeSlide?.id === "recap-mental-model" ||
              activeSlide?.id === "recap-white-corners" ||
              activeSlide?.id === "second-layer-recap") && (
              <div className="absolute inset-0 z-30 overflow-y-auto">
                <div className="max-w-3xl mx-auto p-5 md:p-8 pb-[calc(env(safe-area-inset-bottom,0px)+96px)] md:pb-[calc(env(safe-area-inset-bottom,0px)+112px)] text-gray-800 bg-white/95 backdrop-blur">
                  {activeSlide?.id === "recap-mental-model" ? (
                    <>
                      <div className="mb-2">
                        <span className="block text-lg md:text-xl font-bold uppercase tracking-wide text-blue-600 mb-2">
                          QUICK RECAP – Green/White Edge
                        </span>
                        <p className="text-sm md:text-base text-gray-700 mb-4">
                          You may have already noticed that some cases in
                          previous slides can be solved in fewer moves, but
                          shortcuts aren’t the focus here. The key idea is
                          simple: remove from incorrect middle/top layer (if
                          necessary), align the edge with green, place it
                          between the green and white center pieces, and then
                          fix its orientation if needed. We use this method
                          because it’s easier to remember and helps keep the
                          other correctly placed white edge pieces in position.
                        </p>
                      </div>

                      <p className="text-sm md:text-base font-semibold mb-2">
                        Steps:
                      </p>
                      <ul className="list-decimal pl-6 space-y-2 text-sm md:text-base leading-relaxed">
                        <li>
                          <strong>Extract (if stuck):</strong> If the
                          green/white edge is trapped in the middle layer or
                          sitting in the top layer but not above the green
                          center, first free it. Use <code>R' D' R</code> to
                          pull it out of the middle layer into the top layer. If
                          it’s already on the right face of the top layer but
                          over the wrong center, do
                          <code> R2</code> (optionally followed by a{" "}
                          <code>U</code>/<code>U'</code> turn) so you can
                          realign it in front.
                        </li>
                        <li>
                          <strong>Align:</strong> Rotate <code>D</code> until
                          the green/white edge is under the green center.
                        </li>
                        <li>
                          <strong>Place:</strong> Do <code>F2</code> to move it
                          between the green and white centers.
                        </li>
                        <li>
                          <strong>Flip (if needed):</strong> If white isn’t
                          facing the white center, repeat <code>F U’ R U</code>{" "}
                          until it is.
                        </li>
                      </ul>

                      <p className="mt-4 text-sm md:text-base text-gray-700">
                        <strong>Why it works:</strong> The quick extraction puts
                        the edge into a predictable top-layer position so every
                        case funnels into the same simple flow. Aligning under
                        green standardizes setup. <code>F2</code> solves upside-
                        down edges immediately. <code>F U' R U</code> then flips
                        any sideways edge without disturbing solved white pieces
                        because the working slot is reused and restored each
                        time.
                      </p>
                    </>
                  ) : activeSlide?.id === "recap-white-corners" ? (
                    <>
                      <div className="mb-2">
                        <span className="block text-lg md:text-xl font-bold uppercase tracking-wide text-blue-600 mb-2">
                          QUICK RECAP – White Corners
                        </span>
                        <p className="text-sm md:text-base text-gray-700 mb-4">
                          Now that you've learned the algorithms for solving
                          white corners, let's summarize what we've covered.
                          Working from white on the bottom, we use the yellow
                          layer to find corner pieces and insert them correctly.
                          The key is recognizing different scenarios and
                          applying the right algorithm for each case.
                        </p>
                      </div>

                      <p className="text-sm md:text-base font-semibold mb-2">
                        Algorithms and their purposes:
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-sm md:text-base leading-relaxed mb-4">
                        <li>
                          <strong>
                            <code>R U R'</code> (Slide 3):
                          </strong>{" "}
                          Inserts a corner piece that's in the top layer with
                          the white sticker facing right. Used when the corner
                          is matched with the red and green centers, with red
                          facing front.
                        </li>
                        <li>
                          <strong>
                            <code>L' U' L</code> (Slide 4):
                          </strong>{" "}
                          Inserts a corner piece that's in the top layer with
                          the white sticker facing up. Used when the corner is
                          matched with the green and red centers, with green
                          facing front.
                        </li>
                        <li>
                          <strong>
                            <code>R U2 R' U'</code> (Slide 5, Part 1):
                          </strong>{" "}
                          Flips a corner piece when the white sticker is facing
                          up. This brings it into a position where it can be
                          inserted using the basic insertion algorithm.
                        </li>
                        <li>
                          <strong>
                            <code>R U R' U'</code> (Slide 4, Slide 6, Slide 7):
                          </strong>{" "}
                          Removes a corner piece from the bottom layer and
                          brings it to the top layer. When repeated twice, it
                          solves a corner that's in the correct position but
                          incorrectly oriented.
                        </li>
                        <li>
                          <strong>
                            <code>R U R'</code> (Slide 5, Part 2; Slide 6, Part
                            2; Slide 7, Part 3):
                          </strong>{" "}
                          Inserts the corner piece after it's been brought to
                          the correct position. This is the basic insertion
                          algorithm used after positioning.
                        </li>
                      </ul>

                      <p className="mt-4 text-sm md:text-base text-gray-700 mb-4">
                        <strong>Summary:</strong> The approach is systematic:
                        find a white corner in the yellow layer, position it
                        above its target corner using U moves, then insert it
                        using either <code>R U R'</code> or <code>L' U' L</code>{" "}
                        depending on the orientation. If a corner is already in
                        place but wrong orientation, use <code>R U R' U'</code>{" "}
                        twice to remove and reinsert it correctly. For corners
                        with white facing up, first flip them with{" "}
                        <code>R U2 R' U'</code>, then insert. The pattern is
                        consistent: bring the corner to the top layer, align it,
                        then insert it into its correct position.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="mb-2">
                        <span className="block text-lg md:text-xl font-bold uppercase tracking-wide text-blue-600 mb-2">
                          QUICK RECAP – Second Layer
                        </span>
                        <p className="text-sm md:text-base text-gray-700 mb-4">
                          Now that you've learned the algorithms for solving the
                          second layer, let's summarize what we've covered. The
                          second layer involves inserting edge pieces that don't
                          have yellow stickers into their correct positions
                          between the white face and the yellow layer. You have
                          two key algorithms at your disposal, each with two
                          parts depending on which side of the target slot
                          you're working from.
                        </p>
                      </div>

                      <p className="text-sm md:text-base font-semibold mb-2">
                        Algorithms and their purposes:
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-sm md:text-base leading-relaxed mb-4">
                        <li>
                          <strong>Left Insertion Algorithm:</strong>{" "}
                          <code>U' L' U' L U</code> (on the right hand of the
                          target corner) / <code>R U R'</code> (on the left hand
                          of the target corner). This algorithm inserts an edge
                          piece that needs to go into the left side of its slot.
                          Use this when the edge piece's top color aligns with
                          the left-hand center color of the target slot.
                        </li>
                        <li>
                          <strong>Right Insertion Algorithm:</strong>{" "}
                          <code>U R U R' U'</code> (on the left hand of the
                          target corner) / <code>L' U' L</code> (on the right
                          hand of the target corner). This algorithm inserts an
                          edge piece that needs to go into the right side of its
                          slot. Use this when the edge piece's top color aligns
                          with the right-hand center color of the target slot.
                        </li>
                      </ul>

                      <p className="mt-4 text-sm md:text-base text-gray-700 mb-4">
                        <strong>Summary:</strong> The approach is systematic:
                        find a second layer edge piece (one without yellow) in
                        the yellow layer, align its top color with the matching
                        center color, determine whether it needs to go into the
                        left or right side of its slot, then use the appropriate
                        insertion algorithm. These algorithms are versatile -
                        you can use them to both remove misplaced edge pieces
                        from the second layer and insert new pieces into their
                        correct positions. If a piece is already in the correct
                        position but incorrectly oriented, use the right
                        insertion algorithm to swap it with a yellow-faced edge,
                        then reinsert it correctly.
                      </p>
                    </>
                  )}
                </div>
                {/* Recap slide fixed footer via portal for robust mobile behavior */}
                {typeof document !== "undefined"
                  ? createPortal(
                      <div
                        className="fixed inset-x-0 bottom-0 w-full bg-white/95 backdrop-blur border-t shadow-inner z-[999] pointer-events-auto"
                        style={{
                          paddingBottom: "env(safe-area-inset-bottom, 0px)",
                        }}
                      >
                        <div className="max-w-screen-2xl mx-auto px-3 md:px-6 py-3 md:py-4">
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              onClick={() =>
                                setCurrentSlide(Math.max(0, currentSlide - 1))
                              }
                              disabled={currentSlide === 0}
                              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:hover:text-gray-400"
                            >
                              Prev
                            </Button>
                            <Button
                              onClick={() =>
                                setCurrentSlide(
                                  Math.min(slides.length - 1, currentSlide + 1)
                                )
                              }
                              disabled={currentSlide >= slides.length - 1}
                              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:hover:text-gray-400"
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      </div>,
                      document.body
                    )
                  : null}
              </div>
            )}

            {/* Yellow Cross states grid overlay - 2x2 grid of cubes */}
            {activeSlide?.id === "yellow-cross-states" && (
              <div className="absolute inset-0 z-30 flex items-stretch justify-center p-8">
                <div className="w-full max-w-4xl bg-white/95 backdrop-blur rounded-lg shadow-xl p-6 md:p-8 flex flex-col">
                  <div className="grid grid-cols-2 grid-rows-2 gap-6 flex-1">
                    {/* Top row */}
                    <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg border-2 border-gray-300">
                      <div className="text-lg font-semibold text-gray-700 mb-2">
                        Cross
                      </div>
                      <div className="text-sm text-gray-500">Placeholder</div>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg border-2 border-gray-300">
                      <div className="text-lg font-semibold text-gray-700 mb-2">
                        Line
                      </div>
                      <div className="text-sm text-gray-500">Placeholder</div>
                    </div>
                    {/* Bottom row */}
                    <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg border-2 border-gray-300">
                      <div className="text-lg font-semibold text-gray-700 mb-2">
                        Triangle
                      </div>
                      <div className="text-sm text-gray-500">Placeholder</div>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg border-2 border-gray-300">
                      <div className="text-lg font-semibold text-gray-700 mb-2">
                        Dot
                      </div>
                      <div className="text-sm text-gray-500">Placeholder</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Overlay controls anchored to cube view corners - only for non-recap slides */}
            {activeSlide?.id !== "recap-mental-model" &&
              activeSlide?.id !== "recap-white-corners" &&
              activeSlide?.id !== "second-layer-recap" &&
              activeSlide?.id !== "yellow-cross-states" && (
                <div className="pointer-events-none absolute inset-0">
                  {/* Hard lock overlay removed for find-green-white to allow orbit */}
                  {/* Undo/Redo removed for tutorial */}
                  {/* Reset or Re-position button - Logic: Notation=all Reset, Other lessons=slides 1&2 Re-position, rest Reset */}
                  {(() => {
                    // All notation slides get Reset
                    // For other lessons: slides 1 & 2 (index 0 & 1) get Re-position, rest get Reset
                    // Exception: yellow-edges slide 2 (yellow-edges-solution) gets Reset
                    const shouldShowReset =
                      lessonId === "notation" ||
                      activeSlide?.id === "yellow-edges-solution" ||
                      currentSlide >= 2;
                    const shouldShowReposition = !shouldShowReset;

                    return shouldShowReset ? (
                      <div className="absolute bottom-4 left-2 md:left-4 z-30 pointer-events-auto">
                        <button
                          onClick={async () => {
                            await resetToSlideBaseline();
                          }}
                          className="px-3 md:px-4 py-2 bg-orange-500 text-white rounded shadow hover:bg-orange-600 transition-all text-xs md:text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Reset cube to solved state"
                          disabled={isAnimating || isResetting}
                        >
                          {isResetting ? (
                            <span className="w-4 h-4 mr-2 border-2 border-gray-200 border-t-2 border-t-white rounded-full animate-spin"></span>
                          ) : null}
                          Reset
                        </button>
                      </div>
                    ) : shouldShowReposition ? (
                      <div className="absolute bottom-4 left-2 md:left-4 z-30 pointer-events-auto">
                        <button
                          onClick={() => {
                            const c: any = orbitControlsRef.current;
                            if (!c) return;
                            c.__resetOpts = getSlideCameraConfig(
                              activeSlide?.id,
                              lessonId
                            );
                            cubeViewRef.current?.resetToInitialPosition(
                              orbitControlsRef,
                              cubeRef,
                              undefined,
                              false
                            );
                          }}
                          className="px-3 md:px-4 py-2 bg-gray-500 text-white rounded shadow hover:bg-gray-600 transition-all text-xs md:text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Re-position cube"
                          disabled={isAnimating}
                        >
                          Re-position
                        </button>
                      </div>
                    ) : null;
                  })()}
                  {/* Spin trackpad bottom-left, above slide text bar (always visible on non-touch devices) */}
                  {!isTouchDevice && activeSlide?.id !== "find-green-white" && (
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

            {/* Fix box for steps 3-8 with step-by-step validation; add active highlight border like slide 8 */}
            {fixSequence.length > 0 && (
              <div className="absolute top-2 left-2 md:top-3 md:left-3 z-30 pointer-events-auto">
                <div
                  className={(() => {
                    const activeHighlightSlides = new Set([
                      "flip-green-white-f2",
                      "flip-green-white",
                      "flipped-misoriented-green-white",
                      "misaligned-green-white",
                      "flipped-misoriented-misaligned-green-white",
                      "midlayer-green-white-extraction",
                    ]);
                    const inProgress =
                      activeSlide &&
                      activeHighlightSlides.has(activeSlide.id) &&
                      fixIndex < fixSequence.length;
                    const base =
                      " rounded-lg h-10 px-3 py-2 text-xs md:text-sm font-semibold flex items-center gap-2 transition-colors ";
                    if (fixErrorPulse) {
                      return (
                        base + "border border-red-400 bg-red-50 text-red-700"
                      );
                    }
                    if (inProgress) {
                      return base + " border-blue-500 text-blue-200"; // darker border while active
                    }
                    return base + " border-blue-300 text-blue-200";
                  })()}
                  style={{ minWidth: "140px" }}
                >
                  {(() => {
                    const shouldHideFrontFace =
                      lessonId === "white-cross" &&
                      (activeSlide?.id === "flip-green-white-f2" ||
                        activeSlide?.id === "flip-green-white" ||
                        activeSlide?.id === "flipped-misoriented-green-white" ||
                        activeSlide?.id === "misaligned-green-white" ||
                        activeSlide?.id ===
                          "flipped-misoriented-misaligned-green-white");

                    if (
                      activeSlide?.id === "practice-setup-solution" ||
                      activeSlide?.id === "practice-setup-solution-2" ||
                      activeSlide?.id === "yellow-cross-line" ||
                      activeSlide?.id === "yellow-edges-solution"
                    ) {
                      return (
                        <div className="flex flex-col text-left gap-1">
                          <div className="text-[9px] uppercase tracking-wide font-semibold text-blue-200">
                            {!shouldHideFrontFace && <>Front Face: </>}
                            <span
                              className="font-bold normal-case"
                              style={{
                                color:
                                  activeSlide?.id ===
                                  "practice-setup-solution-2"
                                    ? CUBE_COLORS.GREEN
                                    : CUBE_COLORS.RED,
                              }}
                            >
                              {activeSlide?.id === "practice-setup-solution-2"
                                ? "Green"
                                : "Red"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] uppercase tracking-wide font-semibold text-blue-200">
                              {lessonId === "notation" ? "Try:" : "Fix:"}
                            </span>
                            <AlgorithmSequence
                              moves={fixSequenceDisplay}
                              currentIndex={fixIndex}
                              partialDirection={fixDoublePartialDir}
                            />
                            {/* Animated completion tick */}
                            {fixShowTick && (
                              <CompletionTick
                                animKey={fixTickAnimKey}
                                progress={fixTickProgress}
                                line={fixTickLine}
                                color="green"
                              />
                            )}
                          </div>
                        </div>
                      );
                    } else if (
                      activeSlide?.id === "midlayer-green-white-extraction"
                    ) {
                      return (
                        <span className="text-blue-200">
                          <div
                            className={`flex flex-col text-left gap-2 ${
                              activeSlide?.id ===
                              "midlayer-green-white-extraction"
                                ? "mb-1"
                                : ""
                            }`}
                          >
                            {!shouldHideFrontFace && (
                              <div className="text-[9px] uppercase tracking-wide font-semibold text-blue-200">
                                Front Face:
                              </div>
                            )}
                            <div className="text-[9px] uppercase tracking-wide font-semibold text-blue-200 ml-0">
                              {lessonId === "notation" ? "Try:" : "Fix:"}
                            </div>
                          </div>
                        </span>
                      );
                    } else {
                      return (
                        <div className="mb-1">
                          {!shouldHideFrontFace && (
                            <div className="text-[9px] uppercase tracking-wide font-semibold text-blue-200 mb-2">
                              Front Face:
                            </div>
                          )}
                          <span className="text-[9px] uppercase tracking-wide font-semibold text-blue-200">
                            {lessonId === "notation" ? "Try:" : "Fix:"}
                          </span>
                        </div>
                      );
                    }
                  })()}
                  {activeSlide?.id !== "practice-setup-solution" &&
                  activeSlide?.id !== "practice-setup-solution-2" &&
                  activeSlide?.id !== "yellow-cross-line" &&
                  activeSlide?.id !== "yellow-edges-solution" ? (
                    <div className="flex items-center gap-0">
                      {/* Animated completion tick (not shown for step 5) */}
                      {false &&
                        activeSlide?.id !== "flipped-misoriented-green-white" &&
                        activeSlide?.id !== "misaligned-green-white" && (
                          <div className="relative w-6 h-6 ml-1">
                            <svg
                              key={fixTickAnimKey}
                              className="w-6 h-6 transform -rotate-90"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="#e5e7eb"
                                strokeWidth="2"
                                fill="none"
                              />
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                                className="text-green-500"
                                style={{
                                  strokeDasharray: "63",
                                  strokeDashoffset: fixTickProgress ? 0 : 63,
                                  transition:
                                    "stroke-dashoffset 0.4s ease-in-out",
                                }}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-green-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                  style={{
                                    strokeDasharray: "20",
                                    strokeDashoffset: fixTickLine ? 0 : 20,
                                    transition:
                                      "stroke-dashoffset 0.5s ease-out",
                                  }}
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                      {activeSlide?.id === "flipped-misoriented-green-white" ? (
                        <>
                          <div className="flex items-center gap-0 border border-green-600 rounded-[7px]">
                            {/* Group 1: F2 (first tick) */}
                            {(() => {
                              const idx = 0;
                              const step = fixSequence[idx];
                              const isDone = idx < fixIndex;
                              const isCurrent = idx === fixIndex;
                              const isDouble = step?.endsWith("2");
                              const partial =
                                isCurrent &&
                                isDouble &&
                                fixDoublePartialDir !== 0;
                              return (
                                <div className="flex items-center gap-1 rounded-[7px]">
                                  <div
                                    className={
                                      "relative px-2 py-1 text-[14px] rounded-md md:text-xs leading-none select-none " +
                                      (isDone
                                        ? " bg-green-500 text-white"
                                        : partial
                                        ? " text-white border-blue-600"
                                        : isCurrent
                                        ? " bg-white text-blue-700 border-blue-500"
                                        : " text-gray-600 bg-gray-300 border-gray-300")
                                    }
                                    style={
                                      partial
                                        ? {
                                            background:
                                              "linear-gradient(90deg, #22c55e 50%, #3b82f6 50%)",
                                          }
                                        : undefined
                                    }
                                    title={step}
                                  >
                                    {step}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                          {fixIndex >= 1 && (
                            <div className="relative w-6 h-6 ml-1">
                              <svg
                                key={fixTickAnimKey}
                                className="w-6 h-6 transform -rotate-90"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="#e5e7eb"
                                  strokeWidth="2"
                                  fill="none"
                                />
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  fill="none"
                                  className="text-green-500"
                                  style={{
                                    strokeDasharray: "63",
                                    strokeDashoffset: fixFirstTickProgress
                                      ? 0
                                      : 63,
                                    transition:
                                      "stroke-dashoffset 0.4s ease-in-out",
                                  }}
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <svg
                                  className="w-4 h-4 text-green-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                    style={{
                                      strokeDasharray: "20",
                                      strokeDashoffset: fixFirstTickLine
                                        ? 0
                                        : 20,
                                      transition:
                                        "stroke-dashoffset 0.5s ease-out",
                                    }}
                                  />
                                </svg>
                              </div>
                            </div>
                          )}

                          <span className="mx-1 text-gray-400">/</span>
                          {/* Group 2: F U' R U (second tick) */}
                          <div className="flex items-center gap-0 border border-green-600 rounded-[7px]">
                            {fixSequence.slice(1).map((step, i, arr) => {
                              const idx = i + 1;
                              const isDone = idx < fixIndex;
                              const isCurrent = idx === fixIndex;
                              const isDouble = step.endsWith("2");
                              const partial =
                                isCurrent &&
                                isDouble &&
                                fixDoublePartialDir !== 0;
                              const isFirst = i === 0;
                              const isLast = i === arr.length - 1;
                              let pillClass =
                                "relative px-1 py-1 text-[14px] md:text-xs leading-none select-none ";
                              if (isFirst)
                                pillClass +=
                                  " rounded-tl-md rounded-bl-md pl-2 ";
                              if (isLast)
                                pillClass +=
                                  " rounded-tr-md rounded-br-md pr-2 ";
                              pillClass += isDone
                                ? " bg-green-500 text-white border-green-600"
                                : partial
                                ? " text-white border-blue-600"
                                : isCurrent
                                ? " bg-white text-blue-700 border-blue-500"
                                : " text-gray-600 bg-gray-300 border-gray-300";
                              return (
                                <div
                                  key={idx + step}
                                  className={pillClass}
                                  style={
                                    partial
                                      ? {
                                          background:
                                            "linear-gradient(90deg, #22c55e 50%, #3b82f6 50%)",
                                        }
                                      : undefined
                                  }
                                  title={step}
                                >
                                  {step}
                                </div>
                              );
                            })}
                          </div>
                          {fixCompleted && (
                            <div className="relative w-6 h-6 ml-1">
                              <svg
                                key={fixTickAnimKey}
                                className="w-6 h-6 transform -rotate-90"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="#e5e7eb"
                                  strokeWidth="2"
                                  fill="none"
                                />
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  fill="none"
                                  className="text-green-500"
                                  style={{
                                    strokeDasharray: "63",
                                    strokeDashoffset: fixTickProgress ? 0 : 63,
                                    transition:
                                      "stroke-dashoffset 0.4s ease-in-out",
                                  }}
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <svg
                                  className="w-4 h-4 text-green-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                    style={{
                                      strokeDasharray: "20",
                                      strokeDashoffset: fixTickLine ? 0 : 20,
                                      transition:
                                        "stroke-dashoffset 0.5s ease-out",
                                    }}
                                  />
                                </svg>
                              </div>
                            </div>
                          )}
                        </>
                      ) : activeSlide?.id === "misaligned-green-white" ? (
                        <>
                          {/* Group 1: D' (first tick) */}
                          {(() => {
                            const idx = 0;
                            const step = fixSequence[idx];
                            const isDone = idx < fixIndex;
                            const isCurrent = idx === fixIndex;
                            const isDouble = step?.endsWith("2");
                            const partial =
                              isCurrent &&
                              isDouble &&
                              fixDoublePartialDir !== 0;
                            return (
                              <>
                                <div className="flex items-center gap-1 border border-green-600 rounded-[7px]">
                                  <div
                                    className={
                                      "relative px-1 py-1 text-[14px] md:text-xs leading-none select-none rounded-tl-md rounded-bl-md pl-2 rounded-tr-md rounded-br-md pr-2 " +
                                      (isDone
                                        ? " bg-green-500 text-white border-green-600"
                                        : partial
                                        ? " text-white border-blue-600"
                                        : isCurrent
                                        ? " bg-white text-blue-700 border-blue-500"
                                        : " text-gray-600 bg-gray-300 border-gray-300")
                                    }
                                    style={
                                      partial
                                        ? {
                                            background:
                                              "linear-gradient(90deg, #22c55e 50%, #3b82f6 50%)",
                                          }
                                        : undefined
                                    }
                                    title={step}
                                  >
                                    {step}
                                  </div>
                                </div>
                                {fixIndex >= 1 && (
                                  <div className="relative w-6 h-6 ml-1">
                                    <svg
                                      key={fixTickAnimKey}
                                      className="w-6 h-6 transform -rotate-90"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="#e5e7eb"
                                        strokeWidth="2"
                                        fill="none"
                                      />
                                      <circle
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        fill="none"
                                        className="text-green-500"
                                        style={{
                                          strokeDasharray: "63",
                                          strokeDashoffset: fixFirstTickProgress
                                            ? 0
                                            : 63,
                                          transition:
                                            "stroke-dashoffset 0.4s ease-in-out",
                                        }}
                                      />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <svg
                                        className="w-4 h-4 text-green-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={3}
                                          d="M5 13l4 4L19 7"
                                          style={{
                                            strokeDasharray: "20",
                                            strokeDashoffset: fixFirstTickLine
                                              ? 0
                                              : 20,
                                            transition:
                                              "stroke-dashoffset 0.5s ease-out",
                                          }}
                                        />
                                      </svg>
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                          <span className="mx-1 text-gray-400">/</span>
                          {/* Group 2: F2 (second tick) */}

                          {(() => {
                            const idx = 1;
                            const step = fixSequence[idx];
                            const isDone = idx < fixIndex;
                            const isCurrent = idx === fixIndex;
                            const isDouble = step?.endsWith("2");
                            const partial =
                              isCurrent &&
                              isDouble &&
                              fixDoublePartialDir !== 0;
                            return (
                              <>
                                <div className="flex items-center gap-1 border border-green-600 rounded-[7px]">
                                  <div
                                    className={
                                      "relative px-1 py-1 text-[14px] md:text-xs leading-none select-none rounded-tl-md rounded-bl-md pl-2 rounded-tr-md rounded-br-md pr-2 " +
                                      (isDone
                                        ? " bg-green-500 text-white border-green-600"
                                        : partial
                                        ? " text-white border-blue-600"
                                        : isCurrent
                                        ? " bg-white text-blue-700 border-blue-500"
                                        : " text-gray-600 bg-gray-300 border-gray-300")
                                    }
                                    style={
                                      partial
                                        ? {
                                            background:
                                              "linear-gradient(90deg, #22c55e 50%, #3b82f6 50%)",
                                          }
                                        : undefined
                                    }
                                    title={step}
                                  >
                                    {step}
                                  </div>
                                </div>
                                {fixCompleted && (
                                  <div className="relative w-6 h-6 ml-1">
                                    <svg
                                      key={fixTickAnimKey}
                                      className="w-6 h-6 transform -rotate-90"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="#e5e7eb"
                                        strokeWidth="2"
                                        fill="none"
                                      />
                                      <circle
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        fill="none"
                                        className="text-green-500"
                                        style={{
                                          strokeDasharray: "63",
                                          strokeDashoffset: fixTickProgress
                                            ? 0
                                            : 63,
                                          transition:
                                            "stroke-dashoffset 0.4s ease-in-out",
                                        }}
                                      />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <svg
                                        className="w-4 h-4 text-green-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={3}
                                          d="M5 13l4 4L19 7"
                                          style={{
                                            strokeDasharray: "20",
                                            strokeDashoffset: fixTickLine
                                              ? 0
                                              : 20,
                                            transition:
                                              "stroke-dashoffset 0.5s ease-out",
                                          }}
                                        />
                                      </svg>
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </>
                      ) : activeSlide?.id ===
                        "flipped-misoriented-misaligned-green-white" ? (
                        <>
                          {/* Group 1: D' (first tick) */}
                          {(() => {
                            const idx = 0;
                            const step = fixSequence[idx];
                            const isDone = idx < fixIndex;
                            const isCurrent = idx === fixIndex;
                            const isDouble = step?.endsWith("2");
                            const partial =
                              isCurrent &&
                              isDouble &&
                              fixDoublePartialDir !== 0;
                            return (
                              <>
                                <div className="flex items-center gap-1 border border-green-600 rounded-[7px]">
                                  <div
                                    className={
                                      "relative px-1 py-1 text-[14px] md:text-xs leading-none select-none rounded-tl-md rounded-bl-md pl-2 rounded-tr-md rounded-br-md pr-2 " +
                                      (isDone
                                        ? " bg-green-500 text-white border-green-600"
                                        : partial
                                        ? " text-white border-blue-600"
                                        : isCurrent
                                        ? " bg-white text-blue-700 border-blue-500"
                                        : " text-gray-600 bg-gray-300 border-gray-300")
                                    }
                                    style={
                                      partial
                                        ? {
                                            background:
                                              "linear-gradient(90deg, #22c55e 50%, #3b82f6 50%)",
                                          }
                                        : undefined
                                    }
                                    title={step}
                                  >
                                    {step}
                                  </div>
                                </div>
                                {fixIndex >= 1 && (
                                  <div className="relative w-6 h-6 ml-1">
                                    <svg
                                      key={fixTickAnimKey}
                                      className="w-6 h-6 transform -rotate-90"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="#e5e7eb"
                                        strokeWidth="2"
                                        fill="none"
                                      />
                                      <circle
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        fill="none"
                                        className="text-green-500"
                                        style={{
                                          strokeDasharray: "63",
                                          strokeDashoffset: fixFirstTickProgress
                                            ? 0
                                            : 63,
                                          transition:
                                            "stroke-dashoffset 0.4s ease-in-out",
                                        }}
                                      />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <svg
                                        className="w-4 h-4 text-green-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={3}
                                          d="M5 13l4 4L19 7"
                                          style={{
                                            strokeDasharray: "20",
                                            strokeDashoffset: fixFirstTickLine
                                              ? 0
                                              : 20,
                                            transition:
                                              "stroke-dashoffset 0.5s ease-out",
                                          }}
                                        />
                                      </svg>
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                          <span className="mx-1 text-gray-400">/</span>
                          {/* Group 2: F2 (second mid-stage tick) */}
                          {(() => {
                            const idx = 1;
                            const step = fixSequence[idx];
                            const isDone = idx < fixIndex;
                            const isCurrent = idx === fixIndex;
                            const isDouble = step?.endsWith("2");
                            const partial =
                              isCurrent &&
                              isDouble &&
                              fixDoublePartialDir !== 0;
                            return (
                              <>
                                <div className="flex items-center gap-1 border border-green-600 rounded-[7px]">
                                  <div
                                    className={
                                      "relative px-2 py-1 rounded-md text-[14px] md:text-xs leading-none select-none " +
                                      (isDone
                                        ? " bg-green-500 text-white"
                                        : partial
                                        ? " text-white border-blue-600"
                                        : isCurrent
                                        ? " bg-white text-blue-700 border-blue-500"
                                        : " text-gray-600 bg-gray-300 border-gray-300")
                                    }
                                    style={
                                      partial
                                        ? {
                                            background:
                                              "linear-gradient(90deg, #22c55e 50%, #3b82f6 50%)",
                                          }
                                        : undefined
                                    }
                                    title={step}
                                  >
                                    {step}
                                  </div>
                                </div>
                                {fixIndex >= 2 && (
                                  <div className="relative w-6 h-6 ml-1">
                                    <svg
                                      key={fixTickAnimKey}
                                      className="w-6 h-6 transform -rotate-90"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="#e5e7eb"
                                        strokeWidth="2"
                                        fill="none"
                                      />
                                      <circle
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        fill="none"
                                        className="text-green-500"
                                        style={{
                                          strokeDasharray: "63",
                                          strokeDashoffset:
                                            fixSecondTickProgress ? 0 : 63,
                                          transition:
                                            "stroke-dashoffset 0.4s ease-in-out",
                                        }}
                                      />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <svg
                                        className="w-4 h-4 text-green-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={3}
                                          d="M5 13l4 4L19 7"
                                          style={{
                                            strokeDasharray: "20",
                                            strokeDashoffset: fixSecondTickLine
                                              ? 0
                                              : 20,
                                            transition:
                                              "stroke-dashoffset 0.5s ease-out",
                                          }}
                                        />
                                      </svg>
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                          <span className="mx-1 text-gray-400">/</span>
                          {/* Group 3: F' U' R U (final inline completion tick placeholder) */}
                          <div className="flex items-center gap-0 border border-green-600 rounded-[7px]">
                            {fixSequence.slice(2).map((step, i, arr) => {
                              const idx = i + 2;
                              const isDone = idx < fixIndex;
                              const isCurrent = idx === fixIndex;
                              const isDouble = step.endsWith("2");
                              const partial =
                                isCurrent &&
                                isDouble &&
                                fixDoublePartialDir !== 0;
                              const isFirst = i === 0;
                              const isLast = i === arr.length - 1;
                              let pillClass =
                                "relative px-1 py-1 text-[14px] md:text-xs leading-none select-none ";
                              if (isFirst)
                                pillClass +=
                                  " rounded-tl-md rounded-bl-md pl-2 ";
                              if (isLast)
                                pillClass +=
                                  " rounded-tr-md rounded-br-md pr-2 ";
                              pillClass += isDone
                                ? " bg-green-500 text-white border-green-600"
                                : partial
                                ? " text-white border-blue-600"
                                : isCurrent
                                ? " bg-white text-blue-700 border-blue-500"
                                : " text-gray-600 bg-gray-300 border-gray-300";
                              return (
                                <div
                                  key={idx + step}
                                  className={pillClass}
                                  style={
                                    partial
                                      ? {
                                          background:
                                            "linear-gradient(90deg, #22c55e 50%, #3b82f6 50%)",
                                        }
                                      : undefined
                                  }
                                  title={step}
                                >
                                  {step}
                                </div>
                              );
                            })}
                          </div>
                          {fixCompleted && (
                            <div className="relative w-6 h-6 ml-1">
                              <svg
                                key={fixTickAnimKey}
                                className="w-6 h-6 transform -rotate-90"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="#e5e7eb"
                                  strokeWidth="2"
                                  fill="none"
                                />
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  fill="none"
                                  className="text-green-500"
                                  style={{
                                    strokeDasharray: "63",
                                    strokeDashoffset: fixTickProgress ? 0 : 63,
                                    transition:
                                      "stroke-dashoffset 0.4s ease-in-out",
                                  }}
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <svg
                                  className="w-4 h-4 text-green-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                    style={{
                                      strokeDasharray: "20",
                                      strokeDashoffset: fixTickLine ? 0 : 20,
                                      transition:
                                        "stroke-dashoffset 0.5s ease-out",
                                    }}
                                  />
                                </svg>
                              </div>
                            </div>
                          )}
                        </>
                      ) : activeSlide?.id === "practice-setup-solution-3" ? (
                        <MultiPartSequence
                          parts={[
                            {
                              moves: ["R", "U2", "R'", "U'"],
                              colorName: "Red",
                              colorValue: CUBE_COLORS.RED,
                              startIndex: 0,
                              boundaryIndex: 4,
                              tickAnimKey: midStage1Key,
                              tickProgress: midStage1Progress,
                              tickLine: midStage1Line,
                            },
                            {
                              moves: ["R", "U", "R'"],
                              colorName: "Red",
                              colorValue: CUBE_COLORS.RED,
                              startIndex: 4,
                              boundaryIndex: 7,
                              tickAnimKey: midStage2Key,
                              tickProgress: midStage2Progress,
                              tickLine: midStage2Line,
                            },
                          ]}
                          currentIndex={fixIndex}
                          partialDirection={fixDoublePartialDir}
                        />
                      ) : activeSlide?.id === "practice-setup-solution-4" ? (
                        <MultiPartSequence
                          parts={[
                            {
                              moves: ["R", "U", "R'", "U'"],
                              colorName: "Red",
                              colorValue: CUBE_COLORS.RED,
                              startIndex: 0,
                              boundaryIndex: 4,
                              tickAnimKey: midStage1Key,
                              tickProgress: midStage1Progress,
                              tickLine: midStage1Line,
                            },
                            {
                              moves: ["R", "U", "R'"],
                              colorName: "Red",
                              colorValue: CUBE_COLORS.RED,
                              startIndex: 4,
                              boundaryIndex: 7,
                              tickAnimKey: midStage2Key,
                              tickProgress: midStage2Progress,
                              tickLine: midStage2Line,
                            },
                          ]}
                          currentIndex={fixIndex}
                          partialDirection={fixDoublePartialDir}
                        />
                      ) : activeSlide?.id === "yellow-cross-dot" ? (
                        <div
                          className="relative overflow-hidden"
                          style={{ height: "80px" }}
                        >
                          <div
                            className={`transition-transform duration-500 ease-in-out flex flex-col ${
                              showSecondSequenceDot || secondSequenceDotLocked
                                ? "-translate-y-[80px]"
                                : "translate-y-0"
                            }`}
                          >
                            {/* First sequence (parts 1-2) */}
                            <div
                              style={{ height: "80px", flexShrink: 0 }}
                              className="pt-4"
                            >
                              <MultiPartSequence
                                parts={[
                                  {
                                    moves: ["F", "R", "U", "R'", "U'", "F'"],
                                    colorName: "Red",
                                    colorValue: CUBE_COLORS.RED,
                                    startIndex: 0,
                                    boundaryIndex: 6,
                                    tickAnimKey: midStage1Key,
                                    tickProgress: midStage1Progress,
                                    tickLine: midStage1Line,
                                  },
                                  {
                                    moves: ["U2"],
                                    colorName: "Red",
                                    colorValue: CUBE_COLORS.RED,
                                    startIndex: 6,
                                    boundaryIndex: 7,
                                    tickAnimKey: midStage2Key,
                                    tickProgress: midStage2Progress,
                                    tickLine: midStage2Line,
                                  },
                                ]}
                                currentIndex={fixIndex}
                                partialDirection={fixDoublePartialDir}
                              />
                            </div>
                            {/* Second sequence (parts 3-4) */}
                            <div
                              style={{ height: "80px", flexShrink: 0 }}
                              className="pt-4"
                            >
                              <MultiPartSequence
                                parts={[
                                  {
                                    moves: ["F", "R", "U", "R'", "U'", "F'"],
                                    colorName: "Red",
                                    colorValue: CUBE_COLORS.RED,
                                    startIndex: 7,
                                    boundaryIndex: 13,
                                    tickAnimKey: midStage3Key,
                                    tickProgress: midStage3Progress,
                                    tickLine: midStage3Line,
                                  },
                                  {
                                    moves: ["F", "R", "U", "R'", "U'", "F'"],
                                    colorName: "Red",
                                    colorValue: CUBE_COLORS.RED,
                                    startIndex: 13,
                                    boundaryIndex: 19,
                                    tickAnimKey: midStage4Key,
                                    tickProgress: midStage4Progress,
                                    tickLine: midStage4Line,
                                  },
                                ]}
                                currentIndex={fixIndex}
                                partialDirection={fixDoublePartialDir}
                              />
                            </div>
                          </div>
                        </div>
                      ) : activeSlide?.id === "yellow-cross-triangle" ? (
                        <MultiPartSequence
                          parts={[
                            {
                              moves: ["F", "R", "U", "R'", "U'", "F'"],
                              colorName: "Red",
                              colorValue: CUBE_COLORS.RED,
                              startIndex: 0,
                              boundaryIndex: 6,
                              tickAnimKey: midStage1Key,
                              tickProgress: midStage1Progress,
                              tickLine: midStage1Line,
                            },
                            {
                              moves: ["F", "R", "U", "R'", "U'", "F'"],
                              colorName: "Red",
                              colorValue: CUBE_COLORS.RED,
                              startIndex: 6,
                              boundaryIndex: 12,
                              tickAnimKey: midStage2Key,
                              tickProgress: midStage2Progress,
                              tickLine: midStage2Line,
                            },
                          ]}
                          currentIndex={fixIndex}
                          partialDirection={fixDoublePartialDir}
                        />
                      ) : activeSlide?.id === "yellow-edges-solution-2" ? (
                        <MultiPartSequence
                          parts={[
                            {
                              moves: ["U"],
                              colorName: "Red",
                              colorValue: CUBE_COLORS.RED,
                              startIndex: 0,
                              boundaryIndex: 1,
                              tickAnimKey: midStage1Key,
                              tickProgress: midStage1Progress,
                              tickLine: midStage1Line,
                            },
                            {
                              moves: [
                                "R",
                                "U",
                                "R'",
                                "U",
                                "R",
                                "U2",
                                "R'",
                                "U",
                              ],
                              colorName: "Green",
                              colorValue: CUBE_COLORS.GREEN,
                              startIndex: 1,
                              boundaryIndex: 9,
                              tickAnimKey: midStage2Key,
                              tickProgress: midStage2Progress,
                              tickLine: midStage2Line,
                            },
                          ]}
                          currentIndex={fixIndex}
                          partialDirection={fixDoublePartialDir}
                        />
                      ) : activeSlide?.id === "yellow-edges-solution-3" ? (
                        <MultiPartSequence
                          parts={[
                            {
                              moves: ["U2"],
                              colorName: "Red",
                              colorValue: CUBE_COLORS.RED,
                              startIndex: 0,
                              boundaryIndex: 1,
                              tickAnimKey: midStage1Key,
                              tickProgress: midStage1Progress,
                              tickLine: midStage1Line,
                            },
                            {
                              moves: [
                                "R",
                                "U",
                                "R'",
                                "U",
                                "R",
                                "U2",
                                "R'",
                                "U",
                              ],
                              colorName: "Blue",
                              colorValue: CUBE_COLORS.BLUE,
                              startIndex: 1,
                              boundaryIndex: 9,
                              tickAnimKey: midStage2Key,
                              tickProgress: midStage2Progress,
                              tickLine: midStage2Line,
                            },
                          ]}
                          currentIndex={fixIndex}
                          partialDirection={fixDoublePartialDir}
                        />
                      ) : activeSlide?.id === "practice-setup-solution-5" ? (
                        <MultiPartSequence
                          parts={[
                            {
                              moves: ["R", "U", "R'", "U'"],
                              colorName: "Red",
                              colorValue: CUBE_COLORS.RED,
                              startIndex: 0,
                              boundaryIndex: 4,
                              tickAnimKey: midStage1Key,
                              tickProgress: midStage1Progress,
                              tickLine: midStage1Line,
                            },
                            {
                              moves: ["R", "U2", "R'", "U'"],
                              colorName: "Red",
                              colorValue: CUBE_COLORS.RED,
                              startIndex: 4,
                              boundaryIndex: 8,
                              tickAnimKey: midStage2Key,
                              tickProgress: midStage2Progress,
                              tickLine: midStage2Line,
                            },
                            {
                              moves: ["R", "U", "R'"],
                              colorName: "Red",
                              colorValue: CUBE_COLORS.RED,
                              startIndex: 8,
                              boundaryIndex: 11,
                              tickAnimKey: midStage3Key,
                              tickProgress: midStage3Progress,
                              tickLine: midStage3Line,
                            },
                          ]}
                          currentIndex={fixIndex}
                          partialDirection={fixDoublePartialDir}
                        />
                      ) : activeSlide?.id ===
                        "midlayer-green-white-extraction" ? (
                        <MultiPartSequence
                          parts={[
                            {
                              moves: ["R'", "D'", "R"],
                              colorName: "Red",
                              colorValue: CUBE_COLORS.RED,
                              startIndex: 0,
                              boundaryIndex: 3,
                              tickAnimKey: midStage1Key,
                              tickProgress: midStage1Progress,
                              tickLine: midStage1Line,
                              borderColor: CUBE_COLORS.GREEN,
                            },
                            {
                              moves: ["D'"],
                              colorName: "Green",
                              colorValue: CUBE_COLORS.GREEN,
                              startIndex: 3,
                              boundaryIndex: 4,
                              tickAnimKey: midStage2Key,
                              tickProgress: midStage2Progress,
                              tickLine: midStage2Line,
                              borderColor: CUBE_COLORS.GREEN,
                            },
                            {
                              moves: ["F2"],
                              colorName: "Green",
                              colorValue: CUBE_COLORS.GREEN,
                              startIndex: 4,
                              boundaryIndex: 5,
                              tickAnimKey: midStage3Key,
                              tickProgress: midStage3Progress,
                              tickLine: midStage3Line,
                              borderColor: CUBE_COLORS.GREEN,
                            },
                          ]}
                          currentIndex={fixIndex}
                          partialDirection={fixDoublePartialDir}
                        />
                      ) : activeSlide?.id === "practice-setup-solution-6" ? (
                        <MultiPartSequence
                          parts={[
                            {
                              moves: ["R", "U", "R'", "U'"],
                              colorName: "Green",
                              colorValue: CUBE_COLORS.GREEN,
                              startIndex: 0,
                              boundaryIndex: 4,
                              tickAnimKey: midStage1Key,
                              tickProgress: midStage1Progress,
                              tickLine: midStage1Line,
                            },
                            {
                              moves: ["U"],
                              colorName: "Green",
                              colorValue: CUBE_COLORS.GREEN,
                              startIndex: 4,
                              boundaryIndex: 5,
                              tickAnimKey: midStage2Key,
                              tickProgress: midStage2Progress,
                              tickLine: midStage2Line,
                            },
                            {
                              moves: ["R", "U", "R'"],
                              colorName: "Red",
                              colorValue: CUBE_COLORS.RED,
                              startIndex: 5,
                              boundaryIndex: 8,
                              tickAnimKey: midStage3Key,
                              tickProgress: midStage3Progress,
                              tickLine: midStage3Line,
                            },
                          ]}
                          currentIndex={fixIndex}
                          partialDirection={fixDoublePartialDir}
                        />
                      ) : activeSlide?.id === "second-layer-setup-solution" ? (
                        <MultiPartSequence
                          parts={[
                            {
                              moves: ["U'", "L'", "U'", "L", "U"],
                              colorName: "Green",
                              colorValue: CUBE_COLORS.GREEN,
                              startIndex: 0,
                              boundaryIndex: 5,
                              tickAnimKey: midStage1Key,
                              tickProgress: midStage1Progress,
                              tickLine: midStage1Line,
                            },
                            {
                              moves: ["R", "U", "R'"],
                              colorName: "Red",
                              colorValue: CUBE_COLORS.RED,
                              startIndex: 5,
                              boundaryIndex: 8,
                              tickAnimKey: midStage2Key,
                              tickProgress: midStage2Progress,
                              tickLine: midStage2Line,
                            },
                          ]}
                          currentIndex={fixIndex}
                          partialDirection={fixDoublePartialDir}
                        />
                      ) : activeSlide?.id ===
                        "second-layer-setup-solution-2" ? (
                        <MultiPartSequence
                          parts={[
                            {
                              moves: ["U", "R", "U", "R'", "U'"],
                              colorName: "Red",
                              colorValue: CUBE_COLORS.RED,
                              startIndex: 0,
                              boundaryIndex: 5,
                              tickAnimKey: midStage1Key,
                              tickProgress: midStage1Progress,
                              tickLine: midStage1Line,
                            },
                            {
                              moves: ["L'", "U'", "L"],
                              colorName: "Green",
                              colorValue: CUBE_COLORS.GREEN,
                              startIndex: 5,
                              boundaryIndex: 8,
                              tickAnimKey: midStage2Key,
                              tickProgress: midStage2Progress,
                              tickLine: midStage2Line,
                            },
                          ]}
                          currentIndex={fixIndex}
                          partialDirection={fixDoublePartialDir}
                        />
                      ) : activeSlide?.id ===
                        "second-layer-setup-solution-3" ? (
                        <MultiPartSequence
                          parts={[
                            {
                              moves: ["U", "R", "U", "R'", "U'"],
                              colorName: "Green",
                              colorValue: CUBE_COLORS.GREEN,
                              startIndex: 0,
                              boundaryIndex: 5,
                              tickAnimKey: midStage1Key,
                              tickProgress: midStage1Progress,
                              tickLine: midStage1Line,
                            },
                            {
                              moves: ["L'", "U'", "L"],
                              colorName: "Orange",
                              colorValue: CUBE_COLORS.ORANGE,
                              startIndex: 5,
                              boundaryIndex: 8,
                              tickAnimKey: midStage2Key,
                              tickProgress: midStage2Progress,
                              tickLine: midStage2Line,
                            },
                          ]}
                          currentIndex={fixIndex}
                          partialDirection={fixDoublePartialDir}
                        />
                      ) : activeSlide?.id ===
                        "second-layer-setup-solution-4" ? (
                        <div
                          className="relative overflow-hidden"
                          style={{ height: "80px" }}
                        >
                          <div
                            className={`transition-transform duration-500 ease-in-out flex flex-col ${
                              showSecondSequence || secondSequenceLocked
                                ? "-translate-y-[80px]"
                                : "translate-y-0"
                            }`}
                          >
                            {/* First sequence (parts 1-3) */}
                            <div
                              style={{ height: "80px", flexShrink: 0 }}
                              className="pt-4"
                            >
                              <MultiPartSequence
                                parts={[
                                  {
                                    moves: ["U", "R", "U", "R'", "U'"],
                                    colorName: "Red",
                                    colorValue: CUBE_COLORS.RED,
                                    startIndex: 0,
                                    boundaryIndex: 5,
                                    tickAnimKey: midStage1Key,
                                    tickProgress: midStage1Progress,
                                    tickLine: midStage1Line,
                                  },
                                  {
                                    moves: ["L'", "U'", "L"],
                                    colorName: "Green",
                                    colorValue: CUBE_COLORS.GREEN,
                                    startIndex: 5,
                                    boundaryIndex: 8,
                                    tickAnimKey: midStage2Key,
                                    tickProgress: midStage2Progress,
                                    tickLine: midStage2Line,
                                  },
                                  {
                                    moves: ["U2"],
                                    colorName: "Green",
                                    colorValue: CUBE_COLORS.GREEN,
                                    startIndex: 8,
                                    boundaryIndex: 9,
                                    tickAnimKey: midStage3Key,
                                    tickProgress: midStage3Progress,
                                    tickLine: midStage3Line,
                                  },
                                ]}
                                currentIndex={fixIndex}
                                partialDirection={fixDoublePartialDir}
                              />
                            </div>
                            {/* Second sequence (parts 4-5) */}
                            <div
                              style={{ height: "80px", flexShrink: 0 }}
                              className="pt-4"
                            >
                              <MultiPartSequence
                                parts={[
                                  {
                                    moves: ["U", "R", "U", "R'", "U'"],
                                    colorName: "Red",
                                    colorValue: CUBE_COLORS.RED,
                                    startIndex: 9,
                                    boundaryIndex: 14,
                                    tickAnimKey: midStage4Key,
                                    tickProgress: midStage4Progress,
                                    tickLine: midStage4Line,
                                  },
                                  {
                                    moves: ["L'", "U'", "L"],
                                    colorName: "Green",
                                    colorValue: CUBE_COLORS.GREEN,
                                    startIndex: 14,
                                    boundaryIndex: 17,
                                    tickAnimKey: midStage5Key,
                                    tickProgress: midStage5Progress,
                                    tickLine: midStage5Line,
                                  },
                                ]}
                                currentIndex={fixIndex}
                                partialDirection={fixDoublePartialDir}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Default rendering for other slides
                        <AlgorithmSequence
                          moves={
                            activeSlide?.id === "practice-setup-solution" ||
                            activeSlide?.id === "practice-setup-solution-2" ||
                            activeSlide?.id === "practice-setup-solution-3" ||
                            activeSlide?.id === "yellow-cross-line" ||
                            activeSlide?.id === "yellow-edges-solution"
                              ? fixSequenceDisplay
                              : fixSequence
                          }
                          currentIndex={fixIndex}
                          partialDirection={fixDoublePartialDir}
                          borderColor={
                            activeSlide?.id ===
                            "midlayer-green-white-extraction"
                              ? CUBE_COLORS.GREEN
                              : "border-green-600"
                          }
                        />
                      )}
                      {/* Animated completion tick */}
                      {fixShowTick &&
                        ![
                          "flipped-misoriented-green-white",
                          "misaligned-green-white",
                          "flipped-misoriented-misaligned-green-white",
                          "midlayer-green-white-extraction",
                          "practice-setup-solution-3",
                          "practice-setup-solution-4",
                          "practice-setup-solution-5",
                          "practice-setup-solution-6",
                          "second-layer-setup-solution",
                          "second-layer-setup-solution-2",
                          "second-layer-setup-solution-3",
                          "second-layer-setup-solution-4",
                          "yellow-cross-triangle",
                          "yellow-cross-dot",
                          "yellow-edges-solution-2",
                          "yellow-edges-solution-3",
                        ].includes(activeSlide?.id || "") && (
                          <CompletionTick
                            animKey={fixTickAnimKey}
                            progress={fixTickProgress}
                            line={fixTickLine}
                            color="green"
                          />
                        )}
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {/* Notation uses the same Fix UI; label changes to Try when lessonId==='notation' */}

            {/* Recap overlay removed in favor of full-page recap panel */}
            {/* Practice Moves panel (hidden on slides 1 & 2) */}
            {(!activeSlide ||
              (activeSlide.allowFaceMoves && currentSlide >= 100)) && (
              <div className="absolute bottom-4 left-2 right-2 md:left-4 md:right-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 md:p-4 shadow-lg">
                  <div className="text-sm text-gray-600 mb-2">
                    Practice Moves:
                  </div>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-1 md:gap-2">
                    {[
                      "F",
                      "F'",
                      "R",
                      "R'",
                      "U",
                      "U'",
                      "L",
                      "L'",
                      "B",
                      "B'",
                      "D",
                      "D'",
                    ].map((move) => (
                      <button
                        key={move}
                        onClick={() => handleButtonMove(move)}
                        disabled={isAnimating || inputDisabled}
                        className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm"
                      >
                        {move}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {/* Reset modal removed; instant reset is used */}
          </div>
        </div>
      </div>
      {/* Full-width slide text bar at the very bottom (hidden on recap slides) */}
      {activeSlide &&
        activeSlide.id !== "recap-mental-model" &&
        activeSlide.id !== "recap-white-corners" && (
          <div className="sticky bottom-0 w-full bg-white/95 backdrop-blur border-t shadow-inner z-40">
            <div
              className="max-w-screen-2xl mx-auto px-3 md:px-6 py-3 md:py-4"
              style={{ minHeight: "8em" }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="text-gray-800">
                  <div className="font-semibold mb-1">
                    {currentSlide + 1} / {slides.length}: {activeSlide.title}
                  </div>
                  {activeSlide.id !== "recap-mental-model" &&
                    activeSlide.id !== "recap-white-corners" && (
                      <TypewriterText
                        text={activeSlide.description}
                        keyProp={currentSlide}
                      />
                    )}
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <Button
                    onClick={() =>
                      setCurrentSlide(Math.max(0, currentSlide - 1))
                    }
                    disabled={currentSlide === 0}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:hover:text-gray-400"
                  >
                    Prev
                  </Button>
                  <Button
                    onClick={() =>
                      setCurrentSlide(
                        Math.min(slides.length - 1, currentSlide + 1)
                      )
                    }
                    disabled={currentSlide >= slides.length - 1}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:hover:text-gray-400"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default TutorialPage;
