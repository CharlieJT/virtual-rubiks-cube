import type { CubeState } from "@/types/cube";
import { CubeJSWrapper } from "@utils/cubejsWrapper";
import { getCubieColorSet } from "@/utils/tutorialHelpers";
import type { Slide } from "./notationSlides";

export function getRubiksCubeIntroduction(): Slide[] {
  return [
    {
      id: "intro",
      title: "What is a Rubik's Cube?",
      description:
        "Before we start learning how to solve <b>The Rubik's Cube</b>, we first need to understand what a Rubik's Cube is, how it works, and what our goal is. It's crucial you understand the fundamental parts of the cube before getting started with learning how to solve it.\n\nA Rubik's Cube is a 3×3×3 puzzle made of smaller pieces that rotate around a fixed core. Your goal is to make each face a single color with all pieces in the correct position.\n\nDon't worry if it looks confusing at first—we'll solve it one small step at a time.\n\nThe example shown here is a solved cube. Drag the cube around with your mouse or finger to see what it looks like from different angles. You can click the <b>Reposition</b> button to start the cube back at its default position.",
      allowFaceMoves: true,
      allowSliceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
      },
      filter: (): boolean => true,
    },
    {
      id: "always-solvable",
      title: "How the cube works",
      description:
        "<b>A Rubik's Cube is always solvable:</b>\n\nThe cube is never impossible to solve unless you have physically damaged or tampered with the cube to make it unsolvable by flipping or twisting the pieces.\n\nIn these lessons, we will be making moves that are legal and will always be solvable. It is designed to be solvable with a series of moves and instructions.\n\n<b>Important facts:</b>\n• There are two states of the cube: <b>solved</b> and <b>unsolved (or scrambled)</b>\n• If a cube is <b>scrambled</b>, it means it's not in a <b>solved</b> state and can be solved with a series of moves and instructions\n• The cube always follows rules\n• If you follow the steps correctly, you will succeed!\n\n<b>This tutorial uses the Beginner's Method</b>\n\nThese specific lessons are designed especially for first-time solvers. You can drag or swipe on a piece on the cube to move it in the correct direction, or drag on the outer edge of the cube to rotate your view around it.\n\nYou can also rotate the cube by using the trackpad in the bottom right corner of the screen where it says <b>Drag here to spin</b> or pinching with two fingers on the cube and dragging your finger around. Try this out for yourself so that you can get comfortable with the cube before we start learning how to solve it. Treat it as a bit of freeplay for now.\n\nIf you want to reset the cube to be back in a solved state, click the <b>Reset</b> button. As soon as you're familiar with the cube, you can go to the next slide.",
      allowFaceMoves: true,
      allowSliceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
      },
      filter: (): boolean => true,
    },
    {
      id: "center-pieces",
      title: "Center pieces (The boss pieces)",
      description:
        "Now we'll learn about each piece type on the cube and how they work. We'll start with the <b>center pieces</b> of the cube. These are the pieces that are in the middle of each face and never move. No matter how many moves, flips, slices, or rotations you make, the center pieces will always stay in the same position relative to one another.\n\n<b>Center pieces:</b>\n• There are 6 of them\n• One in the middle of each face\n• They never move, no matter how many moves you make\n\n<b>This means:</b>\n• The center decides the face color\n• <b>White</b> is always opposite <b>Yellow</b>\n• <b>Red</b> is always opposite <b>Orange</b>\n• <b>Blue</b> is always opposite <b>Green</b>\n\n<b>You match pieces to the centers:</b>\n\nWe call these pieces the <b>Boss Pieces</b> because they are the ones that dictate the color of the face and the orientation of the other pieces, and not the other way around.\n\nTry to drag the cube around with your mouse or finger to see how they work. You can also drag on the outer edge of the cube to rotate your view around it. Notice how the center pieces will always stay in the same position relative to one another and their opposite centers will always be the same.",
      allowFaceMoves: true,
      allowSliceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
      },
      filter: (piece: CubeState): boolean => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        return isCenter;
      },
    },
    {
      id: "edge-pieces",
      title: "Edge pieces (2 colors)",
      description:
        "Now here's the second piece type on the cube. These are the <b>edge pieces</b>. These are the pieces that are on the edges of the cube and have two colors. These pieces are not fixed in place like the center pieces, meaning there is more movement and flexibility with them. They sit between two centers and two corners.\n\n<b>Edge pieces:</b>\n• Have 2 colors\n• There are 12 edge pieces, and these pieces are not fixed in place like the center pieces\n• They sit between two centers and two corners\n\n<b>Edges can:</b>\n• Move around the cube\n• Flip orientation\n• Never change their color combination\n\nTry to drag the cube around with your mouse or finger to see how they work. You can also drag on the outer edge of the cube to rotate your view around it. Notice how the edge pieces will move around the cube and flip orientation while mixing up the cube.",
      allowFaceMoves: true,
      allowSliceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
      },
      filter: (piece: CubeState): boolean => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        const set = getCubieColorSet(piece);
        return set.size === 2;
      },
    },
    {
      id: "corner-pieces",
      title: "Corner pieces (3 colors)",
      description:
        "Now here's the third type of piece on the cube. These are the <b>corner pieces</b>. These are the pieces that are at the corners of the cube and have three colors. These pieces are not fixed in place like the centers and can freely move around the cube like the edges. They sit between three edge pieces.\n\n<b>Corner pieces:</b>\n• Have 3 colors\n• There are 8 corners, and these pieces are not fixed in place like the center pieces\n• They sit between three edges\n\n<b>Corners can:</b>\n• Move around the cube\n• Twist in place\n• Move freely around the cube like the edge pieces\n\nTry to drag the cube around with your mouse or finger to see how they work. You can also drag on the outer edge of the cube to rotate your view around it. Notice how the corner pieces will move around the cube and twist in place while mixing up the cube.",
      allowFaceMoves: true,
      allowSliceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
      },
      filter: (piece: CubeState): boolean => {
        const { x, y, z } = piece.position;
        const isCenter =
          [x === 1, y === 1, z === 1].filter(Boolean).length === 2;
        if (isCenter) return true;
        const set = getCubieColorSet(piece);
        return set.size === 3;
      },
    },
    {
      id: "how-cube-moves",
      title: "How faces rotate",
      description:
        "The cube moves by turning faces, not individual pieces. This means that when you make a move, you are not moving a single piece, but rather a whole face of the cube.\n\n<b>Each move:</b>\n• Rotates a face 90°\n• Moves multiple pieces at once\n• Always follows the same rules\n\nUnderstanding this is the key to solving the cube successfully. It's important to know that each move is a whole face of the cube that rotates 90° clockwise or counter-clockwise depending on the move.\n\nTry this out by dragging over the cube and rotating one of the faces. Notice how multiple pieces move together.",
      allowFaceMoves: true,
      allowSliceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
      },
      filter: (): boolean => true,
    },
    {
      id: "beginners-method-overview",
      title: "How we'll solve the cube",
      description:
        "To learn how to solve the cube, we'll be breaking it down into 7 steps. These steps are designed to be easy to follow and understand, and they will be taught to you in a logical order so that you can learn how to solve the cube one step at a time.\n\n<b>The steps we'll be learning are:</b>\n1. <b>White Cross</b> — Form a white cross on the bottom face\n2. <b>White Corners</b> — Complete the white face by placing corner pieces\n3. <b>Second Layer</b> — Solve the middle layer edge pieces\n4. <b>Yellow Cross</b> — Form a yellow cross on the top face\n5. <b>Yellow Edges</b> — Position the yellow cross edges correctly\n6. <b>Yellow Corners (position)</b> — Position the yellow corner pieces\n7. <b>Yellow Corners (orientation)</b> — Complete the cube by orienting yellow corners\n\nWe don't solve the cube all at once.\n\n<b>Instead, we solve:</b>\n• The bottom layer\n• Then the middle layer\n• Then the top layer\n\n<b>Think of it like a sandwich:</b>\n• Bottom bread\n• Filling\n• Top bread\n\nWe'll be learning these steps one at a time and you'll be able to see how to solve the cube step by step in the next lessons. We don't solve the cube all at once—we solve it one layer at a time.",
      allowFaceMoves: false,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
      },
      filter: (): boolean => true,
    },
    {
      id: "recap",
      title: "Let's recap",
      description:
        "Let's recap everything we've learned so far about the cube and how it works. We've learned about the different types of pieces on the cube and how they work, how the cube moves, and how we'll solve the cube one step at a time with 7 different steps.\n\n<b>Centers:</b>\n• 1 color\n• Fixed relative to every other center piece\n\n<b>Edges:</b>\n• 2 colors\n• 12 total\n• Flexible and can move around the cube\n\n<b>Corners:</b>\n• 3 colors\n• 8 total\n• Flexible and can move around the cube\n\n<b>The 7 steps again:</b>\n1. <b>White Cross</b> — Form a white cross on the bottom face\n2. <b>White Corners</b> — Complete the white face by placing corner pieces\n3. <b>Second Layer</b> — Solve the middle layer edge pieces\n4. <b>Yellow Cross</b> — Form a yellow cross on the top face\n5. <b>Yellow Edges</b> — Position the yellow cross edges correctly\n6. <b>Yellow Corners (position)</b> — Position the yellow corner pieces\n7. <b>Yellow Corners (orientation)</b> — Complete the cube by orienting yellow corners\n\nFeel free to go back to previous slides to practice if you need to, but if you're feeling confident in your knowledge so far, you can finish the tutorial and move on to the next section to learn about <b>Notation and Moves</b>.",
      allowFaceMoves: true,
      allowSliceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
      },
      filter: (): boolean => true,
    },
  ];
}
