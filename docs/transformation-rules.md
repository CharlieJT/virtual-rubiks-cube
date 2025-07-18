# Rubik's Cube Transformation Rules Documentation

This document provides a comprehensive overview of the transformation rules used in the virtual Rubik's cube implementation to ensure correct and intuitive movement behavior.

## Core Principles

1. **Consistency**: The drag behavior must match the transition behavior for each move type
2. **Intuitive Movement**: Corrections are applied to ensure the cube moves in the direction the user expects
3. **Face Specificity**: Different corrections needed based on which face the interaction starts from
4. **Direction Awareness**: Different handling for horizontal vs vertical swipes

## Middle Slice Moves

### E Move (Equatorial Slice)

- **From side faces (left/right)**:
  - INVERT rotation during both drag and transition
  - These faces act as side perspectives on the slice
- **From other faces**:
  - Use natural rotation without inversion

### M Move (Middle Slice)

- **From front/back faces**:
  - Do NOT invert rotation during drag
  - INVERT rotation during transition
  - These faces act as "side faces" for this middle slice
- **From other faces**:
  - Use natural rotation without inversion

### S Move (Standing Slice)

- **From left/right faces**:
  - Do NOT invert rotation during drag
  - INVERT rotation during transition
- **From front/back faces**:
  - INVERT rotation during both drag and transition
- **From top/bottom faces**:
  - INVERT rotation during both drag and transition
- **Note**: S moves have the most complex rules due to the cube's orientation

## Face Moves

### U Move (Upper Face)

- **From all faces with horizontal swipes**:
  - INVERT rotation for intuitive dragging

### D Move (Down Face)

- **Universal rule**:
  - INVERT rotation from all faces and all directions
  - This ensures consistent behavior regardless of interaction point

### F Move (Front Face)

- **Regular F**:
  - INVERT for all directions and faces
- **F' from side faces**:
  - NO inversion (preserve natural direction)

### B Move (Back Face)

- **From all faces with horizontal swipes**:
  - INVERT rotation
- **From top/bottom with vertical swipes**:
  - INVERT rotation

## Implementation Details

### During Drag

The rotation correction logic is implemented in the handleDrag function:

```typescript
if (
  (baseMove === "U" &&
    (lockedDirection === "left" || lockedDirection === "right")) ||
  (baseMove === "B" &&
    (lockedDirection === "left" || lockedDirection === "right")) ||
  (baseMove === "D" &&
    (lockedDirection === "left" || lockedDirection === "right")) ||
  (baseMove === "E" &&
    (lockedDirection === "left" || lockedDirection === "right")) ||
  // For S moves, only invert for top/bottom/front/back, not for side faces
  (baseMove === "S" &&
    !(
      trackingStateRef.current.clickedFace === "left" ||
      trackingStateRef.current.clickedFace === "right"
    )) ||
  // M moves need inversion from front/back
  (baseMove === "M" &&
    (trackingStateRef.current.clickedFace === "front" ||
      trackingStateRef.current.clickedFace === "back")) ||
  // F move special cases
  (baseMove === "F" &&
    !suggestedMove.includes("'") &&
    (lockedDirection === "left" ||
      lockedDirection === "right" ||
      lockedDirection === "up" ||
      lockedDirection === "down")) ||
  (baseMove === "F" &&
    suggestedMove.includes("'") &&
    (lockedDirection === "left" || lockedDirection === "right")) ||
  // D and E moves with vertical swipes
  ((baseMove === "D" || baseMove === "E") &&
    (lockedDirection === "up" || lockedDirection === "down"))
) {
  adjustedRotation = -adjustedRotation;
}
```

### During Transition

Similar inversion logic is applied during the finalization phase in the finalizeDragWithSnapping function:

```typescript
if (
  (baseMove === "U" &&
    (lockedDirection === "left" || lockedDirection === "right")) ||
  (baseMove === "B" &&
    (lockedDirection === "left" || lockedDirection === "right")) ||
  (baseMove === "D" &&
    (lockedDirection === "left" || lockedDirection === "right")) ||
  (baseMove === "E" &&
    (lockedDirection === "left" || lockedDirection === "right")) ||
  // For S moves in finalize, only invert for top/bottom/front/back, not for side faces
  (baseMove === "S" &&
    !(
      trackingStateRef.current.clickedFace === "left" ||
      trackingStateRef.current.clickedFace === "right"
    )) ||
  // F move special cases
  (baseMove === "F" &&
    !suggestedMove.includes("'") &&
    (lockedDirection === "left" ||
      lockedDirection === "right" ||
      lockedDirection === "up" ||
      lockedDirection === "down")) ||
  (baseMove === "F" &&
    suggestedMove.includes("'") &&
    (lockedDirection === "left" || lockedDirection === "right")) ||
  // Add reverse correction for D, E, S moves from top/bottom
  ((baseMove === "D" || baseMove === "E" || baseMove === "S") &&
    (lockedDirection === "up" || lockedDirection === "down"))
) {
  currentRotation = -currentRotation;
}
```

### Additional Face-Specific Logic

Each move type also has additional face-specific handling in the transition phase:

- **S Moves**: Specific handling based on face type
- **E Moves**: Special handling for side faces
- **D Moves**: Universal inversion for consistent behavior
- **B Moves**: Special handling for top/bottom faces

## Explanation of the Rules

The rules may seem complex, but they're designed to provide a natural and intuitive experience:

1. **Perspective Effects**: When interacting from different faces, the perceived "natural direction" changes.

2. **Slice Move Complexity**: Middle slice moves (E, M, S) require different handling because:

   - They rotate around different axes
   - The starting face changes the intuitive movement direction

3. **Consistent Convention**: The rules ensure that regardless of which face you start from:
   - The cube responds to dragging in an expected way
   - Transitions look natural when you release the drag
   - Final moves match the standard Rubik's cube notation

This system ensures that users can interact with the cube intuitively from any angle, while maintaining correct behavior according to standard Rubik's cube movement conventions.
