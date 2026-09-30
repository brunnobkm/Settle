// Card do Board (modo execução): espelha o card canônico
// (settle-licitacoes-em-andamento-card), sem a linha do título, com "Resultado"
// logo após o Edital nos cards de "Resultados Finais" e com Órgão, Objeto, Cidade e
// Valor editáveis. Regra mestra: clicar num valor edita; clicar no resto do card abre
// a licitação; arrastar o card muda a etapa.

import { useEffect, useState, type KeyboardEvent, type MouseEvent } from "react"
import { CircleAlertIcon, ClockIcon, LinkIcon, Trash2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  LicitacaoCardHoverActions,
  LicitacaoCardIconAction,
  LicitacaoCardRoot,
  LicitacaoCardSegments,
  LicitacaoCardStatusButton,
} from "@/components/ui/licitacao-card"
import {
  PropertyChip,
  PropertyEmpty,
  PropertyInlineEdit,
  PropertyList,
  PropertyRow,
  PropertyText,
  PropertyTrigger,
} from "@/components/ui/property-list"

import {
  avisoDePrazo,
  categoriaDoSegmento,
  formatarData,
  formatarMoeda,
  lerValor,
  pessoaPorId,
  resultadoPorId,
  statusPorId,
  urgenciaDaData,
  valorParaInput,
  type Licitacao,
} from "./dados"
import {
  CalendarioEnvio,
  CHIP_SEGMENTO,
  EditorCidade,
  ListaPessoas,
  ListaSegmentos,
  MenuDeClique,
  OpcoesResultado,
  OpcoesStatus,
  PopoverEditor,
} from "./editores"

const ehInterativo = (alvo: EventTarget | null) =>
  alvo instanceof Element && !!alvo.closest("button, a, input, textarea, select, [role=checkbox], [data-sem-abrir]")

export type PropsCard = {
  licitacao: Licitacao
  onChange: (patch: Partial<Licitacao>) => void
  segmentosDisponiveis: string[]
  onCriarSegmento: (nome: string) => void
  /** Clique fora dos valores: abre a licitação. */
  onAbrir: () => void
  onCopiarLink: () => void
  onDescartar: () => void
  /** Algum editor aberto neste card (o Board bloqueia o arraste). Passe uma função estável. */
  onEdicao?: (id: string, ativa: boolean) => void
  /** Card sendo arrastado: fica apagado e sem dicas. */
  arrastando?: boolean
  className?: string
}

export function CardKanban({
  licitacao: l,
  onChange,
  segmentosDisponiveis,
  onCriarSegmento,
  onAbrir,
  onCopiarLink,
  onDescartar,
  onEdicao,
  arrastando = false,
  className,
}: PropsCard) {
  const [editando, setEditando] = useState<string | null>(null)
  const abrir = (chave: string) => (open: boolean) => setEditando(open ? chave : null)
  const fechar = () => setEditando(null)

  const id = l.id
  useEffect(() => {
    onEdicao?.(id, editando !== null)
  }, [editando, onEdicao, id])
  // o card some da tela (ex.: descartado) com um editor aberto: libera o arraste
  useEffect(() => () => onEdicao?.(id, false), [onEdicao, id])

  const status = statusPorId(l.status)
  const resultado = resultadoPorId(l.resultado)
  const pessoas = l.responsaveis.map(pessoaPorId).filter((p) => !!p)
  const urgencia = urgenciaDaData(l.dataEnvio)
  const aviso = avisoDePrazo(urgencia)

  function aoClicar(e: MouseEvent<HTMLDivElement>) {
    // cliques dentro dos popovers (portal) sobem pela árvore do React: ignora
    if (!e.currentTarget.contains(e.target as Node)) return
    if (ehInterativo(e.target)) return
    onAbrir()
  }

  function aoTeclar(e: KeyboardEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onAbrir()
    }
  }

  const linha = (chave: string, rotulo: string) => ({
    label: rotulo,
    labelSide: "top" as const,
    showClippedText: true,
    hideLabel: arrastando,
    editing: editando === chave,
  })

  return (
    <LicitacaoCardRoot
      role="group"
      aria-roledescription="card"
      aria-label={`Licitação Edital ${l.codigoEdital}, status ${status?.rotulo ?? "não definido"}, envio da proposta ${
        l.dataEnvio ? formatarData(l.dataEnvio) : "sem data"
      }, valor ${formatarMoeda(l.valorGlobal)}`}
      tabIndex={0}
      onClick={aoClicar}
      onKeyDown={aoTeclar}
      className={cn(
        "relative w-full gap-0 overflow-visible rounded-xl p-2.5 shadow-none ring-border outline-none",
        "transition-[translate,scale,box-shadow,opacity] duration-150 ease-out hover:-translate-y-px hover:shadow-md hover:ring-foreground/15",
        "focus-visible:ring-3 focus-visible:ring-ring/50",
        arrastando && "scale-[.985] opacity-45 shadow-none hover:translate-y-0 hover:shadow-none",
        className
      )}
    >
      <PropertyList>
        {/* Edital: identifica o card; clicar abre a licitação */}
        <PropertyRow {...linha("codigoEdital", "Edital")} className="font-bold">
          Edital <span className="font-mono">{l.codigoEdital}</span>
        </PropertyRow>

        {/* Resultado: informação crítica em "Resultados Finais" (pedido Brunno 2026-05-29) */}
        {l.etapa === "resultados" && (
          <PropertyRow {...linha("resultado", "Resultado")}>
            <div className="flex min-h-5.5 items-center">
              <MenuDeClique
                open={editando === "resultado"}
                onOpenChange={abrir("resultado")}
                gatilho={
                  resultado ? (
                    <LicitacaoCardStatusButton
                      tone={resultado.tom}
                      size="xs"
                      aria-label={`Resultado: ${resultado.rotulo}. Alterar`}
                      className="h-auto rounded-sm px-2 py-0.5 leading-[1.4]"
                    >
                      {resultado.rotulo}
                    </LicitacaoCardStatusButton>
                  ) : (
                    <PropertyTrigger className="text-xs">
                      <PropertyEmpty>Definir resultado</PropertyEmpty>
                    </PropertyTrigger>
                  )
                }
              >
                <OpcoesResultado
                  valor={l.resultado}
                  onChange={(v) => {
                    onChange({ resultado: v })
                    fechar()
                  }}
                />
              </MenuDeClique>
            </div>
          </PropertyRow>
        )}

        <PropertyRow {...linha("segmentos", "Segmento")}>
          <PopoverEditor
            ancora
            open={editando === "segmentos"}
            onOpenChange={abrir("segmentos")}
            gatilho={
              l.segmentos.length ? (
                <LicitacaoCardSegments
                  aria-label="Segmentos"
                  className="min-h-5.5 items-center"
                  segments={l.segmentos.map((s) => ({
                    label: s,
                    category: categoriaDoSegmento(s),
                    className: CHIP_SEGMENTO,
                    "aria-label": `Segmento ${s}. Editar segmentos`,
                    "aria-haspopup": "dialog",
                    "aria-expanded": editando === "segmentos",
                    onClick: () => setEditando("segmentos"),
                  }))}
                />
              ) : (
                <PropertyTrigger
                  aria-haspopup="dialog"
                  aria-expanded={editando === "segmentos"}
                  onClick={() => setEditando("segmentos")}
                  className="inline-flex min-h-5.5 items-center text-xs"
                >
                  <PropertyEmpty>Adicionar segmento</PropertyEmpty>
                </PropertyTrigger>
              )
            }
          >
            <ListaSegmentos
              selecionados={l.segmentos}
              disponiveis={segmentosDisponiveis}
              onAlternar={(s) =>
                onChange({
                  segmentos: l.segmentos.includes(s) ? l.segmentos.filter((x) => x !== s) : [...l.segmentos, s],
                })
              }
              onCriar={(nome) => {
                onCriarSegmento(nome)
                onChange({ segmentos: [...l.segmentos, nome] })
              }}
            />
          </PopoverEditor>
        </PropertyRow>

        <PropertyRow {...linha("orgao", "Órgão")} className="leading-snug font-semibold">
          {editando === "orgao" ? (
            <PropertyInlineEdit
              label="Órgão"
              defaultValue={l.orgao}
              onCommit={(v) => {
                onChange({ orgao: v.trim() })
                fechar()
              }}
              onCancel={fechar}
            />
          ) : (
            <PropertyTrigger className="block w-full" onClick={() => setEditando("orgao")}>
              {l.orgao ? (
                <PropertyText lines={2}>{l.orgao}</PropertyText>
              ) : (
                <PropertyEmpty className="font-normal">Adicionar órgão</PropertyEmpty>
              )}
            </PropertyTrigger>
          )}
        </PropertyRow>

        <PropertyRow {...linha("objeto", "Objeto")} className="leading-[1.375]">
          {editando === "objeto" ? (
            <PropertyInlineEdit
              multiline
              label="Objeto"
              defaultValue={l.objeto}
              onCommit={(v) => {
                onChange({ objeto: v.trim() })
                fechar()
              }}
              onCancel={fechar}
            />
          ) : (
            <PropertyTrigger className="block w-full" onClick={() => setEditando("objeto")}>
              {l.objeto ? <PropertyText lines={3}>{l.objeto}</PropertyText> : <PropertyEmpty>Adicionar objeto</PropertyEmpty>}
            </PropertyTrigger>
          )}
        </PropertyRow>

        <PropertyRow {...linha("status", "Status do edital")}>
          <div className="flex min-h-5.5 items-center">
            <MenuDeClique
              open={editando === "status"}
              onOpenChange={abrir("status")}
              gatilho={
                status ? (
                  <LicitacaoCardStatusButton
                    tone={status.tom}
                    size="xs"
                    aria-label={`Status do edital: ${status.rotulo}. Alterar`}
                    // medidas da pill do original (2px 8px, raio 4px)
                    className="h-auto rounded-sm px-2 py-0.5 leading-[1.4]"
                  >
                    {status.rotulo}
                  </LicitacaoCardStatusButton>
                ) : (
                  <PropertyTrigger className="text-xs">
                    <PropertyEmpty>Definir status</PropertyEmpty>
                  </PropertyTrigger>
                )
              }
            >
              <OpcoesStatus
                valor={l.status}
                onChange={(v) => {
                  onChange({ status: v })
                  fechar()
                }}
              />
            </MenuDeClique>
          </div>
        </PropertyRow>

        <PropertyRow {...linha("responsaveis", "Responsável")}>
          <PopoverEditor
            open={editando === "responsaveis"}
            onOpenChange={abrir("responsaveis")}
            gatilho={
              <PropertyTrigger
                variant={pessoas.length ? "chip" : "text"}
                aria-label={
                  pessoas.length ? `Responsáveis: ${pessoas.map((p) => p.nome).join(", ")}. Editar` : "Sem responsáveis. Atribuir"
                }
                className={cn("inline-flex flex-wrap items-center gap-1", pessoas.length && "rounded-full")}
              >
                {pessoas.length ? (
                  pessoas.map((p) => <PropertyChip key={p.id}>{p.nome}</PropertyChip>)
                ) : (
                  <PropertyEmpty className="text-xs">Sem responsáveis</PropertyEmpty>
                )}
              </PropertyTrigger>
            }
          >
            <ListaPessoas
              selecionados={l.responsaveis}
              onAlternar={(id) =>
                onChange({
                  responsaveis: l.responsaveis.includes(id)
                    ? l.responsaveis.filter((x) => x !== id)
                    : [...l.responsaveis, id],
                })
              }
            />
          </PopoverEditor>
        </PropertyRow>

        <PropertyRow {...linha("dataEnvio", "Envio da proposta")}>
          <PopoverEditor
            open={editando === "dataEnvio"}
            onOpenChange={abrir("dataEnvio")}
            className="min-w-60"
            gatilho={
              <PropertyTrigger
                aria-label={
                  l.dataEnvio
                    ? `Envio da proposta: ${formatarData(l.dataEnvio)}${aviso ? `, ${aviso}` : ""}. Alterar`
                    : "Sem data programada. Definir envio da proposta"
                }
                className={cn(
                  "inline-flex items-center gap-1 tabular-nums [&>svg]:size-3.5",
                  urgencia.tom === "hoje" && "font-medium text-destructive",
                  urgencia.tom === "semana" && "font-medium text-warning-strong"
                )}
              >
                {urgencia.tom === "hoje" && <CircleAlertIcon aria-hidden />}
                {urgencia.tom === "semana" && <ClockIcon aria-hidden />}
                {l.dataEnvio ? formatarData(l.dataEnvio) : <PropertyEmpty>Sem data programada</PropertyEmpty>}
              </PropertyTrigger>
            }
          >
            <CalendarioEnvio
              valor={l.dataEnvio}
              onEscolher={(iso) => {
                onChange({ dataEnvio: iso })
                fechar()
              }}
            />
          </PopoverEditor>
        </PropertyRow>

        <PropertyRow {...linha("cidade", "Cidade e Estado")}>
          <PopoverEditor
            open={editando === "cidade"}
            onOpenChange={abrir("cidade")}
            className="min-w-60"
            gatilho={
              <PropertyTrigger aria-label={`Cidade e Estado: ${l.cidade}, ${l.estado}. Alterar`}>
                {l.cidade} <span className="text-muted-foreground">•</span> {l.estado}
              </PropertyTrigger>
            }
          >
            <EditorCidade
              idBase={`cidade-${l.id}`}
              cidade={l.cidade}
              estado={l.estado}
              onChange={(patch) => onChange(patch)}
            />
          </PopoverEditor>
        </PropertyRow>

        <PropertyRow {...linha("valor", "Valor global")} className="tabular-nums">
          {editando === "valor" ? (
            <PropertyInlineEdit
              label="Valor global"
              prefix="R$"
              inputMode="decimal"
              defaultValue={valorParaInput(l.valorGlobal)}
              onCommit={(v) => {
                const lido = lerValor(v)
                if (lido != null) onChange({ valorGlobal: lido })
                fechar()
              }}
              onCancel={fechar}
            />
          ) : (
            <PropertyTrigger aria-label={`Valor global: ${formatarMoeda(l.valorGlobal)}. Editar`} onClick={() => setEditando("valor")}>
              {formatarMoeda(l.valorGlobal)}
            </PropertyTrigger>
          )}
        </PropertyRow>
      </PropertyList>

      {/* Ações flutuantes: aparecem no hover do card. Depois das linhas para ficar por cima delas */}
      <LicitacaoCardHoverActions data-sem-abrir className={cn(arrastando && "hidden")}>
        <LicitacaoCardIconAction label="Copiar link" icon={<LinkIcon />} variant="ghost" onClick={onCopiarLink} />
        <LicitacaoCardIconAction label="Descartar" icon={<Trash2Icon />} variant="ghost" onClick={onDescartar} />
      </LicitacaoCardHoverActions>
    </LicitacaoCardRoot>
  )
}
