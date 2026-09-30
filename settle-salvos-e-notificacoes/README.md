# Salvos para depois e notificações

> **Tela em React.** O código fica em `app/`; o `index.html` é gerado pelo build
> (`cd react && npm run build -- settle-salvos-e-notificacoes`). Veja a seção "Stack" do `AGENTS.md` da raiz.

Duplicado de [Explorar licitações](../settle-explorar-licitacoes/). Notificações de atualização por
licitação, ligadas pelo **sino**, e a **central de notificações**. Task no Notion: "Notificar
atualizações de editais descartados" (Design), pedido da Alice.

## Regras

### Salvar para depois
- Continua como hoje: um clique salva ou remove, com Desfazer no aviso. Não pergunta nada.
- Salvar e notificar são independentes: dá para salvar sem notificação e ligar o sino sem salvar.

### Sino da licitação
- **Onde aparece:** nos ícones do card (Recomendadas, Explorar, Salvos, Em andamento) e
  **no header da licitação aberta** (detalhe). Nos dois lugares tem o mesmo comportamento.
- **Desligado, primeiro clique:** abre "Receber notificações desta licitação?" com os tipos de
  atualização (todos marcados por padrão): retificação do edital, novo documento, mudança de prazo,
  mudança de status, esclarecimentos e impugnações. Botões "Agora não" e "Ativar notificações".
- **Ligado, clique:** abre o dropdown **"Notificações do edital"** com as atualizações daquela
  licitação (tipo, data, o que mudou). Ao fechar, as exibidas viram lidas.
  - No topo, à direita do título: **engrenagem** (tooltip "Configurar notificações") e **sino
    cortado** (tooltip "Desativar notificações"), atalho rápido para desligar. Sem rodapé.
  - Configurar troca o conteúdo: **Voltar (seta) no topo, à esquerda do título "Configurar
    notificações"**, tipos de atualização e botão Salvar.
- **Estado visível:** sino preenchido quando ligado; número sobre o sino com as não lidas.
- Pode ser configurado ou desativado a qualquer momento, com Desfazer no aviso.

### Onde a notificação chega
Toda atualização de uma licitação com sino ligado chega nos **dois lugares**:
1. No **sino da licitação** (contador no card e no header da licitação).
2. Na **central de notificações** (sino da navbar, com o total de não lidas): abas Não lidas e
   Todas; cada item mostra tipo, edital, órgão, antes/agora, leitura de impacto da IA, documento
   novo, "Ver licitação" e marcar como lida/não lida. Pode filtrar
   por edital (chip removível).

Lida é uma só: ler em um lugar marca como lida no outro.

### Descarte
- O diálogo de hoje na plataforma é **"Descartar licitação"**, com "Selecione o motivo para
  descartar essa licitação.", Motivo (select), Comentário opcional, Cancelar e Descartar.
- **Descartar desliga as notificações da licitação**, a não ser que o usuário marque a opção nova
  no mesmo diálogo, abaixo do Comentário: **"Continuar recebendo atualizações"**.
  - Desmarcada (padrão). Com sino ligado: "As notificações desta licitação serão desativadas ao
    descartar." Sem sino: "Avisamos se o edital mudar, para você reavaliar o descarte."
  - Marcada: "Você será avisado sobre <tipos>. A licitação fica em Descartadas." Mantém os tipos
    que já estavam configurados; se o sino estava desligado, liga com todos.
- **Sugestão por motivo:** quando o motivo é um que uma atualização pode desfazer, o diálogo mostra
  uma sugestão (sem marcar sozinho): requisitos técnicos, certificação, prazo, documentação
  restritiva, valor. A lista fica em `MOTIVOS_REVERSIVEIS` (`app/dados.ts`).
- Na central, a notificação de uma licitação descartada leva o selo "Descartada".
- Toast após descartar informa se as notificações foram mantidas ou desativadas, com Desfazer.

## Sugestões para a documentação

- **Filtro "Acompanhando" na central de notificações:** lista as licitações com sino ligado,
  salvas ou não (inclusive descartadas), para gerenciar tudo em um lugar sem criar tela nova.
- Aviso por e-mail e preferências gerais (engrenagem da central, ainda não prototipada).
- Para onde a licitação descartada vai quando uma atualização a torna aderente (hoje fica em
  Descartadas, com a notificação apontando para ela).

## Protótipo

- Sidebar: **Explorar licitações** e **Salvos para depois** trocam de tela aqui mesmo.
- Em Salvos: abas Todas · Com atualizações · Com notificações · Sem notificações.
- **Simular atualização do portal** (botão de protótipo em Salvos): gera uma notificação só para
  licitações com sino ligado para aquele tipo.
- O detalhe da licitação (header com sino) não está prototipado aqui.
