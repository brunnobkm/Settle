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

Os protótipos usam o **design system** (`~/Documents/projects/companies/b-design/design-system`, repositório
privado `brunnobkm/design-system`): a base de componentes shadcn + a personalização
da Settle (`registry/clients/settle/`). Ele é a fonte de verdade de cores, raio e fonte.

Há dois tipos de tela:

| | Telas **novas** | Telas HTML **existentes** |
|---|---|---|
| Onde | `react/telas/<nome>/App.tsx` | `index.html` na pasta da tela |
| Tecnologia | React + componentes do design system (`@/components/ui`) | HTML/CSS/JS puro + `assets/settle.css` |
| Publicação | `npm run build -- <nome>` gera `<destino>/index.html` (arquivo único) | o próprio `index.html` |
| Verificação | `npm run typecheck` em `react/` | `node check-padrao.mjs` |

**Toda tela nova é React**, criada com `cd react && npm run nova -- <nome> "Título"`.
Veja `react/README.md`. Telas HTML existentes continuam em HTML: ajustes pequenos
seguem as regras abaixo; reescrever uma delas em React só quando for pedido.

Não use Tailwind por CDN, React por CDN nem Babel no navegador (como o
`settle-onboarding` antigo). React só no workspace `react/`.

**Exceção existente a resolver:** quatro protótipos carregam Tailwind por CDN
(`card-licitacao-detalhe/prototype.html`, `prototype-editavel.html`,
`licitacoes-em-andamento/card.html`, `licitacoes-em-andamento-card/prototype.html`).
São anteriores a este padrão.

---

## Componentes novos (alimentar o design system)

Ao prototipar, se precisar de um componente que não existe em
`react/src/components/ui/`:

1. **Procure antes.** `ls react/src/components/ui` e a lista do shadcn. Compor
   componentes existentes (Card + Table + Badge...) resolve a maioria dos casos.
2. **Decida onde ele mora**, no repositório do design system:
   - **Base** (`registry/base/ui/`): genérico, serviria a qualquer cliente, sem
     vocabulário de licitação. Ex.: stepper, dropzone de arquivo, tabela com filtros,
     barra de ações em lote.
   - **Settle** (`registry/clients/settle/ui/`): específico do domínio ou da marca.
     Ex.: card de licitação, score do edital, linha do tempo da sessão.
   - Na dúvida, Base com nomes neutros; o que for de licitação fica na tela ou na Settle.
3. **Escreva o componente no design system**, não na tela. Use só tokens semânticos
   (`bg-primary`, `text-muted-foreground`, `rounded-lg`), nunca cor fixa: é isso que
   faz ele sair com o visual da Settle (e de qualquer outro cliente) automaticamente.
4. **Publique e instale:**
   ```bash
   cd ~/Documents/projects/companies/b-design/design-system && npm run build:registry
   git add -A && git commit -m "..." && git push
   cd ~/Documents/projects/companies/b-design/clients/settle/react && npx shadcn@latest add @settle/<nome> --overwrite --yes
   ```
5. Mudou um componente que já existe? Mesma regra: a mudança vai no design system
   (Base se for melhoria geral, `clients/settle/ui/` se for só da Settle) e depois
   `npm run ds` em `react/` traz a versão nova.

**Nunca edite `react/src/components/ui/` direto.** Esses arquivos são sobrescritos
pelo `npm run ds`; o que for feito ali se perde e não chega aos outros clientes.

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

**Tela nova parte de `react/`:** `cd react && npm run nova -- <nome> "Título"`.

Só quando for preciso criar uma página HTML avulsa (fora do fluxo normal), ela parte
de `_template.html`:

```
cp _template.html settle-nome-da-tela/index.html
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
