// Visão geral das configurações e a tela de "sem permissão".

import type { ReactNode } from "react"
import { ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Kbd } from "@/components/ui/kbd"
import {
  SettingsBox,
  SettingsPage,
  SettingsPageDescription,
  SettingsRow,
  SettingsRowContent,
  SettingsRowDescription,
  SettingsRowTitle,
  SettingsRowValue,
  SettingsSection,
  SettingsSectionDescription,
  SettingsSectionTitle,
} from "@/components/ui/settings-page"

import { ADMINS, PAPEIS, type TipoMotivo } from "./dados"
import { useConfig } from "./estado"

function Linha({ href, titulo, descricao, valor }: { href: string; titulo: string; descricao: string; valor: string }) {
  return (
    <SettingsRow asChild>
      <a href={href}>
        <SettingsRowContent>
          <SettingsRowTitle>{titulo}</SettingsRowTitle>
          <SettingsRowDescription>{descricao}</SettingsRowDescription>
        </SettingsRowContent>
        <SettingsRowValue>{valor}</SettingsRowValue>
        <ChevronRightIcon aria-hidden />
      </a>
    </SettingsRow>
  )
}

function Atalho({ href, rotulo = "Abrir", children }: { href: string; rotulo?: string; children: ReactNode }) {
  return (
    <SettingsRow>
      <SettingsRowContent className="text-[13px] [&_b]:font-semibold">{children}</SettingsRowContent>
      <a href={href} className="flex-none text-[13px] font-semibold text-primary hover:underline">
        {rotulo}
      </a>
    </SettingsRow>
  )
}

function Levantado({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <SettingsRow>
      <SettingsRowContent>
        <SettingsRowTitle>{titulo}</SettingsRowTitle>
        <SettingsRowDescription>{children}</SettingsRowDescription>
      </SettingsRowContent>
    </SettingsRow>
  )
}

const tecla = <Kbd className="border bg-muted text-foreground">⋯</Kbd>

export function PaginaInicio() {
  const { isAdmin, papel, etapas, abas, motivos, campos, email, audit } = useConfig()

  if (!isAdmin) {
    return (
      <SettingsPage>
        <SettingsPageDescription>Você entrou como {PAPEIS[papel]}.</SettingsPageDescription>
        <Empty className="rounded-lg border border-dashed py-14">
          <EmptyHeader className="max-w-lg">
            <EmptyTitle className="text-[15px] font-semibold">
              As configurações da organização ficam com os administradores
            </EmptyTitle>
            <EmptyDescription>
              Etapas do funil, abas das listas, motivos, campos do card e modelo de e-mail valem para todo mundo da
              conta. Se algo precisar mudar, fale com {ADMINS.slice(0, 3).join(", ")} ou outro administrador.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </SettingsPage>
    )
  }

  const visiveis = campos.filter((c) => c.on).length
  const ativos = (t: TipoMotivo) => motivos.filter((x) => x.tipo === t && !x.arq).length + (t === "descarte" ? 1 : 0)
  const totalAbas = Object.values(abas).reduce((n, l) => n + l.length, 0)

  return (
    <SettingsPage>
      <SettingsPageDescription>
        O que a organização personaliza na Settle, num lugar só. Vale para todas as pessoas da conta e só
        administradores alteram.
      </SettingsPageDescription>

      <SettingsSection>
        <SettingsSectionTitle>Licitações</SettingsSectionTitle>
        <SettingsBox>
          <Linha href="#etapas" titulo="Etapas do funil" descricao="Colunas do quadro em Em andamento" valor={`${etapas.length} etapas`} />
          <Linha
            href="#abas"
            titulo="Abas das listas"
            descricao="Abas de Recomendadas, Explorar licitações e Descartadas, cada uma com seus filtros"
            valor={`${totalAbas} abas em 3 telas`}
          />
          <Linha
            href="#motivos"
            titulo="Motivos de descarte e perda"
            descricao="O que a pessoa escolhe ao descartar ou registrar uma perda"
            valor={`${ativos("descarte")} de descarte · ${ativos("perda")} de perda`}
          />
          <Linha
            href="#card"
            titulo="Campos do card"
            descricao="Quais informações aparecem no card de Recomendadas e em que ordem"
            valor={`${visiveis} de ${campos.length} visíveis`}
          />
          <Linha
            href="#email"
            titulo="Modelo de e-mail"
            descricao="Texto de Compartilhar licitação, com variáveis"
            valor={email.personalizado ? "Personalizado" : "Padrão da Settle"}
          />
        </SettingsBox>
      </SettingsSection>

      <SettingsSection>
        <SettingsSectionTitle>Organização</SettingsSectionTitle>
        <SettingsBox>
          <Linha href="#equipe" titulo="Equipe" descricao="Pessoas, convites e função de cada uma" valor="9 pessoas" />
          <Linha href="#permissoes" titulo="Permissões" descricao="O que cada função pode ver e alterar" valor="4 funções" />
          <Linha href="#auditoria" titulo="Auditoria" descricao="Quem mudou o quê e quando" valor={`${audit.length} registros`} />
        </SettingsBox>
      </SettingsSection>

      <SettingsSection>
        <SettingsSectionTitle>Atalhos no contexto</SettingsSectionTitle>
        <SettingsSectionDescription>
          Cada configuração também abre de onde ela é usada. Os atalhos só aparecem para administradores e levam para a
          mesma página daqui.
        </SettingsSectionDescription>
        <SettingsBox>
          <Atalho href="#etapas">
            Em andamento › menu {tecla} da coluna › <b>Editar etapas</b>
          </Atalho>
          <Atalho href="#abas">
            Recomendadas, Explorar e Descartadas › {tecla} ao lado das abas › <b>Editar abas</b> (substitui o + e o menu
            de cada aba)
          </Atalho>
          <Atalho href="#motivos">
            Descartar › lista de motivos › <b>Gerenciar motivos</b>
          </Atalho>
          <Atalho href="#card">
            Card de Recomendadas › Ordenar › <b>Personalizar campos do card</b>
          </Atalho>
          <Atalho href="#email">
            Compartilhar licitação › <b>Editar modelo de e-mail</b>
          </Atalho>
          <Atalho href="#inicio" rotulo="Aqui">
            Menu do usuário › <b>Configurações</b> (substitui Gerenciar equipe e Auditoria)
          </Atalho>
        </SettingsBox>
      </SettingsSection>

      <SettingsSection>
        <SettingsSectionTitle>Levantados para as próximas fases</SettingsSectionTitle>
        <SettingsSectionDescription>
          Outros pontos que já variam por cliente e cabem nesta área. Fora do escopo desta task.
        </SettingsSectionDescription>
        <SettingsBox>
          <Levantado titulo="Substatus">
            Hoje o card tem "Selecionar Substatus" (ex.: Encaminhar e-mail, Esperando aprovação). A lista é do cliente.
          </Levantado>
          <Levantado titulo="Campos do card em Em andamento e colunas da Tabela">
            Mesmo mecanismo de Campos do card, outra tela. Decidir se herdam de Recomendadas.
          </Levantado>
          <Levantado titulo="Segmentos">Software, Produtos: rótulo que aparece no card e filtra as recomendadas.</Levantado>
          <Levantado titulo="Perfil de recomendação">
            Regiões, faixa de valor, órgãos favoritos e palavras que definem o que chega em Recomendadas.
          </Levantado>
          <Levantado titulo="Automações por etapa">
            Criar um conjunto de tarefas quando a licitação entra numa etapa e medir quanto tempo ela fica em cada uma.
            Pedido da Alice em 18/09, para depois.
          </Levantado>
          <Levantado titulo="Abas por pessoa">
            Cada pessoa criar as próprias abas por cima das da organização. Hoje os filtros extras de cada pessoa ficam
            só no navegador dela; aba pessoal precisaria ser salva na conta.
          </Levantado>
          <Levantado titulo="Notificações">O que avisa quem, pela central de notificações e por e-mail.</Levantado>
        </SettingsBox>
      </SettingsSection>
    </SettingsPage>
  )
}

/** Link direto sem permissão: explica e diz a quem pedir. */
export function SemPermissao() {
  const { papel } = useConfig()
  return (
    <div className="mx-auto max-w-130 px-6 py-15">
      <Empty className="rounded-lg border border-dashed py-14">
        <EmptyHeader>
          <EmptyTitle className="text-[15px] font-semibold">Só administradores alteram esta configuração</EmptyTitle>
          <EmptyDescription>
            Você entrou como {PAPEIS[papel]}. Ela vale para toda a organização, por isso fica com quem administra a
            conta. Peça a um administrador: {ADMINS.slice(0, 4).join(", ")} ou {ADMINS[4]}.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" asChild>
            <a href="#inicio">Ir para a visão geral</a>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
