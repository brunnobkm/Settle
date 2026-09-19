// Permissionamento e auditoria: console de administração com duas visões
// (Gerenciar equipe e Auditoria) e o painel "O que cada função faz".

import { useState, type MouseEvent } from "react"
import { DownloadIcon, FileCheckIcon, PlusIcon, SearchIcon, ShieldIcon, UsersIcon } from "lucide-react"

import { AppShell, type AppShellGroup } from "@/components/ui/app-shell"
import { Button } from "@/components/ui/button"
import { useNaoPrototipado } from "@/settle/nao-prototipado"
import { menuLicitacoes, USUARIO, WORKSPACE } from "@/settle/navegacao"

import { Auditoria, type ColunaAuditoria } from "./Auditoria"
import { avisar } from "./comum"
import {
  AUDITORIA,
  EQUIPE_INICIAL,
  areaDoRecurso,
  fraseDoEvento,
  passaData,
  passaLista,
  type ValorFiltro,
} from "./dados"
import { Equipe } from "./Equipe"
import { SheetConvite, SheetFuncoes } from "./Sheets"

type Tela = "equipe" | "auditoria"

const TITULOS: Record<Tela, string> = {
  equipe: "Gerenciar equipe",
  auditoria: "Auditoria",
}

const OPCOES_PESSOA = [...new Set(AUDITORIA.map((a) => a.pessoa))]
const OPCOES_EVENTO = [...new Set(AUDITORIA.map((a) => areaDoRecurso(a.recurso)))]

export default function App() {
  useNaoPrototipado()

  const [tela, setTela] = useState<Tela>("equipe")
  const [equipe, setEquipe] = useState(EQUIPE_INICIAL)
  const [conviteAberto, setConviteAberto] = useState(false)
  const [funcoesAberto, setFuncoesAberto] = useState(false)

  const [buscaAuditoriaAberta, setBuscaAuditoriaAberta] = useState(false)
  const [consultaAuditoria, setConsultaAuditoria] = useState("")
  const [filtrosAuditoria, setFiltrosAuditoria] = useState<Partial<Record<ColunaAuditoria, ValorFiltro>>>({})

  const q = consultaAuditoria.trim().toLowerCase()
  const registros = AUDITORIA.filter(
    (a) =>
      (!q ||
        a.pessoa.toLowerCase().includes(q) ||
        fraseDoEvento(a).toLowerCase().includes(q) ||
        a.recurso.toLowerCase().includes(q)) &&
      passaLista(filtrosAuditoria.pessoa, a.pessoa) &&
      passaLista(filtrosAuditoria.evento, areaDoRecurso(a.recurso)) &&
      passaData(filtrosAuditoria.data, a.ts.split(" ")[0])
  )

  function irPara(destino: Tela) {
    return (e: MouseEvent) => {
      e.preventDefault()
      setTela(destino)
    }
  }

  const grupos: AppShellGroup[] = [
    ...menuLicitacoes(),
    {
      label: "Administração",
      items: [
        {
          label: TITULOS.equipe,
          icon: UsersIcon,
          active: tela === "equipe",
          onClick: irPara("equipe"),
        },
        {
          label: TITULOS.auditoria,
          icon: FileCheckIcon,
          active: tela === "auditoria",
          onClick: irPara("auditoria"),
        },
      ],
    },
  ]

  function alternarBuscaAuditoria() {
    if (buscaAuditoriaAberta) setConsultaAuditoria("")
    setBuscaAuditoriaAberta(!buscaAuditoriaAberta)
  }

  function exportarAuditoria() {
    const n = registros.length
    avisar(`${n} ${n === 1 ? "registro de auditoria exportado" : "registros de auditoria exportados"} com sucesso!`)
  }

  return (
    <AppShell
      workspace={WORKSPACE}
      groups={grupos}
      user={USUARIO}
      header={
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <h1 className="min-w-0 truncate text-[15px] font-semibold">{TITULOS[tela]}</h1>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {tela === "equipe" ? (
              <>
                <Button variant="outline" className="px-3.5" onClick={() => setFuncoesAberto(true)}>
                  <ShieldIcon data-icon="inline-start" />
                  <span className="max-md:sr-only">O que cada função faz</span>
                </Button>
                <Button className="px-3.5" onClick={() => setConviteAberto(true)}>
                  <PlusIcon data-icon="inline-start" />
                  <span className="max-md:sr-only">Adicionar pessoa</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="px-3.5" onClick={exportarAuditoria}>
                  <DownloadIcon data-icon="inline-start" />
                  <span className="max-md:sr-only">Exportar</span>
                </Button>
                <Button
                  variant="outline"
                  className="px-3.5"
                  aria-pressed={buscaAuditoriaAberta}
                  onClick={alternarBuscaAuditoria}
                >
                  <SearchIcon data-icon="inline-start" className="text-muted-foreground" />
                  <span className="max-md:sr-only">Buscar</span>
                </Button>
              </>
            )}
          </div>
        </div>
      }
    >
      <div className="px-5.5 pt-4.5 pb-12">
        <Equipe equipe={equipe} onEquipeChange={setEquipe} ativa={tela === "equipe"} />
        <Auditoria
          ativa={tela === "auditoria"}
          registros={registros}
          equipe={equipe}
          opcoesPessoa={OPCOES_PESSOA}
          opcoesEvento={OPCOES_EVENTO}
          buscaAberta={buscaAuditoriaAberta}
          consulta={consultaAuditoria}
          onConsulta={setConsultaAuditoria}
          filtros={filtrosAuditoria}
          onFiltro={(coluna, valor) => setFiltrosAuditoria((f) => ({ ...f, [coluna]: valor }))}
        />
      </div>

      <SheetConvite
        aberto={conviteAberto}
        onAbertoChange={setConviteAberto}
        onConvidar={({ nome, email, funcao }) => {
          setEquipe((lista) => [
            ...lista,
            {
              nome,
              email,
              funcao,
              status: "convidado",
              ultimoAcesso: "Ainda não acessou",
              ultimoAcessoData: null,
            },
          ])
          setConviteAberto(false)
          avisar(`Convite enviado para ${email}`)
        }}
      />
      <SheetFuncoes aberto={funcoesAberto} onAbertoChange={setFuncoesAberto} />
    </AppShell>
  )
}
