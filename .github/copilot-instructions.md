# Copilot Instructions for Virtual Rubik's Cube

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a React TypeScript project for an interactive virtual Rubik's cube using Three.js and React Three Fiber.

## Project Structure

- Uses Vite as the build tool
- React 18 with TypeScript
- Three.js with React Three Fiber for 3D rendering
- Tailwind CSS for styling
- Component-based architecture

## Key Components

- `RubiksCube3D`: Main 3D cube visualization
- `ControlPanel`: UI controls for scrambling and solving
- `cubeLogic.ts`: Core cube state management and solving algorithms

## Coding Guidelines

- Use TypeScript with strict type checking
- Follow React best practices with hooks
- Use Tailwind CSS classes for styling
- Keep 3D logic in Three.js components
- Maintain separation between UI and 3D logic

## Features to Implement

- Interactive cube rotation and face twisting
- Scramble generation
- Cube solving algorithms (Kociemba or similar)
- Smooth animations for moves
- Support for all standard notation (F, B, L, R, U, D, M moves with prime and 2 modifiers)
