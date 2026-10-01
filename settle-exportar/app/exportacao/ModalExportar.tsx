// Os dois modais de exportação:
// - ModalExportarHoje: réplica do que existe em produção (só por data, ignora filtros).
// - ModalExportar: a proposta. Mesmo componente em todas as telas; mostra o resumo
//   (aba, busca, filtros, quantidade) antes de exportar e sempre pede o formato.

import { useEffect, useState } from "react"
import { CircleAlertIcon, ClockIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

import {
  LIMITE_SEGUNDO_PLANO,
  baixarArquivo,
  gerarLinhas,
  nomeDoArquivo,
  quantidade,
  registrarEvento,
  type Formato,
  type Linha,
  type OpcaoExport,
  type TelaExport,
} from "./nucleo"
import { useExportacoes } from "./Tarefas"

/* ------------------------------------------------------------------ */
/* Período                                                             */
/* ------------------------------------------------------------------ */

const INICIO_PADRAO = "2026-09-23"
const FIM_PADRAO = "2026-09-30"
const br = (iso: string) => iso.split("-").reverse().join("/")
const dias = (de: string, ate: string) => Math.round((Date.parse(ate) - Date.parse(de)) / 86400000) + 1

/** Estimativa fictícia de quantas entraram no período (base de 60 dias). */
const contarPeriodo = (total: number, de: string, ate: string) => {
  const d = dias(de, ate)
  if (!de || !ate || Number.isNaN(d) || d < 1) return 0
  return Math.min(total, Math.round((total * d) / 60))
}

function CampoPeriodo({ de, ate, onDe, onAte }: { de: string; ate: string; onDe: (v: string) => void; onAte: (v: string) => void }) {
  return (
    <div className="mt-2.5 ml-6.5 grid grid-cols-2 gap-2.5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="periodo-de" className="text-xs text-muted-foreground">
          De
        </Label>
        <Input id="periodo-de" type="date" value={de} max={ate} onChange={(e) => onDe(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="periodo-ate" className="text-xs text-muted-foreground">
          Até
        </Label>
        <Input id="periodo-ate" type="date" value={ate} min={de} onChange={(e) => onAte(e.target.value)} />
      </div>
    </div>
  )
}

function Opcao({ valor, titulo, descricao, children }: { valor: string; titulo: string; descricao?: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-lg border px-3.5 py-3 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5">
      <div className="flex items-start gap-2.5">
        <RadioGroupItem value={valor} id={`opcao-${valor}`} className="mt-0.5" />
        <Label htmlFor={`opcao-${valor}`} className="flex flex-col items-start gap-0.5 font-normal">
          <span className="text-sm font-medium">{titulo}</span>
          {descricao && <span className="text-[13px] text-muted-foreground">{descricao}</span>}
        </Label>
      </div>
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Hoje (produção)                                                     */
/* ------------------------------------------------------------------ */

export function ModalExportarHoje({
  open,
  onOpenChange,
  tela,
  comFormato,
  totalHoje,
  totalBase,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  tela: TelaExport
  /** Recomendadas mostra "Formato do arquivo"; o Kanban não. */
  comFormato: boolean
  totalHoje: number
  totalBase: number
}) {
  const [opcao, setOpcao] = useState<"hoje" | "periodo">("hoje")
  const [de, setDe] = useState(INICIO_PADRAO)
  const [ate, setAte] = useState(FIM_PADRAO)

  useEffect(() => {
    if (open) registrarEvento("export_modal_opened", { tela, origem: "botao_geral" })
  }, [open, tela])

  function exportar() {
    // produção: ignora aba, filtros e busca; só a data importa
    const n = opcao === "hoje" ? totalHoje : contarPeriodo(totalBase, de, ate)
    onOpenChange(false)
    const id = toast.loading("Exportando licitações…")
    window.setTimeout(() => {
      baixarArquivo({
        nome: nomeDoArquivo(tela, "xlsx"),
        formato: "xlsx",
        sobre: [],
        linhas: gerarLinhas(n, { tela }),
      })
      toast.success("Licitações exportadas com sucesso.", { id })
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-110">
        <DialogHeader>
          <DialogTitle>Exportar licitações</DialogTitle>
        </DialogHeader>
        <RadioGroup
          value={opcao}
          onValueChange={(v) => {
            setOpcao(v as "hoje" | "periodo")
            registrarEvento("export_option_selected", { opcao: v, tela })
          }}
          className="gap-2.5"
        >
          <Opcao valor="hoje" titulo="Adicionadas hoje" />
          <Opcao valor="periodo" titulo="Escolher período">
            {opcao === "periodo" && <CampoPeriodo de={de} ate={ate} onDe={setDe} onAte={setAte} />}
          </Opcao>
        </RadioGroup>
        {comFormato && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="formato-hoje">Formato do arquivo</Label>
            <NativeSelect id="formato-hoje" defaultValue="xlsx" className="w-full">
              <NativeSelectOption value="xlsx">XLSX</NativeSelectOption>
            </NativeSelect>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={exportar}>Exportar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/* Proposta                                                            */
/* ------------------------------------------------------------------ */

export type EtapaParaExportar = { id: string; rotulo: string; total: number }

export type ContextoDaTela = {
  tela: TelaExport
  aba?: string
  busca?: string
  filtros: { rotulo: string; valor: string }[]
  /** Resultado atual da tela (aba + busca + filtros, todas as páginas). */
  totalFiltrado: number
  /** Do resultado atual, quantas foram adicionadas hoje. */
  totalHoje: number
  etapas?: EtapaParaExportar[]
}

export type AberturaDoModal = {
  modo: "geral" | "lote"
  opcao?: OpcaoExport
  /** Etapas já marcadas (vindo do menu da coluna). */
  etapas?: string[]
  /** Quantas estão selecionadas (modo lote). */
  lote?: number
  origem: string
}

const ROTULO_DA_OPCAO: Record<OpcaoExport, string> = {
  hoje: "Adicionadas hoje",
  periodo: "Adicionadas em um período",
  filtrado: "Todas da lista",
  etapa: "Só algumas etapas",
  lote: "Marcadas por você",
}

export function ModalExportar({
  abertura,
  onClose,
  contexto,
  mostrarOpcaoEtapa,
  linhas,
}: {
  abertura: AberturaDoModal | null
  onClose: () => void
  contexto: ContextoDaTela
  /** Kanban: mostra "Exportar por etapa do fluxo". */
  mostrarOpcaoEtapa?: boolean
  /** Linhas do arquivo para a opção escolhida (chamado no pedido: congela os dados). */
  linhas: (o: { opcao: OpcaoExport; quantidade: number; etapas: string[] }) => Linha[]
}) {
  const { exportar } = useExportacoes()
  const open = !!abertura
  const lote = abertura?.modo === "lote"
  const [opcao, setOpcao] = useState<OpcaoExport>("filtrado")
  const [etapas, setEtapas] = useState<string[]>([])
  const [de, setDe] = useState(INICIO_PADRAO)
  const [ate, setAte] = useState(FIM_PADRAO)
  const [formato, setFormato] = useState<Formato>("xlsx")

  // cada abertura começa do jeito que foi pedida (ex.: etapa pré-selecionada)
  useEffect(() => {
    if (!abertura) return
    setOpcao(abertura.modo === "lote" ? "lote" : (abertura.opcao ?? "filtrado"))
    setEtapas(abertura.etapas ?? [])
    registrarEvento("export_modal_opened", {
      tela: contexto.tela,
      origem: abertura.origem,
      opcao_inicial: abertura.modo === "lote" ? "lote" : (abertura.opcao ?? "filtrado"),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abertura])

  const periodoInvalido = opcao === "periodo" && (!de || !ate || dias(de, ate) < 1)
  const total =
    opcao === "lote"
      ? (abertura?.lote ?? 0)
      : opcao === "hoje"
        ? contexto.totalHoje
        : opcao === "periodo"
          ? contarPeriodo(contexto.totalFiltrado, de, ate)
          : opcao === "etapa"
            ? (contexto.etapas ?? []).filter((e) => etapas.includes(e.id)).reduce((s, e) => s + e.total, 0)
            : contexto.totalFiltrado

  const nomesDasEtapas = (contexto.etapas ?? []).filter((e) => etapas.includes(e.id)).map((e) => e.rotulo)

  // o que vai no resumo da tela e no cabeçalho do arquivo
  const resumo: [string, string][] = [
    ...(contexto.aba ? [["Aba", contexto.aba] as [string, string]] : []),
    ...(contexto.busca ? [["Busca", `“${contexto.busca}”`] as [string, string]] : []),
    [
      "Filtros",
      contexto.filtros.length ? contexto.filtros.map((f) => `${f.rotulo}: ${f.valor}`).join(" · ") : "Nenhum",
    ],
    ["Seleção", ROTULO_DA_OPCAO[opcao]],
    ...(opcao === "periodo" ? [["Período", `${br(de)} a ${br(ate)}`] as [string, string]] : []),
    ...(opcao === "etapa" ? [["Etapas", nomesDasEtapas.join(", ") || "Nenhuma"] as [string, string]] : []),
  ]


  function motivoDoBloqueio() {
    if (periodoInvalido) return "A data final não pode ser anterior à inicial."
    if (opcao === "etapa" && !etapas.length) return "Marque pelo menos uma etapa."
    if (total === 0) {
      if (opcao === "hoje") return "Nenhuma licitação chegou hoje."
      if (opcao === "periodo") return "Nenhuma licitação chegou nessas datas."
      if (opcao === "etapa") return "As etapas escolhidas não têm licitações."
      return "Não há licitações para exportar. Tire algum filtro e tente de novo."
    }
    return null
  }
  const bloqueio = motivoDoBloqueio()

  function confirmar() {
    const pedido = { opcao, quantidade: total, etapas }
    exportar({
      tela: contexto.tela,
      opcao,
      formato,
      quantidade: total,
      resumo,
      linhas: () => linhas(pedido),
    })
    onClose()
  }

  const n = (x: number) => x.toLocaleString("pt-BR")

  function escolher(v: string) {
    setOpcao(v as OpcaoExport)
    registrarEvento("export_option_selected", { opcao: v, tela: contexto.tela })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-130">
        <DialogHeader>
          <DialogTitle>{lote ? "Exportar as licitações marcadas" : "Exportar licitações"}</DialogTitle>
          <DialogDescription className="sr-only">Escolha o que vai para o arquivo.</DialogDescription>
        </DialogHeader>

        {lote ? (
          <p className="text-[15px]">
            Vão para o arquivo as <strong className="font-semibold tabular-nums">{quantidade(total)}</strong> que você marcou.
          </p>
        ) : (
          <RadioGroup value={opcao} onValueChange={escolher} className="gap-2" aria-label="O que exportar">
            <Opcao valor="filtrado" titulo={`Todas (${n(contexto.totalFiltrado)})`} />
            {mostrarOpcaoEtapa && contexto.etapas && (
              <Opcao valor="etapa" titulo="Escolher etapas">
                {opcao === "etapa" && (
                  <fieldset className="mt-2.5 ml-6.5 grid gap-1.5 sm:grid-cols-2">
                    <legend className="sr-only">Etapas</legend>
                    {contexto.etapas.map((e) => (
                      <label key={e.id} className="flex items-center gap-2 text-[13px]">
                        <Checkbox
                          checked={etapas.includes(e.id)}
                          onCheckedChange={(c) => setEtapas((s) => (c ? [...s, e.id] : s.filter((x) => x !== e.id)))}
                        />
                        <span className="min-w-0 flex-1 truncate">{e.rotulo}</span>
                        <span className="text-muted-foreground tabular-nums">{e.total}</span>
                      </label>
                    ))}
                  </fieldset>
                )}
              </Opcao>
            )}
            <Opcao valor="hoje" titulo={`Só as que chegaram hoje (${n(contexto.totalHoje)})`} />
            <Opcao valor="periodo" titulo="Escolher datas">
              {opcao === "periodo" && <CampoPeriodo de={de} ate={ate} onDe={setDe} onAte={setAte} />}
            </Opcao>
          </RadioGroup>
        )}

        {/* filtros só aparecem quando existem: é a única surpresa possível */}
        {!lote && (contexto.filtros.length > 0 || contexto.busca) && (
          <p className="rounded-lg bg-muted px-3.5 py-3 text-[13px]">
            <span className="font-medium">Vale o que está na sua tela:</span>{" "}
            {[
              contexto.aba && contexto.aba !== "Todas" ? `aba ${contexto.aba}` : null,
              contexto.busca ? `busca “${contexto.busca}”` : null,
              ...contexto.filtros.map((f) => `${f.rotulo.toLowerCase()} ${f.valor}`),
            ]
              .filter(Boolean)
              .join(", ")}
            .
          </p>
        )}

        <div className="flex flex-col gap-1.5">
          <span id="rotulo-formato" className="text-sm font-medium">
            Tipo de arquivo
          </span>
          <ToggleGroup
            type="single"
            variant="outline"
            value={formato}
            onValueChange={(v) => v && setFormato(v as Formato)}
            aria-labelledby="rotulo-formato"
            className="w-fit"
          >
            <ToggleGroupItem value="xlsx" className="px-4 data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-primary">
              Excel
            </ToggleGroupItem>
            <ToggleGroupItem value="csv" className="px-4 data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-primary">
              CSV
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {bloqueio ? (
          <p role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-[13px] text-destructive">
            <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
            {bloqueio}
          </p>
        ) : (
          total > LIMITE_SEGUNDO_PLANO && (
            <p className="flex items-start gap-2 text-[13px] text-muted-foreground">
              <ClockIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
              Pode levar alguns minutos. Avisamos quando o arquivo estiver pronto.
            </p>
          )
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={confirmar} disabled={!!bloqueio} className={cn(bloqueio && "cursor-not-allowed")}>
            {total > 0 && !bloqueio ? `Exportar ${quantidade(total)}` : "Exportar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
