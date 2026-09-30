// Motivos de descarte. Os motivos de perda ficam em Etapas do funil, junto da etapa de
// saída, porque quem decide Ganhou ou Perdeu é o registro do resultado, não o descarte.

import { toast } from "sonner"

import { Switch } from "@/components/ui/switch"
import {
  SettingsBox,
  SettingsPage,
  SettingsPageDescription,
  SettingsRow,
  SettingsRowContent,
  SettingsRowDescription,
  SettingsRowTitle,
  SettingsSection,
} from "@/components/ui/settings-page"
import {
  SettingsListItem,
  SettingsListItemDescription,
  SettingsListLockBadge,
  SettingsListName,
} from "@/components/ui/settings-list"

import { Aviso, Pilula } from "./comum"
import { fmt, type Motivo } from "./dados"
import { useConfig } from "./estado"
import { ListaMotivos } from "./ListaMotivos"

const NOME_DA_TELA = { rec: "Recomendadas", and: "Em andamento" } as const

export function PaginaMotivos() {
  const { setMotivos, exigirMotivo, setExigirMotivo, auditar, confirmar } = useConfig()

  function alternarEscopo(x: Motivo, k: "rec" | "and") {
    if (x[k] && !(k === "rec" ? x.and : x.rec)) {
      toast("O motivo precisa aparecer em pelo menos uma tela")
      return
    }
    const tela = NOME_DA_TELA[k]
    const aplicar = () => {
      setMotivos((l) => l.map((m) => (m.id === x.id ? { ...m, [k]: !m[k] } : m)))
      auditar("Motivos", x[k] ? `Desativou "${x.nome}" em ${tela}` : `Ativou "${x.nome}" em ${tela}`)
    }
    // ativar não muda nada do que já aconteceu e segue direto
    if (!x[k]) {
      aplicar()
      toast(`${x.nome} passou a aparecer em ${tela}`)
      return
    }
    // desativar sempre confirma, mesmo sem licitação: a mesma ação não pode às vezes perguntar
    // e às vezes não, senão a pessoa não entende a regra
    const naTela = k === "rec" ? x.usoRec : x.usoAnd
    const outra = NOME_DA_TELA[k === "rec" ? "and" : "rec"]
    confirmar({
      titulo: `Desativar "${x.nome}" em ${tela}?`,
      corpo: (
        <>
          <p>
            Ele deixa de aparecer na lista de quem descarta em {tela}. Em {outra} nada muda.
          </p>
          {naTela > 0 ? (
            <p>
              As {fmt(naTela)} licitações descartadas por este motivo em {tela} seguem iguais: continuam com o motivo
              registrado, no filtro de Descartadas e no gráfico “Motivos de descarte”, em Dashboards. Dá para ativar de
              novo quando quiser.
            </p>
          ) : (
            <p>
              Nenhuma licitação foi descartada por este motivo em {tela}, então não há histórico a preservar. Dá para
              ativar de novo quando quiser.
            </p>
          )}
        </>
      ),
      // só "Desativar": o botão já está debaixo do título, que diz em qual tela
      acao: "Desativar",
      ok: () => {
        aplicar()
        toast(`${x.nome} deixou de aparecer em ${tela}`)
      },
    })
  }

  return (
    <SettingsPage width="full">
      <Aviso tom="marca" fechavel>
        Aqui você gerencia a lista de motivos que aparece quando alguém descarta uma licitação. Em cada motivo, as
        pílulas dizem em quais telas ele aparece: Recomendadas, Em andamento ou nas duas. O motivo escolhido fica na
        licitação, aparece no filtro de Descartadas e no gráfico "Motivos de descarte", em Dashboards, e é por isso que
        um motivo já usado é arquivado, nunca apagado.
      </Aviso>

      <SettingsSection>
        <SettingsBox>
          <SettingsRow>
            <SettingsRowContent>
              <SettingsRowTitle id="t-exigir">Exigir motivo ao descartar</SettingsRowTitle>
              {/*
                A descrição do interruptor explica só o interruptor. A diferença entre esta chave
                (escolher) e a "Descrição obrigatória" (escrever) fica na linha que apresenta a
                lista, logo abaixo, onde ela é útil. E o texto é o mesmo do interruptor de perda,
                em Etapas do funil: é a mesma ideia em duas telas.
              */}
              <SettingsRowDescription>
                Quando você ativa essa opção, quem descarta precisa escolher um motivo para concluir. Se deixar
                desativado, o motivo vira opcional e o gráfico "Motivos de descarte", em Dashboards, passa a mostrar
                "Sem motivo".
              </SettingsRowDescription>
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
        </SettingsBox>
      </SettingsSection>

      {/* o detalhe de que o campo existe em todos e é opcional fica no tooltip da própria pílula */}
      <SettingsPageDescription className="mb-2.5">
        Em cada motivo, selecione as telas em que ele aparece. Marque a opção{" "}
        <b className="font-semibold text-foreground">Descrição obrigatória</b> nos casos em que a escolha não é
        suficiente e a pessoa precisa explicar o porquê, como em “Outros”.
      </SettingsPageDescription>

      <ListaMotivos
        tipo="descarte"
        area="Motivos"
        dicaUso={(x) => (
          <>
            Quantas licitações já foram descartadas por este motivo.
            {x.usoRec > 0 && x.usoAnd > 0 && (
              <>
                {" "}
                São {fmt(x.usoRec)} em Recomendadas e {fmt(x.usoAnd)} em Em andamento.
              </>
            )}
          </>
        )}
        acao="descartes"
        usoPassado="descartadas por este motivo"
        onde="no filtro de Descartadas e no gráfico “Motivos de descarte”, em Dashboards"
        reservados={["Outros"]}
        extras={(x) => (
          // sem chave de "mesma lista": cada motivo sempre diz em quais telas aparece
          <div role="group" aria-label={`Onde "${x.nome}" aparece`} className="flex flex-none gap-1">
            <Pilula pressed={x.rec} onPressedChange={() => alternarEscopo(x, "rec")}>
              Recomendadas
            </Pilula>
            <Pilula pressed={x.and} onPressedChange={() => alternarEscopo(x, "and")}>
              Em andamento
            </Pilula>
          </div>
        )}
        fixo={
          <SettingsListItem id="outros" group="fixa" locked>
            <SettingsListName className="flex-none">Outros</SettingsListName>
            <SettingsListItemDescription>
              Sempre disponível e com descrição obrigatória.
            </SettingsListItemDescription>
            <SettingsListLockBadge tooltip="Motivo padrão da plataforma. Não pode ser renomeado, arquivado nem excluído.">
              Não editável
            </SettingsListLockBadge>
          </SettingsListItem>
        }
      />
    </SettingsPage>
  )
}
