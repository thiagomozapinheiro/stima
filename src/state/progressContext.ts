import { createContext } from 'react'

/**
 * Progresso de desafios resolvidos pelo usuário (quais `Challenge.id` já
 * tiveram a resposta checada), o histórico de chutes e o streak de dias
 * ativos. O `Provider` fica em `ProgressProvider.tsx` e o hook de leitura em
 * `useProgress.ts` — este arquivo só define o contexto em si, separado dos
 * componentes (evita quebrar o Fast Refresh).
 *
 * Este contexto é o ÚNICO ponto de integração da UI com a persistência
 * (`src/lib/storage.ts`): nenhum componente deve importar `src/lib/storage.ts`
 * diretamente, só usar `useProgress()`.
 */
export interface ProgressContextValue {
  isSolved: (challengeId: string) => boolean
  /** Marca um desafio como resolvido e persiste (idempotente). */
  markSolved: (challengeId: string) => void
  /** Registra um chute (valor já normalizado) no histórico persistido do desafio. */
  recordGuess: (challengeId: string, normalizedValue: number) => void
  /** Nº de dias seguidos (até hoje ou ontem) com pelo menos um desafio resolvido. */
  streak: number
  /** Valor absoluto do último chute registrado para um desafio, ou `undefined` se nunca houve chute. */
  getLastGuess: (challengeId: string) => number | undefined
}

export const ProgressContext = createContext<ProgressContextValue | undefined>(undefined)
