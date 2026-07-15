import { describe, it, expect } from 'vitest'
import type { Magnitude } from '../types/challenge'
import {
  parseAmountInput,
  normalizeAmount,
  normalizeQuantity,
  isMagnitude,
  MAGNITUDE_MULTIPLIERS,
  MAX_AMOUNT,
} from './numericInput'

describe('parseAmountInput — aceitação', () => {
  it('aceita inteiro simples', () => {
    expect(parseAmountInput('45')).toEqual({ ok: true, value: 45 })
  })

  it('aceita separador decimal por vírgula', () => {
    expect(parseAmountInput('125,5')).toEqual({ ok: true, value: 125.5 })
  })

  it('aceita separador decimal por ponto', () => {
    expect(parseAmountInput('125.5')).toEqual({ ok: true, value: 125.5 })
  })

  it('apara espaços nas bordas', () => {
    expect(parseAmountInput('  2,3  ')).toEqual({ ok: true, value: 2.3 })
  })

  it('aceita o mínimo 0', () => {
    expect(parseAmountInput('0')).toEqual({ ok: true, value: 0 })
  })

  it('aceita 0,0', () => {
    expect(parseAmountInput('0,0')).toEqual({ ok: true, value: 0 })
  })

  it('aceita o máximo exato 999,9', () => {
    expect(parseAmountInput('999,9')).toEqual({ ok: true, value: 999.9 })
  })
})

describe('parseAmountInput — rejeição (motivos neutros)', () => {
  it('campo vazio', () => {
    expect(parseAmountInput('')).toEqual({ ok: false, reason: 'vazio' })
  })

  it('só espaços é tratado como vazio', () => {
    expect(parseAmountInput('   ')).toEqual({ ok: false, reason: 'vazio' })
  })

  it('negativo explícito', () => {
    expect(parseAmountInput('-5')).toEqual({ ok: false, reason: 'negativo' })
  })

  it('acima do máximo 999,9', () => {
    expect(parseAmountInput('1000')).toEqual({ ok: false, reason: 'acima_do_maximo' })
  })

  it('logo acima do máximo (1000,0)', () => {
    expect(parseAmountInput('1000,0')).toEqual({ ok: false, reason: 'acima_do_maximo' })
  })

  it('mais de uma casa decimal', () => {
    expect(parseAmountInput('12,34')).toEqual({
      ok: false,
      reason: 'casas_decimais_em_excesso',
    })
  })

  it('caractere inválido (letra)', () => {
    expect(parseAmountInput('12a')).toEqual({ ok: false, reason: 'caractere_invalido' })
  })

  it('caractere inválido (símbolo de porcentagem)', () => {
    expect(parseAmountInput('50%')).toEqual({ ok: false, reason: 'caractere_invalido' })
  })

  it('dois separadores decimais é formato inválido', () => {
    expect(parseAmountInput('1,2,3')).toEqual({ ok: false, reason: 'formato_invalido' })
  })

  it('começar com separador é formato inválido', () => {
    expect(parseAmountInput(',5')).toEqual({ ok: false, reason: 'formato_invalido' })
  })
})

describe('normalizeAmount — exemplos canônicos da especificação', () => {
  it('125,5 milhões = 125.500.000', () => {
    expect(normalizeAmount(125.5, 'milhoes')).toBe(125_500_000)
  })

  it('2,3 bilhões = 2.300.000.000', () => {
    expect(normalizeAmount(2.3, 'bilhoes')).toBe(2_300_000_000)
  })

  it('800 mil = 800.000', () => {
    expect(normalizeAmount(800, 'mil')).toBe(800_000)
  })

  it('45 unidades = 45', () => {
    expect(normalizeAmount(45, 'unidades')).toBe(45)
  })
})

describe('normalizeAmount — robustez de ponto flutuante e limites', () => {
  it('resultado é sempre um inteiro exato para uma casa decimal', () => {
    for (const magnitude of Object.keys(MAGNITUDE_MULTIPLIERS) as Magnitude[]) {
      const result = normalizeAmount(1.1, magnitude)
      // Para 'unidades' o valor é 1.1 (não inteiro); para o resto, inteiro.
      if (magnitude === 'unidades') {
        expect(result).toBeCloseTo(1.1, 10)
      } else {
        expect(Number.isInteger(result)).toBe(true)
      }
    }
  })

  it('0,0 em qualquer ordem é 0', () => {
    expect(normalizeAmount(0, 'trilhoes')).toBe(0)
  })

  it('máximo 999,9 trilhões', () => {
    expect(normalizeAmount(MAX_AMOUNT, 'trilhoes')).toBe(999_900_000_000_000)
  })

  it('7,7 milhões evita ruído binário', () => {
    expect(normalizeAmount(7.7, 'milhoes')).toBe(7_700_000)
  })
})

describe('normalizeQuantity — a partir do formato do schema', () => {
  it('{ amount: 1.6, magnitude: milhoes } = 1.600.000', () => {
    expect(normalizeQuantity({ amount: 1.6, magnitude: 'milhoes' })).toBe(1_600_000)
  })

  it('{ amount: 800, magnitude: mil } = 800.000', () => {
    expect(normalizeQuantity({ amount: 800, magnitude: 'mil' })).toBe(800_000)
  })
})

describe('isMagnitude', () => {
  it('reconhece chaves válidas', () => {
    expect(isMagnitude('milhoes')).toBe(true)
    expect(isMagnitude('unidades')).toBe(true)
  })

  it('recusa chaves inválidas (inclusive com acento)', () => {
    expect(isMagnitude('milhões')).toBe(false)
    expect(isMagnitude('centenas')).toBe(false)
  })
})
