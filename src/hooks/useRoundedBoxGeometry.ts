import { useMemo } from "react";
import * as THREE from "three";

const useRoundedBoxGeometry = () => {
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

export default useRoundedBoxGeometry;
