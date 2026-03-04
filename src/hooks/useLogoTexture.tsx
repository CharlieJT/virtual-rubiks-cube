import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useMemo, useState } from "react";
import solvzLogoImg from "@/assets/solvz-logo.png";
import CUBE_COLORS from "@/consts/cubeColours";

const { WHITE } = CUBE_COLORS;

const useLogoTexture = () => {
  const { gl } = useThree();

  // Optional low-perf toggle via URL: ?lowperf=1
  const lowPerf = useMemo(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("lowperf") === "1";
    } catch {
      return false;
    }
  }, []);

  // Reliable white-center logo texture with retries & fallback
  const [logoReady, setLogoReady] = useState(false);
  const [solvzTexture, setSolvzTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let cancelled = false;
    let attempt = 0;
    const maxAttempts = 6;
    const baseDelay = 250;
    const load = () => {
      const loader = new THREE.TextureLoader();
      loader.load(
        solvzLogoImg,
        (tex) => {
          if (cancelled) return;
          if (THREE.SRGBColorSpace) {
            tex.colorSpace = THREE.SRGBColorSpace;
          }
          tex.wrapS = THREE.ClampToEdgeWrapping;
          tex.wrapT = THREE.ClampToEdgeWrapping;
          tex.center.set(0.5, 0.5);
          const maxAniso =
            (gl?.capabilities?.getMaxAnisotropy?.() as number) || 8;
          const targetAniso = lowPerf ? 2 : Math.min(8, maxAniso);
          tex.anisotropy = targetAniso;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.needsUpdate = true;
          setSolvzTexture(tex);
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
            // Fallback canvas texture so rendering still proceeds
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
