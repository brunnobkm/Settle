// Peças de anexo da tela: linha de arquivo (ícone, nome, tamanho e ações
// visualizar/baixar), seção "Anexos" do card e o menu "+N".

import type { ReactNode } from "react"
import { DownloadIcon, EyeIcon, FileIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Attachment,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import { Button } from "@/components/ui/button"
import { NotificationsCenterItemFooter } from "@/components/ui/notifications-center"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import type { Anexo } from "./dados"

/** Botão só com ícone, com nome acessível e dica. */
export function BotaoDeIcone({
  label,
  dica = label,
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button> & { label: string; dica?: string; "data-nao-prototipado"?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="icon-sm" aria-label={label} className={cn("size-7", className)} {...props}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{dica}</TooltipContent>
    </Tooltip>
  )
}

/**
 * Arquivo: ícone, nome, tamanho e ações.
 * - chip: com borda, divide a largura com os vizinhos (card)
 * - linha: com borda, ocupa a largura toda (modal)
 * - menu: sem borda, para a lista do menu "+N"
 */
export function LinhaDeAnexo({
  anexo,
  forma = "linha",
  onVisualizar,
}: {
  anexo: Anexo
  forma?: "chip" | "linha" | "menu"
  onVisualizar: () => void
}) {
  return (
    <Attachment
      className={cn(
        "w-auto min-w-0 gap-2 rounded-lg p-2 has-data-[slot=attachment-content]:p-2",
        forma === "chip" && "flex-1 basis-0",
        forma === "linha" && "w-full",
        forma === "menu" && "w-full border-0 bg-transparent p-1.5 hover:bg-muted/60 has-data-[slot=attachment-content]:p-1.5"
      )}
    >
      <AttachmentMedia aria-hidden className="w-9 bg-primary/10 text-primary">
        <FileIcon />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle className="text-sm leading-5 font-normal" title={anexo.nome}>
          {anexo.nome}
        </AttachmentTitle>
        <AttachmentDescription className="text-xs leading-4">{anexo.tamanho}</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions className="gap-2">
        <BotaoDeIcone
          label={`Visualizar ${anexo.nome}`}
          dica="Visualizar"
          onClick={(e) => {
            e.stopPropagation()
            onVisualizar()
          }}
        >
          <EyeIcon />
        </BotaoDeIcone>
        <BotaoDeIcone label={`Baixar ${anexo.nome}`} dica="Baixar" data-nao-prototipado>
          <DownloadIcon />
        </BotaoDeIcone>
      </AttachmentActions>
    </Attachment>
  )
}

const MAX_VISIVEIS = 3

/** Seção "Anexos" do card: até 3 chips lado a lado e "+N" com os demais num menu. */
export function AnexosDoCard({ anexos, onVisualizar }: { anexos: Anexo[]; onVisualizar: (indice: number) => void }) {
  const visiveis = anexos.slice(0, MAX_VISIVEIS)
  const resto = anexos.slice(MAX_VISIVEIS)

  return (
    <NotificationsCenterItemFooter>
      <p className="mb-2 text-xs font-bold tracking-[.04em] text-muted-foreground">Anexos</p>
      <div className="flex items-stretch gap-2">
        {visiveis.map((anexo, i) => (
          <LinhaDeAnexo key={anexo.nome} anexo={anexo} forma="chip" onVisualizar={() => onVisualizar(i)} />
        ))}
        {resto.length > 0 && <MaisAnexos anexos={resto} deslocamento={MAX_VISIVEIS} onVisualizar={onVisualizar} />}
      </div>
    </NotificationsCenterItemFooter>
  )
}

function MaisAnexos({
  anexos,
  deslocamento,
  onVisualizar,
}: {
  anexos: Anexo[]
  deslocamento: number
  onVisualizar: (indice: number) => void
}) {
  const n = anexos.length
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          aria-label={`Ver mais ${n} ${n === 1 ? "anexo" : "anexos"}`}
          title={`Ver mais ${n} anexo(s)`}
          className="h-auto shrink-0 self-stretch bg-foreground/8 px-3.5 text-[13px] font-semibold hover:bg-foreground/14"
          onClick={(e) => e.stopPropagation()}
        >
          +{n}
        </Button>
      </PopoverTrigger>
      {/* o conteúdo vai para um portal, mas o clique ainda sobe pela árvore do React até o card */}
      <PopoverContent align="end" className="w-85 max-w-[86vw] gap-0 rounded-xl p-1.5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-1 flex items-center justify-between gap-2 border-b px-1.5 pt-1 pb-2">
          <span className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Arquivos da Licitação</span>
          <Button variant="ghost" size="xs" className="text-primary hover:text-primary" title="Baixar todos os anexos" data-nao-prototipado>
            <DownloadIcon data-icon="inline-start" />
            Baixar todos
          </Button>
        </div>
        <div className="flex max-h-65 flex-col gap-0.5 overflow-y-auto">
          {anexos.map((anexo, i) => (
            <LinhaDeAnexo key={anexo.nome} anexo={anexo} forma="menu" onVisualizar={() => onVisualizar(i + deslocamento)} />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

/** Lista vertical de arquivos (modal). */
export function ListaDeAnexos({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-2", className)}>{children}</div>
}
