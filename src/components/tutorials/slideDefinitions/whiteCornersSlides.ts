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
        "Now that you have the White Cross completed, it's time to complete the white face by positioning the <b>White Corner</b> pieces. Each corner piece with a white sticker should be positioned on the face of the white center piece and match with its respective center piece.\n\nNotice how not only is the white face complete, the first layer of the cube is complete as well. On each of the side faces, it should look like a short <b>T</b> shape.\n\n<b>For this lesson, we only need to learn two algorithms to solve all white corners:</b>\n\n<b>Righty Algorithm:</b> <i>R U R' U'</i>\n<b>Lefty Algorithm:</b> <i>L' U' L U</i>\n\nThat's all you need! We'll see how these two algorithms can solve every white corner scenario. They should be easy to learn and remember. They are just two moves and then the same two in reverse to put the piece back in the correct position. For example, <b>R U</b> followed by <b>R' U'</b> will put the piece back in the correct position.\n\nTake the time to look at the cube to understand what we're aiming to achieve here, then click <b>Next</b> to move on to the next slide.",
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
        "From this point forward, we'll take a more mechanical approach. Instead of intuitive problem-solving, we'll focus on recognizing specific scenarios and applying the correct algorithm to solve each piece.\n\nWe'll focus on learning how to insert the <b>White/Green/Red</b> into its correct position. As mentioned before, for white corners, we only need to learn two algorithms:\n\n<b>Righty Algorithm:</b> <i>R U R' U'</i>\n<b>Lefty Algorithm:</b> <i>L' U' L U</i>\n\nThat's all you need! We'll see how these two algorithms can solve every white corner scenario. Let's start with the first scenario in the <b>Next</b> slide.",
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
      title: "Solving with white facing right",
      description:
        "We start by looking for corner pieces with a white face on it, we'll use <b><i>White/Green/Red</i></b> as an example. In our first scenario, the white sticker is facing to the right. This means we need to insert the <b><i>White/Green/Red</i></b> corner piece into the correct position with positioning the target corner piece on the right hand side of the cube (with red facing front) and then perform the <b><i>Righty Algorithm</i></b> which is <b><i>R U R' U'</i></b>.\n\nLet's try this to see if we can fix the corner. You can use the <b><i>Reset</i></b> button to start the sequence over again or if you get stuck and want to start over again.\n\nRemember, it's important to <b><i>practice</i></b> this several times until you're comfortable with it and make sure you take note of the direction of the moves you make, it will help you to remember the algorithm. Or if you're ready to move on, click <b><i>Next</i></b> to go to the next slide.",
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
      title: "Solving with white facing left",
      description:
        "Here we have another scenario where the white sticker is facing to the left. This means we need to insert the <b><i>White/Green/Red</i></b> corner piece into the correct position with positioning the target corner piece on the left hand side of the cube (with green facing front) and then perform the <b><i>Lefty Algorithm</i></b> which is <b><i>L' U' L U</i></b>.\n\nLet's try this to see if we can fix the corner. You can use the <b><i>Reset</i></b> button to start the sequence over again or if you get stuck and want to start over again.\n\nRemember, it's important to <b><i>practice</i></b> this several times until you're comfortable with it and make sure you take note of the direction of the moves you make, it will help you to remember the algorithm. Or if you're ready to move on, click <b><i>Next</i></b> to go to the next slide.",
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
      title: "Solving with white facing up",
      description:
        "Here we have another scenario where the white sticker is facing up. This means we need to insert the <b><i>White/Green/Red</i></b> corner piece into the correct position with positioning the target corner piece on the right hand side of the cube (with red facing front) and then perform the <b><i>Righty Algorithm 3 times</i></b> which is <b><i>R U R' U'</i></b>.\n\nLet's try this to see if we can fix the corner. You can use the <b><i>Reset</i></b> button to start the sequence over again or if you get stuck and want to start over again.\n\nRemember, it's important to <b><i>practice</i></b> this several times until you're comfortable with it. Or if you're ready to move on, click <b><i>Next</i></b> to go to the next slide.",
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
        "We have a little bit of a less common scenario here. The correct piece is in position but incorrectly oriented. To fix this, use the <b><i>Righty Algorithm</i></b> once to remove it from the corner, then use the <b><i>Righty Algorithm</i></b> again to put it back in correctly so we do the <b><i>Righty Algorithm</i></b> <b><i>twice</i></b> in total.\n\nLet's try this to see if we can fix the corner. You can use the <b><i>Reset</i></b> button to start the sequence over again or if you get stuck and want to start over again.\n\nRemember, it's important to <b><i>practice</i></b> this several times until you're comfortable with it. Or if you're ready to move on, click <b><i>Next</i></b> to go to the next slide.",
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
        "Another less common scenario here. The correct piece is in position but incorrectly oriented again. To fix this, use the <b><i>Righty Algorithm</i></b> once to remove it from the corner. Since the white will be pointing upwards after removal, use the <b><i>Righty Algorithm</i></b> three times to put it back in correctly So we do the <b><i>Righty Algorithm</i></b> <b><i>4 times</i></b> in total.\n\nLet's try this to see if we can fix the corner. You can use the <b><i>Reset</i></b> button to start the sequence over again or if you get stuck and want to start over again.\n\nRemember, it's important to <b><i>practice</i></b> this several times until you're comfortable with it. Or if you're ready to move on, click <b><i>Next</i></b> to go to the next slide.",
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
        "Here we have another scenario where the target corner piece is in the wrong corner. To fix this, use the <b><i>Righty Algorithm</i></b> once to remove it from the corner. Then use <b><i>U</i></b> to move it over the correct corner where you want it to go. Finally, use the <b><i>Righty Algorithm</i></b> again to put it in correctly.\n\n<b><i>We'll do this in three steps:</i></b>\n• <b><i>Righty Algorithm</i></b> - R U R' U'\n• <b><i>U</i></b> - Up face clockwise or counter-clockwise to move the piece over to the correct corner we want to insert it into.\n• <b><i>Righty Algorithm</i></b> - R U R' U'\n\nLet's try this to see if we can fix the corner. You can use the <b><i>Reset</i></b> button to start the sequence over again or if you get stuck and want to start over again.\n\nRemember, it's important to <b><i>practice</i></b> this several times until you're comfortable with it. Or if you're ready to move on, click <b><i>Next</i></b> to go to the next slide.",
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
      id: "practice-setup-solution-9",
      title: "Inserting two corner pieces",
      description:
        "Now we're going to practice with a scenario where we need to insert two corner pieces. In this example, we want to insert the <b><i>White/Green/Orange</i></b> corner piece, but we need to align it to be on top of the correct corner where it needs to go.\n\nNotice that the <b><i>White/Green/Red</i></b> corner piece is already in that spot. This is actually perfect! When we insert the <b><i>White/Green/Orange</i></b> corner piece using the <b><i>Righty Algorithm</i></b>, it will take the <b><i>White/Green/Red</i></b> corner piece out of its position.\n\nOnce the <b><i>White/Green/Red</i></b> corner piece is out, we then align it to be on top of its correct corner position. Finally, we insert it using the <b><i>Lefty Algorithm</i></b> to complete both corner placements.\n\n<b><i>We'll do this in multiple steps:</i></b>\n• <b><i>U2</i></b> - Align the <b><i>White/Green/Orange</i></b> corner piece over the correct corner (no specific front face needed here).\n• <b><i>Righty Algorithm</i></b> - Insert the <b><i>White/Green/Orange</i></b> corner piece, which removes the <b><i>White/Green/Red</i></b> corner piece.\n• <b><i>U</i></b> - Align the <b><i>White/Green/Red</i></b> corner piece over its correct corner (no specific front face needed here).\n• <b><i>Lefty Algorithm</i></b> - Insert the <b><i>White/Green/Red</i></b> corner piece to complete the placement.\n\nLet's try this to see if we can fix both corner pieces. You can use the <b><i>Reset</i></b> button to start the sequence over again or if you get stuck and want to start over again.\n\nRemember, it's important to <b><i>practice</i></b> this several times until you're comfortable with it. Or if you're ready to move on, click <b><i>Next</i></b> to go to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        // Apply setup moves: L' U L R U' R' U2 relative to yellow top/green front (visual)
        // Logical state is white top/green front (with yellow top flip), so remap:
        // Visual (yellow top/green front) → Logical (white top/green front, flipped)
        // L' → R' (left/right swap when flipped)
        // U → D (yellow top becomes white bottom)
        // L → R
        // R → L
        // U' → D'
        // R' → L'
        // U2 → D2
        // So: L' U L R U' R' U2 → R' D R L D' L' D2
        cube.applyMoves(["R'", "D", "R", "L", "D'", "L'", "D2"]);
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
        // Keep white/green/orange and white/green/red corners
        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) {
          if (
            set.has(CUBE_COLORS.GREEN) &&
            (set.has(CUBE_COLORS.ORANGE) || set.has(CUBE_COLORS.RED))
          ) {
            return true;
          }
        }
        return false;
      },
    },
    {
      id: "recap-white-corners",
      title: "Quick recap: White Corners",
      description:
        "Let's recap what we've learned so far. we've learned how to insert the <b><i>White/Green/Red</i></b> corner piece into the correct position with positioning the target corner piece using two algorithms: <b><i>Righty Algorithm</i></b> and <b><i>Lefty Algorithm</i></b>.\n\n<b><i>Righty Algorithm:</i></b> R U R' U'\n<b><i>Lefty Algorithm:</i></b> L' U' L U\n\nWith these two algorithms, we can solve every white corner scenario using combinations and repetitions of these two algorithms.\n\n<b>It's important to understand the mental model:</b>\n• Remove from an incorrect corner if needed to put it in the correct position.\n• Move the piece over to the correct corner we want to insert it into.\n• Put it in the correct position with the <b><i>Righty Algorithm</i></b> or <b><i>Lefty Algorithm</i></b>.\n\nIt's important to look for pieces that are already in the top layer and insert those first, then focus on corners that are in the wrong corners. Putting corners in the correct place can take other corners out that are in the wrong place.\n\nIt's important to <b><i>practice</i></b> these steps until you're comfortable with them. Learning isn't just about memorizing, it's about understanding and applying the concepts.\n\nIf you're still not confient, feel free to go back to the previous slides and practice the individual cases until you're comfortable with them. Or if you're ready to move on, click <b><i>Next</i></b> to move on to the next slide to test your knowledge.",
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
        "Now let's practice what you've learned so far. We'll start with <b><i>'2 white corners out of place'</i></b>. Use the techniques you've learned to solve the <b><i>White Corners</i></b>. If you get stuck, go back to the previous slides to practice the individual cases.\n\nThere are no sequences here to follow, let's see if you can correct these two corners out of place here. When you have done it, you will see a <b><i>Green Tick</i></b> in the top left corner of the cube to indicate that you have solved the <b><i>White Corners</i></b>.\n\nYou can use the <b><i>Reset</i></b> button to start the sequence over again if you get stuck or if you want to start over again.",
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
        "A little bit more challenging here. We have <b><i>'3 white corners out of place'</i></b> with one corner already in the bottom layer but in the wrong corner. Use the techniques you've learned to solve the <b><i>White Corners</i></b>. Let's see how you get on with this one. If you get stuck, go back to the previous slides to practice the individual cases.\n\nThere are no sequences here to follow, let's see if you can correct these three corners out of place here. When you have done it, you will see a <b><i>Green Tick</i></b> in the top left corner of the cube to indicate that you have solved the <b><i>White Corners</i></b>.\n\nYou can use the <b><i>Reset</i></b> button to start the sequence over again if you get stuck or if you want to start over again.",
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
        "This is the most challenging practice setup. We have <b><i>'4 white corners out of place'</i></b> with one corner already in the bottom layer but in the wrong corner. Use the techniques you've learned to solve the <b><i>White Corners</i></b>. Let's see how you get on with this one. If you get stuck, go back to the previous slides to practice the individual cases.\n\nThere are no sequences here to follow, let's see if you can correct these four corners out of place here. When you have done it, you will see a <b><i>Green Tick</i></b> in the top left corner of the cube to indicate that you have solved the <b><i>White Corners</i></b>.\n\nYou can use the <b><i>Reset</i></b> button to start the sequence over again if you get stuck or if you want to start over again.",
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
    // Final completion slide
    {
      id: "white-corners-completion",
      title: "White Corners Complete!",
      description:
        "Congratulations! You've completed the <b><i>White Corners</i></b> lesson. You've learned how to solve all four white corner pieces and complete the entire white face of the cube.\n\n<b><i>Practice is key:</i></b>\n\nThe white corners step builds upon the white cross foundation. Together, they form the complete white face, which is the first layer of the cube. It's crucial that you feel comfortable with both the righty and lefty algorithms and understand how to recognize different corner positions.\n\n<b>You can come back to this lesson as many times as you need.</b> Feel free to revisit any slide to practice specific cases until solving white corners becomes natural and intuitive.\n\n<b><i>Remember:</i></b>\n• Practice makes perfect\n• Go at your own pace\n• Review previous slides whenever you need to\n• There's no rush, take your time to understand each step\n• Look for pieces already in the top layer first\n• Use the righty algorithm for simpler cases, or master both algorithms for flexibility\n\n<b><i>Ready for the next step?</i></b>\n\nIf you're feeling confident with white corners and ready to continue, click <b><i>Finish</i></b> to move on to the next lesson: <b><i>Second Layer</i></b>. In that lesson, you'll learn how to solve the middle layer by placing the edge pieces between the white and yellow faces.\n\nIf you'd like more practice, feel free to go back through this lesson anytime. Take your time, we'll be here when you're ready!",
      allowFaceMoves: false,
      setup: (cube: CubeJSWrapper) => {
        // Keep the cube solved for a clean completion view
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
  ];
}
