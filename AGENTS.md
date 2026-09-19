# Settle: protótipos

Repositório de protótipos de interface da Settle, publicados via GitHub Pages
(https://brunnobkm.github.io/Settle/, remote `brunnobkm/Settle`, branch principal `main`).

**Esta é a pasta única da Settle, usada pelo Claude Code e pelo Codex.** As regras
ficam só neste arquivo: o Codex lê o `AGENTS.md` direto e o `CLAUDE.md` apenas importa
este. Mudou uma regra? Edite aqui.

---

## Estrutura: uma pasta por projeto

Cada projeto (conversa) da Settle tem uma pasta na raiz, com o **mesmo nome da conversa**,
em minúsculas, com hífen e o prefixo `settle-`. Ex.: conversa `settle-configuracoes` ↔ pasta
`settle-configuracoes/`, publicada em `https://brunnobkm.github.io/Settle/settle-configuracoes/`.

- **Projeto novo:** crie a conversa já com o nome `settle-<assunto>` e a pasta com o mesmo nome.
- **Continuar um projeto:** trabalhe só dentro da pasta dele.
- Sem prefixo na raiz só a infraestrutura: `assets/`, `react/`, `_template.html`,
  `check-padrao.mjs`, `index.html` (página inicial com a lista de projetos), `AGENTS.md`, `CLAUDE.md`.
- Ao criar um projeto novo, adicione o link dele no `index.html` da raiz.
- `settle-agentes/teste/` e `settle-cadastro-e-primeiro-acesso/` estão em teste com usuários:
  não converter nem redesenhar até o teste acabar.

## Continuidade

- Antes de editar: `git status`. Preserve trabalho local; não limpe nem reverta sem pedido explícito.
- `archive/` (só local, fora do git) guarda cópias antigas: a cópia que o Codex usava, os clones dos repositórios separados que foram juntados aqui. Não edite nada lá. O trabalho que só existia na cópia do Codex está na branch local `codex-wip`; o estado local anterior à reorganização está na branch `wip-local-antigo`.
- `settle-agentes/plataforma/` é o handoff; `settle-agentes/teste/` é o teste de usabilidade. Alterações exclusivas do teste não devem atingir o handoff. Os assets são compartilhados e exigem cuidado.
- Para Agentes, ler `settle-agentes/ROTEIRO-TESTE.md`, `settle-agentes/NOTION.md` e a conversa correspondente apenas conforme necessário.
- Conversas importadas do Claude (para o Codex): `/Users/brunnobkm/.codex/project-context/claude-conversations.json`. Memórias históricas do Claude: `/Users/brunnobkm/.claude/projects/-Users-brunnobkm/memory/MEMORY.md` (ler só as entradas Settle pertinentes).
- Vídeos enviados pelo Brunno: verificar frames e áudio; ferramenta local em `~/Documents/projects/companies/whatsapp-transcricao/run.sh`.

## Publicação (GitHub Pages)

- A URL publicada reflete só o que foi commitado e enviado ao `main`. Fluxo: branch, commit, PR, merge.
- O Pages atualiza de 30 segundos a 1 minuto depois do merge.
- Antes de qualquer push, confira se continua existindo `index.html` na raiz; sem ele a URL principal quebra.
- Reorganização de pastas: avisar antes de publicar e manter uma raiz funcional.

---

## Stack

As telas usam o **design system** (`~/Documents/projects/companies/b-design/design-system`,
repositório privado `brunnobkm/design-system`): a base de componentes shadcn + a personalização
da Settle (`registry/clients/settle/`). Ele é a fonte de verdade de cores, raio, fonte e componentes.

**Todas as telas são React** com os componentes do design system. O código de cada página fica
dentro da pasta dela, em `app/`; o build gera o `index.html` ao lado, que é o que o GitHub Pages publica:

```
settle-configuracoes/
├─ app/
│  ├─ App.tsx        a tela (é aqui que se trabalha)
│  └─ pagina.json    título da página
└─ index.html        gerado pelo build (não editar à mão)
```

Subpáginas seguem o mesmo padrão: `settle-agentes/rotinas/app/` gera `settle-agentes/rotinas/index.html`.

```bash
cd react
npm run nova -- settle-meu-projeto "Título"   # cria settle-meu-projeto/app/
npm run dev -- settle-meu-projeto             # abre com recarregamento automático
npm run build -- settle-meu-projeto           # gera settle-meu-projeto/index.html
npm run ds                                    # traz a versão mais nova do design system
```

Todas as telas estão em React desde 19/09/2026, exceto as que estão em teste com usuários, que
continuam em HTML + `assets/settle.css` até o teste acabar: `settle-agentes/teste/` e
`settle-cadastro-e-primeiro-acesso/`. Quando o teste acabar, converta-as no mesmo padrão.

**Antes de montar qualquer coisa, veja o que já existe:** `ls react/src/components/ui`. Além dos
componentes do shadcn, a Base já tem peças feitas para a Settle e reaproveitáveis: `app-shell`
(casca), `licitacao-card`, `filter-chip`, `search-field`, `data-table`, `action-bar`, `score-meter`,
`notifications-center`, `timeline`, `docked-panel`, `document-viewer`, `citation-list`,
`property-list`, `kanban`, `event-calendar`, `settings-page`, `settings-list`, `ai-widget`,
`background-tasks`, `priority-list`, `token-field`. Telas convertidas servem de exemplo de uso
(veja as pastas `app/`).

Não use Tailwind por CDN, React por CDN nem Babel no navegador. React só pelo workspace `react/`.

---

## Componentes novos (alimentar o design system)

**Todo componente novo vai para a Base do design system** (`registry/base/ui/`). Na Settle ele
aparece com a marca da Settle automaticamente, porque os componentes usam só tokens do tema.

1. **Procure antes** em `react/src/components/ui/`. Compor componentes existentes
   (Card + Table + Badge...) resolve a maioria dos casos.
2. **Crie na Base**, não na tela: `registry/base/ui/<nome>.tsx` no design system, com nome
   neutro e dados por props (nada de conteúdo da Settle dentro do componente).
3. **Só tokens semânticos** (`bg-primary`, `text-muted-foreground`, `bg-success`, `rounded-lg`),
   nunca cor fixa. É isso que dá a cara de cada cliente.
4. **Pasta da Settle no design system** (`registry/clients/settle/ui/`) só quando a Settle precisar
   de uma *estrutura* diferente da Base, não só de cores diferentes. Cores ficam no `theme.json`.
5. **Publique e instale:**
   ```bash
   cd ~/Documents/projects/companies/b-design/design-system && npm run build:registry
   git add -A && git commit -m "..." && git push
   cd ~/Documents/projects/companies/b-design/clients/settle/react && npm run ds
   ```

**Nunca edite `react/src/components/ui/` direto.** Esses arquivos são sobrescritos pelo
`npm run ds`; o que for feito ali se perde e não chega aos outros clientes.

Dados e configurações compartilhados entre telas da Settle (menu da sidebar, listas de exemplo)
ficam em `react/src/settle/`. Não são componentes: não vão para o design system.

---

## Como verificar se uma tela segue o padrão

```bash
node check-padrao.mjs                       # todo o repositório
node check-padrao.mjs settle-minha-tela     # uma tela só
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

**Tela nova:** `cd react && npm run nova -- settle-<nome> "Título"`, com o mesmo nome da conversa.
Depois adicione o projeto no `index.html` da raiz.

`_template.html` só serve para uma página HTML avulsa, fora do fluxo normal.

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

Cores de marca, estado e raios **vêm do design system**: o trecho entre
`design-system:inicio` e `design-system:fim` é gerado. Para mudar um desses valores,
edite `registry/clients/settle/theme.json` (ou `html.json`) no design system e rode
`npm run export:html -- settle` lá. Assim React e HTML continuam iguais.

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
| `--primary` | quase-preto: chips, segmentos, seleção (no React, `primary` é o teal) |
| `--accent` `--accent-600` | teal da marca: ação primária, item ativo |
| `--warning` `--warning-bg` | prazo, atenção |
| `--destructive` | erro, ação destrutiva |
| `--radius-selector/field/box` | 6px / 8px / 10px |
| `--shadow-xs/card/pop` | elevação |

`--accent` é o teal oficial `#00786f` (contraste ~4.9:1, passa em AA). Telas que
ainda têm `#3a9b9e` escrito à mão devem trocar por `var(--accent)`.

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
5. **Tela que não foi prototipada:** link ou botão que levaria a ela recebe
   `data-nao-prototipado` (com `href="#"` se for link). O `settle.js` impede a
   navegação e mostra o toast "Esta página ainda não foi prototipada.". Nunca
   aponte para outra pasta só para "ter para onde ir": a pessoa perde o contexto
   e não entende o que aconteceu. Protótipos antigos que não carregam o
   `settle.js` repetem o mesmo comportamento no próprio script.
6. Pensar na ação em lote, não só na individual.
7. Revisar acessibilidade contra a lista acima.

## Fora de escopo

Autenticação real, integração com backend, captura real de editais. Estes são
protótipos para validar fluxo e interface.
