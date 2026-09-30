// Campos da licitação: o que aparece nos três lugares onde a licitação é mostrada (card de
// Recomendadas, card de Em andamento e módulo dentro da licitação), com prévia ao lado.

import {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { toast } from "sonner"
import {
  ArrowDownIcon,
  BookmarkIcon,
  CheckIcon,
  FolderIcon,
  GaugeIcon,
  GlobeIcon,
  Link2Icon,
  LockIcon,
  MessageSquareIcon,
  PencilIcon,
  PlusIcon,
  Share2Icon,
  Trash2Icon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  LicitacaoCardAvatars,
  LicitacaoCardContent,
  LicitacaoCardDescription,
  LicitacaoCardField,
  LicitacaoCardHeader,
  LicitacaoCardIconAction,
  LicitacaoCardIconActions,
  LicitacaoCardItems,
  LicitacaoCardRoot,
  LicitacaoCardSegment,
  LicitacaoCardSegments,
  LicitacaoCardStatusButton,
  LicitacaoCardTitle,
  LicitacaoCardValue,
  type LicitacaoCardMetaField,
} from "@/components/ui/licitacao-card"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toolbar, ToolbarButton, ToolbarSeparator } from "@/components/ui/toolbar"
import { Switch } from "@/components/ui/switch"
import {
  SettingsBox,
  SettingsPage,
  SettingsPreview,
  SettingsPreviewHeader,
  SettingsSplit,
} from "@/components/ui/settings-page"
import {
  SettingsList,
  SettingsListItem,
  SettingsListGroupLabel,
  SettingsListItemActions,
  SettingsListLockBadge,
  SettingsListName,
} from "@/components/ui/settings-list"

import { Aviso, BotaoIcone, ListaDeVariaveis, SeloDeOrigem } from "./comum"
import { FORMATO_VAR } from "./agentes/dados"
import { useAgentes } from "./agentes/estado"
import {
  BLOCO_DE_ITENS,
  camposDaTela,
  CLASSE_CHIP_SEGMENTO,
  corDoSegmento,
  fmt,
  LIC_EXEMPLO,
  LICS,
  OPCOES_MAX_ITENS,
  mover,
  novoId,
  TELAS_DO_CARD,
  TIPOS_DE_CAMPO,
  valorDaLic,
  type Campo,
  type TelaDoCard,
  type TipoDeCampo,
  type ItemLic,
  type FormatoCampo,
  type Variavel,
} from "./dados"
import { useConfig } from "./estado"

export function PaginaCard() {
  const { campos, setCampos, maxItens, setMaxItens, telaDoCard, setTelaDoCard, auditar, confirmar } = useConfig()
  // as variáveis do card são as mesmas de Variáveis: é lá que elas são criadas e editadas
  const { cfg, abrirModal } = useAgentes()
  const catalogo: Variavel[] = Object.entries(cfg.vars).map(([k, v]) => ({
    k,
    n: v.nome,
    o: v.settle ? "settle" : "minha",
    tipo: FORMATO_VAR[v.tipo].t.toLowerCase(),
  }))
  const [menuAberto, setMenuAberto] = useState(false)
  const [novaAberta, setNovaAberta] = useState(false)
  const [nomeNovo, setNomeNovo] = useState("")
  const [tipoNovo, setTipoNovo] = useState<TipoDeCampo>("Texto")

  /**
   * Arrastar é o que muda a seção: o campo assume o formato de quem estava no lugar onde ele
   * foi solto. As peças do topo e a tabela de itens só mudam de ordem, nunca de seção.
   */
  function soltar(deId: string, paraId: string) {
    const campo = campos.find((c) => c.id === deId)
    if (!campo) return
    const alvo = campos.find((c) => c.id === paraId)
    const destino: FormatoCampo = alvo ? alvo.f : paraId === "vazio-data" ? "data" : "propriedade"
    if (campo.fixo && destino !== campo.f) {
      toast(
        campo.f === "tabela"
          ? "A tabela de itens fica sempre no fim do card"
          : "As peças do topo não entram nas seções: elas ficam na primeira linha do card"
      )
      return
    }
    setCampos((l) => {
      const nova = alvo ? mover(l, deId, paraId) : l
      return nova.map((x) => (x.id === deId ? { ...x, f: destino, junto: destino === "destaque" ? x.junto : false } : x))
    })
    auditar(
      "Campos da licitação",
      destino === campo.f
        ? "Reordenou os campos"
        : `"${campo.nome}" foi para ${NOME_DO_FORMATO[destino]}`
    )
  }

  function alternar(c: Campo, on: boolean) {
    setCampos((l) => l.map((x) => (x.id === c.id ? { ...x, on } : x)))
    auditar("Campos da licitação", `${on ? "Mostrou" : "Ocultou"} "${c.nome}"`)
  }

  /**
   * Remover do card é diferente de excluir: a variável continua existindo em Variáveis e a
   * propriedade continua com o que já foi preenchido. O diálogo diz isso, porque remover um
   * campo do card muda a tela de todo mundo da organização.
   */
  function remover(c: Campo) {
    const ondeAparece = TELAS_DO_CARD.find(([t]) => t === telaDoCard)?.[1]
    confirmar({
      titulo: `Remover "${c.nome}" do card?`,
      corpo: c.propria ? (
        <>
          <p>
            Ela some do card de {ondeAparece} para todas as pessoas da organização, e ninguém preenche mais esse campo
            por aqui.
          </p>
          <p>
            O que já foi preenchido continua guardado na licitação e volta a aparecer se você puser a propriedade no
            card de novo.
          </p>
        </>
      ) : (
        <>
          <p>Ela some do card de {ondeAparece} para todas as pessoas da organização.</p>
          <p>
            A variável continua existindo em Variáveis, continua sendo buscada no edital e continua disponível em
            Filtrar e Ordenar. Para parar de buscá-la, é em Variáveis que se mexe.
          </p>
        </>
      ),
      acao: "Remover do card",
      perigo: true,
      ok: () => {
        setCampos((l) => l.filter((x) => x.id !== c.id))
        auditar("Campos da licitação", `Removeu "${c.nome}" do card de ${ondeAparece}`)
        toast(`${c.nome} saiu do card`)
      },
    })
  }

  /** Campo criado aqui mesmo: não vem do catálogo de Variáveis, a pessoa preenche na licitação. */
  function criarPropriedade() {
    const nome = nomeNovo.trim()
    if (!nome) return
    if (campos.some((c) => c.nome.toLowerCase() === nome.toLowerCase())) {
      toast("Já existe um campo com esse nome neste card")
      return
    }
    setCampos((l) => [...l, { id: novoId("p"), nome, f: "propriedade", on: true, propria: true, tipo: tipoNovo }])
    auditar("Campos da licitação", `Criou a propriedade "${nome}" (${tipoNovo})`)
    toast(`${nome} entrou como propriedade`)
    setNomeNovo("")
    setTipoNovo("Texto")
    setNovaAberta(false)
  }

  function restaurarPadrao() {
    confirmar({
      titulo: "Restaurar os campos padrão?",
      corpo: (
        <p>
          O card de {TELAS_DO_CARD.find(([t]) => t === telaDoCard)?.[1]} volta a mostrar os campos da Settle na ordem
          original. As outras telas não mudam. Variáveis adicionadas saem do card, mas continuam existindo em Variáveis.
        </p>
      ),
      acao: "Restaurar",
      ok: () => {
        setCampos(camposDaTela(telaDoCard))
        auditar("Campos da licitação", "Restaurou o padrão da Settle")
        toast("Campos restaurados")
      },
    })
  }

  const item = (c: Campo) => {
    const itens = c.f === "tabela"
    return (
      <SettingsListItem key={c.id} id={c.id} name={c.nome}>
        {c.sempre ? (
          <span aria-hidden className="flex w-8 flex-none justify-center">
            <CheckIcon className="size-4 text-muted-foreground" />
          </span>
        ) : (
          <Switch
            checked={c.on}
            aria-label={`Mostrar ${c.nome}`}
            onCheckedChange={(v) => alternar(c, v)}
            data-settings-list-no-drag
          />
        )}
        {/* o nome trunca com reticências: em duas linhas a linha da lista cresce e desalinha */}
        <SettingsListName className={cn(!c.on && "text-muted-foreground")}>{c.nome}</SettingsListName>
        {c.sempre && (
          <SettingsListLockBadge tooltip="É por ela que a pessoa marca o card para as ações em lote. Dá para mudar a posição, não dá para esconder.">
            Sempre visível
          </SettingsListLockBadge>
        )}
        {itens && (
          // sem o rótulo "Mostrar até" escrito: ele vira o nome acessível e o campo ocupa o mínimo
          <Select
            value={String(maxItens)}
            onValueChange={(v) => {
              const n = Number(v)
              setMaxItens(n)
              auditar("Campos da licitação", `Passou a mostrar ${n ? `até ${n}` : "todos os"} itens no card`)
            }}
          >
            <SelectTrigger size="sm" aria-label="Mostrar até quantos itens" className="flex-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OPCOES_MAX_ITENS.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n ? `Até ${n} itens` : "Todos os itens"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {c.propria && (
          <>
            <Badge variant="secondary" className="flex-none rounded-full bg-muted font-medium text-muted-foreground">
              {c.tipo}
            </Badge>
            <SettingsListItemActions>
              <BotaoIcone
                rotulo={`Remover ${c.nome} do card`}
                dica="Remover do card: o que já foi preenchido nas licitações continua guardado."
                perigo
                onClick={() => remover(c)}
              >
                <Trash2Icon />
              </BotaoIcone>
            </SettingsListItemActions>
          </>
        )}
        {c.var && c.origem && (
          <>
            <SeloDeOrigem origem={c.origem} />
            <SettingsListItemActions>
              {/* abre a mesma janela de Variáveis, sem sair daqui: o card é só onde ela aparece */}
              <BotaoIcone
                rotulo={`Editar a variável ${c.nome}`}
                dica={
                  c.origem === "settle"
                    ? "Editar variável: abre a variável da Settle para consultar o que ela busca."
                    : "Editar variável: abre a variável para mudar o que ela busca no edital."
                }
                onClick={() => abrirModal({ tipo: "variavel", k: c.id })}
              >
                <PencilIcon />
              </BotaoIcone>
              <BotaoIcone
                rotulo={`Remover ${c.nome} do card`}
                dica="Remover do card: ela some daqui, mas continua existindo em Variáveis."
                perigo
                onClick={() => remover(c)}
              >
                <Trash2Icon />
              </BotaoIcone>
            </SettingsListItemActions>
          </>
        )}
      </SettingsListItem>
    )
  }

  /**
   * Uma solta só para o card inteiro: o campo muda de bloco (e de formato) conforme a área
   * onde caiu, e a posição vem do lugar exato. No corpo, cair no meio de uma linha junta as
   * peças; cair na borda abre linha nova.
   */
  function soltarNoCard(id: string, alvo: AlvoArrasto) {
    setCampos((l) => {
      const campo = l.find((c) => c.id === id)
      if (!campo) return l
      const visiveis = l.filter((c) => c.f === alvo.area && c.on && c.id !== id)
      const i = Math.max(0, Math.min(alvo.indice, visiveis.length))
      const empurrado = visiveis[i]
      const novo: Campo = {
        ...campo,
        f: alvo.area,
        junto: alvo.area === "destaque" && !alvo.novaLinha && i > 0,
      }
      const daArea = [...visiveis.slice(0, i), novo, ...visiveis.slice(i)]
      // entrar como primeiro de uma linha existente empurra o antigo primeiro para o lado
      if (alvo.area === "destaque" && !alvo.novaLinha && i === 0 && empurrado) {
        daArea[1] = { ...empurrado, junto: true }
      }
      const ocultos = l.filter((c) => c.f === alvo.area && !c.on && c.id !== id)
      const resto = l.filter((c) => c.f !== alvo.area && c.id !== id)
      // a ordem dentro de cada área é o que importa; agrupar mantém tudo previsível
      const ordemDasAreas: FormatoCampo[] = ["topo", "destaque", "data", "propriedade", "tabela"]
      const porArea = new Map<FormatoCampo, Campo[]>()
      for (const f of ordemDasAreas) porArea.set(f, f === alvo.area ? [...daArea, ...ocultos] : [])
      for (const c of resto) porArea.get(c.f)!.push(c)
      const nova = ordemDasAreas.flatMap((f) => porArea.get(f)!)
      if (campo.f !== alvo.area) {
        auditar("Campos da licitação", `"${campo.nome}" foi para ${NOME_DO_FORMATO[alvo.area]}`)
      } else {
        auditar("Campos da licitação", `Mudou ${campo.nome} de lugar no card`)
      }
      return nova
    })
  }

  return (
    <SettingsPage width="full">
      <Aviso tom="marca" fechavel>
        Aqui você escolhe o que aparece da licitação e em que ordem. Cada lugar tem a sua configuração: as abas abaixo
        são os três lugares onde a licitação aparece. Vale para todas as pessoas da organização, e os campos escondidos
        continuam disponíveis em Filtrar e Ordenar.
      </Aviso>
      {/*
        Abas com a toolbox ao lado, como no resto da plataforma: as abas dizem onde o card
        aparece e a toolbox junta as ações daquela área, em vez de espalhá-las pela página.
      */}
      <div className="mb-3.5 flex flex-wrap items-center gap-2">
        <Tabs value={telaDoCard} onValueChange={(v) => setTelaDoCard(v as TelaDoCard)} className="min-w-0 flex-1">
          <TabsList aria-label="Onde o card aparece" className="max-w-full justify-start overflow-x-auto">
            {TELAS_DO_CARD.map(([t, nome]) => (
              <TabsTrigger key={t} value={t} className="px-3">
                {nome}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {/* a barra de ações da plataforma: mesmo bloco visual das abas, do design system */}
        <Toolbar aria-label={`Ações dos campos de ${TELAS_DO_CARD.find(([t]) => t === telaDoCard)?.[1]}`}>
          <Popover open={menuAberto} onOpenChange={setMenuAberto}>
            <PopoverTrigger asChild>
              <ToolbarButton>
                <PlusIcon />
                Adicionar variável
              </ToolbarButton>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <ListaDeVariaveis
                variaveis={catalogo}
                excluir={campos.map((c) => c.id)}
                onCriar={() => {
                  setMenuAberto(false)
                  abrirModal({ tipo: "variavel", k: null })
                }}
                onEscolher={(v) => {
                  setMenuAberto(false)
                  setCampos((l) => [...l, { id: v.k, nome: v.n, f: "propriedade", on: true, var: true, origem: v.o }])
                  auditar("Campos da licitação", `Adicionou a variável "${v.n}" ao card`)
                  toast(`${v.n} entrou no card, como propriedade`)
                }}
              />
            </PopoverContent>
          </Popover>
          <Popover open={novaAberta} onOpenChange={setNovaAberta}>
            <PopoverTrigger asChild>
              <ToolbarButton>
                <PlusIcon />
                Nova propriedade
              </ToolbarButton>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72">
              <form
                className="flex flex-col gap-3"
                onSubmit={(e) => {
                  e.preventDefault()
                  criarPropriedade()
                }}
              >
                <p className="text-[13px] leading-[19px] text-muted-foreground">
                  Um campo que a sua organização preenche na licitação, sem vir de variável. É o caso do substatus.
                </p>
                <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
                  Nome
                  <Input
                    value={nomeNovo}
                    onChange={(e) => setNomeNovo(e.target.value)}
                    placeholder="Substatus, Responsável técnico…"
                    className="font-normal"
                    autoFocus
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
                  Tipo
                  <NativeSelect
                    value={tipoNovo}
                    onChange={(e) => setTipoNovo(e.target.value as TipoDeCampo)}
                    className="w-full font-normal"
                  >
                    {TIPOS_DE_CAMPO.map((t) => (
                      <NativeSelectOption key={t} value={t}>
                        {t}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </label>
                <Button type="submit" size="sm" className="self-end">
                  Criar propriedade
                </Button>
              </form>
            </PopoverContent>
          </Popover>
          <ToolbarSeparator />
          <ToolbarButton onClick={restaurarPadrao}>Restaurar padrão da Settle</ToolbarButton>
        </Toolbar>
      </div>
      <SettingsSplit>
        <div className="flex min-w-0 flex-col gap-2">
          <SettingsBox>
            <SettingsList
              labels={{ moveHandle: (n) => `Mover o campo ${n ?? ""}. Use as setas para cima e para baixo.` }}
              onMove={soltar}
            >
              {campos.filter((c) => c.f === "topo" || c.f === "destaque").map(item)}
              {/* o card do quadro não tem as duas caixas de metadados: lá tudo é linha do corpo */}
              {(telaDoCard === "andamento" ? [] : SECOES).map(([f, nome, descricao]) => {
                const doGrupo = campos.filter((c) => c.f === f)
                return [
                  <SettingsListGroupLabel key={`s-${f}`} description={descricao}>
                    {nome}
                  </SettingsListGroupLabel>,
                  ...(doGrupo.length ? doGrupo.map(item) : [<SecaoVazia key={`v-${f}`} formato={f} />]),
                ]
              })}
              {campos.filter((c) => c.f === "tabela").map(item)}
            </SettingsList>
          </SettingsBox>
        </div>

        <SettingsPreview aria-live="polite">
          <SettingsPreviewHeader label={`Pré-visualização · ${TELAS_DO_CARD.find(([t]) => t === telaDoCard)?.[1]}`} />
          <PreviaDoCard aoSoltarCampo={soltarNoCard} />
        </SettingsPreview>
      </SettingsSplit>
    </SettingsPage>
  )
}

/** O card de Recomendadas montado com a configuração atual, no layout do card real. */
function PreviaDoCard({ aoSoltarCampo }: { aoSoltarCampo: (id: string, alvo: AlvoArrasto) => void }) {
  const { campos, maxItens, telaDoCard } = useConfig()
  const { cfg } = useAgentes()
  const L = LICS[LIC_EXEMPLO]
  const [carregados, setCarregados] = useState(BLOCO_DE_ITENS)
  const { tabelaNoTopo, setTabelaNoTopo } = useConfig()
  const [alvoDaTabela, setAlvoDaTabela] = useState<"antes" | "depois" | null>(null)
  const pegouTabela = useRef(false)
  const refMeta = useRef<HTMLDivElement>(null)
  const trocarLugarDaTabela = (antes: boolean) => setTabelaNoTopo(antes)

  // trocar a opção recomeça a contagem, senão "Todos" já abriria com o que ficou de antes
  useEffect(() => setCarregados(BLOCO_DE_ITENS), [maxItens])

  const valor = (c: Campo) => {
    // campo próprio nasce sem dado: quem preenche é a pessoa, na licitação
    if (c.propria) return "Não informado"
    // sem valor no edital de exemplo, a prévia mostra o que a variável devolve quando não acha
    if (c.var) return valorDaLic(L, c.id) || cfg.vars[c.id]?.padrao || "Não encontrado"
    const fixos: Record<string, string> = {
      responsavel: "Selecionar Responsável",
      substatus: "Selecionar Substatus",
      descricao: "Adicionar Descrição",
    }
    return fixos[c.id] ?? (valorDaLic(L, c.id) || "-")
  }
  const campo = (c: Campo): LicitacaoCardMetaField => {
    const capag = c.id === "capagE" || c.id === "capagM"
    const v = valor(c)
    return {
      label: c.nome,
      value: capag && v !== "-" ? <SeloCapag nota={v} /> : v,
      tone: c.id === "envio" ? "warning" : "default",
    }
  }

  const noQuadro = telaDoCard === "andamento"
  const noWorkspace = telaDoCard === "workspace"
  // Em andamento tem três visões da mesma lista; a configuração de campos vale para as três
  const [visao, setVisao] = useState<Visao>("board")
  const doFormato = (f: FormatoCampo) => campos.filter((c) => c.f === f && c.on)
  const topo = doFormato("topo")
  const destaque = doFormato("destaque")
  const datas = doFormato("data")
  const meta = doFormato("propriedade")
  const mostrarItens = campos.some((c) => c.id === "itens" && c.on)
  // ME/EPP só vira tag do órgão quando os dois estão no destaque, um perto do outro
  const orgaoNoDestaque = campos.find((c) => c.id === "orgao")
  const meNoDestaque = campos.find((c) => c.id === "me")
  const temME =
    !!L.me &&
    meNoDestaque?.on === true &&
    meNoDestaque.f === "destaque" &&
    orgaoNoDestaque?.on === true &&
    orgaoNoDestaque.f === "destaque"
  // "Todos os itens" não desenha tudo de uma vez: a tabela rola e carrega em blocos
  const todos = maxItens === 0
  const itensVisiveis = L.itens.slice(0, todos ? carregados : maxItens)
  const resto = L.itens.length - itensVisiveis.length
  const nota = Number(L.score.split("/")[0])

  // O título fica à esquerda e empurra o resto para a direita (mr-auto); as peças seguintes
  // aparecem na ordem da lista. Tudo aqui é ilustrativo: a pré-visualização não executa ações.
  const blocoTopo = (c: Campo) => {
    switch (c.id) {
      case "selecao":
        return (
          <span
            aria-hidden
            // block: dentro da peça arrastável o span não é mais filho de um flex, e inline ignora o tamanho
            className="block size-4.5 flex-none rounded-[5px] border border-input"
          />
        )
      case "edital":
        return (
          <LicitacaoCardTitle key={c.id} prefix="Edital">
            <b>{L.edital}</b>
          </LicitacaoCardTitle>
        )
      case "descartar":
        return (
          <Button key={c.id} variant="outline" size="sm" asChild>
            <span>Descartar</span>
          </Button>
        )
      case "analise":
        return (
          <Button key={c.id} size="sm" asChild>
            <span>Enviar para análise</span>
          </Button>
        )
      case "responsaveis":
        return (
          <LicitacaoCardAvatars
            key={c.id}
            avatars={[
              { initials: "MB", name: "Mateus Brum" },
              { initials: "AC", name: "Ana Camargo" },
              { initials: "RS", name: "Rafael Souza" },
            ]}
            onAdd={() => {}}
          />
        )
      case "acoes":
        return (
          <LicitacaoCardIconActions key={c.id}>
            {[
              { label: "Abrir no portal", icon: <GlobeIcon /> },
              { label: "Salvar", icon: <BookmarkIcon /> },
              { label: "Copiar link", icon: <Link2Icon /> },
              { label: "Compartilhar", icon: <Share2Icon /> },
              { label: "Arquivos", icon: <FolderIcon /> },
              // comentário só existe dentro da licitação: nas listas não há onde comentar
              ...(telaDoCard === "workspace" ? [{ label: "Comentários", icon: <MessageSquareIcon /> }] : []),
            ].map((a) => (
              <LicitacaoCardIconAction key={a.label} {...a} />
            ))}
          </LicitacaoCardIconActions>
        )
      case "checklist":
        return (
          <Button key={c.id} variant="outline" size="sm" asChild>
            <span>Checklist</span>
          </Button>
        )
      case "score":
        return (
          <LicitacaoCardStatusButton
            key={c.id}
            size="sm"
            tone={nota >= 70 ? "success" : nota >= 40 ? "warning" : "destructive"}
            asChild
          >
            <span>
              <GaugeIcon aria-hidden className="size-3.5" />
              {L.score}
            </span>
          </LicitacaoCardStatusButton>
        )
      default:
        return null
    }
  }

  const blocoDestaque = (c: Campo) => {
    switch (c.id) {
      case "segmento":
        return (
          <LicitacaoCardSegments
            key={c.id}
            segments={L.segs.map((nome) => ({ label: nome, className: classeDeSegmento(nome) }))}
          />
        )
      // ME/EPP é uma tag ao lado do órgão; sozinho, vira um selo na própria linha
      case "me":
        return L.me && !temME ? (
          <div key={c.id}>
            <SeloME />
          </div>
        ) : null
      case "orgao":
        return (
          <LicitacaoCardDescription key={c.id}>
            {linhaDoCorpo(c, { tag: temME ? <SeloME /> : undefined })}
          </LicitacaoCardDescription>
        )
      case "valor":
        return noQuadro ? (
          <LicitacaoCardDescription key={c.id}>{linhaDoCorpo(c, { forte: true })}</LicitacaoCardDescription>
        ) : (
          <LicitacaoCardValue key={c.id} label={c.nome}>
            {L.valor}
          </LicitacaoCardValue>
        )
      default:
        return <LicitacaoCardDescription key={c.id}>{linhaDoCorpo(c)}</LicitacaoCardDescription>
    }
  }

  /**
   * Uma linha do corpo. No card do quadro ela não tem rótulo, só o valor: a coluna é estreita
   * e o card real de Em andamento escreve "Prefeitura de..." direto, sem "Órgão:" na frente.
   */
  function linhaDoCorpo(c: Campo, { forte, tag }: { forte?: boolean; tag?: ReactNode } = {}) {
    // o objeto é cortado em três linhas no quadro: a coluna é estreita e o card, curto
    const classe = cn(forte && "font-semibold", noQuadro && c.id === "objeto" && "line-clamp-3")
    if (!noQuadro) {
      return (
        <LicitacaoCardField label={c.nome} tag={tag} className={classe}>
          {valor(c)}
        </LicitacaoCardField>
      )
    }
    return (
      <p className={cn("text-sm leading-[21px]", classe)}>
        {valor(c)}
        {tag != null && <> {tag}</>}
      </p>
    )
  }

  /** O texto de um campo, para onde só cabe texto (o dia do calendário). */
  const textoDoCampo = (c: Campo) =>
    c.id === "edital" ? `Edital ${L.edital}` : c.id === "segmento" ? L.segs.join(", ") : String(valor(c))

  /** A célula da visão Tabela: o mesmo valor do card, com as peças que têm forma própria. */
  const celulaDaTabela = (c: Campo): ReactNode => {
    if (c.id === "selecao") return <span className="block size-4.5 rounded-[5px] border border-input" />
    if (c.id === "edital") return <b>{L.edital}</b>
    if (c.id === "segmento") {
      return (
        <span className="flex flex-wrap gap-1">
          {L.segs.map((nome) => (
            <LicitacaoCardSegment key={nome} size="sm" className={classeDeSegmento(nome)}>
              {nome}
            </LicitacaoCardSegment>
          ))}
        </span>
      )
    }
    if (c.id === "me") return L.me ? <SeloME /> : "-"
    return valor(c)
  }

  const blocoDeItens = !mostrarItens ? null : (
    <div key="itens" className="flex flex-col gap-1.5">
      <div
        onScroll={(e) => {
          const el = e.currentTarget
          if (!todos || resto <= 0) return
          if (el.scrollHeight - el.scrollTop - el.clientHeight < 80) setCarregados((n) => n + BLOCO_DE_ITENS)
        }}
        className={cn(todos && "max-h-90 overflow-y-auto [scrollbar-width:thin]")}
      >
        <TabelaDeItens
          titulo={
            <span
              role="button"
              tabIndex={0}
              aria-label="Mover a tabela de itens no card. Alt com as setas para cima e para baixo."
              onPointerDown={(e) => {
                pegouTabela.current = true
                e.currentTarget.setPointerCapture(e.pointerId)
              }}
              onPointerMove={(e) => {
                if (!pegouTabela.current) return
                const r = refMeta.current?.getBoundingClientRect()
                if (!r) return
                setAlvoDaTabela(e.clientY < r.top + r.height / 2 ? "antes" : "depois")
              }}
              onPointerUp={() => {
                if (alvoDaTabela) trocarLugarDaTabela(alvoDaTabela === "antes")
                pegouTabela.current = false
                setAlvoDaTabela(null)
              }}
              onKeyDown={(e) => {
                if (!e.altKey) return
                if (e.key === "ArrowUp") trocarLugarDaTabela(true)
                if (e.key === "ArrowDown") trocarLugarDaTabela(false)
              }}
              className="cursor-grab touch-none rounded-md px-1 select-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              Itens com Correspondência
            </span>
          }
          total={L.totalItens}
          quantos={L.itens.length}
          itens={itensVisiveis}
        />
      </div>
      {todos && (
        <span className="text-[13px] text-muted-foreground">
          {resto > 0
            ? `Mostrando ${fmt(itensVisiveis.length)} de ${fmt(L.itens.length)}. Role a tabela para carregar mais.`
            : `${fmt(L.itens.length)} itens com correspondência`}
        </span>
      )}
    </div>
  )

  // no dia do calendário só cabe texto: as peças de ação e o score ficam de fora
  const comTexto = [...topo, ...destaque].filter((c) => !SEM_TEXTO.has(c.id))
  // o edital fecha o grupo da esquerda; sem ele, é a primeira peça que fecha
  const separaOTopo = topo.some((x) => x.id === "edital") ? "edital" : topo[0]?.id
  const fileiraDoTopo = (
    <FileiraDeCampos
      area="topo"
      campos={topo}
      // justify-end: no card real só a seleção e o edital ficam à esquerda (mr-auto no edital),
      // e tudo o mais fica à direita, inclusive o que sobra para a segunda linha
      className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2"
      // o mr-auto tem que ficar na peça, que é o item do flex, e não no título dentro dela:
      // é o que deixa só a seleção e o edital à esquerda e joga todo o resto para a direita
      classePeca={(c) => cn("px-1 py-0.5", c.id === separaOTopo && "mr-auto")}
      render={(c) => blocoTopo(c)}
    />
  )

  // dentro da licitação os itens não ficam no card: ficam numa aba, ao lado das outras
  const itensNoLugar =
    noWorkspace && blocoDeItens ? (
      <div className="flex flex-col gap-2.5">
        <div role="tablist" aria-label="Abas da licitação" className="flex gap-4 border-b text-sm">
          {["Itens", "Detalhes", "Manifestações", "Análise Técnica"].map((t, i) => (
            <span
              key={t}
              role="tab"
              aria-selected={i === 0}
              className={cn(
                "-mb-px border-b-2 pb-2",
                i === 0 ? "border-primary font-semibold text-foreground" : "border-transparent text-muted-foreground"
              )}
            >
              {t}
            </span>
          ))}
        </div>
        {blocoDeItens}
      </div>
    ) : (
      blocoDeItens
    )

  const oCard = (
    <LicitacaoCardRoot>
      {!noWorkspace && topo.length > 0 && <LicitacaoCardHeader>{fileiraDoTopo}</LicitacaoCardHeader>}
      <LicitacaoCardContent>
        {/* no card das listas o corpo fica numa caixa com borda; no quadro ele é o card inteiro */}
        {destaque.length > 0 &&
          (noQuadro ? (
            <CorpoDoCard linhas={emLinhas(destaque)} render={blocoDestaque} />
          ) : (
            <div className="rounded-xl border px-3.5 py-3">
              <CorpoDoCard linhas={emLinhas(destaque)} render={blocoDestaque} />
            </div>
          ))}
        {tabelaNoTopo && itensNoLugar}
        {alvoDaTabela === "antes" && !tabelaNoTopo && <BarraDeAlvo />}
        <div ref={refMeta}>
          {(datas.length > 0 || meta.length > 0) && (
            <GradeDePropriedades
              datas={meta.length ? datas : []}
              propriedades={meta.length ? meta : datas}
              comoMeta={campo}
            />
          )}
        </div>
        {alvoDaTabela === "depois" && tabelaNoTopo && <BarraDeAlvo />}
        {!tabelaNoTopo && itensNoLugar}
      </LicitacaoCardContent>
    </LicitacaoCardRoot>
  )

  // Em andamento tem três visões da mesma lista, e os campos ligados valem para as três:
  // no quadro viram linhas do card, na tabela viram colunas e no calendário sobram duas.
  const doQuadro = (
    <div className="flex flex-col gap-3">
      <Tabs value={visao} onValueChange={(v) => setVisao(v as Visao)}>
        <TabsList aria-label="Como Em andamento é visto">
          {VISOES.map(([v, nome]) => (
            <TabsTrigger key={v} value={v} className="px-3">
              {nome}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {visao === "board" && <div className="max-w-85">{oCard}</div>}
      {visao === "tabela" && <TabelaDeLicitacoes campos={[...topo, ...destaque]} celula={celulaDaTabela} />}
      {visao === "calendario" && <CalendarioDeLicitacoes campos={comTexto} texto={textoDoCampo} lic={L} />}
      <p className="text-[13px] leading-[19px] text-muted-foreground">
        {visao === "board"
          ? "Arraste os campos no card para mudar a ordem. Ela é a mesma nas três visões."
          : visao === "tabela"
            ? "As colunas são os mesmos campos, na ordem do quadro. Organize no quadro."
            : "No calendário só cabem dois campos por dia: os dois primeiros da ordem do quadro. A data é o envio da proposta."}
      </p>
    </div>
  )

  return (
    <ProvedorDeArrasto aoSoltar={aoSoltarCampo}>
      {noQuadro ? (
        doQuadro
      ) : noWorkspace ? (
        // uma janela de navegador em volta: ali não é um card numa lista, é uma página
        <MolduraDeNavegador url={`app.settlegov.com/biddings/${valorDaLic(L, "id") || "1908424"}`}>
          <nav aria-label="Caminho" className="mb-3 text-[13px] text-muted-foreground">
            Em andamento <span aria-hidden>›</span>{" "}
            <span className="text-foreground">Detalhes da licitação · {valorDaLic(L, "id")}</span>
          </nav>
          {/* as ações da licitação ficam no cabeçalho da página, com o edital como título */}
          {topo.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-2 border-b pb-3">
              <span className="text-base leading-6 font-semibold">Edital {L.edital}</span>
              {fileiraDoTopo}
            </div>
          )}
          {oCard}
        </MolduraDeNavegador>
      ) : (
        oCard
      )}
    </ProvedorDeArrasto>
  )
}

/** Peças que são ação ou selo, e por isso não viram texto no calendário. */
const SEM_TEXTO = new Set(["selecao", "descartar", "analise", "responsaveis", "acoes", "checklist", "score"])

/** Visões de Em andamento, na ordem em que a plataforma mostra. */
type Visao = "board" | "tabela" | "calendario"
const VISOES: [Visao, string][] = [
  ["board", "Board"],
  ["tabela", "Tabela"],
  ["calendario", "Calendário"],
]

/**
 * Moldura de janela de navegador. Dentro da licitação a pessoa não está olhando um card numa
 * lista: está numa página. Sem a moldura, a pré-visualização parecia mais um card solto.
 */
function MolduraDeNavegador({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="flex items-center gap-2 border-b bg-muted px-3 py-2">
        <span aria-hidden className="flex flex-none gap-1.25">
          <i className="size-2.5 rounded-full bg-foreground/15" />
          <i className="size-2.5 rounded-full bg-foreground/15" />
          <i className="size-2.5 rounded-full bg-foreground/15" />
        </span>
        <span className="ml-1 flex min-w-0 flex-1 items-center gap-1.5 rounded-md bg-background px-2.5 py-1 text-xs text-muted-foreground">
          <LockIcon aria-hidden className="size-3 flex-none" />
          <span className="truncate">{url}</span>
        </span>
      </div>
      <div className="bg-background p-4">{children}</div>
    </div>
  )
}

/** A visão Tabela de Em andamento: cada campo ligado vira uma coluna, na ordem do quadro. */
function TabelaDeLicitacoes({ campos, celula }: { campos: Campo[]; celula: (c: Campo) => ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            {campos.map((c) => (
              <TableHead key={c.id} className="whitespace-nowrap">
                {c.id === "selecao" ? <span className="sr-only">Seleção</span> : c.nome}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            {campos.map((c) => (
              <TableCell key={c.id} className="max-w-60 align-top">
                <span className="line-clamp-3">{celula(c)}</span>
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

/**
 * A visão Calendário de Em andamento: a licitação aparece no dia do envio da proposta, e no
 * espaço de um dia só cabem dois campos. É o lugar onde a ordem escolhida mais aperta.
 */
function CalendarioDeLicitacoes({ campos, texto, lic }: { campos: Campo[]; texto: (c: Campo) => string; lic: (typeof LICS)[number] }) {
  const dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]
  const numeros = [28, 29, 30, 1, 2, 3, 4]
  const noDia = Number((lic.envio || "02/10/2026").slice(0, 2))
  const resumo = campos.slice(0, 2).map(texto).join(" · ")

  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="grid grid-cols-7 border-b bg-muted/50 text-[11px] font-semibold text-muted-foreground">
        {dias.map((d) => (
          <span key={d} className="truncate px-2 py-1.5">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {numeros.map((n, i) => (
          <div key={n} className={cn("min-h-22 p-1.5", i < 6 && "border-r", "border-b last:border-b-0")}>
            <span className={cn("block text-right text-[11px]", n === noDia ? "font-semibold text-foreground" : "text-muted-foreground")}>
              {n === 1 ? "1 de Outubro" : n}
            </span>
            {n === noDia && resumo && (
              <span className="mt-1 flex items-center gap-1 text-[11px] leading-4">
                <i aria-hidden className="size-1.5 flex-none rounded-full bg-primary" />
                <span className="truncate">{resumo}</span>
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}


/** Larguras das colunas de itens, para a tabela não dançar quando a ordem muda. */
const LARGURA_COLUNA: Partial<Record<keyof ItemLic, number>> = {
  lote: 56,
  seg: 112,
  unid: 88,
  unit: 128,
  total: 128,
}

/**
 * Tabela de itens com as colunas na ordem da organização. Arrastar um cabeçalho troca a
 * ordem: o alvo sai da posição do ponteiro sobre os próprios cabeçalhos, e uma barra mostra
 * onde a coluna vai entrar. Pelo teclado, Alt com as setas para os lados.
 */
function TabelaDeItens({
  titulo,
  total,
  quantos,
  itens,
}: {
  titulo: ReactNode
  total: number
  quantos: number
  itens: ItemLic[]
}) {
  const { colunasItens, setColunasItens, auditar } = useConfig()
  const caixa = useRef<HTMLDivElement>(null)
  const pega = useRef<number | null>(null)
  const alvoRef = useRef<number | null>(null)
  const [alvo, setAlvo] = useState<number | null>(null)
  const [barra, setBarra] = useState<{ x: number; altura: number } | null>(null)

  const cabecalhos = () =>
    [...(caixa.current?.querySelectorAll("th") ?? [])].map((th) => th.getBoundingClientRect())

  const mover = (de: number, para: number) => {
    if (de === para || de + 1 === para) return
    setColunasItens((l) => {
      const nova = [...l]
      const [c] = nova.splice(de, 1)
      nova.splice(de < para ? para - 1 : para, 0, c)
      auditar("Campos da licitação", `Moveu a coluna "${c.nome}" na tabela de itens`)
      return nova
    })
  }

  const porTeclado = (e: React.KeyboardEvent, i: number) => {
    if (!e.altKey) return
    if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault()
      mover(i, i - 1)
    } else if (e.key === "ArrowRight" && i < colunasItens.length - 1) {
      e.preventDefault()
      mover(i, i + 2)
    }
  }

  return (
    <div
      ref={caixa}
      className="relative"
      onPointerDown={(e) => {
        const th = (e.target as HTMLElement).closest("th")
        if (!th) return
        const i = [...(th.parentElement?.children ?? [])].indexOf(th)
        if (i < 0) return
        pega.current = i
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        if (pega.current == null) return
        const rs = cabecalhos()
        const antes = rs.findIndex((r) => e.clientX < r.left + r.width / 2)
        const i = antes < 0 ? rs.length : antes
        alvoRef.current = i
        setAlvo(i)
        const r = rs[Math.min(i, rs.length - 1)]
        const raiz = caixa.current!.getBoundingClientRect()
        setBarra({ x: (i >= rs.length ? r.right : r.left) - raiz.left, altura: raiz.height })
      }}
      onPointerUp={() => {
        if (pega.current != null && alvoRef.current != null) mover(pega.current, alvoRef.current)
        pega.current = null
        alvoRef.current = null
        setAlvo(null)
        setBarra(null)
      }}
    >
      <LicitacaoCardItems
        variant="boxed"
        title={titulo}
        count={quantos}
        summary={`Total de itens: ${total}`}
        columns={colunasItens.map((c) => ({
          key: c.k,
          label: c.nome,
          width: LARGURA_COLUNA[c.k],
          align: c.k === "unit" || c.k === "total" ? ("right" as const) : undefined,
          className: cn("cursor-grab select-none", c.k === "nome" && "whitespace-normal"),
        }))}
        rows={itens.map((it) => ({
          ...it,
          seg: (
            <LicitacaoCardSegment size="sm" className={classeDeSegmento(it.seg)}>
              {it.seg}
            </LicitacaoCardSegment>
          ),
        }))}
      />
      {/* cabeçalhos com teclado: um botão invisível por coluna, na mesma ordem */}
      <div className="sr-only">
        {colunasItens.map((c, i) => (
          <button key={c.k} type="button" onKeyDown={(e) => porTeclado(e, i)}>
            Mover a coluna {c.nome}. Alt com as setas para os lados.
          </button>
        ))}
      </div>
      {barra && alvo != null && (
        <div
          aria-hidden
          style={{ left: barra.x, height: barra.altura }}
          className="pointer-events-none absolute top-0 w-0.5 rounded-full bg-primary"
        />
      )}
    </div>
  )
}

/**
 * Caixa de datas + grade de propriedades, com a regra de rolagem do card real
 * (settle-card-licitacao): a partir de 768px a grade tem a altura da caixa de datas ao lado e
 * rola por dentro; "Ver mais" só aparece quando sobra conteúdo. Abaixo disso as duas empilham
 * e nada rola.
 *
 * Diferença de propósito: no card real o "Ver mais" some de vez depois da primeira rolagem,
 * porque já cumpriu o papel de avisar. Aqui ele volta sempre que a grade está no topo, senão
 * quem está vendo a demonstração perde o efeito e não consegue mostrar de novo.
 */
function GradeDePropriedades({
  datas,
  propriedades,
  comoMeta,
}: {
  datas: Campo[]
  propriedades: Campo[]
  comoMeta: (c: Campo) => LicitacaoCardMetaField
}) {
  const caixaDatas = useRef<HTMLDivElement>(null)
  const rolagem = useRef<HTMLDivElement>(null)
  const [alturaMax, setAlturaMax] = useState<number | null>(null)
  const [sobra, setSobra] = useState(false)
  const [noTopo, setNoTopo] = useState(true)

  useLayoutEffect(() => {
    const datasEl = caixaDatas.current
    const rolagemEl = rolagem.current
    if (!datasEl || !rolagemEl) return
    const ajustar = () => {
      // altura útil = caixa de datas menos o padding vertical da caixa da grade
      if (window.innerWidth >= 768) setAlturaMax(Math.max(72, datasEl.clientHeight - 24))
      else setAlturaMax(null)
      requestAnimationFrame(() => {
        setSobra(rolagemEl.scrollHeight - rolagemEl.clientHeight > 4 && window.innerWidth >= 768)
        setNoTopo(rolagemEl.scrollTop <= 4)
      })
    }
    ajustar()
    const observador = new ResizeObserver(ajustar)
    observador.observe(datasEl)
    observador.observe(rolagemEl)
    window.addEventListener("resize", ajustar)
    document.fonts?.ready.then(ajustar)
    return () => {
      observador.disconnect()
      window.removeEventListener("resize", ajustar)
    }
  }, [])

  return (
    <div className="grid w-full items-start overflow-hidden rounded-xl border md:grid-cols-[auto_minmax(0,1fr)]">
      {datas.length > 0 && (
        <div ref={caixaDatas} className="px-3.5 py-3 max-md:border-b md:border-r">
          {/* no card real a coluna de datas é empilhada: Adicionada, Atualizada, Envio da proposta */}
          <FileiraDeCampos
            area="data"
            campos={datas}
            rotulo="Datas"
            className="grid grid-cols-1 items-start gap-y-4"
            classePeca="px-1 py-0.5"
            render={(c) => <ItemMeta campo={comoMeta(c)} />}
          />
        </div>
      )}
      <div className="@container relative min-w-0 px-3.5 py-3">
        <div
          ref={rolagem}
          onScroll={(e) => setNoTopo(e.currentTarget.scrollTop <= 4)}
          style={alturaMax != null ? { maxHeight: alturaMax } : undefined}
          className={cn(alturaMax != null && "overflow-y-scroll [scrollbar-width:thin]")}
        >
          <FileiraDeCampos
            area="propriedade"
            campos={propriedades}
            rotulo="Informações do edital"
            className="grid grid-cols-1 items-start gap-x-4 gap-y-4 @sm:grid-cols-2 @3xl:grid-cols-5"
            classePeca="px-1 py-0.5"
            render={(c) => <ItemMeta campo={comoMeta(c)} />}
          />
        </div>
        {sobra && noTopo && (
          <button
            type="button"
            onClick={() => rolagem.current?.scrollBy({ top: 56, behavior: "smooth" })}
            className="absolute right-2.25 bottom-0 left-0 flex items-center gap-1 rounded-b-xl bg-linear-to-t from-card from-55% to-transparent px-3.5 pt-5.5 pb-2.5 text-left text-[13px] font-medium text-primary outline-none hover:text-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Ver mais
            <ArrowDownIcon aria-hidden className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

/** Uma propriedade da grade: rótulo em cima, valor embaixo. */
function ItemMeta({ campo, className }: { campo: LicitacaoCardMetaField; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-0.75", className)}>
      <dt className="text-sm leading-5 font-semibold text-foreground">{campo.label}</dt>
      <dd
        data-tone={campo.tone ?? "default"}
        className="flex min-w-0 items-center gap-1 text-sm leading-5 text-muted-foreground data-[tone=warning]:font-medium data-[tone=warning]:text-warning-strong"
      >
        <span className="truncate">{campo.value}</span>
      </dd>
    </div>
  )
}

/**
 * Chip de segmento no tom claro da categoria, como no card real. A cor vem do nome, então o
 * mesmo segmento tem a mesma cor no topo e na coluna Segmento da tabela.
 */
function classeDeSegmento(nome: string) {
  return CLASSE_CHIP_SEGMENTO[corDoSegmento(nome)]
}

/** As duas caixas do card que recebem campos: as datas e a grade de propriedades. */
const SECOES: [FormatoCampo, string, string][] = [
  ["data", "Datas", "caixa da esquerda"],
  ["propriedade", "Propriedades", "grade ao lado das datas"],
]

const NOME_DO_FORMATO: Record<FormatoCampo, string> = {
  topo: "o topo",
  destaque: "o corpo do card",
  data: "Datas",
  propriedade: "Propriedades",
  tabela: "a tabela de itens",
}

/** Linha que segura a seção quando ela fica sem campo nenhum, para continuar dando para soltar. */
function SecaoVazia({ formato }: { formato: FormatoCampo }) {
  return (
    <SettingsListItem id={`vazio-${formato}`} name="">
      <span className="py-1 text-[13px] text-muted-foreground">Arraste um campo para cá</span>
    </SettingsListItem>
  )
}


/* ------------------------------------------------------------------ */
/* Arrastar campos dentro do card                                      */
/* ------------------------------------------------------------------ */

/** Onde o campo cai: em que área, em que posição, e se abre uma linha nova (só no corpo). */
type AlvoArrasto = { area: FormatoCampo; indice: number; novaLinha: boolean }

type Arrasto = {
  arrastando: string | null
  alvo: AlvoArrasto | null
  registrar: (area: FormatoCampo, alvoEm: (x: number, y: number) => AlvoArrasto | null) => () => void
  iniciar: (id: string, e: React.PointerEvent) => void
  mover: (e: React.PointerEvent) => void
  soltar: () => void
  /** Move sem arrastar: é por aqui que o teclado faz o mesmo que o ponteiro. */
  soltarDireto: (id: string, alvo: AlvoArrasto) => void
}

const CtxArrasto = createContext<Arrasto | null>(null)
const usarArrasto = () => useContext(CtxArrasto)

/**
 * Guarda o arrasto do card inteiro. Cada área (topo, corpo, datas, propriedades) se registra
 * com uma função que responde "se soltar aqui, onde cai?". Assim um campo sai de uma área e
 * entra em outra, que é o que muda o formato dele.
 *
 * Eventos de ponteiro, não o arrastar nativo do HTML: o nativo não pega em toque e não deixa
 * desenhar a barra do alvo com precisão. As refs são a fonte da verdade porque o ponteiro pode
 * levantar no mesmo quadro em que mexeu, antes de o estado chegar.
 */
function ProvedorDeArrasto({
  aoSoltar,
  children,
}: {
  aoSoltar: (id: string, alvo: AlvoArrasto) => void
  children: ReactNode
}) {
  const [arrastando, setArrastando] = useState<string | null>(null)
  const [alvo, setAlvo] = useState<AlvoArrasto | null>(null)
  const areas = useRef(new Map<FormatoCampo, (x: number, y: number) => AlvoArrasto | null>())
  const inicio = useRef<{ id: string; x: number; y: number } | null>(null)
  const arrastandoRef = useRef<string | null>(null)
  const alvoRef = useRef<AlvoArrasto | null>(null)

  const valor: Arrasto = {
    arrastando,
    alvo,
    registrar: (area, alvoEm) => {
      areas.current.set(area, alvoEm)
      return () => areas.current.delete(area)
    },
    iniciar: (id, e) => {
      if (e.button !== 0) return
      inicio.current = { id, x: e.clientX, y: e.clientY }
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    mover: (e) => {
      const i = inicio.current
      if (!i) return
      if (!arrastandoRef.current && Math.hypot(e.clientX - i.x, e.clientY - i.y) < 4) return
      if (!arrastandoRef.current) {
        arrastandoRef.current = i.id
        setArrastando(i.id)
      }
      let novo: AlvoArrasto | null = null
      for (const alvoEm of areas.current.values()) {
        novo = alvoEm(e.clientX, e.clientY)
        if (novo) break
      }
      alvoRef.current = novo
      setAlvo(novo)
    },
    soltarDireto: aoSoltar,
    soltar: () => {
      const id = arrastandoRef.current
      const destino = alvoRef.current
      if (id && destino) aoSoltar(id, destino)
      inicio.current = null
      arrastandoRef.current = null
      alvoRef.current = null
      setArrastando(null)
      setAlvo(null)
    },
  }

  return <CtxArrasto.Provider value={valor}>{children}</CtxArrasto.Provider>
}

/** Uma peça que pode ser pega. O teclado faz o mesmo com Alt e as setas. */
function PecaArrastavel({
  campo,
  area,
  indice,
  className,
  children,
}: {
  campo: Campo
  area: FormatoCampo
  /** Posição do campo na área, contada com ele ainda no lugar. */
  indice: number
  className?: string
  children: ReactNode
}) {
  const arrasto = usarArrasto()
  if (!arrasto) return <>{children}</>
  const pego = arrasto.arrastando === campo.id
  const aoTeclado = (e: React.KeyboardEvent) => {
    if (!e.altKey || !e.key.startsWith("Arrow")) return
    e.preventDefault()
    const paraTras = e.key === "ArrowLeft" || e.key === "ArrowUp"
    const novaLinha = e.key === "ArrowUp" || e.key === "ArrowDown"
    arrasto.soltarDireto(campo.id, { area, indice: paraTras ? indice - 1 : indice + 1, novaLinha })
  }
  return (
    <div
      data-peca={campo.id}
      tabIndex={0}
      role="button"
      aria-label={`Mover ${campo.nome} no card. Alt com as setas para os lados muda de posição; Alt com as setas para cima e para baixo põe em outra linha.`}
      onPointerDown={(e) => arrasto.iniciar(campo.id, e)}
      onPointerMove={arrasto.mover}
      onPointerUp={arrasto.soltar}
      onPointerCancel={arrasto.soltar}
      onKeyDown={aoTeclado}
      className={cn(
        "min-w-0 touch-none rounded-md transition-colors select-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        pego ? "cursor-grabbing bg-muted opacity-50" : "cursor-grab",
        className
      )}
    >
      {children}
    </div>
  )
}

/** Barra fina que mostra onde o campo vai cair. */
function BarraDeAlvo({ vertical }: { vertical?: boolean }) {
  return <div aria-hidden className={cn("rounded-full bg-primary", vertical ? "w-0.5 self-stretch" : "h-0.5 w-full")} />
}

/**
 * Registra uma área como destino do arrasto. `itens` é a ordem dos campos visíveis dela;
 * a posição sai da distância do ponteiro para o centro de cada peça.
 */
function useAreaDeSolta(area: FormatoCampo, itens: Campo[], caixa: React.RefObject<HTMLElement | null>) {
  const arrasto = usarArrasto()
  const dados = useRef({ itens, caixa })
  dados.current = { itens, caixa }

  useEffect(() => {
    if (!arrasto) return
    return arrasto.registrar(area, (x, y) => {
      const el = dados.current.caixa.current
      const r = el?.getBoundingClientRect()
      if (!r || x < r.left || x > r.right || y < r.top || y > r.bottom) return null
      const pecas = dados.current.itens
        .map((c) => ({ c, r: el!.querySelector(`[data-peca="${c.id}"]`)?.getBoundingClientRect() }))
        .filter((p) => p.r) as { c: Campo; r: DOMRect }[]
      // mesma linha visual do ponteiro, quando dá; senão, a lista inteira
      const naLinha = pecas.filter((p) => y >= p.r.top - 4 && y <= p.r.bottom + 4)
      const alvos = naLinha.length ? naLinha : pecas
      const antes = alvos.findIndex((p) => x < p.r.left + p.r.width / 2)
      const escolhido = antes < 0 ? alvos[alvos.length - 1] : alvos[antes]
      const indice = escolhido
        ? dados.current.itens.indexOf(escolhido.c) + (antes < 0 ? 1 : 0)
        : dados.current.itens.length
      return { area, indice, novaLinha: false }
    })
  }, [arrasto, area])
}

/** O corpo do card: linhas de campos, onde dá para juntar peças ou abrir linha nova. */
function CorpoDoCard({ linhas, render }: { linhas: Campo[][]; render: (c: Campo) => ReactNode }) {
  const arrasto = usarArrasto()
  const caixa = useRef<HTMLDivElement>(null)
  const refLinhas = useRef<(HTMLDivElement | null)[]>([])
  const dados = useRef(linhas)
  dados.current = linhas

  useEffect(() => {
    if (!arrasto) return
    return arrasto.registrar("destaque", (x, y) => {
      const el = caixa.current
      const r = el?.getBoundingClientRect()
      if (!el || !r || x < r.left || x > r.right || y < r.top || y > r.bottom) return null
      const ls = dados.current
      const plano = ls.flat()
      const caixas = ls.map((_, i) => refLinhas.current[i]?.getBoundingClientRect()).filter(Boolean) as DOMRect[]
      if (!caixas.length) return { area: "destaque", indice: 0, novaLinha: true }
      let l = caixas.findIndex((rc) => y >= rc.top && y <= rc.bottom)
      if (l < 0) l = y < caixas[0].top ? 0 : caixas.length - 1
      const rc = caixas[l]
      // perto da borda de cima ou de baixo da linha: abre linha nova ali
      const margem = Math.min(12, Math.max(6, rc.height * 0.3))
      if (y < rc.top + margem) return { area: "destaque", indice: plano.indexOf(ls[l][0]), novaLinha: true }
      if (y > rc.bottom - margem) {
        return { area: "destaque", indice: plano.indexOf(ls[l][ls[l].length - 1]) + 1, novaLinha: true }
      }
      const campos = ls[l]
      const antes = campos.findIndex((c) => {
        const b = el.querySelector(`[data-peca="${c.id}"]`)?.getBoundingClientRect()
        return b && x < b.left + b.width / 2
      })
      const alvoCampo = antes < 0 ? campos[campos.length - 1] : campos[antes]
      return { area: "destaque", indice: plano.indexOf(alvoCampo) + (antes < 0 ? 1 : 0), novaLinha: false }
    })
  }, [arrasto])

  const plano = linhas.flat()
  const alvo = arrasto?.alvo?.area === "destaque" ? arrasto.alvo : null
  const barraLinha = (indice: number) =>
    alvo?.novaLinha && alvo.indice === indice ? <BarraDeAlvo /> : null
  const barraNaLinha = (indice: number) =>
    alvo && !alvo.novaLinha && alvo.indice === indice ? <BarraDeAlvo vertical /> : null

  return (
    <div ref={caixa} className="flex flex-col gap-1.5">
      {barraLinha(0)}
      {linhas.map((linha, l) => (
        <Fragment key={linha.map((c) => c.id).join("-")}>
          <div
            ref={(el) => {
              refLinhas.current[l] = el
            }}
            className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-1.5"
          >
            {linha.map((c) => {
              const i = plano.indexOf(c)
              return (
                <Fragment key={c.id}>
                  {barraNaLinha(i)}
                  <PecaArrastavel campo={c} area="destaque" indice={i} className="px-1.5 py-0.5">
                    {render(c)}
                  </PecaArrastavel>
                  {c === linha[linha.length - 1] && barraNaLinha(i + 1)}
                </Fragment>
              )
            })}
          </div>
          {barraLinha(plano.indexOf(linha[linha.length - 1]) + 1)}
        </Fragment>
      ))}
    </div>
  )
}

/** Uma fileira de campos que só troca de ordem: o topo do card e as duas caixas. */
function FileiraDeCampos({
  area,
  campos,
  render,
  className,
  classePeca,
  rotulo,
}: {
  area: FormatoCampo
  campos: Campo[]
  render: (c: Campo) => ReactNode
  className?: string
  /** Classe de cada peça. Função quando uma peça precisa de classe própria (o mr-auto do topo). */
  classePeca?: string | ((c: Campo, i: number) => string | undefined)
  /** Quando existe, a fileira é uma lista de definições (as duas caixas de metadados). */
  rotulo?: string
}) {
  const arrasto = usarArrasto()
  const caixa = useRef<HTMLDivElement>(null)
  useAreaDeSolta(area, campos, caixa)
  const alvo = arrasto?.alvo?.area === area ? arrasto.alvo : null
  const Tag = rotulo ? "dl" : "div"

  return (
    <Tag ref={caixa as never} aria-label={rotulo} className={className}>
      {campos.map((c, i) => (
        <Fragment key={c.id}>
          {alvo?.indice === i && <BarraDeAlvo vertical />}
          <PecaArrastavel
            campo={c}
            area={area}
            indice={i}
            className={typeof classePeca === "function" ? classePeca(c, i) : classePeca}
          >
            {render(c)}
          </PecaArrastavel>
          {i === campos.length - 1 && alvo?.indice === i + 1 && <BarraDeAlvo vertical />}
        </Fragment>
      ))}
    </Tag>
  )
}

/** Agrupa os destaques em linhas: cada campo gruda no anterior quando foi solto ao lado dele. */
function emLinhas(campos: Campo[]) {
  const linhas: Campo[][] = []
  for (const c of campos) {
    if (c.junto && linhas.length) linhas[linhas.length - 1].push(c)
    else linhas.push([c])
  }
  return linhas
}

/** Selo ME - EPP, do lado do órgão. */
function SeloME() {
  return (
    <Badge variant="secondary" className="rounded-md bg-muted px-2 font-medium text-muted-foreground">
      ME - EPP
    </Badge>
  )
}

/** Nota CAPAG: A e B passam, C e D acendem. */
function SeloCapag({ nota }: { nota: string }) {
  const bom = nota === "A" || nota === "B"
  return (
    <Badge
      className={cn(
        "size-5 justify-center rounded-md p-0 text-xs font-semibold",
        bom ? "bg-success/12 text-success-strong" : "bg-warning/15 text-warning-strong"
      )}
    >
      {nota}
    </Badge>
  )
}
