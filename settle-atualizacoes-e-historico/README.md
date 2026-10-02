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

### 1 e 2. Selo "Atualização" (Recomendadas e Em andamento)
- Selo único, "Atualização" (mesmo tom laranja do "Atualizado" de produção), no topo do card do
  Board e de Recomendadas e no cabeçalho da página da licitação. Na Tabela e no Calendário vira
  um ponto laranja ao lado do edital (com texto no `aria-label`).
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

## Protótipo
- Sidebar: Recomendadas e Em andamento trocam de tela; o resto é não prototipado.

## Em aberto (levar ao time)
- Duração do selo: 7 dias por usuário, ou por equipe (alguém abriu, some para todos)?
- Manifestação respondida deve atualizar automaticamente as seções impactadas, ou só sinalizar?
- Diff de arquivo: o backend consegue alinhar trechos entre versões de PDF?
- Recomendadas: atualização deveria reordenar a lista ou mudar o score?
- Outros corner cases: arquivo removido do portal, licitação revogada depois de entrar no board,
  data alterada duas vezes antes de alguém ver.
