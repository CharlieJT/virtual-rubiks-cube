import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Canvas } from "@react-three/fiber";
import { Vector3 } from "three";
import { TrackballControls, PerformanceMonitor } from "@react-three/drei";
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
import CUBE_COLORS from "@/consts/cubeColours";
// Reset modal removed; instant reset button now
// Arrow removed; using cubie highlight instead

// Typewriter effect for slide descriptions
import { useState as useReactState, useEffect as useReactEffect } from "react";

function TypewriterText({ text, keyProp }: { text: string; keyProp: any }) {
  const [displayed, setDisplayed] = useReactState("");
  // Increase minHeight for all slides (e.g. 10em for more comfort)
  const minHeight = "8.6em";
  useReactEffect(() => {
    let i = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 15);
    return () => clearInterval(interval);
  }, [text, keyProp]);
  return (
    <span
      className="text-sm md:text-md text-gray-700 whitespace-pre-line block"
      style={{ minHeight, display: "block" }}
    >
      {displayed}
    </span>
  );
}

interface TutorialPageProps {
  lessonId: string;
  title: string;
  onBack: () => void;
}

// Helper to list unique, visible sticker colors on a cubie (ignore grey + black)
const getCubieColorSet = (piece: CubeState) => {
  const colors = new Set<string>();
  const grey = "#808080";
  const black = CUBE_COLORS.BLACK;
  Object.values(piece.colors).forEach((c) => {
    if (c && c !== grey && c !== black) colors.add(c);
  });
  return colors;
};

// Build a greyscaled cube for the tutorial baseline per lesson (simple rules)
const createTutorialCubeState = (lessonId: string, base: CubeState[][][]) => {
  // Default: leave as-is
  if (!lessonId) return base;
  // For white-cross, default to show all; slides will further filter
  if (lessonId === "white-cross") return base;
  // Fallback: no-op
  return base;
};

const TutorialPage = ({ lessonId, title, onBack }: TutorialPageProps) => {
  // Core cube state/refs
  const orbitPrevRef = useRef<any>(null);
  const cubeRef = useRef(new CubeJSWrapper());
  const [cube3D, setCube3D] = useState(() =>
    cubejsTo3D(cubeRef.current.getCube())
  );
  const [tutorialCube3D, setTutorialCube3D] = useState(() =>
    createTutorialCubeState(lessonId, cube3D)
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
  const [orbitControlsEnabled, setOrbitControlsEnabled] = useState(true);
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
  // Remount keys to force fresh SVG mount per stage (ensures dash animation reliably fires like slide 7)
  const [midStage1Key, setMidStage1Key] = useState(0);
  const [midStage2Key, setMidStage2Key] = useState(0);
  const [midStage3Key, setMidStage3Key] = useState(0);

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
  type Slide = {
    id: string;
    title: string;
    description: string;
    allowFaceMoves: boolean;
    setup?: (cube: CubeJSWrapper) => void;
    filter?: (piece: CubeState) => boolean;
  };
  const slides: Slide[] = useMemo(() => {
    const s: Slide[] = [];
    if (lessonId === "notation") {
      // Notation lesson: lightweight, no fix box logic, optional demo buttons
      s.push({
        id: "notation-intro",
        title: "🧩 Rubik’s Cube Notation (Including Prime)",
        description:
          "In this short intro, you’ll learn the notation used everywhere in tutorials: face letters (U, D, L, R, F, B), clockwise vs. counter-clockwise (prime ′), and double turns (2).\nYou’ll try them on the virtual cube as you go.",
        allowFaceMoves: true,
        setup: (cube: CubeJSWrapper) => cube.reset(),
      });
      s.push({
        id: "notation-faces",
        title: "The Six Faces",
        description:
          "U – Up (top)\nD – Down (bottom)\nL – Left\nR – Right\nF – Front (facing you)\nB – Back (opposite the front)\n\nIn this lesson, assume White is on top (U) and Green is at the front (F).",
        allowFaceMoves: true,
        setup: (cube: CubeJSWrapper) => cube.reset(),
      });
      s.push({
        id: "notation-turns",
        title: "Turn Symbols",
        description:
          "Letter alone → 90° clockwise (looking at that face). Example: F\nLetter + prime (′) → 90° counter-clockwise. Example: F′\nLetter + 2 → 180° turn. Example: F2\nTry: F → F′ → F2, and watch each step confirm.",
        allowFaceMoves: true,
        setup: (cube: CubeJSWrapper) => cube.reset(),
      });
      s.push({
        id: "notation-example",
        title: "Example: R U R′ U′",
        description:
          "Practice this classic four-move pattern. Try: R → U → R′ → U′. Each correct move will tick off.",
        allowFaceMoves: true,
        setup: (cube: CubeJSWrapper) => cube.reset(),
      });
      s.push({
        id: "notation-example-2",
        title: "Harder: F R U R′ U′ F′",
        description:
          "A slightly longer pattern. Try: F → R → U → R′ → U′ → F′. Keep the same White-on-top, Green-in-front orientation.",
        allowFaceMoves: true,
        setup: (cube: CubeJSWrapper) => cube.reset(),
      });
      s.push({
        id: "notation-example-3",
        title: "Challenge: R U2 R′ U′",
        description:
          "Mix in a double turn. Try: R → U2 → R′ → U′. Notice how U2 is a 180° turn.",
        allowFaceMoves: true,
        setup: (cube: CubeJSWrapper) => cube.reset(),
      });
      // Slide 7: 10-step pattern (not just 5 forward + 5 inverse)
      s.push({
        id: "notation-10-step",
        title: "Ten-step pattern",
        description:
          "Try: F → U → R → U′ → R′ → F′ → R → U → R′ → U′.\nThis sequence isn’t just ‘first 5 then the reverse’—focus on reading each symbol.",
        allowFaceMoves: true,
        setup: (cube: CubeJSWrapper) => cube.reset(),
      });
      // Slide 8: Pro tip (orientation)
      s.push({
        id: "notation-protip",
        title: "Pro Tip",
        description:
          "Keep the same cube orientation while following moves.\nIf you get turned around, hit Reset and try again.",
        allowFaceMoves: false,
        setup: (cube: CubeJSWrapper) => cube.reset(),
      });
    } else if (lessonId === "white-cross") {
      s.push({
        id: "intro",
        title: "What we're aiming to achieve",
        description:
          "Your first goal is to create a white cross around the white center piece. Each white edge should match the color of the center piece on its side. Drag the cube to spin and see how the cross and matching edges look from different angles.",
        allowFaceMoves: false,
        setup: (cube: CubeJSWrapper) => {
          // Ensure a solved cube whenever we land on slide 1
          cube.reset();
        },
        // Lock cube: no orbit/spin allowed on this slide
        filter: (piece: CubeState) => {
          // Keep all centers
          const { x, y, z } = piece.position;
          const isCenter =
            [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
          if (isCenter) return true;
          // Keep only white edges (two-color pieces that include WHITE)
          const set = getCubieColorSet(piece);
          return set.size === 2 && set.has(CUBE_COLORS.WHITE);
        },
      });
      s.push({
        id: "find-green-white",
        title: "Target the green/white edge",
        description:
          "There are four white edge pieces to position around the white center. In this example, we’re focusing on the green/white edge piece. Notice how it should be placed so the white sticker matches the white center and the green sticker matches the green center.",
        allowFaceMoves: false,
        setup: (cube: CubeJSWrapper) => {
          // Ensure a solved cube whenever we land on slide 2
          cube.reset();
        },
        filter: (piece: CubeState) => {
          // Show centers and ALL white edges
          const { x, y, z } = piece.position;
          const isCenter =
            [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
          if (isCenter) {
            return true;
          }
          const set = getCubieColorSet(piece);
          return set.size === 2 && set.has(CUBE_COLORS.WHITE);
        },
      });
      // Step 3: F2 case (white sticker matches yellow center, green matches green center)
      s.push({
        id: "flip-green-white-f2",
        title: "Misoriented edge",
        description:
          "Here, the green/white edge is misoriented: the green sticker matches the green center, but the white sticker matches the yellow center. To correct this, perform F2 using the notation you've learned to position it between the white and green centers. Complete the sequence below, Reset and repeat a few times until it feels natural.",
        allowFaceMoves: true,
        setup: (cube: CubeJSWrapper) => {
          // Build the F2 case: white sticker matches yellow center, green matches green center
          cube.reset();
          cube.applyMoves(["F2"]); // F2 puts white on yellow, green on green
        },
        filter: (piece: CubeState) => {
          const { x, y, z } = piece.position;
          const isCenter =
            [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
          if (isCenter) return true;
          const set = getCubieColorSet(piece);
          return set.size === 2 && set.has(CUBE_COLORS.WHITE);
        },
      });

      // Step 4: Flipped case (white sticker matches green center, green matches white center)
      s.push({
        id: "flip-green-white",
        title: "Flipped edge",
        description:
          "Sometimes this edge is flipped: the white sticker faces the green center and the green sticker faces the white center. To flip it, perform F U' R U. Complete the sequence below, Reset and practice it a few times until you feel comfortable with it.",
        allowFaceMoves: true,
        setup: (cube: CubeJSWrapper) => {
          // Build the flipped case so that applying F U' R U' restores the edge
          cube.reset();
          cube.applyMoves(["F", "U'", "R", "U"]); // inverse of the teaching sequence
        },
        filter: (piece: CubeState) => {
          const { x, y, z } = piece.position;
          const isCenter =
            [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
          if (isCenter) return true;
          const set = getCubieColorSet(piece);
          return set.size === 2 && set.has(CUBE_COLORS.WHITE);
        },
      });

      // Step 5: Flipped & misoriented (piece is both flipped and misaligned)
      s.push({
        id: "flipped-misoriented-green-white",
        title: "Flipped & misoriented edge",
        description:
          "The green/white edge is both flipped and misoriented. Fix it in two parts: first do F2 to orient the edge between the white & green centers (like you learned in step 3), then do F U' R U to flip it (like you learned in step 4). Reset and practice both parts together until it sticks.",
        allowFaceMoves: true,
        setup: (cube: CubeJSWrapper) => {
          // Build the flipped & misoriented case: solved by F', U', R, U. Apply inverse: D', R', U, F
          cube.reset();
          cube.applyMoves(["U'", "R'", "U", "F"]);
        },
        filter: (piece: CubeState) => {
          const { x, y, z } = piece.position;
          const isCenter =
            [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
          if (isCenter) return true;
          const set = getCubieColorSet(piece);
          return set.size === 2 && set.has(CUBE_COLORS.WHITE);
        },
      });

      // Step 6: Misaligned on D-layer (edge lined up with red/yellow); solution D' F2
      s.push({
        id: "misaligned-green-white",
        title: "Misaligned edge",
        description:
          "In this example, the green/white edge piece is underneath the red center, which is wrong. We fix this in two parts: first do D' to align the edge with the green center, then do F2 to orient it into position. Complete the sequence below, then press Reset and practice both parts together until it sticks.",
        allowFaceMoves: true,
        setup: (cube: CubeJSWrapper) => {
          // Create a state that is solved by D' F2. Apply the inverse from solved: F2 D
          cube.reset();
          cube.applyMoves(["F2", "D"]);
        },
        filter: (piece: CubeState) => {
          const { x, y, z } = piece.position;
          const isCenter =
            [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
          if (isCenter) return true;
          const set = getCubieColorSet(piece);
          return set.size === 2 && set.has(CUBE_COLORS.WHITE);
        },
      });

      // Step 7: Flipped, misoriented & misaligned
      s.push({
        id: "flipped-misoriented-misaligned-green-white",
        title: "Flipped, misoriented & misaligned edge",
        description:
          "We can see in this example that the green/white edge piece is also underneath the red center, but it's flipped. We fix this in three parts: first D' to line up with green center, then F2 to rotate between green & white centers, then F' U' R U to orient it correctly. Work through each step below; press Reset and practice until it sticks.",
        allowFaceMoves: true,
        setup: (cube: CubeJSWrapper) => {
          cube.reset();
          cube.applyMoves(["U'", "R'", "U", "F", "D"]);
        },
        filter: (piece: CubeState) => {
          const { x, y, z } = piece.position;
          const isCenter =
            [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
          if (isCenter) return true;
          const set = getCubieColorSet(piece);
          return set.size === 2 && set.has(CUBE_COLORS.WHITE);
        },
      });

      // NEW Step 8: Mid-layer extraction case (edge trapped between blue/red centers)
      s.push({
        id: "midlayer-green-white-extraction",
        title: "Edge trapped in mid-layer",
        description:
          "The green/white edge is stuck in the middle layer between the blue and red centers. With red center facing front (towards you), do R' D' R. Then with green facing front, move the edge to meet green center with D' & then F2 to rotate into place. Again, practice this until it sticks.",
        allowFaceMoves: true,
        setup: (cube: CubeJSWrapper) => {
          cube.reset();
          // Build the trapped case (solved -> apply F2 D2 B)
          cube.applyMoves(["F2", "D", "B'", "D", "B"]);
        },
        filter: (piece: CubeState) => {
          const { x, y, z } = piece.position;
          const isCenter =
            [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
          if (isCenter) return true;
          const set = getCubieColorSet(piece);
          // Show all WHITE edges on this slide
          return set.size === 2 && set.has(CUBE_COLORS.WHITE);
        },
      });

      // Step 9: Recap & mental model
      s.push({
        id: "recap-mental-model",
        title: "Quick recap: the mental model",
        description:
          "A short recap of how to reason about the green/white edge.",
        allowFaceMoves: false,
        setup: (cube: CubeJSWrapper) => {
          // Keep the cube solved so we can talk through the idea clearly
          cube.reset();
        },
        filter: (piece: CubeState) => {
          // Keep all centers and all white edges highlighted for context
          const { x, y, z } = piece.position;
          const isCenter =
            [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
          if (isCenter) return true;
          const set = getCubieColorSet(piece);
          return set.size === 2 && set.has(CUBE_COLORS.WHITE);
        },
      });

      // Step 10: Free practice with 2 white edges out of place
      s.push({
        id: "practice-two-edges",
        title: "Practice: 2 white edges",
        description:
          "Now practice with 2 white edges out of place. Use the techniques you've learned to solve the white cross. If you get stuck, go back to previous slides to practice the individual cases.",
        allowFaceMoves: true,
        setup: (cube: CubeJSWrapper) => {
          // Start from solved, then apply the scramble to get red/white and green/white out of place
          cube.reset();
          cube.applyMoves(["F", "U'", "R", "U", "F2", "D2", "R2", "D'"]);
        },
        filter: (piece: CubeState) => {
          // Show all centers and all white edges
          const { x, y, z } = piece.position;
          const isCenter =
            [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
          if (isCenter) return true;
          const set = getCubieColorSet(piece);
          return set.size === 2 && set.has(CUBE_COLORS.WHITE);
        },
      });

      // Step 11: Free practice with 3 white edges out of place
      s.push({
        id: "practice-three-edges",
        title: "Practice: 3 white edges",
        description:
          "This is a bit trickier - there are 3 white edges that are out of place. Based on what you've learned, see if you can solve the cross. Remember, you can reset or go back to previous slides if you get stuck.",
        allowFaceMoves: true,
        setup: (cube: CubeJSWrapper) => {
          // Start from solved, then apply the advanced scramble
          cube.reset();
          cube.applyMoves([
            "F",
            "R2",
            "D'",
            "B",
            "L",
            "D'",
            "L'",
            "D",
            "L",
            "D",
            "L'",
            "B",
            "D2",
            "B'",
          ]);
        },
        filter: (piece: CubeState) => {
          // Show all centers and all white edges
          const { x, y, z } = piece.position;
          const isCenter =
            [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
          if (isCenter) return true;
          const set = getCubieColorSet(piece);
          return set.size === 2 && set.has(CUBE_COLORS.WHITE);
        },
      });

      // Step 12: Full cross challenge
      s.push({
        id: "practice-full-cross",
        title: "Final Challenge: Complete Cross",
        description:
          "This is a full cross challenge to see if you can solve the entire white cross based on what you've learned. Remember, you can reset or go back to previous slides to practice if you get stuck.",
        allowFaceMoves: true,
        setup: (cube: CubeJSWrapper) => {
          // Start from solved, then apply the full cross challenge scramble
          cube.reset();
          cube.applyMoves([
            "R",
            "D'",
            "B2",
            "R",
            "U",
            "R'",
            "B'",
            "D2",
            "R",
            "F'",
            "R",
            "D2",
            "L'",
            "D2",
            "B2",
            "L",
            "F",
            "U'",
            "F",
            "U'",
          ]);
        },
        filter: (piece: CubeState) => {
          // Show all centers and all white edges
          const { x, y, z } = piece.position;
          const isCenter =
            [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
          if (isCenter) return true;
          const set = getCubieColorSet(piece);
          return set.size === 2 && set.has(CUBE_COLORS.WHITE);
        },
      });
    } else if (lessonId === "white-corners") {
      s.push({
        id: "intro",
        title: "What we're aiming to achieve",
        description:
          "Now that you have a white cross, it's time to complete the white face by positioning the four white corner pieces. Each white corner should be positioned correctly with the white sticker on the bottom face, and the other two stickers matching their respective center colors. You should only be able to orbit the cube to see all the pieces that need to be positioned.",
        allowFaceMoves: false,
        setup: (cube: CubeJSWrapper) => {
          // Ensure a solved cube whenever we land on slide 1
          cube.reset();
        },
        filter: (piece: CubeState) => {
          // Keep all centers
          const { x, y, z } = piece.position;
          const isCenter =
            [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
          if (isCenter) return true;
          // Keep white edges (two-color pieces that include WHITE)
          const set = getCubieColorSet(piece);
          if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;
          // Keep white corners (three-color pieces that include WHITE)
          if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;
          return false;
        },
      });
      s.push({
        id: "mechanical-approach",
        title: "A more mechanical approach",
        description:
          "From this point forward, we'll take a more mechanical approach. Instead of intuitive problem-solving, we'll focus on recognizing specific scenarios and applying the correct algorithm to solve each piece. Here, we're focusing on the green/white/red corner piece - notice how it needs to be positioned between the green, red & white center pieces.",
        allowFaceMoves: true,
        setup: (cube: CubeJSWrapper) => {
          // Start with solved cube - visual spin will be applied separately
          cube.reset();
        },
        filter: (piece: CubeState) => {
          // Keep all centers
          const { x, y, z } = piece.position;
          const isCenter =
            [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
          if (isCenter) return true;
          // Keep white edges (two-color pieces that include WHITE)
          const set = getCubieColorSet(piece);
          if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;
          // Keep only the green/white/red corner (we'll focus on this specific piece)
          if (
            set.size === 3 &&
            set.has(CUBE_COLORS.WHITE) &&
            set.has(CUBE_COLORS.GREEN) &&
            set.has(CUBE_COLORS.RED)
          )
            return true;
          return false;
        },
      });
    }
    return s;
  }, [lessonId]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const activeSlide = slides[currentSlide];

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
      case "practice-two-edges":
      case "practice-three-edges":
      case "practice-full-cross":
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
      default:
        return [];
    }
  }, [activeSlide?.id]);

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
    setMidStage1Key(0);
    setMidStage2Key(0);
    setMidStage3Key(0);
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

  // Controls enable/disable (must be defined before effects/hooks that reference it)
  const handleOrbitControlsChange = useCallback(
    (enabled: boolean) => {
      if (isTransitioningRef.current) return;
      // Never enable orbits on the locked slide; otherwise keep orbit on for slides
      // that don't allow face moves (view-only), and defer to caller for others.
      let next: boolean;
      if (forceOrbitDisabledRef.current) {
        next = false;
      } else {
        const orbitLockedIds = new Set(["find-green-white", "notation-protip"]);
        if (activeSlide?.id && orbitLockedIds.has(activeSlide.id)) {
          next = false;
        } else if (activeSlide && !activeSlide.allowFaceMoves) {
          next = true;
        } else {
          next = enabled;
        }
      }
      setOrbitControlsEnabled(next);
      if (orbitControlsRef.current) {
        orbitControlsRef.current.enabled = next;
        if (typeof orbitControlsRef.current.update === "function") {
          orbitControlsRef.current.update();
        }
      }
    },
    [activeSlide]
  );
  const disableOrbitTemporarily = useCallback(() => {
    const controls: any = orbitControlsRef.current;
    if (!controls) return;
    // If we're already in a controlled transition, don't re-snapshot/override
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    orbitPrevRef.current = {
      enabled: Boolean(controls.enabled),
      noRotate: Boolean(controls.noRotate),
      damping: Number(controls.dynamicDampingFactor ?? 0.35),
      staticMoving: Boolean(controls.staticMoving),
      rotateSpeed: Number(controls.rotateSpeed ?? 1.2),
    };
    // Fully disable user input and internal momentum
    controls.enabled = false;
    controls.noRotate = true;
    if (typeof controls.staticMoving === "boolean")
      controls.staticMoving = true;
    if (typeof controls.dynamicDampingFactor === "number")
      controls.dynamicDampingFactor = 0;
    if (typeof controls.rotateSpeed === "number") controls.rotateSpeed = 0;
    if (typeof controls.update === "function") controls.update();
  }, []);

  // Utility: clear TrackballControls internal deltas/state to avoid momentum snaps
  const clearControlsInternal = useCallback(() => {
    const controls: any = orbitControlsRef.current;
    if (!controls) return;
    // TrackballControls internals
    if (controls.movePrev?.set) controls.movePrev.set(0, 0);
    if (controls.moveCurr?.set) controls.moveCurr.set(0, 0);
    if (controls.lastAxis?.set) controls.lastAxis.set(0, 0, 0);
    if (typeof controls.lastAngle === "number") controls.lastAngle = 0;
    if (typeof controls.touchZoomDistanceStart === "number")
      controls.touchZoomDistanceStart = 0;
    if (typeof controls.touchZoomDistanceEnd === "number")
      controls.touchZoomDistanceEnd = 0;
    if (controls.panStart?.set) controls.panStart.set(0, 0);
    if (controls.panEnd?.set) controls.panEnd.set(0, 0);
    if (controls.zoomStart?.set) controls.zoomStart.set(0, 0);
    if (controls.zoomEnd?.set) controls.zoomEnd.set(0, 0);
    // OrbitControls fields (noop for Trackball, safe to set)
    if (controls.rotateStart?.set) controls.rotateStart.set(0, 0);
    if (controls.rotateEnd?.set) controls.rotateEnd.set(0, 0);
    if (typeof controls.state !== "undefined") controls.state = -1; // STATE.NONE
    // Sync lastPosition/quaternion to current camera to avoid immediate correction
    if (controls.object) {
      if (controls.lastPosition?.copy)
        controls.lastPosition.copy(controls.object.position);
      if (controls.lastQuaternion?.copy)
        controls.lastQuaternion.copy(controls.object.quaternion);
    }
    if (controls.update) controls.update();
  }, []);

  // (Removed camera direction tween to avoid double transitions)

  // When changing slides, animate the cube back to its original orientation (like timer flows)
  const prevSlideRef = useRef<number>(0);
  useEffect(() => {
    if (!cubeViewRef.current) return;
    // Skip initial mount
    if (prevSlideRef.current === currentSlide) return;
    prevSlideRef.current = currentSlide;
    // Bump transition token so only the latest completion callback applies
    const myTransitionId = ++transitionIdRef.current;
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

      // Choose a final facing via yaw offset during reset (single transition)
      const slide = slides[currentSlide];
      if (
        slide?.id === "intro" ||
        slide?.id === "misaligned-green-white" ||
        slide?.id === "flipped-misoriented-misaligned-green-white"
      ) {
        // Explicit -45deg yaw to standardize the facing on the faces slide
        c.__resetOpts = { extraYawRad: (Math.PI / 180) * -45 };
      } else if (
        slide?.id === "find-green-white" ||
        slide?.id === "flip-green-white" ||
        slide?.id === "flip-green-white-f2" ||
        slide?.id === "flipped-misoriented-green-white" ||
        slide?.id === "notation-faces"
      ) {
        // Face more toward green (left along cube Y): stronger negative yaw
        c.__resetOpts = { extraYawRad: 0 };
      }
    }
    cubeViewRef.current.resetToInitialPosition(
      orbitControlsRef,
      cubeRef,
      () => {
        // Ignore callbacks from stale transitions
        if (transitionIdRef.current !== myTransitionId) return;
        // Re-evaluate input rules for the new slide after reset completes
        const slide = slides[currentSlide];
        const controls: any = orbitControlsRef.current;
        const orbitLockedIds = new Set(["find-green-white", "notation-protip"]);
        const goingToLocked = slide?.id ? orbitLockedIds.has(slide.id) : false;
        setInputDisabled(goingToLocked || !!isResetting);
        // Explicitly set final orbit state to avoid races
        if (controls) {
          if (goingToLocked) {
            controls.enabled = false;
            controls.noRotate = true;
            if (typeof controls.staticMoving === "boolean")
              controls.staticMoving = true;
            if (typeof controls.dynamicDampingFactor === "number")
              controls.dynamicDampingFactor = 0;
            if (typeof controls.rotateSpeed === "number")
              controls.rotateSpeed = 0;
            setOrbitControlsEnabled(false);
          } else {
            controls.enabled = true;
            controls.noRotate = false;
            if (typeof controls.staticMoving === "boolean")
              controls.staticMoving = false;
            if (typeof controls.dynamicDampingFactor === "number")
              controls.dynamicDampingFactor = 0.35;
            if (typeof controls.rotateSpeed === "number")
              controls.rotateSpeed = 1.2;
            setOrbitControlsEnabled(true);
          }
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

  // Build tutorial cube view based on lesson/slide filter
  useEffect(() => {
    const base = createTutorialCubeState(lessonId, cube3D);
    if (activeSlide?.filter) {
      const grey = "#808080";
      const filtered = base.map((layer) =>
        layer.map((row) =>
          row.map((piece) => {
            const visible = activeSlide.filter!(piece);
            return {
              ...piece,
              colors: visible
                ? { ...piece.colors }
                : {
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
      setTutorialCube3D(filtered);
    } else {
      setTutorialCube3D(base);
    }
  }, [lessonId, cube3D, activeSlide]);

  // Enforce slide interaction rules and lock/allow per slide
  useEffect(() => {
    if (!activeSlide) return;
    // Slide 2: lock cube completely
    if (activeSlide.id === "find-green-white") {
      setInputDisabled(true);
      setOrbitControlsEnabled(false);
    } else if (
      (activeSlide.id === "practice-two-edges" ||
        activeSlide.id === "practice-three-edges" ||
        activeSlide.id === "practice-full-cross") &&
      practiceCompleted
    ) {
      // Practice slide when completed: disable face moves but allow orbit
      setInputDisabled(true);
      setOrbitControlsEnabled(true);
    } else {
      // Slide 1 (intro): allow orbit spin but no face moves
      // Slide 3+: fully interactive per allowFaceMoves
      // Practice slide: also disable when completed
      const isPracticeSlide =
        activeSlide.id === "practice-two-edges" ||
        activeSlide.id === "practice-three-edges" ||
        activeSlide.id === "practice-full-cross";
      const shouldDisableInput =
        !activeSlide.allowFaceMoves || (isPracticeSlide && practiceCompleted);

      setInputDisabled(shouldDisableInput);
      setOrbitControlsEnabled(true);
    }
  }, [activeSlide, isResetting, practiceCompleted]);

  // Optional per-slide setup (instant)
  useEffect(() => {
    // Reset setup state when slide changes
    setPracticeSetupComplete(false);

    if (!activeSlide || !activeSlide.setup) return;
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

    // Mark setup complete after a short delay to ensure scramble is applied
    setTimeout(() => {
      setPracticeSetupComplete(true);
    }, 100);
    setPracticeTickProgress(false);
    setPracticeTickLine(false);
  }, [activeSlide]);

  // (moved handleOrbitControlsChange above)
  // Trigger a move via buttons/drag
  const handleButtonMove = useCallback(
    (move: string) => {
      // Block manual move buttons after Fix completion or practice completion
      if (fixCompleted) return;
      const isPracticeSlide =
        activeSlide?.id === "practice-two-edges" ||
        activeSlide?.id === "practice-three-edges" ||
        activeSlide?.id === "practice-full-cross";
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
    setIsResetting(true);
    isResettingRef.current = true;
    // Cancel any in-flight or queued move to avoid races with baseline reset
    setPendingMove(null);
    setIsAnimating(false);
    isAnimatingRef.current = false;
    // Clear Fix progress
    setFixIndex(0);
    setFixDoublePartialDir(0);
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
    setMidStage1Key(0);
    setMidStage2Key(0);
    setMidStage3Key(0);
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
    // Re-run slide setup to reconstruct baseline
    slide?.setup?.(cubeRef.current);
    setCube3D(cubejsTo3D(cubeRef.current.getCube()));

    // For practice slides, mark setup complete after a short delay
    if (
      slide?.id === "practice-two-edges" ||
      slide?.id === "practice-three-edges" ||
      slide?.id === "practice-full-cross"
    ) {
      setTimeout(() => {
        setPracticeSetupComplete(true);
      }, 100);
    }

    // Clear history and any pending queues
    setMoveHistory([]);
    setHistoryIndex(-1);
    moveHistoryRef.current = [];
    historyIndexRef.current = -1;
    setResetQueue(null);
    resetIndexRef.current = 0;
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
      // Match slide-facing rules
      if (
        slide?.id === "intro" ||
        slide?.id === "misaligned-green-white" ||
        slide?.id === "flipped-misoriented-misaligned-green-white"
      ) {
        // Explicit -45deg yaw for faces slide to standardize orientation
        c.__resetOpts = { extraYawRad: (Math.PI / 180) * -45 };
      } else if (
        slide?.id === "find-green-white" ||
        slide?.id === "flip-green-white" ||
        slide?.id === "flip-green-white-f2" ||
        slide?.id === "flipped-misoriented-green-white" ||
        slide?.id === "notation-faces"
      ) {
        c.__resetOpts = { extraYawRad: 0 };
      }
    }
    cubeViewRef.current?.resetToInitialPosition(
      orbitControlsRef,
      cubeRef,
      () => {
        if (transitionIdRef.current !== myTransitionId) return;
        const s = slides[currentSlide];
        const controls: any = orbitControlsRef.current;
        const orbitLockedIds = new Set(["find-green-white", "notation-protip"]);
        const goingToLocked = s?.id ? orbitLockedIds.has(s.id) : false;
        setInputDisabled(goingToLocked || !!isResettingRef.current);
        if (controls) {
          if (goingToLocked) {
            controls.enabled = false;
            controls.noRotate = true;
            if (typeof controls.staticMoving === "boolean")
              controls.staticMoving = true;
            if (typeof controls.dynamicDampingFactor === "number")
              controls.dynamicDampingFactor = 0;
            if (typeof controls.rotateSpeed === "number")
              controls.rotateSpeed = 0;
            setOrbitControlsEnabled(false);
          } else {
            controls.enabled = true;
            controls.noRotate = false;
            if (typeof controls.staticMoving === "boolean")
              controls.staticMoving = false;
            if (typeof controls.dynamicDampingFactor === "number")
              controls.dynamicDampingFactor = 0.35;
            if (typeof controls.rotateSpeed === "number")
              controls.rotateSpeed = 1.2;
            setOrbitControlsEnabled(true);
          }
          if (typeof controls.update === "function") controls.update();
        }
        // End transition
        orbitPrevRef.current = null;
        isTransitioningRef.current = false;
        setIsResetting(false);
        isResettingRef.current = false;
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
        if (activeSlide?.id !== "midlayer-green-white-extraction" || played)
          return;
        setKey((k) => k + 1);
        setProgress(false);
        setLine(false);
        setTimeout(() => setProgress(true), 50); // circle draws
        setTimeout(() => setLine(true), 300); // checkmark draws
        setTimeout(() => setPlayed(true), 700); // mark done
      };
      const animateMidlayerStage = (stage: 1 | 2 | 3) => {
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
        else
          runStageAnimation(
            midStage3Played,
            setMidStage3Key,
            setMidStage3Progress,
            setMidStage3Line,
            setMidStage3Played
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
        cubeRef.current.move(move);
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
      if (fixSequence.length > 0 && wasManual) {
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
          return m;
        };

        const expected = fixSequence[fixIndex];
        if (!expected) {
          // Already complete; ignore
          return;
        }
        const exp = parseMove(expected);
        const got = parseMove(mapMidlayerConceptual(move as string));

        const resetWithError = async () => {
          setFixErrorPulse(true);
          setTimeout(() => setFixErrorPulse(false), 600);
          setFixIndex(0);
          setFixDoublePartialDir(0);
          setFixShowTick(false);
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
              if (fixIndex + 1 >= fixSequence.length) triggerFixTick();
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
    if (!cube3D) return false;

    // First, find which face has the white center
    const centerPositions = [
      { pos: [2, 1, 1], face: "right" as const },
      { pos: [0, 1, 1], face: "left" as const },
      { pos: [1, 2, 1], face: "top" as const },
      { pos: [1, 0, 1], face: "bottom" as const },
      { pos: [1, 1, 2], face: "front" as const },
      { pos: [1, 1, 0], face: "back" as const },
    ];

    let whiteFace: string | null = null;
    let whiteCenterPos: [number, number, number] | null = null;

    for (const { pos, face } of centerPositions) {
      const [x, y, z] = pos;
      const centerPiece = cube3D[x][y][z];
      if (centerPiece.colors[face] === CUBE_COLORS.WHITE) {
        whiteFace = face;
        whiteCenterPos = pos as [number, number, number];
        break;
      }
    }

    if (!whiteFace || !whiteCenterPos) return false;

    // Define the edge positions and their expected colors for each face
    const edgeConfig: Record<
      string,
      Array<{
        pos: [number, number, number];
        whiteFaceKey: keyof CubeState["colors"];
        colorFaceKey: keyof CubeState["colors"];
        expectedColor: string;
      }>
    > = {
      bottom: [
        {
          pos: [1, 0, 0],
          whiteFaceKey: "bottom",
          colorFaceKey: "back",
          expectedColor: CUBE_COLORS.BLUE,
        },
        {
          pos: [0, 1, 0],
          whiteFaceKey: "bottom",
          colorFaceKey: "left",
          expectedColor: CUBE_COLORS.ORANGE,
        },
        {
          pos: [2, 1, 0],
          whiteFaceKey: "bottom",
          colorFaceKey: "right",
          expectedColor: CUBE_COLORS.RED,
        },
        {
          pos: [1, 2, 0],
          whiteFaceKey: "bottom",
          colorFaceKey: "front",
          expectedColor: CUBE_COLORS.GREEN,
        },
      ],
      top: [
        {
          pos: [1, 2, 2],
          whiteFaceKey: "top",
          colorFaceKey: "front",
          expectedColor: CUBE_COLORS.GREEN,
        },
        {
          pos: [0, 2, 1],
          whiteFaceKey: "top",
          colorFaceKey: "left",
          expectedColor: CUBE_COLORS.ORANGE,
        },
        {
          pos: [2, 2, 1],
          whiteFaceKey: "top",
          colorFaceKey: "right",
          expectedColor: CUBE_COLORS.RED,
        },
        {
          pos: [1, 2, 0],
          whiteFaceKey: "top",
          colorFaceKey: "back",
          expectedColor: CUBE_COLORS.BLUE,
        },
      ],
      front: [
        {
          pos: [1, 0, 2],
          whiteFaceKey: "front",
          colorFaceKey: "bottom",
          expectedColor: CUBE_COLORS.YELLOW,
        },
        {
          pos: [0, 1, 2],
          whiteFaceKey: "front",
          colorFaceKey: "left",
          expectedColor: CUBE_COLORS.ORANGE,
        },
        {
          pos: [2, 1, 2],
          whiteFaceKey: "front",
          colorFaceKey: "right",
          expectedColor: CUBE_COLORS.RED,
        },
        {
          pos: [1, 2, 2],
          whiteFaceKey: "front",
          colorFaceKey: "top",
          expectedColor: CUBE_COLORS.WHITE,
        },
      ],
      back: [
        {
          pos: [1, 2, 0],
          whiteFaceKey: "back",
          colorFaceKey: "top",
          expectedColor: CUBE_COLORS.WHITE,
        },
        {
          pos: [0, 1, 0],
          whiteFaceKey: "back",
          colorFaceKey: "left",
          expectedColor: CUBE_COLORS.ORANGE,
        },
        {
          pos: [2, 1, 0],
          whiteFaceKey: "back",
          colorFaceKey: "right",
          expectedColor: CUBE_COLORS.RED,
        },
        {
          pos: [1, 0, 0],
          whiteFaceKey: "back",
          colorFaceKey: "bottom",
          expectedColor: CUBE_COLORS.YELLOW,
        },
      ],
      left: [
        {
          pos: [0, 0, 1],
          whiteFaceKey: "left",
          colorFaceKey: "bottom",
          expectedColor: CUBE_COLORS.YELLOW,
        },
        {
          pos: [0, 1, 0],
          whiteFaceKey: "left",
          colorFaceKey: "back",
          expectedColor: CUBE_COLORS.BLUE,
        },
        {
          pos: [0, 1, 2],
          whiteFaceKey: "left",
          colorFaceKey: "front",
          expectedColor: CUBE_COLORS.GREEN,
        },
        {
          pos: [0, 2, 1],
          whiteFaceKey: "left",
          colorFaceKey: "top",
          expectedColor: CUBE_COLORS.WHITE,
        },
      ],
      right: [
        {
          pos: [2, 2, 1],
          whiteFaceKey: "right",
          colorFaceKey: "top",
          expectedColor: CUBE_COLORS.WHITE,
        },
        {
          pos: [2, 1, 2],
          whiteFaceKey: "right",
          colorFaceKey: "front",
          expectedColor: CUBE_COLORS.GREEN,
        },
        {
          pos: [2, 1, 0],
          whiteFaceKey: "right",
          colorFaceKey: "back",
          expectedColor: CUBE_COLORS.BLUE,
        },
        {
          pos: [2, 0, 1],
          whiteFaceKey: "right",
          colorFaceKey: "bottom",
          expectedColor: CUBE_COLORS.YELLOW,
        },
      ],
    };

    const edges = edgeConfig[whiteFace];
    if (!edges) return false;

    // Check all four edges around the white center
    for (const { pos, whiteFaceKey, colorFaceKey, expectedColor } of edges) {
      const [x, y, z] = pos;
      const edgePiece = cube3D[x][y][z];

      // Check that the white face sticker is actually white
      if (edgePiece.colors[whiteFaceKey] !== CUBE_COLORS.WHITE) {
        return false;
      }

      // Check that the colored sticker matches the expected center color
      if (edgePiece.colors[colorFaceKey] !== expectedColor) {
        return false;
      }
    }

    return true;
  }, [cube3D]);

  // Monitor practice slide completion
  useEffect(() => {
    const isPracticeSlide =
      activeSlide?.id === "practice-two-edges" ||
      activeSlide?.id === "practice-three-edges" ||
      activeSlide?.id === "practice-full-cross";
    if (!isPracticeSlide) return;
    if (!practiceSetupComplete) return; // Wait for setup to complete

    const crossSolved = isWhiteCrossSolved();

    // Record the initial state after setup
    if (practiceInitialCrossState === null) {
      setPracticeInitialCrossState(crossSolved);
      return; // Don't process completion on initial state
    }

    // Only mark as completed if:
    // 1. Cross is now solved AND
    // 2. Either it wasn't initially solved, OR the user has made moves (indicating active solving)
    if (crossSolved && !practiceCompleted) {
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
    practiceCompleted,
    practiceSetupComplete,
    practiceInitialCrossState,
    moveHistory.length,
  ]);

  // Removed old findGreenWhiteEdgeIndex; now we highlight all four white edges instead

  // Find all WHITE + (GREEN|RED|BLUE|ORANGE) edge cubie indices
  const findWhiteEdgeIndices = useCallback((): Array<
    [number, number, number]
  > => {
    const allowed = new Set([
      CUBE_COLORS.GREEN,
      CUBE_COLORS.RED,
      CUBE_COLORS.BLUE,
      CUBE_COLORS.ORANGE,
    ]);
    const out: Array<[number, number, number]> = [];
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
          const piece = cube3D[x][y][z];
          const colors = getCubieColorSet(piece);
          if (
            colors.size === 2 &&
            colors.has(CUBE_COLORS.WHITE) &&
            [...colors].some((c) => allowed.has(c) && c !== CUBE_COLORS.WHITE)
          ) {
            out.push([x, y, z]);
          }
        }
      }
    }
    return out;
  }, [cube3D]);

  const findWhiteCornerIndices = useCallback((): Array<
    [number, number, number]
  > => {
    const allowed = new Set([
      CUBE_COLORS.GREEN,
      CUBE_COLORS.RED,
      CUBE_COLORS.BLUE,
      CUBE_COLORS.ORANGE,
    ]);
    const out: Array<[number, number, number]> = [];
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
          const piece = cube3D[x][y][z];
          const colors = getCubieColorSet(piece);
          if (
            colors.size === 3 &&
            colors.has(CUBE_COLORS.WHITE) &&
            [...colors].filter((c) => allowed.has(c) && c !== CUBE_COLORS.WHITE)
              .length === 2
          ) {
            out.push([x, y, z]);
          }
        }
      }
    }
    return out;
  }, [cube3D]);

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
          activeSlide?.id === "recap-mental-model"
            ? "h-[100dvh] overflow-hidden"
            : "overflow-hidden"
        }`}
      >
        {/* Lesson content sidebar - responsive (hidden on recap slide) */}
        {activeSlide?.id !== "recap-mental-model" && (
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

        {/* Viewer area: either the 3D canvas or the recap content */}
        <div className="flex-1 relative min-h-0">
          {activeSlide?.id === "recap-mental-model" ? (
            <div className="relative w-full h-full">
              {/* Background cube */}
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
                    camera={{ position: [4, 4, 4], fov: 60 }}
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
                        activeSlide?.id === "practice-full-cross";
                      const dragAllowed =
                        !!activeSlide?.allowFaceMoves &&
                        !(isPracticeSlide && practiceCompleted) &&
                        !fixCompleted;
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
                    <ambientLight intensity={0.95} color={CUBE_COLORS.WHITE} />
                    <TrackballControls
                      ref={orbitControlsRef}
                      enabled={orbitControlsEnabled}
                      noRotate={!orbitControlsEnabled}
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
                      onOrbitControlsChange={handleOrbitControlsChange}
                      onDragMove={handleButtonMove}
                      isTimerMode={false}
                      moveSource={lastMoveSourceRef.current}
                      queueFast={queueFast}
                      queueFastMs={queueFastMs}
                      inputDisabled={true}
                      disableSliceDrag={true}
                      preventSliceMoves={true}
                      highlightIntensity={(() => {
                        const ids = new Set([
                          "find-green-white",
                          "flip-green-white",
                          "flip-green-white-f2",
                          "misaligned-green-white",
                          "flipped-misoriented-green-white",
                          "flipped-misoriented-misaligned-green-white",
                          "midlayer-green-white-extraction",
                          "practice-two-edges",
                        ]);
                        return activeSlide?.id && ids.has(activeSlide.id)
                          ? 1
                          : 0;
                      })()}
                      dullOthersIntensity={0}
                    />
                  </Canvas>
                </div>
              </div>

              {/* Scrollable recap overlay */}
              <div className="absolute inset-0 z-30 overflow-y-auto">
                <div className="max-w-3xl mx-auto p-5 md:p-8 pb-[calc(env(safe-area-inset-bottom,0px)+96px)] md:pb-[calc(env(safe-area-inset-bottom,0px)+112px)] text-gray-800 bg-white/95 backdrop-blur">
                  <div className="mb-2">
                    <span className="block text-lg md:text-xl font-bold uppercase tracking-wide text-blue-600 mb-2">
                      QUICK RECAP – Green/White Edge
                    </span>
                    <p className="text-sm md:text-base text-gray-700 mb-4">
                      You may have already noticed that some cases in previous
                      slides can be solved in fewer moves, but shortcuts aren’t
                      the focus here. The key idea is simple: remove from
                      incorrect middle/top layer (if necessary), align the edge
                      with green, place it between the green and white center
                      pieces, and then fix its orientation if needed. We use
                      this method because it’s easier to remember and helps keep
                      the other correctly placed white edge pieces in position.
                    </p>
                  </div>

                  <p className="text-sm md:text-base font-semibold mb-2">
                    Steps:
                  </p>
                  <ul className="list-decimal pl-6 space-y-2 text-sm md:text-base leading-relaxed">
                    <li>
                      <strong>Extract (if stuck):</strong> If the green/white
                      edge is trapped in the middle layer or sitting in the top
                      layer but not above the green center, first free it. Use{" "}
                      <code>R' D' R</code> to pull it out of the middle layer
                      into the top layer. If it’s already on the right face of
                      the top layer but over the wrong center, do
                      <code> R2</code> (optionally followed by a <code>U</code>/
                      <code>U'</code> turn) so you can realign it in front.
                    </li>
                    <li>
                      <strong>Align:</strong> Rotate <code>D</code> until the
                      green/white edge is under the green center.
                    </li>
                    <li>
                      <strong>Place:</strong> Do <code>F2</code> to move it
                      between the green and white centers.
                    </li>
                    <li>
                      <strong>Flip (if needed):</strong> If white isn’t facing
                      the white center, repeat <code>F U’ R U</code> until it
                      is.
                    </li>
                  </ul>

                  <p className="mt-4 text-sm md:text-base text-gray-700">
                    <strong>Why it works:</strong> The quick extraction puts the
                    edge into a predictable top-layer position so every case
                    funnels into the same simple flow. Aligning under green
                    standardizes setup. <code>F2</code> solves upside- down
                    edges immediately. <code>F U’ R U</code> then flips any
                    sideways edge without disturbing solved white pieces because
                    the working slot is reused and restored each time.
                  </p>
                </div>
              </div>
              {/* Slide 8 fixed footer via portal for robust mobile behavior */}
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
                            className="px-3 py-1 text-sm"
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
                            className="px-3 py-1 text-sm"
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
          ) : (
            <>
              <div
                ref={cubeContainerRef}
                className="relative w-full h-full bg-black/20 backdrop-blur-sm border border-white/20"
              >
                {/* Status indicator for practice slides */}
                {(activeSlide?.id === "practice-two-edges" ||
                  activeSlide?.id === "practice-three-edges" ||
                  activeSlide?.id === "practice-full-cross") && (
                  <div className="absolute top-4 left-4 z-50">
                    <div
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-sm ${
                        isWhiteCrossSolved()
                          ? "bg-green-100/90 border-green-300 text-green-800"
                          : "bg-red-100/90 border-red-300 text-red-800"
                      }`}
                    >
                      {isWhiteCrossSolved() ? (
                        practiceShowTick ? (
                          <div className="relative w-4 h-4">
                            <svg
                              key={practiceTickAnimKey}
                              className="w-4 h-4 transform -rotate-90"
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
                                className="text-green-600"
                                style={{
                                  strokeDasharray: "63",
                                  strokeDashoffset: practiceTickProgress
                                    ? 0
                                    : 63,
                                  transition:
                                    "stroke-dashoffset 0.4s ease-in-out",
                                }}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-green-600"
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
                                    strokeDashoffset: practiceTickLine ? 0 : 20,
                                    transition:
                                      "stroke-dashoffset 0.5s ease-out",
                                  }}
                                />
                              </svg>
                            </div>
                          </div>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                      <span className="font-medium text-sm">
                        {isWhiteCrossSolved() ? "Solved" : "Not solved"}
                      </span>
                    </div>
                  </div>
                )}
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
                        activeSlide?.id === "practice-full-cross";
                      const dragAllowed =
                        !!activeSlide?.allowFaceMoves &&
                        !(isPracticeSlide && practiceCompleted) &&
                        !fixCompleted;
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
                    <ambientLight intensity={1.1} color={CUBE_COLORS.WHITE} />
                    <TrackballControls
                      ref={orbitControlsRef}
                      enabled={(() => {
                        const lock = new Set([
                          "find-green-white",
                          "notation-protip",
                        ]);
                        const isLocked = activeSlide?.id
                          ? lock.has(activeSlide.id)
                          : false;
                        return isLocked ? false : orbitControlsEnabled;
                      })()}
                      noRotate={(() => {
                        const lock = new Set([
                          "find-green-white",
                          "notation-protip",
                        ]);
                        const isLocked = activeSlide?.id
                          ? lock.has(activeSlide.id)
                          : false;
                        return isLocked ? true : !orbitControlsEnabled;
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
                      onOrbitControlsChange={handleOrbitControlsChange}
                      onDragMove={handleButtonMove}
                      isTimerMode={false}
                      moveSource={lastMoveSourceRef.current}
                      queueFast={queueFast}
                      queueFastMs={queueFastMs}
                      inputDisabled={activeSlide?.id === "find-green-white"}
                      disableSliceDrag={
                        activeSlide?.id === "intro" ||
                        fixCompleted ||
                        ((activeSlide?.id === "practice-two-edges" ||
                          activeSlide?.id === "practice-three-edges" ||
                          activeSlide?.id === "practice-full-cross") &&
                          practiceCompleted)
                      }
                      preventSliceMoves={
                        !activeSlide?.allowFaceMoves ||
                        ((activeSlide?.id === "practice-two-edges" ||
                          activeSlide?.id === "practice-three-edges" ||
                          activeSlide?.id === "practice-full-cross") &&
                          practiceCompleted)
                      }
                      highlightPositions={(() => {
                        const highlightIds = new Set([
                          "find-green-white",
                          "flip-green-white",
                          "flip-green-white-f2",
                          "misaligned-green-white",
                          "flipped-misoriented-green-white",
                          "flipped-misoriented-misaligned-green-white",
                          "midlayer-green-white-extraction",
                          "practice-two-edges",
                          "practice-three-edges",
                          "practice-full-cross",
                        ]);

                        // White corners lesson highlighting
                        const whiteCornersIds = new Set([
                          "intro", // for white-corners lesson
                          "mechanical-approach", // for white-corners lesson
                        ]);

                        if (
                          lessonId === "white-cross" &&
                          activeSlide?.id &&
                          highlightIds.has(activeSlide.id)
                        ) {
                          // Always include centers to avoid dulling them; add all four white edges
                          const centers: Array<[number, number, number]> = [
                            [0, 1, 1],
                            [2, 1, 1],
                            [1, 0, 1],
                            [1, 2, 1],
                            [1, 1, 0],
                            [1, 1, 2],
                          ];
                          const edges = findWhiteEdgeIndices();
                          return [...edges, ...centers];
                        } else if (
                          lessonId === "white-corners" &&
                          activeSlide?.id &&
                          whiteCornersIds.has(activeSlide.id)
                        ) {
                          // Include centers and white edges for both slides
                          const centers: Array<[number, number, number]> = [
                            [0, 1, 1],
                            [2, 1, 1],
                            [1, 0, 1],
                            [1, 2, 1],
                            [1, 1, 0],
                            [1, 1, 2],
                          ];
                          const edges = findWhiteEdgeIndices();

                          if (activeSlide.id === "intro") {
                            // Show all white corners on intro slide
                            const corners = findWhiteCornerIndices();
                            return [...edges, ...corners, ...centers];
                          } else if (activeSlide.id === "mechanical-approach") {
                            // Show only green/white/red corner on mechanical approach slide
                            const corners = findWhiteCornerIndices();
                            const greenWhiteRedCorner = corners.find(
                              ([x, y, z]) => {
                                const piece = cube3D[x][y][z];
                                const set = getCubieColorSet(piece);
                                return (
                                  set.has(CUBE_COLORS.WHITE) &&
                                  set.has(CUBE_COLORS.GREEN) &&
                                  set.has(CUBE_COLORS.RED)
                                );
                              }
                            );
                            return greenWhiteRedCorner
                              ? [...edges, ...centers, greenWhiteRedCorner]
                              : [...edges, ...centers];
                          }

                          return [...edges, ...centers];
                        }

                        return undefined;
                      })()}
                      highlightIntensity={0}
                      dullOthersIntensity={(() => {
                        const dullIds = new Set([
                          "find-green-white",
                          "flip-green-white",
                          "flip-green-white-f2",
                          "misaligned-green-white",
                          "flipped-misoriented-green-white",
                          "flipped-misoriented-misaligned-green-white",
                          "midlayer-green-white-extraction",
                          "practice-two-edges",
                          "practice-three-edges",
                          "practice-full-cross",
                        ]);

                        // White corners lesson dulling
                        const whiteCornersIds = new Set([
                          "intro", // for white-corners lesson
                          "mechanical-approach", // for white-corners lesson
                        ]);

                        if (
                          lessonId === "white-cross" &&
                          activeSlide?.id &&
                          dullIds.has(activeSlide.id)
                        ) {
                          return 0.45;
                        } else if (
                          lessonId === "white-corners" &&
                          activeSlide?.id &&
                          whiteCornersIds.has(activeSlide.id)
                        ) {
                          return 0.45;
                        }

                        return 0;
                      })()}
                      // dulledPositions prop removed; rely on filter logic for dulling
                    />
                  </Canvas>
                </div>
                {/* Overlay controls anchored to cube view corners */}
                <div className="pointer-events-none absolute inset-0">
                  {/* Hard lock overlay to swallow all pointer events on locked slide */}
                  {activeSlide?.id === "find-green-white" && (
                    <div
                      className="absolute inset-0 z-40 pointer-events-auto"
                      data-locked-overlay="true"
                      data-locked-overlay-type="slide"
                      data-locked-overlay-visible="true"
                      data-locked-overlay-id="find-green-white"
                      data-locked-overlay-position="full"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onPointerMove={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onPointerUp={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onWheel={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                      }}
                      // Transparent overlay; cursor indicates locked state
                      style={{
                        cursor: "not-allowed",
                        background: "transparent",
                      }}
                      aria-hidden
                    />
                  )}
                  {/* Undo/Redo removed for tutorial */}
                  {/* Reset Cube top-right (strictly hidden on slides 1 & 2) */}
                  {currentSlide >= 2 && (
                    <div className="absolute bottom-4 left-2 md:left-4 z-30 pointer-events-auto">
                      <button
                        onClick={async () => {
                          await resetToSlideBaseline();
                        }}
                        className="px-3 md:px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 transition-all text-xs md:text-sm flex items-center justify-center"
                        title="Reset cube to solved state"
                        disabled={
                          isAnimating ||
                          isResetting ||
                          (![
                            "flip-green-white-f2",
                            "misaligned-green-white",
                            "flip-green-white",
                            "flipped-misoriented-green-white",
                            "flipped-misoriented-misaligned-green-white",
                            "midlayer-green-white-extraction",
                            "practice-two-edges",
                            "practice-three-edges",
                            "practice-full-cross",
                          ].includes(activeSlide?.id) &&
                            isSolved())
                        }
                      >
                        {isResetting ? (
                          <span className="w-4 h-4 mr-2 border-2 border-gray-200 border-t-2 border-t-white rounded-full animate-spin"></span>
                        ) : null}
                        Reset Cube
                      </button>
                    </div>
                  )}
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
                            base +
                            "border border-red-400 bg-red-50 text-red-700"
                          );
                        }
                        if (inProgress) {
                          return base + " border-blue-500 text-blue-200"; // darker border while active
                        }
                        return base + " border-blue-300 text-blue-200";
                      })()}
                      style={{ minWidth: "140px" }}
                    >
                      <span className="text-blue-200">
                        <div
                          className={`flex flex-col text-left gap-2 ${
                            activeSlide?.id ===
                            "midlayer-green-white-extraction"
                              ? "mb-1"
                              : ""
                          }`}
                        >
                          {activeSlide?.id ===
                          "midlayer-green-white-extraction" ? (
                            <>
                              <div className="text-[9px] uppercase tracking-wide font-semibold text-blue-200">
                                Colour Front:
                              </div>
                              <div className="text-[9px] uppercase tracking-wide font-semibold text-blue-200 ml-0">
                                {lessonId === "notation" ? "Try:" : "Fix:"}
                              </div>
                            </>
                          ) : lessonId === "notation" ? (
                            "Try:"
                          ) : (
                            "Fix:"
                          )}
                        </div>
                      </span>
                      <div className="flex items-center gap-0">
                        {/* Animated completion tick (not shown for step 5) */}
                        {false &&
                          activeSlide?.id !==
                            "flipped-misoriented-green-white" &&
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
                        {activeSlide?.id ===
                        "flipped-misoriented-green-white" ? (
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
                                            strokeDashoffset:
                                              fixFirstTickProgress ? 0 : 63,
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
                                            strokeDashoffset:
                                              fixFirstTickProgress ? 0 : 63,
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
                                              strokeDashoffset:
                                                fixSecondTickLine ? 0 : 20,
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
                        ) : activeSlide?.id ===
                          "midlayer-green-white-extraction" ? (
                          (() => {
                            const stage1Boundary = 3; // after indices 0..2
                            const stage2Boundary = 4; // after index 3
                            const stage3Boundary = 5; // after index 4
                            const tokenCls = (
                              done: boolean,
                              current: boolean,
                              partial: boolean,
                              idx: number,
                              groupLength: number
                            ) => {
                              const isFirst = idx === 0;
                              const isLast = idx === groupLength - 1;
                              const firstPad = isFirst
                                ? "pl-2 rounded-tl-md rounded-bl-md"
                                : "";
                              const lastPad = isLast
                                ? "pr-2 rounded-tr-md rounded-br-md"
                                : "";
                              if (done)
                                return `px-1 ${firstPad} ${lastPad} py-1 bg-green-500 text-white border-green-600 text-[14px] md:text-xs leading-none`;
                              if (partial)
                                return `px-1 ${firstPad} ${lastPad} py-1 text-white border-blue-600 text-[14px] md:text-xs leading-none`;
                              if (current)
                                return `px-1 ${firstPad} ${lastPad} py-1 bg-white text-blue-700 border-blue-500 text-[14px] md:text-xs leading-none`;
                              return `px-1 ${firstPad} ${lastPad} py-1 bg-gray-300 text-gray-600 border-blue-300 text-[14px] md:text-xs leading-none`;
                            };
                            const renderGroup = (
                              moves: string[],
                              startIdx: number
                            ) => (
                              <div className="flex items-center border border-green-600 rounded-[7px] gap-0">
                                {" "}
                                {moves.map((mv, i) => {
                                  const idx = startIdx + i;
                                  const done = fixIndex > idx;
                                  const current = fixIndex === idx;
                                  const partial =
                                    mv === "F2" &&
                                    fixIndex === 4 &&
                                    fixDoublePartialDir !== 0;
                                  const style: any = {};
                                  if (partial) {
                                    style.background =
                                      "linear-gradient(90deg, #22c55e 50%, #3b82f6 50%)";
                                  }
                                  return (
                                    <span
                                      key={mv + idx}
                                      className={tokenCls(
                                        done,
                                        current,
                                        partial,
                                        i,
                                        moves.length
                                      )}
                                      style={style}
                                    >
                                      {mv}
                                    </span>
                                  );
                                })}
                              </div>
                            );

                            return (
                              <div className="flex flex-col py-1">
                                <div className="flex gap-0">
                                  {/* Sequence 1 */}
                                  <div className="flex flex-col items-center gap-1">
                                    <span className="text-[9px] font-semibold text-red-600">
                                      Red
                                    </span>
                                    <>
                                      <div className="flex items-center gap-0">
                                        {renderGroup(["R'", "D'", "R"], 0)}

                                        {fixIndex >= stage1Boundary && (
                                          <div className="relative w-6 h-6 ml-1">
                                            <svg
                                              key={midStage1Key}
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
                                                    midStage1Progress ? 0 : 63,
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
                                                    strokeDashoffset:
                                                      midStage1Line ? 0 : 20,
                                                    transition:
                                                      "stroke-dashoffset 0.5s ease-out",
                                                  }}
                                                />
                                              </svg>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </>
                                  </div>
                                  <span className="mx-1 text-gray-400 mt-5">
                                    /
                                  </span>
                                  {/* Sequence 2 */}
                                  <div className="flex flex-col items-center gap-1">
                                    <span className="text-[9px] font-semibold text-green-600">
                                      Green
                                    </span>
                                    <div className="flex items-center gap-1">
                                      {renderGroup(["D'"], 3)}
                                      {fixIndex >= stage2Boundary && (
                                        <div className="relative w-6 h-6 ml-1">
                                          <svg
                                            key={midStage2Key}
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
                                                  midStage2Progress ? 0 : 63,
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
                                                  strokeDashoffset:
                                                    midStage2Line ? 0 : 20,
                                                  transition:
                                                    "stroke-dashoffset 0.5s ease-out",
                                                }}
                                              />
                                            </svg>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <span className="mx-1 text-gray-400 mt-5">
                                    /
                                  </span>
                                  {/* Sequence 3 */}
                                  <div className="flex flex-col items-center gap-1">
                                    <span className="text-[9px] font-semibold text-green-600">
                                      Green
                                    </span>
                                    <div className="flex items-center gap-1">
                                      {renderGroup(["F2"], 4)}
                                      {fixIndex >= stage3Boundary && (
                                        <div className="relative w-6 h-6 ml-1">
                                          <svg
                                            key={midStage3Key}
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
                                                  midStage3Progress ? 0 : 63,
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
                                                  strokeDashoffset:
                                                    midStage3Line ? 0 : 20,
                                                  transition:
                                                    "stroke-dashoffset 0.5s ease-out",
                                                }}
                                              />
                                            </svg>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                          // Default rendering for other slides
                          <div className="flex items-center gap-0 border border-green-600 rounded-[7px]">
                            {fixSequence.map((step, idx) => {
                              const isDone = idx < fixIndex;
                              const isCurrent = idx === fixIndex;
                              const isDouble = step.endsWith("2");
                              const partial =
                                isCurrent &&
                                isDouble &&
                                fixDoublePartialDir !== 0;
                              const baseMove = step;
                              const isFirst = idx === 0;
                              const isLast = idx === fixSequence.length - 1;
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
                                  key={idx + baseMove}
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
                        )}
                        {/* Animated completion tick */}
                        {fixShowTick &&
                          ![
                            "flipped-misoriented-green-white",
                            "misaligned-green-white",
                            "flipped-misoriented-misaligned-green-white",
                            "midlayer-green-white-extraction",
                          ].includes(activeSlide?.id || "") && (
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
                      </div>
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
            </>
          )}
        </div>
      </div>
      {/* Full-width slide text bar at the very bottom (hidden on slide 8) */}
      {activeSlide && activeSlide.id !== "recap-mental-model" && (
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
                {activeSlide.id !== "recap-mental-model" && (
                  <TypewriterText
                    text={activeSlide.description}
                    keyProp={currentSlide}
                  />
                )}
              </div>
              <div className="flex items-center gap-2 justify-end">
                <Button
                  onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                  disabled={currentSlide === 0}
                  className="px-3 py-1 text-sm"
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
                  className="px-3 py-1 text-sm"
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
