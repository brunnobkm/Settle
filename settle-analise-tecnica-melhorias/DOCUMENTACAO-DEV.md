# Análise Técnica: documentação das mudanças

**Protótipo navegável:** https://brunnobkm.github.io/Settle/settle-analise-tecnica-melhorias/
**Base:** reunião de refinamento de 28/07/2026 (Brunno, Alice, Gabriel, José Victor) e conversas anteriores com a Alice.

Este documento descreve como a tela de Análise Técnica deve se comportar. A linguagem é proposital para qualquer pessoa entender, não só quem programa. Sempre que possível, abra o protótipo ao lado para ver o comportamento acontecendo.

---

## 1. A grande mudança

Hoje a análise técnica é feita separada: uma análise para Produto e outra para Software. A proposta é passar a organizar **por item do edital**.

- Cada item vira um **card clicável** na lista.
- Um item pode ser de **Produto**, de **Software**, ou dos **dois ao mesmo tempo** (item misto).
- Ao clicar no card, abre a análise completa daquele item em **tela cheia**.

O objetivo é sair de uma tela só informativa e virar uma ferramenta de decisão: o analista entende rápido o que atende, o que não atende, e escolhe o produto da proposta ali mesmo.

---

## 2. A lista de itens (tela inicial)

No topo, quatro indicadores de resumo: **Aderência do edital (%)**, **Itens analisados**, **Itens que atende**, **Itens que não atende**.

Abaixo, os filtros **Todos / Atende / Não atende** e a lista de cards.

**Cada card mostra:**
- Número do item (ex.: "Item 1"), tipo (Produto / Software) e o **status**.
- O status é apenas **"Atende"** ou **"Não atende"** (sem detalhar quantos requisitos, ex.: não usar mais "Não atende · 13/14").
- A **badge do produto** (ver seção 7).
- Descrição do item, quantidade, valor unitário e valor total.

**Comportamento:** ao passar o mouse em cima, o card cresce um pouco (mesmo efeito do card de manifestação e do card da home).

---

## 3. Abrindo um item (tela cheia)

**Cabeçalho:**
- Título no formato "Item N · Nome curto". Esse nome curto é um **rótulo gerado pela IA** a partir da descrição do item no edital, só para facilitar a leitura. Não é texto literal do edital.
- Botão **"Editar informações do item"** (verde): edita quantidade, unidade de medida, valor unitário e valor total.
- Botões de compartilhar, exportar e fechar.
- Navegação **"Item N de 7"** com setas anterior/próximo.

**Barra de informações** (logo abaixo do cabeçalho): Quantidade, Unidade de medida, Valor unitário e Valor total. Ela **some quando o usuário rola para baixo e reaparece quando rola para cima**; quando ela some, o card da tabela cresce para ocupar o espaço liberado.

**Descrição completa** e **Especificações não exigidas** ficam em blocos recolhíveis logo abaixo, **abertos por padrão**. A "Descrição completa" só existe quando o item tem Produto.

### Altura e rolagem (importante)

O card da análise (o bloco "Categoria... Melhor produto... tabela") tem **altura igual à tela do usuário menos os cabeçalhos fixos visíveis** (o "Item N..." sempre, e a barra "Quantidade..." enquanto ela estiver visível). Ou seja, o card **sempre ocupa o máximo da tela**, independentemente do que está aberto acima (Descrição/Especificações, que rolam por cima); e quando a barra "Quantidade" some ao rolar, o card cresce mais um pouco.

- A **rolagem dos requisitos acontece dentro do card** (a tabela rola por dentro), não na página inteira.
- O **cabeçalho da tabela** (os cards dos produtos) e as **duas primeiras colunas** ficam travados enquanto se rola a tabela.
- Os **dois cabeçalhos** (item e "Quantidade") ficam fixos no topo e nunca podem ser sobrepostos por outro conteúdo (fundos opacos).
- Todo o espaçamento da tela é **16px**: margens laterais, topo, espaço entre os cards e a folga embaixo.
- A altura **recalcula** quando a janela muda de tamanho e quando os blocos de Descrição/Especificações são abertos ou fechados.

*Nota técnica:* como `<details>`/`<summary>` no Chrome novo isola o conteúdo em `::details-content` e quebra o flexbox, a altura da área de rolagem foi calculada por JS (`altura da janela − os dois cabeçalhos − cabeçalho do card − paddings`), recalculada em `resize` e no `toggle` dos blocos. Se a estrutura de produção não usar `<details>`, dá para fazer 100% em CSS com flexbox (coluna: cabeçalhos fixos + área da tabela `flex:1; min-height:0; overflow:auto`).

---

## 4. A seção de análise (Produto ou Software)

Dentro do item, cada tipo aparece como uma **seção recolhível**. Um item misto tem duas seções (uma de Produto e uma de Software).

**No topo de cada seção:**
- **Categoria** (menu suspenso editável): é a categoria que define **com qual catálogo o item é comparado** (ex.: "Câmera de segurança" para produto, "Software de vídeo monitoramento" para software). O usuário precisa poder trocar, porque se a categoria estiver errada a comparação é feita contra o catálogo errado. Vale para Produto e para Software. No protótipo o menu está pronto na interface, ainda sem funcionar de verdade.
- **Badge do produto** (Melhor produto / Produto escolhido, ver seção 7).
- **Status "Atende / Não atende"**, alinhado à direita.
- Botão de edição **verde, sem ícone de lápis**: chama-se **"Editar"** na seção de Produto e **"Revisar Requisitos"** na seção de Software.
- Menu **"Mais ações" (ícone de três pontos)** com: **Concluir análise**, **Importar** e **Exportar**.

---

## 5. Seção de Produto (tabela de comparação)

É uma tabela que compara os **produtos do catálogo do cliente** com as **exigências do edital**.

- **Linhas:** os requisitos do edital.
- **Colunas fixas (à esquerda):** "Especificações do edital" e "Valor requerido".
- **Demais colunas:** um produto (SKU) do catálogo em cada uma.

**Como cada coluna de produto é organizada (de cima para baixo):**
1. Nome do modelo (vem primeiro).
2. Fabricante.
3. Percentual de aderência em destaque, com a fração (ex.: 93% · 13/14) e uma barra.
4. Preço.
5. Origem do dado (ícone) e estoque, **abaixo do preço** (ver seção 7).
6. Botão "Selecionar", que vira "✓ Selecionado" quando o produto é escolhido para a proposta.

**Outros comportamentos:**
- **"Especificações não exigidas pelo edital":** bloco recolhível que lista o que o produto oferece a mais e o edital não pede. Aparece **só em Produto**.
- **Copiar o valor:** em qualquer célula da tabela aparece um botão de copiar ao passar o mouse.
- **Editar o valor requerido:** direto na célula (aparece um lápis ao passar o mouse). Na primeira edição, um aviso explica que editar direto perde o vínculo com o trecho do edital.
- **Adicionar requisito:** acontece **só dentro do botão de edição da seção**, nunca solto na tabela.
- A seção de Produto **não tem** a coluna de Ações (link/excluir por linha).

---

## 6. Seção de Software (checklist)

Traz um seletor de visão no topo: **"Visão em requisito"** e **"Visão em bloco"**.

**Visão em requisito** (tabela, igual à produção):
Colunas: **Requisito / Status / Confiança IA / Justificativa IA / Módulo / Responsável / Notas**, e uma coluna final **"+"** para adicionar coluna.
- O **cabeçalho e a primeira coluna ficam fixos** ao rolar (para conseguir analisar quando há muitos requisitos).
- O Status é uma etiqueta clicável (abre a lista de status).
- Na coluna Notas, aparece "+ Nota" ao passar o mouse.

**Visão em bloco** (tabela agrupada por módulo):
Uma linha por módulo, com as colunas **Módulo / Responsável / Total de Requisitos / Atende / Atende parcialmente / Atende com parceiro / Não atende / Sem estado** (cada status com contagem e percentual) e **Ações** (excluir e ir para o módulo).

---

## 7. Detalhes visuais (o que mudou de aparência)

**Badge do produto** (aparece no card da lista e no topo da seção):
- **Melhor produto:** etiqueta cinza escrita "Melhor produto: {modelo} · {fabricante}".
- **Produto escolhido:** etiqueta **verde** escrita "✓ Produto escolhido: {modelo} · {fabricante}". Quando o usuário escolhe um produto, essa etiqueta substitui a de "melhor produto".

**Ícone de origem do dado (na coluna do produto):**
- **Livro** = catálogo do cliente. **Globo** = dado da internet (fonte externa).
- Fica **verde quando tem link** para conferir a origem (abre o PDF/página) e **cinza quando não há link**.

**Estoque:** etiqueta "Com estoque" ou "Sem estoque", ao lado do ícone de origem, abaixo do preço.

**Botões de edição:** tanto o "Editar informações do item" (cabeçalho) quanto o "Editar" / "Revisar Requisitos" (seção) são **verdes e sem o ícone de lápis**.

---

## 8. O que NÃO é para fazer agora (escopo)

Para evitar retrabalho, estes pontos ficaram **de fora desta entrega**:

- **Visão em bloco do software:** o layout já está definido e simulado no protótipo (tabela agregada por módulo, igual à produção). A ligação com dados reais e as ações da coluna Ações são da etapa de implementação.
- **Travar / destravar colunas** manualmente: é uma melhoria geral de tabela para depois. Por ora, apenas o cabeçalho e a primeira coluna já ficam fixos.
- **Trocar o tipo Produto ↔ Software** de um item: fora de escopo por enquanto.
- **Item misto em produção:** no protótipo ele existe como visão de futuro. Hoje, quando existir, é apenas Produto + Software (não entra Serviço).
- **Extrair / Revisar requisito como botão da barra de ações:** fica de fora dos botões.

---

## 9. Pontos ainda em aberto (a decidir com a Alice)

- Se **Questionamento** e **Impugnação** entram como indicadores no resumo executivo ou vão para outra área (Jurídico / Notificações).
- Confirmar o comportamento fino do menu de categoria quando o produto está fora do catálogo (fluxo de "solicitar inclusão no catálogo").

---

*Qualquer dúvida sobre um comportamento específico, o mais rápido é abrir o protótipo no link acima e navegar até o item correspondente.*
