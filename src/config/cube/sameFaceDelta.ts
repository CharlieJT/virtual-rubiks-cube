import type { CubeState } from "@/types/cube";

const SAME_FACE_DELTA: Partial<
  Record<
    keyof CubeState["colors"],
    Partial<Record<string, number>>
  >
> = {
  top: {
    S: -Math.PI / 2,
    "S'": Math.PI / 2,
    S2: Math.PI, // optional; can be set to 0 if undesired
    E2: Math.PI,
    // M/E/E' default to 0 when not specified
  },
  // Other faces default to no-op; add entries here if you want specific slice behavior while staying on the same face.
};

export default SAME_FACE_DELTA;
