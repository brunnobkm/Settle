#!/usr/bin/env bash
# Empacota settle-onboarding.jsx em index.html self-contained (React + Tailwind + lucide via CDN).
# Fonte canônico: ~/Downloads/settle-onboarding.jsx
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
# fonte canônico: app.jsx ao lado deste script (fallback: ~/Downloads)
SRC="${1:-$DIR/app.jsx}"
[ -f "$SRC" ] || SRC="$HOME/Downloads/settle-onboarding.jsx"
OUT="$DIR/index.html"

cat > "$OUT" <<'HTML'
<!doctype html>
<html lang="pt-BR" data-preview="settle-onboarding">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Settle — Onboarding (protótipo)</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap" rel="stylesheet" />
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = { theme: { extend: { fontFamily: { sans: ['Geist','ui-sans-serif','system-ui','-apple-system','Segoe UI','Roboto','sans-serif'] } } } };
</script>
<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@18.3.1",
    "react-dom": "https://esm.sh/react-dom@18.3.1?external=react",
    "react-dom/client": "https://esm.sh/react-dom@18.3.1/client?external=react",
    "lucide-react": "https://esm.sh/lucide-react@0.400.0?external=react"
  }
}
</script>
<style>
  html,body{margin:0;padding:0;background:#f8fafc;}
  body{font-family:"Geist",ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased;}
  #loading{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;color:#64748b;font-size:14px;gap:10px;}
  #loading .dot{width:8px;height:8px;border-radius:9999px;background:#5DCAA5;animation:pulse 1s infinite ease-in-out;}
  @keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}
</style>
</head>
<body>
<div id="loading"><span class="dot"></span> Carregando protótipo…</div>
<div id="root"></div>
<script type="text/babel" data-type="module" data-presets="react">
HTML

cat "$SRC" >> "$OUT"

cat >> "$OUT" <<'HTML'

import { createRoot } from "react-dom/client";
const _loading = document.getElementById("loading");
if (_loading) _loading.remove();
createRoot(document.getElementById("root")).render(<App />);
</script>
<script src="https://unpkg.com/@babel/standalone@7.25.6/babel.min.js" data-presets="react" data-type="module"></script>
</body>
</html>
HTML

echo "Gerado: $OUT ($(wc -l < "$OUT") linhas)"
