// Início do protótipo "Exportar": links para as telas (Hoje x Proposta), o roteiro
// de teste com os 7 problemas e as decisões em aberto. Baixa um XLSX de exemplo.

import { ArrowUpRightIcon, DownloadIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { USUARIO_DA_EXPORTACAO, agoraFormatado, baixarArquivo, gerarLinhas, nomeDoArquivo } from "./exportacao/nucleo"

const TELAS = [
  { nome: "Recomendadas", pasta: "recomendadas", texto: "Lista paginada de cards, abas, busca, filtros, ação em lote." },
  { nome: "Em andamento (Kanban)", pasta: "kanban", texto: "Board por etapa, com filtros de Responsável e Estado." },
]

const ROTEIRO: { problema: string; hoje: string; proposta: string; tela: string }[] = [
  {
    problema: "O Exportar geral ignora filtros, abas e busca. Só exporta por data.",
    hoje: "Recomendadas › aba Ativas (3 filtros) › Exportar: só aparecem “Adicionadas hoje” e “Escolher período”.",
    proposta: "Nova opção “Exportar tudo filtrado”: usa aba, busca e filtros, com todas as páginas. Hoje e período também respeitam o resultado atual.",
    tela: "recomendadas",
  },
  {
    problema: "Para exportar um resultado filtrado, é preciso usar Selecionar tudo, que é lento.",
    hoje: "Marque um card › Selecionar tudo: “Carregando licitações do filtro atual...” por ~40 s.",
    proposta: "Não precisa mais: “Exportar tudo filtrado” resolve direto. E Selecionar tudo marca na hora as licitações já carregadas na tela, com o aviso “Selecionar todas as 1.108 do filtro?”.",
    tela: "recomendadas",
  },
  {
    problema: "A exportação em lote divide o resultado em vários arquivos (~200 por arquivo).",
    hoje: "Com 1.108 selecionadas › Exportar: “600 de 1.108 exportadas” e depois “sucesso em 6 arquivos”.",
    proposta: "Sempre 1 arquivo. Acima de 500 é preparado em segundo plano, com progresso e botão Baixar quando fica pronto.",
    tela: "recomendadas",
  },
  {
    problema: "A exportação em lote não pede confirmação nem deixa escolher o formato.",
    hoje: "Exportar na barra de lote começa na hora.",
    proposta: "Abre o mesmo modal em modo lote: mostra a quantidade e pede o formato (XLSX ou CSV) antes de começar.",
    tela: "recomendadas",
  },
  {
    problema: "O Kanban não permite exportar uma etapa específica.",
    hoje: "As colunas não têm menu.",
    proposta: "Menu “…” em cada coluna › Exportar esta etapa (modal já com a etapa e a contagem). No Exportar geral, “Exportar por etapa do fluxo” com várias colunas.",
    tela: "kanban",
  },
  {
    problema: "O modal de exportação é diferente entre Recomendadas e Kanban.",
    hoje: "Recomendadas tem “Formato do arquivo”; o Kanban não.",
    proposta: "Um único componente nas duas telas, sempre com formato. Só muda o que faz sentido na tela (ex.: etapas no Kanban).",
    tela: "kanban",
  },
  {
    problema: "Nenhum fluxo mostra a quantidade antes de exportar.",
    hoje: "Nenhum modal diz quantas licitações vão no arquivo.",
    proposta: "Resumo “O que será exportado” com quantidade, aba, busca e filtros; o botão diz “Exportar 241 licitações”. Com zero, o botão fica desativado e explica o motivo.",
    tela: "recomendadas",
  },
]

async function baixarExemplo(formato: "xlsx" | "csv") {
  await baixarArquivo({
    nome: nomeDoArquivo("recomendadas", formato).replace("licitacoes", "exemplo_licitacoes"),
    formato,
    sobre: [
      ["Data e hora da exportação", agoraFormatado()],
      ["Usuário", USUARIO_DA_EXPORTACAO],
      ["Espaço de trabalho", "Demos"],
      ["Tela", "Recomendadas"],
      ["Aba", "Ativas"],
      ["Filtros", "Situação: Ativas · Estado: SP · Responsável: Alice Iglesias"],
      ["Seleção", "Tudo filtrado"],
      ["Total de licitações", "241"],
      ["Observação", "Arquivo único. Filtros congelados no momento do pedido."],
    ],
    linhas: gerarLinhas(241, { tela: "recomendadas", comEtapaAtual: true, fixos: { estado: "SP", responsavel: "Alice Iglesias" } }),
  })
}

export default function App() {
  return (
    <main className="mx-auto max-w-240 px-4 py-10 sm:px-6">
      <p className="text-sm font-medium text-muted-foreground">Settle · protótipo</p>
      <h1 className="mt-1 text-4xl font-bold tracking-tight">Melhoria do Exportar</h1>
      <p className="mt-3 max-w-170 text-[15px] text-muted-foreground">
        Cada tela tem uma chave <strong className="font-semibold text-foreground">Hoje | Proposta</strong> no canto superior
        direito. “Hoje” reproduz a produção, com as esperas e mensagens reais; “Proposta” mostra a nova versão. Nada aqui
        toca a plataforma de verdade: os dados são fictícios.
      </p>

      <section aria-labelledby="telas" className="mt-8">
        <h2 id="telas" className="text-lg font-semibold">
          Telas
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {TELAS.map((t) => (
            <Card key={t.pasta} className="gap-3 py-4">
              <CardHeader>
                <CardTitle>{t.nome}</CardTitle>
                <CardDescription>{t.texto}</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <a href={`${t.pasta}/?v=hoje`}>Hoje</a>
                </Button>
                <Button asChild size="sm">
                  <a href={`${t.pasta}/?v=proposta`}>
                    Proposta <ArrowUpRightIcon data-icon="inline-end" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="roteiro" className="mt-10">
        <h2 id="roteiro" className="text-lg font-semibold">
          Roteiro de teste: os 7 problemas
        </h2>
        <ol className="mt-3 flex flex-col gap-3">
          {ROTEIRO.map((r, i) => (
            <li key={i} className="rounded-lg border bg-card p-4">
              <div className="flex items-start gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{r.problema}</p>
                  <dl className="mt-2 grid gap-2 text-[13px] sm:grid-cols-2">
                    <div>
                      <dt>
                        <a href={`${r.tela}/?v=hoje`} className="underline-offset-2 hover:underline">
                          <Badge variant="outline">Hoje</Badge>
                        </a>
                      </dt>
                      <dd className="mt-1 text-muted-foreground">{r.hoje}</dd>
                    </div>
                    <div>
                      <dt>
                        <a href={`${r.tela}/?v=proposta`}>
                          <Badge>Proposta</Badge>
                        </a>
                      </dt>
                      <dd className="mt-1 text-muted-foreground">{r.proposta}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="extras" className="mt-10 grid gap-3 sm:grid-cols-2">
        <Card className="gap-3 py-4">
          <CardHeader>
            <CardTitle id="extras">Arquivo de exemplo</CardTitle>
            <CardDescription>
              241 licitações da aba Ativas (SP, Alice). Primeira aba “Sobre esta exportação” com data, usuário e filtros.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button size="sm" onClick={() => baixarExemplo("xlsx")}>
              <DownloadIcon data-icon="inline-start" /> Baixar XLSX
            </Button>
            <Button size="sm" variant="outline" onClick={() => baixarExemplo("csv")}>
              CSV
            </Button>
          </CardContent>
        </Card>
        <Card className="gap-3 py-4">
          <CardHeader>
            <CardTitle>Decisões em aberto e testes</CardTitle>
            <CardDescription>
              No botão de engrenagem ao lado da chave: a) onde fica “Exportar esta etapa” (Kanban); b) coluna “Etapa atual” no
              arquivo de Recomendadas; simular falha; encurtar as esperas. Métricas no console, como “[Amplitude]”.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    </main>
  )
}
