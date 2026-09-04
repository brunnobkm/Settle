# Agentes: regras de negócio e governança

Documento de passagem para o time. Duas partes: as regras que o protótipo assume
e que o backend precisa implementar (rascunho para a sessão que a Alice pediu em
03/09), e o benchmark de governança de agentes para enterprise, que ela pediu
como argumento de venda.

Nada aqui é decisão fechada. É o que o protótipo assume hoje, escrito para ser
contestado numa sessão, e não para ser implementado direto.

---

# Parte 1: regras de negócio

## 1. Variável

**O que é.** Uma pergunta tipada feita aos documentos de uma licitação, com um
lugar ordenado onde procurar e um valor para quando não encontrar.

| Regra | Enunciado |
|---|---|
| V1 | Toda variável tem tipo, e o tipo é obrigatório. O tipo valida o valor padrão e restringe o que o prompt pode pedir. |
| V2 | As fontes são uma **lista ordenada**. A extração para na primeira fonte que responde. |
| V3 | "Procurar nos outros arquivos" é uma opção separada, ligada por padrão, para não produzir falso negativo. |
| V4 | Variável da Settle é somente leitura para o cliente. Ele usa em qualquer agente e não edita a definição. |
| V5 | O cliente pode editar o valor padrão de uma variável da Settle? **Em aberto.** O protótipo hoje permite, e isso contradiz V4. |
| V6 | Uma variável calculada carrega as parcelas que entraram no cálculo, com origem, e o cliente pode derrubar uma parcela ou informar o que faltou. |
| V7 | A proveniência é obrigatória e pode ser plural: uma variável calculada tem N trechos, não um. |

**Alterar uma variável.** Toda alteração vale para todos os agentes que a usam, em
todas as licitações analisadas dali para frente. O protótipo sinaliza isso na tela
(chip laranja com "ver mudanças" nos agentes afetados) e conta quantos agentes
serão atingidos antes de salvar.

- **A alterar:** o valor recalcula nas licitações em aberto? **Em aberto**, ligado
  à decisão de versionamento adiada em 03/09.
- **Ao excluir:** os agentes que a usam ficam com uma referência quebrada, marcada
  em vermelho, e param de rodar até alguém resolver. A alternativa (bloquear a
  exclusão enquanto houver uso) foi descartada porque trava o cliente.

## 2. Agente

| Regra | Enunciado |
|---|---|
| A1 | O agente decide sobre **variáveis e sobre o estado do sistema**, nunca reabrindo documentos. Reabrir duplicaria o trabalho da variável, ficaria caro e produziria respostas diferentes para a mesma pergunta. |
| A2 | O gatilho é uma lista fechada pela Settle, não campo livre. |
| A3 | O agente tem um estado ativo/pausado. Pausado, não roda em licitação nova, e o que já produziu continua valendo. |
| A4 | Excluir um agente não apaga o que ele já produziu. **Em aberto:** o resultado fica órfão ou é removido junto? |
| A5 | O resultado do agente aparece no contexto onde ele age (widget), e no card da licitação. Não existe uma tela por análise. |
| A6 | Dois tipos de agente convivem, análise e ação. A diferença não é um tipo declarado: é o campo Permissões. |

## 3. Permissões e aprovação

| Regra | Enunciado |
|---|---|
| P1 | Três estados: aprovar manualmente, aprovar automaticamente, ignorar todas as aprovações. |
| P2 | Hoje o estado é **por agente**. O modelo previsto pelo backend é **por ação**, e depende da lista de ações que a plataforma expõe. Enquanto essa lista não existe, o campo único vale. |
| P3 | Toda ação pendente, de qualquer agente e de qualquer licitação, cai numa fila única, com seleção múltipla. Sem isso, um agente que roda em 50 licitações obriga a abrir 50 licitações. |
| P4 | Recusar uma ação não desativa o agente: ele continua rodando e pedindo aprovação nas próximas. |
| P5 | Quem pode editar um agente que vale para o espaço de trabalho inteiro? **Em aberto**, ligado ao trabalho de permissionamento. |

## 4. Execução e histórico

| Regra | Enunciado |
|---|---|
| E1 | Toda execução registra: em qual licitação rodou, o que fez, como terminou e quando. |
| E2 | Os estados de término são: concluída, aguardando aprovação, falhou. |
| E3 | Uma execução que falhou não deixa resultado parcial visível como se fosse resultado. |
| E4 | Antes de enviar uma licitação para análise, a pessoa vê quais agentes vão rodar, o que cada um produz e o custo estimado. |
| E5 | Os agentes com gatilho "assim que entra no match" já rodaram antes desse ponto, e isso é dito na confirmação. |

## 5. Validação

| Regra | Enunciado |
|---|---|
| L1 | A validação acontece pelo chat: o agente roda em licitações já analisadas e a pessoa marca certo ou errado caso a caso. |
| L2 | O resultado da validação **não vive na conversa**. Fica na configuração do agente: precisão, data, quem validou e quantas correções saíram dali. |
| L3 | Uma nova validação substitui a anterior, e o protótipo mostra o valor antigo ao lado do novo antes de gravar. |
| L4 | **Em aberto:** validar é obrigatório antes de ativar um agente? Hoje não é. Se for, muda o fluxo de criação. |
| L5 | **Em aberto:** quantos casos bastam? O protótipo usa cinco. A hipótese H6 do teste existe para responder isso. |

## 6. Confidencialidade

| Regra | Enunciado |
|---|---|
| C1 | Um agente do cliente só enxerga as fontes que a conta dele alcança. |
| C2 | As fontes que a IA pode consultar são declaradas e editáveis pelo cliente, e a consulta se restringe ao que está marcado. |
| C3 | Variáveis e agentes criados pelo cliente não alimentam a base da Settle nem aparecem para outros clientes. |
| C4 | **Em aberto:** se a Settle publicar uma variável oficial (CAPAG, por exemplo) e o cliente tiver a dele, ele fica na versão antiga ou recebe a nova? Primeira das decisões pendentes desde 21/08. |
| C5 | **Em aberto:** o histórico de execução mostra em quais licitações o agente rodou. Numa conta com times separados por segmento, isso pode expor licitação que o time não deveria ver. Liga com permissionamento. |

## 7. Relacionamentos

```
Variável  —(N:N)—  Agente        uma variável serve a vários agentes
Agente    —(1:N)—  Execução      uma execução por licitação por rodada
Execução  —(0:N)—  Aprovação     ações pendentes, na fila única
Agente    —(0:1)—  Validação     a última vale; o histórico é registro
Agente    —(1:1)—  Destino       Score, Resumo, checklist, aba própria
```

Duas regras que caem daí:

- **Duas regras no mesmo campo do Resumo:** vence a última, vence prioridade, ou a
  interface impede? **Em aberto**, segunda decisão pendente desde 21/08.
- **Quem descobre a lista pode ser um agente diferente de quem roda em cima dela.**
  Hoje são o mesmo agente, o que funciona para análise técnica e quebra no primeiro
  caso de reaproveitamento. A saída mais barata é a lista ser uma variável do tipo
  lista, e não a saída de um agente.

---

# Parte 2: benchmark de governança de agentes

Pesquisa pública de 04/09/2026, para o argumento de venda enterprise que a Alice
pediu em 03/09 (21:52). Não é auditoria de conformidade: é o mapa do que os
compradores enterprise estão pedindo, e onde nós já estamos.

## O que o mercado pede

Uma pesquisa da KPMG com líderes de grandes empresas em 2026 aponta que **75%
citam segurança, conformidade e auditabilidade como o requisito mais crítico**
para adotar agentes. O contraste está no relatório da Deloitte: **21% dizem ter um
modelo de governança maduro**, contra 74% que esperam estar rodando agentes em
dois anos. A distância entre os dois números é o espaço comercial.

Do lado regulatório, o **NIST AI RMF 1.1** (março de 2026) é o padrão prático nos
Estados Unidos, com as quatro funções Govern, Map, Measure e Manage, e o CAISI
abriu em fevereiro de 2026 uma iniciativa específica de padrões para agentes,
focada em autenticação, autorização e identidade. O **IMDA de Singapura** publicou
em janeiro de 2026 um modelo para IA agêntica que exige de cada agente uma
identidade verificável e uma trilha de auditoria de **qual agente agiu sob a
autorização de quem**.

## O conjunto mínimo que os frameworks convergem em pedir

| Controle | Onde estamos |
|---|---|
| Registro de agentes, com dono de negócio e dono técnico | **Parcial.** A lista existe; não há campo de responsável |
| Declaração de propósito por agente | **Temos.** É a instrução em texto |
| Classificação de risco e de dados | **Não temos** |
| Modelo de permissão de menor privilégio | **Parcial.** Três estados por agente, e não por ação |
| Trilha de auditoria reconstruível | **Parcial.** Registramos licitação, ação, estado e hora; não registramos a cadeia de decisão nem qual versão do agente rodou |
| Regras de human-in-the-loop e lógica de escalonamento | **Temos.** É a fila de aprovações |
| Monitoramento de qualidade | **Temos, e é diferencial.** A validação registrada no agente é exatamente isso |
| Processo de incidente | **Não temos** |
| Gestão de mudança de prompts, modelos e fontes | **Parcial.** Versionamos a variável; o agente não |
| Kill switch | **Temos.** O switch de ativo/pausado, mas sem reversão do que já foi feito |
| Identidade do agente ligada a quem autorizou | **Não temos.** Liga com permissionamento |

## O que isso sugere para o produto

**Três coisas viram argumento de venda hoje**, porque já existem e a maioria dos
concorrentes não tem: a fila de aprovações como human-in-the-loop de verdade, a
validação registrada com precisão medida, e a proveniência obrigatória em todo
resultado.

**Duas viram dívida citável na primeira due diligence de um cliente grande**: o
agente não tem versão, então não dá para dizer qual versão produziu qual
resultado; e o kill switch pausa, mas não reverte. A literatura de 2026 é
explícita nesse ponto: um kill switch que só impede ações futuras, sem revogar
permissões e sem reverter o que já foi feito, não conta como controle. Isso
reforça que **o versionamento de agente, adiado em 03/09, é a próxima dívida a
pagar** depois do teste.

**Uma é decisão de produto, não de engenharia**: classificação de risco por agente.
Um agente que só escreve num campo do Resumo e um que move a licitação para
Descartadas não deveriam ter o mesmo tratamento por padrão, e hoje têm.

**Fontes:**
[NIST AI Agent Standards / audit trails](https://www.miniorange.com/blog/ai-agent-audit-trail/) ·
[Guia de auditoria de agentes 2026](https://medium.com/@Indext_Data_Lab/ai-agent-audit-the-complete-2026-governance-and-compliance-guide-aa945b2d2f67) ·
[Boas práticas de trilha de auditoria](https://www.tartanhq.com/blog/best-practices-ai-agent-audit-trails) ·
[Framework de governança de agentes 2026](https://www.ampcome.com/post/ai-agent-governance-framework) ·
[Kill switches em governança de agentes](https://www.solulab.com/ai-agent-governance-kill-switches) ·
[Arquitetura de kill switch](https://www.miniorange.com/blog/ai-kill-switch-architecture/) ·
[CAGE-1, avaliação de controle e governança para IA agêntica enterprise](https://arxiv.org/pdf/2607.03510) ·
[Governança em tempo de execução para agentes](https://arxiv.org/pdf/2603.16586)

---

## Pauta sugerida para a sessão com a Alice

Em ordem de custo de mudar depois:

1. As quatro decisões que mexem no banco: variável do cliente contra a da rede
   (C4), duas regras no mesmo campo do Resumo, quem define a agregação, e a lista
   como variável ou como saída de agente.
2. Permissão por ação: qual é a lista de ações da plataforma (P2).
3. Versionamento de agente: o que a due diligence enterprise vai cobrar.
4. Validação obrigatória antes de ativar (L4), e quantos casos bastam (L5).
5. Classificação de risco por agente.
