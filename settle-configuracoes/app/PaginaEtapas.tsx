// Etapas do funil (colunas do Kanban de Em andamento). Modelo do Linear: primeira e
// última etapas fixas (renomeáveis), intermediárias livres.

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Trash2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  SettingsBox,
  SettingsPage,
  SettingsPageDescription,
  SettingsRow,
  SettingsRowContent,
  SettingsRowDescription,
  SettingsRowTitle,
  SettingsSection,
  SettingsSectionTitle,
} from "@/components/ui/settings-page"
import {
  SettingsList,
  SettingsListAdd,
  SettingsListGroupLabel,
  SettingsListItem,
  SettingsListItemActions,
  SettingsListItemMeta,
  SettingsListLockBadge,
  SettingsListNameInput,
} from "@/components/ui/settings-list"

import { avisarComDesfazer, Aviso, BotaoIcone } from "./comum"
import { CLASSE_COR_ETAPA, CORES_NOVAS, fmt, mover, novoId, type Etapa, type TipoEtapa } from "./dados"
import { Confirmacao, useConfig, type PedidoDeConfirmacao } from "./estado"

/** Foca e seleciona o nome do item recém-criado. */
export function useFocoNoNome() {
  const [id, setId] = useState<string | null>(null)
  useEffect(() => {
    if (!id) return
    const input = document.querySelector<HTMLInputElement>(`[data-nome-id="${id}"]`)
    input?.focus()
    input?.select()
    setId(null)
  }, [id])
  return setId
}

export function PaginaEtapas() {
  const { etapas, setEtapas, auditar, desauditar } = useConfig()
  const focar = useFocoNoNome()
  // a etapa continua guardada depois de fechar, para o diálogo sair animado com o conteúdo
  const [remocao, setRemocao] = useState<Etapa | null>(null)
  const [confirmando, setConfirmando] = useState(false)
  const [destino, setDestino] = useState("")

  function renomear(e: Etapa, v: string) {
    if (etapas.some((x) => x.id !== e.id && x.nome.toLowerCase() === v.toLowerCase())) {
      toast("Já existe uma etapa com esse nome")
      return false
    }
    auditar("Etapas do funil", `Renomeou "${e.nome}" para "${v}"`)
    setEtapas((l) => l.map((x) => (x.id === e.id ? { ...x, nome: v } : x)))
    toast("Nome da etapa salvo")
  }

  function adicionar() {
    const n: Etapa = {
      id: novoId("e"),
      nome: "Nova etapa",
      cor: CORES_NOVAS[etapas.length % CORES_NOVAS.length],
      qtd: 0,
      tipo: "meio",
    }
    setEtapas((l) => {
      const iSaida = l.findIndex((e) => e.tipo === "saida")
      return [...l.slice(0, iSaida), n, ...l.slice(iSaida)]
    })
    auditar("Etapas do funil", 'Adicionou a etapa "Nova etapa"')
    focar(n.id)
  }

  function aplicarRemocao(e: Etapa, destinoId: string | null) {
    const antes = etapas
    const d = destinoId ? etapas.find((x) => x.id === destinoId) : undefined
    setEtapas((l) => l.filter((x) => x.id !== e.id).map((x) => (d && x.id === d.id ? { ...x, qtd: x.qtd + e.qtd } : x)))
    auditar("Etapas do funil", `Removeu "${e.nome}"` + (d && e.qtd ? `, ${e.qtd} licitações movidas para "${d.nome}"` : ""))
    avisarComDesfazer(d && e.qtd ? `Etapa removida. ${fmt(e.qtd)} licitações foram para ${d.nome}` : "Etapa removida", () => {
      setEtapas(antes)
      desauditar()
    })
  }

  function remover(e: Etapa) {
    if (!e.qtd) {
      aplicarRemocao(e, null)
      return
    }
    // padrão: a etapa anterior
    const i = etapas.indexOf(e)
    setDestino(etapas[i - 1]?.id ?? etapas.find((x) => x.id !== e.id)!.id)
    setRemocao(e)
    setConfirmando(true)
  }

  const pedido: PedidoDeConfirmacao | null = !confirmando || !remocao ? null : {
    titulo: `Remover "${remocao.nome}"?`,
    corpo: (
      <p>
        {fmt(remocao.qtd)} {remocao.qtd === 1 ? "licitação está" : "licitações estão"} nesta etapa. Escolha para onde{" "}
        {remocao.qtd === 1 ? "ela vai" : "elas vão"}. Responsável, substatus e descrição continuam iguais.
      </p>
    ),
    acao: "Remover e mover",
    perigo: true,
    ok: () => aplicarRemocao(remocao, destino),
  }

  const item = (e: Etapa) => {
    const fixa = e.tipo !== "meio"
    return (
      <SettingsListItem key={e.id} id={e.id} group={e.tipo} locked={fixa} lockedLabel="Posição fixa" name={e.nome}>
        <span aria-hidden className={cn("size-2.5 flex-none rounded-full", CLASSE_COR_ETAPA[e.cor])} />
        <SettingsListNameInput
          value={e.nome}
          aria-label="Nome da etapa"
          data-nome-id={e.id}
          onValueCommit={(v) => renomear(e, v)}
        />
        <SettingsListItemMeta>
          {e.qtd ? `${fmt(e.qtd)} ${e.qtd === 1 ? "licitação" : "licitações"}` : "vazia"}
        </SettingsListItemMeta>
        {fixa ? (
          <SettingsListLockBadge>{e.tipo === "entrada" ? "Agentes começam aqui" : "Resultado registrado aqui"}</SettingsListLockBadge>
        ) : (
          <SettingsListItemActions>
            <BotaoIcone rotulo={`Remover etapa ${e.nome}`} perigo onClick={() => remover(e)}>
              <Trash2Icon />
            </BotaoIcone>
          </SettingsListItemActions>
        )}
      </SettingsListItem>
    )
  }
  const grupo = (t: TipoEtapa) => etapas.filter((e) => e.tipo === t).map(item)

  return (
    <SettingsPage>
      <SettingsPageDescription>
        As colunas do quadro em Em andamento, da análise ao resultado. A mudança vale para todas as pessoas da
        organização assim que você salva o nome ou solta a etapa no lugar.
      </SettingsPageDescription>
      <Aviso>
        A <b>primeira</b> e a <b>última</b> etapas têm posição fixa: os agentes começam a trabalhar quando a licitação
        entra na primeira e registram o resultado na última. Dá para renomear, mas não mover nem remover.
      </Aviso>

      <SettingsBox>
        <SettingsList
          labels={{ moveHandle: (n) => `Mover a etapa ${n ?? ""}. Use as setas para cima e para baixo.` }}
          onMove={(de, para) => {
            setEtapas((l) => mover(l, de, para))
            auditar("Etapas do funil", "Reordenou as etapas")
            toast("Ordem das etapas salva")
          }}
        >
          <SettingsListGroupLabel description="onde a licitação chega depois de Enviar para análise">Entrada</SettingsListGroupLabel>
          {grupo("entrada")}
          <SettingsListGroupLabel description="arraste para reordenar">Etapas intermediárias</SettingsListGroupLabel>
          {grupo("meio")}
          <SettingsListAdd onClick={adicionar}>Adicionar etapa</SettingsListAdd>
          <SettingsListGroupLabel>Saída</SettingsListGroupLabel>
          {grupo("saida")}
        </SettingsList>
      </SettingsBox>

      <SettingsSection className="mt-7">
        <SettingsSectionTitle>O que acontece com o que já existe</SettingsSectionTitle>
        <SettingsBox>
          <SettingsRow>
            <SettingsRowContent>
              <SettingsRowTitle>Renomear</SettingsRowTitle>
              <SettingsRowDescription>
                As licitações continuam na etapa e o dashboard mantém o histórico: a etapa é acompanhada pelo
                identificador, não pelo nome.
              </SettingsRowDescription>
            </SettingsRowContent>
          </SettingsRow>
          <SettingsRow>
            <SettingsRowContent>
              <SettingsRowTitle>Reordenar</SettingsRowTitle>
              <SettingsRowDescription>O funil do dashboard passa a seguir a nova ordem. Nenhum número muda.</SettingsRowDescription>
            </SettingsRowContent>
          </SettingsRow>
          <SettingsRow>
            <SettingsRowContent>
              <SettingsRowTitle>Remover</SettingsRowTitle>
              <SettingsRowDescription>
                Se houver licitações na etapa, você escolhe para qual etapa elas vão antes de confirmar. No dashboard, o
                período em que a etapa existiu continua com o nome dela.
              </SettingsRowDescription>
            </SettingsRowContent>
          </SettingsRow>
          <SettingsRow>
            <SettingsRowContent>
              <SettingsRowTitle>Adicionar</SettingsRowTitle>
              <SettingsRowDescription>
                A etapa nasce vazia e sem histórico. Aparece no quadro na posição em que você a deixar.
              </SettingsRowDescription>
            </SettingsRowContent>
          </SettingsRow>
        </SettingsBox>
      </SettingsSection>

      <Confirmacao pedido={pedido} onFechar={() => setConfirmando(false)}>
        {remocao && (
          <div className="flex flex-col gap-2.5">
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
              Mover licitações para
              <NativeSelect value={destino} onChange={(ev) => setDestino(ev.target.value)} className="w-full font-normal">
                {etapas
                  .filter((x) => x.id !== remocao.id)
                  .map((x) => (
                    <NativeSelectOption key={x.id} value={x.id}>
                      {x.nome}
                      {x.tipo === "entrada" ? " (primeira)" : x.tipo === "saida" ? " (última)" : ""}
                    </NativeSelectOption>
                  ))}
              </NativeSelect>
            </label>
            <p className="text-[12.5px] leading-[19px] text-muted-foreground">
              Mudança de etapa por remoção não dispara agentes: voltar para a primeira não roda a análise de novo, e ir
              para a última não registra resultado (a licitação fica pendente de registro).
            </p>
          </div>
        )}
      </Confirmacao>
    </SettingsPage>
  )
}
