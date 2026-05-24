import type { CubeState } from "@/types/cube";

const GREY = "#808080";

const makeCentersGrey = (cube3D: CubeState[][][]): CubeState[][][] => {
  const result: CubeState[][][] = [];
  
  for (let x = 0; x < 3; x++) {
    result[x] = [];
    for (let y = 0; y < 3; y++) {
      result[x][y] = [];
      for (let z = 0; z < 3; z++) {
        const piece = cube3D[x][y][z];
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        
        if (isCenter) {
          const newColors = { ...piece.colors };
          Object.keys(newColors).forEach((key) => {
            if (newColors[key as keyof typeof newColors]) {
              newColors[key as keyof typeof newColors] = GREY;
            }
          });
          result[x][y][z] = { ...piece, colors: newColors };
        } else {
          result[x][y][z] = piece;
        }
      }
    }
  }
  
  return result;
};

const SIDE_CENTER_POSITIONS: [number, number, number][] = [
  [1, 1, 0],
  [1, 1, 2],
  [0, 1, 1],
  [2, 1, 1],
];

const makeSideCentersGrey = (cube3D: CubeState[][][]): CubeState[][][] => {
  const result = cube3D.map((layer) =>
    layer.map((row) => row.map((piece) => ({ ...piece })))
  );
  for (const [x, y, z] of SIDE_CENTER_POSITIONS) {
    const piece = result[x][y][z];
    if (piece) {
      result[x][y][z] = {
        ...piece,
        colors: {
          front: GREY,
          back: GREY,
          left: GREY,
          right: GREY,
          top: GREY,
          bottom: GREY,
        },
      };
    }
  }
  return result;
};

/** Copy true side-centre sticker colors from `source` onto `target` (e.g. after getTutorialCubeStateForSlide greyed them). */
const restoreSideCenterColorsFromCube = (
  target: CubeState[][][],
  source: CubeState[][][],
): CubeState[][][] => {
  const result = target.map((layer) =>
    layer.map((row) =>
      row.map((piece) => ({
        ...piece,
        colors: { ...piece.colors },
      })),
    ),
  );
  for (const [x, y, z] of SIDE_CENTER_POSITIONS) {
    const src = source[x]?.[y]?.[z];
    const piece = result[x]?.[y]?.[z];
    if (src && piece) {
      result[x][y][z] = { ...piece, colors: { ...src.colors } };
    }
  }
  return result;
};

export {
  makeCentersGrey,
  makeSideCentersGrey,
  restoreSideCenterColorsFromCube,
};



