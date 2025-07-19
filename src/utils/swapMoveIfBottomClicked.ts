import type { TrackingStateRef } from "../components/RubiksCube3D_Simple";

const swapMoveIfBottomClicked = (
  finalMove: string,
  trackingStateRef: React.RefObject<TrackingStateRef>
) => {
  const moveOpposites: Record<string, string> = {
    L: "L'",
    "L'": "L",
    R: "R'",
    "R'": "R",
    F: "F'",
    "F'": "F",
    B: "B'",
    "B'": "B",
    S: "S'",
    "S'": "S",
    M: "M'",
    "M'": "M",
  };

  if (trackingStateRef.current.clickedFace === "bottom") {
    return moveOpposites[finalMove] || finalMove;
  }

  return finalMove;
};

export default swapMoveIfBottomClicked;
