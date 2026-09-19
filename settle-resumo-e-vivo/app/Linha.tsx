// Uma informação do Resumo (rótulo + valor). Ao passar o mouse aparecem as ações:
// copiar, editar e abrir a origem no edital (um botão por trecho quando há vários).
// Na edição, o rodapé mostra se a informação tem trecho vinculado.

import { useEffect, useRef } from "react"
import { CopyIcon, LinkIcon, PenLineIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import { criterioDoScore } from "./dados"
import { temFonte, type Painel } from "./painel"

/** Botões escuros do original (Confirmar, Salvar, Cancelar revisão). */
export const ESCURO = "bg-foreground text-background hover:bg-foreground/85"

export function BotaoDeAcao({
  rotulo,
  ativo,
  className,
  ...props
}: React.ComponentProps<typeof Button> & { rotulo: string; ativo?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={rotulo}
          data-ativo={ativo || undefined}
          className={cn("size-6.5 [&_svg:not([class*='size-'])]:size-4.25", ativo && "bg-muted", className)}
          {...props}
        />
      </TooltipTrigger>
      <TooltipContent>{rotulo}</TooltipContent>
    </Tooltip>
  )
}

function MetaDoScore({ rotulo }: { rotulo: string }) {
  const { atende, pontos } = criterioDoScore(rotulo)
  return (
    <span className="ml-auto inline-flex shrink-0 items-center gap-2">
      <Badge variant={atende ? "success" : "destructive"} className="h-auto py-0.5 text-[11px] leading-none font-medium">
        {atende ? "Atende" : "Não atende"}
      </Badge>
      <span className="text-[11px] leading-none font-semibold text-muted-foreground tabular-nums">{pontos}</span>
    </span>
  )
}

function Edicao({ painel, id }: { painel: Painel; id: string }) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const linha = painel.estado.linhas[id]
  const edicao = painel.estado.edicoes[id]
  const erroId = `${id}-erro`

  useEffect(() => {
    ref.current?.focus()
    ref.current?.select()
  }, [])

  return (
    <>
      <Textarea
        ref={ref}
        rows={3}
        value={edicao.rascunho}
        onChange={(e) => painel.digitarEdicao(id, e.target.value)}
        aria-label={`Editar ${linha.rotulo}`}
        aria-invalid={edicao.erro ? true : undefined}
        aria-describedby={edicao.erro ? erroId : undefined}
        className="min-h-19 bg-background text-[13px] leading-normal md:text-[13px]"
      />
      {edicao.erro && (
        <span id={erroId} className="text-xs font-medium text-destructive">
          {edicao.erro}
        </span>
      )}
      <div className="flex items-center justify-between gap-2.5">
        {temFonte(linha) ? (
          <button
            type="button"
            onClick={() => painel.abrirFonteDaLinha(id, "edicao")}
            className="rounded-sm text-xs font-medium text-primary underline underline-offset-2 outline-none hover:text-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Trecho vinculado
          </button>
        ) : (
          <span className="text-xs font-medium text-muted-foreground">Sem trecho vinculado</span>
        )}
        <div className="flex gap-1.5">
          <Button size="xs" variant="ghost" onClick={() => painel.cancelarEdicao(id)}>
            Cancelar
          </Button>
          <Button size="xs" className={ESCURO} onClick={() => painel.salvarEdicao(id)}>
            Salvar
          </Button>
        </div>
      </div>
    </>
  )
}

export function Linha({
  painel,
  id,
  como: Raiz = "div",
  score,
  selecao,
  className,
}: {
  painel: Painel
  id: string
  /** "dl" quando a informação fica sozinha (card da variante sem agrupamento). */
  como?: "div" | "dl"
  /** Mostra a situação do critério no Score. */
  score?: boolean
  /** Card selecionável (variante sem agrupamento). */
  selecao?: { marcada: boolean; alternar: (marcar?: boolean) => void }
  className?: string
}) {
  const { estado } = painel
  const linha = estado.linhas[id]
  const editando = Boolean(estado.edicoes[id])
  const ctx = estado.contexto
  const ativa = ctx?.tipo === "linha" && ctx.linhaId === id
  const botaoAtivo = ativa ? ctx.botao : null
  const comFonte = temFonte(linha)
  const trechos = linha.trechos ?? []
  const recuo = selecao && cn("transition-[padding] duration-150 group-hover/linha:pl-6", selecao.marcada && "pl-6")

  return (
    <Raiz
      data-contexto-ativo={ativa || undefined}
      className={cn(
        "group/linha relative m-0 grid gap-1.25 px-4 py-3 transition-colors hover:bg-muted",
        (ativa || editando) && "bg-muted",
        className
      )}
      onClick={
        selecao &&
        ((e: React.MouseEvent) => {
          if ((e.target as Element).closest("button, input, textarea, select, a, [role=checkbox]")) return
          selecao.alternar()
        })
      }
    >
      <dt className={cn("flex items-center justify-between gap-2 text-[13px] font-semibold", recuo)}>
        {selecao && (
          <Checkbox
            checked={selecao.marcada}
            onCheckedChange={(v) => selecao.alternar(v === true)}
            aria-label={`Selecionar ${linha.rotulo}`}
            className="absolute top-3.75 left-4 bg-background opacity-0 transition-opacity group-hover/linha:opacity-100 focus-visible:opacity-100 data-checked:opacity-100"
          />
        )}
        <span>{linha.rotulo}</span>
        {score && <MetaDoScore rotulo={linha.rotulo} />}
      </dt>
      <dd className={cn("m-0 grid gap-1.25", recuo)}>
        {editando ? (
          <Edicao painel={painel} id={id} />
        ) : (
          <span className="text-[13px] leading-normal text-muted-foreground">{linha.valor}</span>
        )}
        {!editando && (
          <div
            className={cn(
              "pointer-events-none absolute top-1 right-1 flex gap-1.5 rounded-lg bg-background/90 p-1 opacity-0 transition-opacity",
              "group-hover/linha:pointer-events-auto group-hover/linha:opacity-100 focus-within:pointer-events-auto focus-within:opacity-100",
              ativa && "pointer-events-auto opacity-100"
            )}
          >
            <BotaoDeAcao rotulo="Copiar informação" onClick={() => painel.copiarLinha(id)}>
              <CopyIcon aria-hidden />
            </BotaoDeAcao>
            <BotaoDeAcao rotulo="Editar informação" onClick={() => painel.iniciarEdicao(id)}>
              <PenLineIcon aria-hidden />
            </BotaoDeAcao>
            {trechos.length > 0 ? (
              trechos.map((t, i) => (
                <BotaoDeAcao
                  key={i}
                  rotulo={t.rotulo}
                  ativo={botaoAtivo === `trecho-${i}`}
                  className="text-primary hover:text-primary"
                  onClick={() => painel.abrirFonteDaLinha(id, `trecho-${i}`, i)}
                >
                  <LinkIcon aria-hidden />
                </BotaoDeAcao>
              ))
            ) : (
              <BotaoDeAcao
                rotulo={comFonte ? "Abrir trecho do edital" : "Sem trecho vinculado"}
                ativo={botaoAtivo === "origem"}
                className={comFonte ? "text-primary hover:text-primary" : "text-foreground"}
                onClick={() => painel.abrirFonteDaLinha(id, "origem")}
              >
                <LinkIcon aria-hidden />
              </BotaoDeAcao>
            )}
          </div>
        )}
      </dd>
    </Raiz>
  )
}
