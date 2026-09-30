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
import { type Motivo } from "./dados"
import { useConfig } from "./estado"
import { ListaMotivos } from "./ListaMotivos"

export function PaginaMotivos() {
  const { setMotivos, exigirMotivo, setExigirMotivo, auditar } = useConfig()

  function alternarEscopo(x: Motivo, k: "rec" | "and") {
    if (x[k] && !(k === "rec" ? x.and : x.rec)) {
      toast("O motivo precisa aparecer em pelo menos uma tela")
      return
    }
    setMotivos((l) => l.map((m) => (m.id === x.id ? { ...m, [k]: !m[k] } : m)))
    auditar("Motivos", `Alterou onde "${x.nome}" aparece`)
  }

  return (
    <SettingsPage width="full">
      <Aviso tom="marca" fechavel>
        Aqui você gerencia a lista de motivos que aparece quando alguém descarta uma licitação. Em cada motivo, as
        pílulas dizem em quais telas ele aparece: Recomendadas, Em andamento ou nas duas. O motivo escolhido fica na
        licitação, aparece no filtro de Descartadas e no gráfico "Motivos de descarte" do dashboard, e é por isso que
        um motivo já usado é arquivado, nunca apagado.
      </Aviso>

      <SettingsSection>
        <SettingsBox>
          <SettingsRow>
            <SettingsRowContent>
              <SettingsRowTitle id="t-exigir">Exigir motivo ao descartar</SettingsRowTitle>
              <SettingsRowDescription>
                Ligado, quem descarta precisa escolher um motivo da lista para concluir. Desligado, dá para descartar
                sem escolher nenhum. Esta chave decide se <b className="font-semibold text-foreground">escolher</b> é
                obrigatório. <b className="font-semibold text-foreground">Escrever</b> o porquê é outra coisa: quem
                decide isso é a chave <b className="font-semibold text-foreground">Pede descrição</b>, que fica em cada
                motivo da lista abaixo, porque só alguns motivos precisam de explicação.
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

      <SettingsPageDescription className="mb-2.5">
        Em cada motivo, escolha as telas em que ele aparece e marque{" "}
        <b className="font-semibold text-foreground">Pede descrição</b> quando escolher o motivo não basta e a pessoa
        precisa escrever o porquê num campo de texto, como já acontece em Outros.
      </SettingsPageDescription>

      <ListaMotivos
        tipo="descarte"
        area="Motivos"
        dicaUso="Quantas licitações já foram descartadas com este motivo."
        acao="descartes"
        usoPassado="descartadas com este motivo"
        onde="no filtro de Descartadas e no gráfico “Motivos de descarte” do dashboard"
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
            <SettingsListItemDescription>Sempre disponível e sempre pede descrição.</SettingsListItemDescription>
            <SettingsListLockBadge tooltip="Motivo padrão da plataforma. Não pode ser renomeado, arquivado nem excluído.">
              Não editável
            </SettingsListLockBadge>
          </SettingsListItem>
        }
      />
    </SettingsPage>
  )
}
