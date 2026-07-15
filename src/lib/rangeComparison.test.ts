import { describe, it, expect } from 'vitest'
import type { QuantityRange } from '../types/challenge'
import {
  compareToRange,
  compareToNumericRange,
  compareQuantityToRange,
} from './rangeComparison'
import { normalizeQuantity } from './numericInput'

// Faixa de exemplo: 100 mil a 200 mil (valores absolutos 100.000 a 200.000).
const range: QuantityRange = {
  min: { amount: 100, magnitude: 'mil' },
  max: { amount: 200, magnitude: 'mil' },
}

describe('compareToRange — posição relativa à faixa', () => {
  it('valor no meio da faixa está dentro', () => {
    expect(compareToRange(150_000, range)).toBe('dentro_da_faixa')
  })

  it('valor abaixo do mínimo', () => {
    expect(compareToRange(99_999, range)).toBe('abaixo_da_faixa')
  })

  it('valor acima do máximo', () => {
    expect(compareToRange(200_001, range)).toBe('acima_da_faixa')
  })
})

describe('compareToRange — limites INCLUSIVOS', () => {
  it('valor exatamente no mínimo está dentro', () => {
    expect(compareToRange(100_000, range)).toBe('dentro_da_faixa')
  })

  it('valor exatamente no máximo está dentro', () => {
    expect(compareToRange(200_000, range)).toBe('dentro_da_faixa')
  })

  it('valor logo abaixo do mínimo fica de fora', () => {
    expect(compareToRange(99_999.9, range)).toBe('abaixo_da_faixa')
  })

  it('valor logo acima do máximo fica de fora', () => {
    expect(compareToRange(200_000.1, range)).toBe('acima_da_faixa')
  })
})

describe('compareToRange — faixa ausente', () => {
  it('range undefined retorna sem_faixa_definida', () => {
    expect(compareToRange(150_000, undefined)).toBe('sem_faixa_definida')
  })
})

describe('compareToRange — integração com normalizeQuantity', () => {
  it('estimativa normalizada exatamente no mínimo da faixa', () => {
    const value = normalizeQuantity({ amount: 100, magnitude: 'mil' })
    expect(compareToRange(value, range)).toBe('dentro_da_faixa')
  })

  it('faixa em milhões com estimativa em bilhões acima do teto', () => {
    const bigRange: QuantityRange = {
      min: { amount: 500, magnitude: 'milhoes' },
      max: { amount: 800, magnitude: 'milhoes' },
    }
    const value = normalizeQuantity({ amount: 1, magnitude: 'bilhoes' })
    expect(compareToRange(value, bigRange)).toBe('acima_da_faixa')
  })
})

describe('compareToNumericRange — extremos opcionais', () => {
  it('sem min nem max é sem_faixa_definida', () => {
    expect(compareToNumericRange(10, {})).toBe('sem_faixa_definida')
    expect(compareToNumericRange(10, undefined)).toBe('sem_faixa_definida')
  })

  it('somente teto (max) definido', () => {
    expect(compareToNumericRange(10, { max: 20 })).toBe('dentro_da_faixa')
    expect(compareToNumericRange(20, { max: 20 })).toBe('dentro_da_faixa')
    expect(compareToNumericRange(21, { max: 20 })).toBe('acima_da_faixa')
  })

  it('somente piso (min) definido', () => {
    expect(compareToNumericRange(10, { min: 5 })).toBe('dentro_da_faixa')
    expect(compareToNumericRange(5, { min: 5 })).toBe('dentro_da_faixa')
    expect(compareToNumericRange(4, { min: 5 })).toBe('abaixo_da_faixa')
  })
})

describe('compareQuantityToRange — atalho a partir de Quantity', () => {
  it('normaliza a estimativa e compara', () => {
    expect(
      compareQuantityToRange({ amount: 150, magnitude: 'mil' }, range),
    ).toBe('dentro_da_faixa')
  })

  it('sem faixa retorna sem_faixa_definida', () => {
    expect(
      compareQuantityToRange({ amount: 150, magnitude: 'mil' }, undefined),
    ).toBe('sem_faixa_definida')
  })
})
