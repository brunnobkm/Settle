# Licitações — Órgãos favoritos

> **Tela em React (desde 19/09/2026).** O código fica em `app/` (e nas subpáginas, em `<subpágina>/app/`);
> o `index.html` é gerado pelo build (`cd react && npm run build -- <pasta>`). Veja a seção "Stack" do `AGENTS.md` da raiz.
> O que este README descreve sobre arquivos HTML/JS/CSS se refere à versão anterior, que está no histórico do git.

Protótipo da tela de **Órgãos favoritos**: a mesma página de [Recomendadas](../settle-melhoria-deixar-os-filtros-aplicados-mais-visivel/), com a diferença de ter apenas **duas tabs** — `Todas` e `Órgãos favoritos`. Arquivo único e autossuficiente: [`index.html`](index.html).

## Demo

▶️ **https://brunnobkm.github.io/Settle/Plataforma/orgaos-favoritos/**

## O que tem

- **Idêntica à página de Recomendadas** (mesmos cards, layout, busca, ações).
- **Apenas duas tabs**: `Todas` (sem filtro) e `Órgãos favoritos`.
- A tab **Órgãos favoritos** vem com um **filtro por Órgão** aplicado, apresentado como badge (`Órgão: 2 selecionadas`) no mesmo padrão das demais tabs com filtro. Clicar na badge abre o popover para gerenciar (add/remover) os órgãos, e a lista + a contagem da tab acompanham a seleção.

## Contexto

Pedido da Convix (via Larissa): monitorar tudo que um órgão publica. Esta versão entrega a apresentação pedida: a tab de monitoramento com o filtro de órgão sempre visível, reusando o componente de filtro-na-tab que já existe.

## Rodar localmente

```bash
python3 -m http.server 4670 --directory .
# abra http://localhost:4670/
```
