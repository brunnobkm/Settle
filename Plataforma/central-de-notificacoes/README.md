# Notificações da licitação

Componente **reutilizável** que centraliza **Avisos, Impugnações e Esclarecimentos** (e, no modelo, Recursos) de uma licitação.

## Escopo do protótipo

O foco é a **sheet** (slide-over lateral) com as notificações de uma licitação, **aberta por um botão (sino + badge) no card** — no Kanban **ou** na Lista.

| Superfície | Status | Como instanciar |
|---|---|---|
| **Sheet** (drawer pelo card) | **escopo atual** | `new NotificationsCenter(el, { mode: 'sheet', licitacaoId })` dentro de um drawer lateral |
| Central de notificações global | evolução futura — fora do protótipo | `mode: 'panel'` |
| Widget embutido (tab, 600px) | evolução futura — fora do protótipo | `mode: 'widget', licitacaoId` |

O componente já suporta as três superfícies (muda só a `option`), mas **o protótipo entrega apenas a sheet**. A central global e o widget reaproveitam a mesma base quando forem construídos.

## Funcionalidades implementadas (regras do documento)

- **Header fixo:** título, **contador de não-lidas**, ações à direita (fechar; busca/filtro reservados).
- **Tabs por categoria (MVP):** Todas · Avisos · Impugnações · Esclarecimentos (com contagem). **Sem aba "Recursos" no MVP** — ver abaixo.
- **Item de notificação:** badge de categoria, identificador da licitação, **mensagem curta truncada com `…`**, autor (opcional), **timestamp** relativo/absoluto, badge **"Nova resposta"**, indicador de anexos, marcar **lida/não-lida**.
- **Modal "mensagem completa":** mensagem integral, botão **"Visualizar resposta"** no mesmo modal, lista de **Anexos (PDF)** para abrir/baixar e **resumo automático** (Plus) quando o texto é longo.
- **Deduplicação/agrupamento:** duplicatas da mesma manifestação (ex.: enviada por lote) viram **1 item** com contagem de envios.
- **Comportamento da lista:** ordenação mais-recentes-primeiro, **infinite scroll** (carregar mais / "Fim do histórico"), **pull-to-refresh** no topo (busca novidades, ancora a lista).
- **Estados:** carregando (skeleton), **vazio** ("Sem notificações"), **erro** ("Nenhuma notificação encontrada" / no widget "Não foi possível carregar").

## Mapeamento de tipos (backend → UI) — `data.js: mapBackendEvent()`

| Tipo backend | Categoria UI | Observação |
|---|---|---|
| `CLARIFICATION_REQUEST` / `CLARIFICATION_RESPONSE` | Esclarecimento | pedido + resposta (= Questionamentos) |
| `OBJECTION_REQUEST` / `OBJECTION_RESPONSE` | Impugnação | pedido + resposta |
| `APPEAL_INTENTION` | Recurso | usar este (a "intenção") |
| `APPEAL_REASON` | — | **não exibir** (redundante) |
| `APPEAL_COUNTER_REASON` | Recurso | contrarrazão |
| `APPEAL_JUDGMENT` | Recurso · **Aviso no PNCP** | no PNCP, tratar como log/evento administrativo |
| `NOTICE` | Aviso | avisos do pregoeiro / eventos administrativos |

A fonte de dados (`NCData`) é isolada por design: a API ainda não está confirmada, então trocar a origem não deve afetar a UI.

## Recursos no MVP (decisão de produto)

O documento parecia se contradizer (MVP = 3 categorias, mas o domínio real inclui Recursos). Intenção correta aplicada:

- **Sem aba "Recursos" no MVP.** As tabs são Todas · Avisos · Impugnações · Esclarecimentos.
- **O modelo suporta `recurso` desde já** (`mapBackendEvent`), para não travar a evolução.
- Itens de Recurso **aparecem em "Todas"** e, nas abas de categoria, são **agrupados sob "Avisos"** (`tabDaCategoria`), mantendo o **badge "Recurso"**.
- Para promover Recursos a aba dedicada no futuro, basta **`MVP_RECURSOS_TAB = true`** em `data.js` — a aba aparece e o roteamento muda, sem redesenhar o item.

## Densidade por contexto

`option.density` = `comfortable` (padrão da central) ou `compact` (padrão do widget/card). Itens compactos mostram a mensagem em 2 linhas e espaçamento menor, para "bater o olho" no contexto do card/widget.

## Avisar o usuário

Quando o pull-to-refresh traz novidades, um alerta in-app ("X nova(s) notificação(ões) ↑") aparece sobre a lista; clicar leva ao topo. (O *push* automático real depende da API.)

## Busca e Filtro

Funcionais no header da sheet:
- **Busca** (ícone de lupa): abre uma barra que filtra por texto na mensagem, na licitação e no autor.
- **Filtro** (ícone de funil): menu com filtros rápidos — **Não lidas**, **Com resposta**, **Com anexo** (combináveis) + "Limpar filtros". Um indicador no ícone sinaliza filtro ativo.
- Quando busca/filtro não retornam nada, a lista mostra "Nenhum resultado" com ação de limpar.

## Arquivos

- `notifications-center.js` — o componente (`NotificationsCenter`).
- `data.js` — mock dos eventos do backend, mapeamento de tipos e fonte assíncrona (paginação, latência, estados).
- `styles.css` — tokens herdados do projeto + estilos do componente.
- `index.html` + `app.js` — página de demonstração das 3 superfícies + seletor de estados.

## Rodar

```bash
cd central-de-notificacoes
python3 -m http.server 8766
# http://localhost:8766
```
