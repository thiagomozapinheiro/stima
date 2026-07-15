/**
 * MOTOR DE COMPARAÇÃO COM FAIXA — avaliação PEDAGÓGICA (não punitiva).
 * =====================================================================
 * Dado um valor já normalizado (ver `numericInput.ts`) e a faixa definida
 * no desafio, dizemos apenas ONDE o valor cai em relação à faixa. NÃO
 * emitimos julgamento de "certo/errado": os estados são neutros e a UI
 * decide como falar com o usuário de forma acolhedora.
 *
 * Esta lógica serve tanto para a estimativa final (`Solution.referenceRange`)
 * quanto para cada microetapa do modo guiado (`GuidedStep.acceptableRange`),
 * que pode não existir (faixa opcional).
 * =====================================================================
 */

import type { Quantity, QuantityRange } from '../types/challenge'
import { normalizeQuantity } from './numericInput'

/**
 * Estado da comparação. São chaves NEUTRAS (nada de "certo"/"errado"):
 *   - `dentro_da_faixa`     : o valor está entre o mínimo e o máximo (inclusive).
 *   - `abaixo_da_faixa`     : o valor é menor que o mínimo.
 *   - `acima_da_faixa`      : o valor é maior que o máximo.
 *   - `sem_faixa_definida`  : o desafio não definiu faixa para esta variável;
 *                             a UI, nesse caso, não mostra avaliação.
 */
export type RangeComparisonState =
  | 'dentro_da_faixa'
  | 'abaixo_da_faixa'
  | 'acima_da_faixa'
  | 'sem_faixa_definida'

/**
 * Uma faixa já expressa em valores absolutos (números), com extremos
 * OPCIONAIS. Serve para casos em que só existe piso ou só teto. Quando um
 * extremo é `undefined`, ele é tratado como ilimitado naquele lado.
 */
export interface NumericRange {
  min?: number
  max?: number
}

/**
 * Compara um valor absoluto contra uma faixa numérica (já normalizada).
 * Os limites são INCLUSIVOS: um valor exatamente igual ao mínimo ou ao
 * máximo é considerado `dentro_da_faixa`.
 *
 * Ordem de avaliação:
 *   1. Sem `min` nem `max` -> `sem_faixa_definida`.
 *   2. Abaixo do `min`     -> `abaixo_da_faixa`.
 *   3. Acima do `max`      -> `acima_da_faixa`.
 *   4. Caso contrário      -> `dentro_da_faixa`.
 *
 * Observação sobre ponto flutuante: os valores que entram aqui vêm de
 * `normalizeAmount`, que produz inteiros exatos para entradas de até uma
 * casa decimal. Por isso a comparação direta (`<`, `>`) é segura nos
 * limites; não é preciso epsilon.
 *
 * @param value Valor absoluto a avaliar.
 * @param range Faixa numérica com `min`/`max` opcionais (ou `undefined`).
 */
export function compareToNumericRange(
  value: number,
  range: NumericRange | undefined,
): RangeComparisonState {
  if (!range || (range.min === undefined && range.max === undefined)) {
    return 'sem_faixa_definida'
  }

  if (range.min !== undefined && value < range.min) {
    return 'abaixo_da_faixa'
  }

  if (range.max !== undefined && value > range.max) {
    return 'acima_da_faixa'
  }

  return 'dentro_da_faixa'
}

/**
 * Compara um valor JÁ NORMALIZADO (valor absoluto) contra uma faixa vinda do
 * schema (`QuantityRange`, com extremos no formato `{ amount, magnitude }`).
 * Normaliza os extremos internamente e delega para `compareToNumericRange`.
 *
 * Passe `undefined` como `range` quando a variável não tiver faixa definida
 * (ex.: `GuidedStep.acceptableRange` ausente) — o retorno será
 * `sem_faixa_definida`.
 *
 * @param normalizedValue Valor absoluto do usuário (ver `normalizeQuantity`).
 * @param range Faixa do desafio, ou `undefined` se não houver.
 */
export function compareToRange(
  normalizedValue: number,
  range: QuantityRange | undefined,
): RangeComparisonState {
  if (!range) {
    return 'sem_faixa_definida'
  }

  return compareToNumericRange(normalizedValue, {
    min: normalizeQuantity(range.min),
    max: normalizeQuantity(range.max),
  })
}

/**
 * Atalho de conveniência: compara uma estimativa no formato `Quantity`
 * (a forma direta do input) contra uma faixa do schema, normalizando os
 * dois lados de uma vez. Útil quando o consumidor ainda tem o `Quantity`
 * cru em mãos e não quer normalizar manualmente antes.
 *
 * @param estimate Estimativa do usuário `{ amount, magnitude }`.
 * @param range Faixa do desafio, ou `undefined` se não houver.
 */
export function compareQuantityToRange(
  estimate: Quantity,
  range: QuantityRange | undefined,
): RangeComparisonState {
  return compareToRange(normalizeQuantity(estimate), range)
}
