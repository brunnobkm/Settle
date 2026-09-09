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

**Formato:** 45 minutos, remoto, 3 participantes.
**Perfil (Alice, 09/09, 19:02):** **analista de licitação que faz análise técnica,
de habilitação ou jurídica**. Não consultor: gente de dentro da operação de uma
empresa. E não quem só faz triagem, porque o agente de triagem não é o que
estamos testando.
**Recrutamento:** qualificar a TI primeiro (a Michelle tem interesse), depois o
canal de WhatsApp de licitação, depois LinkedIn. Escalando nessa ordem.
**Material:** protótipo `/agentes-plataforma`, na licitação PE 90014/2026.

**O que se testa (Alice, 09/09, 16:38):** como a pessoa **interage com os agentes
e com as ações**, não o racional de um prompt específico. Por isso os casos usam
extrações simples, como CNPJ e data da sessão. Se a tarefa exigir entender o
racional de uma regra complexa antes de mexer na tela, ela testa a regra e não a
interface.

### Bloco A: um agente que já existe produziu um resultado

1. **Sem instrução nenhuma:** "Esta licitação tirou 78 de 100. Você concorda com
   essa nota?" Não aponte nada. Observe se a pessoa abre o painel do Score
   sozinha e se encontra o critério de atestado que somou 15 pontos sem ter
   achado a exigência.
2. "Faça a Settle parar de somar pontos quando ela não encontra a exigência."
   Observe se ela vai pela conversa ou pela configuração.
3. "O agente de habilitação disse que 3 de 5 exigências estão atendidas. Onde
   você olharia para conferir isso?" **Sem apontar caminho.** É a tarefa que
   valida a decisão do widget: observe se ela procura dentro da licitação, na
   lista de licitações ou numa tela de agentes.

### Bloco B: criar um agente simples

4. "Você quer que a Settle extraia o CNPJ do órgão em toda licitação e avise
   quando não encontrar." Observe se ela cria variável ou agente, e se entende a
   diferença.
5. "Agora você quer pontuar as licitações: mais pontos para quem tem segmento em
   comum com a sua empresa, menos para valor abaixo do seu mínimo." Observe qual
   template ela escolhe, e se o formato de tabela ajuda ou atrapalha. **É a
   pergunta que a Alice levantou em 21:24:** preencher isso conversando é pior
   que preencher uma lista de variáveis e pontos?
6. "Antes de confiar nele para 40 licitações, o que você faria?" Observe se
   valida, se roda numa licitação de teste, ou se simplesmente ativa.

### Bloco C: as ações e o que o agente pode fazer sozinho

7. "Este agente quer mover a licitação para Descartadas. Você deixa?" Observe se
   ela encontra a fila de aprovações e se entende o lote.
8. "Você não quer que ele faça isso sem perguntar nunca mais. Como você resolve?"
   (Permissões.)
9. "Nesta aba aparece um agente que você não ativou. O que você faz com ele?"
   Observe se ativa, ignora ou dispensa, e se o convite incomoda.
10. "Chegou uma licitação nova e você quer que os agentes rodem nela. O que
    acontece antes?" (Confirmação de envio, custo e aprovações.)

### O que observar

- Onde ela trava: em **não saber o que quer** ou em **não saber que esqueceu um caso**
- Se ela lê o "Por que este número" ou ignora
- Se ela distingue "não encontrado" de "não atende" sem ajuda
- Se ela procura um fluxograma em algum momento
- **Onde ela procura o resultado primeiro:** no card da licitação, dentro da
  licitação, ou na tela do agente
- **Se ela percebe que pode mover os widgets**, e se tenta movê-los entre seções
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
| H7 | Para o Score, a tabela de variáveis e pontos é melhor que conversar | Se ela preferir conversar, o template de Score não se justifica |

Anotar, para cada participante: **quantas das regras que ele descreve ramificam**
(decide o debate do fluxograma), **onde ele procurou o resultado na tarefa 3**
(decide a sétima decisão) e **qual template ele escolheu na tarefa 5** (decide o
formato de cadastro).

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

---

## Reunião de 09/09 com a Alice

Metade da reunião foi sobre a task do estado de processamento, e o que está
abaixo é só a parte de agentes, mais uma correção que atinge as duas.

### A correção que atinge as duas tasks

**O Score não roda ao enviar para análise** (02:20). Ele roda em **recomendadas**,
porque é o que o cliente usa para triar. Existem quatro momentos: na captura do
edital (agente de triagem), em recomendadas, ao enviar para análise (hoje
checklist e análise técnica) e sob demanda. A frase que interessa ao nosso
projeto é dela: **"o cliente vai poder escolher quando o agente é executado"**,
que é exatamente o campo "Quando roda".

**Existe um segundo eixo de habilitação, que não é o nosso** (02:53 e 09:24). O
Zé criou uma tabela de feature flag por cliente: a conta tem ou não aquele
recurso, e se tem, quando ele roda. O front só recebe. Isso convive com o
ativo/pausado que o cliente controla, e é o que produz o estado "você não tem
esse agente".

### Fechado

11. **O lugar do resultado existe mesmo quando o agente não está habilitado**
    (06:57). Vira um convite: *"ative esse agente"*, contextual à aba em que a
    pessoa está, e com dispensa, porque quem nunca vai querer aquele agente não
    pode ver o convite para sempre (10:50). Vale para os agentes padrão, não para
    os que o cliente cria por conta.
12. **Uma seção pode ter mais de um agente** (15:08), cada um com o seu widget.
13. **Os widgets se movem por drag and drop, com os seis pontinhos, e só dentro
    da seção** (15:26 e 15:45). Mover de habilitação para análise técnica não
    existe: o widget pertence ao contexto.
14. **O formato do resultado é do agente**: chat, gráfico, o que ele produzir
    (14:08). O Claude é a referência de "várias formas de apresentar resultado".

### Em aberto

7. **Como é o cadastro do agente.** A Alice traz proposta (21:24 e 23:01). O
   ponto dela, e é forte: *"quando eu penso em score, eu acho muito ruim o cara
   ter que fazer 100% conversacional. Se é basicamente você ter uma lista de
   variáveis e os pontos"*. Ela quer **templates com formatos de preenchimento
   diferentes**, não só textos de exemplo diferentes. O protótipo já tem uma
   primeira versão disso, com o template de Score em tabela, para o teste
   responder a hipótese H7. **A proposta dela substitui essa versão.**
8. **Configurar um agente durante o processamento.** Ela aceita que clicar no
   Score mostre "estamos processando" (09:50), e o Brunno manteve que a
   configuração precisa estar bloqueada nesse estado (10:00). Ficou sem
   fechamento, e é da outra task.

### Teste

Prazo combinado: protótipo pronto em 10/09, testes a partir de 11/09. O escopo e
o perfil estão na seção 2, já reescritos.
