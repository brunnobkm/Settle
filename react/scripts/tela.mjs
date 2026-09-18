#!/usr/bin/env node
// Protótipos React da Settle, feitos com os componentes do design system (@settle).
//
//   npm run nova -- <nome> "Título" [destino]   cria telas/<nome> (destino padrão: Plataforma/<nome>)
//   npm run dev -- <nome>                       roda a tela com recarregamento automático
//   npm run build -- <nome>                     gera <destino>/index.html (arquivo único, pronto para o GitHub Pages)
//   npm run telas                               lista as telas
//   npm run ds                                  atualiza componentes e tema a partir do design system

import { execFileSync, spawn } from "node:child_process"
import { existsSync } from "node:fs"
import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

const ROOT = path.resolve(import.meta.dirname, "..")
const SETTLE = path.resolve(ROOT, "..")
const TELAS = path.join(ROOT, "telas")
const [cmd, nome, ...resto] = process.argv.slice(2)

const lerConfig = async (n) => JSON.parse(await readFile(path.join(TELAS, n, "tela.json"), "utf8"))
const exigirTela = () => {
  if (!nome || !existsSync(path.join(TELAS, nome, "tela.json"))) {
    console.error(`Tela "${nome ?? ""}" não existe. Veja as disponíveis com: npm run telas`)
    process.exit(1)
  }
}

if (cmd === "nova") {
  if (!nome || !/^[a-z0-9-]+$/.test(nome)) {
    console.error('Uso: npm run nova -- <nome-em-minusculas> "Título" [destino]')
    process.exit(1)
  }
  const dir = path.join(TELAS, nome)
  if (existsSync(dir)) {
    console.error(`telas/${nome} já existe`)
    process.exit(1)
  }
  const [titulo = nome, destino = `Plataforma/${nome}`] = resto
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, "tela.json"), JSON.stringify({ titulo: `Settle · ${titulo}`, destino }, null, 2) + "\n")
  await copyFile(path.join(TELAS, "_exemplo", "App.tsx"), path.join(dir, "App.tsx"))
  console.log(`Criada telas/${nome} (build vai para ${destino}/index.html)\nRode: npm run dev -- ${nome}`)
} else if (cmd === "dev") {
  exigirTela()
  const child = spawn("npx", ["vite", ...resto], { cwd: ROOT, stdio: "inherit", env: { ...process.env, TELA: nome } })
  child.on("exit", (code) => process.exit(code ?? 0))
} else if (cmd === "build") {
  exigirTela()
  const config = await lerConfig(nome)
  execFileSync("npx", ["tsc", "-b"], { cwd: ROOT, stdio: "inherit" })
  execFileSync("npx", ["vite", "build"], { cwd: ROOT, stdio: "inherit", env: { ...process.env, TELA: nome } })
  const gerado = path.join(ROOT, "dist", nome, "index.html")
  if (!config.destino) {
    console.log(`\nGerado em ${path.relative(SETTLE, gerado)} (tela sem destino, não publica)`)
  } else {
    const destino = path.join(SETTLE, config.destino)
    await mkdir(destino, { recursive: true })
    await copyFile(gerado, path.join(destino, "index.html"))
    console.log(`\nPublicável: ${config.destino}/index.html`)
  }
} else if (cmd === "telas") {
  for (const n of (await readdir(TELAS)).sort()) {
    if (!existsSync(path.join(TELAS, n, "tela.json"))) continue
    const c = await lerConfig(n)
    console.log(`${n.padEnd(28)} ${c.titulo}  →  ${c.destino ?? "(sem destino)"}`)
  }
} else if (cmd === "ds") {
  // traz a versão mais nova dos componentes e do tema da Settle
  execFileSync("npx", ["shadcn@latest", "add", "@settle/kit", "--overwrite", "--yes"], { cwd: ROOT, stdio: "inherit" })
} else {
  console.log("Comandos: nova, dev, build, telas, ds  (veja o topo de scripts/tela.mjs)")
}
