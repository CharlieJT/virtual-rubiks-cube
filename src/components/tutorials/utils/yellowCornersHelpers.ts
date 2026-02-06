import type { CubeState } from "@/types/cube";
import CUBE_COLORS from "@/consts/cubeColours";
import { getCubieColorSet } from "./tutorialHelpers";

/**
 * Get the match status for each yellow corner piece
 * Returns a map of corner position to whether the correct corner piece is in that position
 * (orientation doesn't matter - just that the right colors are present)
 */
export const getYellowCornerMatchStatus = (
  cube3D: CubeState[][][]
): Map<string, boolean> => {
  const result = new Map<string, boolean>();
  if (!cube3D) return result;

  // Yellow corners on bottom face (y=0) and their expected colors based on adjacent centers
  // Each corner should have yellow + the two colors from the adjacent centers
  const yellowCorners = [
    {
      pos: [0, 0, 0] as [number, number, number], // back-left corner
      yellowFace: "bottom" as const,
      adjacentCenters: [
        { pos: [0, 1, 0] as [number, number, number], face: "back" as const }, // back center
        { pos: [0, 1, 1] as [number, number, number], face: "left" as const }, // left center
      ],
    },
    {
      pos: [2, 0, 0] as [number, number, number], // back-right corner
      yellowFace: "bottom" as const,
      adjacentCenters: [
        { pos: [2, 1, 0] as [number, number, number], face: "back" as const }, // back center
        { pos: [2, 1, 1] as [number, number, number], face: "right" as const }, // right center
      ],
    },
    {
      pos: [0, 0, 2] as [number, number, number], // front-left corner
      yellowFace: "bottom" as const,
      adjacentCenters: [
        { pos: [0, 1, 2] as [number, number, number], face: "front" as const }, // front center
        { pos: [0, 1, 1] as [number, number, number], face: "left" as const }, // left center
      ],
    },
    {
      pos: [2, 0, 2] as [number, number, number], // front-right corner
      yellowFace: "bottom" as const,
      adjacentCenters: [
        { pos: [2, 1, 2] as [number, number, number], face: "front" as const }, // front center
        { pos: [2, 1, 1] as [number, number, number], face: "right" as const }, // right center
      ],
    },
  ];

  for (const { pos, adjacentCenters } of yellowCorners) {
    const [cx, cy, cz] = pos;
    const cornerPiece = cube3D[cx][cy][cz];

    if (!cornerPiece) {
      result.set(`${cx},${cy},${cz}`, false);
      continue;
    }

    const cornerColors = getCubieColorSet(cornerPiece);
    
    // Must be a yellow corner (has yellow + two other colors = 3 colors total)
    if (cornerColors.size !== 3 || !cornerColors.has(CUBE_COLORS.YELLOW)) {
      result.set(`${cx},${cy},${cz}`, false);
      continue;
    }

    // Get the expected colors for this corner position (yellow + the two center colors)
    const center1 = cube3D[adjacentCenters[0].pos[0]][adjacentCenters[0].pos[1]][adjacentCenters[0].pos[2]];
    const center2 = cube3D[adjacentCenters[1].pos[0]][adjacentCenters[1].pos[1]][adjacentCenters[1].pos[2]];

    if (!center1 || !center2) {
      result.set(`${cx},${cy},${cz}`, false);
      continue;
    }

    const expectedColors = new Set([
      CUBE_COLORS.YELLOW,
      center1.colors[adjacentCenters[0].face],
      center2.colors[adjacentCenters[1].face],
    ]);

    // Check if the corner piece has the correct colors (orientation doesn't matter)
    const matches = 
      cornerColors.size === expectedColors.size &&
      Array.from(cornerColors).every(color => expectedColors.has(color)) &&
      Array.from(expectedColors).every(color => cornerColors.has(color));

    result.set(`${cx},${cy},${cz}`, matches);
  }

  return result;
};
