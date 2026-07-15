import { useContext } from 'react'
import { ProgressContext, type ProgressContextValue } from './progressContext'

/** Hook de acesso ao progresso de desafios resolvidos (ver `ProgressContext.tsx`). */
export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext)
  if (!ctx) {
    throw new Error('useProgress precisa ser usado dentro de <ProgressProvider>.')
  }
  return ctx
}
