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
  const { setMotivos, unificar, setUnificar, exigirMotivo, setExigirMotivo, auditar } = useConfig()

  function alternarEscopo(x: Motivo, k: "rec" | "and") {
    if (x[k] && !(k === "rec" ? x.and : x.rec)) {
      toast("O motivo precisa aparecer em pelo menos uma tela")
      return
    }
    setMotivos((l) => l.map((m) => (m.id === x.id ? { ...m, [k]: !m[k] } : m)))
    auditar("Motivos", `Alterou onde "${x.nome}" aparece`)
  }

  return (
    <SettingsPage className="max-w-245">
      <Aviso tom="marca" fechavel>
        Aqui você gerencia a lista de motivos que aparece para a pessoa quando ela descarta uma licitação em
        Recomendadas ou Em andamento. O motivo escolhido fica na licitação: aparece no filtro de Descartadas e no
        gráfico "Motivos de descarte" do dashboard. Por isso um motivo já usado é arquivado, nunca apagado.
      </Aviso>

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

      <SettingsPageDescription className="mb-2.5">
        Marque <b className="font-semibold text-foreground">Pede descrição</b> nos motivos em que a pessoa precisa
        explicar o porquê, como já acontece em Outros.
      </SettingsPageDescription>

      <ListaMotivos
        tipo="descarte"
        area="Motivos"
        usos="descartes"
        dicaUso="Quantas licitações já foram descartadas com este motivo."
        acao="descartes"
        usoPassado="descartadas com este motivo"
        onde="no filtro de Descartadas e no gráfico “Motivos de descarte” do dashboard"
        extras={(x) =>
          !unificar && (
            <div role="group" aria-label={`Onde "${x.nome}" aparece`} className="flex flex-none gap-1">
              <Pilula pressed={x.rec} onPressedChange={() => alternarEscopo(x, "rec")}>
                Recomendadas
              </Pilula>
              <Pilula pressed={x.and} onPressedChange={() => alternarEscopo(x, "and")}>
                Em andamento
              </Pilula>
            </div>
          )
        }
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
