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
        onPointerDown?.(e, position, "front");
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

  const handlePointerMove = () => {};

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

  useEffect(() => {
    if (!AnimationHelper.isLocked() && !isAnimating) {
      cubiesRef.current = [];
      cubeGenerationRef.current += 1;
      meshesReadyRef.current = false;
    }
  }, [cubeState, isAnimating]);

  useEffect(() => {
    return () => {
      if (currentTweenRef.current) {
        currentTweenRef.current = null;
      }
    };
  }, []);

  const handleMeshReady = useCallback(
    (mesh: THREE.Mesh, x: number, y: number, z: number) => {
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

      if (cubiesRef.current.length === 27) {
        meshesReadyRef.current = true;
      }
    },
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
