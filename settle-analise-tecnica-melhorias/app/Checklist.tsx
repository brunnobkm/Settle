// Seção de SOFTWARE / SERVIÇO: checklist atende / não atende, em duas visões.
// Visão em requisito: tabela com cabeçalho e primeira coluna fixos ao rolar.
// Visão em bloco: tabela agregada por módulo (contagem e percentual por status).

import { useRef, type ComponentProps, type CSSProperties } from "react"
import { ArrowUpRightIcon, CheckIcon, ChevronDownIcon, Link2Icon, PlusIcon, Trash2Icon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MENSAGEM_NAO_PROTOTIPADO } from "@/settle/nao-prototipado"

import { Dica, useAltura } from "./comum"
import { ESTADOS_CHECKLIST, ROTULO_STATUS, VAZIO, type EstadoChecklist, type LinhaChecklist } from "./dados"

export type Visao = "requisito" | "bloco"

const VARIANTE: Record<EstadoChecklist, "success" | "destructive" | "warning" | "secondary"> = {
  ok: "success",
  no: "destructive",
  parcial: "warning",
  parceiro: "warning",
  ne: "secondary",
}

function ConteudoDoStatus({ st }: { st: EstadoChecklist }) {
  return (
    <>
      {st === "ok" && <CheckIcon data-icon="inline-start" />}
      {st === "no" && <XIcon data-icon="inline-start" />}
      {ROTULO_STATUS[st]}
    </>
  )
}
function BadgeDeStatus({ st, ...props }: { st: EstadoChecklist } & ComponentProps<typeof Badge>) {
  return (
    <Badge variant={VARIANTE[st]} {...props}>
      <ConteudoDoStatus st={st} />
    </Badge>
  )
}

const TH = "sticky top-0 z-2 h-auto border-b bg-muted px-4 py-3 text-[13px] font-semibold text-muted-foreground"
const TH_FIXO = "left-0 z-3 shadow-[1px_0_0_var(--border)]"
const TD = "border-b px-4 py-3 align-top"
const TD_FIXO = "sticky left-0 z-1 bg-background shadow-[1px_0_0_var(--border)] group-hover/linha:bg-muted"

export function Checklist({
  linhas,
  visao,
  onVisao,
  alturaDisponivel,
  travado,
  onTravado,
  onStatus,
  onVerOrigem,
}: {
  linhas: LinhaChecklist[]
  visao: Visao
  onVisao: (v: Visao) => void
  /** altura livre para a tabela; undefined = item com várias seções (60% da tela) */
  alturaDisponivel: number | undefined
  travado: boolean
  onTravado: () => void
  onStatus: (id: string, st: EstadoChecklist) => void
  onVerOrigem: () => void
}) {
  const seletorRef = useRef<HTMLDivElement>(null)
  const alturaSeletor = useAltura(seletorRef)
  const alturaMaxima = alturaDisponivel != null ? `${Math.max(240, Math.round(alturaDisponivel - alturaSeletor - 14))}px` : "60vh"
  const naoPrototipado = () => (travado ? onTravado() : toast(MENSAGEM_NAO_PROTOTIPADO))
  const caixa = "max-h-(--altura-tabela) overflow-auto rounded-lg border"

  return (
    <Tabs value={visao} onValueChange={(v) => onVisao(v as Visao)} className="gap-3.5" style={{ "--altura-tabela": alturaMaxima } as CSSProperties}>
      <div ref={seletorRef}>
        <TabsList className="h-auto border">
          <TabsTrigger value="requisito" className="px-3.5 py-1.5 text-[13px] font-semibold">
            Visão em requisito
          </TabsTrigger>
          <TabsTrigger value="bloco" className="px-3.5 py-1.5 text-[13px] font-semibold">
            Visão em bloco
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="requisito">
        <Table containerClassName={caixa} className="min-w-280 border-separate border-spacing-0">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={cn(TH, TH_FIXO, "w-[22%]")}>Requisito</TableHead>
              <TableHead className={TH}>Status</TableHead>
              <TableHead className={TH}>Confiança IA</TableHead>
              <TableHead className={cn(TH, "w-[24%]")}>Justificativa IA</TableHead>
              <TableHead className={TH}>Módulo</TableHead>
              <TableHead className={TH}>Responsável</TableHead>
              <TableHead className={cn(TH, "min-w-30")}>Notas</TableHead>
              <TableHead className={cn(TH, "w-12 px-1.5")}>
                <Dica texto="Adicionar uma coluna à tabela">
                  <Button variant="outline" size="icon-sm" aria-label="Adicionar uma coluna à tabela" className="size-7 text-muted-foreground hover:text-primary" onClick={naoPrototipado}>
                    <PlusIcon />
                  </Button>
                </Dica>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {linhas.map((r) => (
              <TableRow key={r.id} className="group/linha border-0">
                <TableCell className={cn(TD, TD_FIXO, "whitespace-normal")}>
                  <div className="flex items-start gap-1.5">
                    <span className="flex-1 font-medium">{r.req}</span>
                    <Dica texto="Ver de onde a IA extraiu no edital (página e trecho)">
                      <Button
                        variant="outline"
                        size="icon-xs"
                        aria-label={`Ver a origem de ${r.req} no edital`}
                        className="text-muted-foreground opacity-0 group-hover/linha:opacity-100 hover:text-primary focus-visible:opacity-100"
                        onClick={onVerOrigem}
                      >
                        <ArrowUpRightIcon />
                      </Button>
                    </Dica>
                  </div>
                </TableCell>
                <TableCell className={TD}>
                  <SeletorDeStatus linha={r} travado={travado} onTravado={onTravado} onStatus={(st) => onStatus(r.id, st)} />
                </TableCell>
                <TableCell className={TD}>
                  {r.c ? (
                    <Dica texto="Confiança da IA na extração">
                      <Badge tabIndex={0} variant={r.c === "alta" ? "success" : r.c === "media" ? "warning" : "destructive"}>
                        {r.c === "alta" ? "Alta" : r.c === "media" ? "Média" : "Baixa"}
                      </Badge>
                    </Dica>
                  ) : (
                    <span className="text-muted-foreground italic">{VAZIO}</span>
                  )}
                </TableCell>
                <TableCell className={cn(TD, "text-[13px] leading-normal whitespace-normal text-muted-foreground")}>{r.just || VAZIO}</TableCell>
                <TableCell className={TD}>
                  <Badge variant="secondary">{r.modulo || VAZIO}</Badge>
                </TableCell>
                <TableCell className={TD}>
                  <Responsavel />
                </TableCell>
                <TableCell className={TD}>
                  {r.notas ? (
                    <span className="text-[13px]">{r.notas}</span>
                  ) : (
                    <Dica texto="Adicionar uma nota interna a este requisito">
                      <button
                        type="button"
                        onClick={naoPrototipado}
                        className="rounded-md border border-dashed border-foreground/20 px-2.25 py-0.75 text-[13px] text-muted-foreground opacity-0 transition-opacity outline-none group-hover/linha:opacity-100 hover:border-primary hover:bg-primary/10 hover:text-primary focus-visible:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        + Nota
                      </button>
                    </Dica>
                  )}
                </TableCell>
                <TableCell className={cn(TD, "px-1.5")} />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>

      <TabsContent value="bloco">
        <VisaoEmBloco linhas={linhas} caixa={caixa} />
      </TabsContent>
    </Tabs>
  )
}

/** Status clicável: abre a lista de status para escolher direto. */
function SeletorDeStatus({
  linha,
  travado,
  onTravado,
  onStatus,
}: {
  linha: LinhaChecklist
  travado: boolean
  onTravado: () => void
  onStatus: (st: EstadoChecklist) => void
}) {
  const bloquear = (e: { preventDefault: () => void }) => {
    e.preventDefault()
    onTravado()
  }
  return (
    <DropdownMenu>
      <Dica texto="Clique para escolher o status">
        <DropdownMenuTrigger asChild>
          <Badge variant={VARIANTE[linha.st]} asChild className="cursor-pointer hover:brightness-95">
            <button
              type="button"
              aria-label={`${linha.req}: ${ROTULO_STATUS[linha.st]}. Escolher o status`}
              onPointerDown={(e) => travado && bloquear(e)}
              onKeyDown={(e) => travado && ["Enter", " ", "ArrowDown"].includes(e.key) && bloquear(e)}
            >
              <ConteudoDoStatus st={linha.st} />
              <ChevronDownIcon data-icon="inline-end" className="opacity-60" />
            </button>
          </Badge>
        </DropdownMenuTrigger>
      </Dica>
      <DropdownMenuContent className="min-w-48">
        <DropdownMenuGroup>
          {ESTADOS_CHECKLIST.map((st) => (
            <DropdownMenuItem key={st} onSelect={() => onStatus(st)} className="justify-between gap-2.5">
              <BadgeDeStatus st={st} />
              {st === linha.st && <CheckIcon aria-label="atual" className="text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function Responsavel() {
  return (
    <Badge variant="secondary" className="gap-1.5 pl-1">
      <span aria-hidden className="size-4 rounded-full bg-muted-foreground/30" />
      Selecionar
    </Badge>
  )
}

/* Visão em bloco: uma linha por módulo, com a contagem e o percentual de cada status (espelha a produção). */
function VisaoEmBloco({ linhas, caixa }: { linhas: LinhaChecklist[]; caixa: string }) {
  const grupos = new Map<string, LinhaChecklist[]>()
  linhas.forEach((r) => {
    const m = r.modulo || "Outros"
    grupos.set(m, [...(grupos.get(m) ?? []), r])
  })
  const pct = (n: number, t: number) => (t ? Math.round((n / t) * 100) : 0)
  const celula = (n: number, t: number) => (
    <>
      {n} <span className="text-muted-foreground">({pct(n, t)}%)</span>
    </>
  )
  const NUM = cn(TD, "font-mono text-[13px] whitespace-nowrap")
  return (
    <Table containerClassName={caixa} className="min-w-280 border-separate border-spacing-0">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className={cn(TH, TH_FIXO, "w-[22%]")}>Módulo</TableHead>
          <TableHead className={TH}>Responsável</TableHead>
          <TableHead className={TH}>Total de Requisitos</TableHead>
          <TableHead className={TH}>Atende</TableHead>
          <TableHead className={TH}>Atende parcialmente</TableHead>
          <TableHead className={TH}>Atende com parceiro</TableHead>
          <TableHead className={TH}>Não atende</TableHead>
          <TableHead className={TH}>Sem estado</TableHead>
          <TableHead className={TH}>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...grupos.entries()].map(([mod, itens]) => {
          const t = itens.length
          const n = (st: EstadoChecklist) => itens.filter((r) => r.st === st).length
          return (
            <TableRow key={mod} className="group/linha border-0">
              <TableCell className={cn(TD, TD_FIXO, "font-medium")}>{mod}</TableCell>
              <TableCell className={TD}>
                <Responsavel />
              </TableCell>
              <TableCell className={NUM}>{t}</TableCell>
              <TableCell className={NUM}>{celula(n("ok"), t)}</TableCell>
              <TableCell className={NUM}>{celula(n("parcial"), t)}</TableCell>
              <TableCell className={NUM}>{celula(n("parceiro"), t)}</TableCell>
              <TableCell className={NUM}>{celula(n("no"), t)}</TableCell>
              <TableCell className={NUM}>{celula(n("ne"), t)}</TableCell>
              <TableCell className={cn(TD, "py-2.5")}>
                <div className="flex items-center gap-1">
                  <Dica texto="Excluir módulo">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Excluir o módulo ${mod}`}
                      className="size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      data-nao-prototipado
                    >
                      <Trash2Icon />
                    </Button>
                  </Dica>
                  <Dica texto="Ir para o módulo">
                    <Button variant="ghost" size="icon-sm" aria-label={`Ir para o módulo ${mod}`} className="size-7 text-muted-foreground hover:text-primary" data-nao-prototipado>
                      <Link2Icon />
                    </Button>
                  </Dica>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
