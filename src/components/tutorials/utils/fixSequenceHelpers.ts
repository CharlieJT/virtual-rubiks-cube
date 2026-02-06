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
    case "notation-intro":
    case "notation-orientation":
    case "notation-faces":
    case "notation-reminder":
      return [];
    case "notation-sequences":
      // Solution sequence: F U2 D R' to solve R U2 D' F'
      return ["F", "U2", "D", "R'"];
    case "notation-sequences-longer":
      // Solution sequence: D' R2 B U' F' D2 L to solve L' D2 F U B' R2 D
      return ["D'", "R2", "B", "U'", "F'", "D2", "L"];
    case "notation-double":
      return ["F2"];
    case "notation-double-l":
      return ["L2"];
    case "notation-double-d":
      return ["D2"];
    case "notation-clockwise-f":
      return ["F"];
    case "notation-prime-f":
      return ["F'"];
    case "notation-clockwise-r":
      return ["R"];
    case "notation-prime-r":
      return ["R'"];
    case "notation-clockwise-l":
      return ["L"];
    case "notation-prime-l":
      return ["L'"];
    case "notation-clockwise-u":
      return ["U"];
    case "notation-prime-u":
      return ["U'"];
    case "notation-clockwise-d":
      return ["D"];
    case "notation-prime-d":
      return ["D'"];
    case "notation-clockwise-b":
      return ["B"];
    case "notation-prime-b":
      return ["B'"];
    case "recap-white-cross":
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
      // Solution sequence: R U R' U' relative to yellow top/red front (visual)
      // Logical state is white top/green front, so remap: R→F (red front to green front), U→D
      // So remap: R U R' U' → F D F' D'
      return ["F", "D", "F'", "D'"];
    case "practice-setup-solution-2":
      // Solution sequence: L' U' L U relative to yellow top/green front (visual)
      // Logical state is white top/green front, so remap: L→R (when flipped, L and R swap), U→D
      // So remap: L' U' L U → R' D' R D
      return ["R'", "D'", "R", "D"];
    case "practice-setup-solution-3":
      // Three-part solution (all relative to yellow top/red front, visual):
      // R U R' U' (3 times) → Logical: F D F' D' (3 times)
      return ["F", "D", "F'", "D'", "F", "D", "F'", "D'", "F", "D", "F'", "D'"];
    case "practice-setup-solution-4":
      // Two-part solution (both relative to yellow top/red front, visual):
      // R U R' U' (2 times) → Logical: F D F' D' (2 times)
      return ["F", "D", "F'", "D'", "F", "D", "F'", "D'"];
    case "practice-setup-solution-5":
      // Four-part solution (all relative to yellow top/red front, visual):
      // R U R' U' (4 times) → Logical: F D F' D' (4 times)
      return [
        "F",
        "D",
        "F'",
        "D'",
        "F",
        "D",
        "F'",
        "D'",
        "F",
        "D",
        "F'",
        "D'",
        "F",
        "D",
        "F'",
        "D'",
      ];
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
      // Solution: R U R' U R U2 R' (Sune) + U relative to yellow top/red front (visual)
      // Logical state is white top/green front, so remap: R→F, U→D
      // So remap: R U R' U R U2 R' U → F D F' D F D2 F' D
      return ["F", "D", "F'", "D", "F", "D2", "F'", "D"];
    case "yellow-edges-solution-2":
      // Multi-part solution:
      // Part 1: U relative to yellow top/red front (visual) → D (logical, yellow top = bottom)
      // Part 2: R U R' U R U2 R' (Sune) relative to yellow top/green front (visual)
      //   Logical: yellow top/green front → white top/green front, so U→D, R→L
      //   So: R U R' U R U2 R' → L D L' D L D2 L'
      // Part 3: U relative to yellow top/green front (visual) → D (logical, yellow top = bottom)
      // Total: D (part 1) + L D L' D L D2 L' (part 2) + D (part 3) = 9 moves
      return ["D", "L", "D", "L'", "D", "L", "D2", "L'", "D"];
    case "yellow-edges-solution-3":
      // Multi-part solution:
      // Part 1: U2 relative to yellow top/red front (visual) → D2 (logical, yellow top = bottom)
      // Part 2: R U R' U R U2 R' (Sune) relative to yellow top/blue front (visual)
      //   Logical: yellow top/blue front → white top/green front, so U→D, R→R (blue front maps to blue front)
      //   So: R U R' U R U2 R' → R D R' D R D2 R'
      // Part 3: U relative to yellow top/blue front (visual) → D (logical, yellow top = bottom)
      // Total: D2 (part 1) + R D R' D R D2 R' (part 2) + D (part 3) = 9 moves
      return ["D2", "R", "D", "R'", "D", "R", "D2", "R'", "D"];
    case "yellow-edges-solution-4":
      // Multi-part solution:
      // Part 1: R U R' U R U2 R' (Sune) relative to yellow top/red front (visual)
      //   Logical: yellow top/red front → white top/green front, so R→F, U→D
      //   So: R U R' U R U2 R' → F D F' D F D2 F'
      // Part 2: Yaw -90 degrees, then R U R' U R U2 R' (Sune) relative to yellow top/blue front (visual)
      //   Logical: yellow top/blue front → white top/green front, so R→R, U→D
      //   So: R U R' U R U2 R' → R D R' D R D2 R'
      // Part 3: U relative to yellow top/blue front (visual) → D (logical, yellow top = bottom)
      // Total: F D F' D F D2 F' (part 1) + R D R' D R D2 R' (part 2) + D (part 3) = 15 moves
      return [
        "F",
        "D",
        "F'",
        "D",
        "F",
        "D2",
        "F'",
        "R",
        "D",
        "R'",
        "D",
        "R",
        "D2",
        "R'",
        "D",
      ];
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
      // Seven-part solution:
      // Part 1: U relative to yellow top/green front (visual)
      //   When flipped, visual U → logical D, so U → D (white top/green front, flipped)
      // Part 2: R U R' U' relative to yellow top/green front (visual)
      //   When yellow top/green front (visual): green is front, orange is right
      //   In logical (white top/green front): green is front, red is right, orange is left
      //   So visual R (orange) → logical L (orange left), U→D
      //   Therefore: R U R' U' → L D L' D' (logical)
      // Part 3: L' U' L U relative to yellow top/orange front (visual, after yaw at index 5)
      //   When yellow top/orange front (visual): orange is front
      //   In logical (white top/green front): orange is left, so visual L → logical L, U→D
      //   Therefore: L' U' L U → L' D' L D (logical)
      // Part 4: U2 relative to yellow top/orange front (visual, after yaw 210)
      //   When flipped, visual U2 → logical D2 (white top/green front, flipped)
      // Part 5: U relative to yellow top/red front (visual, after yaw 180)
      //   When flipped, visual U → logical D (white top/green front, flipped)
      // Part 6: R U R' U' relative to yellow top/red front (visual, after yaw 180)
      //   When yellow top/red front (visual): red is front
      //   In logical (white top/green front): red is right, so visual R → logical R, U→D
      //   Therefore: R U R' U' → R D R' D' (logical)
      // Part 7: L' U' L U relative to yellow top/green front (visual, after yaw)
      //   When yellow top/green front (visual): green is front
      //   In logical (white top/green front): green is front, so visual L → logical L, U→D
      //   Therefore: L' U' L U → L' D' L D (logical)
      return [
        "D",
        "L",
        "D",
        "L'",
        "D'",
        "L'",
        "D'",
        "L",
        "D",
        "D2",
        "D",
        "R",
        "D",
        "R'",
        "D'",
        "R'",
        "D'",
        "R",
        "D",
      ];
    case "practice-setup-solution-6":
      // Three-part solution:
      // Part 1: R U R' U' relative to yellow top/green front (visual)
      // When flipped, visual R → logical L (left and right swap)
      // Logical: L D L' D' (white top/green front, flipped)
      // Part 2: U relative to yellow top/green front (visual)
      // Logical: D (white top/green front, flipped)
      // Part 3: R U R' U' relative to yellow top/red front (visual)
      // Logical: F D F' D' (white top/green front, red front to green front, flipped)
      return ["L", "D", "L'", "D'", "D", "F", "D", "F'", "D'"];
    case "practice-setup-solution-9":
      // Multi-part solution relative to yellow top/green front (visual):
      // Part 1: U2 (Front Face N/A, then yaw 120)
      // Logical: D2 (white top/green front, flipped)
      // Part 2: Righty Algorithm R U R' U' (Front face Green, after yaw)
      // Logical: After yaw, front face changes, but relative to green: R D R' D' (white top/green front, flipped)
      // Part 3: U (Front Face N/A, then yaw 60)
      // Logical: D (white top/green front, flipped)
      // Part 4: Lefty Algorithm L' U' L U (Front face Green)
      // Logical: After yaw, relative to green: L' D' L D (white top/green front, flipped)
      // Note: The yaw changes affect the visual front face, but the logical moves stay relative to white top/green front
      return ["D2", "R", "D", "R'", "D'", "D", "L'", "D'", "L", "D"];
    case "second-layer-setup-solution":
      // Three-part solution:
      // Part 1: U' relative to yellow top/green front (visual)
      // When flipped, visual U → logical D, so U' → D' (white top/green front, flipped)
      // Part 2: L' U' L U relative to yellow top/green front (visual)
      // When flipped, visual L → logical R (left and right swap), U→D
      // Logical: R' D' R D (white top/green front, flipped)
      // Part 3: R U R' U' relative to yellow top/red front (visual)
      // Logical: F D F' D' (white top/green front, red front to green front, flipped)
      return ["D'", "R'", "D'", "R", "D", "F", "D", "F'", "D'"];
    case "second-layer-setup-solution-2":
      // Three-part solution:
      // Part 1: U relative to yellow top/green front (visual)
      // When flipped, visual U → logical D, so U → D (white top/green front, flipped)
      // Part 2: R U R' U' relative to yellow top/red front (visual)
      // Logical: R→F, U→D → F D F' D' (white top/green front, red front to green front, flipped)
      // Part 3: L' U' L U relative to yellow top/green front (visual)
      // Logical: L→R (when flipped, L and R swap), U→D → R' D' R D (white top/green front, flipped)
      return ["D", "F", "D", "F'", "D'", "R'", "D'", "R", "D"];
    case "second-layer-setup-solution-4":
      // Seven-part solution:
      // Part 1: U relative to yellow top/green front (visual)
      //   When flipped, visual U → logical D, so U → D (white top/green front, flipped)
      // Part 2: R U R' U' relative to yellow top/red front (visual)
      //   Logical: R→F, U→D → F D F' D' (white top/green front, red front to green front, flipped)
      // Part 3: L' U' L U relative to yellow top/green front (visual)
      //   Logical: L→R (when flipped, L and R swap), U→D → R' D' R D (white top/green front, flipped)
      // Part 4: U relative to yellow top/green front (visual)
      //   Logical: U → D (white top/green front, flipped)
      // Part 5: U relative to yellow top/green front (visual)
      //   Logical: U → D (white top/green front, flipped)
      // Part 6: R U R' U' relative to yellow top/red front (visual)
      //   Logical: R→F, U→D → F D F' D' (white top/green front, red front to green front, flipped)
      // Part 7: L' U' L U relative to yellow top/green front (visual)
      //   Logical: L→R (when flipped, L and R swap), U→D → R' D' R D (white top/green front, flipped)
      return [
        "D",
        "F",
        "D",
        "F'",
        "D'",
        "R'",
        "D'",
        "R",
        "D",
        "D",
        "D",
        "F",
        "D",
        "F'",
        "D'",
        "R'",
        "D'",
        "R",
        "D",
      ];
    case "orient-two-corners":
      // Solution relative to white top/green front: R U R' U', R U R' U', R U R' U', R U R' U', D, R U R' U', R U R' U', D'
      return [
        "R",
        "U",
        "R'",
        "U'",
        "R",
        "U",
        "R'",
        "U'",
        "R",
        "U",
        "R'",
        "U'",
        "R",
        "U",
        "R'",
        "U'",
        "D",
        "R",
        "U",
        "R'",
        "U'",
        "R",
        "U",
        "R'",
        "U'",
        "D'",
      ];
    case "orient-three-corners":
      // Solution relative to white top/green front: R U R' U', R U R' U', D, R U R' U', R U R' U', D, R U R' U', R U R' U', D2
      return [
        "R",
        "U",
        "R'",
        "U'",
        "R",
        "U",
        "R'",
        "U'",
        "D",
        "R",
        "U",
        "R'",
        "U'",
        "R",
        "U",
        "R'",
        "U'",
        "D",
        "R",
        "U",
        "R'",
        "U'",
        "R",
        "U",
        "R'",
        "U'",
        "D2",
      ];
    case "orient-four-corners":
      // Solution relative to white top/green front: R U R' U', R U R' U', R U R' U', R U R' U', D, R U R' U', R U R' U', D, R U R' U', R U R' U', D, R U R' U', R U R' U', R U R' U', R U R' U', D
      return [
        "R",
        "U",
        "R'",
        "U'",
        "R",
        "U",
        "R'",
        "U'",
        "R",
        "U",
        "R'",
        "U'",
        "R",
        "U",
        "R'",
        "U'",
        "D",
        "R",
        "U",
        "R'",
        "U'",
        "R",
        "U",
        "R'",
        "U'",
        "D",
        "R",
        "U",
        "R'",
        "U'",
        "R",
        "U",
        "R'",
        "U'",
        "D",
        "R",
        "U",
        "R'",
        "U'",
        "R",
        "U",
        "R'",
        "U'",
        "R",
        "U",
        "R'",
        "U'",
        "R",
        "U",
        "R'",
        "U'",
        "D",
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
      // Show R U R' U' (visual notation, yellow top/red front) in Fix box
      return ["R", "U", "R'", "U'"];
    case "practice-setup-solution-2":
      // Show L' U' L U (visual notation, yellow top/green front) in Fix box
      return ["L'", "U'", "L", "U"];
    case "yellow-cross-line":
      // Show F R U R' U' F' (visual notation, yellow top/green front) in Fix box
      return ["F", "R", "U", "R'", "U'", "F'"];
    case "yellow-edges-solution":
      // Show R U R' U R U2 R' U (visual notation, yellow top/red front) in Fix box
      return ["R", "U", "R'", "U", "R", "U2", "R'", "U"];
    case "yellow-corners-solution":
      // Show U R U' L' U R' U' L (visual notation, yellow top/red front) in Fix box
      return ["U", "R", "U'", "L'", "U", "R'", "U'", "L"];
    case "orient-two-corners":
      // Solution relative to white top/green front: R U R' U', R U R' U', R U R' U', R U R' U', D, R U R' U', R U R' U', D'
      return [
        "R",
        "U",
        "R'",
        "U'",
        "R",
        "U",
        "R'",
        "U'",
        "R",
        "U",
        "R'",
        "U'",
        "R",
        "U",
        "R'",
        "U'",
        "D",
        "R",
        "U",
        "R'",
        "U'",
        "R",
        "U",
        "R'",
        "U'",
        "D'",
      ];
    // Note: practice-setup-solution-3, -4, -5, -6 use MultiPartSequence, so fixSequenceDisplay not needed here
    // yellow-cross-triangle, yellow-corners-solution-2, yellow-corners-solution-3 also use MultiPartSequence
    default:
      return fixSequence;
  }
};
