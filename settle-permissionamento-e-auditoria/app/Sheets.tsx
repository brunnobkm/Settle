// Painéis laterais da tela de equipe: "Convidar usuário" e "O que cada função faz".

import { useId, useState, type FormEvent } from "react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table"

import { avisar } from "./comum"
import { CAPACIDADES, FUNCOES, ORDEM_FUNCOES, type Funcao } from "./dados"

const CONTEUDO = "w-full gap-0 p-0 data-[side=right]:sm:max-w-110"
const CABECALHO = "gap-1.5 border-b px-6 pt-5.5 pb-4"
const TITULO = "pr-9 text-lg font-bold"
const DESCRICAO = "text-[13.5px]"
const CORPO = "flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5"

/* ------------------------------------------------------------------ */
/* Convidar usuário                                                    */
/* ------------------------------------------------------------------ */

export function SheetConvite({
  aberto,
  onAbertoChange,
  onConvidar,
}: {
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
  onConvidar: (dados: { nome: string; email: string; funcao: Funcao }) => void
}) {
  return (
    <Sheet open={aberto} onOpenChange={onAbertoChange}>
      <SheetContent className={CONTEUDO}>
        {/* o formulário monta a cada abertura, então sempre começa limpo */}
        <FormularioConvite onConvidar={onConvidar} />
      </SheetContent>
    </Sheet>
  )
}

function FormularioConvite({
  onConvidar,
}: {
  onConvidar: (dados: { nome: string; email: string; funcao: Funcao }) => void
}) {
  const id = useId()
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [funcao, setFuncao] = useState<Funcao>("somente-ver")

  function enviar(e: FormEvent) {
    e.preventDefault()
    const n = nome.trim()
    const em = email.trim()
    if (!n || !em) {
      avisar("Preencha nome e e-mail")
      return
    }
    onConvidar({ nome: n, email: em, funcao })
  }

  return (
    <form onSubmit={enviar} noValidate className="flex min-h-0 flex-1 flex-col">
      <SheetHeader className={CABECALHO}>
        <SheetTitle className={TITULO}>Convidar usuário</SheetTitle>
        <SheetDescription className={DESCRICAO}>
          A pessoa recebe um e-mail para definir a senha. A função pode ser ajustada depois.
        </SheetDescription>
      </SheetHeader>
      <FieldGroup className={`${CORPO} gap-4`}>
        <Field className="gap-1.5">
          <FieldLabel htmlFor={`${id}-nome`} className="text-[13px] font-semibold">
            Nome completo
          </FieldLabel>
          <Input
            id={`${id}-nome`}
            placeholder="Maria Silva"
            autoFocus
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </Field>
        <Field className="gap-1.5">
          <FieldLabel htmlFor={`${id}-email`} className="text-[13px] font-semibold">
            E-mail
          </FieldLabel>
          <Input
            id={`${id}-email`}
            type="email"
            placeholder="maria@acme.com.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <FieldSet className="gap-0">
          <FieldLegend variant="label" className="mb-1.5 text-[13px] font-semibold">
            Função
          </FieldLegend>
          <RadioGroup value={funcao} onValueChange={(v) => setFuncao(v as Funcao)} className="gap-2">
            {ORDEM_FUNCOES.map((f) => (
              <FieldLabel key={f} htmlFor={`${id}-${f}`} className="rounded-lg!">
                <Field orientation="horizontal" className="gap-2.5 px-3! py-2.75!">
                  <RadioGroupItem value={f} id={`${id}-${f}`} />
                  <FieldContent className="gap-0.5">
                    <FieldTitle className="text-[13.5px] font-semibold">{FUNCOES[f].rotulo}</FieldTitle>
                    <FieldDescription className="text-xs leading-snug">{FUNCOES[f].descricao}</FieldDescription>
                  </FieldContent>
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
        </FieldSet>
      </FieldGroup>
      <SheetFooter className="mt-0 flex-row justify-end gap-2.5 border-t bg-muted/40 px-6 py-4">
        <SheetClose asChild>
          <Button type="button" variant="ghost">
            Cancelar
          </Button>
        </SheetClose>
        <Button type="submit" className="px-3.5">
          Enviar convite
        </Button>
      </SheetFooter>
    </form>
  )
}

/* ------------------------------------------------------------------ */
/* O que cada função faz                                               */
/* ------------------------------------------------------------------ */

function ChipEscopo({ todas }: { todas: boolean }) {
  return (
    <Badge
      variant={todas ? "success" : "warning"}
      className="h-auto border-current/25 px-2 py-0.5 text-[11px] font-semibold"
    >
      {todas ? "Todas" : "Só as suas"}
    </Badge>
  )
}

function TabelaDeCapacidades({ funcao }: { funcao: Funcao }) {
  return (
    <Table className="mt-2.5">
      {CAPACIDADES.map(({ area, itens }) => {
        const liberadas = itens.filter((it) => it[funcao] !== "none")
        if (!liberadas.length) return null
        return (
          <TableBody key={area} className="[&_tr:last-child]:border-t">
            <TableRow className="border-0 hover:bg-transparent">
              <TableHead
                colSpan={2}
                scope="colgroup"
                className="h-auto px-0 pt-3.5 pb-1.25 text-[10.5px] font-bold tracking-wider text-muted-foreground uppercase"
              >
                {area}
              </TableHead>
            </TableRow>
            {liberadas.map((it) => (
              <TableRow key={it.acao} className="border-t border-b-0 hover:bg-transparent">
                <TableCell className="px-0 py-2 text-[13px] whitespace-normal text-foreground/80">{it.acao}</TableCell>
                <TableCell className="w-px py-2 pr-0 pl-2.5 text-right">
                  <ChipEscopo todas={it[funcao] === "all"} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        )
      })}
    </Table>
  )
}

export function SheetFuncoes({
  aberto,
  onAbertoChange,
}: {
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
}) {
  return (
    <Sheet open={aberto} onOpenChange={onAbertoChange}>
      <SheetContent className={CONTEUDO}>
        <SheetHeader className={CABECALHO}>
          <SheetTitle className={TITULO}>O que cada função faz</SheetTitle>
          <SheetDescription className={DESCRICAO}>
            As 4 funções são fixas nesta fase. Cada pessoa recebe uma.
          </SheetDescription>
        </SheetHeader>
        <div className={`${CORPO} gap-1.5`}>
          <p className="text-[13.5px] leading-relaxed text-foreground/80">
            Expanda uma função para ver o resumo e a lista completa das ações que ela libera. <ChipEscopo todas /> =
            acesso a todas as licitações; <ChipEscopo todas={false} /> = apenas onde a pessoa é responsável.
          </p>
          <Accordion type="multiple" defaultValue={["somente-ver"]} className="border-y">
            {ORDEM_FUNCOES.map((f) => (
              <AccordionItem key={f} value={f}>
                <AccordionTrigger className="items-center px-0.5 py-3.5 text-[14.5px] font-semibold hover:no-underline">
                  {FUNCOES[f].rotulo}
                </AccordionTrigger>
                <AccordionContent className="px-0.5 pb-4">
                  <p className="text-[13.5px] leading-relaxed text-foreground/80">{FUNCOES[f].descricao}</p>
                  <TabelaDeCapacidades funcao={f} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </SheetContent>
    </Sheet>
  )
}
