import { useMemo } from "react";
import type { CubeState } from "@/types/cube";
import { isSecondLayerSolved as checkSecondLayerSolved } from "@/utils/tutorialHelpers";
import {
  isYellowCrossSolved,
  getYellowEdgeMatchStatus,
} from "@/utils/yellowEdgesHelpers";
import { getYellowCornerMatchStatus } from "@/utils/yellowCornersHelpers";
import { createYellowEdgePieceChildren } from "@components/tutorials/YellowEdgeIndicator";
import { createYellowCornerPieceChildren } from "@components/tutorials/YellowCornerIndicator";

interface UseYellowIndicatorsParams {
  lessonId: string;
  activeSlideId: string | undefined;
  cube3D: CubeState[][][];
  fixIndex?: number;
}

export const useYellowIndicators = ({
  lessonId,
  activeSlideId,
  cube3D,
  fixIndex = 0,
}: UseYellowIndicatorsParams) => {
  // Check if we should show yellow edge indicators on slide 2 and slide 3
  const shouldShowYellowEdgeIndicators = useMemo(() => {
    return (
      lessonId === "yellow-edges" &&
      (activeSlideId === "yellow-edges-solution" ||
        activeSlideId === "yellow-edges-solution-2" ||
        activeSlideId === "yellow-edges-solution-3" ||
        activeSlideId === "yellow-edges-solution-4") &&
      checkSecondLayerSolved(cube3D) &&
      isYellowCrossSolved(cube3D)
    );
  }, [lessonId, activeSlideId, cube3D]);

  // Get yellow edge match status
  const yellowEdgeMatchStatus = useMemo(() => {
    if (!shouldShowYellowEdgeIndicators) return new Map<string, boolean>();
    return getYellowEdgeMatchStatus(cube3D);
  }, [shouldShowYellowEdgeIndicators, cube3D]);

  // Check if all yellow edges match their centers
  const allYellowEdgesMatchCenters = useMemo(() => {
    if (!checkSecondLayerSolved(cube3D) || !isYellowCrossSolved(cube3D)) {
      return false;
    }
    const edgeMatchStatus = getYellowEdgeMatchStatus(cube3D);
    // Check if all edges match (all values in map are true)
    for (const matches of edgeMatchStatus.values()) {
      if (!matches) return false;
    }
    return edgeMatchStatus.size === 4; // Should have exactly 4 edges
  }, [cube3D]);

  // Check if we should show yellow corner indicators on slide 2
  const shouldShowYellowCornerIndicators = useMemo(() => {
    return (
      lessonId === "yellow-corners" &&
      (activeSlideId === "yellow-corners-solution" ||
        activeSlideId === "yellow-corners-solution-2" ||
        activeSlideId === "yellow-corners-solution-3") &&
      checkSecondLayerSolved(cube3D) &&
      allYellowEdgesMatchCenters
    );
  }, [lessonId, activeSlideId, cube3D, allYellowEdgesMatchCenters]);

  // Get yellow corner match status
  const yellowCornerMatchStatus = useMemo(() => {
    if (!shouldShowYellowCornerIndicators) return new Map<string, boolean>();
    return getYellowCornerMatchStatus(cube3D);
  }, [shouldShowYellowCornerIndicators, cube3D]);

  // Function to render piece children for yellow edge indicators
  const yellowEdgePieceChildren = useMemo(() => {
    if (!shouldShowYellowEdgeIndicators) return undefined;
    return createYellowEdgePieceChildren(
      yellowEdgeMatchStatus,
      activeSlideId,
      fixIndex
    );
  }, [
    shouldShowYellowEdgeIndicators,
    yellowEdgeMatchStatus,
    activeSlideId,
    fixIndex,
  ]);

  // Function to render piece children for yellow corner indicators
  const yellowCornerPieceChildren = useMemo(() => {
    if (!shouldShowYellowCornerIndicators) return undefined;
    return createYellowCornerPieceChildren(
      yellowCornerMatchStatus,
      activeSlideId
    );
  }, [
    shouldShowYellowCornerIndicators,
    yellowCornerMatchStatus,
    activeSlideId,
  ]);

  // Combined piece children function for both edge and corner indicators
  const combinedPieceChildren = useMemo(() => {
    const edgeChildren = yellowEdgePieceChildren;
    const cornerChildren = yellowCornerPieceChildren;

    if (!edgeChildren && !cornerChildren) return undefined;

    return (x: number, y: number, z: number, piece: CubeState) => {
      const edgeResult = edgeChildren?.(x, y, z, piece);
      const cornerResult = cornerChildren?.(x, y, z, piece);

      // If both return results, we need to combine them (shouldn't happen for edges/corners)
      // For now, prioritize corner if both exist (corners are more specific)
      return cornerResult || edgeResult || null;
    };
  }, [yellowEdgePieceChildren, yellowCornerPieceChildren]);

  return {
    shouldShowYellowEdgeIndicators,
    yellowEdgeMatchStatus,
    allYellowEdgesMatchCenters,
    shouldShowYellowCornerIndicators,
    yellowCornerMatchStatus,
    yellowEdgePieceChildren,
    yellowCornerPieceChildren,
    combinedPieceChildren,
  };
};
