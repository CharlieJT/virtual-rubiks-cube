import { useEffect, useRef, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CubeState, CubeMove } from "../types/cube";
import { AnimationHelper, type AnimatedCubie } from "../utils/animationHelper";

interface CubePieceProps {
  position: [number, number, number];
  colors: CubeState["colors"];
  onPointerDown?: (e: any, pos: [number, number, number], face: string) => void;
  onMeshReady?: (mesh: THREE.Mesh, x: number, y: number, z: number) => void;
}

interface RubiksCube3DProps {
  cubeState: CubeState[][][];
  pendingMove?: CubeMove | null;
  onMoveAnimationDone?: (move: CubeMove) => void;
  onStartAnimation?: () => void;
  isAnimating?: boolean;
}

const CubePiece = ({
  position,
  colors,
  onPointerDown,
  onMeshReady,
}: CubePieceProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const cubeFaces = [
    {
      face: "front",
      pos: [0, 0, 0.48],
      rot: [0, 0, 0],
    },
    {
      face: "back",
      pos: [0, 0, -0.48],
      rot: [0, Math.PI, 0],
    },
    {
      face: "left",
      pos: [-0.48, 0, 0],
      rot: [0, -Math.PI / 2, 0],
    },
    {
      face: "right",
      pos: [0.48, 0, 0],
      rot: [0, Math.PI / 2, 0],
    },
    {
      face: "top",
      pos: [0, 0.48, 0],
      rot: [-Math.PI / 2, 0, 0],
    },
    {
      face: "bottom",
      pos: [0, -0.48, 0],
      rot: [Math.PI / 2, 0, 0],
    },
  ] as const;

  useEffect(() => {
    if (meshRef.current && onMeshReady) {
      const [x, y, z] = position;
      // Convert position back to array indices
      const gridX = Math.round(x / 1.05 + 1);
      const gridY = Math.round(y / 1.05 + 1);
      const gridZ = Math.round(z / 1.05 + 1);

      onMeshReady(meshRef.current, gridX, gridY, gridZ);
    }
  }, [position, onMeshReady]);

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.95, 0.95, 0.95]} />
      <meshStandardMaterial color="#1a1a1a" />

      {cubeFaces.map(({ face, pos, rot }) => (
        <mesh
          key={face}
          position={pos as [number, number, number]}
          rotation={rot as [number, number, number]}
          onPointerDown={(e) => onPointerDown?.(e, position, face)}
          frustumCulled={false}
        >
          <planeGeometry args={[0.9, 0.9]} />
          <meshStandardMaterial color={colors[face as keyof typeof colors]} />
        </mesh>
      ))}
    </mesh>
  );
};

const RubiksCube3D = ({
  cubeState,
  pendingMove,
  onMoveAnimationDone,
  onStartAnimation,
  isAnimating,
}: RubiksCube3DProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const cubiesRef = useRef<AnimatedCubie[]>([]);
  const currentTweenRef = useRef<any>(null);
  const cubeGenerationRef = useRef(0);
  const meshesReadyRef = useRef(false);
  const dragInfo = useRef<{
    start: [number, number, number];
    face: string;
    pointer: [number, number];
  } | null>(null);

  // No longer need TWEEN updates since we're using requestAnimationFrame
  useFrame(() => {
    // Empty - no TWEEN to update
  });

  // Handle pending moves
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

  // Helper to map drag to move
  const getMove = (face: string, end: [number, number]): CubeMove | null => {
    const dx = end[0] - (dragInfo.current?.pointer[0] ?? 0);
    const dy = end[1] - (dragInfo.current?.pointer[1] ?? 0);

    if (face === "top") {
      if (Math.abs(dx) > Math.abs(dy)) {
        return dx > 0 ? "U" : "U'";
      }
    }
    if (face === "left") {
      if (Math.abs(dy) > Math.abs(dx)) {
        return dy < 0 ? "L" : "L'";
      }
    }
    if (face === "front") {
      if (Math.abs(dx) > Math.abs(dy)) {
        return dx > 0 ? "F" : "F'";
      }
    }
    return null;
  };

  const handlePointerDown = (
    e: any,
    pos: [number, number, number],
    face: string
  ) => {
    if (AnimationHelper.isLocked()) return;

    dragInfo.current = {
      start: pos,
      face,
      pointer: [e.clientX, e.clientY],
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handlePointerMove = () => {
    // Only handle on pointer up for now
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (dragInfo.current && !AnimationHelper.isLocked() && groupRef.current) {
      const move = getMove(dragInfo.current.face, [e.clientX, e.clientY]);
      if (move) {
        onStartAnimation && onStartAnimation();

        currentTweenRef.current = AnimationHelper.animate(
          cubiesRef.current,
          groupRef.current,
          move,
          () => {
            onMoveAnimationDone && onMoveAnimationDone(move);
            currentTweenRef.current = null;
          }
        );
      }
    }
    dragInfo.current = null;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  };

  // Update cubies ref when cube state changes - but not during animation
  useEffect(() => {
    // Only rebuild cubies array if not currently animating
    if (!AnimationHelper.isLocked() && !isAnimating) {
      // Clear the array to trigger rebuilding and increment generation
      cubiesRef.current = [];
      cubeGenerationRef.current += 1;
      meshesReadyRef.current = false;
    }
  }, [cubeState, isAnimating]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Clean up any running animations on component unmount
      if (currentTweenRef.current) {
        currentTweenRef.current = null;
      }
    };
  }, []);

  const handleMeshReady = useCallback(
    (mesh: THREE.Mesh, x: number, y: number, z: number) => {
      // Don't add if we already have this position in the current array
      const existingIndex = cubiesRef.current.findIndex(
        (cubie) => cubie.x === x && cubie.y === y && cubie.z === z
      );

      if (existingIndex !== -1) {
        // Update existing cubie with new mesh reference
        cubiesRef.current[existingIndex].mesh = mesh;
      } else {
        // Add new cubie
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

      // Check if all meshes are ready
      if (cubiesRef.current.length === 27) {
        meshesReadyRef.current = true;
      }
    },
    [] // Remove cubeState dependency to make this stable
  );

  // Render cubies
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
