import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  isChallengeSolved,
  getSolvedChallengeIds,
  markChallengeSolved,
  recordGuess,
  getGuessHistory,
  getStreak,
  isStorageAvailable,
} from './storage'

/**
 * `localStorage` não existe no ambiente de teste (Vitest roda em `node`,
 * sem DOM — ver `vitest.config.ts`). Para testar `storage.ts` de verdade
 * (e não só o caminho de degradação graciosa), simulamos um `Storage` em
 * memória e o instalamos em `globalThis.localStorage` antes de cada teste.
 */
class FakeStorage implements Storage {
  private store = new Map<string, string>()

  get length() {
    return this.store.size
  }

  clear(): void {
    this.store.clear()
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null
  }

  removeItem(key: string): void {
    this.store.delete(key)
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value)
  }
}

/** `Storage` cujo `setItem` sempre lança, simulando cota excedida. */
class ThrowingStorage extends FakeStorage {
  setItem(): never {
    throw new DOMException('QuotaExceededError')
  }
}

function installFakeStorage(storage: Storage) {
  Object.defineProperty(globalThis, 'localStorage', {
    value: storage,
    configurable: true,
    writable: true,
  })
}

function removeStorage() {
  Object.defineProperty(globalThis, 'localStorage', {
    value: undefined,
    configurable: true,
    writable: true,
  })
}

describe('storage — com localStorage disponível', () => {
  beforeEach(() => {
    installFakeStorage(new FakeStorage())
  })

  afterEach(() => {
    removeStorage()
  })

  it('um desafio nunca tocado não está resolvido', () => {
    expect(isChallengeSolved('2026-07-14-iniciante')).toBe(false)
    expect(getSolvedChallengeIds()).toEqual([])
  })

  it('marca um desafio como resolvido e persiste entre leituras', () => {
    markChallengeSolved('2026-07-14-iniciante', new Date('2026-07-14T10:00:00'))
    expect(isChallengeSolved('2026-07-14-iniciante')).toBe(true)
    expect(getSolvedChallengeIds()).toEqual(['2026-07-14-iniciante'])
  })

  it('marcar o mesmo desafio duas vezes é idempotente (não duplica)', () => {
    markChallengeSolved('2026-07-14-iniciante', new Date('2026-07-14T10:00:00'))
    markChallengeSolved('2026-07-14-iniciante', new Date('2026-07-14T11:00:00'))
    expect(getSolvedChallengeIds()).toEqual(['2026-07-14-iniciante'])
  })

  it('registra o histórico de chutes (valor normalizado + timestamp), do mais antigo ao mais novo', () => {
    recordGuess('2026-07-14-iniciante', 1_000_000, new Date('2026-07-14T10:00:00Z'))
    recordGuess('2026-07-14-iniciante', 1_500_000, new Date('2026-07-14T10:05:00Z'))

    const history = getGuessHistory('2026-07-14-iniciante')
    expect(history).toHaveLength(2)
    expect(history[0].value).toBe(1_000_000)
    expect(history[1].value).toBe(1_500_000)
    expect(history[0].timestamp).toBe('2026-07-14T10:00:00.000Z')
  })

  it('desafio sem chutes registrados devolve histórico vazio', () => {
    expect(getGuessHistory('nunca-tocado')).toEqual([])
  })

  it('sem nenhum dia resolvido, o streak é 0', () => {
    expect(getStreak(new Date('2026-07-14T12:00:00'))).toBe(0)
  })

  it('streak conta dias seguidos terminando hoje', () => {
    markChallengeSolved('2026-07-12-iniciante', new Date('2026-07-12T09:00:00'))
    markChallengeSolved('2026-07-13-iniciante', new Date('2026-07-13T09:00:00'))
    markChallengeSolved('2026-07-14-iniciante', new Date('2026-07-14T09:00:00'))

    expect(getStreak(new Date('2026-07-14T18:00:00'))).toBe(3)
  })

  it('streak continua "vivo" se ontem teve desafio resolvido mas hoje ainda não', () => {
    markChallengeSolved('2026-07-13-iniciante', new Date('2026-07-13T09:00:00'))
    expect(getStreak(new Date('2026-07-14T08:00:00'))).toBe(1)
  })

  it('streak quebra se nem ontem nem hoje tiveram desafio resolvido', () => {
    markChallengeSolved('2026-07-10-iniciante', new Date('2026-07-10T09:00:00'))
    expect(getStreak(new Date('2026-07-14T08:00:00'))).toBe(0)
  })

  it('resolver dois desafios no mesmo dia conta como um único dia de streak', () => {
    markChallengeSolved('2026-07-14-iniciante', new Date('2026-07-14T09:00:00'))
    markChallengeSolved('2026-07-14-expert', new Date('2026-07-14T15:00:00'))
    expect(getStreak(new Date('2026-07-14T18:00:00'))).toBe(1)
  })

  it('isStorageAvailable é true quando o storage funciona', () => {
    expect(isStorageAvailable()).toBe(true)
  })

  it('dado corrompido no localStorage não derruba a leitura (degrada para vazio)', () => {
    ;(globalThis.localStorage as Storage).setItem('fermi:v1:progress', '{not valid json')
    expect(isChallengeSolved('qualquer')).toBe(false)
    expect(getSolvedChallengeIds()).toEqual([])
  })

  it('versão desconhecida no localStorage é tratada como sem progresso salvo', () => {
    ;(globalThis.localStorage as Storage).setItem(
      'fermi:v1:progress',
      JSON.stringify({ version: 99, challenges: {}, solvedDates: [] }),
    )
    expect(getSolvedChallengeIds()).toEqual([])
  })
})

describe('storage — degradação graciosa quando localStorage indisponível', () => {
  beforeEach(() => {
    removeStorage()
  })

  it('nenhuma função lança e tudo se comporta como "sem progresso salvo"', () => {
    expect(() => markChallengeSolved('x')).not.toThrow()
    expect(() => recordGuess('x', 10)).not.toThrow()
    expect(isChallengeSolved('x')).toBe(false)
    expect(getSolvedChallengeIds()).toEqual([])
    expect(getGuessHistory('x')).toEqual([])
    expect(getStreak()).toBe(0)
    expect(isStorageAvailable()).toBe(false)
  })
})

describe('storage — degradação graciosa quando setItem lança (ex.: cota excedida)', () => {
  beforeEach(() => {
    installFakeStorage(new ThrowingStorage())
  })

  afterEach(() => {
    removeStorage()
  })

  it('markChallengeSolved não lança e a leitura simplesmente não reflete a escrita', () => {
    expect(() => markChallengeSolved('x')).not.toThrow()
    // A escrita falhou silenciosamente; sem persistência, a leitura seguinte
    // (que também usa o mesmo storage que sempre falha) não vê nada salvo.
    expect(isChallengeSolved('x')).toBe(false)
  })

  it('isStorageAvailable detecta que a escrita não funciona', () => {
    expect(isStorageAvailable()).toBe(false)
  })
})
