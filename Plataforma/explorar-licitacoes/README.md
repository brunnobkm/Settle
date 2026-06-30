# Explorar licitações — Órgãos favoritos

Duplicata da página de [Recomendadas](../licitacoes-recomendadas/), colocada na navegação **Explorar licitações**, com a diferença de ter apenas **duas tabs**: `Todas` e `Órgãos favoritos`. Arquivo único e autossuficiente: [`index.html`](index.html).

## Demo

▶️ **https://brunnobkm.github.io/Settle/Plataforma/explorar-licitacoes/**

## O que tem

- **Idêntica à página de Recomendadas** (mesmos cards, layout, busca, ações), mas com **Explorar licitações** ativo na sidebar.
- **Apenas duas tabs**: `Todas` (sem filtro) e `Órgãos favoritos`.
- A tab **Órgãos favoritos** vem com um **filtro por Órgão** aplicado, apresentado como badge (`Órgão: 2 selecionadas`) no mesmo padrão das demais tabs com filtro. Clicar na badge abre o popover para gerenciar (add/remover) os órgãos, e a lista + a contagem da tab acompanham a seleção.

A página de Recomendadas continua intacta e separada, na sua própria navegação.

## Rodar localmente

```bash
python3 -m http.server 4670 --directory .
# abra http://localhost:4670/
```
