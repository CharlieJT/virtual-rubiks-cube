import { useEffect, useRef, useCallback, useMemo } from "react";
import React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Tween } from "@tweenjs/tween.js";
import type { CubeState, CubeMove } from "../types/cube";
import { AnimationHelper, type AnimatedCubie } from "../utils/animationHelper";

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
  ({ position, colors, onPointerDown, onMeshReady }: CubePieceProps) => {
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

    if (dragStateRef.current.isActive && dragStateRef.current.dragGroup) {
      updateDragRotation();
    }
  });

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

  // Determine move direction based on drag direction and clicked face
  const getMoveFromDrag = (clickedFace: string, dragVector: THREE.Vector2) => {
    const threshold = 20; // Minimum drag distance to determine direction

    if (dragVector.length() < threshold) {
      return null; // Not enough movement to determine direction
    }

    // Normalize drag vector to get primary direction
    const normalizedDrag = dragVector.clone().normalize();
    const isHorizontal =
      Math.abs(normalizedDrag.x) > Math.abs(normalizedDrag.y);
    const isRight = normalizedDrag.x > 0;
    const isUp = normalizedDrag.y < 0; // Screen coordinates: negative Y is up

    // Map face + drag direction to cube moves - matching iamthecu.be behavior
    switch (clickedFace) {
      case "right": // Red face (x=2) - when clicking on red face
        if (isHorizontal) {
          // Horizontal drag on red face
          return isRight
            ? { moveType: "U", isPrime: true } // U' - drag right gives U'
            : { moveType: "U", isPrime: false }; // U - drag left gives U
        } else {
          // Vertical drag on red face
          return isUp
            ? { moveType: "F", isPrime: true } // F' - drag up gives F'
            : { moveType: "F", isPrime: false }; // F - drag down gives F
        }

      case "front": // Green face (z=2) - when clicking on green face
        if (isHorizontal) {
          // Horizontal drag on green face
          return isRight
            ? { moveType: "U", isPrime: true } // U' - drag right gives U'
            : { moveType: "U", isPrime: false }; // U - drag left gives U
        } else {
          // Vertical drag on green face
          return isUp
            ? { moveType: "R", isPrime: false } // R - drag up gives R
            : { moveType: "R", isPrime: true }; // R' - drag down gives R'
        }

      case "top": // White face (y=2) - when clicking on white face
        if (isHorizontal) {
          // Horizontal drag on white face
          return isRight
            ? { moveType: "F", isPrime: false } // F - drag right gives F
            : { moveType: "F", isPrime: true }; // F' - drag left gives F'
        } else {
          // Vertical drag on white face
          return isUp
            ? { moveType: "R", isPrime: false } // R - drag up gives R
            : { moveType: "R", isPrime: true }; // R' - drag down gives R'
        }

      case "left": // Orange face (x=0) - when clicking on orange face
        if (isHorizontal) {
          // Horizontal drag on orange face
          return isRight
            ? { moveType: "U", isPrime: false } // U - drag right gives U
            : { moveType: "U", isPrime: true }; // U' - drag left gives U'
        } else {
          // Vertical drag on orange face
          return isUp
            ? { moveType: "B", isPrime: false } // B - drag up gives B
            : { moveType: "B", isPrime: true }; // B' - drag down gives B'
        }

      case "back": // Blue face (z=0) - when clicking on blue face
        if (isHorizontal) {
          // Horizontal drag on blue face - use different slice moves
          return isRight
            ? { moveType: "D", isPrime: false } // D - drag right gives D
            : { moveType: "D", isPrime: true }; // D' - drag left gives D'
        } else {
          // Vertical drag on blue face - use back face moves
          return isUp
            ? { moveType: "B", isPrime: true } // B' - drag up gives B'
            : { moveType: "B", isPrime: false }; // B - drag down gives B
        }

      case "bottom": // Yellow face (y=0) - when clicking on yellow face
        if (isHorizontal) {
          // Horizontal drag on yellow face
          return isRight
            ? { moveType: "F", isPrime: true } // F' - drag right gives F'
            : { moveType: "F", isPrime: false }; // F - drag left gives F
        } else {
          // Vertical drag on yellow face
          return isUp
            ? { moveType: "L", isPrime: true } // L' - drag up gives L'
            : { moveType: "L", isPrime: false }; // L - drag down gives L
        }
    }

    return null;
  };

  const updateDragRotation = () => {
    if (!dragStateRef.current.dragGroup) return;

    const dragVector = dragStateRef.current.currentPosition
      .clone()
      .sub(dragStateRef.current.startPosition);

    // If direction is not locked yet, determine the move
    let moveData = null;
    if (!dragStateRef.current.hasLockedDirection) {
      moveData = getMoveFromDrag(dragStateRef.current.clickedFace, dragVector);
      if (!moveData) return; // Not enough movement yet

      // Lock the direction and move type
      dragStateRef.current.lockedMoveType = moveData.moveType;
      dragStateRef.current.lockedIsPrime = moveData.isPrime;
      dragStateRef.current.hasLockedDirection = true;

      // Set up the affected cubies for the locked move type
      const currentAffectedCubies = getAffectedCubiesForMove(moveData.moveType);

      // Remove old group and create new one with correct cubies
      if (groupRef.current) {
        groupRef.current.remove(dragStateRef.current.dragGroup);

        const newDragGroup = new THREE.Group();
        newDragGroup.name = "DragGroup";

        currentAffectedCubies.forEach((cubie: AnimatedCubie) => {
          groupRef.current!.remove(cubie.mesh);
          newDragGroup.add(cubie.mesh);
        });

        groupRef.current.add(newDragGroup);

        dragStateRef.current.dragGroup = newDragGroup;
        dragStateRef.current.affectedCubies = currentAffectedCubies;
      }
    }

    // Use the locked move type
    if (dragStateRef.current.hasLockedDirection) {
      moveData = {
        moveType: dragStateRef.current.lockedMoveType,
        isPrime: dragStateRef.current.lockedIsPrime,
      };

      // Check if we should flip the prime based on current drag direction
      const currentMoveData = getMoveFromDrag(
        dragStateRef.current.clickedFace,
        dragVector
      );
      if (
        currentMoveData &&
        currentMoveData.moveType === dragStateRef.current.lockedMoveType
      ) {
        moveData.isPrime = currentMoveData.isPrime;
        dragStateRef.current.lockedIsPrime = currentMoveData.isPrime;
      }
    }

    if (!moveData) return;

    // Get the axis and direction using AnimationHelper logic
    const move = moveData.moveType + (moveData.isPrime ? "'" : "");
    const [axis, totalRotationFor90] = AnimationHelper.getMoveAxisAndDir(
      move as CubeMove
    );

    // Set the rotation axis only once when direction is first locked
    if (dragStateRef.current.rotationAxis.length() === 0) {
      dragStateRef.current.rotationAxis = axis.clone().normalize();
    }

    // Calculate rotation based on the dominant drag direction and face
    let rotationAmount = 0;
    const sensitivity = 0.006; // Reduced sensitivity for smoother control

    // Use the appropriate drag component based on the face and movement type
    const normalizedDrag = dragVector.clone().normalize();
    const isHorizontal =
      Math.abs(normalizedDrag.x) > Math.abs(normalizedDrag.y);

    if (isHorizontal) {
      rotationAmount = dragVector.x * sensitivity;
    } else {
      rotationAmount = -dragVector.y * sensitivity; // Negative for screen coordinates
    }

    // Apply direction based on whether it's a prime move
    const direction = totalRotationFor90 > 0 ? 1 : -1;
    rotationAmount *= direction;

    // Clamp rotation to reasonable range
    rotationAmount = Math.max(-Math.PI, Math.min(Math.PI, rotationAmount));

    const deltaRotation = rotationAmount - dragStateRef.current.currentRotation;
    dragStateRef.current.dragGroup.rotateOnAxis(
      dragStateRef.current.rotationAxis,
      deltaRotation
    );

    dragStateRef.current.currentRotation = rotationAmount;
  };

  const handlePointerDown = (
    e: any,
    pos: [number, number, number],
    intersectionPoint: THREE.Vector3
  ) => {
    if (
      AnimationHelper.isLocked() ||
      dragStateRef.current.isActive ||
      !meshesReadyRef.current
    ) {
      return;
    }

    e.stopPropagation();
    onOrbitControlsChange?.(false);

    // Detect which face was clicked
    const { clickedFace } = detectFaceAndMove(pos, intersectionPoint);

    if (!groupRef.current) {
      onOrbitControlsChange?.(true);
      return;
    }

    // Start with an empty drag group - we'll populate it when we determine the move
    const startPos = new THREE.Vector2(e.clientX, e.clientY);
    const dragGroup = new THREE.Group();
    dragGroup.name = "DragGroup";

    // Don't add any cubies yet - we'll do that in updateDragRotation when we know the move
    groupRef.current.add(dragGroup);

    dragStateRef.current = {
      isActive: true,
      startPosition: startPos,
      currentPosition: startPos.clone(),
      cubiePosition: pos,
      clickedFace,
      moveAxis: "", // Will be determined on first drag movement
      moveDirection: 1, // Will be determined on first drag movement
      rotationAxis: new THREE.Vector3(0, 0, 0), // Will be set when drag starts
      affectedCubies: [], // Will be populated when we determine the move
      dragGroup,
      currentRotation: 0,
      lockedMoveType: "",
      lockedIsPrime: false,
      hasLockedDirection: false,
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!dragStateRef.current.isActive) return;

    const currentPos = new THREE.Vector2(e.clientX, e.clientY);
    dragStateRef.current.currentPosition = currentPos;
    updateDragRotation();
  };

  const handlePointerUp = () => {
    // Always remove event listeners first
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);

    if (
      !dragStateRef.current.isActive ||
      !dragStateRef.current.dragGroup ||
      !groupRef.current
    ) {
      // Make sure to reset state and re-enable orbit controls
      dragStateRef.current.isActive = false;
      onOrbitControlsChange?.(true);
      return;
    }

    const totalRotation = dragStateRef.current.currentRotation;
    const snapRotation =
      Math.round(totalRotation / (Math.PI / 2)) * (Math.PI / 2);
    const finalRotation = snapRotation - totalRotation;

    if (
      Math.abs(finalRotation) > 0.01 &&
      dragStateRef.current.rotationAxis.length() > 0
    ) {
      console.log("Starting snap animation with finalRotation:", finalRotation);
      AnimationHelper.lock();

      new Tween({ rotation: 0 })
        .to({ rotation: finalRotation }, 150)
        .onUpdate((obj: { rotation: number }) => {
          if (
            dragStateRef.current.dragGroup &&
            dragStateRef.current.rotationAxis.length() > 0
          ) {
            dragStateRef.current.dragGroup.rotateOnAxis(
              dragStateRef.current.rotationAxis,
              obj.rotation
            );
          }
        })
        .onComplete(() => {
          finalizeDrag();
        })
        .start();
    } else {
      finalizeDrag();
    }
  };

  const finalizeDrag = () => {
    if (!dragStateRef.current.dragGroup || !groupRef.current) {
      // Reset state even if we don't have dragGroup
      dragStateRef.current.isActive = false;
      onOrbitControlsChange?.(true);
      AnimationHelper.unlock();
      return;
    }

    groupRef.current.remove(dragStateRef.current.dragGroup);

    const rotatedCubies: THREE.Object3D[] = [];
    dragStateRef.current.dragGroup.children.forEach((cube) => {
      const worldPos = dragStateRef.current.dragGroup!.localToWorld(
        cube.position.clone()
      );
      cube.position.copy(worldPos);
      rotatedCubies.push(cube);
    });

    // Calculate the final snap rotation
    const totalRotation = dragStateRef.current.currentRotation;
    const snapRotation =
      Math.round(totalRotation / (Math.PI / 2)) * (Math.PI / 2);

    // Apply the final rotation to each cube if we have a valid rotation axis
    if (dragStateRef.current.rotationAxis.length() > 0) {
      rotatedCubies.forEach((cube) => {
        AnimationHelper.rotateAroundWorldAxis(
          cube,
          dragStateRef.current.rotationAxis,
          snapRotation
        );
        groupRef.current!.add(cube);
      });
    } else {
      // If no rotation axis was set, just add the cubes back without rotation
      rotatedCubies.forEach((cube) => {
        groupRef.current!.add(cube);
      });
    }

    // Apply the move to the logical cube state if we have a valid move
    if (
      dragStateRef.current.hasLockedDirection &&
      dragStateRef.current.lockedMoveType
    ) {
      const move =
        dragStateRef.current.lockedMoveType +
        (dragStateRef.current.lockedIsPrime ? "'" : "");
      onMoveAnimationDone?.(move as CubeMove);
    }

    dragStateRef.current = {
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
    };

    onOrbitControlsChange?.(true);
    AnimationHelper.unlock();
  };

  // Only reset cubies when explicitly needed (not on every cubeState change)
  // useEffect(() => {
  //   console.log("useEffect running - cubeState or isAnimating changed");
  //   console.log("AnimationHelper.isLocked():", AnimationHelper.isLocked());
  //   console.log("isAnimating:", isAnimating);
  //   console.log("dragState.isActive:", dragState.isActive);
  //
  //   // Only reset if we're not in the middle of a drag operation
  //   if (!AnimationHelper.isLocked() && !isAnimating && !dragState.isActive) {
  //     console.log("Resetting cubies and meshes ready flag");
  //     cubiesRef.current = [];
  //     cubeGenerationRef.current += 1;
  //     meshesReadyRef.current = false;
  //   }
  // }, [cubeState, isAnimating, dragState.isActive]);

  useEffect(() => {
    return () => {
      if (currentTweenRef.current) {
        currentTweenRef.current = null;
      }
      // Cleanup event listeners on unmount
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  const handleMeshReady = useCallback(
    (mesh: THREE.Mesh, x: number, y: number, z: number) => {
      // Check if this exact mesh is already in the array
      const existingMeshIndex = cubiesRef.current.findIndex(
        (cubie) => cubie.mesh === mesh
      );

      if (existingMeshIndex !== -1) {
        return;
      }

      // Prevent infinite loops by checking if we already have too many cubies
      if (cubiesRef.current.length >= 27) {
        return;
      }

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
    // Empty dependency array so this callback never changes
    []
  );

  return (
    <group ref={groupRef}>
      {cubeState.map((xLayer, x) =>
        xLayer.map((yLayer, y) =>
          yLayer.map((cube, z) => (
            <CubePiece
              key={`${x}-${y}-${z}`}
              position={[(x - 1) * 1.05, (y - 1) * 1.05, (z - 1) * 1.05]}
              colors={cube.colors}
              onPointerDown={handlePointerDown}
              onMeshReady={handleMeshReady}
            />
          ))
        )
      )}
    </group>
  );
};

export default RubiksCube3D;
