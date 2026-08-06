# Settle — Protótipos

Repositório de protótipos de interface da Settle, publicados via GitHub Pages.

---

## Stack

**HTML estático, CSS e JavaScript puro.** Sem framework, sem build, sem `npm`.
Cada tela é um arquivo `index.html` dentro da própria pasta.

Não introduza React, Next.js, bundler ou qualquer dependência que exija build.
Se algo parecer exigir isso, resolva com HTML/CSS/JS puro.

**Exceção existente a resolver:** quatro protótipos carregam Tailwind por CDN
(`card-licitacao-detalhe/prototype.html`, `prototype-editavel.html`,
`licitacoes-em-andamento/card.html`, `licitacoes-em-andamento-card/prototype.html`)
e usam classes utilitárias (`flex`, `p-8`, `text-xs`). São anteriores a este
padrão. **Não crie telas novas assim** — use as classes do `settle.css`.
A migração dessas quatro está pendente.

---

## Como verificar se uma tela segue o padrão

```bash
node check-padrao.mjs                       # todo o repositório
node check-padrao.mjs Plataforma/minha-tela # uma tela só
node check-padrao.mjs --strict              # avisos também reprovam
```

O script sai com código 1 se houver erro, então serve em CI ou hook de commit.

**Rode isso ao terminar qualquer tela.** É o que separa "achei que segui o
padrão" de "segui o padrão".

O que ele checa: carrega o `settle.css`; não redefine tokens localmente; não tem
bloco `<style>` volumoso (sinal de CSS copiado); não usa hex cru onde já existe
token; não usa classe sem regra; `<html lang>`; botão de ícone com `aria-label`;
input com label; `outline:none` sem `:focus-visible`.

---

## Regra principal

**Todo protótipo novo parte de `_template.html`.**

```
cp _template.html Plataforma/nome-da-tela/index.html
```

Depois: ajuste `<title>` e `data-preview`, confira o caminho relativo dos assets,
e preencha o `<main>`.

---

## Onde mora o quê

| Arquivo | Papel |
|---|---|
| `assets/settle.css` | Tokens e todas as classes compartilhadas. **Fonte da verdade visual.** |
| `assets/settle.js` | Comportamentos da casca: sidebar, navbar, `settleToast()`. |
| `_template.html` | Casca de partida para tela nova. |

### Antes de escrever CSS

1. Procure a classe em `assets/settle.css`.
2. Se existir, **use**. Não recrie com outro nome.
3. Se não existir e for reutilizável em outras telas, **adicione ao `settle.css`**
   na seção correspondente.
4. Só se for exclusivo desta tela, escreva no `<style>` da própria página.

**Nunca copie o bloco de CSS de outra tela.** Foi exatamente isso que gerou a
divergência que estamos corrigindo (o `selecao-pdf` acabou com paleta azul e
nomes de token próprios, fora do sistema).

### Antes de escrever JS de casca

Sidebar, navbar e toast já estão em `settle.js`. Use `settleToast("mensagem")`.
Não reimplemente.

---

## Tokens

Definidos em `:root` no `settle.css`. Use sempre as variáveis, nunca hex solto.

```css
/* certo */   color: var(--muted-foreground);
/* errado */  color: #737373;
```

Principais:

| Token | Uso |
|---|---|
| `--background` `--foreground` | superfície e texto padrão |
| `--muted` `--muted-foreground` | fundo sutil e texto secundário |
| `--border` `--border-strong` | divisores e contornos |
| `--primary` | quase-preto: chips, segmentos, seleção |
| `--accent` `--accent-600` | teal da marca: ação primária, item ativo |
| `--warning` `--warning-bg` | prazo, atenção |
| `--destructive` | erro, ação destrutiva |
| `--radius-selector/field/box` | 6px / 8px / 10px |
| `--shadow-xs/card/pop` | elevação |

**Pendência conhecida:** `--accent` está em `#3a9b9e` (contraste ~3:1, só passa
em AA para texto grande). O valor do preset oficial é `#00786f` (~4.9:1). A troca
está documentada em comentário no topo do `settle.css` — muda o visual de todas
as telas de uma vez.

---

## Catálogo de classes

**Casca:** `.sidebar` `.sb-head` `.sb-content` `.sb-group` `.sb-section`
`.sb-item` `.sb-ico` `.sb-label` `.sb-badge` `.sb-count` `.sb-sub` `.sb-subitem`
`.sb-foot` `.sb-avatar` `.shell` `.navbar` `.icon-btn` `.sep` `.hello`

Estados no `<body>`: `.sb-open` (sidebar expandida), `.nav-hidden` (navbar oculta).

**Página:** `.content` `.page-head` `.eyebrow` `.title`

**Lista:** `.sticky-toolbar` `.toolbar` `.tabs` `.tab` `.cnt` `.actions` `.act`
`.pill-cnt` `.filter-badges` `.fbadge`

**Botões:** `.btn` `.btn-outline` `.btn-primary` `.btn-status` `.ia` `.ia-count`
`.icon-actions`

**Card:** `.card-list` `.card` `.card-top` `.card-top-right` `.chk` `.edital`
`.badge-updated` `.avatars` `.av` `.segments` `.seg` `.tag-light` `.field-line`
`.valor` `.expand-toggle`

Modificadores: `.card.collapsed` (esconde itens), `.card.hidden`,
`.card.card-leaving` (animação de saída).

**Metadados:** `.grid-box` `.grid-left` `.grid-main` `.fld` `.fld .k` `.fld .v`
`.fld .v.warn` `.pair`

**Tabela:** `.items-head` `.items-title` `.count-chip` `.items-total`
`table.items` `.col-seg` `.num` `.t-right`

**Busca:** `.search-field` `.s-chips` `.s-chip` `.s-filter` `.scope-menu`
`.scope-item` `.search-clear`

**Popovers:** `.fb-pop` `.fb-pop-date` `.fb-presets` `.fb-cal-*` `.fb-day`
`.fb-pop-list` `.fb-opt` `.fb-selall`

**Estados:** `.skeleton` `.sk-card` `.sk` `.empty-state` `.toast`

---

## Direção visual

Ferramenta de trabalho profissional. Sóbria, densa, confiável.

**Faça:** densidade é qualidade — o usuário quer ver muito de uma vez; neutros
dominando; teal só para ação primária e item ativo; âmbar só para prazo e
urgência; hierarquia por tipografia e espaçamento; tabelas de verdade para dados
tabulares; contadores visíveis em abas e filtros.

**Evite:** gradientes, sombras dramáticas, glassmorphism, animação decorativa;
cor sem significado; diluir a tela com espaço em branco — aqui custa
produtividade; esconder informação atrás de cliques sem motivo.

---

## Conteúdo e linguagem

**Preserve o vocabulário do domínio.** O usuário é analista de licitação e conhece
os termos: edital, órgão, objeto, modalidade, pregão eletrônico, julgamento,
UASG, lote, item, segmento, valor global, envio da proposta, homologação, CAPAG,
ME/EPP. Não simplifique nem explique o óbvio.

- Botões descrevem a ação concreta: "Enviar para análise", "Descartar" — não "OK".
- Datas em `DD/MM/AAAA`. Valores em `R$ 1.234.567,89`. Números sempre com
  separador de milhar.
- **Dados de exemplo realistas**: órgãos brasileiros de verdade (secretarias
  estaduais, prefeituras, tribunais), números de edital plausíveis, objetos
  redigidos como em edital real, valores na escala certa (centenas de milhares a
  dezenas de milhões). Nunca "Lorem ipsum".

---

## Acessibilidade

Aqui é sobretudo **produtividade**: quem usa a ferramenta o dia inteiro depende
de teclado, foco e contraste.

- Contraste WCAG AA — atenção redobrada em texto pequeno de tabela.
- Navegação completa por teclado. **Nunca remova `:focus-visible`** (já definido
  no `settle.css`).
- `<button>` para ação, `<a href>` para navegação. Botão de ícone sem texto
  precisa de `aria-label`.
- `<table>` de verdade para dados tabulares, com `<th>` e escopo.
- Todo input com `<label>` associado. Placeholder não substitui label.
- Estado nunca só por cor — prazo urgente precisa de texto ou ícone junto.
- Alvos de clique: mínimo 32px em interface densa, 44px no mobile.

---

## Ao construir uma tela

1. Estrutura de conteúdo e hierarquia antes do visual.
2. Reaproveitar classes existentes antes de inventar novas.
3. Dados realistas do domínio.
4. Incluir os estados esquecidos: **vazio, carregando, erro, sem resultado,
   sem permissão, muitos resultados**.
5. Pensar na ação em lote, não só na individual.
6. Revisar acessibilidade contra a lista acima.

## Fora de escopo

Autenticação real, integração com backend, captura real de editais. Estes são
protótipos para validar fluxo e interface.
