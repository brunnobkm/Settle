// Etapas do funil de Em andamento. Modelo do Linear: primeira e
// última etapas fixas (renomeáveis), intermediárias livres.

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { CheckIcon, Trash2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  SettingsBox,
  SettingsPage,
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
  SettingsListGroupLabel,
  SettingsListItem,
  SettingsListItemActions,
  SettingsListLockBadge,
  SettingsListNameInput,
} from "@/components/ui/settings-list"

import { avisarComDesfazer, Aviso, BotaoIcone, MetaComDica } from "./comum"
import {
  CLASSE_COR_ETAPA,
  CORES_ETAPA,
  CORES_NOVAS,
  fmt,
  mover,
  NOME_COR_ETAPA,
  novoId,
  type CorEtapa,
  type Etapa,
  type TipoEtapa,
} from "./dados"
import { Confirmacao, useConfig, type PedidoDeConfirmacao } from "./estado"
import { COL, ListaMotivos } from "./ListaMotivos"

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
  const { etapas, setEtapas, exigirMotivoPerda, setExigirMotivoPerda, auditar, desauditar } = useConfig()
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
    // "Nova etapa" duas vezes seguidas deixaria duas etapas com o mesmo nome
    let nome = "Nova etapa"
    for (let i = 2; etapas.some((x) => x.nome.toLowerCase() === nome.toLowerCase()); i++) nome = `Nova etapa ${i}`
    const n: Etapa = {
      id: novoId("e"),
      nome,
      cor: CORES_NOVAS[etapas.length % CORES_NOVAS.length],
      qtd: 0,
      tipo: "meio",
    }
    setEtapas((l) => {
      const iSaida = l.findIndex((e) => e.tipo === "saida")
      return [...l.slice(0, iSaida), n, ...l.slice(iSaida)]
    })
    auditar("Etapas do funil", `Adicionou a etapa "${nome}"`)
    focar(n.id)
  }

  function aplicarRemocao(e: Etapa, destinoId: string | null) {
    const antes = etapas
    const d = destinoId ? etapas.find((x) => x.id === destinoId) : undefined
    setEtapas((l) => l.filter((x) => x.id !== e.id).map((x) => (d && x.id === d.id ? { ...x, qtd: x.qtd + e.qtd } : x)))
    auditar("Etapas do funil", `Removeu "${e.nome}"` + (d && e.qtd ? `, ${e.qtd} licitações movidas para "${d.nome}"` : ""))
    avisarComDesfazer(
      d && e.qtd ? `Etapa removida. ${fmt(e.qtd)} licitações foram para ${d.nome}` : "Etapa removida",
      () => {
        setEtapas(antes)
        desauditar()
      }
    )
  }

  function remover(e: Etapa) {
    // padrão: a etapa anterior
    const i = etapas.indexOf(e)
    setDestino(etapas[i - 1]?.id ?? etapas.find((x) => x.id !== e.id && x.tipo !== "saida")!.id)
    setRemocao(e)
    setConfirmando(true)
  }

  const etapaSaida = etapas.find((x) => x.tipo === "saida")

  const pedido: PedidoDeConfirmacao | null = !confirmando || !remocao ? null : remocao.qtd
    ? {
        titulo: `Remover "${remocao.nome}"?`,
        corpo: (
          <p>
            {fmt(remocao.qtd)} {remocao.qtd === 1 ? "licitação está" : "licitações estão"} nesta etapa. Escolha para onde{" "}
            {remocao.qtd === 1 ? "ela vai" : "elas vão"}. Os demais campos continuam iguais.
          </p>
        ),
        acao: "Remover e mover",
        perigo: true,
        ok: () => aplicarRemocao(remocao, destino),
      }
    : {
        titulo: `Remover "${remocao.nome}"?`,
        corpo: <p>A etapa está vazia, então nenhuma licitação muda de lugar. Ela some do funil para toda a organização.</p>,
        acao: "Remover etapa",
        perigo: true,
        ok: () => aplicarRemocao(remocao, null),
      }

  function trocarCor(e: Etapa, cor: CorEtapa) {
    if (cor === e.cor) return
    setEtapas((l) => l.map((x) => (x.id === e.id ? { ...x, cor } : x)))
    auditar("Etapas do funil", `Mudou a cor de "${e.nome}" para ${NOME_COR_ETAPA[cor]}`)
    toast(`Cor salva. A bolinha de ${e.nome} fica ${NOME_COR_ETAPA[cor].toLowerCase()} para todo mundo`)
  }

  const item = (e: Etapa) => {
    const fixa = e.tipo !== "meio"
    return (
      <SettingsListItem key={e.id} id={e.id} group={e.tipo} locked={fixa} lockedLabel="Posição fixa" name={e.nome}>
        <SeletorDeCor etapa={e} onEscolher={(c) => trocarCor(e, c)} />
        <SettingsListNameInput
          value={e.nome}
          aria-label="Nome da etapa"
          data-nome-id={e.id}
          onValueCommit={(v) => renomear(e, v)}
        />
        <MetaComDica
          dica={
            e.qtd
              ? "Quantas licitações estão nesta etapa agora. O número muda conforme o time move as licitações em Em andamento."
              : "Nenhuma licitação está nesta etapa agora."
          }
        >
          {e.qtd ? `${fmt(e.qtd)} ${e.qtd === 1 ? "licitação" : "licitações"}` : "vazia"}
        </MetaComDica>
        {fixa ? (
          <SettingsListLockBadge
            tooltip={
              e.tipo === "entrada"
                ? "É aqui que a licitação cai quando alguém clica em Enviar para análise."
                : "É aqui que a pessoa informa se ganhou ou perdeu, o que fecha a licitação e alimenta o dashboard."
            }
          >
            {e.tipo === "entrada" ? "Agentes começam aqui" : "Resultado registrado aqui"}
          </SettingsListLockBadge>
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
  const saida = etapas.find((e) => e.tipo === "saida")

  return (
    <SettingsPage width="full">
      <Aviso tom="marca" fechavel>
        Aqui você monta as etapas de Em andamento, da análise ao resultado. A mudança vale para todas as pessoas da
        organização assim que você salva o nome ou solta a etapa no lugar. <EfeitoDeCadaMudanca />
      </Aviso>
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
        <SettingsSectionTitle>Registro do resultado</SettingsSectionTitle>
        <SettingsSectionDescription>
          Ao mover uma licitação para {saida?.nome ?? "a última etapa"}, a pessoa informa se ganhou ou perdeu. Quando
          perdeu, ela escolhe um motivo desta lista. Um motivo já usado é arquivado, nunca apagado, para o histórico e o
          dashboard continuarem certos.
        </SettingsSectionDescription>

        <SettingsBox className="mb-3.5">
          <SettingsRow>
            <SettingsRowContent>
              <SettingsRowTitle id="t-perda">Exigir motivo ao registrar perda</SettingsRowTitle>
              <SettingsRowDescription>
                Quando você ativa essa opção, quem registra "Perdeu" precisa escolher um motivo para concluir. Se
                deixar desativado, o motivo vira opcional e o gráfico "Motivos de perda", em Dashboards, passa a
                mostrar "Sem motivo".
              </SettingsRowDescription>
            </SettingsRowContent>
            <Switch
              aria-labelledby="t-perda"
              checked={exigirMotivoPerda}
              onCheckedChange={(v) => {
                setExigirMotivoPerda(v)
                auditar("Etapas do funil", `${v ? "Passou a exigir" : "Deixou de exigir"} motivo ao registrar perda`)
                toast("Salvo")
              }}
            />
          </SettingsRow>
        </SettingsBox>

        <ListaMotivos
          tipo="perda"
          // mesmo formato de Motivos de descarte: a chave é um switch, com o rótulo no cabeçalho
          cabecalho={
            <div className="flex items-center gap-2.5 border-b bg-muted/40 py-2 pr-2.5 pl-3 text-[12px] font-semibold text-muted-foreground">
              <span aria-hidden className="w-4 flex-none" />
              <span className="min-w-0 flex-1">Motivo</span>
              <span className={cn("flex-none", COL.desc)}>Descrição obrigatória</span>
              <span className={cn("flex-none text-right", COL.uso)}>Licitações</span>
              <span aria-hidden className={cn("flex-none", COL.acao)} />
            </div>
          }
          area="Etapas do funil"
          bloquearUltimo={
            exigirMotivoPerda
              ? "Com motivo obrigatório, a lista precisa ter pelo menos um motivo. Desative a exigência antes de arquivar o último."
              : undefined
          }
          dicaUso="Em quantas licitações este motivo já foi usado ao registrar uma perda."
          acao="registros de perda"
          usoPassado="registradas como perdidas por este motivo"
          onde="no resultado dessas licitações e no gráfico “Motivos de perda”, em Dashboards"
        />
      </SettingsSection>


      <Confirmacao pedido={pedido} onFechar={() => setConfirmando(false)}>
        {remocao && remocao.qtd > 0 && (
          <div className="flex flex-col gap-2.5">
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
              Mover licitações para
              <NativeSelect value={destino} onChange={(ev) => setDestino(ev.target.value)} className="w-full font-normal">
                {etapas
                  .filter((x) => x.id !== remocao.id && x.tipo !== "saida")
                  .map((x) => (
                    <NativeSelectOption key={x.id} value={x.id}>
                      {x.nome}
                      {x.tipo === "entrada" ? " (primeira)" : x.tipo === "saida" ? " (última)" : ""}
                    </NativeSelectOption>
                  ))}
              </NativeSelect>
            </label>

            {/* o refine de 28/09 tirou a etapa de saída daqui: são duas decisões diferentes */}
            <p className="text-[12.5px] leading-[19px] text-muted-foreground">
              {etapaSaida?.nome} não aparece na lista. Aqui você está arrumando o funil, e lá cada licitação precisa
              de um resultado próprio, ganhou ou perdeu. Esse registro continua sendo feito em Em andamento.
            </p>
          </div>
        )}
      </Confirmacao>
    </SettingsPage>
  )
}

/** Bolinha da etapa: clicar abre a paleta. A cor é só visual, quem identifica a etapa é o nome. */
function SeletorDeCor({ etapa, onEscolher }: { etapa: Etapa; onEscolher: (cor: CorEtapa) => void }) {
  const [aberto, setAberto] = useState(false)
  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={`Cor da etapa ${etapa.nome}: ${NOME_COR_ETAPA[etapa.cor]}. Clique para trocar.`}
              className="flex size-5 flex-none items-center justify-center rounded-md hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <span aria-hidden className={cn("size-2.5 rounded-full", CLASSE_COR_ETAPA[etapa.cor])} />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Cor da etapa em Em andamento. Clique para trocar.</TooltipContent>
      </Tooltip>
      <PopoverContent align="start" className="w-44 p-1">
        <div role="group" aria-label="Cores" className="flex flex-col">
          {CORES_ETAPA.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={c === etapa.cor}
              onClick={() => {
                onEscolher(c)
                setAberto(false)
              }}
              className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[13px] hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <span aria-hidden className={cn("size-2.5 flex-none rounded-full", CLASSE_COR_ETAPA[c])} />
              <span className="flex-1">{NOME_COR_ETAPA[c]}</span>
              {c === etapa.cor && <CheckIcon aria-hidden className="size-3.5 flex-none text-muted-foreground" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

/** O que cada mudança faz com as licitações que já estão em Em andamento. Antes era uma seção no
 * fim da página, mas é referência, não configuração: virou o "Saiba mais" do card de abertura. */
function EfeitoDeCadaMudanca() {
  const linhas = [
    [
      "Renomear",
      "As licitações continuam na etapa e o dashboard mantém o histórico: a etapa é acompanhada pelo identificador, não pelo nome.",
    ],
    ["Reordenar", "O funil do dashboard passa a seguir a nova ordem. Nenhum número muda."],
    [
      "Remover",
      "Se houver licitações na etapa, você escolhe para qual etapa elas vão antes de confirmar. No dashboard, o período em que a etapa existiu continua com o nome dela.",
    ],
    ["Adicionar", "A etapa nasce vazia e sem histórico. Aparece em Em andamento na posição em que você a deixar."],
    ["Trocar a cor", "Só muda a bolinha da etapa em Em andamento. Nenhuma licitação e nenhum número são afetados."],
  ]
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="font-semibold text-primary underline-offset-2 hover:underline">
          Saiba mais
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-130">
        <DialogHeader>
          <DialogTitle>Efeito de cada mudança</DialogTitle>
          <DialogDescription>
            O que acontece com as licitações que já estão em Em andamento e com o dashboard quando você mexe nas
            etapas.
          </DialogDescription>
        </DialogHeader>
        <dl className="flex flex-col gap-3">
          {linhas.map(([titulo, texto]) => (
            <div key={titulo}>
              <dt className="text-[13px] font-semibold">{titulo}</dt>
              <dd className="text-[13px] leading-[19px] text-muted-foreground">{texto}</dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  )
}
