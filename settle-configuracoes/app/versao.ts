// SELO "V<N>" ao lado de "Voltar para a plataforma", para saber que a página atualizou.
//
// O número é a contagem de commits do main que tocaram settle-configuracoes/, e sobe um a
// cada publicação. Antes de publicar, rode:
//
//   git rev-list --count origin/main -- settle-configuracoes
//
// some 1 ao resultado e troque aqui.
export const VERSAO = 33
