// Análise técnica: documentação para desenvolvimento.
// Regras e variações de cada componente da tela (a referência visual final é o Figma).

import type { ReactNode } from "react"
import { SproutIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const SUMARIO = [
  { id: "visao", titulo: "1. Visão geral" },
  { id: "lista", titulo: "2. Lista de itens" },
  { id: "card", titulo: "3. Card do item" },
  { id: "sheet", titulo: "4. Sheet do item (abertura e header)" },
  { id: "resumo", titulo: "5. Resumo executivo" },
  { id: "cards-colap", titulo: "6. Cards colapsáveis" },
  { id: "produto", titulo: "7. Seção Produto" },
  { id: "software", titulo: "8. Seção Software" },
  { id: "editar", titulo: "9. Editar informações" },
  { id: "diferencial", titulo: "10. Diferenciais (botão +)" },
  { id: "concorrencia", titulo: "11. Item em reprocessamento (edição concorrente)" },
  { id: "vazia", titulo: "12. Item não processado (análise vazia)" },
]

function Secao({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-12 flex flex-col gap-2 border-t pt-3">
      <h2 id={id} className="scroll-mt-4.5 text-[21px] font-bold tracking-tight">
        {titulo}
      </h2>
      {children}
    </section>
  )
}

function Sub({ children }: { children: ReactNode }) {
  return <h3 className="mt-4 text-base font-semibold">{children}</h3>
}

function Lista({ children }: { children: ReactNode }) {
  return <ul className="flex list-disc flex-col gap-1 pl-5.5">{children}</ul>
}

function Codigo({ children }: { children: ReactNode }) {
  return <code className="rounded-sm bg-muted px-1.5 py-px font-mono text-[12.5px]">{children}</code>
}

/** Caixa de destaque: dica/regra (marca) ou atenção (âmbar). */
function Caixa({ tipo = "dica", titulo, children }: { tipo?: "dica" | "atencao"; titulo?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "my-1.5 rounded-lg border border-l-3 px-4.5 py-4",
        tipo === "dica" ? "border-l-primary bg-primary/5" : "border-l-warning bg-warning/10"
      )}
    >
      {titulo && <h4 className="mb-1.5 text-sm font-semibold">{titulo}</h4>}
      <div>{children}</div>
    </div>
  )
}

function Tabela({ cabecalho, linhas }: { cabecalho: string[]; linhas: ReactNode[][] }) {
  return (
    <Table className="my-1.5 text-[13.5px]">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {cabecalho.map((c) => (
            <TableHead key={c} className="px-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {c}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {linhas.map((l, i) => (
          <TableRow key={i} className="hover:bg-transparent">
            {l.map((c, j) => (
              <TableCell key={j} className="px-3 py-2.25 align-top whitespace-normal">
                {c}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

const Atende = () => <Badge variant="success">Atende</Badge>
const NaoAtende = () => <Badge variant="destructive">Não atende</Badge>
const Neutro = ({ children }: { children: ReactNode }) => (
  <Badge variant="outline" className="bg-muted text-muted-foreground">
    {children}
  </Badge>
)

export default function App() {
  return (
    <main className="mx-auto max-w-205 px-6 pt-12 pb-30 text-[15px] leading-relaxed">
      <div className="mb-6.5 flex items-center gap-2.5 text-[15px] font-bold">
        <span aria-hidden className="grid size-6 place-items-center rounded-md bg-primary/10 text-primary">
          <SproutIcon className="size-4" />
        </span>
        Settle · Análise técnica
      </div>

      <h1 className="mb-2 text-3xl font-bold tracking-tight">Documentação para desenvolvimento</h1>
      <p className="mb-2 text-muted-foreground">
        Regras e variações de cada componente da tela de Análise técnica. Protótipo de referência:{" "}
        <a className="font-semibold text-primary underline-offset-4 hover:underline" href="../">
          brunnobkm.github.io/Settle/settle-analise-tecnica-melhorias
        </a>
        . A referência visual final (medidas, espaçamentos) é o Figma; aqui estão as regras de comportamento.
      </p>

      <nav aria-label="Sumário" className="my-2 columns-2 gap-7 rounded-lg border bg-muted px-5.5 py-4.5 max-sm:columns-1">
        {SUMARIO.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="block break-inside-avoid py-1 text-[13.5px] font-medium text-foreground hover:text-primary"
          >
            {s.titulo}
          </a>
        ))}
      </nav>

      <Secao id="visao" titulo="1. Visão geral">
        <p>
          A tela lista os <b>itens do edital</b>. Cada item é um card; clicar abre um <b>sheet</b> (overlay de tela cheia) com
          a análise. Dentro do sheet, o item se divide em <b>seções</b> conforme a mecânica de cada parte:
        </p>
        <Lista>
          <li>
            <b>Produto</b>: comparação dos SKUs do catálogo contra as exigências do edital (matriz).
          </li>
          <li>
            <b>Software</b>: checklist de atende / não atende por requisito.
          </li>
        </Lista>
        <p>
          Cada item tem <Codigo>tipo</Codigo> (categoria: "Câmera de segurança", "Switch"...), <Codigo>nome</Codigo> (resumo
          curto), <Codigo>descricao</Codigo> (texto longo) e <Codigo>componentes[]</Codigo>, cada um com{" "}
          <Codigo>mecanica</Codigo> <Codigo>"produto"</Codigo> ou <Codigo>"checklist"</Codigo>.
        </p>
        <Caixa titulo="Regra">
          <b>Tipo</b> = a categoria do item (o que ele é), não a mecânica. É o prefixo da descrição no card.
        </Caixa>
      </Secao>

      <Secao id="lista" titulo="2. Lista de itens (tela inicial)">
        <Lista>
          <li>Não há abas/tabs de filtro.</li>
          <li>
            Botão <b>Exportar</b> alinhado à direita, acima da lista. Fundo <Codigo>#171717</Codigo> a 10%, texto{" "}
            <Codigo>#171717</Codigo>, sem ícone.
          </li>
          <li>Cada item é um card clicável que abre o sheet.</li>
        </Lista>
      </Secao>

      <Secao id="card" titulo="3. Card do item">
        <Sub>Badges de tipo</Sub>
        <p>Uma badge de tipo por item.</p>
        <Tabela
          cabecalho={["Tipo", "Texto", "Fundo", "Exemplo"]}
          linhas={[
            ["Produto", <Codigo>#783B54</Codigo>, "mesma cor a 10%", <Badge variant="category-8" className="font-semibold">Produto</Badge>],
            ["Software", <Codigo>#4579A6</Codigo>, "mesma cor a 10%", <Badge variant="category-1" className="font-semibold">Software</Badge>],
          ]}
        />
        <Sub>Descrição</Sub>
        <Lista>
          <li>
            Formato <b>"Categoria - texto"</b> (ex.: "Câmera de segurança - Fornecimento de 80 câmeras...").
          </li>
          <li>Usa a descrição longa; software (sem descrição longa) usa o resumo curto.</li>
          <li>
            Limite de <b>300 caracteres</b> (com o prefixo). Acima disso trunca com reticência; o texto completo fica no tooltip.
          </li>
        </Lista>
        <Sub>Badge de status (varia por tipo)</Sub>
        <Tabela
          cabecalho={["Situação", "Badge"]}
          linhas={[
            [
              "Produto",
              <>
                <Atende /> / <NaoAtende />
              </>,
            ],
            ["Software analisado", "Aderência X% (cor por faixa: <50 vermelho · 50–80 neutro · >80 verde)"],
            [
              "Software em análise (há requisitos não avaliados)",
              <>
                <Neutro>Em análise · X%</Neutro> (mostra o progresso, não a aderência)
              </>,
            ],
          ]}
        />
        <Sub>Recomendação de produto</Sub>
        <Caixa tipo="atencao">
          <b>O card NÃO mostra recomendação.</b> Só mostra a <b>escolha</b> do usuário: quando um SKU é selecionado, aparece "✓
          Produto escolhido: [modelo] · [marca]". Antes da escolha, nenhum produto é sugerido.
        </Caixa>
      </Secao>

      <Secao id="sheet" titulo="4. Sheet do item · abertura e header">
        <Lista>
          <li>
            <b>Abertura/fechamento</b>: desliza da direita para a esquerda (entra por fora à direita e desliza até cobrir; fecha
            deslizando de volta).
          </li>
          <li>
            <b>Header (canto superior direito)</b>: Compartilhar · Importar · Baixar · Fechar.
          </li>
          <li>
            <b>Importar</b> só aparece em itens com software.
          </li>
          <li>
            Compartilhar, Baixar e Fechar <b>não têm tooltip</b>. Compartilhar, Importar e Baixar ainda não estão prototipados:
            ao clicar, mostram o aviso "Esta página ainda não foi prototipada."
          </li>
        </Lista>
      </Secao>

      <Secao id="resumo" titulo="5. Resumo executivo (topo do sheet)">
        <p>
          O conteúdo varia por seção. O tooltip explicativo aparece ao <b>passar o mouse no card inteiro</b> de cada indicador
          (sem ícone ⓘ).
        </p>
        <Sub>Produto: conta por SKU</Sub>
        <Tabela
          cabecalho={["Card", "O que é"]}
          linhas={[
            ["SKUs analisados", "quantos SKUs do catálogo foram comparados"],
            ["Atende", "SKUs que cumprem 100% das especificações"],
            ["Não atende", "SKUs que não cumprem tudo"],
          ]}
        />
        <p className="text-[12.5px] text-muted-foreground">
          Quando faltam valores dos SKUs, as especificações ficam pendentes. SKUs sem divergências e com pendências aparecem no
          indicador "Análise pendente", exibido quando necessário. Eles não contam como atendidos nem como não atendidos. O
          percentual considera todas as exigências, inclusive pendentes, e não chega a 100% enquanto faltar informação. Os
          indicadores atualizam ao editar ou remover uma especificação.
        </p>
        <Sub>Software: conta por requisito</Sub>
        <p>
          7 cards: <b>Percentual de aderência</b> · Total de requisitos · Atende · Atende parcialmente · Atende com parceiro ·
          Não atende · Falta analisar. O Percentual de aderência é sempre exibido.
        </p>
        <Caixa titulo="Em aberto">
          O resumo executivo <b>geral</b> (agregando todos os itens, no topo da lista) foi <b>removido por ora</b>, aguardando
          feedback. A regra de atende/não atende por item (e um possível estado "Em atenção") ainda não foi definida.
        </Caixa>
      </Secao>

      <Secao id="cards-colap" titulo="6. Cards colapsáveis (abaixo do resumo)">
        <p>Aparecem em itens com produto. Todos colapsam pelo cabeçalho (setinha).</p>
        <Lista>
          <li>
            <b>Descrição completa</b>: texto longo. No hover do card aparece o icon group: <b>Copiar a descrição</b> e{" "}
            <b>Ver no edital</b> (setinha), nessa ordem.
          </li>
          <li>
            Os antigos cards de especificações foram removidos. As não exigidas ficam disponíveis no seletor do rodapé da tabela.
            As exigidas sem valores dos SKUs entram automaticamente como linhas da tabela.
          </li>
        </Lista>
      </Secao>

      <Secao id="produto" titulo="7. Seção Produto (matriz de SKUs)">
        <Sub>Cabeçalho da seção</Sub>
        <p>
          Categoria (dropdown, define o catálogo comparado) · resumo "Produto recomendado" · badge <Atende />/<NaoAtende /> ·
          botão <b>Editar informações</b>.
        </p>
        <Sub>Colunas</Sub>
        <p>Especificações do edital · Valor requerido · uma coluna por SKU.</p>
        <Sub>Coluna do SKU</Sub>
        <Lista>
          <li>
            <b>Ícone da fonte à esquerda</b> do nome/marca. Livro = catálogo, globo = internet; azul quando tem link, cinza
            quando não. Tooltip: "Fonte: Catálogo, clique para abrir" / "Fonte: Internet (catálogo externo), clique para abrir".
          </li>
          <li>
            <b>Percentual e fração (x/x)</b> com o mesmo peso de fonte.
          </li>
          <li>
            <b>Barra de progresso</b>: cinza no 0% (trilho), <b>amarelo de 1% a 99%</b>, <b>verde no 100%</b>.
          </li>
          <li>
            Preço, estoque (quando houver) e botão <b>Selecionar</b>.
          </li>
        </Lista>
        <Caixa titulo="Alinhamento de altura (preço / estoque)">
          Quando um SKU não tem preço (ou estoque) mas <b>algum outro tem</b>, reserva-se um espaço em branco para as colunas
          manterem a mesma altura. Quando <b>nenhum</b> SKU tem a informação, a linha colapsa.
        </Caixa>
        <Sub>SKU selecionado</Sub>
        <p>
          A coluna inteira (cabeçalho + células) fica em <b>teal <Codigo>#D4EEF0</Codigo></b> com borda teal. O botão vira "✓
          Selecionado".
        </p>
      </Secao>

      <Secao id="software" titulo="8. Seção Software (checklist)">
        <Sub>Cabeçalho da seção</Sub>
        <p>
          Categoria (dropdown) · botões <b>Revisar requisitos</b> e <b>Concluir análise</b> (os dois em teal, mesmo estilo).
          Não repete a aderência no cabeçalho.
        </p>
        <Sub>Colunas</Sub>
        <p>
          Requisito · Status · Confiança IA · Justificativa IA · Módulo · Responsável · Notas. Há alternância entre{" "}
          <b>Visão em requisito</b> e <b>Visão em bloco</b> (por módulo).
        </p>
        <Sub>Status por requisito</Sub>
        <p className="flex flex-wrap items-center gap-1.5">
          <Atende /> · <Badge variant="warning">Atende parcialmente</Badge> · <Badge variant="warning">Atende com parceiro</Badge> ·{" "}
          <NaoAtende /> · <Neutro>Não avaliado</Neutro>
        </p>
        <Caixa titulo="Análise não finalizada">
          Enquanto houver requisitos "Não avaliado", no lugar da aderência mostramos o <b>progresso</b> ("X% dos requisitos
          analisados"). A aderência só aparece quando a análise fecha.
        </Caixa>
      </Secao>

      <Secao id="editar" titulo='9. Sheet "Editar informações"'>
        <p>
          Abre pela seção de produto. Mostra a Descrição completa e os campos da coluna Valor requerido. Salvar aplica as
          alterações e atualiza a comparação e o resumo; Cancelar descarta as alterações. A adição de especificações acontece no
          rodapé da tabela.
        </p>
        <Lista>
          <li>
            <b>Descrição completa</b> (com o icon group).
          </li>
        </Lista>
        <Sub>Edição inline do "Valor requerido" (na matriz)</Sub>
        <p>
          Editar direto na célula um valor <b>extraído do edital</b>: na 1ª vez mostra o modal <b>"Confirmar edição?"</b>{" "}
          (editar perde o vínculo com o trecho do edital); depois não pergunta mais. Tooltip do check/cancelar: "Confirmar e
          recalcular" / "Cancelar edição".
        </p>
      </Secao>

      <Secao id="diferencial" titulo="10. Especificações na tabela">
        <p>
          O botão <b>Adicionar especificação</b> no rodapé abre um dropdown com as especificações do catálogo não exigidas pelo
          edital. Selecionar uma opção adiciona a linha no final da tabela, com os valores dos SKUs e o Valor requerido vazio e
          ativo. A opção sai do menu. Excluir pela coluna Ações devolve a opção ao menu. Quando todas forem adicionadas, o botão
          fica desabilitado.
        </p>
        <p>
          Preencher o Valor requerido faz a linha entrar na comparação, tanto pela célula quanto pelo sheet. Apagar esse valor de
          uma especificação adicionada devolve a linha ao estado não exigido, fora do cálculo.
        </p>
        <p>
          As especificações exigidas sem valores dos SKUs aparecem automaticamente no final da tabela, com o valor extraído do
          edital. Nas células dos SKUs, mostramos <b>Valor não informado</b> e circle-alert. Tooltip: "O valor exigido foi
          extraído do edital, mas não temos o valor desta especificação para este SKU. Sem essa informação, não é possível
          verificar se o produto atende." Essas linhas não têm ação de excluir. Editar o valor requerido não preenche a
          informação ausente do SKU.
        </p>
        <Lista>
          <li>
            <b>Diferencial não conta no atende</b> (não entra na aderência).
          </li>
          <li>
            A célula abre <b>em branco</b> (sem placeholder). A linha fica <b>branca</b> como as demais.
          </li>
          <li>
            <b>Não</b> mostra o modal "Confirmar edição?" (não é edição de dado extraído). Tooltip do check/cancelar: "Confirmar
            o valor" / "Cancelar".
          </li>
          <li>Não existe badge "Diferencial" na linha.</li>
        </Lista>
        <Caixa tipo="atencao" titulo="Sem valor informado">
          As células de cada SKU dessa linha mostram um <b>circle-alert</b> com tooltip (não há comparação, pois o edital não
          exige). O chip do valor fica como <b>"Não informado"</b>.
        </Caixa>
      </Secao>

      <Secao id="concorrencia" titulo="11. Item em reprocessamento (edição concorrente)">
        <p>
          Trocar a categoria de um produto dispara um <b>reprocessamento</b> da análise (pode levar 1 min ou mais). Enquanto
          isso, o item não pode ser editado por ninguém, senão o resultado ficaria inconsistente. O tratamento é um{" "}
          <b>soft lock com alerta</b>:
        </p>
        <Lista>
          <li>
            <b>Quem dispara</b> o reprocessamento vê o <b>skeleton</b> de carregamento (com a mensagem de que pode sair da tela
            e será avisado ao terminar).
          </li>
          <li>
            <b>Quem chega depois</b> (outro usuário) abre o item <b>normalmente, em modo leitura</b>. Não há banner nem
            indicador fixo (não escala com muitos itens).
          </li>
          <li>
            Ao tentar <b>qualquer ação que edita</b>, aparece um <b>alerta</b> nomeando quem está reprocessando: "Item em
            reprocessamento: <i>[Nome]</i> está reprocessando os requisitos deste item. Você poderá editar quando a análise
            terminar."
          </li>
          <li>
            A <b>leitura continua livre</b>: navegar, copiar valores, ver a origem no edital.
          </li>
        </Lista>
        <Tabela
          cabecalho={["Bloqueado (mostra o alerta)", "Liberado (leitura)"]}
          linhas={[
            [
              "Editar informações, editar valor na célula, botão +, Concluir análise, selecionar SKU, trocar categoria, mudar status",
              "Navegar entre itens, copiar valor, ver origem no edital, colapsar/expandir cards",
            ],
          ]}
        />
        <Caixa titulo="Padrão reutilizável">
          O mesmo comportamento serve para qualquer recurso da plataforma quando <b>outra pessoa está editando</b>: alerta na
          ação, sem travar a leitura. Diferente do Notion, que resolve por edição em tempo real (merge + presença); aqui é o
          modelo mais simples de soft lock.
        </Caixa>
        <Caixa tipo="atencao" titulo="Depende de backend">
          Para valer de verdade, precisa de <b>estado compartilhado</b> (quem está reprocessando/editando cada item) e,
          idealmente, <b>presença</b>. No protótipo é simulado por <Codigo>?trava=N</Codigo>; o nome de quem reprocessa viria do
          backend na versão real.
        </Caixa>
      </Secao>

      <Secao id="vazia" titulo="12. Item não processado (análise vazia)">
        <p>
          Quando a extração automática volta <b>sem nenhuma especificação</b> para um item, ele <b>NÃO pode ser marcado como
          "atende"</b> (o padrão errado, hoje em produção, é dizer "atende" por ausência de falhas). Decisão da reunião
          Alice/Brunno (24/08): sinalizar que <b>não houve processamento</b> e oferecer a <b>extração manual</b> como resolução.
        </p>
        <Lista>
          <li>
            <b>Card</b>: badge neutra <b>"Não processado"</b> (não Atende, não Aderência).
          </li>
          <li>
            <b>Sheet</b>: estado explicando a situação, com o botão <b>"Extrair do edital"</b>.
          </li>
          <li>
            <b>Ação = extração manual</b>: o botão abre o <b>Visualizador do arquivo</b> (o edital), onde a pessoa seleciona as
            especificações e extrai (mesmo padrão da "Descrição completa"). No cenário feliz, a extração <b>popula a análise</b>.
          </li>
          <li>
            <b>Escopo</b>: por enquanto <b>só produto</b> (decisão da reunião).
          </li>
        </Lista>
        <p className="text-[12.5px] text-muted-foreground">
          Parkado (reunião): extração <b>parcial</b> (ex.: extraiu 1 de 10 requisitos) não é tratada por agora. Foco no caso
          "zerado".
        </p>
      </Secao>
    </main>
  )
}
