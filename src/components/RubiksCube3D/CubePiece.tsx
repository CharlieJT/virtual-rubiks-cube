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
    // Shared resources passed from parent to avoid per-cubie allocations
    roundedBoxGeometry,
    sharedLogoTexture,
    logoReady,
  }: CubePieceProps & {
    roundedBoxGeometry: THREE.BufferGeometry;
    sharedLogoTexture: THREE.Texture | null;
    logoReady: boolean;
    isHighlighted?: boolean;
    pulse?: boolean;
    pulseSpeed?: number;
    pulseMin?: number;
    pulseMax?: number;
  }) => {
    // Track per-face materials and base colors for animation
    const stickerMatsRef = useRef<Record<string, THREE.MeshPhongMaterial>>({});
    const baseColorsRef = useRef<Record<string, THREE.Color>>({});
    const tRef = useRef(0);

    useFrame((_, delta) => {
      if (!pulse || !isHighlighted) return;
      // Update time using cycles per second -> radians per second = 2πf
      const omega = 2 * Math.PI * (pulseSpeed || 1.2);
      tRef.current += delta * omega;
      const s = Math.sin(tRef.current); // [-1,1]
      const brightenAmt = Math.max(0, s) * (pulseMax || 0.25); // 0..pulseMax
      const dullAmt = Math.max(0, -s) * (pulseMin || 0.18); // 0..pulseMin
      const grey = new THREE.Color("#808080");
      const white = new THREE.Color(0xffffff);
      for (const face in stickerMatsRef.current) {
        const mat = stickerMatsRef.current[face];
        const base = baseColorsRef.current[face];
        if (!mat || !base) continue;
        // Start from base, apply brighten then dull blend
        const c = base.clone();
        if (brightenAmt > 0) c.lerp(white, Math.min(0.85, brightenAmt));
        if (dullAmt > 0) c.lerp(grey, Math.min(0.85, dullAmt));
        mat.color.copy(c);
        // Subtle emissive pulse too
        const emissiveBase = base.clone();
        const emissiveColor = emissiveBase.multiplyScalar(0.4);
        mat.emissive.copy(emissiveColor);
        mat.emissiveIntensity = 0.05 + brightenAmt * 0.25;
        mat.shininess = 12 + brightenAmt * 16;
        mat.needsUpdate = true;
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
                          baseColorsRef.current[f.key] = m.color.clone();
                        } catch {}
                      }
                    }}
                    map={showLogo ? sharedLogoTexture || undefined : undefined}
                    color={
                      (() => {
                        // Start from base: for logo we multiply the texture by color; for normal stickers we use the sticker color
                        const base = showLogo
                          ? new THREE.Color(0xffffff)
                          : new THREE.Color(col as any);
                        const intensity = (hi as number) || 0;
                        if (intensity > 0) {
                          if (isHighlighted) {
                            // Brighten highlighted target
                            const factor = Math.min(0.7, 0.25 + intensity);
                            return base
                              .clone()
                              .lerp(new THREE.Color(0xffffff), factor);
                          } else {
                            // Dull non-targets toward grey
                            const dullFactor = Math.min(0.85, 0.2 + intensity);
                            return base
                              .clone()
                              .lerp(new THREE.Color("#808080"), dullFactor);
                          }
                        }
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
