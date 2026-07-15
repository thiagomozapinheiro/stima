/**
 * Carregador central dos desafios.
 * =====================================================================
 * Cada desafio vive em seu próprio arquivo em `src/data/challenges/*.json`.
 * Este módulo descobre TODOS esses arquivos automaticamente (via Vite) —
 * você NÃO precisa registrar cada novo desafio aqui. Basta adicionar (ou
 * remover) um arquivo `.json` na pasta `challenges/` e ele entra (ou sai)
 * da lista.
 *
 * A validação da FORMA dos dados é feita pelo TypeScript através do tipo
 * `Challenge` (src/types/challenge.ts).
 * =====================================================================
 */
import type { Challenge } from '../types/challenge'

// `import.meta.glob(..., { eager: true })` é um recurso do Vite: no momento
// do build ele injeta aqui, já importados, todos os JSON da pasta.
const modules = import.meta.glob('./challenges/*.json', { eager: true }) as unknown as Record<
  string,
  { default: Challenge }
>

/** Todos os desafios, do mais recente para o mais antigo (por data de publicação). */
export const challenges: Challenge[] = Object.values(modules)
  .map((mod) => mod.default)
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))

/** Busca um desafio pelo seu `id`. Retorna `undefined` se não existir. */
export function getChallengeById(id: string): Challenge | undefined {
  return challenges.find((challenge) => challenge.id === id)
}

/** Lista de desafios publicados numa data ("AAAA-MM-DD"), na ordem dos níveis. */
export function getChallengesByDate(publishedAt: string): Challenge[] {
  const order: Record<Challenge['level'], number> = {
    Iniciante: 0,
    Interessado: 1,
    Expert: 2,
  }
  return challenges
    .filter((challenge) => challenge.publishedAt === publishedAt)
    .sort((a, b) => order[a.level] - order[b.level])
}
