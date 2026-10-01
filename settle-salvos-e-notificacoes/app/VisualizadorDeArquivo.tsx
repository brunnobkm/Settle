// Visualizador de arquivo em sheet lateral, o mesmo de settle-central-de-notificacoes
// ("Arquivos da licitação"): seletor do arquivo no topo, Baixar e Fechar, e a página do
// documento. Em produção o arquivo abre num modal com a mesma estrutura; aqui vira sheet.
// Fica no App (fora do sino e da central) para não fechar junto com o popover do sino.

import { createContext, useContext } from "react"
import { DownloadIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export type ArquivoAberto = { arquivos: string[]; indice: number; novo?: string }

/** Abre o visualizador: arquivos da licitação e qual mostrar. */
export const AbrirArquivoContext = createContext<(v: ArquivoAberto) => void>(() => {})
export const useAbrirArquivo = () => useContext(AbrirArquivoContext)

/** Arquivos da licitação para o seletor, com o documento clicado primeiro. */
export function arquivosDaLicitacao(edital: string, documento: string): ArquivoAberto {
  const numero = edital.replace("/", "-")
  const outros = [`Edital_${numero}.pdf`, `Termo_de_Referencia_${numero}.pdf`, `Anexo_I_Modelo_de_proposta.docx`]
  return { arquivos: [documento, ...outros.filter((a) => a !== documento)], indice: 0, novo: documento }
}

function Acao({ dica, children, ...props }: React.ComponentProps<typeof Button> & { dica: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={dica} className="text-foreground" {...props}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{dica}</TooltipContent>
    </Tooltip>
  )
}

export function VisualizadorDeArquivo({
  visualizacao,
  onIndice,
  onFechar,
}: {
  visualizacao: ArquivoAberto | null
  onIndice: (indice: number) => void
  onFechar: () => void
}) {
  const atual = visualizacao?.arquivos[visualizacao.indice]
  return (
    <Sheet open={!!visualizacao} onOpenChange={(aberto) => !aberto && onFechar()}>
      <SheetContent side="right" size="lg" showCloseButton={false} aria-describedby={undefined} className="gap-0 p-0">
        <SheetTitle className="sr-only">Arquivos da licitação</SheetTitle>
        {visualizacao && (
          <>
            <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4 py-1.5">
              <Select value={String(visualizacao.indice)} onValueChange={(v) => onIndice(Number(v))}>
                <SelectTrigger
                  aria-label="Selecionar arquivo"
                  className="h-9 w-full min-w-0 flex-1 rounded-lg border-0 bg-foreground/10 px-2 text-base font-semibold text-foreground shadow-none dark:bg-foreground/10 [&_svg:not([class*='text-'])]:text-foreground *:data-[slot=select-value]:block *:data-[slot=select-value]:truncate"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="start">
                  <SelectGroup>
                    {visualizacao.arquivos.map((arquivo, i) => (
                      <SelectItem key={arquivo} value={String(i)}>
                        {arquivo}
                        {arquivo === visualizacao.novo && <span className="ml-1.5 text-xs font-semibold text-primary">Novo</span>}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Acao dica="Baixar" data-nao-prototipado>
                <DownloadIcon />
              </Acao>
              <Acao dica="Fechar" onClick={onFechar}>
                <XIcon />
              </Acao>
            </div>

            {/* página do arquivo (mock): título do documento e linhas no lugar do conteúdo */}
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-muted/40 p-4">
              <div className="flex flex-1 flex-col gap-2.5 rounded-[14px] border bg-card p-6">
                <p className="mb-3 text-center text-sm font-semibold">{atual?.replace(/_/g, " ").replace(/\.\w+$/, "")}</p>
                {Array.from({ length: 22 }, (_, i) => (
                  <Skeleton aria-hidden key={i} className={cn("h-2.25 animate-none rounded-sm", i % 5 === 4 && "w-[58%]")} />
                ))}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
