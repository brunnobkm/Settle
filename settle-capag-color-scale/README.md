# CAPAG: escala de cores

Decidido na reunião diária de 07/07/2026 e refinado na conversa `settle-capag-color-scale`.

| Categoria | Cor | Token |
|---|---|---|
| A | Verde | `success` |
| B | Verde (mesma cor do A) | `success` |
| C | Amarelo/laranja | `warning` |
| D | Vermelho | `destructive` |
| NE | Sem cor | neutro (`muted`) |
| ND | Sem cor | neutro (`muted`) |

- Um tom por categoria: sem diferenciar variações como B+ ou C+.
- A e B têm a mesma cor porque tons diferentes ficariam pouco perceptíveis. Os dois são a faixa
  "elegível a garantia da União"; a letra continua diferenciando.
- Usar as cores semânticas (success, warning, destructive), não a paleta de categorias: o CAPAG é uma
  escala de bom para ruim, e a paleta de categorias serve para dados sem ordem (modalidade, órgão).
- O Tesouro Nacional não publica códigos de cor oficiais do CAPAG; NE e ND não são categorias oficiais
  (são status do produto), por isso ficam neutros.

Em aberto na reunião: contraste quando houver várias propriedades coloridas no card.
