import React, { useRef, useEffect, useMemo, useCallback } from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { getCubieGeometry, getStickerGeometryForCorners } from "./geometry";
import type { CubePieceProps } from "./types";
import type { CubeState } from "@/types/cube";
import STICKER_CORNER_MAP from "@/config/cube/stickerCornerMap";
import CUBE_COLORS from "@/consts/cubeColours";
import ModernCubePieceVisual from "./ModernCubePieceVisual";
import { activeTouches } from "@utils/touchState";
import {
  CUBIE_SIZE,
  CUBIE_DISTANCE,
  STICKER_INSET,
  STICKER_LIFT,
  STICKER_CORNER_RATIO,
  STICKER_FALSE_CORNER_RATIO,
} from "./geometry";

const { WHITE } = CUBE_COLORS;

const _emissiveColor = new THREE.Color();
const _baseColor = new THREE.Color();

const isWhite = (c: string) => {
  if (!c) return false;
  let s = c.toLowerCase();
  if (s[0] === "#" && s.length === 4) {
    s = `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  }
  return s === WHITE || s === "white";
};

const hasStickerColor = (c: string | undefined) => !!c && c !== "";

const MODERN_HIT_BOX = new THREE.BoxGeometry(CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE);
const MODERN_HIT_MATERIAL = new THREE.MeshBasicMaterial({
  color: 0x000000,
  transparent: true,
  opacity: 0,
  depthWrite: false,
});

const CubePiece = ({
    position,
    colors,
    previousColors,
    baselineColors,
    stickerGreyMap: _stickerGreyMap,
    colorFadeProgress = 0,
    gridIndex,
    onPointerDown,
    onMeshReady,
    onMaterialsReady,
    onPointerMove,
    touchCount = 0,
    cornerStyles = [],
    children,
    trackingStateRef,
    highlightIntensity = 0,
    isHighlighted = false,
    dullOthersIntensity = 0,
    stickerDoubleSide = false,
    doubleSidedStickerKeysForEdges,
    cubeOpacity,
    innerStickerOpacity,
    isColorFadeActive = false,
    designVariant = "legacy",
    sharedLogoTexture,
    logoReady,
    hideLogo = false,
    orbitOnlyOnPointer = false,
  }: CubePieceProps & {
    sharedLogoTexture: THREE.Texture | null;
    logoReady: boolean;
    hideLogo?: boolean;
    isHighlighted?: boolean;
    dullOthersIntensity?: number;
  }) => {
    const positionRef = useRef(position);
    positionRef.current = position;
    const touchCountRef = useRef(touchCount);
    touchCountRef.current = touchCount;
    const onPointerDownRef = useRef(onPointerDown);
    onPointerDownRef.current = onPointerDown;
    const orbitOnlyOnPointerRef = useRef(orbitOnlyOnPointer);
    orbitOnlyOnPointerRef.current = orbitOnlyOnPointer;
    const onPointerMoveRef = useRef(onPointerMove);
    onPointerMoveRef.current = onPointerMove;

    const stickerMatsRef = useRef<
      Record<string, THREE.MeshPhongMaterial | THREE.MeshPhysicalMaterial>
    >({});
    const baseColorsRef = useRef<Record<string, THREE.Color>>({});

    const tryRegisterMaterials = useCallback(() => {
      if (!gridIndex || !onMaterialsReady) return;

      const materialCount = Object.keys(stickerMatsRef.current).length;
      if (materialCount === 0) return;

      const key = `${gridIndex[0]},${gridIndex[1]},${gridIndex[2]}`;
      onMaterialsReady(key, {
        materials: stickerMatsRef.current,
        baseColors: baseColorsRef.current,
        gridIndex,
      });
    }, [gridIndex, onMaterialsReady]);

    const meshRef = useRef<THREE.Mesh>(null);
    // These props are passed by the parent but consumed centrally in RubiksCube3D's
    // useFrame loop for fade/dull animations rather than per-piece rendering.
    void _stickerGreyMap;
    void previousColors;
    void baselineColors;
    void colorFadeProgress;
    void dullOthersIntensity;
    const useModernDesign = designVariant === "modern";

    const cubieGeometry = useMemo(
      () =>
        useModernDesign
          ? MODERN_HIT_BOX
          : getCubieGeometry(CUBIE_SIZE, cornerStyles),
      [cornerStyles, useModernDesign],
    );

    useEffect(() => {
      if (meshRef.current && onMeshReady) {
        const [x, y, z] = position;
        const gridX = Math.round(x / CUBIE_DISTANCE + 1);
        const gridY = Math.round(y / CUBIE_DISTANCE + 1);
        const gridZ = Math.round(z / CUBIE_DISTANCE + 1);

        onMeshReady(meshRef.current, gridX, gridY, gridZ);
      }
    }, [position, onMeshReady]);

    // Center piece = exactly two grid coords at middle index (1)
    const [gx, gy, gz] = useMemo(() => {
      const [x, y, z] = position;
      return [
        Math.round(x / CUBIE_DISTANCE + 1),
        Math.round(y / CUBIE_DISTANCE + 1),
        Math.round(z / CUBIE_DISTANCE + 1),
      ];
    }, [position]);
    const isCenter =
      (gx === 1 ? 1 : 0) + (gy === 1 ? 1 : 0) + (gz === 1 ? 1 : 0) === 2;

    const stickerBaseSize = useMemo(() => CUBIE_SIZE * STICKER_INSET, []);

    const [stickerRadiusTrue, stickerRadiusFalse] = useMemo(
      () => [
        stickerBaseSize * STICKER_CORNER_RATIO,
        stickerBaseSize * STICKER_FALSE_CORNER_RATIO,
      ],
      [stickerBaseSize],
    );

    useEffect(() => {
      if (sharedLogoTexture) {
        sharedLogoTexture.center.set(0.5, 0.5);
        sharedLogoTexture.offset.set(0, 0);
        sharedLogoTexture.wrapS = THREE.ClampToEdgeWrapping;
        sharedLogoTexture.wrapT = THREE.ClampToEdgeWrapping;
        sharedLogoTexture.needsUpdate = true;
      }
    }, [sharedLogoTexture]);

    const materialRefs = useRef<THREE.MeshBasicMaterial[]>([
      new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false }),
      new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false }),
      new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false }),
      new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false }),
      new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false }),
      new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false }),
    ]);
    useEffect(() => {
      if (useModernDesign) return;
      const mats = materialRefs.current;
      const transparent = cubeOpacity != null && cubeOpacity < 1;
      const opacity = cubeOpacity ?? 1;
      for (let i = 0; i < 6; i++) {
        const mat = mats[i];
        mat.color.set(0x000000);
        mat.map = null;
        mat.transparent = transparent;
        mat.opacity = opacity;
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
      cubeOpacity,
      useModernDesign,
    ]);

    const handlePointerDown = useCallback(
      (e: ThreeEvent<PointerEvent>) => {
        const isPrimary = (e.button ?? 0) === 0;
        const shiftHeld = !!e.shiftKey;
        if (isPrimary && !shiftHeld) {
          const pointerType =
            e.nativeEvent && "pointerType" in e.nativeEvent
              ? (e.nativeEvent as PointerEvent).pointerType
              : null;
          if (pointerType === "touch") {
            if (
              trackingStateRef &&
              trackingStateRef.current.isDragging &&
              trackingStateRef.current._pointerId &&
              trackingStateRef.current._pointerId !== e.pointerId
            ) {
              return;
            }
            if ((touchCountRef.current || 0) > 2) return;
            if (activeTouches.count > 2) return;
            const touches =
              e.nativeEvent && "touches" in e.nativeEvent
                ? (e.nativeEvent as unknown as TouchEvent).touches
                : undefined;
            if (touches && touches.length > 2) return;
          }
          const intersectionPoint = e.point || new THREE.Vector3();
          if (orbitOnlyOnPointerRef.current) {
            onPointerDownRef.current?.(
              e as unknown as React.PointerEvent,
              positionRef.current,
              intersectionPoint,
            );
            return;
          }
          e.stopPropagation();
          onPointerDownRef.current?.(
            e as unknown as React.PointerEvent,
            positionRef.current,
            intersectionPoint,
          );
        }
      },
      // trackingStateRef is a stable ref identity from the parent
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    );

    const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
      const isPrimary = (e.button ?? 0) === 0;
      const shiftHeld = !!e.shiftKey;
      if (isPrimary && !shiftHeld) {
        e.stopPropagation();
        onPointerMoveRef.current?.(e as unknown as React.PointerEvent);
      }
    }, []);

    const handlePointerUp = useCallback((e: ThreeEvent<PointerEvent>) => {
      const isPrimary = (e.button ?? 0) === 0;
      const shiftHeld = !!e.shiftKey;
      if (isPrimary && !shiftHeld) {
        e.stopPropagation();
      }
    }, []);

    const handleModernStickerMaterial = useCallback(
      (
        face: keyof CubeState["colors"],
        material: THREE.MeshPhysicalMaterial,
        color: string,
        hasLogoMap: boolean,
      ) => {
        const isNewMaterial = stickerMatsRef.current[face] !== material;
        stickerMatsRef.current[face] = material;
        if (!isColorFadeActive) {
          material.color.set(color);
          if (!baseColorsRef.current[face]) {
            baseColorsRef.current[face] = new THREE.Color();
          }
          _baseColor.set(color);
          baseColorsRef.current[face].copy(_baseColor);
        }
        const targetTransparent =
          cubeOpacity != null && cubeOpacity < 1 ? true : hasLogoMap;
        if (material.transparent !== targetTransparent) {
          material.transparent = targetTransparent;
          material.needsUpdate = true;
        }
        material.opacity = cubeOpacity ?? 1;
        material.depthWrite = !(cubeOpacity != null && cubeOpacity < 1);
        if (isNewMaterial && onMaterialsReady) tryRegisterMaterials();
      },
      [cubeOpacity, isColorFadeActive, onMaterialsReady, tryRegisterMaterials],
    );

    const stickerElements = useMemo(() => {
      if (useModernDesign) return null;
      const faces: Array<{
        key: keyof CubeState["colors"];
        show: boolean;
        pos: [number, number, number];
        rot: [number, number, number];
      }> = [];
      const [igx, igy, igz] = gridIndex ?? [gx, gy, gz];
      const half = CUBIE_SIZE / 2;
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
        },
      );
      return faces.map((f) => {
        const col = colors[f.key];
        if (!f.show || !hasStickerColor(col)) return null;
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
          cornerPattern,
        );
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
        const hi = highlightIntensity;
        const emissiveHex =
          (hi || 0) > 0 && isHighlighted
            ? _emissiveColor.set(col as string).getHex()
            : 0x111111;
        const innerOffsetScale = -1;
        const innerPos: [number, number, number] = [
          -f.pos[0] * innerOffsetScale,
          -f.pos[1] * innerOffsetScale,
          -f.pos[2] * innerOffsetScale,
        ];
        const innerRot: [number, number, number] = [
          f.rot[0],
          f.rot[1] + Math.PI,
          f.rot[2],
        ];
        const isEdgeDoubleSided =
          doubleSidedStickerKeysForEdges?.has(stickerKey) ?? false;
        const showInnerSticker =
          (isCenterSticker && stickerDoubleSide) || isEdgeDoubleSided;
        return (
          <>
            <group key={f.key} position={f.pos} rotation={f.rot}>
              <mesh geometry={geom}>
                <meshPhongMaterial
                  ref={(m) => {
                    if (m) {
                      stickerMatsRef.current[f.key] = m;
                      if (!isColorFadeActive) {
                        const newColor = showLogo ? 0xffffff : col;
                        m.color.set(newColor);
                        if (!baseColorsRef.current[f.key]) {
                          baseColorsRef.current[f.key] = new THREE.Color();
                        }
                        _baseColor.set(newColor);
                        baseColorsRef.current[f.key].copy(_baseColor);
                      }
                      const targetTransparent =
                        cubeOpacity != null && cubeOpacity < 1
                          ? true
                          : !!showLogo;
                      if (m.transparent !== targetTransparent) {
                        m.transparent = targetTransparent;
                        m.needsUpdate = true;
                      }
                      m.opacity = cubeOpacity ?? 1;
                      if (onMaterialsReady) tryRegisterMaterials();
                    }
                  }}
                  map={showLogo ? sharedLogoTexture || undefined : undefined}
                  transparent={cubeOpacity != null && cubeOpacity < 1 ? true : !!showLogo}
                  opacity={cubeOpacity ?? 1}
                  shininess={(hi || 0) > 0 ? (isHighlighted ? 24 : 2) : 8}
                  specular={
                    (hi || 0) > 0
                      ? isHighlighted
                        ? 0x222222
                        : 0x111111
                      : 0x222222
                  }
                  emissive={emissiveHex}
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
            {showInnerSticker && (
              <group
                key={`${f.key}-inner`}
                position={innerPos}
                rotation={innerRot}
              >
                <mesh geometry={geom} renderOrder={10}>
                  <meshPhongMaterial
                    color={col}
                    transparent={
                      (innerStickerOpacity ?? cubeOpacity ?? 1) < 1
                    }
                    opacity={innerStickerOpacity ?? cubeOpacity ?? 1}
                    shininess={8}
                    specular={0x222222}
                    emissive={0x111111}
                    emissiveIntensity={0.06}
                    side={isEdgeDoubleSided ? THREE.DoubleSide : THREE.FrontSide}
                    depthTest={false}
                    depthWrite={false}
                    polygonOffset
                    polygonOffsetFactor={-2}
                    polygonOffsetUnits={-2}
                  />
                </mesh>
              </group>
            )}
          </>
        );
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      colors,
      gx,
      gy,
      gz,
      gridIndex,
      hideLogo,
      logoReady,
      sharedLogoTexture,
      highlightIntensity,
      isHighlighted,
      stickerBaseSize,
      stickerRadiusTrue,
      stickerRadiusFalse,
      onMaterialsReady,
      tryRegisterMaterials,
      stickerDoubleSide,
      doubleSidedStickerKeysForEdges,
      cubeOpacity,
      innerStickerOpacity,
      isColorFadeActive,
      useModernDesign,
    ]);

    if (!cubieGeometry) return null;

    if (useModernDesign) {
      return (
        <mesh
          ref={meshRef}
          position={position}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <mesh geometry={cubieGeometry} material={MODERN_HIT_MATERIAL} />
          <ModernCubePieceVisual
            gridIndex={gridIndex ?? [gx, gy, gz]}
            colors={colors}
            cubeOpacity={cubeOpacity}
            innerStickerOpacity={innerStickerOpacity}
            stickerDoubleSide={stickerDoubleSide}
            doubleSidedStickerKeysForEdges={doubleSidedStickerKeysForEdges}
            hideLogo={hideLogo}
            sharedLogoTexture={sharedLogoTexture}
            logoReady={logoReady}
            onStickerMaterial={handleModernStickerMaterial}
          />
          {children}
        </mesh>
      );
    }

    return (
      <mesh
        ref={meshRef}
        position={position}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <mesh geometry={cubieGeometry} material={materialRefs.current} />
        {stickerElements}
        {children}
      </mesh>
    );
  };

function cubePiecePropsEqual(
  prev: CubePieceProps & {
    sharedLogoTexture: THREE.Texture | null;
    logoReady: boolean;
    hideLogo?: boolean;
    isHighlighted?: boolean;
    dullOthersIntensity?: number;
  },
  next: typeof prev,
): boolean {
  if (prev.orbitOnlyOnPointer !== next.orbitOnlyOnPointer) return false;
  if (prev.designVariant !== next.designVariant) return false;
  if (prev.cubeOpacity !== next.cubeOpacity) return false;
  if (prev.innerStickerOpacity !== next.innerStickerOpacity) return false;
  if (prev.stickerDoubleSide !== next.stickerDoubleSide) return false;
  if (prev.doubleSidedStickerKeysForEdges !== next.doubleSidedStickerKeysForEdges)
    return false;
  if (prev.hideLogo !== next.hideLogo) return false;
  if (prev.logoReady !== next.logoReady) return false;
  if (prev.sharedLogoTexture !== next.sharedLogoTexture) return false;
  if (prev.isHighlighted !== next.isHighlighted) return false;
  if (prev.dullOthersIntensity !== next.dullOthersIntensity) return false;
  if (prev.isColorFadeActive !== next.isColorFadeActive) return false;
  if (prev.colorFadeProgress !== next.colorFadeProgress) return false;
  if (prev.position[0] !== next.position[0]) return false;
  if (prev.position[1] !== next.position[1]) return false;
  if (prev.position[2] !== next.position[2]) return false;
  const pg = prev.gridIndex;
  const ng = next.gridIndex;
  if (pg?.[0] !== ng?.[0] || pg?.[1] !== ng?.[1] || pg?.[2] !== ng?.[2]) {
    return false;
  }
  const pc = prev.colors;
  const nc = next.colors;
  return (
    pc.front === nc.front &&
    pc.back === nc.back &&
    pc.left === nc.left &&
    pc.right === nc.right &&
    pc.top === nc.top &&
    pc.bottom === nc.bottom
  );
}

export default React.memo(CubePiece, cubePiecePropsEqual);
