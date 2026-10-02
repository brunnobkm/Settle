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

### 3 e 4. Sheet "Atualizações"
Versão simplificada (pedido do Brunno, 02/10): uma lista só, sem filtros, agrupamentos ou selos
de impacto. Cada item em até três linhas:
1. o que aconteceu ("Sessão pública adiantada");
2. o que mudou: antes riscado → agora (data, status), resposta da manifestação, ou
   "Ver o que mudou (N)" no arquivo, que abre os trechos antes/agora;
3. quem e quando ("Portal Licitanet · ontem, 16:40").
- "Novas" no topo (ponto laranja), "Anteriores" abaixo. Portal, agentes e pessoas na mesma lista.
- Versão de agente: "Ver versão anterior". Conflito de data: escolha no próprio item.
- Não entra: comentários e visualizações.

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
| Comentário não entra no histórico | Nenhum comentário aparece no sheet |

## Protótipo
- Sidebar: Recomendadas e Em andamento trocam de tela; o resto é não prototipado.

## Em aberto (levar ao time)
- Duração do selo: 7 dias por usuário, ou por equipe (alguém abriu, some para todos)?
- Manifestação respondida deve atualizar automaticamente as seções impactadas, ou só sinalizar?
- Diff de arquivo: o backend consegue alinhar trechos entre versões de PDF?
- Recomendadas: atualização deveria reordenar a lista ou mudar o score?
- Outros corner cases: arquivo removido do portal, licitação revogada depois de entrar no board,
  data alterada duas vezes antes de alguém ver.
