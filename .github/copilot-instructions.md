# Copilot Instructions for Solvz (Virtual Rubik's Cube)

This is a React TypeScript project for an interactive virtual Rubik's cube using Three.js and React Three Fiber.

## Tech Stack

- **Build:** Vite
- **Framework:** React 19 with TypeScript (strict)
- **3D Rendering:** Three.js with React Three Fiber (`@react-three/fiber`, `@react-three/drei`)
- **Styling:** Tailwind CSS
- **Cube Solver:** `cubejs` (Kociemba algorithm) with BFS for short solutions
- **Animations:** `@tweenjs/tween.js` and `requestAnimationFrame`

## Project Structure

```
src/
├── App.tsx                          # Root component, state orchestration
├── App/                             # App-level state hooks (AppState, UIState, SessionState)
├── components/
│   ├── RubiksCube3D/                # 3D cube (index.tsx, CubePiece.tsx, geometry.ts, borderMeshBuilder.ts, types.ts)
│   ├── ControlPanel.tsx             # Scramble/Solve/More buttons
│   ├── UI/                          # Shared UI (Button, Header, Footer, modals, icons)
│   ├── lessons/                     # Lesson registry and rendering
│   └── tutorials/                   # Tutorial system (slides, sequences, validation)
├── hooks/                           # Custom hooks (useAnimation, useDragLogic, useTimer, etc.)
├── utils/                           # Utilities (animationHelper, cubejsWrapper, cubejsTo3D)
├── config/cube/                     # Cube config (cubieStyleMap, stickerCornerMap, positionMoveMapping)
├── consts/                          # Constants (cubeColours, faceColors, moves)
├── types/                           # TypeScript types (cube, orbitControls, window)
└── fonts/                           # Custom fonts
```

## Key Components

- **`RubiksCube3D`** -- Main 3D cube. Renders 27 `CubePiece` nodes. Handles slice-move animations, material updates, shake effects. Uses `useFrame` for per-frame logic.
- **`CubePiece`** -- Single cubie with stickers. Wrapped in `React.memo`. Handles pointer events for drag detection.
- **`AnimationHelper`** -- Manages Tween-based move animations and fast-sequence paths.
- **`ControlPanel`** -- Scramble, Solve, Timer, Learn to Solve, Undo/Redo buttons.
- **`useDragLogic`** -- Slice drag detection, face identification, snapping, flick gestures.
- **`useAnimation`** -- Snapping animation, imperative cube handle (spin, reset, celebratory spin).

## Coding Conventions

### TypeScript

- **No `any` types.** Always use proper TypeScript types. Use `unknown` with type guards if the type is truly unknown.
- Use strict type checking. Prefer interfaces for object shapes and type aliases for unions/intersections.
- Import types with `import type` when only used for type annotations.

### Functions and Exports

- **ES6 arrow functions only.** No `function` declarations.
- **Single-export files must use `export default`.** If a file exports one function, hook, or component, it should be the default export.
- Named exports are fine for files exporting multiple items.

### React Patterns

- Use `React.memo` for components that receive stable props to prevent unnecessary re-renders.
- Use `useCallback` for callbacks passed as props to memoized children.
- Use `useMemo` for expensive derived values.
- Store frequently-changing values in `useRef` when callback identity stability matters (e.g. `cubeState` in hover callbacks).
- Prefer ref-forwarding pattern for callbacks in `useMemo` dependency arrays: store the latest function in a ref, pass a stable wrapper that reads the ref.

### Three.js Performance

- **Pre-allocate THREE.js objects** (`Vector3`, `Quaternion`, `Raycaster`, `Color`) at module scope or in refs. Never create `new THREE.Vector3()` inside `useFrame`, `useCallback`, or pointer event handlers.
- Reuse scratch vectors/quaternions for intermediate calculations.
- Use `useFrame` sparingly; early-return when no animation is active.
- Cache geometries and materials; avoid recreating them on re-render.

### Styling

- Use Tailwind CSS classes for styling.
- Only use inline `style` objects for truly dynamic values (e.g. computed positions, conditional opacity).
- Custom CSS goes in `src/index.css`.

### File Organization

- Keep files focused: hooks in `hooks/`, utilities in `utils/`, config in `config/`.
- Split files over ~300 lines into smaller, focused modules.
- Keep 3D/Three.js logic separate from React UI logic.
