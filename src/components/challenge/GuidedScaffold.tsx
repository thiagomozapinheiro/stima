import type { CSSProperties } from 'react'
import type { GuidedStageDisplay, FormulaDisplay } from './challengeUiTypes'
import NumberMagnitudeField from './NumberMagnitudeField'

export interface GuidedScaffoldProps {
  stages: GuidedStageDisplay[]
  /** Quantas premissas já foram preenchidas (para a barra de progresso). */
  filledCount: number
  totalCount: number
  /** Percentual (0-100) já calculado — a fórmula de cálculo é decisão de lógica, não de UI. */
  progressPercent: number
  /** "Estrutura construída" — some quando o desafio não define fórmula visual. */
  formula?: FormulaDisplay
}

/**
 * Andaime do modo "Raciocínio guiado": barra de progresso, etapas agrupadas
 * por estágio, e a fórmula visual final. Réplica visual da seção
 * GUIDED SCAFFOLD.
 */
export default function GuidedScaffold({
  stages,
  filledCount,
  totalCount,
  progressPercent,
  formula,
}: GuidedScaffoldProps) {
  return (
    <div style={styles.wrap}>
      <div style={styles.progressRow}>
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${progressPercent}%` }} />
        </div>
        <span style={styles.progressLabel}>
          {filledCount}/{totalCount} premissas
        </span>
      </div>

      {stages.map((stage, si) => (
        <div key={si} style={styles.stage}>
          <div style={styles.stageHeaderRow}>
            <span style={styles.stageTitle}>{stage.title}</span>
            <div style={styles.stageDivider} />
          </div>
          <div style={styles.stepsCol}>
            {stage.steps.map((st, ti) => (
              <div key={ti} className="stima-scaffold-step-card" style={styles.stepCard}>
                <div style={styles.stepQuestion}>{st.question}</div>
                {st.explain && <div style={styles.stepExplain}>{st.explain}</div>}
                <NumberMagnitudeField
                  numberValue={st.numberValue}
                  onNumberChange={st.onNumberChange}
                  magnitude={st.magnitude}
                  onMagnitudeChange={st.onMagnitudeChange}
                  magnitudeOptions={st.magnitudeOptions}
                  unitLabel={st.unit}
                  size="step"
                />
                {st.feedback && (
                  <div
                    className="stima-scaffold-feedback"
                    style={{
                      ...styles.feedback,
                      background: st.feedback.background,
                      borderColor: st.feedback.borderColor,
                    }}
                  >
                    <span style={{ ...styles.feedbackIcon, color: st.feedback.color }}>
                      {st.feedback.icon}
                    </span>
                    <span style={{ ...styles.feedbackText, color: st.feedback.color }}>
                      {st.feedback.text}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {formula && (
        <div className="stima-scaffold-formula-box" style={styles.formulaBox}>
          <div style={styles.formulaLabel}>Estrutura construída</div>
          <div className="stima-scaffold-formula-body" style={styles.formulaBody}>
            <div style={styles.formulaTitle}>{formula.title}</div>
            {formula.lines.map((fl, i) => (
              <div key={i} style={styles.formulaLine}>
                <span style={styles.formulaOp}>{fl.operator}</span>
                <span style={styles.formulaText}>{fl.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  wrap: { marginBottom: 24 },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    background: 'var(--bg)',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'var(--accent)',
    borderRadius: 99,
    transition: 'width .3s',
  },
  progressLabel: {
    fontSize: 12.5,
    color: 'var(--dim)',
    whiteSpace: 'nowrap',
    fontWeight: 600,
  },
  stage: { marginBottom: 18 },
  stageHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  stageTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.04em',
    color: 'var(--accent)',
    textTransform: 'uppercase',
  },
  stageDivider: {
    flex: 1,
    height: 1,
    background: 'var(--border-faint)',
  },
  stepsCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  stepCard: {
    background: 'var(--bg)',
    border: '1px solid var(--border-faint)',
    borderRadius: 13,
    padding: '16px 18px',
  },
  stepQuestion: {
    fontSize: 14.5,
    fontWeight: 600,
    lineHeight: 1.35,
    marginBottom: 4,
  },
  stepExplain: {
    fontSize: 12.5,
    color: 'var(--faint2)',
    lineHeight: 1.5,
    marginBottom: 12,
  },
  feedback: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    border: '1px solid',
    borderRadius: 9,
    padding: '8px 12px',
    maxWidth: 420,
  },
  feedbackIcon: {
    fontSize: 14,
    fontWeight: 700,
    lineHeight: 1,
  },
  feedbackText: {
    fontSize: 12.5,
    fontWeight: 500,
    lineHeight: 1.4,
  },
  formulaBox: {
    background: 'var(--accent-chip)',
    border: '1px solid var(--accent-chip-bd)',
    borderRadius: 13,
    padding: '18px 20px',
  },
  formulaLabel: {
    fontSize: 11.5,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--accent)',
    marginBottom: 10,
  },
  formulaBody: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 1.7,
  },
  formulaTitle: { marginBottom: 2 },
  formulaLine: {
    display: 'flex',
    gap: 10,
    paddingLeft: 6,
  },
  formulaOp: {
    color: 'var(--accent)',
    width: 16,
    flexShrink: 0,
  },
  formulaText: {
    color: 'var(--text-2)',
    fontWeight: 500,
  },
}
