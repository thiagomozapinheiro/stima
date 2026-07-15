import type { CSSProperties, KeyboardEvent } from 'react'

function handleActivateKey(onActivate: () => void) {
  return (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onActivate()
    }
  }
}

export interface FilterPillDisplay {
  label: string
  active: boolean
  onSelect: () => void
}

export interface ArchiveCardDisplay {
  id: string
  title: string
  theme: string
  level: string
  dateShort: string
  solved: boolean
  onOpen: () => void
}

/**
 * PROPS de apresentação do Archive.
 *
 * TODO: conectar ao schema real (`src/types/challenge.ts`, do agente
 * `data-architect`) e à lógica de filtro (tema/nível/status), que deve
 * ficar a cargo do `ui-builder`. Aqui só recebemos as listas já filtradas
 * e prontas para exibir, tal como os bindings `{{ ... }}` do design
 * original.
 */
export interface ArchivePageProps {
  statusPills: FilterPillDisplay[]
  themePills: FilterPillDisplay[]
  levelPills: FilterPillDisplay[]
  archiveList: ArchiveCardDisplay[]
  /** true quando os filtros não retornam nenhum desafio. */
  isEmpty: boolean
}

/**
 * Tela "Outros Desafios" (archive). Réplica visual da seção
 * <!-- ARCHIVE --> do design original.
 */
export default function ArchivePage({
  statusPills,
  themePills,
  levelPills,
  archiveList,
  isEmpty,
}: ArchivePageProps) {
  return (
    <main className="stima-archive-main" style={styles.main}>
      <h1 className="stima-archive-title" style={styles.title}>
        Outros Desafios
      </h1>
      <p className="stima-archive-subtitle" style={styles.subtitle}>
        Todos os desafios anteriores. Filtre por tema, nível ou pelo que você ainda não resolveu.
      </p>

      <div className="stima-archive-filters-col" style={styles.filtersCol}>
        <FilterRow label="Status" pills={statusPills} />
        <FilterRow label="Tema" pills={themePills} />
        <FilterRow label="Nível" pills={levelPills} />
      </div>

      <div className="stima-archive-grid" style={styles.grid}>
        {archiveList.map((c) => (
          <div
            key={c.id}
            onClick={c.onOpen}
            role="button"
            tabIndex={0}
            onKeyDown={handleActivateKey(c.onOpen)}
            className="stima-archive-card"
            style={{
              ...styles.card,
              borderColor: c.solved ? 'var(--border-strong)' : 'var(--border)',
            }}
          >
            <div style={styles.cardTopRow}>
              <span style={styles.cardDate}>{c.dateShort}</span>
              {c.solved && <span style={styles.solvedTag}>✓ Resolvido</span>}
            </div>
            <h3 style={styles.cardTitle}>{c.title}</h3>
            <div style={styles.tagsRow}>
              <span style={styles.themeTag}>{c.theme}</span>
              <span style={styles.levelTag}>{c.level}</span>
            </div>
          </div>
        ))}
      </div>

      {isEmpty && <div style={styles.emptyState}>Nenhum desafio encontrado com esses filtros.</div>}
    </main>
  )
}

function FilterRow({ label, pills }: { label: string; pills: FilterPillDisplay[] }) {
  return (
    <div className="stima-archive-filter-row" style={styles.filterRow}>
      <span className="stima-archive-filter-label" style={styles.filterLabel}>
        {label}
      </span>
      {pills.map((p) => (
        <button
          key={p.label}
          onClick={p.onSelect}
          className="stima-archive-pill"
          style={{
            ...styles.pill,
            borderColor: p.active ? 'var(--accent)' : 'var(--border)',
            background: p.active ? 'var(--accent)' : 'var(--card)',
            color: p.active ? 'var(--on-accent)' : 'var(--text-2)',
          }}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  main: { maxWidth: 1120, margin: '0 auto', padding: '48px 28px 90px' },
  title: { fontSize: 44, fontWeight: 700, marginBottom: 10 },
  subtitle: { fontSize: 16.5, color: 'var(--text-2)', maxWidth: 560, margin: '0 0 34px' },
  filtersCol: { display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 },
  filterRow: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  filterLabel: { fontSize: 13, color: 'var(--dim)', fontWeight: 600, width: 58 },
  pill: {
    border: '1px solid',
    borderRadius: 999,
    padding: '8px 15px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all .15s',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 },
  card: {
    background: 'var(--card)',
    border: '1px solid',
    borderRadius: 16,
    padding: 22,
    cursor: 'pointer',
    transition: 'transform .18s, border-color .18s',
  },
  cardTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardDate: { fontSize: 12, color: 'var(--faint)' },
  solvedTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    color: 'var(--accent)',
    fontSize: 12,
    fontWeight: 600,
  },
  cardTitle: { fontSize: 18, fontWeight: 600, lineHeight: 1.2, marginBottom: 14, minHeight: 44 },
  tagsRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  themeTag: {
    background: 'var(--accent-chip)',
    color: 'var(--accent)',
    fontSize: 12,
    fontWeight: 600,
    padding: '5px 11px',
    borderRadius: 999,
  },
  levelTag: {
    background: 'var(--bg)',
    color: 'var(--dim)',
    fontSize: 12,
    fontWeight: 600,
    padding: '5px 11px',
    borderRadius: 999,
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 0',
    color: 'var(--faint)',
    fontSize: 16,
  },
}
