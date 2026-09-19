#!/usr/bin/env node
// Páginas React da Settle, feitas com os componentes do design system (@settle).
//
// Cada página tem o código em <pasta>/app/App.tsx e o build gera <pasta>/index.html,
// o arquivo que o GitHub Pages publica. <pasta> é o projeto (settle-configuracoes)
// ou uma subpágina dele (settle-agentes/rotinas).
//
//   npm run nova -- settle-meu-projeto "Título"    cria settle-meu-projeto/app/
//   npm run dev -- settle-meu-projeto              roda com recarregamento automático
//   npm run build -- settle-meu-projeto            gera settle-meu-projeto/index.html
//   npm run build -- --todas                       gera todas as páginas React
//   npm run telas                                  lista as páginas React
//   npm run ds                                     atualiza componentes e tema do design system

import { execFileSync, spawn } from "node:child_process"
import { existsSync } from "node:fs"
import { copyFile, mkdir, readdir, symlink, writeFile } from "node:fs/promises"
import path from "node:path"

const ROOT = path.resolve(import.meta.dirname, "..")
const SETTLE = path.resolve(ROOT, "..")
const [cmd, alvo, ...resto] = process.argv.slice(2)

// As páginas ficam fora de react/, então TypeScript e Vite procuram as bibliotecas
// a partir da raiz da Settle. Este atalho (fora do git) aponta para react/node_modules.
if (!existsSync(path.join(SETTLE, "node_modules"))) {
  await symlink(path.join("react", "node_modules"), path.join(SETTLE, "node_modules"))
}

async function paginas(dir = SETTLE, rel = "") {
  const out = []
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (!e.isDirectory() || e.name.startsWith(".") || ["node_modules", "react", "archive", "work", "assets"].includes(e.name)) continue
    const sub = path.join(rel, e.name)
    if (e.name === "app" && existsSync(path.join(dir, "app", "App.tsx"))) out.push(rel)
    else if (rel === "" ? e.name.startsWith("settle-") : true) out.push(...(await paginas(path.join(dir, e.name), sub)))
  }
  return out
}

const exigir = (p) => {
  if (!p || !existsSync(path.join(SETTLE, p, "app", "App.tsx"))) {
    console.error(`"${p ?? ""}" não tem app/App.tsx. Veja as páginas React com: npm run telas`)
    process.exit(1)
  }
}

async function build(p) {
  execFileSync("npx", ["vite", "build", "--logLevel", "warn"], { cwd: ROOT, stdio: "inherit", env: { ...process.env, PAGINA: p } })
  await copyFile(path.join(ROOT, "dist", p, "index.html"), path.join(SETTLE, p, "index.html"))
  console.log(`✓ ${p}/index.html`)
}

if (cmd === "nova") {
  if (!alvo || !/^settle-[a-z0-9-]+(\/[a-z0-9-]+)?$/.test(alvo)) {
    console.error('Uso: npm run nova -- settle-<nome> "Título"   (ou settle-<nome>/<subpagina>)')
    process.exit(1)
  }
  const app = path.join(SETTLE, alvo, "app")
  if (existsSync(app)) {
    console.error(`${alvo}/app já existe`)
    process.exit(1)
  }
  await mkdir(app, { recursive: true })
  await writeFile(path.join(app, "pagina.json"), JSON.stringify({ titulo: `Settle · ${resto[0] ?? alvo}` }, null, 2) + "\n")
  await copyFile(path.join(ROOT, "modelo", "App.tsx"), path.join(app, "App.tsx"))
  console.log(`Criada ${alvo}/app/. Rode: npm run dev -- ${alvo}\nLembre de adicionar o projeto no index.html da raiz.`)
} else if (cmd === "dev") {
  exigir(alvo)
  const child = spawn("npx", ["vite", ...resto], { cwd: ROOT, stdio: "inherit", env: { ...process.env, PAGINA: alvo } })
  child.on("exit", (code) => process.exit(code ?? 0))
} else if (cmd === "build") {
  execFileSync("npx", ["tsc", "-b"], { cwd: ROOT, stdio: "inherit" })
  const lista = alvo === "--todas" ? await paginas() : [alvo]
  for (const p of lista) {
    exigir(p)
    await build(p)
  }
} else if (cmd === "telas") {
  for (const p of (await paginas()).sort()) console.log(p)
} else if (cmd === "ds") {
  // traz a versão mais nova dos componentes e do tema da Settle
  execFileSync("npx", ["shadcn@latest", "add", "@settle/kit", "--overwrite", "--yes"], { cwd: ROOT, stdio: "inherit" })
} else {
  console.log("Comandos: nova, dev, build, telas, ds  (veja o topo de scripts/tela.mjs)")
}
