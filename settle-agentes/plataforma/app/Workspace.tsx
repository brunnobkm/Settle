// A licitação aberta: a tela onde o resultado de um agente vira widget. Em vez de uma
// tela fixa por análise, o resultado é alocado no contexto em que a pessoa está
// (Alice, 03/09: "o resultado do cara fica no contexto dele"). Reproduz a tela real
// da plataforma, node 8478-14665.

import { useState } from "react"
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ChevronUpIcon,
  CodeIcon,
  FileTextIcon,
  HeadingIcon,
  HighlighterIcon,
  IndentIncreaseIcon,
  ItalicIcon,
  LinkIcon,
  ListChecksIcon,
  ListIcon,
  ListOrderedIcon,
  NotebookPenIcon,
  Redo2Icon,
  StrikethroughIcon,
  SubscriptIcon,
  SuperscriptIcon,
  UnderlineIcon,
  Undo2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { LicitacaoCardContent, LicitacaoCardRoot } from "@/components/ui/licitacao-card"
import { PopoverAnchor } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useSim, type AbaWk } from "./estado"
import { AbaDaFuncionalidade, MenuDeCenario } from "./Funcionalidade"
import { MioloDaLicitacao } from "./Licitacoes"

const FORMATACAO = [
  [
    { rotulo: "Refazer", icone: Redo2Icon },
    { rotulo: "Desfazer", icone: Undo2Icon },
  ],
  [{ rotulo: "Título", icone: HeadingIcon }],
  [
    { rotulo: "Negrito", icone: BoldIcon },
    { rotulo: "Itálico", icone: ItalicIcon },
    { rotulo: "Sublinhado", icone: UnderlineIcon },
    { rotulo: "Riscado", icone: StrikethroughIcon },
    { rotulo: "Marca-texto", icone: HighlighterIcon },
  ],
  [
    { rotulo: "Alinhar à esquerda", icone: AlignLeftIcon },
    { rotulo: "Centralizar", icone: AlignCenterIcon },
    { rotulo: "Alinhar à direita", icone: AlignRightIcon },
    { rotulo: "Justificar", icone: AlignJustifyIcon },
  ],
  [
    { rotulo: "Lista", icone: ListIcon },
    { rotulo: "Lista numerada", icone: ListOrderedIcon },
    { rotulo: "Lista de tarefas", icone: ListChecksIcon },
    { rotulo: "Recuo", icone: IndentIncreaseIcon },
  ],
  [
    { rotulo: "Sobrescrito", icone: SuperscriptIcon },
    { rotulo: "Subscrito", icone: SubscriptIcon },
  ],
  [{ rotulo: "Código", icone: CodeIcon }],
  [{ rotulo: "Inserir link", icone: LinkIcon }],
  [{ rotulo: "Recolher as anotações", icone: ChevronUpIcon }],
]

function Anotacoes() {
  return (
    <Card className="gap-3 rounded-lg py-4">
      <CardHeader className="flex flex-wrap items-center gap-2.5 px-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <FileTextIcon aria-hidden className="size-4.25" />
          Anotações
        </CardTitle>
        <div role="toolbar" aria-label="Formatação" className="ml-auto flex flex-wrap items-center gap-1.5">
          {FORMATACAO.map((grupo, g) => (
            <ButtonGroup key={g} className="rounded-lg bg-muted p-0.5">
              {grupo.map(({ rotulo, icone: Icone }) => (
                <Button
                  key={rotulo}
                  variant="ghost"
                  size="icon-xs"
                  aria-label={rotulo}
                  data-nao-prototipado
                  className="text-muted-foreground hover:bg-background"
                >
                  <Icone />
                </Button>
              ))}
            </ButtonGroup>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-4">
        <Empty className="rounded-lg border border-solid bg-background px-4 py-11">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <NotebookPenIcon />
            </EmptyMedia>
            <EmptyTitle className="text-[15px] font-semibold">Nada anotado ainda</EmptyTitle>
            <EmptyDescription>
              Registre os pontos que decidem a participação e combine checklists com{" "}
              <b className="font-semibold text-foreground">@menções</b> para puxar o time quando precisar.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button data-nao-prototipado>Começar a anotar</Button>
          </EmptyContent>
        </Empty>
      </CardContent>
    </Card>
  )
}

/* O protótipo cobre o caminho dos agentes. O resto da licitação está aqui para dar contexto. */
function ForaDoPrototipo() {
  return (
    <Empty className="border border-dashed bg-card px-4 py-12">
      <EmptyHeader>
        <EmptyTitle className="text-[15px] font-semibold">Fora do protótipo</EmptyTitle>
        <EmptyDescription>
          Esta área existe na plataforma e não foi simulada aqui. O que este protótipo cobre é o caminho dos agentes: o
          resultado deles, a configuração e as aprovações.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

export function Workspace() {
  const { licFoco: l, aberta, abaWk, setAbaWk } = useSim()
  const [menuTecnica, setMenuTecnica] = useState(false)
  const i = aberta ?? 0

  return (
    <div className="flex flex-col gap-4">
      <LicitacaoCardRoot aria-label={`PE ${l.n}`}>
        <LicitacaoCardContent className="pt-0">
          <MioloDaLicitacao l={l} />
        </LicitacaoCardContent>
      </LicitacaoCardRoot>

      <Anotacoes />

      <Tabs value={abaWk} onValueChange={(v) => setAbaWk(v as AbaWk)} className="gap-4">
        <TabsList aria-label="Seções da licitação" id="abas-da-licitacao">
          <TabsTrigger value="itens" className="px-3">
            Itens <span className="text-xs font-semibold text-muted-foreground tabular-nums">{l.itens.length}</span>
          </TabsTrigger>
          {/* No simulador, a aba da Análise técnica também pergunta o cenário. A Habilitação
              fica fora: os cenários dela já se alcançam pelo Checklist e pelo Score, e um
              menu em cada aba transforma a navegação num interrogatório. */}
          <MenuDeCenario k="tecnica" i={i} aberto={menuTecnica} onAbertoChange={setMenuTecnica}>
            <PopoverAnchor asChild>
              <TabsTrigger
                value="tecnica"
                className="px-3"
                onClick={() => {
                  if (l.simulador) setMenuTecnica(true)
                }}
              >
                Análise técnica
              </TabsTrigger>
            </PopoverAnchor>
          </MenuDeCenario>
          <TabsTrigger value="habil" className="px-3">
            Habilitação <span className="text-xs font-semibold text-muted-foreground tabular-nums">1</span>
          </TabsTrigger>
          <TabsTrigger value="manif" className="px-3">
            Manifestações <span className="text-xs font-semibold text-muted-foreground tabular-nums">4</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="itens">
          <ForaDoPrototipo />
        </TabsContent>
        <TabsContent value="tecnica">
          <AbaDaFuncionalidade k="tecnica" />
        </TabsContent>
        <TabsContent value="habil">
          <AbaDaFuncionalidade k="habil" />
        </TabsContent>
        <TabsContent value="manif">
          <ForaDoPrototipo />
        </TabsContent>
      </Tabs>
    </div>
  )
}
