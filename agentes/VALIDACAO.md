# Agentes: validação

O que falta para a solução deixar de ser hipótese. Três partes: o que o mercado
já fez (feito), o roteiro de teste com clientes (pronto para rodar) e as decisões
que dependem da Alice (pendentes).

---

## 1. Benchmark

Feito por pesquisa pública em 26/08/2026. Não substitui assistir aos vídeos da
Compi, mas responde ao que interessava: como isso aparece **aplicado a software**.

### Harvey, Agent Builder e Workflow Builder (lançado em maio/2026)

O caso mais próximo do nosso: software vertical, domínio jurídico, usuário
especialista que não é dev.

- **Canvas visual com blocos**, e os blocos são **tipados por função**: User Input
  (coleta arquivo, texto livre, seleção ou tabela de revisão), AI Action (roda um
  prompt usando os inputs anteriores como contexto), Logic (desvia o fluxo por
  condição) e Output (apresenta o resultado).
- **Human-in-the-loop como recurso central**: o agente "expõe decisões e sinaliza
  os momentos em que um input crítico do usuário melhoraria o resultado".
- O usuário pode **pedir em linguagem natural** que a Harvey atualize a lógica do
  workflow, ajuste prompts ou reorganize passos.
- Firmas embarcam contexto próprio (templates) dentro do fluxo.

### Padrão que se repete nas plataformas de 2026

Gumloop, Airtable Omni e Oracle Agentic Applications Builder convergem no mesmo
desenho: **linguagem natural gera o rascunho, o usuário refina na estrutura**. O
canvas de nós existe para editar, não para criar do zero. Human-in-the-loop e
aprovação antes de executar aparecem como recurso vendido, não como detalhe.

### O que isso diz para as nossas decisões

| Decisão nossa | O benchmark |
|---|---|
| Três portas de entrada (linguagem natural, modelo, formulário) | **Confirma.** É o padrão dominante: NL gera, o usuário refina |
| Revisão por lacunas antes de ativar | **Confirma, e era o que eu tinha marcado como invenção nossa.** Harvey chama de human-in-the-loop checkpoint e "expor decisões" |
| Blocos tipados (fonte, variável, regra, saída, destino) | **Confirma.** Harvey tipa por Input / AI Action / Logic / Output |
| Fluxograma como visão secundária | **Enfraquece.** Harvey e Gumloop usam canvas visual como lugar de edição. O ponto da Alice tem base |
| Custo por execução visível | **Sem precedente encontrado.** Nenhum dos players expõe custo por execução ao usuário final. Diferencial nosso, ou sinal de que não importa |

O item do fluxograma é o único em que o benchmark contraria a escolha que fizemos.
Vale levar isso para a conversa em vez de defender a posição anterior: a diferença
é que os blocos deles compõem um processo de várias etapas, e as nossas regras de
Score são de uma etapa só. A pergunta certa passa a ser em que ponto a regra fica
complexa o bastante para pedir canvas.

**Fontes:** [Harvey, Agent Builder](https://www.harvey.ai/blog/introducing-agent-builder) ·
[Harvey, Workflow Builder](https://www.harvey.ai/blog/introducing-workflow-builder) ·
[Harvey, ajuda](https://help.harvey.ai/articles/workflow-builder) ·
[Law.com sobre o lançamento](https://www.law.com/legaltechnews/2026/05/05/harvey-launches-pre-built-ai-agents-self-service-customization-tool/) ·
[Vellum, panorama 2026](https://www.vellum.ai/blog/guide-to-enterprise-ai-automation-platforms)

---

## 2. Teste com clientes

**Formato:** 60 minutos, remoto, 3 participantes.
**Perfil:** 1 de empresa com especialista de IA dentro (perfil CS Frotas ou Vivo) e
2 sem especialista, onde quem mexe é o próprio analista de licitação (perfil
R Supply ou Spline).
**Material:** protótipo `/agentes-plataforma`, na licitação PE 90014/2026.

Os dois casos foram escolhidos pela Alice em 03/09 (17:09): **Score**, que é um
agente que a Settle entrega pronto e o cliente ajusta, e **habilitação por
atestados técnicos**, que é um agente que o cliente cria do zero. A ordem importa:
o primeiro ensina o vocabulário, o segundo cobra.

### Bloco A: Score, um agente que já existe

O que se testa: se a pessoa consegue desconfiar de um número, achar de onde ele
veio e mudar a regra que o produziu.

1. **Sem instrução nenhuma:** "Esta licitação tirou 78 de 100. Você concorda com
   essa nota?" Não aponte nada. Observe se a pessoa abre o painel do Score sozinha
   e se encontra o critério de atestado que somou 15 pontos sem ter achado a
   exigência.
2. "Faça a Settle parar de somar pontos quando ela não encontra a exigência."
3. "Crie do zero uma regra que pontue pela CAPAG do órgão." Observe o que ela faz
   quando o sistema pergunta sobre licitação federal.
4. "O item 2 ficou inconclusivo. O que você faz com isso?"
5. "Você confia que esse agente acerta? Como você descobriria?" Observe se ela
   chega na seção Validação sozinha, e se lê o "8 de 10" como suficiente.
6. "Quanto essa análise está custando para a sua empresa?"

### Bloco B: habilitação por atestados, um agente que ela cria

O que se testa: se a pessoa consegue descrever uma análise em texto, entender
que ela roda sobre variáveis, e decidir onde o resultado deve aparecer.

7. "Você quer saber, em cada licitação, se a sua empresa tem todos os documentos
   e atestados que o edital exige. Faça a Settle responder isso." Deixe criar do
   zero, sem apontar o agente pronto. Anote se ela escreve texto corrido, se
   procura um passo a passo, e se usa o `/` para inserir variável.
8. "O edital exige atestado com equipe alocada presencialmente e os seus atestados
   são de trabalho remoto. O que você espera que o agente faça?" (H3 aplicada ao
   caso 2: "não atende" contra "não avaliado".)
9. "O agente disse que 3 de 5 exigências estão atendidas. Onde você olharia para
   conferir isso?" **Sem apontar caminho.** Esta é a tarefa que valida a decisão
   do widget: observe se ela procura dentro da licitação, numa tela de agentes ou
   na lista de licitações.
10. "Antes de confiar nele para 40 licitações, o que você faria?" Observe se
    valida, se roda em uma licitação de teste, ou se simplesmente ativa.
11. "Chegou uma licitação nova e você quer que esse agente rode nela. O que
    acontece antes de ele rodar?" (Confirmação de envio, custo e aprovações.)

### O que observar

- Onde ela trava: em **não saber o que quer** ou em **não saber que esqueceu um caso**
- Se ela lê o "Por que este número" ou ignora
- Se ela clica na primeira opção da revisão sem ler o motivo
- Se ela distingue "não encontrado" de "não atende" sem ajuda
- Se ela procura um fluxograma em algum momento
- Se ela hesita em salvar por ser algo que vale para a equipe inteira
- **Onde ela procura o resultado primeiro:** no card da licitação, dentro da
  licitação, ou na tela do agente
- Se ela entende que o agente lê variáveis e não os documentos

### Hipóteses a derrubar

| # | Hipótese | Se cair |
|---|---|---|
| H1 | As pessoas travam por não saber que esqueceram um caso, não por não saber o que querem | A versão `/agentes` (conversa conduzindo do início) passa a ser a certa |
| H2 | A maioria das regras reais não ramifica, então texto basta | Se ramificarem, a Alice está certa e o canvas vira padrão |
| H3 | "Inconclusivo" é um resultado aceitável | Se exigirem decisão binária, o modelo de ausência muda |
| H4 | Proveniência resolve a desconfiança no número | Se continuarem desconfiando, falta mais do que citar a fonte |
| H5 | O resultado no contexto é onde a pessoa procura | Se ela procurar uma tela de agentes, a decisão de 03/09 cai |
| H6 | Validar cinco casos basta para a pessoa confiar no agente | Se ela pedir mais, ou ignorar a validação, o formato muda |

Anotar, para cada participante, **quantas das regras que ele descreve ramificam**.
Esse número é o que decide o debate do fluxograma, e não a opinião de ninguém.
Anotar também **onde ela procurou o resultado na tarefa 9**, que é o número que
decide se a sétima decisão está certa.

---

## 3. Decisões que dependem da Alice

As três primeiras mudam o banco, não só a tela.

1. **Variável do cliente ou da rede?** Se a Settle publicar uma variável CAPAG
   oficial e o cliente tiver editado a dele, ele fica preso na versão antiga ou
   recebe a nova?
2. **Duas regras no mesmo campo do Resumo.** Vence a última, vence prioridade, ou
   a interface impede?
3. **Quem define a agregação** na análise técnica: o cliente ou a Settle? Hoje o
   protótipo deixa com o cliente, e isso é uma escolha de produto, não um detalhe.
4. **Custo de quem roda N vezes.** O agente técnico custa R$ 0,45 nesta licitação
   contra R$ 0,03 de um que rodasse uma vez. O cliente vê estimativa antes de ativar?
5. **Quem pode editar** um agente que vale para o espaço de trabalho inteiro. Liga
   direto com o trabalho de permissionamento.

E uma sexta, que apareceu construindo a análise técnica:

6. **Quem descobre a lista pode ser um agente diferente de quem roda em cima dela.**
   No protótipo os dois são o mesmo agente, o que funciona para análise técnica mas
   não sobrevive ao primeiro caso em que o cliente quiser reaproveitar a lista de
   componentes em outra análise. Encadeamento continua adiado na interface, mas a
   pergunta de modelagem é: a lista é saída de um agente ou é uma variável do tipo
   lista, reutilizável como qualquer outra? A segunda resposta é mais barata e cabe
   no modelo atual.

---

## Sétima decisão, aberta em 02/09

7. **Onde o resultado do agente aparece: no contexto ou numa seção própria?**
   Esta é diferente das outras seis: não depende da Alice, depende de teste com
   usuário. As duas posições estão registradas em MODELO.md, e nenhuma das duas é
   obviamente melhor. Sugestão de tarefa para o teste: "Você mandou o agente
   avaliar a compatibilidade técnica desta licitação. Mostre onde você olharia
   para conferir o que ele decidiu." Sem apontar caminho, e observando onde a
   pessoa procura primeiro.

---

## Reunião de 03/09 com a Alice: o que fechou e o que ficou

**Fechado**

7. **Onde o resultado aparece** (a sétima decisão, aberta desde 02/09): o agente
   escolhe onde exibir, e o resultado vira **widget alocado no contexto**, não uma
   tela por análise. *"O resultado do cara fica no contexto dele"* (Alice, 11:25).
   Ela quer inclusive o resultado no card da licitação (11:09).
8. **Um botão de agentes por contexto**, não um por aba (objeção dela em 04:52).
9. **Dois tipos de agente convivem**, análise e ação (06:51). A divisão é
   conceitual: o que separa os dois na prática é o campo Permissões, não um tipo
   declarado.
10. **O chat serve para os dois casos**: falar com um agente ou perguntar sobre o
    edital sem agente nenhum (13:36).

**Em aberto, em ordem de urgência**

1. **Como a validação funciona.** Decisão de 03/09 (Brunno): acontece pelo chat,
   como no Claude, e não numa tela de formulário. O resultado precisa ficar
   materializado fora da conversa, que é o requisito da Alice desde 21/08.
2. **Versionamento de agente** (Alice, 19:29): qual versão rodou em cada licitação,
   e se as licitações em aberto são reprocessadas. Adiado por decisão de 03/09.
3. **Benchmark de governança de agentes para enterprise** (Alice, 21:52): quais
   são as boas práticas que empresas de governança de IA aplicam, para virar
   argumento de venda. Confirmado em 03/09 que fica junto do handoff, não do
   teste com usuário.
4. **Regras de negócio para a documentação do handoff**: validação, execução,
   governança, confidencialidade, relacionamentos, e o efeito de alterar ou
   excluir uma variável nos agentes que a usam. Alice, 21:15: não precisa para o
   teste, precisa de uma sessão antes de passar para o time.
5. **O que a tela mostra antes de "enviar para análise"** (22:48). Tratado como
   tarefa separada.
6. **Escopo do painel dentro da licitação** (Alice, 16:15): listar o histórico de
   todas as licitações dentro de uma licitação vira ruído. O painel precisa mudar
   de escopo conforme a tela.

**Casos de uso escolhidos para o teste de usabilidade** (Alice, 17:09): o **Score**
e a **habilitação por atestados técnicos**. O roteiro dos dois está na seção 2.

---

## O que foi fechado em 04/09

Os pontos abaixo saíram da lista de pendências e estão no protótipo. Ficam
registrados aqui porque a decisão importa mais que a tela.

1. **Validação pelo chat, resultado fora dele.** A conversa roda o agente em cinco
   licitações já analisadas, a pessoa marca certo ou errado em cada uma, e o
   resultado (precisão, data, quem validou, quantas correções saíram dali) é
   gravado na configuração do agente, numa seção Validação. Quem abrir o agente
   depois vê em quantos casos ele acerta sem ter que ler a conversa. Fecha o
   item 1 dos abertos e o requisito da Alice de 21/08.
2. **Resultado no card da licitação.** A tela Licitações mostra, em cada card, o
   que cada agente decidiu naquela licitação. Fecha o pedido da Alice de 11:09 e
   completa a decisão do widget: o resultado aparece nos dois contextos, dentro
   da licitação e na lista.
3. **Escopo do painel por tela.** Dentro de uma licitação a conversa fala daquela
   licitação; fora dela, do acervo. Fecha a objeção da Alice de 16:15.
4. **Histórico de execução completo.** Cada execução mostra em qual licitação
   rodou, o que fez, como terminou e quando. Fecha o pedido do José Victor de
   32:26 (02/09).
5. **O que a tela mostra antes de enviar para análise.** Confirmação com os
   agentes que vão rodar, o que cada um produz, o custo estimado e o aviso de
   que os que pedem aprovação vão parar na fila. Fecha o item 5 dos abertos e a
   quarta decisão pendente (custo antes de ativar).

**Segue adiado por decisão:** versionamento de agente (03/09). **Segue no
handoff:** benchmark de governança e as regras de negócio, agora rascunhadas em
`HANDOFF.md` para a sessão que a Alice pediu.
