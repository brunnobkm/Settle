// Campos do card de Recomendadas: mostrar/ocultar e ordenar dentro de quatro grupos,
// com variáveis da organização na grade de metadados e pré-visualização ao lado.

import { useState } from "react"
import { toast } from "sonner"
import {
  BookmarkIcon,
  ExternalLinkIcon,
  FolderIcon,
  GaugeIcon,
  GlobeIcon,
  Link2Icon,
  PencilIcon,
  RefreshCwIcon,
  Share2Icon,
  Trash2Icon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  LicitacaoCardActions,
  LicitacaoCardAvatars,
  LicitacaoCardContent,
  LicitacaoCardDescription,
  LicitacaoCardField,
  LicitacaoCardHeader,
  LicitacaoCardIconAction,
  LicitacaoCardIconActions,
  LicitacaoCardItems,
  LicitacaoCardMeta,
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
  SettingsListLockBadge,
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
              <SettingsListGroupLabel description="fixo">Topo</SettingsListGroupLabel>
              <SettingsListItem id="topo" group="topo" locked>
                <SettingsListName className="whitespace-normal">Número do edital, ações e Score</SettingsListName>
                <SettingsListLockBadge tooltip="O topo do card é igual para todos: não pode ser ocultado nem movido.">
                  Não editável
                </SettingsListLockBadge>
              </SettingsListItem>
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

  const destaque = campos.filter((c) => c.g === "destaque" && c.on)
  const datas = campos.filter((c) => c.g === "datas" && c.on)
  const meta = campos.filter((c) => c.g === "meta" && c.on)
  const mostrarItens = campos.some((c) => c.id === "itens" && c.on)
  const temME = campos.some((c) => c.id === "me" && c.on) && L.me
  const itensVisiveis = maxItens ? L.itens.slice(0, maxItens) : L.itens
  const resto = L.itens.length - itensVisiveis.length
  const nota = Number(L.score.split("/")[0])

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
        <span aria-hidden className="size-4.5 flex-none rounded-[5px] border border-input" />
        <LicitacaoCardTitle prefix="Edital">
          <b>{L.edital}</b>
        </LicitacaoCardTitle>
        <Badge className="flex-none gap-1 rounded-md bg-warning px-2 py-0.75 text-xs font-semibold text-warning-foreground">
          <RefreshCwIcon aria-hidden className="size-3" />
          Atualizado
        </Badge>
        {/* tudo daqui para a direita é ilustrativo: a pré-visualização não executa ações */}
        <LicitacaoCardActions>
          <Button variant="outline" size="sm" asChild>
            <span>Descartar</span>
          </Button>
          <Button size="sm" asChild>
            <span>Enviar para análise</span>
          </Button>
          <LicitacaoCardStatusButton size="sm" asChild>
            <span>
              <PencilIcon aria-hidden className="size-3.5" />
              Em disputa ou Homologação
            </span>
          </LicitacaoCardStatusButton>
          <LicitacaoCardAvatars
            avatars={[
              { initials: "MB", name: "Mateus Brum" },
              { initials: "AC", name: "Ana Camargo" },
              { initials: "RS", name: "Rafael Souza" },
            ]}
            onAdd={() => {}}
          />
          <LicitacaoCardIconActions>
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
          <LicitacaoCardStatusButton
            size="sm"
            tone={nota >= 70 ? "success" : nota >= 40 ? "warning" : "destructive"}
            asChild
          >
            <span>
              <GaugeIcon aria-hidden className="size-3.5" />
              {L.score}
            </span>
          </LicitacaoCardStatusButton>
        </LicitacaoCardActions>
      </LicitacaoCardHeader>
      <LicitacaoCardContent>
        {destaque.map(blocoDestaque)}
        {(datas.length > 0 || meta.length > 0) && (
          <div className="flex flex-col gap-1.5">
            <LicitacaoCardMeta
              variant="boxed"
              // no card real as datas vêm em pares: Adicionada e Atualizada, depois Envio da proposta
              aside={meta.length ? emPares(datas.map(campo)) : undefined}
              fields={(meta.length ? meta : datas).map(campo)}
            />
            <button
              type="button"
              className="self-start text-[13px] font-medium text-primary underline-offset-2 hover:underline"
            >
              Ver mais
            </button>
          </div>
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
