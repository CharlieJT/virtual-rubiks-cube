import React, { useMemo } from "react";
import * as THREE from "three";
import { CUBIE_SIZE, STICKER_LIFT } from "@components/RubiksCube3D/geometry";

const GREEN_COLOR = "#22c55e";
const RED_COLOR = "#ef4444";

interface StickerIndicatorProps {
  matches: boolean;
  tickRotationDeg?: number;
}

export const StickerIndicator: React.FC<StickerIndicatorProps> = ({
  matches,
  tickRotationDeg = 270,
}) => {
  const half = CUBIE_SIZE / 2;
  const stickerY = -(half + STICKER_LIFT);
  const spriteSize = CUBIE_SIZE * 0.5;
  const spriteTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.clearRect(0, 0, 64, 64);
    const centerX = 32;
    const centerY = 32;
    const radius = 28;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    const bgColor = matches ? GREEN_COLOR : RED_COLOR;
    ctx.fillStyle = bgColor;
    ctx.fill();
    ctx.strokeStyle = bgColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const scale = 64 / 24;

    if (matches) {
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((tickRotationDeg * Math.PI) / 180);
      ctx.beginPath();
      ctx.moveTo((20 - 12) * scale, (6 - 12) * scale);
      ctx.lineTo((9 - 12) * scale, (17 - 12) * scale);
      ctx.lineTo((4 - 12) * scale, (12 - 12) * scale);
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.moveTo(18 * scale, 6 * scale);
      ctx.lineTo(6 * scale, 18 * scale);
      ctx.moveTo(6 * scale, 6 * scale);
      ctx.lineTo(18 * scale, 18 * scale);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [matches, tickRotationDeg]);

  if (!spriteTexture) return null;

  const planeGeometry = useMemo(() => {
    return new THREE.PlaneGeometry(spriteSize, spriteSize);
  }, [spriteSize]);

  const forwardOffset = 0.03;

  return (
    <group position={[0, stickerY, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh
        geometry={planeGeometry}
        position={[0, 0, forwardOffset]}
        renderOrder={2}
      >
        <meshBasicMaterial
          map={spriteTexture}
          transparent={true}
          depthWrite={false}
          depthTest={true}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};
