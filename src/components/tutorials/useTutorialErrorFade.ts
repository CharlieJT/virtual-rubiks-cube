import { useCallback } from "react";
import type { MutableRefObject } from "react";
import { flushSync } from "react-dom";
import { Vector3 } from "three";
import type { CubeMove, CubeState } from "@/types/cube";
import { CubeJSWrapper } from "@utils/cubejsWrapper";
import cubejsTo3D from "@utils/cubejsTo3D";
import type { OrbitControlsInstance } from "@/types/orbitControls";
import type { RubiksCube3DHandle } from "@components/RubiksCube3D/types";
import type { Slide } from "@components/tutorials/slideDefinitions";
import {
  createTutorialCubeState,
  getCubieColorSet,
  getSlideCameraConfig,
  getTutorialCubeStateForSlide,
} from "@components/tutorials/utils/tutorialHelpers";
import CUBE_COLORS from "@/consts/cubeColours";
import { makeCentersGrey, makeSideCentersGrey } from "@/utils/makeCentersGrey";
import {
  isSliceMove,
  getSliceRotationMove,
  getSliceLayerChecker,
} from "@components/tutorials/utils/sliceMoveHelpers";
import resetYawRefsForSlide from "@components/tutorials/utils/yawResetHelpers";
import { runColorFadeAnimation } from "@components/tutorials/utils/runColorFadeAnimation";
import type { UseSlideSpecificStateReturn } from "@components/tutorials/hooks/useSlideSpecificState";

interface UseTutorialErrorFadeParams {
  lessonId: string;
  activeSlide: Slide | undefined;
  slides: Slide[];
  currentSlide: number;
  cubeRef: React.RefObject<CubeJSWrapper>;
  orbitControlsRef: React.RefObject<OrbitControlsInstance | null>;
  cubeViewRef: React.RefObject<RubiksCube3DHandle | null>;
  isTransitioningRef: React.RefObject<boolean>;
  /** Slide 16: true when side centres are shown in full colour (for reset fade-out). */
  slide16FadeFromFullColorRef: MutableRefObject<boolean>;
  slideSpecificState: UseSlideSpecificStateReturn;
  setCube3D: (cube: CubeState[][][]) => void;
  setPreviousTutorialCube3D: (cube: CubeState[][][] | null) => void;
  setBaselineTutorialCube3D: (cube: CubeState[][][] | null) => void;
  setStickerGreyMap: (map: Map<string, boolean>) => void;
  setColorFadeProgress: (progress: number) => void;
  setIsResettingOrbit: (value: boolean) => void;
  setInputDisabled: (value: boolean) => void;
  setOrbitControlsEnabled: (value: boolean) => void;
  disableOrbitTemporarily: () => void;
  clearControlsInternal: () => void;
  orbitPrevRef: React.RefObject<Record<string, unknown> | null>;
}

const useTutorialErrorFade = ({
  lessonId,
  activeSlide,
  slides,
  currentSlide,
  cubeRef,
  orbitControlsRef,
  cubeViewRef,
  isTransitioningRef,
  slide16FadeFromFullColorRef,
  slideSpecificState,
  setCube3D,
  setPreviousTutorialCube3D,
  setBaselineTutorialCube3D,
  setStickerGreyMap,
  setColorFadeProgress,
  setIsResettingOrbit,
  setInputDisabled,
  setOrbitControlsEnabled,
  disableOrbitTemporarily,
  clearControlsInternal,
  orbitPrevRef,
}: UseTutorialErrorFadeParams) => {
  const showErrorFade = useCallback(
    (
      wrongMove: CubeMove | null = null,
      /** When set, used instead of slide16FadeFromFullColorRef (needed because reset runs flushSync before fade). */
      slide16FadeSideCentersFromColorOverride?: boolean,
    ) => {
      const wrongMoveIsSlice = wrongMove ? isSliceMove(wrongMove) : false;

      resetYawRefsForSlide(slides[currentSlide]?.id, slideSpecificState);

      if (wrongMove) {
        cubeRef.current.move(wrongMove);
        flushSync(() => {
          setCube3D(cubejsTo3D(cubeRef.current.getCube()));
        });
      }

      if (wrongMoveIsSlice && wrongMove) {
        const xRotationToRemove = getSliceRotationMove(wrongMove);

        if (xRotationToRemove) {
          if (xRotationToRemove === "x") cubeRef.current.move("x'");
          else if (xRotationToRemove === "x'") cubeRef.current.move("x");
          else if (xRotationToRemove === "x2") cubeRef.current.move("x2");
          else if (xRotationToRemove === "y") cubeRef.current.move("y'");
          else if (xRotationToRemove === "y'") cubeRef.current.move("y");
          else if (xRotationToRemove === "y2") cubeRef.current.move("y2");
          else if (xRotationToRemove === "z") cubeRef.current.move("z'");
          else if (xRotationToRemove === "z'") cubeRef.current.move("z");
          else if (xRotationToRemove === "z2") cubeRef.current.move("z2");

          flushSync(() => {
            setCube3D(cubejsTo3D(cubeRef.current.getCube()));
          });
        }
      }

      const currentCubeStateWithWrongMove = cubejsTo3D(
        cubeRef.current.getCube(),
      );
      const currentCubeStateForComparison = currentCubeStateWithWrongMove;

      const base = createTutorialCubeState(
        lessonId,
        currentCubeStateWithWrongMove,
      );
      const grey = "#808080";

      let filtered = base;
      if (activeSlide?.filter) {
        filtered = base.map((layer) =>
          layer.map((row) =>
            row.map((piece) => {
              const visible = activeSlide.filter!(piece);
              if (visible) {
                return piece;
              }
              return {
                ...piece,
                colors: {
                  front: grey,
                  back: grey,
                  left: grey,
                  right: grey,
                  top: grey,
                  bottom: grey,
                },
              };
            }),
          ),
        );
      }

      if (lessonId === "yellow-cross") {
        filtered = filtered.map((layer) =>
          layer.map((row) =>
            row.map((piece) => {
              const set = getCubieColorSet(piece);
              if (set.size === 2 && set.has(CUBE_COLORS.YELLOW)) {
                const newColors = { ...piece.colors };
                const faceKeys: Array<keyof typeof piece.colors> = [
                  "front",
                  "back",
                  "left",
                  "right",
                  "top",
                  "bottom",
                ];
                for (const face of faceKeys) {
                  const color = piece.colors[face];
                  if (
                    color &&
                    color !== CUBE_COLORS.YELLOW &&
                    color !== grey &&
                    color !== CUBE_COLORS.BLACK
                  ) {
                    newColors[face] = grey;
                  }
                }
                return { ...piece, colors: newColors };
              }
              return piece;
            }),
          ),
        );
      }

      let finalFiltered =
        lessonId === "rubiks-cube-introduction" &&
        (activeSlide?.id === "edge-pieces" ||
          activeSlide?.id === "corner-pieces")
          ? makeCentersGrey(filtered)
          : filtered;

      if (
        lessonId === "intermediate-white-cross" &&
        activeSlide?.id === "bogr-insert-align-red-green"
      ) {
        const slide16UseFullColorSideCenters =
          slide16FadeSideCentersFromColorOverride !== undefined
            ? slide16FadeSideCentersFromColorOverride
            : slide16FadeFromFullColorRef.current;
        finalFiltered = slide16UseFullColorSideCenters
          ? filtered
          : makeSideCentersGrey(filtered);
      }

      setPreviousTutorialCube3D(finalFiltered);

      const slide = slides[currentSlide];
      const tempCubeRef = new CubeJSWrapper();
      tempCubeRef.reset();
      if (slide?.setup) {
        slide.setup(tempCubeRef);
      }
      const baselineCubeState = cubejsTo3D(tempCubeRef.getCube());
      const finalBaselineFiltered = getTutorialCubeStateForSlide(
        lessonId,
        activeSlide,
        baselineCubeState,
      );

      const greyMap = new Map<string, boolean>();

      let isInSliceLayer:
        | ((x: number, y: number, z: number) => boolean)
        | null = null;

      if (wrongMoveIsSlice && wrongMove) {
        isInSliceLayer = getSliceLayerChecker(wrongMove);
      }

      const finalBaselineFilteredForSlice = finalBaselineFiltered;
      const finalPreviousFilteredForSlice = finalFiltered;

      setPreviousTutorialCube3D(finalPreviousFilteredForSlice);
      setBaselineTutorialCube3D(finalBaselineFilteredForSlice);

      let comparisonFiltered = finalFiltered;
      if (wrongMoveIsSlice) {
        const comparisonBase = createTutorialCubeState(
          lessonId,
          currentCubeStateForComparison,
        );
        let comparisonFilteredTemp = comparisonBase;
        if (activeSlide?.filter) {
          const grey = "#808080";
          comparisonFilteredTemp = comparisonBase.map((layer) =>
            layer.map((row) =>
              row.map((piece) => {
                const visible = activeSlide.filter!(piece);
                if (visible) {
                  return piece;
                }
                return {
                  ...piece,
                  colors: {
                    front: grey,
                    back: grey,
                    left: grey,
                    right: grey,
                    top: grey,
                    bottom: grey,
                  },
                };
              }),
            ),
          );
        }
        if (lessonId === "yellow-cross") {
          comparisonFilteredTemp = comparisonFilteredTemp.map((layer) =>
            layer.map((row) =>
              row.map((piece) => {
                const set = getCubieColorSet(piece);
                if (set.size === 2 && set.has(CUBE_COLORS.YELLOW)) {
                  const newColors = { ...piece.colors };
                  const faceKeys: Array<keyof typeof piece.colors> = [
                    "front",
                    "back",
                    "left",
                    "right",
                    "top",
                    "bottom",
                  ];
                  for (const face of faceKeys) {
                    const color = piece.colors[face];
                    if (
                      color &&
                      color !== CUBE_COLORS.YELLOW &&
                      color !== "#808080" &&
                      color !== CUBE_COLORS.BLACK
                    ) {
                      newColors[face] = "#808080";
                    }
                  }
                  return { ...piece, colors: newColors };
                }
                return piece;
              }),
            ),
          );
        }
        comparisonFiltered =
          lessonId === "rubiks-cube-introduction" &&
          (activeSlide?.id === "edge-pieces" ||
            activeSlide?.id === "corner-pieces")
            ? makeCentersGrey(comparisonFilteredTemp)
            : comparisonFilteredTemp;
      }

      let sliceLayerDiffCount = 0;
      let otherLayerDiffCount = 0;

      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
          for (let z = 0; z < 3; z++) {
            const previousPiece = comparisonFiltered[x]?.[y]?.[z];
            const baselinePiece = finalBaselineFiltered[x]?.[y]?.[z];
            if (previousPiece && baselinePiece) {
              const inSlice =
                wrongMoveIsSlice && isInSliceLayer
                  ? isInSliceLayer(x, y, z)
                  : false;
              const faceKeys: Array<keyof typeof previousPiece.colors> = [
                "front",
                "back",
                "left",
                "right",
                "top",
                "bottom",
              ];
              for (const face of faceKeys) {
                const previousColor =
                  previousPiece.colors[face] || CUBE_COLORS.BLACK;
                const baselineColor =
                  baselinePiece.colors[face] || CUBE_COLORS.BLACK;
                const key = `${x},${y},${z},${face}`;
                const differs =
                  previousColor !== CUBE_COLORS.BLACK &&
                  previousColor !== baselineColor;
                if (differs) {
                  greyMap.set(key, true);
                  if (inSlice) {
                    sliceLayerDiffCount++;
                  } else {
                    otherLayerDiffCount++;
                  }
                }
              }
            }
          }
        }
      }

      setStickerGreyMap(greyMap);
      setColorFadeProgress(0);

      disableOrbitTemporarily();
      if (orbitControlsRef.current) {
        const c = orbitControlsRef.current;
        if (!c.target) c.target = new Vector3(0, 0, 0);
        else c.target.set(0, 0, 0);
        if (c.update) c.update();
        clearControlsInternal();
        const slide = slides[currentSlide];
        c.__resetOpts = getSlideCameraConfig(slide?.id, lessonId);
      }
      setIsResettingOrbit(true);
      cubeViewRef.current?.resetToInitialPosition(
        orbitControlsRef as unknown as React.RefObject<OrbitControlsInstance>,
        cubeRef,
        () => {
          setIsResettingOrbit(false);
          const controls = orbitControlsRef.current;
          setInputDisabled(false);
          if (controls) {
            controls.enabled = true;
            controls.noRotate = false;
            if (typeof controls.staticMoving === "boolean")
              controls.staticMoving = false;
            if (typeof controls.dynamicDampingFactor === "number")
              controls.dynamicDampingFactor = 0.35;
            if (typeof controls.rotateSpeed === "number")
              controls.rotateSpeed = 1.2;
            setOrbitControlsEnabled(true);
            if (typeof controls.update === "function") controls.update();
          }
          orbitPrevRef.current = null;
          isTransitioningRef.current = false;
        },
      );

      runColorFadeAnimation(setColorFadeProgress, () => {
        const slide = slides[currentSlide];
        cubeRef.current.reset();
        if (slide?.setup) {
          cubeRef.current.reset();
          slide.setup(cubeRef.current);
        }

        setPreviousTutorialCube3D(null);
        setBaselineTutorialCube3D(null);
        setStickerGreyMap(new Map());
        setColorFadeProgress(0);
        setCube3D(cubejsTo3D(cubeRef.current.getCube()));
      });
    },
    [
      lessonId,
      activeSlide,
      slides,
      currentSlide,
      cubeRef,
      orbitControlsRef,
      cubeViewRef,
      isTransitioningRef,
      slide16FadeFromFullColorRef,
      slideSpecificState,
      setCube3D,
      setPreviousTutorialCube3D,
      setBaselineTutorialCube3D,
      setStickerGreyMap,
      setColorFadeProgress,
      setIsResettingOrbit,
      setInputDisabled,
      setOrbitControlsEnabled,
      disableOrbitTemporarily,
      clearControlsInternal,
      orbitPrevRef,
    ],
  );

  return { showErrorFade };
};

export default useTutorialErrorFade;
