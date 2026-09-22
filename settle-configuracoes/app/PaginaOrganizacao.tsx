// Organização: Equipe, Permissões e Auditoria (hoje no menu do usuário; passam a morar aqui).

import type { ReactNode } from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

import { EQUIPE, PAPEIS, PERMISSOES } from "./dados"
import { useConfig } from "./estado"

function Tabela({ colunas, linhas }: { colunas: string[]; linhas: ReactNode[][] }) {
  return (
    <SettingsBox>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {colunas.map((c) => (
              <TableHead key={c} scope="col" className="h-auto px-4 py-2.5 text-[13px] font-semibold">
                {c}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {linhas.map((l, i) => (
            <TableRow key={i}>
              {l.map((c, j) => (
                <TableCell
                  key={j}
                  className="px-4 py-2.5 text-[13px] whitespace-normal text-muted-foreground first:font-medium first:text-foreground"
                >
                  {c}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SettingsBox>
  )
}

export function PaginaEquipe() {
  return (
    <SettingsPage>
      <SettingsPageDescription>
        Hoje em Menu do usuário › Gerenciar equipe. Passa a morar aqui, com a mesma tabela e as mesmas ações (convidar,
        mudar função, resetar senha, remover).
      </SettingsPageDescription>
      <Tabela colunas={["Pessoa", "Função", "Status"]} linhas={EQUIPE} />
    </SettingsPage>
  )
}

function Regra({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <SettingsRow>
      <SettingsRowContent>
        <SettingsRowTitle>{titulo}</SettingsRowTitle>
        <SettingsRowDescription>{children}</SettingsRowDescription>
      </SettingsRowContent>
    </SettingsRow>
  )
}

export function PaginaPermissoes() {
  return (
    <SettingsPage>
      <SettingsPageDescription>
        As quatro funções que já existem em Gerenciar equipe. Configuração da organização é ação de Administrador; as
        outras funções usam o que foi configurado.
      </SettingsPageDescription>
      <Tabela colunas={["Configuração", ...Object.values(PAPEIS)]} linhas={PERMISSOES} />
      <SettingsSection className="mt-6">
        <SettingsSectionTitle>Regras</SettingsSectionTitle>
        <SettingsBox>
          <Regra titulo="Negado por padrão">
            Quem não é Administrador não vê a seção nem os atalhos no contexto. Se abrir o link direto, recebe a tela de
            sem permissão com o nome dos administradores. A regra vale no backend (403), a tela é só a primeira defesa.
          </Regra>
          <Regra titulo="Abas são da organização">
            Só o Administrador cria, renomeia, muda os filtros padrão, reordena e exclui abas, e a mudança vale para todo
            mundo. As outras funções usam as abas e podem adicionar filtros extras só para si. "Todas" nunca pode ser
            excluída.
          </Regra>
          <Regra titulo="Tudo vai para a Auditoria">Cada alteração registra quem, quando, a área e o antes/depois.</Regra>
          <Regra titulo="Teste no protótipo">Use "Ver como" no topo para ver a área com outra função.</Regra>
        </SettingsBox>
      </SettingsSection>
    </SettingsPage>
  )
}

export function PaginaAuditoria() {
  const { audit } = useConfig()
  return (
    <SettingsPage>
      <SettingsPageDescription>
        Hoje em Menu do usuário › Auditoria. Aqui aparecem as alterações de configuração e as respostas às aprovações
        dos agentes, uma linha por decisão; as ações feitas nesta sessão entram no topo.
      </SettingsPageDescription>
      <Tabela
        colunas={["Quando", "Quem", "Área", "Alteração"]}
        linhas={audit.map((a) => [<span className="tabular-nums">{a.quando}</span>, a.quem, a.area, a.txt])}
      />
    </SettingsPage>
  )
}
