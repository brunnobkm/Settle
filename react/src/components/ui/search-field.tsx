"use client"

import * as React from "react"
import { FunnelIcon, SearchIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

// Campo de busca com escopos: os campos escolhidos no menu do funil viram chips
// dentro do campo. O X fecha a busca (com onClose) ou limpa o texto.
// Atalho "/" para abrir ou focar a busca: useSearchShortcut.

type SearchFieldScope = { value: string; label: string }

type SearchFieldLabels = {
  placeholder?: string
  /** Nome do campo para leitores de tela. */
  input?: string
  /** Botão do funil. */
  scopeMenu?: string
  /** Título do menu de escopos. */
  scopeMenuTitle?: string
  /** Item que tira todos os escopos. */
  allScopes?: string
  close?: string
  clear?: string
  removeScope?: (scope: string) => string
  /** Texto do funil com escopos marcados. */
  scopeCount?: (count: number) => string
}

type SearchFieldProps = Omit<
  React.ComponentProps<typeof InputGroup>,
  "children" | "onChange"
> & {
  value: string
  onValueChange: (value: string) => void
  /** Campos em que dá para buscar. Sem isso, não há funil nem chips. */
  scopes?: SearchFieldScope[]
  selectedScopes?: string[]
  onSelectedScopesChange?: (scopes: string[]) => void
  /** Mostra o X de fechar (e Esc fecha). Sem isso, o X só limpa o texto. */
  onClose?: () => void
  inputRef?: React.Ref<HTMLInputElement>
  autoFocus?: boolean
  labels?: SearchFieldLabels
  /** Classes do campo de texto. */
  inputClassName?: string
}

const DEFAULT_LABELS: Required<SearchFieldLabels> = {
  placeholder: "Buscar...",
  input: "Buscar",
  scopeMenu: "Filtrar por propriedade",
  scopeMenuTitle: "Buscar em",
  allScopes: "Todos os campos",
  close: "Fechar busca",
  clear: "Limpar busca",
  removeScope: (scope) => `Remover ${scope}`,
  scopeCount: (count) =>
    `${count} ${count === 1 ? "selecionada" : "selecionadas"}`,
}

function SearchField({
  value,
  onValueChange,
  scopes,
  selectedScopes = [],
  onSelectedScopesChange,
  onClose,
  inputRef,
  autoFocus,
  labels,
  className,
  inputClassName,
  ...props
}: SearchFieldProps) {
  const text = { ...DEFAULT_LABELS, ...labels }
  const localRef = React.useRef<HTMLInputElement>(null)
  const setInputRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      localRef.current = node
      if (typeof inputRef === "function") inputRef(node)
      else if (inputRef) inputRef.current = node
    },
    [inputRef]
  )
  const scopeLabel = (key: string) =>
    scopes?.find((scope) => scope.value === key)?.label ?? key

  const toggleScope = (key: string) => {
    onSelectedScopesChange?.(
      selectedScopes.includes(key)
        ? selectedScopes.filter((k) => k !== key)
        : [...selectedScopes, key]
    )
    localRef.current?.focus()
  }

  const clear = () => {
    onValueChange("")
    localRef.current?.focus()
  }

  return (
    <InputGroup
      className={cn("h-auto min-h-8", className)}
      {...props}
    >
      <InputGroupAddon className="flex-wrap gap-1 py-1 pl-2.5">
        <SearchIcon />
        {selectedScopes.map((key) => (
          <span
            key={key}
            className="inline-flex items-center gap-1 rounded-md bg-foreground py-0.5 pr-1 pl-2 text-xs font-medium whitespace-nowrap text-background"
          >
            {scopeLabel(key)}
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={text.removeScope(scopeLabel(key))}
              className="size-4 rounded-sm text-background/70 hover:bg-background/20 hover:text-background"
              onClick={() => toggleScope(key)}
            >
              <XIcon />
            </Button>
          </span>
        ))}
      </InputGroupAddon>
      <InputGroupInput
        ref={setInputRef}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Escape") return
          if (onClose) onClose()
          else if (value) {
            event.preventDefault()
            clear()
          }
        }}
        placeholder={text.placeholder}
        aria-label={text.input}
        autoComplete="off"
        autoFocus={autoFocus}
        className={cn("h-8 min-w-40", inputClassName)}
      />
      <InputGroupAddon align="inline-end" className="gap-1 pr-1">
        {!!scopes?.length && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <InputGroupButton
                size="icon-xs"
                aria-label={
                  selectedScopes.length
                    ? `${text.scopeMenu} (${text.scopeCount(selectedScopes.length)})`
                    : text.scopeMenu
                }
                data-scoped={selectedScopes.length > 0}
                className="relative overflow-visible data-[scoped=true]:text-primary"
              >
                <FunnelIcon />
                {selectedScopes.length > 0 && (
                  <span
                    aria-hidden
                    className="absolute -top-0.75 -right-0.75 flex h-3.75 min-w-3.75 items-center justify-center rounded-full bg-primary px-0.75 text-[9px] leading-none font-bold text-primary-foreground ring-[1.5px] ring-background"
                  >
                    {selectedScopes.length}
                  </span>
                )}
              </InputGroupButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-82.5 w-61.5">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  {text.scopeMenuTitle}
                </DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={selectedScopes.length === 0}
                  onCheckedChange={() => {
                    onSelectedScopesChange?.([])
                    localRef.current?.focus()
                  }}
                  onSelect={(event) => event.preventDefault()}
                >
                  {text.allScopes}
                </DropdownMenuCheckboxItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {scopes.map((scope) => (
                  <DropdownMenuCheckboxItem
                    key={scope.value}
                    checked={selectedScopes.includes(scope.value)}
                    onCheckedChange={() => toggleScope(scope.value)}
                    onSelect={(event) => event.preventDefault()}
                  >
                    {scope.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {onClose ? (
          <InputGroupButton size="icon-xs" aria-label={text.close} onClick={onClose}>
            <XIcon />
          </InputGroupButton>
        ) : (
          value && (
            <InputGroupButton size="icon-xs" aria-label={text.clear} onClick={clear}>
              <XIcon />
            </InputGroupButton>
          )
        )}
      </InputGroupAddon>
    </InputGroup>
  )
}

/**
 * Atalho de teclado para abrir/focar a busca (padrão "/"). Não dispara enquanto a
 * pessoa digita num campo. `enabled: false` desliga (ex.: com a busca já aberta).
 */
function useSearchShortcut(
  onTrigger: () => void,
  { key = "/", enabled = true }: { key?: string; enabled?: boolean } = {}
) {
  const callback = React.useRef(onTrigger)
  React.useEffect(() => {
    callback.current = onTrigger
  })

  React.useEffect(() => {
    if (!enabled) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== key || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target instanceof Element ? event.target : null
      if (target?.closest("input, textarea, select, [contenteditable=true]")) return
      event.preventDefault()
      callback.current()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [key, enabled])
}

export {
  SearchField,
  useSearchShortcut,
  type SearchFieldLabels,
  type SearchFieldProps,
  type SearchFieldScope,
}
