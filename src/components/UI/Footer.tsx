import React from "react";

const Footer: React.FC = () => (
  <footer className="fixed bottom-0 left-0 right-0 z-40 w-full py-1 bg-gray-900/80 text-gray-400 text-center text-xs backdrop-blur-sm border-t border-white/10">
    <span>
      Tipton's Solver &copy; {new Date().getFullYear()} &mdash; Built with
      React, Three.js, & Tailwind
    </span>
  </footer>
);

export default Footer;
