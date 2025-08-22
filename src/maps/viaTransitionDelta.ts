// Extra via-path deltas for transitions where the white center changes faces during a slice move.
// Keyed by from face -> to face -> via move (e.g., "M", "M'", "M2", "S2").
// Example: differentiate top->bottom via M2 vs via S2.
const VIA_TRANSITION_DELTA: Partial<
  Record<
    keyof import("../types/cube").CubeState["colors"],
    Partial<
      Record<
        keyof import("../types/cube").CubeState["colors"],
        Partial<Record<string, number>>
      >
    >
  >
> = {
  top: {
    bottom: {
      M2: 0, // keep baseline for M2 path
      S2: Math.PI, // make S2 path distinct (180° difference)
    },
  },
  bottom: {
    top: {
      M2: 0,
      S2: Math.PI,
    },
  },
};

export default VIA_TRANSITION_DELTA;
