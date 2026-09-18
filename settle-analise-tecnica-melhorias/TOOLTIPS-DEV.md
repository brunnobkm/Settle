# Análise Técnica: lista de tooltips

Cada tooltip está indicado por **onde fica** e o **texto final**. Itens marcados com **✚** são novos (recomendados agora); os demais já existem no protótipo. Textos prontos para produção.

---

## 1. Lista de itens (tela inicial)

### Indicadores do topo (cards de resumo)
| Onde | Texto |
|---|---|
| ✚ Aderência do edital | Percentual de itens do edital que você consegue atender. |
| ✚ Itens analisados | Total de itens do edital com análise técnica. |
| ✚ Itens que atende | Itens em que você atende a todas as exigências. |
| ✚ Itens que não atende | Itens com ao menos uma exigência não atendida. |

### Filtros e cards
| Onde | Texto |
|---|---|
| ✚ Filtro (Todos / Atende / Não atende) | Filtrar os itens por status de atendimento. |
| Card do item (área clicável) | Abrir a análise completa deste item. |
| Número do item ("Item 1") | Número do item no edital. |
| ✚ Badge de tipo (Produto / Software) | Tipo do item: Produto, Software ou ambos. |
| Status "Atende" | Você atende a todas as exigências deste item. |
| Status "Não atende" | Há ao menos uma exigência que você não atende. |
| ✚ Badge "Melhor produto" | Produto do seu catálogo com maior aderência ao edital. |
| ✚ Badge "Produto escolhido" | Produto que você escolheu para a proposta. |

---

## 2. Cabeçalho da análise (item aberto)

| Onde | Texto |
|---|---|
| Botão "Editar informações do item" | Editar quantidade, unidade de medida e valores do item. |
| Botão compartilhar | Compartilhar o link desta análise (para validação por engenharia, fornecedor ou gestor). |
| Botão exportar | Exportar a análise (PDF, planilha ou resumo técnico). |
| Botão fechar | Fechar e voltar à lista de itens. |
| Seta anterior | Item anterior. |
| Seta próximo | Próximo item. |

---

## 3. Cabeçalho da seção (Produto ou Software)

| Onde | Texto |
|---|---|
| Categoria (menu suspenso) | Categoria usada para comparar com o catálogo. Clique para trocar. |
| Status "Atende / Não atende" | Mesmo texto do status no card (seção 1). |
| Botão "Editar" (Produto) | Editar as exigências desta seção. |
| Botão "Revisar Requisitos" (Software) | Revisar os requisitos deste software. |
| Botão "Mais ações" (três pontos) | Mais ações. |
| ✚ Menu > Concluir análise | Marcar esta análise como concluída. |
| ✚ Menu > Importar | Importar requisitos (planilha ou modelo). |
| ✚ Menu > Exportar | Exportar esta seção (arquivo com requisitos e análise). |

---

## 4. Tabela de Produto (comparação de SKUs)

### Cabeçalhos e coluna de requisito
| Onde | Texto |
|---|---|
| ✚ Coluna "Especificações do edital" | Especificações exigidas pelo edital. |
| Coluna "Valor requerido" | Valor que o edital exige para o requisito. |
| Nome do requisito (célula) | Requisito exigido pelo edital. |
| Alça de redimensionar coluna | Arraste para redimensionar a largura da coluna. |

### Célula "Valor requerido"
| Onde | Texto |
|---|---|
| Botão copiar | Copiar o valor exigido. |
| Botão editar (lápis) | Editar o valor exigido (recalcula ao confirmar). |
| Botão ver origem (seta) | Ver de onde a IA extraiu no edital (página e trecho). |
| Operador (ex.: ≥) | Operador da exigência (fixo, vem do edital). |
| Unidade (ex.: MP) | Unidade de medida do requisito (fixa, não editável). |
| Confirmar edição | Confirmar e recalcular. |
| Cancelar edição | Cancelar edição. |
| Estado "Não extraído" | O edital exige este requisito, mas a IA não conseguiu extrair o valor. Preencha para liberar a comparação. |
| Seta ao lado de "Não extraído" | Abrir o edital para localizar e extrair o valor exigido. |

### Coluna do produto (SKU)
| Onde | Texto |
|---|---|
| Fabricante | Fabricante (informação do produto, não é requisito). |
| Aderência (%) | Aderência: requisitos atendidos e percentual. |
| Preço | Preço do produto (conforme a fonte). |
| Ícone de fonte com link | Fonte: Catálogo do cliente. Clique para abrir. / Fonte: Internet (catálogo externo). Clique para abrir. |
| Ícone de fonte sem link | Fonte: Catálogo do cliente (sem link disponível). |
| Etiqueta "Com estoque" | Com estoque. |
| Etiqueta "Sem estoque" | Sem estoque: precisaria comprar ou terceirizar. |
| Botão "Selecionar" | Definir como produto escolhido para a proposta. |
| Botão "✓ Selecionado" | Remover seleção. |

### Células de atendimento
| Onde | Texto |
|---|---|
| Ícone de atende / não atende | Atendimento calculado pelo sistema (valor do produto x exigência do edital). |
| Valor do produto (célula) | Valor do produto (vem do seu catálogo, somente leitura). Só a exigência do edital é editável. |
| Confiança da IA | Confiança da IA na extração deste valor. |
| Valor sem correspondência | Valor do seu produto disponível, mas ainda sem correspondência: falta extrair a exigência do edital. |

---

## 5. Tabela de Software (checklist)

### Seletor de visão
| Onde | Texto |
|---|---|
| Aba "Visão em requisito" | Ver os requisitos em tabela. |
| Aba "Visão em bloco" | Agrupar os requisitos por módulo. |

### Visão em requisito
| Onde | Texto |
|---|---|
| Seta ao lado do requisito | Ver de onde a IA extraiu no edital (página e trecho). |
| Status (etiqueta clicável) | Clique para escolher o status. |
| Confiança IA | Confiança da IA na extração deste valor. |
| Botão copiar (célula) | Copiar o valor da célula. |
| "+ Nota" (coluna Notas) | Adicionar uma nota interna a este requisito. |
| Coluna "+" no fim | Adicionar uma coluna à tabela. |

### Visão em bloco
| Onde | Texto |
|---|---|
| Ícone excluir (Ações) | Excluir módulo (remove os requisitos do módulo). |
| Ícone link (Ações) | Ir para o módulo. |

---

## Observações

- O **título do item** (nome curto gerado a partir do edital) fica **sem tooltip** (decisão: não informar como o nome foi gerado).
- Os textos de status ("Atende" / "Não atende") são reaproveitados no card e no cabeçalho da seção.
- Onde já existe texto explicativo visível (ex.: bloco "Especificações não exigidas pelo edital"), não é preciso tooltip.
