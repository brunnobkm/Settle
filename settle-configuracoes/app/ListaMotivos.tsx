// Lista de motivos, usada nas duas telas que têm motivo: descarte (em Motivos) e
// perda (em Etapas do funil, junto da etapa de saída, onde o resultado é registrado).
// Motivo já usado é arquivado, nunca excluído: o filtro e o dashboard continuam contando.

import type { ReactNode } from "react"
import { toast } from "sonner"
import { ArchiveIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { SettingsBox, SettingsSection, SettingsSectionDescription, SettingsSectionTitle } from "@/components/ui/settings-page"
import {
  SettingsList,
  SettingsListAdd,
  SettingsListItem,
  SettingsListItemActions,
  SettingsListItemMeta,
  SettingsListName,
  SettingsListNameInput,
} from "@/components/ui/settings-list"

import { avisarComDesfazer, BotaoIcone, MetaComDica } from "./comum"
import { fmt, mover, novoId, type Motivo, type TipoMotivo } from "./dados"
import { useConfig } from "./estado"
import { useFocoNoNome } from "./PaginaEtapas"

/**
 * Larguras das colunas na variante "colunas" (a proposta em comparação). Ficam aqui porque o
 * cabeçalho, que é montado na página, precisa usar exatamente as mesmas.
 */
export const COL = {
  tela: "w-32",
  desc: "w-44",
  uso: "w-28",
  acao: "w-8",
}

/** "1 licitação" ou "412 licitações": a mesma unidade em descarte e em perda. */
const emLicitacoes = (n: number) => `${fmt(n)} ${n === 1 ? "licitação" : "licitações"}`

export function ListaMotivos({
  tipo,
  area,
  dicaUso,
  acao,
  usoPassado,
  onde,
  reservados,
  bloquearUltimo,
  extras,
  fixo,
  cabecalho,
}: {
  tipo: TipoMotivo
  /** Área usada na Auditoria. */
  area: string
  /** Tooltip do número de usos, no "i" ao lado dele. Função quando depende do motivo. */
  dicaUso: ReactNode | ((x: Motivo) => ReactNode)
  /** O que a pessoa faz com o motivo: "descartes", "registros de perda". */
  acao: string
  /** Como as licitações que já usaram o motivo são descritas: "descartadas com este motivo". */
  usoPassado: string
  /** Onde o motivo continua aparecendo depois de arquivado. */
  onde: string
  /** Nomes que a lista não pode usar porque já são de um motivo fixo (ex.: "Outros"). */
  reservados?: string[]
  /** Quando existe, impede arquivar o último motivo da lista e explica o porquê no toast. */
  bloquearUltimo?: string
  /** Conteúdo extra na linha de cada motivo (ex.: escopo por tela no descarte). */
  extras?: (x: Motivo) => ReactNode
  /** Item fixo no fim da lista (ex.: "Outros" no descarte). */
  fixo?: ReactNode
  /** Linha de cabeçalho das colunas, montada na página com as mesmas larguras. */
  cabecalho?: ReactNode
}) {
  const { motivos, setMotivos, auditar, desauditar, confirmar } = useConfig()
  const focar = useFocoNoNome()

  const lista = motivos.filter((x) => x.tipo === tipo && !x.arq)
  // arquivado sem nenhuma licitação não aparece: não há histórico para preservar
  const arquivados = motivos.filter((x) => x.tipo === tipo && x.arq && x.uso > 0)
  const atualizar = (id: string, f: (m: Motivo) => Motivo) => setMotivos((l) => l.map((x) => (x.id === id ? f(x) : x)))

  /** Devolve a mensagem do conflito, ou undefined quando o nome está livre. */
  function nomeOcupado(v: string, fora?: Motivo) {
    const igual = (n: string) => n.toLowerCase() === v.toLowerCase()
    if (reservados?.some(igual)) return `"${v}" é um motivo fixo da plataforma. Escolha outro nome.`
    const outro = motivos.find((m) => m.tipo === tipo && m !== fora && igual(m.nome))
    if (!outro) return undefined
    return outro.arq
      ? `Já existe um motivo arquivado com esse nome. Restaure "${outro.nome}" em Arquivados.`
      : "Já existe um motivo com esse nome"
  }

  function alternarDescricao(x: Motivo) {
    atualizar(x.id, (m) => ({ ...m, desc: !m.desc }))
    auditar(area, `"${x.nome}" ${x.desc ? "deixou de pedir" : "passou a pedir"} descrição`)
    toast(
      x.desc
        ? "Descrição voltou a ser opcional neste motivo"
        : "A partir de agora, quem escolher este motivo precisa escrever o porquê"
    )
  }

  function renomear(x: Motivo, v: string) {
    const conflito = nomeOcupado(v, x)
    if (conflito) {
      toast(conflito)
      return false
    }
    auditar(area, `Renomeou "${x.nome}" para "${v}"`)
    atualizar(x.id, (m) => ({ ...m, nome: v }))
    toast(x.uso ? `Nome salvo. As ${fmt(x.uso)} licitações com este motivo passam a mostrar o novo nome` : "Nome salvo")
  }

  /**
   * Só existe arquivar (decisão do refine de 28/09). Quem nunca foi usado some da lista e não
   * aparece em Arquivados, porque não há nada a preservar; quem já foi usado fica lá para
   * restaurar. Para a pessoa, é uma ação só, e ninguém precisa entender a diferença.
   */
  function arquivar(x: Motivo) {
    if (bloquearUltimo && lista.length === 1) {
      toast(bloquearUltimo)
      return
    }
    confirmar({
      titulo: `Arquivar "${x.nome}"?`,
      corpo: x.uso ? (
        <>
          <p>Ele deixa de aparecer na lista para novos {acao}.</p>
          <p>
            Nada muda no que já aconteceu: as {fmt(x.uso)} licitações {usoPassado} seguem com o motivo registrado, e
            continuam aparecendo {onde}. Dá para restaurar o motivo quando quiser.
          </p>
        </>
      ) : (
        <p>
          Ele deixa de aparecer na lista para novos {acao}. Como nenhuma licitação usou este motivo, nada se perde e ele
          não fica guardado em Arquivados.
        </p>
      ),
      acao: "Arquivar",
      ok: () => {
        const antes = motivos
        atualizar(x.id, (m) => ({ ...m, arq: true }))
        auditar(area, `Arquivou "${x.nome}"`)
        avisarComDesfazer("Motivo arquivado", () => {
          setMotivos(antes)
          desauditar()
        })
      },
    })
  }

  function restaurar(x: Motivo) {
    atualizar(x.id, (m) => ({ ...m, arq: false }))
    auditar(area, `Restaurou "${x.nome}"`)
    toast("Motivo restaurado")
  }

  function adicionar() {
    let nome = "Novo motivo"
    for (let i = 2; nomeOcupado(nome); i++) nome = `Novo motivo ${i}`
    const n: Motivo = {
      id: novoId("n"),
      nome,
      uso: 0,
      usoRec: 0,
      usoAnd: 0,
      rec: true,
      and: true,
      tipo,
      arq: false,
      desc: false,
    }
    setMotivos((l) => {
      const ultimo = l.filter((y) => y.tipo === tipo && !y.arq).pop()
      const idx = ultimo ? l.indexOf(ultimo) : l.length - 1
      return [...l.slice(0, idx + 1), n, ...l.slice(idx + 1)]
    })
    auditar(area, `Adicionou "${nome}"`)
    focar(n.id)
  }

  return (
    <>
      <SettingsBox>
        {cabecalho}
        <SettingsList
          labels={{ moveHandle: (n) => `Mover o motivo ${n ?? ""}. Use as setas para cima e para baixo.` }}
          onMove={(de, para) => setMotivos((l) => mover(l, de, para))}
        >
          {lista.map((x) => (
            <SettingsListItem key={x.id} id={x.id} group={`motivos-${tipo}`} name={x.nome}>
              <SettingsListNameInput
                value={x.nome}
                aria-label="Nome do motivo"
                data-nome-id={x.id}
                onValueCommit={(v) => renomear(x, v)}
              />
              {extras?.(x)}
              <Tooltip>
                <TooltipTrigger asChild>
                  {/* desativado, e não escondido, quando o motivo não aparece em nenhuma tela:
                      sumir faria parecer que a configuração se perdeu */}
                  <span className={cn("flex flex-none", COL.desc)}>
                    <Switch
                      checked={x.desc}
                      disabled={!x.rec && !x.and}
                      aria-label={`Descrição obrigatória em ${x.nome}`}
                      onCheckedChange={() => alternarDescricao(x)}
                      data-settings-list-no-drag
                    />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {x.rec || x.and
                    ? "O campo de descrição existe em todos os motivos e é opcional. Ativado aqui, quem escolher este motivo não conclui sem escrever o porquê."
                    : "Este motivo não aparece em nenhuma tela, então ninguém pode escolhê-lo. Ative uma das telas para poder exigir a descrição."}
                </TooltipContent>
              </Tooltip>
              {/* o contador fala de licitações nas duas listas: é a unidade que a pessoa conhece */}
              <MetaComDica
                dica={typeof dicaUso === "function" ? dicaUso(x) : dicaUso}
                className={cn(COL.uso, "justify-end")}
              >
                {x.uso ? emLicitacoes(x.uso) : "nunca usado"}
              </MetaComDica>
              <SettingsListItemActions>
                <BotaoIcone
                  rotulo={`Arquivar ${x.nome}`}
                  dica={
                    x.uso
                      ? `Arquivar: sai da lista de opções, e as ${fmt(x.uso)} licitações ${usoPassado} seguem com o motivo registrado.`
                      : "Arquivar: sai da lista de opções. Como nenhuma licitação usou, nada fica guardado."
                  }
                  perigo
                  onClick={() => arquivar(x)}
                >
                  <ArchiveIcon />
                </BotaoIcone>
              </SettingsListItemActions>
            </SettingsListItem>
          ))}
          {fixo}
          <SettingsListAdd onClick={adicionar}>Adicionar motivo</SettingsListAdd>
        </SettingsList>
      </SettingsBox>

      {arquivados.length > 0 && (
        <SettingsSection className="mt-6">
          <SettingsSectionTitle>Arquivados</SettingsSectionTitle>
          <SettingsSectionDescription>
            Aqui ficam só os motivos que já têm licitação. Eles não aparecem na lista para novos {acao}, mas continuam
            valendo no que já aconteceu: as licitações {usoPassado} seguem com eles, e seguem aparecendo {onde}.
          </SettingsSectionDescription>
          <SettingsBox>
            <SettingsList>
              {arquivados.map((x) => (
                <SettingsListItem key={x.id} id={x.id} variant="archived" handle={false}>
                  <SettingsListName>{x.nome}</SettingsListName>
                  <SettingsListItemMeta>
                    {emLicitacoes(x.uso)}
                  </SettingsListItemMeta>
                  <Button variant="outline" size="sm" onClick={() => restaurar(x)}>
                    Restaurar
                  </Button>
                </SettingsListItem>
              ))}
            </SettingsList>
          </SettingsBox>
        </SettingsSection>
      )}
    </>
  )
}
