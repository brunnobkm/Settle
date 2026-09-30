# Configurações da organização: regras de negócio

Task do Notion: "Fluxo para Configurações da Plataforma" (Alice Iglesias, 12/09/2026).
Protótipo: `Plataforma/configuracoes/index.html`.

## Onde configurar

**Uma área só, Configurações, no padrão do Linear.** A sidebar da plataforma dá lugar à
navegação das configurações ("Voltar para a plataforma" no topo) e cada página é uma coluna de
caixas com linhas. Entrada principal pelo menu do usuário (rodapé da sidebar), que hoje tem
Gerenciar equipe, Auditoria e Atalhos do teclado. Equipe e Auditoria migram para dentro.

**Menu do usuário (proposta de 18/09):** um item só, **Configurações**, e não a lista de
seções. O menu fica com Configurações, Atalhos do teclado e Sair. Configurações só aparece para
administrador. Motivos: são 8 seções e a lista vai crescer (um menu com 8 ou mais itens fica
comprido), a área já tem sidebar própria com as seções, e colocar as seções na sidebar da
plataforma ocuparia espaço de todo mundo com algo de uso raro e só de admin. Protótipo em
`Plataforma/licitacoes-recomendadas/` (clique no avatar).

Cada configuração também abre **de onde ela é usada** (atalho só para administrador, leva
para a mesma página):

| Configuração | Atalho no contexto |
|---|---|
| Etapas do funil | Em andamento, menu `⋯` da coluna, Editar etapas |
| Abas das listas | Recomendadas e Descartadas, `⋯` ao lado das abas, Editar abas |
| Motivos de descarte | Modal de Descartar, Gerenciar motivos |
| Motivos de perda | Diálogo de registrar o resultado, Gerenciar motivos (leva a Etapas do funil) |
| Campos do card | Recomendadas, Ordenar, Personalizar campos do card |
| Modelo de e-mail | Modal Compartilhar licitação, Editar modelo de e-mail |

Por que as duas coisas: a área central é onde o admin descobre o que pode mudar; o atalho é
onde ele percebe que precisa mudar. O Linear faz igual (Settings central, mais "Edit statuses"
no próprio board).

## Quem pode (RBAC)

Usa as quatro funções que já existem (Visualizador, Editor restrito, Editor completo,
Administrador). **Configuração da organização é só Administrador.**

- Negado por padrão. Quem não é admin não vê a seção de organização nem os atalhos.
- Link direto sem permissão abre a tela "Só administradores alteram" com o nome dos admins.
- A regra vale no backend (403). A tela é só a primeira defesa.
- Toda alteração vai para a Auditoria: quem, quando, área, antes e depois.
- **Edição simultânea (vale para todas as seções):** se dois administradores mexem na mesma
  configuração ao mesmo tempo, a última gravação vence, e quem está com a página aberta
  recebe o aviso de que a configuração mudou, com a opção de recarregar. **Pergunta em
  aberto:** a organização pode ter mais de um administrador? Se não puder, esta regra sai.
- **Abas:** só o Administrador cria, renomeia, muda os filtros padrão, reordena, duplica e
  exclui. As outras funções usam as abas, podem adicionar filtros extras só para si e não
  veem o `+` nem o menu de editar. Isso corrige a ambiguidade do documento de RBAC
  ("permitido na própria conta"): não existe aba da própria conta nesta fase.

**Dependência do RBAC (decidida em 21/09):** na versão vigente do documento
"[Vanta - Tecnologia] Permissionamento APP" (V2.1, ABAC em YAML) só existem três papéis reais
(somente-ver, editar-o-seu, editar-geral); o Administrador está lá só como marcação para o
futuro, não há permissão `org.*` e não há admin dentro do app. Para Configurações existir:

1. criar no RBAC uma permissão nova para gerenciar as abas das listas (por exemplo
   `org.tabs.manage`), concedida só ao Administrador;
2. o Administrador passar a ser um papel real no RBAC.

As outras configurações da task "Fluxo para Configurações da Plataforma" seguem o mesmo
caminho, cada uma com a sua permissão (ou uma `org.settings.manage` geral).

## 1. Modelo de e-mail

- Um modelo por organização, usado em Compartilhar licitação (Gmail e Copiar texto).
- Assunto e corpo com variáveis. `/` abre a lista; também há o botão Inserir variável.
- Variáveis de duas origens: as da Settle (somente leitura) e as da organização, criadas em
  Agentes. É o mesmo catálogo e o mesmo componente de chip do projeto Agentes.
- **Variável vazia**: a organização escolhe entre escrever "não informado" ou tirar a linha
  inteira. A pré-visualização mostra o caso com licitação real e lista o que está vazio.
- Variável excluída em Agentes: o chip fica em vermelho (estado `quebrada` que já existe no
  `settle.css`) e o modelo avisa antes de salvar.
- Restaurar padrão da Settle sempre disponível.
- Em aberto: mais de um modelo (ex.: um para diretoria, outro para parceiro) escolhido na hora
  de compartilhar. Fica para depois de validar o uso de um.

## 2. Motivos de descarte

- **Só descarte nesta seção** (decidido em 27/09). Ganhou ou Perdeu é decisão do funil, não do
  descarte: acontece quando a licitação chega na etapa de saída. Por isso os **motivos de perda
  ficam na seção 5, Etapas do funil**, junto da etapa em que o resultado é registrado. As regras
  de lista (renomear, arquivar, pedir descrição) são as mesmas nos dois lugares.
- **Uma lista só, e cada motivo diz onde aparece** (decisão de 30/09). Existia um interruptor
  "Mesma lista em Recomendadas e Em andamento", ligado por padrão, que escondia as pílulas de
  tela. Ele saiu: a escolha de tela agora está sempre visível em cada motivo, porque era uma
  configuração a mais para chegar numa decisão que a pessoa toma motivo a motivo, e porque com
  ele ligado ninguém descobria que dava para separar (a Larissa levantou isso no refine, e a
  Alice sugeriu abrir com ele desligado; tirar resolve os dois). Guarda-se sempre uma lista só;
  a tela é um atributo do motivo.
- Um motivo precisa aparecer em pelo menos uma das telas.
- **Só existe arquivar** (refine de 28/09). Não há excluir: a pessoa não precisa entender a
  diferença, e ninguém apaga um motivo de que o histórico depende. Motivo já usado sai das
  novas escolhas, continua nas licitações que o usaram, no filtro de Descartadas e no
  dashboard, e pode ser restaurado.
- **Arquivado sem nenhuma licitação não aparece em Arquivados.** Não há histórico a preservar,
  então some da tela: na prática é o antigo excluir, sem o nome e sem a explicação. O aviso com
  Desfazer continua, para o caso de engano. Acima da lista de Arquivados fica escrito que ali
  só estão os motivos que já têm licitação.
- O diálogo de confirmação muda conforme o caso: com licitações, explica que elas continuam
  como estão; sem nenhuma, diz que nada se perde e que ele não fica guardado.
- **O contador da linha fala de licitações**, não de descartes nem de perdas (Alice, refine
  28/09: "eu também padronizaria ali licitações"). É a unidade que a pessoa conhece, e serve
  igual nas duas listas: "412 licitações", "1 licitação", "nunca usado". O que aquele número
  conta continua explicado no "i" ao lado.
- **Nome repetido é recusado**, como já acontece em abas e etapas: o campo volta ao valor
  anterior e explica no aviso. Vale contra os motivos ativos, contra os arquivados ("Restaure
  X em Arquivados") e contra "Outros", que é da plataforma. Motivo novo já nasce com nome
  livre ("Novo motivo 2" se "Novo motivo" existir).
- Renomear muda o nome em todas as licitações que já usaram (o vínculo é por ID). Se a
  intenção for outro significado, o certo é arquivar e criar um novo; a tela avisa quantas
  licitações serão afetadas.
- "Outros" é fixo e tem descrição obrigatória.
- **São duas perguntas diferentes, e a tela precisa dizer isso.** "Exigir motivo ao descartar"
  é um interruptor da organização e decide se **escolher** um motivo da lista é obrigatório
  para concluir o descarte. **Descrição obrigatória** é por motivo e decide se, depois de
  escolhido, a pessoa ainda precisa **escrever** o porquê. Um é sobre escolher, o outro é
  sobre escrever, e eles se combinam: dá para não exigir motivo nenhum e, ainda assim, ter um
  motivo que exige descrição quando alguém o escolhe.
- **A chave se chamava "Pede descrição" e virou "Descrição obrigatória"** (Willian, 30/09): na
  plataforma o campo de descrição já existe em todos os motivos e é opcional, e as pessoas de
  fato escrevem em motivos diferentes. "Pede descrição" dava a entender que a chave fazia o
  campo aparecer. Ela não cria o campo: só tira o "opcional" dele naquele motivo.
- **Descrição obrigatória** (feedback da Alice, 18/09): qualquer motivo pode exigir que a
  pessoa escreva o porquê ao escolhê-lo. Ligar não afeta os descartes já feitos sem descrição.
  É por motivo porque só alguns precisam de explicação: "Fora do segmento" se explica
  sozinho, "Outros" não.

**Tirar um motivo de uma tela é um arquivamento parcial, e a tela precisa mostrar isso**
(Willian, 30/09). O contador de um motivo é a soma das duas telas: "412 licitações" escondia
que 200 delas foram descartadas em Em andamento e 212 em Recomendadas. Duas consequências:

- O "i" do contador **abre a conta por tela** sempre que o motivo tem licitação nas duas.
- **Desativar uma tela sempre pede confirmação**, com o número daquela tela e a regra de
  sempre: o que já aconteceu não muda. As licitações seguem com o motivo registrado, no filtro
  de Descartadas e no gráfico do dashboard, e ativar de novo traz tudo. Ativar não pede nada.
  A confirmação aparece mesmo quando aquela tela não tem nenhuma licitação, com o texto
  ajustado ("não há histórico a preservar"): a mesma ação não pode às vezes perguntar e às
  vezes não, senão a pessoa não entende a regra e desconfia do que fez.
- **Vocabulário**: a chave se "ativa" e se "desativa", nunca "liga" e "desliga". Um motivo é
  "arquivado", um campo é "removido do card", e nenhum dos dois é "tirado". As licitações são
  "descartadas por este motivo" (não "com este motivo") e, depois do arquivamento, "seguem com
  o motivo registrado" (não "continuam com ele").
- Na interface isso **não se chama "arquivado"**. Arquivados é outra seção e só recebe motivo
  arquivado inteiro; usar a mesma palavra faria a pessoa procurar lá e não achar. Internamente
  pode ser um arquivamento por escopo, desde que o histórico não mude, que religar volte ao
  estado anterior e que o escopo volte como estava quando um motivo arquivado for restaurado.

**Como avisar que falta o motivo, nas duas listas.** Hoje a plataforma faz de dois jeitos: o
descarte (`DiscardReasonDialog`) deixa o botão clicável e, ao confirmar sem motivo, marca o
campo em vermelho, mostra a mensagem abaixo dele e dispara um toast; o registro de perda
(diálogo "Resultado da Licitação") desabilita o botão. **A direção é a do descarte:** botão
sempre habilitado, erro claro na hora de confirmar. Botão desabilitado não diz o que falta
nem o que fazer, e some com o motivo da recusa justamente de quem precisa dele. O protótipo
segue essa direção em todos os lugares, inclusive no registro de resultado da remoção de
etapa, e por isso os textos da tela falam da regra ("precisa escolher um motivo para
concluir"), não do mecanismo. **O botão desabilitado do registro de perda é para corrigir.**
- Hoje existem 15 motivos de descarte (incluindo Outros).

## 3. Campos da licitação

- **A lista tem duas seções, e só duas: Datas e Propriedades.** São as duas caixas de verdade
  do card, e por isso são as únicas que valem como seção na configuração. Todo o resto (as
  peças do topo e os campos do corpo: segmentos, órgão, ME/EPP, objeto, valor) fica solto no
  começo da lista, na ordem em que aparece no card. "Metadados" passou a se chamar
  **Propriedades**, que é o nome certo.
- **Arrastar é o que muda a seção.** O campo assume o lugar de quem estava onde ele foi
  solto: soltar um campo do corpo entre as datas o põe na caixa das datas, e tirá-lo de lá o
  devolve ao corpo. Não há seletor: a posição na lista é a configuração.
- Seção sem nenhum campo continua na tela com a linha "Arraste um campo para cá", senão não
  haveria como devolver um campo para ela.
- As peças do topo e a tabela de itens só mudam de ordem, nunca de seção: arrastá-las para
  dentro de uma seção é recusado com um aviso dizendo por quê.
- **Todo campo se organiza no próprio card, arrastando**: as peças do topo, os campos do corpo
  e o que está dentro das caixas de Datas e Propriedades. Arrastar de uma para outra é o que
  muda a caixa (e o formato) do campo: tirar "Envio da proposta" das datas e soltar na grade o
  transforma em propriedade; puxar "ID" da grade para o corpo o transforma em campo do corpo.
- **No corpo, o arrastar também decide a linha.** Passar o mouse mostra que
  a peça pega; ao arrastar aparecem dois tipos de alvo: o fino, entre duas peças, põe o campo
  na mesma linha; o largo, entre duas linhas, abre linha nova. É assim que se deixa, por
  exemplo, segmentos, órgão e objeto lado a lado. A linha quebra sozinha quando não cabe.
  Não há interruptor de "mesma linha": o lugar onde se solta é a configuração.
- O arrastar é por eventos de ponteiro, não pelo arrastar nativo do HTML: o nativo não pega
  em toque, exige imagem de arraste e não deixa desenhar a barra do alvo com precisão. O alvo
  sai da posição do ponteiro (perto da borda de cima ou de baixo da linha, abre linha nova;
  no meio, entra na linha), em vez de zonas invisíveis que a pessoa precisa acertar.
- Pelo teclado, com foco no campo: **Alt + ← →** muda de posição e **Alt + ↑ ↓** põe o campo
  em outra linha. Arrastar não pode ser o único caminho.
- A lista ao lado continua valendo para ligar, desligar e trocar de seção; o card cuida de
  como o corpo se organiza.
- **O topo também é configurável.** Ele deixou de ser um bloco fechado e virou sete itens:
  Seleção do card, Número do edital, Descartar, Enviar para análise, Responsáveis, Ações de
  ícone e Score. Ligam, desligam e mudam de ordem como qualquer outro campo, com uma exceção.
- **A caixa de seleção não pode ser ocultada, só reordenada.** É por ela que a pessoa marca o
  card para as ações em lote; sem ela, some o caminho para descartar, mover etapa ou registrar
  resultado em lote. Na lista ela aparece sem interruptor, com o selo "Sempre visível". Ocultar
  o número do edital não a leva junto: ela é um campo próprio.
- O número do edital fica à esquerda e empurra o resto para a direita; sem ele, quem empurra é
  a primeira peça da lista.
- **Em aberto:** desligar Descartar ou Enviar para análise tira o botão do card, mas a ação
  continua existindo no menu da linha e nas ações em lote. Confirmar com o time se é isso
  mesmo, ou se esses dois deveriam ser tratados como permissão e não como campo do card.
- Variável da organização pode virar campo. Quando não é encontrada naquela licitação, mostra
  "Não encontrado" (mesmo tratamento FOUND/NOT_FOUND/OTHER do Resumo).
- Campo oculto continua em Filtrar e Ordenar.
- **Objeto longo é o caso comum, não a exceção.** O edital de exemplo usa um objeto de
  compra de equipamento com especificação inteira no texto (565 caracteres). Hoje o card
  desenha tudo: são 5 linhas numa caixa de 832px, e o card inteiro vai a 744px de altura.
  Conferido no bundle `workflow`: o Objeto do card não tem corte nenhum hoje (`line-clamp`
  só aparece na Tabela e em outras telas). **Em aberto:** cortar em 2 ou 3 linhas com "ver
  mais", ou deixar a organização escolher quantas linhas o Objeto ocupa. Sem isso, dois ou
  três editais assim enchem a tela e a lista perde a densidade que a torna útil.
- **Quantidade de itens** (feedback da Alice, 18/09): hoje o card mostra até 5 itens com
  correspondência. O admin escolhe 3, 5, 10 ou todos; o que passar do limite fica em
  "Ver mais N itens". O contador mostra sempre o total.
- **A tabela de itens também é configurável, pelo próprio card.** Arrastar um cabeçalho troca
  a ordem das colunas (Lote, Nome, Segmento, Unidades, Valor Unitário, Valor Total), com uma
  barra mostrando onde a coluna entra. Arrastar o título "Itens com Correspondência" move o
  bloco inteiro para antes ou depois da caixa de datas e propriedades. Pelo teclado: Alt com
  as setas para os lados nas colunas, Alt com as setas para cima e para baixo no título.
- Não há mais "Ver mais N itens" embaixo da tabela: quem quer ver tudo escolhe "Todos os
  itens", e aí a tabela rola por dentro.
- **"Todos os itens" não desenha tudo de uma vez.** Um edital pode ter centenas de itens, e
  uma tabela de 800 linhas trava o card e a lista inteira. Nessa opção a tabela ganha altura
  própria (360px), rola por dentro e carrega o bloco seguinte (25 itens) quando a rolagem
  chega perto do fim. O rodapé diz "Mostrando N de M. Role a tabela para carregar mais." e,
  no fim, só o total. Nas opções 3, 5 e 10 nada disso aparece: a tabela mostra o que couber.
- **"Mostrar até" é um campo compacto**, não um rótulo escrito: o nome fica só para o leitor de
  tela e o campo mostra "Até 5 itens". A linha da tabela de itens é a mais cheia da lista, e o
  nome "Itens com correspondência" trunca com reticências em vez de quebrar em duas linhas.
- **Propriedade criada na hora.** Além de puxar uma variável do catálogo, dá para criar um campo
  próprio ali mesmo: nome e tipo (Texto, Número, Data, Sim ou não, Moeda). É o caso do substatus,
  que a pessoa preenche na licitação e não vem de variável nenhuma (Alice, semanal de 28/09:
  "ele deveria poder criar campos que não são variáveis"; refine, 45:40: a ideia no formato do
  Notion). Na lista, a propriedade própria mostra o tipo e pode ser removida. Nome repetido no
  mesmo card é recusado.
- **Variáveis como propriedade** (feedback da Alice, 18/09): qualquer variável da organização
  ou da Settle pode entrar no card. A lista do botão Adicionar é o catálogo real de
  **Variáveis** (as mesmas que os agentes usam), não uma cópia: é lá que elas nascem e é lá
  que se muda o que elas buscam. "Criar variável" abre a janela de criar sem sair daqui.
- **Editar variável abre a janela, não leva para outra página.** Na linha, cada variável tem o
  selo de origem ("Minha variável" ou "Variável Settle") e dois botões: **Editar variável**,
  que abre a mesma janela de Variáveis (nome, o que procurar no edital, formato, onde
  procurar), e **Tirar do card**. Era um link para a página de Variáveis e virou janela porque
  a pessoa está configurando o card: mandá-la para outra tela faz perder o lugar.
- **Tirar do card pede confirmação, com o impacto escrito.** Vale para variável e para
  propriedade própria, porque a mudança é para a organização inteira. O texto diz o que não
  se perde: a variável continua existindo em Variáveis, continua sendo buscada no edital e
  continua em Filtrar e Ordenar; a propriedade própria continua com o que já foi preenchido
  nas licitações, e volta a aparecer se ela for posta no card de novo.
- **As ações ficam numa toolbox à direita das abas**, no padrão da plataforma: "Adicionar
  variável", "Nova propriedade" e "Restaurar padrão da Settle". Elas são ações da área, e
  ficarem ao lado das abas deixa claro que valem para a tela aberta naquela aba. É o mesmo
  bloco visual da barra "Filtrar · Ordenar · Exportar · Buscar" que a plataforma já usa ao
  lado das abas das listas: fundo sutil, botões sem contorno. Virou o componente **Toolbar**
  na Base do design system (`Toolbar`, `ToolbarButton`, `ToolbarSeparator`), porque não
  existia e toda tela com abas vai precisar dele. Não confundir com `ActionBar`, que é a barra
  flutuante das ações em lote.
- Vale para a organização toda. **Em aberto:** permitir que cada pessoa tenha a própria
  visão por cima do padrão (o Linear faz isso por view). Recomendo começar só com o padrão
  da organização.
- **Em aberto:** Em andamento e Descartadas herdam essa configuração ou têm a sua?

**Três lugares, três configurações.** O mesmo módulo aparece na lista de Recomendadas, na de Em
andamento e dentro da licitação (o workspace), e cada um guarda a sua configuração. A troca é por
**abas dentro da própria tela**, no mesmo padrão de Abas das listas, não por uma página nova na
navegação: era o pedido da Alice, para a área não virar uma tela por lugar.

**O nome da seção deixou de ser "Campos do card"**, porque ela não trata só do card: trata do que
a licitação mostra em cada lugar, incluindo as propriedades e a tabela de itens. Agora é **Campos
da licitação**. "Restaurar padrão" vale só para a tela aberta.

**Cada aba mostra o componente que existe de verdade naquele lugar** (conferido em produção,
em app.settlegov.com, e não montado por semelhança):

- **Recomendadas**: o card cheio. Primeira linha com seleção, número do edital, Descartar,
  Enviar para análise, responsáveis, ações de ícone e Score; corpo numa caixa com borda
  (segmentos, Órgão com ME - EPP, Objeto, Valor global); as datas e as propriedades numa caixa
  só, divididas ao meio; a tabela de itens embutida no fim.
- **Em andamento**: o card do quadro, que é uma coluna do Kanban. Estreito, sem a caixa do
  corpo, **sem as caixas de Datas e Propriedades e sem a tabela de itens**: tudo o que aparece
  é linha do corpo (seleção e edital em cima; segmento, órgão, objeto cortado em três linhas,
  Responsável, Substatus, Descrição, Envio da proposta, Cidade e Valor global). Por isso a
  lista de configuração dessa aba não tem as seções Datas e Propriedades. **No quadro a linha
  do corpo não tem rótulo**, só o valor: o card real escreve "Prefeitura de..." direto, sem
  "Órgão:" na frente, porque a coluna é estreita.
- **Em andamento são três visões da mesma lista, e a configuração vale para as três.** A
  pré-visualização tem as abas Board, Tabela e Calendário, como a plataforma. No quadro os
  campos viram linhas do card; na Tabela viram colunas, na mesma ordem; no Calendário a
  licitação aparece no dia do envio da proposta e **só cabem dois campos**, os dois primeiros
  da ordem. Organizar continua sendo no quadro: é lá que se arrasta. Mostrar as três deixa
  visível o custo de uma ordem ruim, que no calendário aparece primeiro.
- **Dentro da licitação**: as ações não ficam no card, ficam no **cabeçalho da página**, ao
  lado do número do edital, que ali é o título. Não há caixa de seleção (não existe ação em
  lote dentro de uma licitação) nem "Enviar para análise" (a licitação já está em análise), e
  entram Checklist e o ícone de comentários. Os itens ficam numa **aba** própria ("Itens,
  Detalhes, Manifestações, Análise Técnica"), não dentro do card.
- **A prévia dessa aba vem dentro de uma janela de navegador** (barra com a URL
  `app.settlegov.com/biddings/<id>` e o caminho "Em andamento › Detalhes da licitação"). Sem
  a moldura ela parecia mais um card solto, e o ponto dessa aba é justamente que ali não é uma
  lista: é uma página.

**O topo do card**: só a caixa de seleção e o número do edital ficam à esquerda; todo o resto
fica à direita, e o que não couber na linha quebra continuando à direita. Na configuração, o
`mr-auto` fica na peça arrastável, não no título dentro dela: o item do flex é a peça.

**As três caixas do card, como em produção**: o corpo numa caixa com borda (segmentos, órgão,
objeto, valor global); as datas e as propriedades numa caixa só, com divisória vertical entre
elas e **a coluna de datas empilhada** (Adicionada, Atualizada, Envio da proposta, uma embaixo
da outra); a tabela de itens numa terceira caixa. Entre o topo e a primeira caixa não há linha:
o topo fica solto.

**A pré-visualização usa um edital fixo**, o mais completo da lista de exemplo (dois
segmentos, ME-EPP, itens em lotes e uma variável sem valor). Não há seletor de edital: a tela
configura o card, não o conteúdo de uma licitação.

**Fidelidade da pré-visualização.** A prévia reproduz o card real (referência: o node
35780-8043 do Figma do design system): selo Atualizado, Descartar, Enviar para análise, botão
de status, responsáveis, ações de ícone, Score, segmentos, Órgão com a tag ME - EPP, Objeto,
Valor global, a caixa de propriedades com as datas à esquerda e "Ver mais", e a tabela de itens
com Lote, Nome, Segmento, Unidades, Valor Unitário e Valor Total, com o total do edital à
direita do título. O que não é configurável aparece igual para servir de referência; só os
campos dos quatro grupos respondem aos interruptores e à ordem.

**Rolagem da grade de propriedades** (regra vinda do protótipo `settle-card-licitacao`, em
`app/CardEditavel.tsx`): a partir de 768px a caixa das propriedades (ID, Julgamento, Portal,
Estado...) assume a altura da caixa de datas ao lado e rola por dentro, em vez de esticar o
card. O "Ver mais", com degradê no pé da caixa, só aparece quando sobra conteúdo e some de vez
na primeira rolagem. Abaixo de 768px as duas caixas empilham e nada rola. O número de colunas
vem do tamanho da própria caixa (container query): 1, 2 ou 5.

Uma diferença de propósito entre o protótipo e o produto: **aqui o "Ver mais" volta sempre que
a grade está de volta no topo**, senão quem está demonstrando a tela mostra o efeito uma vez e
não consegue mostrar de novo. No produto vale a regra original, some depois da primeira
rolagem.

**Cor do segmento.** O mesmo segmento tem a mesma cor em qualquer lugar do card: os chips do
topo e a coluna Segmento da tabela de itens. A cor sai do nome do segmento por uma função
determinística sobre a paleta de categorias, como a plataforma já faz com as iniciais dos
responsáveis. Sem isso, "Produtos" aparecia azul em cima e preto na tabela.

**Para o design system:** duas coisas desta tela deviam estar na Base, e hoje estão
duplicadas. (1) No card real os chips de segmento do topo usam o tom claro da categoria
(fundo suave, texto na cor), enquanto `LicitacaoCardSegment` só tem o chip sólido; aqui está
resolvido por `className`, e o certo é um `tone="soft"`. (2) A grade com rolagem acima existe
em dois protótipos com o mesmo código; o certo é `LicitacaoCardMeta` ganhar esse
comportamento.

## 4. Abas das listas

Decisão da reunião de 18/09 com a Alice: o protótipo do Explorar licitações criava a aba
na própria interface e salvava filtros por pessoa, como no Notion. Isso contraria o
combinado e depende de guardar preferência por usuário, que a plataforma não tem. Ficou
assim:

- **A aba é da organização, como já é hoje** (o usuário não cria abas). A novidade é o
  administrador criar em Configurações e definir nome e filtros padrão; a aba aparece igual
  para todo mundo. O card de "tab personalizada" voltou para Design.
- Telas com abas: **Recomendadas e Descartadas**, as que já têm abas hoje. Cada tela tem a sua
  lista. Explorar licitações não tem abas na plataforma (a aba "Órgãos favoritos" só existia
  nos protótipos) e fica fora desta task (decidido em 21/09), para não criar mecânica nova.
- **Aba é um conjunto de filtros salvo.** Os filtros disponíveis são os do botão Filtrar da
  tela, mais as variáveis da organização. Data é valor relativo ("Próximos 7 dias",
  "Hoje"), para a aba continuar certa com o passar do tempo.
- **Aba sem filtro é aviso:** mostra o mesmo que Todas. A tela sinaliza, mas deixa salvar
  (o admin pode estar no meio da configuração).
- Filtro "Responsável: Eu (quem está vendo)" permite uma aba "Minhas licitações" que é da
  organização mas mostra o recorte de cada pessoa. Resolve boa parte do pedido de
  personalização sem salvar nada por usuário.
- **"Todas"** é fixa: sempre a primeira, sem filtro, não pode ser excluída nem renomeada.
- Na tela, **Filtrar continua funcionando por cima da aba, como hoje** (testado no app em
  21/09): a pessoa adiciona filtros extras ou muda os da aba, e isso vale só para ela.
  - Os filtros extras ficam no navegador da pessoa (`localStorage`, chaves `home-filters` e
    `discarded-filters`): acompanham a troca de aba e continuam ao sair e voltar para a tela.
  - Remover o filtro padrão da aba leva a lista para "Todas"; clicar de novo na aba reaplica
    o padrão.
  - Não altera o padrão da aba nem o que as outras pessoas veem. Quem muda o padrão é o
    admin, em Configurações.
- Excluir aba não muda nenhuma licitação; a aba só some para todos. Tem desfazer.
- Nome único por tela. **Sem limite de abas** (decidido em 21/09). Se o desenvolvimento
  identificar um limite técnico, ele entra aqui com o número indicado.
- **"Mais N" é novo nesta task** (decidido em 21/09). Hoje a barra de abas da plataforma usa
  rolagem horizontal e as abas do fim ficam cortadas. Com abas sem limite, passa a ser assim:
  - as abas ficam numa linha só; as que não cabem vão para um menu **Mais N** no fim da barra,
    com N = quantidade de abas escondidas;
  - a **aba ativa fica sempre visível**: escolher uma aba no menu coloca ela na barra, no
    lugar da última que cabia;
  - o menu serve só para navegar (sem criar nem editar abas) e recalcula quando a largura da
    tela muda.
- Contador da aba é calculado com os filtros dela.
- **Nova aba entra no fim da lista.** Como ela pode nascer escondida no "Mais N", a tela
  avisa "Aba criada no fim da lista. Arraste para mudar a posição."
- **Filtro padrão com valor que deixou de existir** (responsável que saiu da equipe, motivo
  arquivado, variável excluída, segmento removido): a aba continua funcionando com os demais
  filtros, o valor removido sai do filtro, e em Configurações a aba mostra o aviso "filtro
  com valor que não existe mais" para o admin revisar.
- **Aba excluída ou renomeada:** cada aba tem um identificador fixo no endereço, que não muda
  ao renomear. Se a aba for excluída, quem estava nela, quem tem ela salva no navegador ou
  quem abrir um link antigo cai em "Todas".
- Próxima fase, se validado: a pessoa salvar as próprias abas por cima das da organização.

### Mantém como hoje (verificado no código da plataforma em 21/09)

Para não aumentar a complexidade da task, estes comportamentos não mudam. Descrição do que
o app faz hoje em Recomendadas (código do frontend, `home.shared`):

- **Cada aba controla só os campos do próprio filtro padrão** (ex.: "Vencendo em breve"
  controla o prazo de envio). Ao trocar de aba, esses campos assumem o padrão da nova aba e
  os outros filtros da pessoa continuam. Se a pessoa mudar um campo da aba para outro valor,
  nenhuma aba fica selecionada.
- **Filtros da pessoa ficam no navegador** (`home-filters`, `discarded-filters`). O Sair
  limpa só os dados de usuário e organização; os filtros continuam no navegador.
- **Contador de cada aba** já considera os filtros extras da pessoa.
- **Lista vazia:** título "Não encontramos nenhuma licitação com seus filtros" e o aviso
  "Nenhum resultado encontrado".
- **Para o desenvolvimento:** hoje as abas e os filtros padrão são fixos no código do frontend
  (lista `all/active/today/upcoming` e os presets de cada uma). Para o admin configurar, eles
  passam a vir do backend.

## 5. Etapas do funil

Modelo do Linear: categorias fixas com itens editáveis dentro.

**Nome:** a etapa é o dado, não a coluna. Hoje Em andamento tem mais de uma visualização (o
seletor da plataforma diz Board, Tabela e Calendário) e a etapa aparece em todas. Nos textos
da interface, **falar sempre em "etapas de Em andamento" e nunca listar as visualizações**:
a lista muda quando uma nova visão entra, e ninguém vai lembrar de caçar os textos espalhados
para atualizar.

| Grupo | Pode renomear | Pode mover | Pode remover | Por quê |
|---|---|---|---|---|
| Entrada (Análise de Oportunidades) | sim | não | não | agentes rodam quando a licitação entra |
| Intermediárias | sim | sim | sim | fluxo de trabalho do cliente |
| Saída (Resultados Finais) | sim | não | não | agentes e registro do resultado |

### Registro do resultado e motivos de perda

Verificado no código da plataforma em 27/09: ao mover uma licitação para a etapa de saída, o
app abre um diálogo perguntando o resultado (**Ganhou** ou **Perdeu**), com motivo e
observação. O motivo é **obrigatório só quando é Perdeu** ("Selecione um motivo para registrar
o resultado como 'Perdeu a licitação'"), e a lista de motivos de perda é buscada separada da
lista de descarte. Por isso ela é configurada aqui, embaixo das etapas, e não em Motivos.

- Mesmas regras de lista do descarte: renomear, reordenar, "descrição obrigatória", arquivar quando já
  foi usado, excluir (com confirmação) quando nunca foi, nome repetido recusado.
- **Exigir motivo ao registrar perda** é um switch (proposta nova; hoje a plataforma sempre
  exige). Ligado é o padrão. Desligado, o motivo vira opcional e o gráfico "Motivos de perda"
  ganha uma fatia "Sem motivo". **Como a plataforma valida hoje** (conferido no bundle
  `workflow`, diálogo "Resultado da Licitação"): com "Perdeu a licitação" marcado e nenhum
  motivo escolhido, o botão de confirmar fica `disabled`; o comentário é opcional.
- **O switch faz uma coisa só: deixar de obrigar.** Desligado, a pessoa consegue concluir o
  registro sem escolher motivo; a lista continua na tela, continua editável e quem quiser
  continua escolhendo um. Nada é apagado nem escondido. Os dois efeitos colaterais: o gráfico
  ganha a fatia "Sem motivo" e a trava do último motivo deixa de valer.
- **Com a exigência ligada, o último motivo da lista não pode sair.** Arquivar ou excluir é
  recusado com o aviso de desligar a exigência antes. Sem essa trava a pessoa ficaria sem
  como registrar "Perdeu": aqui não existe "Outros" fixo como no descarte.
- Os motivos de perda do protótipo são exemplo: **confirmar a lista real com o time.**
- Em aberto: se o "Ganhou" também aceita motivo (hoje não exige).

Casos que podem dar problema, e a regra proposta:

1. **Remover etapa com licitações.** Obrigatório escolher a etapa destino antes de confirmar
   (padrão: a anterior). Responsável, substatus e descrição não mudam. Desfazer por alguns
   segundos. Etapa vazia também passa pela confirmação, só sem a escolha de destino.
2. **Mover por remoção para a Entrada.** Não roda os agentes de novo. Agente só dispara em
   entrada por "Enviar para análise" (evento), não por mudança de coluna em massa.
3. **A última etapa não entra na lista de destinos** (refine de 28/09). O motivo não é técnico,
   é de escopo: **remover etapa e registrar resultado são duas decisões diferentes**. Remover
   etapa é arrumação do funil, feita de uma vez para um monte de licitações. Resultado é uma
   decisão individual, e das pesadas: cada licitação ganhou ou perdeu, e quando perdeu ainda tem
   motivo. Alice: "as três licitações de vez, cada uma pode ter resultado diferente". Pedro
   sugeriu dois destinos (ganhou e perdeu), e ela respondeu que aí precisaria decidir uma a uma
   dentro do diálogo, o que não se sustenta com 40 licitações. Juntar as duas coisas transforma
   a arrumação do funil numa ação de fechamento em massa, que é o contrário do que a plataforma
   faz hoje.
   Para o dev: mover para Resultados Finais **sempre** abre o diálogo "Resultado da Licitação"
   (`useBiddings.updateBiddingStage` no bundle `workflow`), e de lá a licitação **não volta**.
4. **Cor da etapa.** A bolinha ao lado do nome abre a paleta (9 cores nomeadas, as mesmas do
   tema). A cor é só visual, para reconhecer a etapa em Em andamento: nada depende dela,
   e duas etapas podem repetir a cor. A etapa nova nasce com uma cor do rodízio. Hoje as cores
   são fixas no código, uma por status (`workflow.constants`), então isto é proposta nova.
5. **Dashboard.** Etapa é acompanhada por ID, não por nome. Renomear não quebra histórico.
   Reordenar muda só a ordem do funil. Remover: o período em que a etapa existiu continua no
   histórico com o nome dela; a partir da remoção, as licitações contam na etapa destino.
6. **Tempo em etapa (SLA, "há quantos dias está aqui").** Ao mover por remoção, o relógio
   recomeça na etapa destino, mas o histórico guarda a passagem pela etapa removida.
7. **Nome duplicado.** Renomear para um nome que já existe é recusado, com aviso. A etapa
   nova também nasce com nome livre ("Nova etapa 2" se "Nova etapa" existir), senão dois
   cliques seguidos em Adicionar deixariam duas etapas iguais em Em andamento.
8. **Filtros e views salvos que citam a etapa removida.** A condição some do filtro e a
   pessoa é avisada na próxima vez que abrir a view.
9. **Automação ou agente configurado para uma etapa intermediária** (V3 de Agentes, "plugar
   agente em qualquer lugar"). Não deixar remover sem antes reapontar o gatilho; a
   confirmação lista quais agentes dependem da etapa.
10. **Integrações e exportação** (planilha, relatórios) que usam o nome da coluna: exportar
   sempre ID e nome.
11. **Duas pessoas editando ao mesmo tempo.** Última gravação vence, com aviso de que a
    lista mudou desde que a página foi aberta.
12. **Limite de etapas.** Sugestão: até 12 no total, para o funil continuar legível.
13. **"Suspensa" é etapa ou estado?** Hoje é coluna, mas uma licitação suspensa pode voltar
    para qualquer ponto do funil. Vale discutir se vira marcação no card (como o Linear faz
    com "Blocked"), o que também simplifica o dashboard.

Recomendação da própria task, que sigo: **esta task cobre a experiência; as regras acima viram
um card separado para o time de desenvolvimento.**

## 6. Agentes, Aprovações e Variáveis (grupo Inteligência)

Versão final da área, com as melhorias do teste de usabilidade de 21/09 (cinco sessões).
O handoff (`settle-agentes/plataforma`, seção Handoff da sidebar) continua como está, para os
devs; a Nova versão da plataforma aponta para cá.

- **Vocabulário (uma palavra por coisa).** **Variável** é a pergunta que a Settle faz a todo
  edital; **resposta** é o que ela traz em cada licitação; **agente** é a tarefa que usa
  essa resposta; **resultado** é o que o agente produz e aparece na licitação; **ação** é o
  que o agente muda na licitação (mover, marcar, descartar). Não usar "dado" nem
  "informação" como sinônimo de variável ou de resposta. O agente **pausa e retoma**, não
  liga e desliga; quando a variável que ele usa some, ele fica **parado**.
- **Onde fica.** Agentes e Variáveis no grupo Inteligência. **Aprovações é uma seção de
  Agentes**: a fila existe por causa da aprovação configurada em cada agente, e separadas
  ninguém ligava uma coisa à outra. O contador do item Agentes é o de Aprovações pendentes.
- **Quem pode.** Configurar agentes e variáveis é de administrador. Aprovações abre para
  qualquer função, porque quem aprova nem sempre é quem configura: para quem não é admin, o
  item vira "Aprovações" e mostra só a fila.
- **Banner verde de cada seção:** logo abaixo das abas, explica em duas linhas o que é
  Agentes, Aprovações e Variáveis. Tem botão de fechar. **Uma vez que a pessoa fecha, aquele
  banner não volta mais** (guardar por pessoa e por seção: fechar o de Variáveis não fecha o
  de Agentes). É uma explicação para quem está chegando, e quem já entendeu não precisa dela
  ocupando o topo todo dia. Quem fechou ainda reencontra a explicação pelo card "Como
  funciona". No protótipo, fechar vale só até recarregar a página, igual ao card, para dar
  para demonstrar de novo.
- **Histórico das aprovações (guardar no banco).** Hoje, respondida a aprovação, a linha sai
  da fila e a escolha some da tela. Isso não pode se perder: a decisão de um agente mudar uma
  licitação é o tipo de coisa que a empresa vai querer auditar depois ("quem aprovou mover
  esta licitação?", "por que este edital foi descartado?"). **Toda resposta vira um registro
  permanente**, um por ação decidida, nunca um resumo do lote:
  - quando (data e hora), quem respondeu (pessoa, não "o sistema");
  - a licitação e o órgão;
  - o agente que pediu e o motivo que ele deu;
  - a ação proposta (de qual etapa para qual, por exemplo);
  - a decisão: aprovada ou recusada;
  - se foi desfeita, o desfazer é outro registro, não apaga o primeiro.
  O registro é **imutável**: nem administrador edita ou remove. Onde aparece: em
  **Auditoria** (Organização), junto das alterações de configuração, e no futuro também no
  histórico da própria licitação, que é onde a pergunta costuma nascer. Filtros úteis lá:
  por agente, por pessoa, por decisão e por período. Aprovações continua sendo só a fila do
  que ainda espera resposta; o que já foi respondido vive na Auditoria.
  No protótipo isso já acontece: responder escreve uma linha por decisão em Auditoria, com a
  licitação, o agente e a ação. O que falta no produto é a persistência de verdade (sobrevive
  a recarregar, com retenção longa) e os filtros.
- **Onde o resultado aparece: mais de um lugar.** O mesmo resultado pode fazer falta em mais
  de uma aba (pedido da Isadora no teste), então o campo aceita vários. "Nenhum lugar" anda
  sozinho: marcar ele desmarca os outros, porque é a ausência de bloco. Na conversa a pessoa
  escolhe um lugar, e a revisão permite acrescentar os demais.
- **Criação conversando:** o cartão da pergunta tem teto baixo (34svh, no máximo 268px),
  com a explicação e o rodapé fixos e as opções rolando dentro: o cartão é a pergunta, não
  a tela, e a conversa acima é que precisa de espaço. O rodapé tem **Voltar**, que desfaz a
  última resposta e devolve a pergunta anterior com o que havia antes dela. Assim a conversa acima continua visível mesmo
  quando a pergunta tem muitas opções. **Não existe "Pular":** toda pergunta tem uma opção
  que cobre o "não quero isso" ("Não usar variável", "Não, só uma vez"), e um Pular ao lado
  dela seria uma segunda forma de dizer a mesma coisa. Toda variável citada na conversa é um
  chip: o mouse em cima mostra a instrução dela (só a instrução, para a prévia não virar uma
  ficha) e o clique abre a variável por cima, com volta para a conversa. Se ela tiver sido excluída, o clique abre o formulário em branco com
  o nome, para recriar.
- **Artefato (página de apresentação).** Terceira página do grupo Inteligência, abaixo de
  Variáveis. Mostra **um** modelo do bloco que um agente produz dentro da licitação, com um
  texto de exemplo em linguagem de conversa: o formato importa mais que o layout, e um
  modelo só evita prender o time a uma forma. **Nada ali é configurável.** O nome
  **Artefato** é sugestão da Alice e é provisório; no design system o componente se chama
  AI Widget.
- **Settle AI.** A mesma IA da plataforma acompanha a pessoa aqui dentro, com as mesmas
  ferramentas:
  - **Três tamanhos para a mesma conversa**, como no Notion: flutuante (ancorada no botão),
    lateral (coluna que empurra a tela, com alça de redimensionar) e tela cheia. Nos dois
    últimos o botão flutuante some, porque a conversa já está à vista.
  - **Escolher com quem falar:** o título abre a lista de agentes, com os da área em que a
    pessoa está primeiro. Escolhido um, a conversa passa a ser com ele, o nome vira o título
    e a chave no cabeçalho abre a configuração dele. As respostas saem dos dados do próprio
    agente: quando trabalha, quais variáveis usa, se pede aprovação.
  - **Nova conversa** a qualquer momento.
  - **Contexto da pergunta:** a área em que a pessoa está entra sozinha, marcada em verde, e
    dá para tirar. O agente escolhido e o arquivo anexado entram como chips do mesmo jeito.
  - **Campo com chip de variável:** é campo de tokens, não input. O "+" insere uma variável
    ou anexa um arquivo, e a mensagem enviada mantém o chip, para quem ler depois saber de
    qual variável a pergunta falava.
  - A conversa abre dizendo em que área a pessoa está e leva direto para a criação
    conversacional de agente ou variável.
  O canto inferior direito é dela: o card "Como funciona" fica acima do botão e sai da frente
  enquanto a conversa está aberta. No protótipo as respostas são roteirizadas; o que não está
  no roteiro ela diz que ainda não sabe, em vez de inventar. Fica de fora, por enquanto, o
  menu de fontes da IA (as conexões do handoff), que depende de dados que Configurações não
  tem.
- **Como funciona:** card flutuante no canto inferior direito das duas páginas (imagem,
  título, descrição, "Ver como funciona" e fechar), que volta a cada refresh. O botão abre
  um passo a passo com um exemplo do começo ao fim (saber se o edital exige atestado):
  1. a variável faz uma pergunta ao edital e, sozinha, só guarda a resposta;
  2. o agente decide o que fazer com a resposta, e quando;
  3. o resultado aparece dentro da licitação, na aba escolhida, com a fonte;
  4. se o agente for mudar algo, pode pedir aprovação, que espera em Aprovações.
  Cada passo tem a miniatura do que a pessoa vai encontrar na tela. Termina num resumo de
  uma linha por conceito e nos atalhos Criar variável e Criar agente. No teste, ninguém
  separou agente de variável sem explicação; o que funcionou nas sessões foi o exemplo.
- **Criar conversando ou manualmente** (padrão de Tarefas agendadas do Claude): "Adicionar
  agente" e "Adicionar variável" abrem um menu com **Criar conversando** (primeiro) e
  **Configurar manualmente** (o formulário, com os modelos). Na conversa, as perguntas vêm
  uma de cada vez, com opções, "Outra opção", Pular e o contador; também dá para responder
  com as próprias palavras. Ao lado, o agente ou a variável aparece sendo montado, campo
  por campo (a regra materializada, requisito da Alice). No agente, a variável nasce dentro
  da conversa: a Settle sugere uma que já existe ou cria uma nova. No fim, "Revisar e
  criar" abre o formulário preenchido; nada é criado antes. O Score fica só no formulário.
  A conversa ensina enquanto pergunta: cada pergunta vem com a explicação do conceito
  (o que é variável, os momentos da licitação, onde o resultado aparece, o que é uma
  ação), e cada resposta é confirmada com o efeito dela ("o agente vai trabalhar quando a
  licitação chegar em Recomendadas").
  A primeira pergunta é o nome; depois vêm o que faz (ou a pergunta ao edital, na
  variável) e o resto. Pergunta que o formulário exige não tem "Pular": pular só adiaria
  o erro. Sobra o Pular no que é mesmo opcional (a variável do agente e a repetição). No protótipo a conversa é roteirizada.
- **Ações do card num menu só** (ícone de mais opções, à direita): abrir e editar, executar
  agora, pausar ou retomar e excluir. O estado continua legível nos selos ao lado do nome
  (Pausado, Parado). O agente **pausa e retoma**, não liga e desliga.
- **Cada agente em uma frase:** "Quando chega em Recomendadas · usa 1 variável · mostra em
  Habilitação", no topo do agente. No card da lista fica só o selo do momento: o resto
  polui a lista.
- **Formulário do agente:**
  - O que o agente faz (antes "Instruções"), com a lista das variáveis usadas embaixo.
    Instrução só com a variável não passa: o agente precisa saber o que fazer com o dado.
  - Onde o resultado aparece, Quando o agente trabalha, Aprovação das ações e Formato da
    resposta seguem como listas suspensas, mas a explicação de cada opção fica dentro do
    menu, na hora da escolha. Antes o texto só aparecia depois de escolher, e três pessoas
    não o viram. "AI Widget" saiu do texto.
  - "Nenhum lugar" diz no nome para que serve: "o agente só faz ações".
  - Repetição virou pergunta: "Trabalhar de novo quando o edital mudar?", com o que conta
    como mudança (retificação, impugnação, esclarecimento, nova data).
  - Aprovação diz que vale para o que o agente faz na licitação; ler o edital nunca precisa
    de aprovação. No teste, uma pessoa achou que era pedir licença para ler, como o Claude.
  - Nada vem marcado ao criar do zero, nem a aprovação.
- **Erros de preenchimento** ficam embaixo do próprio campo, a janela rola até o primeiro e o
  botão nunca fica desativado. No teste, faltou a instrução, o aviso era um toast e os
  botões pareceram quebrados.
- **Variável:** "Tipo" virou "Formato da resposta", com exemplo em cada opção; "Instruções"
  virou "O que procurar no edital"; cada fonte de "Onde procurar" diz o que tem dentro
  (Manifestações e Arquivos de resultado não eram conhecidos). A tabela troca "Agentes
  usando" por "Usada por", com os nomes; excluir fica à vista na linha.
- **Editar na própria tabela:** clicar no valor de Nome, O que procurar, Formato ou Quando
  não encontrar abre o campo ali mesmo; Enter ou sair salva, Esc desfaz, e o toast traz
  Desfazer. "Onde procurar" continua só no formulário, porque ali a ordem também conta, e
  as variáveis da Settle não são editáveis. Excluir fica no menu de mais opções da linha.
- **Largura:** Agentes e Variáveis ocupam a largura da tela. As tabelas usam o layout fixo
  do data-table (novo no design system): as larguras viram proporção, o título da coluna
  quebra em mais de uma linha e não há rolagem lateral.
- **Cada campo do formulário explica o que pede**, com o mesmo texto do "i" da coluna.
- **Altura da tabela:** o menor valor entre o conteúdo e o espaço que sobra na tela. Com
  poucas linhas ela encolhe (sem espaço vazio embaixo); com muitas, para no teto e rola por
  dentro, com o cabeçalho fixo. Recalcula ao redimensionar, ao rolar e quando o que está
  acima muda de altura.
- **A resposta padrão da variável é obrigatória:** sem ela o agente fica sem o que dizer
  quando o edital não fala do assunto.
- **Excluir variável** continua livre. Os agentes que dependiam dela aparecem **parados**,
  sem o botão de executar, até alguém revisar. No teste, o agente quebrado parecia ativo.
- **Aprovações:** cada pedido diz o agente que pediu, a aprovação configurada nele e, na
  mudança de etapa, de onde para onde. Responder por linha ou em lote.
- **Em aberto:** um catálogo só de variáveis. Card, e-mail e filtros ainda usam a lista
  antiga de `dados.ts`; o "Criar variável" deles já leva para cá. Escolher mais de um lugar
  para o resultado (pedido da Isadora) também ficou para depois.

## Outros pontos configuráveis levantados

- **Automações por etapa** (Alice, 18/09): criar um conjunto de tarefas quando a licitação
  entra numa etapa e medir o tempo em cada etapa. Para depois; entra em Etapas do funil.
- **Equipe dentro de Configurações:** a Alice perguntou; segue em aberto. A tela já está na
  navegação, mas pode continuar no menu do usuário se Configurações ficar pequena.

- **Substatus**: o card já tem "Selecionar Substatus" com valores do cliente (ex.: Encaminhar
  e-mail, Esperando aprovação do Marcelo). É uma lista configurável que ainda não tem lugar.
- **Campos do card em Em andamento** e **colunas da visão Tabela**.
- **Segmentos** (Software, Produtos).
- **Perfil de recomendação**: regiões, faixa de valor, órgãos favoritos, termos.
- **Notificações**: o que avisa quem.
- **Agentes e variáveis**: agora moram aqui, na seção 6.
