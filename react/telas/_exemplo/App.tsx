// Ponto de partida de uma tela nova. "npm run nova" copia este arquivo.
// Use só componentes de @/components/ui (vêm do design system). Se faltar algum,
// veja "Componentes novos" no CLAUDE.md da Settle antes de criar.

import { ClockIcon, FilterIcon, MoreHorizontalIcon, PlusIcon, SearchIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const LICITACOES = [
  {
    edital: "PE 90045/2026",
    orgao: "Secretaria de Estado da Saúde de São Paulo",
    objeto: "Aquisição de monitores multiparamétricos para UTI adulto",
    valor: "R$ 4.812.300,00",
    sessao: "24/09/2026",
    urgente: true,
    status: "Em análise",
  },
  {
    edital: "PE 00312/2026",
    orgao: "Prefeitura Municipal de Campinas",
    objeto: "Registro de preços para fornecimento de notebooks educacionais",
    valor: "R$ 1.240.000,00",
    sessao: "02/10/2026",
    urgente: false,
    status: "Nova",
  },
  {
    edital: "CC 0017/2026",
    orgao: "Tribunal de Justiça de Minas Gerais",
    objeto: "Contratação de solução de armazenamento em nuvem",
    valor: "R$ 12.950.000,00",
    sessao: "15/10/2026",
    urgente: false,
    status: "Proposta enviada",
  },
]

const VARIANTE = { Nova: "default", "Em análise": "secondary", "Proposta enviada": "outline" } as const

export default function App() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground uppercase">Plataforma</span>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Licitações em andamento</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>3 licitações</CardTitle>
          <CardDescription>Ordenadas pela data da sessão</CardDescription>
          <CardAction>
            <Button size="sm" onClick={() => toast("Em breve: importar edital")}>
              <PlusIcon data-icon="inline-start" />
              Importar edital
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Tabs defaultValue="todas">
              <TabsList>
                <TabsTrigger value="todas">Todas 3</TabsTrigger>
                <TabsTrigger value="analise">Em análise 1</TabsTrigger>
                <TabsTrigger value="enviadas">Enviadas 1</TabsTrigger>
              </TabsList>
            </Tabs>
            <InputGroup className="ml-auto w-72">
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput placeholder="Buscar por órgão, objeto ou edital" aria-label="Buscar" />
            </InputGroup>
            <Button variant="outline" size="sm">
              <FilterIcon data-icon="inline-start" />
              Filtros
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Edital</TableHead>
                <TableHead>Órgão e objeto</TableHead>
                <TableHead className="text-right">Valor estimado</TableHead>
                <TableHead>Sessão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {LICITACOES.map((l) => (
                <TableRow key={l.edital}>
                  <TableCell className="font-medium">{l.edital}</TableCell>
                  <TableCell className="max-w-md">
                    <div className="flex flex-col">
                      <span className="truncate">{l.orgao}</span>
                      <span className="truncate text-muted-foreground">{l.objeto}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{l.valor}</TableCell>
                  <TableCell>
                    <span className={l.urgente ? "flex items-center gap-1 font-medium text-warning" : undefined}>
                      {l.urgente && <ClockIcon aria-hidden className="size-3.5" />}
                      {l.sessao}
                      {l.urgente && <span className="sr-only">(prazo curto)</span>}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={VARIANTE[l.status as keyof typeof VARIANTE]}>{l.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label={`Ações de ${l.edital}`}>
                          <MoreHorizontalIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuItem>Abrir edital</DropdownMenuItem>
                          <DropdownMenuItem>Enviar para análise</DropdownMenuItem>
                          <DropdownMenuItem variant="destructive">Descartar</DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  )
}
