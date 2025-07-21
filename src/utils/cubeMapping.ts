// Utility functions and PIECE_MOVE_MAPPING for Rubik's Cube 3D logic
// Extracted from RubiksCube3D_Simple.tsx for clarity and reuse

// Comprehensive move mapping based on piece colors and drag direction (alphabetically sorted) - MUTABLE
export let PIECE_MOVE_MAPPING: Record<string, any> = {
  "green/red/white": {
    red: { up: "F'", down: "F", left: "U", right: "U'" },
    white: { up: "R", down: "R'", left: "F'", right: "F" },
    green: { up: "R", down: "R'", left: "U", right: "U'" },
  },
  "green/orange/white": {
    orange: { up: "F", down: "F'", left: "U", right: "U'" },
    white: { up: "L'", down: "L", left: "F'", right: "F" },
    green: { up: "L'", down: "L", left: "U", right: "U'" },
  },
  "blue/red/white": {
    red: { up: "B", down: "B'", left: "U", right: "U'" },
    white: { up: "R", down: "R'", left: "B", right: "B'" },
    blue: { up: "R'", down: "R", left: "U", right: "U'" },
  },
  "blue/orange/white": {
    orange: { up: "B'", down: "B", left: "U", right: "U'" },
    white: { up: "L'", down: "L", left: "B", right: "B'" },
    blue: { up: "L", down: "L'", left: "U", right: "U'" },
  },
  "green/red/yellow": {
    red: { up: "F'", down: "F", left: "D'", right: "D" },
    yellow: { up: "R", down: "R'", left: "F", right: "F'" },
    green: { up: "R", down: "R'", left: "D'", right: "D" },
  },
  "green/orange/yellow": {
    orange: { up: "F", down: "F'", left: "D'", right: "D" },
    yellow: { up: "L'", down: "L", left: "F", right: "F'" },
    green: { up: "L'", down: "L", left: "D'", right: "D" },
  },
  "blue/red/yellow": {
    red: { up: "B", down: "B'", left: "D'", right: "D" },
    yellow: { up: "R", down: "R'", left: "B'", right: "B" },
    blue: { up: "R'", down: "R", left: "D'", right: "D" },
  },
  "blue/orange/yellow": {
    orange: { up: "B'", down: "B", left: "D'", right: "D" },
    yellow: { up: "L'", down: "L", left: "B'", right: "B" },
    blue: { up: "L'", down: "L", left: "D'", right: "D" },
  },
};

export const getColorName = (hexColor: string): string => {
  const colorMap: { [key: string]: string } = {
    "#ff0000": "red",
    "#2cdd5a": "green",
    "#6279f7": "blue",
    "#ffff00": "yellow",
    "#ffffff": "white",
    "#ff9600": "orange",
  };
  const result = colorMap[hexColor.toLowerCase()];
  if (!result) {
    console.warn(`Unknown color hex: ${hexColor}, using as-is`);
    return hexColor;
  }
  return result;
};

export const getPieceType = (gridPos: [number, number, number]): string => {
  const [x, y, z] = gridPos;
  const numNonZero = [x, y, z].filter((coord) => coord !== 0).length;
  if (numNonZero === 3) return "Corner";
  if (numNonZero === 2) return "Edge";
  if (numNonZero === 1) return "Center";
  return "Core";
};

export const getVisibleColors = (
  colors: any,
  gridPos: [number, number, number]
): string[] => {
  const [x, y, z] = gridPos;
  const visibleColors: string[] = [];
  if (x === 1) visibleColors.push(colors.right);
  if (x === -1) visibleColors.push(colors.left);
  if (y === 1) visibleColors.push(colors.top);
  if (y === -1) visibleColors.push(colors.bottom);
  if (z === 1) visibleColors.push(colors.front);
  if (z === -1) visibleColors.push(colors.back);
  return visibleColors.filter(
    (color) => color !== "#808080" && color !== "#1a1a1a"
  );
};
