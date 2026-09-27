// Campos do card de Recomendadas: mostrar/ocultar e ordenar dentro de quatro grupos,
// com variáveis da organização na grade de metadados e pré-visualização ao lado.

import { useLayoutEffect, useRef, useState } from "react"
import { toast } from "sonner"
import {
  ArrowDownIcon,
  BookmarkIcon,
  ExternalLinkIcon,
  FolderIcon,
  GaugeIcon,
  GlobeIcon,
  Link2Icon,
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
  SettingsListAdd,
  SettingsListGroupLabel,
  SettingsListItem,
  SettingsListItemActions,
  SettingsListName,
} from "@/components/ui/settings-list"

import { Aviso, BotaoIcone, ListaDeVariaveis, SeloDeOrigem } from "./comum"
import { CAMPOS, GRUPOS_CAMPO, LIC_EXEMPLO, LICS, OPCOES_MAX_ITENS, mover, valorDaLic, type Campo } from "./dados"
import { useConfig } from "./estado"

export function PaginaCard() {
  const { campos, setCampos, maxItens, setMaxItens, auditar, confirmar } = useConfig()
  const [menuAberto, setMenuAberto] = useState(false)

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
    const itens = c.g === "itens"
    return (
      <SettingsListItem key={c.id} id={c.id} group={c.g} movable={!itens} name={c.nome}>
        <Switch
          checked={c.on}
          aria-label={`Mostrar ${c.nome}`}
          onCheckedChange={(v) => alternar(c, v)}
          data-settings-list-no-drag
        />
        <SettingsListName className={cn(!c.on && "text-muted-foreground", itens && "whitespace-normal")}>{c.nome}</SettingsListName>
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

  return (
    <SettingsPage width="full">
      <Aviso tom="marca" fechavel>
        Aqui você escolhe o que aparece no card de Recomendadas e em que ordem. Vale para todas as pessoas da
        organização. Os campos escondidos continuam disponíveis em Filtrar e Ordenar.
      </Aviso>
      <SettingsSplit>
        <div className="flex min-w-0 flex-col gap-2">
          <SettingsBox>
            <SettingsList
              labels={{ moveHandle: (n) => `Mover o campo ${n ?? ""}. Use as setas para cima e para baixo.` }}
              onMove={(de, para) => {
                setCampos((l) => mover(l, de, para))
                auditar("Campos do card", "Reordenou os campos")
              }}
            >
              {GRUPOS_CAMPO.map(([g, nome, descricao]) => [
                <SettingsListGroupLabel key={`g-${g}`} description={descricao || undefined}>
                  {nome}
                </SettingsListGroupLabel>,
                ...campos.filter((c) => c.g === g).map(item),
              ])}
              <Popover open={menuAberto} onOpenChange={setMenuAberto}>
                <PopoverTrigger asChild>
                  <SettingsListAdd>Adicionar variável aos metadados</SettingsListAdd>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-80 p-0">
                  <ListaDeVariaveis
                    excluir={[...campos.map((c) => c.id), "edital", "score"]}
                    onEscolher={(v) => {
                      setMenuAberto(false)
                      setCampos((l) => [...l, { id: v.k, nome: v.n, g: "meta", on: true, var: true, origem: v.o }])
                      auditar("Campos do card", `Adicionou a variável "${v.n}" ao card`)
                      toast(`${v.n} entrou no card, no fim dos metadados`)
                    }}
                  />
                </PopoverContent>
              </Popover>
            </SettingsList>
          </SettingsBox>
          <div>
            <Button variant="outline" onClick={restaurarPadrao}>
              Restaurar padrão da Settle
            </Button>
          </div>
        </div>

        <SettingsPreview aria-live="polite">
          <SettingsPreviewHeader label="Pré-visualização" />
          <PreviaDoCard />
        </SettingsPreview>
      </SettingsSplit>
    </SettingsPage>
  )
}

/** O card de Recomendadas montado com a configuração atual, no layout do card real. */
function PreviaDoCard() {
  const { campos, maxItens } = useConfig()
  const L = LICS[LIC_EXEMPLO]

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

  const topo = campos.filter((c) => c.g === "topo" && c.on)
  const destaque = campos.filter((c) => c.g === "destaque" && c.on)
  const datas = campos.filter((c) => c.g === "datas" && c.on)
  const meta = campos.filter((c) => c.g === "meta" && c.on)
  const mostrarItens = campos.some((c) => c.id === "itens" && c.on)
  const temME = campos.some((c) => c.id === "me" && c.on) && L.me
  const itensVisiveis = maxItens ? L.itens.slice(0, maxItens) : L.itens
  const resto = L.itens.length - itensVisiveis.length
  const nota = Number(L.score.split("/")[0])

  // O título fica à esquerda e empurra o resto para a direita (mr-auto); as peças seguintes
  // aparecem na ordem da lista. Tudo aqui é ilustrativo: a pré-visualização não executa ações.
  const blocoTopo = (c: Campo) => {
    switch (c.id) {
      case "edital":
        return (
          <div key={c.id} className="mr-auto flex min-w-0 items-center gap-2.5">
            <span aria-hidden className="size-4.5 flex-none rounded-[5px] border border-input" />
            <LicitacaoCardTitle prefix="Edital">
              <b>{L.edital}</b>
            </LicitacaoCardTitle>
          </div>
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
            segments={L.segs.map((nome, i) => ({
              label: nome,
              // o card real usa o tom claro da categoria, não o chip sólido
              className: i % 2 === 0 ? "bg-category-1/12 text-category-1" : "bg-category-4/12 text-category-4",
            }))}
          />
        )
      // ME/EPP é uma tag ao lado do órgão; sozinho, vira um selo na própria linha
      case "me":
        return L.me && !campos.some((x) => x.id === "orgao" && x.on) ? (
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
        {topo.map((c) => blocoTopo(c))}
      </LicitacaoCardHeader>
      <LicitacaoCardContent>
        {destaque.map(blocoDestaque)}
        {(datas.length > 0 || meta.length > 0) && (
          <GradeDePropriedades
            // no card real as datas vêm em pares: Adicionada e Atualizada, depois Envio da proposta
            datas={meta.length ? emPares(datas.map(campo)) : []}
            campos={(meta.length ? meta : datas).map(campo)}
          />
        )}
        {mostrarItens && (
          <>
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
                seg: <LicitacaoCardSegment size="sm">{it.seg}</LicitacaoCardSegment>,
                unid: it.unid,
                unit: it.unit,
                total: it.total,
              }))}
            />
            {resto > 0 && (
              <span className="text-[13px] font-medium text-muted-foreground">
                Ver mais {resto} {resto === 1 ? "item" : "itens"}
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
