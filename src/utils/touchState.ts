// Simple shared mutable touch state used for cross-component synchronous checks.
// We use a plain object with a numeric `count` so components can read it
// without depending on React state propagation timing.
export const activeTouches = { count: 0 };
