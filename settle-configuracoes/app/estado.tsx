// Estado da área de Configurações (compartilhado entre as páginas) e a confirmação genérica.

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import {
  ABAS,
  AUDITORIA,
  CAMPOS,
  EMAIL_ASSUNTO,
  EMAIL_CORPO,
  ETAPAS,
  MOTIVOS,
  agora,
  type Aba,
  type Campo,
  type Etapa,
  type Motivo,
  type Papel,
  type RegistroAuditoria,
  type TelaAba,
  type TipoMotivo,
  type VazioEmail,
} from "./dados"

type Atualizar<T> = (valor: T | ((anterior: T) => T)) => void

export type PedidoDeConfirmacao = {
  titulo: string
  corpo: ReactNode
  acao: string
  perigo?: boolean
  ok: () => void
}

type Estado = {
  papel: Papel
  setPapel: Atualizar<Papel>
  isAdmin: boolean

  etapas: Etapa[]
  setEtapas: Atualizar<Etapa[]>

  motivos: Motivo[]
  setMotivos: Atualizar<Motivo[]>
  motivoTab: TipoMotivo
  setMotivoTab: Atualizar<TipoMotivo>
  unificar: boolean
  setUnificar: Atualizar<boolean>
  exigirMotivo: boolean
  setExigirMotivo: Atualizar<boolean>

  abas: Record<TelaAba, Aba[]>
  setAbas: Atualizar<Record<TelaAba, Aba[]>>
  abaTela: TelaAba
  setAbaTela: Atualizar<TelaAba>
  abaPrev: Partial<Record<TelaAba, string>>
  setAbaPrev: Atualizar<Partial<Record<TelaAba, string>>>

  campos: Campo[]
  setCampos: Atualizar<Campo[]>
  maxItens: number
  setMaxItens: Atualizar<number>
  /** Licitação de exemplo das pré-visualizações (card e e-mail). */
  lic: number
  setLic: Atualizar<number>

  email: { assunto: string; corpo: string; vazio: VazioEmail; personalizado: boolean }
  setEmail: Atualizar<Estado["email"]>

  audit: RegistroAuditoria[]
  /** Registra uma alteração na Auditoria (quem: o usuário da sessão). */
  auditar: (area: string, txt: string) => void
  /** Tira o último registro (desfazer). */
  desauditar: () => void

  confirmar: (pedido: PedidoDeConfirmacao) => void
}

const Contexto = createContext<Estado | null>(null)

export function useConfig() {
  const estado = useContext(Contexto)
  if (!estado) throw new Error("useConfig fora de EstadoProvider")
  return estado
}

export function EstadoProvider({ children }: { children: ReactNode }) {
  const [papel, setPapel] = useState<Papel>("admin")
  const [etapas, setEtapas] = useState(ETAPAS)
  const [motivos, setMotivos] = useState(MOTIVOS)
  const [motivoTab, setMotivoTab] = useState<TipoMotivo>("descarte")
  const [unificar, setUnificar] = useState(true)
  const [exigirMotivo, setExigirMotivo] = useState(true)
  const [abas, setAbas] = useState(ABAS)
  const [abaTela, setAbaTela] = useState<TelaAba>("recomendadas")
  const [abaPrev, setAbaPrev] = useState<Partial<Record<TelaAba, string>>>({})
  const [campos, setCampos] = useState(CAMPOS)
  const [maxItens, setMaxItens] = useState(5)
  const [lic, setLic] = useState(0)
  const [email, setEmail] = useState<Estado["email"]>({
    assunto: EMAIL_ASSUNTO,
    corpo: EMAIL_CORPO,
    vazio: "texto",
    personalizado: false,
  })
  const [audit, setAudit] = useState(AUDITORIA)
  const [pedido, setPedido] = useState<PedidoDeConfirmacao | null>(null)

  const auditar = useCallback((area: string, txt: string) => {
    setAudit((a) => [{ quando: agora(), quem: "Brunno Krier", area, txt }, ...a])
  }, [])
  const desauditar = useCallback(() => setAudit((a) => a.slice(1)), [])

  const valor = useMemo<Estado>(
    () => ({
      papel,
      setPapel,
      isAdmin: papel === "admin",
      etapas,
      setEtapas,
      motivos,
      setMotivos,
      motivoTab,
      setMotivoTab,
      unificar,
      setUnificar,
      exigirMotivo,
      setExigirMotivo,
      abas,
      setAbas,
      abaTela,
      setAbaTela,
      abaPrev,
      setAbaPrev,
      campos,
      setCampos,
      maxItens,
      setMaxItens,
      lic,
      setLic,
      email,
      setEmail,
      audit,
      auditar,
      desauditar,
      confirmar: setPedido,
    }),
    [papel, etapas, motivos, motivoTab, unificar, exigirMotivo, abas, abaTela, abaPrev, campos, maxItens, lic, email, audit, auditar, desauditar]
  )

  return (
    <Contexto.Provider value={valor}>
      {children}
      <Confirmacao pedido={pedido} onFechar={() => setPedido(null)} />
    </Contexto.Provider>
  )
}

/** Diálogo de confirmação: título, texto e a ação (vermelha quando é de risco). */
export function Confirmacao({
  pedido,
  onFechar,
  children,
}: {
  pedido: PedidoDeConfirmacao | null
  onFechar: () => void
  children?: ReactNode
}) {
  // mantém o último pedido na tela durante a animação de saída
  const [visivel, setVisivel] = useState(pedido)
  if (pedido && pedido !== visivel) setVisivel(pedido)

  return (
    <AlertDialog open={pedido !== null} onOpenChange={(aberto) => !aberto && onFechar()}>
      <AlertDialogContent className="sm:max-w-110">
        {visivel && (
          <>
            <AlertDialogHeader className="place-items-start gap-2 text-left">
              <AlertDialogTitle className="text-[17px] font-semibold">{visivel.titulo}</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="flex flex-col gap-1.5 text-sm leading-[21px] text-muted-foreground">{visivel.corpo}</div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            {children}
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                variant={visivel.perigo ? "destructive" : "default"}
                onClick={() => {
                  onFechar()
                  visivel.ok()
                }}
              >
                {visivel.acao}
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
