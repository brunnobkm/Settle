// Gerenciar equipe: abas por função, busca, tabela com filtros por coluna,
// troca rápida de função, resetar senha, remover e ações em lote.

import { useState } from "react"
import { LockIcon, SearchIcon, Trash2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  ActionBar,
  ActionBarButton,
  ActionBarClose,
  ActionBarGroup,
  ActionBarLabel,
  ActionBarSeparator,
} from "@/components/ui/action-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { avisar, Confirmacao, PilulaDeFuncao, primeiraMaiuscula, type PedidoDeConfirmacao } from "./comum"
import {
  FUNCOES,
  ORDEM_FUNCOES,
  ROTULO_STATUS,
  passaData,
  passaLista,
  plural,
  type Funcao,
  type Pessoa,
  type ValorFiltro,
} from "./dados"
import { FiltroDeColuna } from "./FiltroDeColuna"

type ColunaFiltravel = "pessoa" | "funcao" | "status" | "ultimo"

const TH = "h-auto px-4 py-2.75 text-xs font-semibold text-muted-foreground"
const TD = "px-4 py-3"

/** Opções do menu de função: pílula + descrição. */
function ConteudoDaFuncao({ funcao }: { funcao: Funcao }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.25">
      <PilulaDeFuncao funcao={funcao} className="w-fit" />
      <span className="text-xs leading-snug whitespace-normal text-muted-foreground">{FUNCOES[funcao].descricao}</span>
    </div>
  )
}

export function Equipe({
  equipe,
  onEquipeChange,
  ativa,
}: {
  equipe: Pessoa[]
  onEquipeChange: (equipe: Pessoa[]) => void
  ativa: boolean
}) {
  const [aba, setAba] = useState<Funcao | "">("")
  const [busca, setBusca] = useState("")
  const [filtros, setFiltros] = useState<Partial<Record<ColunaFiltravel, ValorFiltro>>>({})
  const [selecionados, setSelecionados] = useState<string[]>([])
  const [confirmacao, setConfirmacao] = useState<PedidoDeConfirmacao | null>(null)

  const q = busca.trim().toLowerCase()
  const linhas = equipe.filter(
    (p) =>
      (!aba || p.funcao === aba) &&
      (!q || p.nome.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)) &&
      passaLista(filtros.pessoa, p.nome) &&
      passaLista(filtros.funcao, FUNCOES[p.funcao].rotulo) &&
      passaLista(filtros.status, ROTULO_STATUS[p.status]) &&
      passaData(filtros.ultimo, p.ultimoAcessoData)
  )

  // como no original, mudar a lista (aba, busca, filtro) limpa a seleção
  const selecionadosVisiveis = selecionados.filter((e) => linhas.some((p) => p.email === e))
  const n = selecionadosVisiveis.length
  const todos = linhas.length > 0 && n === linhas.length

  function alterarFiltro(coluna: ColunaFiltravel, valor: ValorFiltro | undefined) {
    setFiltros((f) => ({ ...f, [coluna]: valor }))
    setSelecionados([])
  }

  function trocarFuncao(pessoa: Pessoa, funcao: Funcao) {
    if (pessoa.funcao === funcao) return
    onEquipeChange(equipe.map((p) => (p.email === pessoa.email ? { ...p, funcao } : p)))
    avisar(`${pessoa.nome} agora é ${FUNCOES[funcao].rotulo}`)
  }

  function resetarSenha(pessoa: Pessoa) {
    setConfirmacao({
      icone: <LockIcon />,
      titulo: "Resetar senha",
      rotuloOk: "Enviar link",
      mensagem: (
        <>
          Vamos enviar um <b>link de redefinição</b> para <b>{pessoa.email}</b>. A própria pessoa cria a nova senha.
          Você não chega a vê-la, e a senha atual deixa de funcionar.
        </>
      ),
      onOk: () => avisar(`Link de redefinição enviado para ${pessoa.email}`),
    })
  }

  function remover(pessoa: Pessoa) {
    setConfirmacao({
      icone: <Trash2Icon />,
      titulo: "Remover acesso",
      rotuloOk: "Remover",
      perigo: true,
      mensagem: (
        <>
          Remover <b>{pessoa.nome}</b> do workspace?
        </>
      ),
      onOk: () => {
        onEquipeChange(equipe.filter((p) => p.email !== pessoa.email))
        setSelecionados((s) => s.filter((e) => e !== pessoa.email))
        avisar(`${pessoa.nome} removido`)
      },
    })
  }

  /* ---------------- lote ---------------- */

  function mudarFuncaoEmLote(funcao: Funcao) {
    const alvo = selecionadosVisiveis
    onEquipeChange(equipe.map((p) => (alvo.includes(p.email) ? { ...p, funcao } : p)))
    setSelecionados([])
    avisar(`${alvo.length} ${alvo.length === 1 ? "pessoa agora é" : "pessoas agora são"} ${FUNCOES[funcao].rotulo}`)
  }

  function resetarSenhaEmLote() {
    const total = selecionadosVisiveis.length
    const pl = total === 1 ? "pessoa" : "pessoas"
    setConfirmacao({
      icone: <LockIcon />,
      titulo: "Resetar senha",
      rotuloOk: "Enviar links",
      mensagem: (
        <>
          Vamos enviar um <b>link de redefinição</b> para{" "}
          {total === 1 ? (
            "a pessoa selecionada"
          ) : (
            <>
              as <b>{total}</b> {pl} selecionadas
            </>
          )}
          . Cada uma cria a própria senha; as senhas atuais deixam de funcionar.
        </>
      ),
      onOk: () => {
        setSelecionados([])
        avisar(`${total} ${total === 1 ? "link enviado" : "links enviados"} de redefinição`)
      },
    })
  }

  function removerEmLote() {
    const alvo = selecionadosVisiveis
    const pl = alvo.length === 1 ? "pessoa" : "pessoas"
    setConfirmacao({
      icone: <Trash2Icon />,
      titulo: "Remover acesso",
      rotuloOk: "Remover",
      perigo: true,
      mensagem: (
        <>
          Remover <b>{alvo.length}</b> {pl} do workspace? Elas perdem o acesso imediatamente.
        </>
      ),
      onOk: () => {
        onEquipeChange(equipe.filter((p) => !alvo.includes(p.email)))
        setSelecionados([])
        avisar(`${alvo.length} ${pl} ${alvo.length === 1 ? "removida" : "removidas"}`)
      },
    })
  }

  /* ---------------- tela ---------------- */

  const abas: [Funcao | "", string, number][] = [
    ["", "Todos", equipe.length],
    ...ORDEM_FUNCOES.map((f): [Funcao, string, number] => [
      f,
      FUNCOES[f].rotulo,
      equipe.filter((p) => p.funcao === f).length,
    ]),
  ]

  return (
    <section hidden={!ativa} aria-label="Gerenciar equipe">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2.5">
        <div role="group" aria-label="Filtrar por função" className="flex flex-wrap gap-0.5">
          {abas.map(([chave, rotulo, total]) => {
            const ativo = chave === aba
            return (
              <Button
                key={chave || "todos"}
                variant="ghost"
                aria-pressed={ativo}
                className={cn(
                  "h-auto gap-1.75 rounded-lg px-3 py-1.75 font-medium text-muted-foreground",
                  ativo && "bg-muted text-foreground"
                )}
                onClick={() => {
                  setAba(chave)
                  setSelecionados([])
                }}
              >
                {rotulo}
                <span
                  className={cn(
                    "rounded-full bg-foreground/5 px-1.5 text-xs leading-4.5 text-muted-foreground tabular-nums",
                    ativo && "bg-foreground/10"
                  )}
                >
                  {total}
                </span>
              </Button>
            )
          })}
        </div>
        <InputGroup className="w-auto max-w-57.5 min-w-45">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Buscar pessoas"
            placeholder="Buscar…"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value)
              setSelecionados([])
            }}
          />
        </InputGroup>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card shadow-xs">
        <Table className="text-sm">
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className={cn(TH, "w-10")}>
                <Checkbox
                  aria-label="Selecionar todas as pessoas"
                  checked={todos ? true : n > 0 ? "indeterminate" : false}
                  onCheckedChange={(c) => setSelecionados(c === true ? linhas.map((p) => p.email) : [])}
                />
              </TableHead>
              <TableHead className={TH}>
                <span className="inline-flex items-center gap-1.25">
                  Pessoa
                  <FiltroDeColuna
                    tipo="lista"
                    rotulo="Pessoa"
                    opcoes={equipe.map((p) => p.nome)}
                    valor={filtros.pessoa}
                    onAlterar={(v) => alterarFiltro("pessoa", v)}
                  />
                </span>
              </TableHead>
              <TableHead className={TH}>
                <span className="inline-flex items-center gap-1.25">
                  Função
                  <FiltroDeColuna
                    tipo="lista"
                    rotulo="Função"
                    opcoes={ORDEM_FUNCOES.map((f) => FUNCOES[f].rotulo)}
                    valor={filtros.funcao}
                    onAlterar={(v) => alterarFiltro("funcao", v)}
                  />
                </span>
              </TableHead>
              <TableHead className={TH}>
                <span className="inline-flex items-center gap-1.25">
                  Status
                  <FiltroDeColuna
                    tipo="lista"
                    rotulo="Status"
                    opcoes={[ROTULO_STATUS.ativo, ROTULO_STATUS.convidado]}
                    valor={filtros.status}
                    onAlterar={(v) => alterarFiltro("status", v)}
                  />
                </span>
              </TableHead>
              <TableHead className={TH}>
                <span className="inline-flex items-center gap-1.25">
                  Último acesso
                  <FiltroDeColuna
                    tipo="data"
                    rotulo="Último acesso"
                    valor={filtros.ultimo}
                    onAlterar={(v) => alterarFiltro("ultimo", v)}
                  />
                </span>
              </TableHead>
              <TableHead className={cn(TH, "text-right")}>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {linhas.length ? (
              linhas.map((p) => {
                const marcado = selecionadosVisiveis.includes(p.email)
                return (
                  <TableRow key={p.email} data-state={marcado ? "selected" : undefined} className="hover:bg-muted/40">
                    <TableCell className={TD}>
                      <Checkbox
                        aria-label={`Selecionar ${p.nome}`}
                        checked={marcado}
                        onCheckedChange={(c) =>
                          setSelecionados(
                            c === true
                              ? [...selecionadosVisiveis, p.email]
                              : selecionadosVisiveis.filter((e) => e !== p.email)
                          )
                        }
                      />
                    </TableCell>
                    <TableCell className={TD}>
                      <div className="font-semibold">{p.nome}</div>
                      <div className="text-[13px] text-muted-foreground">{p.email}</div>
                    </TableCell>
                    <TableCell className={TD}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            title="Trocar função"
                            aria-label={`Trocar função de ${p.nome}: ${FUNCOES[p.funcao].rotulo}`}
                            className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&>span]:transition-colors hover:[&>span]:bg-foreground/10"
                          >
                            <PilulaDeFuncao funcao={p.funcao} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-72.5 p-1.25">
                          <DropdownMenuRadioGroup value={p.funcao} onValueChange={(v) => trocarFuncao(p, v as Funcao)}>
                            {ORDEM_FUNCOES.map((f) => (
                              <DropdownMenuRadioItem key={f} value={f} className="items-start py-2 pl-2.25">
                                <ConteudoDaFuncao funcao={f} />
                              </DropdownMenuRadioItem>
                            ))}
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className={TD}>
                      <Badge
                        variant={p.status === "convidado" ? "warning" : "success"}
                        className="h-auto px-2.25 py-0.5"
                      >
                        {ROTULO_STATUS[p.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className={cn(TD, "text-muted-foreground")}>
                      {primeiraMaiuscula(p.ultimoAcesso)}
                    </TableCell>
                    <TableCell className={cn(TD, "text-right")}>
                      <div className="-mr-1.5 inline-flex">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="size-7 text-muted-foreground"
                              aria-label={`Resetar senha de ${p.nome}`}
                              onClick={() => resetarSenha(p)}
                            >
                              <LockIcon />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Resetar senha</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              aria-label={`Remover ${p.nome}`}
                              onClick={() => remover(p)}
                            >
                              <Trash2Icon />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Remover</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="p-0">
                  <Empty className="px-6 py-14">
                    <EmptyHeader>
                      <EmptyMedia variant="icon" className="text-muted-foreground">
                        <SearchIcon />
                      </EmptyMedia>
                      <EmptyTitle className="text-[15px] font-semibold">Nenhuma pessoa encontrada</EmptyTitle>
                      <EmptyDescription className="text-[13.5px]">Ajuste a busca ou a aba de função.</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ActionBar open={ativa && n > 0} aria-label="Ações em lote">
        <ActionBarLabel>{plural(n, "pessoa selecionada", "pessoas selecionadas")}</ActionBarLabel>
        <ActionBarSeparator />
        <ActionBarGroup>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ActionBarButton>Mudar função</ActionBarButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-72.5 p-1.25">
              <DropdownMenuGroup>
                {ORDEM_FUNCOES.map((f) => (
                  <DropdownMenuItem key={f} className="items-start py-2 pl-2.25" onSelect={() => mudarFuncaoEmLote(f)}>
                    <ConteudoDaFuncao funcao={f} />
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <ActionBarButton onClick={resetarSenhaEmLote}>Resetar senha</ActionBarButton>
          <ActionBarButton onClick={removerEmLote}>Remover</ActionBarButton>
        </ActionBarGroup>
        <ActionBarSeparator />
        <ActionBarClose onClick={() => setSelecionados([])} />
      </ActionBar>

      <Confirmacao pedido={confirmacao} onFechar={() => setConfirmacao(null)} />
    </section>
  )
}
