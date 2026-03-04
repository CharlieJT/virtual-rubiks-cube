import { useRef } from "react";
import * as THREE from "three";
import type { TrackingStateRef } from "@/components/RubiksCube3D/types";

export type ExtendedTrackingState = TrackingStateRef & {
  dragTimestamps?: number[];
  dragPositions?: THREE.Vector2[];
  dragVelocity?: number;
};

const useDragState = (snapDuration: number) => {
  const trackingStateRef = useRef<ExtendedTrackingState>({
    isTracking: false,
    startPosition: new THREE.Vector2(),
    currentPosition: new THREE.Vector2(),
    cubiePosition: [0, 0, 0],
    clickedFace: "",
    uniquePieceId: "",
    isDragging: false,
    lockedMoveType: "",
    lockedDirection: "up",
    initialSwipeDirection: "up",
    dragGroup: null,
    affectedCubies: [],
    rotationAxis: new THREE.Vector3(),
    currentRotation: 0,
    hasStartedDrag: false,
    isSnapping: false,
    snapAnimationStartTime: 0,
    snapAnimationDuration: snapDuration,
    snapStartRotation: 0,
    snapTargetRotation: 0,
    finalMove: "",
    _axisLock: undefined,
    _initialDragDirection: undefined,
    _allowedMoves: [],
    _screenFaceRight: undefined,
    _screenFaceUp: undefined,
    _lockThresholdPx: 0,
    _baseMove: undefined,
    _expectedBaseSign: undefined,
    _dragSignParity: 1,
    _snapCompleted: false,
  });

  const tmpVec2A = useRef(new THREE.Vector2());
  const tmpVec2B = useRef(new THREE.Vector2());
  const lastPointerProcessTimeRef = useRef(0);

  return { trackingStateRef, tmpVec2A, tmpVec2B, lastPointerProcessTimeRef };
};

export default useDragState;
