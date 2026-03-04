import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { AnimationHelper } from "@utils/animationHelper";
import CUBE_COLORS from "@/consts/cubeColours";
import type { RefObject } from "react";
import type { CubeState } from "@/types/cube";
import type { PieceMaterialData } from "@/components/RubiksCube3D/types";

interface UseCubeFrameLoopParams {
  groupRef: RefObject<THREE.Group | null>;
  camera: THREE.Camera;
  disableSliceDrag: boolean;
  updateDragRotation: () => void;
  updateSnappingAnimation: () => void;
  errorFlash: boolean;
  shakeTimeRef: RefObject<number>;
  previousErrorFlashRef: RefObject<boolean>;
  shakeVectorRef: RefObject<THREE.Vector3>;
  previousCube3D: CubeState[][][] | null | undefined;
  baselineCube3D: CubeState[][][] | null | undefined;
  colorFadeProgress: number;
  stickerGreyMap: Map<string, boolean> | undefined;
  dullOthersIntensity: number | undefined;
  highlightSet: Set<string>;
  pieceMaterialsRef: RefObject<Map<string, PieceMaterialData>>;
  wasAnimatingRef: RefObject<boolean>;
  animColorRef: RefObject<{
    grey: THREE.Color;
    white: THREE.Color;
    previous: THREE.Color;
    baseline: THREE.Color;
    lerped: THREE.Color;
    emissive: THREE.Color;
  }>;
}

function useCubeFrameLoop({
  groupRef,
  camera,
  disableSliceDrag,
  updateDragRotation,
  updateSnappingAnimation,
  errorFlash,
  shakeTimeRef,
  previousErrorFlashRef,
  shakeVectorRef,
  previousCube3D,
  baselineCube3D,
  colorFadeProgress,
  stickerGreyMap,
  dullOthersIntensity,
  highlightSet,
  pieceMaterialsRef,
  wasAnimatingRef,
  animColorRef,
}: UseCubeFrameLoopParams) {
  useFrame((_, delta) => {
    AnimationHelper.update();

    if (!disableSliceDrag) {
      updateDragRotation();
      updateSnappingAnimation();
    }

    if (errorFlash) {
      if (!previousErrorFlashRef.current) {
        shakeTimeRef.current = 0;
      }

      shakeTimeRef.current += delta;

      if (shakeTimeRef.current < 0.6 && groupRef.current) {
        const shakeIntensity = 0.07;
        const shakeSpeed = 1000;
        const decay = 1 - shakeTimeRef.current / 0.6;

        const cameraRight = shakeVectorRef.current;
        cameraRight.setFromMatrixColumn(camera.matrixWorld, 0);
        cameraRight.normalize();

        const shakeAmount =
          shakeIntensity * decay * Math.sin(shakeTimeRef.current * shakeSpeed);
        cameraRight.multiplyScalar(shakeAmount);

        groupRef.current.position.copy(cameraRight);
      } else if (groupRef.current) {
        groupRef.current.position.set(0, 0, 0);
      }
    } else if (groupRef.current && previousErrorFlashRef.current) {
      groupRef.current.position.set(0, 0, 0);
    }

    previousErrorFlashRef.current = errorFlash;

    const needsFade = !!(
      previousCube3D &&
      baselineCube3D &&
      colorFadeProgress > 0
    );
    const needsDulling = (dullOthersIntensity ?? 0) > 0;
    const needsAnimation = needsFade || needsDulling;

    if (!needsAnimation) {
      wasAnimatingRef.current = false;
      return;
    }

    const temps = animColorRef.current;

    for (const [key, pieceData] of pieceMaterialsRef.current) {
      const [x, y, z] = pieceData.gridIndex;
      const isHighlighted = highlightSet.has(key);

      for (const face in pieceData.materials) {
        const mat = pieceData.materials[face];
        const base = pieceData.baseColors[face];
        if (!mat || !base) continue;

        if (needsFade) {
          const faceKey = `${x},${y},${z},${face}`;
          const needsGreyFade = stickerGreyMap?.get(faceKey) ?? false;
          const prevColors = previousCube3D?.[x]?.[y]?.[z]?.colors;
          const baseColors = baselineCube3D?.[x]?.[y]?.[z]?.colors;

          if (prevColors && baseColors) {
            temps.previous.set(
              prevColors[face as keyof CubeState["colors"]] || CUBE_COLORS.BLACK
            );
            temps.baseline.set(
              baseColors[face as keyof CubeState["colors"]] || CUBE_COLORS.BLACK
            );

            if (colorFadeProgress <= 0.5) {
              const phase1Progress = Math.min(1, colorFadeProgress / 0.5);
              if (needsGreyFade) {
                temps.lerped
                  .copy(temps.previous)
                  .lerp(temps.grey, phase1Progress);
                mat.color.copy(temps.lerped);
              } else {
                mat.color.copy(temps.previous);
              }
            } else {
              const phase2Progress = Math.min(
                1,
                (colorFadeProgress - 0.5) / 0.5
              );
              const colorsDiffer =
                temps.previous.getHex() !== temps.baseline.getHex();
              if (needsGreyFade || colorsDiffer) {
                temps.lerped
                  .copy(needsGreyFade ? temps.grey : temps.previous)
                  .lerp(temps.baseline, phase2Progress);
                mat.color.copy(temps.lerped);
              } else {
                mat.color.copy(temps.previous);
              }
            }
            mat.needsUpdate = true;
          }
        } else if (needsDulling && !isHighlighted) {
          temps.lerped.copy(base).lerp(temps.grey, dullOthersIntensity ?? 0);
          mat.color.copy(temps.lerped);
          mat.needsUpdate = true;
        }
      }
    }

    wasAnimatingRef.current = needsAnimation;
  });
}

export default useCubeFrameLoop;
