(function () {
  'use strict';
  const etapas = [
    {grupo:0,intro:true,tipo:'Boas-vindas',titulo:'Vamos experimentar juntos',cenario:'Você vai explorar um protótipo da Settle. Estamos avaliando a ferramenta, não o seu desempenho.',botao:'Continuar'},
    {grupo:0,intro:true,tipo:'Como participar',titulo:'Pense em voz alta',cenario:'Leia cada tarefa em voz alta e conte o que está pensando enquanto usa a ferramenta. Quando aparecerem perguntas, responda falando.',nota:'Use “Continuar” para avançar para a próxima etapa.',botao:'Entendi, começar o teste'},
    {grupo:1,tipo:'Observe e fale',titulo:'Primeiras impressões',perguntas:['Olhando a tela ao lado, o que você acha que dá para fazer aqui?','O que você acha que é um agente? E uma variável?']},
    {grupo:1,tipo:'Explore e fale',titulo:'Aprovações',cenario:'Explore a área de Aprovações.',perguntas:['O que você imagina que está aqui?','Quem resolveria isso na sua rotina?'],tarefa:true},
    {grupo:2,tipo:'Tarefa',titulo:'Vamos simular um cenário',cenario:'Imagine que, no seu trabalho, você precisa identificar se cada edital exige atestado de capacidade técnica. Primeiro, cadastre esse dado para poder reutilizá-lo depois. Dê a ele o nome “Atestado exigido (teste)”. Como você faria isso na ferramenta?',tarefa:true},
    {grupo:2,tipo:'Depois da tentativa',titulo:'Sobre esse dado',perguntas:['O que significa a coluna “Onde procurar” e a ordem apresentada?','O que acontece se a variável não for encontrada?','Na lista, o que a coluna de agentes está dizendo?']},
    {grupo:3,tipo:'Tarefa',titulo:'Um agente usando seu dado',cenario:'Agora imagine que você quer receber um aviso, em toda licitação, quando o edital exigir atestado de capacidade técnica. Crie um agente que use a variável “Atestado exigido (teste)” que você acabou de cadastrar para produzir esse aviso.',tarefa:true},
    {grupo:3,tipo:'Depois da tentativa',titulo:'Sobre o que você configurou',perguntas:['Como você usou a variável que criou no agente? Como sabe que ela está vinculada?','Qual a diferença entre o que a variável faz e o que o agente faz?','O que significa “Onde o resultado aparece”? E “Nenhum lugar”?','O que significa “Quando roda”? Qual opção você escolheu, ou escolheria, e por quê?','Se viu opções de repetição, qual a diferença entre elas?'],nota:'Responda com o que entendeu. Se não conseguiu criar ou usar a variável, conte onde encontrou dificuldade.'},
    {grupo:3,tipo:'Depois da tentativa',titulo:'Permissões e confiança',perguntas:['O que são as Permissões? O que mudaria ao escolher cada opção?','Você confiaria nesse agente rodando sozinho? Por quê?']},
    {grupo:4,tipo:'Observe antes de agir',titulo:'Executar e ativar',cenario:'Volte para a lista de agentes. Nesta etapa, apenas observe e conte o que espera, sem executar ou desligar.',perguntas:['O que o botão de play faz? Em quantas licitações?','E o interruptor ao lado?','Se você desligasse agora, o que aconteceria com as licitações já analisadas? E com as próximas?']},
    {grupo:5,tipo:'Antes de clicar',titulo:'Se você excluir uma variável…',cenario:'Encontre a variável “Documentos de habilitação”. Ainda não tente excluí-la.',perguntas:['O que você acha que acontece se excluir essa variável?','O que aconteceria com os agentes que usam esse dado?'],botao:'Já contei minha expectativa'},
    {grupo:5,tipo:'Tarefa',titulo:'Confira a confirmação',cenario:'Agora tente excluir “Documentos de habilitação”. Leia a confirmação em voz alta e cancele no final.',nota:'Não confirme a exclusão. Se não encontrar essa variável, conte isso e siga.',tarefa:true},
    {grupo:5,tipo:'Depois da tentativa',titulo:'O impacto da exclusão',perguntas:['A confirmação trouxe algo diferente do que você esperava?','O que aconteceria com os agentes que usavam essa variável?','E se você excluísse um agente inteiro? Apenas conte o que espera, sem excluir.']},
    {grupo:6,tipo:'Tarefa',titulo:'Leve uma oportunidade adiante',cenario:'Vá para Licitações Recomendadas e clique no card de uma licitação que pareça interessante para abrir os detalhes. Dentro da licitação, clique em “Enviar para análise”. Essa ação inicia as análises dos agentes configurados para essa etapa, ajudando você a avaliar a oportunidade antes de decidir participar. Continue contando o que percebe enquanto usa a ferramenta.',tarefa:true},
    {grupo:6,tipo:'Depois da tentativa',titulo:'O que aconteceu?',perguntas:['O que aconteceu depois da sua ação?','Se apareceu um card de acompanhamento, o que ele significa? Quem pediu isso?','Quanto tempo você esperaria? Poderia sair da tela?','Como você sabe que terminou?'],nota:'Pode explorar enquanto responde. Se não apareceu um resultado, conte isso; não precisa adivinhar.'},
    {grupo:7,tipo:'Observe e fale',titulo:'Resultados na Habilitação',cenario:'Na licitação que você escolheu, abra Habilitação quando a preparação terminar. Observe os blocos de resultado e responda em voz alta.',perguntas:['O que você está vendo?','De onde veio essa informação? Dá para confiar?'],nota:'Nesta etapa, não clique nos botões dos blocos. Se não chegou a essa tela, avise quem acompanha o teste.',tarefa:true},
    {grupo:7,tipo:'Só sua expectativa',titulo:'E se você discordar?',perguntas:['O que você faria se discordasse de um resultado?','O que você espera dos botões “Falar com o agente” e “Configurar”?'],nota:'Conte o que faria, sem clicar nesses botões.'},
    {grupo:8,tipo:'Observe e fale',titulo:'Uma conversa com a ferramenta',cenario:'Abra o chat no canto direito do protótipo e observe.',perguntas:['O que você acha que dá para fazer aqui?','O que você pediria?','Olhando a lista de agentes, o que muda ao escolher um deles?'],nota:'Apenas fale: não digite nem envie mensagens. Queremos entender sua expectativa.',tarefa:true},
    {grupo:9,tipo:'Fechamento',titulo:'Para terminar',perguntas:['Se isso existisse amanhã, o que você usaria primeiro?','O que deixaria você com receio de usar?','Há algo que você não entendeu e ficou sem perguntar?'],botao:'Encerrar teste'},
    {grupo:9,tipo:'Teste encerrado',titulo:'Obrigado pela participação',cenario:'Suas impressões ajudam a melhorar a ferramenta. Avise quem acompanha a sessão que você terminou.',final:true}
  ];
  const ajudas = {
  "Aprovações": {
    "dica": "Procure uma aba que reúna ações aguardando sua decisão.",
    "passos": [
      "Na página de Agentes, clique na aba “Aprovações”.",
      "Observe os itens ou a mensagem exibida e responda às perguntas do roteiro. Não é necessário aprovar nada."
    ]
  },
  "Vamos simular um cenário": {
    "dica": "Dados que podem ser reutilizados pelos agentes ficam na área de Variáveis.",
    "passos": [
      "Abra a aba “Variáveis” e clique em “Adicionar variável”.",
      "Em “Nome da variável”, escreva “Atestado exigido (teste)” e, em “Tipo”, escolha “Sim ou não”.",
      "Em “Instruções”, peça para identificar se o edital exige atestado de capacidade técnica.",
      "Em “Onde procurar”, indique o edital como fonte. Revise o que fazer quando o dado não for encontrado.",
      "Clique em “Criar variável”. Você usará esse dado na próxima tarefa."
    ]
  },
  "Confira a confirmação": {
    "dica": "Abra a variável para encontrar a ação de exclusão. Nesta tarefa, leia a confirmação e cancele.",
    "passos": [
      "Na aba “Variáveis”, encontre e abra “Documentos de habilitação”.",
      "Clique em “Excluir esta variável”.",
      "Leia a confirmação em voz alta e clique em “Cancelar”. Não confirme a exclusão.",
      "Se a variável não estiver disponível, avise quem acompanha o teste e continue o roteiro."
    ]
  },
  "Leve uma oportunidade adiante": {
    "dica": "Abra os detalhes pelo card da licitação. O botão “Enviar para análise” fica dentro da licitação.",
    "passos": [
      "Abra “Licitações Recomendadas” no menu da plataforma.",
      "Clique no card de uma licitação para abrir seus detalhes.",
      "Dentro da licitação, clique em “Enviar para análise” para iniciar as análises dos agentes configurados para essa etapa.",
      "Observe o acompanhamento dos resultados e conte em voz alta o que acontece."
    ]
  },
  "Resultados na Habilitação": {
    "dica": "Os resultados ficam nas abas da licitação que você enviou para análise.",
    "passos": [
      "Abra a licitação enviada para análise.",
      "Clique na aba “Habilitação” e aguarde o processamento, se necessário.",
      "Observe os blocos e responda às perguntas sem clicar nos botões dos resultados.",
      "Se não encontrar a licitação, avise quem acompanha a sessão."
    ]
  },
  "Uma conversa com a ferramenta": {
    "dica": "Procure o acesso à conversa no canto direito da plataforma.",
    "passos": [
      "Abra o chat no canto direito do protótipo.",
      "Observe o campo de mensagem e o seletor de agentes.",
      "Responda às perguntas em voz alta, sem digitar nem enviar mensagens."
    ]
  },
  "Um agente usando seu dado": {
    "dica": "No campo de instruções do agente, é possível inserir uma variável já cadastrada para usar o resultado dela.",
    "passos": [
      "Na aba “Agentes”, clique em “Adicionar agente” e escolha “Criar do zero”.",
      "Dê um nome ao agente. Em “Instruções”, digite / e selecione “Atestado exigido (teste)”. Escolha a variável que você criou, não a “Atestado exigido” que já existia.",
      "Complete a instrução para avisar quando a variável indicar que o atestado é exigido. Mantenha a variável inserida no texto.",
      "Escolha onde o resultado deve aparecer e quando o agente deve rodar. Revise as permissões.",
      "Clique em “Ativar agente”. Se algum campo impedir o avanço, leia o aviso e complete a configuração."
    ]
  }
};
  const usoAjuda = new Map();
  const visitadas = new Set();
  let atual = 0;
  const el = id => document.getElementById(id);
  function render(focar) {
    const etapa = etapas[atual];
    const intro = !!etapa.intro;
    if (etapa.tarefa) visitadas.add(atual);
    const ajuda = etapa.tarefa && ajudas[etapa.titulo];
    const nivel = usoAjuda.get(atual) || 0;
    el('ajudaRodape').hidden = !ajuda;
    el('ajudaTarefa').hidden = !ajuda || !nivel;
    el('conteudoAjuda').hidden = !nivel;
    el('pedirAjuda').setAttribute('aria-expanded', String(nivel > 0));
    el('dicaAjuda').textContent = ajuda ? ajuda.dica : '';
    el('passosAjuda').replaceChildren();
    if (ajuda) ajuda.passos.forEach(texto => {
      const li = document.createElement('li'); li.textContent = texto; el('passosAjuda').append(li);
    });
    el('passosAjuda').hidden = nivel < 2;
    el('verPassos').setAttribute('aria-expanded', String(nivel === 2));
    el('resumoAjuda').hidden = !etapa.final;
    if (etapa.final) {
      el('listaAjuda').replaceChildren();
      visitadas.forEach(indice => {
        const li = document.createElement('li');
        li.textContent = etapas[indice].titulo + ': ' + ['Sem ajuda solicitada', 'Dica consultada', 'Passo a passo consultado'][usoAjuda.get(indice) || 0];
        el('listaAjuda').append(li);
      });
    }
    el('checklistInicio').hidden = atual !== 0;
    document.body.classList.toggle('guia-intro',intro);
    document.querySelector('.teste-prototipo').inert = intro;
    const painel = document.querySelector('.teste-painel');
    painel.setAttribute('role',intro ? 'dialog' : 'complementary');
    if (intro) painel.setAttribute('aria-modal','true');
    else painel.removeAttribute('aria-modal');

    el('contador').textContent = etapa.grupo ? `Etapa ${etapa.grupo} de 9` : 'Introdução';
    el('progresso').value = etapa.final ? 9 : Math.max(0, etapa.grupo - 1);
    el('tipoEtapa').textContent = etapa.tipo;
    el('tituloEtapa').textContent = etapa.titulo;
    el('cenario').textContent = etapa.cenario || '';
    el('cenario').hidden = !etapa.cenario;
    el('perguntas').replaceChildren();
    (etapa.perguntas || []).forEach(texto => {
      const li = document.createElement('li'); li.textContent = texto; el('perguntas').append(li);
    });
    el('perguntas').hidden = !etapa.perguntas;
    el('nota').textContent = etapa.nota || '';
    el('nota').hidden = !etapa.nota;
    el('avancar').hidden = !!etapa.final;
    el('avancar').textContent = etapa.botao || 'Continuar';
    el('voltar').hidden = atual === 0;
    el('voltar').disabled = atual === 0;
    if (etapa.final) {
      el('nota').textContent = 'Você chegou ao fim do roteiro. Não é necessário preencher respostas por escrito.';
      el('nota').hidden = false;
    }
    el('guiaConteudo').scrollTop = 0;
    if (focar) el('tituloEtapa').focus({preventScroll:true});
  }
  let fecharAviso;
  function avancar() {
    if (atual === 0) {
      const pendente = el('checklistInicio').querySelector('input:not(:checked)');
      if (pendente) {
        if (fecharAviso) fecharAviso();
        fecharAviso = window.settleToast('Leia atentamente e marque cada opção do checklist antes de continuar.', {duration:6000});
        pendente.focus();
        return;
      }
    }
    if (fecharAviso) { fecharAviso(); fecharAviso = null; }
    if (atual >= etapas.length - 1) return;
    atual += 1; render(true);
  }
  el('pedirAjuda').addEventListener('click', () => {
    usoAjuda.set(atual, Math.max(1, usoAjuda.get(atual) || 0));
    el('ajudaTarefa').hidden = false;
    el('conteudoAjuda').hidden = false;
    el('pedirAjuda').setAttribute('aria-expanded','true');
    el('tituloAjuda').focus();
  });
  el('verPassos').addEventListener('click', () => {
    usoAjuda.set(atual,2);
    el('passosAjuda').hidden = false;
    el('verPassos').setAttribute('aria-expanded','true');
    el('passosAjuda').scrollIntoView({block:'nearest'});
  });
  el('avancar').addEventListener('click', avancar);
  el('voltar').addEventListener('click', () => { if (atual > 0) { atual -= 1; render(true); } });
  document.querySelector('.teste-painel').addEventListener('keydown', event => {
    if (!etapas[atual].intro || event.key !== 'Tab') return;
    const botoes = [...document.querySelectorAll('.teste-painel button, .teste-painel input')].filter(b => !b.closest('[hidden]') && !b.disabled);
    const primeiro = botoes[0], ultimo = botoes[botoes.length - 1];
    if (event.shiftKey && (document.activeElement === primeiro || document.activeElement === el('tituloEtapa'))) {
      event.preventDefault(); ultimo.focus();
    } else if (!event.shiftKey && document.activeElement === ultimo) {
      event.preventDefault(); primeiro.focus();
    }
  });
  render(true);
})();
