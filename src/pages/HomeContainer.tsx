import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import HomePage, { type TodayCardDisplay } from './HomePage'
import { challenges, getChallengesByDate } from '../data'
import type { ChallengeLevel } from '../types/challenge'
import { useProgress } from '../state/useProgress'
import { formatFullDateLabel } from '../lib/formatDate'

const LEVEL_DOT_COUNT: Record<ChallengeLevel, number> = {
  Iniciante: 1,
  Interessado: 2,
  Expert: 3,
}

/**
 * Conecta a `HomePage` (apresentacional) aos dados reais.
 *
 * "Desafio do dia" = o lote de desafios com a `publishedAt` mais recente
 * entre todos os cadastrados. `challenges` (src/data/index.ts) já vem
 * ordenada da mais recente para a mais antiga, então `challenges[0]` define
 * a data de hoje. Não existe (ainda) uma noção de "data do relógio real"
 * separada do conteúdo publicado — isso deixaria desafios sem "hoje" nos
 * dias em que nada for publicado, então preferimos ancorar no mais recente.
 */
export default function HomeContainer() {
  const navigate = useNavigate()
  const { isSolved, streak } = useProgress()

  const latestPublishedAt = challenges[0]?.publishedAt
  const todayChallenges = useMemo(
    () => (latestPublishedAt ? getChallengesByDate(latestPublishedAt) : []),
    [latestPublishedAt],
  )

  const todayCards: TodayCardDisplay[] = todayChallenges.map((challenge) => ({
    id: challenge.id,
    level: challenge.level,
    title: challenge.title,
    teaser: challenge.teaser,
    solved: isSolved(challenge.id),
    dots: [1, 2, 3].map((i) => ({ on: i <= LEVEL_DOT_COUNT[challenge.level] })),
    onOpen: () => navigate(`/desafio/${challenge.id}`),
  }))

  const solvedTodayCount = todayCards.filter((card) => card.solved).length

  return (
    <HomePage
      todayDateLabel={latestPublishedAt ? formatFullDateLabel(latestPublishedAt) : ''}
      todayTheme={todayChallenges[0]?.theme ?? ''}
      solvedTodayCount={solvedTodayCount}
      totalTodayCount={todayCards.length}
      todayCards={todayCards}
      onGoArchive={() => navigate('/arquivo')}
      streak={streak}
    />
  )
}
