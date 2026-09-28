# Feedbacks das reuniões de 28/09

Duas reuniões no mesmo dia, transcritas pelo Fireflies:

- **Semanal Brunno / Alice**, 12:30 (21 páginas)
- **Refine - Configurações plataforma**, 13:30 (40 páginas), com Alice, Willian Gigliotti,
  Pedro Henrick e Larissa Almeida

Cada item abaixo traz o que foi dito, quem disse e em que minuto, mais o estado em que o
protótipo (V76) está hoje. **Nada aqui foi implementado ainda**: a lista existe para decidirmos
item a item o que entra.

Legenda: **[Decidido]** fechado na reunião · **[Aberto]** levantado sem conclusão ·
**[Conflito]** contraria algo que já está no protótipo.

---

## 1. Sequência de trabalho (prioridade)

**[Decidido]** (Refine 27:12, Alice; Larissa, Willian e Pedro concordam) A ordem de ataque é:

1. **Abas das listas** (o que o Ortiz já fez), para garantir que sobe
2. **Motivos de descarte**, porque o impacto no dashboard é baixo
3. **Etapas do funil** por último, com um refine específico sobre o dashboard antes

O motivo: mexer em ordem e nome de etapa quebra o dashboard (Refine 26:10-27:12, Alice e
Larissa). "Mudei a ordem das etapas, olha o caos que vai ficar o Dash."

---

## 2. Registrar resultado em lote: **remover**

**[Decidido] [Conflito]** (Refine 06:51-08:21)

Alice (07:23): "as três licitações de vez, cada uma pode ter resultado diferente". Pedro sugeriu
oferecer as duas opções (ganhou/perdeu) na própria lista; Alice respondeu que aí viraria uma
listagem licitação por licitação ("imagina, tem 40 listações"). Brunno (07:30): "o que a gente
pode fazer é não ter Resultados Finais como opção aqui" e, em 08:21, "vou remover ela daqui".

**Conflito:** o protótipo faz o oposto desde a V70. A etapa de saída voltou a ser destino de
remoção e o diálogo pede Ganhou/Perdeu, motivo e comentário, aplicando o mesmo resultado a
todas. Isso foi feito a pedido seu, com o argumento de que a plataforma já tem registro em
lote. A reunião decidiu tirar. **Precisa de decisão.**

---

## 3. Excluir motivo: passar tudo para Arquivar

**[Decidido] [Conflito]** (Refine 11:38-16:44)

Alice (12:24): "não simplifica e bota tudo no Archivar"; (16:33): "eu deixaria tudo arquivado.
E se não tiver nenhuma associada, eu não mostraria embaixo. E antes de baixo, eu deixaria
escrito". Ou seja:

- acaba o conceito de excluir: toda saída é arquivar
- motivo arquivado **sem nenhuma licitação associada** não aparece na lista de Arquivados
- acima da lista de Arquivados, deixar escrito que ali só estão os motivos que têm licitação

Willian (15:23) propôs o contrário (só excluir, com aviso na hora); Brunno defendeu deixar
explícito qual é qual (14:06); Alice fechou em arquivar. Brunno (15:19): "tem que revisar" os
textos.

**Conflito:** o protótipo faz os dois caminhos hoje (excluir quando nunca usado, com diálogo de
confirmação; arquivar quando já usado), e foi assim que você pediu nas rodadas anteriores.

---

## 4. Texto do diálogo de remover etapa

**[Decidido]** (Refine 06:10-06:39)

Alice: citar "Responsável, substatus e descrição continuam iguais" é ruim, porque substatus e
descrição são campos criados na conta de demonstração, não campos fixos da plataforma. Sugestão
dela: algo genérico, "os demais campos continuam iguais". Brunno concordou.

Hoje o protótipo usa exatamente a frase que ela apontou.

---

## 5. Ajuda depois que o card verde é fechado

**[Aberto]** (Refine 03:04-03:56)

Alice (03:10): se o aviso não reabre, precisa de um ícone de interrogação na página para a
pessoa chegar no "Saiba mais". Brunno pensou em usar isso como porta para o agente (FAQ),
Alice: precisaria de uma base de FAQ cadastrada para o agente responder com contexto.

Hoje: o "Saiba mais" de Etapas do funil vive dentro do card verde; fechando o card, ele some.

---

## 6. Motivos por tela: inverter o padrão e mostrar as duas listas

**[Aberto]** (Refine 21:49-25:59)

Larissa (22:04): "acho meio confuso a pessoa saber que são motivos diferentes dependendo do
step". Alice explicou a razão (22:20): em Recomendadas os motivos são genéricos, em Em
andamento são específicos, porque a licitação já passou pelo primeiro filtro.

Sugestões da Alice (23:45-24:21):
- já vir com a chave **"mesma lista" desligada**, ou seja, listas separadas por padrão
- mostrar **as duas listas de motivos na pré-visualização**, para ficar evidente que muda

Willian levantou separar de vez as duas listagens; Alice preferiu seguir com uma lista só e
separar depois se der problema, porque juntar depois dá mais trabalho que separar (25:54).

---

## 7. "Sem motivo" pode ser um motivo oculto

**[Aberto]** (Refine 10:19-11:11)

Com a exigência desligada, hoje o gráfico ganha a fatia "Sem motivo". Willian (10:46): não
escolher motivo é quase o mesmo que escolher "Outros"; Pedro sugeriu um campo novo; Willian
(11:11): "se a gente tem motivo oculto, se for uma trava de verdade, dá pra fazer tranquilo".
Alice não concordou em usar "Outros" (10:58), porque obriga a pessoa a preencher toda vez.

---

## 8. Sem permissão por URL

**[Aberto]** (Refine 17:49-19:55 e 50:21-51:22)

Se alguém compartilhar a URL de uma seção de Configurações com quem não tem acesso, precisa de
uma tela decente, não um 404 (Willian 51:07). Pedro confirmou que o controle por URL já existe
hoje na plataforma (50:40). Falta definir a mensagem e o caso da **Visão geral**, quando a
pessoa não tem acesso a nada (Alice 18:59).

---

## 9. Campos do card: dois cards diferentes

**[Decidido]** (Semanal 11:17-13:36)

Alice: uma coisa é o card na lista, outra é o card dentro da licitação (workspace) — quando a
pessoa configura um, está configurando o outro? Brunno (13:36): "acho que é melhor dividir
mesmo. Eu vou fazer isso lá", porque dentro da licitação a pessoa quer mais dados e na lista
quer menos.

Na Refine (41:20) a ideia apareceu maior ainda: o card de Em andamento também entraria, e a
tela viraria uma seção com abas.

**Como isso deve aparecer:** Alice (Semanal 20:36) foi específica: **não criar uma tab nova na
navegação**; a troca fica dentro da própria tela do card ("está dentro da canvas do card"),
senão "a gente vai ficar querendo milhão de coisas".

---

## 10. Drag and drop: a Alice quer menos

**[Aberto] [Conflito]** (Semanal 15:33)

Alice: "o que o cara tem que mudar aqui pra mim agora é quais são as datas, quais são as
informações aqui dentro, e aí ele muda a ordem aqui e acabou. Eu nem faria o drag drop aqui
dentro. E esse cabeçalho, essa parte aqui de cima, eu deixaria ele obrigatório fixo."

**Conflito:** a V75/V76 foi na direção oposta, a seu pedido: arrastar em todo o card, topo
incluído, e agora também as colunas da tabela e o bloco da tabela.

Na Refine, Pedro foi na mesma linha da Alice (43:26): "seria uma boa a gente poder limitar os
contents de cada área", dando como exemplo não deixar a tabela de itens ir para o topo (43:39).

---

## 11. Criar campo que não é variável

**[Aberto]** (Semanal 17:51-19:10; Refine 45:40)

Alice: a pessoa deveria poder criar campos próprios, que não vêm de variável (o exemplo é o
substatus), e o lugar de criar deveria ser essa tela. Brunno: são campos isolados, com tipo
definido na hora; "vou adicionar isso também". Na Refine a ideia voltou como "propriedade
isolada", no modelo do Notion: botão de adicionar propriedade, escolher o tipo, dar o nome.

---

## 12. Itens sem correspondência

**[Aberto]** (Semanal 16:23)

Alice: "o que eu sinto falta é se ele quiser ver o sem correspondência também". Brunno: "bom
ponto, vou adicionar isso também".

Hoje a tabela mostra só os itens com correspondência, com o total do edital ao lado do título.

---

## 13. Badge de status da licitação

**[Decidido]** (Semanal 01:37-06:34) — escopo novo, fora de Configurações

Versão simplificada, que os clientes vêm pedindo: exibir o status só quando há problema
(suspensa, anulada, revogada). Nesta primeira versão **o cliente não altera nada** e não há
clique nem modal. O badge fica do lado esquerdo do edital. Falta definir como aparece em todas
as telas (Recomendadas, Em andamento, Descartadas). "Disputa ou homologação" nunca chegou a ser
implementado.

---

## 14. Modelo de e-mail

**[Aberto]** (Refine 38:36-40:29)

Willian: o template de e-mail já foi feito junto com o CASA e está quase todo resolvido no
back; "agora é uma questão de interface só". Brunno: dependendo do nicho pedem imagem e URL no
template, dá para adicionar.

---

## 15. Domínio além de licitação

**[Aberto]** (Refine 29:25-38:14) — estratégico, não muda o protótipo agora

Willian: a estrutura de Configurações não deveria nascer amarrada a "licitação", porque vêm aí
RFP e concorrências; sugere pensar em objeto de domínio, com variáveis por domínio. Brunno
concordou que o que está desenhado já é genérico o bastante para atender outro tema.

---

## Resumo do que precisa da sua decisão antes de eu mexer

1. Tirar o registro de resultado em lote da remoção de etapa (item 2)
2. Acabar com o excluir e deixar tudo em arquivar (item 3)
3. Reduzir o arrastar: topo fixo e limites por área (item 10)

Os três contrariam pedidos seus das últimas rodadas, então não toquei em nada.
