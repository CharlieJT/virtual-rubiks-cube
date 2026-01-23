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
        "In this lesson, we'll be learning how to solve the <b><i>Yellow Cross</i></b>. This involves positioning the <b><i>four yellow edge pieces around the yellow center</i></b>. We don't need to worry about which color the yellow edge shares its color with, we'll just focus on getting the yellow cross completed.\n\nIn the next slide, we'll explain the <b><i>four scenarios</i></b> we can run into when solving the yellow cross.\n\nClick <b><i>Next</i></b> to move on to the next slide.",
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
        "When working on the yellow cross, you'll encounter one of <b><i>four different scenarios</i></b> on the yellow face. These patterns determine which algorithm you'll use to solve the yellow cross.\n\n<b><i>The four states are:</i></b>\n• <b><i>Cross Case</i></b> - Already solved.\n• <b><i>Line Case</i></b> - Two yellow edges opposite each other.\n• <b><i>Triangle Case</i></b> - Two yellow edges adjacent to each other forming a triangle shape.\n• <b><i>Dot Case</i></b> - No yellow edges on the yellow face.\n\nThey're shown here exactly how you'd need to position each case when solving them so take note of how they're positioned here.\n\nEach state has a specific scenario & we execute only one algorithm to solve the yellow cross (possibly multiple times depending on the case). It's called the <b><i>'T Perm'</i></b> and it's <b><i>F R U R' U' F'</i></b>. It's easy to remember, it's just <b><i>F - 'Righty Algorithm' - F'</i></b>. That's it!\n\nClick <b><i>Next</i></b> to move on to the next slide.",
      allowFaceMoves: false,
      setup: (cube: CubeJSWrapper) => {
        // Solved state for now - the grid will show different states
        cube.reset();
      },
    },
    {
      id: "yellow-cross-line",
      title: "Solving the Line case",
      description:
        "When you see a <b><i>line case</i></b> on the yellow face (two yellow edges positioned opposite each other), you need to transform it into a cross. Position the line horizontally as shown here, then apply the algorithm <b><i>F R U R' U' F'</i></b> which is just <b><i>F - 'Righty Algorithm' - F'</i></b>. This will convert the line pattern into the completed yellow cross.\n\nMake sure you try this several time until you're comfortable with the new algorithm. You can use the <b><i>Reset</i></b> button to start the sequence over again if you get stuck or if you want to start over again.\n\nWhen you're ready to move on, click <b><i>Next</i></b> to move on to the next slide.",
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
      title: "Solving the Triangle case",
      description:
        "When you see a <b><i>triangle case</i></b> on the yellow face (two yellow edges forming an triangle shape), you need to transform it into a cross. Position the triangle in the top left corner as shown here, then apply <b><i>F R U R' U' F'</i></b> to transform it into a line pattern. Once you have the line pattern, apply <b><i>F R U R' U' F'</i></b> again to complete the yellow cross.\n\nMake sure you try this several time until you're comfortable with the new algorithm. You can use the <b><i>Reset</i></b> button to start the sequence over again if you get stuck or if you want to start over again.\n\nWhen you're ready to move on, click <b><i>Next</i></b> to move on to the next slide.",
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
      title: "Solving the Dot case",
      description:
        "When you see a <b><i>dot case</i></b> on the yellow face (no yellow edges visible), you need to transform it into a cross. Position the dot any way you like, then apply <b><i>F R U R' U' F'</i></b> to transform it into a triangle pattern, we then do a <b><i>U2</i></b> to move it to the back/left corner. Once you have that in place, apply <b><i>F R U R' U' F'</i></b> again to get a line pattern. Finally, apply <b><i>F R U R' U' F'</i></b> once more to complete the yellow cross.\n\nMake sure you try this several time until you're comfortable with the new algorithm. You can use the <b><i>Reset</i></b> button to start the sequence over again if you get stuck or if you want to start over again.\n\nWhen you're ready to move on, click <b><i>Next</i></b> to move on to the next slide.",
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
    // Final completion slide
    {
      id: "yellow-cross-completion",
      title: "Yellow Cross Complete!",
      description:
        "Congratulations! You've completed the <b><i>Yellow Cross</i></b> lesson. You've learned how to form the yellow cross on the top face of the cube by positioning all four yellow edge pieces around the yellow center.\n\n<b><i>Practice is key:</i></b>\n\nThe yellow cross is a crucial step in solving the top layer. You've learned to recognize and solve all four different patterns: the Cross case (already solved), the Line case, the Triangle case, and the Dot case. The key is understanding which algorithm to apply and how many times, using the <b><i>F R U R' U' F'</i></b> algorithm.\n\n<b>You can come back to this lesson as many times as you need.</b> Feel free to revisit any slide to practice specific cases until solving the yellow cross becomes natural and intuitive.\n\n<b><i>Remember:</i></b>\n• Practice makes perfect\n• Go at your own pace\n• Review previous slides whenever you need to\n• There's no rush, take your time to understand each step\n• Recognize the four different patterns: Cross, Line, Triangle, and Dot\n• Position each pattern correctly before applying the algorithm\n• Remember the algorithm: <b><i>F R U R' U' F'</i></b> (just F - Righty Algorithm - F')\n• Some cases require applying the algorithm multiple times\n\n<b><i>Ready for the next step?</i></b>\n\nIf you're feeling confident with the yellow cross and ready to continue, click <b><i>Finish</i></b> to move on to the next lesson: <b><i>Yellow Edges</i></b>. In that lesson, you'll learn how to correctly position the yellow cross edges so they match their adjacent center colors.\n\nIf you'd like more practice, feel free to go back through this lesson anytime. Take your time, we'll be here when you're ready!",
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
        const set = getCubieColorSet(piece);
        // Keep white edges (two-color pieces that include WHITE)
        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;
        // Keep white corners (three-color pieces that include WHITE)
        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;
        // Keep second layer edges (two-color pieces that don't include WHITE or YELLOW)
        if (
          set.size === 2 &&
          !set.has(CUBE_COLORS.WHITE) &&
          !set.has(CUBE_COLORS.YELLOW)
        ) {
          return true;
        }
        // Keep yellow edges (two-color pieces that include YELLOW)
        if (set.size === 2 && set.has(CUBE_COLORS.YELLOW)) return true;
        return false;
      },
    },
  ];
}
