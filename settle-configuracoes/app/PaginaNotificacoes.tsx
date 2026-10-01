// Notificações: de que a pessoa quer ser avisada e por onde. É a única seção de Configurações
// que é do usuário, não da organização, e a tela diz isso logo no começo.
//
// O que existe hoje está em settle-salvos-e-notificacoes: o sino por licitação, a central
// (sino da navbar) e "Continuar recebendo atualizações" no descarte. Lá a escolha é licitação
// por licitação, feita por quem usa; aqui é o padrão da organização, que vale para todas as
// licitações e todas as pessoas. Regras em ../REGRAS.md.

import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  SettingsBox,
  SettingsPage,
  SettingsPageDescription,
  SettingsSection,
  SettingsSectionDescription,
  SettingsSectionTitle,
} from "@/components/ui/settings-page"

import { Aviso, MetaComDica } from "./comum"
import {
  AO_DESCARTAR,
  CANAIS_NOTIF,
  EVENTOS_NOTIF,
  FREQ_EMAIL,
  GRUPOS_EVENTO,
  PADRAO_NOVAS,
  type CanalNotif,
  type EventoNotif,
  type GrupoEvento,
} from "./dados"
import { useConfig } from "./estado"

export function PaginaNotificacoes() {
  const {
    notif,
    setNotif,
    padraoNovas,
    setPadraoNovas,
    aoDescartar,
    setAoDescartar,
    freqEmail,
    setFreqEmail,
    auditar,
  } = useConfig()

  /** Quantos eventos ainda chegam por aquele canal: é o que diz se o canal está vivo. */
  const ligadosEm = (canal: CanalNotif) => EVENTOS_NOTIF.filter((e) => notif[e.id]?.[canal]).length
  const temEmail = ligadosEm("email") > 0

  function alternar(evento: EventoNotif, canal: CanalNotif) {
    const antes = notif[evento.id][canal]
    setNotif((m) => ({ ...m, [evento.id]: { ...m[evento.id], [canal]: !antes } }))
    const nomeCanal = CANAIS_NOTIF.find(([c]) => c === canal)?.[1]
    auditar("Notificações", `${antes ? "Desligou" : "Ligou"} "${evento.nome}" em ${nomeCanal}`)
  }

  /** Linha de evento. O nome é cabeçalho da linha, para o leitor de tela ler junto da coluna. */
  const linha = (e: EventoNotif) => (
    <TableRow key={e.id}>
      <TableHead scope="row" className="font-normal text-foreground">
        <MetaComDica dica={e.dica} className="text-sm text-foreground">
          {e.nome}
        </MetaComDica>
      </TableHead>
      {CANAIS_NOTIF.map(([canal, nome]) => (
        <TableCell key={canal} className="w-44">
          <Tooltip>
            <TooltipTrigger asChild>
              {/* span do tamanho do switch: o tooltip precisa apontar para o controle, e com
                  asChild o Tooltip sobrescreveria o data-state do Switch */}
              <span className="flex w-fit">
                <Switch
                  checked={notif[e.id][canal]}
                  aria-label={`${e.nome} em ${nome}`}
                  onCheckedChange={() => alternar(e, canal)}
                />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {notif[e.id][canal] ? `${e.nome} chega em ${nome}.` : `${e.nome} não chega em ${nome}.`}
            </TooltipContent>
          </Tooltip>
        </TableCell>
      ))}
    </TableRow>
  )

  const grupo = (g: GrupoEvento) => (
    <>
      <TableRow key={g} className="hover:bg-transparent">
        <TableHead
          scope="colgroup"
          colSpan={CANAIS_NOTIF.length + 1}
          className="h-9 bg-muted/40 text-[12px] font-semibold text-muted-foreground"
        >
          {GRUPOS_EVENTO[g]}
        </TableHead>
      </TableRow>
      {EVENTOS_NOTIF.filter((e) => e.grupo === g).map(linha)}
    </>
  )

  return (
    <SettingsPage width="full">
      <Aviso tom="marca" fechavel>
        Aqui você define de que a Settle avisa e por onde. Como nas outras seções, vale para todas
        as pessoas da organização. O sino de cada licitação continua existindo: ele é a exceção que
        quem usa liga ou desliga num caso específico, por cima do que estiver definido aqui.
      </Aviso>

      <SettingsSection>
        <SettingsSectionTitle>De que a Settle avisa</SettingsSectionTitle>
        <SettingsSectionDescription>
          Cada linha é um tipo de atualização e cada coluna é um lugar onde ela pode chegar. Vale
          para as licitações que notificam, e quais são elas é a seção seguinte. Os tipos são os que
          a Settle acompanha no portal: não dá para criar um novo.
        </SettingsSectionDescription>
        {/* overflow-visible: com o overflow-hidden da caixa o cabeçalho sticky não gruda */}
        <SettingsBox className="overflow-visible">
          {/* overflow-visible também no contêiner da tabela: com o overflow-x-auto padrão ele
              vira o contêiner de rolagem do cabeçalho sticky, que então gruda nele e não na
              página. Cabe sem rolar na horizontal: são quatro colunas */}
          <Table containerClassName="overflow-visible">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="sticky top-16 z-5 rounded-tl-lg bg-muted">Atualização</TableHead>
                {CANAIS_NOTIF.map(([canal, nome, dica], i) => (
                  <TableHead
                    key={canal}
                    className={cn("sticky top-16 z-5 w-44 bg-muted", i === CANAIS_NOTIF.length - 1 && "rounded-tr-lg")}
                  >
                    <MetaComDica dica={dica} className="text-[12px] font-semibold">
                      {nome}
                    </MetaComDica>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {grupo("edital")}
              {grupo("manifestacoes")}
            </TableBody>
          </Table>
        </SettingsBox>
        {/* a linha inteira desligada é uma escolha válida, mas vale dizer o que ela significa */}
        {EVENTOS_NOTIF.some((e) => CANAIS_NOTIF.every(([c]) => !notif[e.id][c])) && (
          <SettingsPageDescription className="mt-2.5">
            Um tipo com as três colunas desligadas não avisa em lugar nenhum. A atualização continua
            acontecendo na licitação, e ninguém do time fica sabendo.
          </SettingsPageDescription>
        )}
      </SettingsSection>

      <SettingsSection className="mt-7">
        <SettingsSectionTitle>Quais licitações notificam</SettingsSectionTitle>
        <SettingsSectionDescription>
          Hoje a Settle só avisa das licitações em que alguém liga o sino, uma a uma. Aqui você
          escolhe se isso continua assim ou se algumas passam a notificar sozinhas, para todo mundo
          que acompanha a licitação.
        </SettingsSectionDescription>
        <Escolhas
          nome="Quais licitações notificam"
          opcoes={PADRAO_NOVAS}
          valor={padraoNovas}
          onChange={(v) => {
            setPadraoNovas(v)
            auditar("Notificações", `Licitações novas: ${PADRAO_NOVAS.find(([k]) => k === v)?.[1]}`)
            toast("Vale para as próximas licitações da organização. As de agora continuam como estão")
          }}
        />
      </SettingsSection>

      <SettingsSection className="mt-7">
        <SettingsSectionTitle>Ao descartar uma licitação</SettingsSectionTitle>
        <SettingsSectionDescription>
          Descartar não apaga a licitação: ela vai para Descartadas e o edital continua mudando lá.
          Uma retificação pode desfazer o motivo do descarte, e é por isso que faz sentido continuar
          sabendo.
        </SettingsSectionDescription>
        <Escolhas
          nome="Ao descartar uma licitação"
          opcoes={AO_DESCARTAR}
          valor={aoDescartar}
          onChange={(v) => {
            setAoDescartar(v)
            auditar("Notificações", `Ao descartar: ${AO_DESCARTAR.find(([k]) => k === v)?.[1]}`)
            toast("Salvo")
          }}
        />
      </SettingsSection>

      <SettingsSection className="mt-7">
        <SettingsSectionTitle>
          E-mail
          {!temEmail && (
            <Badge variant="secondary" className="ml-2 rounded-full font-medium text-muted-foreground">
              Desligado
            </Badge>
          )}
        </SettingsSectionTitle>
        <SettingsSectionDescription>
          {temEmail ? (
            <>
              Vale para os {ligadosEm("email")} tipos com a coluna E-mail ligada na tabela acima. Cada
              pessoa recebe no endereço da própria conta, sobre as licitações que acompanha.
            </>
          ) : (
            <>
              Nenhum tipo está com a coluna E-mail ligada na tabela acima, então nada é enviado.
              Ligue ao menos um para escolher a frequência.
            </>
          )}
        </SettingsSectionDescription>
        <Escolhas
          nome="Frequência do e-mail"
          opcoes={FREQ_EMAIL}
          valor={freqEmail}
          desabilitado={!temEmail}
          onChange={(v) => {
            setFreqEmail(v)
            auditar("Notificações", `E-mail: ${FREQ_EMAIL.find(([k]) => k === v)?.[1]}`)
            toast(v === "diario" ? "Vai junto do e-mail das 7h" : "Cada atualização vira um e-mail")
          }}
        />
        {temEmail && freqEmail === "diario" && (
          <SettingsPageDescription className="mt-2.5">
            O resumo entra no e-mail que a Settle já manda às 7h com as licitações encontradas, em um
            bloco próprio. É um e-mail por dia, não dois.
          </SettingsPageDescription>
        )}
      </SettingsSection>
    </SettingsPage>
  )
}

/** Lista de escolhas excludentes, cada uma com o que ela significa embaixo do nome. */
function Escolhas<T extends string>({
  nome,
  opcoes,
  valor,
  onChange,
  desabilitado,
}: {
  nome: string
  opcoes: [T, string, string][]
  valor: T
  onChange: (v: T) => void
  desabilitado?: boolean
}) {
  return (
    <SettingsBox className={cn(desabilitado && "opacity-55")}>
      <RadioGroup
        aria-label={nome}
        value={valor}
        disabled={desabilitado}
        onValueChange={(v) => onChange(v as T)}
        className="gap-0"
      >
        {opcoes.map(([k, titulo, desc]) => (
          <label
            key={k}
            className={cn(
              "flex items-start gap-3 border-t px-3.5 py-3 first:border-t-0",
              desabilitado ? "cursor-default" : "cursor-pointer hover:bg-muted/40"
            )}
          >
            <RadioGroupItem value={k} className="mt-0.5" />
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-semibold">{titulo}</span>
              <span className="text-[13px] leading-[19px] text-muted-foreground">{desc}</span>
            </span>
          </label>
        ))}
      </RadioGroup>
    </SettingsBox>
  )
}
