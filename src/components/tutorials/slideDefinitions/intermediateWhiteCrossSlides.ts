import type { CubeState } from "@/types/cube";
import type { CubeInterface } from "@/types/CubeInterface";
import { getCubieColorSet } from "@components/tutorials/utils/tutorialHelpers";
import CUBE_COLORS from "@/consts/cubeColours";
import type { Slide } from "./notationSlides";

const getIntermediateWhiteCrossSlides = (): Slide[] => [
  {
    id: "intermediate-white-cross-intro",
    title: "Following on from the White Cross",
    description:
      "In this lesson we build on what you learned in the <b><i>White Cross</i></b> lesson. We'll use the same goal: a white cross around the <b><i>White</i></b> center, with each white edge matched to its side center.\n\nHere again is the solution we're aiming for. Each white edge (White/Green, White/Red, White/Blue, White/Orange) should sit with the white sticker on the white face and the other sticker aligned with its center. Drag the cube to see the cross from different angles.",
    allowFaceMoves: false,
    setup: (cube: CubeInterface) => {
      cube.reset();
    },
    filter: (piece: CubeState) => {
      const { x, y, z } = piece.position;
      const isCenter = [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
      if (isCenter) return true;
      const set = getCubieColorSet(piece);
      return set.size === 2 && set.has(CUBE_COLORS.WHITE);
    },
  },
  {
    id: "white-on-bottom",
    title: "White cross with white on the bottom",
    description:
      "From here on we'll solve the white cross with the <b><i>white face on the bottom</i></b>. So instead of building the cross on top, we'll work with the cube held so that white is down.\n\nYour job is to find each <b><i>white edge</i></b> (the four edges that have a white sticker) and get them into the correct position around the white center on the bottom. Knowing where each edge belongs and how to fix misoriented, flipped, or trapped edges is exactly what you practised in the White Cross lesson—we're just applying it with white on the bottom.",
    allowFaceMoves: false,
    setup: (cube: CubeInterface) => {
      cube.reset();
    },
    filter: (piece: CubeState) => {
      const { x, y, z } = piece.position;
      const isCenter = [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
      if (isCenter) return true;
      const set = getCubieColorSet(piece);
      return set.size === 2 && set.has(CUBE_COLORS.WHITE);
    },
  },
  {
    id: "center-order-bogr",
    title: "Center order: BOGR",
    description:
      "Looking at the cube from above (with the <b><i>yellow center</i></b> on top), the four side centers go in a fixed order <b><i>clockwise</i></b>: <b>B</b>lue, <b>O</b>range, <b>G</b>reen, <b>R</b>ed.\n\nSo you always know: <b>Orange</b> is to the left of Blue, <b>Green</b> is to the left of Orange, <b>Red</b> is to the left of Green, and <b>Blue</b> is to the left of Red.\n\nAn easy way to remember this order is the acronym <b><i>BOGR</i></b>: <b>B</b>lue, <b>O</b>range, <b>G</b>reen, <b>R</b>ed. Once you know BOGR, you always know which center is where around the cube.",
    allowFaceMoves: false,
    setup: (cube: CubeInterface) => {
      cube.reset();
    },
    filter: (piece: CubeState) => {
      const { x, y, z } = piece.position;
      const isCenter = [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
      if (isCenter) return true;
      const set = getCubieColorSet(piece);
      return set.size === 2 && set.has(CUBE_COLORS.WHITE);
    },
  },
  {
    id: "f2-blue-front",
    title: "F2 with blue front",
    description:
      "Here the cube is set up with <b><i>blue</i></b> as the front face. One <b><i>F2</i></b> move (turn the front face 180°) will solve this case.\n\nThis is the same idea as the misoriented edge from the White Cross lesson—we're just holding the cube with <b>blue</b> in front instead of green. Perform <b><i>F2</i></b> to fix the edge. You can use <b>Reset</b> to run the setup again.",
    allowFaceMoves: true,
    setup: (cube: CubeInterface) => {
      cube.reset();
      cube.applyMoves(["B2"]);
    },
    filter: (piece: CubeState) => {
      const { x, y, z } = piece.position;
      const isCenter = [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
      if (isCenter) return true;
      const set = getCubieColorSet(piece);
      return set.size === 2 && set.has(CUBE_COLORS.WHITE);
    },
  },
  {
    id: "insert-flipped-edge-right",
    title: "Insert flipped edge (right)",
    description:
      "When a white edge is in the <b>top layer</b> but <b><i>flipped</i></b> (wrong way around), we need to insert it from the <b>right</b> side. With <b>blue</b> in front.\n\nThe solution is <b><i>U' R' F R</i></b>. Practice this until you can do it with blue (or any front) without thinking. Use <b>Reset</b> to run the setup again.",
    allowFaceMoves: true,
    setup: (cube: CubeInterface) => {
      cube.reset();
      cube.applyMoves(["R'", "B'", "R", "D"]);
    },
    filter: (piece: CubeState) => {
      const { x, y, z } = piece.position;
      const isCenter = [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
      if (isCenter) return true;
      const set = getCubieColorSet(piece);
      return set.size === 2 && set.has(CUBE_COLORS.WHITE);
    },
  },
  {
    id: "insert-flipped-edge-left",
    title: "Insert flipped edge (left)",
    description:
      "We also need to know how to insert a <b>flipped</b> edge from the <b>left</b> side. With <b>blue</b> in front.\n\nThe solution is <b><i>U L F' L'</i></b>. It's the mirror of the right-side case—important to be comfortable with both so you can handle any flipped edge in the top layer. Use <b>Reset</b> to run the setup again.",
    allowFaceMoves: true,
    setup: (cube: CubeInterface) => {
      cube.reset();
      cube.applyMoves(["L", "B", "L'", "D'"]);
    },
    filter: (piece: CubeState) => {
      const { x, y, z } = piece.position;
      const isCenter = [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
      if (isCenter) return true;
      const set = getCubieColorSet(piece);
      return set.size === 2 && set.has(CUBE_COLORS.WHITE);
    },
  },
  {
    id: "two-edges-blue-front",
    title: "Two edges (blue front)",
    description:
      "Here we focus on putting <b>two edge pieces</b> in. With <b>blue</b> in front, the setup is <b><i>L2 F2</i></b>.\n\nThe solution is <b><i>F2 L2</i></b>. Use <b>Reset</b> to run the setup again.",
    allowFaceMoves: true,
    setup: (cube: CubeInterface) => {
      cube.reset();
      cube.applyMoves(["L2", "B2"]);
    },
    filter: (piece: CubeState) => {
      const { x, y, z } = piece.position;
      const isCenter = [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
      if (isCenter) return true;
      const set = getCubieColorSet(piece);
      return set.size === 2 && set.has(CUBE_COLORS.WHITE);
    },
  },
  {
    id: "two-edges-reposition-blue-front",
    title: "Two edges with reposition",
    description:
      "This case also focuses on putting <b>two edge pieces</b> in. The setup is <b><i>L2 D2 B2 D'</i></b>, and the solution you should follow on this slide is <b><i>D B2 D2 L2</i></b>.\n\nIf you're thinking in <b>blue-front</b> notation, that same solution is the equivalent of <b><i>U' F2 U2 L2</i></b>. Use <b>Reset</b> to run the setup again.",
    allowFaceMoves: true,
    setup: (cube: CubeInterface) => {
      cube.reset();
      cube.applyMoves(["L2", "D2", "B2", "D"]);
    },
    filter: (piece: CubeState) => {
      const { x, y, z } = piece.position;
      const isCenter = [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
      if (isCenter) return true;
      const set = getCubieColorSet(piece);
      return set.size === 2 && set.has(CUBE_COLORS.WHITE);
    },
  },
  {
    id: "solve-two-edges-together",
    title: "Solve two edges together",
    description:
      "In this case, the <b>blue</b> edge still needs what is effectively an <b><i>F2</i></b>, but there is also a <b>flipped orange edge</b> we can solve at the same time. Because we know from <b>BOGR</b> that <b>orange is to the left of blue</b>, we can use the blue edge insertion to help set up the orange edge as well.\n\nWith the cube held <b>blue front / yellow top</b>, the sequence is <b><i>F' U' F' L</i></b>. After the first <b>F'</b>, before the final <b>F'</b>, we place the flipped orange edge over the blue center. The last <b>F'</b> then lines that orange edge up so it is ready to insert with <b>L</b>. Take your time with this one and watch how each move improves both edges at once. Understanding cases like this is a big part of building an efficient white cross.",
    allowFaceMoves: true,
    setup: (cube: CubeInterface) => {
      cube.reset();
      cube.applyMoves(["L'", "B", "D", "B"]);
    },
    filter: (piece: CubeState) => {
      const { x, y, z } = piece.position;
      const isCenter = [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
      if (isCenter) return true;
      const set = getCubieColorSet(piece);
      return set.size === 2 && set.has(CUBE_COLORS.WHITE);
    },
  },
  {
    id: "solve-orange-and-blue-together",
    title: "Solve orange and blue together",
    description:
      "This is the same kind of idea as the previous slide, but the other way around: this time it is the <b>blue edge</b> that is flipped, and we solve it together with the <b>orange edge</b>. Because <b>blue is to the right of orange</b> in <b>BOGR</b>, we first move the orange edge to the right. Then we move the flipped blue edge over to where the orange edge was. From there, we put the orange edge down into place, then the blue edge into place.\n\nWith <b>orange front / yellow top</b>, the sequence is <b><i>F U F R'</i></b>. The important thing here is not to just follow the moves—take the time to see how each move repositions the pieces and why this order solves both edges efficiently. Understanding what is happening at each step is what will let you spot and solve these cases quickly in a real solve.",
    allowFaceMoves: true,
    setup: (cube: CubeInterface) => {
      cube.reset();
      cube.applyMoves(["B", "L'", "D'", "L'"]);
    },
    filter: (piece: CubeState) => {
      const { x, y, z } = piece.position;
      const isCenter = [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
      if (isCenter) return true;
      const set = getCubieColorSet(piece);
      return set.size === 2 && set.has(CUBE_COLORS.WHITE);
    },
  },
  {
    id: "solve-blue-and-red-together",
    title: "Solve blue and red together",
    description:
      "This is a similar idea to the previous slide, but now the <b>red/white edge</b> is the flipped piece we want to solve alongside the <b>blue/white edge</b>. Even though the red edge is not directly above where it belongs, we know from <b>BOGR</b> that <b>red belongs to the right of blue</b>.\n\nWith <b>blue front / yellow top</b>, the sequence is <b><i>F U' F R'</i></b>. First, <b>F</b> shifts the blue edge toward the right-hand side. Then <b>U'</b> places the flipped red edge above the spot where the blue edge was. The next <b>F</b> puts the blue edge into place, and the final <b>R'</b> inserts the red edge on the right. Work through this slowly and watch how both edges get improved together. Understanding cases like this is key to building a fast, efficient white cross.",
    allowFaceMoves: true,
    setup: (cube: CubeInterface) => {
      cube.reset();
      cube.applyMoves(["R", "B'", "D", "B'"]);
    },
    filter: (piece: CubeState) => {
      const { x, y, z } = piece.position;
      const isCenter = [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
      if (isCenter) return true;
      const set = getCubieColorSet(piece);
      return set.size === 2 && set.has(CUBE_COLORS.WHITE);
    },
  },
  {
    id: "solve-red-and-blue-together",
    title: "Solve red and blue together",
    description:
      "This is the same kind of pattern again, but now we're recognising the <b>red</b> and <b>blue</b> edge pieces. The <b>blue edge</b> belongs to the left of the red edge (from <b>BOGR</b>), and here it is the <b>red edge</b> that has white facing up while the <b>blue edge</b> is flipped. We hold the cube with <b>red front / yellow top</b> and align the red edge with the red center.\n\nThen: <b>F'</b> moves the red edge down to the left; <b>U2</b> brings the flipped blue edge over to where the red edge was; <b>F'</b> moves the red edge down into place; <b>L</b> moves the blue edge down into place. The exact moves matter less than understanding the pattern—we're using the correct edge's position to set up the flipped one, then inserting both in order. Once you see this pattern, you can apply it in other orientations.",
    allowFaceMoves: true,
    setup: (cube: CubeInterface) => {
      cube.reset();
      cube.applyMoves(["B'", "R", "D2", "R", "D"]);
    },
    filter: (piece: CubeState) => {
      const { x, y, z } = piece.position;
      const isCenter = [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
      if (isCenter) return true;
      const set = getCubieColorSet(piece);
      return set.size === 2 && set.has(CUBE_COLORS.WHITE);
    },
  },
  {
    id: "solve-green-and-orange-together",
    title: "Solve green and orange together",
    description:
      "Same pattern again, this time with the <b>green</b> and <b>orange</b> edge pieces. From <b>BOGR</b>, <b>orange is to the right of green</b>. Here the <b>green edge</b> has white facing up and the <b>orange edge</b> is flipped. We hold the cube <b>green front / yellow top</b> and use <b>U2</b> to align the orange edge with the orange center.\n\nThen: <b>F</b> moves the orange edge down to the right; <b>U2</b> brings the orange edge over to where the green edge was; <b>F</b> moves the green edge down into place; <b>R'</b> moves the orange edge down into place. Focus on what each move is achieving—positioning one edge so the other can be set up, then inserting both. Understanding the pattern matters more than memorising the moves.",
    allowFaceMoves: true,
    setup: (cube: CubeInterface) => {
      cube.reset();
      cube.applyMoves(["L", "F'", "D2", "F'", "D2"]);
    },
    filter: (piece: CubeState) => {
      const { x, y, z } = piece.position;
      const isCenter = [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
      if (isCenter) return true;
      const set = getCubieColorSet(piece);
      return set.size === 2 && set.has(CUBE_COLORS.WHITE);
    },
  },
  {
    id: "intermediate-white-cross-recap",
    title: "Quick recap: efficient white cross",
    description:
      "<b>Now let's recap what we've learned so far:</b>\n\nWe've learned how to solve the white cross more efficiently with the <b><i>white face down</i></b>. We can <b><i>insert flipped edges</i></b> directly from the top layer—without first moving them into the correct slot—using sequences for both the right and left side. And when we have one edge already in place and we know the <b><i>next edge in BOGR order</i></b> is flipped, we can <b><i>insert both together</i></b> by positioning them correctly and executing the right sequence.\n\nThe key here is to understand the mental model of how the pieces move and how to fix them. This will help you build a fast, efficient cross.\n\n<b><i>The mental model here:</i></b>\n• <b>White face down</b> — We work with the cube held so white is on the bottom and we insert edges from the top layer.\n• <b>Flipped edge (right)</b> — Use <b><i>U' R' F R</i></b> to insert a flipped edge from the right side.\n• <b>Flipped edge (left)</b> — Use <b><i>U L F' L'</i></b> to insert a flipped edge from the left side.\n• <b>Two edges together</b> — When one edge is correct and the next in BOGR is flipped, position both and use one sequence to insert them in order.\n\nIt's crucial to understand this mental model so you can spot these cases and solve the cross efficiently.\n\nIt's important to <b><i>practice</i></b> these steps until you're comfortable with them. If you're still not confident, feel free to go back to the previous slides and practice the individual cases until you're comfortable with them. Or if you're ready to move on, click <b><i>Next</i></b> to learn how we don't need to align each edge with its center one by one—we can solve the four edges in <b><i>BOGR order</i></b> first, then align them all to their centers in one go. That's the key to a fast cross.",
    allowFaceMoves: false,
    setup: (cube: CubeInterface) => {
      cube.reset();
    },
    filter: (piece: CubeState) => {
      const { x, y, z } = piece.position;
      const isCenter = [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
      if (isCenter) return true;
      const set = getCubieColorSet(piece);
      return set.size === 2 && set.has(CUBE_COLORS.WHITE);
    },
  },
  {
    id: "bogr-edges-focus",
    title: "Focus on BOGR: the edge order",
    description:
      "We're going to do something a bit different here. Don't focus on the <b><i>middle-layer centers</i></b> yet—they only matter when we align the cross to them for an efficient solve.\n\nThe only thing you need to be sure of is the <b><i>order of the four side colours</i></b> around the cube. As if you're looking from the <b><i>top</i></b> (yellow center), going <b><i>clockwise</i></b> they are: <b>B</b>lue, <b>O</b>range, <b>G</b>reen, <b>R</b>ed—or <b><i>BOGR</i></b> for short.\n\nIt's important to remember this order; with practice it will become natural. Take your time to really take this in—we'll need it for what comes next.",
    allowFaceMoves: false,
    setup: (cube: CubeInterface) => {
      cube.reset();
    },
    filter: (piece: CubeState) => {
      const { x, y, z } = piece.position;
      const isCenter = [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
      if (isCenter) return true;
      const set = getCubieColorSet(piece);
      return set.size === 2 && set.has(CUBE_COLORS.WHITE);
    },
  },
  {
    id: "bogr-insert-align-red-green",
    title: "Insert red & green, then align with BOGR",
    description:
      "Now we insert the <b>red</b> and <b>green</b> white edges into place using what we already know. From <b>BOGR</b>, <b>red is to the left of green</b>, so we can pair them and use the same kind of insertion as before: <b><i>F U F R'</i></b> with <b>red front / yellow top</b>.\n\nAfter that sequence, the side centers are no longer the focus—we're matching edges to <b>BOGR</b>, not to each center yet. Once the edges sit in the right order around the cube, a single <b><i>D</i></b> turn lines the cross up with the centers. You don't have to solve every edge under its centre as you go; you can place the four edges in <b>BOGR order</b> first, then align the whole cross in one step. That's the idea of an efficient white cross.",
    allowFaceMoves: true,
    setup: (cube: CubeInterface) => {
      cube.reset();
      cube.applyMoves(["U'", "R", "B'", "D'", "B'"]);
    },
    filter: (piece: CubeState) => {
      const { x, y, z } = piece.position;
      const isCenter = [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
      if (isCenter) return true;
      const set = getCubieColorSet(piece);
      return set.size === 2 && set.has(CUBE_COLORS.WHITE);
    },
  },
];

export { getIntermediateWhiteCrossSlides };
