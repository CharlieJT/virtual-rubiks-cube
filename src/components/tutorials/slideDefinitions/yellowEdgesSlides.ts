import type { CubeState } from "@/types/cube";
import { CubeJSWrapper } from "@utils/cubejsWrapper";
import { getCubieColorSet } from "@/utils/tutorialHelpers";
import CUBE_COLORS from "@/consts/cubeColours";
import type { Slide } from "./notationSlides";

export function getYellowEdgesSlides(): Slide[] {
  return [
    {
      id: "intro",
      title: "What we're aiming to achieve",
      description:
        "Now that you have the yellow cross, it's time to ensure that the yellow edge pieces are in their correct positions. Each yellow edge should be positioned so that the yellow sticker matches the yellow center, and the other sticker matches its adjacent center color. You should only be able to orbit the cube to see all the pieces that need to be positioned.",
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

        // Keep white corners (to show completed white face)
        // Do NOT show yellow corners (similar to yellow-cross intro)
        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;

        return false;
      },
    },
    {
      id: "yellow-edges-solution",
      title: "Positioning yellow edge pieces",
      description:
        "The pieces have been labelled with a tick or cross to indicate if a yellow edge piece is positioned against its center piece. In this example, we have 2 that are and 2 that are not. For this, we position the correctly positioned yellow edge pieces at the back and on the right hand side and do the algorithm R U R' U R U2 R' U to correct them.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        // Apply setup moves: R U R' U R U2 R' U relative to yellow top/red front (visual)
        // Logical state is white top/green front, so remap:
        // When yellow top/red front: R→F, U→D
        // R U R' U R U2 R' U → F D F' D F D2 F' D
        cube.applyMoves(["F", "D", "F'", "D", "F", "D2", "F'", "D"]);
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

        // Keep white corners (to show completed white face)
        // Do NOT show yellow corners
        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;

        return false;
      },
    },
    {
      id: "yellow-edges-solution-2",
      title: "Positioning yellow edge pieces (1 correct)",
      description:
        "Here we have an example of 1 edge piece that is correctly positioned. We need either 2 or 4, so we need to do a U move to get 2 edge pieces in position. After we've done this, we then do the same algorithm with the correct edge pieces in the back and the right and perform the algorithm R U R' U R U2 R' U.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        // Apply setup moves: R U R' U R U2 R relative to yellow top/green front (visual)
        // Logical state is white top/green front, so remap:
        // When yellow top/green front: R→L, U→D
        // R U R' U R U2 R → L D L' D L D2 L'
        cube.applyMoves(["L", "D", "L'", "D", "L", "D2", "L'"]);
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

        // Keep white corners (to show completed white face)
        // Do NOT show yellow corners
        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;

        return false;
      },
    },
    {
      id: "yellow-edges-solution-3",
      title: "Positioning yellow edge pieces (0 correct)",
      description:
        "In this case, we have no correctly positioned edge pieces. We need to do a U2 to get 2 edge pieces in position. After that, we position the correctly positioned edge pieces in the back and on the right and do the algorithm R U R' U R U2 R' U.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        // Apply setup moves: R U R' U R U2 U' relative to yellow top/blue front (visual)
        // Logical state is white top/green front, so remap:
        // When yellow top/blue front: R→R, U→D (blue stays as front/back axis)
        // R U R' U R U2 U' → R D R' D R D2 D' = R D R' D R D2 D'
        cube.applyMoves(["R", "D", "R'", "D", "R", "D2", "R'", "D'"]);
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

        // Keep white corners (to show completed white face)
        // Do NOT show yellow corners
        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;

        return false;
      },
    },
  ];
}
