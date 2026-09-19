// Campos do card de Recomendadas: mostrar/ocultar e ordenar dentro de quatro grupos,
// com variáveis da organização na grade de metadados e pré-visualização ao lado.

import { useState } from "react"
import { toast } from "sonner"
import { ExternalLinkIcon, Trash2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  LicitacaoCardActions,
  LicitacaoCardContent,
  LicitacaoCardDescription,
  LicitacaoCardField,
  LicitacaoCardHeader,
  LicitacaoCardItems,
  LicitacaoCardMeta,
  LicitacaoCardRoot,
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
  SettingsPageDescription,
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

import { BotaoIcone, ListaDeVariaveis, SeloDeOrigem } from "./comum"
import { CAMPOS, GRUPOS_CAMPO, LICS, OPCOES_MAX_ITENS, mover, valorDaLic, type Campo } from "./dados"
import { useConfig } from "./estado"

export function SeletorDeExemplo({ id }: { id: string }) {
  const { lic, setLic } = useConfig()
  return (
    <NativeSelect
      id={id}
      size="sm"
      aria-label="Licitação de exemplo"
      value={lic}
      onChange={(e) => setLic(Number(e.target.value))}
      className="text-foreground"
    >
      {LICS.map((l, i) => (
        <NativeSelectOption key={l.edital} value={i}>
          Edital {l.edital}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  )
}

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
          existindo em Agentes.
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
                <a href="#" data-nao-prototipado>
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
    <SettingsPage width="wide">
      <SettingsPageDescription>
        O que aparece no card de Recomendadas e em que ordem. Vale para todas as pessoas da organização. Os campos
        escondidos continuam disponíveis em Filtrar e Ordenar.
      </SettingsPageDescription>
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
          <SettingsPreviewHeader label="Pré-visualização">
            <SeletorDeExemplo id="card-exemplo" />
          </SettingsPreviewHeader>
          <PreviaDoCard />
        </SettingsPreview>
      </SettingsSplit>
    </SettingsPage>
  )
}

/** O card de Recomendadas montado com a configuração atual. */
function PreviaDoCard() {
  const { campos, maxItens, lic } = useConfig()
  const L = LICS[lic]

  const valor = (c: Campo) => {
    if (c.var) return valorDaLic(L, c.id) || "Não encontrado"
    const fixos: Record<string, string> = { substatus: "Selecionar Substatus", descricao: "Adicionar Descrição" }
    return fixos[c.id] ?? (valorDaLic(L, c.id) || "-")
  }
  const campo = (c: Campo): LicitacaoCardMetaField => ({ label: c.nome, value: valor(c) })

  const destaque = campos.filter((c) => c.g === "destaque" && c.on)
  const datas = campos.filter((c) => c.g === "datas" && c.on)
  const meta = campos.filter((c) => c.g === "meta" && c.on)
  const mostrarItens = campos.some((c) => c.id === "itens" && c.on)
  const itensVisiveis = maxItens ? L.itens.slice(0, maxItens) : L.itens
  const resto = L.itens.length - itensVisiveis.length

  const blocoDestaque = (c: Campo) => {
    switch (c.id) {
      case "segmento":
        return <LicitacaoCardSegments key={c.id} segments={[L.seg]} />
      case "me":
        return L.me ? (
          <div key={c.id}>
            <Badge variant="secondary" className="rounded-md bg-muted px-2 font-medium text-muted-foreground">
              ME - EPP
            </Badge>
          </div>
        ) : null
      case "valor":
        return <LicitacaoCardValue key={c.id}>{L.valor}</LicitacaoCardValue>
      default:
        return (
          <LicitacaoCardDescription key={c.id}>
            <LicitacaoCardField label={c.nome}>{valorDaLic(L, c.id)}</LicitacaoCardField>
          </LicitacaoCardDescription>
        )
    }
  }

  return (
    <LicitacaoCardRoot className="py-3.5 [--card-spacing:--spacing(4)]">
      <LicitacaoCardHeader>
        <span aria-hidden className="size-4.5 flex-none rounded-[5px] border border-input" />
        <LicitacaoCardTitle prefix="Edital">
          <b>{L.edital}</b>
        </LicitacaoCardTitle>
        {/* botões ilustrativos: a pré-visualização não tem ações */}
        <LicitacaoCardActions>
          <Button variant="outline" size="sm" asChild>
            <span>Descartar</span>
          </Button>
          <Button size="sm" asChild>
            <span>Enviar para análise</span>
          </Button>
          <LicitacaoCardStatusButton size="sm" asChild>
            <span>{L.score}</span>
          </LicitacaoCardStatusButton>
        </LicitacaoCardActions>
      </LicitacaoCardHeader>
      <LicitacaoCardContent>
        {destaque.map(blocoDestaque)}
        {(datas.length > 0 || meta.length > 0) && (
          <LicitacaoCardMeta
            aside={meta.length ? datas.map((d) => [campo(d)]) : undefined}
            fields={(meta.length ? meta : datas).map(campo)}
            // a pré-visualização é estreita: grade de 3 colunas e coluna de datas mais fina
            className="[&>dl:last-child]:grid-cols-2 min-[640px]:[&>dl:last-child]:grid-cols-3! [&>dl:not(:last-child)]:w-37.5"
          />
        )}
        {mostrarItens && (
          <>
            <LicitacaoCardItems
              variant="boxed"
              title="Itens com Correspondência"
              count={L.itens.length}
              summary={`Mostrando ${itensVisiveis.length} de ${L.itens.length}`}
              columns={[
                { key: "nome", label: "Nome", className: "whitespace-normal" },
                { key: "segmento", label: "Segmento", width: 96 },
                { key: "valor", label: "Valor Total", align: "right", width: 112 },
              ]}
              rows={itensVisiveis.map(([nome, segmento, v]) => ({
                nome,
                segmento: (
                  <Badge variant="secondary" className="rounded-md bg-muted px-2 font-medium text-muted-foreground">
                    {segmento}
                  </Badge>
                ),
                valor: v,
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
