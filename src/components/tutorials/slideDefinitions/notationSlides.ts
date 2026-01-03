import type { CubeState } from "@/types/cube";
import { CubeJSWrapper } from "@utils/cubejsWrapper";
import { getCubieColorSet } from "@/utils/tutorialHelpers";

export type Slide = {
  id: string;
  title: string;
  description: string;
  allowFaceMoves: boolean;
  setup?: (cube: CubeJSWrapper) => void;
  filter?: (piece: CubeState) => boolean;
};

export function getNotationSlides(): Slide[] {
  return [
    {
      id: "notation-intro",
      title: "🧩 Rubik's Cube Notation (Including Prime)",
      description:
        "In this short intro, you'll learn the notation used everywhere in tutorials: face letters (U, D, L, R, F, B), clockwise vs. counter-clockwise (prime ′), and double turns (2).\nYou'll try them on the virtual cube as you go.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => cube.reset(),
    },
    {
      id: "notation-faces",
      title: "The Six Faces",
      description:
        "U – Up (top)\nD – Down (bottom)\nL – Left\nR – Right\nF – Front (facing you)\nB – Back (opposite the front)\n\nIn this lesson, assume White is on top (U) and Green is at the front (F).",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => cube.reset(),
    },
    {
      id: "notation-turns",
      title: "Turn Symbols",
      description:
        "Letter alone → 90° clockwise (looking at that face). Example: F\nLetter + prime (′) → 90° counter-clockwise. Example: F′\nLetter + 2 → 180° turn. Example: F2\nTry: F → F′ → F2, and watch each step confirm.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => cube.reset(),
    },
    {
      id: "notation-example",
      title: "Example: R U R′ U′",
      description:
        "Practice this classic four-move pattern. Try: R → U → R′ → U′. Each correct move will tick off.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => cube.reset(),
    },
    {
      id: "notation-example-2",
      title: "Harder: F R U R′ U′ F′",
      description:
        "A slightly longer pattern. Try: F → R → U → R′ → U′ → F′. Keep the same White-on-top, Green-in-front orientation.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => cube.reset(),
    },
    {
      id: "notation-example-3",
      title: "Challenge: R U2 R′ U′",
      description:
        "Mix in a double turn. Try: R → U2 → R′ → U′. Notice how U2 is a 180° turn.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => cube.reset(),
    },
    {
      id: "notation-10-step",
      title: "Ten-step pattern",
      description:
        "Try: F → U → R → U′ → R′ → F′ → R → U → R′ → U′.\nThis sequence isn't just 'first 5 then the reverse'—focus on reading each symbol.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => cube.reset(),
    },
    {
      id: "notation-protip",
      title: "Pro Tip",
      description:
        "Keep the same cube orientation while following moves.\nIf you get turned around, hit Reset and try again.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => cube.reset(),
    },
  ];
}
