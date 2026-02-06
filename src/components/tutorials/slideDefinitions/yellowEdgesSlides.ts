import type { CubeState } from "@/types/cube";
import type { CubeInterface } from "@/types/CubeInterface";
import { getCubieColorSet } from "@components/tutorials/utils/tutorialHelpers";
import CUBE_COLORS from "@/consts/cubeColours";
import type { Slide } from "./notationSlides";

const getYellowEdgesSlides = (): Slide[] => [
    {
      id: "intro",
      title: "What we're aiming to achieve",
      description:
        "Now that you have the <b><i>Yellow Cross</i></b>, it's time to ensure that the <b><i>yellow edge pieces</i></b> are in their correct positions. Each yellow edge should be positioned so that the <b><i>yellow sticker</i></b> matches the <b><i>yellow center</i></b>, and the other sticker matches its adjacent center color.\n\nFor example, the <b><i>Yellow/Red</i></b> edge piece should be positioned so that the <b><i>Yellow</i></b> sticker matches the <b><i>Yellow</i></b> center and the <b><i>Red</i></b> sticker matches the <b><i>Red</i></b> center, we want this for all yellow edge pieces.\n\nWe're going to be learning a new algorithm to help us position the yellow edge pieces correctly. It's called the <b>Sune</b> algorithm: <b><i>R U R' U R U2 R'</i></b>. Take the time in the next slide to <b><i>practice</i></b> it until you're comfortable with it.\n\nClick <b><i>Next</i></b> to move on to the next slide.",
      allowFaceMoves: false,
      setup: (cube: CubeInterface) => {
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
        "The edge pieces here have been labelled with a <b><i>tick or cross</i></b> to indicate if a yellow edge piece is positioned against its center piece. In this example, we have 2 adjacent correctly positioned yellow edge pieces that are <b><i>ticked</i></b> and 2 that are <b><i>crossed</i></b>. For this, we position the correctly positioned yellow edge pieces <b><i>at the back and on the right hand side</i></b> and do the <b>Sune</b> algorithm (<b><i>R U R' U R U2 R'</i></b>), followed by a <b><i>U</i></b> move to correct them. Our goal is to have <b><i>4 of the edge pieces here</i></b> to be <b><i>ticked</i></b>.\n\nMake sure you try this several times until you're comfortable with the <b>Sune</b> algorithm. It's important to understand what's happening here. You can use the <b><i>Reset</i></b> button to start the sequence over again if you get stuck and want to start over again.\n\nWhen you're ready to move on, click <b><i>Next</i></b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => {
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
        "In this example, we have <b><i>1 correctly positioned edge piece</i></b>. We need either <b><i>2 or 4</i></b> correctly positioned edge pieces so we need to do a <b><i>U</i></b> move to get 2 edge pieces that are adjacent to each other in position. After we've done this, we then position the correctly placed edge pieces in the back and the right. Then we perform the <b>Sune</b> algorithm (<b><i>R U R' U R U2 R'</i></b>), followed by a <b><i>U</i></b> move.\n\nMake sure you try this several times until you're comfortable with the <b>Sune</b> algorithm. It's important to understand what's happening here. You can use the <b><i>Reset</i></b> button to start the sequence over again if you get stuck and want to start over again.\n\nWhen you're ready to move on, click <b><i>Next</i></b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => {
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
      id: "yellow-edges-solution-4",
      title: "Positioning yellow edge pieces (2 opposite)",
      description:
        "In this scenario, we have <b><i>2 correctly positioned edge pieces</i></b>, but they are <b><i>opposite from one another</i></b>. We hold them so that the correctly positioned edge pieces are <b><i>at the front and at the back</i></b>. We then do the <b>Sune</b> algorithm (<b><i>R U R' U R U2 R'</i></b>), which gives us 2 correct edges adjacent from one another. We then position these correctly positioned edge pieces in the <b><i>back and on the right</i></b> and do the <b>Sune</b> algorithm again (<b><i>R U R' U R U2 R'</i></b>), followed by a <b><i>U</i></b> move to align all the edges.\n\nMake sure you try this several times until you're comfortable with the <b>Sune</b> algorithm. It's important to understand what's happening here. You can use the <b><i>Reset</i></b> button to start the sequence over again if you get stuck and want to start over again.\n\nWhen you're ready to move on, click <b><i>Next</i></b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => {
        cube.reset();
        // Apply setup moves: D' L D2 L' D' L D' L' B D2 B' D' B D' B'
        cube.applyMoves([
          "D'",
          "L",
          "D2",
          "L'",
          "D'",
          "L",
          "D'",
          "L'",
          "B",
          "D2",
          "B'",
          "D'",
          "B",
          "D'",
          "B'",
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
        "Now we have <b><i>0 correctly positioned edge pieces</i></b>. We need to do a <b><i>U2 move</i></b> to get 2 edge pieces in position. After that, we position the correctly positioned edge pieces in the back and on the right. Then we perform the <b>Sune</b> algorithm (<b><i>R U R' U R U2 R'</i></b>), followed by a <b><i>U</i></b> move.\n\nMake sure you try this several times until you're comfortable with the <b>Sune</b> algorithm. It's important to understand what's happening here. You can use the <b><i>Reset</i></b> button to start the sequence over again if you get stuck and want to start over again.\n\nWhen you're ready to move on, click <b><i>Next</i></b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => {
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
    {
      id: "yellow-edges-completion",
      title: "Yellow Edges Complete!",
      description:
        "Congratulations! You've completed the <b><i>Yellow Edges</i></b> lesson. You've learned how to correctly position all four yellow edge pieces so that each yellow edge matches its adjacent center color.\n\n<b><i>Practice is key:</i></b>\n\nThe yellow edges step builds upon the yellow cross foundation. You've learned to recognize and solve different scenarios: when you have 2 correct edges adjacent, 1 correct edge, 2 correct edges opposite, or 0 correct edges. The key is understanding how to use the <b>Sune</b> algorithm (<b><i>R U R' U R U2 R'</i></b>) to position the edges correctly, sometimes followed by a <b><i>U</i></b> move to align them.\n\n<b>You can come back to this lesson as many times as you need.</b> Feel free to revisit any slide to practice specific cases until solving the yellow edges becomes natural and intuitive.\n\n<b><i>Remember:</i></b>\n• Practice makes perfect\n• Go at your own pace\n• Review previous slides whenever you need to\n• There's no rush, take your time to understand each step\n• Recognize the different scenarios: 2 adjacent, 1 correct, 2 opposite, or 0 correct\n• Position correctly positioned edges in the back and right before applying the Sune algorithm\n• Remember the Sune algorithm: <b><i>R U R' U R U2 R'</i></b>\n• Sometimes you need to do a U or U2 move first to get 2 edges in position\n• For 2 opposite edges, apply the Sune algorithm twice\n\n<b><i>Ready for the next step?</i></b>\n\nIf you're feeling confident with the yellow edges and ready to continue, click <b><i>Finish</i></b> to move on to the next lesson: <b><i>Yellow Corners</i></b>. In that lesson, you'll learn how to position and orient the yellow corner pieces to complete the top layer.\n\nIf you'd like more practice, feel free to go back through this lesson anytime. Take your time, we'll be here when you're ready!",
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
        return false;
      },
    },
  ];

export { getYellowEdgesSlides };
