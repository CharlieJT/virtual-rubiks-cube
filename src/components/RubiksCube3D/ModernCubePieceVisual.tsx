import { memo, useCallback, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { CubeState } from "@/types/cube";
import CUBE_COLORS from "@/consts/cubeColours";
import { CUBIE_SIZE, STICKER_FALSE_CORNER_RATIO } from "./geometry";

type FaceKey = keyof CubeState["colors"];

type FaceTransform = {
  position: [number, number, number];
  rotation: [number, number, number];
};

type FaceBlockKind = "center" | "edge" | "corner";

type CornerRadii = {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
};

type SideInsets = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

type FaceCornerKey = keyof CornerRadii;
type AxisIndex = 0 | 1 | 2;

type SignedAxis = {
  axis: AxisIndex;
  sign: -1 | 1;
};

type BodyEdgeFillet = {
  first: SignedAxis;
  second: SignedAxis;
};

interface ModernCubePieceVisualProps {
  gridIndex: [number, number, number];
  colors: CubeState["colors"];
  cubeOpacity?: number;
  innerStickerOpacity?: number;
  stickerDoubleSide?: boolean;
  doubleSidedStickerKeysForEdges?: Set<string>;
  hideLogo?: boolean;
  sharedLogoTexture?: THREE.Texture | null;
  logoReady?: boolean;
  onStickerMaterial: (
    face: FaceKey,
    material: THREE.MeshPhysicalMaterial,
    color: string,
    hasLogoMap: boolean,
  ) => void;
  renderOrder?: number;
}

const SIBLING_SCALE = CUBIE_SIZE / 0.7;

const MODERN_BODY_COLOR = "#0b0d12";
const MODERN_FRAME_COLOR = "#1a1f2a";

const MODERN_BODY_FINISH = {
  roughness: 0.24,
  metalness: 0.03,
  clearcoat: 0.28,
  clearcoatRoughness: 0.45,
  envMapIntensity: 0.52,
} as const;

const MODERN_FRAME_FINISH = {
  roughness: 0.24,
  metalness: 0.02,
  clearcoat: 0.28,
  clearcoatRoughness: 0.4,
  envMapIntensity: 0.35,
  side: THREE.FrontSide,
} as const;

const MODERN_BODY_MATERIAL = new THREE.MeshPhysicalMaterial({
  color: MODERN_BODY_COLOR,
  ...MODERN_BODY_FINISH,
});

const MODERN_FRAME_MATERIAL = new THREE.MeshPhysicalMaterial({
  color: MODERN_FRAME_COLOR,
  ...MODERN_FRAME_FINISH,
});

function syncSharedMaterialOpacity(
  material: THREE.MeshPhysicalMaterial,
  opacity: number,
  transparent: boolean,
) {
  if (material.opacity !== opacity) {
    material.opacity = opacity;
  }
  if (material.transparent !== transparent) {
    material.transparent = transparent;
    material.needsUpdate = true;
  }
  const depthWrite = !transparent;
  if (material.depthWrite !== depthWrite) {
    material.depthWrite = depthWrite;
    material.needsUpdate = true;
  }
}

const STICKER_FRAME_SIZE = CUBIE_SIZE * 0.4115;
const STICKER_FRAME_LIFT = -0.033 * SIBLING_SCALE;
const STICKER_TILE_SIZE = CUBIE_SIZE * 0.9;
const STICKER_OFFSET = CUBIE_SIZE / 2 + 0.003 * SIBLING_SCALE;
const STICKER_TILE_LIFT = 0.006 * SIBLING_SCALE;
const STICKER_TILE_RADIUS = 0.45;
/** Subtle rounding on sticker corners that are not at the cube's outer corner */
const STICKER_SUBTLE_RADIUS = STICKER_TILE_SIZE * STICKER_FALSE_CORNER_RATIO;
const LOGO_RADIUS = STICKER_TILE_SIZE * 0.49;

/** Shared finish for colored stickers and the white-center logo overlay */
const STICKER_FINISH = {
  roughness: 0.25,
  metalness: 0,
  clearcoat: 0.35,
  clearcoatRoughness: 0.24,
  envMapIntensity: 0.45,
} as const;

const FACE_BLOCK_DEPTH = 0.02 * SIBLING_SCALE;
const STICKER_BLOCK_DEPTH = 0.004 * SIBLING_SCALE;
const FACE_BLOCK_BEVEL_SIZE = 0.005 * SIBLING_SCALE;
const FACE_BLOCK_BEVEL_THICKNESS = 0.003 * SIBLING_SCALE;
/** Sphere radius applied at the visible outer cube corner of edge/center/corner pieces */
const EDGE_BODY_EDGE_RADIUS = CUBIE_SIZE * 0.1;
/** Rounding of a body edge that lies between two stickers on the same cubie (the "thick border" seam) */
const STICKER_MEETING_EDGE_RADIUS = CUBIE_SIZE * 0.09;
/** Subtle rounding for outer-perimeter body edges (1 visible sticker endpoint) */
const BODY_EDGE_RADIUS = CUBIE_SIZE * 0.07;
/** Slightly stronger rounding for fully hidden body edges (0 visible sticker endpoints) on center / edge cubies — only visible during face turns */
const BODY_INNER_EDGE_RADIUS = CUBIE_SIZE * 0.38;
/** Same idea but for corner cubies, where 3 inner edges meet near the cube's hidden inner vertex; kept low so the inner cutaway isn't oversized */
const CORNER_BODY_INNER_EDGE_RADIUS = CUBIE_SIZE * 0.1;
/** Inset trim on sticker/frame only where another sticker on this cubie meets the face */
const STICKER_MEETING_TRIM_FACTOR = 0.07;
const EDGE_BODY_SEGMENTS = 12;
/** Full 3×3 outer width; core sphere diameter is 70% of this */
const CUBE_OUTER_EXTENT = CUBIE_SIZE * 3;
const CORE_SPHERE_RADIUS = (CUBE_OUTER_EXTENT * 0.7) / 2;

const FACE_CORNER_SIGNS: Record<FaceCornerKey, [number, number]> = {
  topLeft: [-1, 1],
  topRight: [1, 1],
  bottomRight: [1, -1],
  bottomLeft: [-1, -1],
};

const FACE_TRANSFORMS: Record<FaceKey, FaceTransform> = {
  top: { position: [0, STICKER_OFFSET, 0], rotation: [-Math.PI / 2, 0, 0] },
  bottom: { position: [0, -STICKER_OFFSET, 0], rotation: [Math.PI / 2, 0, 0] },
  left: { position: [-STICKER_OFFSET, 0, 0], rotation: [0, -Math.PI / 2, 0] },
  right: { position: [STICKER_OFFSET, 0, 0], rotation: [0, Math.PI / 2, 0] },
  front: { position: [0, 0, STICKER_OFFSET], rotation: [0, 0, 0] },
  back: { position: [0, 0, -STICKER_OFFSET], rotation: [0, Math.PI, 0] },
};

const FACE_VIEW_AXES: Record<
  FaceKey,
  {
    normal: THREE.Vector3;
    u: THREE.Vector3;
    v: THREE.Vector3;
  }
> = {
  front: {
    normal: new THREE.Vector3(0, 0, 1),
    u: new THREE.Vector3(1, 0, 0),
    v: new THREE.Vector3(0, 1, 0),
  },
  back: {
    normal: new THREE.Vector3(0, 0, -1),
    u: new THREE.Vector3(-1, 0, 0),
    v: new THREE.Vector3(0, 1, 0),
  },
  right: {
    normal: new THREE.Vector3(1, 0, 0),
    u: new THREE.Vector3(0, 0, -1),
    v: new THREE.Vector3(0, 1, 0),
  },
  left: {
    normal: new THREE.Vector3(-1, 0, 0),
    u: new THREE.Vector3(0, 0, 1),
    v: new THREE.Vector3(0, 1, 0),
  },
  top: {
    normal: new THREE.Vector3(0, 1, 0),
    u: new THREE.Vector3(1, 0, 0),
    v: new THREE.Vector3(0, 0, -1),
  },
  bottom: {
    normal: new THREE.Vector3(0, -1, 0),
    u: new THREE.Vector3(1, 0, 0),
    v: new THREE.Vector3(0, 0, 1),
  },
};

const { WHITE } = CUBE_COLORS;

const hasStickerColor = (c: string | undefined) => !!c && c !== "";
const isWhite = (c: string) => {
  if (!c) return false;
  let s = c.toLowerCase();
  if (s[0] === "#" && s.length === 4) {
    s = `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  }
  return s === WHITE || s === "white";
};

function clampInsets(
  width: number,
  height: number,
  insets: SideInsets,
): SideInsets {
  let left = Math.max(0, Math.min(insets.left, width * 0.45));
  let right = Math.max(0, Math.min(insets.right, width * 0.45));
  let top = Math.max(0, Math.min(insets.top, height * 0.45));
  let bottom = Math.max(0, Math.min(insets.bottom, height * 0.45));

  const maxTotalX = width * 0.9;
  const totalX = left + right;
  if (totalX > maxTotalX && totalX > 0) {
    const scale = maxTotalX / totalX;
    left *= scale;
    right *= scale;
  }

  const maxTotalY = height * 0.9;
  const totalY = top + bottom;
  if (totalY > maxTotalY && totalY > 0) {
    const scale = maxTotalY / totalY;
    top *= scale;
    bottom *= scale;
  }

  return { left, right, top, bottom };
}

function roundedRectShape(
  width: number,
  height: number,
  radii: CornerRadii,
  insets: SideInsets = { left: 0, right: 0, top: 0, bottom: 0 },
) {
  const w = width / 2;
  const h = height / 2;
  const safeInsets = clampInsets(width, height, insets);
  const left = -w + safeInsets.left;
  const right = w - safeInsets.right;
  const top = h - safeInsets.top;
  const bottom = -h + safeInsets.bottom;
  const spanX = Math.max(0.001, right - left);
  const spanY = Math.max(0.001, top - bottom);
  const maxRadius = Math.min(spanX, spanY) / 2;
  const topLeft = Math.min(radii.topLeft, maxRadius);
  const topRight = Math.min(radii.topRight, maxRadius);
  const bottomRight = Math.min(radii.bottomRight, maxRadius);
  const bottomLeft = Math.min(radii.bottomLeft, maxRadius);

  const shape = new THREE.Shape();
  shape.moveTo(left + bottomLeft, bottom);
  shape.lineTo(right - bottomRight, bottom);
  if (bottomRight > 0) {
    shape.quadraticCurveTo(right, bottom, right, bottom + bottomRight);
  } else {
    shape.lineTo(right, bottom);
  }
  shape.lineTo(right, top - topRight);
  if (topRight > 0) {
    shape.quadraticCurveTo(right, top, right - topRight, top);
  } else {
    shape.lineTo(right, top);
  }
  shape.lineTo(left + topLeft, top);
  if (topLeft > 0) {
    shape.quadraticCurveTo(left, top, left, top - topLeft);
  } else {
    shape.lineTo(left, top);
  }
  shape.lineTo(left, bottom + bottomLeft);
  if (bottomLeft > 0) {
    shape.quadraticCurveTo(left, bottom, left + bottomLeft, bottom);
  } else {
    shape.lineTo(left, bottom);
  }
  shape.closePath();
  return shape;
}

function classifyFaceBlock(coord: [number, number, number]): FaceBlockKind {
  const nonZeroCount = coord.filter((value) => value !== 0).length;
  if (nonZeroCount === 1) return "center";
  if (nonZeroCount === 2) return "edge";
  return "corner";
}

function toFacePlanePosition(coord: [number, number, number], face: FaceKey) {
  const cubieCoord = new THREE.Vector3(coord[0], coord[1], coord[2]);
  const centerCoord = FACE_VIEW_AXES[face].normal.clone();
  const vectorToCenter = centerCoord.sub(cubieCoord);
  const axes = FACE_VIEW_AXES[face];
  return {
    u: vectorToCenter.dot(axes.u),
    v: vectorToCenter.dot(axes.v),
  };
}

function edgeCornerRadii(
  coord: [number, number, number],
  face: FaceKey,
  radius: number,
): CornerRadii {
  const facePosition = toFacePlanePosition(coord, face);
  const corners = [
    { key: "topLeft", x: -0.5, y: 0.5 },
    { key: "topRight", x: 0.5, y: 0.5 },
    { key: "bottomRight", x: 0.5, y: -0.5 },
    { key: "bottomLeft", x: -0.5, y: -0.5 },
  ] as const;

  const distances = corners.map((corner) => ({
    key: corner.key,
    distance:
      (facePosition.u - corner.x) * (facePosition.u - corner.x) +
      (facePosition.v - corner.y) * (facePosition.v - corner.y),
  }));

  const sorted = distances.map((item) => item.distance).sort((a, b) => a - b);
  const threshold = sorted[1] + 1e-6;

  const radii: CornerRadii = {
    topLeft: 0,
    topRight: 0,
    bottomRight: 0,
    bottomLeft: 0,
  };

  for (const item of distances) {
    if (item.distance <= threshold) {
      radii[item.key] = radius;
    }
  }

  return radii;
}

/**
 * Corner cubie: outer cube vertex plus the three inner ends of sticker-meeting
 * edges (mirrors how edge cubies round both ends of their meeting edge).
 */
function flipSign(v: 1 | -1): 1 | -1 {
  return v === 1 ? -1 : 1;
}

function cornerBodyRoundedCorners(
  coord: [number, number, number],
): Array<readonly [1 | -1, 1 | -1, 1 | -1]> {
  const sx = (Math.sign(coord[0]) || 1) as 1 | -1;
  const sy = (Math.sign(coord[1]) || 1) as 1 | -1;
  const sz = (Math.sign(coord[2]) || 1) as 1 | -1;
  return [
    [sx, sy, sz],
    [flipSign(sx), sy, sz],
    [sx, flipSign(sy), sz],
    [sx, sy, flipSign(sz)],
  ];
}

/** The two exterior cube-corner vertices on an edge cubie (slot-derived, not face-plane). */
function outerEdgeCornerSigns(
  coord: [number, number, number],
): Array<readonly [1 | -1, 1 | -1, 1 | -1]> {
  if (coord[0] === 0) {
    const sy = (Math.sign(coord[1]) || 1) as 1 | -1;
    const sz = (Math.sign(coord[2]) || 1) as 1 | -1;
    return [
      [1, sy, sz],
      [-1, sy, sz],
    ];
  }
  if (coord[1] === 0) {
    const sx = (Math.sign(coord[0]) || 1) as 1 | -1;
    const sz = (Math.sign(coord[2]) || 1) as 1 | -1;
    return [
      [sx, 1, sz],
      [sx, -1, sz],
    ];
  }
  const sx = (Math.sign(coord[0]) || 1) as 1 | -1;
  const sy = (Math.sign(coord[1]) || 1) as 1 | -1;
  return [
    [sx, sy, 1],
    [sx, sy, -1],
  ];
}

function faceBlockRadii(
  coord: [number, number, number],
  face: FaceKey,
): CornerRadii {
  const radius = STICKER_TILE_SIZE * STICKER_TILE_RADIUS;
  const kind = classifyFaceBlock(coord);

  if (kind === "center") {
    return {
      topLeft: radius,
      topRight: radius,
      bottomRight: radius,
      bottomLeft: radius,
    };
  }

  if (kind === "edge") {
    return edgeCornerRadii(coord, face, radius);
  }

  return {
    topLeft: 0,
    topRight: 0,
    bottomRight: 0,
    bottomLeft: 0,
  };
}

/** Apply subtle rounding to sticker corners only; frame plates stay square where intended */
function stickerCornerRadii(radii: CornerRadii): CornerRadii {
  const subtle = (value: number) => (value > 0 ? value : STICKER_SUBTLE_RADIUS);
  return {
    topLeft: subtle(radii.topLeft),
    topRight: subtle(radii.topRight),
    bottomRight: subtle(radii.bottomRight),
    bottomLeft: subtle(radii.bottomLeft),
  };
}

function scaleRadii(radii: CornerRadii, scale: number): CornerRadii {
  return {
    topLeft: radii.topLeft * scale,
    topRight: radii.topRight * scale,
    bottomRight: radii.bottomRight * scale,
    bottomLeft: radii.bottomLeft * scale,
  };
}

function cornerSignsForFaceCorner(
  face: FaceKey,
  corner: FaceCornerKey,
): [1 | -1, 1 | -1, 1 | -1] {
  const axes = FACE_VIEW_AXES[face];
  const [uSign, vSign] = FACE_CORNER_SIGNS[corner];
  const direction = axes.normal
    .clone()
    .addScaledVector(axes.u, uSign)
    .addScaledVector(axes.v, vSign);

  return [
    (Math.sign(direction.x) || 1) as 1 | -1,
    (Math.sign(direction.y) || 1) as 1 | -1,
    (Math.sign(direction.z) || 1) as 1 | -1,
  ];
}

function axisValue(vertex: THREE.Vector3, axis: AxisIndex) {
  if (axis === 0) return vertex.x;
  if (axis === 1) return vertex.y;
  return vertex.z;
}

function setAxisValue(vertex: THREE.Vector3, axis: AxisIndex, value: number) {
  if (axis === 0) {
    vertex.x = value;
    return;
  }
  if (axis === 1) {
    vertex.y = value;
    return;
  }
  vertex.z = value;
}

function setAxisNormalComponent(
  normal: THREE.Vector3,
  axis: AxisIndex,
  value: number,
) {
  if (axis === 0) {
    normal.x = value;
    return;
  }
  if (axis === 1) {
    normal.y = value;
    return;
  }
  normal.z = value;
}

/**
 * Assign rotation-invariant normals after body fillet/corner deformation.
 * `computeVertexNormals` on merged BoxGeometry still inherits per-face
 * triangulation bias (visible as smoother green/blue vs jagged white/yellow/
 * orange/red). Analytic normals on corners (sphere), edges (cylinder), and
 * flat faces (axis-aligned) remove that bias entirely.
 */
function computeAnalyticBodyNormals(
  geometry: THREE.BufferGeometry,
  roundedCorners: ReadonlyArray<readonly [number, number, number]>,
  edgeRadii: readonly number[],
) {
  const half = CUBIE_SIZE / 2;
  const cornerRadius = EDGE_BODY_EDGE_RADIUS;
  const cornerThreshold = half - cornerRadius;
  const positionAttribute = geometry.attributes.position;
  const normals = new Float32Array(positionAttribute.count * 3);
  const point = new THREE.Vector3();
  const normal = new THREE.Vector3();

  for (let i = 0; i < positionAttribute.count; i += 1) {
    point.fromBufferAttribute(positionAttribute, i);
    normal.set(0, 0, 0);
    let assigned = false;

    for (const [sx, sy, sz] of roundedCorners) {
      const ox = point.x * sx;
      const oy = point.y * sy;
      const oz = point.z * sz;

      if (
        ox > cornerThreshold &&
        oy > cornerThreshold &&
        oz > cornerThreshold
      ) {
        normal.set(
          ox - cornerThreshold,
          oy - cornerThreshold,
          oz - cornerThreshold,
        );
        if (normal.lengthSq() > 1e-12) {
          normal.normalize();
          normal.set(sx * normal.x, sy * normal.y, sz * normal.z);
          assigned = true;
          break;
        }
      }
    }

    if (!assigned) {
      for (let j = 0; j < BODY_EDGES.length; j += 1) {
        const radius = edgeRadii[j];
        if (radius <= 0) continue;

        const fillet = BODY_EDGES[j];
        const threshold = half - radius;
        const firstCurrent =
          axisValue(point, fillet.first.axis) * fillet.first.sign;
        const secondCurrent =
          axisValue(point, fillet.second.axis) * fillet.second.sign;

        if (firstCurrent > threshold && secondCurrent > threshold) {
          normal.set(0, 0, 0);
          setAxisNormalComponent(
            normal,
            fillet.first.axis,
            fillet.first.sign * (firstCurrent - threshold),
          );
          setAxisNormalComponent(
            normal,
            fillet.second.axis,
            fillet.second.sign * (secondCurrent - threshold),
          );
          if (normal.lengthSq() > 1e-12) {
            normal.normalize();
            assigned = true;
            break;
          }
        }
      }
    }

    if (!assigned) {
      const ax = Math.abs(point.x);
      const ay = Math.abs(point.y);
      const az = Math.abs(point.z);
      if (ax >= ay && ax >= az) {
        normal.set(Math.sign(point.x) || 1, 0, 0);
      } else if (ay >= az) {
        normal.set(0, Math.sign(point.y) || 1, 0);
      } else {
        normal.set(0, 0, Math.sign(point.z) || 1);
      }
    }

    normals[i * 3] = normal.x;
    normals[i * 3 + 1] = normal.y;
    normals[i * 3 + 2] = normal.z;
  }

  geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
}

/**
 * The 12 perimeter edges of a unit cube as `BodyEdgeFillet`s, defined once at
 * module load so geometry builds don't re-allocate the table.
 */
const BODY_EDGES: ReadonlyArray<BodyEdgeFillet> = (() => {
  const pairs: [AxisIndex, AxisIndex][] = [
    [0, 1],
    [1, 2],
    [0, 2],
  ];
  const signs: (-1 | 1)[] = [-1, 1];
  const edges: BodyEdgeFillet[] = [];
  for (const [a, b] of pairs) {
    for (const sa of signs) {
      for (const sb of signs) {
        edges.push({
          first: { axis: a, sign: sa },
          second: { axis: b, sign: sb },
        });
      }
    }
  }
  return edges;
})();

/** Whether a body-edge endpoint lies on an exterior sticker face for this slot. */
function isOutwardBodyEndpoint(
  coord: [number, number, number],
  endpoint: SignedAxis,
): boolean {
  const axisCoord = coord[endpoint.axis];
  if (axisCoord > 0) return endpoint.sign === 1;
  if (axisCoord < 0) return endpoint.sign === -1;
  return false;
}

/**
 * Count exterior sticker-face endpoints on a body edge (0, 1, or 2).
 * Slot-derived from `coord` so fillet tiers stay consistent under 90° turns.
 */
function bodyEdgeEndpointCountFromCoord(
  coord: [number, number, number],
  edge: BodyEdgeFillet,
): 0 | 1 | 2 {
  const firstMatch = isOutwardBodyEndpoint(coord, edge.first) ? 1 : 0;
  const secondMatch = isOutwardBodyEndpoint(coord, edge.second) ? 1 : 0;
  return (firstMatch + secondMatch) as 0 | 1 | 2;
}

/**
 * Pick a body-edge fillet radius based on how many of its endpoints lie on
 * visible sticker faces:
 *   2 -> sticker-meeting seam (thick visible border)
 *   1 -> outer perimeter of a sticker
 *   0 -> fully hidden inner edge (only seen during face turns)
 * The inner-edge radius is piece-type dependent because corner cubies have
 * 3 fully hidden edges meeting at one point and need a smaller radius to
 * avoid an oversized inner cutaway.
 */
function bodyEdgeRadius(count: 0 | 1 | 2, innerEdgeRadius: number): number {
  if (count === 2) return STICKER_MEETING_EDGE_RADIUS;
  if (count === 1) return BODY_EDGE_RADIUS;
  return innerEdgeRadius;
}

function stickerMeetingInsets(
  visibleFaces: FaceKey[],
  face: FaceKey,
  meetingTrim: number,
): SideInsets {
  const insets: SideInsets = { left: 0, right: 0, top: 0, bottom: 0 };
  if (meetingTrim <= 0) return insets;

  const currentAxes = FACE_VIEW_AXES[face];
  for (const otherFace of visibleFaces) {
    if (otherFace === face) continue;
    const otherNormal = FACE_VIEW_AXES[otherFace].normal;
    const uDot = otherNormal.dot(currentAxes.u);
    const vDot = otherNormal.dot(currentAxes.v);

    if (uDot > 0.5) insets.right = meetingTrim;
    else if (uDot < -0.5) insets.left = meetingTrim;
    else if (vDot > 0.5) insets.top = meetingTrim;
    else if (vDot < -0.5) insets.bottom = meetingTrim;
  }

  return insets;
}

function applyEdgeFillet(
  vertex: THREE.Vector3,
  half: number,
  radius: number,
  fillet: BodyEdgeFillet,
) {
  if (radius <= 0) return;

  const threshold = half - radius;
  const firstCurrent = axisValue(vertex, fillet.first.axis) * fillet.first.sign;
  const secondCurrent =
    axisValue(vertex, fillet.second.axis) * fillet.second.sign;
  if (firstCurrent <= threshold || secondCurrent <= threshold) return;

  const firstDelta = firstCurrent - threshold;
  const secondDelta = secondCurrent - threshold;
  const distance = Math.sqrt(
    firstDelta * firstDelta + secondDelta * secondDelta,
  );
  if (distance <= radius || distance === 0) return;

  const scale = radius / distance;
  const nextFirst = fillet.first.sign * (threshold + firstDelta * scale);
  const nextSecond = fillet.second.sign * (threshold + secondDelta * scale);
  setAxisValue(vertex, fillet.first.axis, nextFirst);
  setAxisValue(vertex, fillet.second.axis, nextSecond);
}

function shapeBodyGeometryCorners(
  geometry: THREE.BoxGeometry,
  coord: [number, number, number],
  roundedCorners: ReadonlyArray<readonly [number, number, number]>,
  innerEdgeRadius: number,
) {
  const half = CUBIE_SIZE / 2;
  const cornerRadius = EDGE_BODY_EDGE_RADIUS;
  const cornerThreshold = half - cornerRadius;
  // Precompute the per-edge radius once per geometry build (12 lookups) instead of per-vertex.
  const edgeRadii: number[] = BODY_EDGES.map((edge) =>
    bodyEdgeRadius(
      bodyEdgeEndpointCountFromCoord(coord, edge),
      innerEdgeRadius,
    ),
  );
  const positionAttribute = geometry.attributes.position;
  const vertex = new THREE.Vector3();

  for (let i = 0; i < positionAttribute.count; i += 1) {
    vertex.fromBufferAttribute(positionAttribute, i);

    for (let j = 0; j < BODY_EDGES.length; j += 1) {
      applyEdgeFillet(vertex, half, edgeRadii[j], BODY_EDGES[j]);
    }

    for (const [sx, sy, sz] of roundedCorners) {
      const ox = vertex.x * sx;
      const oy = vertex.y * sy;
      const oz = vertex.z * sz;

      if (
        ox <= cornerThreshold ||
        oy <= cornerThreshold ||
        oz <= cornerThreshold
      ) {
        continue;
      }

      const dx = ox - cornerThreshold;
      const dy = oy - cornerThreshold;
      const dz = oz - cornerThreshold;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (distance <= cornerRadius || distance === 0) continue;

      const scale = cornerRadius / distance;
      vertex.set(
        sx * (cornerThreshold + dx * scale),
        sy * (cornerThreshold + dy * scale),
        sz * (cornerThreshold + dz * scale),
      );
    }

    positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  positionAttribute.needsUpdate = true;
  const merged = mergeVertices(geometry, 1e-4);
  geometry.dispose();
  computeAnalyticBodyNormals(merged, roundedCorners, edgeRadii);
  return merged;
}

/**
 * Module-level cache so each of the (at most) 26 unique cubie body geometries
 * is only built once. Cache keys are derived from inputs that fully determine
 * the resulting BufferGeometry. Cached geometries must NOT be `dispose()`d by
 * unmounting meshes \u2014 callers set `dispose={null}` on the host `<mesh>`.
 */
const bodyGeometryCache = new Map<string, THREE.BufferGeometry>();
/** Bump when body mesh construction changes so dev HMR cache entries rebuild. */
const BODY_GEOMETRY_CACHE_VERSION = "perf-v1";

/** Canonical center body: built once, oriented per face via baked matrix. */
const CANONICAL_CENTER_FACE: FaceKey = "top";

const _bodyRotationMatrix = new THREE.Matrix4();
const _bodyAlignQuat = new THREE.Quaternion();

function centerOrientationMatrix(centerFace: FaceKey): THREE.Matrix4 {
  _bodyAlignQuat.setFromUnitVectors(
    FACE_VIEW_AXES[CANONICAL_CENTER_FACE].normal,
    FACE_VIEW_AXES[centerFace].normal,
  );
  return _bodyRotationMatrix.makeRotationFromQuaternion(_bodyAlignQuat);
}

function bakeOrientedBodyGeometry(
  source: THREE.BufferGeometry,
  matrix: THREE.Matrix4,
): THREE.BufferGeometry {
  const baked = source.clone();
  baked.applyMatrix4(matrix);
  return baked;
}

let canonicalCenterBodySource: THREE.BufferGeometry | null = null;

function buildCanonicalCenterBodyGeometry(): THREE.BufferGeometry {
  if (canonicalCenterBodySource) return canonicalCenterBodySource;

  const centerFace = CANONICAL_CENTER_FACE;
  const geometry = new THREE.BoxGeometry(
    CUBIE_SIZE,
    CUBIE_SIZE,
    CUBIE_SIZE,
    EDGE_BODY_SEGMENTS,
    EDGE_BODY_SEGMENTS,
    EDGE_BODY_SEGMENTS,
  );

  const roundedCorners = (
    Object.keys(FACE_CORNER_SIGNS) as FaceCornerKey[]
  ).map((corner) => cornerSignsForFaceCorner(centerFace, corner));

  canonicalCenterBodySource = shapeBodyGeometryCorners(
    geometry,
    [0, 1, 0],
    roundedCorners,
    BODY_INNER_EDGE_RADIUS,
  );
  return canonicalCenterBodySource;
}

/**
 * Cache of `(frame, sticker)` BufferGeometries keyed by
 * `${coordSign}|${visibleFacesKey}|${face}`. Shapes only depend on cubie
 * position/visible-face set/face, not on the (animating) sticker colors,
 * so we build each unique shape pair once and reuse them across renders.
 * Hosting meshes use `dispose={null}` to keep the cache valid on unmount.
 */
type StickerFaceGeometries = {
  frame: THREE.BufferGeometry | null;
  sticker: THREE.BufferGeometry;
};
const stickerGeometryCache = new Map<string, StickerFaceGeometries>();
const STICKER_GEOMETRY_CACHE_VERSION = "perf-v1";

/**
 * Intern the visible-faces array by its sorted key so repeated renders with
 * the same visible-face set return the same array reference. This makes
 * downstream `useMemo` deps stable across re-renders even when the parent
 * passes a new `colors` object on every render.
 */
const visibleFacesArrayCache = new Map<string, ReadonlyArray<FaceKey>>();
function internVisibleFaces(faces: FaceKey[]): {
  faces: ReadonlyArray<FaceKey>;
  key: string;
} {
  const sorted = [...faces].sort();
  const key = sorted.join("+");
  let cached = visibleFacesArrayCache.get(key);
  if (!cached) {
    cached = Object.freeze(sorted);
    visibleFacesArrayCache.set(key, cached);
  }
  return { faces: cached, key };
}

function coordSignKey(coord: [number, number, number]): string {
  return `${Math.sign(coord[0]) || 0},${Math.sign(coord[1]) || 0},${
    Math.sign(coord[2]) || 0
  }`;
}

/** Constant logo geometry — circle is identical for every white-center face. */
const LOGO_GEOMETRY = new THREE.CircleGeometry(LOGO_RADIUS, 48);

function getStickerFaceGeometries(
  coord: [number, number, number],
  visibleFaces: ReadonlyArray<FaceKey>,
  visibleFacesKey: string,
  face: FaceKey,
): StickerFaceGeometries {
  const cacheKey = `${STICKER_GEOMETRY_CACHE_VERSION}|${coordSignKey(coord)}|${visibleFacesKey}|${face}`;
  const cached = stickerGeometryCache.get(cacheKey);
  if (cached) return cached;

  const isCenterFace = classifyFaceBlock(coord) === "center";
  const radii = faceBlockRadii(coord, face);
  const zeroInsets: SideInsets = { left: 0, right: 0, top: 0, bottom: 0 };
  const tileMeetingTrim = STICKER_TILE_SIZE * STICKER_MEETING_TRIM_FACTOR;
  const frameMeetingTrim = STICKER_FRAME_SIZE * STICKER_MEETING_TRIM_FACTOR;
  const tileInsets = isCenterFace
    ? zeroInsets
    : stickerMeetingInsets([...visibleFaces], face, tileMeetingTrim);
  const frameInsets = isCenterFace
    ? zeroInsets
    : stickerMeetingInsets([...visibleFaces], face, frameMeetingTrim);

  const frameShape = roundedRectShape(
    STICKER_FRAME_SIZE,
    STICKER_FRAME_SIZE,
    scaleRadii(radii, 1.9),
    frameInsets,
  );
  const stickerShape = roundedRectShape(
    STICKER_TILE_SIZE,
    STICKER_TILE_SIZE,
    stickerCornerRadii(radii),
    tileInsets,
  );

  const frame = isCenterFace
    ? null
    : (() => {
        const raw = new THREE.ExtrudeGeometry(frameShape, {
          depth: FACE_BLOCK_DEPTH,
          bevelEnabled: true,
          bevelSize: FACE_BLOCK_BEVEL_SIZE,
          bevelThickness: FACE_BLOCK_BEVEL_THICKNESS,
          bevelSegments: 2,
          curveSegments: 6,
          steps: 1,
        });
        const merged = mergeVertices(raw, 1e-4);
        raw.dispose();
        merged.computeVertexNormals();
        return merged;
      })();
  const sticker = new THREE.ShapeGeometry(stickerShape, 6);

  const result: StickerFaceGeometries = { frame, sticker };
  stickerGeometryCache.set(cacheKey, result);
  return result;
}

function buildEdgeBodyGeometry(
  coord: [number, number, number],
  edgeFaces: FaceKey[],
): THREE.BufferGeometry {
  const facesKey = [...edgeFaces].sort().join("+");
  const cacheKey = `${BODY_GEOMETRY_CACHE_VERSION}|edge|${facesKey}|${coordSignKey(coord)}`;
  const cached = bodyGeometryCache.get(cacheKey);
  if (cached) return cached;

  const geometry = new THREE.BoxGeometry(
    CUBIE_SIZE,
    CUBIE_SIZE,
    CUBIE_SIZE,
    EDGE_BODY_SEGMENTS,
    EDGE_BODY_SEGMENTS,
    EDGE_BODY_SEGMENTS,
  );

  const roundedCorners = outerEdgeCornerSigns(coord);

  const built = shapeBodyGeometryCorners(
    geometry,
    coord,
    roundedCorners,
    BODY_INNER_EDGE_RADIUS,
  );
  bodyGeometryCache.set(cacheKey, built);
  return built;
}

function buildCenterBodyGeometry(centerFace: FaceKey): THREE.BufferGeometry {
  const cacheKey = `${BODY_GEOMETRY_CACHE_VERSION}|center|${centerFace}`;
  const cached = bodyGeometryCache.get(cacheKey);
  if (cached) return cached;

  const canonical = buildCanonicalCenterBodyGeometry();
  const matrix = centerOrientationMatrix(centerFace);
  const baked = bakeOrientedBodyGeometry(canonical, matrix);
  bodyGeometryCache.set(cacheKey, baked);
  return baked;
}

function buildCornerBodyGeometry(
  coord: [number, number, number],
  cornerFaces: [FaceKey, FaceKey, FaceKey],
): THREE.BufferGeometry {
  const facesKey = [...cornerFaces].sort().join("+");
  const cacheKey = `${BODY_GEOMETRY_CACHE_VERSION}|corner|${facesKey}|${coordSignKey(coord)}`;
  const cached = bodyGeometryCache.get(cacheKey);
  if (cached) return cached;

  const geometry = new THREE.BoxGeometry(
    CUBIE_SIZE,
    CUBIE_SIZE,
    CUBIE_SIZE,
    EDGE_BODY_SEGMENTS,
    EDGE_BODY_SEGMENTS,
    EDGE_BODY_SEGMENTS,
  );

  const built = shapeBodyGeometryCorners(
    geometry,
    coord,
    cornerBodyRoundedCorners(coord),
    CORNER_BODY_INNER_EDGE_RADIUS,
  );
  bodyGeometryCache.set(cacheKey, built);
  return built;
}

const ModernCubePieceVisual = ({
  gridIndex,
  colors,
  cubeOpacity,
  innerStickerOpacity,
  stickerDoubleSide = false,
  doubleSidedStickerKeysForEdges,
  hideLogo = false,
  sharedLogoTexture,
  logoReady = false,
  onStickerMaterial,
  renderOrder,
}: ModernCubePieceVisualProps) => {
  const [gx, gy, gz] = gridIndex;
  const coord = useMemo<[number, number, number]>(
    () => [gx - 1, gy - 1, gz - 1],
    [gx, gy, gz],
  );

  const { faces: visibleFaces, key: visibleFacesKey } = useMemo(() => {
    const faces: FaceKey[] = [];
    if (gx === 2 && hasStickerColor(colors.right)) faces.push("right");
    if (gx === 0 && hasStickerColor(colors.left)) faces.push("left");
    if (gy === 2 && hasStickerColor(colors.top)) faces.push("top");
    if (gy === 0 && hasStickerColor(colors.bottom)) faces.push("bottom");
    if (gz === 2 && hasStickerColor(colors.front)) faces.push("front");
    if (gz === 0 && hasStickerColor(colors.back)) faces.push("back");
    return internVisibleFaces(faces);
  }, [
    gx,
    gy,
    gz,
    colors.right,
    colors.left,
    colors.top,
    colors.bottom,
    colors.front,
    colors.back,
  ]);

  const faceKind = useMemo(() => classifyFaceBlock(coord), [coord]);
  const isCorePiece = coord[0] === 0 && coord[1] === 0 && coord[2] === 0;

  const edgeBodyGeometry = useMemo(() => {
    if (faceKind !== "edge" || visibleFaces.length !== 2) return null;
    return buildEdgeBodyGeometry(coord, [...visibleFaces]);
  }, [coord, faceKind, visibleFaces]);

  const centerBodyGeometry = useMemo(() => {
    if (faceKind !== "center" || visibleFaces.length !== 1) return null;
    return buildCenterBodyGeometry(visibleFaces[0]);
  }, [faceKind, visibleFaces]);

  const cornerBodyGeometry = useMemo(() => {
    if (faceKind !== "corner" || visibleFaces.length !== 3) return null;
    return buildCornerBodyGeometry(
      coord,
      visibleFaces as [FaceKey, FaceKey, FaceKey],
    );
  }, [coord, faceKind, visibleFaces]);

  const stickerDescriptors = useMemo(
    () =>
      visibleFaces.map((face) => {
        const geoms = getStickerFaceGeometries(
          coord,
          visibleFaces,
          visibleFacesKey,
          face,
        );
        return {
          face,
          transform: FACE_TRANSFORMS[face],
          showFramePlate: geoms.frame !== null,
          frameGeometry: geoms.frame,
          stickerGeometry: geoms.sticker,
        };
      }),
    [coord, visibleFaces, visibleFacesKey],
  );

  const opacity = cubeOpacity ?? 1;
  const transparent = opacity < 1;
  const innerOpacity = innerStickerOpacity ?? cubeOpacity ?? 1;
  const innerTransparent = innerOpacity < 1;
  const stickerMatsRef = useRef<
    Partial<Record<FaceKey, THREE.MeshPhysicalMaterial>>
  >({});
  const innerStickerMatsRef = useRef<
    Partial<Record<FaceKey, THREE.MeshPhysicalMaterial>>
  >({});

  const logoMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: CUBE_COLORS.WHITE,
        ...STICKER_FINISH,
        side: THREE.FrontSide,
        transparent: true,
        opacity: 1,
        alphaTest: 0.02,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      }),
    [],
  );

  const getStickerMaterial = useCallback(
    (face: FaceKey, stickerColor: string) => {
      let material = stickerMatsRef.current[face];
      if (!material) {
        material = new THREE.MeshPhysicalMaterial({
          color: stickerColor,
          ...STICKER_FINISH,
          side: THREE.FrontSide,
          transparent,
          opacity,
          depthWrite: !transparent,
          polygonOffset: true,
          polygonOffsetFactor: -1,
          polygonOffsetUnits: -1,
        });
        stickerMatsRef.current[face] = material;
        onStickerMaterial(face, material, stickerColor, false);
      } else {
        material.transparent = transparent;
        material.opacity = opacity;
        material.depthWrite = !transparent;
      }
      return material;
    },
    [onStickerMaterial, opacity, transparent],
  );

  const getInnerStickerMaterial = useCallback(
    (face: FaceKey, stickerColor: string) => {
      let material = innerStickerMatsRef.current[face];
      if (!material) {
        material = new THREE.MeshPhysicalMaterial({
          color: stickerColor,
          ...STICKER_FINISH,
          side: THREE.FrontSide,
          transparent: innerTransparent,
          opacity: innerOpacity,
          depthTest: false,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -1,
          polygonOffsetUnits: -1,
        });
        innerStickerMatsRef.current[face] = material;
      } else {
        material.color.set(stickerColor);
        material.transparent = innerTransparent;
        material.opacity = innerOpacity;
      }
      return material;
    },
    [innerOpacity, innerTransparent],
  );

  useLayoutEffect(() => {
    syncSharedMaterialOpacity(MODERN_BODY_MATERIAL, opacity, transparent);
    if (!transparent) {
      syncSharedMaterialOpacity(MODERN_FRAME_MATERIAL, opacity, transparent);
    }

    for (const mat of Object.values(stickerMatsRef.current)) {
      if (mat) syncSharedMaterialOpacity(mat, opacity, transparent);
    }
    for (const mat of Object.values(innerStickerMatsRef.current)) {
      if (mat) {
        syncSharedMaterialOpacity(mat, innerOpacity, innerTransparent);
        mat.depthTest = false;
        mat.depthWrite = false;
      }
    }

    const hasWhiteCenterFace = stickerDescriptors.some((desc) =>
      isWhite(colors[desc.face]),
    );
    const showLogoOverlay =
      !hideLogo &&
      faceKind === "center" &&
      logoReady &&
      !!sharedLogoTexture &&
      hasWhiteCenterFace;

    if (showLogoOverlay) {
      logoMaterial.map = sharedLogoTexture;
      logoMaterial.opacity = opacity;
      logoMaterial.transparent = true;
      logoMaterial.needsUpdate = true;
    } else {
      logoMaterial.map = null;
      logoMaterial.needsUpdate = true;
    }
  }, [
    colors,
    faceKind,
    hideLogo,
    logoReady,
    sharedLogoTexture,
    logoMaterial,
    opacity,
    transparent,
    innerOpacity,
    innerTransparent,
  ]);

  const getTileBaseLift = (showFrame: boolean) => {
    const centerTileExtraLift = showFrame ? 0 : 0.003 * SIBLING_SCALE;
    return (
      STICKER_FRAME_LIFT +
      FACE_BLOCK_DEPTH +
      STICKER_TILE_LIFT +
      centerTileExtraLift
    );
  };

  return (
    <>
      {isCorePiece ? (
        <mesh renderOrder={renderOrder}>
          <sphereGeometry args={[CORE_SPHERE_RADIUS, 24, 16]} />
          <primitive object={MODERN_BODY_MATERIAL} attach="material" />
        </mesh>
      ) : faceKind === "edge" && edgeBodyGeometry ? (
        <mesh
          geometry={edgeBodyGeometry}
          renderOrder={renderOrder}
          dispose={null}
        >
          <primitive object={MODERN_BODY_MATERIAL} attach="material" />
        </mesh>
      ) : faceKind === "center" && centerBodyGeometry ? (
        <mesh
          geometry={centerBodyGeometry}
          renderOrder={renderOrder}
          dispose={null}
        >
          <primitive object={MODERN_BODY_MATERIAL} attach="material" />
        </mesh>
      ) : faceKind === "corner" && cornerBodyGeometry ? (
        <mesh
          geometry={cornerBodyGeometry}
          renderOrder={renderOrder}
          dispose={null}
        >
          <primitive object={MODERN_BODY_MATERIAL} attach="material" />
        </mesh>
      ) : null}

      {stickerDescriptors.map((desc) => {
        const faceColor = colors[desc.face];
        const showLogo =
          !hideLogo &&
          faceKind === "center" &&
          logoReady &&
          !!sharedLogoTexture &&
          isWhite(faceColor);
        const stickerColor = showLogo ? "#ffffff" : faceColor;
        const showFrame =
          !transparent && desc.showFramePlate && desc.frameGeometry != null;
        const tileBaseLift = getTileBaseLift(showFrame);
        const logoBaseLift = tileBaseLift + STICKER_BLOCK_DEPTH + 0.001;
        const stickerMaterial = getStickerMaterial(desc.face, stickerColor);
        const isCenterSticker = faceKind === "center";
        const stickerKey = `${gx},${gy},${gz}:${desc.face}`;
        const isEdgeDoubleSided =
          doubleSidedStickerKeysForEdges?.has(stickerKey) ?? false;
        const showInnerSticker =
          (isCenterSticker && stickerDoubleSide) || isEdgeDoubleSided;
        const innerStickerMaterial = showInnerSticker
          ? getInnerStickerMaterial(desc.face, faceColor)
          : null;

        return (
          <group key={desc.face}>
            <group
              position={desc.transform.position}
              rotation={desc.transform.rotation}
            >
              {showFrame && desc.frameGeometry ? (
                <mesh
                  position={[0, 0, STICKER_FRAME_LIFT]}
                  geometry={desc.frameGeometry}
                  renderOrder={renderOrder}
                  dispose={null}
                >
                  <primitive object={MODERN_FRAME_MATERIAL} attach="material" />
                </mesh>
              ) : null}
              <mesh
                position={[0, 0, tileBaseLift + STICKER_BLOCK_DEPTH]}
                geometry={desc.stickerGeometry}
                renderOrder={renderOrder}
                dispose={null}
              >
                <primitive object={stickerMaterial} attach="material" />
              </mesh>
              {showLogo ? (
                <mesh
                  position={[0, 0, logoBaseLift + 0.0004]}
                  geometry={LOGO_GEOMETRY}
                  renderOrder={(renderOrder ?? 0) + 1}
                  dispose={null}
                >
                  <primitive object={logoMaterial} attach="material" />
                </mesh>
              ) : null}
            </group>
            {showInnerSticker && innerStickerMaterial ? (
              <group
                position={desc.transform.position}
                rotation={[
                  desc.transform.rotation[0],
                  desc.transform.rotation[1] + Math.PI,
                  desc.transform.rotation[2],
                ]}
              >
                <mesh
                  position={[0, 0, tileBaseLift + STICKER_BLOCK_DEPTH]}
                  geometry={desc.stickerGeometry}
                  renderOrder={10}
                  dispose={null}
                >
                  <primitive object={innerStickerMaterial} attach="material" />
                </mesh>
              </group>
            ) : null}
          </group>
        );
      })}
    </>
  );
};

function modernPieceVisualPropsEqual(
  prev: ModernCubePieceVisualProps,
  next: ModernCubePieceVisualProps,
): boolean {
  if (prev.cubeOpacity !== next.cubeOpacity) return false;
  if (prev.innerStickerOpacity !== next.innerStickerOpacity) return false;
  if (prev.stickerDoubleSide !== next.stickerDoubleSide) return false;
  if (
    prev.doubleSidedStickerKeysForEdges !== next.doubleSidedStickerKeysForEdges
  )
    return false;
  if (prev.hideLogo !== next.hideLogo) return false;
  if (prev.logoReady !== next.logoReady) return false;
  if (prev.sharedLogoTexture !== next.sharedLogoTexture) return false;
  if (prev.renderOrder !== next.renderOrder) return false;
  if (prev.gridIndex[0] !== next.gridIndex[0]) return false;
  if (prev.gridIndex[1] !== next.gridIndex[1]) return false;
  if (prev.gridIndex[2] !== next.gridIndex[2]) return false;
  const prevColors = prev.colors;
  const nextColors = next.colors;
  return (
    prevColors.front === nextColors.front &&
    prevColors.back === nextColors.back &&
    prevColors.left === nextColors.left &&
    prevColors.right === nextColors.right &&
    prevColors.top === nextColors.top &&
    prevColors.bottom === nextColors.bottom
  );
}

export default memo(ModernCubePieceVisual, modernPieceVisualPropsEqual);
