"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"

// Campo de texto com tokens: um trecho do texto é um objeto (ex.: uma variável,
// uma menção), não uma palavra solta. O valor é texto com os tokens escritos como
// {{chave}}; no campo cada token aparece como um chip que sai inteiro ao apagar.
// Uma tecla (padrão "/") abre um menu na posição do cursor; o conteúdo do menu vem
// do consumidor, que insere tokens com api.insert(chave). Também serve de campo de
// uma linha (singleLine), com Enter enviando. Todo o texto vem por props.
//
// O campo é não controlado: defaultValue monta o conteúdo, onValueChange avisa das
// mudanças. Para trocar o conteúdo de fora, use a ref (clear) ou mude a key.

type TokenFieldTone = "default" | "warning" | "destructive"

type TokenFieldToken = {
  label: string
  tone?: TokenFieldTone
  /** Texto de apoio do chip (title). */
  title?: string
}

type TokenFieldMenuApi = {
  /** Insere o token onde estava o cursor e fecha o menu. */
  insert: (key: string, token?: TokenFieldToken) => void
  close: () => void
}

type TokenFieldHandle = {
  focus: () => void
  /** Insere o token no cursor (ou no fim, se o foco estiver fora do campo). */
  insertToken: (key: string, token?: TokenFieldToken) => void
  openMenu: () => void
  closeMenu: () => void
  clear: () => void
  getValue: () => string
}

const TOKEN_PATTERN = /\{\{([\w-]+)\}\}/g

const TOKEN_TONE: Record<TokenFieldTone, string> = {
  default: "bg-primary/10 text-primary",
  warning: "bg-warning/10 text-warning-strong",
  destructive: "bg-destructive/10 text-destructive",
}

const TOKEN_BASE =
  "mx-px inline-flex items-center rounded-md px-1.5 align-baseline text-[13px] leading-5 font-semibold whitespace-nowrap"

function tokenChipClassName(tone: TokenFieldTone = "default") {
  return cn(TOKEN_BASE, TOKEN_TONE[tone])
}

/** Chip de token fora do campo (leitura), com o mesmo visual do campo. */
function TokenChip({
  tone = "default",
  className,
  ...props
}: React.ComponentProps<"span"> & { tone?: TokenFieldTone }) {
  return (
    <span
      data-slot="token-chip"
      data-tone={tone}
      className={cn(tokenChipClassName(tone), className)}
      {...props}
    />
  )
}

/** Texto com tokens em leitura: {{chave}} vira chip; quebras de linha são mantidas. */
function TokenText({
  value,
  getToken,
  renderToken,
}: {
  value: string
  getToken: (key: string) => TokenFieldToken
  /** Troca o chip padrão (ex.: para envolver num tooltip). */
  renderToken?: (key: string, token: TokenFieldToken) => React.ReactNode
}) {
  const parts = value.split(TOKEN_PATTERN)
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          const token = getToken(part)
          return (
            <React.Fragment key={i}>
              {renderToken ? (
                renderToken(part, token)
              ) : (
                <TokenChip tone={token.tone} title={token.title}>
                  {token.label}
                </TokenChip>
              )}
            </React.Fragment>
          )
        }
        return part.split("\n").map((line, j) => (
          <React.Fragment key={`${i}-${j}`}>
            {j > 0 && <br />}
            {line}
          </React.Fragment>
        ))
      })}
    </>
  )
}

function createChip(key: string, token: TokenFieldToken) {
  const span = document.createElement("span")
  span.contentEditable = "false"
  span.dataset.token = key
  span.dataset.tone = token.tone ?? "default"
  span.className = tokenChipClassName(token.tone)
  if (token.title) span.title = token.title
  span.textContent = token.label
  return span
}

function fillField(
  field: HTMLElement,
  value: string,
  getToken: (key: string) => TokenFieldToken
) {
  field.replaceChildren()
  value.split(TOKEN_PATTERN).forEach((part, i) => {
    if (i % 2 === 1) {
      field.append(createChip(part, getToken(part)))
      return
    }
    part.split("\n").forEach((line, j) => {
      if (j > 0) field.append(document.createElement("br"))
      if (line) field.append(document.createTextNode(line))
    })
  })
}

function readField(node: Node): string {
  let out = ""
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      out += (child.nodeValue ?? "").replace(/ /g, " ")
    } else if (child instanceof HTMLElement) {
      if (child.dataset.token) out += `{{${child.dataset.token}}}`
      else if (child.tagName === "BR") out += "\n"
      else if (child.tagName === "DIV" || child.tagName === "P") out += `\n${readField(child)}`
      else out += readField(child)
    }
  })
  return out
}

function TokenField({
  ref,
  defaultValue = "",
  onValueChange,
  getToken,
  placeholder,
  trigger = "/",
  menu,
  singleLine = false,
  onSubmit,
  disabled = false,
  menuClassName,
  className,
  onKeyDown,
  onPaste,
  onInput,
  ...props
}: Omit<React.ComponentProps<"div">, "ref" | "defaultValue" | "onSubmit"> & {
  ref?: React.Ref<TokenFieldHandle>
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Como mostrar cada token (rótulo, tom, title). */
  getToken: (key: string) => TokenFieldToken
  placeholder?: string
  /** Tecla que abre o menu. null: sem menu pela tecla. */
  trigger?: string | null
  /** Conteúdo do menu (lista de tokens, criação...). */
  menu?: (api: TokenFieldMenuApi) => React.ReactNode
  /** Uma linha: Enter chama onSubmit (Shift+Enter quebra a linha). */
  singleLine?: boolean
  onSubmit?: () => void
  disabled?: boolean
  menuClassName?: string
}) {
  const fieldRef = React.useRef<HTMLDivElement>(null)
  const rangeRef = React.useRef<Range | null>(null)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const getTokenRef = React.useRef(getToken)
  const onValueChangeRef = React.useRef(onValueChange)

  React.useEffect(() => {
    getTokenRef.current = getToken
    onValueChangeRef.current = onValueChange
  })

  // monta o conteúdo uma vez; depois o DOM é do navegador
  React.useLayoutEffect(() => {
    if (fieldRef.current) fillField(fieldRef.current, defaultValue, getTokenRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const emit = React.useCallback(() => {
    const field = fieldRef.current
    if (!field) return
    // campo vazio de verdade: sem o <br> que o navegador deixa, o placeholder volta
    if (!field.textContent && !field.querySelector("[data-token]")) field.replaceChildren()
    onValueChangeRef.current?.(readField(field))
  }, [])

  const saveRange = () => {
    const field = fieldRef.current
    const sel = window.getSelection()
    if (!field || !sel || !sel.rangeCount) return
    const range = sel.getRangeAt(0)
    rangeRef.current = field.contains(range.startContainer) ? range.cloneRange() : null
  }

  const placeCaretAtEnd = () => {
    const field = fieldRef.current
    const sel = window.getSelection()
    if (!field || !sel) return
    const range = document.createRange()
    range.selectNodeContents(field)
    range.collapse(false)
    sel.removeAllRanges()
    sel.addRange(range)
    rangeRef.current = range.cloneRange()
  }

  const insertToken = React.useCallback(
    (key: string, token?: TokenFieldToken) => {
      const field = fieldRef.current
      const sel = window.getSelection()
      if (!field || !sel) return
      field.focus()
      let range = rangeRef.current
      if (!range || !field.contains(range.startContainer)) {
        range = document.createRange()
        range.selectNodeContents(field)
        range.collapse(false)
      }
      range.deleteContents()
      const chip = createChip(key, token ?? getTokenRef.current(key))
      const space = document.createTextNode(" ")
      range.insertNode(space)
      range.insertNode(chip)
      // o cursor vai para depois do espaço: senão a próxima letra entra antes do chip
      const after = document.createRange()
      after.setStartAfter(space)
      after.collapse(true)
      sel.removeAllRanges()
      sel.addRange(after)
      rangeRef.current = after.cloneRange()
      setMenuOpen(false)
      emit()
    },
    [emit]
  )

  const openMenu = React.useCallback(() => {
    if (!menu) return
    const field = fieldRef.current
    if (!field) return
    if (document.activeElement !== field) field.focus()
    const sel = window.getSelection()
    const inside = sel && sel.rangeCount && field.contains(sel.getRangeAt(0).startContainer)
    if (inside) saveRange()
    else placeCaretAtEnd()
    setMenuOpen(true)
  }, [menu])

  React.useImperativeHandle(
    ref,
    () => ({
      focus: () => fieldRef.current?.focus(),
      insertToken,
      openMenu,
      closeMenu: () => setMenuOpen(false),
      clear: () => {
        fieldRef.current?.replaceChildren()
        rangeRef.current = null
        emit()
      },
      getValue: () => (fieldRef.current ? readField(fieldRef.current) : ""),
    }),
    [emit, insertToken, openMenu]
  )

  // a âncora do menu é o cursor: o menu nasce onde a pessoa está escrevendo
  const anchor = React.useMemo(
    () => ({
      current: {
        getBoundingClientRect: () => {
          const rect = rangeRef.current?.getBoundingClientRect()
          if (rect && (rect.width || rect.height || rect.top)) return rect
          const field = fieldRef.current?.getBoundingClientRect()
          return field ?? new DOMRect()
        },
      },
    }),
    []
  )

  return (
    <Popover open={menuOpen} onOpenChange={setMenuOpen}>
      <PopoverAnchor virtualRef={anchor} />
      <div
        ref={fieldRef}
        data-slot="token-field"
        role="textbox"
        aria-multiline={!singleLine}
        aria-disabled={disabled || undefined}
        aria-placeholder={placeholder}
        data-placeholder={placeholder}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={(e) => {
          emit()
          onInput?.(e)
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e)
          if (e.defaultPrevented) return
          if (trigger && menu && e.key === trigger) {
            e.preventDefault()
            saveRange()
            setMenuOpen(true)
            return
          }
          if (singleLine && e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            onSubmit?.()
          }
        }}
        onPaste={(e) => {
          onPaste?.(e)
          if (e.defaultPrevented) return
          // cola só o texto: formatação de fora não entra no campo
          e.preventDefault()
          const text = e.clipboardData.getData("text/plain")
          const sel = window.getSelection()
          if (!sel || !sel.rangeCount) return
          const range = sel.getRangeAt(0)
          range.deleteContents()
          const node = document.createTextNode(text)
          range.insertNode(node)
          range.setStartAfter(node)
          range.collapse(true)
          sel.removeAllRanges()
          sel.addRange(range)
          emit()
        }}
        className={cn(
          "w-full min-w-0 rounded-md border border-input bg-transparent px-3 text-sm text-foreground shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 dark:bg-input/30",
          "wrap-break-word whitespace-pre-wrap empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]",
          singleLine
            ? "max-h-30 min-h-9 overflow-y-auto py-2 leading-5"
            : "min-h-26 py-2.5 leading-[26px]",
          className
        )}
        {...props}
      />
      {menu && (
        <PopoverContent
          align="start"
          sideOffset={6}
          onCloseAutoFocus={(e) => {
            e.preventDefault()
            // volta para onde estava o cursor
            const field = fieldRef.current
            const sel = window.getSelection()
            if (!field || !sel) return
            field.focus()
            if (rangeRef.current) {
              sel.removeAllRanges()
              sel.addRange(rangeRef.current)
            }
          }}
          className={cn("max-h-72 w-80 gap-0 overflow-y-auto p-1.5", menuClassName)}
        >
          {menu({ insert: insertToken, close: () => setMenuOpen(false) })}
        </PopoverContent>
      )}
    </Popover>
  )
}

export {
  TokenChip,
  TokenField,
  TokenText,
  tokenChipClassName,
  type TokenFieldHandle,
  type TokenFieldMenuApi,
  type TokenFieldToken,
  type TokenFieldTone,
}
