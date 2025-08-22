import Cube from "cubejs";
import CUBE_COLORS from "@/consts/cubeColours";
import type { CubeFace, CubeState } from "@/types/cube";
import FACE_COLORS from "@/consts/faceColors";

type CubeJsInstance = InstanceType<typeof Cube>;

const getColor = (face: string) =>
  FACE_COLORS[face as CubeFace] || CUBE_COLORS.BLACK;

/**
 * Mapping from cube face → function to compute sticker index
 */
const STICKER_INDEXERS: Record<
  CubeFace,
  (x: number, y: number, z: number) => number
> = {
  U: (x, _y, z) => 3 * z + x,
  D: (x, _y, z) => 27 + 3 * (2 - z) + x,
  F: (x, y, _z) => 18 + 3 * (2 - y) + x,
  B: (x, y, _z) => 45 + 3 * (2 - y) + (2 - x),
  L: (_x, y, z) => 36 + 3 * (2 - y) + z,
  R: (_x, y, z) => 9 + 3 * (2 - y) + (2 - z),
};

/**
 * Faces with their "placement condition" in the 3D grid
 */
const FACE_CONDITIONS: {
  face: CubeFace;
  matches: (x: number, y: number, z: number) => boolean;
  target: keyof CubeState["colors"];
}[] = [
  { face: "U", matches: (_x, y) => y === 2, target: "top" },
  { face: "D", matches: (_x, y) => y === 0, target: "bottom" },
  { face: "F", matches: (_x, _y, z) => z === 2, target: "front" },
  { face: "B", matches: (_x, _y, z) => z === 0, target: "back" },
  { face: "L", matches: (x) => x === 0, target: "left" },
  { face: "R", matches: (x) => x === 2, target: "right" },
];

/**
 * Convert cubejs instance → 3D CubeState[][][]
 */
const cubejsTo3D = (cube: CubeJsInstance): CubeState[][][] => {
  const state = cube.asString(); // 54-char cubejs state
  const cubes: CubeState[][][] = [];

  for (let x = 0; x < 3; x++) {
    cubes[x] = [];
    for (let y = 0; y < 3; y++) {
      cubes[x][y] = [];
      for (let z = 0; z < 3; z++) {
        const colors: CubeState["colors"] = {
          front: CUBE_COLORS.BLACK,
          back: CUBE_COLORS.BLACK,
          left: CUBE_COLORS.BLACK,
          right: CUBE_COLORS.BLACK,
          top: CUBE_COLORS.BLACK,
          bottom: CUBE_COLORS.BLACK,
        };

        for (const { face, matches, target } of FACE_CONDITIONS) {
          if (matches(x, y, z)) {
            const idx = STICKER_INDEXERS[face](x, y, z);
            colors[target] = getColor(state[idx]);
          }
        }

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
