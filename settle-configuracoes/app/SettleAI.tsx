// Settle AI em Configurações: o mesmo botão flutuante e a mesma janela ancorada da
// plataforma (settle-agentes/plataforma/app/SettleAI.tsx), com uma conversa curta sobre a
// área em que a pessoa está. Não é uma segunda IA: é a mesma, que acompanha a pessoa em
// qualquer tela. Aqui ela responde sobre configuração e abre a criação conversacional de
// agente e variável, em vez de repetir a conversa inteira do handoff, que está congelado.

import { useEffect, useRef, useState, type ReactNode } from "react"
import { BotIcon, SendIcon, SparklesIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"

import { NOMES, type Rota } from "./dados"
import { useConfig } from "./estado"
import { useAgentes } from "./agentes/estado"

type Fala = { quem: "settle" | "voce"; texto: ReactNode }

/** Uma sugestão da conversa: a pergunta como a pessoa faria, e o que a Settle responde. */
type Sugestao = { p: string; r?: ReactNode; faz?: "variavel" | "agente" }

const SOBRE_VARIAVEL: Sugestao = {
  p: "O que é uma variável?",
  r: (
    <>
      Uma <b>variável</b> é uma pergunta que eu faço a todo edital: o CNPJ do órgão, o valor estimado, se exige atestado
      técnico. Eu procuro nos documentos que você marcar e guardo a <b>resposta</b>. Sozinha ela não muda nada na
      licitação: quem usa a resposta para decidir é o <b>agente</b>.
    </>
  ),
}

const SOBRE_AGENTE: Sugestao = {
  p: "O que é um agente?",
  r: (
    <>
      Um <b>agente</b> é uma tarefa que eu faço sozinha em cada licitação, como uma pessoa do time faria. Ele lê as
      respostas das variáveis, decide, e mostra o <b>resultado</b> dentro da licitação. Se for mudar alguma coisa, como
      a etapa, ele pode pedir aprovação antes.
    </>
  ),
}

const CRIAR_VARIAVEL: Sugestao = { p: "Criar uma variável comigo", faz: "variavel" }
const CRIAR_AGENTE: Sugestao = { p: "Criar um agente comigo", faz: "agente" }

const PARADO: Sugestao = {
  p: "Por que um agente ficou parado?",
  r: (
    <>
      Ele usava uma variável que foi excluída, e sem a resposta não tem como decidir. Abra o agente, troque a variável
      que falta por outra ou crie de novo a que foi excluída, e ele volta a rodar.
    </>
  ),
}

const APROVACAO: Sugestao = {
  p: "Por que uma ação espera aprovação?",
  r: (
    <>
      Porque o agente está configurado para pedir aprovação antes de mudar a licitação. Nada muda até alguém responder.
      A fila fica em <b>Aprovações</b>, e quem respondeu, o quê e quando fica registrado em <b>Auditoria</b>.
    </>
  ),
}

/** O que eu sei responder em cada área. A primeira fala é sempre sobre onde a pessoa está. */
const POR_ROTA: Record<Rota, { resumo: ReactNode; sugestoes: Sugestao[] }> = {
  inicio: {
    resumo: "Daqui você configura como a Settle trabalha para o seu time: o funil, as listas, o card, o e-mail, quem pode o quê, e os agentes.",
    sugestoes: [SOBRE_AGENTE, SOBRE_VARIAVEL],
  },
  etapas: {
    resumo: "As etapas são as colunas do Kanban, o caminho que uma licitação percorre até virar proposta.",
    sugestoes: [
      {
        p: "O que acontece com as licitações se eu renomear uma etapa?",
        r: "Nada se perde: elas continuam onde estão, só com o novo nome. Excluir é diferente: aí você escolhe para qual etapa vão as licitações que estavam nela.",
      },
      SOBRE_AGENTE,
    ],
  },
  abas: {
    resumo: "As abas são as listas salvas que o time vê no topo, cada uma com os próprios filtros.",
    sugestoes: [
      {
        p: "A aba vale para o time todo?",
        r: "As abas configuradas aqui valem para a organização inteira. O que cada pessoa filtra na hora não mexe na aba dos outros.",
      },
      SOBRE_AGENTE,
    ],
  },
  motivos: {
    resumo: "Os motivos são as opções que aparecem quando alguém descarta uma licitação ou marca uma perda.",
    sugestoes: [
      {
        p: "Para que serve exigir o motivo?",
        r: "Sem motivo obrigatório, a maior parte das licitações sai da lista sem explicação, e ninguém consegue dizer depois por que perdeu. Com ele, o relatório de perdas passa a valer alguma coisa.",
      },
      SOBRE_AGENTE,
    ],
  },
  card: {
    resumo: "Aqui você escolhe quais informações aparecem no card de cada licitação, e em que ordem.",
    sugestoes: [
      {
        p: "Ocultar um campo apaga a informação?",
        r: "Não. O campo só deixa de aparecer no card; a informação continua na licitação e nos filtros.",
      },
      SOBRE_AGENTE,
    ],
  },
  email: {
    resumo: "Este é o modelo do e-mail que a Settle manda quando encontra licitações para o time.",
    sugestoes: [
      {
        p: "O que acontece quando não tem licitação nova?",
        r: "Você escolhe: ou o e-mail não sai naquele dia, ou sai dizendo que não houve novidade. Nada de e-mail em branco.",
      },
      SOBRE_AGENTE,
    ],
  },
  equipe: {
    resumo: "Aqui ficam as pessoas da organização e o papel de cada uma.",
    sugestoes: [
      {
        p: "Qual a diferença entre desativar e excluir alguém?",
        r: "Desativar tira o acesso e preserva o histórico do que a pessoa fez. É o que você quer em quase todo caso.",
      },
      SOBRE_AGENTE,
    ],
  },
  permissoes: {
    resumo: "As permissões dizem o que cada papel vê e pode mudar.",
    sugestoes: [
      {
        p: "Quem pode configurar agentes?",
        r: (
          <>
            Configurar agentes e variáveis é de administrador. <b>Aprovações</b> abre para qualquer função, porque quem
            aprova nem sempre é quem configura.
          </>
        ),
      },
      SOBRE_AGENTE,
    ],
  },
  auditoria: {
    resumo: "A Auditoria guarda o que foi mudado na configuração e as respostas às aprovações dos agentes.",
    sugestoes: [
      {
        p: "O que fica registrado aqui?",
        r: (
          <>
            Uma linha por acontecimento, com quem, quando e o quê. Nas aprovações, uma linha por decisão: a licitação, o
            agente que pediu e se foi aprovada ou recusada. Registro não se edita nem se apaga.
          </>
        ),
      },
      APROVACAO,
    ],
  },
  agentes: {
    resumo: "Esta é a área dos agentes: as tarefas que eu faço sozinha em cada licitação.",
    sugestoes: [SOBRE_AGENTE, CRIAR_AGENTE, APROVACAO, SOBRE_VARIAVEL],
  },
  variaveis: {
    resumo: "Esta é a área das variáveis: as perguntas que eu faço a todo edital.",
    sugestoes: [SOBRE_VARIAVEL, CRIAR_VARIAVEL, PARADO, SOBRE_AGENTE],
  },
}

const NAO_SEI = (
  <>
    Isso eu ainda não sei responder por aqui. Posso falar sobre esta área, sobre agentes e variáveis, e criar um agente
    ou uma variável com você. É só escolher abaixo.
  </>
)

function Bolha({ fala }: { fala: Fala }) {
  if (fala.quem === "voce") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-br-md bg-muted px-3.5 py-2 text-[13.5px] leading-5">{fala.texto}</p>
      </div>
    )
  }
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <SparklesIcon aria-hidden className="size-3.5" />
      </span>
      <div className="max-w-[88%] text-[13.5px] leading-5 [&_b]:font-semibold">{fala.texto}</div>
    </div>
  )
}

/**
 * O botão flutuante fica no canto inferior direito, o mesmo lugar da plataforma, e vira o
 * interruptor de abrir e fechar. A janela é ancorada nele, não uma gaveta: acompanha a
 * pessoa sem empurrar o conteúdo da página.
 */
export function SettleAI({ rota }: { rota: Rota }) {
  const { iaAberta, setIaAberta } = useConfig()
  const { abrirModal } = useAgentes()
  const area = POR_ROTA[rota]
  const [falas, setFalas] = useState<Fala[]>([])
  const [texto, setTexto] = useState("")
  const fim = useRef<HTMLDivElement>(null)

  // A conversa começa dizendo onde a pessoa está: é o contexto que ela tem na cabeça.
  const abrir = () => {
    if (!falas.length) {
      setFalas([
        {
          quem: "settle",
          texto: (
            <>
              Olá, Brunno. Você está em <b>{NOMES[rota]}</b>. {area.resumo} Pergunte o que quiser, ou escolha abaixo.
            </>
          ),
        },
      ])
    }
    setIaAberta(true)
  }

  useEffect(() => {
    if (iaAberta) fim.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [falas.length, iaAberta])

  const responder = (s: Sugestao) => {
    if (s.faz) {
      setIaAberta(false)
      abrirModal(s.faz === "variavel" ? { tipo: "conversa-variavel" } : { tipo: "conversa-agente" })
      return
    }
    setFalas((f) => [...f, { quem: "voce", texto: s.p }, { quem: "settle", texto: s.r }])
  }

  const enviar = () => {
    const t = texto.trim()
    if (!t) return
    setTexto("")
    setFalas((f) => [...f, { quem: "voce", texto: t }, { quem: "settle", texto: NAO_SEI }])
  }

  return (
    <Popover open={iaAberta}>
      <PopoverAnchor asChild>
        <Button
          size="lg"
          aria-expanded={iaAberta}
          onClick={() => (iaAberta ? setIaAberta(false) : abrir())}
          className="fixed right-6 bottom-6 z-50 h-11 rounded-full px-4.5 text-sm font-semibold shadow-lg"
        >
          <BotIcon data-icon="inline-start" />
          Settle AI
        </Button>
      </PopoverAnchor>
      {/* Não fecha com clique fora nem com Esc: sai pelo X ou pelo próprio botão, como na plataforma. */}
      <PopoverContent
        side="top"
        align="end"
        sideOffset={16}
        aria-label="Settle AI"
        className="flex h-[min(520px,calc(100svh-8rem))] w-[min(380px,calc(100vw-2rem))] flex-col gap-0 p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex items-center gap-2 border-b px-3.5 py-2.5">
          <BotIcon aria-hidden className="size-4 text-primary" />
          <span className="text-sm font-semibold">Settle AI</span>
          <span className="truncate text-xs text-muted-foreground">· {NOMES[rota]}</span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Fechar a Settle AI"
            className="ml-auto text-muted-foreground hover:text-foreground"
            onClick={() => setIaAberta(false)}
          >
            <XIcon />
          </Button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-3.5 py-3">
          {falas.map((f, i) => (
            <Bolha key={i} fala={f} />
          ))}
          <div ref={fim} />
        </div>
        <div className="flex flex-col gap-2 border-t px-3.5 py-3">
          <div className="flex flex-wrap gap-1.5">
            {area.sugestoes.map((s) => (
              <Button
                key={s.p}
                variant="outline"
                size="xs"
                className="h-7 rounded-full font-normal shadow-none"
                onClick={() => responder(s)}
              >
                {s.p}
              </Button>
            ))}
          </div>
          <InputGroup>
            <InputGroupInput
              aria-label="Escreva para a Settle AI"
              placeholder="Escreva sua pergunta"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  enviar()
                }
              }}
            />
            <InputGroupAddon align="inline-end">
              <Button size="icon-sm" aria-label="Enviar" disabled={!texto.trim()} onClick={enviar}>
                <SendIcon />
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </PopoverContent>
    </Popover>
  )
}
