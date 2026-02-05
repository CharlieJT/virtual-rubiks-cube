import type { CubeState } from "@/types/cube";
import type { CubeInterface } from "@/types/CubeInterface";

export type Slide = {
  id: string;
  title: string;
  description: string;
  allowFaceMoves: boolean;
  allowSliceMoves?: boolean;
  setup?: (cube: CubeInterface) => void;
  filter?: (piece: CubeState) => boolean;
  showConfetti?: boolean;
};

const getNotationSlides = (): Slide[] => [
    {
      id: "notation-intro",
      title: "The cube's language (notation)",
      description:
        "In these lessons, we'll be learning about Rubik's Cube <b>Notation and Moves</b>. This is a simple language for describing moves on the cube. Think of it like how musical notes are used to describe the notes in a song. We use a series of <b>letters</b> to describe the moves on the cube. It's important to understand notation before we start learning how to solve the cube.\n\n<b>Each letter:</b>\n• Names a face\n• Tells you which face to turn\n• Tells you the direction\n\nYou don't need to memorize everything now—we'll practice together.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => cube.reset(),
    },
    {
      id: "notation-orientation",
      title: "Cube orientation matters",
      description:
        "Before we start learning the letters, we need to understand how to hold the cube. We perform moves relative to the cube's orientation.\n\n<b>In this example, we can see:</b>\n• <b>White</b> center piece on the <b>Top</b> face\n• <b>Green</b> center piece on the <b>Front</b> face\n\nIt's crucial we determine the cube's orientation before we start learning notation.\n\n<b>When reading moves:</b>\n• Hold the cube the same way\n• The <b>Front</b> stays the <b>Front</b>\n• The <b>Top</b> stays the <b>Top</b>\n\nAs we go through the lessons, we'll be performing moves relative to the cube's orientation.\n\nDon't worry if this is confusing at first—this will become clearer as we go through the lessons.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => cube.reset(),
    },
    {
      id: "notation-faces",
      title: "Face Names",
      description:
        "Now we have our cube's orientation set here as <b>White Top, Green Front</b>, we can start learning the <b>Letters</b>. Each letter represents a face on the cube and tells you which face to turn.\n\n<b>Those faces are:</b>\n• <b>R</b> = Right\n• <b>L</b> = Left\n• <b>U</b> = Up (top)\n• <b>D</b> = Down (bottom)\n• <b>F</b> = Front\n• <b>B</b> = Back\n\nEach letter tells you which face to turn. For example, <b>F</b> means turn the <b>Front</b> face clockwise. In the next slide, we'll put this into practice and learn how to perform a basic turn.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => cube.reset(),
    },
    {
      id: "notation-clockwise-f",
      title: "Basic Turn (F)",
      description:
        "In this slide, we'll learn how to perform a basic turn. We'll start with the <b>F</b> face. <b>F</b> means turn the <b>Front</b> face clockwise, as we mentioned briefly before.\n\nIn the top left corner of the screen, you will see a <b>Front face</b> indicator which will help us keep track of the cube's orientation. In this case, it's been marked as <b>Green</b> on the <b>Front</b> face to show that our moves are relative to green being on the front face.\n\nUnderneath that, we have a sequence to follow. Your goal is to perform the sequence exactly as it's shown here to <b>complete</b> the sequence.\n\nIn the top right corner of the screen, you will see a <b>Hint</b> button. This will show you a hint of which face to turn and which direction to turn it to complete the sequence. The goal is to use the hint as little as possible and try to perform the sequence on your own.\n\nTry to perform the sequence exactly as it's shown here to complete the sequence. If you get stuck, you can use the hint button to help you. If you get the sequence correct, you can either click <b>Reset</b> to start the sequence over again or click <b>Next</b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => cube.reset(),
    },
    {
      id: "notation-prime-f",
      title: "Counter-Clockwise Turn (F')",
      description:
        "Here we have the <b>F</b> face again. This time, we'll be performing a <b>Counter-Clockwise</b> turn which we call a <b>Prime</b> turn. A prime (') means turn the face counter-clockwise—the opposite direction of the clockwise turn.\n\n<b>A prime (') means:</b>\n• Turn the face counter-clockwise\n• The opposite direction of the clockwise turn\n• A move followed by ' indicates counter-clockwise\n\n<b>Example:</b>\n• <b>F'</b> = Front face counter-clockwise\n\nSee if you can complete the sequence exactly as it's shown here to complete the sequence. If you get stuck, you can use the <b>Hint</b> button to help you. If you get the sequence correct, you can either click <b>Reset</b> to start the sequence over again or click <b>Next</b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => cube.reset(),
    },
    {
      id: "notation-clockwise-r",
      title: "Another basic turn (R)",
      description:
        "Here we have another basic move example. This time we'll be performing a <b>Clockwise</b> turn on the <b>Right</b> face. <b>R</b> means turn the <b>Right</b> face clockwise, as we mentioned briefly before. We rotate it clockwise based on if we're looking directly at the face.\n\nTry to perform the sequence exactly as it's shown here to complete the sequence. If you get stuck, you can use the <b>Hint</b> button to help you. If you get the sequence correct, you can either click <b>Reset</b> to start the sequence over again or click <b>Next</b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => cube.reset(),
    },
    {
      id: "notation-prime-r",
      title: "Another counter-clockwise turn (R')",
      description:
        "Again, like with the <b>F</b> face, we can apply the prime to the <b>R</b> face to perform a counter-clockwise turn. <b>R'</b> means turn the <b>Right</b> face counter-clockwise.\n\nSee if you can complete the sequence exactly as it's shown here to complete the sequence. If you get stuck, you can use the <b>Hint</b> button to help you. If you get the sequence correct, you can either click <b>Reset</b> to start the sequence over again or click <b>Next</b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => cube.reset(),
    },
    {
      id: "notation-clockwise-l",
      title: "Another basic turn (L)",
      description:
        "Let's move on to the <b>L</b> face. <b>L</b> means turn the <b>Left</b> face clockwise. We rotate it clockwise based on if we're looking directly at the face.\n\nSee if you can complete the sequence exactly as it's shown here to complete the sequence. If you get stuck, you can use the <b>Hint</b> button to help you. If you get the sequence correct, you can either click <b>Reset</b> to start the sequence over again or click <b>Next</b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => cube.reset(),
    },
    {
      id: "notation-prime-l",
      title: "Another counter-clockwise turn (L')",
      description:
        "Now we'll apply the prime to the <b>L</b> face to perform a counter-clockwise turn. <b>L'</b> means turn the <b>Left</b> face counter-clockwise.\n\nSee if you can complete the sequence exactly as it's shown here to complete the sequence. If you get stuck, you can use the <b>Hint</b> button to help you. If you get the sequence correct, you can either click <b>Reset</b> to start the sequence over again or click <b>Next</b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => cube.reset(),
    },
    {
      id: "notation-clockwise-u",
      title: "Another basic turn (U)",
      description:
        "Here we have the <b>U</b> face. <b>U</b> means <b>Up</b> (top), which means turn the <b>Top</b> face clockwise. We rotate it clockwise based on if we're looking directly at the face.\n\nSee if you can complete the sequence exactly as it's shown here to complete the sequence. If you get stuck, you can use the <b>Hint</b> button to help you. If you get the sequence correct, you can either click <b>Reset</b> to start the sequence over again or click <b>Next</b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => cube.reset(),
    },
    {
      id: "notation-prime-u",
      title: "Another counter-clockwise turn (U')",
      description:
        "The same applies to the <b>U</b> face—we can apply the prime to perform a counter-clockwise turn. <b>U'</b> means turn the <b>Top</b> face counter-clockwise.\n\nSee if you can complete the sequence exactly as it's shown here to complete the sequence. If you get stuck, you can use the <b>Hint</b> button to help you. If you get the sequence correct, you can either click <b>Reset</b> to start the sequence over again or click <b>Next</b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => cube.reset(),
    },
    {
      id: "notation-clockwise-d",
      title: "Another basic turn (D)",
      description:
        "Another basic turn example. This time we'll be performing a <b>Clockwise</b> turn on the <b>Down</b> face. <b>D</b> means turn the <b>Down</b> face clockwise.\n\nIn this example, some people can get confused here and think D' is D because looking at it from this angle, it can look like we're doing a clockwise turn, but we're not. We rotate it clockwise based on if we're looking directly at the face.\n\nSee if you can complete the sequence exactly as it's shown here to complete the sequence. If you get stuck, you can use the <b>Hint</b> button to help you. If you get the sequence correct, you can either click <b>Reset</b> to start the sequence over again or click <b>Next</b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => cube.reset(),
    },
    {
      id: "notation-prime-d",
      title: "Another counter-clockwise turn (D')",
      description:
        "And the same applies to the <b>D</b> face—we can apply the prime to perform a counter-clockwise turn. <b>D'</b> means turn the <b>Down</b> face counter-clockwise, which we do based on if we're looking directly at the face.\n\nSee if you can complete the sequence exactly as it's shown here to complete the sequence. If you get stuck, you can use the <b>Hint</b> button to help you. If you get the sequence correct, you can either click <b>Reset</b> to start the sequence over again or click <b>Next</b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => cube.reset(),
    },
    {
      id: "notation-clockwise-b",
      title: "Another basic turn (B)",
      description:
        "And finally, we have the <b>B</b> face. <b>B</b> means turn the <b>Back</b> face clockwise. Again, this is another move that people can get confused with because from our view, it looks like we're doing a counter-clockwise turn, but we're not. We rotate it clockwise based on if we're looking directly at the face.\n\nSee if you can complete the sequence exactly as it's shown here to complete the sequence. If you get stuck, you can use the <b>Hint</b> button to help you. If you get the sequence correct, you can either click <b>Reset</b> to start the sequence over again or click <b>Next</b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => cube.reset(),
    },
    {
      id: "notation-prime-b",
      title: "Another counter-clockwise turn (B')",
      description:
        "And again, we can apply the prime to the <b>B</b> face to perform a counter-clockwise turn. <b>B'</b> means turn the <b>Back</b> face counter-clockwise, which we do based on if we're looking directly at the face.\n\nSee if you can complete the sequence exactly as it's shown here to complete the sequence. If you get stuck, you can use the <b>Hint</b> button to help you. If you get the sequence correct, you can either click <b>Reset</b> to start the sequence over again or click <b>Next</b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => cube.reset(),
    },
    {
      id: "notation-double",
      title: "Turning a face twice (F2)",
      description:
        "Here we have a <b>Double</b> turn example. A <b>Double</b> turn is when we turn a face twice. This is represented by the number <b>2</b> after the letter. For example, <b>F2</b> means turn the <b>Front</b> face twice clockwise.\n\nWe can perform this either <b>clockwise</b> or <b>counter-clockwise</b>—the direction does not matter for double turns as they have the same outcome. You can do this as either <b>one double move</b> or <b>two single moves</b>.\n\nSee if you can complete the sequence exactly as it's shown here to complete the sequence. If you get stuck, you can use the <b>Hint</b> button to help you. If you get the sequence correct, you can either click <b>Reset</b> to start the sequence over again or click <b>Next</b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => cube.reset(),
    },
    {
      id: "notation-double-l",
      title: "Another double turn (L2)",
      description:
        "Here we have another <b>Double</b> turn example. Like before, a <b>Double</b> turn is when we turn a face twice. This is represented by the number <b>2</b> after the letter. For example, <b>L2</b> means turn the <b>Left</b> face twice clockwise.\n\nWe can perform this either <b>clockwise</b> or <b>counter-clockwise</b>—the direction does not matter for double turns as they have the same outcome. You can do this as either <b>one double move</b> or <b>two single moves</b>.\n\nSee if you can complete the sequence exactly as it's shown here to complete the sequence. If you get stuck, you can use the <b>Hint</b> button to help you. If you get the sequence correct, you can either click <b>Reset</b> to start the sequence over again or click <b>Next</b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => cube.reset(),
    },
    {
      id: "notation-double-d",
      title: "Another double turn (D2)",
      description:
        "And the final <b>Double</b> turn example. Like the other double turns, we can perform this either <b>clockwise</b> or <b>counter-clockwise</b>—the direction does not matter for double turns as they have the same outcome. You can do this as either <b>one double move</b> or <b>two single moves</b>.\n\nSee if you can complete the sequence exactly as it's shown here to complete the sequence. If you get stuck, you can use the <b>Hint</b> button to help you. If you get the sequence correct, you can either click <b>Reset</b> to start the sequence over again or click <b>Next</b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => cube.reset(),
    },
    {
      id: "notation-sequences",
      title: "Showing our first sequence",
      description:
        "We're now going to see our first <b>Sequence</b>. This sequence is a small sequence that we can see in the top left of the screen, and our goal is to perform the correct moves from left to right to solve the cube here. Here we have a <b>4 move sequence</b>: <i>F U2 D R'</i>.\n\n<b>Which means:</b>\n• <b>F</b> — Front face clockwise\n• <b>U2</b> — Up face twice\n• <b>D</b> — Down face clockwise\n• <b>R'</b> — Right face counter-clockwise\n\nFor each move we get correct, it will mark that move <b>green</b> to indicate it's been done correctly. If we make a mistake at all, it will reset the sequence and we'll need to start over, so be careful.\n\nTry to do this without using the hint, but it's there if you need it. Let's see how you get on and remember to use the <b>Hint</b> button if you get stuck.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => {
        cube.reset();
        // Apply R U2 D' F' to scramble the cube
        cube.applyMoves(["R", "U2", "D'", "F'"]);
      },
    },
    {
      id: "notation-sequences-longer",
      title: "A longer sequence",
      description:
        "Now let's try a slightly longer sequence. Just like before, we can see this sequence in the top left of the screen, and our goal is to perform the correct moves from left to right to fix the cube. This time we have a <b>7 move sequence</b>: <i>D' R2 B U' F' D2 L</i>.\n\n<b>Which means:</b>\n• <b>D'</b> — Down face counter-clockwise\n• <b>R2</b> — Right face twice\n• <b>B</b> — Back face clockwise\n• <b>U'</b> — Up face counter-clockwise\n• <b>F'</b> — Front face counter-clockwise\n• <b>D2</b> — Down face twice\n• <b>L</b> — Left face clockwise\n\nRemember to take your time to think about each move and remember that each move is based on looking directly at the face.\n\nTry to do this without using the hint, but it's there if you need it. Let's see how you get on and remember to use the <b>Hint</b> button if you get stuck.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => {
        cube.reset();
        // Apply L' D2 F U B' R2 D to scramble the cube
        cube.applyMoves(["L'", "D2", "F", "U", "B'", "R2", "D"]);
      },
    },
    {
      id: "notation-reminder",
      title: "Mistakes Are Normal",
      description:
        "Don't worry if you make mistakes—it's all part of the learning process. You can always <b>Reset</b> the cube and try again. Remember to use the <b>Hint</b> button if you get stuck.\n\nThe key here is to <b>practice, practice, practice</b>. The more you practice, the better you'll get at solving the cube. Don't worry about getting it wrong—just keep trying until you get it right. Eventually it will get easier the more you practice.\n\nIf you still don't find you're comfortable with the moves, you can always go back to the previous slides to practice the individual moves and sequences.\n\nIf you're feeling confident, then it's time to start learning how to solve the cube with our first of the 7 steps: the <b>White Cross</b>. Click <b>Finish</b> to move on to this lesson.",
      allowFaceMoves: true,
      setup: (cube: CubeInterface) => cube.reset(),
    },
  ];

export { getNotationSlides };
