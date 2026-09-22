// Resultado na licitação: a galeria do bloco que um agente produz dentro da licitação.
// No design system o componente se chama AI Widget; para quem usa a Settle ele é só "o
// resultado do agente" (no teste de 21/09, "AI Widget" precisou de analogia para ser
// entendido, então o termo fica entre nós).
//
// Esta página é de apresentação para o time: mostra os formatos possíveis com dados de
// licitação de verdade, para decidir qual formato cada agente novo deve usar. Nada aqui é
// configurável; quem configura é a página de Agentes.

import type { ReactNode } from "react"
import {
  BotIcon,
  CheckIcon,
  CircleAlertIcon,
  FileTextIcon,
  MinusIcon,
  RotateCcwIcon,
  ScaleIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  AiWidget,
  AiWidgetActions,
  AiWidgetContent,
  AiWidgetHeader,
  AiWidgetNote,
  AiWidgetTitle,
} from "@/components/ui/ai-widget"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CitationList } from "@/components/ui/citation-list"
import { ScoreMeter } from "@/components/ui/score-meter"
import { SettingsPage, SettingsPageDescription } from "@/components/ui/settings-page"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { Aviso } from "./comum"

/** Cada exemplo com o nome do formato, quando usar, e o widget montado. */
function Exemplo({ titulo, quando, children }: { titulo: string; quando: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <div>
        <h2 className="text-sm font-semibold">{titulo}</h2>
        <p className="text-[13px] leading-[19px] text-muted-foreground">{quando}</p>
      </div>
      {children}
    </section>
  )
}

/** A moldura padrão: nome do agente no topo, ações à direita, conteúdo e a fonte embaixo. */
function Bloco({
  agente,
  acoes = true,
  children,
  nota,
}: {
  agente: string
  acoes?: boolean
  children: ReactNode
  nota?: ReactNode
}) {
  return (
    <AiWidget>
      <AiWidgetHeader>
        <AiWidgetTitle>{agente}</AiWidgetTitle>
        {acoes && (
          <AiWidgetActions>
            <Button size="xs" variant="outline" className="shadow-none">
              Perguntar sobre este resultado
            </Button>
            <Button size="xs">Editar agente</Button>
          </AiWidgetActions>
        )}
      </AiWidgetHeader>
      <AiWidgetContent>{children}</AiWidgetContent>
      {nota && <AiWidgetNote>{nota}</AiWidgetNote>}
    </AiWidget>
  )
}

const ICONE = {
  ok: <CheckIcon aria-label="Atende" className="size-3.5 text-success-strong" />,
  falta: <XIcon aria-label="Não atende" className="size-3.5 text-destructive" />,
  atencao: <TriangleAlertIcon aria-label="Atenção" className="size-3.5 text-warning-strong" />,
  neutro: <MinusIcon aria-label="Sem informação" className="size-3.5 text-muted-foreground" />,
}

function Linha({ st, doc, nosso, fonte }: { st: keyof typeof ICONE; doc: string; nosso: string; fonte?: string }) {
  return (
    <li className="flex items-start gap-2 border-b py-2 last:border-b-0 last:pb-0 first:pt-0">
      <span className="mt-0.5 shrink-0">{ICONE[st]}</span>
      <span className="flex min-w-0 flex-col">
        <span className="text-[13px] leading-[19px] font-medium">{doc}</span>
        <span className="text-[13px] leading-[19px] text-muted-foreground">{nosso}</span>
        {fonte && (
          <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <FileTextIcon aria-hidden className="size-3" />
            {fonte}
          </span>
        )}
      </span>
    </li>
  )
}

export function PaginaResultados() {
  return (
    <SettingsPage width="full" className="pb-6">
      <SettingsPageDescription>
        O que um agente produz aparece dentro da licitação, num bloco com o nome dele e de onde tirou a resposta no
        edital. Esta página reúne os formatos desse bloco, com dados de licitação de verdade, para o time escolher o
        formato certo ao criar um agente. No design system o componente se chama <b>AI Widget</b>.
      </SettingsPageDescription>

      <Aviso tom="marca" fechavel>
        <b>Página de apresentação.</b> Nada aqui é configurável: é a galeria dos formatos. Quem decide o formato de cada
        agente é a instrução dele, e o lugar onde o bloco aparece é o campo <b>Onde o resultado aparece</b>, em Agentes.
      </Aviso>

      <div className="grid gap-7 min-[1100px]:grid-cols-2">
        <Exemplo
          titulo="Resposta curta"
          quando="Para a pergunta que se responde em uma linha: exige ou não exige, qual o prazo, qual o valor. É o formato mais usado."
        >
          <Bloco agente="Exige atestado técnico?" nota="Fonte: Edital, item 9.4.1 · p. 21">
            <p className="flex flex-wrap items-center gap-2 text-sm">
              <Badge className="bg-warning/15 font-normal text-warning-strong">Sim, exige</Badge>
              Atestado de capacidade técnica em design de produto digital, com no mínimo 1.500 horas.
            </p>
          </Bloco>
        </Exemplo>

        <Exemplo
          titulo="Lista com situação"
          quando="Para o que se confere item a item: documentos de habilitação, certidões, exigências. Cada linha diz o que é, como estamos e de onde saiu."
        >
          <Bloco agente="Tenho todos os documentos de habilitação?" nota="6 exigências lidas no edital · 1 pendência">
            <ul className="flex flex-col">
              <Linha
                st="ok"
                doc="Atestado de capacidade técnica"
                nosso="3 atestados somam 2.100 h, acima do mínimo de 1.500 h"
                fonte="Edital, item 9.4.1 · p. 21"
              />
              <Linha
                st="ok"
                doc="Certidão negativa de débitos federais"
                nosso="válida até 14/10/2026"
                fonte="Edital, item 9.2.3 · p. 19"
              />
              <Linha
                st="atencao"
                doc="Balanço patrimonial do último exercício"
                nosso="2025 entregue, índice de liquidez 1,8 (o edital pede 2,0)"
                fonte="Edital, item 9.5.1 · p. 22"
              />
              <Linha
                st="falta"
                doc="Certidão negativa de falência"
                nosso="a última venceu em 02/09/2026"
                fonte="Edital, item 9.3.2 · p. 20"
              />
            </ul>
          </Bloco>
        </Exemplo>

        <Exemplo
          titulo="Nota"
          quando="Para o agente que pontua a licitação e ajuda a ordenar a lista. Mostra a nota, o que somou e o que tirou ponto."
        >
          <Bloco agente="Score" nota="Pesos configurados pelo time em Agentes › Score">
            <div className="flex items-start gap-4">
              <ScoreMeter value={72} tone="success" label="72 de 100" />
              <ul className="flex min-w-0 flex-1 flex-col gap-1.5 text-[13px] leading-[19px]">
                <li className="flex justify-between gap-3">
                  <span>Segmento em comum: design de produto</span>
                  <span className="shrink-0 font-medium text-success-strong tabular-nums">+30</span>
                </li>
                <li className="flex justify-between gap-3">
                  <span>Valor estimado de R$ 4,2 mi</span>
                  <span className="shrink-0 font-medium text-success-strong tabular-nums">+25</span>
                </li>
                <li className="flex justify-between gap-3">
                  <span>CAPAG do município: B</span>
                  <span className="shrink-0 font-medium text-success-strong tabular-nums">+17</span>
                </li>
                <li className="flex justify-between gap-3 text-muted-foreground">
                  <span>Exige visita técnica presencial</span>
                  <span className="shrink-0 font-medium tabular-nums">0</span>
                </li>
              </ul>
            </div>
          </Bloco>
        </Exemplo>

        <Exemplo
          titulo="Tabela de comparação"
          quando="Para a análise técnica: o que o edital exige de um lado, o que temos do outro. Uma linha por componente."
        >
          <Bloco agente="Análise técnica" nota="15 componentes no Termo de referência · 11 atendidos">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Componente</TableHead>
                  <TableHead>O edital pede</TableHead>
                  <TableHead>Nosso catálogo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Pesquisa com usuários</TableCell>
                  <TableCell>8 entrevistas por ciclo</TableCell>
                  <TableCell className="text-success-strong">12 por ciclo</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Design system</TableCell>
                  <TableCell>biblioteca com tokens e documentação</TableCell>
                  <TableCell className="text-success-strong">atende</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Acessibilidade</TableCell>
                  <TableCell>laudo WCAG 2.2 AA por entrega</TableCell>
                  <TableCell className="text-warning-strong">laudo só no fim do projeto</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Bloco>
        </Exemplo>

        <Exemplo
          titulo="Parecer com trechos do edital"
          quando="Para quando a resposta depende de interpretar o texto: o agente escreve o parecer e deixa os trechos que usou, para conferir no edital."
        >
          <Bloco agente="Análise jurídica">
            <p className="mb-3 text-[13px] leading-[19px]">
              O edital permite subcontratação parcial, até 30% do objeto, com anuência prévia do órgão. A exigência de
              garantia de 5% do valor do contrato está acima do usual para serviços, mas dentro da Lei 14.133.
            </p>
            <CitationList
              title="Trechos usados"
              items={[
                {
                  id: "1",
                  location: "Edital, item 12.4 · p. 28",
                  excerpt: "É admitida a subcontratação de até 30% (trinta por cento) do objeto, mediante anuência prévia.",
                  primary: true,
                },
                {
                  id: "2",
                  location: "Minuta do contrato, cláusula 8ª · p. 6",
                  excerpt: "A contratada prestará garantia de 5% (cinco por cento) do valor do contrato.",
                },
              ]}
            />
          </Bloco>
        </Exemplo>

        <Exemplo
          titulo="Prazo em destaque"
          quando="Para o que tem data e urgência: sessão, impugnação, vencimento de certidão. O prazo vem primeiro, porque é o que faz agir."
        >
          <Bloco agente="Alguma certidão vence antes da sessão?" nota="Sessão em 14/10/2026, às 09:00">
            <div className="flex items-start gap-3">
              <CircleAlertIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-warning-strong" />
              <div className="flex flex-col gap-1 text-[13px] leading-[19px]">
                <p className="font-medium text-warning-strong">Sim: 1 certidão vence antes da sessão.</p>
                <p className="text-muted-foreground">
                  Certidão negativa de débitos trabalhistas, válida até <b className="font-semibold">02/10/2026</b>, 12
                  dias antes da sessão. As outras 4 seguem válidas.
                </p>
              </div>
            </div>
          </Bloco>
        </Exemplo>

        <Exemplo
          titulo="Ação esperando aprovação"
          quando="Quando o agente quer mudar a licitação e a configuração dele pede aprovação. Nada muda até alguém responder, e a resposta fica na Auditoria."
        >
          <Bloco agente="Score alto vai para análise" acoes={false}>
            <div className="flex flex-col gap-3">
              <p className="flex flex-wrap items-center gap-1.5 text-[13px] leading-[19px]">
                Quero mover esta licitação de
                <Badge variant="secondary" className="font-normal">Recomendadas</Badge>
                para
                <Badge variant="secondary" className="font-normal">Em análise</Badge>
              </p>
              <p className="text-[13px] leading-[19px] text-muted-foreground">Score 78 de 100, acima do corte de 70.</p>
              <div className="flex gap-2">
                <Button size="xs" variant="outline" className="shadow-none">
                  Recusar
                </Button>
                <Button size="xs">Aprovar</Button>
              </div>
            </div>
          </Bloco>
        </Exemplo>

        <Exemplo
          titulo="Trabalhando"
          quando="Enquanto o agente lê o edital. A pessoa pode sair da tela: o trabalho continua e o resultado aparece quando ficar pronto."
        >
          <Bloco agente="Análise técnica" acoes={false}>
            <div className="flex flex-col gap-3">
              <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <Spinner className="size-3.5" />
                Lendo o Termo de referência e comparando com o catálogo…
              </p>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3.5 w-4/5" />
                <Skeleton className="h-3.5 w-3/5" />
              </div>
            </div>
          </Bloco>
        </Exemplo>

        <Exemplo
          titulo="Não encontrou"
          quando="Quando o edital não fala do assunto. O agente diz onde procurou, em vez de deixar o bloco vazio ou inventar."
        >
          <Bloco agente="Exige visita técnica?" nota="Procurou no edital e anexos, no termo de referência e na minuta do contrato">
            <p className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="secondary" className="font-normal">Não encontrado</Badge>
              O edital não fala de visita técnica. Sem menção, vale como não exigida.
            </p>
          </Bloco>
        </Exemplo>

        <Exemplo
          titulo="Não deu certo"
          quando="Quando o agente falhou: arquivo ilegível, documento que não abriu, erro na leitura. Diz o que houve e oferece tentar de novo, no próprio bloco."
        >
          <Bloco agente="Checklist de habilitação" acoes={false}>
            <div className="flex items-start gap-3">
              <CircleAlertIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-destructive" />
              <div className="flex flex-col items-start gap-2 text-[13px] leading-[19px]">
                <p>
                  Não consegui ler o <b className="font-semibold">Anexo III</b>: o PDF está digitalizado sem texto.
                </p>
                <Button size="xs" variant="outline" className="shadow-none">
                  <RotateCcwIcon data-icon="inline-start" />
                  Tentar de novo
                </Button>
              </div>
            </div>
          </Bloco>
        </Exemplo>
      </div>

      <section className="mt-8 flex flex-col gap-2.5">
        <div>
          <h2 className="text-sm font-semibold">Anatomia</h2>
          <p className="text-[13px] leading-[19px] text-muted-foreground">
            As partes do bloco, na ordem em que aparecem. Os nomes entre parênteses são os do design system.
          </p>
        </div>
        <div className="grid gap-4 min-[900px]:grid-cols-[minmax(0,1fr)_320px]">
          <AiWidget>
            <AiWidgetHeader>
              <AiWidgetTitle icon={<BotIcon aria-hidden />}>Nome do agente (AiWidgetTitle)</AiWidgetTitle>
              <AiWidgetActions>
                <Button size="xs" variant="outline" className="shadow-none">
                  Ações (AiWidgetActions)
                </Button>
              </AiWidgetActions>
            </AiWidgetHeader>
            <AiWidgetContent>
              <p className="text-[13px] leading-[19px]">
                O resultado em si (AiWidgetContent). O formato muda conforme o agente: resposta curta, lista, nota,
                tabela, parecer.
              </p>
            </AiWidgetContent>
            <AiWidgetNote>De onde saiu a resposta, e qualquer ressalva (AiWidgetNote).</AiWidgetNote>
          </AiWidget>
          <ul className="flex flex-col gap-2.5 text-[13px] leading-[19px]">
            {[
              ["Borda e fundo na cor da marca", "dizem que o conteúdo foi produzido por um agente antes de a pessoa ler uma linha."],
              ["Nome do agente", "é por ele que a pessoa liga o resultado a uma configuração que pode mudar."],
              ["Ações", "falam do resultado, não do componente: perguntar sobre ele, editar o agente que o produziu."],
              ["Fonte", "item e página do edital. No teste, foi a mudança que mais gerou confiança."],
            ].map(([t, d]) => (
              <li key={t as string} className={cn("rounded-lg border bg-card px-3 py-2.5")}>
                <b className="font-semibold">{t}</b>: <span className="text-muted-foreground">{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <ScaleIcon aria-hidden className="size-3.5" />
        Dados de exemplo. Nenhuma licitação real foi analisada para esta página.
      </p>
    </SettingsPage>
  )
}
