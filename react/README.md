# Workspace React da Settle

Ferramentas de build das telas da Settle. O código de cada tela **não fica aqui**: fica na
pasta do projeto, em `settle-<nome>/app/`. Veja a seção "Stack" do `AGENTS.md` da raiz.

## Primeira vez neste computador

```bash
npm install
echo "GITHUB_TOKEN=$(gh auth token -u brunnobkm)" > .env.local
```

O token é para a CLI do shadcn baixar componentes do design system (repositório privado).
O `.env.local` não vai para o git.

## Comandos

| Comando | O que faz |
|---|---|
| `npm run nova -- settle-meu-projeto "Título"` | Cria `settle-meu-projeto/app/` a partir de `modelo/App.tsx` |
| `npm run dev -- settle-meu-projeto` | Abre a tela com recarregamento automático |
| `npm run build -- settle-meu-projeto` | Gera `settle-meu-projeto/index.html` (arquivo único) |
| `npm run build -- --todas` | Gera todas as telas React |
| `npm run telas` | Lista as telas React |
| `npm run ds` | Traz a versão mais nova dos componentes e do tema da Settle |

## Estrutura

```
react/
├─ src/components/ui/   componentes do design system: NÃO editar aqui
├─ src/settle/          dados compartilhados entre telas (menu, exemplos)
├─ src/index.css        tema da Settle (vem do design system)
├─ modelo/App.tsx       ponto de partida de uma tela nova
└─ scripts/tela.mjs     os comandos acima
```

Na raiz da Settle existe um atalho `node_modules` → `react/node_modules` (criado sozinho, fora
do git): as telas ficam fora de `react/` e precisam achar as bibliotecas.
