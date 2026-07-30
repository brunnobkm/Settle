# Settle — Onboarding (protótipo)

Protótipo do **fluxo de onboarding** da Settle: um wizard de 6 etapas que leva a empresa do cadastro até o feed de licitações, com um **assistente flutuante** aberto no canto inferior direito (minimizável) que acompanha cada passo.

## Demo

▶️ **https://brunnobkm.github.io/Settle/Plataforma/settle-onboarding/**

## Etapas

`Cadastro → Sobre você → Confirmar & organizar → Segmentos → Ajustar & validar → Licitações`

- **1. Cadastro** — tela normal com header (logo + steps) dentro dela.
- **2. Sobre você** — vem **pré-preenchida com dados fictícios** para o teste de usabilidade.
- **3. Confirmar & organizar** — escopo (faz / não faz) já montado a partir da etapa 2, mais a escolha de como dividir em segmentos.
- **4. Segmentos** — segmentos sugeridos; juntar/separar antes de configurar.
- **5. Ajustar & validar** — palavras-chave, filtros e regras por segmento, com funil de volume reativo.
- **6. Licitações** — feed final no **layout da plataforma** (sidebar esquerda + navbar), espelhando `explorar-licitacoes`.

### Modo teste de usabilidade

- **Nenhum campo é obrigatório**: os botões de avançar ficam sempre ativos em todas as etapas.
- O assistente flutuante fica **aberto por padrão** e pode ser minimizado/reaberto.

## Estrutura

Arquivo único e autossuficiente [`index.html`](index.html), gerado a partir do componente React [`app.jsx`](app.jsx) pelo script [`build.sh`](build.sh). Empacota React 18 + Tailwind + `lucide-react` via CDN (import map + Babel standalone), sem build de produção.

```bash
# reconstruir o index.html a partir do app.jsx
bash build.sh

# rodar localmente
python3 -m http.server 4680 --directory .
# abra http://localhost:4680/
```
