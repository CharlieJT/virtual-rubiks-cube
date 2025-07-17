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

  static lock(): void {
    this.locked = true;
  }

  static unlock(): void {
    this.locked = false;
  }

  static forceUnlock(): void {
    TWEEN.removeAll();
    this.locked = false;
  }

  static getMoveAxisAndDir(move: CubeMove): [THREE.Vector3, number] {
    const isPrime = move.includes("'");
    const isDouble = move.includes("2");
    const cleanMove = move.replace(/['2]/g, "");
    const baseMove = cleanMove[0].toUpperCase();

    const baseTurns = isDouble ? 2 : 1;

    let axis: THREE.Vector3;
    let baseDirection: number;

    if (baseMove === "U") {
      axis = new THREE.Vector3(0, 1, 0);
      baseDirection = -1;
    } else if (baseMove === "D") {
      axis = new THREE.Vector3(0, 1, 0);
      baseDirection = 1;
    } else if (baseMove === "R") {
      axis = new THREE.Vector3(1, 0, 0);
      baseDirection = -1;
    } else if (baseMove === "L") {
      axis = new THREE.Vector3(1, 0, 0);
      baseDirection = 1;
    } else if (baseMove === "F") {
      axis = new THREE.Vector3(0, 0, 1);
      baseDirection = -1;
    } else if (baseMove === "B") {
      axis = new THREE.Vector3(0, 0, 1);
      baseDirection = 1;
    } else if (baseMove === "M") {
      axis = new THREE.Vector3(1, 0, 0);
      baseDirection = 1;
    } else if (baseMove === "E") {
      axis = new THREE.Vector3(0, 1, 0);
      baseDirection = 1;
    } else if (baseMove === "S") {
      axis = new THREE.Vector3(0, 0, 1);
      baseDirection = -1;
    } else if (baseMove === "X") {
      axis = new THREE.Vector3(1, 0, 0);
      baseDirection = 1;
    } else if (baseMove === "Y") {
      axis = new THREE.Vector3(0, 1, 0);
      baseDirection = 1;
    } else if (baseMove === "Z") {
      axis = new THREE.Vector3(0, 0, 1);
      baseDirection = 1;
    } else {
      axis = new THREE.Vector3(0, 1, 0);
      baseDirection = 1;
    }

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
    const cleanMove = move.replace(/['2]/g, "");
    const isWide =
      cleanMove[0] === cleanMove[0].toLowerCase() && /[a-z]/.test(cleanMove[0]);
    const baseMove = cleanMove[0].toUpperCase();

    if (isWide) {
      if (baseMove === "U") return y === 2 || y === 1;
      if (baseMove === "D") return y === 0 || y === 1;
      if (baseMove === "R") return x === 2 || x === 1;
      if (baseMove === "L") return x === 0 || x === 1;
      if (baseMove === "F") return z === 2 || z === 1;
      if (baseMove === "B") return z === 0 || z === 1;
    } else {
      if (baseMove === "U") return y === 2;
      if (baseMove === "D") return y === 0;
      if (baseMove === "R") return x === 2;
      if (baseMove === "L") return x === 0;
      if (baseMove === "F") return z === 2;
      if (baseMove === "B") return z === 0;

      if (baseMove === "E") return y === 1;
      if (baseMove === "M") return x === 1;
      if (baseMove === "S") return z === 1;

      if (baseMove === "X") return false;
      if (baseMove === "Y") return false;
      if (baseMove === "Z") return false;
    }

    return false;
  }
  static animateWholeCube(
    parentGroup: THREE.Group,
    move: CubeMove,
    onComplete?: () => void
  ): TweenType | null {
    if (this.locked) return null;

    this.lock();

    const [axis, totalRotation] = this.getMoveAxisAndDir(move);

    const normalizedAxis = axis.clone().normalize();
    const startTime = performance.now();
    const duration = 150;
    let animationId: number;
    let currentRotationAmount = 0;

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const targetRotation = totalRotation * progress;
      const deltaRotation = targetRotation - currentRotationAmount;

      if (deltaRotation !== 0) {
        parentGroup.rotateOnAxis(normalizedAxis, deltaRotation);
        currentRotationAmount = targetRotation;
      }

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        this.unlock();
        onComplete && onComplete();
      }
    };

    animationId = requestAnimationFrame(animate);

    return { stop: () => cancelAnimationFrame(animationId) } as any;
  }

  static animate(
    cubies: AnimatedCubie[],
    parentGroup: THREE.Group,
    move: CubeMove,
    onComplete?: () => void
  ): TweenType | null {
    if (this.locked) return null;

    const cleanMove = move.replace(/['2]/g, "");
    const baseMove = cleanMove[0].toUpperCase();
    if (baseMove === "X" || baseMove === "Y" || baseMove === "Z") {
      return this.animateWholeCube(parentGroup, move, onComplete);
    }

    this.lock();

    const affectedCubies = cubies.filter((cubie) =>
      this.isCubieInMove(move, cubie.x, cubie.y, cubie.z)
    );

    if (affectedCubies.length === 0) {
      this.unlock();
      return null;
    }

    const group = new THREE.Group();
    group.name = "AnimationGroup";

    affectedCubies.forEach((cubie) => {
      parentGroup.remove(cubie.mesh);
      group.add(cubie.mesh);
    });

    parentGroup.add(group);

    const [axis, totalRotation] = this.getMoveAxisAndDir(move);

    const normalizedAxis = axis.clone().normalize();

    const startTime = performance.now();
    const duration = 150;
    let animationId: number;
    let currentRotationAmount = 0;

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const targetRotation = totalRotation * progress;
      const deltaRotation = targetRotation - currentRotationAmount;

      if (deltaRotation !== 0) {
        group.rotateOnAxis(normalizedAxis, deltaRotation);
        currentRotationAmount = targetRotation;
      }

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        parentGroup.remove(group);
        affectedCubies.forEach((cubie) => {
          parentGroup.add(cubie.mesh);
        });

        this.unlock();
        onComplete && onComplete();
      }
    };

    animationId = requestAnimationFrame(animate);

    return { stop: () => cancelAnimationFrame(animationId) } as any;
  }

  static update(): void {
    TWEEN.update();
  }

  static rotateAroundWorldAxis(
    object: THREE.Object3D,
    axis: THREE.Vector3,
    radians: number
  ): void {
    const rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
    rotWorldMatrix.multiply(object.matrix);
    object.matrix = rotWorldMatrix;
    object.rotation.setFromRotationMatrix(object.matrix);
  }
}

export type { AnimatedCubie };
