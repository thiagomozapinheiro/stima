import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ArchivePage, { type ArchiveCardDisplay, type FilterPillDisplay } from './ArchivePage'
import { challenges } from '../data'
import { useProgress } from '../state/useProgress'
import { formatShortDateLabel } from '../lib/formatDate'

const ALL = 'Todos'
const LEVEL_OPTIONS = [ALL, 'Iniciante', 'Interessado', 'Expert']
const STATUS_OPTIONS = [ALL, 'Não resolvido', 'Resolvido']

function buildPills(
  options: string[],
  active: string,
  onSelect: (value: string) => void,
): FilterPillDisplay[] {
  return options.map((label) => ({ label, active: label === active, onSelect: () => onSelect(label) }))
}

/**
 * Conecta a `ArchivePage` (apresentacional) aos dados reais.
 *
 * Mostra TODOS os desafios cadastrados (inclusive os do dia mais recente) —
 * o mesmo comportamento do protótipo original: "Outros Desafios" é o
 * catálogo completo, filtrável por tema, nível e status de resolução.
 */
export default function ArchiveContainer() {
  const navigate = useNavigate()
  const { isSolved } = useProgress()

  const [themeFilter, setThemeFilter] = useState(ALL)
  const [levelFilter, setLevelFilter] = useState(ALL)
  const [statusFilter, setStatusFilter] = useState(ALL)

  const themeOptions = useMemo(
    () => [ALL, ...Array.from(new Set(challenges.map((c) => c.theme)))],
    [],
  )

  const filtered = challenges.filter((challenge) => {
    const solved = isSolved(challenge.id)
    return (
      (themeFilter === ALL || challenge.theme === themeFilter) &&
      (levelFilter === ALL || challenge.level === levelFilter) &&
      (statusFilter === ALL ||
        (statusFilter === 'Resolvido' && solved) ||
        (statusFilter === 'Não resolvido' && !solved))
    )
  })

  const archiveList: ArchiveCardDisplay[] = filtered.map((challenge) => ({
    id: challenge.id,
    title: challenge.title,
    theme: challenge.theme,
    level: challenge.level,
    dateShort: formatShortDateLabel(challenge.publishedAt),
    solved: isSolved(challenge.id),
    onOpen: () => navigate(`/desafio/${challenge.id}`),
  }))

  return (
    <ArchivePage
      statusPills={buildPills(STATUS_OPTIONS, statusFilter, setStatusFilter)}
      themePills={buildPills(themeOptions, themeFilter, setThemeFilter)}
      levelPills={buildPills(LEVEL_OPTIONS, levelFilter, setLevelFilter)}
      archiveList={archiveList}
      isEmpty={archiveList.length === 0}
    />
  )
}
