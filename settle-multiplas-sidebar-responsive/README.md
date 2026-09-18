# Multitasking — protótipo

Protótipo do padrão **Multitasking**: duas sidebars acopladas (uma **primária** + uma **auxiliar**)
que dividem a tela com o menu e o conteúdo principal, de forma responsiva.

**Demo:** https://brunnobkm.github.io/Settle/settle-multiplas-sidebar-responsive/

## Arquivos
- `index.html` — a tela do protótipo (a lógica do Multitasking — espaço útil, modos, resize, header,
  fechar — está embutida no próprio HTML; a simulação do menu também).
- `styles.css`, `sheet.js` — estilos e interações de base reaproveitados do protótipo Settle.

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
python3 -m http.server 4610
# abra http://localhost:4610/index.html
```

*Protótipo — o conteúdo (Resumo/Arquivos) é de exemplo, não dados reais.*
