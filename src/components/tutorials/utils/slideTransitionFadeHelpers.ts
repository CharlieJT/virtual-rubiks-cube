import type { CubeState } from "@/types/cube";
import CUBE_COLORS from "@/consts/cubeColours";
import type { Slide } from "@components/tutorials/slideDefinitions";
import { getTutorialCubeStateForSlide } from "@components/tutorials/utils/tutorialHelpers";
import { CubeJSWrapper } from "@utils/cubejsWrapper";
import cubejsTo3D from "@utils/cubejsTo3D";

const FACE_KEYS = [
  "front",
  "back",
  "left",
  "right",
  "top",
  "bottom",
] as const;

const BOGR_EDGES_FOCUS_SKIP_GREY = new Set<string>([
  "1,1,0",
  "1,1,2",
  "0,1,1",
  "2,1,1",
  "1,2,2",
  "2,2,1",
  "1,2,0",
  "0,2,1",
]);

export const buildStickerGreyMap = (
  prevCube: CubeState[][][],
  baseline: CubeState[][][],
  skipGreyPositions?: Set<string> | null,
): Map<string, boolean> => {
  const greyMap = new Map<string, boolean>();
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      for (let z = 0; z < 3; z++) {
        const posKey = `${x},${y},${z}`;
        if (skipGreyPositions?.has(posKey)) continue;
        const prevPiece = prevCube[x]?.[y]?.[z];
        const basePiece = baseline[x]?.[y]?.[z];
        if (prevPiece && basePiece) {
          for (const face of FACE_KEYS) {
            const previousColor = prevPiece.colors[face] || CUBE_COLORS.BLACK;
            const baselineColor = basePiece.colors[face] || CUBE_COLORS.BLACK;
            const key = `${x},${y},${z},${face}`;
            const differs =
              previousColor !== CUBE_COLORS.BLACK &&
              previousColor !== baselineColor;
            if (differs) greyMap.set(key, true);
          }
        }
      }
    }
  }
  return greyMap;
};

export const buildSlideTransitionFadeBuffers = (
  prevCube: CubeState[][][],
  nextSlide: Slide | undefined,
  lessonId: string,
): { baseline: CubeState[][][]; greyMap: Map<string, boolean> } => {
  const tempCube = new CubeJSWrapper();
  tempCube.reset();
  if (nextSlide?.setup) {
    nextSlide.setup(tempCube);
  }
  const baselineCubeState = cubejsTo3D(tempCube.getCube());
  const baseline = getTutorialCubeStateForSlide(
    lessonId,
    nextSlide,
    baselineCubeState,
  );
  const skipGreyPositions =
    nextSlide?.id === "bogr-edges-focus" ? BOGR_EDGES_FOCUS_SKIP_GREY : null;
  const greyMap = buildStickerGreyMap(prevCube, baseline, skipGreyPositions);
  return { baseline, greyMap };
};
