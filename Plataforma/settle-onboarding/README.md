# Settle — Onboarding (protótipo)

Protótipo do **fluxo de onboarding** da Settle: um wizard de 6 etapas que leva a empresa do cadastro até o feed de licitações, com um **assistente lateral** sempre aberto guiando cada passo.

Arquivo único e autossuficiente: [`index.html`](index.html). Empacota o componente React original (`settle-onboarding.jsx`) com React 18, Tailwind e `lucide-react` via CDN, sem build.

## Demo

▶️ **https://brunnobkm.github.io/Settle/Plataforma/settle-onboarding/**

## Etapas

`Cadastro → Sobre você → Confirmar & organizar → Segmentos → Ajustar & validar → Licitações`

- **Cadastro** — e-mail, CNPJ (com validação de dígitos) e senha com requisitos ao vivo.
- **Sobre você** — descreve o que a empresa faz e o que não faz; pode preencher por formulário ou pelo assistente.
- **Confirmar & organizar** — revisa o escopo entendido (faz / não faz) e escolhe como dividir em segmentos.
- **Segmentos** — segmentos sugeridos; permite juntar/separar antes de configurar.
- **Ajustar & validar** — palavras-chave, filtros e regras por segmento, com funil de volume reativo (encontradas → recomendadas → em revisão).
- **Licitações** — feed ranqueado por confiança; nada é descartado em silêncio.

## Rodar localmente

```bash
python3 -m http.server 4680 --directory .
# abra http://localhost:4680/
```
