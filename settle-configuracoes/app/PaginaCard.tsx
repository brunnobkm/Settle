// Campos do card de Recomendadas: mostrar/ocultar e ordenar dentro de quatro grupos,
// com variáveis da organização entre as propriedades e pré-visualização ao lado.

import { Fragment, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { toast } from "sonner"
import {
  ArrowDownIcon,
  BookmarkIcon,
  CheckIcon,
  ExternalLinkIcon,
  FolderIcon,
  GaugeIcon,
  GlobeIcon,
  Link2Icon,
  PlusIcon,
  Share2Icon,
  Trash2Icon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  LicitacaoCardAvatars,
  LicitacaoCardContent,
  LicitacaoCardDescription,
  LicitacaoCardField,
  LicitacaoCardHeader,
  LicitacaoCardIconAction,
  LicitacaoCardIconActions,
  LicitacaoCardItems,
  LicitacaoCardRoot,
  LicitacaoCardSegment,
  LicitacaoCardSegments,
  LicitacaoCardStatusButton,
  LicitacaoCardTitle,
  LicitacaoCardValue,
  type LicitacaoCardMetaField,
} from "@/components/ui/licitacao-card"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import {
  SettingsBox,
  SettingsPage,
  SettingsPreview,
  SettingsPreviewHeader,
  SettingsSplit,
} from "@/components/ui/settings-page"
import {
  SettingsList,
  SettingsListItem,
  SettingsListGroupLabel,
  SettingsListItemActions,
  SettingsListLockBadge,
  SettingsListName,
} from "@/components/ui/settings-list"

import { Aviso, BotaoIcone, ListaDeVariaveis, SeloDeOrigem } from "./comum"
import {
  BLOCO_DE_ITENS,
  CAMPOS,
  CLASSE_CHIP_SEGMENTO,
  corDoSegmento,
  fmt,
  LIC_EXEMPLO,
  LICS,
  OPCOES_MAX_ITENS,
  mover,
  valorDaLic,
  type Campo,
  type FormatoCampo,
} from "./dados"
import { useConfig } from "./estado"

export function PaginaCard() {
  const { campos, setCampos, maxItens, setMaxItens, auditar, confirmar } = useConfig()
  const [menuAberto, setMenuAberto] = useState(false)

  /**
   * Arrastar é o que muda a seção: o campo assume o formato de quem estava no lugar onde ele
   * foi solto. As peças do topo e a tabela de itens só mudam de ordem, nunca de seção.
   */
  function soltar(deId: string, paraId: string) {
    const campo = campos.find((c) => c.id === deId)
    if (!campo) return
    const alvo = campos.find((c) => c.id === paraId)
    const destino: FormatoCampo = alvo ? alvo.f : paraId === "vazio-data" ? "data" : "propriedade"
    if (campo.fixo && destino !== campo.f) {
      toast(
        campo.f === "tabela"
          ? "A tabela de itens fica sempre no fim do card"
          : "As peças do topo não entram nas seções: elas ficam na primeira linha do card"
      )
      return
    }
    setCampos((l) => {
      const nova = alvo ? mover(l, deId, paraId) : l
      return nova.map((x) => (x.id === deId ? { ...x, f: destino, junto: destino === "destaque" ? x.junto : false } : x))
    })
    auditar(
      "Campos do card",
      destino === campo.f
        ? "Reordenou os campos"
        : `"${campo.nome}" foi para ${NOME_DO_FORMATO[destino]}`
    )
  }

  function alternar(c: Campo, on: boolean) {
    setCampos((l) => l.map((x) => (x.id === c.id ? { ...x, on } : x)))
    auditar("Campos do card", `${on ? "Mostrou" : "Ocultou"} "${c.nome}"`)
  }

  function tirar(c: Campo) {
    setCampos((l) => l.filter((x) => x.id !== c.id))
    auditar("Campos do card", `Tirou a variável "${c.nome}" do card`)
  }

  function restaurarPadrao() {
    confirmar({
      titulo: "Restaurar os campos padrão?",
      corpo: (
        <p>
          O card volta a mostrar os campos da Settle na ordem original. Variáveis adicionadas saem do card, mas continuam
          existindo em Variáveis.
        </p>
      ),
      acao: "Restaurar",
      ok: () => {
        setCampos(CAMPOS)
        auditar("Campos do card", "Restaurou o padrão da Settle")
        toast("Campos restaurados")
      },
    })
  }

  const item = (c: Campo) => {
    const itens = c.f === "tabela"
    return (
      <SettingsListItem key={c.id} id={c.id} name={c.nome}>
        {c.sempre ? (
          <span aria-hidden className="flex w-8 flex-none justify-center">
            <CheckIcon className="size-4 text-muted-foreground" />
          </span>
        ) : (
          <Switch
            checked={c.on}
            aria-label={`Mostrar ${c.nome}`}
            onCheckedChange={(v) => alternar(c, v)}
            data-settings-list-no-drag
          />
        )}
        <SettingsListName className={cn(!c.on && "text-muted-foreground", itens && "whitespace-normal")}>{c.nome}</SettingsListName>
        {c.sempre && (
          <SettingsListLockBadge tooltip="É por ela que a pessoa marca o card para as ações em lote. Dá para mudar a posição, não dá para esconder.">
            Sempre visível
          </SettingsListLockBadge>
        )}
        {itens && (
          <label className="flex flex-none items-center gap-2 text-[13px] text-muted-foreground">
            Mostrar até
            <NativeSelect
              size="sm"
              value={maxItens}
              className="text-foreground"
              onChange={(e) => {
                const n = Number(e.target.value)
                setMaxItens(n)
                auditar("Campos do card", `Passou a mostrar ${n ? `até ${n}` : "todos os"} itens no card`)
              }}
            >
              {OPCOES_MAX_ITENS.map((n) => (
                <NativeSelectOption key={n} value={n}>
                  {n ? `${n} itens` : "Todos os itens"}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>
        )}
        {c.var && c.origem && (
          <>
            <SeloDeOrigem origem={c.origem} />
            <SettingsListItemActions>
              <BotaoIcone rotulo={`Abrir a variável ${c.nome}`} dica="Abrir a variável para consultar ou editar" asChild>
                <a href="#variaveis">
                  <ExternalLinkIcon />
                </a>
              </BotaoIcone>
              <BotaoIcone rotulo={`Tirar ${c.nome} do card`} perigo onClick={() => tirar(c)}>
                <Trash2Icon />
              </BotaoIcone>
            </SettingsListItemActions>
          </>
        )}
      </SettingsListItem>
    )
  }

  /**
   * Arrastar dentro do card: a matriz de linhas é a verdade, e os campos voltam para a lista
   * na mesma ordem. "Mesma linha" deixou de ser um interruptor e virou o lugar onde se solta.
   */
  function reorganizarDestaques(linhas: Campo[][]) {
    const ordem = linhas.flatMap((linha) => linha.map((c, i) => ({ ...c, junto: i > 0 })))
    setCampos((l) => {
      const ocultos = l.filter((c) => c.f === "destaque" && !c.on)
      const resto = l.filter((c) => c.f !== "destaque")
      const iPrimeiro = l.findIndex((c) => c.f === "destaque")
      const antes = resto.filter((c) => l.indexOf(c) < iPrimeiro)
      const depois = resto.filter((c) => l.indexOf(c) > iPrimeiro)
      return [...antes, ...ordem, ...ocultos, ...depois]
    })
    auditar("Campos do card", "Reorganizou os campos do corpo do card")
  }

  return (
    <SettingsPage width="full">
      <Aviso tom="marca" fechavel>
        Aqui você escolhe o que aparece no card de Recomendadas e em que ordem. Vale para todas as pessoas da
        organização. Os campos escondidos continuam disponíveis em Filtrar e Ordenar.
      </Aviso>
      <SettingsSplit>
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Popover open={menuAberto} onOpenChange={setMenuAberto}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <PlusIcon />
                  Adicionar variável
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80 p-0">
                <ListaDeVariaveis
                  excluir={[...campos.map((c) => c.id), "edital", "score"]}
                  onEscolher={(v) => {
                    setMenuAberto(false)
                    setCampos((l) => [...l, { id: v.k, nome: v.n, f: "propriedade", on: true, var: true, origem: v.o }])
                    auditar("Campos do card", `Adicionou a variável "${v.n}" ao card`)
                    toast(`${v.n} entrou no card, como propriedade`)
                  }}
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="sm" className="ml-auto" onClick={restaurarPadrao}>
              Restaurar padrão da Settle
            </Button>
          </div>
          <SettingsBox>
            <SettingsList
              labels={{ moveHandle: (n) => `Mover o campo ${n ?? ""}. Use as setas para cima e para baixo.` }}
              onMove={soltar}
            >
              {campos.filter((c) => c.f === "topo" || c.f === "destaque").map(item)}
              {SECOES.map(([f, nome, descricao]) => {
                const doGrupo = campos.filter((c) => c.f === f)
                return [
                  <SettingsListGroupLabel key={`s-${f}`} description={descricao}>
                    {nome}
                  </SettingsListGroupLabel>,
                  ...(doGrupo.length ? doGrupo.map(item) : [<SecaoVazia key={`v-${f}`} formato={f} />]),
                ]
              })}
              {campos.filter((c) => c.f === "tabela").map(item)}
            </SettingsList>
          </SettingsBox>
        </div>

        <SettingsPreview aria-live="polite">
          <SettingsPreviewHeader label="Pré-visualização" />
          <PreviaDoCard aoReorganizar={reorganizarDestaques} />
        </SettingsPreview>
      </SettingsSplit>
    </SettingsPage>
  )
}

/** O card de Recomendadas montado com a configuração atual, no layout do card real. */
function PreviaDoCard({ aoReorganizar }: { aoReorganizar: (linhas: Campo[][]) => void }) {
  const { campos, maxItens } = useConfig()
  const L = LICS[LIC_EXEMPLO]
  const [carregados, setCarregados] = useState(BLOCO_DE_ITENS)

  // trocar a opção recomeça a contagem, senão "Todos" já abriria com o que ficou de antes
  useEffect(() => setCarregados(BLOCO_DE_ITENS), [maxItens])

  const valor = (c: Campo) => {
    if (c.var) return valorDaLic(L, c.id) || "Não encontrado"
    const fixos: Record<string, string> = { substatus: "Selecionar Substatus", descricao: "Adicionar Descrição" }
    return fixos[c.id] ?? (valorDaLic(L, c.id) || "-")
  }
  const campo = (c: Campo): LicitacaoCardMetaField => {
    const capag = c.id === "capagE" || c.id === "capagM"
    const v = valor(c)
    return {
      label: c.nome,
      value: capag && v !== "-" ? <SeloCapag nota={v} /> : v,
      tone: c.id === "envio" ? "warning" : "default",
    }
  }

  const doFormato = (f: FormatoCampo) => campos.filter((c) => c.f === f && c.on)
  const topo = doFormato("topo")
  const destaque = doFormato("destaque")
  const datas = doFormato("data")
  const meta = doFormato("propriedade")
  const mostrarItens = campos.some((c) => c.id === "itens" && c.on)
  // ME/EPP só vira tag do órgão quando os dois estão no destaque, um perto do outro
  const orgaoNoDestaque = campos.find((c) => c.id === "orgao")
  const meNoDestaque = campos.find((c) => c.id === "me")
  const temME =
    !!L.me &&
    meNoDestaque?.on === true &&
    meNoDestaque.f === "destaque" &&
    orgaoNoDestaque?.on === true &&
    orgaoNoDestaque.f === "destaque"
  // "Todos os itens" não desenha tudo de uma vez: a tabela rola e carrega em blocos
  const todos = maxItens === 0
  const itensVisiveis = L.itens.slice(0, todos ? carregados : maxItens)
  const resto = L.itens.length - itensVisiveis.length
  const nota = Number(L.score.split("/")[0])

  // O título fica à esquerda e empurra o resto para a direita (mr-auto); as peças seguintes
  // aparecem na ordem da lista. Tudo aqui é ilustrativo: a pré-visualização não executa ações.
  const blocoTopo = (c: Campo, empurra = false) => {
    switch (c.id) {
      case "selecao":
        return (
          <span
            aria-hidden
            className={cn("size-4.5 flex-none rounded-[5px] border border-input", empurra && "mr-auto")}
          />
        )
      case "edital":
        return (
          <LicitacaoCardTitle key={c.id} prefix="Edital" className="mr-auto">
            <b>{L.edital}</b>
          </LicitacaoCardTitle>
        )
      case "descartar":
        return (
          <Button key={c.id} variant="outline" size="sm" asChild>
            <span>Descartar</span>
          </Button>
        )
      case "analise":
        return (
          <Button key={c.id} size="sm" asChild>
            <span>Enviar para análise</span>
          </Button>
        )
      case "responsaveis":
        return (
          <LicitacaoCardAvatars
            key={c.id}
            avatars={[
              { initials: "MB", name: "Mateus Brum" },
              { initials: "AC", name: "Ana Camargo" },
              { initials: "RS", name: "Rafael Souza" },
            ]}
            onAdd={() => {}}
          />
        )
      case "acoes":
        return (
          <LicitacaoCardIconActions key={c.id}>
            {[
              { label: "Abrir no portal", icon: <GlobeIcon /> },
              { label: "Salvar", icon: <BookmarkIcon /> },
              { label: "Copiar link", icon: <Link2Icon /> },
              { label: "Compartilhar", icon: <Share2Icon /> },
              { label: "Arquivos", icon: <FolderIcon /> },
            ].map((a) => (
              <LicitacaoCardIconAction key={a.label} {...a} />
            ))}
          </LicitacaoCardIconActions>
        )
      case "score":
        return (
          <LicitacaoCardStatusButton
            key={c.id}
            size="sm"
            tone={nota >= 70 ? "success" : nota >= 40 ? "warning" : "destructive"}
            asChild
          >
            <span>
              <GaugeIcon aria-hidden className="size-3.5" />
              {L.score}
            </span>
          </LicitacaoCardStatusButton>
        )
      default:
        return null
    }
  }

  const blocoDestaque = (c: Campo) => {
    switch (c.id) {
      case "segmento":
        return (
          <LicitacaoCardSegments
            key={c.id}
            segments={L.segs.map((nome) => ({ label: nome, className: classeDeSegmento(nome) }))}
          />
        )
      // ME/EPP é uma tag ao lado do órgão; sozinho, vira um selo na própria linha
      case "me":
        return L.me && !temME ? (
          <div key={c.id}>
            <SeloME />
          </div>
        ) : null
      case "orgao":
        return (
          <LicitacaoCardDescription key={c.id}>
            <LicitacaoCardField label={c.nome} tag={temME ? <SeloME /> : undefined}>
              {valorDaLic(L, c.id)}
            </LicitacaoCardField>
          </LicitacaoCardDescription>
        )
      case "valor":
        return (
          <LicitacaoCardValue key={c.id} label={c.nome}>
            {L.valor}
          </LicitacaoCardValue>
        )
      default:
        return (
          <LicitacaoCardDescription key={c.id}>
            <LicitacaoCardField label={c.nome}>{valorDaLic(L, c.id)}</LicitacaoCardField>
          </LicitacaoCardDescription>
        )
    }
  }

  return (
    <LicitacaoCardRoot>
      <LicitacaoCardHeader>
        {topo.map((c, i) => (
          // sem o número do edital, quem empurra o resto para a direita é a primeira peça
          <Fragment key={c.id}>{blocoTopo(c, i === 0 && !topo.some((x) => x.id === "edital"))}</Fragment>
        ))}
      </LicitacaoCardHeader>
      <LicitacaoCardContent>
        <CorpoArrastavel linhas={emLinhas(destaque)} render={blocoDestaque} aoSoltar={aoReorganizar} />
        {(datas.length > 0 || meta.length > 0) && (
          <GradeDePropriedades
            // no card real as datas vêm em pares: Adicionada e Atualizada, depois Envio da proposta
            datas={meta.length ? emPares(datas.map(campo)) : []}
            campos={(meta.length ? meta : datas).map(campo)}
          />
        )}
        {mostrarItens && (
          <>
            <div
              onScroll={(e) => {
                const el = e.currentTarget
                if (!todos || resto <= 0) return
                if (el.scrollHeight - el.scrollTop - el.clientHeight < 80) {
                  setCarregados((n) => n + BLOCO_DE_ITENS)
                }
              }}
              className={cn(todos && "max-h-90 overflow-y-auto [scrollbar-width:thin]")}
            >
            <LicitacaoCardItems
              variant="boxed"
              title="Itens com Correspondência"
              count={L.itens.length}
              summary={`Total de itens: ${L.totalItens}`}
              columns={[
                { key: "lote", label: "Lote", width: 56 },
                { key: "nome", label: "Nome", className: "whitespace-normal" },
                { key: "seg", label: "Segmento", width: 112 },
                { key: "unid", label: "Unidades", width: 88 },
                { key: "unit", label: "Valor Unitário", align: "right", width: 128 },
                { key: "total", label: "Valor Total", align: "right", width: 128 },
              ]}
              rows={itensVisiveis.map((it) => ({
                lote: it.lote,
                nome: it.nome,
                seg: (
                  <LicitacaoCardSegment size="sm" className={classeDeSegmento(it.seg)}>
                    {it.seg}
                  </LicitacaoCardSegment>
                ),
                unid: it.unid,
                unit: it.unit,
                total: it.total,
              }))}
            />
            </div>
            {resto > 0 && !todos && (
              <span className="text-[13px] font-medium text-muted-foreground">
                Ver mais {resto} {resto === 1 ? "item" : "itens"}
              </span>
            )}
            {todos && (
              <span className="text-[13px] text-muted-foreground">
                {resto > 0
                  ? `Mostrando ${fmt(itensVisiveis.length)} de ${fmt(L.itens.length)}. Role a tabela para carregar mais.`
                  : `${fmt(L.itens.length)} itens com correspondência`}
              </span>
            )}
          </>
        )}
      </LicitacaoCardContent>
    </LicitacaoCardRoot>
  )
}

/**
 * Caixa de datas + grade de propriedades, com a regra de rolagem do card real
 * (settle-card-licitacao): a partir de 768px a grade tem a altura da caixa de datas ao lado e
 * rola por dentro; "Ver mais" só aparece quando sobra conteúdo. Abaixo disso as duas empilham
 * e nada rola.
 *
 * Diferença de propósito: no card real o "Ver mais" some de vez depois da primeira rolagem,
 * porque já cumpriu o papel de avisar. Aqui ele volta sempre que a grade está no topo, senão
 * quem está vendo a demonstração perde o efeito e não consegue mostrar de novo.
 */
function GradeDePropriedades({
  datas,
  campos,
}: {
  datas: LicitacaoCardMetaField[][]
  campos: LicitacaoCardMetaField[]
}) {
  const caixaDatas = useRef<HTMLDivElement>(null)
  const rolagem = useRef<HTMLDivElement>(null)
  const [alturaMax, setAlturaMax] = useState<number | null>(null)
  const [sobra, setSobra] = useState(false)
  const [noTopo, setNoTopo] = useState(true)

  useLayoutEffect(() => {
    const datasEl = caixaDatas.current
    const rolagemEl = rolagem.current
    if (!datasEl || !rolagemEl) return
    const ajustar = () => {
      // altura útil = caixa de datas menos o padding vertical da caixa da grade
      if (window.innerWidth >= 768) setAlturaMax(Math.max(72, datasEl.clientHeight - 24))
      else setAlturaMax(null)
      requestAnimationFrame(() => {
        setSobra(rolagemEl.scrollHeight - rolagemEl.clientHeight > 4 && window.innerWidth >= 768)
        setNoTopo(rolagemEl.scrollTop <= 4)
      })
    }
    ajustar()
    const observador = new ResizeObserver(ajustar)
    observador.observe(datasEl)
    observador.observe(rolagemEl)
    window.addEventListener("resize", ajustar)
    document.fonts?.ready.then(ajustar)
    return () => {
      observador.disconnect()
      window.removeEventListener("resize", ajustar)
    }
  }, [])

  const colunas = Math.max(1, ...datas.map((linha) => linha.length))

  return (
    <div className="grid w-full items-start gap-2 md:grid-cols-[auto_minmax(0,1fr)]">
      {datas.length > 0 && (
        <div ref={caixaDatas} className="rounded-xl border px-3.5 py-3">
          <dl
            aria-label="Datas"
            className="grid gap-x-8 gap-y-4"
            style={{ gridTemplateColumns: `repeat(${colunas}, max-content)` }}
          >
            {datas.map((linha) =>
              linha.map((campo, coluna) => (
                <ItemMeta key={campo.label} campo={campo} className={coluna === 0 ? "col-start-1" : undefined} />
              ))
            )}
          </dl>
        </div>
      )}
      <div className="@container relative min-w-0 rounded-xl border px-3.5 py-3">
        <div
          ref={rolagem}
          onScroll={(e) => setNoTopo(e.currentTarget.scrollTop <= 4)}
          style={alturaMax != null ? { maxHeight: alturaMax } : undefined}
          className={cn(alturaMax != null && "overflow-y-scroll [scrollbar-width:thin]")}
        >
          <dl
            aria-label="Informações do edital"
            className="grid grid-cols-1 gap-x-6 gap-y-4 @sm:grid-cols-2 @3xl:grid-cols-5"
          >
            {campos.map((c) => (
              <ItemMeta key={c.label} campo={c} />
            ))}
          </dl>
        </div>
        {sobra && noTopo && (
          <button
            type="button"
            onClick={() => rolagem.current?.scrollBy({ top: 56, behavior: "smooth" })}
            className="absolute right-2.25 bottom-0 left-0 flex items-center gap-1 rounded-b-xl bg-linear-to-t from-card from-55% to-transparent px-3.5 pt-5.5 pb-2.5 text-left text-[13px] font-medium text-primary outline-none hover:text-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Ver mais
            <ArrowDownIcon aria-hidden className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

/** Uma propriedade da grade: rótulo em cima, valor embaixo. */
function ItemMeta({ campo, className }: { campo: LicitacaoCardMetaField; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-0.75", className)}>
      <dt className="text-sm leading-5 font-semibold text-foreground">{campo.label}</dt>
      <dd
        data-tone={campo.tone ?? "default"}
        className="flex min-w-0 items-center gap-1 text-sm leading-5 text-muted-foreground data-[tone=warning]:font-medium data-[tone=warning]:text-warning-strong"
      >
        <span className="truncate">{campo.value}</span>
      </dd>
    </div>
  )
}

/**
 * Chip de segmento no tom claro da categoria, como no card real. A cor vem do nome, então o
 * mesmo segmento tem a mesma cor no topo e na coluna Segmento da tabela.
 */
function classeDeSegmento(nome: string) {
  return CLASSE_CHIP_SEGMENTO[corDoSegmento(nome)]
}

/** As duas caixas do card que recebem campos: as datas e a grade de propriedades. */
const SECOES: [FormatoCampo, string, string][] = [
  ["data", "Datas", "caixa da esquerda"],
  ["propriedade", "Propriedades", "grade ao lado das datas"],
]

const NOME_DO_FORMATO: Record<FormatoCampo, string> = {
  topo: "o topo",
  destaque: "o corpo do card",
  data: "Datas",
  propriedade: "Propriedades",
  tabela: "a tabela de itens",
}

/** Linha que segura a seção quando ela fica sem campo nenhum, para continuar dando para soltar. */
function SecaoVazia({ formato }: { formato: FormatoCampo }) {
  return (
    <SettingsListItem id={`vazio-${formato}`} name="">
      <span className="py-1 text-[13px] text-muted-foreground">Arraste um campo para cá</span>
    </SettingsListItem>
  )
}


/**
 * Corpo do card com os campos arrastáveis. Passar o mouse mostra que a peça pega; ao arrastar,
 * uma barra mostra onde o campo vai cair: em pé, entre duas peças, é a mesma linha; deitada,
 * entre duas linhas, é linha nova. O alvo sai da posição do ponteiro, não de zonas invisíveis.
 *
 * Usa eventos de ponteiro, não o arrastar nativo do HTML: o nativo não roda em toque, exige
 * imagem de arraste e não deixa desenhar a barra com precisão.
 */
function CorpoArrastavel({
  linhas,
  render,
  aoSoltar,
}: {
  linhas: Campo[][]
  render: (c: Campo) => ReactNode
  aoSoltar: (linhas: Campo[][]) => void
}) {
  type Alvo = { l: number; p: number; novaLinha: boolean }
  const [arrastando, setArrastando] = useState<string | null>(null)
  const [alvo, setAlvo] = useState<Alvo | null>(null)
  const inicio = useRef<{ id: string; x: number; y: number } | null>(null)
  // o ponteiro pode levantar no mesmo quadro em que mexeu: quem decide é a ref, não o estado
  const arrastandoRef = useRef<string | null>(null)
  const alvoRef = useRef<Alvo | null>(null)
  const refLinhas = useRef<(HTMLDivElement | null)[]>([])
  const refCampos = useRef<Record<string, HTMLDivElement | null>>({})

  /** Para onde o campo iria se fosse solto agora, a partir de onde o ponteiro está. */
  const alvoEm = (x: number, y: number): Alvo | null => {
    const caixas = linhas.map((_, l) => refLinhas.current[l]?.getBoundingClientRect()).filter(Boolean) as DOMRect[]
    if (!caixas.length) return null
    let l = caixas.findIndex((r) => y >= r.top && y <= r.bottom)
    if (l < 0) l = y < caixas[0].top ? 0 : caixas.length - 1
    const r = caixas[l]
    // perto da borda de cima ou de baixo da linha: abre linha nova ali
    const margem = Math.min(12, Math.max(6, r.height * 0.3))
    if (y < r.top + margem) return { l, p: 0, novaLinha: true }
    if (y > r.bottom - margem) return { l: l + 1, p: 0, novaLinha: true }
    const campos = linhas[l]
    const p = campos.findIndex((c) => {
      const rc = refCampos.current[c.id]?.getBoundingClientRect()
      return rc && x < rc.left + rc.width / 2
    })
    return { l, p: p < 0 ? campos.length : p, novaLinha: false }
  }

  /**
   * Os alvos são contados na matriz como ela está na tela, mas a inserção acontece depois de
   * tirar o campo do lugar antigo. Quando isso esvazia uma linha acima do alvo, os índices
   * abaixo sobem um: é o que os dois ajustes aqui corrigem.
   */
  const soltarEm = (id: string, l: number, p: number, novaLinha: boolean) => {
    const lOrigem = linhas.findIndex((linha) => linha.some((c) => c.id === id))
    if (lOrigem < 0) return
    const pOrigem = linhas[lOrigem].findIndex((c) => c.id === id)
    const campo = linhas[lOrigem][pOrigem]
    const sumiu = linhas[lOrigem].length === 1
    const matriz = linhas.map((linha) => linha.filter((c) => c.id !== id)).filter((linha) => linha.length > 0)
    const li = sumiu && lOrigem < l ? l - 1 : l
    if (novaLinha) {
      matriz.splice(Math.max(0, Math.min(li, matriz.length)), 0, [campo])
    } else {
      const destino = matriz[Math.max(0, Math.min(li, matriz.length - 1))]
      if (!destino) return
      const pi = lOrigem === li && p > pOrigem ? p - 1 : p
      destino.splice(Math.max(0, Math.min(pi, destino.length)), 0, campo)
    }
    aoSoltar(matriz)
  }

  const limpar = () => {
    inicio.current = null
    arrastandoRef.current = null
    alvoRef.current = null
    setArrastando(null)
    setAlvo(null)
  }

  /**
   * O que o arrastar faz com o mouse, o teclado faz com Alt: as setas movem o campo, e com
   * Shift ele entra na linha de cima ou de baixo em vez de abrir uma linha nova.
   */
  const porTeclado = (e: React.KeyboardEvent, l: number, p: number) => {
    if (!e.altKey || !e.key.startsWith("Arrow")) return
    const id = linhas[l][p].id
    e.preventDefault()
    if (e.shiftKey) {
      if (e.key === "ArrowUp" && l > 0) soltarEm(id, l - 1, linhas[l - 1].length, false)
      else if (e.key === "ArrowDown" && l < linhas.length - 1) soltarEm(id, l + 1, 0, false)
      return
    }
    if (e.key === "ArrowLeft" && p > 0) soltarEm(id, l, p - 1, false)
    else if (e.key === "ArrowRight" && p < linhas[l].length - 1) soltarEm(id, l, p + 2, false)
    else if (e.key === "ArrowUp") soltarEm(id, Math.max(0, l - 1), 0, true)
    else if (e.key === "ArrowDown") soltarEm(id, l + 1, 0, true)
  }

  const barraDeLinha = (l: number) =>
    alvo?.novaLinha && alvo.l === l ? <div aria-hidden className="h-0.5 rounded-full bg-primary" /> : null

  const barraNaLinha = (l: number, p: number) =>
    alvo && !alvo.novaLinha && alvo.l === l && alvo.p === p ? (
      <div aria-hidden className="w-0.5 self-stretch rounded-full bg-primary" />
    ) : null

  return (
    <div className="flex flex-col gap-1.5">
      {barraDeLinha(0)}
      {linhas.map((linha, l) => (
        <Fragment key={linha.map((c) => c.id).join("-")}>
          <div
            ref={(el) => {
              refLinhas.current[l] = el
            }}
            className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-1.5"
          >
            {linha.map((c, p) => (
              <Fragment key={c.id}>
                {barraNaLinha(l, p)}
                <div
                  ref={(el) => {
                    refCampos.current[c.id] = el
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Mover ${c.nome} no card. Alt com as setas move; Alt e Shift junta na linha de cima ou de baixo.`}
                  onPointerDown={(e) => {
                    if (e.button !== 0) return
                    inicio.current = { id: c.id, x: e.clientX, y: e.clientY }
                    e.currentTarget.setPointerCapture(e.pointerId)
                  }}
                  onPointerMove={(e) => {
                    const i = inicio.current
                    if (!i) return
                    if (!arrastandoRef.current && Math.hypot(e.clientX - i.x, e.clientY - i.y) < 4) return
                    if (!arrastandoRef.current) {
                      arrastandoRef.current = i.id
                      setArrastando(i.id)
                    }
                    const novo = alvoEm(e.clientX, e.clientY)
                    alvoRef.current = novo
                    setAlvo(novo)
                  }}
                  onPointerUp={() => {
                    const id = arrastandoRef.current
                    const destino = alvoRef.current
                    if (id && destino) soltarEm(id, destino.l, destino.p, destino.novaLinha)
                    limpar()
                  }}
                  onPointerCancel={limpar}
                  onKeyDown={(e) => porTeclado(e, l, p)}
                  className={cn(
                    "min-w-0 touch-none rounded-md px-1.5 py-0.5 transition-colors select-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                    arrastando === c.id ? "cursor-grabbing bg-muted opacity-50" : "cursor-grab"
                  )}
                >
                  {render(c)}
                </div>
                {p === linha.length - 1 && barraNaLinha(l, p + 1)}
              </Fragment>
            ))}
          </div>
          {barraDeLinha(l + 1)}
        </Fragment>
      ))}
    </div>
  )
}

/** Agrupa os destaques em linhas: cada campo gruda no anterior quando foi solto ao lado dele. */
function emLinhas(campos: Campo[]) {
  const linhas: Campo[][] = []
  for (const c of campos) {
    if (c.junto && linhas.length) linhas[linhas.length - 1].push(c)
    else linhas.push([c])
  }
  return linhas
}

/** Quebra a lista em linhas de dois, para a grade lateral do card. */
function emPares(campos: LicitacaoCardMetaField[]) {
  const linhas: LicitacaoCardMetaField[][] = []
  for (let i = 0; i < campos.length; i += 2) linhas.push(campos.slice(i, i + 2))
  return linhas
}

/** Selo ME - EPP, do lado do órgão. */
function SeloME() {
  return (
    <Badge variant="secondary" className="rounded-md bg-muted px-2 font-medium text-muted-foreground">
      ME - EPP
    </Badge>
  )
}

/** Nota CAPAG: A e B passam, C e D acendem. */
function SeloCapag({ nota }: { nota: string }) {
  const bom = nota === "A" || nota === "B"
  return (
    <Badge
      className={cn(
        "size-5 justify-center rounded-md p-0 text-xs font-semibold",
        bom ? "bg-success/12 text-success-strong" : "bg-warning/15 text-warning-strong"
      )}
    >
      {nota}
    </Badge>
  )
}
