# Atualizações e histórico de uma licitação

Card do Notion: "Definir atualizações e histórico de uma licitação" (Alice Iglesias, P1, Design).
Não é a central de notificações: tudo aqui mora na própria licitação.

Publicado: https://brunnobkm.github.io/Settle/settle-atualizacoes-e-historico/
Base: `settle-licitacoes-em-andamento` (Board, Tabela, Calendário) + recorte de Recomendadas.

## Conceitos

- **Atualização**: mudança que veio do portal na composição da licitação: data da sessão,
  arquivo novo ou retificado, manifestação respondida, status.
- **Histórico**: tudo que mudou na licitação, de três origens: Portal, Agentes, Pessoas.

## Regras

### 1 e 2. Indicador em Recomendadas e Em andamento
- Selo "Atualizada" no topo do card com a mudança principal ("Sessão pública adiantada +1").
  Na Tabela e no Calendário vira um ponto ao lado do edital (com texto no `aria-label`/`title`).
- Prioridade do texto: status > data > arquivo > manifestação.
- Cor: âmbar quando pede ação (sessão adiantada, suspensão, conflito com valor editado);
  teal nos outros casos.
- **Duração**: some quando o usuário abre a licitação, ou 7 dias depois da atualização
  se ninguém abrir (`DIAS_DO_SELO`). Vale por usuário.
- Avisos de pregoeiro não acendem selo (mesma decisão da aba Manifestações: geram ruído).

### 3. Dentro da licitação: aba "Atualizações"
- Lista do portal, mais recente primeiro, com "Nova" nas que o usuário não tinha visto.
- Cada item mostra **antes → depois** e **Pode impactar** (seções: Habilitação, Análise
  técnica, Requisitos...).
- **Arquivo**: "Comparar versões" abre só os trechos que mudaram, lado a lado (saiu/entrou).
- **Manifestação**: pergunta e resposta resumidas + seções impactadas.
- **Agentes**: arquivo novo faz os agentes rodarem de novo e gerar nova versão; a anterior
  continua acessível pelo histórico ("Ver versão 1").

### 4. Aba "Histórico"
- Linha do tempo com filtro Todos / Portal / Agentes / Pessoas (com contadores).
- Entra: mudanças do portal, versões de agente (com motivo), e ações de pessoas sobre a
  licitação: etapa, status, datas, responsáveis, resultado, descarte, decisão de divergência.
- Não entra: comentários e visualizações.

### Corner cases (data da sessão)
- **Portal muda uma data que ninguém editou**: aplica direto e registra no histórico.
- **Portal muda uma data que alguém editou à mão**: não sobrescreve. Mostra "Fulano definiu
  29/05 à mão. O portal agora informa 02/06. Qual vale?" com "Usar a do portal" / "Manter".
  A decisão vai para o histórico.
- **Data adiantada**: selo âmbar no card, data nova em vermelho e "Prazo encurtou".

## Protótipo
- "Simular atualização do portal" (selo Protótipo) publica um anexo numa licitação do board.
- Sidebar: Recomendadas e Em andamento trocam de tela; o resto é não prototipado.

## Em aberto (levar ao time)
- Duração do selo: 7 dias por usuário, ou por equipe (alguém abriu, some para todos)?
- Manifestação respondida deve atualizar automaticamente as seções impactadas, ou só sinalizar?
- Diff de arquivo: o backend consegue alinhar trechos entre versões de PDF?
- Recomendadas: atualização deveria reordenar a lista ou mudar o score?
- Outros corner cases: arquivo removido do portal, licitação revogada depois de entrar no board,
  data alterada duas vezes antes de alguém ver.
