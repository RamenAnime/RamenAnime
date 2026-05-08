import path from "path"
  import { defineConfig } from "vite"
  import react from "@vitejs/plugin-react"

  export default defineConfig({
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@db": path.resolve(__dirname, "./db"),
        "@contracts": path.resolve(__dirname, "./contracts"),
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
      target: ["es2019", "edge88", "firefox78", "chrome87", "safari13"],
    },
  })
  