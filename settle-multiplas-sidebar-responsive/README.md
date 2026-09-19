# Multitasking — protótipo

> **Tela em React (desde 19/09/2026).** O código fica em `app/` (e nas subpáginas, em `<subpágina>/app/`);
> o `index.html` é gerado pelo build (`cd react && npm run build -- <pasta>`). Veja a seção "Stack" do `AGENTS.md` da raiz.
> O que este README descreve sobre arquivos HTML/JS/CSS se refere à versão anterior, que está no histórico do git.

Protótipo do padrão **Multitasking**: duas sidebars acopladas (uma **primária** + uma **auxiliar**)
que dividem a tela com o menu e o conteúdo principal, de forma responsiva.

**Demo:** https://brunnobkm.github.io/Settle/settle-multiplas-sidebar-responsive/

## Arquivos
- `app/`: a tela em React com os componentes do design system (`App.tsx` tem as regras de largura
  do espaço útil; `Workspace.tsx`, o workspace com Resumo, Arquivos, divisória, modo abas e cabeçalho
  responsivo; `painel.ts`, o estado; `dados.ts` e `documentos.ts`, o conteúdo de exemplo).
- `index.html`: gerado pelo build (não editar à mão).

## O que dá para testar
- **Abrir sidebar** → abre o workspace (Resumo).
- **Abrir Arquivos da licitação** → modo primária + auxiliar.
- **Redimensionar:** arraste a borda do workspace e a divisória entre Resumo e Arquivos (linha verde).
- **Menu** (52/280px): abra/feche para ver o workspace e o conteúdo se reajustarem.
- **Modo abas:** estreite a janela — abaixo de 760px de workspace vira abas (`Resumo | Arquivos`).
- **Fechar (X):** na aba Arquivos volta ao Resumo; na aba Resumo fecha o workspace.

## Regras (resumo)
- Largura = % do **espaço útil** (`viewport − menu`), nunca `vw` cru.
- Conteúdo principal reserva ~**640px** (exceção em telas muito apertadas).
- Resize fluido (transição desligada no arraste), memória por modo, re-clamp ao mudar o espaço.
- Header responsivo: título some nas abas, ações por aba, colapso no `…` só por overflow real.

## Rodar localmente
```bash
cd ../react
npm run dev -- settle-multiplas-sidebar-responsive     # recarregamento automático
npm run build -- settle-multiplas-sidebar-responsive   # gera o index.html desta pasta
```

*Protótipo — o conteúdo (Resumo/Arquivos) é de exemplo, não dados reais.*
