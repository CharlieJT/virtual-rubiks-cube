import { useLayoutEffect, useCallback } from "react";
import * as THREE from "three";
import type { RefObject } from "react";
import type { CubeState, CubeMove } from "@/types/cube";
import type { AnimatedCubie } from "@utils/animationHelper";
import type { PieceMaterialData } from "@/components/RubiksCube3D/types";

interface UseMaterialUpdatesParams {
  cubeState: CubeState[][][];
  cubiesRef: RefObject<AnimatedCubie[]>;
  pieceMaterialsRef: RefObject<Map<string, PieceMaterialData>>;
  meshToPieceDataRef: RefObject<Map<THREE.Mesh, PieceMaterialData>>;
  cubeStateRef: RefObject<CubeState[][][]>;
  skipNextLayoutSyncRef: RefObject<boolean>;
  pauseLayoutMaterialSync?: boolean;
}


const _sliceQuat = new THREE.Quaternion();
const _sliceAxisX = new THREE.Vector3(1, 0, 0);
const _sliceAxisY = new THREE.Vector3(0, 1, 0);
const _sliceAxisZ = new THREE.Vector3(0, 0, 1);

const SLICE_GROUP_ROTATION_MAP: Record<string, [THREE.Vector3, number]> = {
  M: [_sliceAxisX, Math.PI / 2],
  "M'": [_sliceAxisX, -Math.PI / 2],
  M2: [_sliceAxisX, Math.PI],
  E: [_sliceAxisY, Math.PI / 2],
  "E'": [_sliceAxisY, -Math.PI / 2],
  E2: [_sliceAxisY, Math.PI],
  S: [_sliceAxisZ, -Math.PI / 2],
  "S'": [_sliceAxisZ, Math.PI / 2],
  S2: [_sliceAxisZ, Math.PI],
};

export function isSliceMove(move: CubeMove | string): boolean {
  const base = String(move).replace(/['2]/g, "")[0];
  return base === "M" || base === "E" || base === "S";
}

/** Apply camera-space cube rotation for M/E/S (logical state already transformed in cubejs). */
export function applySliceGroupRotation(
  move: CubeMove,
  group: THREE.Group | null,
): void {
  if (!group) return;
  const moveStr = String(move).toUpperCase();
  const rotation = SLICE_GROUP_ROTATION_MAP[moveStr];
  if (!rotation) return;
  const [axis, angle] = rotation;
  _sliceQuat.setFromAxisAngle(axis, angle);
  group.quaternion.multiply(_sliceQuat);
}

export function syncCubieMaterialsFromState(
  currentState: CubeState[][][],
  cubies: readonly AnimatedCubie[],
  pieceMaterialsRef: RefObject<Map<string, PieceMaterialData>>,
  meshToPieceDataRef: RefObject<Map<THREE.Mesh, PieceMaterialData>>,
) {
  for (const cubie of cubies) {
    const newPiece = currentState[cubie.x]?.[cubie.y]?.[cubie.z];
    if (!newPiece) continue;

    const key = `${cubie.x},${cubie.y},${cubie.z}`;
    let pieceData = meshToPieceDataRef.current.get(cubie.mesh);
    if (!pieceData) {
      pieceData = pieceMaterialsRef.current.get(key);
      if (pieceData) {
        meshToPieceDataRef.current.set(cubie.mesh, pieceData);
      } else {
        continue;
      }
    }

    pieceData.gridIndex = [cubie.x, cubie.y, cubie.z];

    for (const face in pieceData.materials) {
      const mat = pieceData.materials[face];
      const newColor = newPiece.colors[face as keyof CubeState["colors"]];
      if (mat && newColor) {
        mat.color.set(newColor);
        if (!pieceData.baseColors[face]) {
          pieceData.baseColors[face] = new THREE.Color();
        }
        pieceData.baseColors[face].set(newColor);
      }
    }
  }
}

function useMaterialUpdates({
  cubeState,
  cubiesRef,
  pieceMaterialsRef,
  meshToPieceDataRef,
  cubeStateRef,
  skipNextLayoutSyncRef,
  pauseLayoutMaterialSync = false,
}: UseMaterialUpdatesParams) {
  const syncAllMaterials = useCallback(
    (state: CubeState[][][]) => {
      cubeStateRef.current = state;
      syncCubieMaterialsFromState(
        state,
        cubiesRef.current,
        pieceMaterialsRef,
        meshToPieceDataRef,
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Keep GPU sticker colors aligned when cubeState changes outside move commit (reset, fade, etc.)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    cubeStateRef.current = cubeState;
    if (skipNextLayoutSyncRef.current) {
      skipNextLayoutSyncRef.current = false;
      return;
    }
    if (pauseLayoutMaterialSync) {
      return;
    }
    syncCubieMaterialsFromState(
      cubeState,
      cubiesRef.current,
      pieceMaterialsRef,
      meshToPieceDataRef,
    );
  }, [cubeState, pauseLayoutMaterialSync]);

  return syncAllMaterials;
}

export default useMaterialUpdates;
