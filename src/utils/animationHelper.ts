import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
import type { CubeMove } from "@/types/cube";

type TweenType = InstanceType<typeof TWEEN.Tween>;

interface AnimatedCubie {
  mesh: THREE.Mesh;
  originalPosition: THREE.Vector3;
  x: number;
  y: number;
  z: number;
}

const AXIS_X = Object.freeze(new THREE.Vector3(1, 0, 0));
const AXIS_Y = Object.freeze(new THREE.Vector3(0, 1, 0));
const AXIS_Z = Object.freeze(new THREE.Vector3(0, 0, 1));

const _rotationCenter = new THREE.Vector3();

const MOVE_CONFIG: Record<string, { axis: THREE.Vector3; dir: number }> = {
  U: { axis: AXIS_Y, dir: -1 },
  D: { axis: AXIS_Y, dir: 1 },
  R: { axis: AXIS_X, dir: -1 },
  L: { axis: AXIS_X, dir: 1 },
  F: { axis: AXIS_Z, dir: -1 },
  B: { axis: AXIS_Z, dir: 1 },
  M: { axis: AXIS_X, dir: 1 },
  E: { axis: AXIS_Y, dir: 1 },
  S: { axis: AXIS_Z, dir: -1 },
  X: { axis: AXIS_X, dir: 1 },
  Y: { axis: AXIS_Y, dir: 1 },
  Z: { axis: AXIS_Z, dir: 1 },
};

export class AnimationHelper {
  private static locked = false;
  private static activeAnimations = 0;

  static isLocked(): boolean {
    return this.locked;
  }
  
  static isAnimating(): boolean {
    return this.activeAnimations > 0 || this.locked;
  }

  static lock(): void {
    this.locked = true;
    this.activeAnimations++;
  }

  static unlock(): void {
    this.locked = false;
    this.activeAnimations = Math.max(0, this.activeAnimations - 1);
  }

  static forceUnlock(): void {
    TWEEN.removeAll();
    this.locked = false;
    this.activeAnimations = 0;
  }

  static getMoveAxisAndDir(move: CubeMove): [THREE.Vector3, number] {
    const isPrime = move.includes("'");
    const isDouble = move.includes("2");
    const cleanMove = move.replace(/['2]/g, "");
    const baseMove = cleanMove[0].toUpperCase();

    const config = MOVE_CONFIG[baseMove] || { axis: AXIS_Y, dir: 1 };
    const baseTurns = isDouble ? 2 : 1;
    const finalDirection = isPrime ? -config.dir : config.dir;
    const totalRotation = (Math.PI / 2) * baseTurns * finalDirection;
    
    return [config.axis, totalRotation];
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
    onComplete?: () => void,
    duration: number = 150
  ): TweenType | null {
    if (this.locked) return null;

    this.lock();

    const [axis, totalRotation] = this.getMoveAxisAndDir(move);
    const startTime = performance.now();
    let animationId: number;
    let currentRotationAmount = 0;

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const targetRotation = totalRotation * progress;
      const deltaRotation = targetRotation - currentRotationAmount;

      if (deltaRotation !== 0) {
        parentGroup.rotateOnAxis(axis, deltaRotation);
        currentRotationAmount = targetRotation;
      }

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        onComplete && onComplete();
        this.unlock();
      }
    };

    animationId = requestAnimationFrame(animate);
    return { stop: () => cancelAnimationFrame(animationId) } as TweenType;
  }

  static animate(
    cubies: AnimatedCubie[],
    parentGroup: THREE.Group,
    move: CubeMove,
    onComplete?: () => void,
    duration: number = 150,
    isFastSequence: boolean = false,
    onMaterialsUpdate?: () => void
  ): TweenType | null {
    if (this.locked) {
      return null;
    }

    const cleanMove = move.replace(/['2]/g, "");
    const baseMove = cleanMove[0].toUpperCase();
    if (baseMove === "X" || baseMove === "Y" || baseMove === "Z") {
      return this.animateWholeCube(parentGroup, move, onComplete, duration);
    }

    this.lock();

    const affectedCubies = cubies.filter((cubie) =>
      this.isCubieInMove(move, cubie.x, cubie.y, cubie.z)
    );

    if (affectedCubies.length === 0) {
      this.unlock();
      return null;
    }

    if (isFastSequence) {
      const originalPositions = new Map<THREE.Mesh, THREE.Vector3>();
      const originalVisibility: boolean[] = [];
      affectedCubies.forEach((cubie, index) => {
        originalPositions.set(cubie.mesh, cubie.mesh.position.clone());
        originalVisibility[index] = cubie.mesh.visible;
      });

      const startTime = performance.now();
      let animationId: number;
      const [axis, totalRotation] = this.getMoveAxisAndDir(move);
      const normalizedAxis = axis.clone().normalize();
      let currentRotationAmount = 0;

      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const targetRotation = totalRotation * progress;
        const deltaRotation = targetRotation - currentRotationAmount;

        if (deltaRotation !== 0) {
          _rotationCenter.set(0, 0, 0);
          const cleanMove2 = move.replace(/['2]/g, "").toUpperCase();
          const baseMove2 = cleanMove2[0];
          
          if (baseMove2 === "U") _rotationCenter.set(0, 1.05, 0);
          else if (baseMove2 === "D") _rotationCenter.set(0, -1.05, 0);
          else if (baseMove2 === "R") _rotationCenter.set(1.05, 0, 0);
          else if (baseMove2 === "L") _rotationCenter.set(-1.05, 0, 0);
          else if (baseMove2 === "F") _rotationCenter.set(0, 0, 1.05);
          else if (baseMove2 === "B") _rotationCenter.set(0, 0, -1.05);
          
          affectedCubies.forEach((cubie) => {
            cubie.mesh.position.sub(_rotationCenter);
            cubie.mesh.position.applyAxisAngle(normalizedAxis, deltaRotation);
            cubie.mesh.position.add(_rotationCenter);
            cubie.mesh.rotateOnAxis(normalizedAxis, deltaRotation);
          });
          currentRotationAmount = targetRotation;
        }

        if (progress < 1) {
          animationId = requestAnimationFrame(animate);
        } else {
          affectedCubies.forEach((cubie) => {
            cubie.mesh.rotation.set(0, 0, 0);
          });
          
          affectedCubies.forEach((cubie) => {
            const pos = cubie.mesh.position;
            cubie.x = Math.round(pos.x / 1.05 + 1);
            cubie.y = Math.round(pos.y / 1.05 + 1);
            cubie.z = Math.round(pos.z / 1.05 + 1);
            cubie.x = Math.max(0, Math.min(2, cubie.x));
            cubie.y = Math.max(0, Math.min(2, cubie.y));
            cubie.z = Math.max(0, Math.min(2, cubie.z));
            cubie.originalPosition.copy(cubie.mesh.position);
          });
          
          onComplete && onComplete();
          
          if (onMaterialsUpdate) {
            onMaterialsUpdate();
          }
          
          affectedCubies.forEach((cubie, index) => {
            cubie.mesh.visible = originalVisibility[index] ?? true;
            cubie.mesh.updateMatrixWorld(true);
          });
          
          this.unlock();
        }
      };

      animationId = requestAnimationFrame(animate);
      return { stop: () => cancelAnimationFrame(animationId) } as TweenType;
    }

    const group = new THREE.Group();
    group.name = "AnimationGroup";

    const originalVisibility: boolean[] = [];
    affectedCubies.forEach((cubie, index) => {
      originalVisibility[index] = cubie.mesh.visible;
      parentGroup.remove(cubie.mesh);
      group.add(cubie.mesh);
    });

    parentGroup.add(group);

    const [axis, totalRotation] = this.getMoveAxisAndDir(move);
    const startTime = performance.now();
    let animationId: number;
    let currentRotationAmount = 0;

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const targetRotation = totalRotation * progress;
      const deltaRotation = targetRotation - currentRotationAmount;

      if (deltaRotation !== 0) {
        group.rotateOnAxis(axis, deltaRotation);
        currentRotationAmount = targetRotation;
      }

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        if (isFastSequence && onMaterialsUpdate) {
        onComplete && onComplete();
          onMaterialsUpdate();
          
          const finalPositions = new Map<THREE.Mesh, THREE.Vector3>();
          affectedCubies.forEach((cubie) => {
            finalPositions.set(cubie.mesh, cubie.originalPosition.clone());
          });
          
        parentGroup.remove(group);

          affectedCubies.forEach((cubie, index) => {
            const finalPos = finalPositions.get(cubie.mesh) || cubie.originalPosition;
            parentGroup.add(cubie.mesh);
            cubie.mesh.position.copy(finalPos);
            cubie.mesh.rotation.set(0, 0, 0);
            cubie.mesh.visible = originalVisibility[index] ?? true;
            cubie.mesh.updateMatrixWorld(true);
          });
          
          this.unlock();
        } else {
          onComplete && onComplete();
          
          affectedCubies.forEach((cubie) => {
            cubie.mesh.visible = false;
          });
          
          parentGroup.remove(group);
          
          affectedCubies.forEach((cubie, index) => {
            parentGroup.add(cubie.mesh);
            cubie.mesh.position.copy(cubie.originalPosition);
            cubie.mesh.rotation.set(0, 0, 0);
            cubie.mesh.visible = originalVisibility[index] ?? true;
            cubie.mesh.updateMatrixWorld(true);
          });

          this.unlock();
        }
      }
    };

    animationId = requestAnimationFrame(animate);

    return { stop: () => cancelAnimationFrame(animationId) } as TweenType;
  }

  static update(): void {
    if (this.activeAnimations > 0) {
    TWEEN.update();
    }
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
