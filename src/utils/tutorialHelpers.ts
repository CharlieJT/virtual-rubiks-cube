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

/**
 * Get camera configuration for a given slide ID
 * This centralizes the camera settings logic to avoid duplication
 */
export const getSlideCameraConfig = (
  slideId: string | undefined,
  lessonId?: string
): SlideCameraConfig => {
  const slideIdForLogging = slideId || "unknown";

  if (
    slideId === "intro" ||
    slideId === "misaligned-green-white" ||
    slideId === "flipped-misoriented-misaligned-green-white"
  ) {
    // Explicit -45deg yaw to standardize the facing on the faces slide
    // Exception: yellow-cross, yellow-edges, yellow-corners, and second-layer intro should show yellow on top
    if (
      lessonId === "yellow-cross" ||
      lessonId === "yellow-edges" ||
      lessonId === "yellow-corners" ||
      lessonId === "second-layer"
    ) {
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
    // Face more toward green (left along cube Y): stronger negative yaw
    return { extraYawRad: 0, slideId: slideIdForLogging };
  }

  // All Notation slides: use same yaw as notation-intro (default, which is 0)
  if (
    lessonId === "notation" &&
    (slideId === "notation-intro" ||
      slideId === "notation-faces" ||
      slideId === "notation-turns" ||
      slideId === "notation-example" ||
      slideId === "notation-example-2" ||
      slideId === "notation-example-3" ||
      slideId === "notation-10-step" ||
      slideId === "notation-protip")
  ) {
    return { extraYawRad: 0, slideId: slideIdForLogging };
  }

  if (slideId === "practice-setup-solution") {
    // Apply visual flip to show yellow on top visually (180° around Z axis)
    // Also apply 45 degrees around Y axis (E direction)
    return {
      extraYawRad: 0,
      flipUpsideDown: true,
      extraERotationDeg: -45,
      slideId: slideIdForLogging,
    };
  }

  if (slideId === "practice-setup-solution-2") {
    // Yellow top/green front orientation - flip upside down
    return {
      extraYawRad: 0,
      flipUpsideDown: true,
      extraERotationDeg: -45,
      slideId: slideIdForLogging,
    };
  }

  if (slideId === "mechanical-approach") {
    // Slide 2 for both white corners and second layer: flip upside down (yellow on top)
    const config: SlideCameraConfig = {
      extraYawRad: 0,
      flipUpsideDown: true,
      extraERotationDeg: -45,
      slideId: slideIdForLogging,
    };
    // Add vertical pitch based on lesson
    if (lessonId === "white-corners") {
      config.extraPitchDeg = -65; // 65 degrees up for white corners (negative to push up)
    } else if (lessonId === "second-layer") {
      config.extraPitchDeg = -25; // 25 degrees up for second layer (negative to push up)
    }
    return config;
  }

  if (slideId === "practice-setup-solution-6") {
    // Yellow top/green front orientation - flip upside down
    // Start with yaw further to the right (extraYawRad: -45)
    // After U move (fixIndex 5), will change to match slides 3-7 (extraYawRad: 0, extraERotationDeg: -45)
    return {
      extraYawRad: (Math.PI / 180) * -45,
      flipUpsideDown: true,
      slideId: slideIdForLogging,
    };
  }

  if (
    slideId === "practice-setup-solution-3" ||
    slideId === "practice-setup-solution-4" ||
    slideId === "second-layer-setup-solution" ||
    slideId === "second-layer-setup-solution-2" ||
    slideId === "second-layer-setup-solution-4"
  ) {
    // Yellow top/red front orientation - flip upside down
    // Setup moves handle the red front orientation logically
    // Also apply 45 degrees around Y axis (E direction)
    return {
      extraYawRad: 0,
      flipUpsideDown: true,
      extraERotationDeg: -45,
      slideId: slideIdForLogging,
    };
  }

  if (slideId === "second-layer-setup-solution-3") {
    // Yellow top/red front orientation - flip upside down
    // Yaw 90 degrees to the right (-90 degrees)
    // Also apply 45 degrees around Y axis (E direction)
    return {
      extraYawRad: (Math.PI / 180) * -90,
      flipUpsideDown: true,
      extraERotationDeg: -45,
      slideId: slideIdForLogging,
    };
  }

  if (
    slideId === "practice-setup-solution-3" ||
    slideId === "practice-setup-solution-4" ||
    slideId === "practice-setup-solution-5" ||
    slideId === "second-layer-setup-solution" ||
    slideId === "second-layer-setup-solution-2"
  ) {
    // Yellow top/red front orientation - flip upside down
    // Setup moves handle the red front orientation logically
    // Also apply 45 degrees around Y axis (E direction)
    return {
      extraYawRad: 0,
      flipUpsideDown: true,
      extraERotationDeg: -45,
      slideId: slideIdForLogging,
    };
  }

  if (slideId === "recap-mental-model") {
    // White Cross recap: show white side up (default orientation)
    // Other lessons: also default orientation
    return {
      extraYawRad: 0,
      slideId: slideIdForLogging,
    };
  }

  if (slideId === "recap-white-corners") {
    // Recap slide: maintain same orientation as other white corners slides (flip upside down)
    return {
      extraYawRad: 0,
      flipUpsideDown: true,
      extraERotationDeg: -45,
      slideId: slideIdForLogging,
    };
  }

  if (slideId === "second-layer-recap") {
    // Recap slide: maintain same orientation as other second layer slides (flip upside down)
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
    slideId === "yellow-edges-solution" ||
    slideId === "yellow-edges-solution-2" ||
    slideId === "yellow-edges-solution-3" ||
    slideId === "yellow-corners-solution" ||
    slideId === "yellow-corners-solution-2" ||
    slideId === "yellow-corners-solution-3" ||
    (slideId === "intro" && lessonId === "yellow-corners")
  ) {
    // Yellow cross/edges slides: yellow side up
    // For line, triangle, dot, yellow-edges-solution, yellow-edges-solution-2, and yellow-edges-solution-3 slides, add yaw
    const extraYaw =
      slideId === "yellow-cross-line" ||
      slideId === "yellow-cross-triangle" ||
      slideId === "yellow-cross-dot"
        ? (Math.PI / 180) * 45 // 45 degrees to the right (positive)
        : slideId === "yellow-edges-solution"
        ? (Math.PI / 180) * 45 // 45 degrees to the right (positive)
        : slideId === "yellow-edges-solution-2"
        ? (Math.PI / 180) * 45 // 45 degrees to the right (positive) - will change to -45 after first move
        : slideId === "yellow-edges-solution-3"
        ? (Math.PI / 180) * 45 // 45 degrees to the right (positive) - will change to +135 after first move
        : slideId === "yellow-corners-solution"
        ? (Math.PI / 180) * 45 // 45 degrees to the left (positive)
        : slideId === "yellow-corners-solution-2"
        ? (Math.PI / 180) * 45 // 45 degrees to the right (positive) - will change to +135 after first sequence
        : slideId === "yellow-corners-solution-3"
        ? (Math.PI / 180) * 45 // 45 degrees to the right (positive) - will change to +225 after first sequence
        : 0;
    return {
      extraYawRad: extraYaw,
      flipUpsideDown: true,
      extraERotationDeg: -45,
      slideId: slideIdForLogging,
    };
  }

  if (
    slideId === "practice-white-corners" ||
    slideId === "practice-white-corners-2" ||
    slideId === "practice-white-corners-3"
  ) {
    // White corners practice slides: flip upside down (yellow top)
    // Yaw matches initial slide transition (0)
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
    // White cross practice slides: normal orientation (white on top)
    // Yaw adjusted 45 degrees to the right (negative) to correct left offset
    return {
      extraYawRad: (Math.PI / 180) * -45,
      slideId: slideIdForLogging,
    };
  }

  if (
    slideId === "practice-second-layer" ||
    slideId === "practice-second-layer-2" ||
    slideId === "practice-second-layer-3"
  ) {
    // Second layer practice slide: flip upside down (yellow on top) to match other second layer slides
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
    // Slide 8 of white cross: start with yaw 135 degrees to the right (-135 degrees)
    // This will be changed after first sequence (R' D' R) completes to -45 degrees
    return {
      extraYawRad: (Math.PI / 180) * -135,
      slideId: slideIdForLogging,
    };
  }

  // Default: just set slide ID for logging
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
 * Find all white edge cubie indices (WHITE + GREEN|RED|BLUE|ORANGE)
 */
export const findWhiteEdgeIndices = (
  cube3D: CubeState[][][]
): Array<[number, number, number]> => {
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
};

/**
 * Find all white corner cubie indices
 */
export const findWhiteCornerIndices = (
  cube3D: CubeState[][][]
): Array<[number, number, number]> => {
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
