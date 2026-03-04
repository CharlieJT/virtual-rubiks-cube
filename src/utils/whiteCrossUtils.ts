import type { CubeState } from "@/types/cube";
import { CubeJSWrapper } from "@utils/cubejsWrapper";
import CUBE_COLORS from "@/consts/cubeColours";

// Helper to list unique, visible sticker colors on a cubie (ignore grey + black)
export const getCubieColorSet = (piece: CubeState) => {
  const colors = new Set<string>();
  const grey = "#808080";
  const black = CUBE_COLORS.BLACK;
  Object.values(piece.colors).forEach((c) => {
    if (c && c !== grey && c !== black) colors.add(c);
  });
  return colors;
};

// White cross detection logic
export const isWhiteCrossSolved = (cubeWrapper: CubeJSWrapper) => {
  const currentCube = cubeWrapper.getCube();

  // Find the white center (which determines the "white face")
  let whiteFaceIndex = -1;
  for (let i = 0; i < 6; i++) {
    const centerPosition = { x: 1, y: 1, z: i === 4 ? 0 : i === 5 ? 2 : 1 };
    if (i < 3) {
      if (i === 0) centerPosition.x = 0;
      else if (i === 1) centerPosition.x = 2;
      else centerPosition.y = i === 2 ? 0 : 2;
    } else if (i === 3) {
      centerPosition.y = 2;
    }

    const centerPiece =
      currentCube[centerPosition.x][centerPosition.y][centerPosition.z];
    if (
      centerPiece &&
      Object.values(centerPiece.colors).includes(CUBE_COLORS.WHITE)
    ) {
      whiteFaceIndex = i;
      break;
    }
  }

  if (whiteFaceIndex === -1) return false;

  // Check all four edges adjacent to the white center
  const edgePositions = [
    { x: 1, y: 0, z: 1 }, // Top edge
    { x: 1, y: 2, z: 1 }, // Bottom edge
    { x: 0, y: 1, z: 1 }, // Left edge
    { x: 2, y: 1, z: 1 }, // Right edge
  ];

  let solvedEdges = 0;
  for (const pos of edgePositions) {
    const piece = currentCube[pos.x][pos.y][pos.z];
    if (!piece) continue;

    const colors = Object.values(piece.colors).filter(
      (c) => c && c !== "#808080" && c !== CUBE_COLORS.BLACK
    );

    // Check if this is a white edge (has white + one other color)
    if (colors.length === 2 && colors.includes(CUBE_COLORS.WHITE)) {
      // For a proper white cross, the white sticker should be on the white face
      // and the other color should match the adjacent center
      // This is a simplified check
      solvedEdges++;
    }
  }

  return solvedEdges === 4;
};
