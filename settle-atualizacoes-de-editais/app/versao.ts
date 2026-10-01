// Selo "V<N>" ao lado de "Olá, Brunno", para saber em qual atualização do protótipo você está.
//
// O número é a contagem de commits do main que tocaram settle-atualizacoes-de-editais/ (e o nome antigo,
// settle-salvos-e-notificacoes/), e sobe um a cada
// publicação. Antes de publicar, rode:
//
//   git rev-list --count origin/main -- settle-atualizacoes-de-editais settle-salvos-e-notificacoes
//
// some 1 ao resultado e troque aqui.
export const VERSAO = 16
