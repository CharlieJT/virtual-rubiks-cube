/**
 * Parse a move string into base and modifier.
 *
 * @param m - Move string (e.g., "R", "R'", "R2")
 * @returns Object with base (face) and mod (modifier: "", "'", or "2")
 */
export const parseMove = (m: string): { base: string; mod: "" | "'" | "2" } => {
  const base = m[0];
  const mod = m.length > 1 ? m.slice(1) : "";
  return { base, mod } as { base: string; mod: "" | "'" | "2" };
};

/**
 * Check if two moves are equal.
 *
 * @param a - First move string
 * @param b - Second move string
 * @returns True if moves are equal
 */
export const eqMove = (a: string, b: string): boolean => {
  return a === b;
};

/**
 * Map conceptual/visual moves to internal/logical moves for specific slides.
 * This handles the conversion from what the user sees (visual notation) to what
 * the internal cube state uses (logical notation).
 *
 * @param m - Move string to map
 * @param slideId - Current slide ID
 * @param fixIndex - Current fix index (position in the sequence)
 * @returns Mapped move string, or original if no mapping applies
 */
export const mapMidlayerConceptual = (
  m: string,
  slideId: string | undefined,
  fixIndex: number
): string => {
  if (!slideId) return m;

  if (slideId === "midlayer-green-white-extraction") {
    if (m === "R'") return "B'";
    if (m === "R") return "B";
  }
  if (slideId === "corner-white-facing-right") return m;
  if (slideId === "corner-white-facing-left") return m;
  if (slideId === "corner-move-to-correct") return m;
  if (slideId === "corner-insert-two-pieces") return m;
  if (slideId === "edge-insert-left") return m;
  if (slideId === "edge-insert-right") return m;
  if (slideId === "edge-remove-reinsert") return m;
  if (slideId === "edge-flipped-in-position") return m;
  if (slideId === "yellow-corners-zero-correct") {
    if (fixIndex < 8) {
      if (m === "R'") return "F'";
      if (m === "R") return "F";
      if (m === "L'") return "B'";
      if (m === "L") return "B";
    } else {
      if (m === "R'") return "F'";
      if (m === "R") return "F";
      if (m === "L'") return "B'";
      if (m === "L") return "B";
    }
    if (m === "U'") return "D'";
    if (m === "U") return "D";
    if (m === "U2") return "D2";
    return m;
  }
  if (slideId === "yellow-corners-zero-repeated") {
    if (fixIndex < 8) {
      if (m === "R'") return "F'";
      if (m === "R") return "F";
      if (m === "L'") return "B'";
      if (m === "L") return "B";
    } else {
      if (m === "R'") return "B'";
      if (m === "R") return "B";
      if (m === "L'") return "F'";
      if (m === "L") return "F";
    }
    if (m === "U'") return "D'";
    if (m === "U") return "D";
    if (m === "U2") return "D2";
    return m;
  }
  return m;
};
