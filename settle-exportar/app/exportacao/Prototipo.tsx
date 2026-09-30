// Peças só do protótipo: chave Hoje x Proposta, opções das decisões em aberto e o
// menu da sidebar com as telas deste projeto (Recomendadas e Em andamento).

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import {
  BookmarkIcon,
  ChartColumnIcon,
  Columns3Icon,
  FileSearchIcon,
  FileXIcon,
  HomeIcon,
  Settings2Icon,
  SquareCheckIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { AppShellGroup } from "@/components/ui/app-shell"

import { useDecisoes, type EtapaVia, type TelaExport, type Versao } from "./nucleo"

export function menuDoProjeto(ativa: TelaExport, versao: Versao): AppShellGroup[] {
  const v = `?v=${versao}`
  return [
    {
      label: "Licitações",
      items: [
        { label: "Recomendadas", icon: SquareCheckIcon, href: `../recomendadas/${v}`, active: ativa === "recomendadas" },
        { label: "Salvo para depois", icon: BookmarkIcon, href: "#", "data-nao-prototipado": true },
        { label: "Em andamento", icon: Columns3Icon, href: `../kanban/${v}`, active: ativa === "kanban" },
        { label: "Descartadas", icon: FileXIcon, href: "#", "data-nao-prototipado": true },
        { label: "Dashboards", icon: ChartColumnIcon, href: "#", "data-nao-prototipado": true },
        { label: "Explorar licitações", icon: FileSearchIcon, href: "#", "data-nao-prototipado": true },
      ],
    },
  ]
}

function Linha({ id, rotulo, ajuda, checked, onChange }: { id: string; rotulo: string; ajuda?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <Label htmlFor={id} className="flex flex-col items-start gap-0.5 font-normal">
        <span className="text-[13px] font-medium">{rotulo}</span>
        {ajuda && <span className="text-xs text-muted-foreground">{ajuda}</span>}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

/** Chave Hoje x Proposta + opções do protótipo, fixa no topo à direita. */
export function PainelDoPrototipo({ tela, versao, onVersao }: { tela: TelaExport; versao: Versao; onVersao: (v: Versao) => void }) {
  const [decisoes, alterar] = useDecisoes()
  const [aberto, setAberto] = useState(false)

  // mostra ao testador qual versão está na tela
  useEffect(() => {
    document.title = `${versao === "hoje" ? "Hoje" : "Proposta"} · ${tela === "kanban" ? "Em andamento" : "Recomendadas"} · Exportar`
  }, [versao, tela])

  // portal no body: a área de conteúdo da casca isola o empilhamento e o topo ficaria por cima
  return createPortal(
    <div className="fixed top-3 right-4 z-[60] flex items-center gap-1.5 rounded-xl border bg-background p-1 shadow-md">
      <Button asChild variant="ghost" size="icon-sm" aria-label="Início do protótipo" title="Início do protótipo">
        <a href="../">
          <HomeIcon />
        </a>
      </Button>
      <ToggleGroup
        type="single"
        value={versao}
        onValueChange={(v) => v && onVersao(v as Versao)}
        aria-label="Versão do protótipo"
        className="rounded-lg bg-muted p-0.5"
      >
        <ToggleGroupItem value="hoje" className="h-7 px-3 text-[13px] data-[state=on]:bg-foreground data-[state=on]:text-background">
          Hoje
        </ToggleGroupItem>
        <ToggleGroupItem value="proposta" className="h-7 px-3 text-[13px] data-[state=on]:bg-foreground data-[state=on]:text-background">
          Proposta
        </ToggleGroupItem>
      </ToggleGroup>
      <Popover open={aberto} onOpenChange={setAberto}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Opções do protótipo" title="Opções do protótipo">
            <Settings2Icon />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="flex w-80 flex-col gap-4">
          <p className="text-sm font-semibold">Opções do protótipo</p>

          {tela === "kanban" && (
            <div className="flex flex-col gap-2">
              <p className="text-[13px] font-medium">
                Decisão a) Onde fica “Exportar esta etapa”
                {versao === "hoje" && <span className="font-normal text-muted-foreground"> (vale na Proposta)</span>}
              </p>
              <RadioGroup value={decisoes.etapaVia} onValueChange={(v) => alterar({ etapaVia: v as EtapaVia })} className="gap-1.5">
                {(
                  [
                    ["ambos", "Nos dois lugares"],
                    ["coluna", "Só no menu “…” da coluna"],
                    ["geral", "Só no botão Exportar geral"],
                  ] as const
                ).map(([valor, rotulo]) => (
                  <div key={valor} className="flex items-center gap-2">
                    <RadioGroupItem value={valor} id={`via-${valor}`} />
                    <Label htmlFor={`via-${valor}`} className="text-[13px] font-normal">
                      {rotulo}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {tela === "recomendadas" && (
            <Linha
              id="etapa-no-arquivo"
              rotulo="Decisão b) Coluna “Etapa atual” no arquivo"
              ajuda="Inclui no arquivo de Recomendadas em que etapa cada licitação está."
              checked={decisoes.etapaNoArquivoRecomendadas}
              onChange={(v) => alterar({ etapaNoArquivoRecomendadas: v })}
            />
          )}

          <Linha
            id="simular-falha"
            rotulo="Simular falha na próxima exportação"
            ajuda="Para ver a mensagem de erro e o “Tentar de novo”."
            checked={decisoes.simularFalha}
            onChange={(v) => alterar({ simularFalha: v })}
          />
          <Linha
            id="tempos-curtos"
            rotulo="Encurtar as esperas"
            ajuda="O “Selecionar tudo” de hoje leva cerca de 40 s; com isto, 6 s."
            checked={decisoes.temposCurtos}
            onChange={(v) => alterar({ temposCurtos: v })}
          />
          <p className="border-t pt-3 text-xs text-muted-foreground">
            Os eventos de métricas aparecem no console do navegador como “[Amplitude]”.
          </p>
        </PopoverContent>
      </Popover>
    </div>,
    document.body
  )
}
