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
- `variáveis`: o que extrai, cada uma tipada (número, texto, lista, categoria, booleano).

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
