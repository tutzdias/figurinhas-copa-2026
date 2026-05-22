# Prompt — App Catalogador de Figurinhas Copa 2026

---

Crie um **web app mobile-first** em React para catalogar figurinhas do álbum da Copa do Mundo 2026. O app tem 3 telas navegáveis e deve funcionar completamente no browser, com persistência via `localStorage` para que os dados sejam mantidos entre sessões (o site será hospedado no GitHub Pages).

---

## Design System

Siga rigorosamente este design system:

**Paleta:**
- `--color-bg: #F2F2F0` — fundo principal (off-white quente)
- `--color-surface: #FFFFFF` — cards e painéis
- `--color-dark: #1A1A1A` — header escuro, sidebar
- `--color-accent: #D4F455` — amarelo-lima neon, CTAs, estados ativos
- `--color-text-primary: #111111` — títulos e valores
- `--color-text-secondary: #888888` — labels e descrições
- `--color-text-inverse: #FFFFFF` — texto sobre fundo escuro

**Tipografia:** DM Sans (importar do Google Fonts). Títulos: 700–800, 36–56px. Tabs/botões: 500–600, 14px. Labels: 400, 12px. Usar `font-variant-numeric: tabular-nums` em todos os números.

**Componentes:**
- Cards: `border-radius: 20px`, `box-shadow: 0 2px 12px rgba(0,0,0,0.06)`, sem bordas visíveis
- Botões primários (pill): `background: #111`, texto branco, `border-radius: 999px`, `padding: 12px 24px`
- Botões accent: `background: #D4F455`, texto `#111`, pill
- Espaçamentos: xs=4px, sm=8px, md=16px, lg=24px, xl=32px, 2xl=48px
- Tom geral: minimalismo técnico com acento neon. Muito espaço negativo. Hierarquia via tamanho tipográfico.

---

## Dados do Álbum

O álbum tem **901 figurinhas** no total, organizadas assim:

**Seção FWC (Fifa World Cup History) — Grupo Especial:**
- FWC: FWC1 a FWC19 (19 figurinhas)
- Coca-Cola: CC1 a CC14 (14 figurinhas)

**Grupo A:**
- México (MEX): MEX1–MEX20
- África do Sul (RSA): RSA1–RSA20
- Coreia do Sul (KOR): KOR1–KOR20
- Rep. Tcheca (CZE): CZE1–CZE20

**Grupo B:**
- Canadá (CAN): CAN1–CAN20
- Bósnia (BIH): BIH1–BIH20
- Catar (QAT): QAT1–QAT20
- Suíça (SUI): SUI1–SUI20

**Grupo C:**
- Brasil (BRA): BRA1–BRA20
- Marrocos (MAR): MAR1–MAR20
- Haiti (HAI): HAI1–HAI20
- Escócia (SCO): SCO1–SCO20

**Grupo D:**
- Estados Unidos (USA): USA1–USA20
- Paraguai (PAR): PAR1–PAR20
- Austrália (AUS): AUS1–AUS20
- Turquia (TUR): TUR1–TUR20

**Grupo E:**
- Alemanha (GER): GER1–GER20
- Curaçao (CUW): CUW1–CUW20
- Costa do Marfim (CIV): CIV1–CIV20
- Equador (ECU): ECU1–ECU20

**Grupo F:**
- Holanda (NED): NED1–NED20
- Japão (JPN): JPN1–JPN20
- Suécia (SWE): SWE1–SWE20
- Tunísia (TUN): TUN1–TUN20

**Grupo G:**
- Bélgica (BEL): BEL1–BEL20
- Egito (EGY): EGY1–EGY20
- Irã (IRN): IRN1–IRN20
- Nova Zelândia (NZL): NZL1–NZL20

**Grupo H:**
- Espanha (ESP): ESP1–ESP20
- Cabo Verde (CPV): CPV1–CPV20
- Arábia Saudita (KSA): KSA1–KSA20
- Uruguai (URU): URU1–URU20

**Grupo I:**
- França (FRA): FRA1–FRA20
- Senegal (SEN): SEN1–SEN20
- Iraque (IRQ): IRQ1–IRQ20
- Noruega (NOR): NOR1–NOR20

**Grupo J:**
- Argentina (ARG): ARG1–ARG20
- Argélia (ALG): ALG1–ALG20
- Áustria (AUT): AUT1–AUT20
- Jordânia (JOR): JOR1–JOR20

**Grupo K:**
- Portugal (POR): POR1–POR20
- Congo (COD): COD1–COD20
- Uzbequistão (UZB): UZB1–UZB20
- Colômbia (COL): COL1–COL20

**Grupo L:**
- Inglaterra (ENG): ENG1–ENG20
- Croácia (CRO): CRO1–CRO20
- Gana (GHA): GHA1–GHA20
- Panamá (PAN): PAN1–PAN20

---

## Persistência de Dados

**CRÍTICO:** Todos os dados de figurinhas marcadas devem ser salvos em `localStorage` com a chave `copa2026_stickers`. A estrutura deve ser um objeto JSON onde cada chave é o código da figurinha (ex: `"MEX1"`, `"BRA5"`) e o valor é `true` se adquirida. Carregar do `localStorage` no início e salvar a cada alteração. Isso garante que o site funcione no GitHub Pages com dados persistentes entre sessões no mesmo dispositivo.

```js
// Exemplo de estrutura
{
  "MEX1": true,
  "MEX3": true,
  "BRA7": true
}
```

---

## Tela 1 — HOME

**Layout:**
- Fundo: um gradiente animado escuro (`#0D0D0D` → `#1A1A1A`) simulando movimento, com uma bola de futebol ou troféu como elemento decorativo central usando CSS/SVG (nenhum vídeo ou gif real — simule com animação CSS de rotação lenta e brilho)
- Sobre o fundo, sobreposição de texto editorial bold no estilo da referência visual fornecida:
  - **Topo:** número de figurinhas adquiridas vs total em tipografia enorme (ex: `"347"` em 72px bold branco, e `/901` em 36px cinza claro)
  - **Base:** porcentagem de conclusão em tipografia gigante (ex: `"38%"` em 96px, bold, cor accent `#D4F455`)
  - Labels pequenos acima de cada número em branco com opacidade 60% (`FIGURINHAS` / `CONCLUÍDO`)
- Abaixo do bloco principal, ainda sobre o fundo escuro, stats secundários em linha:
  - Faltantes: total - adquiridas
  - % por status de países: quantos completos / iniciados / não iniciados
- **Botão CTA** na parte inferior: pill branco com texto `#111` escrito "Ver Todos os Países" — ao clicar navega para Tela 2

**Edge cases:**
- Se 0 figurinhas: mostrar `"0/901"` e `"0%"` sem quebrar layout
- Se 100%: destacar com animação celebratória (confetti ou pulso no accent)

---

## Tela 2 — TODOS OS PAÍSES

**Header:**
- Fundo escuro `#1A1A1A`, título "Ver Todos" em branco bold
- Contador global: `"55 / 901"` · `"10%"` em linha, fonte tabulada

**Controles:**
- Campo de busca (ícone lupa + input) — filtra países em tempo real pelo nome completo ou sigla
- Toggle de visualização: dois botões pill — `Por Grupo` | `A–Z` — que reorganizam a lista

**Lista de países:**
- Agrupada por Grupo (A, B, C... L, + Grupo Especial) ou em ordem alfabética
- Cabeçalho de grupo: label `"GRUPO A"` em texto secundário + status do grupo (ex: `"• Completo"` em accent lime se 100%, ou `"• Em andamento"` se parcial)
- Cada país é representado por um **círculo clicável**:
  - **Fundo do círculo:** emoji da bandeira do país (use os emojis Unicode de bandeiras — ex: 🇧🇷 🇲🇽 🇫🇷) centralizado, grande, com leve blur/opacidade como fundo
  - **Frente:** porcentagem em texto bold branco com sombra (ex: `"55%"`)
  - **Se completo (100%):** círculo com borda accent `#D4F455` e ícone ✓ no lugar da porcentagem
  - **Se não iniciado (0%):** círculo mais apagado/dessaturado
  - **Abaixo do círculo:** sigla do país em texto secundário pequeno (ex: `MEX`, `BRA`)
- Grid: 4 colunas por linha
- Ao clicar num país: navega para Tela 3 (País Detalhe) daquele país

**Edge cases:**
- Busca sem resultado: mensagem "Nenhum país encontrado" centralizada
- Grupos com apenas FWC e CC (Grupo Especial): exibir normalmente com label "GRUPO ESPECIAL"

---

## Tela 3 — PAÍS DETALHE

**Header:**
- Botão voltar (←) no canto superior esquerdo → volta para Tela 2
- Nome do país em tipografia grande bold (ex: `"MÉXICO"`)
- Subheader: `"Grupo A"` à esquerda · `"50%"` à direita em accent

**Grid de figurinhas:**
- 5 colunas × 4 linhas = 20 círculos (ou quantidade correta para FWC=19 e CC=14)
- Cada círculo mostra o número da figurinha (ex: `1`, `2`, `3`...)
- **Estado não adquirida:** círculo com fundo `#F2F2F0`, borda `#DDD`, número em `#888`
- **Estado adquirida:** círculo com fundo `#111`, número em branco — ou fundo accent `#D4F455` com número `#111`
- Toque/clique no círculo: toggle entre adquirida/não adquirida, salva imediatamente no `localStorage`, recalcula % instantaneamente

**Progresso visual:**
- Barra de progresso linear abaixo do nome do país (fill accent `#D4F455` sobre fundo `#E0E0E0`)
- Texto: `"X de 20 figurinhas"` (ou número correto para FWC/CC)

**Footer fixo:**
- Três elementos em linha: `←` (país anterior) · botão pill `"Ver Todos"` (→ Tela 2) · `→` (próximo país)
- A ordem de navegação entre países segue a ordem dos grupos (A→L→Especial)
- No primeiro país: desabilitar `←` (opacidade 30%)
- No último país: desabilitar `→` (opacidade 30%)

**Edge cases:**
- País com 0 figurinhas marcadas: barra de progresso vazia, texto `"0 de 20 figurinhas"`
- País 100% completo: exibir badge `"COMPLETO"` em accent acima do grid, com animação de entrada
- FWC e Coca-Cola: adaptar grid para 19 e 14 círculos respectivamente (não forçar 20)

---

## Navegação Geral

Implemente navegação entre as 3 telas via estado React (sem React Router, para simplicidade no GitHub Pages). O estado atual da tela e o país selecionado devem ser controlados por `useState`. Nenhum reload de página.

---

## Requisitos Técnicos

- React funcional com hooks (`useState`, `useEffect`, `useMemo`)
- Importar DM Sans do Google Fonts via `<link>` no head ou `@import` no CSS
- `localStorage` para persistência — carregar no `useEffect` inicial, salvar a cada toggle
- Emojis Unicode de bandeiras para representar países (não usar imagens externas)
- Layout 100% mobile-first: max-width 430px centralizado, altura 100vh
- Sem dependências externas além do React base — zero bibliotecas de UI
- Animações via CSS transitions e keyframes apenas
- Funciona offline após primeiro carregamento (sem fetch de APIs)
- Código limpo, comentado por seção, pronto para deploy no GitHub Pages como single HTML file ou como projeto React com `npm run build`
