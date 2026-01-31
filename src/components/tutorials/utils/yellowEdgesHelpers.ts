import type { CubeState } from "@/types/cube";
import CUBE_COLORS from "@/consts/cubeColours";
import { getCubieColorSet } from "./tutorialHelpers";

/**
 * Check if yellow cross is solved
 * Yellow cross is solved when all four yellow edges have yellow sticker on yellow face
 * (yellow face is at y=0, bottom, in logical coordinates)
 */
export const isYellowCrossSolved = (cube3D: CubeState[][][]): boolean => {
  if (!cube3D) return false;

  // Find yellow center (at y=0, bottom face)
  const yellowCenter = cube3D[1][0][1];
  if (!yellowCenter || yellowCenter.colors.bottom !== CUBE_COLORS.YELLOW) {
    return false;
  }

  // Check the four yellow edges on the bottom face
  const yellowEdges = [
    { pos: [1, 0, 0], yellowFace: "bottom" as const }, // back edge
    { pos: [0, 0, 1], yellowFace: "bottom" as const }, // left edge
    { pos: [2, 0, 1], yellowFace: "bottom" as const }, // right edge
    { pos: [1, 0, 2], yellowFace: "bottom" as const }, // front edge
  ];

  for (const { pos, yellowFace } of yellowEdges) {
    const [x, y, z] = pos;
    const edgePiece = cube3D[x][y][z];
    const colors = getCubieColorSet(edgePiece);

    // Must be a yellow edge (has yellow + one other color)
    if (colors.size !== 2 || !colors.has(CUBE_COLORS.YELLOW)) {
      return false;
    }

    // Yellow sticker must be on the yellow face (bottom)
    if (edgePiece.colors[yellowFace] !== CUBE_COLORS.YELLOW) {
      return false;
    }
  }

  return true;
};

/**
 * Get the match status for each yellow edge piece
 * Returns a map of edge position to whether it matches its adjacent center
 */
export const getYellowEdgeMatchStatus = (
  cube3D: CubeState[][][]
): Map<string, boolean> => {
  const result = new Map<string, boolean>();
  if (!cube3D) return result;

  // Yellow edges on bottom face (y=0) and their adjacent centers
  const yellowEdges = [
    {
      pos: [1, 0, 0] as [number, number, number],
      yellowFace: "bottom" as const,
      sideFace: "back" as const,
      centerPos: [1, 1, 0] as [number, number, number],
      centerFace: "back" as const,
    }, // back edge
    {
      pos: [0, 0, 1] as [number, number, number],
      yellowFace: "bottom" as const,
      sideFace: "left" as const,
      centerPos: [0, 1, 1] as [number, number, number],
      centerFace: "left" as const,
    }, // left edge
    {
      pos: [2, 0, 1] as [number, number, number],
      yellowFace: "bottom" as const,
      sideFace: "right" as const,
      centerPos: [2, 1, 1] as [number, number, number],
      centerFace: "right" as const,
    }, // right edge
    {
      pos: [1, 0, 2] as [number, number, number],
      yellowFace: "bottom" as const,
      sideFace: "front" as const,
      centerPos: [1, 1, 2] as [number, number, number],
      centerFace: "front" as const,
    }, // front edge
  ];

  for (const { pos, sideFace, centerPos, centerFace } of yellowEdges) {
    const [ex, ey, ez] = pos;
    const [cx, cy, cz] = centerPos;
    const edgePiece = cube3D[ex][ey][ez];
    const centerPiece = cube3D[cx][cy][cz];

    if (!edgePiece || !centerPiece) {
      result.set(`${ex},${ey},${ez}`, false);
      continue;
    }

    const edgeColors = getCubieColorSet(edgePiece);
    if (edgeColors.size !== 2 || !edgeColors.has(CUBE_COLORS.YELLOW)) {
      result.set(`${ex},${ey},${ez}`, false);
      continue;
    }

    // Get the non-yellow color from the edge
    const nonYellowColor = Array.from(edgeColors).find(
      (c) => c !== CUBE_COLORS.YELLOW
    );
    if (!nonYellowColor) {
      result.set(`${ex},${ey},${ez}`, false);
      continue;
    }

    // Check if the edge's non-yellow color on the side face matches the center
    const edgeSideColor = edgePiece.colors[sideFace];
    const centerColor = centerPiece.colors[centerFace];

    const matches =
      edgeSideColor === centerColor && centerColor === nonYellowColor;
    result.set(`${ex},${ey},${ez}`, matches);
  }

  return result;
};
