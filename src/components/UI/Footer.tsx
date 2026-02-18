import React from "react";

const Footer: React.FC = () => (
  <footer className="fixed bottom-0 left-0 right-0 z-40 w-full py-1 bg-black/30 text-white/25 text-center text-[10px] font-medium tracking-wide backdrop-blur-md">
    <span>
      Solvz &copy; {new Date().getFullYear()} &mdash; Built with
      React, Three.js & Tailwind
    </span>
  </footer>
);

export default Footer;
