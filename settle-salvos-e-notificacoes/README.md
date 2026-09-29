# Salvos para depois e notificações

> **Tela em React.** O código fica em `app/`; o `index.html` é gerado pelo build
> (`cd react && npm run build -- settle-salvos-e-notificacoes`). Veja a seção "Stack" do `AGENTS.md` da raiz.

Duplicado de [Explorar licitações](../settle-explorar-licitacoes/). Usa a área e a mecânica de
**Salvos para depois** para acompanhar licitações, e cria a **central de notificações** que avisa
sobre as atualizações. Task no Notion: "Notificar atualizações de editais descartados" (Design).

## Fluxo

1. **Salvar** (marcador ou sino no card) abre um popover com duas opções:
   - **Só guardar**: vai para Salvos para depois, sem avisos (comportamento de hoje).
   - **Guardar e receber atualizações** (padrão), escolhendo os tipos:
     retificação do edital, novo documento, mudança de prazo, mudança de status,
     esclarecimentos e impugnações.
2. Já salva: o mesmo popover edita os alertas ou remove de Salvos. Sino preenchido = acompanhando;
   o número sobre o sino é de atualizações não lidas.
3. **Salvos para depois** (sidebar): abas Todas · Com atualizações · Acompanhando · Só guardadas.
   Cada card mostra o que acompanha, quando foi salvo e o botão "N atualizações novas".
   As com novidade sobem para o topo.
4. **Central de notificações** (sino da navbar, com contador): abas Não lidas · Todas; cada item traz
   tipo, edital, órgão, o que mudou (antes/agora), leitura do impacto pela IA, documento novo,
   "Ver licitação" (leva ao card em Salvos e destaca) e marcar lida/não lida. Aberta pelo card,
   filtra só aquele edital.
5. **Simular atualização do portal** (botão de protótipo em Salvos): gera uma notificação, só se a
   licitação estiver salva acompanhando aquele tipo.

## Em aberto

- Descartar e acompanhar: hoje o caminho é salvar. Avaliar oferecer "Salvar e acompanhar" no próprio descarte.
- Canal por e-mail e preferências globais (engrenagem da central, não prototipada).
- Para onde a licitação vai quando uma atualização a torna aderente (continua em Salvos por ora).
