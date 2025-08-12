import { useEffect, useRef, useCallback, useMemo } from "react";
import React from "react";
import { useThree } from "@react-three/fiber";
// Removed unused cubeScreenAxes import
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CubeState, CubeMove } from "../types/cube";
import { AnimationHelper, type AnimatedCubie } from "../utils/animationHelper";
import swapMoveIfBottomClicked from "../utils/swapMoveIfBottomClicked";
import { RoundedBoxGeometry } from "three-stdlib";

// Position-based move mapping - static mapping for each piece position + face + swipe direction
const POSITION_MOVE_MAPPING = {
  // Corner pieces - 8 corners × 3 visible faces each = 24 entries
  corner_RUF_right: { up: "F'", down: "F", left: "U", right: "U'" },
  corner_RUF_top: { up: "R", down: "R'", left: "F'", right: "F" },
  corner_RUF_front: { up: "R", down: "R'", left: "U", right: "U'" },

  corner_LUF_left: { up: "F", down: "F'", left: "U", right: "U'" },
  corner_LUF_top: { up: "L'", down: "L", left: "F'", right: "F" },
  corner_LUF_front: { up: "L'", down: "L", left: "U", right: "U'" },

  corner_RUB_right: { up: "B", down: "B'", left: "U", right: "U'" },
  corner_RUB_top: { up: "R", down: "R'", left: "B", right: "B'" },
  corner_RUB_back: { up: "R'", down: "R", left: "U", right: "U'" },

  corner_LUB_left: { up: "B'", down: "B", left: "U", right: "U'" },
  corner_LUB_top: { up: "L'", down: "L", left: "B", right: "B'" },
  corner_LUB_back: { up: "L", down: "L'", left: "U", right: "U'" },

  corner_RDF_right: { up: "F'", down: "F", left: "D'", right: "D" },
  corner_RDF_bottom: { up: "R", down: "R'", left: "F", right: "F'" },
  corner_RDF_front: { up: "R", down: "R'", left: "D'", right: "D" },

  corner_LDF_left: { up: "F", down: "F'", left: "D'", right: "D" },
  corner_LDF_bottom: { up: "L'", down: "L", left: "F", right: "F'" },
  corner_LDF_front: { up: "L'", down: "L", left: "D'", right: "D" },

  corner_RDB_right: { up: "B", down: "B'", left: "D'", right: "D" },
  corner_RDB_bottom: { up: "R", down: "R'", left: "B'", right: "B" },
  corner_RDB_back: { up: "R'", down: "R", left: "D'", right: "D" },

  corner_LDB_left: { up: "B'", down: "B", left: "D'", right: "D" },
  corner_LDB_bottom: { up: "L'", down: "L", left: "B'", right: "B" },
  corner_LDB_back: { up: "L", down: "L'", left: "D'", right: "D" },

  // Edge pieces - 12 edges × 2 visible faces each = 24 entries
  edge_MUF_top: { up: "M'", down: "M", left: "F'", right: "F" },
  edge_MUF_front: { up: "M'", down: "M", left: "U", right: "U'" },

  edge_MUB_top: { up: "M'", down: "M", left: "B", right: "B'" },
  edge_MUB_back: { up: "M", down: "M'", left: "U", right: "U'" },

  edge_REF_right: { up: "F'", down: "F", left: "E'", right: "E" },
  edge_REF_front: { up: "R", down: "R'", left: "E'", right: "E" },

  edge_REB_right: { up: "B", down: "B'", left: "E'", right: "E" },
  edge_REB_back: { up: "R'", down: "R", left: "E'", right: "E" },

  edge_LEF_left: { up: "F", down: "F'", left: "E'", right: "E" },
  edge_LEF_front: { up: "L'", down: "L", left: "E'", right: "E" },

  edge_LEB_left: { up: "B'", down: "B", left: "E'", right: "E" },
  edge_LEB_back: { up: "L", down: "L'", left: "E'", right: "E" },

  edge_MDF_bottom: { up: "M'", down: "M", left: "F", right: "F'" },
  edge_MDF_front: { up: "M'", down: "M", left: "D'", right: "D" },

  edge_RDS_right: { up: "S'", down: "S", left: "D'", right: "D" },
  edge_RDS_bottom: { up: "R", down: "R'", left: "S", right: "S'" },

  edge_MDB_bottom: { up: "M'", down: "M", left: "B'", right: "B" },
  edge_MDB_back: { up: "M", down: "M'", left: "D'", right: "D" },

  edge_LDS_left: { up: "S", down: "S'", left: "D'", right: "D" },
  edge_LDS_bottom: { up: "L'", down: "L", left: "S", right: "S'" },

  edge_LUS_top: { up: "L'", down: "L", left: "S'", right: "S" },
  edge_LUS_left: { up: "S", down: "S'", left: "U", right: "U'" },

  edge_RUS_top: { up: "R", down: "R'", left: "S'", right: "S" },
  edge_RUS_right: { up: "S'", down: "S", left: "U", right: "U'" },

  // Center pieces - 6 centers × 1 visible face each = 6 entries
  center_R_right: { up: "S'", down: "S", left: "E'", right: "E" },
  center_L_left: { up: "S", down: "S'", left: "E'", right: "E" },
  center_U_top: { up: "M'", down: "M", left: "S'", right: "S" },
  center_D_bottom: { up: "M'", down: "M", left: "S", right: "S'" },
  center_F_front: { up: "M'", down: "M", left: "E'", right: "E" },
  center_B_back: { up: "M", down: "M'", left: "E'", right: "E" },
} as const;

type PositionMoveKey = keyof typeof POSITION_MOVE_MAPPING;
type SwipeDirection = "up" | "down" | "left" | "right";

interface DragState {
  isActive: boolean;
  startPosition: THREE.Vector2;
  currentPosition: THREE.Vector2;
  cubiePosition: [number, number, number];
  clickedFace: string; // The actual face that was clicked (front, back, left, right, top, bottom)
  moveAxis: string; // The axis to rotate (x, y, z)
  moveDirection: number; // 1 or -1 for direction
  rotationAxis: THREE.Vector3;
  affectedCubies: AnimatedCubie[];
  dragGroup: THREE.Group | null;
  currentRotation: number;
  lockedMoveType: string; // The move type that was locked in (F, R, U, etc.)
  lockedIsPrime: boolean; // Whether the locked move is prime or not
  hasLockedDirection: boolean; // Whether direction has been locked
}

export interface TrackingStateRef {
  isTracking: boolean;
  startPosition: THREE.Vector2;
  currentPosition: THREE.Vector2;
  cubiePosition: [number, number, number];
  clickedFace: string;
  uniquePieceId: string;
  // Drag state
  isDragging: boolean;
  lockedMoveType: string;
  lockedDirection: SwipeDirection;
  initialSwipeDirection: SwipeDirection;
  dragGroup: THREE.Group | null;
  affectedCubies: AnimatedCubie[];
  rotationAxis: THREE.Vector3;
  currentRotation: number;
  hasStartedDrag: boolean;
  // Snapping animation state
  isSnapping: boolean;
  snapAnimationStartTime: number;
  snapAnimationDuration: number;
  snapStartRotation: number;
  snapTargetRotation: number;
  finalMove: CubeMove | "";
  _axisLock?: "vertical" | "horizontal";
  _initialDragDirection?: SwipeDirection;
  _allowedMoves?: string[];
  // Face-local axes in screen space, captured at pointer down
  _screenFaceRight?: THREE.Vector2;
  _screenFaceUp?: THREE.Vector2;
  _lockThresholdPx?: number;
  // Canonical base move and expected sign (from AnimationHelper) used to interpret rotation
  _baseMove?: string;
  _expectedBaseSign?: number;
  // Parity to fix sign per face/axis
  _dragSignParity?: number;
}

interface CubePieceProps {
  position: [number, number, number];
  colors: CubeState["colors"];
  onPointerDown?: (
    e: any,
    pos: [number, number, number],
    intersectionPoint: THREE.Vector3
  ) => void;
  onMeshReady?: (mesh: THREE.Mesh, x: number, y: number, z: number) => void;
  onPointerMove?: (e: any) => void;
}

interface RubiksCube3DProps {
  cubeState: CubeState[][][];
  pendingMove?: CubeMove | null;
  onMoveAnimationDone?: (move: CubeMove) => void;
  onStartAnimation?: () => void;
  isAnimating?: boolean;
  onOrbitControlsChange?: (enabled: boolean) => void;
  onDragMove?: (move: CubeMove) => void; // New prop for drag moves
}

const CubePiece = React.memo(
  ({
    position,
    colors,
    onPointerDown,
    onMeshReady,
    onPointerMove,
  }: CubePieceProps) => {
    const meshRef = useRef<THREE.Mesh>(null);

    useEffect(() => {
      if (meshRef.current && onMeshReady) {
        const [x, y, z] = position;
        const gridX = Math.round(x / 1.05 + 1);
        const gridY = Math.round(y / 1.05 + 1);
        const gridZ = Math.round(z / 1.05 + 1);

        onMeshReady(meshRef.current, gridX, gridY, gridZ);
      }
    }, [position, onMeshReady]);

    const materials = useMemo(() => {
      return [
        new THREE.MeshPhongMaterial({ color: colors.right }),
        new THREE.MeshPhongMaterial({ color: colors.left }),
        new THREE.MeshPhongMaterial({ color: colors.top }),
        new THREE.MeshPhongMaterial({ color: colors.bottom }),
        new THREE.MeshPhongMaterial({ color: colors.front }),
        new THREE.MeshPhongMaterial({ color: colors.back }),
      ];
    }, [
      colors.right,
      colors.left,
      colors.top,
      colors.bottom,
      colors.front,
      colors.back,
    ]);

    const EDGE_GEOMETRIES = [
      ...[0.5, -0.5].flatMap((y) =>
        [0.5, -0.5].map((z) => ({
          pos: [0, y, z],
          args: [1.08, 0.094, 0.094],
        }))
      ),
      ...[0.5, -0.5].flatMap((y) =>
        [0.5, -0.5].map((x) => ({
          pos: [x, y, 0],
          args: [0.094, 0.094, 1.08],
        }))
      ),
      ...[0.5, -0.5].flatMap((x) =>
        [0.5, -0.5].map((z) => ({
          pos: [x, 0, z],
          args: [0.094, 1.08, 0.094],
        }))
      ),
    ];

    return (
      <mesh
        ref={meshRef}
        position={position}
        material={materials}
        onPointerDown={(e) => {
          e.stopPropagation();
          const intersectionPoint = e.point || new THREE.Vector3();
          onPointerDown?.(e, position, intersectionPoint);
        }}
        onPointerMove={(e) => {
          e.stopPropagation();
          onPointerMove?.(e);
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
        }}
      >
        {/* Use RoundedBoxGeometry for rounded corners */}
        <primitive object={new RoundedBoxGeometry(1.11, 1.11, 1.11, 4, 0.13)} />

        {EDGE_GEOMETRIES.map((edge, i) => (
          <mesh key={i} position={edge.pos as [number, number, number]}>
            <boxGeometry args={edge.args as [number, number, number]} />
            <meshPhongMaterial color="#000000" />
          </mesh>
        ))}
      </mesh>
    );
  }
);

const RubiksCube3D = ({
  cubeState,
  pendingMove,
  onMoveAnimationDone,
  onStartAnimation,
  isAnimating,
  onOrbitControlsChange,
}: RubiksCube3DProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const cubiesRef = useRef<AnimatedCubie[]>([]);
  const currentTweenRef = useRef<any>(null);
  const meshesReadyRef = useRef(false);
  const lastHoveredPieceRef = useRef<string | null>(null);
  const dragStateRef = useRef<DragState>({
    isActive: false,
    startPosition: new THREE.Vector2(),
    currentPosition: new THREE.Vector2(),
    cubiePosition: [0, 0, 0],
    clickedFace: "",
    moveAxis: "",
    moveDirection: 1,
    rotationAxis: new THREE.Vector3(),
    affectedCubies: [],
    dragGroup: null,
    currentRotation: 0,
    lockedMoveType: "",
    lockedIsPrime: false,
    hasLockedDirection: false,
  });

  // Pending move animation effect
  useEffect(() => {
    if (
      pendingMove &&
      !AnimationHelper.isLocked() &&
      !isAnimating &&
      groupRef.current &&
      cubiesRef.current.length === 27 &&
      meshesReadyRef.current
    ) {
      onStartAnimation && onStartAnimation();

      currentTweenRef.current = AnimationHelper.animate(
        cubiesRef.current,
        groupRef.current,
        pendingMove,
        () => {
          // Update logical state first
          // The actual visual update will be synchronized in AnimationHelper
          onMoveAnimationDone && onMoveAnimationDone(pendingMove);
          currentTweenRef.current = null;
        }
      );
    }
  }, [pendingMove, onStartAnimation, onMoveAnimationDone, isAnimating]);

  const { camera, gl } = useThree();

  // Build a face-local basis (right/up) in cube local space
  const getFaceBasisLocal = useCallback((face: string) => {
    const normal =
      face === "front"
        ? new THREE.Vector3(0, 0, 1)
        : face === "back"
        ? new THREE.Vector3(0, 0, -1)
        : face === "right"
        ? new THREE.Vector3(1, 0, 0)
        : face === "left"
        ? new THREE.Vector3(-1, 0, 0)
        : face === "top"
        ? new THREE.Vector3(0, 1, 0)
        : new THREE.Vector3(0, -1, 0);

    const globalUp = new THREE.Vector3(0, 1, 0);
    let right = new THREE.Vector3().crossVectors(globalUp, normal);
    if (right.lengthSq() < 1e-6) {
      // normal nearly collinear with up, use forward as fallback
      const forward = new THREE.Vector3(0, 0, 1);
      right = new THREE.Vector3().crossVectors(forward, normal);
    }
    right.normalize();
    const up = new THREE.Vector3().crossVectors(normal, right).normalize();
    return { normal, right, up };
  }, []);

  // Project a local-space direction to a 2D screen-space vector
  const projectLocalDirToScreen = useCallback(
    (dirLocal: THREE.Vector3) => {
      if (!groupRef.current) return new THREE.Vector2(0, 0);
      const originWorld = groupRef.current.getWorldPosition(
        new THREE.Vector3()
      );
      const dirWorld = dirLocal
        .clone()
        .applyQuaternion(groupRef.current.quaternion);
      const endWorld = originWorld.clone().add(dirWorld);
      const originNdc = originWorld.clone().project(camera);
      const endNdc = endWorld.clone().project(camera);
      const ndcDelta = new THREE.Vector2(
        endNdc.x - originNdc.x,
        endNdc.y - originNdc.y
      );
      // Convert NDC to pixel space and invert Y to match browser coordinates
      const rect = gl.domElement.getBoundingClientRect();
      return new THREE.Vector2(
        ndcDelta.x * (rect.width / 2),
        -ndcDelta.y * (rect.height / 2)
      );
    },
    [camera, gl]
  );

  useFrame(() => {
    AnimationHelper.update();

    // Update drag rotation if active
    if (
      trackingStateRef.current.isDragging &&
      trackingStateRef.current.dragGroup
    ) {
      const dragState = trackingStateRef.current;
      const rotation = dragState.currentRotation;

      // Apply rotation to the drag group
      if (dragState.dragGroup) {
        dragState.dragGroup.setRotationFromAxisAngle(
          dragState.rotationAxis,
          rotation
        );
      }
    }

    // Update snapping animation if active
    if (
      trackingStateRef.current.isSnapping &&
      trackingStateRef.current.dragGroup
    ) {
      const dragState = trackingStateRef.current;
      const elapsed = Date.now() - dragState.snapAnimationStartTime;
      const progress = Math.min(elapsed / dragState.snapAnimationDuration, 1);

      // Quadratic easing out for smooth feel
      const easedProgress = 1 - Math.pow(1 - progress, 2);

      // Calculate current rotation based on progress
      const currentRotation =
        dragState.snapStartRotation +
        (dragState.snapTargetRotation - dragState.snapStartRotation) *
          easedProgress;

      // Update the current rotation
      dragState.currentRotation = currentRotation;

      // Apply rotation to the drag group
      if (dragState.dragGroup) {
        dragState.dragGroup.setRotationFromAxisAngle(
          dragState.rotationAxis,
          currentRotation
        );
      }

      // Animation complete - execute the final move
      if (progress >= 1) {
        if (dragState.finalMove && onMoveAnimationDone) {
          // Store the move to be executed
          const moveToExecute = dragState.finalMove as CubeMove;

          // First call onMoveAnimationDone to update the logical cube state (colors)
          onMoveAnimationDone(moveToExecute);

          // Then clean up visual state after the logical state has been updated
          // Add a small delay to ensure React has time to update materials with new colors
          setTimeout(() => {
            cleanupDragState();
            // Reset snapping state
            trackingStateRef.current.isSnapping = false;
          }, 0);
        } else {
          // No final move, just cleanup
          cleanupDragState();
          // Reset snapping state
          trackingStateRef.current.isSnapping = false;
        }
      }
    }
  });

  // All your sophisticated drag and hover logic goes here...
  const handlePreciseHover = useCallback(
    (e: any) => {
      if (!groupRef.current || dragStateRef.current.isActive) return;

      const mouse = new THREE.Vector2();
      const rect = e.nativeEvent.target.getBoundingClientRect();
      mouse.x = ((e.nativeEvent.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.nativeEvent.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      const camera = new THREE.PerspectiveCamera();
      raycaster.setFromCamera(mouse, camera);

      const allMeshes: THREE.Mesh[] = [];
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.parent === groupRef.current) {
          allMeshes.push(child);
        }
      });

      const intersects = raycaster.intersectObjects(allMeshes);
      if (intersects.length === 0) {
        lastHoveredPieceRef.current = null;
        return;
      }

      const intersectedMesh = intersects[0].object as THREE.Mesh;
      const intersectionPoint = intersects[0].point;

      // Find the corresponding cubie
      const cubie = cubiesRef.current.find((c) => c.mesh === intersectedMesh);
      if (!cubie) return;

      const cubieCenter = new THREE.Vector3(
        (cubie.x - 1) * 1.05,
        (cubie.y - 1) * 1.05,
        (cubie.z - 1) * 1.05
      );

      const halfSize = 0.475;
      const relative = intersectionPoint.clone().sub(cubieCenter);
      const withinBounds =
        Math.abs(relative.x) <= halfSize &&
        Math.abs(relative.y) <= halfSize &&
        Math.abs(relative.z) <= halfSize;

      if (!withinBounds) return;

      const absX = Math.abs(relative.x);
      const absY = Math.abs(relative.y);
      const absZ = Math.abs(relative.z);
      const faceThreshold = 0.4;

      let faceName = "";
      if (absX > faceThreshold && absX >= absY && absX >= absZ) {
        faceName = relative.x > 0 ? "right" : "left";
      } else if (absY > faceThreshold && absY >= absX && absY >= absZ) {
        faceName = relative.y > 0 ? "top" : "bottom";
      } else if (absZ > faceThreshold && absZ >= absX && absZ >= absY) {
        faceName = relative.z > 0 ? "front" : "back";
      }

      if (!faceName) return;

      const gridPos: [number, number, number] = [
        cubie.x - 1,
        cubie.y - 1,
        cubie.z - 1,
      ];

      const isOuterFace =
        (faceName === "right" && gridPos[0] === 1) ||
        (faceName === "left" && gridPos[0] === -1) ||
        (faceName === "top" && gridPos[1] === 1) ||
        (faceName === "bottom" && gridPos[1] === -1) ||
        (faceName === "front" && gridPos[2] === 1) ||
        (faceName === "back" && gridPos[2] === -1);

      if (!isOuterFace) return;

      const cubieState = cubeState[cubie.x]?.[cubie.y]?.[cubie.z];
      if (!cubieState) return;

      const faceColors = {
        right: cubieState.colors.right,
        left: cubieState.colors.left,
        top: cubieState.colors.top,
        bottom: cubieState.colors.bottom,
        front: cubieState.colors.front,
        back: cubieState.colors.back,
      };
      const faceColor = faceColors[faceName as keyof typeof faceColors];

      if (faceColor === "#808080" || faceColor === "#1a1a1a") return;

      const pieceId = `${gridPos[0]},${gridPos[1]},${gridPos[2]}|${faceName}`;

      if (lastHoveredPieceRef.current === pieceId) return;

      lastHoveredPieceRef.current = pieceId;

      // Don't need to use these anymore since we removed the console.log
      // const pieceType = getPieceType(gridPos);
      // const visibleColors = getVisibleColors(cubieState.colors, gridPos);
    },
    [cubeState]
  );

  const handleLeaveCube = useCallback(() => {
    lastHoveredPieceRef.current = null;
  }, []);

  // Detect which face of the cubie was clicked and determine move parameters
  const detectFaceAndMove = (
    position: [number, number, number],
    intersectionPoint: THREE.Vector3
  ) => {
    const [x, y, z] = position;
    const gridX = Math.round(x / 1.05 + 1);
    const gridY = Math.round(y / 1.05 + 1);
    const gridZ = Math.round(z / 1.05 + 1);

    // Convert world intersection point to local cube coordinates
    const localPoint = intersectionPoint
      .clone()
      .sub(new THREE.Vector3(x, y, z));

    // Determine which face was clicked based on the intersection point
    // Use a threshold to determine the most prominent coordinate
    const absX = Math.abs(localPoint.x);
    const absY = Math.abs(localPoint.y);
    const absZ = Math.abs(localPoint.z);

    let clickedFace = "front";

    // Determine the face based on the largest absolute coordinate
    if (absX > absY && absX > absZ) {
      // Left/Right face clicked
      clickedFace = localPoint.x > 0 ? "right" : "left";
    } else if (absY > absX && absY > absZ) {
      // Top/Bottom face clicked
      clickedFace = localPoint.y > 0 ? "top" : "bottom";
    } else {
      // Front/Back face clicked
      clickedFace = localPoint.z > 0 ? "front" : "back";
    }

    return { clickedFace, gridX, gridY, gridZ };
  };

  // Get affected cubies based on the face and move type - using AnimationHelper logic
  const getAffectedCubiesForMove = (moveType: string) => {
    return cubiesRef.current.filter((cubie) => {
      // Use the exact same logic as AnimationHelper.isCubieInMove
      switch (moveType) {
        case "F":
          return cubie.z === 2; // Front face
        case "B":
          return cubie.z === 0; // Back face
        case "R":
          return cubie.x === 2; // Right face
        case "L":
          return cubie.x === 0; // Left face
        case "U":
          return cubie.y === 2; // Top face
        case "D":
          return cubie.y === 0; // Bottom face
        case "M": // Middle slice (between L and R)
          return cubie.x === 1;
        case "E": // Equatorial slice (between U and D)
          return cubie.y === 1;
        case "S": // Standing slice (between F and B)
          return cubie.z === 1;
        default:
          return false;
      }
    });
  };

  // Enhanced position tracking with drag mechanics
  const trackingStateRef = useRef<
    TrackingStateRef & {
      dragTimestamps?: number[];
      dragPositions?: THREE.Vector2[];
      dragVelocity?: number;
    }
  >({
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
    // Snapping animation state
    isSnapping: false,
    snapAnimationStartTime: 0,
    snapAnimationDuration: 200, // Default 200ms for the animation
    snapStartRotation: 0,
    snapTargetRotation: 0,
    finalMove: "",
    _axisLock: undefined,
    _initialDragDirection: undefined,
    _allowedMoves: [],
    // Face-local axes in screen space, captured at pointer down
    _screenFaceRight: undefined,
    _screenFaceUp: undefined,
    _lockThresholdPx: 0,
    // Canonical base move and expected sign (from AnimationHelper) used to interpret rotation
    _baseMove: undefined,
    _expectedBaseSign: undefined,
    // Parity to fix sign per face/axis
    _dragSignParity: 1,
  });

  // Helper: base move to axis char
  const baseMoveToAxis = (baseMove: string): "x" | "y" | "z" => {
    const b = baseMove.toUpperCase();
    if (b === "R" || b === "L" || b === "M" || b === "X") return "x";
    if (b === "U" || b === "D" || b === "E" || b === "Y") return "y";
    return "z"; // F, B, S, Z
  };

  // Helper: determine drag sign parity by face and axis to align visual drag with move direction
  const getDragParity = (face: string, axis: "x" | "y" | "z"): number => {
    // Default: no parity flip
    let parity = 1;

    switch (face) {
      case "front":
        // Horizontal drags on the front face tend to feel reversed relative to rotation sign
        if (axis === "x") parity = -1;
        break;
      case "left":
        // Z-axis rotations initiated from the left face need inversion
        if (axis === "z") parity = -1;
        break;
      case "bottom":
        // Bottom face: vertical and horizontal gestures often read inverted
        if (axis === "y" || axis === "x") parity = -1;
        break;
      // Intentionally leave top/right/back with default parity to avoid regressions
      default:
        break;
    }

    return parity;
  };

  // Generate unique piece identifier based on grid position and face
  const generateUniquePieceId = (
    gridPos: [number, number, number],
    face: string
  ) => {
    const [x, y, z] = gridPos;

    // Create a unique identifier that represents the physical position on the cube
    // This will never change regardless of cube state/colors
    let pieceType = "";
    let positionId = "";

    // Determine piece type and position
    const numNonZero = [x, y, z].filter((coord) => coord !== 0).length;

    if (numNonZero === 3) {
      // Corner piece
      pieceType = "corner";
      positionId = `${x > 0 ? "R" : "L"}${y > 0 ? "U" : "D"}${
        z > 0 ? "F" : "B"
      }`;
    } else if (numNonZero === 2) {
      // Edge piece
      pieceType = "edge";
      if (x === 0) positionId = `M${y > 0 ? "U" : "D"}${z > 0 ? "F" : "B"}`;
      else if (y === 0)
        positionId = `${x > 0 ? "R" : "L"}E${z > 0 ? "F" : "B"}`;
      else if (z === 0)
        positionId = `${x > 0 ? "R" : "L"}${y > 0 ? "U" : "D"}S`;
    } else if (numNonZero === 1) {
      // Center piece
      pieceType = "center";
      if (x !== 0) positionId = x > 0 ? "R" : "L";
      else if (y !== 0) positionId = y > 0 ? "U" : "D";
      else if (z !== 0) positionId = z > 0 ? "F" : "B";
    }

    return `${pieceType}_${positionId}_${face}`;
  };

  const handlePointerDown = (
    e: any,
    pos: [number, number, number],
    intersectionPoint: THREE.Vector3
  ) => {
    if (AnimationHelper.isLocked() || !meshesReadyRef.current) {
      return;
    }

    e.stopPropagation();

    // Disable orbit controls immediately when clicking on a cube piece
    onOrbitControlsChange?.(false);

    // Detect which face was clicked
    const { clickedFace } = detectFaceAndMove(pos, intersectionPoint);

    // Convert position to grid coordinates
    const [x, y, z] = pos;
    const gridX = Math.round(x / 1.05 + 1);
    const gridY = Math.round(y / 1.05 + 1);
    const gridZ = Math.round(z / 1.05 + 1);
    const gridPos: [number, number, number] = [gridX - 1, gridY - 1, gridZ - 1];

    // Generate unique piece identifier
    const uniquePieceId = generateUniquePieceId(gridPos, clickedFace);

    const startPos = new THREE.Vector2(e.clientX, e.clientY);
    const now = Date.now();

    // Compute and cache face-local screen axes
    let screenFaceRight: THREE.Vector2 | undefined;
    let screenFaceUp: THREE.Vector2 | undefined;
    if (groupRef.current) {
      const { right, up } = getFaceBasisLocal(clickedFace);
      const right2D = projectLocalDirToScreen(right);
      const up2D = projectLocalDirToScreen(up);
      screenFaceRight =
        right2D.lengthSq() > 1e-6 ? right2D.clone().normalize() : undefined;
      screenFaceUp =
        up2D.lengthSq() > 1e-6 ? up2D.clone().normalize() : undefined;
    }

    trackingStateRef.current = {
      isTracking: true,
      startPosition: startPos,
      currentPosition: startPos.clone(),
      cubiePosition: pos,
      clickedFace,
      uniquePieceId,
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
      snapAnimationDuration: 200,
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

  // Helper function to clean up drag state
  const cleanupDragState = () => {
    // Clean up drag group if it exists
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

    // Reset animation state properties
    trackingStateRef.current.isSnapping = false;
    trackingStateRef.current.snapAnimationStartTime = 0;
    trackingStateRef.current.snapStartRotation = 0;
    trackingStateRef.current.snapTargetRotation = 0;

    // Re-enable orbit controls
    onOrbitControlsChange?.(true);
    AnimationHelper.unlock();
  };

  // Helper function to start drag animation
  const startDragAnimation = (
    suggestedMove: string,
    swipeDirection: SwipeDirection
  ) => {
    if (!groupRef.current || trackingStateRef.current.hasStartedDrag) return;

    // Determine canonical base move (strip prime/2)
    const baseMove = suggestedMove.replace(/['2]/g, "");
    trackingStateRef.current._baseMove = baseMove;

    // Use the base move’s axis and expected sign
    const [axis, totalRotation] = AnimationHelper.getMoveAxisAndDir(
      baseMove as CubeMove
    );
    trackingStateRef.current.rotationAxis = axis.clone();
    trackingStateRef.current._expectedBaseSign = Math.sign(totalRotation) || 1;

    // Determine parity from face/axis to align drag with expected visual direction
    const baseAxis = baseMoveToAxis(baseMove);
    trackingStateRef.current._dragSignParity = getDragParity(
      trackingStateRef.current.clickedFace,
      baseAxis
    );

    // Lock base move type (non-prime) – prime will be resolved by drag sign at release
    trackingStateRef.current.lockedMoveType = baseMove;
    trackingStateRef.current.lockedDirection = swipeDirection;
    trackingStateRef.current.initialSwipeDirection = swipeDirection;
    trackingStateRef.current.isDragging = true;
    trackingStateRef.current.hasStartedDrag = true;

    // Get affected cubies based on the base move type
    const affectedCubies = getAffectedCubiesForMove(baseMove);
    trackingStateRef.current.affectedCubies = affectedCubies;

    // Create a new group for dragging
    const dragGroup = new THREE.Group();

    // Add affected cubie meshes to the drag group
    affectedCubies.forEach((cubie) => {
      if (cubie.mesh.parent === groupRef.current) {
        const originalPosition = cubie.mesh.position.clone();
        groupRef.current!.remove(cubie.mesh);
        dragGroup.add(cubie.mesh);
        cubie.mesh.position.copy(originalPosition);
      }
    });

    // Add drag group to main group
    groupRef.current.add(dragGroup);
    trackingStateRef.current.dragGroup = dragGroup;

    // Lock animations during drag
    AnimationHelper.lock();
  };

  // Replace drag rotation to be based on signed projection along locked axis
  const updateDragRotation = (dragVector: THREE.Vector2) => {
    if (!trackingStateRef.current.isDragging) return;

    const sensitivity = 0.004;

    // Signed projection onto locked axis
    const axisLock = trackingStateRef.current._axisLock;
    const faceRight = trackingStateRef.current._screenFaceRight;
    const faceUp = trackingStateRef.current._screenFaceUp;

    let signedProjection = 0;
    if (axisLock === "horizontal" && faceRight) {
      signedProjection = dragVector.dot(faceRight);
    } else if (axisLock === "vertical" && faceUp) {
      signedProjection = dragVector.dot(faceUp);
    } else {
      // Fallback to dominant axis of drag
      signedProjection =
        Math.abs(dragVector.x) > Math.abs(dragVector.y)
          ? Math.sign(dragVector.x) * dragVector.length()
          : Math.sign(dragVector.y) * dragVector.length();
    }

    const parity = trackingStateRef.current._dragSignParity ?? 1;

    // Rotation is from drag projection with parity fix; axis sign stays fixed to base move
    trackingStateRef.current.currentRotation =
      sensitivity * signedProjection * parity;

    // Apply immediately to avoid one-frame delay waiting for useFrame
    const dg = trackingStateRef.current.dragGroup;
    if (dg) {
      dg.setRotationFromAxisAngle(
        trackingStateRef.current.rotationAxis,
        trackingStateRef.current.currentRotation
      );
    }
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!trackingStateRef.current.isTracking) return;

    const currentPos = new THREE.Vector2(e.clientX, e.clientY);
    trackingStateRef.current.currentPosition = currentPos;

    // Flick sampling
    if (
      trackingStateRef.current.dragTimestamps &&
      trackingStateRef.current.dragPositions
    ) {
      trackingStateRef.current.dragTimestamps.push(Date.now());
      trackingStateRef.current.dragPositions.push(currentPos.clone());
      if (trackingStateRef.current.dragTimestamps.length > 5) {
        trackingStateRef.current.dragTimestamps.shift();
        trackingStateRef.current.dragPositions.shift();
      }
    }

    const dragVector = currentPos
      .clone()
      .sub(trackingStateRef.current.startPosition);

    if (!trackingStateRef.current.hasStartedDrag) {
      // Use cached face axes; if missing, compute now
      let faceRight = trackingStateRef.current._screenFaceRight;
      let faceUp = trackingStateRef.current._screenFaceUp;
      if ((!faceRight || !faceUp) && groupRef.current) {
        const { right, up } = getFaceBasisLocal(
          trackingStateRef.current.clickedFace
        );
        faceRight = projectLocalDirToScreen(right).normalize();
        faceUp = projectLocalDirToScreen(up).normalize();
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

      // Start immediately when we have a mapping (no distance gating)
      if (!suggestedMove) {
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
      // Apply initial rotation immediately to avoid 1-frame delay
      updateDragRotation(dragVector);
      return;
    }

    // After lock, we no longer switch move types mid-drag; rotation sign determines prime vs non-prime
    updateDragRotation(dragVector);
  };

  const handlePointerUp = () => {
    // Always remove event listeners first
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
        const dt = (times[times.length - 1] - times[0]) / 800; // seconds (restore previous scaling)
        const dp = positions[times.length - 1].clone().sub(positions[0]);
        const velocity = dt > 0 ? dp.length() / dt : 0; // px/sec
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
      } else {
        onOrbitControlsChange?.(true);
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
        snapAnimationDuration: 100,
        snapStartRotation: 0,
        snapTargetRotation: 0,
        finalMove: "",
        dragTimestamps: [],
        dragPositions: [],
        dragVelocity: 0,
      };
    }
  };

  // Simplify finalize snapping: rely on accumulated rotation/sign
  const finalizeDragWithSnapping = () => {
    if (!trackingStateRef.current.isDragging || !groupRef.current) return;

    const baseMove =
      trackingStateRef.current._baseMove ||
      trackingStateRef.current.lockedMoveType.replace(/['2]/g, "");
    const expectedSign = trackingStateRef.current._expectedBaseSign || 1;

    // Wrap current rotation to [-π, π] to avoid long spins
    const twoPi = Math.PI * 2;
    const normalizeAngle = (a: number) => {
      const m = (((a + Math.PI) % twoPi) + twoPi) % twoPi; // [0, 2π)
      return m - Math.PI; // (-π, π]
    };

    let currentRotation = normalizeAngle(
      trackingStateRef.current.currentRotation
    );
    // Update stored rotation and group to the wrapped angle (visually identical)
    trackingStateRef.current.currentRotation = currentRotation;
    if (trackingStateRef.current.dragGroup) {
      trackingStateRef.current.dragGroup.setRotationFromAxisAngle(
        trackingStateRef.current.rotationAxis,
        currentRotation
      );
    }

    const snapIncrement = Math.PI / 2;

    // Base rounding to nearest step
    const stepsFloat = currentRotation / snapIncrement;
    const baseSteps = Math.round(stepsFloat); // -2..2

    // Distance-based control for 180°: require a long drag; flick can only add a single quarter step
    const velocity = trackingStateRef.current.dragVelocity || 0;
    const velocityThreshold = 100; // keep prior feel

    // Compute axis-projected drag distance in pixels
    const startPos = trackingStateRef.current.startPosition;
    const curPos = trackingStateRef.current.currentPosition;
    const dragVecPx = curPos.clone().sub(startPos);
    let axisProjPx = 0;
    const axisLock = trackingStateRef.current._axisLock;
    const faceRight = trackingStateRef.current._screenFaceRight;
    const faceUp = trackingStateRef.current._screenFaceUp;
    if (axisLock === "horizontal" && faceRight) {
      axisProjPx = dragVecPx.dot(faceRight);
    } else if (axisLock === "vertical" && faceUp) {
      axisProjPx = dragVecPx.dot(faceUp);
    } else {
      axisProjPx =
        Math.abs(dragVecPx.x) >= Math.abs(dragVecPx.y)
          ? Math.sign(dragVecPx.x) * dragVecPx.length()
          : Math.sign(dragVecPx.y) * dragVecPx.length();
    }
    const axisProjAbsPx = Math.abs(axisProjPx);

    // Only allow 180° if user dragged a long distance (or angle clearly near 180°)
    const TWO_TURN_STEPS_MIN = 1.5; // at least 135° in angle
    const TWO_TURN_PX_MIN = 180; // or ~180px along the locked axis
    const allowTwoTurn =
      Math.abs(stepsFloat) >= TWO_TURN_STEPS_MIN ||
      axisProjAbsPx >= TWO_TURN_PX_MIN;

    // Start from base rounding
    let targetSteps = baseSteps;
    let flickInfluenced = false;

    // Compute instantaneous axis-projected velocity near release (px/sec)
    let axisVelPxPerSec = 0;
    const times = trackingStateRef.current.dragTimestamps;
    const positions = trackingStateRef.current.dragPositions;
    if (times && positions && times.length >= 2) {
      const i2 = times.length - 1;
      // Find a sample ~40-70ms back to estimate instantaneous speed
      let j2 = i2 - 1;
      for (let k = i2 - 1; k >= 0; k--) {
        const dtMs = times[i2] - times[k];
        if (dtMs >= 40) {
          j2 = k;
          break;
        }
      }
      const dtMs = Math.max(1, times[i2] - times[j2]);
      const dp = positions[i2].clone().sub(positions[j2]);
      const axisDir =
        axisLock === "horizontal" && faceRight
          ? faceRight
          : axisLock === "vertical" && faceUp
          ? faceUp
          : undefined;
      const proj = axisDir
        ? dp.dot(axisDir)
        : Math.abs(dp.x) >= Math.abs(dp.y)
        ? Math.sign(dp.x) * dp.length()
        : Math.sign(dp.y) * dp.length();
      axisVelPxPerSec = (proj * 1000) / dtMs;
    }

    // Apply drag parity to flick direction so it matches drag orientation per face/axis
    let flickParity = trackingStateRef.current._dragSignParity ?? 1;
    const axisVelSigned = axisVelPxPerSec * flickParity;

    // Short, sharp flick: if base is 0, allow a single 90° purely from fast axis velocity, even with small distance
    const SINGLE_FLICK_VEL_MIN = 100; // easier to trigger a single move
    const SINGLE_FLICK_MIN_PX = 6; // avoid micro jitters
    if (
      targetSteps === 0 &&
      Math.abs(axisVelSigned) > SINGLE_FLICK_VEL_MIN &&
      axisProjAbsPx > SINGLE_FLICK_MIN_PX
    ) {
      targetSteps = Math.sign(axisVelSigned) || 1; // ±1
      flickInfluenced = true;
    }

    // If not already at a half turn, allow flick to add at most one quarter step (use axis velocity for direction)
    if (Math.abs(targetSteps) < 2 && Math.abs(velocity) > velocityThreshold) {
      const biasSign =
        Math.sign(axisVelSigned) || Math.sign(currentRotation) || 1;
      const newSteps = targetSteps + biasSign;
      // Never escalate to 180° purely from flick
      targetSteps = Math.abs(newSteps) > 1 ? Math.sign(newSteps) : newSteps;
      if (biasSign !== 0) flickInfluenced = true;
    }

    // If base rounding produced a 180° but drag wasn't long enough, demote to 90°
    if (Math.abs(targetSteps) === 2 && !allowTwoTurn) {
      targetSteps = Math.sign(targetSteps); // ±1
    }

    // If flick influenced and we are at a quarter turn, force sign to match axis flick direction
    if (flickInfluenced && Math.abs(targetSteps) === 1) {
      targetSteps = Math.sign(axisVelSigned) || 1;
    }

    // Clamp to valid range
    targetSteps = Math.max(-2, Math.min(2, targetSteps));

    const signedSteps = targetSteps; // -2,-1,0,1,2

    let finalMove = "";
    let targetAngle = 0;
    if (signedSteps === 0) {
      // No move, snap back
      trackingStateRef.current.isDragging = false;
      trackingStateRef.current.isSnapping = true;
      trackingStateRef.current.snapAnimationStartTime = Date.now();
      trackingStateRef.current.snapAnimationDuration = 150;
      trackingStateRef.current.snapStartRotation =
        trackingStateRef.current.currentRotation;
      trackingStateRef.current.snapTargetRotation = 0;
      trackingStateRef.current.finalMove = "";
      return;
    }

    if (Math.abs(signedSteps) === 2) {
      // Half turn
      finalMove = baseMove + "2";
      const baseTarget = Math.sign(currentRotation) * Math.PI || Math.PI;
      const k = Math.round((currentRotation - baseTarget) / twoPi);
      targetAngle = baseTarget + k * twoPi;
    } else {
      // Quarter turn
      const quarterSign = flickInfluenced
        ? Math.sign(axisVelSigned) || 1
        : Math.sign(signedSteps) || 1;
      finalMove = quarterSign === expectedSign ? baseMove : baseMove + "'";
      const baseTarget = signedSteps * snapIncrement; // -π/2 or +π/2
      const k = Math.round((currentRotation - baseTarget) / twoPi);
      targetAngle = baseTarget + k * twoPi;
    }

    finalMove = swapMoveIfBottomClicked(finalMove, trackingStateRef);

    trackingStateRef.current.isDragging = false;
    trackingStateRef.current.isSnapping = true;
    trackingStateRef.current.snapAnimationStartTime = Date.now();
    trackingStateRef.current.snapAnimationDuration = 200;
    trackingStateRef.current.snapStartRotation =
      trackingStateRef.current.currentRotation;
    trackingStateRef.current.snapTargetRotation = targetAngle;
    trackingStateRef.current.finalMove = finalMove as CubeMove;
  };

  return (
    <group
      ref={groupRef}
      onPointerLeave={handleLeaveCube}
      onPointerMove={handlePreciseHover}
    >
      {cubeState.map((plane, x) =>
        plane.map((row, y) =>
          row.map((cubie, z) => (
            <CubePiece
              key={`${x},${y},${z}`}
              position={[(x - 1) * 1.05, (y - 1) * 1.05, (z - 1) * 1.05]}
              colors={cubie.colors}
              onPointerDown={(e, pos, intersectionPoint) =>
                handlePointerDown(e, pos, intersectionPoint)
              }
              onMeshReady={(mesh, gridX, gridY, gridZ) => {
                // Register cubie mesh for animation
                if (!cubiesRef.current.some((c) => c.mesh === mesh)) {
                  cubiesRef.current.push({
                    mesh,
                    x: gridX,
                    y: gridY,
                    z: gridZ,
                    originalPosition: mesh.position.clone(),
                  });
                }
                // Mark meshes as ready when all are registered
                if (cubiesRef.current.length === 27) {
                  meshesReadyRef.current = true;
                }
              }}
              onPointerMove={undefined}
            />
          ))
        )
      )}
    </group>
  );
};

export default RubiksCube3D;
