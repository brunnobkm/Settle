# Atualizações e histórico de uma licitação

Card do Notion: "Definir atualizações e histórico de uma licitação" (Alice Iglesias, P1, Design).
Não é a central de notificações: tudo aqui mora na própria licitação.

Publicado: https://brunnobkm.github.io/Settle/settle-atualizacoes-e-historico/
Base: `settle-licitacoes-em-andamento` (Board, Tabela, Calendário) + Recomendadas copiada de
`settle-melhoria-deixar-os-filtros-aplicados-mais-visivel` (a tela mais fiel à produção).

## Conceitos

- **Atualização**: mudança que veio do portal na composição da licitação: data da sessão,
  arquivo novo ou retificado, manifestação respondida, status.
- **Histórico**: tudo que mudou na licitação, de três origens: Portal, Agentes, Pessoas.

## Regras

### 1 e 2. Selo "Atualização" (Recomendadas e Em andamento)
- No card do Board só aparece o selo (sem ícone de Histórico): o card é pequeno e o histórico
  fica na página da licitação.
- Selo único, "Atualização" (mesmo tom laranja do "Atualizado" de produção), no topo do card do
  Board e de Recomendadas, no cabeçalho da página da licitação, na coluna Edital da Tabela e no
  chip do Calendário (versão menor; o edital quebra para a linha de baixo).
- Em produção o selo "Atualizado" já existe no cabeçalho do card (`HeaderActionsV2`, usado na
  lista de Recomendadas e na página da licitação) quando a licitação tem `dataUpdated`; hoje ele
  só avisa, não abre nada.
- **O clique no selo abre o sheet de Atualizações**, sem abrir a licitação. O resto do card abre
  a página "Detalhes da licitação".
- **Duração**: some quando a pessoa abre o sheet (viu as mudanças), ou 7 dias depois da
  atualização se ninguém abrir (`DIAS_DO_SELO`). Vale por usuário.
- Avisos de pregoeiro não acendem selo (mesma decisão da aba Manifestações: geram ruído).

### Página "Detalhes da licitação"
- Clicar no card de Em andamento abre a página no modelo de produção
  (app.settlegov.com/biddings/<id>): caminho "Em andamento › Detalhes da licitação - <id>",
  cabeçalho com edital, selo e ações, bloco do card, metadados, itens com correspondência e notas.
  Montada com o `LicitacaoCard` do design system.

### 3 e 4. Atualizações e Histórico, separados (reunião de 02/10)
Conceitos da reunião: **atualização do sistema** (mudança vinda do portal), **notificação**
(aviso direcionado à pessoa, outra task), **histórico** (tudo o que aconteceu no card) e
**reprocessamento** (agente roda de novo só quando muda um dado dele).

**Sheet "Atualizações"** (abre pelo selo): só o que veio do portal. "Novas" no topo,
"Anteriores" abaixo; cada item em até três linhas (o que aconteceu, antes → agora, fonte e quando).
- Conta como atualização: qualquer arquivo novo (edital, TR, manifestação, resultado, documento
  de fornecedor, adjudicação; arquivo repetido não conta), data, status, nome do órgão.
  Lista de itens fica para depois.
- Dado que ninguém tinha editado: aplica sozinho e mostra "Aplicada automaticamente".
- Dado crítico editado à mão (data, status): não sobrescreve; o cliente escolhe o valor do portal
  ou mantém o dele. A escolha entra no histórico.
- Arquivo: "Ver o que mudou (N)" abre os trechos antes/agora.
- Link "Ver histórico completo da licitação".

**Sheet "Histórico"**: ícone de relógio (como o Updates do Notion) nas ações do card de Recomendadas e no header da página da licitação (canto direito, ao lado do caminho); também pelo link acima. tudo o que
aconteceu no card, filtrável por Todos / Sistema / Agentes / Usuários (com contadores).
- Sistema: as atualizações do portal. Agentes: execuções e novas versões ("Ver versão anterior").
  Usuários: responsável (quem adicionou), etapa do kanban, status, datas, resultado, descarte,
  recuperação, salvar para depois, ativar notificações, decisões de conflito.
- Comentários não entram: são o recurso Comentários da licitação (a conversa do time no card,
  como numa tarefa do Notion), no balão da página, com painel próprio "Comentários (N)" como em
  produção. Bloco de notas também não entra. Todos da empresa veem o histórico.
- O ícone de Histórico tem contador (como o de arquivos anexados): quantos itens o histórico tem.
- Abrir o histórico não conta como ver as atualizações (o selo continua).

### Corner cases (data da sessão)
- **Portal muda uma data que ninguém editou**: aplica direto e registra no histórico.
- **Portal muda uma data que alguém editou à mão**: não sobrescreve. Mostra "Fulano definiu
  29/05 à mão. O portal agora informa 02/06. Qual vale?" com "Usar a do portal" / "Manter".
  A decisão vai para o histórico.
- **Data adiantada**: selo âmbar no card, data nova em vermelho e "Prazo encurtou".

## Exemplos do card (onde ver no protótipo)

| Exemplo citado no card | Onde ver |
|---|---|
| Indicar atualização em Recomendadas | Recomendadas: os 3 cards têm o selo "Atualização" |
| Indicar atualização em Em andamento (todas as views) | Board, Tabela e Calendário: 048/2026, 089/2026, 156/2026 |
| Data de pregão mudou | Em andamento 048/2026 (adiantou 26/05 → 23/05); Recomendadas 88234/2026 (adiantou 03/06 → 27/05) |
| "O cara mudou a data e o sistema trouxe uma nova" | Em andamento 089/2026: Gustavo tinha posto 29/05, portal trouxe 02/06; escolha no sheet |
| "A data adiantou ao invés de postergar" | 048/2026 e 88234/2026: data nova em vermelho, "(prazo encurtou)" |
| Chegou um novo TR: comparar antigo com novo | 048/2026 e Recomendadas 90001/2026: "Ver o que mudou" mostra os trechos |
| Novas manifestações / resposta de questionamento | 089/2026 (esclarecimento sobre SaaS, afeta Análise técnica); Recomendadas 90455/2025 (questionamento sobre habilitação) |
| Status mudou | Em andamento 156/2026: Abertas → Suspensa |
| Agentes versionam (TR1 → TR2, nova versão, acesso à anterior) | 048/2026 (Análise técnica v2, Habilitação v2), 90001/2026 (Match v2), 90455/2025 (Habilitação v2): "Ver versão anterior" |
| Histórico por pessoas da empresa | 048/2026 e 089/2026: responsável, segmento, data, mudança de etapa |
| Comentário não entra no histórico | 048/2026: comentários no balão da página (painel próprio), fora do Histórico |
| Dado não editado atualiza sozinho | 048/2026 (data), 156/2026 (status), 201/2026 (órgão), 88234/2026: "Aplicada automaticamente" |
| Status editado à mão + portal traz outro | 067/2026: Ana Lima tinha posto Homologada, portal trouxe Suspensa |
| Documento de resultado/adjudicação | 045/2026: "Novo documento: Termo de adjudicação" |
| Nome do órgão (UASG → nome) | 201/2026: "UASG 200366" → nome do órgão |
| Descarte, recuperação, salvar para depois, notificações | 112/2026, Histórico: filtro Usuários |
| Histórico separado das atualizações, com filtros | Página da licitação → botão Histórico; filtros Sistema / Agentes / Usuários |

## Protótipo
- Sidebar: Recomendadas e Em andamento trocam de tela; o resto é não prototipado.

## Em aberto (levar ao time)
- Duração do selo: 7 dias por usuário, ou por equipe (alguém abriu, some para todos)?
- Manifestação respondida deve atualizar automaticamente as seções impactadas, ou só sinalizar?
- Diff de arquivo: o backend consegue alinhar trechos entre versões de PDF?
- Recomendadas: atualização deveria reordenar a lista ou mudar o score?
- Outros corner cases: arquivo removido do portal, licitação revogada depois de entrar no board,
  data alterada duas vezes antes de alguém ver.
