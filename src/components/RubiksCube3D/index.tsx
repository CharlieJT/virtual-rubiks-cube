import React, { useRef, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CubeMove } from "@/types/cube";
import { AnimationHelper, type AnimatedCubie } from "@utils/animationHelper";
import CUBIE_STYLE_MAP from "@/maps/cubieStyleMap";
import {
  BORDER_RADIUS,
  BORDER_DEPTH,
  CUBIE_DISTANCE,
  BORDER_LENGTH,
} from "./geometry";
import useWhiteLogo from "@/hooks/useWhiteLogo";
import useDragLogic from "@/hooks/useDragLogic";
import {
  useLogoTexture,
  useRoundedBoxGeometry,
  useHoverLogic,
} from "./helpers";
import useAnimation, { useImperativeHandle3D } from "@/hooks/useAnimation";
import CubePiece from "./CubePiece";
import type { RubiksCube3DProps, RubiksCube3DHandle } from "./types";

// Enable cache so TextureLoader reuses the same image
THREE.Cache.enabled = true;

// Auto-populate border meshes for cubie style map
Object.entries(CUBIE_STYLE_MAP).forEach(([key, entry]) => {
  if (!entry) return;

  // Initialize borderMeshes if it doesn't exist
  if (!entry.borderMeshes) {
    entry.borderMeshes = [];
  }

  // Skip if borderMeshes already has content (respect any manual definitions)
  if (entry.borderMeshes.length > 0) return;
  const [x, y, z] = key.split(",").map(Number);
  const extremes = [x, y, z].filter((c) => c === 0 || c === 2).length;
  const isCorner = extremes === 3;
  const isEdge = extremes === 2 && (x === 1 || y === 1 || z === 1);
  const isFaceCenter =
    extremes === 1 &&
    (x === 1 ? 0 : 1) + (y === 1 ? 0 : 1) + (z === 1 ? 0 : 1) === 2; // exactly one extreme and two middles
  const isCore = x === 1 && y === 1 && z === 1;

  if (isCorner) {
    // Explicit per-corner cases (8 corners)
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
    // Determine axis of this edge (middle coordinate == 1)
    if (x === 1) {
      // Edge along X axis; offsets from y,z extremes
      const yOff = y === 2 ? BORDER_DEPTH : -BORDER_DEPTH;
      const zOff = z === 2 ? BORDER_DEPTH : -BORDER_DEPTH;
      entry.borderMeshes.push({
        position: [0, yOff, zOff],
        rotation: [0, 0, Math.PI / 2], // cylinder along X
        cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
      });
    } else if (y === 1) {
      // Edge along Y axis; offsets from x,z extremes
      const xOff = x === 2 ? BORDER_DEPTH : -BORDER_DEPTH;
      const zOff = z === 2 ? BORDER_DEPTH : -BORDER_DEPTH;
      entry.borderMeshes.push({
        position: [xOff, 0, zOff],
        rotation: [0, 0, 0], // cylinder along Y (default orientation)
        cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
      });
    } else if (z === 1) {
      // Edge along Z axis; offsets from x,y extremes
      const xOff = x === 2 ? BORDER_DEPTH : -BORDER_DEPTH;
      const yOff = y === 2 ? BORDER_DEPTH : -BORDER_DEPTH;
      entry.borderMeshes.push({
        position: [xOff, yOff, 0],
        rotation: [Math.PI / 2, 0, 0], // cylinder along Z
        cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
      });
    }
  } else if (isFaceCenter || isCore) {
    // no border meshes
  }
});

const RubiksCube3D = React.forwardRef<RubiksCube3DHandle, RubiksCube3DProps>(
  (
    {
      cubeState,
      pendingMove,
      onMoveAnimationDone,
      onStartAnimation,
      isAnimating,
      onOrbitControlsChange,
      touchCount = 0,
    }: RubiksCube3DProps,
    ref
  ) => {
    const groupRef = useRef<THREE.Group>(null);

    // Guard: prevent duplicate move commits within a short window
    const commitGuardRef = useRef<{ move: string; t: number } | null>(null);

    // Guard: ensure we only start one AnimationHelper.animate per pending move
    const startGuardRef = useRef<string | null>(null);

    // Reuse Raycaster and Vector2 to reduce allocations (mobile stability)
    const cubiesRef = useRef<AnimatedCubie[]>([]);
    const raycastTargetsRef = useRef<THREE.Mesh[]>([]);
    const currentTweenRef = useRef<any>(null);
    const meshesReadyRef = useRef(false);

    // Custom hooks
    const { whiteLogoAngle, applyMoveToWhiteLogoAngle } =
      useWhiteLogo(cubeState);
    const { logoReady, tiptonsTexture } = useLogoTexture();
    const roundedBoxGeometry = useRoundedBoxGeometry();
    const { handlePreciseHover, handleLeaveCube } = useHoverLogic(
      cubeState,
      groupRef,
      raycastTargetsRef,
      cubiesRef
    );

    // Debounced move commit function
    const commitMoveOnce = useCallback(
      (move: CubeMove) => {
        const key = String(move).toUpperCase();
        const now = performance.now();
        const last = commitGuardRef.current;

        // Prevent duplicate commits within 200ms
        if (last && last.move === key && now - last.t < 200) {
          return;
        }

        commitGuardRef.current = { move: key, t: now };

        // First update the logical cube state/colors in the parent
        // This triggers the React re-render with new colors
        onMoveAnimationDone && onMoveAnimationDone(move);

        // Then apply the white logo rotation after the re-render completes
        // Using setTimeout(0) ensures this runs after React's reconciliation
        setTimeout(() => {
          applyMoveToWhiteLogoAngle(move, groupRef);
        }, 0);
      },
      [onMoveAnimationDone, applyMoveToWhiteLogoAngle]
    );

    const { trackingStateRef, processPointerDown, cleanupDragState } =
      useDragLogic(groupRef, cubiesRef, commitMoveOnce);

    const { updateSnappingAnimation, updateDragRotation } = useAnimation(
      trackingStateRef,
      cleanupDragState,
      commitMoveOnce
    );

    const { handleBoundaryPointerDown } = useImperativeHandle3D(
      ref,
      groupRef,
      trackingStateRef,
      cleanupDragState,
      touchCount,
      isAnimating,
      onOrbitControlsChange
    );

    const handlePointerDown = (
      e: React.PointerEvent,
      pos: [number, number, number],
      intersectionPoint: THREE.Vector3
    ) => {
      e.stopPropagation();

      if (AnimationHelper.isLocked() || !meshesReadyRef.current) {
        // If not ready, capture the interaction data and retry when ready
        const retryInteraction = () => {
          if (AnimationHelper.isLocked() || !meshesReadyRef.current) {
            requestAnimationFrame(retryInteraction);
            return;
          }

          // Create a synthetic event-like object with the essential properties
          const syntheticEvent = {
            stopPropagation: () => {},
            clientX: e.clientX,
            clientY: e.clientY,
            pointerId: e.pointerId,
            nativeEvent: e.nativeEvent,
          } as React.PointerEvent;

          // Restart the pointer down handling now that we're ready
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
    };

    // Keep shared texture rotation in sync with computed angle
    useEffect(() => {
      if (!tiptonsTexture) return;
      tiptonsTexture.rotation = whiteLogoAngle;
      tiptonsTexture.needsUpdate = true;
    }, [whiteLogoAngle, tiptonsTexture]);

    // Gate visual output (not hook execution) until logo is ready
    const logoTextureReady = logoReady && !!tiptonsTexture;

    useEffect(() => {
      if (!pendingMove) {
        // Clear start guard when no pending move
        startGuardRef.current = null;
        return;
      }

      const key = String(pendingMove).toUpperCase();

      // If we already started this same pending move, don't start again
      if (startGuardRef.current === key) {
        return;
      }

      let cancelled = false;
      let rafId: number | null = null;

      const tryStart = () => {
        if (cancelled) return;

        // Wait until the scene and meshes are fully ready and animation system is unlocked
        const ready =
          !!groupRef.current &&
          cubiesRef.current.length === 27 &&
          !!meshesReadyRef.current &&
          !AnimationHelper.isLocked();

        if (!ready) {
          rafId = requestAnimationFrame(tryStart);
          return;
        }

        // Mark as started before launching animation to avoid race
        startGuardRef.current = key;

        // Clear commit guard when starting a new animation
        // This allows intentional consecutive moves like U U
        commitGuardRef.current = null;

        onStartAnimation && onStartAnimation();
        currentTweenRef.current = AnimationHelper.animate(
          cubiesRef.current,
          groupRef.current!,
          pendingMove,
          () => {
            if (cancelled) return;

            // Single commit path with debounce guard
            commitMoveOnce(pendingMove);
            currentTweenRef.current = null;

            // Clear start guard after completion so future moves can start
            startGuardRef.current = null;
          }
        );
      };

      // Try now and keep retrying until ready
      tryStart();

      return () => {
        cancelled = true;
        if (rafId !== null) cancelAnimationFrame(rafId);
      };
    }, [pendingMove, onStartAnimation, commitMoveOnce]);

    useFrame(() => {
      AnimationHelper.update();

      // Update drag rotation if active
      updateDragRotation();

      // Update snapping animation if active
      updateSnappingAnimation();
    });

    return (
      <group
        ref={groupRef}
        onPointerLeave={handleLeaveCube}
        onPointerMove={handlePreciseHover}
        onPointerDown={handleBoundaryPointerDown}
      >
        {!logoTextureReady
          ? null
          : (() => {
              const nodes: React.ReactNode[] = [];
              cubeState.forEach((plane, x) => {
                plane.forEach((row, y) => {
                  row.forEach((cubie, z) => {
                    const cubieKey = `${x},${y},${z}`;
                    const styleEntry = CUBIE_STYLE_MAP[cubieKey];
                    const cornerStyles = styleEntry?.cornerBuilder || [];
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
                        roundedBoxGeometry={roundedBoxGeometry}
                        sharedLogoTexture={tiptonsTexture}
                        logoReady={logoReady}
                        touchCount={touchCount}
                        cornerStyles={cornerStyles}
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
                        {/* Auto render per-cubie border meshes from style map */}
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
                              renderOrder={1} // optional
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
                      </CubePiece>
                    );
                  });
                });
              });
              return nodes;
            })()}
      </group>
    );
  }
);

export default RubiksCube3D;
