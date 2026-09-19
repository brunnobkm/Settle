import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

// Página de configurações no padrão do Linear: uma coluna centralizada de seções;
// cada seção tem título, descrição e uma caixa de linhas (título + descrição à
// esquerda, controle ou valor à direita). Para edição com pré-visualização ao lado,
// SettingsSplit + SettingsPreview.
// Composição: SettingsPage > SettingsPageDescription + SettingsSection >
// SettingsSectionTitle + SettingsSectionDescription + SettingsBox > SettingsRow >
// SettingsRowContent (SettingsRowTitle, SettingsRowDescription) + controle/SettingsRowValue.
// Listas editáveis (reordenar, itens fixos): settings-list.

const PAGE_WIDTHS = {
  default: "max-w-195",
  wide: "max-w-275",
  full: "max-w-none",
} as const

function SettingsPage({
  width = "default",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  /** default: coluna estreita (780px). wide: telas com pré-visualização (1100px). */
  width?: keyof typeof PAGE_WIDTHS
}) {
  return (
    <div
      data-slot="settings-page"
      data-width={width}
      className={cn("mx-auto w-full px-6 pt-10 pb-20", PAGE_WIDTHS[width], className)}
      {...props}
    />
  )
}

/** Texto de abertura da página (o que se configura aqui e para quem vale). */
function SettingsPageDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="settings-page-description"
      className={cn("mb-6.5 text-sm leading-[21px] text-muted-foreground", className)}
      {...props}
    />
  )
}

function SettingsSection({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="settings-section"
      className={cn("mb-7 last:mb-0", className)}
      {...props}
    />
  )
}

function SettingsSectionTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="settings-section-title"
      className={cn("mb-1 text-[15px] leading-snug font-semibold", className)}
      {...props}
    />
  )
}

function SettingsSectionDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="settings-section-description"
      className={cn("mb-2.5 text-[13px] leading-[19px] text-muted-foreground", className)}
      {...props}
    />
  )
}

/** Caixa com borda que agrupa linhas (SettingsRow) ou uma lista (SettingsList). */
function SettingsBox({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="settings-box"
      className={cn("overflow-hidden rounded-lg border bg-card text-card-foreground", className)}
      {...props}
    />
  )
}

/**
 * Linha da caixa: conteúdo à esquerda e controle à direita. Com asChild vira link
 * ou botão (linha inteira clicável, com hover).
 */
function SettingsRow({
  asChild = false,
  className,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div"
  return (
    <Comp
      data-slot="settings-row"
      data-interactive={asChild || undefined}
      className={cn(
        "flex min-h-14 w-full items-center gap-3.5 border-t px-4 py-2.5 text-left first:border-t-0",
        "data-interactive:cursor-pointer data-interactive:text-inherit data-interactive:no-underline data-interactive:outline-none data-interactive:hover:bg-muted data-interactive:focus-visible:bg-muted data-interactive:focus-visible:ring-3 data-interactive:focus-visible:ring-ring/50 data-interactive:focus-visible:ring-inset",
        "[&>svg]:shrink-0 [&>svg:not([class*='size-'])]:size-4 [&>svg]:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function SettingsRowContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="settings-row-content"
      className={cn("min-w-0 flex-1", className)}
      {...props}
    />
  )
}

function SettingsRowTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="settings-row-title"
      className={cn("text-sm leading-5 font-medium", className)}
      {...props}
    />
  )
}

function SettingsRowDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="settings-row-description"
      className={cn("text-[12.5px] leading-[18px] text-muted-foreground", className)}
      {...props}
    />
  )
}

/** Resumo do valor atual, à direita (ex.: "7 etapas", "Padrão"). */
function SettingsRowValue({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="settings-row-value"
      className={cn("flex-none text-[13px] text-muted-foreground", className)}
      {...props}
    />
  )
}

/** Duas colunas: edição à esquerda (380px) e pré-visualização à direita (empilha abaixo de 1000px). */
function SettingsSplit({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="settings-split"
      className={cn(
        "grid grid-cols-[minmax(0,1fr)] gap-6 min-[1000px]:grid-cols-[minmax(0,380px)_minmax(0,1fr)]",
        className
      )}
      {...props}
    />
  )
}

/** Coluna da pré-visualização: acompanha a rolagem. */
function SettingsPreview({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="settings-preview"
      className={cn("sticky top-4 self-start", className)}
      {...props}
    />
  )
}

/**
 * Cabeçalho da pré-visualização: rótulo em caixa alta (`label`) e, à direita, os
 * controles passados como filhos (ex.: escolher o exemplo mostrado).
 */
function SettingsPreviewHeader({
  label,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { label: React.ReactNode }) {
  return (
    <div
      data-slot="settings-preview-header"
      className={cn("mb-2 flex min-h-8 items-center gap-2", className)}
      {...props}
    >
      <span className="text-xs font-semibold tracking-wider whitespace-nowrap text-muted-foreground uppercase">{label}</span>
      {children != null && <div className="ml-auto flex items-center gap-2">{children}</div>}
    </div>
  )
}

export {
  SettingsBox,
  SettingsPage,
  SettingsPageDescription,
  SettingsPreview,
  SettingsPreviewHeader,
  SettingsRow,
  SettingsRowContent,
  SettingsRowDescription,
  SettingsRowTitle,
  SettingsRowValue,
  SettingsSection,
  SettingsSectionDescription,
  SettingsSectionTitle,
  SettingsSplit,
}
