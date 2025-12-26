interface LessonContentProps {
  lessonId: string;
}

const LessonContent = ({ lessonId }: LessonContentProps) => {
  switch (lessonId) {
    case "notation":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Cube Notation
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Before learning to solve the cube, you need to understand the
            notation system used to describe moves. Each face of the cube has a
            letter that represents it:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>F</strong> - Front face
              </div>
              <div>
                <strong>R</strong> - Right face
              </div>
              <div>
                <strong>U</strong> - Up (top) face
              </div>
              <div>
                <strong>L</strong> - Left face
              </div>
              <div>
                <strong>D</strong> - Down (bottom) face
              </div>
              <div>
                <strong>B</strong> - Back face
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-gray-700">
              <strong>Basic moves:</strong> A letter by itself (like F) means
              turn that face 90° clockwise.
            </p>
            <p className="text-gray-700">
              <strong>Prime moves:</strong> A letter with an apostrophe (like
              F') means turn that face 90° counterclockwise.
            </p>
            <p className="text-gray-700">
              <strong>Double moves:</strong> A letter with a 2 (like F2) means
              turn that face 180°.
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
            <p className="text-blue-800 text-sm">
              <strong>Tip:</strong> Practice these moves on the interactive cube
              to get familiar with the notation!
            </p>
          </div>
        </div>
      );

    case "white-cross":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 mb-4">White Cross</h3>
          <p className="text-gray-700 leading-relaxed">
            The first step is to create a white cross on the top face. Notice
            how only the white center and white edge pieces are highlighted -
            these are the only pieces you need to focus on.
          </p>
          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
            <p className="text-yellow-800 text-sm font-medium mb-2">
              Important:
            </p>
            <p className="text-yellow-800 text-sm">
              The side colors of the white edge pieces must match the center
              colors of their respective faces. It's not enough to just have
              white edges on the top!
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-gray-700">
              <strong>Strategy:</strong> This step is intuitive. Look for white
              edge pieces and move them to the top while ensuring the side
              colors align with the center pieces.
            </p>
            <p className="text-gray-700">
              <strong>Practice tip:</strong> Don't worry about disturbing other
              pieces - they're greyed out because they don't matter yet!
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
            <p className="text-green-800 text-sm">
              <strong>Goal:</strong> Four white edge pieces on the top with
              matching side colors.
            </p>
          </div>
        </div>
      );

    case "white-corners":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            White Corners
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Now complete the white face by positioning the white corner pieces.
            The cube now shows your completed white cross plus the white corners
            you need to solve.
          </p>
          <div className="space-y-3">
            <p className="text-gray-700">
              <strong>Method:</strong> Position the white corner under where it
              belongs, then use these algorithms:
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div>
              <p className="font-medium text-gray-800">
                White sticker on the right:
              </p>
              <code className="bg-white px-2 py-1 rounded text-sm">
                R' D' R
              </code>
            </div>
            <div>
              <p className="font-medium text-gray-800">
                White sticker on the front:
              </p>
              <code className="bg-white px-2 py-1 rounded text-sm">F D F'</code>
            </div>
            <div>
              <p className="font-medium text-gray-800">
                White sticker on the bottom:
              </p>
              <code className="bg-white px-2 py-1 rounded text-sm">
                F L D2 L' F'
              </code>
            </div>
          </div>
        </div>
      );

    case "second-layer":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Second Layer</h3>
          <p className="text-gray-700 leading-relaxed">
            With the white face complete, solve the middle layer edges. The cube
            shows your completed white face and highlights the middle layer
            edges you need to position.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div>
              <p className="font-medium text-gray-800">Right algorithm:</p>
              <code className="bg-white px-2 py-1 rounded text-sm">
                U R U' R' U' F' U F
              </code>
            </div>
            <div>
              <p className="font-medium text-gray-800">Left algorithm:</p>
              <code className="bg-white px-2 py-1 rounded text-sm">
                U' L' U L U F U' F'
              </code>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
            <p className="text-blue-800 text-sm">
              <strong>Tip:</strong> Look for edges on the top that belong in the
              middle layer.
            </p>
          </div>
        </div>
      );

    case "yellow-cross":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Yellow Cross</h3>
          <p className="text-gray-700 leading-relaxed">
            Now work on the last layer. The cube shows your completed first two
            layers and highlights the yellow center and edges for the cross.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium text-gray-800">Algorithm:</p>
            <code className="bg-white px-2 py-1 rounded text-sm font-medium">
              F R U R' U' F'
            </code>
          </div>
          <div className="space-y-3">
            <p className="text-gray-700">
              <strong>Patterns:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>
                <strong>Dot:</strong> Apply algorithm 3 times
              </li>
              <li>
                <strong>L-shape:</strong> Apply algorithm 2 times
              </li>
              <li>
                <strong>Line:</strong> Apply algorithm 1 time
              </li>
            </ul>
          </div>
        </div>
      );

    case "yellow-edges":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Yellow Edges</h3>
          <p className="text-gray-700 leading-relaxed">
            Position the yellow edges so their side colors match the center
            pieces. The cube highlights all faces of the yellow edges to help
            you see the alignment.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium text-gray-800">Algorithm:</p>
            <code className="bg-white px-2 py-1 rounded text-sm font-medium">
              R U R' U R U2 R' U
            </code>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
            <p className="text-blue-800 text-sm">
              <strong>Strategy:</strong> Use U moves to position edges, then
              apply the algorithm to swap them.
            </p>
          </div>
        </div>
      );

    case "yellow-corners":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Position Yellow Corners
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Get the yellow corners into their correct positions. Don't worry
            about orientation yet - just focus on getting them to the right
            spots.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium text-gray-800">Algorithm:</p>
            <code className="bg-white px-2 py-1 rounded text-sm font-medium">
              U R U' L' U R' U' L
            </code>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
            <p className="text-yellow-800 text-sm">
              <strong>Method:</strong> Find a corner in the right position,
              place it in back-right, then cycle the others.
            </p>
          </div>
        </div>
      );

    case "orient-yellow-corners":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Orient Yellow Corners
          </h3>
          <p className="text-gray-700 leading-relaxed">
            The final step! All pieces are in position, now orient the corners
            so yellow faces up.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium text-gray-800">Algorithm:</p>
            <code className="bg-white px-2 py-1 rounded text-sm font-medium">
              R' D' R D
            </code>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
            <p className="text-red-800 text-sm font-medium mb-2">⚠️ Warning:</p>
            <p className="text-red-800 text-sm">
              NEVER rotate the entire cube during this step. Only turn the top
              layer (U) to move corners.
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
            <p className="text-green-800 text-sm">
              <strong>🎉 Congratulations!</strong> Once complete, your cube is
              solved!
            </p>
          </div>
        </div>
      );

    default:
      return <div>Lesson content not available.</div>;
  }
};

export default LessonContent;
