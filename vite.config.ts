import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
      "@components": "/src/components",
      "@utils": "/src/utils",
      "@types": "/src/types",
      "@assets": "/src/assets",
      "@hooks": "/src/hooks",
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});
