# Resumo — Protótipo do card de licitação (licitacoes-em-andamento-card/prototype.html)

Sessão de iterações de UX/UI sobre o protótipo HTML do card. Estado final abaixo.

## Mudanças aplicadas

**Layout / aparência do card**
- Largura do card: **342px**
- Sombra removida; stroke `#E5E5E5`, weight 1, position inside (`border` + `box-sizing: border-box`)
- Hover do card: `transform: scale(1.005)`, `transform-origin: 50% 50%`, transição `150ms ease-out`
- Stroke teal `#3A9B9E` **apenas** quando o card está selecionado via checkbox (não no hover)

**Reestruturação de título (mudança principal)**
- Novo campo `titulo` — vira o **título do card** (topo, em destaque, com o checkbox de seleção embutido). Condensa em até 2 linhas (`-webkit-line-clamp: 2`). Editável. Valor de exemplo: *"Locação de software integrado de gestão pública — Pacatuba/SE"*
- `codigoEdital` ("Edital 90001/2026") **deixou de ser título** → virou propriedade comum, logo acima de segmento, peso normal. Agora editável por clique.
- Ordem final das propriedades: **titulo → codigoEdital → segmentos → orgao → objeto → status → responsáveis → data → cidade → valor → itens**
- `objeto` mantido como linha do card (clamp de 3 linhas + preview no hover) — é a base para a IA gerar o `titulo`

**Segmentos / chips**
- Paleta de categorias trocada (8 cores muted): Tecnologia `#4579A6`, Materiais `#694500`, Saúde `#2B6339`, Educação `#46467D`, Engenharia `#A26053`, Serviços `#835B8E`, Construção `#707735`, Alimentação `#783B54`
- Chips agora em **uma linha só** (`white-space: nowrap`), abraçando o texto — sem truncar, sem o espaço vazio que aparecia ao quebrar

**Status**
- 7 status com 3 famílias de cor: Abertas para participação / Homologada (verde), Em disputa ou Homologação / Suspensa (âmbar), Anulada / Revogada / Deserta ou Fracassada (vermelho)

**Outros**
- Avatares removidos dos nomes (responsáveis)
- Separador Cidade • Estado (era `/`)

## Pendências / cuidado

1. **Bug de drag não resolvido** — o ghost (clone que segue o cursor) não aparece no Safari. Há `console.log` de debug ativos em `beginDrag`/`onDragMove` que devem ser removidos quando resolver.
2. **Arquivo reverteu uma vez** — a reestruturação do `titulo` foi perdida pelo ambiente e tive que reaplicar. Conferir se persistiu.
3. **Geração do `titulo` via LLM não implementada** — hoje é valor fixo no `state`. A geração real (Claude API na ingestão do edital, com guardrails: ancorado no objeto, preservar qualificadores e siglas, temperatura baixa, cacheado) é um passo à parte.
4. Chip de segmento com nome muito longo (>~45 caracteres) pode passar levemente da borda do card — trade-off de não truncar.
