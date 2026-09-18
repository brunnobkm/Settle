# Protótipos React da Settle

Telas novas da Settle, feitas com os componentes do design system
(`brunnobkm/design-system`, cliente `settle`). O build gera um `index.html` único,
do mesmo jeito que os protótipos HTML, então a publicação no GitHub Pages não muda.

## Primeira vez neste computador

```bash
npm install
echo "GITHUB_TOKEN=$(gh auth token -u brunnobkm)" > .env.local
```

O token é para a CLI do shadcn baixar componentes do design system (repositório privado).
O `.env.local` não vai para o git.

## Dia a dia

| Comando | O que faz |
|---|---|
| `npm run nova -- settle-licitacoes-kanban "Kanban de licitações"` | Cria `telas/settle-licitacoes-kanban/` (publica em `settle-licitacoes-kanban/`) |
| `npm run dev -- settle-licitacoes-kanban` | Abre a tela com recarregamento automático |
| `npm run build -- settle-licitacoes-kanban` | Gera `settle-licitacoes-kanban/index.html` |
| `npm run telas` | Lista as telas e para onde cada uma publica |
| `npm run ds` | Traz a versão mais nova dos componentes e do tema da Settle |

O destino fica em `telas/<nome>/tela.json`. Para publicar em outro lugar, passe o
destino como terceiro argumento do `nova` ou edite o `tela.json`.

## Estrutura

```
telas/<nome>/App.tsx     a tela (é aqui que você trabalha)
telas/<nome>/tela.json   título e pasta de destino
telas/_exemplo/          modelo copiado pelo "nova"
src/components/ui/       componentes do design system: NÃO editar aqui
src/index.css            tema da Settle (também vem do design system)
```

## Precisa de um componente que não existe?

Ele é criado no design system, não aqui. O passo a passo está em
"Componentes novos" no `CLAUDE.md` da Settle.
