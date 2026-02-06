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

export { makeCentersGrey };



