// Sino da licitação (no card e, na plataforma, no header da licitação aberta).
// Desligado: o clique abre a configuração (quais atualizações avisar).
// Ligado: o clique abre as notificações daquela licitação; no topo, Configurar e Desativar
// (atalho). Configurar troca o conteúdo, com Voltar à esquerda do título.
// Abre ancorado no botão clicado.

import { useEffect, useRef, useState } from "react"
import { ArrowLeftIcon, BellOffIcon, SettingsIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { ListaDeNotificacoes, type EstadoDaLista } from "./ListaDeNotificacoes"
import {
  TIPOS_DE_ATUALIZACAO,
  TODOS_OS_TIPOS,
  type Licitacao,
  type Notificacao,
  type TipoAtualizacao,
} from "./dados"

export function SinoDaLicitacao({
  aberto,
  licitacao,
  ancora,
  notificacoes,
  onFechar,
  onAtivar,
  onDesativar,
  estado,
  onLida,
}: {
  aberto: boolean
  /** Continua preenchida depois de fechar, para a animação de saída. */
  licitacao: Licitacao | null
  ancora: HTMLElement | null
  /** Notificações desta licitação. */
  notificacoes: Notificacao[]
  /** Ao fechar a lista, as exibidas passam a lidas. */
  onFechar: (lidas: string[]) => void
  onAtivar: (tipos: TipoAtualizacao[]) => void
  onDesativar: () => void
  estado: EstadoDaLista
  onLida: (id: string, lida: boolean) => void
}) {
  const ancoraRef = useRef<HTMLElement | null>(null)
  ancoraRef.current = ancora

  const ligado = !!licitacao?.alertas.length
  const [configurando, setConfigurando] = useState(false)
  const [tipos, setTipos] = useState<TipoAtualizacao[]>(TODOS_OS_TIPOS)
  const [carregando, setCarregando] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  function carregar() {
    window.clearTimeout(timer.current)
    setCarregando(true)
    timer.current = window.setTimeout(() => setCarregando(false), 450)
  }

  useEffect(() => {
    if (!licitacao || !aberto) return
    setConfigurando(!licitacao.alertas.length) // primeiro clique: configurar
    if (licitacao.alertas.length) carregar()
    setTipos(licitacao.alertas.length ? licitacao.alertas : TODOS_OS_TIPOS)
  }, [aberto, licitacao?.edital]) // eslint-disable-line react-hooks/exhaustive-deps

  const fechar = () => onFechar(ligado && !configurando ? notificacoes.filter((n) => !n.lida).map((n) => n.id) : [])

  return (
    <Popover open={aberto && !!licitacao} onOpenChange={(abrir) => !abrir && fechar()}>
      <PopoverAnchor virtualRef={ancoraRef as React.RefObject<HTMLElement>} />
      <PopoverContent align="end" className="w-100 gap-0 p-0">
        {licitacao &&
          (configurando ? (
            <Configuracao
              edital={licitacao.edital}
              ligado={ligado}
              tipos={tipos}
              onTipos={setTipos}
              onCancelar={() => (ligado ? setConfigurando(false) : fechar())}
              onAtivar={() => {
                onAtivar(tipos)
                setConfigurando(false)
              }}
            />
          ) : (
            <ListaDaLicitacao
              licitacao={licitacao}
              notificacoes={notificacoes}
              onConfigurar={() => setConfigurando(true)}
              onDesativar={onDesativar}
              carregando={carregando}
              estado={estado}
              onTentarNovamente={carregar}
              onLida={onLida}
            />
          ))}
      </PopoverContent>
    </Popover>
  )
}

function Configuracao({
  edital,
  ligado,
  tipos,
  onTipos,
  onCancelar,
  onAtivar,
}: {
  edital: string
  ligado: boolean
  tipos: TipoAtualizacao[]
  onTipos: (t: TipoAtualizacao[]) => void
  onCancelar: () => void
  onAtivar: () => void
}) {
  const semTipo = !tipos.length
  const todos = tipos.length === TODOS_OS_TIPOS.length
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!semTipo) onAtivar()
      }}
    >
      {ligado ? (
        <div className="flex items-center gap-1.5 border-b px-2 py-2">
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Voltar" onClick={onCancelar}>
            <ArrowLeftIcon />
          </Button>
          <h2 className="text-sm font-semibold">Configurar notificações</h2>
        </div>
      ) : (
        <div className="border-b px-4 pt-3.5 pb-3">
          <h2 className="text-sm font-semibold">Receber notificações desta licitação?</h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Edital {edital}. Avisamos aqui no sino e na central de notificações.
          </p>
        </div>
      )}

      <fieldset className="px-4 pt-2.5 pb-2">
        <div className="mb-1 flex items-center justify-between">
          <legend className="text-xs font-semibold text-muted-foreground">Avisar sobre</legend>
          <button
            type="button"
            className="rounded text-xs font-medium text-primary hover:underline"
            onClick={() => onTipos(todos ? [] : TODOS_OS_TIPOS)}
          >
            {todos ? "Desmarcar todas" : "Marcar todas"}
          </button>
        </div>
        {TIPOS_DE_ATUALIZACAO.map((t) => {
          const id = `alerta-${t.chave}`
          return (
            <div key={t.chave} className="flex items-start gap-2.5 py-1.5">
              <Checkbox
                id={id}
                className="mt-0.5"
                checked={tipos.includes(t.chave)}
                onCheckedChange={(v) =>
                  onTipos(v === true ? TODOS_OS_TIPOS.filter((c) => c === t.chave || tipos.includes(c)) : tipos.filter((c) => c !== t.chave))
                }
              />
              <Label htmlFor={id} className="flex-col items-start gap-0 font-normal">
                <span className="text-[13px] font-medium">{t.rotulo}</span>
                <span className="text-xs text-muted-foreground">{t.descricao}</span>
              </Label>
            </div>
          )
        })}
        {semTipo && (
          <p role="alert" className="pb-1 text-xs text-destructive">
            Marque ao menos um tipo de atualização.
          </p>
        )}
      </fieldset>

      <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
        {!ligado && (
          <Button type="button" variant="outline" size="sm" onClick={onCancelar}>
            Agora não
          </Button>
        )}
        <Button type="submit" size="sm" disabled={semTipo}>
          {ligado ? "Salvar" : "Ativar notificações"}
        </Button>
      </div>
    </form>
  )
}

function ListaDaLicitacao({
  licitacao,
  notificacoes,
  onConfigurar,
  onDesativar,
  carregando,
  estado,
  onTentarNovamente,
  onLida,
}: {
  licitacao: Licitacao
  notificacoes: Notificacao[]
  onConfigurar: () => void
  onDesativar: () => void
  carregando: boolean
  estado: EstadoDaLista
  onTentarNovamente: () => void
  onLida: (id: string, lida: boolean) => void
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1 border-b py-2 pr-2 pl-4">
        <h2 className="flex-1 text-sm font-semibold">Notificações do edital</h2>
        <AcaoComDica dica="Configurar notificações" onClick={onConfigurar}>
          <SettingsIcon />
        </AcaoComDica>
        <AcaoComDica dica="Desativar notificações" onClick={onDesativar}>
          <BellOffIcon />
        </AcaoComDica>
      </div>
      <ListaDeNotificacoes
        compacta
        notificacoes={notificacoes}
        licitacoes={[licitacao]}
        carregando={carregando}
        estado={estado}
        vazio="Nenhuma notificação ainda. Você será avisado quando o portal publicar mudanças."
        onTentarNovamente={onTentarNovamente}
        onLida={onLida}
      />
    </div>
  )
}

function AcaoComDica({ dica, onClick, children }: { dica: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={dica} className="text-muted-foreground" onClick={onClick}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{dica}</TooltipContent>
    </Tooltip>
  )
}
