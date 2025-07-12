# Virtual Rubik's Cube

An interactive 3D Rubik's cube built with React, TypeScript, Three.js, and Tailwind CSS.

## Features

- **3D Interactive Cube**: Fully rendered 3D Rubik's cube with realistic lighting and shadows
- **Drag Controls**: Rotate the entire cube by dragging outside the cube faces
- **Face Twisting**: Click and drag on cube faces to perform twists (U, D, L, R, F, B, M moves)
- **Smart Scrambling**: Generate random scrambles with configurable length
- **Solution Generation**: Automatic algorithm generation for solving the cube
- **Auto Solver**: Watch the cube solve itself step by step
- **Move Notation**: Supports all standard notation including prime moves (') and double moves (2)

## Technology Stack

- **React 18** with TypeScript for the UI framework
- **Three.js** and **React Three Fiber** for 3D rendering
- **@react-three/drei** for additional 3D helpers
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

### Cube Interaction

- **Scramble**: Click the "Scramble Cube" button to randomize the cube
- **Generate Solution**: Click to calculate the optimal solution algorithm
- **Solve**: Click to automatically solve the cube with animation

### Move Notation

The cube supports standard Rubik's cube notation:

- **F, B, L, R, U, D**: Face rotations (Front, Back, Left, Right, Up, Down)
- **M**: Middle slice moves
- **'**: Prime (counter-clockwise) moves (e.g., F', R', U')
- **2**: Double moves (e.g., F2, R2, U2)

## Development

### Project Structure

```
src/
├── components/
│   ├── RubiksCube3D.tsx    # Main 3D cube component
│   └── ControlPanel.tsx    # UI controls
├── types/
│   └── cube.ts            # TypeScript type definitions
├── utils/
│   └── cubeLogic.ts       # Cube state management and algorithms
├── App.tsx                # Main application component
└── main.tsx              # Application entry point
```

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Future Enhancements

- [ ] Implement full Kociemba solving algorithm
- [ ] Add move history and undo functionality
- [ ] Implement timer for solving
- [ ] Add different cube sizes (2x2, 4x4, 5x5)
- [ ] Save/load cube states
- [ ] Multiplayer solving competitions
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
