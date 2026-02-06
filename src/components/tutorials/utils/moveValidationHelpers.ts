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
  if (slideId === "second-layer-setup-solution-3") {
    // Seven-part solution with multiple yaw rotations
    // Part 1 (fixIndex < 1): U - Green front, U→D
    // Part 2 (fixIndex 1-5): R U R' U' - Green front, visual R (orange) → logical L, U→D
    // Part 3 (fixIndex 5-9): L' U' L U - Orange front (after yaw), visual L → logical L, U→D
    // Part 4 (fixIndex 9-10): U2 - N/A front (after yaw 210), U2→D2
    // Part 5 (fixIndex 10-11): U - N/A front (after yaw 180), U→D
    // Part 6 (fixIndex 11-15): R U R' U' - Red front (after yaw 180), visual R → logical R, U→D
    // Part 7 (fixIndex 15-19): L' U' L U - Green front (after yaw), visual L → logical L, U→D
    if (fixIndex < 1) {
      // Part 1: U→D
      if (m === "U'") return "D'";
      if (m === "U") return "D";
      if (m === "U2") return "D2";
    } else if (fixIndex >= 1 && fixIndex < 5) {
      // Part 2: Green front, visual R (orange) → logical L
      if (m === "R'") return "L'";
      if (m === "R") return "L";
      if (m === "U'") return "D'";
      if (m === "U") return "D";
      if (m === "U2") return "D2";
    } else if (fixIndex >= 5 && fixIndex < 9) {
      // Part 3: Orange front (after yaw at index 5)
      if (m === "L'") return "L'";
      if (m === "L") return "L";
      if (m === "F'") return "L'"; // Also allow F' as an alternative
      if (m === "F") return "L";
      if (m === "U'") return "D'";
      if (m === "U") return "D";
      if (m === "U2") return "D2";
    } else if (fixIndex >= 9 && fixIndex < 11) {
      // Parts 4-5: N/A front, U→D
      if (m === "U'") return "D'";
      if (m === "U") return "D";
      if (m === "U2") return "D2";
    } else if (fixIndex >= 11 && fixIndex < 15) {
      // Part 6: Red front (after second yaw at index 11)
      if (m === "R'") return "R'";
      if (m === "R") return "R";
      if (m === "F'") return "R'"; // Also allow F' as red is front
      if (m === "F") return "R";
      if (m === "U'") return "D'";
      if (m === "U") return "D";
      if (m === "U2") return "D2";
    } else if (fixIndex >= 15) {
      // Part 7: Green front (after yaw at index 15)
      // When green is front and flipped, L and R swap (like in second-layer-setup-solution-2)
      // So: visual L → logical R
      if (m === "L'") return "R'";
      if (m === "L") return "R";
      if (m === "U'") return "D'";
      if (m === "U") return "D";
      if (m === "U2") return "D2";
    }
  }
  if (slideId === "practice-setup-solution-9") {
    // Visual sequence: U2, then R U R' U' (Righty), then U, then L' U' L U (Lefty)
    // All relative to yellow top/green front (visual)
    // Logical sequence: D2, then R D R' D', then D, then L' D' L D
    // All relative to white top/green front (logical, flipped)
    // After first yaw (120 deg): If Blue appears front, the detected move mapping changes
    // If Blue is front, then what user thinks is "R" (relative to Green) is actually "B" (relative to Blue)
    // But we need to map it to R in logical notation
    // After 120 deg CCW E rotation: F→L, R→F, B→R, L→B
    // So if user swipes "right" relative to Green (which is now left relative to Blue front),
    // the system detects it as L, but we need R
    if (fixIndex < 1) {
      // Part 1: U2 → D2 (before first yaw)
      if (m === "U2") return "D2";
    } else if (fixIndex >= 1 && fixIndex < 6) {
      // Part 2: Righty Algorithm R U R' U' (after first yaw, Blue front)
      // User wants R relative to Green, but system sees it differently after yaw
      // If Blue is front and Green is left, then R (Green front right) = B (Blue front back) or L (Blue front left)?
      // Actually, after 120 deg, if Blue is front, Green is on the left side
      // So "right" relative to Green = "back" relative to Blue = B
      // But we need R in logical, so B→R
      // Also, if user swipes on what appears as "right" (relative to Blue), that's actually L relative to Green
      // So L→R
      // Let's try: detected L (right relative to Blue) → R (right relative to Green)
      if (m === "L'") return "R'";
      if (m === "L") return "R";
      if (m === "U'") return "D'";
      if (m === "U") return "D";
      if (m === "U2") return "D2";
    } else if (fixIndex >= 6) {
      // Part 3 (fixIndex 6) and Part 4 (fixIndex 7-10): After second yaw
      // Similar mapping needed
      // User wants L relative to Green, after second yaw
      if (m === "R'") return "L'";
      if (m === "R") return "L";
      if (m === "U'") return "D'";
      if (m === "U") return "D";
      if (m === "U2") return "D2";
    }
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
