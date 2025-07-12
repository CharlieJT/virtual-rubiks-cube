import { useEffect, useRef, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js"; // Use default import
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

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.95, 0.95, 0.95]} />
      <meshStandardMaterial color="#1a1a1a" />

      {/* Front face */}
      <mesh
        position={[0, 0, 0.48]}
        onPointerDown={(e) => onPointerDown?.(e, position, "front")}
      >
        <planeGeometry args={[0.9, 0.9]} />
        <meshStandardMaterial color={colors.front} />
      </mesh>

      {/* Back face */}
      <mesh
        position={[0, 0, -0.48]}
        rotation={[0, Math.PI, 0]}
        onPointerDown={(e) => onPointerDown?.(e, position, "back")}
        frustumCulled={false}
      >
        <planeGeometry args={[0.9, 0.9]} />
        <meshStandardMaterial color={colors.back} />
      </mesh>

      {/* Left face */}
      <mesh
        position={[-0.48, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        onPointerDown={(e) => onPointerDown?.(e, position, "left")}
        frustumCulled={false}
      >
        <planeGeometry args={[0.9, 0.9]} />
        <meshStandardMaterial color={colors.left} />
      </mesh>

      {/* Right face */}
      <mesh
        position={[0.48, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        onPointerDown={(e) => onPointerDown?.(e, position, "right")}
        frustumCulled={false}
      >
        <planeGeometry args={[0.9, 0.9]} />
        <meshStandardMaterial color={colors.right} />
      </mesh>

      {/* Top face */}
      <mesh
        position={[0, 0.48, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={(e) => onPointerDown?.(e, position, "top")}
        frustumCulled={false}
      >
        <planeGeometry args={[0.9, 0.9]} />
        <meshStandardMaterial color={colors.top} />
      </mesh>

      {/* Bottom face */}
      <mesh
        position={[0, -0.48, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        onPointerDown={(e) => onPointerDown?.(e, position, "bottom")}
        frustumCulled={false}
      >
        <planeGeometry args={[0.9, 0.9]} />
        <meshStandardMaterial color={colors.bottom} />
      </mesh>
    </mesh>
  );
};

const RubiksCube3D = ({
  cubeState,
  pendingMove,
  onMoveAnimationDone,
  onStartAnimation,
}: RubiksCube3DProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const cubiesRef = useRef<AnimatedCubie[]>([]);
  const currentTweenRef = useRef<any>(null);
  const dragInfo = useRef<{
    start: [number, number, number];
    face: string;
    pointer: [number, number];
  } | null>(null);

  // Update TWEEN on every frame
  useFrame(() => {
    if (currentTweenRef.current) {
      // Only update the specific tween group if it exists
      const tweenGroup = (currentTweenRef.current as any)?._group;
      if (tweenGroup) {
        tweenGroup.update();
      }
    } else {
      // Update global TWEEN only when no specific tween is running
      TWEEN.update();
    }
  });

  // Handle pending moves
  useEffect(() => {
    if (
      pendingMove &&
      !AnimationHelper.isLocked() &&
      groupRef.current &&
      cubiesRef.current.length === 27
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
  }, [pendingMove, onStartAnimation, onMoveAnimationDone]); // Remove cubeState dependency

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

  // Update cubies ref when cube state changes
  useEffect(() => {
    // Rebuild cubies array when cube state changes to ensure sync
    cubiesRef.current = [];
  }, [cubeState]);

  const handleMeshReady = useCallback(
    (mesh: THREE.Mesh, x: number, y: number, z: number) => {
      // Don't check for existing - always add since we rebuild the array on state changes
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
    },
    [cubeState]
  ); // Add cubeState as dependency

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
