// Lista de motivos, usada nas duas telas que têm motivo: descarte (em Motivos) e
// perda (em Etapas do funil, junto da etapa de saída, onde o resultado é registrado).
// Motivo já usado é arquivado, nunca excluído: o filtro e o dashboard continuam contando.

import type { ReactNode } from "react"
import { toast } from "sonner"
import { ArchiveIcon, InfoIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
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

import { avisarComDesfazer, BotaoIcone, Pilula } from "./comum"
import { fmt, mover, novoId, type Motivo, type TipoMotivo } from "./dados"
import { useConfig } from "./estado"
import { useFocoNoNome } from "./PaginaEtapas"

export function ListaMotivos({
  tipo,
  area,
  usos,
  dicaUso,
  porQueArquivar,
  acao,
  usoPassado,
  onde,
  extras,
  fixo,
}: {
  tipo: TipoMotivo
  /** Área usada na Auditoria. */
  area: string
  /** Como o uso é contado na linha: "descartes", "perdas". */
  usos: string
  /** Tooltip do número de usos, no "i" ao lado dele. */
  dicaUso: string
  /** Fim da frase do tooltip de arquivar: "Não dá para excluir, <porQueArquivar>". */
  porQueArquivar: string
  /** O que a pessoa faz com o motivo: "descartes", "registros de perda". */
  acao: string
  /** Como as licitações que já usaram o motivo são descritas: "descartadas com este motivo". */
  usoPassado: string
  /** Onde o motivo continua aparecendo depois de arquivado. */
  onde: string
  /** Conteúdo extra na linha de cada motivo (ex.: escopo por tela no descarte). */
  extras?: (x: Motivo) => ReactNode
  /** Item fixo no fim da lista (ex.: "Outros" no descarte). */
  fixo?: ReactNode
}) {
  const { motivos, setMotivos, auditar, desauditar, confirmar } = useConfig()
  const focar = useFocoNoNome()

  const lista = motivos.filter((x) => x.tipo === tipo && !x.arq)
  const arquivados = motivos.filter((x) => x.tipo === tipo && x.arq)
  const atualizar = (id: string, f: (m: Motivo) => Motivo) => setMotivos((l) => l.map((x) => (x.id === id ? f(x) : x)))

  function alternarDescricao(x: Motivo) {
    atualizar(x.id, (m) => ({ ...m, desc: !m.desc }))
    auditar(area, `"${x.nome}" ${x.desc ? "deixou de pedir" : "passou a pedir"} descrição`)
    toast(
      x.desc
        ? "Descrição passou a ser opcional neste motivo"
        : "A partir de agora, quem escolher este motivo precisa escrever o porquê"
    )
  }

  function renomear(x: Motivo, v: string) {
    auditar(area, `Renomeou "${x.nome}" para "${v}"`)
    atualizar(x.id, (m) => ({ ...m, nome: v }))
    toast(x.uso ? `Nome salvo. As ${fmt(x.uso)} licitações com este motivo passam a mostrar o novo nome` : "Nome salvo")
  }

  function tirar(x: Motivo) {
    if (!x.uso) {
      confirmar({
        titulo: `Excluir "${x.nome}"?`,
        corpo: <p>Ele sai da lista para novos {acao}. Como nunca foi usado, nada se perde: nenhuma licitação fica sem motivo.</p>,
        acao: "Excluir motivo",
        perigo: true,
        ok: () => {
          const i = motivos.indexOf(x)
          setMotivos((l) => l.filter((m) => m.id !== x.id))
          auditar(area, `Excluiu "${x.nome}"`)
          avisarComDesfazer("Motivo excluído", () => {
            setMotivos((l) => [...l.slice(0, i), x, ...l.slice(i)])
            desauditar()
          })
        },
      })
      return
    }
    confirmar({
      titulo: `Arquivar "${x.nome}"?`,
      corpo: (
        <>
          <p>Ele deixa de aparecer na lista para novos {acao}.</p>
          <p>
            Nada muda no que já aconteceu: as {fmt(x.uso)} licitações {usoPassado} continuam com ele, e continuam
            aparecendo {onde}. Dá para restaurar o motivo quando quiser.
          </p>
        </>
      ),
      acao: "Arquivar",
      ok: () => {
        atualizar(x.id, (m) => ({ ...m, arq: true }))
        auditar(area, `Arquivou "${x.nome}"`)
        toast("Motivo arquivado")
      },
    })
  }

  function restaurar(x: Motivo) {
    atualizar(x.id, (m) => ({ ...m, arq: false }))
    auditar(area, `Restaurou "${x.nome}"`)
    toast("Motivo restaurado")
  }

  function adicionar() {
    const n: Motivo = { id: novoId("n"), nome: "Novo motivo", uso: 0, rec: true, and: true, tipo, arq: false, desc: false }
    setMotivos((l) => {
      const ultimo = l.filter((y) => y.tipo === tipo && !y.arq).pop()
      const idx = ultimo ? l.indexOf(ultimo) : l.length - 1
      return [...l.slice(0, idx + 1), n, ...l.slice(idx + 1)]
    })
    auditar(area, 'Adicionou "Novo motivo"')
    focar(n.id)
  }

  return (
    <>
      <SettingsBox>
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
                  <Pilula pressed={x.desc} onPressedChange={() => alternarDescricao(x)}>
                    Pede descrição
                  </Pilula>
                </TooltipTrigger>
                <TooltipContent>Ao escolher este motivo, a pessoa precisa escrever o porquê</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={`O que significa "${x.uso ? `${fmt(x.uso)} ${usos}` : "nunca usado"}"`}
                    className="flex flex-none cursor-help items-center gap-1 text-[12.5px] text-muted-foreground"
                  >
                    {x.uso ? `${fmt(x.uso)} ${usos}` : "nunca usado"}
                    <InfoIcon aria-hidden className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{dicaUso}</TooltipContent>
              </Tooltip>
              <SettingsListItemActions>
                <BotaoIcone
                  rotulo={`${x.uso ? "Arquivar" : "Excluir"} ${x.nome}`}
                  dica={
                    x.uso
                      ? `Arquivar: sai da lista, e as licitações que já usaram este motivo continuam com ele. Não dá para excluir, ${porQueArquivar}`
                      : "Excluir: nunca foi usado, então nada se perde"
                  }
                  perigo
                  onClick={() => tirar(x)}
                >
                  {x.uso ? <ArchiveIcon /> : <Trash2Icon />}
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
            Não aparecem na lista para novos {acao}, mas continuam valendo no que já aconteceu: as licitações {usoPassado}
            seguem com eles, e seguem aparecendo {onde}.
          </SettingsSectionDescription>
          <SettingsBox>
            <SettingsList>
              {arquivados.map((x) => (
                <SettingsListItem key={x.id} id={x.id} variant="archived" handle={false}>
                  <SettingsListName>{x.nome}</SettingsListName>
                  <SettingsListItemMeta>
                    {fmt(x.uso)} {usos}
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
