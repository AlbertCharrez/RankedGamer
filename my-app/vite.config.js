import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  server: {
    proxy: {
      "/api/deadlock": {
        target: "https://api.deadlock-api.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/deadlock/, ""),
      },
    },
  },
});