import React, { useRef, useEffect, useLayoutEffect, useCallback, useMemo } from "react";
import { flushSync } from "react-dom";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { CubeMove, CubeState } from "@/types/cube";
import { AnimationHelper, type AnimatedCubie } from "@utils/animationHelper";
import CUBIE_STYLE_MAP from "@/config/cube/cubieStyleMap";
import { CUBIE_DISTANCE } from "./geometry";
import initBorderMeshes from "./borderMeshBuilder";
import useWhiteLogo from "@/hooks/useWhiteLogo";
import useDragLogic from "@/hooks/useDragLogic";
import useAnimation, { useImperativeHandle3D } from "@/hooks/useAnimation";
import CubePiece from "./CubePiece";
import type { RubiksCube3DProps, RubiksCube3DHandle, PieceMaterialData } from "./types";
import useLogoTexture from "@/hooks/useLogoTexture";
import useMaterialUpdates from "@/hooks/useMaterialUpdates";
import useCubeFrameLoop from "@/hooks/useCubeFrameLoop";

import useHoverLogic from "@/hooks/useHoverLogic";
import type { CustomWindowType } from "@/types/window";
import type { Tween } from "@tweenjs/tween.js";

THREE.Cache.enabled = true;

// Populate border mesh descriptors on each cubie style entry (runs once)
initBorderMeshes();

const RubiksCube3D = React.forwardRef<RubiksCube3DHandle, RubiksCube3DProps>(
  (
    {
      cubeState,
      previousCube3D,
      baselineCube3D,
      stickerGreyMap,
      colorFadeProgress = 0,
      pendingMove,
      onMoveAnimationDone,
      onStartAnimation,
      isAnimating,
      onOrbitControlsChange,
      touchCount = 0,
      isTimerMode = false,
      moveSource = null,
      queueFast = false,
      queueFastMs = null,
      inputDisabled = false,
      onDragMoveStart,
      children,
      highlightPositions,
      highlightIntensity: _highlightIntensity,
      dullOthersIntensity,
      disableSliceDrag = false,
      preventSliceMoves = false,
      pieceChildren,
      hideLogo = false,
      hideRightFace = false,
      hideFrontFace = false,
      hideLeftFace = false,
      hideBackFace = false,
      hideTopFace = false,
      hideBottomFace = false,
      errorFlash = false,
    }: RubiksCube3DProps,
    ref
  ) => {
    const { camera } = useThree();
    const groupRef = useRef<THREE.Group>(null);
    const commitGuardRef = useRef<{ move: string; t: number } | null>(null);
    const startGuardRef = useRef<string | null>(null);
    const cubiesRef = useRef<AnimatedCubie[]>([]);
    const raycastTargetsRef = useRef<THREE.Mesh[]>([]);
    const currentTweenRef = useRef<Tween>(null);
    const meshesReadyRef = useRef(false);
    const shakeTimeRef = useRef(0);
    const previousErrorFlashRef = useRef(false);
    
    const shakeVectorRef = useRef(new THREE.Vector3());
    
    const pieceMaterialsRef = useRef<Map<string, PieceMaterialData>>(new Map());
    const meshToPieceDataRef = useRef<Map<THREE.Mesh, PieceMaterialData>>(new Map());
    const wasAnimatingRef = useRef(false);
    const cubeStateRef = useRef(cubeState);
    const lastCompletedMoveRef = useRef<CubeMove | null>(null);
    const lastMoveSourceRef = useRef<string | null>(null);
    
    const updateMaterialsForFastSequence = useMaterialUpdates({
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
    });
    
    const animColorRef = useRef({
      grey: new THREE.Color("#808080"),
      white: new THREE.Color(0xffffff),
      previous: new THREE.Color(),
      baseline: new THREE.Color(),
      lerped: new THREE.Color(),
      emissive: new THREE.Color(),
    });
    
    const handleMaterialsReady = useCallback((key: string, data: PieceMaterialData) => {
      pieceMaterialsRef.current.set(key, data);
      const [gx, gy, gz] = data.gridIndex;
      const cubie = cubiesRef.current.find((c) => c.x === gx && c.y === gy && c.z === gz);
      if (cubie) {
        meshToPieceDataRef.current.set(cubie.mesh, data);
      }
    }, []);

    const { whiteLogoAngle, applyMoveToWhiteLogoAngle, resetLogo } =
      useWhiteLogo(cubeState);
    const { logoReady, solvzTexture } = useLogoTexture();
    const { handlePreciseHover, handleLeaveCube } = useHoverLogic(
      cubeState,
      groupRef,
      raycastTargetsRef,
      cubiesRef
    );
    
    const handleMeshReady = useCallback((mesh: THREE.Mesh, gridX: number, gridY: number, gridZ: number) => {
      if (!cubiesRef.current.some((c) => c.mesh === mesh)) {
        cubiesRef.current.push({
          mesh,
          x: gridX,
          y: gridY,
          z: gridZ,
          originalPosition: mesh.position.clone(),
        });
      }
      if (cubiesRef.current.length === 27) {
        meshesReadyRef.current = true;
      }
    }, []);

    const commitMoveOnce = useCallback(
      (move: CubeMove) => {
        const key = String(move).toUpperCase();
        const now = performance.now();
        const last = commitGuardRef.current;

        if (last && last.move === key && now - last.t < 200) {
          return;
        }

        commitGuardRef.current = { move: key, t: now };
        
        lastCompletedMoveRef.current = move;
        lastMoveSourceRef.current = moveSource || null;
        
        const isFastSequence = moveSource === "queue" && (queueFast || typeof queueFastMs === "number");
        
        if (onMoveAnimationDone) {
          flushSync(() => {
            onMoveAnimationDone(move);
            applyMoveToWhiteLogoAngle(move, groupRef, isFastSequence);
          });
        }
      },
      [onMoveAnimationDone, applyMoveToWhiteLogoAngle, moveSource]
    );
    

    const commitDragMove = useCallback(
      (move: CubeMove) => {
        onDragMoveStart?.();
        (window as CustomWindowType).__isManualDragMove = true;
        commitMoveOnce(move);
        (window as CustomWindowType).__isManualDragMove = false;
      },
      [commitMoveOnce, onDragMoveStart]
    );

    const { trackingStateRef, processPointerDown, cleanupDragState } =
      useDragLogic(
        groupRef,
        cubiesRef,
        commitDragMove,
        isTimerMode,
        preventSliceMoves
      );

    const { updateSnappingAnimation, updateDragRotation } = useAnimation(
      trackingStateRef,
      cleanupDragState,
      commitDragMove
    );

    const { handleBoundaryPointerDown } = useImperativeHandle3D(
      ref,
      groupRef,
      trackingStateRef,
      cleanupDragState,
      touchCount,
      isAnimating,
      onOrbitControlsChange,
      isTimerMode,
      inputDisabled,
      resetLogo
    );

    const handlePointerDown = useCallback(
      (
        e: React.PointerEvent,
        pos: [number, number, number],
        intersectionPoint: THREE.Vector3
      ) => {
        if (inputDisabled || isAnimating) {
          onOrbitControlsChange?.(true);
          return;
        }
        e.stopPropagation();

        if (disableSliceDrag) {
          onOrbitControlsChange && onOrbitControlsChange(true);
          return;
        }

        if (AnimationHelper.isLocked() || !meshesReadyRef.current) {
          const retryInteraction = () => {
            if (AnimationHelper.isLocked() || !meshesReadyRef.current) {
              requestAnimationFrame(retryInteraction);
              return;
            }

            const syntheticEvent = {
              stopPropagation: () => {},
              clientX: e.clientX,
              clientY: e.clientY,
              pointerId: e.pointerId,
              nativeEvent: e.nativeEvent,
            } as React.PointerEvent;

            processPointerDown(
              syntheticEvent,
              pos,
              intersectionPoint,
              onOrbitControlsChange
            );
          };

          requestAnimationFrame(retryInteraction);
          return;
        }

        processPointerDown(e, pos, intersectionPoint, onOrbitControlsChange);
      },
      [
        inputDisabled,
        isAnimating,
        disableSliceDrag,
        onOrbitControlsChange,
        processPointerDown,
      ]
    );

    // Update logo texture rotation synchronously in useLayoutEffect
    // This prevents flash when the logo rotates
    useLayoutEffect(() => {
      if (!solvzTexture) return;
      solvzTexture.rotation = whiteLogoAngle;
      solvzTexture.needsUpdate = true;
    }, [whiteLogoAngle, solvzTexture]);

    const logoTextureReady = logoReady && !!solvzTexture;

    useEffect(() => {
      if (!pendingMove) {
        startGuardRef.current = null;
        return;
      }

      const key = String(pendingMove).toUpperCase();

      if (startGuardRef.current === key) {
        return;
      }

      let cancelled = false;
      let rafId: number | null = null;

      const tryStart = () => {
        if (cancelled) return;

        const ready =
          !!groupRef.current &&
          cubiesRef.current.length === 27 &&
          !!meshesReadyRef.current &&
          !AnimationHelper.isLocked();

        if (!ready) {
          rafId = requestAnimationFrame(tryStart);
          return;
        }

        startGuardRef.current = key;
        commitGuardRef.current = null;

        let animationDuration = 150;
        if (moveSource === "undo" || moveSource === "redo") {
          animationDuration = 80;
        } else if (isTimerMode) {
          animationDuration = 120;
        }

        if (moveSource === "queue") {
          if (typeof queueFastMs === "number") {
            animationDuration = queueFastMs;
          } else if (queueFast) {
            animationDuration = 60;
          }
        }

        onStartAnimation && onStartAnimation();
        
        const currentMove = pendingMove;
        const isFastSequence = moveSource === "queue" && (queueFast || typeof queueFastMs === "number");
        
        currentTweenRef.current = AnimationHelper.animate(
          cubiesRef.current,
          groupRef.current!,
          pendingMove,
          () => {
            if (cancelled) return;
            commitMoveOnce(currentMove);
            currentTweenRef.current = null;
            startGuardRef.current = null;
          },
          animationDuration,
          isFastSequence,
          isFastSequence ? updateMaterialsForFastSequence : () => {}
        );
      };

      tryStart();

      return () => {
        cancelled = true;
        if (rafId !== null) cancelAnimationFrame(rafId);
      };
    }, [
      pendingMove,
      onStartAnimation,
      commitMoveOnce,
      moveSource,
      isTimerMode,
      cubeState,
      queueFast,
      queueFastMs,
      updateMaterialsForFastSequence,
    ]);

    const highlightSet = useMemo(() => {
      if (!highlightPositions || highlightPositions.length === 0) {
        return new Set<string>();
      }
      return new Set(highlightPositions.map(([x, y, z]) => `${x},${y},${z}`));
    }, [highlightPositions]);

    useCubeFrameLoop({
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
    });

    const handlePointerDownRef = useRef(handlePointerDown);
    handlePointerDownRef.current = handlePointerDown;
    const stableHandlePointerDown = useCallback(
      (e: React.PointerEvent, pos: [number, number, number], intersectionPoint: THREE.Vector3) =>
        handlePointerDownRef.current(e, pos, intersectionPoint),
      []
    );

    const handleMeshReadyRef = useRef(handleMeshReady);
    handleMeshReadyRef.current = handleMeshReady;
    const stableHandleMeshReady = useCallback(
      (mesh: THREE.Mesh, gridX: number, gridY: number, gridZ: number) =>
        handleMeshReadyRef.current(mesh, gridX, gridY, gridZ),
      []
    );

    const handleMaterialsReadyRef = useRef(handleMaterialsReady);
    handleMaterialsReadyRef.current = handleMaterialsReady;
    const stableHandleMaterialsReady = useCallback(
      (key: string, data: PieceMaterialData) =>
        handleMaterialsReadyRef.current(key, data),
      []
    );

    const pieceChildrenRef = useRef(pieceChildren);
    pieceChildrenRef.current = pieceChildren;
    const stablePieceChildren = useCallback(
      (x: number, y: number, z: number, piece: CubeState) =>
        pieceChildrenRef.current?.(x, y, z, piece),
      []
    );

    const cubePieces = useMemo(() => {
      if (!logoTextureReady) return null;

      const nodes: React.ReactNode[] = [];
      cubeState.forEach((plane, x) => {
        if (hideRightFace && x === 2) {
          return;
        }
        if (hideLeftFace && x === 0) {
          return;
        }
        plane.forEach((row, y) => {
          if (hideTopFace && y === 2) {
            return;
          }
          if (hideBottomFace && y === 0) {
            return;
          }
          row.forEach((cubie, z) => {
            if (hideFrontFace && z === 2) {
              return;
            }
            if (hideBackFace && z === 0) {
              return;
            }
            const cubieKey = `${x},${y},${z}`;
            const styleEntry = CUBIE_STYLE_MAP[cubieKey];
            const cornerStyles = styleEntry?.cornerBuilder || [];
            const isHighlighted = highlightSet.has(cubieKey);
            
            const previousColors = previousCube3D?.[x]?.[y]?.[z]?.colors || null;
            const baselineColors = baselineCube3D?.[x]?.[y]?.[z]?.colors || null;
            
            nodes.push(
              <CubePiece
                key={cubieKey}
                position={[
                  (x - 1) * CUBIE_DISTANCE,
                  (y - 1) * CUBIE_DISTANCE,
                  (z - 1) * CUBIE_DISTANCE,
                ]}
                gridIndex={[x, y, z]}
                colors={cubie.colors}
                previousColors={previousColors}
                baselineColors={baselineColors}
                stickerGreyMap={stickerGreyMap}
                colorFadeProgress={colorFadeProgress}
                sharedLogoTexture={solvzTexture}
                logoReady={logoReady}
                hideLogo={hideLogo}
                touchCount={touchCount}
                cornerStyles={cornerStyles}
                isHighlighted={isHighlighted}
                highlightIntensity={0}
                dullOthersIntensity={!isHighlighted ? (dullOthersIntensity ?? 0) : 0}
                trackingStateRef={trackingStateRef}
                onPointerDown={stableHandlePointerDown}
                onMeshReady={stableHandleMeshReady}
                onMaterialsReady={stableHandleMaterialsReady}
                onPointerMove={undefined}
              >
                {styleEntry?.borderMeshes?.map((bm, idx) => {
                  if (!bm.cylinder) return null;
                  const { radius, length, segments = 8 } = bm.cylinder;
                  const [px, py, pz] = bm.position;
                  const rot = bm.rotation || [0, 0, 0];
                  return (
                    <mesh
                      key={idx}
                      position={[px, py, pz]}
                      rotation={rot}
                      renderOrder={1}
                    >
                      <cylinderGeometry
                        args={[radius, radius, length, segments]}
                      />
                      <meshPhongMaterial
                        color={bm.color || "#222"}
                        toneMapped={true}
                        polygonOffset={true}
                        polygonOffsetFactor={0}
                        polygonOffsetUnits={-1000}
                      />
                    </mesh>
                  );
                })}
                {stablePieceChildren(x, y, z, cubie)}
              </CubePiece>
            );
          });
        });
      });
      return nodes;
    }, [
      logoTextureReady,
      cubeState,
      previousCube3D,
      baselineCube3D,
      stickerGreyMap,
      colorFadeProgress,
      hideRightFace,
      hideFrontFace,
      hideLeftFace,
      hideBackFace,
      hideTopFace,
      hideBottomFace,
      highlightSet,
      dullOthersIntensity,
      solvzTexture,
      logoReady,
      hideLogo,
      touchCount,
      stableHandlePointerDown,
      stableHandleMeshReady,
      stableHandleMaterialsReady,
      stablePieceChildren,
    ]);

    return (
      <group
        ref={groupRef}
        onPointerLeave={handleLeaveCube}
        onPointerMove={handlePreciseHover}
        onPointerDown={handleBoundaryPointerDown}
      >
        {children}
        {cubePieces}
      </group>
    );
  }
);

export default RubiksCube3D;
