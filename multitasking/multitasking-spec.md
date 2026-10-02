# Multitasking — Padrão de Sidebars Acopladas

> O conceito **"Multitasking"** é o conjunto que abre ao lado do conteúdo principal: a **sidebar
> primária** + (quando necessário) a **sidebar auxiliar**, incluindo header/abas e resize/fechar.
> Documento canônico vive no **Notion** (página "Multitasking") — este arquivo é um espelho versionado.
>
> **Regra global**, não específica dos Arquivos da licitação. Vale para **qualquer contexto** em que
> aparecem **duas sidebars acopladas** dividindo a tela (uma **primária** + uma **auxiliar**), com
> outras sidebars (como o menu) competindo por espaço.
> O caso **Resumo + Arquivos da Licitação** é apenas a **primeira aplicação** deste padrão.
>
> A primeira parte é para **todo mundo** entender. A segunda (🛠️ Para o dev) tem números e implementação.

---

## 1. Os papéis (vocabulário) — pense assim, não no conteúdo específico

| Papel | O que é | Exemplo de hoje |
|---|---|---|
| **Sidebar do menu** | Navegação do sistema (sidebar fixa) | Menu lateral esquerdo |
| **Conteúdo principal** | A página por trás do workspace | "Analisar resumo extraído" / uma tabela |
| **Sidebar primária** | Conteúdo base do workspace, sempre presente quando ele abre | **Resumo** |
| **Sidebar auxiliar** | Aberta **a partir da primária**, mostra apoio ao lado | **Arquivos da Licitação** (visualizador de documentos) |

> Sempre que houver **uma sidebar primária + uma sidebar auxiliar** abrindo juntas, **estas regras
> se aplicam** — sejam os Arquivos da Licitação, uma comparação, um histórico, etc.
>
> **Nomenclatura:** a sidebar auxiliar de hoje chama-se **"Arquivos da licitação"** — esse é o
> rótulo usado na aba. O **documento específico** aparece **dentro** dela, no seletor (ex.:
> "Edital 15/2023", "Termo de Referência"). Ou seja: a aba é a **categoria** (Arquivos da
> licitação), o seletor é o **arquivo**.

## 2. O que é isso, em uma frase

Um **workspace lateral** mostra a **sidebar primária** e, quando preciso, a **sidebar auxiliar**
ao lado — sem esmagar o conteúdo principal da página nem o menu. Como **três áreas disputam espaço**,
tudo precisa caber com justiça.

## 3. A regra de ouro: dividir o espaço com justiça

As sidebars **nunca** se dimensionam usando a tela inteira. Usam o **espaço realmente disponível =
tela − tudo que já ocupa lugar (sidebar do menu, etc.)**. Assim, quando o menu abre, o workspace
encolhe junto e **o conteúdo principal nunca é espremido**.

➡️ **O conteúdo principal sempre tenta manter pelo menos 640px** (espaço confortável para tabelas).

## 4. Dois jeitos de mostrar primária + auxiliar

- **Lado a lado:** quando há espaço, as duas sidebars aparecem juntas.
- **Abas:** quando o espaço aperta (o workspace ficaria menor que **760px**), viram **abas**
  (ex.: `Resumo` | `Arquivos da licitação`) e mostram **uma de cada vez** — para nenhuma ficar espremida.

A troca é automática nos dois sentidos, conforme a tela aumenta ou diminui.

## 5. Redimensionar (arrastar)

- **Duas alças:**
  1. **Borda do workspace** → muda o tamanho do conjunto (primária + auxiliar).
  2. **Divisória entre as duas** → muda só a largura da **sidebar auxiliar**.
- Indicador de "dá para arrastar": **linha verde** ao passar o mouse.
- O arraste é **fluido** (segue o cursor, sem travar).
- O sistema **lembra** a largura escolhida para cada modo.
- Há **limites mínimos** (sidebar primária, sidebar auxiliar e conteúdo principal). Ao mudar a tela,
  as larguras se **reajustam sozinhas** dentro dos limites — sem quebrar o layout.

## 6. O topo (header) muda conforme o que você vê

- **No modo abas, o título some** — a aba já diz qual sidebar é.
- **As ações do topo trocam conforme a aba** (cada sidebar tem as suas).
  - Ex. Resumo: Copiar conteúdo, Histórico. Ex. Arquivos: escolher documento, baixar.
- As ações **só viram menu "..." (três pontinhos)** quando **realmente falta espaço** — se cabe, ficam visíveis.

## 7. Fechar (o "X") — regra global

**Fechar a sidebar auxiliar te devolve à primária; fechar a primária encerra o workspace.**

- Na **sidebar auxiliar** (ex.: Arquivos), o X → fecha **só a auxiliar** e volta à primária (workspace continua aberto).
- Na **sidebar primária** (ex.: Resumo), o X → fecha **o workspace inteiro**.

Faz sentido porque a sidebar auxiliar é sempre aberta **a partir da** primária.

---

## 🛠️ Para o dev — referência técnica (genérica)

> Implementar como **comportamento reutilizável**, parametrizado por papel (sidebar primária/auxiliar),
> não acoplado a um conteúdo específico. Resumo + Arquivos é a primeira instância.

### Constantes (px, salvo indicado)

| Constante | Valor | Significado |
|---|---|---|
| Menu fechado / aberto | `52` / `280` | sidebar(s) fixas que reduzem o espaço útil |
| `MIN_CONTENT` | `640` | mínimo reservado ao conteúdo principal |
| `MIN_AUX` (ex-`MIN_SOURCE`) | `480` | mínimo do workspace no modo primária+auxiliar |
| `MIN_PRIMARY` (ex-`MIN_SUMMARY`) | `320` | mínimo do workspace no modo só primária |
| `MIN_COL_PRIMARY` / `MIN_COL_AUX` | `320` / `320` | mínimos das colunas internas (divisória) |
| `MAX_PRIMARY_FRAC` | `0.45` | teto do modo só primária (% do espaço útil) |
| Abertura padrão (só primária) | `39%` do útil | largura inicial |
| Abertura padrão (primária+auxiliar) | `70%` do útil | largura inicial |
| `TABS_THRESHOLD` | `760` | abaixo disso → abas |

### Espaço útil e larguras

```
espaço_útil = 100vw − (soma das sidebars fixas, ex. menu)     // NUNCA usar vw cru

// Workspace, modo só primária:
largura = clamp(MIN_PRIMARY, espaço_útil * 0.39, min(espaço_útil * 0.45, espaço_útil − MIN_CONTENT))

// Workspace, modo primária + auxiliar:
largura = clamp(MIN_AUX, espaço_útil * 0.70, espaço_útil − MIN_CONTENT)

// Divisória interna (largura própria da sidebar auxiliar):
auxiliar = clamp(MIN_COL_AUX, escolha_do_usuário, largura_do_workspace − MIN_COL_PRIMARY)
```

- **Reserva de conteúdo:** teto do workspace = `espaço_útil − MIN_CONTENT` → conteúdo ≥ `MIN_CONTENT`.
- **Exceção (telas apertadas):** se `espaço_útil − MIN_CONTENT < MIN_AUX`, o `MIN_AUX` vence e o
  conteúdo fica abaixo de `MIN_CONTENT` (ex.: 1280px com menu aberto → conteúdo ~520px).
- **Abas:** disparado pela **largura real** do workspace `< TABS_THRESHOLD` (medida, não estimada).
- **Re-clamp:** ao mudar o espaço (menu abre/fecha, viewport muda), reaplicar os `clamp`. Largura
  **preservada por modo**, voltando ao máximo permitido quando há espaço.

### Generalização (como reusar em outro contexto)

Parametrizar por um descritor do par de sidebars, ex.:
```
{ primary: 'resumo', auxiliary: 'arquivos',
  labels: { primary: 'Resumo', auxiliary: 'Arquivos da licitação' },   // rótulo da aba
  actions: { primary: [...], auxiliary: [...] } }
```
Tudo o mais (larguras, abas, resize, header, fechar) é **igual para qualquer par**.

### Redimensionamento fluido

- Durante o arraste, **desligar a transição CSS** de `width`/`flex-basis` da `.workspace-sidebar`
  (classe utilitária, ex. `ws-no-transition`) e religar ao soltar. A transição é só para abrir/fechar.
- Indicadores de resize (handle externo e divisória): **`#3aa5a5`** (verde do botão) no hover/arraste.

### Header responsivo

- **Modo abas:** ocultar o título e o separador (a aba é o título).
  - **Especificidade:** a regra que mostra o separador é `...is-source-open.is-compact-workspace...`;
    a que oculta precisa de especificidade **igual ou maior**.
- **Ações por aba:** na sidebar auxiliar, mover suas ações (ex.: `select de documento` + `download`)
  para dentro do header e ocultar as da primária; voltar ao lado-a-lado restaura.
- **Colapsar no "..." só por falta de espaço:** medir overflow real (`scrollWidth > clientWidth`),
  **não** breakpoint fixo.
- Título encolhe (`min-width:0` + `ellipsis`); ações fixas (`flex:0 0 auto`) para o "X" nunca sair.

### Fechar (comportamento)

- No `closeSidebar()`, **esconder a sidebar auxiliar** (`source-view` → `hidden = true`) e remover
  `is-source-open`, senão a auxiliar "vaza" ao reabrir.
- No modo abas, "X" **contextual**: aba auxiliar → fecha só a auxiliar (`closeOpenSourceView()`);
  aba primária → fecha o workspace (`closeSidebar()`).

### Rótulos

- Sidebar auxiliar: rótulo da aba e aria-label = **"Arquivos da licitação"**.
- Seletor de documento (na aba auxiliar): **mesma altura da aba (32px)** e nome do arquivo **truncado
  com reticências** (`text-overflow: ellipsis; white-space: nowrap`).
- Documentos individuais ficam no **seletor** dentro dela (Edital, Termo de Referência, ETP, Minuta, Proposta).

### Arquivos
- `styles.css` — larguras, transições, header, divisória, indicadores.
- `sheet.js` — espaço útil + clamps, resize, troca de modo, header por aba, fechar.

---

*Padrão validado em protótipo. Os valores (ex.: `MIN_CONTENT = 640`) são fáceis de ajustar —
basta alterar a constante. Pensar sempre em **sidebar primária / sidebar auxiliar**.*
