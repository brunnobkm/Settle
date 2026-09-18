# Análise técnica de software — protótipo

Protótipo da tela de **Análise técnica de software** do Settle, com as funcionalidades de
**importação e exportação de dados (Excel)**.

## Demo ao vivo

[brunnobkm.github.io/settle-analise-tecnica-software](https://brunnobkm.github.io/Settle/settle-analise-tecnica-de-software-importar-exportar/)

## Funcionalidades

- **Exportar** — gera um `.xlsx` com os dados da análise técnica: aba **"📋 Instruções"**
  (regras de preenchimento) + aba **"Requisitos"** com as colunas `ID · Nome do Módulo ·
  Requisito · Status · Confiança IA · Justificativa IA · Responsável · Notas`.
  Download direto para a pasta padrão do navegador.
- **Importar** — aceita upload (`.xlsx / .xls / .csv`), **ignora a aba de instruções**
  (prefixo `📋`), exige as colunas obrigatórias `ID` + `Nome do Módulo`, e **preenche a
  tabela existente** (atualiza por ID, cria novos). Erros mostram a mensagem genérica
  *"Releia as instruções e garanta que está alinhado."*

## Stack

HTML estático + CSS + JS vanilla. Sem build. Excel via [SheetJS](https://sheetjs.com)
(CDN) e Inter via Google Fonts.

## Rodar local

```bash
python3 -m http.server 8765
```

Abrir `http://localhost:8765/`.

## Decisões em aberto

Ver [DECISOES.md](DECISOES.md) — pontos implementados que não estavam no documento
original e precisam de validação do time.
