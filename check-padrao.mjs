#!/usr/bin/env node
/**
 * ============================================================================
 * SETTLE — Verificador de padrão
 * ----------------------------------------------------------------------------
 * Audita os protótipos HTML contra as regras do CLAUDE.md / settle.css.
 *
 * USO:
 *   node check-padrao.mjs                    # todas as telas
 *   node check-padrao.mjs Plataforma/x/      # uma pasta ou arquivo
 *   node check-padrao.mjs --strict           # avisos contam como erro
 *
 * Sai com código 1 se houver erro — serve para CI ou hook de commit.
 * ============================================================================
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const STRICT = process.argv.includes('--strict');
const ALVOS = process.argv.slice(2).filter(a => !a.startsWith('--'));

const IGNORAR = ['.git', 'node_modules', 'assets', '.claude'];

/* ---------- tokens disponíveis no settle.css ------------------------------ */

const sharedCss = readFileSync(join(ROOT, 'assets/settle.css'), 'utf8');
const sharedNoComments = sharedCss.replace(/\/\*[\s\S]*?\*\//g, '');

const TOKENS = new Map();
const rootBlock = sharedNoComments.match(/:root\s*\{([\s\S]*?)\n\}/);
if (rootBlock) {
  for (const decl of rootBlock[1].split(';')) {
    const i = decl.indexOf(':');
    if (i === -1) continue;
    const nome = decl.slice(0, i).trim();
    if (nome.startsWith('--')) TOKENS.set(nome, decl.slice(i + 1).trim().toLowerCase());
  }
}

/** hex -> nome do token, para sugerir a troca */
const HEX_PARA_TOKEN = new Map();
for (const [nome, valor] of TOKENS) {
  const m = valor.match(/^#[0-9a-f]{3,8}$/i);
  if (m) HEX_PARA_TOKEN.set(normHex(valor), nome);
}

const CLASSES_COMPARTILHADAS = new Set(
  [...sharedNoComments.matchAll(/\.([a-zA-Z][\w-]*)/g)].map(m => m[1])
);

function normHex(h) {
  h = h.trim().toLowerCase();
  const curto = h.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/);
  return curto ? '#' + curto.slice(1).map(c => c + c).join('') : h;
}

/* ---------- coleta de arquivos -------------------------------------------- */

function listarHtml(dir, acc = []) {
  for (const nome of readdirSync(dir)) {
    if (IGNORAR.includes(nome)) continue;
    const p = join(dir, nome);
    const st = statSync(p);
    if (st.isDirectory()) listarHtml(p, acc);
    else if (nome.endsWith('.html') && nome !== '_template.html') acc.push(p);
  }
  return acc;
}

let arquivos = [];
if (ALVOS.length) {
  for (const alvo of ALVOS) {
    const p = resolve(ROOT, alvo);
    arquivos.push(...(statSync(p).isDirectory() ? listarHtml(p) : [p]));
  }
} else {
  arquivos = listarHtml(ROOT);
}

/* ---------- regras --------------------------------------------------------- */

function auditar(caminho) {
  const html = readFileSync(caminho, 'utf8');
  const erros = [];
  const avisos = [];

  const estilos = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]);
  const cssLocal = estilos.join('\n');
  const cssLimpo = cssLocal.replace(/\/\*[\s\S]*?\*\//g, '');
  const linhasCssLocal = cssLimpo.split('\n').filter(l => l.trim()).length;

  /* 1. precisa linkar o settle.css */
  if (!/<link[^>]+settle\.css/.test(html)) {
    erros.push('não carrega assets/settle.css');
  }

  /* 2. não pode redefinir tokens localmente */
  const rootLocal = cssLimpo.match(/:root\s*\{([\s\S]*?)\}/g) || [];
  const tokensRedefinidos = [];
  for (const bloco of rootLocal) {
    for (const m of bloco.matchAll(/(--[a-z0-9-]+)\s*:/gi)) {
      if (TOKENS.has(m[1])) tokensRedefinidos.push(m[1]);
    }
  }
  if (tokensRedefinidos.length) {
    erros.push(`redefine token(s) do settle.css localmente: ${[...new Set(tokensRedefinidos)].join(', ')}`);
  }

  /* 3. CSS local volumoso = provável cópia do compartilhado */
  if (linhasCssLocal > 120) {
    erros.push(`bloco <style> com ${linhasCssLocal} linhas — provável CSS duplicado do settle.css`);
  } else if (linhasCssLocal > 40) {
    avisos.push(`bloco <style> com ${linhasCssLocal} linhas — confira se algo deveria ir para o settle.css`);
  }

  /* 4. hex cru onde existe token equivalente */
  const hexComToken = new Map();
  for (const m of cssLimpo.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
    const tok = HEX_PARA_TOKEN.get(normHex(m[0]));
    if (tok) hexComToken.set(normHex(m[0]), tok);
  }
  if (hexComToken.size) {
    const lista = [...hexComToken].map(([h, t]) => `${h} → var(${t})`).join(', ');
    avisos.push(`cor fixa onde já existe token: ${lista}`);
  }

  /* 5. fonte Geist */
  if (!/family=Geist/.test(html) && !/<link[^>]+settle\.css/.test(html)) {
    avisos.push('não carrega a fonte Geist');
  }
  if (/font-family:\s*-apple-system/i.test(cssLimpo)) {
    avisos.push('define font-family de sistema — o padrão é Geist (já vem do settle.css)');
  }

  /* 6. classes usadas que ninguém define */
  const usadas = new Set();
  for (const m of html.matchAll(/class="([^"{}]+)"/g)) {
    for (const c of m[1].split(/\s+/)) if (/^[a-zA-Z][\w-]*$/.test(c)) usadas.add(c);
  }
  const definidasLocal = new Set([...cssLimpo.matchAll(/\.([a-zA-Z][\w-]*)/g)].map(m => m[1]));
  const orfas = [...usadas].filter(c => !CLASSES_COMPARTILHADAS.has(c) && !definidasLocal.has(c));
  if (orfas.length) {
    avisos.push(`classe(s) sem regra CSS: ${orfas.slice(0, 8).join(', ')}${orfas.length > 8 ? ` (+${orfas.length - 8})` : ''}`);
  }

  /* 7. acessibilidade — checagens baratas e confiáveis */
  if (!/<html[^>]+lang=/.test(html)) erros.push('<html> sem atributo lang');

  const botoesSoIcone = [...html.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/g)]
    .filter(m => {
      const attrs = m[0].slice(0, m[0].indexOf('>'));
      const temRotulo = /aria-label=|aria-labelledby=|title=/.test(attrs);
      const texto = m[1].replace(/<[^>]+>/g, '').replace(/\{\{.*?\}\}/g, '').trim();
      return !temRotulo && !texto;
    });
  if (botoesSoIcone.length) {
    erros.push(`${botoesSoIcone.length} botão(ões) só com ícone sem aria-label/title`);
  }

  const inputs = [...html.matchAll(/<input\b[^>]*>/g)]
    .filter(m => !/type="(hidden|checkbox|radio|submit|button)"/.test(m[0]))
    .filter(m => !/aria-label=|aria-labelledby=|id="/.test(m[0]));
  if (inputs.length) {
    avisos.push(`${inputs.length} input(s) sem label associado nem aria-label`);
  }

  if (/outline\s*:\s*(none|0)/.test(cssLimpo) && !/:focus-visible/.test(cssLimpo)) {
    erros.push('remove outline sem oferecer :focus-visible alternativo');
  }

  return { erros, avisos, linhasCssLocal };
}

/* ---------- execução ------------------------------------------------------- */

const C = { r: '\x1b[31m', y: '\x1b[33m', g: '\x1b[32m', d: '\x1b[2m', b: '\x1b[1m', x: '\x1b[0m' };

let totalErros = 0, totalAvisos = 0, ok = 0;

console.log(`\n${C.b}Verificador de padrão — Settle${C.x}`);
console.log(`${C.d}${TOKENS.size} tokens e ${CLASSES_COMPARTILHADAS.size} classes em assets/settle.css${C.x}\n`);

for (const arq of arquivos.sort()) {
  const rel = relative(ROOT, arq);
  const { erros, avisos } = auditar(arq);
  totalErros += erros.length;
  totalAvisos += avisos.length;

  if (!erros.length && !avisos.length) {
    ok++;
    console.log(`${C.g}✓${C.x} ${rel}`);
    continue;
  }
  const marca = erros.length ? `${C.r}✗${C.x}` : `${C.y}!${C.x}`;
  console.log(`${marca} ${C.b}${rel}${C.x}`);
  for (const e of erros)  console.log(`    ${C.r}erro ${C.x} ${e}`);
  for (const a of avisos) console.log(`    ${C.y}aviso${C.x} ${a}`);
}

console.log(`\n${C.b}Resumo:${C.x} ${arquivos.length} arquivo(s) — ` +
  `${C.g}${ok} conforme${C.x}, ${C.r}${totalErros} erro(s)${C.x}, ${C.y}${totalAvisos} aviso(s)${C.x}\n`);

process.exit(totalErros > 0 || (STRICT && totalAvisos > 0) ? 1 : 0);
