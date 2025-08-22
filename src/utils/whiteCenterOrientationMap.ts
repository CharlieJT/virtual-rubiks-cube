import CUBE_COLORS from "@/consts/cubeColours";
import WHITE_ORIENTATION_MAP_DEG from "@/maps/whiteOrentationMapDeg";
import type { AngleBucketDeg, FaceKey, SliceKey } from "@/types/cube";

// Editable mapping. All entries are explicitly listed so you can refine easily.
// Set values in DEGREES: -90, 0, 90, 180 (or any multiple of 90).
// Now supports slice-specific mappings for opposite face transitions:
//   - default: for regular face moves (R, L, U, D, F, B)
//   - M: for M slice moves (affects left↔right transitions)
//   - E: for E slice moves (affects top↔bottom transitions)
//   - S: for S slice moves (affects front↔back transitions)

// Helpers
const degToRad = (d: number) => (d * Math.PI) / 180;
const radToDeg = (r: number) => (r * 180) / Math.PI;

const snapDegBucket = (deg: number): AngleBucketDeg => {
  // Normalize to [0,360)
  let n = ((deg % 360) + 360) % 360;
  // Snap to nearest 90
  const k = Math.round(n / 90) % 4; // 0..3
  return (k * 90) as AngleBucketDeg;
};

/**
 * Directly get additional rotation by an explicit bucket (degrees).
 */
export const getWhiteLogoDeltaByBucketDeg = (
  from: FaceKey,
  to: FaceKey,
  bucket: AngleBucketDeg,
  slice: SliceKey = "none"
) => {
  const sliceMap = WHITE_ORIENTATION_MAP_DEG[from]?.[to];
  if (!sliceMap) return 0;

  // Try slice-specific mapping first, then fall back to default
  const angleMap = (slice !== "none" && sliceMap[slice]) || sliceMap.default;
  const deg = angleMap[bucket] ?? 0;
  return degToRad(deg);
};

/**
 * Additional delta for E-slice moves when white is on TOP (relative-to-white-top rule):
 * - E  => rotate another 90° clockwise (texture-space CW = -90°)
 * - E' => rotate another 90° anti-clockwise (texture-space CCW = +90°)
 * Returns degrees.
 */
const getStandardOrientationEMoveDelta = (cubeState: any, moveStr: string) => {
  if (!cubeState || !moveStr) return 0;

  // Apply only when white center is on the top face
  const topCenter = cubeState[1]?.[2]?.[1]?.colors?.top;
  const { WHITE } = CUBE_COLORS;
  const isWhiteTop = topCenter === WHITE;
  if (!isWhiteTop) return 0;

  const move = moveStr.toUpperCase();
  if (move === "E") return -90; // CW
  if (move === "E'") return 90; // CCW
  // E2: no additional delta by default
  return 0;
};

/**
 * Get additional rotation to apply (radians), based on mapping.
 * from: previous face of the white center
 * to:   new face of the white center
 * prevAngleRad: previous image orientation (radians), snapped bucket will be used
 * slice: which slice is being moved (M, E, S, or "none" for face moves)
 * cubeState: current cube state to check for standard orientation
 * moveStr: the full move string (e.g., "E", "E'") for specific move detection
 */
export const getWhiteLogoDeltaRad = (
  from: FaceKey,
  to: FaceKey,
  prevAngleRad: number,
  slice: SliceKey = "none",
  cubeState?: any,
  moveStr?: string
) => {
  const prevDeg = radToDeg(prevAngleRad);
  const bucket = snapDegBucket(prevDeg);
  let baseDelta = getWhiteLogoDeltaByBucketDeg(from, to, bucket, slice);

  // Additional rotation for E moves in standard orientation
  if (slice !== "none" && cubeState && moveStr) {
    const additionalRotation = getStandardOrientationEMoveDelta(
      cubeState,
      moveStr
    );
    baseDelta += degToRad(additionalRotation);
  }

  return baseDelta;
};
