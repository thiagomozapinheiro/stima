/**
 * CÁLCULO AUTOMÁTICO DA ESTIMATIVA A PARTIR DAS PREMISSAS DO MODO GUIADO.
 * =====================================================================
 * Muita gente gosta de brincar de estimar mas trava na hora de montar a
 * conta final a partir das premissas que preencheu. Esta lógica resolve
 * isso: combina os valores que a pessoa já colocou em cada microetapa do
 * modo guiado seguindo a MESMA fórmula mostrada em "Estrutura construída"
 * (`GuidedMode.formula`), devolvendo o valor final pronto — sem a pessoa
 * precisar fazer a conta na mão.
 *
 * Cada linha da fórmula (`FormulaLine`) participa do cálculo, em ordem,
 * multiplicando ou dividindo um acumulador. O VALOR de cada linha vem de
 * uma de duas fontes:
 *   - a próxima microetapa ainda não consumida (na ordem em que aparecem em
 *     `GuidedMode.stages[].steps[]`, achatada) — é o caso padrão, quando a
 *     linha NÃO tem `constant` definido;
 *   - um fator FIXO (`FormulaLine.constant`) quando a linha representa uma
 *     conversão que não veio de nenhuma etapa preenchida pela pessoa — por
 *     exemplo, ×365 para transformar uma premissa "por dia" numa resposta
 *     "por ano", ou ×2 para "embarque e desembarque". É assim que o cálculo
 *     automático lida com premissas num período diferente da pergunta
 *     final: quem escreve o desafio expressa a conversão como uma linha de
 *     fórmula com `constant`, em vez de o motor tentar adivinhar unidades.
 *
 * Se qualquer microetapa referenciada por uma linha não-constante ainda não
 * foi preenchida, o cálculo não é possível — ver o estado
 * `faltam_premissas`. A tradução desse estado em mensagem pedagógica para a
 * pessoa é responsabilidade da camada de apresentação (`challengeDisplay.ts`
 * ou o próprio container), não deste arquivo.
 * =====================================================================
 */

import type { FormulaLine } from '../types/challenge'

/**
 * Estado do cálculo automático. Chaves NEUTRAS (sem "errado"/"inválido"),
 * na mesma linha da avaliação pedagógica do resto do produto.
 *   - `ok`                 : cálculo concluído; `value` é o valor absoluto.
 *   - `faltam_premissas`   : uma ou mais microetapas usadas na fórmula ainda
 *                            não foram preenchidas com um número válido.
 *   - `divisao_por_zero`   : uma linha "÷" tentou dividir por zero (ex.:
 *                            uma etapa legitimamente preenchida com 0).
 *   - `sem_formula`        : o desafio não define `guided.formula` — não há
 *                            como calcular automaticamente (a UI não deve
 *                            nem oferecer o botão nesse caso).
 */
export type GuidedCalculationState =
  | { status: 'ok'; value: number }
  | { status: 'faltam_premissas' }
  | { status: 'divisao_por_zero' }
  | { status: 'sem_formula' }

/**
 * Calcula o valor final a partir das premissas preenchidas no modo guiado.
 *
 * @param lines Linhas de `GuidedMode.formula.lines`, na ordem exibida.
 *   `undefined`/vazio quando o desafio não tem fórmula computável.
 * @param stepValues Valores JÁ NORMALIZADOS (ver `normalizeAmount`) de cada
 *   microetapa, na MESMA ORDEM em que aparecem em `stages[].steps[]`
 *   (achatada). Use `undefined` para uma etapa ainda não preenchida com um
 *   número válido.
 */
/**
 * Converte o valor NORMALIZADO de uma microetapa para a forma que a
 * fórmula espera antes de entrar em `computeGuidedEstimate`.
 *
 * A única conversão necessária hoje: microetapas com `unit === '%'` são
 * preenchidas pela pessoa como um número de 0 a 100 (ex.: "20" para
 * representar 20%) — é esse mesmo número que é comparado contra
 * `acceptableRange` (que também usa 15/25, não 0,15/0,25). Mas dentro de
 * uma fórmula multiplicativa, "20%" precisa entrar como a FRAÇÃO 0,20, não
 * como 20 — senão o resultado fica 100× maior que o esperado. Por isso
 * dividimos por 100 só quando a unidade da etapa é "%"; qualquer outra
 * unidade usa o valor normalizado como está.
 */
export function toFormulaValue(normalizedValue: number, unit: string | undefined): number {
  return unit === '%' ? normalizedValue / 100 : normalizedValue
}

export function computeGuidedEstimate(
  lines: FormulaLine[] | undefined,
  stepValues: Array<number | undefined>,
): GuidedCalculationState {
  if (!lines || lines.length === 0) {
    return { status: 'sem_formula' }
  }

  let accumulator: number | undefined
  let stepCursor = 0

  for (const line of lines) {
    let lineValue: number
    if (line.constant !== undefined) {
      lineValue = line.constant
    } else {
      const value = stepValues[stepCursor]
      stepCursor += 1
      if (value === undefined) {
        return { status: 'faltam_premissas' }
      }
      lineValue = value
    }

    if (accumulator === undefined) {
      // Primeira linha (operator === "") apenas inicia o acumulador.
      accumulator = lineValue
      continue
    }

    if (line.operator === '÷') {
      if (lineValue === 0) {
        return { status: 'divisao_por_zero' }
      }
      accumulator = accumulator / lineValue
    } else {
      // Qualquer operador que não seja "÷" multiplica — hoje só "×" é
      // usado além da linha inicial, mas isso mantém o motor tolerante a
      // linhas puramente decorativas (ver doc de `FormulaLine.operator`).
      accumulator = accumulator * lineValue
    }
  }

  if (accumulator === undefined) {
    return { status: 'sem_formula' }
  }

  return { status: 'ok', value: accumulator }
}
