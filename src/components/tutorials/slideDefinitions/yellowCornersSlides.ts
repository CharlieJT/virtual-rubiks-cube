import type { CubeState } from "@/types/cube";
import { CubeJSWrapper } from "@utils/cubejsWrapper";
import type { Slide } from "./notationSlides";

export function getYellowCornersSlides(): Slide[] {
  return [
    {
      id: "intro",
      title: "Positioning yellow corner pieces",
      description:
        "This step is about getting all of the correct corner pieces into the right corners. The corners don't need to be oriented correctly at this stage - they just need to be in the right positions.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
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
      filter: (piece: CubeState) => {
        // Show all pieces - no filtering
        return true;
      },
    },
    {
      id: "yellow-corners-solution",
      title: "Positioning yellow corner pieces (1 correct)",
      description:
        "In this example, we have 1 corner piece that is correctly positioned. We need to get all 4 corner pieces into the correct positions. To solve this, make sure the correctly positioned corner piece is in its correct position. Don't twist the top U layer as that will mess the edges up - instead, physically turn the cube around to position the correct corner. Then perform the algorithm U R U' L' U R' U' L. After this, all corner pieces will be in their correct positions, though they may not be oriented correctly yet.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
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
      filter: (piece: CubeState) => {
        // Show all pieces - no filtering
        return true;
      },
    },
    {
      id: "yellow-corners-solution-2",
      title: "Positioning yellow corner pieces (0 correct)",
      description:
        "In this example, we have 0 corner pieces that are correctly positioned. We need to get all 4 corner pieces into the correct positions. To solve this, make sure you don't twist the top U layer as that will mess the edges up - instead, physically turn the cube around to position correctly. Then perform the algorithm U R U' L' U R' U' L. After this, you will find that the yellow/blue/red corner piece is in the correct corner. Put this one in the front right position and perform U R U' L' U R' U' L again. After this, all corner pieces will be in their correct positions, though they may not be oriented correctly yet.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
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
      filter: (piece: CubeState) => {
        // Show all pieces - no filtering
        return true;
      },
    },
    {
      id: "yellow-corners-solution-3",
      title: "Positioning yellow corner pieces (0 correct, repeated algorithm)",
      description:
        "In this example, we have 0 corner pieces that are correctly positioned. We need to get all 4 corner pieces into the correct positions. To solve this, perform the algorithm U R U' L' U R' U' L. You will find that 1 corner piece is now correctly positioned. Put this correctly positioned piece in the front-right-top position (by physically turning the cube, not twisting the top U layer), then perform U R U' L' U R' U' L again. If it's still not solved, repeat the algorithm one more time with the correctly positioned piece in the front-right position, and all pieces will be in their correct positions, though they may not be oriented correctly yet.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
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
      filter: (piece: CubeState) => {
        // Show all pieces - no filtering
        return true;
      },
    },
  ];
}
