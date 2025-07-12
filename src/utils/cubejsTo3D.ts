import type { CubeState } from "../types/cube";
import Cube from "cubejs";

// Correct color mapping for your orientation
const COLOR_MAP = {
  U: "#ffffff", // White (top)
  D: "#ffff00", // Yellow (bottom)
  F: "#00ff00", // Green (front)
  B: "#0000ff", // Blue (back)
  R: "#ff0000", // Red (right)
  L: "#ff6500", // Orange (left)
};

// Helper to get color for a facelet
const getColor = (face: string) =>
  COLOR_MAP[face as keyof typeof COLOR_MAP] || "#1a1a1a";

// Helper to get the sticker index for each face
const getStickerIndex = (
  face: "U" | "D" | "F" | "B" | "L" | "R",
  x: number,
  y: number,
  z: number
): number => {
  // cubejs order: U(0), R(9), F(18), D(27), L(36), B(45)
  // User orientation: x=0 left, x=2 right, y=2 top, y=0 bottom, z=2 front, z=0 back
  // All faces are 3x3, indices 0-8 for each face
  switch (face) {
    case "U":
      return 3 * z + x; // y==2, left-to-right (x), back-to-front (z)
    case "D":
      return 27 + 3 * (2 - z) + x; // y==0, left-to-right (x), front-to-back (z)
    case "F":
      return 18 + 3 * (2 - y) + x; // z==2, left-to-right (x), top-to-bottom (y)
    case "B":
      return 45 + 3 * (2 - y) + (2 - x); // z==0, right-to-left (x), top-to-bottom (y)
    case "L":
      return 36 + 3 * (2 - y) + z; // x==0, back-to-front (z), top-to-bottom (y)
    case "R":
      return 9 + 3 * (2 - y) + (2 - z); // x==2, front-to-back (z), top-to-bottom (y)
    default:
      return -1;
  }
};

// Converts cubejs.asString() to a 3x3x3 CubeState array
const cubejsTo3D = (cube: any): CubeState[][][] => {
  // cubejs.asString() returns a string of 54 chars (6 faces * 9 stickers)
  // Order: U, R, F, D, L, B
  const state = cube.asString();
  const cubes: CubeState[][][] = [];
  for (let x = 0; x < 3; x++) {
    cubes[x] = [];
    for (let y = 0; y < 3; y++) {
      cubes[x][y] = [];
      for (let z = 0; z < 3; z++) {
        const colors: any = {
          front: "#1a1a1a",
          back: "#1a1a1a",
          left: "#1a1a1a",
          right: "#1a1a1a",
          top: "#1a1a1a",
          bottom: "#1a1a1a",
        };
        // U face (y==2)
        if (y === 2)
          colors.top = getColor(state[getStickerIndex("U", x, y, z)]);
        // D face (y==0)
        if (y === 0)
          colors.bottom = getColor(state[getStickerIndex("D", x, y, z)]);
        // F face (z==2)
        if (z === 2)
          colors.front = getColor(state[getStickerIndex("F", x, y, z)]);
        // B face (z==0)
        if (z === 0)
          colors.back = getColor(state[getStickerIndex("B", x, y, z)]);
        // L face (x==0)
        if (x === 0)
          colors.left = getColor(state[getStickerIndex("L", x, y, z)]);
        // R face (x==2)
        if (x === 2)
          colors.right = getColor(state[getStickerIndex("R", x, y, z)]);
        cubes[x][y][z] = {
          position: { x, y, z },
          rotation: [0, 0, 0],
          colors,
        };
      }
    }
  }
  return cubes;
};

export default cubejsTo3D;
