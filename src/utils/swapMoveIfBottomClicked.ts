import type { RefObject } from "react";
import type { TrackingStateRef } from "../components/RubiksCube3D_Simple";

const swapMoveIfBottomClicked = (
  finalMove: string,
  trackingStateRef: RefObject<TrackingStateRef>
) => {
  // With the new drag-sign parity logic, we no longer need to flip moves
  // for bottom-face interactions. Return the move unchanged.
  return finalMove;
};

export default swapMoveIfBottomClicked;
