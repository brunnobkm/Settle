import * as React from "react"

import { cn } from "@/lib/utils"

// Medidor circular de pontuação (ex.: score 0 a 100): anel com o valor no centro.
// A cor vem do tom (tokens do tema); o texto do centro repete o valor, então o
// estado nunca depende só da cor.

const TONES = {
  default: "text-primary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  muted: "text-muted-foreground",
} as const

type ScoreMeterProps = Omit<React.ComponentProps<"div">, "children"> & {
  value: number
  /** Valor máximo da escala. Padrão: 100. */
  max?: number
  /** Diâmetro em px. Padrão: 64. */
  size?: number
  /** Espessura do anel em px. Padrão: 6. */
  thickness?: number
  tone?: keyof typeof TONES
  /** Mostra "/max" abaixo do valor. Padrão: true. */
  showMax?: boolean
  /** Nome acessível. Padrão: "<valor> de <max>". */
  label?: string
}

function ScoreMeter({
  value,
  max = 100,
  size = 64,
  thickness = 6,
  tone = "default",
  showMax = true,
  label,
  className,
  style,
  ...props
}: ScoreMeterProps) {
  const clamped = Math.min(Math.max(value, 0), max)
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - clamped / max)
  const center = size / 2

  return (
    <div
      data-slot="score-meter"
      data-tone={tone}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={clamped}
      aria-label={label ?? `${clamped} de ${max}`}
      className={cn("relative flex-none", TONES[tone], className)}
      style={{ width: size, height: size, ...style }}
      {...props}
    >
      <svg
        aria-hidden
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="-rotate-90"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          className="stroke-muted"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-current transition-[stroke-dashoffset] duration-300"
        />
      </svg>
      <span
        aria-hidden
        className="absolute inset-0 flex flex-col items-center justify-center leading-none"
      >
        <b
          data-slot="score-meter-value"
          className="font-bold tabular-nums"
          style={{ fontSize: Math.round(size * 0.31) }}
        >
          {value}
        </b>
        {showMax && (
          <small
            data-slot="score-meter-max"
            className="mt-px font-semibold opacity-70"
            style={{ fontSize: Math.max(9, Math.round(size * 0.14)) }}
          >
            /{max}
          </small>
        )}
      </span>
    </div>
  )
}

export { ScoreMeter, type ScoreMeterProps }
