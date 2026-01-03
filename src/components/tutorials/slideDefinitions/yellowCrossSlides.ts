import type { CubeState } from "@/types/cube";
import { CubeJSWrapper } from "@utils/cubejsWrapper";
import { getCubieColorSet } from "@/utils/tutorialHelpers";
import CUBE_COLORS from "@/consts/cubeColours";
import type { Slide } from "./notationSlides";

export function getYellowCrossSlides(): Slide[] {
  return [
    {
      id: "intro",
      title: "What we're aiming to achieve",
      description:
        "Now that you have completed the first two layers, it's time to solve the yellow cross. This involves positioning the four yellow edge pieces around the yellow center. Each yellow edge should match the color of the center piece on its side. You should only be able to orbit the cube to see all the pieces that need to be positioned.",
      allowFaceMoves: false,
      setup: (cube: CubeJSWrapper) => {
        // Ensure a solved cube whenever we land on slide 1
        cube.reset();
      },
      filter: (piece: CubeState) => {
        // Keep all centers
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;

        const set = getCubieColorSet(piece);

        // Keep all edges (including yellow edges)
        if (set.size === 2) return true;

        // Keep all corners EXCEPT corners that include yellow
        if (set.size === 3 && !set.has(CUBE_COLORS.YELLOW)) return true;

        return false;
      },
    },
    {
      id: "yellow-cross-states",
      title: "The four states of the yellow cross",
      description:
        "When working on the yellow cross, you'll encounter one of four different patterns on the yellow face. These patterns determine which algorithm you'll use to solve the yellow cross. The four states are: Cross (already solved), Line (two yellow edges opposite each other), L-shape (two yellow edges forming an L), and Dot (no yellow edges on the yellow face). Each state has a specific algorithm to transform it into the completed cross.",
      allowFaceMoves: false,
      setup: (cube: CubeJSWrapper) => {
        // Solved state for now - the grid will show different states
        cube.reset();
      },
    },
    {
      id: "yellow-cross-line",
      title: "Solving the Line pattern",
      description:
        "When you see a line pattern on the yellow face (two yellow edges positioned opposite each other), you need to transform it into a cross. Position the line horizontally, then apply the algorithm F R U R' U' F'. This will convert the line pattern into the completed yellow cross.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        // Apply setup moves: R2 D R' U2 R D' R' U2 R D R' U2 R D' R' U2 R' U F U R U' R' F' relative to yellow top/red front (visual)
        // Logical state is white top/green front, so remap:
        // When yellow top/red front: R→F, U→U (not D), F→R, L→B, B→L, D→D
        // Visual: R2 D R' U2 R D' R' U2 R D R' U2 R D' R' U2 R' U F U R U' R' F'
        // Logical: F2 U F' D2 F U' F' D2 F U' F' D2 F U' F' D2 F' D R D F D' F' R'
        cube.applyMoves([
          "F2",
          "U",
          "F'",
          "D2",
          "F",
          "U'",
          "F'",
          "D2",
          "F",
          "U",
          "F'",
          "D2",
          "F",
          "U'",
          "F'",
          "D2",
          "F'",
          "D",
          "R",
          "D",
          "F",
          "D'",
          "F'",
          "R'",
        ]);
      },
      filter: (piece: CubeState) => {
        // Keep all centers
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;

        const set = getCubieColorSet(piece);

        // Keep all edges (including yellow edges)
        if (set.size === 2) return true;

        // Keep all corners EXCEPT corners that include yellow
        if (set.size === 3 && !set.has(CUBE_COLORS.YELLOW)) return true;

        return false;
      },
    },
    {
      id: "yellow-cross-triangle",
      title: "Solving the Triangle pattern",
      description:
        "When you see a triangle pattern on the yellow face (three yellow edges forming an L-shape or triangle), you need to position it so the triangle is in the top left corner. Then apply the algorithm F R U R' U' F' to transform it into a line pattern. Once you have the line pattern, apply F R U R' U' F' again to complete the yellow cross.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        // Apply setup moves: R2 D R' U2 R D' R' U2 R D R' U2 R D' R' U2 R' U' F U R U' R' U R U' R' F' relative to yellow top/red front (visual)
        // Logical state is white top/green front, so remap:
        // Visual: R2 D R' U2 R D' R' U2 R D R' U2 R D' R' U2 R' U' F U R U' R' U R U' R' F'
        // Logical: F2 U F' D2 F U' F' D2 F U F' D2 F U' F' D2 F' D' R D F D' F' D F D' F' R'
        cube.applyMoves([
          "F2",
          "U",
          "F'",
          "D2",
          "F",
          "U'",
          "F'",
          "D2",
          "F",
          "U",
          "F'",
          "D2",
          "F",
          "U'",
          "F'",
          "D2",
          "F'",
          "D'",
          "R",
          "D",
          "F",
          "D'",
          "F'",
          "D",
          "F",
          "D'",
          "F'",
          "R'",
        ]);
      },
      filter: (piece: CubeState) => {
        // Keep all centers
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;

        const set = getCubieColorSet(piece);

        // Keep all edges (including yellow edges)
        if (set.size === 2) return true;

        // Keep all corners EXCEPT corners that include yellow
        if (set.size === 3 && !set.has(CUBE_COLORS.YELLOW)) return true;

        return false;
      },
    },
    {
      id: "yellow-cross-dot",
      title: "Solving the Dot pattern",
      description:
        "When you see a dot pattern on the yellow face (no yellow edges visible), you need to apply F R U R' U' F' to get an L-shape. Position the L-shape in the top left corner with U2, then apply F R U R' U' F' again to get a line pattern. Finally, apply F R U R' U' F' once more to complete the yellow cross.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        // Apply setup moves: R2 D R' U2 R D' R' U2 R D R' U2 R D' R' U2 R' U F U R U' R' F' U' F U R U' R' U R U' R' F' relative to yellow top/red front (visual)
        // Logical state is white top/green front, so remap: R→F, U→D, F→R, L→B, B→L, D→U
        cube.applyMoves([
          "F2",
          "U",
          "F'",
          "D2",
          "F",
          "U'",
          "F'",
          "D2",
          "F",
          "U",
          "F'",
          "D2",
          "F",
          "U'",
          "F'",
          "D2",
          "F'",
          "D",
          "R",
          "D",
          "F",
          "D'",
          "F'",
          "R'",
          "D'",
          "R",
          "D",
          "F",
          "D'",
          "F'",
          "D",
          "F",
          "D'",
          "F'",
          "R'",
        ]);
      },
      filter: (piece: CubeState) => {
        // Keep all centers
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;

        const set = getCubieColorSet(piece);

        // Keep all edges (including yellow edges)
        if (set.size === 2) return true;

        // Keep all corners EXCEPT corners that include yellow
        if (set.size === 3 && !set.has(CUBE_COLORS.YELLOW)) return true;

        return false;
      },
    },
  ];
}
