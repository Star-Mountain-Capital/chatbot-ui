import path from "path"
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
 const env = loadEnv(mode, process.cwd(), '')
 const nodeEnv = env.VITE_NODE_ENV || 'production'
  return {
    base: "./",
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      'import.meta.env.VITE_NODE_ENV': JSON.stringify(nodeEnv),
    },
  }
})
