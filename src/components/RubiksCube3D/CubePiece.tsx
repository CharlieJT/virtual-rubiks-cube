import React, { useState, useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getCubieGeometry, getStickerGeometryForCorners } from "./geometry";
import type { CubePieceProps } from "./types";
import type { CubeState } from "@/types/cube";
import STICKER_CORNER_MAP from "@/maps/stickerCornerMap";
import CUBE_COLORS from "@/consts/cubeColours";
import { activeTouches } from "@utils/touchState";
import {
  CUBIE_SIZE,
  STICKER_INSET,
  STICKER_LIFT,
  STICKER_CORNER_RATIO,
  STICKER_FALSE_CORNER_RATIO,
} from "./geometry";

const { WHITE } = CUBE_COLORS;

const CubePiece = React.memo(
  ({
    position,
    colors,
    previousColors,
    baselineColors,
    stickerGreyMap,
    colorFadeProgress = 0,
    gridIndex,
    onPointerDown,
    onMeshReady,
    onPointerMove,
    touchCount = 0,
    cornerStyles = [],
    children,
    trackingStateRef,
    highlightIntensity = 0,
    isHighlighted = false,
    pulse = false,
    pulseSpeed = 1.2,
    pulseMin = 0.18,
    pulseMax = 0.28,
    dullOthersIntensity = 0,
    // Shared resources passed from parent to avoid per-cubie allocations
    roundedBoxGeometry,
    sharedLogoTexture,
    logoReady,
    hideLogo = false,
  }: CubePieceProps & {
    roundedBoxGeometry: THREE.BufferGeometry;
    sharedLogoTexture: THREE.Texture | null;
    logoReady: boolean;
    hideLogo?: boolean;
    isHighlighted?: boolean;
    pulse?: boolean;
    pulseSpeed?: number;
    pulseMin?: number;
    pulseMax?: number;
    dullOthersIntensity?: number;
  }) => {
    // Track per-face materials and base colors for animation
    const stickerMatsRef = useRef<Record<string, THREE.MeshPhongMaterial>>({});
    const baseColorsRef = useRef<Record<string, THREE.Color>>({});
    const tRef = useRef(0);

    useFrame((_, delta) => {
      // Update sticker colors for pulse animation, color fade, or dulling
      for (const face in stickerMatsRef.current) {
        const mat = stickerMatsRef.current[face];
        const base = baseColorsRef.current[face];
        if (!mat || !base) continue;
        
        // Debug: check if fade should be running for M slice
        if (gridIndex && gridIndex[0] === 1 && colorFadeProgress > 0 && colorFadeProgress < 0.05) {
          const [x, y, z] = gridIndex;
          const faceKey = `${x},${y},${z},${face}`;
          const needsGreyFade = stickerGreyMap?.get(faceKey) ?? false;
          if (needsGreyFade && !previousColors) {
            console.log(`[CubePiece] WARNING: M slice [${x},${y},${z}] ${face} needs fade but previousColors is null!`);
          }
          if (needsGreyFade && !baselineColors) {
            console.log(`[CubePiece] WARNING: M slice [${x},${y},${z}] ${face} needs fade but baselineColors is null!`);
          }
        }

        // Handle two-phase color fade transition
        if (previousColors && baselineColors && colorFadeProgress > 0 && gridIndex) {
          const [x, y, z] = gridIndex;
          const faceKey = `${x},${y},${z},${face}`;
          const needsGreyFade = stickerGreyMap?.get(faceKey) ?? false;
          const grey = new THREE.Color("#808080");
          const previousColor = new THREE.Color(previousColors[face as keyof CubeState["colors"]] || CUBE_COLORS.BLACK);
          const baselineColor = new THREE.Color(baselineColors[face as keyof CubeState["colors"]] || CUBE_COLORS.BLACK);
          
          // Debug: log fade for M slice pieces (first few frames)
          if (x === 1 && needsGreyFade && colorFadeProgress < 0.05) {
            console.log(`[CubePiece] M slice fade: [${x},${y},${z}] ${face} needsGrey=${needsGreyFade} prev=${previousColor.getHexString()} base=${baselineColor.getHexString()} progress=${colorFadeProgress.toFixed(3)}`);
          }
          
          if (colorFadeProgress <= 0.5) {
            // Phase 1 (0 to 0.5): ONLY fade mismatched stickers to grey
            // Stickers that match stay at their previous color
            // At progress = 0.5, Phase 1 is complete (mismatched stickers are fully grey)
            const phase1Progress = Math.min(1, colorFadeProgress / 0.5); // 0 to 1 within phase 1
            
            if (needsGreyFade) {
              // This sticker doesn't match baseline - fade it to grey
              // Even if colors appear the same (due to x rotation in slice moves), fade to grey
              const lerpedColor = previousColor.clone().lerp(grey, phase1Progress);
              mat.color.copy(lerpedColor);
            } else {
              // This sticker matches baseline - keep it at previous color (no change in Phase 1)
              mat.color.copy(previousColor);
            }
            mat.needsUpdate = true;
          } else {
            // Phase 2 (>0.5 to 1.0): Fade stickers from their current state to baseline
            // Only fade stickers that are in the grey map (mismatched) or that actually differ
            // This prevents non-slice pieces from fading when they shouldn't
            const phase2Progress = Math.min(1, (colorFadeProgress - 0.5) / 0.5); // 0 to 1 within phase 2
            
            // If in grey map, always fade (even if colors appear same due to x rotation in slice moves)
            // Otherwise, only fade if colors actually differ
            const colorsDiffer = previousColor.getHex() !== baselineColor.getHex();
            if (needsGreyFade || colorsDiffer) {
              // Determine start color based on what happened in Phase 1:
              // - If it was faded to grey in Phase 1, start from grey (fully grey at progress 0.5)
              // - If it matched in Phase 1, start from previous color
              const startColor = needsGreyFade ? grey : previousColor;
              const lerpedColor = startColor.clone().lerp(baselineColor, phase2Progress);
              mat.color.copy(lerpedColor);
            } else {
              // Colors are the same and not in grey map, keep at previous color (no fade needed)
              mat.color.copy(previousColor);
            }
            mat.needsUpdate = true;
          }
        } else if (pulse && isHighlighted) {
          // Normal pulse animation
          // Update time for pulse
          const omega = 2 * Math.PI * (pulseSpeed || 1.2);
          tRef.current += delta * omega;
          const s = Math.sin(tRef.current);
          const brightenAmt = Math.max(0, s) * (pulseMax || 0.25);
          const dullAmt = Math.max(0, -s) * (pulseMin || 0.18);
          const grey = new THREE.Color("#808080");
          const white = new THREE.Color(0xffffff);
          const c = base.clone();
          if (brightenAmt > 0) c.lerp(white, Math.min(0.85, brightenAmt));
          if (dullAmt > 0) c.lerp(grey, Math.min(0.85, dullAmt));
          mat.color.copy(c);
          // Subtle emissive pulse
          const emissiveBase = base.clone();
          const emissiveColor = emissiveBase.multiplyScalar(0.4);
          mat.emissive.copy(emissiveColor);
          mat.emissiveIntensity = 0.05 + brightenAmt * 0.25;
          mat.shininess = 12 + brightenAmt * 16;
          mat.needsUpdate = true;
        } else if (dullOthersIntensity > 0 && !isHighlighted) {
          // Apply dulling to non-highlighted pieces
          const grey = new THREE.Color("#808080");
          const dulledColor = base.clone().lerp(grey, dullOthersIntensity);
          mat.color.copy(dulledColor);
          mat.needsUpdate = true;
        } else {
          // Normal color - ensure we're back to base
          mat.color.copy(base);
          mat.needsUpdate = true;
        }
      }
    });
    const meshRef = useRef<THREE.Mesh>(null);
    // Reference roundedBoxGeometry to avoid unused param TS warning (kept for future optimization work)
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    roundedBoxGeometry;
    // no local state needed for materials; we update refs directly

    // New state for cubie geometry
    const [cubieGeometry, setCubieGeometry] =
      useState<THREE.BufferGeometry | null>(null);

    useEffect(() => {
      if (meshRef.current && onMeshReady) {
        const [x, y, z] = position;
        const gridX = Math.round(x / 1.05 + 1);
        const gridY = Math.round(y / 1.05 + 1);
        const gridZ = Math.round(z / 1.05 + 1);

        onMeshReady(meshRef.current, gridX, gridY, gridZ);
      }
    }, [position, onMeshReady]);

    // Use shared logo texture from parent (no per-cubie loader)

    // Helper to normalize and check white color
    const isWhite = (c: string) => {
      if (!c) return false;
      let s = c.toLowerCase();
      if (s[0] === "#" && s.length === 4) {
        s = `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
      }
      return s === WHITE || s === "white";
    };

    // Determine if this cubie is a center piece (exactly two grid coordinates are the middle index=1)
    const [gx, gy, gz] = useMemo(() => {
      const [x, y, z] = position;
      return [
        Math.round(x / 1.05 + 1),
        Math.round(y / 1.05 + 1),
        Math.round(z / 1.05 + 1),
      ];
    }, [position]);
    const isCenter =
      (gx === 1 ? 1 : 0) + (gy === 1 ? 1 : 0) + (gz === 1 ? 1 : 0) === 2;

    // Base sticker size & radius (used per-sticker when building specific geometry)
    const stickerBaseSize = useMemo(() => CUBIE_SIZE * STICKER_INSET, []);

    const [stickerRadiusTrue, stickerRadiusFalse] = useMemo(
      () => [
        stickerBaseSize * STICKER_CORNER_RATIO,
        stickerBaseSize * STICKER_FALSE_CORNER_RATIO,
      ],
      [stickerBaseSize]
    );

    // Ensure shared logo texture is centered & clamped (once ready)
    useEffect(() => {
      if (sharedLogoTexture) {
        sharedLogoTexture.center.set(0.5, 0.5);
        sharedLogoTexture.offset.set(0, 0);
        sharedLogoTexture.rotation = 0;
        sharedLogoTexture.wrapS = THREE.ClampToEdgeWrapping;
        sharedLogoTexture.wrapT = THREE.ClampToEdgeWrapping;
        sharedLogoTexture.needsUpdate = true;
      }
    }, [sharedLogoTexture]);

    // Utility: is a color value considered "present" for sticker purposes
    const hasStickerColor = (c: string | undefined) => !!c && c !== "";

    // Persistent materials: create once and update on color/logo changes
    const materialRefs = useRef<THREE.MeshBasicMaterial[]>([
      new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false }),
      new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false }),
      new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false }),
      new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false }),
      new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false }),
      new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false }),
    ]);
    useEffect(() => {
      // Base faces no longer display logo textures directly; stickers handle visuals

      const mats = materialRefs.current;
      for (let i = 0; i < 6; i++) {
        const mat = mats[i];
        mat.color.set(0x000000);
        (mat as any).map = null;
        mat.needsUpdate = true;
      }
    }, [
      colors.right,
      colors.left,
      colors.top,
      colors.bottom,
      colors.front,
      colors.back,
      isCenter,
      logoReady,
      sharedLogoTexture,
    ]);

    // Border code removed for clean dice appearance

    // Defer heavy geometry generation to avoid blocking UI
    useEffect(() => {
      // Defer heavy geometry generation to avoid blocking UI
      let cancelled = false;
      setCubieGeometry(null); // Reset before generating
      setTimeout(() => {
        if (!cancelled) {
          const geometry = getCubieGeometry(CUBIE_SIZE, cornerStyles); // Use your cubie size here
          setCubieGeometry(geometry);
        }
      }, 0);
      return () => {
        cancelled = true;
      };
    }, [cornerStyles]);
    if (!cubieGeometry) return null; // Optionally show a loading spinner

    return (
      <mesh
        ref={meshRef}
        position={position}
        onPointerDown={(e) => {
          const isPrimary = (e.button ?? 0) === 0;
          const shiftHeld = !!e.shiftKey;
          if (isPrimary && !shiftHeld) {
            const pointerType =
              (e.nativeEvent && (e.nativeEvent as any).pointerType) || null;
            if (pointerType === "touch") {
              // If there's already an active drag with a different finger, ignore this touch
              if (
                trackingStateRef &&
                trackingStateRef.current.isDragging &&
                trackingStateRef.current._pointerId &&
                trackingStateRef.current._pointerId !== e.pointerId
              ) {
                return;
              }

              // Allow multiple moves - only block if there are more than 2 touches total
              // This allows one finger to finish a move while a second finger starts a new move
              if ((touchCount || 0) > 2) return;
              if (activeTouches.count > 2) return;
              const touches = (e.nativeEvent &&
                (e.nativeEvent as any).touches) as TouchList | undefined;
              if (touches && touches.length > 2) return;
            }
            e.stopPropagation();
            const intersectionPoint = e.point || new THREE.Vector3();
            onPointerDown?.(e, position as any, intersectionPoint);
          }
        }}
        onPointerMove={(e) => {
          const isPrimary = (e.button ?? 0) === 0;
          const shiftHeld = !!e.shiftKey;
          if (isPrimary && !shiftHeld) {
            e.stopPropagation();
            onPointerMove?.(e);
          }
        }}
        onPointerUp={(e) => {
          const isPrimary = (e.button ?? 0) === 0;
          const shiftHeld = !!e.shiftKey;
          if (isPrimary && !shiftHeld) {
            e.stopPropagation();
          }
        }}
      >
        {/* Main cubie geometry */}
        <mesh geometry={cubieGeometry} material={materialRefs.current} />

        {/* Stickers on colored outer faces */}
        {(() => {
          const faces: Array<{
            key: keyof CubeState["colors"];
            show: boolean;
            pos: [number, number, number];
            rot: [number, number, number];
          }> = [];
          // Determine grid indices either from supplied gridIndex prop or derived (fallback)
          const [igx, igy, igz] = gridIndex ?? [gx, gy, gz];
          const half = CUBIE_SIZE / 2; // actual half-size of cubie geometry
          faces.push(
            {
              key: "right",
              show: igx === 2,
              pos: [half + STICKER_LIFT, 0, 0],
              rot: [0, Math.PI / 2, 0],
            },
            {
              key: "left",
              show: igx === 0,
              pos: [-(half + STICKER_LIFT), 0, 0],
              rot: [0, -Math.PI / 2, 0],
            },
            {
              key: "top",
              show: igy === 2,
              pos: [0, half + STICKER_LIFT, 0],
              rot: [-Math.PI / 2, 0, 0],
            },
            {
              key: "bottom",
              show: igy === 0,
              pos: [0, -(half + STICKER_LIFT), 0],
              rot: [Math.PI / 2, 0, 0],
            },
            {
              key: "front",
              show: igz === 2,
              pos: [0, 0, half + STICKER_LIFT],
              rot: [0, 0, 0],
            },
            {
              key: "back",
              show: igz === 0,
              pos: [0, 0, -(half + STICKER_LIFT)],
              rot: [0, Math.PI, 0],
            }
          );
          return faces.map((f) => {
            const col = colors[f.key];
            if (!f.show || !hasStickerColor(col)) return null;
            // Resolve per-sticker corner config
            const stickerKey = `${igx},${igy},${igz}:${f.key}`;
            const cornerPattern = STICKER_CORNER_MAP[stickerKey] || [
              false,
              false,
              false,
              false,
            ];
            const geom = getStickerGeometryForCorners(
              stickerBaseSize,
              stickerRadiusTrue,
              stickerRadiusFalse,
              cornerPattern
            );
            // Determine if this is center sticker for that face to overlay logo
            const isCenterSticker = (() => {
              switch (f.key) {
                case "front":
                case "back":
                  return igx === 1 && igy === 1;
                case "right":
                case "left":
                  return igy === 1 && igz === 1;
                case "top":
                case "bottom":
                  return igx === 1 && igz === 1;
                default:
                  return false;
              }
            })();
            const showLogo =
              !hideLogo &&
              isCenterSticker &&
              sharedLogoTexture &&
              logoReady &&
              isWhite(col as string);
            // Visual emphasis handling:
            // - If this cubie is the highlighted target and intensity>0: brighten toward white
            // - If this cubie is NOT highlighted and intensity>0: dull toward grey
            const hi = highlightIntensity;
            return (
              <group key={f.key} position={f.pos} rotation={f.rot as any}>
                <mesh geometry={geom}>
                  {/* Sticker material: if this is the white center with logo, use the logo texture; color still modulates brightness so it can dull */}
                  <meshPhongMaterial
                    ref={(m) => {
                      if (m) {
                        stickerMatsRef.current[f.key] = m;
                        // Capture base color used before any animation
                        try {
                          // Store the base color - useFrame will handle fade interpolation
                          if (previousColors && colorFadeProgress === 0) {
                            // At fade start, store the old color
                            baseColorsRef.current[f.key] = new THREE.Color(previousColors[f.key] || CUBE_COLORS.BLACK);
                          } else {
                            baseColorsRef.current[f.key] = m.color.clone();
                          }
                        } catch {}
                      }
                    }}
                    map={showLogo ? sharedLogoTexture || undefined : undefined}
                    color={
                      (() => {
                        // Start from base: for logo we multiply the texture by color; for normal stickers we use the sticker color
                        let base = showLogo
                          ? new THREE.Color(0xffffff)
                          : new THREE.Color(col as any);

                        // If we're fading, interpolate between old and new colors
                        // But useFrame will handle the actual animation, so just set initial state here
                        if (previousColors && colorFadeProgress === 0) {
                          // At the start of fade, use the old color (state with wrong move)
                          base = new THREE.Color(previousColors[f.key] || CUBE_COLORS.BLACK);
                        }
                        
                        // Color is now handled in useFrame for smooth transitions
                        // Return base color here, useFrame will update it
                        return base;
                      })() as any
                    }
                    transparent={!!showLogo}
                    shininess={(hi || 0) > 0 ? (isHighlighted ? 24 : 2) : 8}
                    specular={
                      (hi || 0) > 0
                        ? isHighlighted
                          ? (0x222222 as any)
                          : (0x111111 as any)
                        : (0x222222 as any)
                    }
                    emissive={
                      (hi || 0) > 0
                        ? isHighlighted
                          ? (new THREE.Color(col as any) as any)
                          : (0x111111 as any)
                        : (0x111111 as any)
                    }
                    emissiveIntensity={
                      (hi || 0) > 0
                        ? isHighlighted
                          ? Math.min(0.35, 0.12 + (hi || 0) * 0.6)
                          : 0.05
                        : 0.06
                    }
                    side={THREE.FrontSide}
                    polygonOffset
                    polygonOffsetFactor={-2}
                    polygonOffsetUnits={-2}
                  />
                </mesh>
              </group>
            );
          });
        })()}

        {/* black face overlays removed */}
        {children}
      </mesh>
    );
  }
);

export default CubePiece;
