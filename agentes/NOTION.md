# Execução e apresentação de resultados dos agentes

Protótipo: https://brunnobkm.github.io/Settle/agentes-plataforma/

O comportamento das telas está no vídeo e no protótipo. Aqui fica só o que não dá para ver neles.

## Quem vê o card de acompanhamento

- Todos os usuários com acesso à licitação veem o card enquanto houver item em preparação.
- O fechamento é individual: quem fecha deixa de ver, e os demais continuam vendo.
- Se ninguém fechar, o card concluído some em D+1, contado a partir do último item que ficou pronto.
- Os agentes rodam em segundo plano. Quem abre a licitação encontra o card com o que ainda estiver em curso, mesmo que não tenha sido quem enviou para análise.

## Aviso ao entrar em Agentes ou Variáveis com algo rodando

- Se um agente estiver preparando um resultado, ao abrir esse agente, ou uma variável usada por ele, apresentar um aviso via Sonner informando que editar ou excluir configurações pode interromper o que está em curso. Abrir apenas a área de Agentes ou de Variáveis, sem entrar em nenhum item, não mostra o aviso.
- Dentro da funcionalidade, durante a preparação, a ação de configurar o agente fica oculta. Não aparece como botão desabilitado.

## Quando a funcionalidade aparece

| Situação | O que a tela faz |
|---|---|
| Funcionalidade desligada para a conta (feature flag) | Não aparece |
| Agente padrão ainda não criado | Aparece com o convite e a ação Configurar Agente |
| Agente personalizado ainda não criado | Não aparece |
| Agente criado e desativado | Aparece com o aviso e a ação Ativar agente |

Não criado e desativado são estados diferentes, com textos e ações diferentes: quem nunca configurou precisa criar o agente, e quem desligou precisa reativar.

## Momentos de execução

- Quatro eventos: quando a licitação é capturada, quando chega em Recomendadas, quando é enviada para análise e quando o usuário pedir.
- Regra de repetição: só na primeira vez ou toda vez. Não se aplica a "quando o usuário pedir".
- A frase de espera da funcionalidade vem do evento configurado no agente. Um agente que roda em Recomendadas não pode dizer que fica pronto depois do envio para análise.

## Textos

- Na licitação, os textos falam em preparando, disponível, pronto e "Não foi possível carregar". Não usam processamento, processado, execução, fila ou job.
- Na configuração do agente os termos técnicos continuam (Executar agora, Última execução), porque ali o público é quem configura.

## Score

- A classificação quente, morno ou frio vem do backend. Os cortes usados no protótipo são só ilustração.
- Com resultado, o tooltip do botão é o de produção ("Score Quente"). O número fica no rótulo de acessibilidade ("Score: 87/100, Quente").

## Widgets de resultado

- Quando uma funcionalidade é respondida por mais de um agente, cada resposta é um widget próprio.
- A ordem dos widgets numa seção é de cada usuário e fica salva para ele. O protótipo simula o arrasto, mas não guarda a ordem.

## Em aberto

- "Licitações liberadas ao usuário" saiu da lista de momentos: não existe definição do que é essa liberação, nem etapa com esse nome na plataforma. Volta quando for definida.
