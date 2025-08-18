# Dynamic Move Remapping Testing Guide

## Auto-Orient Implementation (Dynamic Coordinate System)

The cube now uses **dynamic move remapping** where the move coordinate system always stays relative to white top and green front, even after slice moves.

### How It Works

1. **Center Tracking**: The system tracks where white and green centers are currently located
2. **Dynamic Remapping**: All face moves (U, R, F, D, L, B) are remapped to be relative to the current white/green orientation
3. **Slice Moves**: M, E, S moves are applied directly and change where the centers are
4. **Coordinate Consistency**: After slice moves, "U" still means "rotate the face with the white center"

### Key Concept

- **"U" always means**: Rotate the face that currently has the white center
- **"F" always means**: Rotate the face that currently has the green center
- **"R" always means**: Rotate the face to the right of green (relative to white being up)
- And so on for all moves

### Test Scenario

1. **Start with cube in default orientation** (white top, green front)
2. **Do an M slice move** - this moves the white center to a new face (e.g., right)
3. **Do a "U" move** - this should now rotate the face where white is currently located (the right face)
4. **Click "White Top, Green Front"** - should perform moves to bring white back to top and green to front

### Expected Behavior

When you do an M slice followed by a U move:

1. ✅ M slice moves white center to right face, green center stays on front
2. ✅ "U" move is remapped to rotate the right face (where white center now is)
3. ✅ The cube behaves as if white is always "up" in the coordinate system
4. ✅ Auto-orient brings the white center back to the physical top face

### Implementation Details

- `findWhiteCenterFace()` and `findGreenCenterFace()` track current center positions
- `remapMoveToWhiteGreenOrientation()` converts logical moves to physical moves
- `calculateFaceMapping()` determines the orientation transformation
- Face moves are dynamically remapped, slice moves are applied directly

### Testing Steps

1. Open the app at http://localhost:5177
2. Start with default orientation (white top, green front)
3. Perform an M slice move (white center moves to right)
4. **Key test**: Do a "U" move - should rotate the right face (where white is)
5. Click "White Top, Green Front" - should orient correctly
6. Try sequences like M U R' U' to see dynamic remapping in action

This approach maintains a **white-top, green-front coordinate system** regardless of slice moves, making the cube always behave logically relative to white and green centers.

## New Auto-Orient Implementation

The auto-orient feature now uses **logical rotation tracking** by directly modifying the cube's 3D rotation when slice moves happen.

### How It Works

1. **Slice Move Detection**: When M, E, or S moves are performed, the system applies equivalent logical rotations to the cube's 3D orientation
2. **Logical Rotation Mapping**:
   - **M slice** → **x-axis rotation** (like R L' combination)
   - **E slice** → **y-axis rotation** (like U' D combination, negated)
   - **S slice** → **z-axis rotation** (like F' B combination, negated)
3. **Auto-Orient Calculation**: Uses the current 3D rotation to calculate the exact opposite rotations needed to return to identity orientation

### Test Scenario

1. **Start with cube in default orientation** (white top, green front)
2. **Do an M slice move** - this will:
   - Move the pieces normally (middle layer rotation)
   - **ALSO** apply a logical x-axis rotation to the cube's 3D orientation
3. **Click "White Top, Green Front"** - should calculate the exact inverse rotation and auto-orient correctly

### Expected Behavior

When you do an M slice:

- The cube pieces rotate normally (visual effect)
- The cube's underlying 3D rotation quaternion is also modified as if you did an x-axis rotation
- Auto-orient now "sees" the cube as rotated and can calculate the correct correction
- The physical center positions are completely ignored

### Implementation Details

- `applySliceMoveLogicalRotation()` modifies the cube's groupRef quaternion for slice moves
- `calculateSimpleAutoOrientMoves()` calculates the inverse rotation using quaternion math
- Auto-orient converts quaternion differences to x/y/z move sequences
- All corrections use whole-cube rotations only

### Testing Steps

1. Open the app at http://localhost:5177
2. Ensure cube starts in correct orientation
3. Perform an M slice move (you should see the middle layer rotate)
4. **Key test**: Click the "White Top, Green Front" button
5. Verify that the cube performs x/y/z rotations to return to correct orientation
6. Test with other slice moves (E, S) and combinations

This approach directly tracks the logical orientation in the cube's 3D rotation, making auto-orient work naturally with slice moves.
