import React from "react";
import Modal from "@/components/UI/Modal";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={<div className="pb-4">How to use the Virtual Rubik's Cube</div>}
  >
    <div className="space-y-4 text-gray-800 text-base">
      <p className="text-md text-slate-700">
        Hi, I’m Charlie Tipton. A developer who built this interactive 3D
        Virtual Rubik’s Cube (Tipton's Solver) to explore smooth animations,
        multi-touch gestures, and smart cube logic in the browser. Enjoy
        scrambling & solving!
      </p>
      <h4 className="font-bold text-lg">Cube Interaction</h4>
      <ul className="list-disc ml-6">
        <li>Drag Moves: Click and drag on any cube face to perform moves</li>
        <li>Scramble: Generate and execute random scrambles</li>
        <li>Solve: Generate solution using advanced algorithms</li>
        <li>
          Undo/Redo: Step backward or forward through your move history using
          the Undo/Redo buttons in the Control Panel (between Solve and More).
          Multi-step undo/redo and branching are supported.
        </li>
      </ul>
      <h4 className="font-bold text-lg">Timer & Best Times</h4>
      <ul className="list-disc ml-6">
        <li>
          Timer Sessions: Start timed solving sessions with automatic scrambles
        </li>
        <li>
          Best Times Tracking: Your top 10 fastest solves are automatically
          saved
        </li>
        <li>
          Personal Best Detection: Get notified when you achieve a new best time
        </li>
        <li>
          Seven-Segment Display: Authentic speedcubing timer with MM:SS.ss
          format
        </li>
        <li>
          Best Times List: View your personal leaderboard (top-left list icon)
        </li>
      </ul>
      <h4 className="font-bold text-lg">Advanced Features</h4>
      <ul className="list-disc ml-6">
        <li>
          Multi-Touch Gestures: Two-finger pinch/rotate for camera control
        </li>
        <li>Smart Drag Locking: First touch commits to a move direction</li>
        <li>Visual Feedback: Moves snap to 90° with smooth easing</li>
        <li>
          Undo/Redo History: Multi-step undo/redo with branching, just like a
          text editor. Undo/Redo is disabled during timer sessions.
        </li>
        <li>
          White Logo Tracking: Tipton's Solver logo maintains proper orientation
        </li>
        <li>
          Faster Timer Animations: Reduced animation times during timed solves
        </li>
      </ul>
      <h4 className="font-bold text-lg">Move Notation</h4>
      <ul className="list-disc ml-6">
        <li>Face Moves: F, B, L, R, U, D</li>
        <li>Slice Moves: M, E, S</li>
        <li>Modifiers: Prime (') and double (2) moves</li>
      </ul>
    </div>
  </Modal>
);

export default InfoModal;
