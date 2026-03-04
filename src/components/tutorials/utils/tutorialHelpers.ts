import type { CubeState } from "@/types/cube";
import CUBE_COLORS from "@/consts/cubeColours";

/**
 * Camera configuration options for reset/transition
 */
export interface SlideCameraConfig {
  extraYawRad?: number;
  flipUpsideDown?: boolean;
  extraERotationDeg?: number;
  extraPitchDeg?: number; // Vertical pitch/elevation angle in degrees (positive = look more from above, negative = look more from below)
  slideId: string;
}

export const getSlideCameraConfig = (
  slideId: string | undefined,
  lessonId?: string
): SlideCameraConfig => {
  const slideIdForLogging = slideId || "unknown";

  if (slideId === "intro") {
    const yellowTopLessons = [
      "yellow-cross",
      "yellow-edges",
      "yellow-corners",
      "orient-yellow-corners",
      "second-layer",
    ];
    if (lessonId && yellowTopLessons.includes(lessonId)) {
      return {
        extraYawRad: 0,
        flipUpsideDown: true,
        extraERotationDeg: -45,
        slideId: slideIdForLogging,
      };
    }
    return {
      extraYawRad: (Math.PI / 180) * -45,
      slideId: slideIdForLogging,
    };
  }

  if (
    slideId === "find-green-white" ||
    slideId === "flip-green-white" ||
    slideId === "flip-green-white-f2" ||
    slideId === "flipped-misoriented-green-white"
  ) {
    return { extraYawRad: 0, slideId: slideIdForLogging };
  }

  if (
    lessonId === "notation" &&
    (slideId === "notation-intro" ||
      slideId === "notation-orientation" ||
      slideId === "notation-faces" ||
      slideId === "notation-clockwise-f" ||
      slideId === "notation-prime-f" ||
      slideId === "notation-clockwise-r" ||
      slideId === "notation-prime-r" ||
      slideId === "notation-clockwise-l" ||
      slideId === "notation-prime-l" ||
      slideId === "notation-clockwise-u" ||
      slideId === "notation-prime-u" ||
      slideId === "notation-clockwise-d" ||
      slideId === "notation-prime-d" ||
      slideId === "notation-clockwise-b" ||
      slideId === "notation-prime-b" ||
      slideId === "notation-double" ||
      slideId === "notation-double-l" ||
      slideId === "notation-double-d" ||
      slideId === "notation-sequences" ||
      slideId === "notation-sequences-longer" ||
      slideId === "notation-reminder")
  ) {
    return { extraYawRad: 0, slideId: slideIdForLogging };
  }

  if (slideId === "corner-white-facing-right") {
    return {
      extraYawRad: 0,
      flipUpsideDown: true,
      extraERotationDeg: -60,
      extraPitchDeg: -10,
      slideId: slideIdForLogging,
    };
  }

  if (
    slideId === "misaligned-green-white" ||
    slideId === "flipped-misoriented-misaligned-green-white"
  ) {
    return {
      extraYawRad: 0,
      flipUpsideDown: false,
      extraERotationDeg: -60,
      extraPitchDeg: -10,
      slideId: slideIdForLogging,
    };
  }

  if (slideId === "corner-white-facing-left") {
    return {
      extraYawRad: 0,
      flipUpsideDown: true,
      extraERotationDeg: -30,
      extraPitchDeg: -10,
      slideId: slideIdForLogging,
    };
  }

  if (slideId === "mechanical-approach") {
    const config: SlideCameraConfig = {
      extraYawRad: 0,
      flipUpsideDown: true,
      extraERotationDeg: -45,
      slideId: slideIdForLogging,
    };
    if (lessonId === "white-corners") {
      config.extraPitchDeg = -65;
    } else if (lessonId === "second-layer") {
      config.extraPitchDeg = -20;
    }
    return config;
  }

  if (slideId === "corner-move-to-correct") {
    return {
      extraYawRad: (Math.PI / 180) * -30,
      flipUpsideDown: true,
      extraPitchDeg: -10,
      slideId: slideIdForLogging,
    };
  }

  if (slideId === "corner-insert-two-pieces") {
    return {
      extraYawRad: (Math.PI / 180) * -240,
      flipUpsideDown: true,
      extraPitchDeg: -10,
      slideId: slideIdForLogging,
    };
  }

  if (
    slideId === "corner-white-facing-up" ||
    slideId === "corner-remove-reinsert" ||
    slideId === "corner-remove-reinsert-alt" ||
    slideId === "edge-insert-right" ||
    slideId === "edge-flipped-in-position"
  ) {
    return {
      extraYawRad: 0,
      flipUpsideDown: true,
      extraERotationDeg: -60,
      extraPitchDeg: -10,
      slideId: slideIdForLogging,
    };
  }

  if (slideId === "edge-insert-left") {
    return {
      extraYawRad: 0,
      flipUpsideDown: true,
      extraERotationDeg: -30,
      extraPitchDeg: -10,
      slideId: slideIdForLogging,
    };
  }

  if (slideId === "edge-remove-reinsert") {
    return {
      extraYawRad: (Math.PI / 180) * -90,
      flipUpsideDown: true,
      extraERotationDeg: -60,
      extraPitchDeg: -10,
      slideId: slideIdForLogging,
    };
  }

  if (slideId === "white-cross-recap") {
    return {
      extraYawRad: 0,
      slideId: slideIdForLogging,
    };
  }

  if (slideId === "white-corners-recap") {
    return {
      extraYawRad: 0,
      flipUpsideDown: true,
      extraERotationDeg: -45,
      slideId: slideIdForLogging,
    };
  }

  if (slideId === "second-layer-recap") {
    return {
      extraYawRad: 0,
      flipUpsideDown: true,
      extraERotationDeg: -45,
      slideId: slideIdForLogging,
    };
  }

  if (
    slideId === "yellow-cross-states" ||
    slideId === "yellow-cross-line" ||
    slideId === "yellow-cross-triangle" ||
    slideId === "yellow-cross-dot" ||
    (slideId === "intro" && lessonId === "yellow-edges") ||
    slideId === "yellow-edges-algorithm" ||
    slideId === "yellow-edges-one-correct" ||
    slideId === "yellow-edges-zero-correct" ||
    slideId === "yellow-edges-two-opposite" ||
    slideId === "yellow-corners-one-correct" ||
    slideId === "yellow-corners-zero-correct" ||
    slideId === "yellow-corners-zero-repeated" ||
    (slideId === "intro" && lessonId === "yellow-corners")
  ) {
    const extraYaw =
      slideId === "yellow-cross-line" ||
      slideId === "yellow-cross-triangle" ||
      slideId === "yellow-cross-dot" ||
      slideId === "yellow-edges-algorithm" ||
      slideId === "yellow-edges-one-correct" ||
      slideId === "yellow-edges-zero-correct" ||
      slideId === "yellow-edges-two-opposite" ||
      slideId === "yellow-corners-one-correct" ||
      slideId === "yellow-corners-zero-correct" ||
      slideId === "yellow-corners-zero-repeated"
        ? (Math.PI / 180) * 45
        : 0;
    return {
      extraYawRad: extraYaw,
      flipUpsideDown: true,
      extraERotationDeg: -45,
      slideId: slideIdForLogging,
    };
  }

  if (
    slideId === "practice-two-corners" ||
    slideId === "practice-three-corners" ||
    slideId === "practice-four-corners"
  ) {
    return {
      extraYawRad: 0,
      flipUpsideDown: true,
      extraERotationDeg: -45,
      slideId: slideIdForLogging,
    };
  }

  if (
    slideId === "practice-two-edges" ||
    slideId === "practice-three-edges" ||
    slideId === "practice-full-cross"
  ) {
    return {
      extraYawRad: (Math.PI / 180) * -45,
      slideId: slideIdForLogging,
    };
  }

  if (
    slideId === "practice-two-second-edges" ||
    slideId === "practice-three-second-edges" ||
    slideId === "practice-four-second-edges"
  ) {
    return {
      extraYawRad: 0,
      flipUpsideDown: true,
      extraERotationDeg: -45,
      slideId: slideIdForLogging,
    };
  }

  if (
    slideId === "midlayer-green-white-extraction" &&
    lessonId === "white-cross"
  ) {
    return {
      extraYawRad: (Math.PI / 180) * -90,
      extraERotationDeg: -30,
      extraPitchDeg: -10,
      slideId: slideIdForLogging,
    };
  }

  if (
    slideId === "orient-two-corners" &&
    lessonId === "orient-yellow-corners"
  ) {
    return {
      extraYawRad: 0,
      flipUpsideDown: false,
      extraERotationDeg: -30,
      extraPitchDeg: -10,
      slideId: slideIdForLogging,
    };
  }

  if (
    slideId === "orient-three-corners" &&
    lessonId === "orient-yellow-corners"
  ) {
    return {
      extraYawRad: 0,
      flipUpsideDown: false,
      extraERotationDeg: -30,
      extraPitchDeg: -10,
      slideId: slideIdForLogging,
    };
  }

  if (
    slideId === "orient-four-corners" &&
    lessonId === "orient-yellow-corners"
  ) {
    return {
      extraYawRad: 0,
      flipUpsideDown: false,
      extraERotationDeg: -30,
      extraPitchDeg: -10,
      slideId: slideIdForLogging,
    };
  }

  if (
    slideId === "practice-last-three-steps" &&
    lessonId === "orient-yellow-corners"
  ) {
    return {
      extraYawRad: 0,
      flipUpsideDown: true,
      extraERotationDeg: -45,
      slideId: slideIdForLogging,
    };
  }

  if (
    slideId === "practice-full-cube" &&
    lessonId === "orient-yellow-corners"
  ) {
    return {
      extraYawRad: 0,
      flipUpsideDown: false,
      extraERotationDeg: -30,
      extraPitchDeg: -10,
      slideId: slideIdForLogging,
    };
  }

  return { slideId: slideIdForLogging };
};

/**
 * Helper to list unique, visible sticker colors on a cubie (ignore grey + black)
 */
export const getCubieColorSet = (piece: CubeState) => {
  const colors = new Set<string>();
  const grey = "#808080";
  const black = CUBE_COLORS.BLACK;
  Object.values(piece.colors).forEach((c) => {
    if (c && c !== grey && c !== black) colors.add(c);
  });
  return colors;
};

/**
 * Build a greyscaled cube for the tutorial baseline per lesson (simple rules)
 */
export const createTutorialCubeState = (
  lessonId: string,
  base: CubeState[][][]
) => {
  // Default: leave as-is
  if (!lessonId) return base;
  // For white-cross, default to show all; slides will further filter
  if (lessonId === "white-cross") return base;
  // Fallback: no-op
  return base;
};

/**
 * Check if the white cross is solved (proper detection)
 */
export const isWhiteCrossSolved = (cube3D: CubeState[][][]) => {
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
};

/**
 * Check if white corners are solved (proper detection)
 */
export const isWhiteCornersSolved = (cube3D: CubeState[][][]) => {
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

  // Define the corner positions and their expected colors for each face
  const cornerConfig: Record<
    string,
    Array<{
      pos: [number, number, number];
      whiteFaceKey: keyof CubeState["colors"];
      color1FaceKey: keyof CubeState["colors"];
      expectedColor1: string;
      color2FaceKey: keyof CubeState["colors"];
      expectedColor2: string;
    }>
  > = {
    bottom: [
      {
        pos: [0, 0, 0],
        whiteFaceKey: "bottom",
        color1FaceKey: "left",
        expectedColor1: CUBE_COLORS.ORANGE,
        color2FaceKey: "back",
        expectedColor2: CUBE_COLORS.BLUE,
      },
      {
        pos: [2, 0, 0],
        whiteFaceKey: "bottom",
        color1FaceKey: "right",
        expectedColor1: CUBE_COLORS.RED,
        color2FaceKey: "back",
        expectedColor2: CUBE_COLORS.BLUE,
      },
      {
        pos: [0, 0, 2],
        whiteFaceKey: "bottom",
        color1FaceKey: "left",
        expectedColor1: CUBE_COLORS.ORANGE,
        color2FaceKey: "front",
        expectedColor2: CUBE_COLORS.GREEN,
      },
      {
        pos: [2, 0, 2],
        whiteFaceKey: "bottom",
        color1FaceKey: "right",
        expectedColor1: CUBE_COLORS.RED,
        color2FaceKey: "front",
        expectedColor2: CUBE_COLORS.GREEN,
      },
    ],
    top: [
      {
        pos: [0, 2, 0],
        whiteFaceKey: "top",
        color1FaceKey: "left",
        expectedColor1: CUBE_COLORS.ORANGE,
        color2FaceKey: "back",
        expectedColor2: CUBE_COLORS.BLUE,
      },
      {
        pos: [2, 2, 0],
        whiteFaceKey: "top",
        color1FaceKey: "right",
        expectedColor1: CUBE_COLORS.RED,
        color2FaceKey: "back",
        expectedColor2: CUBE_COLORS.BLUE,
      },
      {
        pos: [0, 2, 2],
        whiteFaceKey: "top",
        color1FaceKey: "left",
        expectedColor1: CUBE_COLORS.ORANGE,
        color2FaceKey: "front",
        expectedColor2: CUBE_COLORS.GREEN,
      },
      {
        pos: [2, 2, 2],
        whiteFaceKey: "top",
        color1FaceKey: "right",
        expectedColor1: CUBE_COLORS.RED,
        color2FaceKey: "front",
        expectedColor2: CUBE_COLORS.GREEN,
      },
    ],
    front: [
      {
        pos: [0, 0, 2],
        whiteFaceKey: "front",
        color1FaceKey: "left",
        expectedColor1: CUBE_COLORS.ORANGE,
        color2FaceKey: "bottom",
        expectedColor2: CUBE_COLORS.WHITE,
      },
      {
        pos: [2, 0, 2],
        whiteFaceKey: "front",
        color1FaceKey: "right",
        expectedColor1: CUBE_COLORS.RED,
        color2FaceKey: "bottom",
        expectedColor2: CUBE_COLORS.WHITE,
      },
      {
        pos: [0, 2, 2],
        whiteFaceKey: "front",
        color1FaceKey: "left",
        expectedColor1: CUBE_COLORS.ORANGE,
        color2FaceKey: "top",
        expectedColor2: CUBE_COLORS.YELLOW,
      },
      {
        pos: [2, 2, 2],
        whiteFaceKey: "front",
        color1FaceKey: "right",
        expectedColor1: CUBE_COLORS.RED,
        color2FaceKey: "top",
        expectedColor2: CUBE_COLORS.YELLOW,
      },
    ],
    back: [
      {
        pos: [0, 0, 0],
        whiteFaceKey: "back",
        color1FaceKey: "left",
        expectedColor1: CUBE_COLORS.ORANGE,
        color2FaceKey: "bottom",
        expectedColor2: CUBE_COLORS.WHITE,
      },
      {
        pos: [2, 0, 0],
        whiteFaceKey: "back",
        color1FaceKey: "right",
        expectedColor1: CUBE_COLORS.RED,
        color2FaceKey: "bottom",
        expectedColor2: CUBE_COLORS.WHITE,
      },
      {
        pos: [0, 2, 0],
        whiteFaceKey: "back",
        color1FaceKey: "left",
        expectedColor1: CUBE_COLORS.ORANGE,
        color2FaceKey: "top",
        expectedColor2: CUBE_COLORS.YELLOW,
      },
      {
        pos: [2, 2, 0],
        whiteFaceKey: "back",
        color1FaceKey: "right",
        expectedColor1: CUBE_COLORS.RED,
        color2FaceKey: "top",
        expectedColor2: CUBE_COLORS.YELLOW,
      },
    ],
    left: [
      {
        pos: [0, 0, 0],
        whiteFaceKey: "left",
        color1FaceKey: "back",
        expectedColor1: CUBE_COLORS.BLUE,
        color2FaceKey: "bottom",
        expectedColor2: CUBE_COLORS.WHITE,
      },
      {
        pos: [0, 0, 2],
        whiteFaceKey: "left",
        color1FaceKey: "front",
        expectedColor1: CUBE_COLORS.GREEN,
        color2FaceKey: "bottom",
        expectedColor2: CUBE_COLORS.WHITE,
      },
      {
        pos: [0, 2, 0],
        whiteFaceKey: "left",
        color1FaceKey: "back",
        expectedColor1: CUBE_COLORS.BLUE,
        color2FaceKey: "top",
        expectedColor2: CUBE_COLORS.YELLOW,
      },
      {
        pos: [0, 2, 2],
        whiteFaceKey: "left",
        color1FaceKey: "front",
        expectedColor1: CUBE_COLORS.GREEN,
        color2FaceKey: "top",
        expectedColor2: CUBE_COLORS.YELLOW,
      },
    ],
    right: [
      {
        pos: [2, 0, 0],
        whiteFaceKey: "right",
        color1FaceKey: "back",
        expectedColor1: CUBE_COLORS.BLUE,
        color2FaceKey: "bottom",
        expectedColor2: CUBE_COLORS.WHITE,
      },
      {
        pos: [2, 0, 2],
        whiteFaceKey: "right",
        color1FaceKey: "front",
        expectedColor1: CUBE_COLORS.GREEN,
        color2FaceKey: "bottom",
        expectedColor2: CUBE_COLORS.WHITE,
      },
      {
        pos: [2, 2, 0],
        whiteFaceKey: "right",
        color1FaceKey: "back",
        expectedColor1: CUBE_COLORS.BLUE,
        color2FaceKey: "top",
        expectedColor2: CUBE_COLORS.YELLOW,
      },
      {
        pos: [2, 2, 2],
        whiteFaceKey: "right",
        color1FaceKey: "front",
        expectedColor1: CUBE_COLORS.GREEN,
        color2FaceKey: "top",
        expectedColor2: CUBE_COLORS.YELLOW,
      },
    ],
  };

  const corners = cornerConfig[whiteFace];
  if (!corners) return false;

  // Get the 4 corners on the white face
  const whiteFaceCorners = corners.filter((corner) => {
    const [x, y, z] = corner.pos;
    if (whiteFace === "bottom") return y === 0;
    if (whiteFace === "top") return y === 2;
    if (whiteFace === "front") return z === 2;
    if (whiteFace === "back") return z === 0;
    if (whiteFace === "left") return x === 0;
    if (whiteFace === "right") return x === 2;
    return false;
  });

  if (whiteFaceCorners.length !== 4) return false;

  for (const {
    pos,
    whiteFaceKey,
    color1FaceKey,
    expectedColor1,
    color2FaceKey,
    expectedColor2,
  } of whiteFaceCorners) {
    const [x, y, z] = pos;
    const cornerPiece = cube3D[x][y][z];

    // Check that the white face sticker is actually white
    if (cornerPiece.colors[whiteFaceKey] !== CUBE_COLORS.WHITE) {
      return false;
    }

    // Check that the colored stickers match the expected center colors
    // The colors can be on either of the two face keys, so check both combinations
    const hasColor1 =
      cornerPiece.colors[color1FaceKey] === expectedColor1 ||
      cornerPiece.colors[color2FaceKey] === expectedColor1;
    const hasColor2 =
      cornerPiece.colors[color1FaceKey] === expectedColor2 ||
      cornerPiece.colors[color2FaceKey] === expectedColor2;

    if (!hasColor1 || !hasColor2) {
      return false;
    }
  }

  return true;
};

/**
 * Check if the second layer is solved (proper detection)
 * Second layer edges are at y=1 (middle layer) and should match their adjacent centers
 */
export const isSecondLayerSolved = (cube3D: CubeState[][][]) => {
  if (!cube3D) return false;

  // The four second layer edge positions and their expected color pairs
  // Second layer edges are the HORIZONTAL edges at y=1 that connect adjacent faces
  const secondLayerEdges: Array<{
    pos: [number, number, number];
    color1: string;
    color2: string;
    face1: keyof CubeState["colors"];
    face2: keyof CubeState["colors"];
  }> = [
    // Front-right edge [2, 1, 2]: between front (green) and right (red)
    {
      pos: [2, 1, 2],
      color1: CUBE_COLORS.GREEN,
      color2: CUBE_COLORS.RED,
      face1: "front",
      face2: "right",
    },
    // Right-back edge [2, 1, 0]: between right (red) and back (blue)
    {
      pos: [2, 1, 0],
      color1: CUBE_COLORS.RED,
      color2: CUBE_COLORS.BLUE,
      face1: "right",
      face2: "back",
    },
    // Back-left edge [0, 1, 0]: between back (blue) and left (orange)
    {
      pos: [0, 1, 0],
      color1: CUBE_COLORS.BLUE,
      color2: CUBE_COLORS.ORANGE,
      face1: "back",
      face2: "left",
    },
    // Left-front edge [0, 1, 2]: between left (orange) and front (green)
    {
      pos: [0, 1, 2],
      color1: CUBE_COLORS.ORANGE,
      color2: CUBE_COLORS.GREEN,
      face1: "left",
      face2: "front",
    },
  ];

  // Check each second layer edge
  for (const { pos, color1, color2, face1, face2 } of secondLayerEdges) {
    const [x, y, z] = pos;
    const edgePiece = cube3D[x][y][z];
    const colors = getCubieColorSet(edgePiece);

    // Must be a two-color edge (no white, no yellow)
    if (colors.size !== 2) return false;
    if (colors.has(CUBE_COLORS.WHITE) || colors.has(CUBE_COLORS.YELLOW))
      return false;

    // Check that the edge has the correct two colors
    if (!colors.has(color1) || !colors.has(color2)) return false;

    // Check that the colors are on the correct faces (orientation matters)
    // For a solved edge, color1 must be on face1 AND color2 must be on face2
    const hasColor1OnFace1 = edgePiece.colors[face1] === color1;
    const hasColor2OnFace2 = edgePiece.colors[face2] === color2;

    // Both colors must be on their correct faces for the edge to be solved
    if (!(hasColor1OnFace1 && hasColor2OnFace2)) {
      return false;
    }
  }

  return true;
};

/**
 * Check if the entire cube is solved (all six faces show a single colour each).
 */
export const isCubeFullySolved = (cube3D: CubeState[][][]) => {
  if (!cube3D) return false;

  const faceLayouts: Array<{
    face: keyof CubeState["colors"];
    positions: Array<[number, number, number]>;
  }> = [
    { face: "front", positions: [[0, 0, 2], [1, 0, 2], [2, 0, 2], [0, 1, 2], [1, 1, 2], [2, 1, 2], [0, 2, 2], [1, 2, 2], [2, 2, 2]] },
    { face: "back", positions: [[0, 0, 0], [1, 0, 0], [2, 0, 0], [0, 1, 0], [1, 1, 0], [2, 1, 0], [0, 2, 0], [1, 2, 0], [2, 2, 0]] },
    { face: "left", positions: [[0, 0, 0], [0, 0, 1], [0, 0, 2], [0, 1, 0], [0, 1, 1], [0, 1, 2], [0, 2, 0], [0, 2, 1], [0, 2, 2]] },
    { face: "right", positions: [[2, 0, 0], [2, 0, 1], [2, 0, 2], [2, 1, 0], [2, 1, 1], [2, 1, 2], [2, 2, 0], [2, 2, 1], [2, 2, 2]] },
    { face: "top", positions: [[0, 2, 0], [1, 2, 0], [2, 2, 0], [0, 2, 1], [1, 2, 1], [2, 2, 1], [0, 2, 2], [1, 2, 2], [2, 2, 2]] },
    { face: "bottom", positions: [[0, 0, 0], [1, 0, 0], [2, 0, 0], [0, 0, 1], [1, 0, 1], [2, 0, 1], [0, 0, 2], [1, 0, 2], [2, 0, 2]] },
  ];

  for (const { face, positions } of faceLayouts) {
    const [cx, cy, cz] = positions[4]; // center of this face
    const expected = cube3D[cx][cy][cz].colors[face];
    for (const [x, y, z] of positions) {
      if (cube3D[x][y][z].colors[face] !== expected) return false;
    }
  }
  return true;
};

/**
 * Find the white/green/red corner piece position
 */
export const findWhiteGreenRedCorner = (
  cube3D: CubeState[][][]
): [number, number, number] | null => {
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      for (let z = 0; z < 3; z++) {
        const piece = cube3D[x][y][z];
        const colors = getCubieColorSet(piece);
        if (
          colors.size === 3 &&
          colors.has(CUBE_COLORS.WHITE) &&
          colors.has(CUBE_COLORS.GREEN) &&
          colors.has(CUBE_COLORS.RED)
        ) {
          return [x, y, z];
        }
      }
    }
  }
  return null;
};

/**
 * Find the red/green second layer edge piece position (no white, no yellow)
 */
export const findRedGreenSecondLayerEdge = (
  cube3D: CubeState[][][]
): [number, number, number] | null => {
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      for (let z = 0; z < 3; z++) {
        const piece = cube3D[x][y][z];
        const colors = getCubieColorSet(piece);
        if (
          colors.size === 2 &&
          !colors.has(CUBE_COLORS.WHITE) &&
          !colors.has(CUBE_COLORS.YELLOW) &&
          colors.has(CUBE_COLORS.RED) &&
          colors.has(CUBE_COLORS.GREEN)
        ) {
          return [x, y, z];
        }
      }
    }
  }
  return null;
};

/**
 * Find the green/white edge piece position
 */
export const findGreenWhiteEdge = (
  cube3D: CubeState[][][]
): [number, number, number] | null => {
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      for (let z = 0; z < 3; z++) {
        const piece = cube3D[x][y][z];
        const colors = getCubieColorSet(piece);
        if (
          colors.size === 2 &&
          colors.has(CUBE_COLORS.WHITE) &&
          colors.has(CUBE_COLORS.GREEN)
        ) {
          return [x, y, z];
        }
      }
    }
  }
  return null;
};
