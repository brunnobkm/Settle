# Roteiro do teste de usabilidade: Agentes

Protótipo do teste: https://brunnobkm.github.io/Settle/agentes-teste/

Guia por etapas para o participante: https://brunnobkm.github.io/Settle/agentes-teste/guia.html

O guia abre o protótipo ao lado, em Agentes, e apresenta tarefas e reflexões separadamente.
A sidebar permanece aberta; a pessoa pode voltar e seguir quando não conseguir concluir uma tarefa.
Nas tarefas, “Preciso de ajuda” revela uma dica; “Ver passo a passo” revela a orientação completa. O nível de ajuda consultado é preservado ao voltar entre tarefas durante a sessão, mas não aparece na tela final. Recarregar apaga esse estado. Avançar não comprova conclusão: o moderador deve observar e anotar se a pessoa concluiu antes ou depois da ajuda.
As perguntas de expectativa sobre exclusão aparecem antes da tentativa; a exclusão deve ser cancelada.
Habilitação e chat continuam sendo etapas de resposta verbal. O guia não grava áudio nem salva respostas.
Recarregue a página inteira do guia para iniciar outra sessão; isso também reinicia o protótipo.
Se a pessoa não alcançar uma tela necessária, o moderador pode ajudar na transição e registrar a intervenção.

Duração prevista: 45 a 60 minutos.

## O que queremos descobrir

1. A pessoa entende o que são as áreas Agentes, Variáveis e Aprovações.
2. Ela consegue criar uma variável e entende para que serve cada campo.
3. Ela consegue criar um agente usando a variável criada e entende a relação entre os dois.
4. Ela entende o botão de executar e o interruptor de ativar.
5. Ela prevê o que acontece ao excluir uma variável e ao excluir um agente.
6. Ela entende o que está acontecendo depois de enviar uma licitação para análise.
7. Ela entende o que é o AI Widget da Habilitação.
8. Ela sabe o que fazer com o chat do canto direito.

## Quem participa

Analista de licitação que faz a análise no dia a dia: habilitação, jurídica e
técnica. Evitar consultor que atende várias empresas, porque o uso dele é outro
(Alice, na reunião de 09/09).

## Antes de começar

- Recarregue a página entre um participante e outro. O protótipo guarda tudo em
  memória, e recarregar devolve o cenário ao início.
- Peça para pensar em voz alta e diga que quem está sendo avaliado é a tela.
- Avise que é um protótipo: partes não funcionam, e isso é esperado.
- Não explique nada antes da pessoa tentar. Devolva as perguntas: "o que você
  acha que aconteceria?".

## Introdução no guia

Duas telas em modal apresentam o teste e a orientação para pensar em voz alta.
A pergunta sobre a rotina atual foi removida. A partir de Primeiras impressões,
o guia aparece como uma sidebar preta sempre aberta, separada visualmente da plataforma.

## Bloco 1: as três áreas (8 min)

Abra a página em Agentes e Variáveis, sem explicar nada.

1. Olhando esta tela, o que você acha que dá para fazer aqui?
2. O que você acha que é um agente? E uma variável?
3. Abra a aba Aprovações. O que você imagina que está aqui, e quem resolveria isso?

**Observar:** que nome a pessoa dá para agente e variável; se acha que agente é
a mesma coisa que o resultado (Score, Checklist); se entende a fila de
aprovações como trabalho dela ou de outra pessoa.

## Bloco 2: criar o dado reutilizável (8 min)

**Tarefa:** imagine que você precisa identificar se cada edital exige atestado de capacidade técnica. Primeiro, cadastre esse dado para poder reutilizá-lo depois, com o nome “Atestado exigido (teste)”. Como faria isso na ferramenta?

Não indique de início que a solução é criar uma variável. O nome com “(teste)” diferencia o cadastro novo da variável “Atestado exigido” já presente no protótipo.

1. O que significa a coluna “Onde procurar” e a ordem apresentada?
2. O que acontece se a variável não for encontrada?
3. Na lista, o que a coluna de agentes está dizendo?

**Observar:** se descobre a área de Variáveis, cadastra o dado como sim ou não e entende que poderá reutilizá-lo. Anote a ajuda solicitada e se concluiu depois dela.

## Bloco 3: criar um agente usando o dado (10 min)

**Tarefa:** agora você quer receber um aviso, em toda licitação, quando o edital exigir atestado de capacidade técnica. Crie um agente que use a variável “Atestado exigido (teste)” que acabou de cadastrar.

Enquanto a pessoa cria, anote onde para. Depois:

1. Como usou a variável no agente? Como sabe que está vinculada?
2. Qual a diferença entre o que a variável faz e o que o agente faz?
3. O que significa “Onde o resultado aparece”? E “Nenhum lugar”?
4. O que significa “Quando roda”? Qual opção escolheu e por quê?
5. Se apareceu repetição, qual a diferença entre as opções?
6. O que são as Permissões? O que mudaria ao escolher cada uma?
7. Você confiaria nesse agente rodando sozinho? Por quê?

**Observar:** se insere a variável criada pelo menu de /, em vez de apenas escrever seu nome; se compreende a relação entre dado e agente; se entende o destino, o momento de execução e as permissões. Se não criou a variável, registre a dificuldade anterior separadamente e permita voltar à tarefa ou pedir ajuda antes de avaliar a reutilização.

## Bloco 4: executar e ativar (5 min)

Volte para a lista de agentes.

1. O que este botão de play faz? Em quantas licitações?
2. E este interruptor ao lado?
3. Se você desligasse agora, o que aconteceria com as licitações que já foram
   analisadas? E com as próximas?

**Observar:** se a pessoa espera que executar rode em uma licitação ou em todas,
e se confunde desativar com excluir.

## Bloco 5: excluir (7 min)

1. **Antes de clicar:** o que você acha que acontece se você excluir a variável
   "Documentos de habilitação"? Agora tente. (Ler a confirmação em voz alta.)
   Cancele no final.
2. O que acontece com os agentes que usavam essa variável?
3. E se você excluir um agente inteiro, o que acontece?

**Observar:** se a pessoa prevê o impacto antes de ver a confirmação; se a
marcação "Precisa de atenção" comunica o estrago sem explicação.

## Bloco 6: enviar para análise (10 min)

Vá para Licitações Recomendadas.

**Tarefa:** Vá para Licitações Recomendadas e clique no card de uma licitação que pareça interessante para abrir os detalhes. Dentro da licitação, clique em “Enviar para análise”. Essa ação inicia as análises dos agentes configurados para essa etapa, ajudando você a avaliar a oportunidade antes de decidir participar. Continue contando o que percebe enquanto usa a ferramenta.

Quando enviar para análise, deixe rolar sem falar nada.

1. O que está acontecendo agora?
2. O que é esse card no canto? Quem pediu isso?
3. Quanto tempo você esperaria por isso? Poderia sair da tela?
4. Como você sabe que terminou?

**Observar:** após a explicação do envio, se relaciona o processamento aos agentes; se espera o resultado
na hora; se tenta fechar o card; se sai da licitação e volta.

## Bloco 7: o AI Widget da Habilitação (5 min)

Com a análise concluída, abra a aba Habilitação.

**Aqui a pessoa só fala.** Ela olha a tela e conta o que entende. Não peça para
clicar nos botões: pergunte o que ela espera que aconteça em cada um.

1. Me conte o que você está vendo aqui.
2. De onde veio essa informação? Dá para confiar?
3. O que você faria se discordasse deste resultado?
4. Olhando estes dois botões, o que você espera de cada um?

**Observar:** se percebe que o conteúdo foi produzido por um agente; se o nome
do agente no topo significa alguma coisa para ela; se procura a origem do dado.

## Bloco 8: o chat (5 min)

Abra o chat do canto direito e deixe a pessoa olhar.

**Aqui a pessoa só fala.** Nada de digitar nem enviar mensagem: o protótipo não
responde de verdade, e a resposta dele não é o que queremos testar.

1. O que você acha que dá para fazer com isso?
2. O que você pediria para ele? Me conte em voz alta, sem digitar.
3. Olhando a lista de agentes aqui dentro, o que muda ao escolher um deles?

**Observar:** se espera um assistente genérico ou uma conversa com o agente; se
pensa em corrigir um resultado por ali; se o nome do agente escolhido muda o que
ela imagina poder pedir.

## Fechamento (5 min)

1. Se isso existisse amanhã, o que você usaria primeiro?
2. O que te deixaria com medo de usar?
3. Tem algo aqui que você não entendeu e ficou sem perguntar?

## O que não está simulado

O chat não responde de verdade (por isso os blocos 7 e 8 são só de conversa), a área de Itens e a de
Manifestações avisam que não fazem parte do protótipo, e o resultado de um
agente que executa uma ação não aparece em lugar nenhum além do histórico.
Se a pessoa cair em um desses pontos, anote e siga.
