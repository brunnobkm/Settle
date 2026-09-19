// Modelo de e-mail de Compartilhar licitação: assunto e corpo com variáveis ("/" abre a
// lista), regra para variável vazia e pré-visualização com uma licitação real.

import { useRef, useState, type ReactNode } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  SettingsPage,
  SettingsPageDescription,
  SettingsPreview,
  SettingsPreviewHeader,
  SettingsSplit,
} from "@/components/ui/settings-page"
import { TokenField, type TokenFieldHandle } from "@/components/ui/token-field"

import { ListaDeVariaveis } from "./comum"
import { EMAIL_ASSUNTO, EMAIL_CORPO, LICS, nomeDaVariavel, valorDaLic, type Lic, type VazioEmail } from "./dados"
import { useConfig } from "./estado"
import { SeletorDeExemplo } from "./PaginaCard"

type Campo = "assunto" | "corpo"

// o modelo guarda {chave}; o campo de tokens do design system usa {{chave}}
const paraCampo = (t: string) => t.replace(/\{(\w+)\}/g, "{{$1}}")
const doCampo = (t: string) => t.replace(/\{\{(\w+)\}\}/g, "{$1}")
const token = (k: string) => ({ label: nomeDaVariavel(k) })

export function PaginaEmail() {
  const { email, setEmail, lic, auditar, confirmar } = useConfig()
  // rascunho: só vira o modelo da organização ao salvar
  const [assunto, setAssunto] = useState(email.assunto)
  const [corpo, setCorpo] = useState(email.corpo)
  const [versao, setVersao] = useState(0)
  const campos = { assunto: useRef<TokenFieldHandle>(null), corpo: useRef<TokenFieldHandle>(null) }
  // campo em que o botão Inserir variável põe o chip (o último que teve foco)
  const alvo = useRef<Campo>("corpo")

  function salvar() {
    setEmail((e) => ({ ...e, assunto, corpo, personalizado: true }))
    auditar("Modelo de e-mail", "Alterou o modelo de Compartilhar licitação")
    toast("Modelo salvo. Vale a partir do próximo compartilhamento")
  }

  function restaurar() {
    confirmar({
      titulo: "Restaurar o modelo padrão?",
      corpo: <p>Assunto e corpo voltam ao texto da Settle. O que você escreveu se perde.</p>,
      acao: "Restaurar",
      perigo: true,
      ok: () => {
        setEmail((e) => ({ ...e, assunto: EMAIL_ASSUNTO, corpo: EMAIL_CORPO, personalizado: false }))
        setAssunto(EMAIL_ASSUNTO)
        setCorpo(EMAIL_CORPO)
        setVersao((v) => v + 1)
        auditar("Modelo de e-mail", "Restaurou o padrão da Settle")
        toast("Modelo restaurado")
      },
    })
  }

  // lista de variáveis que abre no cursor (tecla "/" ou botão Inserir variável)
  const menu = ({ insert }: { insert: (key: string) => void }) => <ListaDeVariaveis onEscolher={(v) => insert(v.k)} />

  const L = LICS[lic]
  const vazias = new Set<string>()
  const pAssunto = preencher(assunto, L, email.vazio, vazias, false)
  const pCorpo = preencher(corpo, L, email.vazio, vazias, true)

  return (
    <SettingsPage width="wide">
      <SettingsPageDescription>
        O texto de Compartilhar licitação. Vale para Gmail e para Copiar texto, em todas as telas onde o card aparece.
      </SettingsPageDescription>
      <SettingsSplit>
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span id="rot-assunto" className="text-[13px] font-semibold">
              Assunto
            </span>
            <TokenField
              key={`a${versao}`}
              ref={campos.assunto}
              aria-labelledby="rot-assunto"
              singleLine
              defaultValue={paraCampo(assunto)}
              onValueChange={(v) => setAssunto(doCampo(v).replace(/\n/g, " "))}
              getToken={token}
              menu={menu}
              menuClassName={MENU}
              onFocus={() => (alvo.current = "assunto")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span id="rot-corpo" className="text-[13px] font-semibold">
              Corpo
            </span>
            <TokenField
              key={`c${versao}`}
              ref={campos.corpo}
              aria-labelledby="rot-corpo"
              defaultValue={paraCampo(corpo)}
              onValueChange={(v) => setCorpo(doCampo(v))}
              getToken={token}
              menu={menu}
              menuClassName={MENU}
              onFocus={() => (alvo.current = "corpo")}
              className="min-h-75 leading-6"
            />
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <span className="flex-1 text-xs text-muted-foreground">
                Digite <Kbd className="border">/</Kbd> para inserir uma variável
              </span>
              <Button variant="outline" onClick={() => campos[alvo.current].current?.openMenu()}>
                Inserir variável
              </Button>
            </div>
          </div>
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
            Quando a variável estiver vazia
            <NativeSelect
              value={email.vazio}
              onChange={(e) => setEmail((x) => ({ ...x, vazio: e.target.value as VazioEmail }))}
              className="w-full font-normal"
            >
              <NativeSelectOption value="texto">Escrever "não informado"</NativeSelectOption>
              <NativeSelectOption value="linha">Tirar a linha inteira do e-mail</NativeSelectOption>
            </NativeSelect>
          </label>
          <div className="flex flex-wrap gap-2">
            <Button onClick={salvar}>Salvar modelo</Button>
            <Button variant="outline" onClick={restaurar}>
              Restaurar padrão da Settle
            </Button>
          </div>
        </div>

        <SettingsPreview aria-live="polite">
          <SettingsPreviewHeader label="Pré-visualização">
            <SeletorDeExemplo id="email-exemplo" />
          </SettingsPreviewHeader>
          <div className="rounded-lg border bg-card text-sm leading-[22px]">
            <div className="border-b px-4 py-3 text-[13px] text-muted-foreground">
              Assunto: <b className="font-semibold text-foreground">{pAssunto}</b>
            </div>
            <div className="p-4 whitespace-pre-wrap">{pCorpo}</div>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {vazias.size
              ? `Vazio nesta licitação: ${[...vazias].map(nomeDaVariavel).join(", ")}.` +
                (email.vazio === "linha" ? " A linha foi tirada do e-mail." : "")
              : "Todas as variáveis têm valor nesta licitação."}
          </p>
        </SettingsPreview>
      </SettingsSplit>
    </SettingsPage>
  )
}

// a lista de variáveis já tem busca e rolagem próprias
const MENU = "max-h-none overflow-visible p-0"

/** Troca as variáveis pelos valores da licitação; anota as vazias. */
function preencher(tpl: string, L: Lic, vazio: VazioEmail, vazias: Set<string>, destacar: boolean): ReactNode[] {
  let linhas = tpl.split("\n")
  if (vazio === "linha") {
    linhas = linhas.filter((l) => {
      const vz = [...l.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).filter((k) => !valorDaLic(L, k))
      vz.forEach((k) => vazias.add(k))
      return !vz.length
    })
  }
  const saida: ReactNode[] = []
  linhas.forEach((linha, i) => {
    if (i) saida.push("\n")
    linha.split(/(\{\w+\})/g).forEach((parte, j) => {
      const m = parte.match(/^\{(\w+)\}$/)
      if (!m) {
        if (parte) saida.push(parte)
        return
      }
      const v = valorDaLic(L, m[1])
      const chave = `${i}-${j}`
      if (v) saida.push(destacar ? <b key={chave} className="font-semibold">{v}</b> : v)
      else {
        vazias.add(m[1])
        saida.push(
          destacar ? (
            <span key={chave} className="rounded-sm bg-warning/10 px-1 text-warning-strong">
              não informado
            </span>
          ) : (
            "não informado"
          )
        )
      }
    })
  })
  return saida
}
