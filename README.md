# Virtual Rubik's Cube

[Live Demo](https://virtual-rubiks-cube.netlify.app/)

An advanced interactive 3D Rubik's cube built with React, TypeScript, Three.js, and Tailwind CSS. Features sophisticated touch/drag controls, smooth animations, and smart white center logo orientation tracking.

## Features

### 3D Interactive Experience

- **Realistic 3D Rendering**: Fully rendered 3D Rubik's cube with advanced lighting, shadows, and black center sphere
- **Multi-Touch Support**: Drag individual cube faces to perform moves with touch/pointer events
- **Smart Drag Detection**: Face-aware drag system that detects which slice to rotate based on swipe direction
- **Orbit Controls**: Smooth camera controls with rotation, zoom, and pan
- **Two-Finger Spin Mode**: Dedicated two-finger gesture for cube rotation separate from slice moves

### Interactive Tutorial System

- **Comprehensive Learning Path**: Step-by-step tutorials covering the complete beginner's method
- **9 Complete Lessons**: From notation basics to full cube solving
  - Rubik's Cube Introduction
  - Notation & Moves
  - White Cross
  - White Corners
  - Second Layer
  - Yellow Cross
  - Yellow Edges
  - Yellow Corners
  - Orient Yellow Corners
- **Interactive Practice**: Hands-on practice slides with real-time feedback
- **Visual Guidance**: Highlighted target pieces and step-by-step instructions
- **Algorithm Sequences**: Learn and practice solving algorithms with visual aids
- **Progress Tracking**: Navigate through lessons with clear progress indicators
- **Smart Cube Filtering**: Focus on relevant pieces during each lesson step

### Timer & Best Times System

- **Speedcubing Timer**: Authentic seven-segment display timer with MM:SS.ss format
- **Timer Sessions**: Start timed solving sessions with automatic scrambles
- **Best Times Tracking**: Automatically saves and ranks your top 10 fastest solves
- **Personal Best Detection**: Real-time notifications when you achieve new best times
- **Best Times Leaderboard**: View your personal top 10 times (accessible via top-left list icon)
- **LocalStorage Persistence**: Your best times are saved between sessions
- **Celebratory Animations**: Special cube reset animations for solve completion

### Advanced Move System

- **Drag-to-Move**: Click and drag on cube faces to perform intuitive moves
- **Comprehensive Move Buttons**: Complete button panel for all standard moves
- **Smart Move Queuing**: Prevents animation conflicts with proper move sequencing
- **Multi-Touch Prevention**: First finger commits to a move; second finger is ignored until release
- **Timer-Optimized Animations**: Faster 75ms animations during timed solves for better performance

### Animation & Visual Polish

- **Smooth 120ms Animations**: Ultra-responsive move animations with quadratic easing
- **White Center Logo Tracking**: Intelligent orientation system for the white center piece logo
- **Visual Snap Feedback**: Moves snap to 90° increments with visual feedback
- **Rounded Cube Aesthetics**: Custom geometry with rounded corners and realistic borders

### Move Notation Support

- **Face Moves**: F, B, L, R, U, D (Front, Back, Left, Right, Up, Down)
- **Slice Moves**: M, E, S (Middle, Equatorial, Standing)
- **Whole Cube Rotations**: x, y, z (visual cube rotations)
- **Modifiers**: Prime (') and double (2) moves for all types
- **Advanced Slice Handling**: Proper E-slice orientation logic for complex scrambles

## Technology Stack

### Core Framework

- **React 19** with TypeScript for modern UI development
- **Three.js** and **React Three Fiber** for high-performance 3D rendering
- **@react-three/drei** for enhanced 3D utilities and controls

### Cube Logic & Animation

- **cubejs** library for accurate cube state management and algorithms
- **Custom Animation System**: RequestAnimationFrame-based animations with precise timing
- **Advanced Touch Handling**: Multi-touch gesture recognition and pointer tracking

### Styling & Build

- **Tailwind CSS 4.x** for modern, responsive styling
- **Vite** for lightning-fast development and optimized builds
- **TypeScript 5.8** for type safety and enhanced developer experience

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd virtual-rubiks-cube

# Install dependencies
npm install

# Start development server
npm run dev

# Build Tailwind CSS (if needed)
npm run tw:build
```

### Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality
- `npm run tw:build` - Build Tailwind CSS
- `npm run tw:watch` - Watch and rebuild Tailwind CSS

## Usage Guide

#### Undo & Redo

- Use the Undo and Redo buttons in the Control Panel (between Solve and More) to step backward or forward through your move history.
- Undo/Redo works for all manual moves (drag or button).
- If you undo moves and then make a new move, the redo history is cleared.
- Undo/Redo is disabled during timer sessions.

Hi, I’m Charlie Tipton. I built this interactive 3D Virtual Rubik’s Cube to explore smooth animations, multi-touch gestures, and smart cube logic in the browser. Have fun scrambling, solving, and experimenting with the controls!

### Basic Controls

- **Orbit View**: Left-click and drag to rotate camera around cube
- **Zoom**: Mouse wheel or pinch to zoom in/out
- **Pan**: Right-click and drag to pan the view
- **Reset View**: Double-click to reset camera position
- **No-Roll Orbit**: Camera prevents unwanted cube rolling during circular drags (top face stays consistent)

### Cube Interaction

- **Drag Moves**: Click and drag on any cube face to perform moves
  - Horizontal drag: Rotate that layer left/right
  - Vertical drag: Rotate that layer up/down
- **Move Buttons**: Use the comprehensive control panel for precise moves
- **Scramble**: Generate and execute random scrambles with smooth animations
- **Solve**: Generate solution using advanced algorithms
- **No-Roll Orbit**: Camera controls prevent unwanted cube rolling during circular drags

### Learning & Tutorials

- **Access Tutorials**: Click "Learn to Solve" button to access the complete tutorial system
- **Beginner-Friendly**: Start with notation basics and progress through all solving steps
- **Interactive Practice**: Practice each step with guided exercises
- **Visual Feedback**: See highlighted pieces and follow step-by-step instructions
- **Algorithm Practice**: Learn and master solving algorithms through hands-on practice

### Timer & Speedcubing

- **Start Timer Session**: Click the timer button to begin a timed solving session
- **Automatic Scrambling**: Timer sessions include automatic cube scrambling
- **Best Times Tracking**: Your fastest times are automatically saved and ranked
- **Personal Records**: Get notified when you achieve new personal bests
- **View Leaderboard**: Click the list icon (top-left) to view your top 10 times
- **Session Management**: Cancel, reset, or continue timer sessions as needed

### Advanced Features

- **Multi-Touch Gestures**: Two-finger pinch/rotate for camera control
- **Smart Drag Locking**: First touch commits to a move direction
- **Visual Feedback**: Moves snap to 90° with smooth easing
- **White Logo Tracking**: Watch the Tipton's Solver logo maintain proper orientation

## Project Architecture

### Component Structure

```
src/
├── App/
│   ├── AppState.ts          # Composes all state modules
│   ├── CubeState.ts         # Cube state management
│   ├── SessionState.ts      # Timer/session state management
│   └── UIState.ts           # UI modal state management
├── App.css
├── App.tsx                  # Main application component
├── index.css
├── main.tsx                 # Application entry point
├── tw.css
├── vite-env.d.ts
├── assets/
│   └── tiptons-solver.png
├── components/
│   ├── ControlPanel.tsx
│   ├── LessonContent.tsx
│   ├── lessons/             # Lesson renderer components
│   ├── MoveButtonsPanel.tsx
│   ├── MoveOverlay.tsx
│   ├── RubiksCube3D/        # 3D cube rendering components
│   │   ├── CubePiece.tsx
│   │   ├── geometry.ts
│   │   ├── index.tsx
│   │   └── types.ts
│   ├── SevenSegmentDisplay.tsx
│   ├── TimerDisplay.tsx
│   ├── tutorials/           # Comprehensive tutorial system
│   │   ├── components/      # Tutorial UI components
│   │   ├── consts/          # Tutorial configuration
│   │   ├── hooks/           # Tutorial-specific hooks
│   │   ├── slideDefinitions/ # Lesson slide definitions
│   │   └── utils/           # Tutorial utilities
│   └── UI/                  # Reusable UI components
│       ├── modals/          # Modal components
│       │   ├── shared/      # Shared modals
│       │   ├── solution/    # Solution modals
│       │   └── timer/       # Timer modals
│       ├── Backdrop.tsx
│       ├── BestTimesButton.tsx
│       ├── Button.tsx
│       ├── CurvedArrow.tsx
│       ├── Footer.tsx
│       ├── Header.tsx
│       ├── InfoButton.tsx
│       ├── Modal.tsx
│       ├── SpinTrackpad.tsx
│       ├── StatusBadge.tsx
│       └── UndoRedoButtons.tsx
├── config/
│   └── cube/                # Cube configuration and mappings
│       ├── cubieStyleMap.ts
│       ├── positionMoveMapping.ts
│       ├── sameFaceDelta.ts
│       ├── stickerCornerMap.ts
│       ├── viaTransitionDelta.ts
│       └── whiteOrentationMapDeg.ts
├── consts/
│   ├── cubeColours.ts
│   ├── faceColors.ts
│   └── moves.ts
├── hooks/
│   ├── useBestTimes.ts
│   ├── useDprManager.ts
│   ├── useIsTouchDevice.tsx
│   ├── useLogoTexture.tsx
│   ├── usePrecisionMode.ts
│   ├── useRoundedBoxGeometry.ts
│   ├── useRubiksCube3DProps.ts
│   ├── useTimer.ts
│   ├── useTrackpadHandlers.ts
│   ├── useTwoFingerSpin.ts
│   └── useWhiteLogo.ts
├── types/
│   ├── cube.ts
│   ├── cubejs.d.ts
│   ├── CubeInterface.ts    # Cube abstraction interface
│   ├── orbitControls.ts
│   └── window.ts
└── utils/
    ├── animationHelper.ts
    ├── cubejsTo3D.ts
    ├── cubejsWrapper.ts
    ├── touchState.ts
    └── whiteCenterOrientationMap.ts
```

- **Face-Local Coordinates**: Accurate drag detection in 3D space
- **Gesture Recognition**: Distinguishes between moves and camera controls
- **Smooth Snap Animation**: Visual feedback with quadratic easing

#### Smart Animation System

- **RequestAnimationFrame**: Optimized 60fps animations
- **Move Queue Management**: Prevents visual glitches from rapid input
- **Animation Locking**: Thread-safe state management during moves
- **Delta Rotation Tracking**: Precise rotation calculations

#### White Center Orientation

- **Logo Tracking**: Maintains proper orientation of center piece logos
- **E-Slice Intelligence**: Special handling for equatorial slice moves
- **Face Transition Rules**: Complex mapping for orientation preservation
- **Standard Orientation Detection**: Context-aware rotation adjustments

## Performance Optimizations

- **Centralized Animation Loop**: Single `useFrame` hook for all cube pieces (reduced from 27 separate hooks)
- **Mesh Reference Management**: Efficient cubie tracking and updates
- **Material Optimization**: Pre-allocated materials and color management
- **DPR Management**: Dynamic device pixel ratio adjustment for optimal performance
- **Three.js Caching**: Enabled object caching for improved performance
- **Throttled Pointer Events**: Optimized touch handling for mobile devices
- **Geometry Reuse**: Shared geometries and materials across cube pieces
- **Animation Batching**: Grouped updates for smooth 60fps performance
- **Fast Sequence Path**: Optimized animation path for scrambles and solutions
- **Canvas Ready Gating**: Prevents interaction race conditions during initialization

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with proper TypeScript types
4. Test on both desktop and mobile devices
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Maintain TypeScript strict mode compliance
- Follow the existing component architecture
- Test touch interactions on mobile devices
- Ensure smooth 60fps animations
- Document complex 3D math and cube logic

## Future Roadmap

- [ ] **Enhanced Solving**: Implement advanced solving algorithms (CFOP, Roux)
- [x] **Move History**: ✅ Undo/redo functionality with move timeline
- [x] **Timer Integration**: ✅ Speedcubing timer with statistics and best times tracking
- [x] **Algorithm Trainer**: ✅ Interactive tutorial system for learning algorithms
- [ ] **Multiple Cube Sizes**: Support for 2x2, 4x4, 5x5 cubes
- [ ] **Custom Themes**: User-selectable color schemes and cube styles
- [ ] **Competition Mode**: Online competitions and leaderboards
- [ ] **Accessibility**: Enhanced keyboard navigation and screen reader support
- [ ] **Statistics Dashboard**: Detailed solving statistics and trend analysis
- [ ] **Import/Export**: Backup and restore best times data

## License

This project is open source and available under the MIT License.

---

_Built with ❤️ for the cubing community_

```

```

```

```
