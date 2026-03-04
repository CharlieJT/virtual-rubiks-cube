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
    title={<div className="pb-4">How to use Solvz</div>}
  >
    <div className="space-y-4 text-gray-800 text-base">
      <p className="text-md text-slate-700">
        Solvz is an interactive 3D Rubik's cube with smooth animations,
        multi-touch gestures, and smart cube logic. Use the timer for
        speedcubing, follow the step-by-step tutorials to learn to solve, or
        just scramble and experiment.
      </p>
      <h4 className="font-bold text-lg">Cube & camera</h4>
      <ul className="list-disc ml-6">
        <li>Drag on a face to perform moves; orbit, zoom, and pan with the mouse or touch</li>
        <li>Scramble and Solve from the control panel; Undo/Redo (between Solve and More) for full move history with branching</li>
      </ul>
      <h4 className="font-bold text-lg">Timer & best times</h4>
      <ul className="list-disc ml-6">
        <li>Start a timer session for timed solves with automatic scrambles</li>
        <li>Best times (top 10) are saved; tap the list icon to view. Try Again resets the timer for another attempt</li>
      </ul>
      <h4 className="font-bold text-lg">Learn to solve</h4>
      <ul className="list-disc ml-6">
        <li>Use &quot;Learn to Solve&quot; for step-by-step tutorials from notation through the full beginner method, with practice slides and real-time feedback</li>
      </ul>
      <h4 className="font-bold text-lg">Move notation</h4>
      <ul className="list-disc ml-6">
        <li>F, B, L, R, U, D; slice moves M, E, S; prime (') and double (2)</li>
      </ul>
    </div>
  </Modal>
);

export default InfoModal;
