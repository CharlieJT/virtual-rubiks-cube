/**
 * Get the logical fix sequence for a given slide ID.
 * These sequences are in logical notation (white top/green front).
 *
 * @param slideId - The ID of the slide
 * @returns Array of move strings in logical notation
 */
export const getFixSequence = (slideId: string | undefined): string[] => {
  if (!slideId) return [];

  switch (slideId) {
    // Notation intro/faces: no specific sequence; free play
    case "notation-intro":
    case "notation-faces":
      return [];
    // Notation: use Fix-like confirmation for Try sequences
    case "notation-turns":
      return ["F", "F'", "F2"];
    case "notation-example":
      return ["R", "U", "R'", "U'"];
    case "notation-example-2":
      return ["F", "R", "U", "R'", "U'", "F'"];
    case "notation-example-3":
      return ["R", "U2", "R'", "U'"];
    case "notation-10-step":
      return ["F", "U", "R", "U'", "R'", "F'", "R", "U", "R'", "U'"];
    case "recap-mental-model":
    case "recap-white-corners":
    case "second-layer-recap":
    case "practice-two-edges":
    case "practice-three-edges":
    case "practice-full-cross":
    case "practice-white-corners":
    case "practice-white-corners-2":
    case "practice-white-corners-3":
    case "practice-second-layer":
    case "practice-second-layer-2":
    case "practice-second-layer-3":
      return [];
    case "flip-green-white-f2":
      return ["F2"];
    case "misaligned-green-white":
      return ["D'", "F2"];
    case "flip-green-white":
      return ["F", "U'", "R", "U"];
    case "flipped-misoriented-green-white":
      // Teach as combination: F2, then F U' R U
      return ["F2", "F", "U'", "R", "U"];
    case "flipped-misoriented-misaligned-green-white":
      return ["D'", "F2", "F", "U'", "R", "U"];
    case "midlayer-green-white-extraction":
      // Three conceptual stages: (B' D' B) free (displayed as R' D' R), then D' align, then F2 place
      return ["B'", "D'", "B", "D'", "F2"];
    case "practice-setup-solution":
      // Solution sequence: R U R' relative to yellow top/red front (visual)
      // Logical state is white top/green front, so remap: R→F (red front to green front), U→D
      // So remap: R U R' → F D F'
      return ["F", "D", "F'"];
    case "practice-setup-solution-2":
      // Solution sequence: L' U' L relative to yellow top/green front (visual)
      // Logical state is white top/green front, so remap: L→R (when flipped, L and R swap), U→D
      // So remap: L' U' L → R' D' R
      return ["R'", "D'", "R"];
    case "practice-setup-solution-3":
      // Two-part solution (both relative to yellow top/red front, visual):
      // Part 1: R U2 R' U' → Logical: F D2 F' D'
      // Part 2: R U R' → Logical: F D F'
      return ["F", "D2", "F'", "D'", "F", "D", "F'"];
    case "practice-setup-solution-4":
      // Two-part solution (both relative to yellow top/red front, visual):
      // Part 1: R U R' U' → Logical: F D F' D'
      // Part 2: R U R' → Logical: F D F'
      return ["F", "D", "F'", "D'", "F", "D", "F'"];
    case "practice-setup-solution-5":
      // Three-part solution (all relative to yellow top/red front, visual):
      // Part 1: R U R' U' → Logical: F D F' D'
      // Part 2: R U2 R' U' → Logical: F D2 F' D'
      // Part 3: R U R' → Logical: F D F'
      return ["F", "D", "F'", "D'", "F", "D2", "F'", "D'", "F", "D", "F'"];
    case "yellow-cross-line":
      // Solution sequence: F R U R' U' F' relative to yellow top/green front (visual)
      // Logical state is white top/green front, so remap: F→R, R→F, U→D
      // So remap: F R U R' U' F' → R F D F' D' R' (logical for tracking)
      // Display: F R U R' U' F' (visual notation shown to user)
      return ["R", "F", "D", "F'", "D'", "R'"];
    case "yellow-cross-triangle":
      // Solution: F R U R' U' F' / F R U R' U' F' relative to yellow top/red front (visual)
      // Logical state is white top/green front, so remap: F→R, R→F, U→D (same as line)
      // So remap: F R U R' U' F' → R F D F' D' R' (twice for tracking)
      return ["R", "F", "D", "F'", "D'", "R'", "R", "F", "D", "F'", "D'", "R'"];
    case "yellow-cross-dot":
      // Solution: F R U R' U' F' / U2 / F R U R' U' F' / F R U R' U' F' relative to yellow top/red front (visual)
      // Logical state is white top/green front, so remap: F→R, R→F, U→D
      // So remap: F R U R' U' F' → R F D F' D' R', U2 → D2
      // Parts: 1) R F D F' D' R' (6 moves), 2) D2 (1 move), 3) R F D F' D' R' (6 moves), 4) R F D F' D' R' (6 moves)
      return [
        "R",
        "F",
        "D",
        "F'",
        "D'",
        "R'",
        "D2",
        "R",
        "F",
        "D",
        "F'",
        "D'",
        "R'",
        "R",
        "F",
        "D",
        "F'",
        "D'",
        "R'",
      ];
    case "yellow-edges-solution":
      // Solution: R U R' U R U2 R' U relative to yellow top/red front (visual)
      // Logical state is white top/green front, so remap: R→F, U→D
      // So remap: R U R' U R U2 R' U → F D F' D F D2 F' D
      return ["F", "D", "F'", "D", "F", "D2", "F'", "D"];
    case "yellow-edges-solution-2":
      // Multi-part solution:
      // Part 1: U relative to yellow top/red front (visual) → D (logical, yellow top = bottom)
      // Part 2: R U R' U R U2 R' U relative to yellow top/green front (visual)
      //   Logical: yellow top/green front → white top/green front, so U→D, R→L
      //   So: R U R' U R U2 R' U → L D L' D L D2 L' D
      // Total: D (part 1) + L D L' D L D2 L' D (part 2) = 9 moves
      return ["D", "L", "D", "L'", "D", "L", "D2", "L'", "D"];
    case "yellow-edges-solution-3":
      // Multi-part solution:
      // Part 1: U2 relative to yellow top/red front (visual) → D2 (logical, yellow top = bottom)
      // Part 2: R U R' U R U2 R' U relative to yellow top/blue front (visual)
      //   Logical: yellow top/blue front → white top/green front, so U→D, R→R (blue front maps to blue front)
      //   So: R U R' U R U2 R' U → R D R' D R D2 R' D
      // Total: D2 (part 1) + R D R' D R D2 R' D (part 2) = 9 moves
      return ["D2", "R", "D", "R'", "D", "R", "D2", "R'", "D"];
    case "yellow-corners-solution":
      // Solution: U R U' L' U R' U' L relative to yellow top/red front (visual)
      // Logical state is white top/green front, so remap:
      // When yellow top/red front: U→D (yellow top = bottom), R→F (red is front), L→B (left is back)
      // So remap: U R U' L' U R' U' L → D F D' B' D F' D' B
      return ["D", "F", "D'", "B'", "D", "F'", "D'", "B"];
    case "yellow-corners-solution-2":
      // Two-part solution:
      // Part 1: U R U' L' U R' U' L relative to yellow top/red front (visual)
      //   Logical: yellow top/red front → white top/green front, so U→D, R→F, L→B
      //   So: U R U' L' U R' U' L → D F D' B' D F' D' B
      // Part 2: U R U' L' U R' U' L relative to yellow top/blue front (visual)
      //   Logical: yellow top/blue front → white top/green front
      //   When blue is front: red is right, orange is back, green is left
      //   So: U→D, R→F (red is right in visual, becomes front in logical), L→B (green/left becomes back in logical)
      //   So: U R U' L' U R' U' L → D F D' B' D F' D' B
      // Total: 16 moves
      return [
        "D",
        "F",
        "D'",
        "B'",
        "D",
        "F'",
        "D'",
        "B",
        "D",
        "F",
        "D'",
        "B'",
        "D",
        "F'",
        "D'",
        "B",
      ];
    case "yellow-corners-solution-3":
      // Three-part solution:
      // Part 1: U R U' L' U R' U' L relative to yellow top/red front (visual)
      //   Logical: yellow top/red front → white top/green front, so U→D, R→F, L→B
      //   So: U R U' L' U R' U' L → D F D' B' D F' D' B
      // Part 2: U R U' L' U R' U' L relative to yellow top/orange front (visual)
      //   Logical: yellow top/orange front → white top/green front
      //   When orange is front: red is right, green is back, blue is left
      //   So: U→D, R→B (red is back in logical), L→F (blue/left becomes front in logical)
      //   So: U R U' L' U R' U' L → D B D' F' D B' D' F
      // Part 3: U R U' L' U R' U' L relative to yellow top/orange front (visual)
      //   Same as part 2: D B D' F' D B' D' F
      // Total: 24 moves
      return [
        "D",
        "F",
        "D'",
        "B'",
        "D",
        "F'",
        "D'",
        "B",
        "D",
        "B",
        "D'",
        "F'",
        "D",
        "B'",
        "D'",
        "F",
        "D",
        "B",
        "D'",
        "F'",
        "D",
        "B'",
        "D'",
        "F",
      ];
    case "second-layer-setup-solution-3":
      // Two-part solution:
      // Part 1: U R U R' U' relative to yellow top/green front (visual)
      //   When yellow top/green front (visual): green is front, orange is right
      //   In logical (white top/green front): green is front, red is right, orange is left
      //   So visual R (orange) → logical L (orange left), U→D
      //   Therefore: U R U R' U' → D L D L' D' (logical)
      // Part 2: L' U' L relative to yellow top/orange front (visual)
      //   When yellow top/orange front (visual): orange is front, blue is right
      //   In logical (white top/green front): green is front, red is right, orange is left, blue is back
      //   So visual L (green) → logical F (green front), U→D
      //   Therefore: L' U' L → F' D' F (logical)
      return ["D", "L", "D", "L'", "D'", "F'", "D'", "F"];
    case "practice-setup-solution-6":
      // Three-part solution:
      // Part 1: R U R' U' relative to yellow top/green front (visual)
      // When flipped, visual R → logical L (left and right swap)
      // Logical: L D L' D' (white top/green front, flipped)
      // Part 2: U relative to yellow top/green front (visual)
      // Logical: D (white top/green front, flipped)
      // Part 3: R U R' relative to yellow top/red front (visual)
      // Logical: F D F' (white top/green front, red front to green front, flipped)
      return ["L", "D", "L'", "D'", "D", "F", "D", "F'"];
    case "second-layer-setup-solution":
      // Two-part solution:
      // Part 1: U' L' U' L U relative to yellow top/green front (visual)
      // When flipped, visual L → logical R (left and right swap), U→D
      // Logical: D' R' D' R D (white top/green front, flipped)
      // Part 2: R U R' relative to yellow top/red front (visual)
      // Logical: F D F' (white top/green front, red front to green front, flipped)
      return ["D'", "R'", "D'", "R", "D", "F", "D", "F'"];
    case "second-layer-setup-solution-2":
      // Two-part solution:
      // Part 1: U R U R' U' relative to yellow top/red front (visual)
      // Logical: R→F, U→D → D F D F' D'
      // Part 2: L' U' L relative to yellow top/green front (visual)
      // Logical: L→R (when flipped, L and R swap), U→D → R' D' R
      return ["D", "F", "D", "F'", "D'", "R'", "D'", "R"];
    case "second-layer-setup-solution-4":
      // Five-part solution:
      // Part 1: U R U R' U' relative to yellow top/red front (visual)
      //   Logical: R→F, U→D → D F D F' D'
      // Part 2: L' U' L relative to yellow top/green front (visual)
      //   Logical: L→R (when yellow top/green front, visual L maps to logical R), U→D → R' D' R
      // Part 3: U2 relative to yellow top/green front (visual)
      //   Logical: U→D → D2
      // Part 4: U R U R' U' relative to yellow top/red front (visual) - same as Part 1
      //   Logical: D F D F' D'
      // Part 5: L' U' L relative to yellow top/green front (visual) - same as Part 2
      //   Logical: R' D' R
      return [
        "D",
        "F",
        "D",
        "F'",
        "D'",
        "R'",
        "D'",
        "R",
        "D2",
        "D",
        "F",
        "D",
        "F'",
        "D'",
        "R'",
        "D'",
        "R",
      ];
    default:
      return [];
  }
};

/**
 * Get the display sequence for the Fix box (visual notation shown to user).
 * For some slides, this differs from the logical fixSequence.
 *
 * @param slideId - The ID of the slide
 * @param fixSequence - The logical fix sequence
 * @returns Array of move strings in visual notation
 */
export const getFixSequenceDisplay = (
  slideId: string | undefined,
  fixSequence: string[]
): string[] => {
  if (!slideId) return fixSequence;

  switch (slideId) {
    case "practice-setup-solution":
      // Show R U R' (visual notation, yellow top/red front) in Fix box
      return ["R", "U", "R'"];
    case "practice-setup-solution-2":
      // Show L' U' L (visual notation, yellow top/green front) in Fix box
      return ["L'", "U'", "L"];
    case "yellow-cross-line":
      // Show F R U R' U' F' (visual notation, yellow top/green front) in Fix box
      return ["F", "R", "U", "R'", "U'", "F'"];
    case "yellow-edges-solution":
      // Show R U R' U R U2 R' U (visual notation, yellow top/red front) in Fix box
      return ["R", "U", "R'", "U", "R", "U2", "R'", "U"];
    case "yellow-corners-solution":
      // Show U R U' L' U R' U' L (visual notation, yellow top/red front) in Fix box
      return ["U", "R", "U'", "L'", "U", "R'", "U'", "L"];
    // Note: practice-setup-solution-3, -4, -5, -6 use MultiPartSequence, so fixSequenceDisplay not needed here
    // yellow-cross-triangle, yellow-corners-solution-2, yellow-corners-solution-3 also use MultiPartSequence
    default:
      return fixSequence;
  }
};
