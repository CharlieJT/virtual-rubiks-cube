import { useEffect, useRef, useCallback, useMemo } from "react";
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

  // Create materials array using useMemo that updates when colors change
  const materials = useMemo(() => {
    // BoxGeometry material mapping (based on Three.js documentation):
    // 0: Right face (+X), 1: Left face (-X), 2: Top face (+Y),
    // 3: Bottom face (-Y), 4: Front face (+Z), 5: Back face (-Z)
    return [
      new THREE.MeshPhongMaterial({ color: colors.right }), // 0: Right face (+X)
      new THREE.MeshPhongMaterial({ color: colors.left }), // 1: Left face (-X)
      new THREE.MeshPhongMaterial({ color: colors.top }), // 2: Top face (+Y)
      new THREE.MeshPhongMaterial({ color: colors.bottom }), // 3: Bottom face (-Y)
      new THREE.MeshPhongMaterial({ color: colors.front }), // 4: Front face (+Z)
      new THREE.MeshPhongMaterial({ color: colors.back }), // 5: Back face (-Z)
    ];
  }, [
    colors.right,
    colors.left,
    colors.top,
    colors.bottom,
    colors.front,
    colors.back,
  ]);

  return (
    <mesh
      ref={meshRef}
      position={position}
      material={materials}
      onPointerDown={(e) => {
        // Determine which face was clicked - simplified for now
        onPointerDown?.(e, position, "front");
      }}
    >
      <boxGeometry args={[0.95, 0.95, 0.95]} />

      {/* Add wireframe like sanqit-rubik project */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(0.95, 0.95, 0.95)]} />
        <lineBasicMaterial color="#000000" linewidth={1} />
      </lineSegments>
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
