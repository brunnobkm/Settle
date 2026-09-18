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
| Abas das listas | Recomendadas, Explorar e Descartadas, `⋯` ao lado das abas, Editar abas |
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
- **Abas:** só o Administrador cria, renomeia, muda filtros, reordena, duplica e exclui.
  As outras funções usam as abas e não veem o `+` nem o menu de editar. Isso corrige a
  ambiguidade do documento de RBAC ("permitido na própria conta"): não existe aba da
  própria conta nesta fase.

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

- **A aba é da organização.** O administrador cria em Configurações, define nome e filtros,
  e ela aparece igual para todo mundo. O card de "tab personalizada" voltou para Design.
- Telas com abas: Recomendadas, Explorar licitações e Descartadas. Cada tela tem a sua lista.
- **Aba é um conjunto de filtros salvo.** Os filtros disponíveis são os do botão Filtrar da
  tela, mais as variáveis da organização. Data é valor relativo ("Próximos 7 dias",
  "Hoje"), para a aba continuar certa com o passar do tempo.
- **Aba sem filtro é aviso:** mostra o mesmo que Todas. A tela sinaliza, mas deixa salvar
  (o admin pode estar no meio da configuração).
- Filtro "Responsável: Eu (quem está vendo)" permite uma aba "Minhas licitações" que é da
  organização mas mostra o recorte de cada pessoa. Resolve boa parte do pedido de
  personalização sem salvar nada por usuário.
- **"Todas"** é fixa: sempre a primeira, sem filtro, não pode ser excluída nem renomeada.
- Na tela, **Filtrar continua funcionando por cima da aba**, mas é momentâneo: não altera a
  aba e some ao sair da tela. Esse era o ponto de confusão no teste da Alice ("como salvo o
  filtro que apliquei?"): quem salva filtro é o admin, aqui.
- Excluir aba não muda nenhuma licitação; a aba só some para todos. Tem desfazer.
- Nome único por tela. Limite de 10 abas por tela (acima disso a barra estoura; o "Mais N"
  do protótipo antigo segue como fallback em telas estreitas).
- Contador da aba é calculado com os filtros dela.
- Próxima fase, se validado: a pessoa salvar as próprias abas por cima das da organização.

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
- **Agentes e variáveis** já têm área própria; entram na navegação de Configurações como link.
