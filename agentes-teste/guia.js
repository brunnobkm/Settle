(function () {
  'use strict';
  const etapas = [
    {grupo:0,intro:true,tipo:'Boas-vindas',titulo:'Vamos experimentar juntos',cenario:'Você vai explorar um protótipo da Settle. Estamos avaliando a ferramenta, não o seu desempenho.',nota:'Não precisa se preparar. Algumas partes são simuladas, e não há resposta certa ou errada.',botao:'Continuar'},
    {grupo:0,intro:true,tipo:'Como participar',titulo:'Pense em voz alta',cenario:'Leia cada tarefa em voz alta e conte o que está pensando enquanto usa a ferramenta. Quando aparecerem perguntas, responda falando.',nota:'Use “Continuar” para avançar para a próxima etapa.',botao:'Entendi, começar o teste'},
    {grupo:1,tipo:'Observe e fale',titulo:'Primeiras impressões',perguntas:['Olhando a tela ao lado, o que você acha que dá para fazer aqui?','O que você acha que é um agente? E uma variável?']},
    {grupo:1,tipo:'Explore e fale',titulo:'Aprovações',cenario:'Explore a área de Aprovações.',perguntas:['O que você imagina que está aqui?','Quem resolveria isso na sua rotina?'],tarefa:true},
    {grupo:2,tipo:'Tarefa',titulo:'Um aviso para suas licitações',cenario:'Você quer que o sistema avise, em toda licitação, se o edital exige atestado de capacidade técnica. Crie isso na ferramenta.',tarefa:true},
    {grupo:2,tipo:'Depois da tentativa',titulo:'Sobre o que você configurou',perguntas:['O que significa “Onde o resultado aparece”? E “Nenhum lugar”?','O que significa “Quando roda”? Qual opção você escolheu, ou escolheria, e por quê?','Se viu opções de repetição, qual a diferença entre elas?'],nota:'Responda com o que entendeu. Se não viu algum campo, pode dizer isso.'},
    {grupo:2,tipo:'Depois da tentativa',titulo:'Permissões e confiança',perguntas:['O que são as Permissões? O que mudaria ao escolher cada opção?','Você confiaria nesse agente rodando sozinho? Por quê?']},
    {grupo:3,tipo:'Tarefa',titulo:'Um dado para reutilizar',cenario:'O edital traz o prazo de vigência do contrato, e você quer usar esse dado nos seus agentes. Cadastre isso.',tarefa:true},
    {grupo:3,tipo:'Depois da tentativa',titulo:'Sobre esse dado',perguntas:['O que significa “Onde procurar” e a ordem apresentada?','O que acontece se a variável não for encontrada?','Na lista, o que a coluna de agentes está dizendo?']},
    {grupo:4,tipo:'Observe antes de agir',titulo:'Executar e ativar',cenario:'Volte para a lista de agentes. Nesta etapa, apenas observe e conte o que espera, sem executar ou desligar.',perguntas:['O que o botão de play faz? Em quantas licitações?','E o interruptor ao lado?','Se você desligasse agora, o que aconteceria com as licitações já analisadas? E com as próximas?']},
    {grupo:5,tipo:'Antes de clicar',titulo:'Se você excluir uma variável…',cenario:'Encontre a variável “Documentos de habilitação”. Ainda não tente excluí-la.',perguntas:['O que você acha que acontece se excluir essa variável?','O que aconteceria com os agentes que usam esse dado?'],botao:'Já contei minha expectativa'},
    {grupo:5,tipo:'Tarefa',titulo:'Confira a confirmação',cenario:'Agora tente excluir “Documentos de habilitação”. Leia a confirmação em voz alta e cancele no final.',nota:'Não confirme a exclusão. Se não encontrar essa variável, conte isso e siga.',tarefa:true},
    {grupo:5,tipo:'Depois da tentativa',titulo:'O impacto da exclusão',perguntas:['A confirmação trouxe algo diferente do que você esperava?','O que aconteceria com os agentes que usavam essa variável?','E se você excluísse um agente inteiro? Apenas conte o que espera, sem excluir.']},
    {grupo:6,tipo:'Tarefa',titulo:'Leve uma oportunidade adiante',cenario:'Vá para Licitações Recomendadas. Escolha uma licitação que pareça interessante e leve adiante. Continue contando o que percebe enquanto usa a ferramenta.',tarefa:true},
    {grupo:6,tipo:'Depois da tentativa',titulo:'O que aconteceu?',perguntas:['O que aconteceu depois da sua ação?','Se apareceu um card de acompanhamento, o que ele significa? Quem pediu isso?','Quanto tempo você esperaria? Poderia sair da tela?','Como você sabe que terminou?'],nota:'Pode explorar enquanto responde. Se não apareceu um resultado, conte isso; não precisa adivinhar.'},
    {grupo:7,tipo:'Observe e fale',titulo:'Resultados na Habilitação',cenario:'Na licitação que você escolheu, abra Habilitação quando a preparação terminar. Observe os blocos de resultado e responda em voz alta.',perguntas:['O que você está vendo?','De onde veio essa informação? Dá para confiar?'],nota:'Nesta etapa, não clique nos botões dos blocos. Se não chegou a essa tela, avise quem acompanha o teste.',tarefa:true},
    {grupo:7,tipo:'Só sua expectativa',titulo:'E se você discordar?',perguntas:['O que você faria se discordasse de um resultado?','O que você espera dos botões “Falar com o agente” e “Configurar”?'],nota:'Conte o que faria, sem clicar nesses botões.'},
    {grupo:8,tipo:'Observe e fale',titulo:'Uma conversa com a ferramenta',cenario:'Abra o chat no canto direito do protótipo e observe.',perguntas:['O que você acha que dá para fazer aqui?','O que você pediria?','Olhando a lista de agentes, o que muda ao escolher um deles?'],nota:'Apenas fale: não digite nem envie mensagens. Queremos entender sua expectativa.',tarefa:true},
    {grupo:9,tipo:'Fechamento',titulo:'Para terminar',perguntas:['Se isso existisse amanhã, o que você usaria primeiro?','O que deixaria você com receio de usar?','Há algo que você não entendeu e ficou sem perguntar?'],botao:'Encerrar teste'},
    {grupo:9,tipo:'Teste encerrado',titulo:'Obrigado pela participação',cenario:'Suas impressões ajudam a melhorar a ferramenta. Avise quem acompanha a sessão que você terminou.',final:true}
  ];
  let atual = 0;
  const el = id => document.getElementById(id);
  function render(focar) {
    const etapa = etapas[atual];
    const intro = !!etapa.intro;
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
    el('voltar').disabled = atual === 0;
    if (etapa.final) {
      el('nota').textContent = 'Você chegou ao fim do roteiro. Não é necessário preencher respostas por escrito.';
      el('nota').hidden = false;
    }
    el('guiaConteudo').scrollTop = 0;
    if (focar) el('tituloEtapa').focus({preventScroll:true});
  }
  function avancar() {
    if (atual >= etapas.length - 1) return;
    atual += 1; render(true);
  }
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
