import type { CubeState } from "../types/cube";

const COLOR_MAP = {
  U: "#ffffff",
  D: "#ffff00",
  F: "#2cdd5a",
  B: "#6279f7",
  R: "#ff0000",
  L: "#ff9600",
};

const getColor = (face: string) =>
  COLOR_MAP[face as keyof typeof COLOR_MAP] || "#1a1a1a";

const getStickerIndex = (
  face: "U" | "D" | "F" | "B" | "L" | "R",
  x: number,
  y: number,
  z: number
): number => {
  switch (face) {
    case "U":
      return 3 * z + x;
    case "D":
      return 27 + 3 * (2 - z) + x;
    case "F":
      return 18 + 3 * (2 - y) + x;
    case "B":
      return 45 + 3 * (2 - y) + (2 - x);
    case "L":
      return 36 + 3 * (2 - y) + z;
    case "R":
      return 9 + 3 * (2 - y) + (2 - z);
    default:
      return -1;
  }
};

const cubejsTo3D = (cube: any): CubeState[][][] => {
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
        if (y === 2)
          colors.top = getColor(state[getStickerIndex("U", x, y, z)]);
        if (y === 0)
          colors.bottom = getColor(state[getStickerIndex("D", x, y, z)]);
        if (z === 2)
          colors.front = getColor(state[getStickerIndex("F", x, y, z)]);
        if (z === 0)
          colors.back = getColor(state[getStickerIndex("B", x, y, z)]);
        if (x === 0)
          colors.left = getColor(state[getStickerIndex("L", x, y, z)]);
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
