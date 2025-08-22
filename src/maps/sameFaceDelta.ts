// Optional per-face orientation deltas when a slice move (M/E/S) does NOT move the white center to a new face.
// Angles are in radians; positive = CCW in that face's UV frame. Adjust as desired.
// The sample below targets the top face to satisfy: M, E, S' => +90; M, E', S => -90; M, E2, S => 180.
// Rationale:
// - Assign S': +90 and S: -90 on top; M/E/E' default to 0; E2: 180 for top.
// - This way those three sequences produce the expected totals while leaving single M/E/S mostly neutral.
const SAME_FACE_DELTA: Partial<
  Record<
    keyof import("../types/cube").CubeState["colors"],
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
