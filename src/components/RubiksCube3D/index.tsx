import React, { useRef, useEffect, useLayoutEffect, useCallback, useMemo } from "react";
import { flushSync } from "react-dom";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { CubeMove, CubeState } from "@/types/cube";
import { AnimationHelper, type AnimatedCubie } from "@utils/animationHelper";
import CUBIE_STYLE_MAP from "@/config/cube/cubieStyleMap";
import CUBE_COLORS from "@/consts/cubeColours";
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
import type { RubiksCube3DProps, RubiksCube3DHandle, PieceMaterialData } from "./types";
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
    
    // Pre-allocated vectors for shake animation (avoid GC pressure)
    const shakeVectorRef = useRef(new THREE.Vector3());
    
    // Centralized material storage for all 27 pieces (single useFrame animation)
    const pieceMaterialsRef = useRef<Map<string, PieceMaterialData>>(new Map());
    // Map from mesh to pieceData for fast lookup after rotations (mesh positions change but meshes don't)
    const meshToPieceDataRef = useRef<Map<THREE.Mesh, PieceMaterialData>>(new Map());
    const wasAnimatingRef = useRef(false);
    const cubeStateRef = useRef(cubeState);
    const lastCompletedMoveRef = useRef<CubeMove | null>(null);
    const lastMoveSourceRef = useRef<string | null>(null);
    
    // Material update function for fast sequences
    const updateMaterialsForFastSequence = useCallback(() => {
      const currentState = cubeStateRef.current;
      
      // First, rebuild mesh-to-pieceData mapping for all cubies
      for (const cubie of cubiesRef.current) {
        const key = `${cubie.x},${cubie.y},${cubie.z}`;
        const pieceData = pieceMaterialsRef.current.get(key);
        if (pieceData) {
          meshToPieceDataRef.current.set(cubie.mesh, pieceData);
        }
      }
      
      // Update materials by iterating through cubies
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
    }, []);
    
    // Keep ref in sync with latest cubeState AND update materials synchronously
    // This runs before browser paint, preventing flash
    useLayoutEffect(() => {
      const prevState = cubeStateRef.current;
      cubeStateRef.current = cubeState;
      
      // For slice moves, apply group rotation synchronously here to prevent flash
      // This ensures rotation happens at the same time as material updates
      // Only do this for manual moves - skip during fast sequences to avoid lag
      const lastMove = lastCompletedMoveRef.current;
      const moveSource = lastMoveSourceRef.current;
      const isFastSequence = moveSource === "queue" && (queueFast || typeof queueFastMs === "number");
      
      
      if (lastMove && !isFastSequence) {
        const moveStr = String(lastMove).toUpperCase();
        const base = moveStr.replace(/['2]/g, "")[0];
        const isSliceMove = base === "M" || base === "E" || base === "S";
        
        if (isSliceMove && groupRef.current) {
          const coordinateRotationMap: Record<string, [THREE.Vector3, number]> = {
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
      
      // Clear after processing
      if (lastMove) {
        lastCompletedMoveRef.current = null;
        lastMoveSourceRef.current = null;
      }
      
      // Update materials synchronously when cubeState changes
      // This happens before React Three Fiber applies props, preventing flash
      // Skip material updates for fast sequences - they're handled by updateMaterialsForFastSequence
      if (!isFastSequence) {
        // Only update materials for manual moves (fast sequences handle it themselves)
        // Find pieceData by mesh (which persists) and use cubie's current grid position
        for (const cubie of cubiesRef.current) {
          const pieceData = meshToPieceDataRef.current.get(cubie.mesh);
          if (!pieceData) continue;
          
          // Use cubie's CURRENT grid position (updated after move)
          const newPiece = cubeState[cubie.x]?.[cubie.y]?.[cubie.z];
          const oldPiece = prevState[cubie.x]?.[cubie.y]?.[cubie.z];
          
          if (!newPiece) continue;
          
          // Update pieceData.gridIndex to reflect new position
          pieceData.gridIndex = [cubie.x, cubie.y, cubie.z];
          
          // Only update if colors actually changed
          let colorsChanged = false;
          if (!oldPiece) {
            colorsChanged = true;
          } else {
            for (const face in newPiece.colors) {
              if (newPiece.colors[face as keyof CubeState["colors"]] !== 
                  oldPiece.colors[face as keyof CubeState["colors"]]) {
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
    
    // Pre-allocated colors for centralized animation (shared across all pieces)
    const animColorRef = useRef({
      grey: new THREE.Color("#808080"),
      white: new THREE.Color(0xffffff),
      previous: new THREE.Color(),
      baseline: new THREE.Color(),
      lerped: new THREE.Color(),
      emissive: new THREE.Color(),
    });
    
    // Callback for pieces to register their materials
    const handleMaterialsReady = useCallback((key: string, data: PieceMaterialData) => {
      pieceMaterialsRef.current.set(key, data);
      // Also find the mesh for this pieceData and store the mapping
      // We'll find it by matching gridIndex to cubie coordinates
      const [gx, gy, gz] = data.gridIndex;
      const cubie = cubiesRef.current.find((c) => c.x === gx && c.y === gy && c.z === gz);
      if (cubie) {
        meshToPieceDataRef.current.set(cubie.mesh, data);
      }
    }, []);

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
    
    // Stable callback for mesh registration (avoids recreating 27 callbacks on each render)
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
        
        // Store the move and source for useLayoutEffect to apply group rotation synchronously for slice moves
        lastCompletedMoveRef.current = move;
        lastMoveSourceRef.current = moveSource || null;
        
        const isFastSequence = moveSource === "queue" && (queueFast || typeof queueFastMs === "number");
        
        // Force synchronous state update using flushSync
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

    // Update logo texture rotation synchronously in useLayoutEffect
    // This prevents flash when the logo rotates
    useLayoutEffect(() => {
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
        
        // Store the move for material update
        const currentMove = pendingMove;
        
        // Determine if this is a fast sequence
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
          isFastSequence ? updateMaterialsForFastSequence : () => {
            // For manual moves, update materials after state update
            // useLayoutEffect will handle this, but we call it here to ensure it runs synchronously
            // The materials will be updated in useLayoutEffect based on the new cubeState
          }
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

    useFrame((_, delta) => {
      AnimationHelper.update();

      if (!disableSliceDrag) {
        updateDragRotation();
        updateSnappingAnimation();
      }

      // Shake animation when errorFlash is active
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

          const shakeAmount = shakeIntensity * decay * Math.sin(shakeTimeRef.current * shakeSpeed);
          cameraRight.multiplyScalar(shakeAmount);

          groupRef.current.position.copy(cameraRight);
        } else if (groupRef.current) {
          groupRef.current.position.set(0, 0, 0);
        }
      } else if (groupRef.current && previousErrorFlashRef.current) {
        groupRef.current.position.set(0, 0, 0);
      }

      previousErrorFlashRef.current = errorFlash;
      
      // === CENTRALIZED PIECE ANIMATION (only for tutorials) ===
      // Skip if no tutorial-specific animations are needed
      const needsFade = !!(previousCube3D && baselineCube3D && colorFadeProgress > 0);
      const needsDulling = (dullOthersIntensity ?? 0) > 0;
      const needsAnimation = needsFade || needsDulling;
      
      // Skip entirely during normal cube usage (no fade/dull)
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
              temps.previous.set(prevColors[face as keyof CubeState["colors"]] || CUBE_COLORS.BLACK);
              temps.baseline.set(baseColors[face as keyof CubeState["colors"]] || CUBE_COLORS.BLACK);
              
              if (colorFadeProgress <= 0.5) {
                const phase1Progress = Math.min(1, colorFadeProgress / 0.5);
                if (needsGreyFade) {
                  temps.lerped.copy(temps.previous).lerp(temps.grey, phase1Progress);
                  mat.color.copy(temps.lerped);
                } else {
                  mat.color.copy(temps.previous);
                }
              } else {
                const phase2Progress = Math.min(1, (colorFadeProgress - 0.5) / 0.5);
                const colorsDiffer = temps.previous.getHex() !== temps.baseline.getHex();
                if (needsGreyFade || colorsDiffer) {
                  temps.lerped.copy(needsGreyFade ? temps.grey : temps.previous).lerp(temps.baseline, phase2Progress);
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
                highlightIntensity={0}
                dullOthersIntensity={!isHighlighted ? (dullOthersIntensity ?? 0) : 0}
                trackingStateRef={trackingStateRef}
                onPointerDown={handlePointerDown}
                onMeshReady={handleMeshReady}
                onMaterialsReady={handleMaterialsReady}
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
      roundedBoxGeometry,
      tiptonsTexture,
      logoReady,
      hideLogo,
      touchCount,
      handlePointerDown,
      handleMeshReady,
      handleMaterialsReady,
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
