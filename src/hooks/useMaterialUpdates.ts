import { useLayoutEffect, useCallback } from "react";
import * as THREE from "three";
import type { RefObject } from "react";
import type { CubeState, CubeMove } from "@/types/cube";
import type { AnimatedCubie } from "@utils/animationHelper";
import type { PieceMaterialData } from "@/components/RubiksCube3D/types";

interface UseMaterialUpdatesParams {
  cubeState: CubeState[][][];
  queueFast: boolean;
  queueFastMs: number | null;
  groupRef: RefObject<THREE.Group | null>;
  cubiesRef: RefObject<AnimatedCubie[]>;
  pieceMaterialsRef: RefObject<Map<string, PieceMaterialData>>;
  meshToPieceDataRef: RefObject<Map<THREE.Mesh, PieceMaterialData>>;
  lastCompletedMoveRef: RefObject<CubeMove | null>;
  lastMoveSourceRef: RefObject<string | null>;
  cubeStateRef: RefObject<CubeState[][][]>;
}

function useMaterialUpdates({
  cubeState,
  queueFast,
  queueFastMs,
  groupRef,
  cubiesRef,
  pieceMaterialsRef,
  meshToPieceDataRef,
  lastCompletedMoveRef,
  lastMoveSourceRef,
  cubeStateRef,
}: UseMaterialUpdatesParams) {
  const updateMaterialsForFastSequence = useCallback(() => {
    const currentState = cubeStateRef.current;

    for (const cubie of cubiesRef.current) {
      const key = `${cubie.x},${cubie.y},${cubie.z}`;
      const pieceData = pieceMaterialsRef.current.get(key);
      if (pieceData) {
        meshToPieceDataRef.current.set(cubie.mesh, pieceData);
      }
    }

    for (const cubie of cubiesRef.current) {
      const newPiece = currentState[cubie.x]?.[cubie.y]?.[cubie.z];
      if (!newPiece) continue;

      let pieceData = meshToPieceDataRef.current.get(cubie.mesh);

      if (!pieceData) {
        const key = `${cubie.x},${cubie.y},${cubie.z}`;
        pieceData = pieceMaterialsRef.current.get(key);
        if (pieceData) {
          meshToPieceDataRef.current.set(cubie.mesh, pieceData);
        } else {
          if (!(cubie.x === 1 && cubie.y === 1 && cubie.z === 1)) {
            continue;
          }
          continue;
        }
      }

      if (pieceData) {
        for (const face in pieceData.materials) {
          const mat = pieceData.materials[face];
          const newColor = newPiece.colors[face as keyof CubeState["colors"]];
          if (mat && newColor) {
            mat.color.set(newColor);
            mat.needsUpdate = true;
            pieceData.baseColors[face] = new THREE.Color(newColor);
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Runs before paint to prevent flash
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const prevState = cubeStateRef.current;
    cubeStateRef.current = cubeState;

    // Sync group rotation for slice moves (skip fast sequences to avoid lag)
    const lastMove = lastCompletedMoveRef.current;
    const moveSource = lastMoveSourceRef.current;
    const isFastSequence =
      moveSource === "queue" && (queueFast || typeof queueFastMs === "number");

    if (lastMove && !isFastSequence) {
      const moveStr = String(lastMove).toUpperCase();
      const base = moveStr.replace(/['2]/g, "")[0];
      const isSliceMove = base === "M" || base === "E" || base === "S";

      if (isSliceMove && groupRef.current) {
        const coordinateRotationMap: Record<
          string,
          [THREE.Vector3, number]
        > = {
          M: [new THREE.Vector3(1, 0, 0), Math.PI / 2],
          "M'": [new THREE.Vector3(1, 0, 0), -Math.PI / 2],
          M2: [new THREE.Vector3(1, 0, 0), Math.PI],
          E: [new THREE.Vector3(0, 1, 0), Math.PI / 2],
          "E'": [new THREE.Vector3(0, 1, 0), -Math.PI / 2],
          E2: [new THREE.Vector3(0, 1, 0), Math.PI],
          S: [new THREE.Vector3(0, 0, 1), -Math.PI / 2],
          "S'": [new THREE.Vector3(0, 0, 1), Math.PI / 2],
          S2: [new THREE.Vector3(0, 0, 1), Math.PI],
        };

        const rotation = coordinateRotationMap[moveStr];
        if (rotation) {
          const [axis, angle] = rotation;
          const q = new THREE.Quaternion().setFromAxisAngle(axis, angle);
          groupRef.current.quaternion.multiply(q);
        }
      }
    }

    if (lastMove) {
      lastCompletedMoveRef.current = null;
      lastMoveSourceRef.current = null;
    }

    // Fast sequences update materials via updateMaterialsForFastSequence instead
    if (!isFastSequence) {
      for (const cubie of cubiesRef.current) {
        const pieceData = meshToPieceDataRef.current.get(cubie.mesh);
        if (!pieceData) continue;

        const newPiece = cubeState[cubie.x]?.[cubie.y]?.[cubie.z];
        const oldPiece = prevState[cubie.x]?.[cubie.y]?.[cubie.z];

        if (!newPiece) continue;

        pieceData.gridIndex = [cubie.x, cubie.y, cubie.z];

        let colorsChanged = false;
        if (!oldPiece) {
          colorsChanged = true;
        } else {
          for (const face in newPiece.colors) {
            if (
              newPiece.colors[face as keyof CubeState["colors"]] !==
              oldPiece.colors[face as keyof CubeState["colors"]]
            ) {
              colorsChanged = true;
              break;
            }
          }
        }

        if (colorsChanged) {
          for (const face in pieceData.materials) {
            const mat = pieceData.materials[face];
            const newColor = newPiece.colors[face as keyof CubeState["colors"]];
            if (mat && newColor) {
              mat.color.set(newColor);
              mat.needsUpdate = true;
              pieceData.baseColors[face] = new THREE.Color(newColor);
            }
          }
        }
      }
    }
  }, [cubeState]);

  return updateMaterialsForFastSequence;
}

export default useMaterialUpdates;
