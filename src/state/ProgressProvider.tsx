import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { ProgressContext } from './progressContext'
import {
  getLastGuess,
  getSolvedChallengeIds,
  getStreak,
  markChallengeSolved,
  recordGuess as persistGuess,
} from '../lib/storage'

/**
 * Provedor do progresso de desafios resolvidos, compartilhado entre a Home,
 * o Arquivo e a tela de desafio.
 *
 * A fonte de verdade entre visitas é `localStorage`, via `src/lib/storage.ts`
 * (o único módulo autorizado a chamar `localStorage` diretamente). Este
 * provedor:
 *   - hidrata o estado inicial em memória a partir do que já está salvo
 *     (`getSolvedChallengeIds`, `getStreak`), para a Home/Archive já
 *     nascerem corretas na primeira renderização;
 *   - mantém uma cópia em memória (`useState`) para os componentes React
 *     re-renderizarem de forma reativa a cada `markSolved`/`recordGuess`,
 *     sem precisar reler o `localStorage` a cada render;
 *   - grava cada mudança de volta no `localStorage` através de
 *     `src/lib/storage.ts`.
 *
 * Se o `localStorage` estiver indisponível (modo privado, cota excedida,
 * etc.), `src/lib/storage.ts` já degrada graciosamente sozinho (vira no-op),
 * então este provedor continua funcionando normalmente só em memória — a UI
 * nunca quebra por causa disso, só deixa de persistir entre visitas.
 */
export function ProgressProvider({ children }: { children: ReactNode }) {
  const [solvedIds, setSolvedIds] = useState<Set<string>>(() => new Set(getSolvedChallengeIds()))
  const [streak, setStreak] = useState<number>(() => getStreak())

  const markSolved = useCallback((challengeId: string) => {
    setSolvedIds((prev) => {
      if (prev.has(challengeId)) return prev
      const next = new Set(prev)
      next.add(challengeId)
      return next
    })
    // `markChallengeSolved` é idempotente (não duplica `solvedAt`/data no
    // streak em chamadas repetidas), então é seguro chamar sempre, mesmo se
    // o desafio já estava marcado como resolvido nesta sessão.
    markChallengeSolved(challengeId)
    setStreak(getStreak())
  }, [])

  const recordGuess = useCallback((challengeId: string, normalizedValue: number) => {
    persistGuess(challengeId, normalizedValue)
  }, [])

  const isSolved = useCallback((challengeId: string) => solvedIds.has(challengeId), [solvedIds])

  const value = useMemo(
    () => ({ isSolved, markSolved, recordGuess, streak, getLastGuess }),
    [isSolved, markSolved, recordGuess, streak],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}
