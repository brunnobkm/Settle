# Licitações — Recomendadas

Protótipo da tela **"Selecione quais deseja analisar"** (lista de licitações recomendadas) da Plataforma Settle.
Arquivo único e autossuficiente: [`index.html`](index.html).

## Demo

▶️ **https://brunnobkm.github.io/Settle/Plataforma/licitacoes-recomendadas/**

## O que tem

- **Layout fiel ao Figma**: navbar, cabeçalho, abas (Todas/Ativas/Chegou hoje/Vencendo em breve/Descartadas), barra de ações e cards de licitação no padrão canônico (segmentos, Órgão/Objeto/Valor, grid de campos e tabela de itens com correspondência).
- **Busca funcional** (como na produção): clicar em *Buscar* expande um campo inline, filtra os cards ao vivo, atualiza o título ("Encontramos N licitações com seus filtros") e a contagem da aba.
- **Filtro por propriedade**: ícone de funil no campo abre um menu para escolher em quais propriedades buscar (Edital, Órgão, Objeto, etc.) — seleção múltipla, com chips removíveis e contador.
- **Skeleton de carregamento**: efeito *shimmer* enquanto a busca "carrega".
- **Responsivo**: em telas estreitas o campo de busca ocupa a barra inteira.

## Rodar localmente

É um HTML estático. Basta abrir o `index.html` no navegador, ou servir a pasta:

```bash
python3 -m http.server 4620
# abra http://localhost:4620/
```
