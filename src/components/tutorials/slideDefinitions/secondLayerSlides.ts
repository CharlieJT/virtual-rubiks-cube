import type { CubeState } from "@/types/cube";
import { CubeJSWrapper } from "@utils/cubejsWrapper";
import { getCubieColorSet } from "@/utils/tutorialHelpers";
import CUBE_COLORS from "@/consts/cubeColours";
import type { Slide } from "./notationSlides";

export function getSecondLayerSlides(): Slide[] {
  return [
    {
      id: "intro",
      title: "What we're aiming to achieve",
      description:
        "Now that you have completed the white face, it's time to solve the second layer. This involves positioning the four middle layer edge pieces between the white and yellow layers. Each edge piece should be positioned correctly between its matching center colors. You should only be able to orbit the cube to see all the pieces that need to be positioned.",
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

        // Keep white edges (two-color pieces that include WHITE)
        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;

        // Keep white corners (three-color pieces that include WHITE)
        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;

        // Keep second layer edges (two-color pieces that don't include WHITE or YELLOW)
        // These are: red/green, green/orange, orange/blue, blue/red
        if (
          set.size === 2 &&
          !set.has(CUBE_COLORS.WHITE) &&
          !set.has(CUBE_COLORS.YELLOW)
        ) {
          return true;
        }

        return false;
      },
    },
    {
      id: "mechanical-approach",
      title: "A more mechanical approach",
      description:
        "From this point forward, we'll take a more mechanical approach. Instead of intuitive problem-solving, we'll focus on recognizing specific scenarios and applying the correct algorithm to solve each piece. Here, we're focusing on the red/green second layer edge piece - notice how it needs to be positioned between the red and green center pieces.",
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

        const set = getCubieColorSet(piece);

        // Keep white edges (two-color pieces that include WHITE)
        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;

        // Keep white corners (three-color pieces that include WHITE)
        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;

        // Keep only the red/green second layer edge (we'll focus on this specific piece)
        if (
          set.size === 2 &&
          !set.has(CUBE_COLORS.WHITE) &&
          !set.has(CUBE_COLORS.YELLOW) &&
          set.has(CUBE_COLORS.RED) &&
          set.has(CUBE_COLORS.GREEN)
        ) {
          return true;
        }

        return false;
      },
    },
    {
      id: "second-layer-setup-solution",
      title: "Solving the second layer edge",
      description:
        "When solving the second layer, we focus only on edge pieces that don't have yellow on them. Find an edge piece without yellow, then align it so its color matches its respective center. Determine if it needs to be slotted into the left or right based on the color on top (in this case, to the left). Then perform the algorithm to insert it correctly.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        // Apply setup moves: R U' R' U' F' U F U relative to yellow top/red front (visual)
        // Logical state is white top/green front, so remap:
        // R→F, U→D (from solution mapping: R U R' → F D F')
        // F→R (when yellow top/red front, visual F maps to logical R)
        // R U' R' U' F' U F U → F D' F' D' R' D R D
        cube.applyMoves(["F", "D'", "F'", "D'", "R'", "D", "R", "D"]);
      },
      filter: (piece: CubeState) => {
        // Keep all centers
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;

        const set = getCubieColorSet(piece);

        // Keep white edges (two-color pieces that include WHITE)
        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;

        // Keep white corners (three-color pieces that include WHITE)
        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;

        // Keep only the red/green second layer edge (same as slide 2)
        if (
          set.size === 2 &&
          !set.has(CUBE_COLORS.WHITE) &&
          !set.has(CUBE_COLORS.YELLOW) &&
          set.has(CUBE_COLORS.RED) &&
          set.has(CUBE_COLORS.GREEN)
        ) {
          return true;
        }

        return false;
      },
    },
    {
      id: "second-layer-setup-solution-2",
      title: "Solving the second layer edge (right slot)",
      description:
        "This is another scenario for solving the second layer edge. Find an edge piece without yellow, align it so its color matches its respective center. Determine if it needs to be slotted into the left or right based on the color on top (in this case, to the right). Then perform the algorithm to insert it correctly.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        // Apply setup moves: F' U F U R U' R' U' relative to yellow top/red front (visual)
        // Logical state is white top/green front, so remap:
        // R→F, U→D, F→R (when yellow top/red front)
        // F' U F U R U' R' U' → R' D R D F D' F' D'
        cube.applyMoves(["R'", "D", "R", "D", "F", "D'", "F'", "D'"]);
      },
      filter: (piece: CubeState) => {
        // Keep all centers
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;

        const set = getCubieColorSet(piece);

        // Keep white edges (two-color pieces that include WHITE)
        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;

        // Keep white corners (three-color pieces that include WHITE)
        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;

        // Keep only the red/green second layer edge (same as slide 2)
        if (
          set.size === 2 &&
          !set.has(CUBE_COLORS.WHITE) &&
          !set.has(CUBE_COLORS.YELLOW) &&
          set.has(CUBE_COLORS.RED) &&
          set.has(CUBE_COLORS.GREEN)
        ) {
          return true;
        }

        return false;
      },
    },
    {
      id: "second-layer-setup-solution-3",
      title: "Removing and reinserting with edge consideration",
      description:
        "Sometimes you'll notice pieces that appear to be in the wrong place, like the red/white edge here. Don't be too concerned - we're focusing on inserting the orange/green edge piece. When we insert the orange/green edge correctly, it will automatically push the green/red edge piece out of its incorrect position. First, execute U R U R' U' with yellow on top and green facing front, then with orange facing front, execute L' U' L to complete the insertion.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        // Apply setup moves: R U R' U2 R U' R' U2 R U' R' U B U B' U' R' U' R U2 R' F R F' U' F' U F U2
        // relative to yellow top/red front (visual)
        // Logical state is white top/green front, so remap: R→F, U→D, B→L, F→R
        // Visual: R U R' U2 R U' R' U2 R U' R' U B U B' U' R' U' R U2 R' F R F' U' F' U F U2
        // Logical: F D F' D2 F D' F' D2 F D' F' D L D L' D' F' D' F D2 F' R F R' D' R' D R D2
        cube.applyMoves([
          "F",
          "D",
          "F'",
          "D2",
          "F",
          "D'",
          "F'",
          "D2",
          "F",
          "D'",
          "F'",
          "D",
          "L",
          "D",
          "L'",
          "D'",
          "F'",
          "D'",
          "F",
          "D2",
          "F'",
          "R",
          "F",
          "R'",
          "D'",
          "R'",
          "D",
          "R",
          "D2",
        ]);
      },
      filter: (piece: CubeState) => {
        // Keep all centers
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;

        const set = getCubieColorSet(piece);

        // Keep white edges (two-color pieces that include WHITE)
        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;

        // Keep white corners (three-color pieces that include WHITE)
        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;

        // Keep the orange/green edge piece (two-color pieces that have both ORANGE and GREEN)
        if (
          set.size === 2 &&
          !set.has(CUBE_COLORS.WHITE) &&
          !set.has(CUBE_COLORS.YELLOW) &&
          set.has(CUBE_COLORS.ORANGE) &&
          set.has(CUBE_COLORS.GREEN)
        ) {
          return true;
        }

        // Keep the red/green edge piece (for context - will be pushed out)
        if (
          set.size === 2 &&
          !set.has(CUBE_COLORS.WHITE) &&
          !set.has(CUBE_COLORS.YELLOW) &&
          set.has(CUBE_COLORS.RED) &&
          set.has(CUBE_COLORS.GREEN)
        ) {
          return true;
        }

        return false;
      },
    },
    {
      id: "second-layer-setup-solution-4",
      title: "Flipped edge in correct position",
      description:
        "This is the most awkward case you'll encounter: the correct edge piece is in its place, but it's facing the wrong way. To fix this, we need to swap it with another piece. Ideally, use an edge piece with a yellow face, though any edge piece will work. You can use either a left or right insertion algorithm - in this case, we'll use the right insertion algorithm. The solution is the same as slide 4, but with an additional U2 at the end to move the correct piece to its position. From there, you can repeat the solution from slide 4 if needed.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        // Apply setup moves: R U R' U2 R U2 R' U F' U' F relative to yellow top/red front (visual)
        // Logical state is white top/green front, so remap: R→F, U→D, F→R
        // Visual: R U R' U2 R U2 R' U F' U' F
        // Logical: F D F' D2 F D2 F' D R' D' R
        cube.applyMoves([
          "F",
          "D",
          "F'",
          "D2",
          "F",
          "D2",
          "F'",
          "D",
          "R'",
          "D'",
          "R",
        ]);
      },
      filter: (piece: CubeState) => {
        // Keep all centers
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;

        const set = getCubieColorSet(piece);

        // Keep white edges (two-color pieces that include WHITE)
        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;

        // Keep white corners (three-color pieces that include WHITE)
        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;

        // Keep red/yellow edge piece (for swapping)
        if (
          set.size === 2 &&
          set.has(CUBE_COLORS.RED) &&
          set.has(CUBE_COLORS.YELLOW)
        ) {
          return true;
        }

        // Keep second layer edges (two-color pieces that don't include WHITE or YELLOW)
        // BUT exclude blue/red, blue/orange, and green/orange edges
        if (
          set.size === 2 &&
          !set.has(CUBE_COLORS.WHITE) &&
          !set.has(CUBE_COLORS.YELLOW)
        ) {
          // Exclude blue/red edge
          if (set.has(CUBE_COLORS.BLUE) && set.has(CUBE_COLORS.RED)) {
            return false;
          }
          // Exclude blue/orange edge
          if (set.has(CUBE_COLORS.BLUE) && set.has(CUBE_COLORS.ORANGE)) {
            return false;
          }
          // Exclude green/orange edge
          if (set.has(CUBE_COLORS.GREEN) && set.has(CUBE_COLORS.ORANGE)) {
            return false;
          }
          // Keep other second layer edges (like red/green)
          return true;
        }

        return false;
      },
    },
    {
      id: "second-layer-recap",
      title: "Quick recap: the algorithms",
      description:
        "A summary of the two insertion algorithms we've learned for solving the second layer: the left insertion algorithm (U' L' U' L U / R U R') and the right insertion algorithm (U R U R' U' / L' U' L). These algorithms can be used to both remove misplaced edge pieces and insert pieces into their correct positions.",
      allowFaceMoves: false,
      setup: (cube: CubeJSWrapper) => {
        // Keep the cube solved for the recap
        cube.reset();
      },
      filter: (piece: CubeState) => {
        // Keep all centers
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;

        const set = getCubieColorSet(piece);

        // Keep white edges (two-color pieces that include WHITE)
        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;

        // Keep white corners (three-color pieces that include WHITE)
        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;

        // Keep second layer edges (two-color pieces that don't include WHITE or YELLOW)
        // These are: red/green, green/orange, orange/blue, blue/red
        if (
          set.size === 2 &&
          !set.has(CUBE_COLORS.WHITE) &&
          !set.has(CUBE_COLORS.YELLOW)
        ) {
          return true;
        }

        return false;
      },
    },
    {
      id: "practice-second-layer",
      title: "Practice: 2 second layer edges",
      description:
        "Practice solving the second layer. In this setup, you need to position two second layer edge pieces that are currently out of place. Use the algorithms you've learned to bring each edge to its correct position. If you get stuck, go back to previous slides to review the individual cases.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        // Apply setup moves: R U' R' U' F' U F L' U L U F U' F' relative to yellow top/red front (visual)
        // Logical state is white top/green front, so remap:
        // When yellow top/red front: R→F, U→D, F→R, L→B (based on slide 3 pattern)
        // Visual: R U' R' U' F' U F L' U L U F U' F'
        // Logical: F D' F' D' R' D R B' D B D R D' R'
        cube.applyMoves([
          "F",
          "D'",
          "F'",
          "D'",
          "R'",
          "D",
          "R",
          "B'",
          "D",
          "B",
          "D",
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

        const set = getCubieColorSet(piece);

        // Keep white edges (two-color pieces that include WHITE)
        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;

        // Keep white corners (three-color pieces that include WHITE)
        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;

        // Keep second layer edges (two-color pieces that don't include WHITE or YELLOW)
        // These are: red/green, green/orange, orange/blue, blue/red
        if (
          set.size === 2 &&
          !set.has(CUBE_COLORS.WHITE) &&
          !set.has(CUBE_COLORS.YELLOW)
        ) {
          return true;
        }

        return false;
      },
    },
    {
      id: "practice-second-layer-2",
      title: "Practice: 3 second layer edges",
      description:
        "Practice solving the second layer with a more challenging setup. In this configuration, three second layer edge pieces need to be inserted into their correct positions, while one edge piece is currently in the wrong place. Use the algorithms you've learned to solve each edge piece systematically. If you get stuck, go back to previous slides to review the individual cases.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        // Apply setup moves: R U' R' U' F' U F L' U L U F U' F' B U' B' U' R' U R relative to yellow top/red front (visual)
        // Logical state is white top/green front, so remap:
        // When yellow top/red front: R→F, U→D, F→R, L→B, B→L
        // Visual: R U' R' U' F' U F L' U L U F U' F' B U' B' U' R' U R
        // Logical: F D' F' D' R' D R B' D B D R D' R' L D' L' D' F' D F
        cube.applyMoves([
          "F",
          "D'",
          "F'",
          "D'",
          "R'",
          "D",
          "R",
          "B'",
          "D",
          "B",
          "D",
          "R",
          "D'",
          "R'",
          "L",
          "D'",
          "L'",
          "D'",
          "F'",
          "D",
          "F",
        ]);
      },
      filter: (piece: CubeState) => {
        // Keep all centers
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;

        const set = getCubieColorSet(piece);

        // Keep white edges (two-color pieces that include WHITE)
        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;

        // Keep white corners (three-color pieces that include WHITE)
        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;

        // Keep second layer edges (two-color pieces that don't include WHITE or YELLOW)
        // These are: red/green, green/orange, orange/blue, blue/red
        if (
          set.size === 2 &&
          !set.has(CUBE_COLORS.WHITE) &&
          !set.has(CUBE_COLORS.YELLOW)
        ) {
          return true;
        }

        return false;
      },
    },
    {
      id: "practice-second-layer-3",
      title: "Practice: 4 second layer edges",
      description:
        "Practice solving the second layer with the most challenging setup. In this configuration, all four second layer edge pieces need to be inserted into their correct positions. Two edge pieces are currently in the wrong place, and one edge piece is in the correct position but incorrectly oriented. Use the algorithms you've learned to solve each edge piece systematically. If you get stuck, go back to previous slides to review the individual cases.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        // Apply setup moves: R U' R' U' F' U F L' U L U F U' F' B U' B' U' R' U R L U' L' U B' U B U B U B' U' R' U' R U F U F' U' L' U' L U' B' U B U2 B' U B relative to yellow top/red front (visual)
        // Logical state is white top/green front, so remap:
        // When yellow top/red front: R→F, U→D, F→R, L→B, B→L
        // Visual: R U' R' U' F' U F L' U L U F U' F' B U' B' U' R' U R L U' L' U B' U B U B U B' U' R' U' R U F U F' U' L' U' L U' B' U B U2 B' U B
        // Logical: F D' F' D' R' D R B' D B D R D' R' L D' L' D' F' D F B D' B' D L' D L D L D L' D' F' D' F D R D R' D' B' D' B D' L' D L D2 L' D L
        cube.applyMoves([
          "F",
          "D'",
          "F'",
          "D'",
          "R'",
          "D",
          "R",
          "B'",
          "D",
          "B",
          "D",
          "R",
          "D'",
          "R'",
          "L",
          "D'",
          "L'",
          "D'",
          "F'",
          "D",
          "F",
          "B",
          "D'",
          "B'",
          "D",
          "L'",
          "D",
          "L",
          "D",
          "L",
          "D",
          "L'",
          "D'",
          "F'",
          "D'",
          "F",
          "D",
          "R",
          "D",
          "R'",
          "D'",
          "B'",
          "D'",
          "B",
          "D'",
          "L'",
          "D",
          "L",
          "D2",
          "L'",
          "D",
          "L",
        ]);
      },
      filter: (piece: CubeState) => {
        // Keep all centers
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;

        const set = getCubieColorSet(piece);

        // Keep white edges (two-color pieces that include WHITE)
        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;

        // Keep white corners (three-color pieces that include WHITE)
        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;

        // Keep second layer edges (two-color pieces that don't include WHITE or YELLOW)
        // These are: red/green, green/orange, orange/blue, blue/red
        if (
          set.size === 2 &&
          !set.has(CUBE_COLORS.WHITE) &&
          !set.has(CUBE_COLORS.YELLOW)
        ) {
          return true;
        }

        return false;
      },
    },
  ];
}
