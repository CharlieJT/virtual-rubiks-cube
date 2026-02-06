import { useMemo } from "react";
import type { CubeState } from "@/types/cube";
import {
  createTutorialCubeState,
  getCubieColorSet,
} from "@components/tutorials/utils/tutorialHelpers";
import CUBE_COLORS from "@/consts/cubeColours";

interface UseTutorialCube3DParams {
  lessonId: string;
  cube3D: CubeState[][][];
  activeSlideFilter?: ((piece: CubeState) => boolean) | undefined;
}

export const useTutorialCube3D = ({
  lessonId,
  cube3D,
  activeSlideFilter,
}: UseTutorialCube3DParams) => {
  const tutorialCube3D = useMemo(() => {
    const base = createTutorialCubeState(lessonId, cube3D);
    const grey = "#808080";

    // Apply filter first if it exists
    let filtered = base;
    if (activeSlideFilter) {
      filtered = base.map((layer) =>
        layer.map((row) =>
          row.map((piece) => {
            const visible = activeSlideFilter(piece);
            if (visible) {
              return piece;
            }
            return {
              ...piece,
              colors: {
                front: grey,
                back: grey,
                left: grey,
                right: grey,
                top: grey,
                bottom: grey,
              },
            };
          })
        )
      );
    }

    // For yellow-cross lesson, grey out non-yellow colors on yellow edge pieces
    // This runs after filtering so we only process visible pieces
    if (lessonId === "yellow-cross") {
      return filtered.map((layer) =>
        layer.map((row) =>
          row.map((piece) => {
            const set = getCubieColorSet(piece);
            // Check if this is a yellow edge piece (2 colors, one is yellow)
            if (set.size === 2 && set.has(CUBE_COLORS.YELLOW)) {
              // This is a yellow edge piece - grey out the non-yellow color, keep yellow
              const newColors = { ...piece.colors };
              // Find which color is not yellow and grey it out
              const faceKeys: Array<keyof typeof piece.colors> = [
                "front",
                "back",
                "left",
                "right",
                "top",
                "bottom",
              ];
              for (const face of faceKeys) {
                const color = piece.colors[face];
                // Only grey out colors that are NOT yellow (preserve yellow)
                if (
                  color &&
                  color !== CUBE_COLORS.YELLOW &&
                  color !== grey &&
                  color !== CUBE_COLORS.BLACK
                ) {
                  newColors[face] = grey;
                }
              }
              return { ...piece, colors: newColors };
            }
            return piece;
          })
        )
      );
    }

    return filtered;
  }, [lessonId, cube3D, activeSlideFilter]);

  return tutorialCube3D;
};
