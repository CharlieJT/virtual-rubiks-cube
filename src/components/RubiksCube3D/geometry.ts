import * as THREE from "three";

// Centralized drag sensitivity (radians per pixel)
export const DRAG_SENSITIVITY = 0.006;
// Minimum primary-axis projection (px) required to lock a drag and start a twist
export const LOCK_PRIMARY_PX = 5;

// Distance the cubies are apart
export const CUBIE_DISTANCE = 1.09;

export const CUBIE_SIZE = 1.09;
// Sticker appearance tuning
export const STICKER_INSET = 0.91; // 90% of face size
export const STICKER_LIFT = 0.01; // distance above cubie surface (in world units) to prevent z-fighting; larger because size != 1
export const STICKER_CORNER_RATIO = 0.285; // fraction of sticker size used as corner radius when corner flag is true
export const STICKER_FALSE_CORNER_RATIO = 0.04; // tiny rounding for corners flagged false (was sharp previously)
export const STICKER_CURVE_SEGMENTS = 6; // segments used to approximate each rounded corner

// Border mesh constants
export const BORDER_RADIUS = 0.065;
export const BORDER_DEPTH = 0.502;
export const BORDER_LENGTH = 1.04;

// Geometry cache for performance
const geometryCache = new Map<string, THREE.BufferGeometry>();

// Cache sticker geometries by pattern
const stickerGeometryCache = new Map<string, THREE.ShapeGeometry>();

export const getStickerGeometryForCorners = (
  size: number,
  rTrue: number,
  rFalse: number,
  corners: [boolean, boolean, boolean, boolean]
) => {
  const key = `v3_${size}_${rTrue}_${rFalse}_${corners
    .map((c) => (c ? 1 : 0))
    .join("")}`;
  const cached = stickerGeometryCache.get(key);
  if (cached) return cached;

  const radii = corners.map((flag) =>
    Math.min(flag ? rTrue : rFalse, size * 0.49)
  ) as [number, number, number, number];

  const half = size / 2;
  const bl = new THREE.Vector2(-half, -half);
  const br = new THREE.Vector2(half, -half);
  const tr = new THREE.Vector2(half, half);
  const tl = new THREE.Vector2(-half, half);
  const shape = new THREE.Shape();
  const [r0, r1, r2, r3] = radii;
  shape.moveTo(bl.x + r0, bl.y);
  shape.lineTo(br.x - r1, br.y);
  shape.absarc(br.x - r1, br.y + r1, r1, -Math.PI / 2, 0, false);
  shape.lineTo(tr.x, tr.y - r2);
  shape.absarc(tr.x - r2, tr.y - r2, r2, 0, Math.PI / 2, false);
  shape.lineTo(tl.x + r3, tl.y);
  shape.absarc(tl.x + r3, tl.y - r3, r3, Math.PI / 2, Math.PI, false);
  shape.lineTo(bl.x, bl.y + r0);
  shape.absarc(bl.x + r0, bl.y + r0, r0, Math.PI, (3 * Math.PI) / 2, false);
  shape.closePath();

  const geom = new THREE.ShapeGeometry(shape, STICKER_CURVE_SEGMENTS);
  geom.computeBoundingBox();
  const bb = geom.boundingBox;
  if (bb) {
    const cx = (bb.max.x + bb.min.x) / 2;
    const cy = (bb.max.y + bb.min.y) / 2;
    const width = bb.max.x - bb.min.x;
    const height = bb.max.y - bb.min.y;
    const posAttr = geom.getAttribute("position");
    const vertexCount = posAttr.count;
    for (let i = 0; i < vertexCount; i++) {
      posAttr.setXY(i, posAttr.getX(i) - cx, posAttr.getY(i) - cy);
    }
    posAttr.needsUpdate = true;
    const uvs: number[] = [];
    for (let i = 0; i < vertexCount; i++) {
      const ox = posAttr.getX(i) + cx;
      const oy = posAttr.getY(i) + cy;
      uvs.push((ox - bb.min.x) / width, (oy - bb.min.y) / height);
    }
    if (geom.getAttribute("uv")) geom.deleteAttribute("uv");
    geom.setAttribute(
      "uv",
      new THREE.BufferAttribute(new Float32Array(uvs), 2)
    );
  }
  stickerGeometryCache.set(key, geom);
  return geom;
};

export const getCubieGeometry = (
  size: number,
  cornerStyles: string[]
): THREE.BufferGeometry => {
  const segmentCount = 4;
  const key = cornerStyles.join(",") + ":" + segmentCount;
  if (geometryCache.has(key)) {
    return geometryCache.get(key)!.clone();
  }
  const geometry = new THREE.BoxGeometry(
    size,
    size,
    size,
    segmentCount,
    segmentCount,
    segmentCount
  );
  const corners = [
    [1, 1, 1],
    [-1, 1, 1],
    [1, -1, 1],
    [-1, -1, 1],
    [1, 1, -1],
    [-1, 1, -1],
    [1, -1, -1],
    [-1, -1, -1],
  ];
  const pos = geometry.getAttribute("position");
  const v = new THREE.Vector3();
  const colorAttr = new THREE.BufferAttribute(
    new Float32Array(pos.count * 3),
    3
  );
  for (let i = 0; i < pos.count; i++) {
    colorAttr.setXYZ(i, 1, 1, 1); // default white
  }
  for (let cornerIdx = 0; cornerIdx < 8; cornerIdx++) {
    const threshold =
      size * (cornerStyles[cornerIdx] === "rounded" ? 0.8 : 0.86);
    const [xx, yy, zz] = corners[cornerIdx];
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i),
        y = pos.getY(i),
        z = pos.getZ(i);
      if (Math.sign(x) === xx && Math.sign(y) === yy && Math.sign(z) === zz) {
        v.set(x, y, z);
        if (v.length() > threshold) {
          v.setLength(threshold);
          pos.setXYZ(i, v.x, v.y, v.z);
          colorAttr.setXYZ(i, -1, -1, -1); // black for rounded corner
        }
      }
    }
    // If 'pointed', do nothing (leave as is)
  }
  pos.needsUpdate = true;
  geometry.setAttribute("color", colorAttr);
  geometryCache.set(key, geometry.clone());
  return geometry;
};
