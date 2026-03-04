import type { CubeState } from "@/types/cube";
import type { CubeInterface } from "@/types/CubeInterface";
import { getCubieColorSet } from "@components/tutorials/utils/tutorialHelpers";
import CUBE_COLORS from "@/consts/cubeColours";
import type { Slide } from "./notationSlides";

const getWhiteCrossSlides = (): Slide[] => [
    {
      id: "intro",
      title: "What we're aiming to achieve",
      description:
        "You're now ready to start solving the cube. In this lesson, we'll be learning how to solve the <b><i>White Cross</i></b>. The white cross is <b><i>1st of 7 steps</i></b> in solving the cube. It's the foundation of the cube and it's the first step in solving the cube.\n\nHere we have an example of what we're aiming to achieve. We want to create a white cross around the <b><i>White</i></b> center piece. Each white edge should match the color of the center piece on its side. Drag the cube to spin and see how the cross and matching edges look from different angles.\n\nFor Example, the <b><i>White/Green</i></b> edge piece should be placed so the <b><i>White sticker</i></b> matches the <b><i>White center piece</i></b> and the <b><i>Green</i></b> sticker matches the <b><i>Green center piece</i></b>. we want to do this for all edge pieces with white on it, there are four of them in total.",
      allowFaceMoves: false,
      setup: (cube: CubeInterface) => {
        cube.reset();
      },
      filter: (piece: CubeState) => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        const set = getCubieColorSet(piece);
        return set.size === 2 && set.has(CUBE_COLORS.WHITE);
      },
    },
    {
      id: "find-green-white",
      title: "Target the green/white edge",
      description:
        "In this example, we're focusing on the <b><i>White/Green</i></b> edge piece. Notice how it should be placed so the white sticker matches the white center and the green sticker matches the green center. We need to do this for all edge pieces with white on it.\n\n<b><i>There are four of them in total:</i></b>\n• White/Green\n• White/Red\n• White/Blue\n• White/Orange.",
      allowFaceMoves: false,
      setup: (cube: CubeInterface) => {
        cube.reset();
      },
      filter: (piece: CubeState) => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) {
          return true;
        }
        const set = getCubieColorSet(piece);
        return set.size === 2 && set.has(CUBE_COLORS.WHITE);
      },
    },
    {
      id: "flip-green-white-f2",
      title: "Misoriented edge",
      description:
        "Here we have an example of a misoriented edge. The <b><i>White/Green</i></b> edge piece is misoriented.  the <b><i>Green</i></b> sticker matches the <b><i>Green center</i></b> but the <b><i>White sticker</i></b> matches the <b><i>Yellow center</i></b>. To correct this, we need to perform the <b><i>F2</i></b> move. This will put the <b><i>White</i></b> sticker on the <b><i>White</i></b> center and the <b><i>Green</i></b> sticker on the <b><i>Green</i></b> center.\n\n<b><i>F2</i></b> means turn the <b><i>Front</i></b> face twice clockwise. Let's try this to see if we can fix the edge. We won't be using the <b><i>Hint</i></b> button from here on out so make sure you're comfortable with the move before you move on. You can use the <b><i>Reset</i></b> button to start the sequence over again if you get stuck or if you want to start over again.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => {
        cube.reset();
        cube.applyMoves(["F2"]);
      },
      filter: (piece: CubeState) => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        const set = getCubieColorSet(piece);
        return set.size === 2 && set.has(CUBE_COLORS.WHITE);
      },
    },
    {
      id: "flip-green-white",
      title: "Flipped edge (The Flipping Algorithm)",
      description:
        "In this example, we have a flipped edge. The <b>White/Green</b> edge piece is flipped. The <b>White sticker</b> matches the <b>Green center</b> but the <b>Green sticker</b> matches the <b>White center</b>.\n\nWe're going to learn our first algorithm here to fix this edge. The algorithm is <i>F U' R U</i>, which we will call <b>The Flipping Algorithm</b>. This will put the <b>White sticker</b> on the <b>White center</b> and the <b>Green sticker</b> on the <b>Green center</b>.\n\n<b>Let's break the algorithm down:</b>\n• <b>F</b> — Front face clockwise\n• <b>U'</b> — Up face counter-clockwise\n• <b>R</b> — Right face clockwise\n• <b>U</b> — Up face clockwise\n\nSee if you can complete the sequence exactly as it's shown here to complete the sequence. It's important not just to do the moves, but to understand how the piece moves. This will help you understand how this works and how it actually flips the edge.\n\nTry and practice this algorithm a dozen times until you're comfortable with it. If you get the sequence correct, you can either click <b>Reset</b> to start the sequence over again or click <b>Next</b> to move on to the next slide if you're ready.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => {
        cube.reset();
        cube.applyMoves(["F", "U'", "R", "U"]);
      },
      filter: (piece: CubeState) => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        const set = getCubieColorSet(piece);
        return set.size === 2 && set.has(CUBE_COLORS.WHITE);
      },
    },
    {
      id: "flipped-misoriented-green-white",
      title: "Flipped & misoriented edge",
      description:
        "Now we have a flipped and misoriented edge. The <b>White/Green</b> edge piece is flipped and misoriented. The <b>White sticker</b> matches the <b>Green center</b> but the <b>Green sticker</b> matches the <b>Yellow center</b>.\n\nThe fix here is to combine the two algorithms we've learned so far to fix the edge. First we need to orient the edge between the white and green centers with the <b>F2</b> move. Then we need to flip the edge with the <b>Flipping Algorithm</b>.\n\n<b>We'll do this in two steps:</b>\n• <b>F2</b> — Front face twice either clockwise or counter-clockwise\n• <b>Flipping Algorithm</b> — <i>F U' R U</i>\n\nLet's try this to see if we can fix the edge. You can use the <b>Reset</b> button to start the sequence over again if you get stuck or if you want to start over again.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => {
        cube.reset();
        cube.applyMoves(["U'", "R'", "U", "F"]);
      },
      filter: (piece: CubeState) => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        const set = getCubieColorSet(piece);
        return set.size === 2 && set.has(CUBE_COLORS.WHITE);
      },
    },
    {
      id: "misaligned-green-white",
      title: "Misaligned edge",
      description:
        "Here we have an example of a misaligned edge. The <b><i>White/Green</i></b> edge piece is misaligned on the <b><i>'Bottom Layer'</i></b> (D layer). The <b><i>White sticker</i></b> matches the <b><i>Yellow center</i></b> but the <b><i>Green sticker</i></b> matches the <b><i>Red center</i></b>.\n\nThe fix here is to orient the edge between the white & green centers with a <b><i>D'</i></b> move. Then we need to do <b><i>F2</i></b> to orient it into position.\n\n<b><i>We'll do this is two steps:</i></b>\n• <b><i>D'</i></b> - Down face counter-clockwise.\n• <b><i>F2</i></b> - Front face twice either clockwise or counter-clockwise.\n\nRemember, the idea is not just to do the moves, but to understand how the piece moves.\n\n<b><i>The mental model here:</i></b>\n• Align the correct edge piece with the correct center piece with a <b><i>D'</i></b> move.\n• Orient the edge between the white & green centers with a <b><i>F2</i></b> move.\n\nLet's try this to see if we can fix the edge. You can use the <b><i>Reset</i></b> button to start the sequence over again if you get stuck or if you want to start over again.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => {
        cube.reset();
        cube.applyMoves(["F2", "D"]);
      },
      filter: (piece: CubeState) => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        const set = getCubieColorSet(piece);
        return set.size === 2 && set.has(CUBE_COLORS.WHITE);
      },
    },
    {
      id: "flipped-misoriented-misaligned-green-white",
      title: "Flipped, misoriented & misaligned edge",
      description:
        "This example is a bit more difficult. Now we have a combination of 3 issues here. The <b>White/Green</b> edge piece is flipped, misoriented, and misaligned. The <b>White sticker</b> matches the <b>Red center</b> but the <b>Green sticker</b> matches the <b>Yellow center</b>.\n\nThe fix here is to combine the three algorithms we've learned so far to fix the edge. First we need to orient the edge between the white and green centers with a <b>D'</b> move. Then we need to move the piece up to the top layer with a <b>F2</b> move. Then we need to flip the edge with the <b>Flipping Algorithm</b>.\n\n<b>We'll do this in three steps:</b>\n• <b>D'</b> — Down face counter-clockwise\n• <b>F2</b> — Front face twice either clockwise or counter-clockwise\n• <b>Flipping Algorithm</b> — <i>F U' R U</i>\n\nRemember, the idea is not just to do the moves, but to understand how the piece moves.\n\n<b>The mental model here:</b>\n• Align the correct edge piece with the correct center piece with a <b>D'</b> move\n• Orient the edge between the white and green centers with a <b>F2</b> move\n• Flip the edge with the <b>Flipping Algorithm</b> (<i>F U' R U</i>)\n\nLet's try this to see if we can fix the edge. You can use the <b>Reset</b> button to start the sequence over again if you get stuck or if you want to start over again.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => {
        cube.reset();
        cube.applyMoves(["U'", "R'", "U", "F", "D"]);
      },
      filter: (piece: CubeState) => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        const set = getCubieColorSet(piece);
        return set.size === 2 && set.has(CUBE_COLORS.WHITE);
      },
    },
    {
      id: "midlayer-green-white-extraction",
      title: "Edge trapped in mid-layer",
      description:
        "You can run into cases like this too where the edge is trapped in the middle layer. In this example, it's between the red and blue centers.\n\nOur goal here is to move this down to the bottom layer (D layer).\n\nTo do this, we hold it so the target edge is on the right (so that red is facing front) and then perform the algorithm <b><i>R' D' R</i></b>.\n\nYou'll also notice that in the top left, it's showing <b><i>Red</i></b> as the front face for removing the trapped middle layer edge so be mindful of that when you're doing this. When the piece is on the <b><i>Bottom</i></b> layer again, we don't need to worry about the front face for the D layer moves as we can hold this any way we want so we mark it as <b><i>N/A</i></b>. For the last sequence, we hold it so that <b><i>Green</i></b> is facing front.\n\n<b><i>The mental model here:</i></b>\n• Hold the edge piece so the target edge is on the right (so that red is facing front).\n• Perform the algorithm <b><i>R' D' R</i></b>.\n• <b><i>D'</i></b> - Down face counter-clockwise with.\n• <b><i>F2</i></b> - Front face twice either clockwise or counter-clockwise.\n\nLet's try this to see if we can fix the edge. You can use the <b><i>Reset</i></b> button to start the sequence over again if you get stuck or if you want to start over again.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => {
        cube.reset();
        cube.applyMoves(["F2", "D", "B'", "D", "B"]);
      },
      filter: (piece: CubeState) => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        const set = getCubieColorSet(piece);
        return set.size === 2 && set.has(CUBE_COLORS.WHITE);
      },
    },
    {
      id: "white-cross-recap",
      title: "Quick recap",
      description:
        "<b>Now let's recap what we've learned so far:</b>\n\nWe've learned how to fix <b><i>misoriented, flipped, misaligned and trapped edges</i></b>. These are the four main steps to solving the white cross.\n\nThe key here is the understand the mental model of how the pieces move and how to fix them. This will help you understand the next steps and how to solve the cube.\n\n<b><i>The mental model here:</i></b>\n• <b>Trapped - </b> Check if an edge is trapped between the wrong centers and move the edge down to the bottom layer by holding the trapped edge piece on the right at the front and performing the algorithm <b><i>R' D' R</i></b>.\n• <b>Misalignment - </b> Align the edge piece with the correct center piece by moving it along the <b><i>D</i></b> layer.\n• <b>Misorientation - </b> Move the edge up to the top layer with an <b><i>F2</i></b> move.\n• <b>Flipped - </b> Flip the edge with the <b><i>'Flipping Algorithm'</i></b> if the edge is flipped.\n\nIt's crucial to understand this mental model to put each of the 4 white corner pieces in the correct position to solve the white cross.\n\nIt's important to <b><i>practice</i></b> these steps until you're comfortable with them. If you're still not confient, feel free to go back to the previous slides and practice the individual cases until you're comfortable with them. Or if you're ready to move on, click <b><i>Next</i></b> to move on to the next slide.",
      allowFaceMoves: false,
      setup: (cube: CubeInterface) => {
        cube.reset();
      },
      filter: (piece: CubeState) => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        const set = getCubieColorSet(piece);
        return set.size === 2 && set.has(CUBE_COLORS.WHITE);
      },
    },
    {
      id: "practice-two-edges",
      title: "Practice: 2 white edges",
      description:
        "Now let's practice what you've learned so far. We'll start with <b><i>'2 white edges out of place'</i></b>. Use the techniques you've learned to solve the <b><i>White Cross</i></b>. If you get stuck, go back to the previous slides to practice the individual cases.\n\nThere are no sequences here to follow, let's see if you can correct these two edges out of place here. When you have done it, you will see a <b><i>Green Tick</i></b> in the top left corner of the cube to indicate that you have solved the <b><i>White Cross</i></b>.\n\nYou can use the <b><i>Reset</i></b> button to start the sequence over again if you get stuck or if you want to start over again.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => {
        cube.reset();
        cube.applyMoves(["F", "U'", "R", "U", "F2", "D2", "R2", "D'"]);
      },
      filter: (piece: CubeState) => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        const set = getCubieColorSet(piece);
        return set.size === 2 && set.has(CUBE_COLORS.WHITE);
      },
    },
    {
      id: "practice-three-edges",
      title: "Practice: 3 white edges",
      description:
        "The same again but this time we have <b><i>'3 white edges out of place'</i></b>. Use the techniques you've learned to solve the <b><i>White Cross</i></b>. If you get stuck, go back to the previous slides to practice the individual cases.\n\nThere are no sequences here to follow, let's see if you can correct these three edges out of place here. When you have done it, you will see a <b><i>Green Tick</i></b> in the top left corner of the cube to indicate that you have solved the <b><i>White Cross</i></b>.\n\nYou can use the <b><i>Reset</i></b> button to start the sequence over again if you get stuck or if you want to start over again.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => {
        cube.reset();
        cube.applyMoves([
          "F",
          "R2",
          "D'",
          "B",
          "L",
          "D'",
          "L'",
          "D",
          "L",
          "D",
          "L'",
          "B",
          "D2",
          "B'",
        ]);
      },
      filter: (piece: CubeState) => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        const set = getCubieColorSet(piece);
        return set.size === 2 && set.has(CUBE_COLORS.WHITE);
      },
    },
    {
      id: "practice-full-cross",
      title: "Final Challenge: Complete Cross",
      description:
        "Last but not least, we have the <b><i>'Full Cross'</i></b> challenge where all <b><i>'4 edges'</i></b> are out of place. This is a full cross challenge to see if you can solve the entire white cross based on what you've learned, take your time and don't rush it. If you get stuck, go back to the previous slides to practice the individual cases.\n\nThere are no sequences here to follow, let's see if you can correct all four edges out of place here. When you have done it, you will see a <b><i>Green Tick</i></b> in the top left corner of the cube to indicate that you have solved the <b><i>White Cross</i></b>.\n\nYou can use the <b><i>Reset</i></b> button to start the sequence over again if you get stuck or if you want to start over again.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => {
        cube.reset();
        cube.applyMoves([
          "R",
          "D'",
          "B2",
          "R",
          "U",
          "R'",
          "B'",
          "D2",
          "R",
          "F'",
          "R",
          "D2",
          "L'",
          "D2",
          "B2",
          "L",
          "F",
          "U'",
          "F",
          "U'",
        ]);
      },
      filter: (piece: CubeState) => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        const set = getCubieColorSet(piece);
        return set.size === 2 && set.has(CUBE_COLORS.WHITE);
      },
    },
    {
      id: "white-cross-completion",
      title: "White Cross Complete!",
      description:
        "<b>Congratulations!</b> You've completed the <b><i>White Cross</i></b> lesson. You've learned how to solve all four white edge pieces and position them correctly around the white center piece.\n\n<b><i>Practice is key:</i></b>\nThe white cross is the foundation of solving the Rubik's Cube. It's crucial that you feel comfortable with all the techniques you've learned. Don't worry if you're not completely confident yet—this is completely normal!\n\n<b>You can come back to this lesson as many times as you need.</b> Feel free to revisit any slide to practice specific cases until solving the white cross becomes natural and intuitive.\n\n<b><i>Remember:</i></b>\n• Practice makes perfect\n• Go at your own pace\n• Review previous slides whenever you need to\n• There's no rush, take your time to understand each step\n\n<b><i>Ready for the next step?</i></b>\n\nIf you're feeling confident with the white cross and ready to continue, click <b><i>Finish</i></b> to move on to the next lesson: <b><i>White Corners</i></b>. In that lesson, you'll learn how to complete the entire white face by placing the white corner pieces in to their correct positions.",
      allowFaceMoves: false,
      setup: (cube: CubeInterface) => {
        cube.reset();
      },
      filter: (piece: CubeState) => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        const set = getCubieColorSet(piece);
        return set.size === 2 && set.has(CUBE_COLORS.WHITE);
      },
    },
  ];

export { getWhiteCrossSlides };
