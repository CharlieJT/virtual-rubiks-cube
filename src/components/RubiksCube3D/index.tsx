import React, { useRef, useEffect, useCallback, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { CubeMove } from "@/types/cube";
import { AnimationHelper, type AnimatedCubie } from "@utils/animationHelper";
import CUBIE_STYLE_MAP from "@/config/cube/cubieStyleMap";
import {
  BORDER_RADIUS,
  BORDER_DEPTH,
  CUBIE_DISTANCE,
  BORDER_LENGTH,
} from "./geometry";
import useWhiteLogo from "@/hooks/useWhiteLogo";
import useDragLogic from "@/hooks/useDragLogic";
import useAnimation, { useImperativeHandle3D } from "@/hooks/useAnimation";
import CubePiece from "./CubePiece";
import type { RubiksCube3DProps, RubiksCube3DHandle } from "./types";
import useLogoTexture from "@/hooks/useLogoTexture";
import useRoundedBoxGeometry from "@/hooks/useRoundedBoxGeometry";
import useHoverLogic from "@/hooks/useHoverLogic";
import type { CustomWindowType } from "@/types/window";
import type { Tween } from "@tweenjs/tween.js";

THREE.Cache.enabled = true;

Object.entries(CUBIE_STYLE_MAP).forEach(([key, entry]) => {
  if (!entry) return;

  if (!entry.borderMeshes) {
    entry.borderMeshes = [];
  }

  if (entry.borderMeshes.length > 0) return;
  const [x, y, z] = key.split(",").map(Number);
  const extremes = [x, y, z].filter((c) => c === 0 || c === 2).length;
  const isCorner = extremes === 3;
  const isEdge = extremes === 2 && (x === 1 || y === 1 || z === 1);

  if (isCorner) {
    if (x === 0 && y === 0 && z === 0) {
      entry.borderMeshes.push(
        {
          position: [0, -BORDER_DEPTH, -BORDER_DEPTH],
          rotation: [0, 0, Math.PI / 2],
          cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
        },
        {
          position: [-BORDER_DEPTH, 0, -BORDER_DEPTH],
          rotation: [0, 0, 0],
          cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
        },
        {
          position: [-BORDER_DEPTH, -BORDER_DEPTH, 0],
          rotation: [Math.PI / 2, 0, 0],
          cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
        }
      );
    } else if (x === 0 && y === 0 && z === 2) {
      entry.borderMeshes.push(
        {
          position: [0, -BORDER_DEPTH, BORDER_DEPTH],
          rotation: [0, 0, Math.PI / 2],
          cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
        },
        {
          position: [-BORDER_DEPTH, 0, BORDER_DEPTH],
          rotation: [0, 0, 0],
          cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
        },
        {
          position: [-BORDER_DEPTH, -BORDER_DEPTH, 0],
          rotation: [Math.PI / 2, 0, 0],
          cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
        }
      );
    } else if (x === 0 && y === 2 && z === 0) {
      entry.borderMeshes.push(
        {
          position: [0, BORDER_DEPTH, -BORDER_DEPTH],
          rotation: [0, 0, Math.PI / 2],
          cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
        },
        {
          position: [-BORDER_DEPTH, 0, -BORDER_DEPTH],
          rotation: [0, 0, 0],
          cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
        },
        {
          position: [-BORDER_DEPTH, BORDER_DEPTH, 0],
          rotation: [Math.PI / 2, 0, 0],
          cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
        }
      );
    } else if (x === 0 && y === 2 && z === 2) {
      entry.borderMeshes.push(
        {
          position: [0, BORDER_DEPTH, BORDER_DEPTH],
          rotation: [0, 0, Math.PI / 2],
          cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
        },
        {
          position: [-BORDER_DEPTH, 0, BORDER_DEPTH],
          rotation: [0, 0, 0],
          cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
        },
        {
          position: [-BORDER_DEPTH, BORDER_DEPTH, 0],
          rotation: [Math.PI / 2, 0, 0],
          cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
        }
      );
    } else if (x === 2 && y === 0 && z === 0) {
      entry.borderMeshes.push(
        {
          position: [0, -BORDER_DEPTH, -BORDER_DEPTH],
          rotation: [0, 0, Math.PI / 2],
          cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
        },
        {
          position: [BORDER_DEPTH, 0, -BORDER_DEPTH],
          rotation: [0, 0, 0],
          cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
        },
        {
          position: [BORDER_DEPTH, -BORDER_DEPTH, 0],
          rotation: [Math.PI / 2, 0, 0],
          cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
        }
      );
    } else if (x === 2 && y === 0 && z === 2) {
      entry.borderMeshes.push(
        {
          position: [0, -BORDER_DEPTH, BORDER_DEPTH],
          rotation: [0, 0, Math.PI / 2],
          cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
        },
        {
          position: [BORDER_DEPTH, 0, BORDER_DEPTH],
          rotation: [0, 0, 0],
          cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
        },
        {
          position: [BORDER_DEPTH, -BORDER_DEPTH, 0],
          rotation: [Math.PI / 2, 0, 0],
          cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
        }
      );
    } else if (x === 2 && y === 2 && z === 0) {
      entry.borderMeshes.push(
        {
          position: [0, BORDER_DEPTH, -BORDER_DEPTH],
          rotation: [0, 0, Math.PI / 2],
          cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
        },
        {
          position: [BORDER_DEPTH, 0, -BORDER_DEPTH],
          rotation: [0, 0, 0],
          cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
        },
        {
          position: [BORDER_DEPTH, BORDER_DEPTH, 0],
          rotation: [Math.PI / 2, 0, 0],
          cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
        }
      );
    } else if (x === 2 && y === 2 && z === 2) {
      entry.borderMeshes.push(
        {
          position: [0, BORDER_DEPTH, BORDER_DEPTH],
          rotation: [0, 0, Math.PI / 2],
          cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
        },
        {
          position: [BORDER_DEPTH, 0, BORDER_DEPTH],
          rotation: [0, 0, 0],
          cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
        },
        {
          position: [BORDER_DEPTH, BORDER_DEPTH, 0],
          rotation: [Math.PI / 2, 0, 0],
          cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
        }
      );
    }
  } else if (isEdge) {
    if (x === 1) {
      const yOff = y === 2 ? BORDER_DEPTH : -BORDER_DEPTH;
      const zOff = z === 2 ? BORDER_DEPTH : -BORDER_DEPTH;
      entry.borderMeshes.push({
        position: [0, yOff, zOff],
        rotation: [0, 0, Math.PI / 2],
        cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
      });
    } else if (y === 1) {
      const xOff = x === 2 ? BORDER_DEPTH : -BORDER_DEPTH;
      const zOff = z === 2 ? BORDER_DEPTH : -BORDER_DEPTH;
      entry.borderMeshes.push({
        position: [xOff, 0, zOff],
        rotation: [0, 0, 0],
        cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
      });
    } else if (z === 1) {
      const xOff = x === 2 ? BORDER_DEPTH : -BORDER_DEPTH;
      const yOff = y === 2 ? BORDER_DEPTH : -BORDER_DEPTH;
      entry.borderMeshes.push({
        position: [xOff, yOff, 0],
        rotation: [Math.PI / 2, 0, 0],
        cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
      });
    }
  }
});

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
      highlightIntensity,
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

    const { whiteLogoAngle, applyMoveToWhiteLogoAngle, resetLogo } =
      useWhiteLogo(cubeState);
    const { logoReady, tiptonsTexture } = useLogoTexture();
    const roundedBoxGeometry = useRoundedBoxGeometry();
    const { handlePreciseHover, handleLeaveCube } = useHoverLogic(
      cubeState,
      groupRef,
      raycastTargetsRef,
      cubiesRef
    );

    const commitMoveOnce = useCallback(
      (move: CubeMove) => {
        const key = String(move).toUpperCase();
        const now = performance.now();
        const last = commitGuardRef.current;

        if (last && last.move === key && now - last.t < 200) {
          return;
        }

        commitGuardRef.current = { move: key, t: now };
        onMoveAnimationDone && onMoveAnimationDone(move);

        setTimeout(() => {
          applyMoveToWhiteLogoAngle(move, groupRef);
        }, 0);
      },
      [onMoveAnimationDone, applyMoveToWhiteLogoAngle]
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
        e.stopPropagation();

        if (inputDisabled) {
          onOrbitControlsChange && onOrbitControlsChange(false);
          return;
        }

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
        disableSliceDrag,
        onOrbitControlsChange,
        processPointerDown,
      ]
    );

    useEffect(() => {
      if (!tiptonsTexture) return;
      tiptonsTexture.rotation = whiteLogoAngle;
      tiptonsTexture.needsUpdate = true;
    }, [whiteLogoAngle, tiptonsTexture]);

    useEffect(() => {
      // intentionally no orbit toggle on inputDisabled changes
    }, [inputDisabled]);

    const logoTextureReady = logoReady && !!tiptonsTexture;

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
        currentTweenRef.current = AnimationHelper.animate(
          cubiesRef.current,
          groupRef.current!,
          pendingMove,
          () => {
            if (cancelled) return;

            commitMoveOnce(pendingMove);
            currentTweenRef.current = null;
            startGuardRef.current = null;
          },
          animationDuration
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
    ]);

    useFrame((_, delta) => {
      AnimationHelper.update();

      if (!disableSliceDrag) {
        updateDragRotation();
        updateSnappingAnimation();
      }

      // Shake animation when errorFlash is active
      if (errorFlash) {
        // Reset shake time when errorFlash first becomes true
        if (!previousErrorFlashRef.current) {
          shakeTimeRef.current = 0;
        }

        shakeTimeRef.current += delta;

        // Quick sharp shake for 0.6 seconds (left to right on screen)
        if (shakeTimeRef.current < 0.6 && groupRef.current) {
          const shakeIntensity = 0;
          const shakeSpeed = 50; // High frequency for sharp shake
          const decay = 1 - shakeTimeRef.current / 0.6; // Decay over time

          // Get camera's right vector (screen-space horizontal direction)
          const cameraRight = new THREE.Vector3();
          cameraRight.setFromMatrixColumn(camera.matrixWorld, 0); // Get right vector from camera world matrix
          cameraRight.normalize();

          // Shake along camera's right vector (screen left-to-right)
          const shakeAmount =
            shakeIntensity *
            decay *
            Math.sin(shakeTimeRef.current * shakeSpeed);
          const shakeVector = cameraRight.multiplyScalar(shakeAmount);

          groupRef.current.position.copy(shakeVector);
        } else if (groupRef.current) {
          // Reset position when shake is done
          groupRef.current.position.set(0, 0, 0);
        }
      } else if (groupRef.current && previousErrorFlashRef.current) {
        // Reset position when errorFlash becomes false
        groupRef.current.position.set(0, 0, 0);
      }

      previousErrorFlashRef.current = errorFlash;
    });

    // Create a Set for O(1) highlight lookups instead of O(n) array.some()
    const highlightSet = useMemo(() => {
      if (!highlightPositions || highlightPositions.length === 0) {
        return new Set<string>();
      }
      return new Set(highlightPositions.map(([x, y, z]) => `${x},${y},${z}`));
    }, [highlightPositions]);

    // Memoize the entire cube rendering to avoid recreating all 27 pieces on every render
    const cubePieces = useMemo(() => {
      if (!logoTextureReady) return null;

      const nodes: React.ReactNode[] = [];
      cubeState.forEach((plane, x) => {
        // Hide right face pieces (x === 2) when hideRightFace is true
        if (hideRightFace && x === 2) {
          return;
        }
        // Hide left face pieces (x === 0) when hideLeftFace is true
        if (hideLeftFace && x === 0) {
          return;
        }
        plane.forEach((row, y) => {
          // Hide top face pieces (y === 2) when hideTopFace is true
          if (hideTopFace && y === 2) {
            return;
          }
          // Hide bottom face pieces (y === 0) when hideBottomFace is true
          if (hideBottomFace && y === 0) {
            return;
          }
          row.forEach((cubie, z) => {
            // Hide front face pieces (z === 2) when hideFrontFace is true
            if (hideFrontFace && z === 2) {
              return;
            }
            // Hide back face pieces (z === 0) when hideBackFace is true
            if (hideBackFace && z === 0) {
              return;
            }
            const cubieKey = `${x},${y},${z}`;
            const styleEntry = CUBIE_STYLE_MAP[cubieKey];
            const cornerStyles = styleEntry?.cornerBuilder || [];
            // O(1) lookup instead of O(n) array.some()
            const isHighlighted = highlightSet.has(cubieKey);
            
            // Get previous colors if available
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
                roundedBoxGeometry={roundedBoxGeometry}
                sharedLogoTexture={tiptonsTexture}
                logoReady={logoReady}
                hideLogo={hideLogo}
                touchCount={touchCount}
                cornerStyles={cornerStyles}
                isHighlighted={isHighlighted}
                highlightIntensity={0} // Target piece stays normal brightness
                dullOthersIntensity={!isHighlighted ? (dullOthersIntensity ?? 0) : 0}
                trackingStateRef={trackingStateRef}
                onPointerDown={(e, pos, intersectionPoint) => {
                  handlePointerDown(e, pos, intersectionPoint);
                }}
                onMeshReady={(mesh, gridX, gridY, gridZ) => {
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
                }}
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
                {pieceChildren?.(x, y, z, cubie)}
              </CubePiece>
            );
          });
        });
      });
      return nodes;
    }, [
      logoTextureReady,
      cubeState,
      hideRightFace,
      hideFrontFace,
      hideLeftFace,
      hideBackFace,
      hideTopFace,
      hideBottomFace,
      errorFlash,
      highlightSet,
      highlightIntensity,
      dullOthersIntensity,
      roundedBoxGeometry,
      tiptonsTexture,
      logoReady,
      hideLogo,
      touchCount,
      trackingStateRef,
      handlePointerDown,
      pieceChildren,
    ]);

    return (
      <group
        ref={groupRef}
        onPointerLeave={handleLeaveCube}
        onPointerMove={inputDisabled ? undefined : handlePreciseHover}
        onPointerDown={inputDisabled ? undefined : handleBoundaryPointerDown}
      >
        {children}
        {cubePieces}
      </group>
    );
  }
);

export default RubiksCube3D;
