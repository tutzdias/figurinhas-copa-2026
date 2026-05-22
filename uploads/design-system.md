# Design System — Team & Workflow Dashboard

## Paleta de Cores

| Token | Valor | Uso |
|---|---|---|
| `--color-bg` | `#F2F2F0` | Fundo principal (off-white quente) |
| `--color-surface` | `#FFFFFF` | Cards e painéis |
| `--color-sidebar` | `#1A1A1A` | Sidebar escura quase preta |
| `--color-accent` | `#D4F455` | Amarelo-lima neon — CTA, destaque, active states |
| `--color-text-primary` | `#111111` | Títulos e valores numéricos |
| `--color-text-secondary` | `#888888` | Labels, subtítulos, descrições |
| `--color-text-inverse` | `#FFFFFF` | Texto sobre fundo escuro |
| `--color-card-accent` | `#D4F455` | Card com fundo lime |
| `--color-promo` | `#0D0D0D` | Card promo com fundo quase preto |

---

## Tipografia

| Elemento | Fonte | Peso | Tamanho |
|---|---|---|---|
| Título principal | Sans-serif geométrica (DM Sans ou Sora) | 700 | 36–42px |
| Valores métricos | Mesma família, tabulada | 800 | 48–56px |
| Tabs / Botões | Mesma família | 500–600 | 14px |
| Labels de gráfico | Mesma família | 400 | 12px |
| Descrições de card | Mesma família | 400 | 13px |

> Usar `font-variant-numeric: tabular-nums` para números. Zero serifa. Muito espaço entre elementos.

---

## Botões

| Tipo | Estilo |
|---|---|
| **Primary CTA** | `bg: #111` · `text: white` · `border-radius: 999px` (pill) · `padding: 12px 24px` · ícone `+` à esquerda |
| **Tab ativa** | `bg: #111` · `text: white` · `border-radius: 999px` · sem borda |
| **Tab inativa** | `bg: transparent` · `text: #555` · hover leve |
| **Promo button** | `bg: white` · `text: #111` · pill · ícone ▶ |
| **Icon button** | Apenas ícone, fundo cinza claro arredondado |

---

## Espaçamentos

| Token | Valor |
|---|---|
| `--space-xs` | 4px |
| `--space-sm` | 8px |
| `--space-md` | 16px |
| `--space-lg` | 24px |
| `--space-xl` | 32px |
| `--space-2xl` | 48px |

> Gap entre cards: 16px · Padding interno de card: 24px · Padding do layout: 32–40px

---

## Cards

- `border-radius: 20px` em todos os cards
- `box-shadow: 0 2px 12px rgba(0,0,0,0.06)` — sombra suave
- Fundo branco padrão; variantes: lime (`#D4F455`) e preto (`#0D0D0D`)
- Sem bordas visíveis — apenas sombra

---

## Sidebar

- Largura fixa: ~72px
- Fundo: `#1A1A1A`
- Ícones monocromáticos brancos/cinza
- Item ativo: fundo ligeiramente mais claro ou accent lime
- `border-radius: 16px` nas extremidades

---

## Gráfico de Barras

- Barras duplas side-by-side com formato **pill/cápsula** (`border-radius: 999px`)
- Cor Operations: `#111111`
- Cor Data Transfer: `#D4F455`
- Barras de previsão: outline pontilhado, sem preenchimento
- Tooltip: `bg: #111` · `text: white` · `border-radius: 8px`

---

## Tom Geral

**Minimalismo técnico com acento neon.** Interface limpa, muito espaço negativo, hierarquia clara via tamanho tipográfico, e um único acento vibrante (lime `#D4F455`) para guiar a atenção. Sidebar escura cria contraste dramático com o conteúdo claro.

---

## Como usar este Design System

Cole este arquivo em uma conversa com Claude e diga:

> "Use este design system para criar [seu app]"
