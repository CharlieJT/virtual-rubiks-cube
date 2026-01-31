import type { LessonConfig } from "../lessonRegistry";

export const BEGINNER_LESSONS: Record<string, LessonConfig> = {
  "rubiks-cube-introduction": {
    id: "rubiks-cube-introduction",
    title: "Rubik's Cube Introduction",
    description: "A basic introduction to the cube and how it works",
    level: "beginner",
    icon: "/assets/complete-cube-white-top-image.png",
  },
  "notation": {
    id: "notation",
    title: "Notation & Moves",
    description: "Learn how to read and follow moves",
    level: "beginner",
    icon: "/assets/notation-image.png",
  },
  "white-cross": {
    id: "white-cross",
    title: "White Cross",
    description: "Form a white cross on the bottom face",
    level: "beginner",
    icon: "/assets/white-cross-image.png",
  },
  "white-corners": {
    id: "white-corners",
    title: "White Corners",
    description: "Complete the white face by placing corner pieces",
    level: "beginner",
    icon: "/assets/white-corners-image.png",
  },
  "second-layer": {
    id: "second-layer",
    title: "Second Layer",
    description: "Solve the middle layer edge pieces",
    level: "beginner",
    icon: "/assets/second-layer-image.png",
  },
  "yellow-cross": {
    id: "yellow-cross",
    title: "Yellow Cross",
    description: "Form a yellow cross on the top face",
    level: "beginner",
    icon: "/assets/yellow-cross-image.png",
  },
  "yellow-edges": {
    id: "yellow-edges",
    title: "Yellow Edges",
    description: "Position the yellow cross edges correctly",
    level: "beginner",
    icon: "/assets/yellow-edges-image.png",
  },
  "yellow-corners": {
    id: "yellow-corners",
    title: "Yellow Corners",
    description: "Position the yellow corner pieces",
    level: "beginner",
    icon: "/assets/yellow-corners-image.png",
  },
  "orient-yellow-corners": {
    id: "orient-yellow-corners",
    title: "Orient Yellow Corners",
    description: "Complete the cube by orienting yellow corners",
    level: "beginner",
    icon: "/assets/complete-cube-yellow-top-image.png",
  },
};
