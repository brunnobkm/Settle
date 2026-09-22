// Artefato: o bloco que um agente produz dentro da licitação. O nome veio da Alice, e é
// provisório. No design system o componente se chama AI Widget.
//
// Página de apresentação para o time: um modelo só, com um texto de exemplo em linguagem
// de conversa, para mostrar o formato sem prender ninguém a um layout.

import {
  AiWidget,
  AiWidgetActions,
  AiWidgetContent,
  AiWidgetHeader,
  AiWidgetNote,
  AiWidgetTitle,
} from "@/components/ui/ai-widget"
import { Button } from "@/components/ui/button"
import { SettingsPage, SettingsPageDescription } from "@/components/ui/settings-page"

import { Aviso } from "./comum"

export function PaginaArtefato() {
  return (
    <SettingsPage width="full" className="pb-6">
      <SettingsPageDescription>
        O <b>artefato</b> é o bloco que um agente produz dentro da licitação: ele traz o nome do agente, o que o agente
        respondeu e de onde tirou a resposta no edital. No design system o componente se chama AI Widget.
      </SettingsPageDescription>

      <Aviso tom="marca" fechavel>
        <b>Página de apresentação.</b> Nada aqui é configurável. O que muda de um agente para outro é o conteúdo do
        artefato, que vem da instrução dele, e o lugar onde ele aparece, no campo <b>Onde o resultado aparece</b>, em
        Agentes.
      </Aviso>

      <div className="max-w-180">
        <AiWidget>
          <AiWidgetHeader>
            <AiWidgetTitle>Exige atestado técnico?</AiWidgetTitle>
            <AiWidgetActions>
              <Button size="xs" variant="outline" className="shadow-none">
                Perguntar sobre este resultado
              </Button>
              <Button size="xs">Editar agente</Button>
            </AiWidgetActions>
          </AiWidgetHeader>
          <AiWidgetContent className="flex flex-col gap-3 text-[13.5px] leading-[20px]">
            <p>
              Sim, este edital exige atestado de capacidade técnica. Ele pede comprovação de pelo menos 1.500 horas em
              design de produto digital, e aceita a soma de mais de um atestado.
            </p>
            <p>
              Procurei nos atestados que vocês têm cadastrados: três deles somam 2.100 horas, então a exigência está
              atendida. O mais antigo é de 2023, dentro do prazo de cinco anos que o edital aceita.
            </p>
            <p>
              Uma ressalva: o edital pede que o atestado seja emitido por órgão público. Um dos três é de cliente
              privado. Mesmo sem ele, a soma continua acima do mínimo.
            </p>
          </AiWidgetContent>
          <AiWidgetNote>Fonte: Edital, item 9.4.1 · p. 21</AiWidgetNote>
        </AiWidget>
      </div>
    </SettingsPage>
  )
}
