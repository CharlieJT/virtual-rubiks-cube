import { useState, useEffect, useMemo } from "react";
import * as THREE from "three";
import type { CubeState } from "@/types/cube";
import {
  CUBIE_SIZE,
  STICKER_LIFT,
  getCubieGeometry,
  getStickerGeometryForCorners,
  STICKER_CORNER_RATIO,
  STICKER_FALSE_CORNER_RATIO,
  STICKER_INSET,
} from "@components/RubiksCube3D/geometry";
import STICKER_CORNER_MAP from "@/config/cube/stickerCornerMap";
import CUBIE_STYLE_MAP from "@/config/cube/cubieStyleMap";


interface GhostPieceProps {
  position: [number, number, number];
  colors: CubeState["colors"];
  cornerStyles: string[];
  opacity: number;
  gridPosition: [number, number, number];
  sharedLogoTexture: THREE.Texture | null;
  logoReady: boolean;
  move:
    | "R"
    | "R'"
    | "F"
    | "F'"
    | "L"
    | "L'"
    | "U"
    | "U'"
    | "D"
    | "D'"
    | "B"
    | "B'"
    | "F2"
    | "R2"
    | "L2"
    | "U2"
    | "D2"
    | "B2";
}

const GhostPiece: React.FC<GhostPieceProps> = ({
  position,
  colors,
  cornerStyles,
  opacity,
  gridPosition,
  sharedLogoTexture,
}) => {
  const [cubieGeometry, setCubieGeometry] =
    useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    let cancelled = false;
    setCubieGeometry(null);
    setTimeout(() => {
      if (!cancelled) {
        const geometry = getCubieGeometry(CUBIE_SIZE, cornerStyles);
        setCubieGeometry(geometry);
      }
    }, 0);
    return () => {
      cancelled = true;
    };
  }, [cornerStyles]);

  // Utility: is a color value considered "present" for sticker purposes
  const hasStickerColor = (c: string | undefined) => !!c && c !== "";

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

  // Use gridPosition as gridIndex (same as CubePiece does with gridIndex ?? [gx, gy, gz])
  const [igx, igy, igz] = gridPosition;

  // Get border meshes from CUBIE_STYLE_MAP (same as main cube)
  const borderMeshes = useMemo(() => {
    const cubieKey = `${igx},${igy},${igz}`;
    const styleEntry = CUBIE_STYLE_MAP[cubieKey];
    return styleEntry?.borderMeshes || [];
  }, [igx, igy, igz]);

  // Base sticker size & radius (matching CubePiece)
  const stickerBaseSize = useMemo(() => CUBIE_SIZE * STICKER_INSET, []);
  const [stickerRadiusTrue, stickerRadiusFalse] = useMemo(
    () => [
      stickerBaseSize * STICKER_CORNER_RATIO,
      stickerBaseSize * STICKER_FALSE_CORNER_RATIO,
    ],
    [stickerBaseSize]
  );
  const half = (CUBIE_SIZE / 2) * 1.02;

  if (!cubieGeometry) return null;

  const faces: Array<{
    key: keyof CubeState["colors"];
    show: boolean;
    pos: [number, number, number];
    rot: [number, number, number];
  }> = [
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
  ];

  return (
    <group position={position} renderOrder={10}>
      <mesh renderOrder={10}>
        <primitive object={cubieGeometry} />
        <meshPhongMaterial
          color={0x000000}
          transparent={opacity < 1}
          opacity={opacity}
          side={THREE.DoubleSide}
        />
      </mesh>

      {faces.map((f) => {
        const col = colors[f.key];
        if (!f.show || !hasStickerColor(col)) return null;
        // Use igx, igy, igz (from gridPosition) for sticker key lookup, matching CubePiece exactly
        const stickerKey = `${igx},${igy},${igz}:${f.key}`;
        const cornerPattern = STICKER_CORNER_MAP[stickerKey] || [
          false,
          false,
          false,
          false,
        ];
        const stickerGeometry = getStickerGeometryForCorners(
          stickerBaseSize,
          stickerRadiusTrue,
          stickerRadiusFalse,
          cornerPattern
        );

        // Logo is disabled on ghost pieces
        const showLogo = false;

        return (
          <group
            key={f.key}
            position={f.pos}
            rotation={f.rot}
            renderOrder={10}
          >
            <mesh geometry={stickerGeometry} renderOrder={10}>
              <meshPhongMaterial
                map={showLogo ? sharedLogoTexture || undefined : undefined}
                color={showLogo ? 0xffffff : col}
                transparent={opacity < 1 || !!showLogo}
                opacity={opacity}
                side={THREE.FrontSide}
              />
            </mesh>
          </group>
        );
      })}

      {/* Border meshes (same as main cube) */}
      {borderMeshes.map((bm, idx) => {
        if (!bm.cylinder) return null;
        const { radius, length, segments = 8 } = bm.cylinder;
        const [px, py, pz] = bm.position;
        const rot = bm.rotation || [0, 0, 0];
        return (
          <mesh
            key={idx}
            position={[px, py, pz]}
            rotation={rot}
            renderOrder={10}
          >
            <cylinderGeometry args={[radius, radius, length, segments]} />
            <meshPhongMaterial
              color={bm.color || "#222"}
              transparent={opacity < 1}
              opacity={opacity}
              toneMapped={true}
              polygonOffset={true}
              polygonOffsetFactor={0}
              polygonOffsetUnits={-1000}
            />
          </mesh>
        );
      })}
    </group>
  );
};

export default GhostPiece;
