import React from "react";
import type { CubeState } from "@/types/cube";
import CUBE_COLORS from "@/consts/cubeColours";
import { getCubieColorSet } from "@components/tutorials/utils/tutorialHelpers";
import { StickerIndicator } from "./StickerIndicator";

interface YellowCornerIndicatorProps {
  x: number;
  y: number;
  z: number;
  piece: CubeState;
  matches: boolean;
  activeSlideId?: string;
}

export const YellowCornerIndicator: React.FC<YellowCornerIndicatorProps> = ({
  matches,
  activeSlideId,
}) => {
  const tickRotationDeg =
    activeSlideId === "yellow-corners-solution-3"
      ? 90
      : activeSlideId === "yellow-corners-solution-2"
      ? 0
      : 270;

  return (
    <StickerIndicator matches={matches} tickRotationDeg={tickRotationDeg} />
  );
};

export const createYellowCornerPieceChildren = (
  yellowCornerMatchStatus: Map<string, boolean>,
  activeSlideId?: string
) => {
  return (x: number, y: number, z: number, piece: CubeState) => {
    if (y !== 0) return null;

    if (!((x === 0 || x === 2) && (z === 0 || z === 2))) return null;

    const set = getCubieColorSet(piece);
    if (set.size !== 3 || !set.has(CUBE_COLORS.YELLOW)) {
      return null;
    }

    const key = `${x},${y},${z}`;
    const matches = yellowCornerMatchStatus.get(key) ?? false;

    return (
      <YellowCornerIndicator
        matches={matches}
        x={x}
        y={y}
        z={z}
        piece={piece}
        activeSlideId={activeSlideId}
      />
    );
  };
};
