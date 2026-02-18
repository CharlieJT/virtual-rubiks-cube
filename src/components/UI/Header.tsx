import React from "react";

const Header: React.FC = () => (
  <div className="text-center pt-4 pb-2 shrink-0">
    <h1
      className="text-4xl md:text-4xl lg:text-5xl mb-1 text-white flex items-center justify-center gap-3 tracking-tight"
      style={{
        fontFamily: "'Orbitron', sans-serif",
        fontWeight: 600,
        letterSpacing: "-0.03em",
        textShadow: "0 2px 20px rgba(41,121,255,0.15)",
      }}
    >
      <img
        src="/assets/solvz-logo.png"
        alt="Solvz Logo"
        className="inline-block w-9 h-9 lg:w-11 lg:h-11"
        style={{ verticalAlign: "middle" }}
      />
      <p>solvz</p>
    </h1>
    <p className="text-white/40 text-xs font-medium tracking-widest uppercase mt-2.5">
      Drag to rotate &middot; Swipe faces to twist
    </p>
    <div
      className="mx-auto mt-3 h-px w-48 rounded-full"
      style={{
        background:
          "linear-gradient(90deg, transparent, rgba(41,121,255,0.4), rgba(255,145,0,0.4), transparent)",
      }}
    />
  </div>
);

export default Header;
