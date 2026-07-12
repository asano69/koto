// frontend/vite.config.js
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [solid(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 3001,
    allowedHosts: true,
    proxy: {
      // Use 127.0.0.1 explicitly to avoid localhost resolving to ::1 (IPv6)
      // while PocketBase only listens on 127.0.0.1 (IPv4).
      "/api": { target: "http://127.0.0.1:3000", changeOrigin: true },
      "/_": { target: "http://127.0.0.1:3000", changeOrigin: true },
    },
  },
  build: {
    outDir: "../internal/assets/dist",
    emptyOutDir: true,
  },

  test: {
    // Stage 4 is pure-function tests only (no component/DOM tests yet),
    // so a plain node environment is enough — no jsdom needed.
    environment: "node",
    include: ["src/**/*.test.js"],
  },
});
