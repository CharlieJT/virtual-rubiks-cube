import type { CubeState } from "@/types/cube";
import type { CubeInterface } from "@/types/CubeInterface";
import { getCubieColorSet } from "@components/tutorials/utils/tutorialHelpers";
import CUBE_COLORS from "@/consts/cubeColours";
import type { Slide } from "./notationSlides";

const getSecondLayerSlides = (): Slide[] => [
    {
      id: "intro",
      title: "What we're aiming to achieve",
      description:
        "In this lesson, we'll learn how to solve the <b>Second Layer</b>. This involves positioning 4 edge pieces in the middle layer. Each edge piece should be positioned correctly between its matching center colors.\n\nTake the time to look at the cube to understand what we're aiming to achieve here, then click <b>Next</b> to move on to the next slide.",
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

        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;

        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;

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
        "In this lesson, we'll be focusing on the <b>Red/Green</b> second layer edge piece. Notice how it needs to be positioned between the <b>Red</b> and <b>Green</b> center pieces.\n\n<b>The algorithms we'll be using are as follows:</b>\n• <b>Insert right</b>: <i>U</i> / <i>R U R' U'</i> / <i>L' U' L U</i>\n• <b>Insert left</b>: <i>U'</i> / <i>L' U' L U</i> / <i>R U R' U'</i>\n\nIn these lessons, we'll be using a combination of <i>Righty</i> and <i>Lefty</i> algorithms depending on the situation to solve the second layer. Click <b>Next</b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => {
        cube.reset();
      },
      filter: (piece: CubeState) => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;

        const set = getCubieColorSet(piece);

        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;

        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;

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
      id: "edge-insert-left",
      title: "Solving the second layer edge (insert left)",
      description:
        "So here, what we need to do is look around the top layer for an edge piece <b>without yellow</b> on it. Here, we have <b>Red/Green</b>. After we've found one, we match the color which is on the side with the center color (which is what we have here with <b>Green</b> matching the <b>Green</b> center).\n\nLooking at the <b>Red/Green</b> edge piece here, we need to determine which slot we need to insert it into. In this case, we need to insert it into the <b>Left</b> slot to fit between the <b>Green</b> and <b>Red</b> centers. To do this, we'll use the <b>Insert left</b> algorithm.\n\n<b>This algorithm is performed by doing:</b>\n• <b>U'</b> — Move in the opposite direction of the slot we're inserting into\n• <i>L' U' L U</i> — The Lefty algorithm with green facing front\n• <i>R U R' U'</i> — The Righty algorithm with red facing front\n\nLet's try this to see if we can insert the edge piece correctly, practice this several times until you're comfortable with it and really understand the mental model. After you're happy with it, click <b><i>Next</i></b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => {
        cube.reset();
        cube.applyMoves(["F", "D'", "F'", "D'", "R'", "D", "R", "D"]);
      },
      filter: (piece: CubeState) => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;

        const set = getCubieColorSet(piece);

        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;

        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;

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
      id: "edge-insert-right",
      title: "Solving the second layer edge (insert right)",
      description:
        "This is the same as the previous slide, but with the <b>Right</b> slot. First, we match the color which is on the side with the center color (which is what we have here with <b>Red</b> matching the <b>Red</b> center).\n\nWe then need to determine which way we need to insert the <b>Red/Green</b> edge piece. In this case, we need to insert it into the <b>Right</b> slot to fit between the <b>Green</b> and <b>Red</b> centers. To do this, we'll use the <b>Insert right</b> algorithm.\n\n<b>This algorithm is performed by doing:</b>\n• <b>U</b> — Move in the opposite direction of the slot we're inserting into\n• <i>R U R' U'</i> — The Righty algorithm with red facing front\n• <i>L' U' L U</i> — The Lefty algorithm with green facing front\n\nThese are the same solution as the previous slide, but in the opposite direction. Let's try this to see if we can insert the edge piece correctly, practice this several times until you're comfortable with it and really understand the mental model. After you're happy with it, click <b><i>Next</i></b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => {
        cube.reset();
        cube.applyMoves(["R'", "D", "R", "D", "F", "D'", "F'", "D'"]);
      },
      filter: (piece: CubeState) => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;

        const set = getCubieColorSet(piece);

        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;

        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;

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
      id: "edge-remove-reinsert",
      title: "Removing and reinserting with edge consideration",
      description:
        "Here we have the <b>Orange/Green</b> edge piece that we need to insert between the <b>Green</b> and <b>Orange</b> centers using a right insert. However, notice that the <b>Red/Green</b> edge piece is already in that spot.\n\nThis is actually perfect! When we insert the <b>Orange/Green</b> edge piece using the algorithms we've learned, it will automatically remove the <b>Red/Green</b> edge piece from its position.\n\nOnce the <b>Red/Green</b> edge piece is out, we then do a <b>U2</b> to move it so that the <b>Green</b> sticker on the side of the edge piece matches the <b>Green</b> center. Then we perform a right insert to insert the <b>Red/Green</b> edge piece into its correct position.\n\n<b>We'll do this in multiple steps:</b>\n• <b>U</b> — Move the <b>Orange/Green</b> edge piece in the opposite direction of the slot we're inserting into\n• <i>Righty Algorithm</i> (<i>R U R' U'</i>) with Green front, then <i>Lefty Algorithm</i> (<i>L' U' L U</i>) with Orange front to insert the <b>Orange/Green</b> edge piece into the right slot, which removes the <b>Red/Green</b> edge piece\n• <b>U2</b> — Move the <b>Red/Green</b> edge piece so the <b>Red</b> sticker on the side matches the <b>Red</b> center\n• <b>U</b> — Move the <b>Red/Green</b> edge piece in the opposite direction of the slot we're inserting into\n• <i>Righty Algorithm</i> (<i>R U R' U'</i>) with Red front, then <i>Lefty Algorithm</i> (<i>L' U' L U</i>) with Green front to insert the <b>Red/Green</b> edge piece into the right slot\n\nThis is a longer solution, so make sure you take the time to really understand what is happening here. To start with, before each sequence, follow along with the list above while you're performing each step and look at the outcome of each sequence after you've done them. It's not about just executing the moves, it's about understanding their purpose.\n\nLet's try this to see if we can insert both edge pieces correctly. You can use the <b>Reset</b> button to start the sequence over again or if you get stuck and want to start over again.\n\nRemember, it's important to <b>practice</b> this several times until you're comfortable with it. You should aim to try and solve this case without looking at the sequences if you can. Or if you're ready to move on, click <b>Next</b> to go to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => {
        cube.reset();
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
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;

        const set = getCubieColorSet(piece);

        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;

        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;

        if (
          set.size === 2 &&
          !set.has(CUBE_COLORS.WHITE) &&
          !set.has(CUBE_COLORS.YELLOW) &&
          set.has(CUBE_COLORS.ORANGE) &&
          set.has(CUBE_COLORS.GREEN)
        ) {
          return true;
        }

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
      id: "edge-flipped-in-position",
      title: "Flipped edge in correct position",
      description:
        "This is the most awkward case you'll encounter for second layer inserts: the correct edge piece is in its place, but it's <b><i>flipped</i></b> the wrong way. To fix this, we need to swap it with another piece. Ideally, use an edge piece with a <b><i>yellow</i></b> face, though any edge piece will work.\n\nYou can use either a <b><i>left</i></b> or <b><i>right</i></b> insertion algorithm - in this case, we'll use the <b><i>right insertion algorithm</i></b>.\n\n<b><i>We'll do this in multiple steps:</i></b>\n• <b><i>U</i></b> - Move the <b><i>Yellow/Red</i></b> edge piece in the opposite direction of the slot we're inserting into.\n• <b><i>'Righty Algorithm' (Red front)</i></b> then <b><i>'Lefty Algorithm' (Green front)</i></b> to insert the <b><i>Yellow/Red</i></b> edge piece into the right slot.\n• <b><i>U</i></b> - Move the <b><i>Red/Green</i></b> edge piece so its <b><i>Red</i></b> sticker on the side matches the <b><i>Red</i></b> center.\n• <b><i>U</i></b> - Move the <b><i>Red/Green</i></b> edge piece in the opposite direction of the slot we're inserting into.\n• <b><i>'Righty Algorithm' (Red front)</i></b> then <b><i>'Lefty Algorithm' (Green front)</i></b> to insert the <b><i>Red/Green</i></b> edge piece into the right slot.\n\nThis is a longer solution so make sure you take the time to really understand what is happening here. To start with, before each sequence, follow along with the list above whilst you're performing each step and look at the outcome of each sequence after you've done them. It's not about just executing the moves, it's about understanding their purpose.\n\nLet's try this to see if we can fix the flipped edge piece correctly. You can use the <b><i>Reset</i></b> button to start the sequence over again or if you get stuck & want to start over again.\n\nRemember, it's important to <b><i>practice</i></b> this several times until you're comfortable with it, you should aim to try and solve this case without looking at the sequences if you can. Or if you're ready to move on, click <b><i>Next</i></b> to go to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => {
        cube.reset();
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
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;

        const set = getCubieColorSet(piece);

        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;

        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;

        if (
          set.size === 2 &&
          set.has(CUBE_COLORS.RED) &&
          set.has(CUBE_COLORS.YELLOW)
        ) {
          return true;
        }

        if (
          set.size === 2 &&
          !set.has(CUBE_COLORS.WHITE) &&
          !set.has(CUBE_COLORS.YELLOW)
        ) {
          if (set.has(CUBE_COLORS.BLUE) && set.has(CUBE_COLORS.RED)) {
            return false;
          }
          if (set.has(CUBE_COLORS.BLUE) && set.has(CUBE_COLORS.ORANGE)) {
            return false;
          }
          if (set.has(CUBE_COLORS.GREEN) && set.has(CUBE_COLORS.ORANGE)) {
            return false;
          }
          return true;
        }

        return false;
      },
    },
    {
      id: "second-layer-recap",
      title: "Quick recap: the algorithms",
      description:
        "<b>Now let's recap what we've learned so far:</b>\n\nWe've learned how to solve the second layer. This involves positioning 4 edge pieces in the middle layer. Each edge piece should be positioned correctly between its matching center colors.\n\nThe key here is the understand the mental model of how the pieces move and how to fix them. This will help you understand the next steps and how to solve the cube.\n\n<b><i>The mental model here:</i></b>\n\n• <b>Insert left: </b>\n<b><i>U'</i></b> - Move in the opposite direction of the slot we're inserting into.\n<b><i>L' U' L U</i></b> - The 'Lefty' algorithm (face on the right of the target edge slot).\n<b><i>R U R' U'</i></b> - The 'Righty' algorithm (face on the left of the target edge slot).\n\n• <b>Insert right: </b>\n<b><i>U</i></b> - Move in the opposite direction of the slot we're inserting into.\n<b><i>R U R' U'</i></b> - The 'Righty' algorithm (face on the left of the target edge slot).\n<b><i>L' U' L U</i></b> - The 'Lefty' algorithm (face on the right of the target edge slot).\n\nIt's crucial to understand this mental model to put each of the 4 edge pieces in the correct position to solve the second layer.\n\nIt's important to <b><i>practice</i></b> these steps until you're comfortable with them. If you're still not confient, feel free to go back to the previous slides and practice the individual cases until you're comfortable with them. Or if you're ready to move on, click <b><i>Next</i></b> to move on to the next slide.",
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

        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;

        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;

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
      id: "practice-two-second-edges",
      title: "Practice: 2 second layer edges",
      description:
        "Let's put what you've learned so far into practice. We'll start with <b><i>'2 edges out of place'</i></b>. Use the algorithms you've learned to bring each edge to its correct position. Let's see if you can solve this case correctly.\n\nIf you get stuck, go back to the previous slides to review the individual cases. Or if you're ready to move on, click <b><i>Next</i></b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => {
        cube.reset();
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
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;

        const set = getCubieColorSet(piece);

        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;

        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;

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
      id: "practice-three-second-edges",
      title: "Practice: 3 second layer edges",
      description:
        "The next step is a little bit more challenging. We'll now solve <b><i>'3 edges out of place'</i></b>, two edges are in the top layer and one is in the middle layer but in the wrong position. Use the algorithms you've learned to bring each edge to its correct position. Let's see if you can solve this case correctly.\n\nIf you get stuck, go back to the previous slides to review the individual cases. Or if you're ready to move on, click <b><i>Next</i></b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => {
        cube.reset();
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
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;

        const set = getCubieColorSet(piece);

        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;

        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;

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
      id: "practice-four-second-edges",
      title: "Practice: 4 second layer edges",
      description:
        "Now we have the <b><i>'All 4 edges out of place'</i></b> case. One is in the top layer, two are in the middle layer but in the wrong position and one is in the correct position but incorrectly oriented. Use the algorithms you've learned to bring each edge to its correct position. Let's see if you can solve this case correctly.\n\nTake your time and don't rush it & remember to <b><i>practice</i></b> this several times until you're comfortable with it. If you get stuck, go back to the previous slides to review the individual cases. Or if you're ready to move on, click <b><i>Next</i></b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => {
        cube.reset();
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
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;

        const set = getCubieColorSet(piece);

        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;

        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;

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
      id: "bonus-halfway-solve",
      title: "Bonus: Halfway point challenge",
      description:
        "Congratulations on making it this far! <b><i>Now we're at the halfway point</i></b> in solving the entire cube. It would be good to see if you can now solve the cube up to this point to see if you've retained everything you've learned so far.\n\n<b><i>What you need to solve:</i></b>\n• <b><i>White Cross</i></b> - All four white edge pieces correctly positioned\n• <b><i>White Corners</i></b> - All four white corner pieces correctly positioned\n• <b><i>Second Layer</i></b> - All four second layer edge pieces correctly positioned\n\n<b><i>Quick reminders from previous lessons:</i></b>\n\n<b>White Cross:</b>\n• Look for white edge pieces and match them to their centers\n• Use F2 to flip misoriented edges\n• Use D moves to align edges before inserting\n\n<b>White Corners:</b>\n• Look for white corner pieces in the top layer first\n• Use the righty algorithm (R U R' U') or lefty algorithm (L' U' L U) to insert corners\n• Match the corner piece colors to their centers\n\n<b>Second Layer:</b>\n• Look for edge pieces without yellow on the top layer\n• Match the edge piece color to the center color\n• Use insert left for left slots, insert right for right slots\n• If an edge is already in place but flipped, swap it with a yellow edge piece\n\n<b><i>Staying focused:</i></b>\n\nIt's crucial to <b><i>stay focused</i></b> and <b><i>keep track</i></b> that each move has had the desired outcome. Take your time with each step and verify that you're making progress toward your goal.\n\nIf you really mess up and want to start again, you can use the <b><i>Reset</i></b> button to return to the starting position and try again.\n\n<b>Good luck with this!</b> Take your time, stay focused, and remember - practice makes perfect. If you get stuck, feel free to go back to any of the previous lessons to refresh your memory on specific techniques. When you're ready, click <b><i>Next</i></b> to continue.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => {
        cube.reset();
        cube.applyMoves([
          "B'",
          "R2",
          "F2",
          "L",
          "D",
          "L2",
          "B2",
          "L'",
          "U'",
          "F",
          "R",
          "F",
          "U'",
          "B",
          "L",
          "B",
          "D",
          "R2",
          "D",
          "F'",
        ]);
      },
      filter: (piece: CubeState) => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;

        const set = getCubieColorSet(piece);

        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;

        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;

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
      id: "second-layer-completion",
      title: "Second Layer Complete!",
      description:
        "Congratulations! You've completed the <b><i>Second Layer</i></b> lesson. You've learned how to solve all four second layer edge pieces and complete the middle layer of the cube.\n\n<b><i>Practice is key:</i></b>\n\nThe second layer step builds upon the white face foundation. Together, they form the first two layers of the cube. It's crucial that you feel comfortable with both the insert left and insert right algorithms and understand how to recognize different edge positions, including when an edge piece is already in place but flipped.\n\n<b>You can come back to this lesson as many times as you need.</b> Feel free to revisit any slide to practice specific cases until solving the second layer becomes natural and intuitive.\n\n<b><i>Remember:</i></b>\n• Practice makes perfect\n• Go at your own pace\n• Review previous slides whenever you need to\n• There's no rush, take your time to understand each step\n• Look for edge pieces without yellow on the top layer first\n• Match the edge piece color to the center color before inserting\n• Use insert left for left slots, insert right for right slots\n• When an edge is already in place but flipped, swap it with a yellow edge piece\n\n<b><i>Ready for the next step?</i></b>\n\nIf you're feeling confident with the second layer and ready to continue, click <b><i>Finish</i></b> to move on to the next lesson: <b><i>Yellow Cross</i></b>. In that lesson, you'll learn how to solve the yellow cross on the top face of the cube.\n\nIf you'd like more practice, feel free to go back through this lesson anytime. Take your time, we'll be here when you're ready!",
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
        if (set.size === 2 && set.has(CUBE_COLORS.WHITE)) return true;
        if (set.size === 3 && set.has(CUBE_COLORS.WHITE)) return true;
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

export { getSecondLayerSlides };
