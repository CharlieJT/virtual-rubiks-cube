import type { CubeState } from "@/types/cube";
import { CubeJSWrapper } from "@utils/cubejsWrapper";
import { getCubieColorSet } from "@/utils/tutorialHelpers";
import CUBE_COLORS from "@/consts/cubeColours";
import type { Slide } from "./notationSlides";

export function getWhiteCrossSlides(): Slide[] {
  return [
    {
      id: "intro",
      title: "What we're aiming to achieve",
      description:
        "You're now ready to start solving the cube. In this lesson, we'll be learning how to solve the <b><i>White Cross</i></b>. The white cross is <b><i>1st of 7 steps</i></b> in solving the cube. It's the foundation of the cube and it's the first step in solving the cube.\n\nHere we have an example of what we're aiming to achieve. We want to create a white cross around the <b><i>White</i></b> center piece. Each white edge should match the color of the center piece on its side. Drag the cube to spin and see how the cross and matching edges look from different angles.\n\nFor Example, the <b><i>White/Green</i></b> edge piece should be placed so the <b><i>White sticker</i></b> matches the <b><i>White center piece</i></b> and the <b><i>Green</i></b> sticker matches the <b><i>Green center piece</i></b>. we want to do this for all edge pieces with white on it, there are four of them in total.",
      allowFaceMoves: false,
      setup: (cube: CubeJSWrapper) => {
        // Ensure a solved cube whenever we land on slide 1
        cube.reset();
      },
      // Lock cube: no orbit/spin allowed on this slide
      filter: (piece: CubeState) => {
        // Keep all centers
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        // Keep only white edges (two-color pieces that include WHITE)
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
      setup: (cube: CubeJSWrapper) => {
        // Ensure a solved cube whenever we land on slide 2
        cube.reset();
      },
      filter: (piece: CubeState) => {
        // Show centers and ALL white edges
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
    // Step 3: F2 case (white sticker matches yellow center, green matches green center)
    {
      id: "flip-green-white-f2",
      title: "Misoriented edge",
      description:
        "Here we have an example of a misoriented edge. The <b><i>White/Green</i></b> edge piece is misoriented.  the <b><i>Green</i></b> sticker matches the <b><i>Green center</i></b> but the <b><i>White sticker</i></b> matches the <b><i>Yellow center</i></b>. To correct this, we need to perform the <b><i>F2</i></b> move. This will put the <b><i>White</i></b> sticker on the <b><i>White</i></b> center and the <b><i>Green</i></b> sticker on the <b><i>Green</i></b> center.\n\n<b><i>F2</i></b> means turn the <b><i>Front</i></b> face twice clockwise. Let's try this to see if we can fix the edge. We won't be using the <b><i>Hint</i></b> button from here on out so make sure you're comfortable with the move before you move on. You can use the <b><i>Reset</i></b> button to start the sequence over again if you get stuck or if you want to start over again.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        // Build the F2 case: white sticker matches yellow center, green matches green center
        cube.reset();
        cube.applyMoves(["F2"]); // F2 puts white on yellow, green on green
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
    // Step 4: Flipped case (white sticker matches green center, green matches white center)
    {
      id: "flip-green-white",
      title: "Flipped edge (The Flipping Algorithm)",
      description:
        "In this example, we have a flipped edge. The <b><i>White/Green</i></b> edge piece is flipped. The <b><i>White sticker</i></b> matches the <b><i>Green center</i></b> but the <b><i>Green sticker</i></b> matches the <b><i>White center</i></b>.\n\nWe're going to learn out first algorithm here to fix this edge. The algorithm is <b><i>'F U' R U'</i></b> which we will call <b><i>'The Flipping Algorithm'</i></b>. This will put the <b><i>White sticker</i></b> on the <b><i>White center</i></b> and the <b><i>Green sticker</i></b> on the <b><i>Green center</i></b>.\n\n<b><i>Let's break the algorithm down:</i></b>\n• <b><i>'F'</i></b> - Front face clockwise.\n• <b><i>'U'</i></b> - Up face counter-clockwise.\n• <b><i>'R'</i></b> - Right face clockwise.\n• <b><i>'U'</i></b> - Up face counter-clockwise.\n\nSee if you can complete the sequence exactly as it's shown here to complete the sequence. It's important not just do the moves, but understand how the piece moves, this will help you understand how this works and how it actually flips the edge.\n\nTry and practice this algorithm a dozen times until you're comfortable with it. If you get the sequence correct, you can either click <b><i>Reset</i></b> to start the sequence over again or click <b><i>Next</i></b> to move on to the next slide if you're ready.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        // Build the flipped case so that applying F U' R U' restores the edge
        cube.reset();
        cube.applyMoves(["F", "U'", "R", "U"]); // inverse of the teaching sequence
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
    // Step 5: Flipped & misoriented (piece is both flipped and misaligned)
    {
      id: "flipped-misoriented-green-white",
      title: "Flipped & misoriented edge",
      description:
        "Now we have a flipped & misoriented edge. The <b><i>White/Green</i></b> edge piece is flipped & misoriented. The <b><i>White sticker</i></b> matches the <b><i>Green center</i></b> but the <b><i>Green sticker</i></b> matches the <b><i>Yellow center</i></b>.\n\nThe fix here is to combine the two algorithms we've learned so far to fix the edge. First we need to orient the edge between the white & green centers with the <b><i>F2</i></b> move. Then we need to flip the edge with the <b><i>'Flipping Algorithm'</i></b>.\n\n<b><i>We'll do this is two steps:</i></b>\n• <b><i>F2</i></b> - Front face twice either clockwise or counter-clockwise.\n• <b><i>'Flipping Algorithm'</i></b> - F U' R U\n\nLet's try this to see if we can fix the edge. You can use the <b><i>Reset</i></b> button to start the sequence over again if you get stuck or if you want to start over again.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        // Build the flipped & misoriented case: solved by F', U', R, U. Apply inverse: D', R', U, F
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
    // Step 6: Misaligned on D-layer (edge lined up with red/yellow); solution D' F2
    {
      id: "misaligned-green-white",
      title: "Misaligned edge",
      description:
        "Here we have an example of a misaligned edge. The <b><i>White/Green</i></b> edge piece is misaligned on the <b><i>'Bottom Layer'</i></b> (D layer). The <b><i>White sticker</i></b> matches the <b><i>Yellow center</i></b> but the <b><i>Green sticker</i></b> matches the <b><i>Red center</i></b>.\n\nThe fix here is to orient the edge between the white & green centers with a <b><i>D'</i></b> move. Then we need to do <b><i>F2</i></b> to orient it into position.\n\n<b><i>We'll do this is two steps:</i></b>\n• <b><i>D'</i></b> - Down face counter-clockwise.\n• <b><i>F2</i></b> - Front face twice either clockwise or counter-clockwise.\n\nRemember, the idea is not just to do the moves, but to understand how the piece moves.\n\n<b><i>The mental model here:</i></b>\n• Align the correct edge piece with the correct center piece with a <b><i>D'</i></b> move.\n• Orient the edge between the white & green centers with a <b><i>F2</i></b> move.\n\nLet's try this to see if we can fix the edge. You can use the <b><i>Reset</i></b> button to start the sequence over again if you get stuck or if you want to start over again.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        // Create a state that is solved by D' F2. Apply the inverse from solved: F2 D
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
    // Step 7: Flipped, misoriented & misaligned
    {
      id: "flipped-misoriented-misaligned-green-white",
      title: "Flipped, misoriented & misaligned edge",
      description:
        "This example is a bit more difficult. Now we have a combination of 3 issues here. The <b><i>White/Green</i></b> edge piece is flipped, misoriented & misaligned. The <b><i>White sticker</i></b> matches the <b><i>Red center</i></b> but the <b><i>Green sticker</i></b> matches the <b><i>Yellow center</i></b>.\n\nThe fix here is to combine the three algorithms we've learned so far to fix the edge. First we need to orient the edge between the white & green centers with a <b><i>D'</i></b> move. Then we need move the piece up to the top layer with <b><i>F2</i></b> move. Then we need to flip the edge with the <b><i>'Flipping Algorithm'</i></b>.\n\n<b><i>We'll do this is three steps:</i></b>\n• <b><i>D'</i></b> - Down face counter-clockwise.\n• <b><i>F2</i></b> - Front face twice either clockwise or counter-clockwise.\n• <b><i>'Flipping Algorithm'</i></b> - F U' R U\n\nRemember, the idea is not just to do the moves, but to understand how the piece moves.\n\n<b><i>The mental model here:</i></b>\n• Align the correct edge piece with the correct center piece with a <b><i>D'</i></b> move.\n• Orient the edge between the white & green centers with a <b><i>F2</i></b> move.\n• Flip the edge with the <b><i>'Flipping Algorithm'</i></b>.\n\nLet's try this to see if we can fix the edge. You can use the <b><i>Reset</i></b> button to start the sequence over again if you get stuck or if you want to start over again.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
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
    // NEW Step 8: Mid-layer extraction case (edge trapped between blue/red centers)
    {
      id: "midlayer-green-white-extraction",
      title: "Edge trapped in mid-layer",
      description:
        "You can run into cases like this too where the edge is trapped in the middle layer. In this example, it's between the red and blue centers.\n\nOur goal here is to move this down to the bottom layer (D layer).\n\nTo do this, we hold it so the target edge is on the right (so that red is facing front) and then perform the algorithm <b><i>'R' D' R'</i></b>.\n\nYou'll also notice that in the top left, it's showing <b><i>Red</i></b> as the front face for removing the trapped middle layer edge so be mindful of that when you're doing this. When the piece is on the <b><i>'Bottom'</i></b> layer again, we don't need to worry about the front face for the D layer moves as we can hold this any way we want so we mark it as <b><i>'N/A'</i></b>. For the last sequence, we hold it so that <b><i>Green</i></b> is facing front.\n\n<b><i>The mental model here:</i></b>\n• Hold the edge piece so the target edge is on the right (so that red is facing front).\n• Perform the algorithm <b><i>R' D' R</i></b>.\n• <b><i>D'</i></b> - Down face counter-clockwise with green center facing front.\n• <b><i>F2</i></b> - Front face twice either clockwise or counter-clockwise.\n\nLet's try this to see if we can fix the edge. You can use the <b><i>Reset</i></b> button to start the sequence over again if you get stuck or if you want to start over again.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        // Build the trapped case (solved -> apply F2 D2 B)
        cube.applyMoves(["F2", "D", "B'", "D", "B"]);
      },
      filter: (piece: CubeState) => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        const set = getCubieColorSet(piece);
        // Show all WHITE edges on this slide
        return set.size === 2 && set.has(CUBE_COLORS.WHITE);
      },
    },
    // Step 9: Recap & mental model
    {
      id: "recap-white-cross",
      title: "Quick recap",
      description:
        "<b>Now let's recap what we've learned so far:</b>\n\nWe've learned how to fix <b><i>misoriented, flipped, misaligned and trapped edges</i></b>. These are the four main steps to solving the white cross.\n\nThe key here is the understand the mental model of how the pieces move and how to fix them. This will help you understand the next steps and how to solve the cube.\n\n<b><i>The mental model here:</i></b>\n• <b>Trapped - </b> Check if an edge is trapped between the wrong centers and move the edge down to the bottom layer by holding the trapped edge piece on the right at the front and performing the algorithm <b><i>'R' D' R'</i></b>.\n• <b>Misalignment - </b> Align the edge piece with the correct center piece by moving it along the <b><i>D</i></b> layer.\n• <b>Misorientation - </b> Move the edge up to the top layer with an <b><i>F2</i></b> move.\n• <b>Flipped - </b> Flip the edge with the <b><i>'Flipping Algorithm'</i></b> if the edge is flipped.\n\nIt's crucial to understand this mental model to put each of the 4 white corner pieces in the correct position to solve the white cross.\n\nIt's important to <b><i>practice</i></b> these steps until you're comfortable with them. If you're still not confient, feel free to go back to the previous slides and practice the individual cases until you're comfortable with them. Or if you're ready to move on, click <b><i>Next</i></b> to move on to the next slide.",
      allowFaceMoves: false,
      setup: (cube: CubeJSWrapper) => {
        // Keep the cube solved so we can talk through the idea clearly
        cube.reset();
      },
      filter: (piece: CubeState) => {
        // Keep all centers and all white edges highlighted for context
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        const set = getCubieColorSet(piece);
        return set.size === 2 && set.has(CUBE_COLORS.WHITE);
      },
    },
    // Step 10: Free practice with 2 white edges out of place
    {
      id: "practice-two-edges",
      title: "Practice: 2 white edges",
      description:
        "Now let's practice what you've learned so far. We'll start with <b><i>'2 white edges out of place'</i></b>. Use the techniques you've learned to solve the <b><i>White Cross</i></b>. If you get stuck, go back to the previous slides to practice the individual cases.\n\nThere are no sequences here to follow, let's see if you can correct these two edges out of place here. When you have done it, you will see a <b><i>Green Tick</i></b> in the top left corner of the cube to indicate that you have solved the <b><i>White Cross</i></b>.\n\nYou can use the <b><i>Reset</i></b> button to start the sequence over again if you get stuck or if you want to start over again.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        // Start from solved, then apply the scramble to get red/white and green/white out of place
        cube.reset();
        cube.applyMoves(["F", "U'", "R", "U", "F2", "D2", "R2", "D'"]);
      },
      filter: (piece: CubeState) => {
        // Show all centers and all white edges
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        const set = getCubieColorSet(piece);
        return set.size === 2 && set.has(CUBE_COLORS.WHITE);
      },
    },
    // Step 11: Free practice with 3 white edges out of place
    {
      id: "practice-three-edges",
      title: "Practice: 3 white edges",
      description:
        "The same again but this time we have <b><i>'3 white edges out of place'</i></b>. Use the techniques you've learned to solve the <b><i>White Cross</i></b>. If you get stuck, go back to the previous slides to practice the individual cases.\n\nThere are no sequences here to follow, let's see if you can correct these three edges out of place here. When you have done it, you will see a <b><i>Green Tick</i></b> in the top left corner of the cube to indicate that you have solved the <b><i>White Cross</i></b>.\n\nYou can use the <b><i>Reset</i></b> button to start the sequence over again if you get stuck or if you want to start over again.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        // Start from solved, then apply the advanced scramble
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
        // Show all centers and all white edges
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        const set = getCubieColorSet(piece);
        return set.size === 2 && set.has(CUBE_COLORS.WHITE);
      },
    },
    // Step 12: Full cross challenge
    {
      id: "practice-full-cross",
      title: "Final Challenge: Complete Cross",
      description:
        "Last but not least, we have the <b><i>'Full Cross'</i></b> challenge where all <b><i>'4 edges'</i></b> are out of place. This is a full cross challenge to see if you can solve the entire white cross based on what you've learned, take your time and don't rush it. If you get stuck, go back to the previous slides to practice the individual cases.\n\nThere are no sequences here to follow, let's see if you can correct all four edges out of place here. When you have done it, you will see a <b><i>Green Tick</i></b> in the top left corner of the cube to indicate that you have solved the <b><i>White Cross</i></b>.\n\nYou can use the <b><i>Reset</i></b> button to start the sequence over again if you get stuck or if you want to start over again.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        // Start from solved, then apply the full cross challenge scramble
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
        // Show all centers and all white edges
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        const set = getCubieColorSet(piece);
        return set.size === 2 && set.has(CUBE_COLORS.WHITE);
      },
    },
    // Final completion slide
    {
      id: "white-cross-completion",
      title: "White Cross Complete!",
      description:
        "<b>Congratulations!</b> You've completed the <b><i>White Cross</i></b> lesson. You've learned how to solve all four white edge pieces and position them correctly around the white center piece.\n\n<b><i>Practice is key:</i></b>\nThe white cross is the foundation of solving the Rubik's Cube. It's crucial that you feel comfortable with all the techniques you've learned. Don't worry if you're not completely confident yet—this is completely normal!\n\n<b>You can come back to this lesson as many times as you need.</b> Feel free to revisit any slide to practice specific cases until solving the white cross becomes natural and intuitive.\n\n<b><i>Remember:</i></b>\n• Practice makes perfect\n• Go at your own pace\n• Review previous slides whenever you need to\n• There's no rush, take your time to understand each step\n\n<b><i>Ready for the next step?</i></b>\n\nIf you're feeling confident with the white cross and ready to continue, click <b><i>Finish</i></b> to move on to the next lesson: <b><i>White Corners</i></b>. In that lesson, you'll learn how to complete the entire white face by placing the white corner pieces in to their correct positions.",
      allowFaceMoves: false,
      setup: (cube: CubeJSWrapper) => {
        // Keep the cube solved for a clean completion view
        cube.reset();
      },
      filter: (piece: CubeState) => {
        // Keep all centers and all white edges highlighted for context
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        const set = getCubieColorSet(piece);
        return set.size === 2 && set.has(CUBE_COLORS.WHITE);
      },
    },
  ];
}
