/**
 * White center image orientation mapping
 *
 * Purpose:
 *  Given: (from face, to face, previous image orientation bucket)
 *  Return: an additional rotation (in radians) to apply to the image
 *          after a move, to achieve your desired deterministic outcome.
 *
 * Notes:
 *  - Buckets are 0, 90, 180, 270 degrees.
 *  - Values are in DEGREES for easy editing; the helper converts to radians.
 *  - Start with all zeros; tweak specific entries as you validate paths.
 */

export type FaceKey = "right" | "left" | "top" | "bottom" | "front" | "back";
export type AngleBucketDeg = 0 | 90 | 180 | 270;
export type SliceKey = "M" | "E" | "S" | "none"; // "none" for non-slice moves

type AngleMapDeg = Record<AngleBucketDeg, number>; // delta degrees to add (e.g., -90, 0, 90, 180)
type SliceAwareAngleMap = {
  default: AngleMapDeg; // for regular face moves
  M?: AngleMapDeg; // for M slice moves
  E?: AngleMapDeg; // for E slice moves
  S?: AngleMapDeg; // for S slice moves
};
type FaceToFaceMapDeg = Record<FaceKey, SliceAwareAngleMap>;
export type OrientationMapDeg = Record<FaceKey, FaceToFaceMapDeg>;

// Editable mapping. All entries are explicitly listed so you can refine easily.
// Set values in DEGREES: -90, 0, 90, 180 (or any multiple of 90).
// Now supports slice-specific mappings for opposite face transitions:
//   - default: for regular face moves (R, L, U, D, F, B)
//   - M: for M slice moves (affects left↔right transitions)
//   - E: for E slice moves (affects top↔bottom transitions)
//   - S: for S slice moves (affects front↔back transitions)
export const WHITE_ORIENTATION_MAP_DEG: OrientationMapDeg = {
  right: {
    right: { default: { 0: 0, 90: 0, 180: 0, 270: 0 } },
    left: {
      default: { 0: 0, 90: 180, 180: 0, 270: 180 },
      M: { 0: 0, 90: 0, 180: 0, 270: 0 }, // M slice: different behavior for right→left
    },
    top: { default: { 0: 90, 90: 0, 180: -90, 270: 0 } },
    bottom: { default: { 0: 270, 90: 0, 180: 90, 270: 0 } },
    front: { default: { 0: 0, 90: 90, 180: 0, 270: 270 } },
    back: { default: { 0: 0, 90: 90, 180: 0, 270: 270 } },
  },
  left: {
    right: {
      default: { 0: 0, 90: 180, 180: 0, 270: 180 },
      M: { 0: 0, 90: 0, 180: 0, 270: 0 }, // M slice: different behavior for left→right
    },
    left: { default: { 0: 0, 90: 0, 180: 0, 270: 0 } },
    top: { default: { 0: 270, 90: 0, 180: 90, 270: 0 } },
    bottom: { default: { 0: 90, 90: 0, 180: 270, 270: 0 } },
    front: { default: { 0: 0, 90: 90, 180: 0, 270: 270 } },
    back: { default: { 0: 0, 90: 90, 180: 0, 270: 270 } },
  },
  top: {
    right: { default: { 0: 0, 90: 0, 180: 0, 270: 180 } },
    left: { default: { 0: 0, 90: 180, 180: 0, 270: 0 } },
    top: { default: { 0: 0, 90: 0, 180: 0, 270: 0 } },
    bottom: {
      default: { 0: 180, 90: 0, 180: 180, 270: 0 },
      E: { 0: 0, 90: 0, 180: 0, 270: 0 },
    },
    front: { default: { 0: 0, 90: 180, 180: 180, 270: 180 } },
    back: { default: { 0: 180, 90: 180, 180: 0, 270: 180 } },
  },
  bottom: {
    right: { default: { 0: 0, 90: 180, 180: 0, 270: 0 } },
    left: { default: { 0: 0, 90: 0, 180: 0, 270: 180 } },
    top: {
      default: { 0: 180, 90: 0, 180: 180, 270: 0 },
      E: { 0: 0, 90: 0, 180: 0, 270: 0 },
    },
    bottom: { default: { 0: 0, 90: 0, 180: 0, 270: 0 } },
    front: { default: { 0: 0, 90: 180, 180: 180, 270: 180 } },
    back: { default: { 0: 180, 90: 180, 180: 0, 270: 180 } },
  },
  front: {
    right: { default: { 0: 0, 90: 90, 180: 0, 270: 270 } },
    left: { default: { 0: 0, 90: 90, 180: 0, 270: 270 } },
    top: { default: { 0: 0, 90: 180, 180: 180, 270: 180 } },
    bottom: { default: { 0: 0, 90: 180, 180: 180, 270: 180 } },
    front: { default: { 0: 0, 90: 0, 180: 0, 270: 0 } },
    back: {
      default: { 0: 0, 90: 180, 180: 0, 270: 180 },
      M: { 0: 180, 90: 0, 180: 180, 270: 0 },
    },
  },
  back: {
    right: { default: { 0: 0, 90: 90, 180: 0, 270: 270 } },
    left: { default: { 0: 0, 90: 90, 180: 0, 270: 270 } },
    top: { default: { 0: 180, 90: 180, 180: 0, 270: 180 } },
    bottom: { default: { 0: 180, 90: 180, 180: 0, 270: 180 } },
    front: {
      default: { 0: 0, 90: 180, 180: 0, 270: 180 },
      M: { 0: 180, 90: 0, 180: 180, 270: 0 },
    },
    back: { default: { 0: 0, 90: 0, 180: 0, 270: 0 } },
  },
};

// Helpers
const degToRad = (d: number) => (d * Math.PI) / 180;
const radToDeg = (r: number) => (r * 180) / Math.PI;

export const snapDegBucket = (deg: number): AngleBucketDeg => {
  // Normalize to [0,360)
  let n = ((deg % 360) + 360) % 360;
  // Snap to nearest 90
  const k = Math.round(n / 90) % 4; // 0..3
  return (k * 90) as AngleBucketDeg;
};

/**
 * Directly get additional rotation by an explicit bucket (degrees).
 */
export function getWhiteLogoDeltaByBucketDeg(
  from: FaceKey,
  to: FaceKey,
  bucket: AngleBucketDeg,
  slice: SliceKey = "none"
): number {
  const sliceMap = WHITE_ORIENTATION_MAP_DEG[from]?.[to];
  if (!sliceMap) return 0;

  // Try slice-specific mapping first, then fall back to default
  const angleMap = (slice !== "none" && sliceMap[slice]) || sliceMap.default;
  const deg = angleMap[bucket] ?? 0;
  return degToRad(deg);
}

/**
 * Get additional rotation to apply (radians), based on mapping.
 * from: previous face of the white center
 * to:   new face of the white center
 * prevAngleRad: previous image orientation (radians), snapped bucket will be used
 * slice: which slice is being moved (M, E, S, or "none" for face moves)
 */
export function getWhiteLogoDeltaRad(
  from: FaceKey,
  to: FaceKey,
  prevAngleRad: number,
  slice: SliceKey = "none"
): number {
  const prevDeg = radToDeg(prevAngleRad);
  const bucket = snapDegBucket(prevDeg);
  return getWhiteLogoDeltaByBucketDeg(from, to, bucket, slice);
}
