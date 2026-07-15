/**
 * CAMADA DE APRESENTAÇÃO DO DESAFIO (agente `ui-builder`).
 * =====================================================================
 * Este arquivo traduz:
 *   - o schema de dados (`src/types/challenge.ts`, do `data-architect`), e
 *   - os estados neutros devolvidos pela lógica numérica
 *     (`src/lib/numericInput.ts` e `src/lib/rangeComparison.ts`, do
 *     `numeric-logic-engineer`)
 * em texto, cor, ícone e posição prontos para os componentes visuais
 * (`src/components/challenge/*`, do `design-to-components`) renderizarem.
 *
 * NÃO reimplementa parsing, normalização ou comparação de faixas — sempre
 * delega para `numericInput.ts`/`rangeComparison.ts`. O que existe aqui é
 * só: rótulos de ordem de grandeza, formatação compacta de números para
 * exibição, o layout (em %) da barra comparativa do painel de resultados, e
 * a tradução dos estados neutros de `RangeComparisonState` em mensagens
 * pedagógicas em português — nunca "certo"/"errado"/"incorreto".
 * =====================================================================
 */

import type { Magnitude, Quantity } from '../types/challenge'
import { MAGNITUDES } from '../types/challenge'
import { normalizeQuantity } from './numericInput'
import type { RangeComparisonState } from './rangeComparison'
import type {
  MagnitudeOption,
  StepFeedback,
  VerdictDisplay,
} from '../components/challenge/challengeUiTypes'

/** Rótulos exibidos para cada ordem de grandeza (chave canônica -> texto pt-BR). */
const MAGNITUDE_LABELS: Record<Magnitude, string> = {
  unidades: 'unidades',
  mil: 'mil',
  milhoes: 'milhões',
  bilhoes: 'bilhões',
  trilhoes: 'trilhões',
}

/** Monta as opções do seletor de ordem de grandeza, marcando a selecionada. */
export function buildMagnitudeOptions(selected: Magnitude): MagnitudeOption[] {
  return MAGNITUDES.map((magnitude) => ({
    value: magnitude,
    label: MAGNITUDE_LABELS[magnitude],
    selected: magnitude === selected,
  }))
}

function formatCompactNumber(n: number): string {
  // Números grandes (>=10 na unidade exibida) não precisam de casa decimal;
  // números pequenos (ex.: "1,2 mi") mantêm uma casa decimal para não
  // perder precisão visual.
  const rounded = Math.abs(n) >= 10 ? Math.round(n) : Math.round(n * 10) / 10
  return rounded.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
}

/** Formata um valor ABSOLUTO (já normalizado) de forma compacta e legível em pt-BR. */
export function formatAbsoluteValue(value: number, currency?: boolean): string {
  const abs = Math.abs(value)
  let text: string
  if (abs >= 1e12) text = `${formatCompactNumber(value / 1e12)} tri`
  else if (abs >= 1e9) text = `${formatCompactNumber(value / 1e9)} bi`
  else if (abs >= 1e6) text = `${formatCompactNumber(value / 1e6)} mi`
  else if (abs >= 1e3) text = `${formatCompactNumber(value / 1e3)} mil`
  else text = formatCompactNumber(value)
  return currency ? `R$ ${text}` : text
}

/** Formata um `Quantity` do schema (número + ordem de grandeza) para exibição. */
export function formatQuantity(quantity: Quantity, currency?: boolean): string {
  return formatAbsoluteValue(normalizeQuantity(quantity), currency)
}

export interface BarLayout {
  bandLeft: number
  bandWidth: number
  pointPos: number
  guessPos: number
}

/**
 * Calcula as posições (0-100%) dos marcadores da barra comparativa do
 * painel de resultados, numa escala logarítmica (valores de mercado variam
 * em ordens de grandeza, então uma escala linear deixaria tudo colado numa
 * ponta). Isso é uma decisão puramente VISUAL de onde desenhar cada
 * marcador — não é uma regra de negócio do produto, por isso vive na
 * camada de apresentação e não em `src/lib/rangeComparison.ts`.
 */
export function computeBarLayout(
  lowAbs: number,
  highAbs: number,
  pointAbs: number,
  guessAbs: number,
): BarLayout {
  const positives = [lowAbs, highAbs, pointAbs, guessAbs].filter((v) => v > 0)
  const safeLow = positives.length ? Math.min(...positives) : 1
  const safeHigh = positives.length ? Math.max(...positives) : 1
  // Folga de 1.7x para os dois lados, para os marcadores nunca ficarem
  // colados nas bordas da barra.
  const minBound = safeLow / 1.7
  const maxBound = Math.max(safeHigh * 1.7, minBound * 1.01)

  const toPercent = (value: number): number => {
    if (value <= 0) return 2
    const raw =
      ((Math.log(value) - Math.log(minBound)) / (Math.log(maxBound) - Math.log(minBound))) * 100
    return Math.max(2, Math.min(98, raw))
  }

  const left = toPercent(lowAbs)
  const right = toPercent(highAbs)

  return {
    bandLeft: left,
    bandWidth: Math.max(2, right - left),
    pointPos: toPercent(pointAbs),
    guessPos: guessAbs > 0 ? toPercent(guessAbs) : 2,
  }
}

/**
 * Traduz o estado neutro da comparação da ESTIMATIVA FINAL num veredito
 * pedagógico (texto curto, cor suave, nunca "certo"/"errado").
 */
export function buildFinalVerdict(
  state: RangeComparisonState,
  guessAbs: number,
  referenceAbs: number,
): VerdictDisplay {
  switch (state) {
    case 'dentro_da_faixa':
      return {
        icon: '🎯',
        text: 'Dentro da faixa esperada — boa calibragem!',
        color: 'var(--accent)',
        background: 'var(--accent-chip)',
        borderColor: 'var(--accent-chip-bd)',
      }
    case 'abaixo_da_faixa':
    case 'acima_da_faixa': {
      const pct =
        referenceAbs > 0 ? Math.round((Math.abs(guessAbs - referenceAbs) / referenceAbs) * 100) : 0
      const direction = state === 'abaixo_da_faixa' ? 'abaixo' : 'acima'
      return {
        icon: state === 'abaixo_da_faixa' ? '↓' : '↑',
        text: `${pct}% ${direction} da estimativa de referência`,
        color: 'var(--warn)',
        background: 'var(--warn-bg)',
        borderColor: 'var(--warn-bd)',
      }
    }
    case 'sem_faixa_definida':
      // A `Solution.referenceRange` é obrigatória no schema, então este
      // caminho não deveria ocorrer na prática — mantido como salvaguarda
      // neutra caso a faixa algum dia venha vazia/mal formada.
      return {
        icon: '•',
        text: 'Este desafio não define uma faixa de referência para comparação.',
        color: 'var(--dim)',
        background: 'var(--card-2)',
        borderColor: 'var(--border-2)',
      }
  }
}

/**
 * Traduz o estado neutro da comparação de uma MICROETAPA guiada num
 * feedback pedagógico discreto (ícone pequeno, cor suave, texto curto).
 * Retorna `undefined` quando não há faixa definida para a etapa — nesse
 * caso a UI simplesmente não mostra a caixa de feedback.
 */
export function buildStepFeedback(state: RangeComparisonState): StepFeedback | undefined {
  switch (state) {
    case 'dentro_da_faixa':
      return {
        icon: '✓',
        text: 'Boa aproximação para esta etapa.',
        color: 'var(--accent)',
        background: 'var(--accent-chip)',
        borderColor: 'var(--accent-chip-bd)',
      }
    case 'abaixo_da_faixa':
      return {
        icon: '↓',
        text: 'Um pouco abaixo do que costuma ser razoável aqui.',
        color: 'var(--warn)',
        background: 'var(--warn-bg)',
        borderColor: 'var(--warn-bd)',
      }
    case 'acima_da_faixa':
      return {
        icon: '↑',
        text: 'Um pouco acima do que costuma ser razoável aqui.',
        color: 'var(--warn)',
        background: 'var(--warn-bg)',
        borderColor: 'var(--warn-bd)',
      }
    case 'sem_faixa_definida':
      return undefined
  }
}
