# Feedbacks das reuniões de 28/09/2026

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

| # | Assunto | O que ficou | Precisa de você? |
|---|---|---|---|
| 1 | Ordem de trabalho: abas, motivos, etapas | Decidido | Não |
| 2 | Registrar resultado em lote ao remover etapa | **Remover** | **Sim, contraria pedido seu** |
| 3 | Excluir motivo | **Vira tudo arquivar** | **Sim, contraria pedido seu** |
| 4 | Texto do diálogo de remover etapa | Trocar por texto genérico | Não |
| 5 | Ajuda depois de fechar o card verde | Em aberto | Sim, é escolha de solução |
| 6 | Motivos diferentes por tela | Em aberto | Sim |
| 7 | "Sem motivo" como motivo oculto | Em aberto | Sim |
| 8 | Tela de sem permissão por URL | Em aberto | Não, é execução |
| 9 | Dois cards: o da lista e o de dentro da licitação | Decidido | Não |
| 10 | Quanto arrastar permitir no card | **Alice quer menos** | **Sim, contraria pedido seu** |
| 11 | Criar campo que não é variável | Em aberto, você disse que faria | Não |
| 12 | Ver itens sem correspondência | Em aberto, você disse que faria | Não |
| 13 | Badge de status da licitação | Decidido, escopo novo | Não |
| 14 | Imagem e URL no modelo de e-mail | Em aberto | Não |
| 15 | Configurações não amarradas a "licitação" | Em aberto, estratégico | Não agora |

---

## 1. Por onde começar

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

**Status:** decidido, sem conflito · **Onde:** Refine, 06:10 a 06:39

**O contexto:** ao remover uma etapa com licitações, o diálogo diz hoje "Responsável, substatus
e descrição continuam iguais".

**O que disseram:** Alice apontou que substatus e descrição não são campos da plataforma, são
campos criados na conta de demonstração. Citar nome de campo ali dá a entender que são fixos.
Sugestão: algo genérico, do tipo "os demais campos continuam iguais". Você concordou e
acrescentou que com muitos campos a modal ficaria cheia demais.

---

## 5. Onde fica a ajuda depois que o card verde é fechado

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

**Status:** em aberto, mas é execução · **Onde:** Refine, 17:49 a 19:55 e 50:21 a 51:22

**O contexto:** as URLs das seções de Configurações são visíveis e alguém pode compartilhar.

**O que disseram:** Willian (51:07): a pessoa tem que receber uma tela decente, "não tipo 404".
Pedro confirmou (50:40) que o controle de permissão por URL já existe hoje na plataforma. Falta
definir a mensagem e o caso da **Visão geral**, quando a pessoa não tem acesso a nada dentro de
Configurações (Alice, 18:59).

---

## 9. São dois cards, e eles se configuram separados

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

**Status:** em aberto, você disse que faria · **Onde:** Semanal, 16:23

**O contexto:** a tabela dentro do card mostra "Itens com Correspondência", que são os itens do
edital que casaram com o que a empresa vende, e ao lado o total de itens do edital.

**O que disseram:** Alice: "o que eu sinto falta é se ele quiser ver o sem correspondência
também". Você: "bom ponto, vou adicionar isso também".

---

## 13. Badge de status da licitação

**Status:** decidido, escopo novo fora de Configurações · **Onde:** Semanal, 01:37 a 06:34

**O contexto:** é um pedido antigo, que os clientes vêm cobrando: mostrar no card quando a
licitação foi suspensa, anulada ou revogada.

**O que ficou:** versão simplificada. O status aparece **só quando há problema**; o cliente não
altera nada nesta primeira versão; não tem clique nem modal; o badge fica do lado esquerdo do
edital. Falta definir como ele aparece em cada tela (Recomendadas, Em andamento, Descartadas).
"Em disputa ou homologação" nunca chegou a ser implementado.

---

## 14. Modelo de e-mail

**Status:** em aberto · **Onde:** Refine, 38:36 a 40:29

**O que disseram:** Willian contou que o template de e-mail já foi feito junto com o CASA e está
quase todo resolvido no back: "não falta nada agora, ou falta muito pouco para a gente conseguir
fazer essa tela sem precisar mexer muitas coisas no back. Agora é uma questão de interface só".
Você comentou que, dependendo do nicho, os clientes pedem imagem e URL no template, e dá para
acrescentar.

---

## 15. Configurações além de licitação

**Status:** em aberto, estratégico · **Onde:** Refine, 29:25 a 38:14

**O que disseram:** Willian levantou que a área de Configurações não deveria nascer amarrada ao
tema "licitação", porque vêm aí RFP e concorrências, e cada um teria suas variáveis e seus
agentes. A ideia é pensar em "objeto de domínio". Você respondeu que o que está desenhado já é
genérico o suficiente para atender outro tema, porque tudo gira em torno de propriedades e
variáveis. Não muda nada no protótipo agora; é para ter em mente quando o produto crescer.

---

## O que eu preciso que você decida

Três coisas, e só elas, travam o próximo passo. As três contrariam pedidos seus das rodadas
anteriores, por isso não mexi em nada:

1. **Registro de resultado em lote** (item 2): tiro, como ficou na reunião?
2. **Excluir motivo** (item 3): passo tudo para arquivar?
3. **Arrastar** (item 10): travo o topo e limito por área, ou mantenho a liberdade atual?

O resto dá para eu ir fazendo na ordem que a reunião definiu: abas, motivos de descarte, e
etapas do funil por último.
