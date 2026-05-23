import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useMemo, useState } from "react";
import solvzLogoImg from "@/assets/solvz-logo.png";
import CUBE_COLORS from "@/consts/cubeColours";

const { WHITE } = CUBE_COLORS;

const LOGO_TARGET_MAX_WIDTH = 1024;

function getDeviceDprCap(): number {
  if (typeof window === "undefined") return 1;
  return Math.min(window.devicePixelRatio || 1, 2);
}

/** Trim transparent padding so the wordmark fills the UV circle. */
function getOpaqueBounds(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): { x: number; y: number; w: number; h: number } | null {
  const data = ctx.getImageData(0, 0, width, height).data;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let found = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 12) {
        found = true;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!found) return null;
  const pad = 2;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

function buildLogoTextureFromImage(
  image: HTMLImageElement,
  lowPerf: boolean,
): THREE.Texture {
  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = image.width;
  srcCanvas.height = image.height;
  const srcCtx = srcCanvas.getContext("2d");
  if (!srcCtx) {
    return new THREE.Texture(image);
  }

  srcCtx.drawImage(image, 0, 0);
  const bounds = getOpaqueBounds(srcCtx, image.width, image.height);

  const cropX = bounds?.x ?? 0;
  const cropY = bounds?.y ?? 0;
  const cropW = bounds?.w ?? image.width;
  const cropH = bounds?.h ?? image.height;

  const dpr = getDeviceDprCap();
  const upscaleFactor = lowPerf ? 1 : Math.max(1, dpr * 2);
  const targetWidth = Math.min(
    LOGO_TARGET_MAX_WIDTH,
    Math.round(cropW * upscaleFactor),
  );
  const targetHeight = Math.round((cropH / cropW) * targetWidth);

  const outCanvas = document.createElement("canvas");
  outCanvas.width = targetWidth;
  outCanvas.height = targetHeight;
  const outCtx = outCanvas.getContext("2d");
  if (!outCtx) {
    return new THREE.Texture(image);
  }

  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = "high";
  outCtx.drawImage(
    srcCanvas,
    cropX,
    cropY,
    cropW,
    cropH,
    0,
    0,
    targetWidth,
    targetHeight,
  );

  const texture = new THREE.CanvasTexture(outCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.center.set(0.5, 0.5);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

const useLogoTexture = () => {
  const { gl } = useThree();

  const lowPerf = useMemo(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("lowperf") === "1";
    } catch {
      return false;
    }
  }, []);

  const [logoReady, setLogoReady] = useState(false);
  const [solvzTexture, setSolvzTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let cancelled = false;
    let attempt = 0;
    const maxAttempts = 6;
    const baseDelay = 250;

    const applyTextureSettings = (tex: THREE.Texture) => {
      const maxAniso =
        (gl?.capabilities?.getMaxAnisotropy?.() as number) || 8;
      tex.anisotropy = lowPerf ? 2 : Math.min(16, maxAniso);
      tex.needsUpdate = true;
    };

    const load = () => {
      const loader = new THREE.TextureLoader();
      loader.load(
        solvzLogoImg,
        (tex) => {
          if (cancelled) return;
          const image = tex.image as HTMLImageElement;
          tex.dispose();

          const prepared = buildLogoTextureFromImage(image, lowPerf);
          applyTextureSettings(prepared);
          setSolvzTexture(prepared);
          setLogoReady(true);
        },
        undefined,
        () => {
          if (cancelled) return;
          attempt++;
          if (attempt < maxAttempts) {
            const delay = baseDelay * Math.pow(1.7, attempt - 1);
            setTimeout(load, delay);
          } else {
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = 64;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.fillStyle = WHITE;
              ctx.fillRect(0, 0, 64, 64);
              ctx.strokeStyle = "#000000";
              ctx.lineWidth = 6;
              ctx.strokeRect(3, 3, 58, 58);
            }
            const fallback = new THREE.CanvasTexture(canvas);
            applyTextureSettings(fallback);
            setSolvzTexture(fallback);
            setLogoReady(true);
          }
        },
      );
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [gl, lowPerf]);

  return {
    logoReady,
    solvzTexture,
  };
};

export default useLogoTexture;
