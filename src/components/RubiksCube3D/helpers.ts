import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import tiptonsSolverImg from "../../assets/tiptons-solver.png";
import CUBE_COLORS from "@/consts/cubeColours";

const { WHITE } = CUBE_COLORS;

export const useLogoTexture = () => {
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
  const [tiptonsTexture, setTiptonsTexture] = useState<THREE.Texture | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    let attempt = 0;
    const maxAttempts = 6;
    const baseDelay = 250;
    const load = () => {
      const loader = new THREE.TextureLoader();
      loader.load(
        tiptonsSolverImg,
        (tex) => {
          if (cancelled) return;
          if ((THREE as any).SRGBColorSpace) {
            (tex as any).colorSpace = (THREE as any).SRGBColorSpace;
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
          setTiptonsTexture(tex);
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
            setTiptonsTexture(fallback);
            setLogoReady(true);
          }
        }
      );
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [gl, lowPerf]);

  return {
    logoReady,
    tiptonsTexture,
  };
};

export const useRoundedBoxGeometry = () => {
  // Create shared dice-like geometry with rounded corners and black rounded areas
  // Perf: keep subdivision segments low (2) – higher values multiply vertex count & GPU cost.
  const roundedBoxGeometry = useMemo(() => {
    const value = 1.08;
    const box = new THREE.BoxGeometry(value, value, value, 2, 2, 2);

    // Create vertex colors array - will be black for rounded areas, white elsewhere
    const colorArray = new Float32Array(box.attributes.position.count * 3);

    // Initialize all vertices to white (face colors will be applied via materials)
    for (let i = 0; i < box.attributes.position.count; i++) {
      colorArray[i * 3] = 1.0; // R = 1 (white)
      colorArray[i * 3 + 1] = 1.0; // G = 1 (white)
      colorArray[i * 3 + 2] = 1.0; // B = 1 (white)
    }

    // Round corners function with black coloring
    const roundCorner = (xx: number, yy: number, zz: number) => {
      const pos = box.getAttribute("position");
      const v = new THREE.Vector3();

      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i),
          y = pos.getY(i),
          z = pos.getZ(i);

        if (xx && Math.sign(x) !== Math.sign(xx)) continue;
        if (yy && Math.sign(y) !== Math.sign(yy)) continue;
        if (zz && Math.sign(z) !== Math.sign(zz)) continue;

        v.set(x, y, z);
        if (v.length() > 0.84) {
          // Set to pure black (#000000) for rounded areas
          colorArray[i * 3] = -0.3; // R = 0 (pure black)
          colorArray[i * 3 + 1] = -0.3; // G = 0 (pure black)
          colorArray[i * 3 + 2] = -0.3; // B = 0 (pure black)

          // Apply rounding
          v.setLength(0.85);
          pos.setXYZ(i, v.x, v.y, v.z);
        }
      }
    };

    // Pick which corners to round by editing this array:
    const roundedCorners: Array<[number, number, number]> = [
      [1, 1, 1], // +X, +Y, +Z
      [-1, 1, 1], // -X, +Y, +Z
      [1, -1, 1], // +X, -Y, +Z
      [-1, -1, 1], // -X, -Y, +Z
      [1, 1, -1], // +X, +Y, -Z
      [-1, 1, -1], // -X, +Y, -Z
      [1, -1, -1], // +X, -Y, -Z
      [-1, -1, -1], // -X, -Y, -Z
    ];
    roundedCorners.forEach(([xx, yy, zz]) => roundCorner(xx, yy, zz));

    // Add vertex colors to geometry
    box.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));

    box.computeVertexNormals();
    return box;
  }, []);

  return roundedBoxGeometry;
};

export const useHoverLogic = (
  cubeState: any[][][],
  groupRef: React.RefObject<THREE.Group | null>,
  raycastTargetsRef: React.RefObject<THREE.Mesh[]>,
  cubiesRef: React.RefObject<any[]>
) => {
  const { camera } = useThree();
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const lastHoveredPieceRef = useRef<string | null>(null);

  const handlePreciseHover = useCallback(
    (e: any) => {
      if (!groupRef.current) return;
      const rect = e.nativeEvent.target?.getBoundingClientRect();
      const mouse = mouseRef.current;
      mouse.set(
        ((e.nativeEvent.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.nativeEvent.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = raycasterRef.current;
      // Use the scene's actual camera to avoid allocating a new camera per move (mobile stability)
      raycaster.setFromCamera(mouse, camera);

      const targets =
        raycastTargetsRef.current?.length > 0
          ? raycastTargetsRef.current
          : (() => {
              const all: THREE.Mesh[] = [];
              groupRef.current!.traverse((child) => {
                if (
                  child instanceof THREE.Mesh &&
                  child.parent === groupRef.current
                ) {
                  all.push(child);
                }
              });
              if (raycastTargetsRef.current) {
                raycastTargetsRef.current = all;
              }
              return all;
            })();

      const intersects = raycaster.intersectObjects(targets);
      if (intersects.length === 0) {
        lastHoveredPieceRef.current = null;
        return;
      }

      const intersectedMesh = intersects[0].object as THREE.Mesh;
      const intersectionPoint = intersects[0].point;

      // Find the corresponding cubie
      const cubie = cubiesRef.current?.find((c) => c.mesh === intersectedMesh);
      if (!cubie) return;

      const cubieCenter = new THREE.Vector3(
        (cubie.x - 1) * 1.05,
        (cubie.y - 1) * 1.05,
        (cubie.z - 1) * 1.05
      );

      const halfSize = 0.4655;
      const relative = intersectionPoint.clone().sub(cubieCenter);
      const withinBounds =
        Math.abs(relative.x) <= halfSize &&
        Math.abs(relative.y) <= halfSize &&
        Math.abs(relative.z) <= halfSize;

      if (!withinBounds) return;

      const absX = Math.abs(relative.x);
      const absY = Math.abs(relative.y);
      const absZ = Math.abs(relative.z);
      const faceThreshold = 0.4;

      let faceName = "";
      if (absX > faceThreshold && absX >= absY && absX >= absZ) {
        faceName = relative.x > 0 ? "right" : "left";
      } else if (absY > faceThreshold && absY >= absX && absY >= absZ) {
        faceName = relative.y > 0 ? "top" : "bottom";
      } else if (absZ > faceThreshold && absZ >= absX && absZ >= absY) {
        faceName = relative.z > 0 ? "front" : "back";
      }

      if (!faceName) return;

      const gridPos: [number, number, number] = [
        cubie.x - 1,
        cubie.y - 1,
        cubie.z - 1,
      ];

      const isOuterFace =
        (faceName === "right" && gridPos[0] === 1) ||
        (faceName === "left" && gridPos[0] === -1) ||
        (faceName === "top" && gridPos[1] === 1) ||
        (faceName === "bottom" && gridPos[1] === -1) ||
        (faceName === "front" && gridPos[2] === 1) ||
        (faceName === "back" && gridPos[2] === -1);

      if (!isOuterFace) return;

      const cubieState = cubeState[cubie.x]?.[cubie.y]?.[cubie.z];
      if (!cubieState) return;

      const faceColors = {
        right: cubieState.colors.right,
        left: cubieState.colors.left,
        top: cubieState.colors.top,
        bottom: cubieState.colors.bottom,
        front: cubieState.colors.front,
        back: cubieState.colors.back,
      };
      const faceColor = faceColors[faceName as keyof typeof faceColors];

      if (faceColor === "#808080" || faceColor === CUBE_COLORS.BLACK) return;

      const pieceId = `${gridPos[0]},${gridPos[1]},${gridPos[2]}|${faceName}`;

      if (lastHoveredPieceRef.current === pieceId) return;

      lastHoveredPieceRef.current = pieceId;
    },
    [cubeState, camera, groupRef, raycastTargetsRef, cubiesRef]
  );

  const handleLeaveCube = useCallback(() => {
    lastHoveredPieceRef.current = null;
  }, []);

  return {
    handlePreciseHover,
    handleLeaveCube,
  };
};
