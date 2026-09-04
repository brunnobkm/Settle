# Anatomia de um agente

Modelo de dados dos agentes, anterior às telas. A partir das reuniões de 21 e 24/08/2026.
Versão apresentável: artefato "Anatomia de um agente".

## Por que fechar isso antes das telas

A V1 acordada é o cliente gerenciar o próprio Score e Resumo. O risco é que o Score seja o
caso mais simples da plataforma: roda uma vez por licitação e devolve um número. Se o modelo
nascer com o formato do Score, ele não recebe a análise técnica depois.

A cadeia é a mesma para toda análise da plataforma:

```
Fonte  ->  Variável  ->  Regra  ->  Saída tipada  ->  Destino
(edital,   (informação  (pontuar,  (número,          (só aceita
 TR,        extraída,    listar,    status,           certos
 portal)    tipada)      comparar)  lista, texto)     tipos)
```

O que muda de uma análise para outra são os valores em cada elo.

## As dimensões de um agente

**O que ele lê**
- `escopo`: por licitação, por item, por componente ou por documento. Define quantas vezes roda.
- `gatilho`: entrou no match, enviada para análise, documento novo, sob demanda.
- `fontes`: portal, edital, TR, anexos, documentos da empresa, bases externas.
- `variáveis`: o que extrai, cada uma tipada (número, texto, lista, categoria, booleano)
  **ou calculada**, ver abaixo.

**O que ele decide**
- `regra`: pontuar, classificar, filtrar, listar ou redigir.
- `agregação`: como N resultados viram um. Só aparece quando o escopo é menor que a licitação.
- `ausência`: FOUND / NOT_FOUND / OTHER, mais a política para cada caso.

**O que ele devolve**
- `tipo de saída`: número, status, lista, texto ou booleano. Restringido pelo destino.
- `destino`: Score, Resumo, checklist, análise técnica, match, aviso ou aba própria.
- `proveniência`: documento, página e trecho. Obrigatória.
- `versão` e política de recálculo.

Ausência já tem vocabulário definido no Resumo (FOUND / NOT_FOUND / OTHER). Não criar um
segundo. Consequência prática: licitação federal na regra de CAPAG é OTHER, não NOT_FOUND.
Não é que a informação faltou, é que a pergunta não se aplica.

## Variável calculada

Caso trazido pela Larissa em 31/08: "Peso total estimado de polpa (kg)" não sai de um trecho
do edital, sai da **soma da quantidade de N itens** da tabela. Ela pediu duas coisas: marcar
que aquilo é uma conta, e ajudar o cliente quando a conta está errada ou incompleta.

Isso é uma dimensão que faltava. A agregação não acontece só no resultado da análise (o status
do item na análise técnica): ela acontece **dentro da variável**.

Uma variável calculada tem:

| Campo | Exemplo |
|---|---|
| `operação` | soma, contagem, média, máximo |
| `campo` | quantidade |
| `critério` | itens cujo objeto é veículo leve |
| `parcelas` | uma linha por item que entrou, com valor e origem |
| `pendências` | parcela suspeita e item não extraído |

**Por que a interface precisa mudar por causa disso**

1. O valor não pode aparecer como número solto. Precisa dizer que é conta e de quantas parcelas.
2. A memória de cálculo precisa ser visível: quais itens entraram, com quanto e de onde.
3. O cliente precisa poder **derrubar uma parcela errada** (o caso do trecho que juntou a
   quantidade com o valor unitário e virou 480 em vez de 4) e **informar o que não foi
   extraído** (quantidade que estava numa imagem).
4. Cada correção recalcula o total e pode mudar a faixa: no protótipo, informar o item que
   faltava leva de 48 para 60 veículos e o score de 78 para 83.

A proveniência aqui é plural: são N trechos, não um. Isso vale para toda variável calculada,
e é o mesmo padrão do "peso total de polpa" e da "quantidade de veículos".

## O destino manda no formato

Nos protótipos "onde aparece" é um checkbox de exibição. Não é: é restrição de tipo.

| Destino | Escopo | Tipo de saída | Resultados | Agrega |
|---|---|---|---|---|
| Score | licitação | número | 1 | não |
| Resumo | licitação | texto, categoria, booleano | 1 por campo | não |
| Checklist de habilitação | licitação | lista com status | N | não, mas separa vazia de não encontrada |
| Análise técnica | item ou componente | status | N por item | **sim** |
| Match | licitação | booleano | 1 | não |
| Aviso | licitação ou documento | booleano + texto | por evento | não |
| Aba própria | qualquer | qualquer | qualquer | depende |

## Os três casos

### 1. CAPAG no Score — passa limpo

- escopo: licitação · gatilho: ao enviar para análise
- fontes: portal, base do Tesouro
- variáveis: `esfera` (categoria), `capag` (categoria)
- regra: ramifica por esfera, pontua pela nota · saída: número 0 a 10
- ausência: CAPAG não encontrada = NOT_FOUND (0 + sinaliza); federal = OTHER ("não se aplica")

**Ensina:** se NOT_FOUND e OTHER virarem o mesmo zero, o cliente lê licitação federal como
órgão de risco, o oposto do que o dado diz.

### 2. Checklist de habilitação — passa com remendo

- escopo: licitação, mas produz N linhas · gatilho: assim que entra no match
- fontes: edital, anexos, documentos da empresa
- variáveis: `documentos_exigidos` (lista), `documentos_da_empresa` (lista)
- regra: extrai e cruza · saída: lista de itens com status

**Remendo exigido:** ausência hoje é por variável, aqui precisa existir também no nível do
agente. "Não consegui ler a habilitação" não pode virar lista vazia lida como "não exige
nada". Mesmo defeito do zerado da análise técnica apresentado como atende.

### 3. Análise técnica de um item — quebra em dois pontos

- escopo: componente, e um item tem N componentes
- variáveis: `componentes` (lista descoberta em execução), `especificação`, `equivalente_no_catálogo`
- saída: status por componente + status agregado do item

**Quebra 1, escopo não é estático:** os componentes não existem antes de alguém ler o TR. O
escopo de execução é resultado de uma extração anterior. Um agente precisa poder produzir a
lista sobre a qual outro roda.

**Quebra 2, falta a volta:** o status do item deriva dos status dos componentes. Todos
precisam atender? Só os críticos? Maioria? Nenhuma outra análise precisa disso.

## Conclusão

Um agente igual a uma regra fecha Score, fecha Resumo e quase fecha habilitação. Não fecha
análise técnica. Falta encadeamento: um agente descobre a lista, outro roda por elemento,
uma regra de agregação devolve o resultado ao item.

É a "caixinha com regras dentro" do dia 21, que na semanal ficou combinado adiar. A decisão
de adiar continua certa.

> **Adiar a interface de workflow, não o modelo de dados.**

Escopo e agregação podem nascer com um único valor possível e sem nenhuma tela. Se não
nascerem, a análise técnica só entra por reescrita ou gambiarra.

## V1: implementa vs reserva

| Campo | V1 | Interface |
|---|---|---|
| gatilho, fontes, variáveis, regra | implementa | visível e editável |
| variável calculada e memória de cálculo | implementa | marcação de "cálculo" mais painel de parcelas com correção |
| tipo de saída e destino | implementa | destino visível, tipo é consequência |
| ausência em três estados | implementa | pergunta obrigatória antes de ativar |
| proveniência | implementa | no resultado, como no Resumo |
| versão e recálculo | implementa | escolha ao ativar |
| escopo | reserva | fixo em "por licitação", sem tela |
| agregação | reserva | vazio, sem tela |
| encadeamento | reserva | nenhuma |
| destinos match e análise técnica | reserva | fora da lista por enquanto |

Com essa divisão a V1 precisa de três destinos apenas: Score, Resumo e aba própria. Cobrem
número, texto e lista, e são os únicos que não exigem escopo dinâmico nem agregação.

## Em aberto (decisão da Alice)

As três primeiras mudam o banco, não só a tela.

1. **Variável do cliente ou da rede?** Se a Settle publicar uma variável CAPAG oficial e o
   cliente tiver editado a dele, ele fica preso na versão antiga ou recebe a nova?
2. **Duas regras no mesmo campo do Resumo.** Vence a última, vence prioridade, ou a interface impede?
3. **Quem define a agregação** na análise técnica, o cliente ou a Settle?
4. **Custo de quem roda N vezes.** Um agente por componente custa muito mais que um por
   licitação. O cliente vê estimativa antes de ativar?
5. **Quem pode editar** um agente que vale para o espaço de trabalho inteiro. Liga direto com
   o trabalho de permissionamento.

---

# Revisão de 02/09 (reunião com Bruno Ortiz e José Victor Almada)

A conversa foi sobre o que o backend já tem e o que precisa receber. Ela corrige três coisas
que o protótipo tinha resolvido pela metade e acrescenta um tema inteiro que estava fora.

## A variável, com os campos que o backend espera

| Campo | Regra | Origem |
|---|---|---|
| nome | curto, é o que aparece dentro das regras | hoje só existe uma key |
| descrição | uma linha, para o cliente entender variável cadastrada pela Settle | José Victor, 05:30 |
| **tipo** | **obrigatório**: texto, número, sim ou não, data, lista, categoria | José Victor, 10:04 |
| **prompt** | campo próprio, separado do nome, porque cresce | José Victor, 08:05 |
| **fontes** | **lista ordenada**, não conjunto | Bruno Ortiz, 12:31 |
| **valor padrão** | tipado: segue o tipo escolhido, não é texto livre | José Victor, 17:10 |
| versão | como já estava | |

O tipo não é decoração: é ele que valida o valor padrão e o que o prompt pode pedir. Uma
variável de data não aceita "abacaxi" como padrão, senão quebra na hora de entrar no Score.
Por isso o campo do valor padrão muda de formato quando o tipo muda: booleano vira sim/não/nenhum,
número vira campo numérico, data vira calendário, e só texto é realmente livre.

A dedução de tipo pelo enunciado, que o protótipo fazia até 02/09, foi removida.

### Fonte é ordem, não conjunto

O caso que fechou a discussão é do Bruno Ortiz: "eu quero buscar o CNPJ e quero dar preferência
para a minuta do contrato". A Settle procura na primeira fonte e só passa para a seguinte se não
achar. Como o José Victor apontou (14:24), as quatro categorias grossas escondem uma distinção que
importa: dentro de "Edital e anexos" o estudo preliminar costuma estar desatualizado e o termo de
referência é o que rege. A lista de fontes passou a ter os dois níveis.

O "resto dos arquivos" virou uma opção separada e ligada por padrão, respondendo ao ponto de que o
comportamento do sistema deveria ser procurar em todo o resto para não produzir falso negativo
(José Victor, 11:12).

### Variável da Settle é somente leitura

O cliente usa em qualquer agente, mas não edita a definição (José Victor, 20:49). E a lista precisa
de busca, porque a Settle vai cadastrar muitas e o cliente poucas (20:54).

## O agente: permissões, aprovação e histórico

Tema que não existia no modelo. "Você tem que dizer para o agente, na configuração do agente, o que
ele pode ou o que ele não pode fazer dentro da plataforma. E tem ações que deveriam ser aprovadas
por ser humano" (Bruno Ortiz, 46:33).

**Três estados por ação, não dois**: não pode, pede aprovação, executa sozinho. O estado do meio é o
que faz a fila de aprovações existir.

**O protótipo simplificou isso para três estados por agente**, não por ação: um seletor de Permissões
na configuração, com aprovar manualmente, aprovar automaticamente e ignorar todas as aprovações. A
razão é que a lista de ações que um agente pode executar na plataforma ainda não existe: ela vem do
backend, e sem ela um controle por ação seria inventado. A escolha vale enquanto cada agente faz uma
coisa só. Quando a lista chegar, o campo vira uma matriz de ação por estado, e a fila de aprovações
não muda, porque já é alimentada pelo estado do meio. **Pendente com o Bruno Ortiz e o José Victor:
a lista de ações.**

**A fila de aprovações em lote** responde ao corner case que ficou sem resposta na reunião (48:14):
se o agente roda em 50 licitações e cada ação pede aprovação, ninguém vai abrir 50 licitações para
clicar em aprovar. Todas as ações pendentes, de todos os agentes, caem numa fila só, com seleção
múltipla.

**Histórico de execução** (José Victor, 32:26): quando rodou, em qual licitação, o que fez e em que
estado terminou. Sem isso, confiar uma ação ao agente é confiar sem auditoria.

## O que a reunião confirmou

- **Prompt livre venceu o passo a passo.** "Hoje em dia é mais fácil pedir em forma de texto, a gente
  não precisa fazer UI e a pessoa não precisa aprender a usar UI" (José Victor, 28:07). Isso reforça
  a decisão de manter o fluxograma como visão secundária, contra a preferência inicial da Alice.
- **O `/` para inserir variável no meio do prompt** foi validado (22:14).
- **O agente lê variáveis, não documentos** (José Victor, 28:27): se o agente reabre os documentos,
  ele duplica o trabalho da variável, fica caro e fica inconsistente, porque a mesma extração pedida
  duas vezes pode voltar diferente. O agente decide em cima de variáveis e do estado do sistema.
- **Gatilho é lista fechada pela Settle**, não campo livre (25:21).
- **Para o cliente, variável é o que sai de arquivo.** CAPAG e população vêm de portal e bases, mas
  essas são cadastradas pela Settle (09:55).

## Em aberto, e é o mais importante para o teste

7. **Onde o resultado do agente aparece.** O José Victor defende que apareça onde o agente foi
   configurado para rodar, junto da análise técnica ou da jurídica (39:08). O risco que levantei é
   espalhar agente por toda a plataforma e a pessoa não saber onde procurar; a contraproposta é uma
   seção de agentes dentro do workspace da licitação (40:00). A objeção dele à contraproposta é
   concreta: quem quer validar o que o agente decidiu na análise técnica ficaria alternando entre
   duas abas (41:26). Ficou em "a gente teria que testar na prática".
