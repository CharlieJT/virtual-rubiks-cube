import CUBIE_STYLE_MAP from "@/config/cube/cubieStyleMap";
import { BORDER_RADIUS, BORDER_DEPTH, BORDER_LENGTH } from "./geometry";

/**
 * Populates borderMeshes on each entry in CUBIE_STYLE_MAP.
 * Each corner piece gets 3 cylinder descriptors along its edges,
 * and each edge piece gets 1 cylinder descriptor.
 * Runs once at module load time.
 */
const initBorderMeshes = () => {
  Object.entries(CUBIE_STYLE_MAP).forEach(([key, entry]) => {
    if (!entry) return;

    if (!entry.borderMeshes) {
      entry.borderMeshes = [];
    }

    if (entry.borderMeshes.length > 0) return;
    const [x, y, z] = key.split(",").map(Number);
    const extremes = [x, y, z].filter((c) => c === 0 || c === 2).length;
    const isCorner = extremes === 3;
    const isEdge = extremes === 2 && (x === 1 || y === 1 || z === 1);

    if (isCorner) {
      if (x === 0 && y === 0 && z === 0) {
        entry.borderMeshes.push(
          {
            position: [0, -BORDER_DEPTH, -BORDER_DEPTH],
            rotation: [0, 0, Math.PI / 2],
            cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
          },
          {
            position: [-BORDER_DEPTH, 0, -BORDER_DEPTH],
            rotation: [0, 0, 0],
            cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
          },
          {
            position: [-BORDER_DEPTH, -BORDER_DEPTH, 0],
            rotation: [Math.PI / 2, 0, 0],
            cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
          },
        );
      } else if (x === 0 && y === 0 && z === 2) {
        entry.borderMeshes.push(
          {
            position: [0, -BORDER_DEPTH, BORDER_DEPTH],
            rotation: [0, 0, Math.PI / 2],
            cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
          },
          {
            position: [-BORDER_DEPTH, 0, BORDER_DEPTH],
            rotation: [0, 0, 0],
            cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
          },
          {
            position: [-BORDER_DEPTH, -BORDER_DEPTH, 0],
            rotation: [Math.PI / 2, 0, 0],
            cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
          },
        );
      } else if (x === 0 && y === 2 && z === 0) {
        entry.borderMeshes.push(
          {
            position: [0, BORDER_DEPTH, -BORDER_DEPTH],
            rotation: [0, 0, Math.PI / 2],
            cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
          },
          {
            position: [-BORDER_DEPTH, 0, -BORDER_DEPTH],
            rotation: [0, 0, 0],
            cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
          },
          {
            position: [-BORDER_DEPTH, BORDER_DEPTH, 0],
            rotation: [Math.PI / 2, 0, 0],
            cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
          },
        );
      } else if (x === 0 && y === 2 && z === 2) {
        entry.borderMeshes.push(
          {
            position: [0, BORDER_DEPTH, BORDER_DEPTH],
            rotation: [0, 0, Math.PI / 2],
            cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
          },
          {
            position: [-BORDER_DEPTH, 0, BORDER_DEPTH],
            rotation: [0, 0, 0],
            cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
          },
          {
            position: [-BORDER_DEPTH, BORDER_DEPTH, 0],
            rotation: [Math.PI / 2, 0, 0],
            cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
          },
        );
      } else if (x === 2 && y === 0 && z === 0) {
        entry.borderMeshes.push(
          {
            position: [0, -BORDER_DEPTH, -BORDER_DEPTH],
            rotation: [0, 0, Math.PI / 2],
            cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
          },
          {
            position: [BORDER_DEPTH, 0, -BORDER_DEPTH],
            rotation: [0, 0, 0],
            cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
          },
          {
            position: [BORDER_DEPTH, -BORDER_DEPTH, 0],
            rotation: [Math.PI / 2, 0, 0],
            cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
          },
        );
      } else if (x === 2 && y === 0 && z === 2) {
        entry.borderMeshes.push(
          {
            position: [0, -BORDER_DEPTH, BORDER_DEPTH],
            rotation: [0, 0, Math.PI / 2],
            cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
          },
          {
            position: [BORDER_DEPTH, 0, BORDER_DEPTH],
            rotation: [0, 0, 0],
            cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
          },
          {
            position: [BORDER_DEPTH, -BORDER_DEPTH, 0],
            rotation: [Math.PI / 2, 0, 0],
            cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
          },
        );
      } else if (x === 2 && y === 2 && z === 0) {
        entry.borderMeshes.push(
          {
            position: [0, BORDER_DEPTH, -BORDER_DEPTH],
            rotation: [0, 0, Math.PI / 2],
            cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
          },
          {
            position: [BORDER_DEPTH, 0, -BORDER_DEPTH],
            rotation: [0, 0, 0],
            cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
          },
          {
            position: [BORDER_DEPTH, BORDER_DEPTH, 0],
            rotation: [Math.PI / 2, 0, 0],
            cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
          },
        );
      } else if (x === 2 && y === 2 && z === 2) {
        entry.borderMeshes.push(
          {
            position: [0, BORDER_DEPTH, BORDER_DEPTH],
            rotation: [0, 0, Math.PI / 2],
            cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
          },
          {
            position: [BORDER_DEPTH, 0, BORDER_DEPTH],
            rotation: [0, 0, 0],
            cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
          },
          {
            position: [BORDER_DEPTH, BORDER_DEPTH, 0],
            rotation: [Math.PI / 2, 0, 0],
            cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
          },
        );
      }
    } else if (isEdge) {
      if (x === 1) {
        const yOff = y === 2 ? BORDER_DEPTH : -BORDER_DEPTH;
        const zOff = z === 2 ? BORDER_DEPTH : -BORDER_DEPTH;
        entry.borderMeshes.push({
          position: [0, yOff, zOff],
          rotation: [0, 0, Math.PI / 2],
          cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
        });
      } else if (y === 1) {
        const xOff = x === 2 ? BORDER_DEPTH : -BORDER_DEPTH;
        const zOff = z === 2 ? BORDER_DEPTH : -BORDER_DEPTH;
        entry.borderMeshes.push({
          position: [xOff, 0, zOff],
          rotation: [0, 0, 0],
          cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
        });
      } else if (z === 1) {
        const xOff = x === 2 ? BORDER_DEPTH : -BORDER_DEPTH;
        const yOff = y === 2 ? BORDER_DEPTH : -BORDER_DEPTH;
        entry.borderMeshes.push({
          position: [xOff, yOff, 0],
          rotation: [Math.PI / 2, 0, 0],
          cylinder: { radius: BORDER_RADIUS, length: BORDER_LENGTH },
        });
      }
    }
  });
};

export default initBorderMeshes;
