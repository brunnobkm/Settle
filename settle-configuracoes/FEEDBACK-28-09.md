# Feedbacks das reuniões de 28/09/2026

## Resumo de um minuto

> **Atualizado em 30/09:** os itens 2, 3, 4 e 9 já foram implementados (V77). O item 10 ficou
> como está: você decidiu manter o arrastar livre, contra a sugestão do refine. O que sobra
> está na lista do fim deste documento.

Se você só tem um minuto, é isto:

- **A reunião mandou desfazer três coisas que o protótipo já faz.** Registrar resultado em lote
  ao remover etapa (item 2), excluir motivo (item 3) e a liberdade de arrastar no card (item
  10). As três foram construídas a seu pedido, então parei e não mexi em nada.
- **A ordem de trabalho mudou** (item 1): abas primeiro, motivos de descarte depois, etapas do
  funil por último. Etapas ficou por último porque mexer nelas quebra o dashboard.
- **Entrou escopo novo**: o card da lista e o card de dentro da licitação passam a se
  configurar separados (item 9), e existe um pedido antigo de badge de status da licitação
  (item 13), que é fora de Configurações.
- **O resto são onze pontos menores**, quase todos ajustes de texto ou de padrão inicial.

## Antes de tudo: de que projeto estamos falando

**Settle, área de Configurações da plataforma.** Hoje o cliente não configura quase nada: as
etapas do funil, os motivos de descarte, os campos do card e o modelo de e-mail estão fixos no
código da Settle. A tarefa é criar uma área única de Configurações onde o administrador da
organização mexe nisso sozinho.

- Protótipo navegável: https://brunnobkm.github.io/Settle/settle-configuracoes/
- Código: `settle-configuracoes/` neste repositório (React, `app/`)
- Regras de negócio já fechadas: `settle-configuracoes/REGRAS.md`
- Versão do protótipo quando este documento foi escrito: **V76** (o selo aparece na sidebar)

**As cinco telas do protótipo**, para situar os feedbacks abaixo:

| Tela | O que a pessoa configura lá |
|---|---|
| Etapas do funil | As etapas de Em andamento, da análise ao resultado: nome, cor, ordem |
| Abas das listas | As abas que aparecem no topo de Recomendadas e Descartadas |
| Motivos de descarte | A lista de motivos que aparece quando alguém descarta uma licitação |
| Campos do card | O que aparece no card de licitação e em que ordem, com prévia ao lado |
| Modelo de e-mail | Assunto e corpo do e-mail de "Compartilhar licitação", com variáveis |

**Dois lugares diferentes escolhem motivo,** e isso confunde na leitura das atas:

- **motivo de descarte**: quando a pessoa descarta uma licitação em Recomendadas ou Em andamento
- **motivo de perda**: quando a licitação chega na última etapa e alguém registra que perdeu.
  Essa lista fica dentro de Etapas do funil, não em Motivos de descarte

---

## As duas reuniões

| Reunião | Horário | Quem |
|---|---|---|
| Semanal Brunno / Alice | 12:30 | Você e Alice |
| Refine - Configurações plataforma | 13:30 | Você, Alice, Willian Gigliotti, Pedro Henrick, Larissa Almeida |

Os minutos citados abaixo são os das transcrições do Fireflies.

---

## Tabela de decisões

| # | Assunto | Em que tela | O que ficou | O que eu faria se você mandar | Trava? |
|---|---|---|---|---|---|
| 1 | Por onde começar | todas | Decidido | Sigo a ordem: abas, motivos, etapas | não |
| 2 | Resultado em lote ao remover etapa | Etapas do funil | **Remover** | ✅ feito em 30/09 (V77) | não |
| 3 | Excluir motivo | Motivos e Etapas | **Só arquivar** | ✅ feito em 30/09 (V77) | não |
| 4 | Texto do diálogo de remover etapa | Etapas do funil | Texto genérico | ✅ feito em 30/09 (V77) | não |
| 5 | Ajuda depois de fechar o card verde | todas | Em aberto | Ícone de interrogação ou porta para o agente | escolha |
| 6 | Motivos diferentes por tela | Motivos de descarte | Em aberto | Abrir com a chave desligada e mostrar as duas listas | escolha |
| 7 | Quando o motivo não é obrigatório | Etapas do funil | Em aberto | Fatia "Sem motivo" ou motivo oculto interno | escolha |
| 8 | Sem permissão por URL | todas | Em aberto | Tela de sem acesso e o caso da Visão geral | não |
| 9 | Cards separados (são três) | Campos do card | Decidido | ✅ feito em 30/09 (V77), com Em andamento junto | não |
| 10 | Quanto arrastar permitir | Campos do card | **Alice quer menos** | ❌ mantido livre, decisão sua de 30/09 | não |
| 11 | Criar campo que não é variável | Campos do card | Você disse que faria | Botão de nova propriedade, com tipo | não |
| 12 | Ver itens sem correspondência | Campos do card | Você disse que faria | Opção na tabela de itens | não |
| 13 | Badge de status da licitação | fora daqui | Decidido | Projeto novo, não é Configurações | não |
| 14 | Imagem e URL no e-mail | Modelo de e-mail | Em aberto | Acrescento os dois no editor | não |
| 15 | Configurações além de licitação | todas | Em aberto | Nada agora, é direção de produto | não |

---

## 1. Por onde começar

> Etapas do funil fica por último porque é a única que quebra o dashboard.

**Status:** decidido · **Onde:** Refine, 26:10 a 27:46

**O contexto:** mudar nome e ordem das etapas do funil quebra o dashboard, porque o dashboard
monta os gráficos em cima dessas etapas. Larissa confirmou: "tudo isso vai mudar no dashboard".
Você mesmo perguntou: "isso afeta no recorte lá do dashboard?".

**O que ficou:** a ordem de ataque é

1. **Abas das listas**, que o Ortiz já fez, só garantir que sobe
2. **Motivos de descarte**, porque o impacto no dashboard é baixo
3. **Etapas do funil** por último, e antes disso um refine específico só sobre o dashboard

Alice propôs (27:12), Larissa, Willian e Pedro concordaram na sequência.

---

## 2. Registrar resultado em lote ao remover uma etapa

> A reunião quer tirar o que a V70 fez: uma licitação por vez tem resultado, não um lote inteiro.

**Status:** decidido na reunião, e contraria o protótipo · **Onde:** Refine, 06:51 a 08:21

**O contexto, para lembrar:** quando o administrador remove uma etapa que tem licitações
dentro, ele escolhe para onde essas licitações vão. Se o destino for a última etapa
(Resultados Finais), elas precisam de um resultado, porque toda licitação que chega lá tem
resultado. Na V70 eu implementei isso: o diálogo passou a pedir Ganhou ou Perdeu, o motivo e um
comentário, aplicando a mesma escolha a todas as licitações do lote. **Você pediu assim**, com
o argumento de que a plataforma já faz registro em lote pela seleção múltipla.

**O que disseram:** Alice (07:23): "as três licitações de vez, cada uma pode ter resultado
diferente". Pedro sugeriu oferecer Resultado final ganhou e Resultado final perdeu como dois
destinos; Alice respondeu que aí seria preciso listar licitação por licitação, "imagina, tem 40
listações". Você fechou: "o que a gente pode fazer é não ter Resultados Finais como opção aqui"
(07:30) e "vou remover ela daqui" (08:21).

**Se seguirmos a reunião:** a última etapa sai da lista de destinos, e a remoção de etapa deixa
de registrar resultado. Volta a ser o que era na V69.

---

## 3. Excluir motivo deixa de existir

> Some o botão de excluir: tudo vira arquivar, e o que nunca foi usado some da lista de arquivados.

**Status:** decidido na reunião, e contraria o protótipo · **Onde:** Refine, 11:38 a 16:44

**O contexto:** hoje o protótipo trata os dois casos de forma diferente. Motivo que **nunca foi
usado** pode ser excluído de vez, com diálogo de confirmação. Motivo que **já foi usado** só
pode ser arquivado, porque as licitações que o usaram precisam continuar mostrando o motivo no
filtro de Descartadas e no gráfico do dashboard. Essa distinção foi construída a seu pedido nas
rodadas anteriores, incluindo os textos que explicam por que um dá e o outro não.

**O que disseram:** Alice (12:24): "não simplifica e bota tudo no Archivar"; e (16:33), fechando:
"eu deixaria tudo arquivado. E se não tiver nenhuma associada, eu não mostraria embaixo. E
antes de baixo, eu deixaria escrito". O argumento dela é que assim não precisamos explicar a
diferença para o cliente (12:48: "eu não teria que explicar assim, não dá para excluir").
Willian propôs o contrário, só excluir com um aviso na hora (15:23). Você defendeu deixar
explícito qual é qual (14:06). Fechou no arquivar.

**Se seguirmos a reunião:** acaba o botão de excluir; toda saída é arquivar; motivo arquivado
que não tem nenhuma licitação associada não aparece na lista de Arquivados; e acima dessa lista
fica escrito que ali estão só os motivos com licitação. Os textos precisam ser reescritos, como
você mesmo disse (15:19).

---

## 4. O texto do diálogo de remover etapa

> Citar "substatus e descrição" dá a entender que são campos da plataforma, e não são.

**Status:** decidido, sem conflito · **Onde:** Refine, 06:10 a 06:39

**O contexto:** ao remover uma etapa com licitações, o diálogo diz hoje "Responsável, substatus
e descrição continuam iguais".

**O que disseram:** Alice apontou que substatus e descrição não são campos da plataforma, são
campos criados na conta de demonstração. Citar nome de campo ali dá a entender que são fixos.
Sugestão: algo genérico, do tipo "os demais campos continuam iguais". Você concordou e
acrescentou que com muitos campos a modal ficaria cheia demais.

---

## 5. Onde fica a ajuda depois que o card verde é fechado

> O card fecha para sempre e leva o "Saiba mais" junto; falta um caminho permanente.

**Status:** em aberto · **Onde:** Refine, 03:04 a 03:56

**O contexto:** cada tela de Configurações abre com um card verde explicando a área, com um X
para fechar. Em Etapas do funil, esse card tem um "Saiba mais" que abre o detalhamento do
efeito de cada mudança. No produto, fechar é para sempre.

**O que disseram:** Alice (03:10): "se não reabre, deveria ter algum ícone de interrogação nessa
página para ele poder ver o saiba mais". Você levantou usar isso como porta de entrada para o
agente, em vez de um texto fixo; Alice apoiou, mas lembrou que o agente precisaria de uma base
de FAQ cadastrada para responder com contexto.

**Decisão que falta:** ícone de interrogação com o mesmo conteúdo, ou porta para o agente com
FAQ. A segunda depende de conteúdo que ainda não existe.

---

## 6. Motivos diferentes em Recomendadas e em Em andamento

> A chave existe, mas ninguém percebe que a lista muda por tela; a sugestão é abrir já separado.

**Status:** em aberto · **Onde:** Refine, 21:49 a 25:59

**O contexto:** a tela de Motivos de descarte tem uma chave chamada "Mesma lista em Recomendadas
e Em andamento". Ligada, é uma lista só. Desligada, cada motivo escolhe em qual das duas telas
aparece. Hoje o protótipo abre com ela **ligada**.

**O que disseram:** Larissa (22:04) achou confuso a pessoa descobrir que os motivos mudam
conforme a tela. Alice explicou o porquê de existirem dois conjuntos (22:20): em Recomendadas os
motivos são genéricos ("minha empresa não faz esse negócio"), em Em andamento são específicos
("não consegui atingir o valor mínimo"), porque a licitação já passou pelo primeiro filtro.

**Duas sugestões da Alice:** abrir com a chave **desligada**, já mostrando as duas listas
separadas (23:45); e mostrar **as duas listas na pré-visualização**, para a pessoa ver que o
conteúdo muda (24:01). Willian levantou separar as duas listagens de vez; Alice preferiu manter
uma só e separar depois se der problema, porque juntar depois dá mais trabalho do que separar
(25:54).

---

## 7. O que acontece quando o motivo não é obrigatório

> Sem motivo escolhido, o gráfico ganha uma fatia "Sem motivo"; a alternativa é um motivo oculto.

**Status:** em aberto · **Onde:** Refine, 08:21 a 11:11

**O contexto:** no protótipo existe uma chave "Exigir motivo ao registrar perda". Desligada, a
pessoa consegue registrar a perda sem escolher motivo, e o gráfico "Motivos de perda" ganha uma
fatia chamada "Sem motivo".

**O que disseram:** Larissa perguntou se o motivo não deveria ser sempre obrigatório; Alice
respondeu que quem decide é o administrador da organização (09:27). Pedro confirmou que hoje,
na plataforma, o motivo da perda é obrigatório. Willian (10:46) propôs outra saída: não escolher
motivo é quase escolher "Outros", então poderia existir um **motivo oculto** interno, em vez da
fatia "Sem motivo". Alice não quis usar "Outros" visível (10:58), porque obriga a pessoa a
preencher toda vez.

**Decisão que falta:** fatia "Sem motivo" no gráfico, como está, ou motivo oculto interno.

---

## 8. Quem não tem permissão e recebe o link

> Link compartilhado com quem não tem acesso precisa de uma tela decente, não de um 404.

**Status:** em aberto, mas é execução · **Onde:** Refine, 17:49 a 19:55 e 50:21 a 51:22

**O contexto:** as URLs das seções de Configurações são visíveis e alguém pode compartilhar.

**O que disseram:** Willian (51:07): a pessoa tem que receber uma tela decente, "não tipo 404".
Pedro confirmou (50:40) que o controle de permissão por URL já existe hoje na plataforma. Falta
definir a mensagem e o caso da **Visão geral**, quando a pessoa não tem acesso a nada dentro de
Configurações (Alice, 18:59).

---

## 9. São dois cards, e eles se configuram separados

> O card da lista e o card de dentro da licitação são configurações diferentes, na mesma tela.

**Status:** decidido · **Onde:** Semanal, 11:17 a 13:36; Refine, 41:20

**O contexto:** "card" aparece em dois lugares. Na lista (Recomendadas, Em andamento) e dentro
da licitação, no workspace, que é praticamente o mesmo módulo. Hoje a tela de Campos do card
configura só o da lista.

**O que disseram:** Alice perguntou se, ao configurar um, a pessoa está configurando o outro.
Você respondeu (13:36): "acho que é melhor dividir mesmo. Eu vou fazer isso lá", porque dentro
da licitação a pessoa quer mais dados e na lista quer menos, já que ali ela está decidindo se
participa ou não.

**Como deve aparecer:** Alice foi específica (Semanal, 20:36): **não criar uma tab nova na
navegação**. A troca entre um card e outro fica dentro da própria tela do card, "está dentro da
canvas do card", senão "a gente vai ficar querendo milhão de coisas". Na Refine (41:20) você
ampliou a ideia: o card de Em andamento também entraria.

---

## 10. Quanto arrastar permitir

> Alice e Pedro querem menos liberdade do que o protótipo tem hoje: topo fixo e limites por área.

**Status:** em aberto, e contraria o protótipo · **Onde:** Semanal, 13:59 a 15:33; Refine, 43:26

**O contexto:** nas últimas rodadas o protótipo foi ficando cada vez mais livre, a seu pedido.
Hoje dá para arrastar as peças do topo, os campos do corpo, o que está dentro das caixas de
Datas e Propriedades, as colunas da tabela de itens e o bloco inteiro da tabela.

**O que disseram:** Alice (15:33): "o que o cara tem que mudar aqui pra mim agora é quais são as
datas, quais são as informações aqui dentro, e aí ele muda a ordem aqui e acabou. Eu nem faria
o drag drop aqui dentro. E esse cabeçalho, essa parte aqui de cima, eu deixaria ele obrigatório
fixo." Pedro foi na mesma direção na Refine (43:26): "seria uma boa a gente poder limitar os
contents de cada área", com o exemplo de não deixar a tabela de itens subir para o topo (43:39).

**Decisão que falta:** manter a liberdade atual, ou travar o topo e limitar o que entra em cada
área. Vale lembrar que foi você quem pediu a liberdade, com o argumento de que o arrastar é mais
claro que a pílula "Mesma linha" que existia antes.

---

## 11. Criar um campo que não vem de variável

> Falta a pessoa poder criar um campo próprio, como o substatus, sem passar por Variáveis.

**Status:** em aberto, você disse que faria · **Onde:** Semanal, 17:51 a 19:10; Refine, 45:40

**O contexto:** hoje, para colocar algo novo no card, a pessoa escolhe uma variável já existente
no catálogo de Variáveis.

**O que disseram:** Alice: e os campos que a pessoa mesma cria e preenche, que não são variáveis?
O exemplo é o substatus. Para ela, o lugar de criar esses campos é essa tela. Você concordou:
são campos isolados, a pessoa define o tipo e preenche, "vou adicionar isso também". Na Refine
(45:40) a ideia voltou no formato do Notion: botão de adicionar propriedade, escolher o tipo,
dar o nome.

---

## 12. Ver os itens sem correspondência

> A tabela mostra só os itens que casaram; falta poder ver os outros.

**Status:** em aberto, você disse que faria · **Onde:** Semanal, 16:23

**O contexto:** a tabela dentro do card mostra "Itens com Correspondência", que são os itens do
edital que casaram com o que a empresa vende, e ao lado o total de itens do edital.

**O que disseram:** Alice: "o que eu sinto falta é se ele quiser ver o sem correspondência
também". Você: "bom ponto, vou adicionar isso também".

---

## 13. Badge de status da licitação

> Pedido antigo de cliente: mostrar no card quando a licitação foi suspensa, anulada ou revogada.

**Status:** decidido, escopo novo fora de Configurações · **Onde:** Semanal, 01:37 a 06:34

**O contexto:** é um pedido antigo, que os clientes vêm cobrando: mostrar no card quando a
licitação foi suspensa, anulada ou revogada.

**O que ficou:** versão simplificada. O status aparece **só quando há problema**; o cliente não
altera nada nesta primeira versão; não tem clique nem modal; o badge fica do lado esquerdo do
edital. Falta definir como ele aparece em cada tela (Recomendadas, Em andamento, Descartadas).
"Em disputa ou homologação" nunca chegou a ser implementado.

---

## 14. Modelo de e-mail

> O back já está pronto; falta a interface, e vale incluir imagem e URL.

**Status:** em aberto · **Onde:** Refine, 38:36 a 40:29

**O que disseram:** Willian contou que o template de e-mail já foi feito junto com o CASA e está
quase todo resolvido no back: "não falta nada agora, ou falta muito pouco para a gente conseguir
fazer essa tela sem precisar mexer muitas coisas no back. Agora é uma questão de interface só".
Você comentou que, dependendo do nicho, os clientes pedem imagem e URL no template, e dá para
acrescentar.

---

## 15. Configurações além de licitação

> Provocação do Willian: a área não deveria nascer amarrada ao tema licitação.

**Status:** em aberto, estratégico · **Onde:** Refine, 29:25 a 38:14

**O que disseram:** Willian levantou que a área de Configurações não deveria nascer amarrada ao
tema "licitação", porque vêm aí RFP e concorrências, e cada um teria suas variáveis e seus
agentes. A ideia é pensar em "objeto de domínio". Você respondeu que o que está desenhado já é
genérico o suficiente para atender outro tema, porque tudo gira em torno de propriedades e
variáveis. Não muda nada no protótipo agora; é para ter em mente quando o produto crescer.

---

## O que ficou decidido em 30/09

- **Item 2:** a última etapa sai da lista de destinos ao remover uma etapa. Feito.
- **Item 3:** só arquivar, e arquivado sem licitação some da lista. Feito.
- **Item 4:** texto genérico no diálogo de remover etapa. Feito.
- **Item 9:** três cards com configuração própria (Recomendadas, Em andamento e dentro da
  licitação), alternando dentro da própria tela. Feito.
- **Item 10:** **arrastar continua livre.** Sua decisão, contra a sugestão da Alice e do Pedro.

## O que ainda está aberto

Nenhum deles trava nada, são escolhas suas quando quiser:

- **5** ajuda permanente depois de fechar o card verde
- **6** abrir com a chave "mesma lista" desligada e mostrar as duas listas na prévia
- **7** "sem motivo" como motivo oculto em vez da fatia no gráfico
- **8** tela de sem permissão por URL e o caso da Visão geral
- **16** contador das listas de motivo em "licitações" ✅ feito em 30/09 (V79). Alice, 21:21:
  "eu também padronizaria ali licitações"; você: "no lugar de 412 descartes, seria 412
  licitações". Este item tinha escapado do consolidado.
- **11** criar campo que não vem de variável
- **12** ver os itens sem correspondência
- **14** imagem e URL no modelo de e-mail
- **1, 13, 15** ordem de trabalho, badge de status e domínio além de licitação: não são ajustes
  de tela
