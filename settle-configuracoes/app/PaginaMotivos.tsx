// Motivos de descarte. Os motivos de perda ficam em Etapas do funil, junto da etapa de
// saída, porque quem decide Ganhou ou Perdeu é o registro do resultado, não o descarte.

import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import {
  SettingsBox,
  SettingsPage,
  SettingsPageDescription,
  SettingsRow,
  SettingsRowContent,
  SettingsRowDescription,
  SettingsRowTitle,
  SettingsSection,
} from "@/components/ui/settings-page";
import {
  SettingsListItem,
  SettingsListLockBadge,
  SettingsListName,
} from "@/components/ui/settings-list";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Aviso, MetaComDica } from "./comum";
import { fmt, type Motivo } from "./dados";
import { useConfig } from "./estado";
import { COL, ListaMotivos } from "./ListaMotivos";

const NOME_DA_TELA = { rec: "Recomendadas", and: "Em andamento" } as const;

export function PaginaMotivos() {
  const {
    setMotivos,
    exigirMotivo,
    setExigirMotivo,
    outrosExigeDesc,
    setOutrosExigeDesc,
    auditar,
    confirmar,
  } = useConfig();

  function alternarEscopo(x: Motivo, k: "rec" | "and") {
    const tela = NOME_DA_TELA[k];
    const aplicar = () => {
      setMotivos((l) =>
        l.map((m) => (m.id === x.id ? { ...m, [k]: !m[k] } : m)),
      );
      auditar(
        "Motivos",
        x[k]
          ? `Desativou "${x.nome}" em ${tela}`
          : `Ativou "${x.nome}" em ${tela}`,
      );
    };
    // ativar não muda nada do que já aconteceu e segue direto
    if (!x[k]) {
      aplicar();
      toast(`${x.nome} passou a aparecer em ${tela}`);
      return;
    }
    // desativar sempre confirma, mesmo sem licitação: a mesma ação não pode às vezes perguntar
    // e às vezes não, senão a pessoa não entende a regra
    const naTela = k === "rec" ? x.usoRec : x.usoAnd;
    const outra = NOME_DA_TELA[k === "rec" ? "and" : "rec"];
    confirmar({
      titulo: `Desativar "${x.nome}" em ${tela}?`,
      corpo: (
        <>
          <p>
            Ele deixa de aparecer na lista de quem descarta em {tela}. Em{" "}
            {outra} nada muda.
          </p>
          {naTela > 0 ? (
            <p>
              As {fmt(naTela)} licitações descartadas por este motivo em {tela}{" "}
              seguem iguais: continuam com o motivo registrado, no filtro de
              Descartadas e no gráfico “Motivos de descarte”, em Dashboards. Dá
              para ativar de novo quando quiser.
            </p>
          ) : (
            <p>
              Nenhuma licitação foi descartada por este motivo em {tela}, então
              não há histórico a preservar. Dá para ativar de novo quando
              quiser.
            </p>
          )}
        </>
      ),
      // só "Desativar": o botão já está debaixo do título, que diz em qual tela
      acao: "Desativar",
      ok: () => {
        aplicar();
        toast(`${x.nome} deixou de aparecer em ${tela}`);
      },
    });
  }

  return (
    <SettingsPage width="full">
      <Aviso tom="marca" fechavel>
        Aqui você gerencia a lista de motivos que aparece quando alguém descarta
        uma licitação. Em cada motivo, as chaves dizem em quais telas ele
        aparece: Recomendadas, Em andamento ou nas duas. O motivo escolhido fica
        na licitação, aparece no filtro de Descartadas e no gráfico "Motivos de
        descarte", em Dashboards, e é por isso que um motivo já usado é
        arquivado, nunca apagado.
      </Aviso>

      <SettingsSection>
        <SettingsBox>
          <SettingsRow>
            <SettingsRowContent>
              <SettingsRowTitle id="t-exigir">
                Exigir motivo ao descartar
              </SettingsRowTitle>
              {/*
                A descrição do interruptor explica só o interruptor. A diferença entre esta chave
                (escolher) e a "Descrição obrigatória" (escrever) fica na linha que apresenta a
                lista, logo abaixo, onde ela é útil. E o texto é o mesmo do interruptor de perda,
                em Etapas do funil: é a mesma ideia em duas telas.
              */}
              <SettingsRowDescription>
                Quando você ativa essa opção, quem descarta precisa escolher um
                motivo para concluir. Se deixar desativado, o motivo vira
                opcional e o gráfico "Motivos de descarte", em Dashboards, passa
                a mostrar "Sem motivo".
              </SettingsRowDescription>
            </SettingsRowContent>
            <Switch
              aria-labelledby="t-exigir"
              checked={exigirMotivo}
              onCheckedChange={(v) => {
                setExigirMotivo(v);
                auditar(
                  "Motivos",
                  `${v ? "Passou a exigir" : "Deixou de exigir"} motivo ao descartar`,
                );
                toast("Salvo");
              }}
            />
          </SettingsRow>
        </SettingsBox>
      </SettingsSection>

      {/* o detalhe de que o campo existe em todos e é opcional fica no tooltip da própria pílula */}
      <SettingsPageDescription className="mb-2.5">
        Em cada motivo, selecione as telas em que ele aparece. Ative a opção{" "}
        <b className="font-semibold text-foreground">Descrição obrigatória</b>{" "}
        nos casos em que a escolha não é suficiente e a pessoa precisa explicar
        o porquê, como em “Outros”.
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
                São {fmt(x.usoRec)} em Recomendadas e {fmt(x.usoAnd)} em Em
                andamento.
              </>
            )}
          </>
        )}
        acao="descartes"
        usoPassado="descartadas por este motivo"
        onde="no filtro de Descartadas e no gráfico “Motivos de descarte”, em Dashboards"
        reservados={["Outros"]}
        cabecalho={
          <div className="flex items-center gap-2.5 sticky top-16 z-5 rounded-t-lg border-b bg-muted py-2 pr-2.5 pl-3 text-[12px] font-semibold text-muted-foreground">
            <span aria-hidden className="w-4 flex-none" />
            <span className="min-w-0 flex-1">Motivo</span>
            <span className={cn("flex-none", COL.tela)}>Recomendadas</span>
            <span className={cn("flex-none", COL.tela)}>Em andamento</span>
            <span className={cn("flex-none", COL.desc)}>
              Descrição obrigatória
            </span>
            <span className={cn("flex-none text-right", COL.uso)}>
              Licitações
            </span>
            <span aria-hidden className={cn("flex-none", COL.acao)} />
          </div>
        }
        extras={(x) => (
          // uma chave por tela, cada uma na sua coluna: o rótulo está no cabeçalho
          <>
            <span className={cn("flex flex-none", COL.tela)}>
              <Switch
                checked={x.rec}
                aria-label={`Mostrar "${x.nome}" em Recomendadas`}
                onCheckedChange={() => alternarEscopo(x, "rec")}
                data-settings-list-no-drag
              />
            </span>
            <span className={cn("flex flex-none", COL.tela)}>
              <Switch
                checked={x.and}
                aria-label={`Mostrar "${x.nome}" em Em andamento`}
                onCheckedChange={() => alternarEscopo(x, "and")}
                data-settings-list-no-drag
              />
            </span>
          </>
        )}
        fixo={
          /*
            "Outros" deixou de ser imutável (Willian, #product-tech, 01/10). Em produção o
            comentário é opcional em todos os motivos, inclusive neste, então obrigar sempre era
            uma regra que só existia no desenho. Agora a chave de descrição é da organização. As
            duas travas que ficam: o nome não muda e ele não sai da lista, porque é a saída de
            quem não achou motivo e sem ela a pessoa ficaria presa.
          */
          <SettingsListItem id="outros" group="fixa" movable={false}>
            <span className="flex min-w-0 flex-1 items-center gap-2">
              <SettingsListName className="flex-none">Outros</SettingsListName>
              <SettingsListLockBadge tooltip="Motivo padrão da plataforma: aparece em todas as telas e não pode ser renomeado nem arquivado. A descrição obrigatória você escolhe.">
                Motivo padrão
              </SettingsListLockBadge>
            </span>
            {/* um tooltip por switch, ancorado no próprio controle: o switch desabilitado não
                recebe o mouse, então o gatilho é um span do tamanho dele */}
            {(["Recomendadas", "Em andamento"] as const).map((tela) => (
              <span key={tela} className={cn("flex flex-none", COL.tela)}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex">
                      <Switch
                        checked
                        disabled
                        aria-label={`Outros aparece em ${tela}`}
                      />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    “Outros” aparece nas duas telas, sempre: é a saída de quem
                    não encontrou motivo na lista.
                  </TooltipContent>
                </Tooltip>
              </span>
            ))}
            <span className={cn("flex flex-none", COL.desc)}>
              <Tooltip>
                <TooltipTrigger asChild>
                  {/* span do tamanho do switch: com asChild o Tooltip sobrescreveria o
                      data-state do Switch e ele perderia o estilo de ligado e desligado */}
                  <span className="flex">
                    <Switch
                      checked={outrosExigeDesc}
                      aria-label="Descrição obrigatória em Outros"
                      onCheckedChange={(v) => {
                        setOutrosExigeDesc(v);
                        auditar(
                          "Motivos",
                          `${v ? "Passou a exigir" : "Deixou de exigir"} descrição em "Outros"`,
                        );
                        toast(
                          v
                            ? "Quem escolher “Outros” precisa escrever o porquê"
                            : "Descrição voltou a ser opcional em “Outros”",
                        );
                      }}
                    />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Era fixo e virou escolha sua. Ativado, quem escolher “Outros”
                  não conclui sem escrever o porquê.
                </TooltipContent>
              </Tooltip>
            </span>
            <MetaComDica
              dica="Quantas licitações já foram descartadas por este motivo. São 806 em Recomendadas e 398 em Em andamento."
              className={cn(COL.uso, "justify-end")}
            >
              1.204 licitações
            </MetaComDica>
            <span aria-hidden className={cn("flex-none", COL.acao)} />
          </SettingsListItem>
        }
      />
    </SettingsPage>
  );
}
