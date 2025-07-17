import { useEffect, useRef, useCallback, useMemo } from "react";
import React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CubeState, CubeMove } from "../types/cube";
import { AnimationHelper, type AnimatedCubie } from "../utils/animationHelper";
import { getPieceType, getVisibleColors } from "../utils/cubeMapping";

// Position-based move mapping - static mapping for each piece position + face + swipe direction
const POSITION_MOVE_MAPPING = {
  // Corner pieces - 8 corners × 3 visible faces each = 24 entries
  corner_RUF_right: { up: "F'", down: "F", left: "U", right: "U'" },
  corner_RUF_top: { up: "R", down: "R'", left: "F'", right: "F" }, //  DONE
  corner_RUF_front: { up: "R", down: "R'", left: "U", right: "U'" }, //  DONE

  corner_LUF_left: { up: "F", down: "F'", left: "U", right: "U'" },
  corner_LUF_top: { up: "L'", down: "L", left: "F'", right: "F" },
  corner_LUF_front: { up: "L'", down: "L", left: "U", right: "U'" },

  corner_RUB_right: { up: "B", down: "B'", left: "U", right: "U'" },
  corner_RUB_top: { up: "R", down: "R'", left: "B", right: "B'" }, //  DONE
  corner_RUB_back: { up: "R'", down: "R", left: "U", right: "U'" },

  corner_LUB_left: { up: "B'", down: "B", left: "U", right: "U'" },
  corner_LUB_top: { up: "L'", down: "L", left: "B", right: "B'" },
  corner_LUB_back: { up: "L", down: "L'", left: "U", right: "U'" },

  corner_RDF_right: { up: "F'", down: "F", left: "D'", right: "D" },
  corner_RDF_bottom: { up: "R", down: "R'", left: "F", right: "F'" }, //  DONE
  corner_RDF_front: { up: "R", down: "R'", left: "D'", right: "D" },

  corner_LDF_left: { up: "F", down: "F'", left: "D'", right: "D" },
  corner_LDF_bottom: { up: "L'", down: "L", left: "F", right: "F'" },
  corner_LDF_front: { up: "L'", down: "L", left: "D'", right: "D" },

  corner_RDB_right: { up: "B", down: "B'", left: "D'", right: "D" },
  corner_RDB_bottom: { up: "R", down: "R'", left: "B'", right: "B" }, //  DONE
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
  edge_REF_front: { up: "R'", down: "R", left: "E'", right: "E" },

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

  edge_MDB_bottom: { up: "M''", down: "M", left: "B''", right: "B" },
  edge_MDB_back: { up: "M", down: "M''", left: "D'", right: "D" },

  edge_LDS_left: { up: "S", down: "S'", left: "D'", right: "D" },
  edge_LDS_bottom: { up: "L'", down: "L", left: "S", right: "S'" },

  edge_LUS_top: { up: "L''", down: "L", left: "S'", right: "S" },
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
      ...[0.495, -0.495].flatMap((y) =>
        [0.495, -0.495].map((z) => ({
          pos: [0, y, z],
          args: [0.95, 0.04, 0.04],
        }))
      ),
      ...[0.495, -0.495].flatMap((y) =>
        [0.495, -0.495].map((x) => ({
          pos: [x, y, 0],
          args: [0.04, 0.04, 0.95],
        }))
      ),
      ...[0.495, -0.495].flatMap((x) =>
        [0.495, -0.495].map((z) => ({
          pos: [x, 0, z],
          args: [0.04, 0.95, 0.04],
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

          // Get intersection point from the event
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
        <boxGeometry args={[0.95, 0.95, 0.95]} />

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
          onMoveAnimationDone && onMoveAnimationDone(pendingMove);
          currentTweenRef.current = null;
        }
      );
    }
  }, [pendingMove, onStartAnimation, onMoveAnimationDone, isAnimating]);

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

      const pieceType = getPieceType(gridPos);
      const visibleColors = getVisibleColors(cubieState.colors, gridPos);

      console.log({
        face: faceName,
        colour: faceColor,
        piece: visibleColors.join("/"),
        pieceType: pieceType,
      });
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
  const trackingStateRef = useRef<{
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
  }>({
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
    };

    console.log("Mouse Down:", {
      uniquePieceId,
      gridPosition: gridPos,
      clickedFace,
      piecePosition: pos,
    });

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  // Helper function to clean up drag state
  const cleanupDragState = () => {
    // Clean up drag group if it exists
    const dragGroup = trackingStateRef.current.dragGroup;
    if (dragGroup && groupRef.current) {
      // Get all meshes from drag group
      const meshesToMove: THREE.Mesh[] = [];
      dragGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          meshesToMove.push(child);
        }
      });

      // Move meshes back to main group at their original positions
      meshesToMove.forEach((mesh) => {
        // Find the corresponding cubie to get original position
        const cubie = trackingStateRef.current.affectedCubies.find(
          (c) => c.mesh === mesh
        );
        if (cubie) {
          // Remove from drag group
          dragGroup.remove(mesh);

          // Add back to main group at original position
          groupRef.current!.add(mesh);
          mesh.position.copy(cubie.originalPosition);

          // Reset any rotation on the mesh
          mesh.rotation.set(0, 0, 0);
        }
      });

      // Remove empty drag group
      groupRef.current.remove(dragGroup);
    }

    // Re-enable orbit controls
    onOrbitControlsChange?.(true);
    AnimationHelper.unlock();
  };

  // Helper function to get opposite direction
  const getOppositeDirection = (direction: SwipeDirection): SwipeDirection => {
    switch (direction) {
      case "up":
        return "down";
      case "down":
        return "up";
      case "left":
        return "right";
      case "right":
        return "left";
    }
  };

  // Helper function to start drag animation
  const startDragAnimation = (
    suggestedMove: string,
    swipeDirection: SwipeDirection
  ) => {
    if (!groupRef.current || trackingStateRef.current.hasStartedDrag) return;

    // Lock the move and direction
    trackingStateRef.current.lockedMoveType = suggestedMove;
    trackingStateRef.current.lockedDirection = swipeDirection;
    trackingStateRef.current.initialSwipeDirection = swipeDirection;
    trackingStateRef.current.isDragging = true;
    trackingStateRef.current.hasStartedDrag = true;

    // Get affected cubies based on the move type
    const moveType = suggestedMove.replace(/['2]/g, ""); // Remove prime and 2 modifiers
    const affectedCubies = getAffectedCubiesForMove(moveType);
    trackingStateRef.current.affectedCubies = affectedCubies;

    // Get the rotation axis and direction from AnimationHelper
    const [axis, totalRotation] = AnimationHelper.getMoveAxisAndDir(
      suggestedMove as CubeMove
    );
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

    console.log("Starting drag animation:", {
      suggestedMove,
      moveType,
      affectedCubiesCount: affectedCubies.length,
      affectedCubies: affectedCubies.map((c) => ({ x: c.x, y: c.y, z: c.z })),
      rotationAxis: axis,
      totalRotation,
    });

    // Lock animations during drag (orbit controls already disabled in handlePointerDown)
    AnimationHelper.lock();

    console.log("Locked move for drag:", suggestedMove);
  };

  // Helper function to update drag rotation
  const updateDragRotation = (dragVector: THREE.Vector2) => {
    if (!trackingStateRef.current.isDragging) return;

    const sensitivity = 0.006;
    const lockedDirection = trackingStateRef.current.lockedDirection;
    const suggestedMove = trackingStateRef.current.lockedMoveType;

    // Calculate rotation amount based on drag direction
    let rotationAmount = 0;
    if (lockedDirection === "left" || lockedDirection === "right") {
      rotationAmount = dragVector.x * sensitivity;
    } else {
      rotationAmount = dragVector.y * sensitivity;
    }

    // Get the actual rotation direction from AnimationHelper
    const [, totalRotation] = AnimationHelper.getMoveAxisAndDir(
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

    console.log("Rotation calculation details:", {
      move: suggestedMove,
      baseMove,
      lockedDirection,
      rawRotationAmount: rotationAmount,
      afterDirectionAdjustment: adjustedRotation,
      expectedDirection,
      beforeFinalAdjustment: adjustedRotation,
      isPrimeMove: suggestedMove.includes("'"),
      isF_Move: baseMove === "F",
      skipExpectedDirection: baseMove === "F",
    });

    // Special correction for specific moves that are rotating in the wrong direction
    // Only apply visual correction - don't affect the logical move execution
    // Be more specific about which moves need correction based on both move and direction
    if (
      (baseMove === "U" &&
        (lockedDirection === "left" || lockedDirection === "right")) ||
      (baseMove === "B" &&
        (lockedDirection === "left" || lockedDirection === "right")) ||
      (baseMove === "D" &&
        (lockedDirection === "left" || lockedDirection === "right")) ||
      (baseMove === "E" &&
        (lockedDirection === "left" || lockedDirection === "right")) ||
      (baseMove === "S" &&
        (lockedDirection === "left" || lockedDirection === "right")) ||
      (baseMove === "F" &&
        !suggestedMove.includes("'") &&
        (lockedDirection === "left" ||
          lockedDirection === "right" ||
          lockedDirection === "up" ||
          lockedDirection === "down")) ||
      (baseMove === "F" &&
        suggestedMove.includes("'") &&
        (lockedDirection === "left" || lockedDirection === "right"))
    ) {
      adjustedRotation = -adjustedRotation;
    }

    // Don't clamp rotation - allow unlimited rotation for multiple turns
    trackingStateRef.current.currentRotation = adjustedRotation;

    console.log("Drag progress:", {
      move: suggestedMove,
      baseMove,
      direction: lockedDirection,
      rawRotation: rotationAmount,
      expectedDirection,
      adjustedRotation,
      progress:
        ((Math.abs(adjustedRotation) / (Math.PI / 2)) * 100).toFixed(1) + "%",
    });
  };

  // Helper function to finalize drag with snapping
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
      (baseMove === "S" &&
        (lockedDirection === "left" || lockedDirection === "right")) ||
      (baseMove === "F" &&
        !suggestedMove.includes("'") &&
        (lockedDirection === "left" ||
          lockedDirection === "right" ||
          lockedDirection === "up" ||
          lockedDirection === "down")) ||
      (baseMove === "F" &&
        suggestedMove.includes("'") &&
        (lockedDirection === "left" || lockedDirection === "right"))
    ) {
      currentRotation = -currentRotation;
    }

    console.log("Final move calculation:", {
      baseMove,
      lockedDirection,
      suggestedMove,
      rawRotation: trackingStateRef.current.currentRotation,
      correctedRotation: currentRotation,
      correctionApplied:
        (baseMove === "U" &&
          (lockedDirection === "left" || lockedDirection === "right")) ||
        (baseMove === "B" &&
          (lockedDirection === "left" || lockedDirection === "right")) ||
        (baseMove === "D" &&
          (lockedDirection === "left" || lockedDirection === "right")) ||
        (baseMove === "E" &&
          (lockedDirection === "left" || lockedDirection === "right")) ||
        (baseMove === "S" &&
          (lockedDirection === "left" || lockedDirection === "right")) ||
        (baseMove === "F" &&
          !suggestedMove.includes("'") &&
          (lockedDirection === "left" ||
            lockedDirection === "right" ||
            lockedDirection === "up" ||
            lockedDirection === "down")) ||
        (baseMove === "F" &&
          suggestedMove.includes("'") &&
          (lockedDirection === "left" || lockedDirection === "right")),
      shouldApplyCorrection: {
        isU: baseMove === "U",
        isHorizontal: lockedDirection === "left" || lockedDirection === "right",
        isR: baseMove === "R",
        isVertical: lockedDirection === "up" || lockedDirection === "down",
        isB: baseMove === "B",
        isD: baseMove === "D",
        isDOnFrontOrBack:
          trackingStateRef.current.clickedFace === "front" ||
          trackingStateRef.current.clickedFace === "back",
        clickedFace: trackingStateRef.current.clickedFace,
        isF: baseMove === "F",
        isFPrime: suggestedMove.includes("'"),
      },
    });

    const snapIncrement = Math.PI / 2; // 90 degrees
    const snappedRotation =
      Math.round(currentRotation / snapIncrement) * snapIncrement;

    // Determine the final move based on snapped rotation
    let finalMove = "";
    const rotationSteps = Math.round(snappedRotation / snapIncrement);

    // Handle multiple rotations (allow negative and positive values)
    const normalizedSteps = rotationSteps % 4;
    const absSteps = Math.abs(normalizedSteps);

    if (absSteps === 0) {
      finalMove = ""; // No move
    } else if (absSteps === 1) {
      // Single rotation - the direction depends on the actual rotation direction
      // For prime moves, we want to execute the prime move when the rotation is in the "expected" direction
      const wasPrimeMove = suggestedMove.includes("'");

      // The key insight: if we detected a prime move, and the user dragged in the direction
      // that would naturally execute that prime move, then we should execute the prime move
      // The sign of normalizedSteps tells us the direction of rotation after corrections

      if (wasPrimeMove) {
        // For prime moves, execute the prime move as intended
        finalMove = baseMove + "'";
      } else {
        // For normal moves, execute the normal move as intended
        finalMove = baseMove;
      }
    } else if (absSteps === 2) {
      finalMove = baseMove + "2"; // Double move
    } else if (absSteps === 3) {
      // 3 steps = 1 step in opposite direction
      const wasPrimeMove = suggestedMove.includes("'");

      if (wasPrimeMove) {
        // 3 steps of a prime move = 1 step of normal move
        finalMove = baseMove;
      } else {
        // 3 steps of a normal move = 1 step of prime move
        finalMove = baseMove + "'";
      }
    }

    // Clean up drag group - move meshes back to main group at their ORIGINAL positions
    const dragGroup = trackingStateRef.current.dragGroup;
    if (dragGroup && groupRef.current) {
      // Get all meshes from drag group
      const meshesToMove: THREE.Mesh[] = [];
      dragGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          meshesToMove.push(child);
        }
      });

      // Move meshes back to main group at their original positions
      meshesToMove.forEach((mesh) => {
        // Find the corresponding cubie to get original position
        const cubie = trackingStateRef.current.affectedCubies.find(
          (c) => c.mesh === mesh
        );
        if (cubie) {
          // Remove from drag group
          dragGroup.remove(mesh);

          // Add back to main group at original position
          groupRef.current!.add(mesh);
          mesh.position.copy(cubie.originalPosition);

          // Reset any rotation on the mesh
          mesh.rotation.set(0, 0, 0);
        }
      });

      // Remove empty drag group
      groupRef.current.remove(dragGroup);
    }

    // Re-enable orbit controls
    onOrbitControlsChange?.(true);
    AnimationHelper.unlock();

    // Execute the final move through the normal animation system
    if (finalMove && onMoveAnimationDone) {
      // Execute the move if any rotation happened
      if (absSteps !== 0) {
        console.log(
          "Executing final move through animation system:",
          finalMove
        );

        // This will trigger the normal animation system which will handle both
        // visual animation and logical state update correctly
        onMoveAnimationDone(finalMove as CubeMove);
      } else {
        console.log("No rotation, skipping move execution");
      }
    }

    console.log("Finalized drag with snapping:", {
      suggestedMove,
      wasPrimeMove: suggestedMove.includes("'"),
      currentRotation: ((currentRotation * 180) / Math.PI).toFixed(1) + "°",
      snappedRotation: ((snappedRotation * 180) / Math.PI).toFixed(1) + "°",
      rotationSteps,
      normalizedSteps,
      absSteps,
      finalMove: finalMove || "No move",
    });
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!trackingStateRef.current.isTracking) return;

    const currentPos = new THREE.Vector2(e.clientX, e.clientY);
    trackingStateRef.current.currentPosition = currentPos;

    const dragVector = currentPos
      .clone()
      .sub(trackingStateRef.current.startPosition);
    const dragDistance = dragVector.length();

    // Only process if we've moved at least 10px
    if (dragDistance >= 10) {
      const normalizedDrag = dragVector.clone().normalize();

      // Determine swipe direction
      let swipeDirection: SwipeDirection = "up";
      if (Math.abs(normalizedDrag.x) > Math.abs(normalizedDrag.y)) {
        // Horizontal swipe
        swipeDirection = normalizedDrag.x > 0 ? "right" : "left";
      } else {
        // Vertical swipe
        swipeDirection = normalizedDrag.y > 0 ? "down" : "up";
      }

      // Get the suggested move from our new mapping
      const positionKey = trackingStateRef.current
        .uniquePieceId as PositionMoveKey;
      const suggestedMove =
        POSITION_MOVE_MAPPING[positionKey]?.[swipeDirection];

      console.log("Move selection:", {
        positionKey,
        swipeDirection,
        suggestedMove,
        dragVector: { x: dragVector.x, y: dragVector.y },
        normalizedDrag: { x: normalizedDrag.x, y: normalizedDrag.y },
      });

      // Start drag animation if not already started
      if (!trackingStateRef.current.hasStartedDrag && suggestedMove) {
        startDragAnimation(suggestedMove, swipeDirection);
      }

      // Update drag rotation if we're dragging
      if (trackingStateRef.current.isDragging) {
        // Check if current swipe direction is allowed (same as locked or opposite)
        const allowedDirection = trackingStateRef.current.lockedDirection;
        const oppositeDirection = getOppositeDirection(allowedDirection);

        if (
          swipeDirection === allowedDirection ||
          swipeDirection === oppositeDirection
        ) {
          // Update the drag rotation
          updateDragRotation(dragVector);
        } else {
          // Constrain movement to the locked axis
          let constrainedVector = dragVector.clone();

          if (allowedDirection === "left" || allowedDirection === "right") {
            // Lock to horizontal movement
            constrainedVector.y = 0;
          } else {
            // Lock to vertical movement
            constrainedVector.x = 0;
          }

          updateDragRotation(constrainedVector);
        }
      }

      console.log("Swipe Detected:", {
        uniquePieceId: trackingStateRef.current.uniquePieceId,
        clickedFace: trackingStateRef.current.clickedFace,
        swipeDirection,
        suggestedMove,
        isDragging: trackingStateRef.current.isDragging,
        lockedDirection: trackingStateRef.current.lockedDirection,
        dragDistance: Math.round(dragDistance),
        dragVector: {
          x: Math.round(dragVector.x),
          y: Math.round(dragVector.y),
        },
      });
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
        const normalizedDrag = dragVector.clone().normalize();

        // Determine final swipe direction
        let swipeDirection: SwipeDirection = "up";
        if (Math.abs(normalizedDrag.x) > Math.abs(normalizedDrag.y)) {
          swipeDirection = normalizedDrag.x > 0 ? "right" : "left";
        } else {
          swipeDirection = normalizedDrag.y > 0 ? "down" : "up";
        }

        // Get the suggested move from our new mapping
        const positionKey = trackingStateRef.current
          .uniquePieceId as PositionMoveKey;
        const suggestedMove =
          POSITION_MOVE_MAPPING[positionKey]?.[swipeDirection];

        console.log("Final Swipe Result:", {
          uniquePieceId: trackingStateRef.current.uniquePieceId,
          clickedFace: trackingStateRef.current.clickedFace,
          swipeDirection,
          suggestedMove,
          totalDistance: Math.round(dragDistance),
          // Now we have the actual move to execute!
          moveToExecute: suggestedMove,
        });
      } else {
        console.log("Click only (no swipe):", {
          uniquePieceId: trackingStateRef.current.uniquePieceId,
          clickedFace: trackingStateRef.current.clickedFace,
        });
      }
    }

    // Reset tracking state
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
    };
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
