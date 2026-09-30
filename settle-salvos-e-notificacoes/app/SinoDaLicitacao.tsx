// Sino da licitação (no card e, na plataforma, no header da licitação aberta).
// Desligado: o clique abre a configuração (quais atualizações avisar).
// Ligado: o clique abre as atualizações daquela licitação, com Configurar e Desativar.
// Abre ancorado no botão clicado.

import { useEffect, useRef, useState } from "react"
import { BellOffIcon, SettingsIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"

import {
  ROTULO_CURTO,
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
  onVerNaCentral,
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
  onVerNaCentral: () => void
}) {
  const ancoraRef = useRef<HTMLElement | null>(null)
  ancoraRef.current = ancora

  const ligado = !!licitacao?.alertas.length
  const [configurando, setConfigurando] = useState(false)
  const [tipos, setTipos] = useState<TipoAtualizacao[]>(TODOS_OS_TIPOS)

  useEffect(() => {
    if (!licitacao || !aberto) return
    setConfigurando(!licitacao.alertas.length) // primeiro clique: configurar
    setTipos(licitacao.alertas.length ? licitacao.alertas : TODOS_OS_TIPOS)
  }, [aberto, licitacao?.edital]) // eslint-disable-line react-hooks/exhaustive-deps

  const fechar = () => onFechar(ligado && !configurando ? notificacoes.filter((n) => !n.lida).map((n) => n.id) : [])

  return (
    <Popover open={aberto && !!licitacao} onOpenChange={(abrir) => !abrir && fechar()}>
      <PopoverAnchor virtualRef={ancoraRef as React.RefObject<HTMLElement>} />
      <PopoverContent align="end" className="w-96 gap-0 p-0">
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
              onVerNaCentral={onVerNaCentral}
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
      <div className="border-b px-4 pt-3.5 pb-3">
        <h2 className="text-sm font-semibold">{ligado ? "Configurar notificações" : "Receber notificações desta licitação?"}</h2>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Edital {edital}. Avisamos aqui no sino e na central de notificações.
        </p>
      </div>

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
        <Button type="button" variant="outline" size="sm" onClick={onCancelar}>
          {ligado ? "Voltar" : "Agora não"}
        </Button>
        <Button type="submit" size="sm" disabled={semTipo}>
          {ligado ? "Salvar" : "Ativar notificações"}
        </Button>
      </div>
    </form>
  )
}

function ListaDaLicitacao({
  licitacao: l,
  notificacoes,
  onConfigurar,
  onDesativar,
  onVerNaCentral,
}: {
  licitacao: Licitacao
  notificacoes: Notificacao[]
  onConfigurar: () => void
  onDesativar: () => void
  onVerNaCentral: () => void
}) {
  const acompanha = TIPOS_DE_ATUALIZACAO.filter((t) => l.alertas.includes(t.chave))
  return (
    <div>
      <div className="flex items-start gap-2 border-b px-4 pt-3.5 pb-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold">Atualizações do edital {l.edital}</h2>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            Avisando sobre:{" "}
            {acompanha.length === TODOS_OS_TIPOS.length ? "todas" : acompanha.map((t) => ROTULO_CURTO[t.chave]).join(", ")}
          </p>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Configurar notificações" onClick={onConfigurar}>
          <SettingsIcon />
        </Button>
      </div>

      {notificacoes.length ? (
        <ul className="max-h-90 divide-y overflow-y-auto">
          {notificacoes.map((n) => (
            <li key={n.id} className="px-4 py-2.5">
              <div className="flex items-center gap-2">
                {!n.lida && (
                  <span className="size-2 shrink-0 rounded-full bg-destructive" title="Não lida">
                    <span className="sr-only">Não lida</span>
                  </span>
                )}
                <Badge
                  variant={n.tipo === "retificacao" || n.tipo === "status" ? "warning" : "secondary"}
                  className="h-5 rounded-md text-[11px]"
                >
                  {ROTULO_CURTO[n.tipo]}
                </Badge>
                <span className="ml-auto text-xs text-muted-foreground tabular-nums">{n.quando}</span>
              </div>
              <p className="mt-1 text-[13px] font-medium">{n.titulo}</p>
              {n.mudanca && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {n.mudanca.campo}: <span className="line-through">{n.mudanca.de}</span> →{" "}
                  <span className="font-medium text-foreground">{n.mudanca.para}</span>
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-4 py-6 text-center text-[13px] text-muted-foreground">
          Nenhuma atualização ainda. Você será avisado quando o portal publicar mudanças.
        </p>
      )}

      <div className="flex items-center gap-2 border-t px-4 py-2.5">
        <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground" onClick={onDesativar}>
          <BellOffIcon data-icon="inline-start" />
          Desativar
        </Button>
        <Button variant="outline" size="sm" className="ml-auto shadow-none" onClick={onVerNaCentral}>
          Ver na central
        </Button>
      </div>
    </div>
  )
}
