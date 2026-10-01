// Selo "V<N>" ao lado de "Olá, Brunno", para saber em qual atualização do protótipo você está.
//
// O número é a contagem de commits do main que tocaram settle-atualizacoes-e-historico/, e sobe um a cada
// publicação. Antes de publicar, rode:
//
//   git rev-list --count origin/main -- settle-atualizacoes-e-historico
//
// some 1 ao resultado e troque aqui.
export const VERSAO = 5
