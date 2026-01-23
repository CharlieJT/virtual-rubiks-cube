import type { CubeState } from "@/types/cube";
import { CubeJSWrapper } from "@utils/cubejsWrapper";

export type Slide = {
  id: string;
  title: string;
  description: string;
  allowFaceMoves: boolean;
  allowSliceMoves?: boolean;
  setup?: (cube: CubeJSWrapper) => void;
  filter?: (piece: CubeState) => boolean;
};

export function getNotationSlides(): Slide[] {
  return [
    {
      id: "notation-intro",
      title: "The cube's language (notation)",
      description:
        "In these lessons, we'll be learning about Rubik's Cube <b><i>Notation & Moves</i></b>. This is a simple language for describing moves on the cube. Think of it like how musical notes are used to describe the notes in a song. We use a series of <b><i>letters</i></b> to describe the moves on the cube. It's important to understand notation before we start learning how to solve the cube.\n\n<b>Each letter:</b>\n• Names a face.\n• Tells you which face to turn.\n• Tells you the direction.\n\nYou don't need to memorize everything now, we'll practice together.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => cube.reset(),
    },
    {
      id: "notation-orientation",
      title: "Cube orientation matters",
      description:
        "Before we start learning the letters, we need to understand how to hold the cube. We perform moves relative to the cube's orientation.\n\n<b><i>In this example, we can see:</i></b>\n• <b><i>White</i></b> center piece on the <b><i>Top</i></b> face\n• <b><i>Green</i></b> center piece on the <b><i>Front</i></b> face\n\nIt's crucial we determine the cube's orientation before we start learning notation.\n\n<b>When reading moves:</b>\n• Hold the cube the same way.\n• The <b><i>Front</i></b> stays the <b><i>Front</i></b>.\n• The <b><i>Top</i></b> stays the <b><i>Top</i></b>.\n\n As we go through the lessons, we'll be performing moves relative to the cube's orientation.\n\nDon't worry if this is confusing at first, this will become clearer as we go through the lessons.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => cube.reset(),
    },
    {
      id: "notation-faces",
      title: "Face Names",
      description:
        "Now we have out cube's orientation set here as <b><i>White Top, Green Front</i></b>, we can start learning the <b><i>Letters</i></b>. Each letter represents a face on the cube and tells you which face to turn.\n\n<b>Those faces are:</b>\n• <b><i>R</i></b> = Right\n• <b><i>L</i></b> = Left\n• <b><i>U</i></b> = Up (top)\n• <b><i>D</i></b> = Down (bottom)\n• <b><i>F</i></b> = Front\n• <b><i>B</i></b> = Back\n\nEach letter tells you which face to turn. For example, <b><i>F</i></b> means turn the <b><i>Front</i></b> face clockwise. In the next slide, we'll put this into practice and learn how to perform a basic turn.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => cube.reset(),
    },
    {
      id: "notation-clockwise-f",
      title: "Basic Turn (F)",
      description:
        "In this slide, we'll learn how to perform a basic turn. We'll start with the <b><i>F</i></b> face. <b><i>F</i></b> means turn the <b><i>Front</i></b> face clockwise like we mentioned briefly before.\n\nIn the top left corner of the screen, you will see a <b><i>Front face</i></b> indicator which will help us keep track of the cube's orientation. In this case, it's been marked as <b><i>Green</i></b> on the <b><i>Front</i></b> face to show that our moves are relative to green being on the front face.\n\nUnderneath that, we have a sequence to follow, your goal is to perform the sequence exactly as its shown here to <b><i>complete</i></b> the sequence.\n\nIn the top right hand corner of the screen, you will see a <b><i>Hint</i></b> button. This will show you a hint of which face to turn and which direction to turn it to complete the sequence. The goal is to use the hint as little as possible and try to perform the sequence on your own.\n\nTry to perform the sequence exactly as it shown here to complete the sequence. If you get stuck, you can use the hint button to help you. If you get the sequence correct, you can either click <b><i>Reset</i></b> to start the sequence over again or click <b><i>Next</i></b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => cube.reset(),
    },
    {
      id: "notation-prime-f",
      title: "Counter-Clockwise Turn (F')",
      description:
        "Here we have the <b><i>F</i></b> face again. This time, we'll be performing a <b><i>Counter-Clockwise</i></b> turn which we call a <b><i>Prime</i></b> turn. A prime ( ' ) means turn the face counter-clockwise. The opposite direction of the clockwise turn.\n\n<b>A prime ( ' ) means:</b>\n• Turn the face counter-clockwise.\n• The opposite direction of the clockwise turn.\n• A move followed by ' indicates counter-clockwise.\n\n<b>Example:</b>\n• <b><i>F'</i></b> = Front face counter-clockwise\n\nSee if you can complete the sequence exactly as it's shown here to complete the sequence. If you get stuck, you can use the <b><i>Hint</i></b> button to help you. If you get the sequence correct, you can either click <b><i>Reset</i></b> to start the sequence over again or click <b><i>Next</i></b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => cube.reset(),
    },
    {
      id: "notation-clockwise-r",
      title: "Another basic turn (R)",
      description:
        "Here we have another basic move example, this time we'll be performing a <b><i>Clockwise</i></b> turn on the <b><i>Right</i></b> face. <b><i>R</i></b> means turn the <b><i>Right</i></b> face clockwise like we mentioned briefly before. We rotate it clockwise based if we're looking directly at the face.\n\nTry to perform the sequence exactly as it's shown here to complete the sequence. If you get stuck, you can use the <b><i>Hint</i></b> button to help you. If you get the sequence correct, you can either click <b><i>Reset</i></b> to start the sequence over again or click <b><i>Next</i></b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => cube.reset(),
    },
    {
      id: "notation-prime-r",
      title: "Another counter-clockwise turn (R')",
      description:
        "Again, like with the <b><i>F</i></b> face, we can apply the prime to the <b><i>R</i></b> face to perform a counter-clockwise turn. <b><i>R'</i></b> means turn the <b><i>Right</i></b> face counter-clockwise.\n\nSee if you can complete the sequence exactly as it's shown here to complete the sequence. If you get stuck, you can use the <b><i>Hint</i></b> button to help you. If you get the sequence correct, you can either click <b><i>Reset</i></b> to start the sequence over again or click <b><i>Next</i></b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => cube.reset(),
    },
    {
      id: "notation-clockwise-l",
      title: "Another basic turn (L)",
      description:
        "Let's move on to the <b><i>L</i></b> face. <b><i>L</i></b> means turn the <b><i>Left</i></b> face clockwise. We rotate it clockwise based if we're looking directly at the face.\n\nSee if you can complete the sequence exactly as it's shown here to complete the sequence. If you get stuck, you can use the <b><i>Hint</i></b> button to help you. If you get the sequence correct, you can either click <b><i>Reset</i></b> to start the sequence over again or click <b><i>Next</i></b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => cube.reset(),
    },
    {
      id: "notation-prime-l",
      title: "Another counter-clockwise turn (L')",
      description:
        "Now we'll apply the prime to the <b><i>L</i></b> face to perform a counter-clockwise turn. <b><i>L'</i></b> means turn the <b><i>Left</i></b> face counter-clockwise.\n\nSee if you can complete the sequence exactly as it's shown here to complete the sequence. If you get stuck, you can use the <b><i>Hint</i></b> button to help you. If you get the sequence correct, you can either click <b><i>Reset</i></b> to start the sequence over again or click <b><i>Next</i></b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => cube.reset(),
    },
    {
      id: "notation-clockwise-u",
      title: "Another basic turn (U)",
      description:
        "Here we have the <b><i>U</i></b> face. <b><i>U</i></b> means <b><i>Up</i></b> (top) which means turn the <b><i>Top</i></b> face clockwise. We rotate it clockwise based if we're looking directly at the face.\n\nSee if you can complete the sequence exactly as it's shown here to complete the sequence. If you get stuck, you can use the <b><i>Hint</i></b> button to help you. If you get the sequence correct, you can either click <b><i>Reset</i></b> to start the sequence over again or click <b><i>Next</i></b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => cube.reset(),
    },
    {
      id: "notation-prime-u",
      title: "Another counter-clockwise turn (U')",
      description:
        "The same applies to the <b><i>U</i></b> face, we can apply the prime to perform a counter-clockwise turn. <b><i>U'</i></b> means turn the <b><i>Top</i></b> face counter-clockwise.\n\nSee if you can complete the sequence exactly as it's shown here to complete the sequence. If you get stuck, you can use the <b><i>Hint</i></b> button to help you. If you get the sequence correct, you can either click <b><i>Reset</i></b> to start the sequence over again or click <b><i>Next</i></b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => cube.reset(),
    },
    {
      id: "notation-clockwise-d",
      title: "Another basic turn (D)",
      description:
        "Another basic turn example, this time we'll be performing a <b><i>Clockwise</i></b> turn on the <b><i>Down</i></b> face. <b><i>D</i></b> means turn the <b><i>Down</i></b> face clockwise.\n\nIn this example, some people can get confused here & think D' is D because looking at it from this angle, it can look like we're doing a clockwise turn, but we're not. We rotate it clockwise based if we're looking directly at the face.\n\nSee if you can complete the sequence exactly as it's shown here to complete the sequence. If you get stuck, you can use the <b><i>Hint</i></b> button to help you. If you get the sequence correct, you can either click <b><i>Reset</i></b> to start the sequence over again or click <b><i>Next</i></b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => cube.reset(),
    },
    {
      id: "notation-prime-d",
      title: "Another counter-clockwise turn (D')",
      description:
        "And the same applies to the <b><i>D</i></b> face, we can apply the prime to perform a counter-clockwise turn. <b><i>D'</i></b> means turn the <b><i>Down</i></b> face counter-clockwise which we do a counter-clockwise turn based on if we're looking directly at the face.\n\nSee if you can complete the sequence exactly as it's shown here to complete the sequence. If you get stuck, you can use the <b><i>Hint</i></b> button to help you. If you get the sequence correct, you can either click <b><i>Reset</i></b> to start the sequence over again or click <b><i>Next</i></b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => cube.reset(),
    },
    {
      id: "notation-clockwise-b",
      title: "Another basic turn (B)",
      description:
        "And finally, we have the <b><i>B</i></b> face. <b><i>B</i></b> means turn the <b><i>Back</i></b> face clockwise. Again, this is another move that people can get confused with because from our view, it looks like we're doing a counter-clockwise turn, but we're not. We rotate it clockwise based if we're looking directly at the face.\n\nSee if you can complete the sequence exactly as it's shown here to complete the sequence. If you get stuck, you can use the <b><i>Hint</i></b> button to help you. If you get the sequence correct, you can either click <b><i>Reset</i></b> to start the sequence over again or click <b><i>Next</i></b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => cube.reset(),
    },
    {
      id: "notation-prime-b",
      title: "Another counter-clockwise turn (B')",
      description:
        "And again, we can apply the prime to the <b><i>B</i></b> face to perform a counter-clockwise turn. <b><i>B'</i></b> means turn the <b><i>Back</i></b> face counter-clockwise which we do a counter-clockwise turn based on if we're looking directly at the face.\n\nSee if you can complete the sequence exactly as it's shown here to complete the sequence. If you get stuck, you can use the <b><i>Hint</i></b> button to help you. If you get the sequence correct, you can either click <b><i>Reset</i></b> to start the sequence over again or click <b><i>Next</i></b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => cube.reset(),
    },
    {
      id: "notation-double",
      title: "Turning a face twice (F2)",
      description:
        "Here we have a <b><i>Double</i></b> turn example. A <b><i>Double</i></b> turn is when we turn a face twice. This is represented by the number <b><i>2</i></b> after the letter. For example, <b><i>F2</i></b> means turn the <b><i>Front</i></b> face twice clockwise.\n\nWe can perform this either <b><i>clockwise</i></b> or <b><i>counter-clockwise</i></b>, the direction does not matter for double turns as they have the same outcome. You can do this as either <b><i>one double move</i></b> or <b><i>two single moves</i></b>.\n\nSee if you can complete the sequence exactly as it's shown here to complete the sequence. If you get stuck, you can use the <b><i>Hint</i></b> button to help you. If you get the sequence correct, you can either click <b><i>Reset</i></b> to start the sequence over again or click <b><i>Next</i></b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => cube.reset(),
    },
    {
      id: "notation-double-l",
      title: "Another double turn (L2)",
      description:
        "Here we have another <b><i>Double</i></b> turn example. Like before, a <b><i>Double</i></b> turn is when we turn a face twice. This is represented by the number <b><i>2</i></b> after the letter. For example, <b><i>L2</i></b> means turn the <b><i>Left</i></b> face twice clockwise.\n\nWe can perform this either <b><i>clockwise</i></b> or <b><i>counter-clockwise</i></b>, the direction does not matter for double turns as they have the same outcome. You can do this as either <b><i>one double move</i></b> or <b><i>two single moves</i></b>.\n\nSee if you can complete the sequence exactly as it's shown here to complete the sequence. If you get stuck, you can use the <b><i>Hint</i></b> button to help you. If you get the sequence correct, you can either click <b><i>Reset</i></b> to start the sequence over again or click <b><i>Next</i></b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => cube.reset(),
    },
    {
      id: "notation-double-d",
      title: "Another double turn (D2)",
      description:
        "And the final <b><i>Double</i></b> turn example. Like the other double turns, we can perform this either <b><i>clockwise</i></b> or <b><i>counter-clockwise</i></b>, the direction does not matter for double turns as they have the same outcome. You can do this as either <b><i>one double move</i></b> or <b><i>two single moves</i></b>.\n\nSee if you can complete the sequence exactly as it's shown here to complete the sequence. If you get stuck, you can use the <b><i>Hint</i></b> button to help you. If you get the sequence correct, you can either click <b><i>Reset</i></b> to start the sequence over again or click <b><i>Next</i></b> to move on to the next slide.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => cube.reset(),
    },
    {
      id: "notation-sequences",
      title: "Showing our first sequence",
      description:
        "We're now going to see our first <b><i>Sequence</i></b>. This sequence is a small sequence that we can see in the top left of the screen & our goal is to perform the correct moves from left to right to solve the cube here. Here we have a <b><i>4 move sequence, </i></b> <b><i>F U2 D R'</i></b>. \n\n<b>Which means:</b>\n• <b><i>F</i></b> - Front face clockwise.\n• <b><i>U2</i></b> - Up face twice.\n• <b><i>D</i></b> - Down face clockwise.\n• <b><i>R'</i></b> - Right face counter-clockwise.\n\nFor each move we get correct, it will mark that move <b><i>green</i></b> to indicate it's been done correctly. If we make a mistake at all, it will reset the sequence and we'll need to start over so be careful.\n\nTry & do this without using the hint but it's there you need it. Let's see how they get on & remember to use the <b><i>Hint</i></b> button if you get stuck.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        // Apply R U2 D' F' to scramble the cube
        cube.applyMoves(["R", "U2", "D'", "F'"]);
      },
    },
    {
      id: "notation-sequences-longer",
      title: "A longer sequence",
      description:
        "Now let's try a slightly longer sequence. Just like before, we can see this sequence in the top left of the screen & our goal is to perform the correct moves from left to right to fix the cube. This time we have a <b><i>7 move sequence, </i></b> <b><i>D' R2 B U' F' D2 L.</i></b> \n\n<b>Which means:</b>\n• <b><i>D'</i></b> - Down face counter-clockwise.\n• <b><i>R2</i></b> - Right face twice.\n• <b><i>B</i></b> - Back face clockwise.\n• <b><i>U'</i></b> - Up face counter-clockwise.\n• <b><i>F'</i></b> - Front face counter-clockwise.\n• <b><i>D2</i></b> - Down face twice.\n• <b><i>L</i></b> - Left face clockwise.\n\nRemember to take your time to think about each move and remember that each move is based on looking directly at the face.\n\nTry & do this without using the hint but it's there you need it. Let's see how you get on & remember to use the <b><i>Hint</i></b> button if you get stuck.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => {
        cube.reset();
        // Apply L' D2 F U B' R2 D to scramble the cube
        cube.applyMoves(["L'", "D2", "F", "U", "B'", "R2", "D"]);
      },
    },
    {
      id: "notation-reminder",
      title: "Mistakes Are Normal",
      description:
        "Don't worry if you make mistakes, it's all part of the learning process. You can always <b><i>Reset</i></b> the cube & try again. Remember to use the <b><i>Hint</i></b> button if you get stuck.\n\nThe key here is to <b><i>practice, practice, practice</i></b>. The more you practice, the better you'll get at solving the cube. Don't worry about getting it wrong, just keep trying until you get it right, eventually it will get easier the more you practice.\n\nIf you still don't find you're comfortable with the moves, you can always go back to the previous slides to practice the individual moves and sequences.\n\nIf you're feeling confident, then it's time to start learning how to solve the cube with our first of the 7 steps, the <b><i>White Cross</i></b>. Click <b><i>Finish</i></b> to move on to this lesson.",
      allowFaceMoves: true,
      setup: (cube: CubeJSWrapper) => cube.reset(),
    },
  ];
}
