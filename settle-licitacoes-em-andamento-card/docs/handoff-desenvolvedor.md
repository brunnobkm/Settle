# Card de Licitação — Especificação completa

> **Para quem:** desenvolvedores e pessoas de produto.
> **Objetivo:** descrever o card em **detalhe suficiente** para implementação sem ambiguidade — cada regra, cada estado, cada edge case.
> **Linguagem:** sem código. Comportamento, intenção, regras de negócio.

---

## Índice

1. [Glossário](#1-glossário)
2. [Onde o card aparece](#2-onde-o-card-aparece)
3. [Especificação visual](#3-especificação-visual)
4. [Princípio fundamental de interação](#4-princípio-fundamental-de-interação)
5. [As 10 propriedades em detalhe](#5-as-10-propriedades-em-detalhe)
6. [Estados do card](#6-estados-do-card)
7. [Hover do card: ações flutuantes](#7-hover-do-card-ações-flutuantes)
8. [Hover do título: checkbox de seleção](#8-hover-do-título-checkbox-de-seleção)
9. [Drag and drop](#9-drag-and-drop)
10. [Sistema de cores em profundidade](#10-sistema-de-cores-em-profundidade)
11. [Popovers de edição (regras gerais)](#11-popovers-de-edição-regras-gerais)
12. [Painel de detalhe da licitação](#12-painel-de-detalhe-da-licitação)
13. [Empty states (catálogo completo)](#13-empty-states-catálogo-completo)
14. [Validações e edge cases](#14-validações-e-edge-cases)
15. [Acessibilidade](#15-acessibilidade)
16. [Performance](#16-performance)
17. [Regras de negócio](#17-regras-de-negócio)
18. [Pendências detalhadas](#18-pendências-detalhadas)
19. [Decisões em aberto](#19-decisões-em-aberto)
20. [Princípios de implementação](#20-princípios-de-implementação)

---

## 1. Glossário

Termos usados ao longo do documento:

- **Card** — o componente que representa uma licitação. Aparece em vários lugares; este doc é sobre o card.
- **Propriedade** — cada campo de informação dentro do card (título, status, segmento, etc.). 10 propriedades no total.
- **Linha** (ou "row") — a área horizontal dentro do card que contém uma propriedade.
- **Chip** — um elemento visual pequeno com fundo colorido, usado pra representar tags/categorias (ex: segmento, status). Tem ~22px de altura.
- **Pill** — sinônimo de chip neste contexto.
- **Popover** — o painel flutuante que abre ao clicar em uma propriedade pra editar (ex: lista de status, calendário, etc.). Aparece ancorado abaixo do componente clicado.
- **Click-to-edit** — quando clicar em algo abre o editor inline (popover).
- **Click-to-open** — quando clicar em algo abre o painel de detalhe da licitação.
- **Componente** — elemento visual distintivo dentro do card (chip, pill, valor formatado, etc.).
- **Área "morta"** — espaço dentro do card que **não** é um componente visualmente distinto (padding, gaps entre linhas, texto puro de campo "morto").
- **Painel de detalhe** — a tela/painel lateral que abre ao clicar em uma área "morta" do card. Mostra a licitação completa com todas as propriedades editáveis.
- **Empty state** — o que mostra quando uma propriedade está vazia (placeholder clicável).
- **Floating actions** — pequenos botões que aparecem no hover do card, no canto superior direito.

---

## 2. Onde o card aparece

O card aparece em **4 contextos** dentro da Plataforma:

### 2.1 Board (Kanban) — visão principal
- Cards organizados em **colunas verticais** chamadas "lanes"
- Cada lane representa uma **etapa do processo** (ex: "Análise de oportunidades", "Preparação de proposta", "Em participação", etc.)
- Cards podem ser **arrastados entre lanes** pra avançar de etapa
- Esta é a visão padrão. Mais de 30 cards podem aparecer simultaneamente.

### 2.2 Tabela
- As mesmas propriedades aparecem como **colunas de uma tabela**
- Cada licitação = uma linha
- Útil pra visão comparativa, ordenação, filtros
- O componente do card **não aparece como card** aqui — mas as propriedades exibidas devem ser as mesmas e com as mesmas regras de cores (status, data, etc.)

### 2.3 Calendário
- Cards aparecem **posicionados no dia da data de envio**
- Visão mensal padrão
- Pode haver vários cards no mesmo dia

### 2.4 Painel de detalhe
- Painel lateral (slide-in) que abre ao clicar em qualquer área "morta" de um card
- Mostra **o card inteiro expandido**, com TODAS as propriedades editáveis (sem regra de click-to-open vs click-to-edit — tudo edita)
- É o "modo de edição completo" da licitação
- Usuário pode também navegar entre cards pelo painel sem voltar pra view

> **Regra mestra:** o card **no Board** é a **fonte de verdade visual**. Toda mudança visual ou comportamental deve ser pensada primeiro no Board e depois replicada nas outras views (tabela, calendário, detalhe) preservando consistência.

---

## 3. Especificação visual

### Dimensões e espaçamento

| Item | Valor |
|---|---|
| Largura do card | **342px** (fixa) |
| Padding interno do card | 10px (em todos os lados) |
| Espaço entre propriedades (linhas) | 2px |
| Padding de cada linha | 8px horizontal, 6px vertical |
| Border-radius do card | 12px (cantos arredondados) |
| Border-radius das linhas (em hover/edit) | 6px |
| Border-radius dos chips/pills | 4-5px |

### Aparência base

- **Fundo:** branco puro (`#FFFFFF`)
- **Borda:** 1px sólida, cor `#E5E5E5` (cinza muito claro)
- **Sombra:** **nenhuma** (definição: o card depende da borda, não de sombra, pra separar do fundo)
- **Fundo da página atrás dos cards:** `#F5F5F5` (cinza claro)

### Estado de hover do card

- Card cresce **0.5%** (`scale 1.005`)
- Transição: **150ms ease-out**
- A borda **não muda de cor** no hover (a cor de borda só muda quando o card está selecionado)
- O cursor vira **mãozinha** (pointer) em TODA a área do card — sinalizando que o card como um todo é clicável
- O efeito de hover deve ser **sutil** — perceptível mas nunca chamativo

### Estado selecionado

- Borda muda de `#E5E5E5` (cinza) para `#3A9B9E` (teal)
- O checkbox no canto superior esquerdo do card fica permanentemente visível e marcado (preenchido em teal)
- Demais propriedades do card seguem normais

### Tipografia

- Família tipográfica: usar a stack padrão do sistema (system font stack); não há dependência de fonte custom
- Título: 13px, peso **semibold** (600)
- Demais textos: 12-13px, peso normal (400)
- Mono (apenas no número do edital): font-family monospace, ainda 13px
- Line-height padrão dos textos: 1.4

---

## 4. Princípio fundamental de interação

### A regra mestra

> **"Clique exatamente em um componente visual para editá-lo. Clique em qualquer outra área do card (espaço vazio, padding, texto não-componente) para abrir o painel de detalhe."**

Este é o padrão do Notion (validado tecnicamente via inspeção do DOM do Notion durante a prototipagem). Não inventamos esse padrão — escolhemos seguir uma convenção já estabelecida que usuários familiarizados com Notion vão reconhecer.

### Por que essa regra?

- **Edição rápida fica disponível** sem precisar abrir um modal ou outra tela (status, segmento, responsável são alterados muitas vezes ao dia)
- **Mas o card não vira um "formulário"** — a grande maioria do espaço continua sendo "clique pra ver tudo", que é o uso mais comum
- **Reduz erro de clique** — se você clica numa área grande e abre um popover de edição inesperado, frustra. Aqui só edita se clicar **exatamente** num componente identificável

### Como isso se manifesta visualmente

| Componente | Click → |
|---|---|
| Chip de segmento (pill colorido) | Edita inline |
| Pill de status (pill colorido) | Edita inline |
| Chip de responsável (oval cinza) | Edita inline |
| Texto formatado de valor (R$ ...) | Edita inline |
| Texto da data | Edita inline |
| Texto do título | **Abre detalhe** |
| Texto do edital | **Abre detalhe** |
| Texto do órgão | **Abre detalhe** |
| Texto do objeto | **Abre detalhe** |
| Texto de cidade | **Abre detalhe** |
| **Qualquer espaço vazio** dentro do card | **Abre detalhe** |
| Padding da linha (área ao redor do componente) | **Abre detalhe** |
| Gap entre linhas | **Abre detalhe** |

### O que NÃO abre o detalhe

- O **checkbox de seleção** (no canto superior esquerdo): apenas seleciona/deseleciona o card
- Os **botões flutuantes** (canto superior direito): cada um faz sua própria ação
- Click direto em **componente editável** (chip/pill/data/valor): abre popover de edição
- Click dentro de um popover que já está aberto

### Hover feedback diferenciado

Pra reforçar visualmente onde se pode editar vs onde abre o detalhe:

- **Chips coloridos** (segmentos, status) ao hover: ficam **levemente mais escuros** (filtro de brightness 0.92)
- **Chips cinzas** (responsáveis) ao hover: idem (brightness 0.92)
- **Textos editáveis** (data, valor, empty hints): ganham **fundo cinza sutil** (`#0F0F0F` com 6% de opacidade)
- **Card como um todo** ao hover: cresce 0.5% (independente de qual parte está sendo hovered)
- **Linhas de texto não-editáveis** (título, órgão, objeto, etc.): **nenhum feedback de hover individual** — só o do card

---

## 5. As 10 propriedades em detalhe

A ordem padrão das propriedades no card é a lista abaixo. **A ordem pode ser reordenada pelo usuário** via drag (arrastar uma propriedade pra cima ou pra baixo). O título sempre fica no topo (não é reordenável).

### 5.1 Título

- **O que é:** uma descrição curta e legível do que está sendo licitado. **Não é o número do edital** (esse é uma propriedade separada).
- **Origem dos dados:** **gerado por IA** a partir do texto do "objeto" da licitação. O usuário pode editar manualmente.
- **Exemplo:** *"Locação de software integrado de gestão pública — Pacatuba/SE"*
- **Como é mostrado:**
  - Topo do card, em **negrito (semibold 600)**, tamanho 13px
  - Ocupa até **2 linhas** — se passar, trunca com reticências (`...`)
  - Cor: preto / cinza muito escuro
- **Origem dos dados:** A IA gera este texto na ingestão do edital. Regras pra geração (essas regras são pendência de backend):
  - **Ancorada no objeto** (não inventar info que não está lá)
  - **Preservar siglas** importantes (TJSP, INFRAERO, UFMT, etc. — manter caixa alta)
  - **Preservar qualificadores** importantes (nome de cidade, estado, tipo de equipamento, etc.)
  - **Idioma:** sempre português
  - **Tom:** descritivo e neutro, **sem marketing**
  - **Tamanho:** ~70-100 caracteres ideal
  - **Temperatura baixa** (consistência sobre criatividade)
  - **Cacheada** (mesmo objeto → mesmo título)
- **Estado vazio:** se a IA falhar ou o objeto for muito curto, mostrar placeholder "Sem título". Click no placeholder abre detalhe (não edita inline aqui).
- **Comportamento ao clicar:** **abre o painel de detalhe** (não edita inline).
- **Por que não edita inline:** título pode ter quebra de linha e é texto longo — editar inline em 2 linhas é frustrante. Detalhe tem espaço pra isso.
- **No painel de detalhe:** editor de texto livre, salva ao perder foco ou Enter.

### 5.2 Edital (código/número)

- **O que é:** o **número oficial do edital** publicado pelo órgão licitante.
- **Origem dos dados:** extraído do edital na ingestão. Editável pelo usuário se vier errado.
- **Exemplo:** *"90001/2026"*
- **Como é mostrado:**
  - Logo abaixo do título
  - Texto: `Edital ` (prefixo fixo) + o número em **font monospace**
  - Tamanho 13px, peso normal, cor preta
- **Estado vazio:** `Edital —` (em dash como placeholder)
- **Comportamento ao clicar:** **abre o painel de detalhe**.
- **Validações:**
  - Formato livre (não força padrão XX/AAAA)
  - Máximo 30 caracteres
  - Pode conter letras, números, barras, hífens
- **No painel de detalhe:** input de texto simples.

### 5.3 Segmentos

- **O que é:** categorias da licitação. Define a área de mercado (Tecnologia, Saúde, Construção, etc.).
- **Origem dos dados:** classificação automática inicial (na ingestão) + ajustes manuais do usuário.
- **Como é mostrado:**
  - Linha com **chips coloridos** em sequência (uma única linha, com scroll horizontal se passar — mas idealmente sem passar)
  - Cada chip tem fundo na cor da categoria (8 cores fixas, ver §10)
  - Texto branco em cima do fundo colorido, 12px, peso medium (500)
  - Pode haver **vários segmentos** no mesmo card (até 5 razoavelmente; mais que isso fica feio)
- **Estado vazio:** placeholder "Adicionar segmento" (texto cinza, clicável, sem chip)
- **Comportamento ao clicar:** **edita inline** (popover multi-select).
- **Editor (popover):**
  - Lista das 8 categorias disponíveis
  - Busca no topo (campo de input que filtra a lista por nome)
  - Multi-select: clicar num item marca/desmarca (toggle); popover **fica aberto** entre toggles pra permitir múltiplas seleções
  - Cada item marcado tem um ✓ à direita
  - **Criar novo segmento:** se a busca não bate com nenhum existente, mostrar opção "Criar 'X'" no final da lista; clicar cria e adiciona ao card
  - Salvar: ao fechar o popover (click fora ou ESC), salva o estado final
- **Validações:**
  - Pelo menos 0 segmentos (não é obrigatório)
  - Máximo recomendado: 5 segmentos por card (UI quebra além disso, mas não bloqueia)
- **Edge cases:**
  - Segmento com nome **muito longo** (>45 caracteres): chip pode estourar um pouco a borda do card (decisão aceita: não truncamos, preferimos transbordo discreto)
  - Novo segmento criado: vai pro pool de segmentos disponíveis pra outros cards também

### 5.4 Órgão

- **O que é:** nome do **órgão público licitante** (a entidade que está fazendo a licitação).
- **Origem dos dados:** extraído do edital. Pode ser editado.
- **Exemplo:** *"Universidade Federal de Mato Grosso"*
- **Como é mostrado:**
  - Texto em **negrito (semibold 600)**, 13px, cor preta
  - **Limitado a 2 linhas** com truncamento por reticências (`...`) se passar
  - **Capacidade aproximada na largura atual (342px):** ~40 caracteres por linha, **~80 caracteres em 2 linhas**
  - Word-break: quebra palavras longas se necessário pra evitar overflow horizontal
  - Pode incluir sigla de unidade ("TJSP / Diretoria de Tecnologia")
- **Estado vazio:** placeholder "Vazio" (cinza, clicável)
- **Comportamento ao clicar:** **abre o painel de detalhe**.
- **No painel de detalhe:** input de texto sem limite visual de linhas (o limite só se aplica no card).
- **Edge cases:**
  - Texto com mais de 80 caracteres: truncado visualmente com `...`. O texto completo continua disponível no painel de detalhe.
  - Backend deve permitir tamanho máximo de 200 caracteres no campo (cap real da database).

### 5.5 Objeto

- **O que é:** **descrição oficial e completa** do que está sendo licitado, copiada do edital ipsis litteris.
- **Origem dos dados:** extraído do edital. **Não é editado tipicamente** (é a fonte legal). Editável só por exceção.
- **Exemplo:** *"[LICITANET] - SISTEMA DE REGISTRO DE PREÇOS VISANDO A FUTURA E EVENTUAL CONTRATAÇÃO DE EMPRESA ESPECIALIZADA NA PRESTAÇÃO DE SERVIÇOS DE LOCAÇÃO DE SOFTWARE INTEGRADO..."*
- **Como é mostrado:**
  - Texto 13px, peso normal, cor preta, leading-snug (line-height 1.375)
  - Truncado em **3 linhas** com reticências
- **Preview no hover:**
  - Ao passar o mouse sobre o objeto, aparece um **balão tooltip** abaixo dele mostrando o texto **completo**
  - Largura do balão: 300px (ou até 92% da viewport, o que for menor)
  - Aparece após delay de hover (~250ms — evita disparar em mouse de passagem)
  - Some quando o mouse sai
  - **Não aparece** se um popover de edição estiver aberto, ou se estiver dragging
- **Estado vazio:** placeholder "Vazio"
- **Comportamento ao clicar:** **abre o painel de detalhe**.
- **No painel de detalhe:** textarea grande, com aviso "Este texto vem do edital — edite com cautela"

### 5.6 Status

- **O que é:** o **estado atual da licitação** no processo (Em disputa, Homologada, Anulada, etc.).
- **Origem dos dados:** começa com um status inicial (ex: "Abertas para participação") e muda conforme a licitação avança.
- **Como é mostrado:**
  - Uma **única pill colorida** (não é multi-select)
  - Texto branco/escuro dependendo do fundo, 12px, peso medium (500)
  - Posicionado verticalmente centralizado na linha
- **Os 7 status disponíveis:** ver §10.2 (sistema de cores) — incluem "Abertas para participação", "Em disputa ou Homologação", "Homologada", "Suspensa", "Anulada", "Revogada", "Deserta ou Fracassada"
- **Estado vazio:** placeholder "Definir status"
- **Comportamento ao clicar:** **edita inline** (popover single-select).
- **Editor (popover):**
  - Lista dos 7 status, cada um mostrado como uma pill colorida (preview de como vai ficar)
  - Single-select: clicar num status fecha o popover e aplica
  - Item atualmente selecionado tem ✓ à direita
  - No final: opção **"Limpar status"** (volta ao estado vazio)
- **Validações:** sempre um dos 7 status ou nenhum (vazio)

### 5.7 Responsáveis

- **O que é:** as **pessoas da nossa equipe** responsáveis por acompanhar/preparar a licitação.
- **Origem dos dados:** atribuição manual pelo usuário. Pode haver mais de um.
- **Como é mostrado:**
  - Chips ovais com fundo cinza claro (`#0F0F0F` com ~5% opacidade)
  - Apenas o **nome** da pessoa (sem avatar — decisão tomada na sessão de iterações)
  - 12px, peso normal, cor preta
  - Múltiplos chips se vários responsáveis, em wrap layout (quebra linha se necessário)
- **Estado vazio:** placeholder "Sem responsáveis"
- **Comportamento ao clicar:** **edita inline** (popover multi-select).
- **Editor (popover):**
  - Lista de todas as pessoas da equipe disponíveis (vem do backend)
  - Busca no topo (filtra por nome)
  - Multi-select: toggle nos itens; popover fica aberto entre toggles
  - ✓ nos selecionados
  - Sem opção de "criar nova pessoa" (pessoas vem do backend de usuários)
- **Validações:**
  - Pelo menos 0 responsáveis (não obrigatório)
  - Sem limite máximo prático (mas UI quebra acima de ~5-6 nomes)
- **Edge cases:**
  - Nome muito longo: trunca o chip com reticência
  - Pessoa que foi removida do sistema (mas estava atribuída antes): mostra o nome com sinal visual de "inativa" (ex: opacidade reduzida)

### 5.8 Data de envio

- **O que é:** a **data limite** pra enviar a proposta (deadline da licitação).
- **Origem dos dados:** extraída do edital. Editável.
- **Exemplo de exibição:** *"25/04/2026"*
- **Como é mostrado:**
  - Texto 13px, peso normal
  - **Cor depende da urgência** — ver §10.3 (vermelho se hoje, âmbar se 1-7 dias, neutro caso contrário)
- **Estado vazio:** **a data sempre existe** (vem do edital). Não há empty state esperado.
- **Comportamento ao clicar:** **edita inline** (popover com mini-calendário).
- **Editor (popover):**
  - Mini-calendário mensal
  - Header: nome do mês + ano + botões `<` e `>` pra navegar entre meses
  - Botão "Hoje" pra voltar ao mês atual
  - Botão "Limpar" pra remover a data (raramente usado)
  - Click em um dia: aplica a data e fecha popover
  - Dia de hoje: destacado em teal
  - Dias passados: não bloqueados (pode escolher data retroativa se precisar)
- **Validações:**
  - Data válida (formato dd/mm/aaaa)
  - Não há regra de "data não pode ser X" — backend valida se precisar
- **Edge cases:**
  - Data retroativa: permite (pode haver licitação cuja data já passou)
  - Data muito longe (>1 ano): permite

### 5.9 Cidade

- **O que é:** **cidade e estado** onde a licitação será executada (ou onde o órgão está).
- **Origem dos dados:** extraído do edital.
- **Exemplo:** *"Paripiranga • BA"*
- **Como é mostrado:**
  - Texto 13px, peso normal, cor preta
  - Formato: **"Cidade • Estado"** (sigla do estado em maiúsculas)
  - O separador é um **bullet (•)** com pequenas margens — **não é uma barra "/"** (decisão UX tomada)
- **Estado vazio:** placeholder "Vazio"
- **Comportamento ao clicar:** **abre o painel de detalhe**.
- **No painel de detalhe:** dois campos: cidade (texto livre) e estado (select com as 27 UFs)

### 5.10 Valor

- **O que é:** **valor global estimado** da licitação (em reais).
- **Origem dos dados:** extraído do edital ou estimado.
- **Exemplo:** *"R$ 220.965,46"*
- **Como é mostrado:**
  - Texto 13px, peso normal, cor preta
  - Formato brasileiro: **R$ + separador de milhar (ponto) + decimal (vírgula)**
  - Sempre com 2 casas decimais
- **Estado vazio:** placeholder "Vazio" (se o valor for null/zero)
- **Comportamento ao clicar:** **edita inline** (popover com input).
- **Editor (popover):**
  - Input de texto formatado em reais
  - **Aceita ambos**: vírgula e ponto como decimal
  - **Aceita**: digitar só números (ex: "1500" vira "R$ 1.500,00")
  - **Não aceita**: letras, símbolos diferentes de "," e "."
  - Salva ao perder foco ou ao apertar Enter
- **Validações:**
  - Valor >= 0
  - Formato numérico
- **Edge cases:**
  - Valor muito grande (bilhões): a formatação mantém — pode ocupar 2 linhas se quebrar (raro)
  - Valor zero: mostra "R$ 0,00" (não vira empty state)

---

## 6. Estados do card

O card pode estar em vários estados (não excludentes — alguns combinam):

### 6.1 Default
- Borda cinza claro, sem hover, sem interação
- Cursor: padrão (seta)

### 6.2 Hover (do card como um todo)
- Card cresce 0.5%
- Cursor: mãozinha (pointer)
- Aparecem botões flutuantes (link + kebab) no canto superior direito
- A borda **não muda** (continua cinza)

### 6.3 Hover na linha do título
- Combinação do hover do card +
- Aparece o **checkbox de seleção** à esquerda do título (com animação de "deslize")
- Texto do título se desloca um pouquinho pra direita pra dar espaço

### 6.4 Selecionado
- Borda muda pra **teal `#3A9B9E`**
- Checkbox no canto superior esquerdo **permanece visível** e marcado (preenchido teal)
- O card continua aceitando hover normalmente

### 6.5 Editando uma propriedade
- A linha da propriedade ganha **fundo `#F5F5F5`** (cinza claro)
- O popover de edição está aberto ancorado na propriedade
- Outros cards na board **continuam clicáveis** (o popover não bloqueia)

### 6.6 Dragging
- O card "fantasma" original fica com **opacidade reduzida** (~50%)
- Um **ghost** (clone visual) segue o cursor durante o arrasto
- Lane de destino ganha **borda azulada** indicando "drop aqui"
- Tooltip e preview de objeto ficam suprimidos durante drag

### 6.7 Loading / saving (pendente)
- Quando uma edição é salva no backend, **não há indicador visual claro** ainda
- **Decisão pendente:** mostrar um spinner sutil, um toast de confirmação, ou nada (otimistic update)? Ver §19.

### 6.8 Erro (pendente)
- Se o backend retornar erro ao salvar uma edição (ex: rede caiu), **comportamento não definido**
- **Decisão pendente:** reverter visualmente, mostrar toast de erro, oferecer retry? Ver §19.

---

## 7. Hover do card: ações flutuantes

Quando o usuário passa o mouse sobre **qualquer parte do card**, aparece um **container de ações** no **canto superior direito**:

### Aparência
- Container branco com borda cinza claro
- Sombra suave
- 2-3px de padding
- Border-radius 8px
- Contém os botões em uma fileira horizontal

### Posicionamento
- 6px da borda superior do card
- 6px da borda direita do card

### Animação
- Aparece com **fade in** + **translate vertical** de 2px
- Duração: 120ms
- Some ao tirar o mouse do card

### Botões disponíveis

#### Botão 1: Copiar link (🔗)
- Ícone: corrente/link
- Tooltip ao hover: "Copiar link"
- Click:
  - **Comportamento esperado** (não implementado): copia pro clipboard a URL única do card (ex: `https://app.settle.com/licitacao/{id}`)
  - **Comportamento atual:** stub (não faz nada)
- Não deve abrir o detalhe ao clicar

#### Botão 2: Mais opções (⋯)
- Ícone: três pontinhos horizontais
- Tooltip ao hover: "Mais opções"
- Click: abre **dropdown menu** abaixo do botão
- Click novamente: fecha o dropdown (toggle)
- ESC ou click fora: fecha
- O dropdown tem **largura mínima de 160px**
- O dropdown contém atualmente **uma única opção**: **"Descartar"** (com ícone de lixeira ao lado do texto)
- Click em "Descartar":
  - **Comportamento esperado** (não implementado): pede confirmação ("Tem certeza? Esta ação não pode ser desfeita.") + remove o card do estado e da UI
  - **Comportamento atual:** só loga no console

### Por que botões só no hover?

Decisão UX: o card já tem muita informação. Botões de ação sempre visíveis poluem. No hover, o usuário já demonstrou interesse no card — é o momento certo pra revelar ações.

---

## 8. Hover do título: checkbox de seleção

### O que é
Um **checkbox quadrado** que aparece à **esquerda do título** quando o usuário passa o mouse especificamente sobre a linha do título.

### Aparência
- 16x16px, borda cinza, fundo branco quando não marcado
- Marcado: fundo teal `#3A9B9E`, borda teal, ícone de ✓ branco no centro

### Animação
- Quando o usuário entra com o mouse na linha do título:
  - Checkbox **desliza de width 0 pra width 16px** (180ms)
  - Texto do título acompanha o deslocamento (vai pra direita pra abrir espaço)
- Quando sai:
  - **Inverso**: checkbox desliza pra largura 0 e some

### Interação
- Click no checkbox:
  - Seleciona o card (borda fica teal)
  - O checkbox fica **permanentemente visível** (não some no mouse-leave)
- Click de novo no checkbox marcado: desmarca, checkbox volta a sumir no mouse-leave

### Quando NÃO mostra
- Se o usuário está editando o título no detalhe (não acontece pelo card — então não há conflito)
- Durante drag

### Pra que serve a seleção?
Bulk actions — selecionar vários cards de uma vez pra:
- Mudar status em lote
- Adicionar segmentos em massa
- Atribuir responsável a vários
- Descartar em lote

**Pendente:** a toolbar/UI pra ações em lote depois da seleção ainda não foi desenhada. Quando o usuário seleciona 1+ cards, **aparecer uma barra fixa no rodapé** com as ações disponíveis seria o padrão.

---

## 9. Drag and drop

### Origem

O usuário pode arrastar o card a partir de **qualquer parte do card que não seja interativa**:
- Padding, áreas mortas, textos não-componente: **pode arrastar**
- Componentes editáveis (chips, pills, valor): **NÃO arrasta** (click neles edita)
- Checkbox e botões flutuantes: **NÃO arrasta**

### Destinos

- Cards podem ser arrastados **entre lanes** no Board (muda a etapa da licitação)
- Cards **não podem** ser arrastados **dentro da mesma lane** pra reordenar (a ordem é determinada por outros critérios — data, prioridade)
- Cards não podem ser arrastados pra fora do Board (ex: outra tela)

### Feedback visual durante o drag

- Card original: opacidade reduzida pra ~50%
- Um **ghost** (clone visual do card) segue o cursor
- Ghost tem:
  - Fundo branco
  - Borda cinza
  - Sombra leve (pra parecer "flutuando")
  - Pequena rotação (~0.5°) pra dar dinamismo
- Lane de destino ao passar por cima: **borda azulada** + leve mudança de fundo
- Cursor: muda pra "grabbing" (mãozinha fechada)
- Tooltips e previews ficam **suprimidos** durante o drag

### Edge cases

- **Drag cancelado** (usuário solta fora de lane válida): card volta pra posição original com animação suave
- **Drag rápido**: o ghost deve seguir o cursor sem lag perceptível
- **Drag começando do checkbox**: bloqueado (impede confusão entre selecionar e arrastar)

### Bug conhecido
- **Safari**: o ghost (clone) não aparece corretamente. Funciona em Chrome. Precisa de fix.

---

## 10. Sistema de cores em profundidade

### 10.1 Segmentos (8 categorias)

Por que estas 8 e não outras? Decidimos as 8 mais frequentes no histórico de licitações analisado. Pode haver expansão futura, mas qualquer nova categoria precisa de cor própria (não reusar).

| Categoria | Hex | Quando aplicar |
|---|---|---|
| Tecnologia | `#4579A6` (azul) | TI, software, telecom, redes, infraestrutura digital |
| Materiais | `#694500` (marrom escuro) | Materiais de construção, suprimentos físicos, insumos |
| Saúde | `#2B6339` (verde escuro) | Equipamentos médicos, fármacos, serviços de saúde |
| Educação | `#46467D` (roxo escuro) | Material didático, infraestrutura escolar, treinamento |
| Engenharia | `#A26053` (terracota) | Projetos, obras de engenharia, consultoria técnica |
| Serviços | `#835B8E` (lilás) | Limpeza, segurança, alimentação institucional, geral |
| Construção | `#707735` (oliva) | Obras civis, reformas, pavimentação |
| Alimentação | `#783B54` (vinho) | Fornecimento alimentar, refeições, gêneros |

**Texto sobre os fundos**: sempre **branco** (todas as cores foram escolhidas com contraste suficiente).

**Acessibilidade**: todas têm contraste de pelo menos 4.5:1 sobre branco — atende WCAG AA pra texto normal. Conferir tons exatos antes de produção.

### 10.2 Status (7 estados, 3 famílias)

A escolha das cores comunica o **estado emocional/de risco** do status, não só o estado factual:

#### Verde (positivo, sob controle)
| Status | Quando |
|---|---|
| Abertas para participação | Edital publicado, ainda dentro do prazo de inscrição |
| Homologada | Resultado oficializado a favor (cenário positivo) |

#### Âmbar (em andamento, atenção)
| Status | Quando |
|---|---|
| Em disputa ou Homologação | Disputa lances em andamento OU aguardando homologação |
| Suspensa | Paralisada temporariamente (decisão judicial, recurso, etc.) |

#### Vermelho (negativo, encerrado mal)
| Status | Quando |
|---|---|
| Anulada | Licitação anulada (vício jurídico) |
| Revogada | Revogada pela administração antes da homologação |
| Deserta ou Fracassada | Sem licitantes habilitados OU sem propostas válidas |

**Tons exatos** (precisa conferir no protótipo, são tons levemente dessaturados pra não competir com os chips coloridos de segmento).

### 10.3 Data de envio (urgência)

Lógica: **quanto mais próximo da data, mais alarmante a cor**.

| Diferença até a data | Cor | Significado |
|---|---|---|
| Hoje (diff = 0) | **Vermelho** | "Agora ou nunca" |
| 1 a 7 dias | **Âmbar** | "Atenção, semana decisiva" |
| 8+ dias OU data passada | **Neutro** (cinza escuro) | Sem destaque |

**Decisões:**
- **Data já passada não recebe destaque vermelho** — assumimos que se passou e o card ainda está ativo, o usuário sabe disso (ou foi atualizada). Vermelho só pra urgência futura.
- **Não há "amanhã" especial** — entra na faixa 1-7 dias normal.
- **A regra usa o fuso local do usuário** (não considera fuso da licitação).

### 10.4 Empty hints

Todos os placeholders de empty state usam **cinza claro** (~45% de cinza) — visível mas não compete com conteúdo real.

---

## 11. Popovers de edição (regras gerais)

Aplica a TODOS os editores (status, segmentos, responsáveis, data, valor, kebab).

### Posicionamento

- Aparece **4px abaixo** do componente clicado
- **Alinhado à esquerda** do componente
- Se passar do **lado direito** da viewport: alinha à direita
- Se passar **embaixo** da viewport: flip pra cima (aparece **4px acima** do componente)
- Mantém **pelo menos 8px** de margem das bordas da viewport

### Largura

- **Mínimo padrão**: 280px (suficiente pra listas com busca)
- **Mínimo do kebab menu**: 160px (menor, é só um item)
- **Não tem máximo** — cresce com o conteúdo

### Altura

- Listas têm **scroll vertical** se passar de 240px
- Scrollbar customizada (sutil, cinza claro)

### Animação de entrada

- Aparece em 100ms
- Combina **fade in** (opacidade 0 → 1) + **translate vertical de 4px pra baixo** + **scale 0.98 → 1**
- Easing: cubic-bezier(.2, .9, .2, 1) — overshoot leve, ágil

### Fechamento

Fecha quando:
- **Click fora** do popover (em qualquer área da tela que não seja ele)
- **ESC**
- **Click em um item** (no caso de single-select, ou no botão de fechar do calendário)
- **Click no próprio botão que abriu** (toggle — caso do kebab e do status)
- Abrir outro popover (fecha o atual)

### Comportamento de scroll do background

- O scroll da página fica **livre** quando popover aberto (não bloqueia)
- Mas o popover **não acompanha** o scroll — ele desaparece se sair da viewport? Ou fica fixo? **Decisão pendente**.

### Busca em popovers com lista

- Aparece um **input no topo** do popover
- Auto-foco ao abrir
- Filtra a lista em tempo real (ao digitar)
- Quando não acha resultado:
  - Para segmentos: mostra "Criar 'X'" (X = o texto digitado)
  - Para responsáveis: mostra "Nenhum resultado"

### Salvamento

- **Auto-save** ao fechar o popover (não há botão "Salvar" explícito)
- Mudanças intermediárias (ex: marcar/desmarcar várias vezes) ficam no estado local até fechar
- Não há "Cancelar" — se fechar com ESC, **mantém as mudanças** (decisão atual; pode revisar)

### Tooltips dentro de popovers

- Não há tooltip dentro de popover (evita complexidade)

---

## 12. Painel de detalhe da licitação

### Quando abre
- Click em qualquer área **não-editável** do card (título, edital, órgão, objeto, cidade, ou áreas "mortas")
- Click no botão "Abrir card" do kebab menu (se existir — decisão pendente se adicionar)

### Como abre
- **Painel lateral** (slide-in da direita)
- Ocupa ~40% da largura da tela
- Backdrop **semitransparente** atrás do painel (escurece um pouco a board)
- Animação de entrada: slide horizontal de 200ms

### Como fecha
- ESC
- Click no backdrop (fora do painel)
- Botão X no canto superior do painel
- Click em outro card (abre o detalhe do outro, fechando este)

### Conteúdo do painel
- **Mostra o card inteiro expandido**
- TODAS as propriedades ficam editáveis inline (título, objeto, etc. — não só os chips)
- Tem espaço pra mais informação que não cabe no card: histórico de mudanças, anexos, comentários, etc. (**ainda não implementado** — escopo do detalhe é maior que o card)

### Sincronização
- Mudanças feitas no detalhe **devem refletir no card do Board** automaticamente quando fechar (ou em tempo real, decidir)
- Mudanças feitas no card via inline edit **devem refletir no detalhe** se ele estiver aberto

### URL
- **Decisão pendente:** deveria mudar a URL ao abrir o detalhe? (Permite compartilhar link da licitação aberta.)
- Sugestão: sim, mudar pra `/?licitacao={id}` (query param)

### Múltiplos painéis
- **Não permitir** — abrir o detalhe de um card fecha o de outro

---

## 13. Empty states (catálogo completo)

Lista de todas as situações onde uma propriedade pode estar vazia e o placeholder correspondente:

| Propriedade | Placeholder | Cor | Click |
|---|---|---|---|
| Título | "Sem título" | Cinza claro | Abre detalhe |
| Edital | "—" (em dash) | Padrão | Abre detalhe |
| Segmentos | "Adicionar segmento" | Cinza claro | Edita inline |
| Órgão | "Vazio" | Cinza claro | Abre detalhe |
| Objeto | "Vazio" | Cinza claro | Abre detalhe |
| Status | "Definir status" | Cinza claro | Edita inline |
| Responsáveis | "Sem responsáveis" | Cinza claro | Edita inline |
| Data | (sempre tem) | — | Edita inline |
| Cidade | "Vazio" | Cinza claro | Abre detalhe |
| Valor | "Vazio" | Cinza claro | Edita inline |

**Regra geral:** placeholders **mantêm a área clicável** (a linha ainda responde a click). Card nunca tem "buraco visual" — sempre algo legível.

---

## 14. Validações e edge cases

### Validações no client (UI)
- Valor: só números, "," e "."
- Data: formato dd/mm/aaaa (o calendário garante)
- Título / Órgão / Objeto / Edital / Cidade: texto livre, sem validação de formato (backend valida tamanho máximo)

### Validações esperadas no backend
- Tamanho máximo dos textos (sugestões):
  - Título: 200 caracteres
  - Edital: 30
  - Órgão: 200
  - Objeto: 5000
  - Cidade: 100
- Valor: número positivo, máximo R$ 999.999.999,99 (sanity check)
- Data: data válida no Gregorian
- Status: deve ser um dos 7 valores válidos (enum)
- Segmentos: array de strings, cada uma máx 100 chars
- Responsáveis: array de IDs de usuários existentes no sistema

### Edge cases comportamentais

**1. Card completamente vazio (todas as propriedades em empty state)**
- Deve ser renderizado normalmente, com todos os placeholders
- Não deve quebrar layout
- Comum imediatamente após criar uma licitação

**2. Texto muito longo em campos editáveis inline (ex: valor)**
- Input do popover tem largura suficiente (no mínimo 280px)
- Não deve cortar visualmente
- Backend valida tamanho

**3. Backend lento ao salvar**
- **Decisão pendente:** mostrar loading state? Otimistic update?
- Sugestão: optimistic update + retry silencioso. Se falhar 3x, mostra toast.

**4. Conflito de edição (dois usuários editando o mesmo card)**
- **Não temos resolução de conflito** ainda
- **Decisão pendente:** last-write-wins? Mostrar quem mais está editando? Locking?

**5. Card deletado por outro usuário enquanto está aberto**
- **Decisão pendente:** fechar painel + toast informativo, ou bloquear o usuário?

**6. Lista de segmentos vazia (nenhum criado ainda no sistema)**
- O popover de segmentos mostra "Criar 'X'" diretamente após digitar
- Sem busca prévia, mostra um state inicial: "Nenhum segmento criado ainda. Comece digitando."

**7. Drag interrompido (usuário solta fora de uma lane válida)**
- Card volta pra posição original com animação
- Sem toast/erro (é comportamento esperado)

**8. Ingestão de edital falha (IA não gera título)**
- Título fica vazio → mostra "Sem título"
- Usuário pode definir manualmente

---

## 15. Acessibilidade

### Navegação por teclado

- **Tab** navega entre cards no Board (ordem: por lane, top-to-bottom, esquerda-pra-direita)
- **Enter** ou **Espaço** no card focado: abre o detalhe
- **Tab** dentro de um card focado: navega entre componentes editáveis em ordem
- **Enter/Espaço** num componente editável focado: abre o popover
- **Setas ↑/↓** numa lista de popover: navega entre items
- **Enter** num item: aplica
- **ESC**: fecha popover / fecha detalhe
- **Cmd/Ctrl + A** com card focado: seleciona/deseleciona via checkbox

### Screen reader

- Cada card tem **aria-label** com resumo: "Licitação Edital X, status Y, valor Z, cidade W"
- Cada propriedade tem **aria-label** descritivo
- Chips: `role="button"` (são clicáveis pra editar)
- Status pill: lê "Status: Em disputa"
- Empty states: lêem o placeholder ("Sem responsáveis")

### Contraste

- Textos sobre cores muted (chips de segmento): todos com contraste AA (4.5:1+)
- Texto cinza escuro sobre fundo branco: AAA (7:1+)
- Empty hints (cinza claro): AA (4.5:1) — aceitável, é placeholder

### Foco visível

- **Anel de foco** azul claro ao redor do elemento focado
- Visível em todos os elementos interativos
- Não usar `outline: none` sem substituir

---

## 16. Performance

### Quantos cards podem estar visíveis simultaneamente?

- **Board com 7 lanes** e ~5 cards visíveis por lane (antes de scroll): ~35 cards renderizados
- **No total**, considerando scroll: pode ter 100-300 cards no estado, mas só ~50 visíveis por vez

### Virtualização

- **Decisão pendente:** virtualizar o scroll dentro de cada lane se passar de N cards?
- **Sugestão:** virtualizar se uma lane passar de **30 cards**

### Re-render

- Edição inline em um card **não deve re-renderizar todos os outros cards**
- Salvar uma mudança: re-renderiza só o card afetado
- Mudar de lane (drag): re-renderiza só as duas lanes envolvidas

### Lazy load

- Os **chips de segmento e pessoas**: lista de opções pode ser fetched só quando o popover abre (lazy)
- A lista de **pessoas da equipe**: cacheable, raramente muda

### Imagens (avatares)

- **Não usamos avatares** — não é uma preocupação. Se forem adicionados depois, lazy-load com fallback de inicial do nome.

---

## 17. Regras de negócio

### Quem pode editar?
- **Decisão pendente:** todos os usuários do workspace? Ou só pessoas atribuídas como responsáveis? Ou roles específicos (admin/editor/viewer)?
- **Sugestão:** todos podem editar tudo no MVP. Roles vêm depois.

### Quem pode descartar?
- **Decisão pendente:** somente quem criou? Admin? Qualquer um?
- **Sugestão:** qualquer um pode descartar, mas pedir confirmação obrigatória.

### Quem pode mover entre lanes (drag and drop)?
- **Decisão pendente:** mesma regra de editar.
- **Sugestão:** qualquer um pode mover.

### Transições de status válidas?
- **Decisão pendente:** pode pular etapas? Ex: "Abertas para participação" → direto pra "Homologada" sem passar por "Em disputa"?
- **Sugestão:** sem regra de transição no MVP. Qualquer status → qualquer status. Backend pode validar depois.

### Lanes obrigatórias?
- **Decisão pendente:** a board tem um conjunto fixo de lanes ou são configuráveis?
- **Sugestão:** lanes fixas no MVP (mesma estrutura pra todos os usuários).

### Campos obrigatórios?
- **Decisão pendente:** quais campos são obrigatórios pra criar uma licitação?
- **Sugestão:** objeto + edital + órgão como mínimos. Outros podem ser preenchidos depois.

---

## 18. Pendências detalhadas

### 18.1 Geração automática do título (alta prioridade)

- **O que precisa:** integração com API de IA (Claude Sonnet 4.6 é a opção atual) pra gerar título a partir do objeto.
- **Quando dispara:** na **ingestão** de uma nova licitação (não em runtime do card).
- **Regras detalhadas:** ver §5.1 (Título).
- **Custo estimado:** ~$0.001 por título com cache. Volume esperado: ~100 licitações/mês inicialmente.
- **Quem implementa:** backend (precisa de chave de API, prompt template, cache).

### 18.2 Ação "Descartar" (alta prioridade)

- **O que precisa:**
  1. Pedir confirmação ao usuário (modal: "Tem certeza? Esta ação não pode ser desfeita.")
  2. Se confirmar: remover o card do estado e da UI
  3. Backend: marcar a licitação como descartada (não deletar fisicamente — soft delete)
  4. Toast informativo: "Licitação descartada"
- **Decisão pendente:** o que mostrar no toast? Botão de "Desfazer"?
- **Sugestão:** sim, oferecer "Desfazer" por 5 segundos antes de confirmar a remoção no backend.

### 18.3 Botão "Copiar link" (média prioridade)

- **O que precisa:**
  1. Gerar URL única do card (ex: `https://app.settle.com/licitacao/{id}`)
  2. Copiar pro clipboard via navigator API
  3. Toast: "Link copiado"
- **Backend:** garantir que a URL abre direto no detalhe da licitação.

### 18.4 Toolbar de seleção múltipla (média prioridade)

- **O que precisa:**
  1. Quando 1+ cards selecionados via checkbox: aparece **barra fixa no rodapé** da tela
  2. Mostra contador ("3 selecionados")
  3. Botões: Descartar / Mudar status / Atribuir responsável / Limpar seleção
  4. ESC limpa a seleção
- **Design da toolbar:** pendente.

### 18.5 Histórico de mudanças (baixa prioridade)

- **O que precisa:** registrar quem mudou o quê, quando.
- **Onde aparece:** seção dentro do painel de detalhe.
- **Granularidade:** cada mudança de status, atribuição, etc.
- **Decisão:** vale fazer no MVP ou esperar feedback dos usuários?

### 18.6 Comentários no card (baixa prioridade)

- Discussão entre membros da equipe sobre uma licitação específica.
- Aparece no painel de detalhe.

### 18.7 Anexos no card (baixa prioridade)

- Upload de documentos relacionados (proposta, planilhas, etc.)
- Aparece no painel de detalhe.

### 18.8 Bug: drag and drop no Safari

- O ghost (clone que segue o cursor) não aparece corretamente.
- Funciona em Chrome.
- **Investigação pendente:** API de drag and drop nativa do HTML5 tem comportamentos diferentes entre navegadores. Pode precisar de lib externa (ex: SortableJS) ou implementação custom.

---

## 19. Decisões em aberto

Lista do que ainda precisa de decisão de produto antes ou durante implementação:

1. **Salvamento e feedback** — optimistic update vs loading spinner vs toast de confirmação?
2. **Conflito de edição** — dois usuários editando o mesmo card simultaneamente: como resolver?
3. **Erro de rede** — reverter visualmente + retry? Toast com botão "tentar de novo"?
4. **URL ao abrir detalhe** — mudar URL pra permitir compartilhar link?
5. **Toolbar de seleção múltipla** — onde fica? Que ações inclui?
6. **Permissões/roles** — todos editam tudo, ou tem hierarquia?
7. **Transições de status válidas** — pode pular etapas ou tem fluxo obrigatório?
8. **Lanes configuráveis** — fixas ou customizáveis por usuário/workspace?
9. **Campos obrigatórios** — mínimo pra criar uma licitação?
10. **Limite de responsáveis exibidos no card** — truncar e mostrar "+3"?
11. **Histórico de mudanças no MVP** — fazer agora ou depois?
12. **Limite de cards por lane** — quando virtualizar?

---

## 20. Princípios de implementação

Pra orientar o time durante a construção:

### 20.1 Single source of truth visual

O **card no Board** é a referência visual de tudo. Mudou no Board → propaga pras outras views (tabela, calendário, detalhe). **Nunca** criar variação de aparência específica de uma view sem decisão consciente.

### 20.2 Click-to-open é o padrão; click-to-edit é exceção

Quando tiver dúvida sobre o comportamento de algo novo: **default é abrir detalhe**. Edição inline só pra componentes visualmente distintos (chips, pills) e ações rápidas.

### 20.3 Hover feedback é sutil

Nada deve "piscar", "saltar" ou ser agressivo. Crescimento de 0.5%, mudança de brightness de 8%, fundo cinza com 6% de opacidade. Subtle é a regra.

### 20.4 Tooltips ajudam, mas com delay

Todo tooltip aparece após **250ms** de hover. Não dispara em mouse de passagem. Conteúdo curto, descritivo, sem encerramento dramático.

### 20.5 Empty state nunca é vazio

Toda propriedade tem placeholder clicável. Nunca deixar buraco visual ou ação inacessível.

### 20.6 Animação serve a função

Cada animação tem motivo:
- Crescimento do card: feedback de "estou clicável"
- Slide do checkbox: revelar gradualmente sem chocar
- Pop do popover: feedback de origem (de onde abriu)

Sem animação decorativa.

### 20.7 Cor comunica semântica

- Vermelho = perigo/atenção urgente
- Âmbar = atenção média
- Verde = positivo/sob controle
- Teal = seleção (cor da marca)
- Cinza = neutro/inativo

Não usar essas cores fora desses significados.

### 20.8 Acessibilidade não é opcional

Cada componente novo passa por checklist:
- Funciona com teclado?
- Tem aria-label?
- Tem contraste suficiente?
- Tem foco visível?

---

## Anexo: referências

- **Protótipo HTML funcional** (interativo): `licitacoes-em-andamento-card/prototype.html`
- **Implementação no Kanban**: `licitacoes-em-andamento/app.js` + `styles.css`
- **Versão pública (deploy atual)**: https://brunnobkm.github.io/Settle/settle-licitacoes-em-andamento/
- **Padrão de referência externa**: Notion (board view de databases) — validado tecnicamente via inspeção do DOM durante a sessão de prototipagem
- **Repo do código**: https://github.com/brunnobkm/Settle (privado) e https://github.com/brunnobkm/settle-licitacoes-em-andamento (público, deploy do GH Pages)
