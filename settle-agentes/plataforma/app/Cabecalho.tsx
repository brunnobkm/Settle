// Barra superior. Título e subtítulo moram no próprio header: a saudação (ou a trilha,
// dentro da licitação) com o selo da atualização embaixo. Na licitação, a barra é da
// licitação: trilha e ações no lugar da saudação.

import { FileTextIcon, FolderIcon, LinkIcon, MessageSquareIcon, Share2Icon } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  LicitacaoCardAvatars,
  LicitacaoCardIconAction,
  LicitacaoCardStatusButton,
} from "@/components/ui/licitacao-card"
import { Separator } from "@/components/ui/separator"
import { SAUDACAO } from "@/settle/navegacao"

import { naoSimulado } from "./comum"
import { useSim } from "./estado"
import { BotaoDaFuncionalidade } from "./Funcionalidade"
import { TIME } from "./Licitacoes"
import { ATUALIZACAO } from "./versao"

const ICONES_DA_LICITACAO = [
  { label: "Copiar link da licitação", icon: <LinkIcon /> },
  { label: "Compartilhar", icon: <Share2Icon /> },
  { label: "Documentos da licitação", icon: <FileTextIcon /> },
  { label: "Pastas", icon: <FolderIcon /> },
  { label: "Comentários", icon: <MessageSquareIcon /> },
]

export function Cabecalho() {
  const { area, licFoco: l, aberta, irPara, enviarParaAnalise } = useSim()
  const naLic = area === "workspace"
  const i = aberta ?? 0

  return (
    <>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        {naLic ? (
          <Breadcrumb aria-label="Trilha">
            <BreadcrumbList className="flex-nowrap overflow-hidden text-sm whitespace-nowrap">
              {/* a trilha é o caminho de volta para a lista */}
              <BreadcrumbItem>
                <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); irPara("lics") }}>
                  Licitações
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); irPara("lics") }}>
                  Recomendadas
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="truncate font-semibold">PE {l.n}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        ) : (
          <span className="text-[15px] leading-5 font-semibold">{SAUDACAO}</span>
        )}
        <p className="truncate text-xs text-muted-foreground">Atualização número {ATUALIZACAO}</p>
      </div>

      {naLic && (
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {/* Enviada, a licitação não está mais em Recomendadas: ignorar e enviar são ações de lá. */}
          {!l.enviada && (
            <>
              <Button variant="outline" className="shadow-none" onClick={() => naoSimulado("Ignorar")}>
                Ignorar
              </Button>
              <Button onClick={() => enviarParaAnalise(i, true)}>Enviar para análise</Button>
            </>
          )}
          <LicitacaoCardStatusButton onClick={() => naoSimulado("Mudar o estado da licitação")}>
            Em disputa ou Homologação
          </LicitacaoCardStatusButton>
          <BotaoDaFuncionalidade k="checklist" i={i} />
          <BotaoDaFuncionalidade k="score" i={i} />
          <LicitacaoCardAvatars
            aria-label="Time nesta licitação"
            avatars={[...TIME, { initials: "BK", name: "Brunno Krier" }]}
            addProps={{ onClick: () => naoSimulado("Esta ação") }}
          />
          <Separator orientation="vertical" className="data-vertical:h-5.5 data-vertical:self-center" />
          {ICONES_DA_LICITACAO.map((a) => (
            <LicitacaoCardIconAction
              key={a.label}
              label={a.label}
              icon={a.icon}
              variant="ghost"
              className="size-8"
              onClick={() => naoSimulado("Esta ação")}
            />
          ))}
        </div>
      )}
    </>
  )
}
