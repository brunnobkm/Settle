import fs from "node:fs"
import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { viteSingleFile } from "vite-plugin-singlefile"

// A tela vem de TELA (definida por scripts/tela.mjs). Cada tela é telas/<nome>/App.tsx.
const tela = process.env.TELA ?? "_exemplo"
const telaDir = path.resolve(__dirname, "telas", tela)
const config = JSON.parse(fs.readFileSync(path.join(telaDir, "tela.json"), "utf8"))

export default defineConfig({
  // viteSingleFile junta JS, CSS e fontes num index.html só, igual aos protótipos HTML
  plugins: [
    react(),
    tailwindcss(),
    viteSingleFile(),
    {
      name: "titulo-da-tela",
      transformIndexHtml: (html) => html.replace("%TELA_TITULO%", config.titulo),
    },
  ],
  resolve: {
    alias: {
      "@tela": path.join(telaDir, "App.tsx"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist", tela),
    emptyOutDir: true,
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
  },
})
