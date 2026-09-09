# Funcionalidade, agente e resultado: os estados

> **Task:** execução e apresentação de resultados
> As duas tasks vizinhas têm documentos próprios: `MODELO.md`, `VALIDACAO.md` e
> `HANDOFF.md` são de **Agentes e Variáveis**; `ESTADOS.md` é de **execução e
> apresentação de resultados**. Decisão de uma não vale para a outra sem passar
> por aqui.

Decisões de UX para a task de execução e apresentação de resultados, cruzada com
a de agentes. Responde aos pontos que o handoff deixou em aberto do lado de
produto. O que é de engenharia (fonte da verdade das flags, contrato do front,
agrupamento, tempo real) não entra aqui.

Tudo o que está decidido abaixo está no protótipo `/agentes-plataforma`, na
licitação PE 90014/2026.

---

## O vocabulário, que é a decisão que sustenta as outras

**Funcionalidade** é o lugar. **Agente** é quem produz. **Resultado** é o que
aparece. Dizer "o Score é um agente" confunde as três coisas e leva a interface a
esconder a funcionalidade quando o agente não existe, que é justamente o erro que
esta task corrige.

Consequência direta: **a funcionalidade continua visível mesmo sem agente**, com
o estado certo. É a Proposta 1, e ela está adotada no protótipo.

---

## 1. Os oito momentos são cinco eventos e uma repetição

O handoff lista oito momentos. Dois pares deles ("primeira entrada em Análise" e
"toda entrada em Análise", "na captura" e "a cada atualização na captura") são o
mesmo evento com repetição diferente. Tratados como oito gatilhos, a lista cresce
por multiplicação e o cliente escolhe errado.

No protótipo ficaram **cinco eventos**, num select:

| Evento | Frase de espera na funcionalidade |
|---|---|
| Quando a licitação é capturada | "Este resultado fica pronto quando a licitação for capturada." |
| Quando chega em Recomendadas | "…quando a licitação chegar em Recomendadas." |
| Quando é liberada para você | "…quando a licitação for liberada para você." |
| Quando é enviada para análise | "…depois que você enviar a licitação para análise." |
| Quando você pedir | "…quando você pedir." |

E uma **regra de repetição** em dois rádios, ao lado: *só na primeira vez* ou
*toda vez*. Ela some quando o evento é "quando você pedir", porque ali não existe
repetição a definir.

A frase de espera **é derivada do evento configurado**, nunca fixa. Um agente que
roda em Recomendadas não pode dizer que fica pronto depois do envio para análise.

## 2. Onde o resultado aparece virou campo do agente

O cadastro ganhou **"Onde o resultado aparece"**, com a lista de funcionalidades:
Score, Checklist, Análise técnica, Análise jurídica, Habilitação, Resumo e
Registro do resultado da licitação. Sem esse campo, criar um agente não diz em
que lugar da licitação a resposta vai parar, e o cliente descobre depois de rodar.

## 3. Os estados de uma funcionalidade

Oito no handoff, sete na tela. Fundi fila e execução, porque a distinção não
muda nada para quem está olhando.

| Estado | O que a tela faz | Ação |
|---|---|---|
| Indisponível na conta | **Não aparece** | nenhuma |
| Agente não criado, e é padrão | Aparece com "Configure um agente para gerar este resultado" | **Criar agente** |
| Agente não criado, e é personalizado | **Não aparece** | nenhuma |
| Agente criado e desativado | "Este agente está desativado. Ative para gerar resultados aqui." | **Ativar agente** |
| Esperando o momento | A frase derivada do evento (tabela acima) | nenhuma |
| Preparando | Giro mais "Estamos preparando este resultado. Ele fica disponível assim que estiver pronto." | nenhuma |
| Pronto | O resultado, no formato do agente | as do agente |
| Não foi possível preparar | "Não foi possível preparar este resultado." | **Tentar de novo** |

**A decisão sobre feature flag desligada:** a funcionalidade some. A alternativa
(mostrar bloqueada, como vitrine comercial) transforma a tela de trabalho em
material de venda para quem não pode comprar, e o analista de licitação não é
quem decide a compra. Se o comercial quiser essa vitrine, ela é uma tela própria,
não um bloco morto no meio da licitação.

**A diferença entre indisponível e desativado** fica assim: indisponível é da
Settle e some; desativado é do cliente e aparece com convite. Quem desativou
sabe que desativou, e precisa do caminho de volta.

**Convite tem dispensa.** O ponto da Alice em 10:50: quem nunca vai querer aquele
agente não pode ver o convite para sempre. O "×" some com o convite naquela
seção, com desfazer no toast. A dispensa é por seção e por pessoa.

## 4. O card de acompanhamento

Fica no **canto inferior esquerdo**, porque o direito é da Settle AI.

- **Título:** "Preparando resultados" enquanto houver item ativo, "Resultados
  disponíveis" quando todos terminarem bem.
- **Lista dinâmica:** só os agentes que aquele evento acionou. No protótipo, com
  o Score rodando em Recomendadas, ele **não aparece** no card do envio para
  análise, que era o erro que a Alice apontou.
- **Sem contador antes do título.** Um "2" solto ali é lido como notificação ou
  etapa.
- **Sem botão de fechar enquanto houver item ativo.** Fechar não pode significar
  cancelar, e o card é a única pista de que algo está vindo.
- **Nada de toast.** O toast de "enviada para análise" saiu: dois avisos
  simultâneos dizendo a mesma coisa competem entre si.

**Conclusão parcial:** quando algum item falha, o título vira "Alguns resultados
não ficaram prontos" e o texto de apoio muda para "Os itens marcados não puderam
ser preparados". Nunca "todos estão prontos" com um erro na lista.

**Falha é estado final.** O card libera o fechamento quando não houver item
ativo, contando falha como terminado. O contrário prende o card na tela para
sempre quando um agente quebra.

## 5. As decisões de produto que sobraram, com recomendação

Estas eu não fechei porque dependem de você ou da Alice.

**Quanto tempo até o card sumir sozinho.** Recomendo **não sumir sozinho** quando
terminou bem, e deixar o fechamento manual. Um card que some sozinho depois de
"pronto" faz a pessoa perder a única notificação de que o resultado chegou. Se
for para sumir, que seja bem depois: 5 minutos, não 20 segundos.

**Quem entra depois da conclusão.** Recomendo **não ver o card**. Ele é o aviso
de uma mudança que a pessoa não presenciou; para quem chega depois, o resultado
já está na funcionalidade, que é onde ela vai olhar.

**Quais agentes padrão aparecem sem configuração.** Recomendo os que a Settle
entrega e o cliente reconhece pelo nome: Score, Checklist, Habilitação, Análise
técnica e Análise jurídica. Registro do resultado e Resumo não, porque não são
lugar de decisão do cliente.

**Editar o agente durante a preparação.** Recomendo **abrir a configuração em
leitura**, com um aviso de que a alteração vale para a próxima vez. Bloquear a
tela inteira impede a pessoa de entender o que está sendo preparado, que é
justamente o que ela foi ali fazer. Esconder o botão, como ficou combinado na
reunião, resolve pela metade: ela clica no lugar e não encontra o caminho.

**Permissão para criar, ativar e configurar.** Fora do meu alcance sem o modelo
de papéis. O que a interface precisa é que essas três ações sejam checáveis
separadamente: ver o resultado, ativar um agente e editar a configuração são três
permissões diferentes, e hoje o convite assume que quem vê pode ativar.

**Confirmar a Proposta 1 formalmente.** O protótipo já a implementa. Vale um "sim"
explícito da Alice, porque tudo acima depende dela.

---

## O vocabulário, e até onde ele vale

Saiu **processamento, processado, execução, fila, job e trigger** dos textos
desta task: os estados da funcionalidade, o card de acompanhamento e as frases de
espera falam em preparando, pronto, disponível e "não foi possível preparar".

**Não vale para a configuração do agente.** Eu tinha estendido a proibição para a
modal, e ficou desfeito em 09/09: lá "Executar agora", "Última execução" e os
estados Concluída, Aguardando aprovação e Falhou continuam como estavam. A
diferença é de público: quem configura um agente fala em execução, e quem lê um
resultado na licitação não precisa saber que existe uma.

"Análise" continua reservada para a etapa da jornada. Por isso o card se chama
"Preparando resultados", e não "Preparando sua análise", que faria a pessoa
pensar que a mudança de etapa ainda não terminou.
