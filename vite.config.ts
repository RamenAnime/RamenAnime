import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { nodePolyfills } from "vite-plugin-node-polyfills"

export default defineConfig({
  plugins: [react(), nodePolyfills()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@db": path.resolve(__dirname, "./db"),
      "@contracts": path.resolve(__dirname, "./contracts"),
      "@server": path.resolve(__dirname, "./api"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist/public",
    rollupOptions: {
      external: [
        "@simplewebauthn/server",
        "argon2",
        "crypto",
      ],
    },
  },
  ssr: {
    noExternal: ["@trpc/server"],
    external: ["@simplewebauthn/server", "argon2"],
  },
  optimizeDeps: {
    exclude: ["@simplewebauthn/server", "argon2"],
  },
})
