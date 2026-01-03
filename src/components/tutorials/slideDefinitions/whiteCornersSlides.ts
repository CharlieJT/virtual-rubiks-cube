import type { CubeState } from "@/types/cube";
import { CubeJSWrapper } from "@utils/cubejsWrapper";
import { getCubieColorSet } from "@/utils/tutorialHelpers";
import CUBE_COLORS from "@/consts/cubeColours";
import type { Slide } from "./notationSlides";

export function getWhiteCornersSlides(): Slide[] {
  return [
    {
      id: "intro",
      title: "What we're aiming to achieve",
      description:
        "Now that you have a white cross, it's time to complete the white face by positioning the four white corner pieces. Each white corner should be positioned correctly with the white sticker on the bottom face, and the other two stickers matching their respective center colors. You should only be able to orbit the cube to see all the pieces that need to be positioned.",
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
        // Keep white edges (two-color pieces that include WHITE)
        const set = getCubieColorSet(piece);
        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;
        // Keep white corners (three-color pieces that include WHITE)
        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;
        return false;
      },
    },
    {
      id: "mechanical-approach",
      title: "A more mechanical approach",
      description:
        "From this point forward, we'll take a more mechanical approach. Instead of intuitive problem-solving, we'll focus on recognizing specific scenarios and applying the correct algorithm to solve each piece. Here, we're focusing on the green/white/red corner piece - notice how it needs to be positioned between the green, red & white center pieces.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        // Start with solved cube - visual spin will be applied separately
        cube.reset();
      },
      filter: (piece: CubeState) => {
        // Keep all centers
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        // Keep white edges (two-color pieces that include WHITE)
        const set = getCubieColorSet(piece);
        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;
        // Keep only the green/white/red corner (we'll focus on this specific piece)
        if (
          set.size === 3 &&
          set.has(CUBE_COLORS.WHITE) &&
          set.has(CUBE_COLORS.GREEN) &&
          set.has(CUBE_COLORS.RED)
        )
          return true;
        return false;
      },
    },
    {
      id: "practice-setup-solution",
      title: "Solving with white on bottom",
      description:
        "From here on out, we now work from white on the bottom and use the yellow layer to find our corner pieces. Notice here we have the green/white/red corner that needs to be inserted into its corner. We match this up with the green and red center pieces. With red center facing front, execute the algorithm R U R' to insert the corner piece correctly.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        // Apply setup moves: R U' R' relative to yellow top/red front (visual)
        // Logical state is white top/green front, so remap: R→F (red front to green front), U→D
        // So: R U' R' → F D' F'
        cube.applyMoves(["F", "D'", "F'"]);
      },
      filter: (piece: CubeState) => {
        // Keep all centers
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        // Keep white edges (two-color pieces that include WHITE)
        const set = getCubieColorSet(piece);
        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;
        // Keep only the green/white/red corner (same as slide 2)
        if (
          set.size === 3 &&
          set.has(CUBE_COLORS.WHITE) &&
          set.has(CUBE_COLORS.GREEN) &&
          set.has(CUBE_COLORS.RED)
        )
          return true;
        return false;
      },
    },
    {
      id: "practice-setup-solution-2",
      title: "Another scenario",
      description:
        "Here's another scenario. We have the green/white/red corner that needs to be positioned correctly. This time, the white sticker is pointing up (towards yellow). We match it up with the green and red center pieces. With green center facing front, execute the algorithm L' U' L to insert the corner piece correctly.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        // Apply setup moves: L' U L relative to yellow top/green front (visual)
        // Logical state is white top/green front, so remap: L→R (when flipped, L and R swap), U→D
        // So: L' U L → R' D R
        cube.applyMoves(["R'", "D", "R"]);
      },
      filter: (piece: CubeState) => {
        // Keep all centers
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        // Keep white edges (two-color pieces that include WHITE)
        const set = getCubieColorSet(piece);
        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;
        // Keep only the green/white/red corner
        if (
          set.size === 3 &&
          set.has(CUBE_COLORS.WHITE) &&
          set.has(CUBE_COLORS.GREEN) &&
          set.has(CUBE_COLORS.RED)
        )
          return true;
        return false;
      },
    },
    {
      id: "practice-setup-solution-3",
      title: "When white is facing up",
      description:
        "Here's another scenario. When the white sticker is facing up, we need to flip it round first. Execute R U2 R' U' to flip the corner piece, then use the algorithm we learned from slide 3 (R U R') to insert it correctly. Both parts are relative to yellow top/red front.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        // Apply setup moves to create state where solution is: R U2 R' U', R U R' U'
        // Inverse of solution in reverse order: U R U' R', U R U2' R' = U R U' R', U R U2 R' (visual)
        // Logical state is white top/green front, so remap: R→F (red front to green front), U→D
        // Setup: U R U' R' U R U2 R' → D F D' F' D F D2 F'
        cube.applyMoves(["D", "F", "D'", "F'", "D", "F", "D2", "F'"]);
      },
      filter: (piece: CubeState) => {
        // Keep all centers
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        // Keep white edges (two-color pieces that include WHITE)
        const set = getCubieColorSet(piece);
        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;
        // Keep only the green/white/red corner
        if (
          set.size === 3 &&
          set.has(CUBE_COLORS.WHITE) &&
          set.has(CUBE_COLORS.GREEN) &&
          set.has(CUBE_COLORS.RED)
        )
          return true;
        return false;
      },
    },
    {
      id: "practice-setup-solution-4",
      title: "Removing and reinserting",
      description:
        "Sometimes the corner piece is already in the correct position but incorrectly oriented. In this case, with red center facing front, execute R U R' U' twice to solve it. Note that it's just the same algorithm repeated twice. Both parts are relative to yellow top/red front.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        // Apply setup moves: R U' R' U R U' R' relative to yellow top/red front (visual)
        // Logical state is white top/green front, so remap: R→F, U→D
        // Setup: R U' R' U R U' R' → F D' F' D F D' F'
        cube.applyMoves(["F", "D'", "F'", "D", "F", "D'", "F'"]);
      },
      filter: (piece: CubeState) => {
        // Keep all centers
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        // Keep white edges (two-color pieces that include WHITE)
        const set = getCubieColorSet(piece);
        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;
        // Keep only the green/white/red corner
        if (
          set.size === 3 &&
          set.has(CUBE_COLORS.WHITE) &&
          set.has(CUBE_COLORS.GREEN) &&
          set.has(CUBE_COLORS.RED)
        )
          return true;
        return false;
      },
    },
    {
      id: "practice-setup-solution-5",
      title: "Another removal and reinsertion",
      description:
        "This may seem complicated at first glance, but it's actually quite simple. With red center facing front, execute R U R' U', then R U2 R' U', then R U R'. Notice that it's the same algorithm repeated, with only the middle one using U2 instead of U, and the last part omitting the final U'. All three parts are relative to yellow top/red front.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        // Apply setup moves to create state where solution is: R U R' U', R U2 R' U', R U R'
        // Inverse of solution in reverse order: U R U' R', U R U2 R', U R U' R' (visual)
        // Logical state is white top/green front, so remap: R→F, U→D
        // Setup: U R U' R' U R U2 R' U R U' R' → D F D' F' D F D2 F' D F D' F'
        cube.applyMoves([
          "D",
          "F",
          "D'",
          "F'",
          "D",
          "F",
          "D2",
          "F'",
          "D",
          "F",
          "D'",
          "F'",
        ]);
      },
      filter: (piece: CubeState) => {
        // Keep all centers
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        // Keep white edges (two-color pieces that include WHITE)
        const set = getCubieColorSet(piece);
        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;
        // Keep only the green/white/red corner
        if (
          set.size === 3 &&
          set.has(CUBE_COLORS.WHITE) &&
          set.has(CUBE_COLORS.GREEN) &&
          set.has(CUBE_COLORS.RED)
        )
          return true;
        return false;
      },
    },
    {
      id: "practice-setup-solution-6",
      title: "Moving to the correct corner",
      description:
        "Sometimes a corner piece ends up in the wrong position. With green facing front, do R U R' U' to remove it. Then do U to move it above its correct corner. Finally, with red facing front, do R U R' to insert it into place.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        // Apply setup moves: L' U' L F' U' F relative to yellow top/green front (visual)
        // Logical state is white top/green front, so remap: L→R (when flipped, L and R swap), U→D, F→F (green stays front)
        // So: L' U' L F' U' F → R' D' R F' D' F
        cube.applyMoves(["R'", "D'", "R", "F'", "D'", "F"]);
      },
      filter: (piece: CubeState) => {
        // Keep all centers
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        // Keep white edges (two-color pieces that include WHITE)
        const set = getCubieColorSet(piece);
        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;
        // Keep only the green/white/red corner
        if (
          set.size === 3 &&
          set.has(CUBE_COLORS.WHITE) &&
          set.has(CUBE_COLORS.GREEN) &&
          set.has(CUBE_COLORS.RED)
        )
          return true;
        return false;
      },
    },
    {
      id: "recap-white-corners",
      title: "Quick recap: White Corners",
      description:
        "A summary of the algorithms we've learned for solving white corners.",
      allowFaceMoves: false,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
      },
      filter: (piece: CubeState) => {
        // Keep all centers
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        // Keep white edges (two-color pieces that include WHITE)
        const set = getCubieColorSet(piece);
        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;
        // Keep white corners (three-color pieces that include WHITE)
        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;
        return false;
      },
    },
    {
      id: "practice-white-corners",
      title: "Practice: Complete White Face (2 Pieces)",
      description:
        "Practice solving the complete white face. In this setup, you need to position two white corner pieces that are currently in the top layer. Use the algorithms you've learned to bring each corner to its correct position. If you get stuck, go back to previous slides to review the individual cases.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        // Apply setup moves: R U R' U L' U' L U' relative to yellow top/red front (visual)
        // Logical state is white top/green front, so remap: R→F, U→D, L→B
        // So: R U R' U L' U' L U' → F D F' D B' D' B D'
        cube.applyMoves(["F", "D", "F'", "D", "B'", "D'", "B", "D'"]);
      },
      filter: (piece: CubeState) => {
        // Keep all centers
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        // Keep white edges (two-color pieces that include WHITE)
        const set = getCubieColorSet(piece);
        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;
        // Keep white corners (three-color pieces that include WHITE) - NOT greyed out
        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;
        return false;
      },
    },
    {
      id: "practice-white-corners-2",
      title: "Practice: Complete White Face (3 Pieces)",
      description:
        "In this practice setup, you need to position three white corner pieces. One corner is already in the bottom layer but in the wrong position - you'll need to remove it first using the algorithms you've learned, then position all three corners correctly. Work through each piece systematically.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        // Apply setup moves: L' U' L R U R' L U L' U' L U' L' relative to yellow top/green front (visual)
        // When flipped (yellow top/green front), L and R swap: L→R, R→L, U→D
        // Logical: R' D' R L D L' R D R' D' R D' R'
        cube.applyMoves([
          "R'",
          "D'",
          "R",
          "L",
          "D",
          "L'",
          "R",
          "D",
          "R'",
          "D'",
          "R",
          "D'",
          "R'",
        ]);
      },
      filter: (piece: CubeState) => {
        // Keep all centers
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        // Keep white edges (two-color pieces that include WHITE)
        const set = getCubieColorSet(piece);
        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;
        // Keep white corners (three-color pieces that include WHITE) - NOT greyed out
        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;
        return false;
      },
    },
    {
      id: "practice-white-corners-3",
      title: "Practice: Complete White Face (4 Pieces)",
      description:
        "This is the most challenging practice setup. You need to position all four white corner pieces. One corner is in the wrong position in the bottom layer and needs to be removed first. Another corner is in the correct position but incorrectly oriented - you'll need to remove and reinsert it. Work through each piece methodically using the algorithms you've learned.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        // Apply setup moves: L' U' L R U R' L U L' U' L U' L' R' U' R U F' U F L' U L R U R'
        // relative to yellow top/green front (visual)
        // When flipped (yellow top/green front), L and R swap: L→R, R→L, U→D
        // For the F moves in the middle, when we're at yellow top/red front, F→F (red front stays red front)
        // But wait, the sequence changes orientation partway through
        // Let me break it down:
        // Part 1 (yellow top/green front): L' U' L R U R' L U L' U' L U' L'
        //   → R' D' R L D L' R D R' D' R D' R'
        // Part 2 (yellow top/red front): R' U' R U F' U F
        //   → L' D' L D F' D F (R→L, U→D, F→F)
        // Part 3 (yellow top/red front): L' U L R U R'
        //   → R' D R L D L' (L→R, U→D, R→L)
        cube.applyMoves([
          "R'",
          "D'",
          "R",
          "L",
          "D",
          "L'",
          "R",
          "D",
          "R'",
          "D'",
          "R",
          "D'",
          "R'",
          "L'",
          "D'",
          "L",
          "D",
          "F'",
          "D",
          "F",
          "R'",
          "D",
          "R",
          "L",
          "D",
          "L'",
        ]);
      },
      filter: (piece: CubeState) => {
        // Keep all centers
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        // Keep white edges (two-color pieces that include WHITE)
        const set = getCubieColorSet(piece);
        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;
        // Keep white corners (three-color pieces that include WHITE) - NOT greyed out
        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;
        return false;
      },
    },
  ];
}
