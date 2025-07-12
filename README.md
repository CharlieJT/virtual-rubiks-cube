# Virtual Rubik's Cube

An interactive 3D Rubik's cube built with React, TypeScript, Three.js, and Tailwind CSS.

## Features

- **3D Interactive Cube**: Fully rendered 3D Rubik's cube with realistic lighting, shadows, and thick black borders
- **Orbit Controls**: Smooth camera controls with rotation, zoom, and pan (inertia disabled for responsive control)
- **Animated Moves**: Ultra-smooth 150ms animations for all cube moves with proper queuing to prevent jank
- **Smart Scrambling**: Generate random scrambles that visually animate on the cube
- **Manual Move Controls**: Comprehensive button panel for all standard moves
- **Move Notation**: Supports all standard notation including:
  - Face moves: F, B, L, R, U, D
  - Prime moves: F', B', L', R', U', D'
  - Double moves: F2, B2, L2, R2, U2, D2
  - Slice moves: M, M', M2, E, E', E2, S, S', S2
  - Whole cube rotations: x, y, z, x', y', z' (visual only)

## Technology Stack

- **React 18** with TypeScript for the UI framework
- **Three.js** and **React Three Fiber** for 3D rendering and animations
- **@react-three/drei** for additional 3D helpers (OrbitControls)
- **@tweenjs/tween.js** for smooth animation system
- **cubejs** library for cube state management and algorithms
- **Tailwind CSS** for modern styling
- **Vite** for fast development and building

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd virtual-rubiks-cube
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Controls

- **Orbit Controls**: Left-click and drag to rotate the view
- **Zoom**: Mouse wheel to zoom in/out
- **Pan**: Right-click and drag to pan the view
- **Move Buttons**: Use the comprehensive control panel to execute moves

### Cube Interaction

- **Scramble**: Click the "Scramble Cube" button to randomize the cube with animated moves
- **Move Buttons**: Click any move button to execute that move with smooth animation
- **Rapid Input Protection**: Built-in debouncing prevents animation conflicts from rapid button presses

### Move Notation

The cube supports standard Rubik's cube notation:

- **F, B, L, R, U, D**: Face rotations (Front, Back, Left, Right, Up, Down)
- **M, E, S**: Slice moves (Middle, Equatorial, Standing)
- **x, y, z**: Whole cube rotations (visual only, don't change logical state)
- **'**: Prime (counter-clockwise) moves (e.g., F', R', U', M', x')
- **2**: Double moves (e.g., F2, R2, U2, M2, x2)

### Animation System

- **150ms Duration**: All moves animate smoothly in exactly 150 milliseconds
- **Move Queuing**: Moves are properly queued to prevent visual glitches
- **Animation Locking**: Prevents new moves during animation for stability
- **Delta Rotation**: Uses precise rotation tracking for accurate animations

## Development

### Project Structure

```
src/
├── components/
│   ├── RubiksCube3D.tsx      # Main 3D cube component with animation system
│   ├── ControlPanel.tsx      # UI controls for scrambling and solving
│   └── MoveButtonsPanel.tsx  # Comprehensive move button interface
├── types/
│   ├── cube.ts              # TypeScript type definitions
│   └── cubejs.d.ts          # CubeJS library type declarations
├── utils/
│   ├── animationHelper.ts   # Custom animation system with requestAnimationFrame
│   ├── cubeLogic.ts         # Cube state management and basic algorithms
│   ├── cubejsWrapper.ts     # Wrapper for CubeJS library integration
│   └── cubejsTo3D.ts        # Converts CubeJS state to 3D representation
├── App.tsx                  # Main application component
└── main.tsx                 # Application entry point
```

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Technical Highlights

### Animation System
- **Custom RequestAnimationFrame**: Replaced TWEEN.js with custom animation system for better performance
- **Delta Rotation Tracking**: Precise rotation calculations for smooth movements
- **Move Queue Management**: Prevents animation conflicts and ensures sequential execution
- **Animation Locking**: Thread-safe animation state management

### 3D Rendering
- **BoxGeometry with Materials**: Each cubie uses optimized geometry with 6 separate materials
- **Thick Black Borders**: 3D mesh "beams" create realistic cube edge appearance
- **Optimized Lighting**: SpotLight and AmbientLight setup for realistic appearance
- **No Inertia Controls**: Disabled OrbitControls damping for responsive interaction

### Performance Optimizations
- **Debounced Input**: 100ms debouncing prevents rapid button press issues
- **Mesh Reference Management**: Efficient cubie reference tracking and updates
- **State Synchronization**: Cube state updates only after animation completion

## Future Enhancements

- [ ] Implement full Kociemba solving algorithm
- [ ] Add move history and undo functionality
- [ ] Implement timer for solving
- [ ] Add different cube sizes (2x2, 4x4, 5x5)
- [ ] Save/load cube states
- [ ] Drag-to-move functionality on cube faces
- [ ] Custom color schemes
- [ ] Tutorial mode for learning algorithms

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the MIT License.
