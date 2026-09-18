# Importação e exportação (Excel) — Decisões de implementação

Pontos **decididos durante a construção** que **não estão definidos** no documento
"Importação e exportação de dados (Excel) - Análise Técnica de Software".
Cada item precisa de validação com o time/PO.

> Legenda: 🟡 decisão tomada (confirmar) · 🔵 pendente (era para o produto decidir) · ✅ validado

---

## 1. Feedback de sucesso da importação 🟡
- **Doc:** só prevê tratamento de **erro** (mensagem genérica). Não menciona sucesso.
- **Implementado:** toast "Importado: X atualizado(s), Y novo(s)".
- **A decidir:** mostrar feedback de sucesso? Em qual canal — **Sonner** (toast do app),
  banner ou nada?

## 2. UI do erro: modal vs toast 🟡
- **Doc:** "erro genérico com instrução de revisão" — não define o componente.
- **Implementado:** modal central bloqueante com a mensagem padrão
  "Releia as instruções e garanta que está alinhado."
- **A decidir:** manter modal ou unificar em Sonner (erro vermelho)?

## 3. Semântica do merge (preenchimento da tabela) 🟡
- **Doc:** "preenche automaticamente a tabela existente" — sem detalhar.
- **Implementado:**
  - casa linha por **ID** → atualiza a existente;
  - **ID novo** → cria nova linha;
  - requisitos que **já existem mas não vêm no arquivo** → **mantidos** (não apaga).
- **A decidir:** confirmar essa regra (vs. substituir tudo / remover ausentes).

## 4. Validação de valores de célula 🟡
- **Doc:** valida apenas "formato/colunas/abas".
- **Implementado:** valor inválido em `Status` → "Atende parcialmente";
  em `Confiança IA` → "Média" (fallback silencioso).
- **A decidir:** aceitar fallback ou tratar como erro?

## 5. Regra de leitura de abas 🟡
- **Doc:** duas opções (ignorar abas com prefixo especial **ou** ler todas exceto a de
  instruções) — sem escolher.
- **Implementado:** ignora abas cujo nome começa com o prefixo emoji **`📋`**
  (a aba de instruções chama-se "📋 Instruções").
- **A decidir:** confirmar o prefixo/convenção.

## 6. Colunas e ordem da exportação 🟡
- **Doc:** fixa só as obrigatórias `ID` + `Nome do Módulo`.
- **Implementado (ordem):** `ID · Nome do Módulo · Requisito · Status · Confiança IA ·
  Justificativa IA · Responsável · Notas`.
- **A decidir:** confirmar conjunto/ordem das colunas.

## 7. Conteúdo da aba de instruções e nome do arquivo 🟡
- **Doc:** "incluir aba com regras claras" — sem o texto.
- **Implementado:** texto-padrão na aba "📋 Instruções"; arquivo
  `analise-tecnica-software.xlsx`.
- **A decidir:** revisar redação e nome do arquivo.

---

## Pontos do doc ainda em aberto

## 8. CSV e ODS 🔵
- **Doc:** marcados "em análise".
- **Implementado:** aceitos no **upload**; exportação gera **apenas .xlsx**.
- **A decidir:** suportar oficialmente import/export desses formatos?

## 9. Performance com ~800–815 requisitos ✅
- **Doc:** exige tempo de carga semelhante mesmo com 800–815 requisitos.
- **Medido (815 requisitos, biblioteca SheetJS):**
  - Render da tabela: **12 ms**
  - Exportação (.xlsx, 763 KB): **27 ms**
  - Importação (ler + parsear + preencher): **170 ms**
- **Status:** atende com folga (tudo < 1 s).

## 10. A própria tela 🔵
- **Doc:** trata só de import/export; assume que a tela de análise técnica já existe.
- **Implementado:** como a tela não existia no código, foi **reconstruída inteira**
  (cards de stats dinâmicos, filtro Software/Produto/Serviço, tabela). Nada disso é
  especificado no documento.
- **A decidir:** este protótipo é a referência da tela, ou existe um design oficial a seguir?
