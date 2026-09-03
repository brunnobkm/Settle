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
**Perfil:** 1 de empresa com especialista de IA dentro (perfil CS Frotas ou Vivo) e
2 sem especialista, onde quem mexe é o próprio analista de licitação (perfil
R Supply ou Spline).
**Material:** protótipo `/agentes-plataforma`, na licitação PE 90014/2026.

### Tarefas

1. **Sem instrução nenhuma:** "Esta licitação tirou 78 de 100. Você concorda com
   essa nota?" Não aponte nada. Observe se a pessoa encontra sozinha o critério de
   atestado que somou 15 pontos sem ter achado a exigência.
2. "Faça a Settle parar de somar pontos quando ela não encontra a exigência."
3. "Crie do zero uma regra que pontue pela CAPAG do órgão." Observe o que ela faz
   quando o sistema pergunta sobre licitação federal.
4. "O item 2 ficou inconclusivo. O que você faz com isso?"
5. "Quanto essa análise está custando para a sua empresa?"

### O que observar

- Onde ela trava: em **não saber o que quer** ou em **não saber que esqueceu um caso**
- Se ela lê o "Por que este número" ou ignora
- Se ela clica na primeira opção da revisão sem ler o motivo
- Se ela distingue "não encontrado" de "não atende" sem ajuda
- Se ela procura um fluxograma em algum momento
- Se ela hesita em salvar por ser algo que vale para a equipe inteira

### Hipóteses a derrubar

| # | Hipótese | Se cair |
|---|---|---|
| H1 | As pessoas travam por não saber que esqueceram um caso, não por não saber o que querem | A versão `/agentes` (conversa conduzindo do início) passa a ser a certa |
| H2 | A maioria das regras reais não ramifica, então texto basta | Se ramificarem, a Alice está certa e o canvas vira padrão |
| H3 | "Inconclusivo" é um resultado aceitável | Se exigirem decisão binária, o modelo de ausência muda |
| H4 | Proveniência resolve a desconfiança no número | Se continuarem desconfiando, falta mais do que citar a fonte |

Anotar, para cada participante, **quantas das regras que ele descreve ramificam**.
Esse número é o que decide o debate do fluxograma, e não a opinião de ninguém.

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
e a **habilitação por atestados técnicos**.
