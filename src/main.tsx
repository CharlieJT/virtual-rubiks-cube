import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as THREE from "three";
import "./index.css";
import App from "@/App.tsx";

// Enable THREE.js caching for textures and files to improve performance
THREE.Cache.enabled = true;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
