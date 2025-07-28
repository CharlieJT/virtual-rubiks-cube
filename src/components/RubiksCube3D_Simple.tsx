import { useEffect, useRef, useCallback, useMemo } from "react";
import React from "react";
import { useThree } from "@react-three/fiber";
import { cubeScreenAxes } from "../utils/cubeScreenAxes";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CubeState, CubeMove } from "../types/cube";
import { AnimationHelper, type AnimatedCubie } from "../utils/animationHelper";
import swapMoveIfBottomClicked from "../utils/swapMoveIfBottomClicked";
import { RoundedBoxGeometry } from "three-stdlib";
// Removed unused imports

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
  const trackingStateRef = useRef<TrackingStateRef>({
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
  });

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
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  // Helper function to clean up drag state
  const cleanupDragState = () => {
    // Clean up drag group if it exists
    const dragGroup = trackingStateRef.current.dragGroup;
    if (dragGroup && groupRef.current) {
      // Ensure we keep a reference to the drag group during cleanup
      // so that the cube doesn't appear to "jump"
      const tempGroup = dragGroup;
      trackingStateRef.current.dragGroup = null;
      // Get all meshes from drag group
      const meshesToMove: THREE.Mesh[] = [];
      tempGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          meshesToMove.push(child);
        }
      });

      // Move meshes back to main group at their original positions
      // This is now performed in a single synchronized operation
      meshesToMove.forEach((mesh) => {
        // Find the corresponding cubie to get original position
        const cubie = trackingStateRef.current.affectedCubies.find(
          (c) => c.mesh === mesh
        );
        if (cubie) {
          // Remove from drag group
          tempGroup.remove(mesh);

          // Add back to main group at original position
          groupRef.current!.add(mesh);
          mesh.position.copy(cubie.originalPosition);

          // Reset any rotation on the mesh
          mesh.rotation.set(0, 0, 0);
        }
      });

      // Remove empty drag group
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

    // For U move from the back face, always swap U/U'
    let moveToLock = suggestedMove;
    if (
      trackingStateRef.current.clickedFace === "left" &&
      groupRef.current &&
      camera &&
      gl
    ) {
      // Use cubeScreenAxes to get left axis in screen space
      const axes = cubeScreenAxes(groupRef.current, camera);
      // The left axis is axes.x (screen space)
      // Camera direction in world space
      const camDir = new THREE.Vector3();
      camera.getWorldDirection(camDir);
      // Get left axis in world space
      const leftWorld = new THREE.Vector3(-1, 0, 0).applyQuaternion(
        groupRef.current.quaternion
      );
      const dot = leftWorld.dot(camDir);
      // Also check screenVec magnitude
      const screenVec = axes.x;
      const screenMag = Math.sqrt(
        screenVec.x * screenVec.x + screenVec.y * screenVec.y
      );

      // Head-on if dot < -0.7, screenMag < 0.13, and screenVec.y < 0
      if (dot < -0.7 && screenMag < 0.13 && screenVec.y < 0) {
        if (suggestedMove === "U") moveToLock = "U'";
        else if (suggestedMove === "U'") moveToLock = "U";
      }
    }
    trackingStateRef.current.lockedMoveType = moveToLock;
    trackingStateRef.current.lockedDirection = swipeDirection;
    trackingStateRef.current.initialSwipeDirection = swipeDirection;
    trackingStateRef.current.isDragging = true;
    trackingStateRef.current.hasStartedDrag = true;

    // Get affected cubies based on the move type
    const moveType = suggestedMove.replace(/['2]/g, ""); // Remove prime and 2 modifiers
    const affectedCubies = getAffectedCubiesForMove(moveType);
    trackingStateRef.current.affectedCubies = affectedCubies;

    // Get the rotation axis from AnimationHelper
    const [axis] = AnimationHelper.getMoveAxisAndDir(suggestedMove as CubeMove);
    trackingStateRef.current.rotationAxis = axis.clone();

    // Create a new group for dragging
    const dragGroup = new THREE.Group();

    // Add affected cubie meshes to the drag group
    affectedCubies.forEach((cubie) => {
      if (cubie.mesh.parent === groupRef.current) {
        // Store original position before moving to drag group
        const originalPosition = cubie.mesh.position.clone();

        // Remove from main group and add to drag group
        groupRef.current!.remove(cubie.mesh);
        dragGroup.add(cubie.mesh);

        // Reset position relative to drag group
        cubie.mesh.position.copy(originalPosition);
      }
    });

    // Add drag group to main group
    groupRef.current.add(dragGroup);
    trackingStateRef.current.dragGroup = dragGroup;

    // Lock animations during drag (orbit controls already disabled in handlePointerDown)
    AnimationHelper.lock();
  };

  const updateDragRotation = (dragVector: THREE.Vector2) => {
    if (!trackingStateRef.current.isDragging) return;

    const sensitivity = 0.006;
    const lockedDirection = trackingStateRef.current.lockedDirection;
    const suggestedMove = trackingStateRef.current.lockedMoveType;
    const initialDir = trackingStateRef.current._initialDragDirection;

    // Calculate rotation amount based on drag direction
    let rotationAmount = 0;
    if (initialDir === "left" || initialDir === "right") {
      rotationAmount = dragVector.x * sensitivity;
    } else {
      rotationAmount = dragVector.y * sensitivity;
    }

    const group = groupRef.current;
    if (group) {
      const faceNormal = new THREE.Vector3(0, 0, 1);
      const worldPos = group?.getWorldPosition(new THREE.Vector3());
      const normalWorld = faceNormal.clone().applyQuaternion(group.quaternion);
      const faceWorld = worldPos.clone().add(normalWorld);
      const ndcWorld = faceWorld.clone().project(camera);
      const ndcOrigin = worldPos.clone().project(camera);
      const screenVec = new THREE.Vector2(
        ndcWorld.x - ndcOrigin.x,
        ndcWorld.y - ndcOrigin.y
      );

      const checkedDirection = ["left", "right", "back"];

      // Log if camera is above or below the cube
      const cameraPos = camera.position;
      const isBelow = cameraPos.y < worldPos.y;
      const clickedFace = trackingStateRef.current.clickedFace;

      // Assuming you have access to camera and groupRef.current (the cube group)
      const cubeWorldPos = group.getWorldPosition(new THREE.Vector3());

      // Vector from cube center to camera
      const viewVector = cameraPos.clone().sub(cubeWorldPos).normalize();

      // Determine which axis the camera is closest to
      const axes = [
        { name: "front", vec: new THREE.Vector3(0, 0, 1) },
        { name: "back", vec: new THREE.Vector3(0, 0, -1) },
        { name: "right", vec: new THREE.Vector3(1, 0, 0) },
        { name: "left", vec: new THREE.Vector3(-1, 0, 0) },
      ];

      let maxDot = -Infinity;
      let cameraFacing = "";
      axes.forEach(({ name, vec }) => {
        const dot = viewVector.dot(vec);
        if (dot > maxDot) {
          maxDot = dot;
          cameraFacing = name;
        }
      });

      const swipeDir = trackingStateRef.current.initialSwipeDirection;

      const isUDEMove = ["U", "U'", "D", "D'", "E", "E'"].includes(
        suggestedMove
      );
      const isCheckedFace = checkedDirection.includes(clickedFace);
      const isRelevantUDMove = isUDEMove && isCheckedFace;

      const isTop = clickedFace === "top";
      const isBottom = clickedFace === "bottom";
      const isLeftOrRightSwipe = swipeDir === "left" || swipeDir === "right";
      const isUpOrDownSwipe = swipeDir === "up" || swipeDir === "down";

      if (isRelevantUDMove && groupRef.current && camera) {
        if (screenVec.y > 0 !== isBelow) {
          rotationAmount = -rotationAmount;
        }
      } else if (
        (isTop &&
          ((cameraFacing === "left" &&
            ((screenVec.y < 0 && isLeftOrRightSwipe) || screenVec.y >= 0)) ||
            (cameraFacing === "back" && isUpOrDownSwipe) ||
            (cameraFacing === "right" &&
              screenVec.y < 0 &&
              isUpOrDownSwipe))) ||
        (isBottom &&
          ((cameraFacing === "right" &&
            (screenVec.y < 0 || (screenVec.y >= 0 && isLeftOrRightSwipe))) ||
            (cameraFacing === "back" && isUpOrDownSwipe) ||
            (cameraFacing === "left" && screenVec.y > 0 && isUpOrDownSwipe)))
      ) {
        rotationAmount = -rotationAmount;
      }
    }

    // Get the actual rotation direction from AnimationHelper
    const [_, totalRotation] = AnimationHelper.getMoveAxisAndDir(
      suggestedMove as CubeMove
    );
    const expectedDirection = Math.sign(totalRotation);

    // Get base move type (without prime/2 modifiers)
    const baseMove = suggestedMove.replace(/['2]/g, "");

    // Adjust rotation to match the expected direction
    let adjustedRotation = rotationAmount;

    // For horizontal swipes (left/right)
    if (lockedDirection === "left" || lockedDirection === "right") {
      // For left swipes, keep the rotation as is
      // For right swipes, invert the rotation
      if (lockedDirection === "right") {
        adjustedRotation = -rotationAmount;
      }
      // Apply expected direction
      adjustedRotation *= expectedDirection;
    }
    // For vertical swipes (up/down)
    else {
      // For up swipes, invert the rotation (since screen Y is inverted)
      // For down swipes, keep the rotation as is
      if (lockedDirection === "up") {
        adjustedRotation = -rotationAmount;
      }
      // For F moves, don't apply expectedDirection directly for vertical swipes
      // as it conflicts with the natural drag direction
      if (baseMove === "F") {
        // For F moves, down swipe should be positive, up swipe should be negative
        // But for F' moves, we need to apply expectedDirection since the logic is different
        if (suggestedMove.includes("'")) {
          // F' moves - apply expected direction
          adjustedRotation *= expectedDirection;
        }
        // Regular F moves - don't multiply by expectedDirection
      } else {
        // Apply expected direction for other moves
        adjustedRotation *= expectedDirection;
      }
    }

    // Special correction for specific moves that are rotating in the wrong direction
    // Fix for U move when dragging from the back face
    if (
      (baseMove === "U" && trackingStateRef.current.clickedFace === "back") ||
      (baseMove === "U" &&
        (lockedDirection === "left" || lockedDirection === "right")) ||
      (baseMove === "B" &&
        (lockedDirection === "left" || lockedDirection === "right")) ||
      (baseMove === "D" &&
        (lockedDirection === "left" || lockedDirection === "right")) ||
      (baseMove === "E" &&
        (lockedDirection === "left" || lockedDirection === "right")) ||
      // For S moves, only invert for top/bottom/front/back, not for side faces
      (baseMove === "S" &&
        !(
          trackingStateRef.current.clickedFace === "left" ||
          trackingStateRef.current.clickedFace === "right"
        )) ||
      (baseMove === "F" &&
        !suggestedMove.includes("'") &&
        (lockedDirection === "left" ||
          lockedDirection === "right" ||
          lockedDirection === "up" ||
          lockedDirection === "down")) ||
      (baseMove === "F" &&
        suggestedMove.includes("'") &&
        (lockedDirection === "left" || lockedDirection === "right")) ||
      ((baseMove === "D" || baseMove === "E") &&
        (lockedDirection === "up" || lockedDirection === "down"))
    ) {
      adjustedRotation = -adjustedRotation;
    }

    // Don't clamp rotation - allow unlimited rotation for multiple turns
    trackingStateRef.current.currentRotation = adjustedRotation;
  };

  // Helper function to finalize drag with smooth snapping transition
  const finalizeDragWithSnapping = () => {
    if (!trackingStateRef.current.isDragging || !groupRef.current) {
      return;
    }

    // Calculate final snap position based on drag amount
    let currentRotation = trackingStateRef.current.currentRotation;
    const baseMove = trackingStateRef.current.lockedMoveType.replace(
      /['2]/g,
      ""
    );

    // Reverse the visual correction for specific moves when calculating the final move
    // This ensures the logical move matches the intended direction
    const lockedDirection = trackingStateRef.current.lockedDirection;
    const suggestedMove = trackingStateRef.current.lockedMoveType;
    if (
      (baseMove === "U" &&
        (lockedDirection === "left" || lockedDirection === "right")) ||
      (baseMove === "B" &&
        (lockedDirection === "left" || lockedDirection === "right")) ||
      (baseMove === "D" &&
        (lockedDirection === "left" || lockedDirection === "right")) ||
      (baseMove === "E" &&
        (lockedDirection === "left" || lockedDirection === "right")) ||
      // For S moves, always invert in finalize
      baseMove === "S" ||
      // M moves need inversion from front/back
      (baseMove === "M" &&
        (trackingStateRef.current.clickedFace === "front" ||
          trackingStateRef.current.clickedFace === "back")) ||
      (baseMove === "F" &&
        !suggestedMove.includes("'") &&
        (lockedDirection === "left" ||
          lockedDirection === "right" ||
          lockedDirection === "up" ||
          lockedDirection === "down")) ||
      (baseMove === "F" &&
        suggestedMove.includes("'") &&
        (lockedDirection === "left" || lockedDirection === "right")) ||
      // Add reverse correction for D, E, S moves from top/bottom (excluding U)
      ((baseMove === "D" || baseMove === "E" || baseMove === "S") &&
        (lockedDirection === "up" || lockedDirection === "down"))
    ) {
      currentRotation = -currentRotation;
    }

    // For U move, apply specific corrections to make the snapping animation correct
    // This only affects the visual transition, not the actual move executed
    if (baseMove === "U") {
      // For U moves, invert the rotation for correct snapping animation
      // This is a universal fix that makes U moves snap correctly from all faces
      currentRotation = -currentRotation;
    }

    // Handle F and F' moves separately since they have different transition behaviors
    if (baseMove === "F") {
      const isFPrime = suggestedMove.includes("'");
      const fromFace = trackingStateRef.current.clickedFace;
      const isFromSideFace = fromFace === "left" || fromFace === "right";

      // Specific case for F' from side faces - don't apply any correction
      if (isFPrime && isFromSideFace) {
        // No correction needed for F' from side faces
      }
      // For all other F moves, invert the rotation
      else {
        currentRotation = -currentRotation;
      }
    }

    // Face-specific fix for S moves
    if (baseMove === "S") {
      // Always invert rotation for S moves
      currentRotation = -currentRotation;
    }

    // Comprehensive fix for E moves from all faces
    if (baseMove === "E") {
      // Always invert rotation for E moves, regardless of which face we're coming from
      // This ensures consistent behavior for transitions
      currentRotation = -currentRotation;
    }

    // Fix for M moves during transition
    if (baseMove === "M") {
      const fromFace = trackingStateRef.current.clickedFace;
      const isFromFrontBack = fromFace === "front" || fromFace === "back";

      // For M moves from front/back faces, we NEED to invert the rotation for transition
      // This is the opposite of what we do during dragging (where we don't invert)
      if (isFromFrontBack) {
        // Invert rotation for proper transition from front/back faces
        currentRotation = -currentRotation;
      }
    }

    // Universal fix for D and D' moves from any face and any swipe direction
    if (baseMove === "D") {
      currentRotation = -currentRotation;
    }

    // Fix for B and B' moves from top and bottom faces
    if (baseMove === "B") {
      const fromFace = trackingStateRef.current.clickedFace;
      const isFromTopBottomFace = fromFace === "top" || fromFace === "bottom";

      // Universal fix for B and B' moves from top/bottom faces
      if (isFromTopBottomFace) {
        // Invert the rotation for proper transition from top/bottom faces
        currentRotation = -currentRotation;
      }
      // For B moves from side faces, they already work correctly so we don't need to change anything
    }

    const snapIncrement = Math.PI / 2; // 90 degrees
    const snappedRotation =
      Math.round(currentRotation / snapIncrement) * snapIncrement;

    // Determine the final move based on snapped rotation
    let finalMove = "";
    const rotationSteps = Math.round(snappedRotation / snapIncrement);

    // Handle multiple rotations (allow negative and positive values)
    const normalizedSteps = rotationSteps % 4;
    const absSteps = Math.abs(normalizedSteps);

    // Keep the original suggested move in most cases to maintain visual/logical consistency
    if (absSteps === 0) {
      finalMove = ""; // No move
    } else if (absSteps === 1) {
      finalMove = suggestedMove;
    } else if (absSteps === 2) {
      finalMove = baseMove + "2"; // Double move
    } else if (absSteps === 3) {
      // 3 steps = 1 step in opposite direction
      if (suggestedMove.includes("'")) {
        finalMove = baseMove;
      } else {
        finalMove = baseMove + "'";
      }
    }

    finalMove = swapMoveIfBottomClicked(finalMove, trackingStateRef);

    // If no rotation happened, animate back to original position
    if (absSteps === 0) {
      // Create smooth transition back to zero rotation
      trackingStateRef.current.isDragging = false;
      trackingStateRef.current.isSnapping = true;
      trackingStateRef.current.snapAnimationStartTime = Date.now();
      trackingStateRef.current.snapAnimationDuration = 150; // Shorter duration for return animation
      trackingStateRef.current.snapStartRotation =
        trackingStateRef.current.currentRotation;
      trackingStateRef.current.snapTargetRotation = 0;
      trackingStateRef.current.finalMove = "";

      return;
    }

    // Create smooth transition from current rotation to snapped rotation
    trackingStateRef.current.isDragging = false;
    trackingStateRef.current.isSnapping = true;
    trackingStateRef.current.snapAnimationStartTime = Date.now();
    trackingStateRef.current.snapAnimationDuration = 200; // 200ms for the animation
    trackingStateRef.current.snapStartRotation =
      trackingStateRef.current.currentRotation;
    trackingStateRef.current.snapTargetRotation = snappedRotation;
    trackingStateRef.current.finalMove = finalMove as CubeMove;
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!trackingStateRef.current.isTracking) return;

    // --- LOGGING: Drag gesture and move mapping ---
    // Log drag start, direction, and mapping
    if (!trackingStateRef.current.hasStartedDrag) {
      const currentPos = new THREE.Vector2(e.clientX, e.clientY);
      const dragVector = currentPos
        .clone()
        .sub(trackingStateRef.current.startPosition);
      const dragDistance = dragVector.length();
      if (dragDistance >= 2) {
        const normalizedDrag = dragVector.clone().normalize();
        let dragDirection: SwipeDirection = "up";
        if (Math.abs(normalizedDrag.x) > Math.abs(normalizedDrag.y)) {
          dragDirection = normalizedDrag.x > 0 ? "right" : "left";
        } else {
          dragDirection = normalizedDrag.y > 0 ? "down" : "up";
        }
        const positionKey = trackingStateRef.current
          .uniquePieceId as PositionMoveKey;
        let moveDirection: SwipeDirection = dragDirection;
        if (
          trackingStateRef.current.clickedFace === "top" ||
          trackingStateRef.current.clickedFace === "bottom"
        ) {
          // Use cubeScreenAxes to get front axis in screen space
          if (groupRef.current && camera) {
            const axes = cubeScreenAxes(groupRef.current, camera);
            // Determine which direction the front axis points
            let frontScreenDirection: SwipeDirection = "up";
            if (Math.abs(axes.z.x) > Math.abs(axes.z.y)) {
              frontScreenDirection = axes.z.x > 0 ? "right" : "left";
            } else {
              frontScreenDirection = axes.z.y > 0 ? "up" : "down";
            }
            const directions: SwipeDirection[] = [
              "down",
              "left",
              "up",
              "right",
            ];
            const dragIdx = directions.indexOf(dragDirection);
            const frontIdx = directions.indexOf(frontScreenDirection);
            const relativeIdx = (dragIdx - frontIdx + 4) % 4;
            moveDirection = directions[relativeIdx];
          }
        }
        const suggestedMove =
          POSITION_MOVE_MAPPING[positionKey]?.[moveDirection];
        console.log(
          "[Drag] Piece:",
          positionKey,
          "Face:",
          trackingStateRef.current.clickedFace,
          "Drag direction:",
          dragDirection,
          "Mapped direction:",
          moveDirection,
          "Suggested move:",
          suggestedMove
        );
      }
    }

    const currentPos = new THREE.Vector2(e.clientX, e.clientY);
    trackingStateRef.current.currentPosition = currentPos;

    const dragVector = currentPos
      .clone()
      .sub(trackingStateRef.current.startPosition);
    const dragDistance = dragVector.length();

    // Only process if we've moved at least 2px
    if (dragDistance >= 2) {
      const normalizedDrag = dragVector.clone().normalize();
      const directions: SwipeDirection[] = ["down", "left", "up", "right"];

      // If drag has not started, determine move direction and lock initial drag direction
      if (!trackingStateRef.current.hasStartedDrag) {
        // Determine swipe direction in screen space
        let dragDirection: SwipeDirection = "up";
        if (Math.abs(normalizedDrag.x) > Math.abs(normalizedDrag.y)) {
          dragDirection = normalizedDrag.x > 0 ? "right" : "left";
        } else {
          dragDirection = normalizedDrag.y > 0 ? "down" : "up";
        }

        // Only remap drag direction for top & bottom faces
        let moveDirection: SwipeDirection = dragDirection;
        if (
          trackingStateRef.current.clickedFace === "top" ||
          trackingStateRef.current.clickedFace === "bottom"
        ) {
          // Use cubeScreenAxes to get front axis in screen space
          if (groupRef.current && camera) {
            const axes = cubeScreenAxes(groupRef.current, camera);
            let frontScreenDirection: SwipeDirection = "up";
            if (Math.abs(axes.z.x) > Math.abs(axes.z.y)) {
              frontScreenDirection = axes.z.x > 0 ? "right" : "left";
            } else {
              frontScreenDirection = axes.z.y > 0 ? "up" : "down";
            }
            const dragIdx = directions.indexOf(dragDirection);
            const frontIdx = directions.indexOf(frontScreenDirection);
            const relativeIdx = (dragIdx - frontIdx + 4) % 4;
            moveDirection = directions[relativeIdx];
          }
        }

        // Get the suggested move from our mapping using the moveDirection
        const positionKey = trackingStateRef.current
          .uniquePieceId as PositionMoveKey;
        const suggestedMove =
          POSITION_MOVE_MAPPING[positionKey]?.[moveDirection];

        // Lock initial drag direction for all faces
        trackingStateRef.current._initialDragDirection = dragDirection;

        // Start drag animation if not already started
        if (suggestedMove) {
          startDragAnimation(suggestedMove, moveDirection);
        }
      }

      // Update drag rotation if we're dragging
      if (trackingStateRef.current.isDragging) {
        // Use both axes and sign of drag movement, corrected for cube orientation
        const initialDir = trackingStateRef.current._initialDragDirection;
        let projectedVector = dragVector.clone();
        let dragAmount = 0;
        let axisScreenSign = 1;
        if (groupRef.current && camera && gl) {
          // For left/right, use X axis; for up/down, use Y axis
          let axisVec =
            initialDir === "left" || initialDir === "right"
              ? new THREE.Vector3(1, 0, 0)
              : new THREE.Vector3(0, 1, 0);
          axisVec.applyQuaternion(groupRef.current.quaternion);
          const worldPos = groupRef.current.getWorldPosition(
            new THREE.Vector3()
          );
          const axisPos = worldPos.clone().add(axisVec);
          const ndcWorld = axisPos.clone().project(camera);
          const ndcOrigin = worldPos.clone().project(camera);
          const screenVec = new THREE.Vector2(
            ndcWorld.x - ndcOrigin.x,
            ndcWorld.y - ndcOrigin.y
          );
          // For left/right, compare X; for up/down, compare Y
          if (initialDir === "left" || initialDir === "right") {
            axisScreenSign = screenVec.x >= 0 ? 1 : -1;
          } else {
            axisScreenSign = screenVec.y >= 0 ? 1 : -1;
          }
        }
        if (initialDir === "left" || initialDir === "right") {
          dragAmount = dragVector.x;
        } else {
          dragAmount = dragVector.y;
        }

        // Improved: drag direction should always match user's gesture, regardless of orientation
        // Project drag vector onto the projected axis direction in screen space
        if (groupRef.current && camera && gl) {
          let axisVec =
            initialDir === "left" || initialDir === "right"
              ? new THREE.Vector3(1, 0, 0)
              : new THREE.Vector3(0, 1, 0);
          axisVec.applyQuaternion(groupRef.current.quaternion);
          const worldPos = groupRef.current.getWorldPosition(
            new THREE.Vector3()
          );
          const axisPos = worldPos.clone().add(axisVec);
          const ndcWorld = axisPos.clone().project(camera);
          const ndcOrigin = worldPos.clone().project(camera);
          const screenAxis = new THREE.Vector2(
            ndcWorld.x - ndcOrigin.x,
            ndcWorld.y - ndcOrigin.y
          ).normalize();
          const dragScreen = new THREE.Vector2(
            dragVector.x,
            dragVector.y
          ).normalize();
          // The sign is determined by the dot product
          const sign = dragScreen.dot(screenAxis) >= 0 ? 1 : -1;
          dragAmount = dragVector.length() * sign;
        }

        // Create a vector with only the relevant axis
        if (initialDir === "left" || initialDir === "right") {
          projectedVector.x = dragAmount;
          projectedVector.y = 0;
        } else {
          projectedVector.y = dragAmount;
          projectedVector.x = 0;
        }
        updateDragRotation(projectedVector);
      }
    }
  };

  const handlePointerUp = () => {
    // Always remove event listeners first
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);

    if (!trackingStateRef.current.isTracking) {
      return;
    }

    // If we were dragging, finalize with snapping
    if (trackingStateRef.current.isDragging) {
      finalizeDragWithSnapping();
    } else {
      // Just a click without significant drag - clean up any partial drag state
      if (trackingStateRef.current.dragGroup) {
        cleanupDragState();
      } else {
        // Re-enable orbit controls if we were just clicking
        onOrbitControlsChange?.(true);
      }

      const dragVector = trackingStateRef.current.currentPosition
        .clone()
        .sub(trackingStateRef.current.startPosition);
      const dragDistance = dragVector.length();

      if (dragDistance >= 10) {
        // Code previously used for logging, removed since we don't need it anymore
        // const normalizedDrag = dragVector.clone().normalize();
        // let swipeDirection: SwipeDirection = "up";
        // if (Math.abs(normalizedDrag.x) > Math.abs(normalizedDrag.y)) {
        //   swipeDirection = normalizedDrag.x > 0 ? "right" : "left";
        // } else {
        //   swipeDirection = normalizedDrag.y > 0 ? "down" : "up";
        // }
        // const positionKey = trackingStateRef.current.uniquePieceId as PositionMoveKey;
        // const suggestedMove = POSITION_MOVE_MAPPING[positionKey]?.[swipeDirection];
      }
    }

    // If we're not starting a snapping animation, reset tracking state
    // Otherwise, the tracking state will be reset when the animation completes
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
      };
    }
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (currentTweenRef.current) {
        currentTweenRef.current = null;
      }
      // Cleanup drag state if active
      if (trackingStateRef.current.isDragging) {
        cleanupDragState();
      }
      // Cleanup event listeners on unmount
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  const handleMeshReady = useCallback(
    (mesh: THREE.Mesh, x: number, y: number, z: number) => {
      const existingMeshIndex = cubiesRef.current.findIndex(
        (cubie) => cubie.mesh === mesh
      );

      if (existingMeshIndex !== -1) return;
      if (cubiesRef.current.length >= 27) return;

      const existingIndex = cubiesRef.current.findIndex(
        (cubie) => cubie.x === x && cubie.y === y && cubie.z === z
      );

      if (existingIndex !== -1) {
        cubiesRef.current[existingIndex].mesh = mesh;
      } else {
        const cubie: AnimatedCubie = {
          mesh: mesh,
          originalPosition: new THREE.Vector3(
            (x - 1) * 1.05,
            (y - 1) * 1.05,
            (z - 1) * 1.05
          ),
          x,
          y,
          z,
        };

        cubiesRef.current.push(cubie);
      }

      if (cubiesRef.current.length === 27 && !meshesReadyRef.current) {
        meshesReadyRef.current = true;
      }
    },
    []
  );

  return (
    <group ref={groupRef} onPointerLeave={handleLeaveCube}>
      {cubeState.map((xLayer, x) =>
        xLayer.map((yLayer, y) =>
          yLayer.map((cube, z) => (
            <CubePiece
              key={`${x}-${y}-${z}`}
              position={[(x - 1) * 1.05, (y - 1) * 1.05, (z - 1) * 1.05]}
              colors={cube.colors}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePreciseHover}
              onMeshReady={handleMeshReady}
            />
          ))
        )
      )}
    </group>
  );
};

export default RubiksCube3D;
