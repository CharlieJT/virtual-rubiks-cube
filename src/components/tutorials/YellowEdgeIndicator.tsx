import React from "react";
import type { CubeState } from "@/types/cube";
import CUBE_COLORS from "@/consts/cubeColours";
import { getCubieColorSet } from "@/utils/tutorialHelpers";
import { StickerIndicator } from "./StickerIndicator";

interface YellowEdgeIndicatorProps {
  x: number;
  y: number;
  z: number;
  piece: CubeState;
  matches: boolean;
  tickRotationDeg?: number;
}

export const YellowEdgeIndicator: React.FC<YellowEdgeIndicatorProps> = ({
  matches,
  tickRotationDeg = 270,
}) => {
  return (
    <StickerIndicator matches={matches} tickRotationDeg={tickRotationDeg} />
  );
};

export const createYellowEdgePieceChildren = (
  yellowEdgeMatchStatus: Map<string, boolean>,
  activeSlideId?: string,
  fixIndex: number = 0
) => {
  return (x: number, y: number, z: number, piece: CubeState) => {
    if (y !== 0) return null;
    const set = getCubieColorSet(piece);
    if (
      set.size !== 2 ||
      !set.has(CUBE_COLORS.YELLOW) ||
      piece.colors.bottom !== CUBE_COLORS.YELLOW
    ) {
      return null;
    }

    const key = `${x},${y},${z}`;
    const matches = yellowEdgeMatchStatus.get(key) ?? false;

    // Calculate tick rotation based on slide and sequence progress
    let tickRotationDeg = 270; // Default rotation
    if (activeSlideId === "yellow-edges-solution-2" && fixIndex >= 1) {
      // After sequence 1 (U move, fixIndex >= 1), rotate 90 degrees anti-clockwise
      tickRotationDeg = 270 - 90; // 180 degrees
    } else if (activeSlideId === "yellow-edges-solution-4" && fixIndex >= 7) {
      // After sequence 1 (first Sune, fixIndex >= 7), rotate 90 degrees clockwise
      tickRotationDeg = 270 + 90; // 360 degrees (or 0)
    } else if (activeSlideId === "yellow-edges-solution-3" && fixIndex >= 1) {
      // After sequence 1 (U2, fixIndex >= 1), rotate 90 degrees clockwise
      tickRotationDeg = 270 + 90; // 360 degrees (or 0)
    }

    return (
      <YellowEdgeIndicator
        matches={matches}
        x={x}
        y={y}
        z={z}
        piece={piece}
        tickRotationDeg={tickRotationDeg}
      />
    );
  };
};
