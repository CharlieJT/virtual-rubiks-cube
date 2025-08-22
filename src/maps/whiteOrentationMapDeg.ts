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

import type { OrientationMapDeg } from "@/types/cube";

const WHITE_ORIENTATION_MAP_DEG: OrientationMapDeg = {
  right: {
    right: { default: { 0: 0, 90: 0, 180: 0, 270: 0 } },
    left: {
      default: { 0: 0, 90: 180, 180: 0, 270: 180 },
      M: { 0: 0, 90: 0, 180: 0, 270: 0 },
    },
    top: { default: { 0: 0, 90: 270, 180: 180, 270: 270 } },
    bottom: { default: { 0: 0, 90: 90, 180: 180, 270: 90 } },
    front: { default: { 0: 0, 90: 90, 180: 0, 270: 270 } },
    back: { default: { 0: 0, 90: 90, 180: 0, 270: 270 } },
  },
  left: {
    right: {
      default: { 0: 0, 90: 180, 180: 0, 270: 180 },
      M: { 0: 0, 90: 0, 180: 0, 270: 0 },
    },
    left: { default: { 0: 0, 90: 0, 180: 0, 270: 0 } },
    top: { default: { 0: 0, 90: 90, 180: 180, 270: 90 } },
    bottom: { default: { 0: 0, 90: 270, 180: 180, 270: 270 } },
    front: { default: { 0: 0, 90: 90, 180: 0, 270: 270 } },
    back: { default: { 0: 0, 90: 90, 180: 0, 270: 270 } },
  },
  top: {
    right: { default: { 0: 90, 90: 90, 180: 90, 270: 270 } },
    left: { default: { 0: 270, 90: 90, 180: 270, 270: 270 } },
    top: { default: { 0: 0, 90: 0, 180: 0, 270: 0 } },
    bottom: {
      default: { 0: 180, 90: 0, 180: 180, 270: 0 },
      S: { 0: 0, 90: 180, 180: 0, 270: 180 },
    },
    front: { default: { 0: 0, 90: 180, 180: 180, 270: 180 } },
    back: { default: { 0: 0, 90: 0, 180: 180, 270: 0 } },
  },
  bottom: {
    right: { default: { 0: 270, 90: 90, 180: 270, 270: 270 } },
    left: { default: { 0: 90, 90: 90, 180: 90, 270: 270 } },
    top: {
      default: { 0: 180, 90: 0, 180: 180, 270: 0 },
      S: { 0: 0, 90: 180, 180: 0, 270: 180 },
    },
    bottom: { default: { 0: 0, 90: 0, 180: 0, 270: 0 } },
    front: { default: { 0: 0, 90: 180, 180: 180, 270: 180 } },
    back: { default: { 0: 0, 90: 0, 180: 180, 270: 0 } },
  },
  front: {
    right: { default: { 0: 0, 90: 90, 180: 0, 270: 270 } },
    left: { default: { 0: 0, 90: 90, 180: 0, 270: 270 } },
    top: { default: { 0: 0, 90: 180, 180: 180, 270: 180 } },
    bottom: { default: { 0: 0, 90: 180, 180: 180, 270: 180 } },
    front: { default: { 0: 0, 90: 0, 180: 0, 270: 0 } },
    back: {
      default: { 0: 0, 90: 180, 180: 0, 270: 180 },
      M: { 0: 0, 90: 180, 180: 0, 270: 180 },
    },
  },
  back: {
    right: { default: { 0: 0, 90: 90, 180: 0, 270: 270 } },
    left: { default: { 0: 0, 90: 90, 180: 0, 270: 270 } },
    top: { default: { 0: 0, 90: 0, 180: 180, 270: 0 } },
    bottom: { default: { 0: 0, 90: 0, 180: 0, 270: 0 } },
    front: {
      default: { 0: 0, 90: 180, 180: 0, 270: 180 },
      M: { 0: 0, 90: 180, 180: 0, 270: 180 },
    },
    back: { default: { 0: 0, 90: 0, 180: 0, 270: 0 } },
  },
};

export default WHITE_ORIENTATION_MAP_DEG;
