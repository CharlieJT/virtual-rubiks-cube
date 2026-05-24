import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import type { CubeMove, SwipeDirection } from "@/types/cube";
import { AnimationHelper, type AnimatedCubie } from "@utils/animationHelper";
import {
  POSITION_MOVE_MAPPING,
  type PositionMoveKey,
} from "@/config/cube/positionMoveMapping";
import { LOCK_PRIMARY_PX, CUBIE_DISTANCE } from "../components/RubiksCube3D/geometry";
import useFaceDetection from "./drag/useFaceDetection";
import useDragState from "./drag/useDragState";
import useSnapLogic from "./drag/useSnapLogic";
import type { TrackingStateRef } from "@/components/RubiksCube3D/types";

const useDragLogic = (
  groupRef: React.RefObject<THREE.Group | null>,
  cubiesRef: React.RefObject<AnimatedCubie[]>,
  _commitMoveOnce: (move: CubeMove) => void,
  isTimerMode: boolean = false,
  preventSliceMoves: boolean = false,
  onDragLayerStart?: (baseMove: string, dragState: TrackingStateRef) => void,
) => {
  const { camera, gl } = useThree();

  const snapDuration = isTimerMode ? 60 : 120;
  const snapDurationSlow = isTimerMode ? 75 : 150;
  const snapDurationFast = isTimerMode ? 50 : 100;

  const { getFaceBasisLocal, projectLocalDirToScreen, baseMoveToAxis, getDragParity } =
    useFaceDetection(camera, gl, groupRef);

  const { trackingStateRef, tmpVec2A, tmpVec2B, lastPointerProcessTimeRef } =
    useDragState(snapDuration);

  const { updateDragRotation, finalizeDragWithSnapping } = useSnapLogic({
    trackingStateRef,
    groupRef,
    baseMoveToAxis,
    getDragParity,
    snapDuration,
    snapDurationSlow,
  });

  const generateUniquePieceId = (
    gridPos: [number, number, number],
    face: string
  ) => {
    const [x, y, z] = gridPos;

    let pieceType = "";
    let positionId = "";

    const numNonZero = [x, y, z].filter((coord) => coord !== 0).length;

    if (numNonZero === 3) {
      pieceType = "corner";
      positionId = `${x > 0 ? "R" : "L"}${y > 0 ? "U" : "D"}${
        z > 0 ? "F" : "B"
      }`;
    } else if (numNonZero === 2) {
      pieceType = "edge";
      if (x === 0) positionId = `M${y > 0 ? "U" : "D"}${z > 0 ? "F" : "B"}`;
      else if (y === 0)
        positionId = `${x > 0 ? "R" : "L"}E${z > 0 ? "F" : "B"}`;
      else if (z === 0)
        positionId = `${x > 0 ? "R" : "L"}${y > 0 ? "U" : "D"}S`;
    } else if (numNonZero === 1) {
      pieceType = "center";
      if (x !== 0) positionId = x > 0 ? "R" : "L";
      else if (y !== 0) positionId = y > 0 ? "U" : "D";
      else if (z !== 0) positionId = z > 0 ? "F" : "B";
    }

    return `${pieceType}_${positionId}_${face}`;
  };

  const getAffectedCubiesForMove = (moveType: string) => {
    return (
      cubiesRef.current?.filter((cubie) => {
        switch (moveType) {
          case "F":
            return cubie.z === 2;
          case "B":
            return cubie.z === 0;
          case "R":
            return cubie.x === 2;
          case "L":
            return cubie.x === 0;
          case "U":
            return cubie.y === 2;
          case "D":
            return cubie.y === 0;
          case "M":
            return cubie.x === 1;
          case "E":
            return cubie.y === 1;
          case "S":
            return cubie.z === 1;
          default:
            return false;
        }
      }) || []
    );
  };

  const cleanupDragState = () => {
    const dragGroup = trackingStateRef.current.dragGroup;
    if (dragGroup && groupRef.current) {
      const tempGroup = dragGroup;
      trackingStateRef.current.dragGroup = null;
      const meshesToMove: THREE.Mesh[] = [];
      tempGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          meshesToMove.push(child);
        }
      });

      meshesToMove.forEach((mesh) => {
        const cubie = trackingStateRef.current.affectedCubies.find(
          (c) => c.mesh === mesh
        );
        if (cubie) {
          tempGroup.remove(mesh);
          groupRef.current!.add(mesh);
          mesh.position.copy(cubie.originalPosition);
          mesh.rotation.set(0, 0, 0);
        }
      });

      groupRef.current.remove(tempGroup);
    }

    trackingStateRef.current.isSnapping = false;
    trackingStateRef.current.snapAnimationStartTime = 0;
    trackingStateRef.current.snapStartRotation = 0;
    trackingStateRef.current.snapTargetRotation = 0;

    AnimationHelper.unlock();
  };

  const startDragAnimation = (
    suggestedMove: string,
    swipeDirection: SwipeDirection
  ) => {
    if (!groupRef.current || trackingStateRef.current.hasStartedDrag) return;

    const baseMove = suggestedMove.replace(/['2]/g, "");
    trackingStateRef.current._baseMove = baseMove;

    const [axis, totalRotation] = AnimationHelper.getMoveAxisAndDir(
      baseMove as CubeMove
    );
    trackingStateRef.current.rotationAxis = axis.clone();
    trackingStateRef.current._expectedBaseSign = Math.sign(totalRotation) || 1;

    const baseAxis = baseMoveToAxis(baseMove);
    trackingStateRef.current._dragSignParity = getDragParity(
      trackingStateRef.current.clickedFace,
      baseAxis
    );

    trackingStateRef.current.lockedMoveType = baseMove;
    trackingStateRef.current.lockedDirection = swipeDirection;
    trackingStateRef.current.initialSwipeDirection = swipeDirection;
    trackingStateRef.current.isDragging = true;
    trackingStateRef.current.hasStartedDrag = true;

    const affectedCubies = getAffectedCubiesForMove(baseMove);
    trackingStateRef.current.affectedCubies = affectedCubies;

    const dragGroup = new THREE.Group();

    affectedCubies.forEach((cubie) => {
      if (cubie.mesh.parent === groupRef.current) {
        const originalPosition = cubie.mesh.position.clone();
        groupRef.current!.remove(cubie.mesh);
        dragGroup.add(cubie.mesh);
        cubie.mesh.position.copy(originalPosition);
      }
    });

    groupRef.current.add(dragGroup);
    trackingStateRef.current.dragGroup = dragGroup;

    onDragLayerStart?.(baseMove, trackingStateRef.current);

    AnimationHelper.lock();
  };

  const pointerFrameBudgetMs = 8; // ~125 Hz max for pre-drag axis lock

  const handlePointerMove = (e: PointerEvent) => {
    if (!trackingStateRef.current.isTracking) return;
    if (
      trackingStateRef.current._pointerId != null &&
      e.pointerId !== trackingStateRef.current._pointerId
    ) {
      return;
    }

    const currentPos = trackingStateRef.current.currentPosition;
    currentPos.set(e.clientX, e.clientY);

    const nowTs = performance.now();
    const isDragging = trackingStateRef.current.isDragging;
    if (
      !isDragging &&
      nowTs - lastPointerProcessTimeRef.current < pointerFrameBudgetMs
    ) {
      return;
    }
    lastPointerProcessTimeRef.current = nowTs;

    // Flick sampling
    if (
      trackingStateRef.current.dragTimestamps &&
      trackingStateRef.current.dragPositions &&
      trackingStateRef.current.isDragging
    ) {
      trackingStateRef.current.dragTimestamps.push(Date.now());
      const sample = tmpVec2A.current.set(currentPos.x, currentPos.y);
      trackingStateRef.current.dragPositions.push(sample.clone());
      if (trackingStateRef.current.dragTimestamps.length > 6) {
        trackingStateRef.current.dragTimestamps.shift();
        trackingStateRef.current.dragPositions.shift();
      }
    }

    const dragVector = tmpVec2B.current
      .set(currentPos.x, currentPos.y)
      .sub(trackingStateRef.current.startPosition);

    if (!isDragging && dragVector.lengthSq() < 4) {
      return;
    }

    // Keep face-aligned screen axes up-to-date to account for whole-cube spins mid-gesture
    if (groupRef.current) {
      const { right, up } = getFaceBasisLocal(
        trackingStateRef.current.clickedFace
      );
      const r2 = projectLocalDirToScreen(right).clone();
      const u2 = projectLocalDirToScreen(up).clone();
      if (r2.lengthSq() > 1e-6)
        trackingStateRef.current._screenFaceRight = r2.normalize();
      if (u2.lengthSq() > 1e-6)
        trackingStateRef.current._screenFaceUp = u2.normalize();
    }

    if (!trackingStateRef.current.hasStartedDrag) {
      let faceRight = trackingStateRef.current._screenFaceRight;
      let faceUp = trackingStateRef.current._screenFaceUp;
      if ((!faceRight || !faceUp) && groupRef.current) {
        const { right, up } = getFaceBasisLocal(
          trackingStateRef.current.clickedFace
        );
        faceRight = projectLocalDirToScreen(right).clone().normalize();
        faceUp = projectLocalDirToScreen(up).clone().normalize();
      }

      const rDot = faceRight ? dragVector.dot(faceRight) : dragVector.x;
      const uDot = faceUp ? dragVector.dot(faceUp) : dragVector.y;

      const axisLock =
        Math.abs(rDot) >= Math.abs(uDot) ? "horizontal" : "vertical";
      const moveDirection: SwipeDirection =
        axisLock === "horizontal"
          ? rDot >= 0
            ? "right"
            : "left"
          : uDot >= 0
          ? "up"
          : "down";

      const positionKey = trackingStateRef.current
        .uniquePieceId as PositionMoveKey;
      const suggestedMove = POSITION_MOVE_MAPPING[positionKey]?.[moveDirection];

      if (!suggestedMove) {
        return;
      }
      if (preventSliceMoves) {
        const base = suggestedMove.replace(/['2]/g, "").toUpperCase();
        if (base === "M" || base === "E" || base === "S") {
          return;
        }
      }
      const primaryProjPx = Math.abs(axisLock === "horizontal" ? rDot : uDot);
      if (primaryProjPx < LOCK_PRIMARY_PX) {
        return;
      }

      trackingStateRef.current._axisLock = axisLock;
      trackingStateRef.current.lockedDirection = moveDirection;
      trackingStateRef.current._initialDragDirection = moveDirection;
      trackingStateRef.current._allowedMoves = [
        suggestedMove,
        suggestedMove.endsWith("'")
          ? suggestedMove.replace("'", "")
          : suggestedMove + "'",
      ];
      startDragAnimation(suggestedMove, moveDirection);
      updateDragRotation(dragVector);
      return;
    }

    updateDragRotation(dragVector);
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (
      trackingStateRef.current._pointerId != null &&
      e.pointerId !== trackingStateRef.current._pointerId
    ) {
      return;
    }
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);

    if (!trackingStateRef.current.isTracking) {
      return;
    }

    // Flick gesture: calculate drag velocity on release
    if (
      trackingStateRef.current.dragTimestamps &&
      trackingStateRef.current.dragPositions
    ) {
      const times = trackingStateRef.current.dragTimestamps;
      const positions = trackingStateRef.current.dragPositions;
      if (times.length >= 2 && positions.length >= 2) {
        const dt = (times[times.length - 1] - times[0]) / 800;
        const dp = positions[times.length - 1].clone().sub(positions[0]);
        const velocity = dt > 0 ? dp.length() / dt : 0;
        trackingStateRef.current.dragVelocity = velocity;
      } else {
        trackingStateRef.current.dragVelocity = 0;
      }
    }

    if (trackingStateRef.current.isDragging) {
      finalizeDragWithSnapping();
    } else {
      if (trackingStateRef.current.dragGroup) {
        cleanupDragState();
      }
    }

    if (!trackingStateRef.current.isSnapping) {
      trackingStateRef.current = {
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
        snapAnimationDuration: snapDurationFast,
        snapStartRotation: 0,
        snapTargetRotation: 0,
        finalMove: "",
        dragTimestamps: [],
        dragPositions: [],
        dragVelocity: 0,
      };
    }
  };

  const detectFaceAndMove = (
    position: [number, number, number],
    intersectionPointWorld: THREE.Vector3
  ) => {
    const [x, y, z] = position;
    const gridX = Math.round(x / CUBIE_DISTANCE + 1);
    const gridY = Math.round(y / CUBIE_DISTANCE + 1);
    const gridZ = Math.round(z / CUBIE_DISTANCE + 1);

    let pointInCubeLocal = intersectionPointWorld.clone();
    if (groupRef.current) {
      pointInCubeLocal = groupRef.current.worldToLocal(pointInCubeLocal);
    }
    const localPoint = pointInCubeLocal.sub(new THREE.Vector3(x, y, z));

    const absX = Math.abs(localPoint.x);
    const absY = Math.abs(localPoint.y);
    const absZ = Math.abs(localPoint.z);

    let clickedFace = "front";
    if (absX > absY && absX > absZ) {
      clickedFace = localPoint.x > 0 ? "right" : "left";
    } else if (absY > absX && absY > absZ) {
      clickedFace = localPoint.y > 0 ? "top" : "bottom";
    } else {
      clickedFace = localPoint.z > 0 ? "front" : "back";
    }

    return { clickedFace, gridX, gridY, gridZ };
  };

  const processPointerDown = (
    e: React.PointerEvent,
    pos: [number, number, number],
    intersectionPoint: THREE.Vector3,
    onOrbitControlsChange?: (enabled: boolean) => void
  ) => {
    onOrbitControlsChange?.(false);

    const { clickedFace } = detectFaceAndMove(pos, intersectionPoint);

    const [x, y, z] = pos;
    const gridX = Math.round(x / CUBIE_DISTANCE + 1);
    const gridY = Math.round(y / CUBIE_DISTANCE + 1);
    const gridZ = Math.round(z / CUBIE_DISTANCE + 1);
    const gridPos: [number, number, number] = [gridX - 1, gridY - 1, gridZ - 1];

    const uniquePieceId = generateUniquePieceId(gridPos, clickedFace);

    const startPos = new THREE.Vector2(e.clientX, e.clientY);
    const now = Date.now();

    let screenFaceRight: THREE.Vector2 | undefined;
    let screenFaceUp: THREE.Vector2 | undefined;
    if (groupRef.current) {
      const { right, up } = getFaceBasisLocal(clickedFace);
      const right2D = projectLocalDirToScreen(right).clone();
      const up2D = projectLocalDirToScreen(up).clone();
      screenFaceRight =
        right2D.lengthSq() > 1e-6 ? right2D.normalize() : undefined;
      screenFaceUp =
        up2D.lengthSq() > 1e-6 ? up2D.normalize() : undefined;
    }

    trackingStateRef.current = {
      isTracking: true,
      startPosition: startPos,
      currentPosition: startPos.clone(),
      cubiePosition: pos,
      clickedFace,
      uniquePieceId,
      isDragging: false,
      _pointerId:
        (e && (e.pointerId ?? e?.nativeEvent?.pointerId)) || undefined,
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
      dragTimestamps: [now],
      dragPositions: [startPos.clone()],
      dragVelocity: 0,
      _axisLock: undefined,
      _initialDragDirection: undefined,
      _allowedMoves: [],
      _screenFaceRight: screenFaceRight,
      _screenFaceUp: screenFaceUp,
      _lockThresholdPx: 0,
      _dragSignParity: 1,
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  return {
    trackingStateRef,
    processPointerDown,
    cleanupDragState,
    updateDragRotation,
    finalizeDragWithSnapping,
    generateUniquePieceId,
    detectFaceAndMove,
    getFaceBasisLocal,
    projectLocalDirToScreen,
  };
};

export default useDragLogic;
