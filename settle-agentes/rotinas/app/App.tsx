// Agentes, versão "Rotinas" (hipótese 2: estrutura primeiro), congelada em 26/08 para comparação
// no teste com clientes. A conversa não é o caminho obrigatório: a pessoa entra por linguagem
// natural, por um modelo pronto ou pelo formulário, e a elicitação vira uma etapa de revisão antes
// de ativar, apontando só as lacunas que ficaram em aberto.
//
// Espelha Tarefas agendadas / Rotinas: agentes em cards com estado visível, galeria de modelos,
// gatilho como seção nomeada e aviso de impacto antes de criar. Não copia o formulário puro,
// o vocabulário de dev (webhook, cron) nem a ausência de custo por execução.

import { useRef, useState } from "react"
import {
  BotIcon,
  ClockIcon,
  Columns3Icon,
  FileSearchIcon,
  ListFilterIcon,
  PauseIcon,
  SquareCheckIcon,
  TriangleAlertIcon,
  UsersIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AppShell, type AppShellGroup } from "@/components/ui/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useNaoPrototipado } from "@/settle/nao-prototipado"
import { SAUDACAO, USUARIO, WORKSPACE } from "@/settle/navegacao"

import { AGENTES, MODELOS, SUGESTOES, nomePeloTexto, novoRascunho, type Agente, type Rascunho } from "./dados"
import { EditorDeAgente, type AgenteAtivado } from "./EditorDeAgente"

// Sidebar desta hipótese: é a da época (26/08), com a seção "Configuração da análise".
const GRUPOS: AppShellGroup[] = [
  {
    label: "Licitações",
    items: [
      { label: "Recomendadas", icon: SquareCheckIcon, count: 18, href: "#", "data-nao-prototipado": true },
      { label: "Explorar licitações", icon: FileSearchIcon, href: "#", "data-nao-prototipado": true },
      { label: "Em andamento", icon: Columns3Icon, href: "#", "data-nao-prototipado": true },
    ],
  },
  {
    label: "Configuração da análise",
    items: [
      { label: "Agentes", icon: BotIcon, active: true, href: "#", onClick: (e) => e.preventDefault() },
      { label: "Segmentos e match", icon: ListFilterIcon, href: "#", "data-nao-prototipado": true },
      { label: "Equipe e permissões", icon: UsersIcon, href: "#", "data-nao-prototipado": true },
    ],
  },
]

type Edicao = { key: number; titulo: string; inicial: Rascunho }

export default function App() {
  useNaoPrototipado()

  const [agentes, setAgentes] = useState(AGENTES)
  const [texto, setTexto] = useState("")
  const textoRef = useRef<HTMLTextAreaElement>(null)
  const [aberto, setAberto] = useState(false)
  const [edicao, setEdicao] = useState<Edicao | null>(null)
  const sequencia = useRef(0)

  function abrir(nome: string, instr: string, modeloId: string | null) {
    sequencia.current += 1
    setEdicao({
      key: sequencia.current,
      titulo: modeloId ? `A partir do modelo: ${nome}` : nome || "Novo agente",
      inicial: novoRascunho(nome, instr, modeloId),
    })
    setAberto(true)
  }

  function criar() {
    const txt = texto.trim()
    if (!txt) {
      toast("Descreva o que você quer que a Settle analise")
      return
    }
    setTexto("")
    abrir(nomePeloTexto(txt), txt, null)
  }

  function ativar(a: AgenteAtivado) {
    const id = `novo-${Date.now()}`
    const novo: Agente = { id, nome: a.nome, instr: a.instr, estado: "run", gatilho: a.gatilho, custo: a.custo }
    setAgentes((lista) => [novo, ...lista])
    setAberto(false)
    toast(`Agente ativado${a.recalcular ? " e 14 licitações em recálculo" : ""}`, {
      action: { label: "Desfazer", onClick: () => setAgentes((lista) => lista.filter((x) => x.id !== id)) },
    })
  }

  return (
    <AppShell
      workspace={{ ...WORKSPACE, name: "B Design" }}
      groups={GRUPOS}
      user={USUARIO}
      header={<span className="text-[15px] font-semibold">{SAUDACAO}</span>}
    >
      <div className="mx-auto max-w-347 px-6 pt-6 pb-16 max-md:px-4 max-md:pt-4 max-md:pb-12">
        <header className="mb-5.5">
          <p className="text-3xl font-normal max-md:text-[22px] max-md:leading-7">Agentes</p>
          <h1 className="mt-1.5 text-5xl leading-[1.04] font-bold tracking-[-0.5px] max-md:text-[34px]">
            Análises da sua empresa
          </h1>
          <p className="mt-2 max-w-195 text-sm leading-[21px] text-muted-foreground">
            Cada agente é uma análise que roda sozinha nas suas licitações. Você descreve o que quer, escolhe quando roda
            e onde o resultado aparece. Antes de ativar, a Settle revisa a regra com você.
          </p>
        </header>

        <Alert variant="warning" className="mb-4.5">
          <TriangleAlertIcon />
          <AlertTitle>Versão congelada em 26/08 · hipótese 2: estrutura primeiro, no formato de Rotinas</AlertTitle>
          <AlertDescription className="[&_a]:no-underline">
            <p>
              Esta é uma das duas hipóteses iniciais do projeto de Agentes, mantida como está para comparação no teste
              com clientes. Ela não recebeu nada do que veio depois: análise como um agente com várias regras, variável
              dentro do texto, memória de cálculo, estados de execução, regra condicional nem criação a partir da
              licitação.
            </p>
            <p>
              <Button asChild variant="outline" className="px-3.5">
                <a href="../plataforma/">Abrir a tela atual</a>
              </Button>
            </p>
          </AlertDescription>
        </Alert>

        {/* criar por linguagem natural */}
        <Card className="mt-6 mb-8 gap-2.5 rounded-lg py-3.5">
          <CardContent className="px-3.5">
            <label className="sr-only" htmlFor="npt">
              O que você quer que a Settle analise em cada licitação?
            </label>
            <Textarea
              ref={textoRef}
              id="npt"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="O que você quer que a Settle analise em cada licitação?"
              className="min-h-16 px-3 py-2.5 leading-[21px]"
            />
          </CardContent>
          <CardFooter className="flex-wrap gap-2 px-3.5">
            <div className="flex min-w-0 flex-1 flex-wrap gap-2">
              {SUGESTOES.map((s) => (
                <Button
                  key={s.rotulo}
                  variant="outline"
                  size="xs"
                  className="h-auto min-h-7 max-w-full rounded-full bg-muted px-3 py-1 text-left font-normal whitespace-normal text-muted-foreground shadow-none hover:bg-background"
                  onClick={() => {
                    setTexto(s.texto)
                    textoRef.current?.focus()
                  }}
                >
                  {s.rotulo}
                </Button>
              ))}
            </div>
            <Button className="px-3.5" onClick={criar}>
              Criar agente
            </Button>
          </CardFooter>
        </Card>

        <section aria-labelledby="h-seus" className="mb-8">
          <div className="mb-1 flex items-baseline gap-2.5">
            <h2 id="h-seus" className="text-lg font-semibold">
              Seus agentes
            </h2>
            <Badge variant="secondary" className="bg-muted font-semibold text-muted-foreground tabular-nums">
              {agentes.length}
            </Badge>
          </div>
          <p className="mb-3.5 text-[13px] text-muted-foreground">
            Custo total no mês: <b className="font-semibold text-foreground">R$ 31,80</b> em 148 licitações analisadas.
          </p>
          <ul className="grid grid-cols-2 gap-3 max-[900px]:grid-cols-1">
            {agentes.map((a) => (
              <li key={a.id} className="flex">
                <CartaoAgente agente={a} onAbrir={() => abrir(a.nome, a.instr, null)} />
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="h-modelos" className="mb-8">
          <h2 id="h-modelos" className="mb-1 text-lg font-semibold">
            Ou comece com um modelo
          </h2>
          <p className="mb-3.5 text-[13px] text-muted-foreground">
            Modelos prontos que você ajusta depois. Foram escritos a partir do que outras empresas do seu segmento
            configuraram.
          </p>
          <ul className="grid grid-cols-2 gap-3 max-[900px]:grid-cols-1">
            {MODELOS.map((m) => (
              <li key={m.id} className="flex">
                <CartaoClicavel titulo={m.nome} onAbrir={() => abrir(m.nome, m.instr, m.id)}>
                  <CardContent className="gap-2 px-4">
                    <p className="text-[13px] leading-[19px] text-muted-foreground">{m.desc}</p>
                    <p className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                      <span>{m.quando}</span>
                      <span>Usa: {m.fontes}</span>
                    </p>
                  </CardContent>
                </CartaoClicavel>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {edicao && (
        <EditorDeAgente
          key={edicao.key}
          aberto={aberto}
          onAbertoChange={setAberto}
          titulo={edicao.titulo}
          inicial={edicao.inicial}
          onAtivar={ativar}
        />
      )}
    </AppShell>
  )
}

/**
 * Card inteiro clicável: o clique em qualquer ponto abre o agente. Para teclado e leitor de tela,
 * o título é um botão (o clique dele sobe até o card).
 */
function CartaoClicavel({
  titulo,
  desligado,
  onAbrir,
  children,
}: {
  titulo: string
  desligado?: boolean
  onAbrir: () => void
  children: React.ReactNode
}) {
  return (
    <Card
      size="sm"
      onClick={onAbrir}
      className={cn(
        "w-full cursor-pointer gap-2 rounded-lg py-3.5 shadow-none transition-shadow hover:ring-foreground/20 has-[button:focus-visible]:ring-3 has-[button:focus-visible]:ring-ring/50",
        desligado && "bg-muted"
      )}
    >
      <CardHeader className="px-4">
        <CardTitle className="text-[15px] leading-[21px] font-semibold">
          <button type="button" className="cursor-pointer text-left outline-none">
            {titulo}
          </button>
        </CardTitle>
      </CardHeader>
      {children}
    </Card>
  )
}

function CartaoAgente({ agente: a, onAbrir }: { agente: Agente; onAbrir: () => void }) {
  return (
    <CartaoClicavel titulo={a.nome} desligado={a.estado === "pause" || a.estado === "draft"} onAbrir={onAbrir}>
      <CardContent className="px-4">
        <p className="line-clamp-3 text-[13px] leading-[19px] text-muted-foreground">{a.instr}</p>
      </CardContent>
      <CardFooter className="mt-0.5 flex-wrap gap-2 px-4">
        <EstadoDoAgente agente={a} />
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
          {a.custo ? `${a.custo} por licitação` : "Ainda sem custo por licitação"}
        </span>
      </CardFooter>
    </CartaoClicavel>
  )
}

const SELO = "h-auto min-h-5 rounded-md font-semibold whitespace-normal"

function EstadoDoAgente({ agente: a }: { agente: Agente }) {
  if (a.estado === "draft")
    return (
      <Badge variant="secondary" className={cn(SELO, "bg-foreground/8 text-foreground")}>
        Rascunho
      </Badge>
    )
  if (a.estado === "pause")
    return (
      <Badge variant="outline" className={cn(SELO, "bg-background text-muted-foreground")}>
        <PauseIcon data-icon="inline-start" />
        {a.gatilho}
      </Badge>
    )
  return (
    <>
      <Badge variant="success" className={SELO}>
        <ClockIcon data-icon="inline-start" />
        {a.gatilho}
      </Badge>
      {a.estado === "warn" && a.alerta && (
        <Badge variant="warning" className={cn(SELO, "text-left")}>
          <TriangleAlertIcon data-icon="inline-start" />
          {a.alerta}
        </Badge>
      )}
    </>
  )
}
