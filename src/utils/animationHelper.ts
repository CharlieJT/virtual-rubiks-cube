import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
import type { CubeMove } from "../types/cube";

type TweenType = InstanceType<typeof TWEEN.Tween>;

interface AnimatedCubie {
  mesh: THREE.Mesh;
  originalPosition: THREE.Vector3;
  x: number;
  y: number;
  z: number;
}

export class AnimationHelper {
  private static locked = false;

  static isLocked(): boolean {
    return this.locked;
  }

  static getMoveAxisAndDir(move: CubeMove): [THREE.Vector3, number] {
    // Clean the move and check for modifiers
    const isPrime = move.includes("'");
    const isDouble = move.includes("2");
    const cleanMove = move.replace(/['2]/g, "");
    const baseMove = cleanMove[0].toUpperCase();

    const baseTurns = isDouble ? 2 : 1;

    // Determine axis and base direction for each move
    let axis: THREE.Vector3;
    let baseDirection: number;

    if (baseMove === "U") {
      axis = new THREE.Vector3(0, 1, 0);
      baseDirection = -1; // Flipped: was 1, now -1
    } else if (baseMove === "D") {
      axis = new THREE.Vector3(0, 1, 0);
      baseDirection = 1; // Flipped: was -1, now 1
    } else if (baseMove === "R") {
      axis = new THREE.Vector3(1, 0, 0);
      baseDirection = -1; // Flipped: was 1, now -1
    } else if (baseMove === "L") {
      axis = new THREE.Vector3(1, 0, 0);
      baseDirection = 1; // Flipped: was -1, now 1
    } else if (baseMove === "F") {
      axis = new THREE.Vector3(0, 0, 1);
      baseDirection = -1; // Flipped: was 1, now -1
    } else if (baseMove === "B") {
      axis = new THREE.Vector3(0, 0, 1);
      baseDirection = 1; // Flipped: was -1, now 1
    } else if (baseMove === "M") {
      axis = new THREE.Vector3(1, 0, 0);
      baseDirection = 1; // Flipped: was -1, now 1 (M moves like L)
    } else if (baseMove === "E") {
      axis = new THREE.Vector3(0, 1, 0);
      baseDirection = 1; // Flipped: was -1, now 1 (E moves like D)
    } else if (baseMove === "S") {
      axis = new THREE.Vector3(0, 0, 1);
      baseDirection = -1; // Flipped: was 1, now -1 (S moves like F)
    } else if (baseMove === "X") {
      axis = new THREE.Vector3(1, 0, 0);
      baseDirection = -1; // Flipped: whole cube rotation like R
    } else if (baseMove === "Y") {
      axis = new THREE.Vector3(0, 1, 0);
      baseDirection = -1; // Flipped: whole cube rotation like U
    } else if (baseMove === "Z") {
      axis = new THREE.Vector3(0, 0, 1);
      baseDirection = -1; // Flipped: whole cube rotation like F
    } else {
      // Default fallback
      axis = new THREE.Vector3(0, 1, 0);
      baseDirection = 1;
    }

    // Apply prime notation (reverse direction)
    const finalDirection = isPrime ? -baseDirection : baseDirection;

    const totalRotation = (Math.PI / 2) * baseTurns * finalDirection;
    return [axis, totalRotation];
  }

  static isCubieInMove(
    move: CubeMove,
    x: number,
    y: number,
    z: number
  ): boolean {
    // Clean the move notation
    const cleanMove = move.replace(/['2]/g, ""); // Remove prime and 2 modifiers
    const isWide =
      cleanMove[0] === cleanMove[0].toLowerCase() && /[a-z]/.test(cleanMove[0]);
    const baseMove = cleanMove[0].toUpperCase();

    // Wide moves (lowercase first letter like 'r', 'u', 'f', etc.)
    if (isWide) {
      if (baseMove === "U") return y === 2 || y === 1; // Top two layers
      if (baseMove === "D") return y === 0 || y === 1; // Bottom two layers
      if (baseMove === "R") return x === 2 || x === 1; // Right two layers
      if (baseMove === "L") return x === 0 || x === 1; // Left two layers
      if (baseMove === "F") return z === 2 || z === 1; // Front two layers
      if (baseMove === "B") return z === 0 || z === 1; // Back two layers
    } else {
      // Single layer moves (uppercase)
      if (baseMove === "U") return y === 2; // Top layer
      if (baseMove === "D") return y === 0; // Bottom layer
      if (baseMove === "R") return x === 2; // Right layer
      if (baseMove === "L") return x === 0; // Left layer
      if (baseMove === "F") return z === 2; // Front layer
      if (baseMove === "B") return z === 0; // Back layer

      // Slice moves
      if (baseMove === "E") return y === 1; // Equatorial slice
      if (baseMove === "M") return x === 1; // Middle slice
      if (baseMove === "S") return z === 1; // Standing slice

      // Whole cube rotations - not used in regular animation (handled by animateWholeCube)
      if (baseMove === "X") return false; // Handled by animateWholeCube
      if (baseMove === "Y") return false; // Handled by animateWholeCube
      if (baseMove === "Z") return false; // Handled by animateWholeCube
    }

    return false;
  }
  static animateWholeCube(
    parentGroup: THREE.Group,
    move: CubeMove,
    onComplete?: () => void
  ): TweenType | null {
    this.locked = true;

    // Get animation parameters for whole cube rotation
    const [axis, totalRotation] = this.getMoveAxisAndDir(move);

    // Create tween animation for the entire parent group
    let currentRotation = 0;

    // Create a new TWEEN group
    const tweenGroup = new TWEEN.Group();

    const tween = new TWEEN.Tween({ rotation: 0 }, tweenGroup)
      .to({ rotation: totalRotation }, 250) // Simple timing
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate((obj) => {
        const deltaRotation = obj.rotation - currentRotation;
        parentGroup.rotateOnAxis(axis.clone().normalize(), deltaRotation);
        currentRotation = obj.rotation;
      })
      .onComplete(() => {
        // For whole cube rotations, we need to reset the group rotation
        // and let the cube state update handle the logical change
        setTimeout(() => {
          // Reset the parent group rotation
          parentGroup.rotation.set(0, 0, 0);

          this.locked = false;
          onComplete && onComplete();
        }, 16);
      })
      .start();

    // Store the tween group for updating
    (tween as any)._group = tweenGroup;

    return tween;
  }

  static animate(
    cubies: AnimatedCubie[],
    parentGroup: THREE.Group,
    move: CubeMove,
    onComplete?: () => void
  ): TweenType | null {
    if (this.locked) return null;

    // Check if this is a whole cube rotation (x, y, z)
    const cleanMove = move.replace(/['2]/g, "");
    const baseMove = cleanMove[0].toUpperCase();
    if (baseMove === "X" || baseMove === "Y" || baseMove === "Z") {
      // For whole cube rotations, animate the entire parent group
      return this.animateWholeCube(parentGroup, move, onComplete);
    }

    this.locked = true;

    // Find affected cubies
    const affectedCubies = cubies.filter((cubie) =>
      this.isCubieInMove(move, cubie.x, cubie.y, cubie.z)
    );

    if (affectedCubies.length === 0) {
      this.locked = false;
      return null;
    }

    // Create animation group
    const group = new THREE.Group();
    group.name = "AnimationGroup";

    // Move affected cubies to group
    affectedCubies.forEach((cubie) => {
      parentGroup.remove(cubie.mesh);
      group.add(cubie.mesh);
    });

    parentGroup.add(group);

    // Get animation parameters
    const [axis, totalRotation] = this.getMoveAxisAndDir(move);

    // Create tween animation
    let currentRotation = 0;

    // Create a new TWEEN group to ensure proper management
    const tweenGroup = new TWEEN.Group();

    const tween = new TWEEN.Tween({ rotation: 0 }, tweenGroup)
      .to({ rotation: totalRotation }, 250) // 250ms animation
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate((obj) => {
        const deltaRotation = obj.rotation - currentRotation;
        group.rotateOnAxis(axis.clone().normalize(), deltaRotation);
        currentRotation = obj.rotation;
      })
      .onComplete(() => {
        // Add a small delay to prevent color flicking
        setTimeout(() => {
          // Remove group and add cubies back to parent
          parentGroup.remove(group);

          affectedCubies.forEach((cubie) => {
            // Reset the mesh to its original transform and add back to parent
            parentGroup.add(cubie.mesh);
          });

          this.locked = false;
          onComplete && onComplete();
        }, 16); // One frame delay (60fps = 16ms) to let animation settle
      })
      .start();

    // Store the tween group for updating
    (tween as any)._group = tweenGroup;

    return tween;
  }
}

export type { AnimatedCubie };
