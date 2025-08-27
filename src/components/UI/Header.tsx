import React from "react";

const Header: React.FC = () => (
  <div className="text-center py-4 shrink-0">
    <h1
      className="text-2xl md:text-4xl lg:text-5xl font-black mb-1 drop-shadow-2xl text-blue-100 flex items-center justify-center gap-3 tracking-tight"
      style={{
        letterSpacing: "-0.03em",
      }}
    >
      <img
        src="/assets/tiptons-solver-logo.png"
        alt="Tipton's Solver Logo"
        className="inline-block w-10 h-10 lg:w-12 lg:h-12"
        style={{ verticalAlign: "middle" }}
      />
      Tipton's Solver
    </h1>
    <p className="text-white/80 text-xs italic tracking-wide mt-1">
      Drag to rotate • Click faces to twist
    </p>
  </div>
);

export default Header;
