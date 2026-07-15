import type { CSSProperties, KeyboardEvent } from 'react'

function handleActivateKey(onActivate: () => void) {
  return (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onActivate()
    }
  }
}

export interface TodayCardDisplay {
  id: string
  level: string
  title: string
  teaser: string
  /** true = já resolvido pelo usuário. */
  solved: boolean
  /** 3 pontinhos indicando o nível (Iniciante/Interessado/Expert) já calculados. */
  dots: { on: boolean }[]
  onOpen: () => void
}

/**
 * PROPS de apresentação da Home.
 *
 * TODO: conectar ao schema real (`src/types/challenge.ts`, do agente
 * `data-architect`) e aos dados de `src/data/`. Os campos abaixo são
 * genéricos e espelham os bindings dinâmicos do design original
 * (`{{ todayTheme }}`, `{{ todayCards }}`, etc.).
 */
export interface HomePageProps {
  todayDateLabel: string
  todayTheme: string
  solvedTodayCount: number
  /** Total de desafios do dia (o design usa 3 fixo, mas mantemos genérico). */
  totalTodayCount: number
  todayCards: TodayCardDisplay[]
  onGoArchive: () => void
  /**
   * Nº de dias seguidos com pelo menos um desafio resolvido (persistido em
   * `localStorage`, ver `src/lib/storage.ts`). `undefined`/`0` = sem streak
   * ativo, e o indicador some (não há um espaço dedicado a isso no design
   * original — foi adicionado de forma discreta, junto do badge do dia, sem
   * alterar a diagramação existente).
   */
  streak?: number
}

/**
 * Tela inicial (Desafio do Dia). Réplica visual da seção <!-- HOME -->.
 */
export default function HomePage({
  todayDateLabel,
  todayTheme,
  solvedTodayCount,
  totalTodayCount,
  todayCards,
  onGoArchive,
  streak,
}: HomePageProps) {
  return (
    <main className="stima-home-main" style={styles.main}>
      <div className="stima-home-badge-row" style={styles.badgeRow}>
        <span style={styles.badge}>
          <span style={styles.badgeDot} />
          <span style={{ whiteSpace: 'nowrap' }}>DESAFIO DO DIA</span>
        </span>
        <span style={styles.dateLabel}>{todayDateLabel}</span>
        {!!streak && (
          <span className="stima-home-streak-badge" style={styles.streakBadge}>
            🔥 {streak} {streak === 1 ? 'dia seguido' : 'dias seguidos'}
          </span>
        )}
      </div>

      <div className="stima-home-hero-grid" style={styles.heroGrid}>
        <div>
          <div style={styles.heroEyebrow}>Tema de hoje</div>
          <h1 className="stima-home-hero-title" style={styles.heroTitle}>
            {todayTheme}
          </h1>
          <p className="stima-home-hero-text" style={styles.heroText}>
            Três problemas de estimativa, um para cada nível. Estime primeiro, use as dicas se
            precisar, e compare seu chute com a faixa esperada.
          </p>
        </div>
        <div className="stima-home-progress-card" style={styles.progressCard}>
          <div style={styles.progressLabel}>Seu progresso hoje</div>
          <div style={styles.progressValueRow}>
            <span className="stima-home-progress-value" style={styles.progressValue}>
              {solvedTodayCount}
            </span>
            <span style={styles.progressOf}>/ {totalTodayCount} resolvidos</span>
          </div>
          <div style={styles.progressBarsRow}>
            {todayCards.map((c) => (
              <span
                key={c.id}
                style={{
                  ...styles.progressBar,
                  background: c.solved ? 'var(--accent)' : 'var(--muted)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="stima-home-cards-grid" style={styles.cardsGrid}>
        {todayCards.map((c) => (
          <div
            key={c.id}
            onClick={c.onOpen}
            role="button"
            tabIndex={0}
            onKeyDown={handleActivateKey(c.onOpen)}
            className="stima-home-card"
            style={{
              ...styles.card,
              borderColor: c.solved ? 'var(--border-strong)' : 'var(--border)',
            }}
          >
            <div style={styles.cardTopRow}>
              <div style={styles.dotsRow}>
                {c.dots.map((d, i) => (
                  <span
                    key={i}
                    style={{
                      ...styles.dot,
                      background: d.on ? 'var(--accent)' : 'var(--muted)',
                    }}
                  />
                ))}
              </div>
              {c.solved && <span style={styles.solvedPill}>✓ Resolvido</span>}
            </div>
            <div style={styles.cardLevel}>{c.level}</div>
            <h3 style={styles.cardTitle}>{c.title}</h3>
            <p style={styles.cardTeaser}>{c.teaser}</p>
            <span style={styles.cardCta}>
              {c.solved ? 'Rever solução' : 'Resolver desafio'}{' '}
              <span style={{ fontSize: 16 }}>→</span>
            </span>
          </div>
        ))}
      </div>

      <div
        onClick={onGoArchive}
        role="button"
        tabIndex={0}
        onKeyDown={handleActivateKey(onGoArchive)}
        className="stima-archive-banner stima-home-archive-banner"
        style={styles.archiveBanner}
      >
        <div>
          <div style={styles.archiveBannerTitle}>Perdeu algum desafio?</div>
          <div style={styles.archiveBannerText}>
            Explore os outros desafios anteriores por tema, nível e o que você ainda não resolveu.
          </div>
        </div>
        <span className="stima-home-archive-banner-cta" style={styles.archiveBannerCta}>
          Ver desafios →
        </span>
      </div>
    </main>
  )
}

const styles: Record<string, CSSProperties> = {
  main: { maxWidth: 1120, margin: '0 auto', padding: '56px 28px 90px' },
  badgeRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 999,
    padding: '7px 15px',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--accent)',
    letterSpacing: '0.02em',
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: 'var(--accent)',
    boxShadow: '0 0 0 3px var(--accent-glow)',
  },
  dateLabel: { fontSize: 14, color: 'var(--dim)' },
  streakBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 999,
    padding: '7px 13px',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-2)',
    whiteSpace: 'nowrap',
  },
  heroGrid: {
    display: 'grid',
    gridTemplateColumns: '1.15fr 0.85fr',
    gap: 40,
    alignItems: 'end',
    marginBottom: 52,
  },
  heroEyebrow: { fontSize: 15, color: 'var(--dim)', marginBottom: 10 },
  heroTitle: { fontSize: 64, lineHeight: 0.98, fontWeight: 700 },
  heroText: {
    fontSize: 17,
    lineHeight: 1.6,
    color: 'var(--text-2)',
    maxWidth: 460,
    margin: '20px 0 0',
  },
  progressCard: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 18,
    padding: '26px 28px',
  },
  progressLabel: {
    fontSize: 13,
    color: 'var(--dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 14,
  },
  progressValueRow: { display: 'flex', alignItems: 'baseline', gap: 8 },
  progressValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 52,
    fontWeight: 700,
    color: 'var(--accent)',
  },
  progressOf: { fontSize: 20, color: 'var(--dim)' },
  progressBarsRow: { display: 'flex', gap: 7, marginTop: 18 },
  progressBar: { height: 6, flex: 1, borderRadius: 99 },
  cardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 },
  card: {
    position: 'relative',
    background: 'var(--card)',
    border: '1px solid',
    borderRadius: 20,
    padding: '28px 26px 26px',
    cursor: 'pointer',
    transition: 'transform .18s, border-color .18s',
    overflow: 'hidden',
  },
  cardTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  dotsRow: { display: 'flex', gap: 5 },
  dot: { width: 9, height: 9, borderRadius: '50%' },
  solvedPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'var(--accent-chip)',
    color: 'var(--accent)',
    fontSize: 12,
    fontWeight: 600,
    padding: '5px 11px',
    borderRadius: 999,
  },
  cardLevel: {
    fontSize: 13,
    color: 'var(--dim)',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  cardTitle: { fontSize: 22, fontWeight: 600, lineHeight: 1.15, marginBottom: 14 },
  cardTeaser: { fontSize: 14.5, lineHeight: 1.55, color: 'var(--dim)', margin: '0 0 26px' },
  cardCta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--accent)',
  },
  archiveBanner: {
    marginTop: 22,
    background: 'linear-gradient(100deg, var(--card), var(--card-2))',
    border: '1px solid var(--border)',
    borderRadius: 18,
    padding: '22px 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
  },
  archiveBannerTitle: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 18 },
  archiveBannerText: { fontSize: 14.5, color: 'var(--dim)', marginTop: 4 },
  archiveBannerCta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: 'var(--accent)',
    color: 'var(--on-accent)',
    fontSize: 14,
    fontWeight: 600,
    padding: '11px 20px',
    borderRadius: 999,
    whiteSpace: 'nowrap',
  },
}
