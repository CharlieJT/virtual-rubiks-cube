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
      return ["F", "U2", "D", "R'"];
    case "notation-sequences-longer":
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
    case "white-cross-recap":
    case "white-corners-recap":
    case "second-layer-recap":
    case "practice-two-edges":
    case "practice-three-edges":
    case "practice-full-cross":
    case "practice-two-corners":
    case "practice-three-corners":
    case "practice-four-corners":
    case "practice-two-second-edges":
    case "practice-three-second-edges":
    case "practice-four-second-edges":
      return [];
    case "flip-green-white-f2":
      return ["F2"];
    case "misaligned-green-white":
      return ["D'", "F2"];
    case "flip-green-white":
      return ["F", "U'", "R", "U"];
    case "flipped-misoriented-green-white":
      return ["F2", "F", "U'", "R", "U"];
    case "flipped-misoriented-misaligned-green-white":
      return ["D'", "F2", "F", "U'", "R", "U"];
    case "midlayer-green-white-extraction":
      return ["B'", "D'", "B", "D'", "F2"];
    case "corner-white-facing-right":
      return ["F", "D", "F'", "D'"];
    case "corner-white-facing-left":
      return ["R'", "D'", "R", "D"];
    case "corner-white-facing-up":
      return ["F", "D", "F'", "D'", "F", "D", "F'", "D'", "F", "D", "F'", "D'"];
    case "corner-remove-reinsert":
      return ["F", "D", "F'", "D'", "F", "D", "F'", "D'"];
    case "corner-remove-reinsert-alt":
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
      return ["R", "F", "D", "F'", "D'", "R'"];
    case "yellow-cross-triangle":
      return ["R", "F", "D", "F'", "D'", "R'", "R", "F", "D", "F'", "D'", "R'"];
    case "yellow-cross-dot":
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
    case "yellow-edges-algorithm":
      return ["F", "D", "F'", "D", "F", "D2", "F'", "D"];
    case "yellow-edges-one-correct":
      return ["D", "L", "D", "L'", "D", "L", "D2", "L'", "D"];
    case "yellow-edges-zero-correct":
      return ["D2", "R", "D", "R'", "D", "R", "D2", "R'", "D"];
    case "yellow-edges-two-opposite":
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
    case "yellow-corners-one-correct":
      return ["D", "F", "D'", "B'", "D", "F'", "D'", "B"];
    case "yellow-corners-zero-correct":
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
    case "yellow-corners-zero-repeated":
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
    case "edge-remove-reinsert":
      return [
        "D",
        "L",
        "D",
        "L'",
        "D'",
        "F'",
        "D'",
        "F",
        "D",
        "D2",
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
    case "corner-move-to-correct":
      return ["L", "D", "L'", "D'", "D", "F", "D", "F'", "D'"];
    case "corner-insert-two-pieces":
      return ["D2", "L", "D", "L'", "D'", "D", "R'", "D'", "R", "D"];
    case "edge-insert-left":
      return ["D'", "R'", "D'", "R", "D", "F", "D", "F'", "D'"];
    case "edge-insert-right":
      return ["D", "F", "D", "F'", "D'", "R'", "D'", "R", "D"];
    case "edge-flipped-in-position":
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
  fixSequence: string[],
): string[] => {
  if (!slideId) return fixSequence;

  switch (slideId) {
    case "corner-white-facing-right":
      return ["R", "U", "R'", "U'"];
    case "corner-white-facing-left":
      return ["L'", "U'", "L", "U"];
    case "yellow-cross-line":
      return ["F", "R", "U", "R'", "U'", "F'"];
    case "yellow-edges-algorithm":
      return ["R", "U", "R'", "U", "R", "U2", "R'", "U"];
    case "yellow-corners-one-correct":
      return ["U", "R", "U'", "L'", "U", "R'", "U'", "L"];
    case "orient-two-corners":
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
    default:
      return fixSequence;
  }
};
