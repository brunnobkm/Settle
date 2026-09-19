import fs from "node:fs"
import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { viteSingleFile } from "vite-plugin-singlefile"

// PAGINA vem de scripts/tela.mjs: caminho da página a partir da raiz da Settle,
// ex. "settle-capag-color-scale" ou "settle-agentes/rotinas".
// O código da página fica em <PAGINA>/app/App.tsx e o build gera <PAGINA>/index.html.
const SETTLE = path.resolve(import.meta.dirname, "..")
const pagina = process.env.PAGINA ?? "react/modelo-preview"
const appDir = pagina === "react/modelo-preview" ? path.resolve(import.meta.dirname, "modelo") : path.join(SETTLE, pagina, "app")
const configFile = path.join(appDir, "pagina.json")
const config = fs.existsSync(configFile) ? JSON.parse(fs.readFileSync(configFile, "utf8")) : { titulo: "Settle" }

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // viteSingleFile junta JS, CSS e fontes num index.html só, como os protótipos HTML
    viteSingleFile(),
    {
      name: "titulo-da-pagina",
      transformIndexHtml: (html) => html.replace("%TELA_TITULO%", config.titulo),
    },
  ],
  resolve: {
    alias: {
      "@tela": path.join(appDir, "App.tsx"),
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: { fs: { allow: [SETTLE] } },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist", pagina),
    emptyOutDir: true,
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
  },
})
