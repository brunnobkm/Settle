// Auditoria: feed de eventos em linguagem natural, com busca, filtros por coluna
// e exportação (individual ou em lote).

import { useEffect, useRef, useState } from "react"
import { FileTextIcon, SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  ActionBar,
  ActionBarButton,
  ActionBarClose,
  ActionBarGroup,
  ActionBarLabel,
  ActionBarSeparator,
} from "@/components/ui/action-bar"
import { Checkbox } from "@/components/ui/checkbox"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { avisar, PilulaDeFuncao } from "./comum"
import {
  chaveDoRegistro,
  formatarDataHora,
  fraseDoEvento,
  plural,
  type Pessoa,
  type RegistroAuditoria,
  type ValorFiltro,
} from "./dados"
import { FiltroDeColuna } from "./FiltroDeColuna"

export type ColunaAuditoria = "pessoa" | "evento" | "data"

const TH = "h-auto px-4 py-2.75 text-xs font-semibold text-muted-foreground"
const TD = "px-4 py-3"

export function Auditoria({
  ativa,
  registros,
  equipe,
  opcoesPessoa,
  opcoesEvento,
  buscaAberta,
  consulta,
  onConsulta,
  filtros,
  onFiltro,
}: {
  ativa: boolean
  /** Registros já filtrados pela busca e pelos filtros de coluna. */
  registros: RegistroAuditoria[]
  equipe: Pessoa[]
  opcoesPessoa: string[]
  opcoesEvento: string[]
  buscaAberta: boolean
  consulta: string
  onConsulta: (texto: string) => void
  filtros: Partial<Record<ColunaAuditoria, ValorFiltro>>
  onFiltro: (coluna: ColunaAuditoria, valor: ValorFiltro | undefined) => void
}) {
  const [selecionados, setSelecionados] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (buscaAberta) inputRef.current?.focus()
  }, [buscaAberta])

  // mudar a lista (busca, filtro) limpa a seleção, como no original
  const chaves = registros.map(chaveDoRegistro)
  const marcados = selecionados.filter((k) => chaves.includes(k))
  const n = marcados.length
  const todos = registros.length > 0 && n === registros.length

  function exportarEmLote() {
    avisar(`${n} ${n === 1 ? "registro exportado" : "registros exportados"} com sucesso!`)
    setSelecionados([])
  }

  return (
    <section hidden={!ativa} aria-label="Auditoria">
      {buscaAberta && (
        <div className="mb-3 flex justify-end">
          <InputGroup className="w-auto min-w-65">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              ref={inputRef}
              aria-label="Buscar por usuário ou evento"
              placeholder="Buscar por usuário ou evento…"
              value={consulta}
              onChange={(e) => {
                onConsulta(e.target.value)
                setSelecionados([])
              }}
            />
          </InputGroup>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border bg-card shadow-xs">
        <Table className="text-sm">
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className={cn(TH, "w-10")}>
                <Checkbox
                  aria-label="Selecionar todos os registros"
                  checked={todos ? true : n > 0 ? "indeterminate" : false}
                  className="data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground"
                  onCheckedChange={(c) => setSelecionados(c === true ? chaves : [])}
                />
              </TableHead>
              <TableHead className={cn(TH, "w-75")}>
                <span className="inline-flex items-center gap-1.25">
                  Pessoa
                  <FiltroDeColuna
                    tipo="lista"
                    rotulo="Pessoa"
                    opcoes={opcoesPessoa}
                    valor={filtros.pessoa}
                    onAlterar={(v) => {
                      onFiltro("pessoa", v)
                      setSelecionados([])
                    }}
                  />
                </span>
              </TableHead>
              <TableHead className={TH}>
                <span className="inline-flex items-center gap-1.25">
                  Evento
                  <FiltroDeColuna
                    tipo="lista"
                    rotulo="Tipo de evento"
                    opcoes={opcoesEvento}
                    valor={filtros.evento}
                    onAlterar={(v) => {
                      onFiltro("evento", v)
                      setSelecionados([])
                    }}
                  />
                </span>
              </TableHead>
              <TableHead className={cn(TH, "w-46.25")}>
                <span className="inline-flex items-center gap-1.25">
                  Data
                  <FiltroDeColuna
                    tipo="data"
                    rotulo="Data"
                    valor={filtros.data}
                    onAlterar={(v) => {
                      onFiltro("data", v)
                      setSelecionados([])
                    }}
                  />
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registros.length ? (
              registros.map((a) => {
                const chave = chaveDoRegistro(a)
                const marcado = marcados.includes(chave)
                const pessoa = equipe.find((p) => p.nome === a.pessoa)
                return (
                  <TableRow key={chave} data-state={marcado ? "selected" : undefined} className="hover:bg-muted/40">
                    <TableCell className={TD}>
                      <Checkbox
                        aria-label={`Selecionar registro de ${a.pessoa} em ${formatarDataHora(a.ts)}`}
                        checked={marcado}
                        onCheckedChange={(c) =>
                          setSelecionados(c === true ? [...marcados, chave] : marcados.filter((k) => k !== chave))
                        }
                      />
                    </TableCell>
                    <TableCell className={TD}>
                      <div className="flex items-center gap-1.75">
                        <span className="font-semibold">{a.pessoa}</span>
                        {pessoa && <PilulaDeFuncao funcao={pessoa.funcao} />}
                      </div>
                      {pessoa && <div className="text-[13px] text-muted-foreground">{pessoa.email}</div>}
                    </TableCell>
                    <TableCell className={cn(TD, "min-w-70 whitespace-normal")}>{fraseDoEvento(a)}</TableCell>
                    <TableCell className={cn(TD, "text-[13px] text-muted-foreground")}>
                      <time dateTime={a.ts.replace(" ", "T")}>{formatarDataHora(a.ts)}</time>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="p-0">
                  <Empty className="px-6 py-14">
                    <EmptyHeader>
                      <EmptyMedia variant="icon" className="text-muted-foreground">
                        <FileTextIcon />
                      </EmptyMedia>
                      <EmptyTitle className="text-[15px] font-semibold">Nenhum registro</EmptyTitle>
                      <EmptyDescription className="text-[13.5px]">
                        Ajuste a busca para ver eventos de auditoria.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ActionBar open={ativa && n > 0} aria-label="Ações em lote">
        <ActionBarLabel>{plural(n, "registro selecionado", "registros selecionados")}</ActionBarLabel>
        <ActionBarSeparator />
        <ActionBarGroup>
          <ActionBarButton onClick={exportarEmLote}>Exportar</ActionBarButton>
        </ActionBarGroup>
        <ActionBarSeparator />
        <ActionBarClose onClick={() => setSelecionados([])} />
      </ActionBar>
    </section>
  )
}
