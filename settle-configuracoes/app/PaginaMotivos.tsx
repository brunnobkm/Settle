// Motivos de descarte e de perda. Motivo já usado é arquivado, nunca excluído.

import { toast } from "sonner"
import { ArchiveIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  SettingsBox,
  SettingsPage,
  SettingsPageDescription,
  SettingsRow,
  SettingsRowContent,
  SettingsRowDescription,
  SettingsRowTitle,
  SettingsSection,
  SettingsSectionDescription,
  SettingsSectionTitle,
} from "@/components/ui/settings-page"
import {
  SettingsList,
  SettingsListAdd,
  SettingsListItem,
  SettingsListItemActions,
  SettingsListItemDescription,
  SettingsListItemMeta,
  SettingsListLockBadge,
  SettingsListName,
  SettingsListNameInput,
} from "@/components/ui/settings-list"

import { avisarComDesfazer, BotaoIcone, Pilula } from "./comum"
import { fmt, mover, novoId, type Motivo, type TipoMotivo } from "./dados"
import { useConfig } from "./estado"
import { useFocoNoNome } from "./PaginaEtapas"

const CONTADOR = "rounded-md bg-foreground/10 px-1.5 text-xs leading-4 font-medium text-foreground tabular-nums"

export function PaginaMotivos() {
  const {
    motivos,
    setMotivos,
    motivoTab: t,
    setMotivoTab,
    unificar,
    setUnificar,
    exigirMotivo,
    setExigirMotivo,
    etapas,
    auditar,
    desauditar,
    confirmar,
  } = useConfig()
  const focar = useFocoNoNome()

  const lista = motivos.filter((x) => x.tipo === t && !x.arq)
  const arquivados = motivos.filter((x) => x.tipo === t && x.arq)
  const cnt = (k: TipoMotivo) => motivos.filter((x) => x.tipo === k && !x.arq).length + (k === "descarte" ? 1 : 0)
  const usos = t === "descarte" ? "descartes" : "perdas"
  const atualizar = (id: string, f: (m: Motivo) => Motivo) => setMotivos((l) => l.map((x) => (x.id === id ? f(x) : x)))

  function alternarEscopo(x: Motivo, k: "rec" | "and") {
    if (x[k] && !(k === "rec" ? x.and : x.rec)) {
      toast("O motivo precisa aparecer em pelo menos uma tela")
      return
    }
    atualizar(x.id, (m) => ({ ...m, [k]: !m[k] }))
    auditar("Motivos", `Alterou onde "${x.nome}" aparece`)
  }

  function alternarDescricao(x: Motivo) {
    atualizar(x.id, (m) => ({ ...m, desc: !m.desc }))
    auditar("Motivos", `"${x.nome}" ${x.desc ? "deixou de pedir" : "passou a pedir"} descrição`)
    toast(
      x.desc
        ? "Descrição passou a ser opcional neste motivo"
        : "A partir de agora, quem escolher este motivo precisa escrever o porquê"
    )
  }

  function renomear(x: Motivo, v: string) {
    auditar("Motivos", `Renomeou "${x.nome}" para "${v}"`)
    atualizar(x.id, (m) => ({ ...m, nome: v }))
    toast(x.uso ? `Nome salvo. As ${fmt(x.uso)} licitações com este motivo passam a mostrar o novo nome` : "Nome salvo")
  }

  function tirar(x: Motivo) {
    if (!x.uso) {
      const i = motivos.indexOf(x)
      setMotivos((l) => l.filter((m) => m.id !== x.id))
      auditar("Motivos", `Excluiu "${x.nome}"`)
      avisarComDesfazer("Motivo excluído", () => {
        setMotivos((l) => [...l.slice(0, i), x, ...l.slice(i)])
        desauditar()
      })
      return
    }
    confirmar({
      titulo: `Arquivar "${x.nome}"?`,
      corpo: (
        <>
          <p>Ele deixa de aparecer para novos {t === "descarte" ? "descartes" : "registros de perda"}.</p>
          <p>
            As {fmt(x.uso)} licitações que já usaram este motivo continuam com ele, e o filtro de Descartadas e o
            dashboard seguem contando. Dá para restaurar depois.
          </p>
        </>
      ),
      acao: "Arquivar",
      ok: () => {
        atualizar(x.id, (m) => ({ ...m, arq: true }))
        auditar("Motivos", `Arquivou "${x.nome}"`)
        toast("Motivo arquivado")
      },
    })
  }

  function restaurar(x: Motivo) {
    atualizar(x.id, (m) => ({ ...m, arq: false }))
    auditar("Motivos", `Restaurou "${x.nome}"`)
    toast("Motivo restaurado")
  }

  function adicionar() {
    const n: Motivo = { id: novoId("n"), nome: "Novo motivo", uso: 0, rec: true, and: true, tipo: t, arq: false, desc: false }
    setMotivos((l) => {
      const ultimo = l.filter((y) => y.tipo === t && !y.arq).pop()
      const idx = ultimo ? l.indexOf(ultimo) : l.length - 1
      return [...l.slice(0, idx + 1), n, ...l.slice(idx + 1)]
    })
    auditar("Motivos", 'Adicionou "Novo motivo"')
    focar(n.id)
  }

  return (
    <SettingsPage className="max-w-245">
      <SettingsPageDescription>
        O que a pessoa escolhe ao descartar uma licitação ou registrar que perdeu. Os motivos alimentam o filtro de
        Descartadas e o dashboard, por isso um motivo já usado é arquivado, nunca apagado.
      </SettingsPageDescription>

      <Tabs value={t} onValueChange={(v) => setMotivoTab(v as TipoMotivo)} className="mb-3.5">
        <TabsList aria-label="Tipo de motivo" className="max-w-full justify-start overflow-x-auto">
          <TabsTrigger value="descarte" className="px-3">
            Descarte <span className={CONTADOR}>{cnt("descarte")}</span>
          </TabsTrigger>
          <TabsTrigger value="perda" className="px-3">
            Perda <span className={CONTADOR}>{cnt("perda")}</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {t === "descarte" ? (
        <SettingsSection>
          <SettingsBox>
            <SettingsRow>
              <SettingsRowContent>
                <SettingsRowTitle id="t-exigir">Exigir motivo ao descartar</SettingsRowTitle>
                <SettingsRowDescription>Sem motivo, o botão Descartar fica bloqueado até a pessoa escolher um.</SettingsRowDescription>
              </SettingsRowContent>
              <Switch
                aria-labelledby="t-exigir"
                checked={exigirMotivo}
                onCheckedChange={(v) => {
                  setExigirMotivo(v)
                  auditar("Motivos", `${v ? "Passou a exigir" : "Deixou de exigir"} motivo ao descartar`)
                  toast("Salvo")
                }}
              />
            </SettingsRow>
            <SettingsRow>
              <SettingsRowContent>
                <SettingsRowTitle id="t-unificar">Mesma lista em Recomendadas e Em andamento</SettingsRowTitle>
                <SettingsRowDescription>Desligue para escolher, motivo a motivo, em qual das duas telas ele aparece.</SettingsRowDescription>
              </SettingsRowContent>
              <Switch
                aria-labelledby="t-unificar"
                checked={unificar}
                onCheckedChange={(v) => {
                  setUnificar(v)
                  auditar("Motivos", v ? "Unificou as listas de descarte" : "Separou os motivos por tela")
                }}
              />
            </SettingsRow>
          </SettingsBox>
        </SettingsSection>
      ) : (
        <SettingsPageDescription>
          Aparece quando a licitação chega em {etapas.find((e) => e.tipo === "saida")?.nome} e a pessoa registra que
          perdeu.
        </SettingsPageDescription>
      )}

      <SettingsPageDescription className="mb-2.5">
        Marque <b className="font-semibold text-foreground">Pede descrição</b> nos motivos em que a pessoa precisa
        explicar o porquê, como já acontece em Outros.
      </SettingsPageDescription>

      <SettingsBox>
        <SettingsList
          labels={{ moveHandle: (n) => `Mover o motivo ${n ?? ""}. Use as setas para cima e para baixo.` }}
          onMove={(de, para) => setMotivos((l) => mover(l, de, para))}
        >
          {lista.map((x) => (
            <SettingsListItem key={x.id} id={x.id} group="motivos" name={x.nome}>
              <SettingsListNameInput value={x.nome} aria-label="Nome do motivo" data-nome-id={x.id} onValueCommit={(v) => renomear(x, v)} />
              {t === "descarte" && !unificar && (
                <div role="group" aria-label={`Onde "${x.nome}" aparece`} className="flex flex-none gap-1">
                  <Pilula pressed={x.rec} onPressedChange={() => alternarEscopo(x, "rec")}>
                    Recomendadas
                  </Pilula>
                  <Pilula pressed={x.and} onPressedChange={() => alternarEscopo(x, "and")}>
                    Em andamento
                  </Pilula>
                </div>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Pilula pressed={x.desc} onPressedChange={() => alternarDescricao(x)}>
                    Pede descrição
                  </Pilula>
                </TooltipTrigger>
                <TooltipContent>Ao escolher este motivo, a pessoa precisa escrever o porquê</TooltipContent>
              </Tooltip>
              <SettingsListItemMeta>{x.uso ? `${fmt(x.uso)} ${usos}` : "nunca usado"}</SettingsListItemMeta>
              <SettingsListItemActions>
                <BotaoIcone
                  rotulo={`${x.uso ? "Arquivar" : "Excluir"} ${x.nome}`}
                  dica={x.uso ? "Arquivar" : "Excluir"}
                  perigo
                  onClick={() => tirar(x)}
                >
                  {x.uso ? <ArchiveIcon /> : <Trash2Icon />}
                </BotaoIcone>
              </SettingsListItemActions>
            </SettingsListItem>
          ))}
          {t === "descarte" && (
            <SettingsListItem id="outros" group="fixa" locked>
              <SettingsListName className="flex-none">Outros</SettingsListName>
              <SettingsListItemDescription>Sempre disponível e sempre pede descrição.</SettingsListItemDescription>
              <SettingsListLockBadge tooltip="Motivo padrão da plataforma. Não pode ser renomeado, arquivado nem excluído.">
                Não editável
              </SettingsListLockBadge>
            </SettingsListItem>
          )}
          <SettingsListAdd onClick={adicionar}>Adicionar motivo</SettingsListAdd>
        </SettingsList>
      </SettingsBox>

      {arquivados.length > 0 && (
        <SettingsSection className="mt-6">
          <SettingsSectionTitle>Arquivados</SettingsSectionTitle>
          <SettingsSectionDescription>
            Não aparecem para novos {t === "descarte" ? "descartes" : "registros"}. Continuam nas licitações que já
            usaram, no filtro de Descartadas e no dashboard.
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
    </SettingsPage>
  )
}
