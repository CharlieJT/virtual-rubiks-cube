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

type AngleMapDeg = Record<AngleBucketDeg, number>; // delta degrees to add (e.g., -90, 0, 90, 180)
type FaceToFaceMapDeg = Record<FaceKey, AngleMapDeg>;
export type OrientationMapDeg = Record<FaceKey, FaceToFaceMapDeg>;

// Editable mapping. All entries are explicitly listed so you can refine easily.
// Set values in DEGREES: -90, 0, 90, 180 (or any multiple of 90).
// Example refinements:
//   WHITE_ORIENTATION_MAP_DEG.top.bottom[0] = 180
//   WHITE_ORIENTATION_MAP_DEG.top.top[90] = -90
export const WHITE_ORIENTATION_MAP_DEG: OrientationMapDeg = {
  right: {
    right: { 0: 0, 90: 0, 180: 0, 270: 0 },
    left: { 0: 0, 90: 180, 180: 0, 270: 180 },
    top: { 0: 90, 90: 0, 180: -90, 270: 0 },
    bottom: { 0: 270, 90: 0, 180: 90, 270: 0 },
    front: { 0: 0, 90: 90, 180: 0, 270: 270 },
    back: { 0: 0, 90: 90, 180: 0, 270: 270 },
  },
  left: {
    right: { 0: 0, 90: 180, 180: 0, 270: 180 },
    left: { 0: 0, 90: 0, 180: 0, 270: 0 },
    top: { 0: 270, 90: 0, 180: 90, 270: 0 },
    bottom: { 0: 90, 90: 0, 180: 270, 270: 0 },
    front: { 0: 0, 90: 90, 180: 0, 270: 270 },
    back: { 0: 0, 90: 90, 180: 0, 270: 270 },
  },
  top: {
    right: { 0: 0, 90: 0, 180: 0, 270: 180 },
    left: { 0: 0, 90: 180, 180: 0, 270: 0 },
    top: { 0: 0, 90: 0, 180: 0, 270: 0 },
    bottom: { 0: 180, 90: 0, 180: 180, 270: 0 },
    front: { 0: 0, 90: 180, 180: 180, 270: 180 },
    back: { 0: 180, 90: 180, 180: 0, 270: 180 },
  },
  bottom: {
    right: { 0: 0, 90: 180, 180: 0, 270: 0 },
    left: { 0: 0, 90: 0, 180: 0, 270: 180 },
    top: { 0: 180, 90: 0, 180: 180, 270: 0 },
    bottom: { 0: 0, 90: 0, 180: 0, 270: 0 },
    front: { 0: 0, 90: 180, 180: 180, 270: 180 },
    back: { 0: 180, 90: 180, 180: 0, 270: 180 },
  },
  front: {
    right: { 0: 0, 90: 90, 180: 0, 270: 270 },
    left: { 0: 0, 90: 90, 180: 0, 270: 270 },
    top: { 0: 0, 90: 180, 180: 180, 270: 180 },
    bottom: { 0: 0, 90: 180, 180: 180, 270: 180 },
    front: { 0: 0, 90: 0, 180: 0, 270: 0 },
    back: { 0: 0, 90: 180, 180: 0, 270: 180 },
  },
  back: {
    right: { 0: 0, 90: 90, 180: 0, 270: 270 },
    left: { 0: 0, 90: 90, 180: 0, 270: 270 },
    top: { 0: 180, 90: 180, 180: 0, 270: 180 },
    bottom: { 0: 180, 90: 180, 180: 0, 270: 180 },
    front: { 0: 0, 90: 180, 180: 0, 270: 180 },
    back: { 0: 0, 90: 0, 180: 0, 270: 0 },
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
  bucket: AngleBucketDeg
): number {
  const deg = WHITE_ORIENTATION_MAP_DEG[from]?.[to]?.[bucket] ?? 0;
  return degToRad(deg);
}

/**
 * Get additional rotation to apply (radians), based on mapping.
 * from: previous face of the white center
 * to:   new face of the white center
 * prevAngleRad: previous image orientation (radians), snapped bucket will be used
 */
export function getWhiteLogoDeltaRad(
  from: FaceKey,
  to: FaceKey,
  prevAngleRad: number
): number {
  const prevDeg = radToDeg(prevAngleRad);
  const bucket = snapDegBucket(prevDeg);
  return getWhiteLogoDeltaByBucketDeg(from, to, bucket);
}
