// Abas das listas (Recomendadas e Descartadas, as telas que já têm abas). A aba é da
// organização: o administrador cria, define os filtros padrão e ela aparece igual para todos.

import { useState } from "react"
import { toast } from "sonner"
import { CopyIcon, PlusIcon, Trash2Icon, TriangleAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SettingsBox, SettingsPage, SettingsPageDescription, SettingsPreviewHeader, SettingsSection } from "@/components/ui/settings-page"
import {
  SettingsList,
  SettingsListAdd,
  SettingsListItem,
  SettingsListItemActions,
  SettingsListItemDescription,
  SettingsListLockBadge,
  SettingsListName,
  SettingsListNameInput,
} from "@/components/ui/settings-list"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { AbasComMais } from "./AbasComMais"
import { Aviso, avisarComDesfazer, BotaoIcone, SeloDeFiltro } from "./comum"
import { defFiltro, mover, novoId, resumoFiltro, TELAS, type Aba, type TelaAba } from "./dados"
import { useConfig } from "./estado"
import { FiltrosDaAba } from "./FiltrosDaAba"
import { useFocoNoNome } from "./PaginaEtapas"

const CONTADOR = "rounded-md bg-foreground/10 px-1.5 text-xs leading-4 font-medium text-foreground tabular-nums"

export function PaginaAbas() {
  const { abas, setAbas, abaTela: tela, setAbaTela, abaPrev, setAbaPrev, auditar, desauditar, confirmar } = useConfig()
  const focar = useFocoNoNome()
  const [editando, setEditando] = useState<string | null>(null)

  const L = abas[tela]
  const prev = L.find((a) => a.id === abaPrev[tela]) ?? L[0]
  const nomeTela = TELAS[tela]
  const setLista = (f: (l: Aba[]) => Aba[]) => setAbas((t) => ({ ...t, [tela]: f(t[tela]) }))
  const nomeLivre = (nome: string, fora?: Aba) => !L.some((a) => a !== fora && a.nome.toLowerCase() === nome.toLowerCase())
  const preVisualizar = (id: string) => setAbaPrev((p) => ({ ...p, [tela]: id }))

  function renomear(a: Aba, v: string) {
    if (!nomeLivre(v, a)) {
      toast("Já existe uma aba com esse nome nesta tela")
      return false
    }
    auditar("Abas das listas", `${nomeTela}: renomeou "${a.nome}" para "${v}"`)
    setLista((l) => l.map((x) => (x.id === a.id ? { ...x, nome: v } : x)))
    toast("Nome da aba salvo")
  }

  function tirarFiltro(a: Aba, k: string) {
    setLista((l) => l.map((x) => (x.id === a.id ? { ...x, f: x.f.filter((y) => y.k !== k) } : x)))
    auditar("Abas das listas", `${nomeTela}: tirou o filtro ${defFiltro(k).n} de "${a.nome}"`)
  }

  function duplicar(a: Aba) {
    let nome = `${a.nome} (cópia)`
    let n = 2
    while (!nomeLivre(nome)) nome = `${a.nome} (cópia ${n++})`
    const c: Aba = { id: novoId("x"), nome, f: structuredClone(a.f) }
    setLista((l) => {
      const i = l.findIndex((x) => x.id === a.id)
      return [...l.slice(0, i + 1), c, ...l.slice(i + 1)]
    })
    preVisualizar(c.id)
    auditar("Abas das listas", `${nomeTela}: duplicou "${a.nome}"`)
    focar(c.id)
  }

  function excluir(a: Aba) {
    confirmar({
      titulo: `Excluir a aba "${a.nome}"?`,
      corpo: (
        <p>
          Ela some de {nomeTela} para todas as pessoas da organização. Nenhuma licitação muda: todas continuam em Todas e
          nas outras abas em que se encaixam.
        </p>
      ),
      acao: "Excluir aba",
      perigo: true,
      ok: () => {
        const i = L.indexOf(a)
        setLista((l) => l.filter((x) => x.id !== a.id))
        auditar("Abas das listas", `${nomeTela}: excluiu "${a.nome}"`)
        avisarComDesfazer("Aba excluída", () => {
          setLista((l) => [...l.slice(0, i), a, ...l.slice(i)])
          desauditar()
        })
      },
    })
  }

  function nova() {
    let nome = "Nova aba"
    let n = 2
    while (!nomeLivre(nome)) nome = `Nova aba ${n++}`
    const a: Aba = { id: novoId("x"), nome, f: [] }
    setLista((l) => [...l, a])
    preVisualizar(a.id)
    auditar("Abas das listas", `${nomeTela}: criou "${nome}"`)
    toast("Aba criada no fim da lista. Arraste para mudar a posição.")
    focar(a.id)
  }

  const selos = (a: Aba, editavel: boolean) =>
    a.f.map((x) => (
      <SeloDeFiltro
        key={x.k}
        rotulo={defFiltro(x.k).n}
        valor={resumoFiltro(x)}
        onAbrir={editavel ? () => setEditando(a.id) : undefined}
        onRemover={editavel ? () => tirarFiltro(a, x.k) : undefined}
      />
    ))

  const abaEditada = L.find((a) => a.id === editando)

  return (
    <SettingsPage className="max-w-245">
      <SettingsPageDescription>
        As abas que aparecem no topo das listas de licitações. Cada aba é um conjunto de filtros salvo pela
        organização: o administrador cria, define os filtros padrão e ela aparece igual para todas as pessoas.
      </SettingsPageDescription>

      <Tabs value={tela} onValueChange={(v) => setAbaTela(v as TelaAba)} className="mb-3.5">
        <TabsList aria-label="Tela" className="max-w-full justify-start overflow-x-auto">
          {(Object.keys(TELAS) as TelaAba[]).map((k) => (
            <TabsTrigger key={k} value={k} className="px-3">
              {TELAS[k]} <span className={CONTADOR}>{abas[k].length}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Aviso>
        Na tela, qualquer pessoa pode usar <b>Filtrar</b> para adicionar filtros extras ou mudar os da aba, como já
        acontece hoje. Isso vale só para ela: não altera o padrão definido aqui nem o que as outras pessoas veem.
      </Aviso>

      <SettingsBox>
        <SettingsList
          labels={{ moveHandle: (n) => `Mover a aba ${n ?? ""}. Use as setas para cima e para baixo.` }}
          onMove={(de, para) => {
            setLista((l) => mover(l, de, para))
            auditar("Abas das listas", `${nomeTela}: reordenou as abas`)
            toast("Ordem das abas salva")
          }}
        >
          {L.map((a) =>
            a.fixa ? (
              <SettingsListItem key={a.id} id={a.id} group="fixa" locked>
                <SettingsListName className="w-45 flex-none">{a.nome}</SettingsListName>
                <SettingsListItemDescription>Mostra todas as licitações, sem filtro. Sempre a primeira aba.</SettingsListItemDescription>
                <SettingsListLockBadge tooltip="Aba padrão da plataforma: mostra todas as licitações. Não pode ser renomeada, filtrada, movida nem excluída.">
                  Não editável
                </SettingsListLockBadge>
              </SettingsListItem>
            ) : (
              <SettingsListItem key={a.id} id={a.id} group="abas" name={a.nome}>
                <SettingsListNameInput
                  value={a.nome}
                  aria-label="Nome da aba"
                  data-nome-id={a.id}
                  className="w-45 flex-none"
                  onValueCommit={(v) => renomear(a, v)}
                />
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                  {a.f.length ? (
                    selos(a, true)
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-warning-strong">
                      <TriangleAlertIcon aria-hidden className="size-3.5" />
                      Sem filtro: mostra o mesmo que Todas
                    </span>
                  )}
                </div>
                <SettingsListItemActions>
                  <Button variant="outline" size="sm" className="h-7 px-2.5 text-[13px]" onClick={() => setEditando(a.id)}>
                    <PlusIcon data-icon="inline-start" />
                    Adicionar filtro
                  </Button>
                  <BotaoIcone rotulo={`Duplicar ${a.nome}`} dica="Duplicar" onClick={() => duplicar(a)}>
                    <CopyIcon />
                  </BotaoIcone>
                  <BotaoIcone rotulo={`Excluir ${a.nome}`} dica="Excluir" perigo onClick={() => excluir(a)}>
                    <Trash2Icon />
                  </BotaoIcone>
                </SettingsListItemActions>
              </SettingsListItem>
            )
          )}
          <SettingsListAdd onClick={nova}>Nova aba</SettingsListAdd>
        </SettingsList>
      </SettingsBox>

      <SettingsSection className="mt-6">
        <SettingsPreviewHeader label={`Como as pessoas veem em ${nomeTela}`} />
        <SettingsBox className="px-4 py-3.5">
          <AbasComMais itens={L} ativo={prev.id} onSelecionar={preVisualizar} rotulo="Pré-visualização das abas" />
          {!prev.fixa && prev.f.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{selos(prev, false)}</div>}
        </SettingsBox>
      </SettingsSection>

      {abaEditada && (
        <FiltrosDaAba
          key={abaEditada.id}
          aba={abaEditada}
          tela={tela}
          onFechar={() => setEditando(null)}
          onSalvar={(f) => {
            setLista((l) => l.map((x) => (x.id === abaEditada.id ? { ...x, f } : x)))
            auditar("Abas das listas", `${nomeTela}: salvou os filtros de "${abaEditada.nome}"`)
            setEditando(null)
            toast(f.length ? `Filtros salvos na aba ${abaEditada.nome}` : `A aba ${abaEditada.nome} ficou sem filtro`)
          }}
        />
      )}
    </SettingsPage>
  )
}
