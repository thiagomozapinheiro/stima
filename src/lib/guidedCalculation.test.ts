import { describe, it, expect } from 'vitest'
import { computeGuidedEstimate, toFormulaValue } from './guidedCalculation'
import type { FormulaLine } from '../types/challenge'

describe('toFormulaValue — etapas em "%" viram fração para a fórmula', () => {
  it('converte 20 (unit "%") para 0,2', () => {
    expect(toFormulaValue(20, '%')).toBe(0.2)
  })

  it('não altera valores de outras unidades', () => {
    expect(toFormulaValue(210_000_000, 'pessoas')).toBe(210_000_000)
    expect(toFormulaValue(3, 'trechos/ano')).toBe(3)
  })

  it('não altera valores sem unidade definida', () => {
    expect(toFormulaValue(42, undefined)).toBe(42)
  })
})

describe('computeGuidedEstimate — cadeia simples de multiplicação', () => {
  // Espelha "Corridas de aplicativo em São Paulo": população × % ativos × corridas/usuário.
  const lines: FormulaLine[] = [
    { operator: '', text: 'população da cidade' },
    { operator: '×', text: '% de usuários ativos' },
    { operator: '×', text: 'corridas por usuário/dia' },
  ]

  it('calcula corretamente com todas as premissas preenchidas', () => {
    const result = computeGuidedEstimate(lines, [12_000_000, 0.25, 0.4])
    expect(result).toEqual({ status: 'ok', value: 1_200_000 })
  })

  it('sinaliza faltam_premissas quando uma etapa está em branco (undefined)', () => {
    const result = computeGuidedEstimate(lines, [12_000_000, undefined, 0.4])
    expect(result).toEqual({ status: 'faltam_premissas' })
  })

  it('sinaliza faltam_premissas quando faltam etapas no fim do array', () => {
    const result = computeGuidedEstimate(lines, [12_000_000, 0.25])
    expect(result).toEqual({ status: 'faltam_premissas' })
  })

  it('sinaliza faltam_premissas com array totalmente vazio', () => {
    const result = computeGuidedEstimate(lines, [])
    expect(result).toEqual({ status: 'faltam_premissas' })
  })
})

describe('computeGuidedEstimate — divisão', () => {
  // Espelha "Diesel consumido pelos ônibus": frota × km/dia ÷ km/litro.
  const lines: FormulaLine[] = [
    { operator: '', text: 'frota de ônibus' },
    { operator: '×', text: 'km por ônibus/dia' },
    { operator: '÷', text: 'km por litro' },
  ]

  it('calcula corretamente com divisão', () => {
    const result = computeGuidedEstimate(lines, [14_000, 200, 2.5])
    expect(result).toEqual({ status: 'ok', value: 1_120_000 })
  })

  it('sinaliza divisao_por_zero quando o divisor é zero', () => {
    const result = computeGuidedEstimate(lines, [14_000, 200, 0])
    expect(result).toEqual({ status: 'divisao_por_zero' })
  })
})

describe('computeGuidedEstimate — linhas com fator constante (conversão de unidade)', () => {
  // Espelha "Passageiros nos aeroportos do Brasil": população × % voa × trechos/ano × 2 (constante).
  const lines: FormulaLine[] = [
    { operator: '', text: 'população do Brasil' },
    { operator: '×', text: '% que voa pelo menos uma vez ao ano' },
    { operator: '×', text: 'trechos de voo por pessoa/ano' },
    { operator: '×', text: '2 passagens por trecho (embarque e desembarque)', constant: 2 },
  ]

  it('usa o constant sem exigir uma etapa preenchida para essa linha', () => {
    const result = computeGuidedEstimate(lines, [210_000_000, 0.2, 3])
    expect(result).toEqual({ status: 'ok', value: 252_000_000 })
  })

  it('uma conversão dia -> ano (×365) funciona como constant', () => {
    const dayToYear: FormulaLine[] = [
      { operator: '', text: 'litros por dia' },
      { operator: '×', text: 'dias no ano', constant: 365 },
    ]
    const result = computeGuidedEstimate(dayToYear, [1_000])
    expect(result).toEqual({ status: 'ok', value: 365_000 })
  })

  it('ainda sinaliza faltam_premissas se uma etapa normal (não-constante) faltar', () => {
    const result = computeGuidedEstimate(lines, [210_000_000, undefined, 3])
    expect(result).toEqual({ status: 'faltam_premissas' })
  })
})

describe('computeGuidedEstimate — casos-limite', () => {
  it('sinaliza sem_formula quando lines é undefined', () => {
    expect(computeGuidedEstimate(undefined, [1, 2])).toEqual({ status: 'sem_formula' })
  })

  it('sinaliza sem_formula quando lines é um array vazio', () => {
    expect(computeGuidedEstimate([], [1, 2])).toEqual({ status: 'sem_formula' })
  })

  it('funciona com uma única linha (sem operador de combinação)', () => {
    const lines: FormulaLine[] = [{ operator: '', text: 'valor único' }]
    expect(computeGuidedEstimate(lines, [42])).toEqual({ status: 'ok', value: 42 })
  })

  it('etapas preenchidas além das usadas pela fórmula são ignoradas', () => {
    const lines: FormulaLine[] = [
      { operator: '', text: 'a' },
      { operator: '×', text: 'b' },
    ]
    const result = computeGuidedEstimate(lines, [10, 5, 999])
    expect(result).toEqual({ status: 'ok', value: 50 })
  })
})
