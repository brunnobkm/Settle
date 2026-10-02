// Recomendadas (recorte): lista de cards com o selo de atualização no topo, ao lado do edital.
// Mesma regra do board: some ao abrir a licitação ou depois de 7 dias.

import { LicitacaoCardRoot, LicitacaoCardSegments } from "@/components/ui/licitacao-card"
import { Button } from "@/components/ui/button"

import { categoriaDoSegmento, formatarData, formatarMoeda, type Licitacao } from "./dados"
import { SeloAtualizacao } from "./Selo"

export function VistaRecomendadas({ licitacoes, onAbrir }: { licitacoes: Licitacao[]; onAbrir: (l: Licitacao) => void }) {
  return (
    <div className="mx-auto grid w-full max-w-215 gap-3 p-4">
      <h1 className="text-lg font-semibold">Recomendadas</h1>
      {licitacoes.map((l) => (
        <CardRecomendada key={l.id} l={l} onAbrir={() => onAbrir(l)} />
      ))}
    </div>
  )
}

function CardRecomendada({ l, onAbrir }: { l: Licitacao; onAbrir: () => void }) {
  return (
    <LicitacaoCardRoot className="gap-2.5 rounded-xl p-4 shadow-none">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs font-semibold">Edital {l.codigoEdital}</span>
        <SeloAtualizacao licitacaoId={l.id} />
      </div>
      <button type="button" onClick={onAbrir} className="text-left text-[15px] leading-snug font-semibold hover:underline">
        {l.titulo}
      </button>
      <p className="text-[13px] text-muted-foreground">{l.orgao}</p>
      <LicitacaoCardSegments segments={l.segmentos.map((s) => ({ label: s, category: categoriaDoSegmento(s) }))} />
      <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
        <span className="tabular-nums text-muted-foreground">
          Envio {l.dataEnvio ? formatarData(l.dataEnvio) : "sem data"} · {formatarMoeda(l.valorGlobal)} · {l.itensMatch} itens com match
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="shadow-none" data-nao-prototipado>
            Descartar
          </Button>
          <Button size="sm" data-nao-prototipado>
            Enviar para análise
          </Button>
        </div>
      </div>
    </LicitacaoCardRoot>
  )
}
