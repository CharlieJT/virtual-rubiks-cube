import type { CubeState } from "@/types/cube";
import type { CubeInterface } from "@/types/CubeInterface";
import { getCubieColorSet } from "@components/tutorials/utils/tutorialHelpers";
import CUBE_COLORS from "@/consts/cubeColours";
import type { Slide } from "./notationSlides";

const getYellowCornersSlides = (): Slide[] => [
    {
      id: "intro",
      title: "Positioning yellow corner pieces",
      description:
        "In this lesson, we'll be learning how to position the <b><i>Yellow Corner Pieces</i></b>. The corner pieces don't need to be oriented correctly at this stage, they just need to be in the right positions.\n\nFor example, notice how the <b><i>Yellow/Red/Green</i></b> corner piece is in the correct position but incorrectly oriented. This is exactly what we want for all yellow corner pieces as shown here.\n\nWe're going to be learning our last algorithm for solving the cube now. It's called the <b>Niklas Algorithm</b> and it's <b><i>U R U' L' U R' U' L</i></b>. It's used to position the yellow corner pieces.\n\nHave a look around the cube to see how the other corner pieces are positioned. When you're ready to move on, click <b><i>Next</i></b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => {
        cube.reset();
        // Apply setup moves (logical notation)
        cube.applyMoves([
          "R",
          "U",
          "R'",
          "U'",
          "R",
          "U",
          "R'",
          "U'",
          "D",
          "R",
          "U",
          "R'",
          "U'",
          "R",
          "U",
          "R'",
          "U'",
          "R",
          "U",
          "R'",
          "U'",
          "R",
          "U",
          "R'",
          "U'",
          "D",
          "R",
          "U",
          "R'",
          "U'",
          "R",
          "U",
          "R'",
          "U'",
          "R",
          "U",
          "R'",
          "U'",
          "R",
          "U",
          "R'",
          "U'",
          "D",
          "R",
          "U",
          "R'",
          "U'",
          "R",
          "U",
          "R'",
          "U'",
          "D",
        ]);
      },
      filter: () => true,
    },
    {
      id: "yellow-corners-solution",
      title: "Positioning yellow corner pieces (1 correct)",
      description:
        "Here we have an example where there is <b><i>1 corner piece</i></b> that is correctly positioned. We need to get all 4 corner pieces into the correct positions.\n\nTo solve this, make sure the correctly positioned corner piece is in the front left as shown here. Don't twist the top U layer as that will mess the edges up. Instead, physically turn the cube around to position the correct corner. Then perform the <b>Niklas Algorithm</b> <b><i>(U R U' L' U R' U' L)</i></b>. After this, all corner pieces will be in their correct positions, though they may not be oriented correctly yet.\n\nThe corners pieces have been marked with either a <b><i>tick</i></b> or <b><i>cross</i></b> to indicate if they are correctly positioned or not.\n\nRepeat this several times until you're comfortable with the algorithm. You can use the <b><i>Reset</i></b> button to start the sequence over again if you get stuck and want to start over again.\n\nWhen you're ready to move on, click <b><i>Next</i></b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => {
        cube.reset();
        // Apply setup moves (logical notation)
        cube.applyMoves([
          "R",
          "U",
          "R'",
          "U'",
          "R",
          "U",
          "R'",
          "U'",
          "D",
          "R",
          "U",
          "R'",
          "U'",
          "R",
          "U",
          "R'",
          "U'",
          "R",
          "U",
          "R'",
          "U'",
          "R",
          "U",
          "R'",
          "U'",
          "D",
          "R",
          "U",
          "R'",
          "U'",
          "R",
          "U",
          "R'",
          "U'",
          "R",
          "U",
          "R'",
          "U'",
          "R",
          "U",
          "R'",
          "U'",
          "D",
          "R",
          "U",
          "R'",
          "U'",
          "R",
          "U",
          "R'",
          "U'",
          "D",
          "B'",
          "D",
          "F",
          "D'",
          "B",
          "D",
          "F'",
          "D'",
        ]);
      },
      filter: () => true,
    },
    {
      id: "yellow-corners-solution-2",
      title: "Positioning yellow corner pieces (0 correct)",
      description:
        "Here we have an example where there are <b><i>0 corner pieces</i></b> that are correctly positioned. We need to get all 4 corner pieces into the correct positions.\n\nTo solve this, make sure you don't twist the top U layer as that will mess the edges up. Instead, physically turn the cube around to position correctly. Then perform the <b>Niklas Algorithm</b> <b><i>(U R U' L' U R' U' L)</i></b>. After this, you will find that the yellow/blue/red corner piece is in the correct corner. Put this one in the front right position and perform <b>Niklas Algorithm</b> <b><i>(U R U' L' U R' U' L)</i></b> again. After this, all corner pieces will be in their correct positions, though they may not be oriented correctly yet.\n\nThe corners pieces have been marked with either a <b><i>tick</i></b> or <b><i>cross</i></b> to indicate if they are correctly positioned or not.\n\nRepeat this several times until you're comfortable with the algorithm. You can use the <b><i>Reset</i></b> button to start the sequence over again if you get stuck and want to start over again.\n\nWhen you're ready to move on, click <b><i>Next</i></b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => {
        cube.reset();
        // Apply setup moves (logical notation)
        cube.applyMoves([
          "B",
          "D",
          "B'",
          "D'",
          "B'",
          "L",
          "B2",
          "D'",
          "B'",
          "D'",
          "B",
          "D",
          "B'",
          "L'",
          "F",
          "D",
          "F'",
          "D'",
          "F'",
          "R",
          "F2",
          "D'",
          "F'",
          "D'",
          "F",
          "D",
          "F'",
          "R'",
        ]);
      },
      filter: () => true,
    },
    {
      id: "yellow-corners-solution-3",
      title: "Positioning yellow corner pieces (0 correct, repeated algorithm)",
      description:
        "Now the last example where there are <b><i>0 corner pieces</i></b> that are correctly positioned. We need to get all 4 corner pieces into the correct positions.\n\nTo solve this, perform the <b>Niklas Algorithm</b> <b><i>(U R U' L' U R' U' L)</i></b>. You will find that 1 corner piece is now correctly positioned. Put this correctly positioned piece in the front right position (by physically turning the cube, not twisting the top U layer), then perform <b>Niklas Algorithm</b> <b><i>(U R U' L' U R' U' L)</i></b> again. If it's still not solved, repeat the algorithm one more time with the correctly positioned piece in the front-right position, and all pieces will be in their correct positions, though they may not be oriented correctly yet.\n\nThe corners pieces have been marked with either a <b><i>tick</i></b> or <b><i>cross</i></b> to indicate if they are correctly positioned or not.\n\nRepeat this several times until you're comfortable with the algorithm. You can use the <b><i>Reset</i></b> button to start the sequence over again if you get stuck and want to start over again.\n\nWhen you're ready to move on, click <b><i>Next</i></b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => {
        cube.reset();
        // Apply setup moves (logical notation)
        // Original: L→B, B→R, R→F, F→L cyclic permutation
        cube.applyMoves([
          "R",
          "D",
          "R'",
          "D'",
          "R'",
          "B",
          "R2",
          "D'",
          "R'",
          "D'",
          "R",
          "D",
          "R'",
          "B'",
          "L",
          "D",
          "L'",
          "D'",
          "L'",
          "F",
          "L2",
          "D'",
          "L'",
          "D'",
          "L",
          "D",
          "L'",
          "F'",
        ]);
      },
      filter: () => true,
    },
    {
      id: "yellow-corners-completion",
      title: "Yellow Corners Complete!",
      description:
        "Congratulations! You've completed the <b><i>Yellow Corners</i></b> lesson. You've learned how to position all four yellow corner pieces in their correct positions on the top layer of the cube.\n\n<b><i>Practice is key:</i></b>\n\nThe yellow corners positioning step builds upon the yellow edges. You've learned to use the <b>Niklas Algorithm</b> (<b><i>U R U' L' U R' U' L</i></b>) to cycle the corner pieces into their correct positions. Remember: at this stage, the corners don't need to be oriented correctly—they just need to be in the right spots. You've practiced different scenarios: when you have 1 correct corner, 0 correct corners, and when you need to apply the algorithm multiple times.\n\n<b>You can come back to this lesson as many times as you need.</b> Feel free to revisit any slide to practice until positioning the yellow corners becomes natural and intuitive.\n\n<b><i>Remember:</i></b>\n• Practice makes perfect\n• Go at your own pace\n• Review previous slides whenever you need to\n• There's no rush, take your time to understand each step\n• Don't twist the U layer—physically turn the cube to position the correct corner in the front-left (or front-right)\n• The Niklas Algorithm: <b><i>U R U' L' U R' U' L</i></b>\n• With 1 correct corner, put it in the front-left, then do the algorithm\n• With 0 correct corners, do the algorithm once to get 1 correct, then position and repeat\n• Some cases require applying the algorithm two or three times\n\n<b><i>Ready for the next step?</i></b>\n\nIf you're feeling confident with positioning the yellow corners and ready to continue, click <b><i>'Finish'</i></b> to move on to the last lesson: <b><i>Orient Yellow Corners</i></b>. In that lesson, you'll learn how to orient the yellow corner pieces so that the yellow sticker faces up on each corner, completing the entire cube!\n\nIf you'd like more practice, feel free to go back through this lesson anytime. Take your time, we'll be here when you're ready!",
      allowFaceMoves: false,
      setup: (cube: CubeInterface) => {
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
        // Keep yellow corners (three-color pieces that include YELLOW)
        if (set.size === 3 && set.has(CUBE_COLORS.YELLOW)) return true;
        return false;
      },
    },
  ];

export { getYellowCornersSlides };
