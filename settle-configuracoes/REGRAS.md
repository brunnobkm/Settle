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
| Motivos | Modal de Descartar e de registrar perda, Gerenciar motivos |
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

## 2. Motivos de descarte e de perda

- **Uma lista por tipo** (Descarte, Perda). Recomendação: unificar Recomendadas e Em andamento
  por padrão (interruptor ligado) e permitir, desligando, escolher motivo a motivo em qual tela
  ele aparece. Guarda-se sempre uma lista só; a diferença é um atributo do motivo.
- Um motivo precisa aparecer em pelo menos uma das telas.
- **Motivo já usado é arquivado, nunca excluído.** Sai das novas escolhas, continua nas
  licitações que o usaram, no filtro de Descartadas e no dashboard. Pode ser restaurado.
- Motivo nunca usado pode ser excluído (com desfazer).
- Renomear muda o nome em todas as licitações que já usaram (o vínculo é por ID). Se a
  intenção for outro significado, o certo é arquivar e criar um novo; a tela avisa quantas
  licitações serão afetadas.
- "Outros" é fixo e sempre pede descrição.
- **Pede descrição** (feedback da Alice, 18/09): qualquer motivo pode exigir que a pessoa
  escreva o porquê ao escolhê-lo. Vale para descarte e perda. Ligar não afeta os descartes
  já feitos sem descrição.
- Interruptor "Exigir motivo ao descartar".
- Hoje existem 15 motivos de descarte (incluindo Outros). Os de perda no protótipo são exemplo:
  **confirmar a lista atual com o time.**

## 3. Campos do card de Recomendadas

- Mostrar/ocultar e ordenar, em quatro grupos: Destaque, Datas (coluna esquerda), Metadados
  (grade), Itens. O topo (edital, ações, Score) é fixo.
- Reordenar só dentro do grupo: o card tem estrutura, e um campo de data no meio do objeto
  quebraria a leitura.
- Variável da organização pode virar campo. Quando não é encontrada naquela licitação, mostra
  "Não encontrado" (mesmo tratamento FOUND/NOT_FOUND/OTHER do Resumo).
- Campo oculto continua em Filtrar e Ordenar.
- **Quantidade de itens** (feedback da Alice, 18/09): hoje o card mostra até 5 itens com
  correspondência. O admin escolhe 3, 5, 10 ou todos; o que passar do limite fica em
  "Ver mais N itens". O contador mostra sempre o total.
- **Variáveis nos metadados** (feedback da Alice, 18/09): qualquer variável da organização
  ou da Settle pode entrar na grade, inclusive as de checklist (prazo de impugnação, local
  de entrega). O botão Adicionar lista o catálogo inteiro e tem "Criar variável", que leva
  à central de Agentes e variáveis; a variável criada volta para esta lista. Cada variável
  no card tem atalho para abrir e editar a própria variável (pedido que também apareceu no
  teste com usuários: clicar na variável e editar de onde se está).
- Vale para a organização toda. **Em aberto:** permitir que cada pessoa tenha a própria
  visão por cima do padrão (o Linear faz isso por view). Recomendo começar só com o padrão
  da organização.
- **Em aberto:** Em andamento e Descartadas herdam essa configuração ou têm a sua?

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

## 5. Etapas do funil (colunas do Kanban)

Modelo do Linear: categorias fixas com itens editáveis dentro.

| Grupo | Pode renomear | Pode mover | Pode remover | Por quê |
|---|---|---|---|---|
| Entrada (Análise de Oportunidades) | sim | não | não | agentes rodam quando a licitação entra |
| Intermediárias | sim | sim | sim | fluxo de trabalho do cliente |
| Saída (Resultados Finais) | sim | não | não | agentes e registro do resultado |

Casos que podem dar problema, e a regra proposta:

1. **Remover etapa com licitações.** Obrigatório escolher a etapa destino antes de confirmar
   (padrão: a anterior). Responsável, substatus e descrição não mudam. Desfazer por alguns
   segundos.
2. **Mover por remoção para a Entrada.** Não roda os agentes de novo. Agente só dispara em
   entrada por "Enviar para análise" (evento), não por mudança de coluna em massa.
3. **Mover por remoção para a Saída.** Não registra resultado. A licitação fica "pendente de
   registro" até alguém marcar ganho ou perda.
4. **Dashboard.** Etapa é acompanhada por ID, não por nome. Renomear não quebra histórico.
   Reordenar muda só a ordem do funil. Remover: o período em que a etapa existiu continua no
   histórico com o nome dela; a partir da remoção, as licitações contam na etapa destino.
5. **Tempo em etapa (SLA, "há quantos dias está aqui").** Ao mover por remoção, o relógio
   recomeça na etapa destino, mas o histórico guarda a passagem pela etapa removida.
6. **Nome duplicado.** Bloqueado.
7. **Filtros e views salvos que citam a etapa removida.** A condição some do filtro e a
   pessoa é avisada na próxima vez que abrir a view.
8. **Automação ou agente configurado para uma etapa intermediária** (V3 de Agentes, "plugar
   agente em qualquer lugar"). Não deixar remover sem antes reapontar o gatilho; a
   confirmação lista quais agentes dependem da etapa.
9. **Integrações e exportação** (planilha, relatórios) que usam o nome da coluna: exportar
   sempre ID e nome.
10. **Duas pessoas editando ao mesmo tempo.** Última gravação vence, com aviso de que a
    lista mudou desde que a página foi aberta.
11. **Limite de etapas.** Sugestão: até 12 no total, para o quadro continuar legível.
12. **"Suspensa" é etapa ou estado?** Hoje é coluna, mas uma licitação suspensa pode voltar
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
