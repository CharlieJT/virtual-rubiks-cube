/**
 * Parse a move string into base and modifier.
 *
 * @param m - Move string (e.g., "R", "R'", "R2")
 * @returns Object with base (face) and mod (modifier: "", "'", or "2")
 */
export const parseMove = (m: string): { base: string; mod: "" | "'" | "2" } => {
  const base = m[0];
  const mod = m.length > 1 ? m.slice(1) : ""; // "'" or "2"
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
  if (slideId === "practice-setup-solution") {
    // Visual R (yellow top/red front) maps to logical F (white top/green front)
    if (m === "R'") return "F'";
    if (m === "R") return "F";
  }
  if (slideId === "practice-setup-solution-2") {
    // Visual L (yellow top/green front) maps to logical R (white top/green front, when flipped L and R swap)
    if (m === "L'") return "R'";
    if (m === "L") return "R";
  }
  if (slideId === "practice-setup-solution-6") {
    // Parts 1 and 2 (fixIndex < 5): yellow top/green front
    // When flipped (yellow top/green front), L and R swap: visual L → logical R
    // Visual R (green front) → logical L (when flipped, R becomes L)
    // Part 3 (fixIndex >= 5): yellow top/red front
    // R (red front) → F (logical, red front to green front)
    if (fixIndex < 5) {
      // Parts 1 and 2: green front, when flipped L and R swap
      // Visual R → Logical L (right becomes left when flipped) - matches fixSequence, pass through
      // Visual L → Logical R (left becomes right when flipped) - remap to L to match fixSequence
      // fixSequence expects L, so:
      // - L (from visual R) → pass through as L ✓
      // - R (from visual L) → remap to L
      if (m === "R'") return "L'";
      if (m === "R") return "L";
      // L passes through unchanged (visual R detected as logical L matches fixSequence)
    } else {
      // Part 3: red front, so R→F
      if (m === "R'") return "F'";
      if (m === "R") return "F";
    }
  }
  if (slideId === "second-layer-setup-solution") {
    // Part 1 (fixIndex < 5): yellow top/green front
    // When flipped (yellow top/green front), L and R swap: visual L → logical R
    // Part 2 (fixIndex >= 5): yellow top/red front
    // R (red front) → F (logical, red front to green front)
    if (fixIndex < 5) {
      // Part 1: green front, when flipped L and R swap
      // Visual L → Logical R (left becomes right when flipped)
      if (m === "L'") return "R'";
      if (m === "L") return "R";
    } else {
      // Part 2: red front, so R→F
      if (m === "R'") return "F'";
      if (m === "R") return "F";
    }
  }
  if (slideId === "second-layer-setup-solution-2") {
    // Part 1 (fixIndex < 5): yellow top/red front
    // R→F, U→D (when yellow top/red front)
    // Part 2 (fixIndex >= 5): yellow top/green front
    // L→R (when flipped, L and R swap), U→D
    if (fixIndex < 5) {
      // Part 1: red front, R→F
      if (m === "R'") return "F'";
      if (m === "R") return "F";
    } else {
      // Part 2: green front, when flipped L and R swap
      if (m === "L'") return "R'";
      if (m === "L") return "R";
    }
  }
  if (slideId === "second-layer-setup-solution-4") {
    // Parts 1 and 4: yellow top/red front, R→F, U→D
    // Parts 2 and 5: yellow top/green front, L→R, U→D
    // Part 3: yellow top/green front, U2→D2
    if (fixIndex < 5 || (fixIndex >= 9 && fixIndex < 13)) {
      // Parts 1 and 4: red front, R→F
      if (m === "R'") return "F'";
      if (m === "R") return "F";
    } else if (fixIndex >= 5 && fixIndex < 9) {
      // Parts 2 and 3: green front, when flipped L and R swap
      if (m === "L'") return "R'";
      if (m === "L") return "R";
    } else if (fixIndex >= 13) {
      // Part 5: green front, when flipped L and R swap
      if (m === "L'") return "R'";
      if (m === "L") return "R";
    }
  }
  if (slideId === "yellow-corners-solution-2") {
    // Part 1 (fixIndex < 8): yellow top/red front
    // Visual R (red) → Logical F (red front to green front), U→D
    // Visual L (blue) → Logical B (blue back), U→D
    // Part 2 (fixIndex >= 8): yellow top/blue front
    // Visual R (red) → Logical F (red is right in visual, becomes front in logical), U→D
    // Visual L (green) → Logical B (green/left becomes back in logical), U→D
    if (fixIndex < 8) {
      // Part 1: red front, so R→F, L→B
      if (m === "R'") return "F'";
      if (m === "R") return "F";
      if (m === "L'") return "B'";
      if (m === "L") return "B";
    } else {
      // Part 2: blue front, so R→F, L→B (same mapping)
      if (m === "R'") return "F'";
      if (m === "R") return "F";
      if (m === "L'") return "B'";
      if (m === "L") return "B";
    }
    // U→D mapping applies to all parts
    if (m === "U'") return "D'";
    if (m === "U") return "D";
    if (m === "U2") return "D2";
    return m;
  }
  if (slideId === "yellow-corners-solution-3") {
    // Part 1 (fixIndex < 8): yellow top/red front
    // Visual R (red) → Logical F (red front to green front), U→D
    // Visual L (blue) → Logical B (blue back), U→D
    // Part 2 (fixIndex >= 8 && < 16): yellow top/orange front
    // Visual R (red) → Logical B (red is back in logical), U→D
    // Visual L (blue) → Logical F (blue/left becomes front in logical), U→D
    // Part 3 (fixIndex >= 16): yellow top/orange front (same as part 2)
    // Visual R (red) → Logical B (red is back in logical), U→D
    // Visual L (blue) → Logical F (blue/left becomes front in logical), U→D
    if (fixIndex < 8) {
      // Part 1: red front, so R→F, L→B
      if (m === "R'") return "F'";
      if (m === "R") return "F";
      if (m === "L'") return "B'";
      if (m === "L") return "B";
    } else {
      // Part 2 and 3: orange front, so R→B, L→F
      if (m === "R'") return "B'";
      if (m === "R") return "B";
      if (m === "L'") return "F'";
      if (m === "L") return "F";
    }
    // U→D mapping applies to all parts
    if (m === "U'") return "D'";
    if (m === "U") return "D";
    if (m === "U2") return "D2";
    return m;
  }
  // For flipped slides, convert detected U moves (white top) to D moves (yellow top logical bottom)
  // This handles the case where move detection sees yellow as "top" but logically it's "bottom"
  if (
    slideId === "practice-setup-solution" ||
    slideId === "practice-setup-solution-2" ||
    slideId === "practice-setup-solution-6" ||
    slideId === "second-layer-setup-solution" ||
    slideId === "second-layer-setup-solution-2" ||
    slideId === "second-layer-setup-solution-4"
  ) {
    if (m === "U'") return "D'";
    if (m === "U") return "D";
    if (m === "U2") return "D2";
  }
  return m;
};
