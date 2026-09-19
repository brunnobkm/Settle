// Detalhe do card de licitação (fiel ao Figma): o card aberto, com o aviso de descarte,
// a etapa atual e todas as propriedades. Tela estática: as ações ainda não foram prototipadas.

import { useState } from "react"
import {
  BellIcon,
  ClockIcon,
  FileTextIcon,
  FolderIcon,
  LinkIcon,
  PencilIcon,
  RefreshCwIcon,
  Share2Icon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  LicitacaoCardActions,
  LicitacaoCardAvatars,
  LicitacaoCardContent,
  LicitacaoCardDescription,
  LicitacaoCardField,
  LicitacaoCardHeader,
  LicitacaoCardIconAction,
  LicitacaoCardIconActions,
  LicitacaoCardMeta,
  LicitacaoCardRoot,
  LicitacaoCardSegments,
  LicitacaoCardSelect,
  LicitacaoCardStatusButton,
  LicitacaoCardTitle,
  LicitacaoCardValue,
  type LicitacaoCardMetaField,
} from "@/components/ui/licitacao-card"
import { Separator } from "@/components/ui/separator"
import { useNaoPrototipado } from "@/settle/nao-prototipado"

const RESPONSAVEIS = [
  { initials: "A", name: "Ana Lima" },
  { initials: "M", name: "Marcos Ribeiro" },
  { initials: "R", name: "Rafael Costa" },
]

// ordem por linha: a grade de 6 colunas repete as colunas do Figma
// (ID/Modalidade, Julgamento/UASG, Portal/Cidade, Estado/CAPAG Municipal, CAPAG Estadual/Habitantes, Nova propriedade)
const PROPRIEDADES: LicitacaoCardMetaField[] = [
  { label: "ID", value: "1078513" },
  { label: "Julgamento", value: "Menor preço por item" },
  { label: "Portal de disputa", value: "compras.saobernad..." },
  { label: "Estado", value: "PA" },
  { label: "CAPAG Estadual", value: "-" },
  { label: "Nova propriedade", value: "Variable" },
  { label: "Modalidade", value: "Pregão - Eletrônico" },
  { label: "UASG", value: "-" },
  { label: "Cidade", value: "Belém" },
  { label: "CAPAG Municipal", value: "-" },
  { label: "Habitantes", value: "1.303.403" },
]

function DivisorVertical() {
  return <Separator orientation="vertical" className="data-vertical:h-6 data-vertical:self-center" />
}

export default function App() {
  useNaoPrototipado()
  const [selecionado, setSelecionado] = useState(false)

  return (
    <main className="flex min-h-svh items-start justify-center bg-muted p-8 max-sm:p-4">
      <h1 className="sr-only">Detalhe do card de licitação</h1>

      <LicitacaoCardRoot
        aria-label="Licitação Edital 90001/2026"
        className={cn("w-full max-w-345 py-0 [--card-spacing:--spacing(4)]", selecionado && "ring-primary")}
      >
        {/* ---------- topo ---------- */}
        <LicitacaoCardHeader className="min-h-15 gap-x-4 gap-y-2 py-2.5">
          <div className="flex flex-1 items-center gap-2">
            <LicitacaoCardSelect
              label="Selecionar edital 90001/2026"
              checked={selecionado}
              onCheckedChange={(v) => setSelecionado(v === true)}
              className="mr-1"
            />
            <LicitacaoCardTitle prefix={<b>Edital</b>} className="text-lg leading-7 font-normal">
              90001/2026
            </LicitacaoCardTitle>
            <Badge variant="warning" className="h-6.5 flex-none rounded-md border-current/20 px-3 font-medium">
              <RefreshCwIcon data-icon="inline-start" />
              Atualizado
            </Badge>
          </div>

          <LicitacaoCardActions className="gap-2">
            <Button variant="secondary" size="sm" className="px-3" data-nao-prototipado>
              Descartar
            </Button>
            <Button size="sm" className="px-3" data-nao-prototipado>
              Enviar para análise
            </Button>
            <DivisorVertical />
            <LicitacaoCardStatusButton size="sm" className="px-3" data-nao-prototipado>
              <PencilIcon data-icon="inline-start" />
              Em disputa ou Homologação
            </LicitacaoCardStatusButton>
            <DivisorVertical />
            <LicitacaoCardAvatars avatars={RESPONSAVEIS} addProps={{ "data-nao-prototipado": true }} />
            <DivisorVertical />
            <LicitacaoCardIconAction variant="soft" label="Notificações" icon={<BellIcon />} data-nao-prototipado />
            <DivisorVertical />
            <LicitacaoCardIconActions className="ml-0 gap-2">
              <LicitacaoCardIconAction variant="soft" label="Copiar link" icon={<LinkIcon />} data-nao-prototipado />
              <LicitacaoCardIconAction variant="soft" label="Compartilhar" icon={<Share2Icon />} data-nao-prototipado />
              <LicitacaoCardIconAction variant="soft" label="Documentos" icon={<FileTextIcon />} data-nao-prototipado />
              <LicitacaoCardIconAction variant="soft" label="Arquivos" icon={<FolderIcon />} data-nao-prototipado />
            </LicitacaoCardIconActions>
          </LicitacaoCardActions>
        </LicitacaoCardHeader>

        <LicitacaoCardContent className="flex flex-col gap-4 pt-0 pb-4">
          {/* ---------- aviso: descartada ---------- */}
          <Alert>
            <AlertTitle className="font-medium">
              Descartada <span className="text-muted-foreground">de</span> Recomendadas{" "}
              <span className="text-muted-foreground">por</span> Brunno Krier Martins{" "}
              <span className="text-muted-foreground">em</span> 30/03/2026 às 19:02
            </AlertTitle>
            <AlertDescription className="flex flex-col gap-0.5 [&_p:not(:last-child)]:mb-0">
              <p className="font-medium">Texto do Motivo</p>
              <p>Comentário: lorem ipsum dolor sit amet.</p>
            </AlertDescription>
            <AlertAction>
              <Button variant="secondary" size="xs" className="h-6.5 px-2 text-sm" data-nao-prototipado>
                Editar
              </Button>
            </AlertAction>
          </Alert>

          {/* ---------- bloco principal ---------- */}
          <section aria-label="Resumo do edital" className="flex flex-col gap-4 rounded-xl border p-4">
            <LicitacaoCardSegments
              aria-label="Segmentos"
              segments={["Segmento 1", "Segmento 2"].map((s) => ({
                label: s,
                className: "rounded-md px-1.5 py-0.5 font-medium",
              }))}
            />
            <LicitacaoCardDescription className="gap-2 text-sm">
              <LicitacaoCardField label="Órgão" tag="ME - EPP" className="leading-5 [&>span:first-child]:font-bold">
                EPA - PROCURADORIA GERAL DO ESTADO DO PARÁ
              </LicitacaoCardField>
              <LicitacaoCardField label="Objeto" className="leading-5 [&>span:first-child]:font-bold">
                Licitação para fornecimento de computadores desktop, notebooks, monitores e periféricos para atender a
                rede municipal de ensino. Inclui instalação, configuração e garantia de 36 meses com suporte on-site.
                Entrega em 47 unidades escolares.
              </LicitacaoCardField>
            </LicitacaoCardDescription>
            <LicitacaoCardValue className="text-base leading-6">R$ 47.284.499,63</LicitacaoCardValue>
          </section>

          {/* ---------- datas + propriedades ---------- */}
          <LicitacaoCardMeta
            variant="boxed"
            // gap e colunas do Figma: 16px entre as caixas e 6 colunas na grade larga
            className="gap-4 min-[1100px]:[&>dl:last-child]:grid-cols-6"
            aside={[
              [
                { label: "Adicionada", value: "04/02/2026" },
                { label: "Atualizada", value: "12/02/2026" },
              ],
              [
                {
                  label: "Envio da proposta",
                  value: "13/02/2026",
                  tone: "warning",
                  icon: <ClockIcon aria-hidden />,
                  title: "Prazo de envio da proposta: 13/02/2026",
                },
              ],
            ]}
            fields={PROPRIEDADES}
          />
        </LicitacaoCardContent>
      </LicitacaoCardRoot>
    </main>
  )
}
