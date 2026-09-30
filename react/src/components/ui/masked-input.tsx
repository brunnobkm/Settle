import * as React from "react"

import { Input } from "@/components/ui/input"

// Campo com máscara e validação dos formatos brasileiros. A máscara é aplicada
// enquanto a pessoa digita (e ao colar); a validação fica em `validarMascara`,
// para a tela decidir quando mostrar o erro (normalmente ao sair do campo e ao enviar).
//
//   <MaskedInput mask="cpf" value={cpf} onValueChange={(v) => setCpf(v)} />
//   const erro = validarMascara("cpf", cpf)   // null quando está certo
//
// Máscaras: cpf, cnpj, telefone, cep, data, moeda, inteiro.
// "moeda" guarda o texto formatado (R$ 1.234,56); use `moedaParaNumero` para o valor.

type Mascara = "cpf" | "cnpj" | "telefone" | "cep" | "data" | "moeda" | "inteiro"

const digitos = (v: string) => v.replace(/\D/g, "")

function aplicarPadrao(d: string, padrao: string) {
  let out = ""
  let i = 0
  for (const c of padrao) {
    if (i >= d.length) break
    if (c === "0") out += d[i++]
    else out += c
  }
  return out
}

function formatarMoeda(d: string) {
  const centavos = Number(d.replace(/^0+/, "") || "0")
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

/** Aplica a máscara a qualquer texto (útil para formatar valores vindos de dados). */
function formatarMascara(mask: Mascara, valor: string | number, opts: { maxDigitos?: number } = {}) {
  if (mask === "moeda" && typeof valor === "number") return formatarMoeda(String(Math.round(valor * 100)))
  const d = digitos(String(valor))
  switch (mask) {
    case "cpf":
      return aplicarPadrao(d.slice(0, 11), "000.000.000-00")
    case "cnpj":
      return aplicarPadrao(d.slice(0, 14), "00.000.000/0000-00")
    case "telefone":
      return d.length <= 10 ? aplicarPadrao(d, "(00) 0000-0000") : aplicarPadrao(d.slice(0, 11), "(00) 00000-0000")
    case "cep":
      return aplicarPadrao(d.slice(0, 8), "00000-000")
    case "data":
      return aplicarPadrao(d.slice(0, 8), "00/00/0000")
    case "moeda":
      return d ? formatarMoeda(d.slice(0, 13)) : ""
    case "inteiro":
      return opts.maxDigitos ? d.slice(0, opts.maxDigitos) : d
  }
}

function moedaParaNumero(v: string) {
  return Number(digitos(v) || "0") / 100
}

function cpfValido(v: string) {
  const d = digitos(v)
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false
  const dv = (n: number) => {
    let soma = 0
    for (let i = 0; i < n; i++) soma += Number(d[i]) * (n + 1 - i)
    const r = (soma * 10) % 11
    return r === 10 ? 0 : r
  }
  return dv(9) === Number(d[9]) && dv(10) === Number(d[10])
}

function cnpjValido(v: string) {
  const d = digitos(v)
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false
  const dv = (n: number) => {
    const pesos = n === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const soma = pesos.reduce((s, p, i) => s + Number(d[i]) * p, 0)
    const r = soma % 11
    return r < 2 ? 0 : 11 - r
  }
  return dv(12) === Number(d[12]) && dv(13) === Number(d[13])
}

function dataValida(v: string) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v)
  if (!m) return false
  const [dia, mes, ano] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const dt = new Date(ano, mes - 1, dia)
  return dt.getFullYear() === ano && dt.getMonth() === mes - 1 && dt.getDate() === dia
}

type OpcoesValidacao = {
  obrigatorio?: boolean
  /** Para "moeda" e "inteiro". */
  min?: number
  max?: number
  /** Para "inteiro": quantidade exata de dígitos. */
  digitos?: number
  /** Para "telefone": exige celular (9 dígitos depois do DDD). */
  celular?: boolean
}

/** Mensagem de erro em linguagem simples, ou null quando o valor está certo. */
function validarMascara(mask: Mascara, valor: string, o: OpcoesValidacao = {}): string | null {
  const d = digitos(valor)
  if (!d) return o.obrigatorio ? "Preencha este campo." : null
  switch (mask) {
    case "cpf":
      if (d.length < 11) return "O CPF tem 11 números."
      return cpfValido(d) ? null : "Este CPF não existe. Confira os números."
    case "cnpj":
      if (d.length < 14) return "O CNPJ tem 14 números."
      return cnpjValido(d) ? null : "Este CNPJ não existe. Confira os números."
    case "telefone": {
      if (d.length < 10) return "Digite o DDD e o número."
      if (Number(d.slice(0, 2)) < 11) return "DDD inválido."
      if (o.celular && (d.length !== 11 || d[2] !== "9")) return "Digite um celular: DDD e 9 dígitos começando com 9."
      return null
    }
    case "cep":
      return d.length === 8 ? null : "O CEP tem 8 números."
    case "data":
      return dataValida(valor) ? null : "Data inválida. Use dia/mês/ano."
    case "moeda": {
      const n = moedaParaNumero(valor)
      const fmt = (x: number) => formatarMascara("moeda", x)
      if (o.min !== undefined && n < o.min) return `O valor mínimo é ${fmt(o.min)}.`
      if (o.max !== undefined && n > o.max) return `O valor máximo é ${fmt(o.max)}.`
      return null
    }
    case "inteiro": {
      if (o.digitos && d.length !== o.digitos) return `Digite os ${o.digitos} números.`
      const n = Number(d)
      if (o.min !== undefined && n < o.min) return `Use um número a partir de ${o.min}.`
      if (o.max !== undefined && n > o.max) return `Use um número até ${o.max}.`
      return null
    }
  }
}

const PLACEHOLDER: Record<Mascara, string> = {
  cpf: "000.000.000-00",
  cnpj: "00.000.000/0000-00",
  telefone: "(00) 00000-0000",
  cep: "00000-000",
  data: "dd/mm/aaaa",
  moeda: "R$ 0,00",
  inteiro: "",
}
const AUTOCOMPLETE: Partial<Record<Mascara, string>> = { telefone: "tel-national", cep: "postal-code" }

type MaskedInputProps = Omit<React.ComponentProps<typeof Input>, "value" | "defaultValue" | "onChange" | "type"> & {
  mask: Mascara
  value?: string
  defaultValue?: string
  /** Recebe o texto já formatado. */
  onValueChange?: (valor: string) => void
  /** Para "inteiro": limite de dígitos. */
  maxDigitos?: number
}

function MaskedInput({ mask, value, defaultValue, onValueChange, maxDigitos, className, ...props }: MaskedInputProps) {
  const [interno, setInterno] = React.useState(() => formatarMascara(mask, defaultValue ?? "", { maxDigitos }))
  const atual = value !== undefined ? formatarMascara(mask, value, { maxDigitos }) : interno
  return (
    <Input
      data-slot="masked-input"
      data-mask={mask}
      inputMode="numeric"
      autoComplete={AUTOCOMPLETE[mask] ?? "off"}
      placeholder={PLACEHOLDER[mask] || undefined}
      className={mask === "moeda" ? `text-right tabular-nums ${className ?? ""}` : `tabular-nums ${className ?? ""}`}
      {...props}
      value={atual}
      onChange={(e) => {
        const v = formatarMascara(mask, e.target.value, { maxDigitos })
        if (value === undefined) setInterno(v)
        onValueChange?.(v)
      }}
    />
  )
}

export {
  MaskedInput,
  cnpjValido,
  cpfValido,
  formatarMascara,
  moedaParaNumero,
  validarMascara,
  type Mascara,
  type MaskedInputProps,
  type OpcoesValidacao,
}
