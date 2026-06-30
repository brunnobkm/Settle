# Explorar licitações — Órgãos favoritos

Protótipo da camada **Órgãos favoritos** dentro da tela **Explorar licitações** (`/busca-de-licitacoes`) da Plataforma Settle. Arquivo único e autossuficiente: [`index.html`](index.html).

## Demo

▶️ **https://brunnobkm.github.io/Settle/Plataforma/orgaos-favoritos/**

## Contexto

Pedido da Convix (trazido pela Larissa): monitorar **tudo que um órgão publica**, mesmo as licitações que **não dão match** com os filtros de curadoria do cliente. É monitoramento, não participação.

A área **Explorar licitações** já é o lugar certo: é o repositório **sem curadoria**, e os cards já vêm com **dados básicos** (a maioria dos campos vazia, porque não passaram pelo processamento). O filtro por **Órgão ou Unidade** e o **Salvar** já existem em produção. O que falta, e é o que este protótipo demonstra, é a **camada de favoritos**: transformar "um filtro salvo" em "órgãos favoritados, com acesso rápido e sinal de novidade".

## O que tem

- **Tela Explorar replicada**: busca (`Busque por licitações`), ações (Buscar/Limpar/Filtros) e cards de **dados básicos** (Valor, CAPAG, Habitantes, etc. como `-`).
- **Favoritar órgão**: estrela no card adiciona/remove o órgão do monitoramento (com toast + Desfazer).
- **Barra de Órgãos favoritos**: chips de acesso rápido; clicar filtra a lista para aquele órgão; `×` remove dos favoritos.
- **Marcador "Novo"**: badge no card e bolinha no chip quando o órgão publicou algo novo (o payoff do monitoramento).
- **Persistência (MVP)**: favoritos ficam salvos no `localStorage` do navegador, como definido na reunião.

## Rodar localmente

```bash
python3 -m http.server 4670 --directory .
# abra http://localhost:4670/
```
