import type { CSSProperties } from 'react'
import type { ReasoningStepDisplay, VerdictDisplay } from './challengeUiTypes'

export interface ResultsPanelProps {
  /** Texto já formatado do chute do usuário (ex.: "125,5 mi"). */
  guessDisplay: string
  /** Texto já formatado da faixa esperada (ex.: "800 mil – 1,6 mi"). */
  rangeDisplay: string
  /** Posições/larguras em % (0-100) já calculadas para a barra comparativa (escala logarítmica). */
  bandLeft: number
  bandWidth: number
  pointPos: number
  guessPos: number
  /** Cor do marcador do chute (dentro x fora da faixa). */
  guessColor: string
  verdict: VerdictDisplay
  steps: ReasoningStepDisplay[]
  /** Estimativa de referência já formatada (ex.: "1,2 mi"). */
  pointDisplay: string
  unit: string
  onGoBack: () => void
}

/**
 * Painel de resultados: comparação chute vs. faixa esperada (com barra),
 * veredito, raciocínio passo a passo e estimativa de referência.
 * Réplica visual da seção RESULTS.
 */
export default function ResultsPanel({
  guessDisplay,
  rangeDisplay,
  bandLeft,
  bandWidth,
  pointPos,
  guessPos,
  guessColor,
  verdict,
  steps,
  pointDisplay,
  unit,
  onGoBack,
}: ResultsPanelProps) {
  return (
    <div style={styles.animWrap}>
      <div className="stima-results-card" style={styles.comparisonCard}>
        <div className="stima-results-header-row" style={styles.comparisonHeaderRow}>
          <div>
            <div style={styles.smallLabel}>Seu chute</div>
            <div className="stima-results-big-value" style={styles.bigValue}>
              {guessDisplay}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={styles.smallLabel}>Faixa esperada</div>
            <div
              className="stima-results-big-value"
              style={{ ...styles.bigValue, color: 'var(--accent)' }}
            >
              {rangeDisplay}
            </div>
          </div>
        </div>

        <div style={styles.barTrack}>
          <div
            style={{
              ...styles.barBand,
              left: `${bandLeft}%`,
              width: `${bandWidth}%`,
            }}
          />
          <div style={{ ...styles.barPoint, left: `${pointPos}%` }} />
          <div
            style={{
              ...styles.barGuess,
              left: `${guessPos}%`,
              background: guessColor,
              boxShadow: `0 0 0 1px ${guessColor}`,
            }}
          />
        </div>
        <div style={styles.barLabelsRow}>
          <span>menor</span>
          <span>maior</span>
        </div>

        <div
          className="stima-results-verdict"
          style={{
            ...styles.verdictBox,
            background: verdict.background,
            borderColor: verdict.borderColor,
          }}
        >
          <span style={styles.verdictIcon}>{verdict.icon}</span>
          <span style={{ ...styles.verdictText, color: verdict.color }}>{verdict.text}</span>
        </div>
      </div>

      <div style={styles.reasoningHeading}>Raciocínio passo a passo</div>
      <div style={styles.reasoningList}>
        {steps.map((s) => (
          <div key={s.n} className="stima-results-reasoning-row" style={styles.reasoningRow}>
            <span style={styles.reasoningBadge}>{s.n}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="stima-results-reasoning-label-row" style={styles.reasoningLabelRow}>
                <span style={styles.reasoningLabel}>{s.label}</span>
                <span style={styles.reasoningValue}>{s.value}</span>
              </div>
              {s.note && <div style={styles.reasoningNote}>{s.note}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="stima-results-ref-card" style={styles.refCard}>
        <div>
          <div style={styles.smallLabel}>Estimativa de referência</div>
          <div className="stima-results-ref-value" style={styles.refValue}>
            {pointDisplay} <span style={styles.refUnit}>{unit}</span>
          </div>
        </div>
        <button
          onClick={onGoBack}
          className="stima-outline-btn stima-results-back-btn"
          style={styles.backBtn}
        >
          Voltar aos desafios
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  animWrap: { animation: 'fadeUp .45s ease both' },
  comparisonCard: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: '26px 28px',
    marginBottom: 24,
  },
  comparisonHeaderRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 24,
    justifyContent: 'space-between',
    marginBottom: 26,
  },
  smallLabel: { fontSize: 13, color: 'var(--dim)', marginBottom: 5 },
  bigValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 28,
    fontWeight: 700,
  },
  barTrack: {
    position: 'relative',
    height: 12,
    background: 'var(--bg)',
    borderRadius: 99,
    margin: '34px 0 8px',
  },
  barBand: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    background: 'var(--band-bg)',
    border: '1px solid var(--band-bd)',
    borderRadius: 99,
  },
  barPoint: {
    position: 'absolute',
    top: '50%',
    width: 2,
    height: 20,
    transform: 'translate(-50%,-50%)',
    background: 'var(--accent2)',
    borderRadius: 2,
  },
  barGuess: {
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%,-50%)',
    width: 20,
    height: 20,
    borderRadius: '50%',
    border: '3px solid var(--card)',
  },
  barLabelsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 12,
    color: 'var(--faint)',
    marginTop: 6,
  },
  verdictBox: {
    marginTop: 20,
    border: '1px solid',
    borderRadius: 11,
    padding: '14px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  verdictIcon: { fontSize: 22 },
  verdictText: { fontSize: 15.5, fontWeight: 600 },
  reasoningHeading: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--dim)',
    fontWeight: 600,
    marginBottom: 16,
  },
  reasoningList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    marginBottom: 28,
  },
  reasoningRow: {
    display: 'flex',
    gap: 16,
    padding: '16px 0',
    borderBottom: '1px solid var(--border-faint)',
  },
  reasoningBadge: {
    flexShrink: 0,
    width: 28,
    height: 28,
    borderRadius: 8,
    background: 'var(--accent)',
    color: 'var(--on-accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: 14,
  },
  reasoningLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'baseline',
  },
  reasoningLabel: { fontSize: 15.5, fontWeight: 600, flex: 1, minWidth: 0 },
  reasoningValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 15.5,
    fontWeight: 600,
    color: 'var(--accent)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    textAlign: 'right',
  },
  reasoningNote: { fontSize: 13.5, color: 'var(--faint2)', marginTop: 5 },
  refCard: {
    background: 'var(--card-2)',
    border: '1px solid var(--border-2)',
    borderRadius: 14,
    padding: '22px 24px',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  refValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 26,
    fontWeight: 700,
    color: 'var(--accent)',
  },
  refUnit: { fontSize: 15, color: 'var(--dim)', fontWeight: 500 },
  backBtn: {
    background: 'none',
    border: '1px solid var(--border-strong)',
    color: 'var(--text)',
    borderRadius: 999,
    padding: '11px 22px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
}
