# Multitasking

Padrão global de layout/comportamento para qualquer contexto com **duas sidebars acopladas**
(uma **primária** + uma **auxiliar**) dividindo a tela com outras sidebars fixas (ex.: menu),
garantindo responsividade e regras de interação consistentes.

**Primeira aplicação:** Resumo + Arquivos da licitação.

## Conteúdo

| Arquivo | O que é |
|---|---|
| [`multitasking-spec.md`](multitasking-spec.md) | Especificação completa (papéis, regras, limites, modos, resize, header, fechar). Documento **canônico no Notion** — este é um espelho versionado. |
| [`prototype/index.html`](prototype/index.html) | Protótipo **validado** do padrão. Reaproveita o `styles.css`/`sheet.js` do app (na raiz do repo) e adiciona, inline, a simulação do menu e a lógica do multitasking. |

## Rodar o protótipo

Sirva a **raiz do repositório** (o protótipo referencia `../../styles.css` e `../../sheet.js`):

```bash
# a partir da raiz do repo Settle:
python3 -m http.server 4601
# abra http://localhost:4601/multitasking/prototype/index.html
```

No protótipo: clique em **Abrir sidebar**, redimensione (alça externa e a divisória),
abra a aba **Arquivos da licitação**, encolha a janela para ver o **modo abas**, e teste o **X**
em cada aba. O menu lateral (52/280px) é simulado para reproduzir a disputa por espaço.

## Resumo das regras

- **Espaço útil:** largura = `% de (viewport − sidebars fixas)`, **nunca** `vw` cru.
- **Dois modos:** lado a lado vs **abas** (quando a largura real do multitasking fica `< 760px`).
- **Reserva de conteúdo:** o conteúdo principal mantém ~**640px** (com exceção em telas muito apertadas).
- **Resize fluido:** memória por modo + re-clamp ao mudar o espaço; transição desligada no arraste.
- **Header responsivo:** título some nas abas; ações trocam por aba; colapso no `…` só por overflow real.
- **Fechar contextual:** X na auxiliar volta à primária; X na primária encerra o multitasking.

## Constantes (px)

`MIN_CONTENT 640` · `MIN_AUX 480` · `MIN_PRIMARY 320` · `MIN_COL_* 320/320` · `TABS_THRESHOLD 760` ·
menu `52/280` · abertura padrão `39%` (só primária) / `70%` (primária+auxiliar) · indicador de resize `#3aa5a5`.
