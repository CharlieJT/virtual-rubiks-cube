import { useEffect, useCallback } from "react";
import * as THREE from "three";
import type { CubeState } from "@/types/cube";
import ModernCubePieceVisual from "@components/RubiksCube3D/ModernCubePieceVisual";

interface GhostPieceProps {
  position: [number, number, number];
  colors: CubeState["colors"];
  cornerStyles: string[];
  opacity: number;
  gridPosition: [number, number, number];
  sharedLogoTexture: THREE.Texture | null;
  logoReady: boolean;
  cubeScale?: number;
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

const GHOST_RENDER_ORDER = 10;

const GhostPiece: React.FC<GhostPieceProps> = ({
  position,
  colors,
  opacity,
  gridPosition,
  sharedLogoTexture,
  logoReady,
  cubeScale = 0.9,
}) => {
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

  const handleStickerMaterial = useCallback(() => {
    // Ghost pieces are read-only; no material registration needed.
  }, []);

  return (
    <group
      position={position}
      scale={[cubeScale, cubeScale, cubeScale]}
      renderOrder={GHOST_RENDER_ORDER}
    >
      <ModernCubePieceVisual
        gridIndex={gridPosition}
        colors={colors}
        cubeOpacity={opacity}
        hideLogo
        sharedLogoTexture={sharedLogoTexture}
        logoReady={logoReady}
        onStickerMaterial={handleStickerMaterial}
        renderOrder={GHOST_RENDER_ORDER}
      />
    </group>
  );
};

export default GhostPiece;
