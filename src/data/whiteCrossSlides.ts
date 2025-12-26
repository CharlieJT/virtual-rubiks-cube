import type { CubeState } from "@/types/cube";
import { CubeJSWrapper } from "@utils/cubejsWrapper";
import { whiteCrossFilter } from "@utils/whiteCrossUtils";

export interface Slide {
  id: string;
  title: string;
  description: string;
  allowFaceMoves: boolean;
  setup?: (cube: CubeJSWrapper) => void;
  filter?: (piece: CubeState) => boolean;
}

export const whiteCrossSlides: Slide[] = [
  {
    id: "intro",
    title: "What we're aiming to achieve",
    description:
      "Your first goal is to create a white cross around the white center piece. Each white edge should match the color of the center piece on its side. Drag the cube to spin and see how the cross and matching edges look from different angles.",
    allowFaceMoves: false,
    setup: (cube: CubeJSWrapper) => {
      cube.reset();
    },
    filter: whiteCrossFilter,
  },
  {
    id: "find-green-white",
    title: "Target the green/white edge",
    description:
      "There are four white edge pieces to position around the white center. In this example, we're focusing on the green/white edge piece. Notice how it should be placed so the white sticker matches the white center and the green sticker matches the green center.",
    allowFaceMoves: false,
    setup: (cube: CubeJSWrapper) => {
      cube.reset();
    },
    filter: whiteCrossFilter,
  },
  {
    id: "flip-green-white-f2",
    title: "Misoriented edge",
    description:
      "Here, the green/white edge is misoriented: the green sticker matches the green center, but the white sticker matches the yellow center. To correct this, perform F2 using the notation you've learned to position it between the white and green centers. Complete the sequence below, Reset and repeat a few times until it feels natural.",
    allowFaceMoves: true,
    setup: (cube: CubeJSWrapper) => {
      cube.reset();
      cube.applyMoves(["F2"]);
    },
    filter: whiteCrossFilter,
  },
  {
    id: "flip-green-white",
    title: "Flipped edge",
    description:
      "Sometimes this edge is flipped: the white sticker faces the green center and the green sticker faces the white center. To flip it, perform F U' R U. Complete the sequence below, Reset and practice it a few times until you feel comfortable with it.",
    allowFaceMoves: true,
    setup: (cube: CubeJSWrapper) => {
      cube.reset();
      cube.applyMoves(["F", "U'", "R", "U"]);
    },
    filter: whiteCrossFilter,
  },
  {
    id: "flipped-misoriented-green-white",
    title: "Flipped & misoriented edge",
    description:
      "The green/white edge is both flipped and misoriented. Fix it in two parts: first do F2 to orient the edge between the white & green centers (like you learned in step 3), then do F U' R U to flip it (like you learned in step 4). Reset and practice both parts together until it sticks.",
    allowFaceMoves: true,
    setup: (cube: CubeJSWrapper) => {
      cube.reset();
      cube.applyMoves(["U'", "R'", "U", "F"]);
    },
    filter: whiteCrossFilter,
  },
  {
    id: "misaligned-green-white",
    title: "Misaligned edge",
    description:
      "In this example, the green/white edge piece is underneath the red center, which is wrong. We fix this in two parts: first do D' to align the edge with the green center, then do F2 to orient it into position. Complete the sequence below, then press Reset and practice both parts together until it sticks.",
    allowFaceMoves: true,
    setup: (cube: CubeJSWrapper) => {
      cube.reset();
      cube.applyMoves(["F2", "D"]);
    },
    filter: whiteCrossFilter,
  },
  {
    id: "flipped-misoriented-misaligned-green-white",
    title: "Flipped, misoriented & misaligned edge",
    description:
      "We can see in this example that the green/white edge piece is also underneath the red center, but it's flipped. We fix this in three parts: first D' to line up with green center, then F2 to rotate between green & white centers, then F' U' R U to orient it correctly. Work through each step below; press Reset and practice until it sticks.",
    allowFaceMoves: true,
    setup: (cube: CubeJSWrapper) => {
      cube.reset();
      cube.applyMoves(["U'", "R'", "U", "F", "D"]);
    },
    filter: whiteCrossFilter,
  },
  {
    id: "midlayer-green-white-extraction",
    title: "Edge trapped in mid-layer",
    description:
      "The green/white edge is stuck in the middle layer between the blue and red centers. With red center facing front (towards you), do R' D' R. Then with green facing front, move the edge to meet green center with D' & then F2 to rotate into place. Again, practice this until it sticks.",
    allowFaceMoves: true,
    setup: (cube: CubeJSWrapper) => {
      cube.reset();
      cube.applyMoves(["F2", "D", "B'", "D", "B"]);
    },
    filter: whiteCrossFilter,
  },
  {
    id: "recap-mental-model",
    title: "Quick recap: the mental model",
    description: "A short recap of how to reason about the green/white edge.",
    allowFaceMoves: false,
    setup: (cube: CubeJSWrapper) => {
      cube.reset();
    },
    filter: whiteCrossFilter,
  },
  {
    id: "practice-two-edges",
    title: "Practice: 2 white edges",
    description:
      "Now practice with 2 white edges out of place. Use the techniques you've learned to solve the white cross. If you get stuck, go back to previous slides to practice the individual cases.",
    allowFaceMoves: true,
    setup: (cube: CubeJSWrapper) => {
      cube.reset();
      cube.applyMoves(["F", "U'", "R", "U", "F2", "D2", "R2", "D'"]);
    },
    filter: whiteCrossFilter,
  },
  {
    id: "practice-three-edges",
    title: "Practice: 3 white edges",
    description:
      "This is a bit trickier - there are 3 white edges that are out of place. Based on what you've learned, see if you can solve the cross. Remember, you can reset or go back to previous slides if you get stuck.",
    allowFaceMoves: true,
    setup: (cube: CubeJSWrapper) => {
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
    filter: whiteCrossFilter,
  },
  {
    id: "practice-full-cross",
    title: "Final Challenge: Complete Cross",
    description:
      "This is a full cross challenge to see if you can solve the entire white cross based on what you've learned. Remember, you can reset or go back to previous slides to practice if you get stuck.",
    allowFaceMoves: true,
    setup: (cube: CubeJSWrapper) => {
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
    filter: whiteCrossFilter,
  },
];
