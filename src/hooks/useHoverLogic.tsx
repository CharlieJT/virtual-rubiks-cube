import { useRef, useCallback } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import CUBE_COLORS from "@/consts/cubeColours";

const useHoverLogic = (
  cubeState: any[][][],
  groupRef: React.RefObject<THREE.Group | null>,
  raycastTargetsRef: React.RefObject<THREE.Mesh[]>,
  cubiesRef: React.RefObject<any[]>
) => {
  const { camera } = useThree();
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const lastHoveredPieceRef = useRef<string | null>(null);

  const handlePreciseHover = useCallback(
    (e: any) => {
      if (!groupRef.current) return;
      const rect = e.nativeEvent.target?.getBoundingClientRect();
      const mouse = mouseRef.current;
      mouse.set(
        ((e.nativeEvent.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.nativeEvent.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = raycasterRef.current;
      // Use the scene's actual camera to avoid allocating a new camera per move (mobile stability)
      raycaster.setFromCamera(mouse, camera);

      const targets =
        raycastTargetsRef.current?.length > 0
          ? raycastTargetsRef.current
          : (() => {
              const all: THREE.Mesh[] = [];
              groupRef.current!.traverse((child) => {
                if (
                  child instanceof THREE.Mesh &&
                  child.parent === groupRef.current
                ) {
                  all.push(child);
                }
              });
              if (raycastTargetsRef.current) {
                raycastTargetsRef.current = all;
              }
              return all;
            })();

      const intersects = raycaster.intersectObjects(targets);
      if (intersects.length === 0) {
        lastHoveredPieceRef.current = null;
        return;
      }

      const intersectedMesh = intersects[0].object as THREE.Mesh;
      const intersectionPoint = intersects[0].point;

      // Find the corresponding cubie
      const cubie = cubiesRef.current?.find((c) => c.mesh === intersectedMesh);
      if (!cubie) return;

      const cubieCenter = new THREE.Vector3(
        (cubie.x - 1) * 1.05,
        (cubie.y - 1) * 1.05,
        (cubie.z - 1) * 1.05
      );

      const halfSize = 0.4655;
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

      if (faceColor === "#808080" || faceColor === CUBE_COLORS.BLACK) return;

      const pieceId = `${gridPos[0]},${gridPos[1]},${gridPos[2]}|${faceName}`;

      if (lastHoveredPieceRef.current === pieceId) return;

      lastHoveredPieceRef.current = pieceId;
    },
    [cubeState, camera, groupRef, raycastTargetsRef, cubiesRef]
  );

  const handleLeaveCube = useCallback(() => {
    lastHoveredPieceRef.current = null;
  }, []);

  return {
    handlePreciseHover,
    handleLeaveCube,
  };
};

export default useHoverLogic;
