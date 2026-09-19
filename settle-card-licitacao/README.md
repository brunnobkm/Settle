# Card de Licitação — Protótipo (detalhe, edição inline)

> **Tela em React (desde 19/09/2026).** O código fica em `app/` (e nas subpáginas, em `<subpágina>/app/`);
> o `index.html` é gerado pelo build (`cd react && npm run build -- <pasta>`). Veja a seção "Stack" do `AGENTS.md` da raiz.
> O que este README descreve sobre arquivos HTML/JS/CSS se refere à versão anterior, que está no histórico do git.

Protótipo navegável de um card de edital com **edição inline por tipo de propriedade**.

## Como ver
- **Ao vivo:** GitHub Pages (link no topo do repositório → *Settings · Pages*).
- **Local:** abra o `index.html` no navegador (é autossuficiente — Tailwind, Lucide e a fonte Geist vêm de CDN).

## O que dá pra testar
- Clicar em qualquer valor para editar; cada propriedade tem o editor do seu tipo:
  - **Select** (Estado, Modalidade, Julgamento, CAPAG, Cidade) — dropdown com busca.
  - **Data** (Envio da proposta) — calendário.
  - **Moeda / número** — formatação ao sair.
  - **Texto / texto longo**.
  - **Segmentos** — multi-select.
- **Cidade depende do Estado** (a lista filtra pela UF).
- Campos **read-only** (ID, Adicionada, Atualizada) com tooltip.
- Placeholder claro para campos vazios.
- Regra de cor em *Envio da proposta* (vermelho ≤2 dias / amarelo 3–7 / normal).
- Selecionar o card pelo checkbox; copiar valor; hover do card cresce 0,5%.
