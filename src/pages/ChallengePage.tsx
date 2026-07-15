import type { CSSProperties } from 'react'
import HintBox from '../components/challenge/HintBox'
import ModeSelector, { type ResolutionMode } from '../components/challenge/ModeSelector'
import GuidedScaffold from '../components/challenge/GuidedScaffold'
import FinalEstimateInput from '../components/challenge/FinalEstimateInput'
import ResultsPanel from '../components/challenge/ResultsPanel'
import GoBeyondPanel, { type GoBeyondPanelProps } from '../components/challenge/GoBeyondPanel'
import type {
  HintDisplay,
  MagnitudeOption,
  GuidedStageDisplay,
  FormulaDisplay,
  ReasoningStepDisplay,
  VerdictDisplay,
} from '../components/challenge/challengeUiTypes'

export interface ResultsDisplayData {
  guessDisplay: string
  rangeDisplay: string
  bandLeft: number
  bandWidth: number
  pointPos: number
  guessPos: number
  guessColor: string
  verdict: VerdictDisplay
  steps: ReasoningStepDisplay[]
  pointDisplay: string
}

/**
 * PROPS de apresentação da tela de desafio.
 *
 * TODO: conectar ao schema real (`src/types/challenge.ts`, do agente
 * `data-architect`) e à lógica de `src/lib/numericInput.ts` /
 * `src/lib/rangeComparison.ts` (agente `numeric-logic-engineer`). Por ora
 * os campos abaixo espelham exatamente os dados dinâmicos usados no design
 * original (`{{ ch.* }}`, `{{ guess* }}`, etc.), como props genéricas.
 */
export interface ChallengePageProps {
  onGoBack: () => void

  theme: string
  level: string
  dateShort: string
  title: string
  prompt: string
  unit: string

  hints: HintDisplay[]

  /** true depois que o usuário já checou a resposta deste desafio. */
  checked: boolean

  // ---- área de resposta (visível quando !checked) ----
  mode: ResolutionMode
  onSelectGuidedMode: () => void
  onSelectFreeMode: () => void
  modeExplainText: string
  /** Se o desafio tem roteiro guiado disponível (nem todos têm). */
  hasGuidedMode: boolean
  /** true quando o modo guiado deve ser exibido (mode === 'guided' && hasGuidedMode). */
  showGuided: boolean
  guidedStages?: GuidedStageDisplay[]
  guidedFilledCount?: number
  guidedTotalCount?: number
  guidedProgressPercent?: number
  guidedFormula?: FormulaDisplay

  finalEstimateLabel: string
  guessNumberValue: string
  onGuessNumberChange: (value: string) => void
  guessMagnitude: string
  onGuessMagnitudeChange: (value: string) => void
  magnitudeOptions: MagnitudeOption[]
  onCheckAnswer: () => void
  checkDisabled: boolean

  // ---- resultados (visível quando checked) ----
  results?: ResultsDisplayData
  /** "Vá além" é opcional por desafio — ausente = seção não é renderizada. */
  goBeyond?: GoBeyondPanelProps
}

/**
 * Tela de desafio individual. Composição de HintBox, ModeSelector,
 * GuidedScaffold, FinalEstimateInput, ResultsPanel e GoBeyondPanel.
 * Réplica visual da seção <!-- CHALLENGE --> do design original.
 */
export default function ChallengePage({
  onGoBack,
  theme,
  level,
  dateShort,
  title,
  prompt,
  unit,
  hints,
  checked,
  mode,
  onSelectGuidedMode,
  onSelectFreeMode,
  modeExplainText,
  hasGuidedMode,
  showGuided,
  guidedStages,
  guidedFilledCount,
  guidedTotalCount,
  guidedProgressPercent,
  guidedFormula,
  finalEstimateLabel,
  guessNumberValue,
  onGuessNumberChange,
  guessMagnitude,
  onGuessMagnitudeChange,
  magnitudeOptions,
  onCheckAnswer,
  checkDisabled,
  results,
  goBeyond,
}: ChallengePageProps) {
  return (
    <main className="stima-challenge-main" style={styles.main}>
      <button onClick={onGoBack} className="stima-back-btn" style={styles.backBtn}>
        ← Voltar
      </button>

      <div style={styles.chipsRow}>
        <span style={styles.chipTheme}>{theme}</span>
        <span style={styles.chipLevel}>{level}</span>
        <span style={styles.dateText}>{dateShort}</span>
      </div>

      <h1 className="stima-challenge-title" style={styles.title}>
        {title}
      </h1>
      <p className="stima-challenge-prompt" style={styles.prompt}>
        {prompt}
      </p>

      {/* HINTS */}
      <div style={styles.hintsHeading}>
        Dicas{' '}
        <span style={styles.hintsHeadingSub}>
          — abra só se precisar (nunca entregam a resposta)
        </span>
      </div>
      <div style={styles.hintsList}>
        {hints.map((h) => (
          <HintBox
            key={h.n}
            n={h.n}
            label={h.label}
            text={h.text}
            isOpen={h.isOpen}
            onToggle={h.onToggle}
          />
        ))}
      </div>

      {/* INPUT / CHECK */}
      {!checked && (
        <div className="stima-challenge-input-card" style={styles.inputCard}>
          <ModeSelector
            mode={mode}
            onSelectGuided={onSelectGuidedMode}
            onSelectFree={onSelectFreeMode}
            explainText={modeExplainText}
            guidedAvailable={hasGuidedMode}
          />

          {showGuided && guidedStages && (
            <GuidedScaffold
              stages={guidedStages}
              filledCount={guidedFilledCount ?? 0}
              totalCount={guidedTotalCount ?? 0}
              progressPercent={guidedProgressPercent ?? 0}
              formula={guidedFormula}
            />
          )}

          <FinalEstimateInput
            label={finalEstimateLabel}
            numberValue={guessNumberValue}
            onNumberChange={onGuessNumberChange}
            magnitude={guessMagnitude}
            onMagnitudeChange={onGuessMagnitudeChange}
            magnitudeOptions={magnitudeOptions}
            unit={unit}
            onCheck={onCheckAnswer}
            checkDisabled={checkDisabled}
          />
        </div>
      )}

      {/* RESULTS */}
      {checked && results && (
        <>
          <ResultsPanel
            guessDisplay={results.guessDisplay}
            rangeDisplay={results.rangeDisplay}
            bandLeft={results.bandLeft}
            bandWidth={results.bandWidth}
            pointPos={results.pointPos}
            guessPos={results.guessPos}
            guessColor={results.guessColor}
            verdict={results.verdict}
            steps={results.steps}
            pointDisplay={results.pointDisplay}
            unit={unit}
            onGoBack={onGoBack}
          />
          {goBeyond && (
            <GoBeyondPanel
              impact={goBeyond.impact}
              strategicQuestion={goBeyond.strategicQuestion}
              opportunities={goBeyond.opportunities}
              discussions={goBeyond.discussions}
              whatIfPremise={goBeyond.whatIfPremise}
              whatIfQuestions={goBeyond.whatIfQuestions}
            />
          )}
        </>
      )}
    </main>
  )
}

const styles: Record<string, CSSProperties> = {
  main: {
    maxWidth: 760,
    margin: '0 auto',
    padding: '36px 28px 100px',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--dim)',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14.5,
    cursor: 'pointer',
    padding: 0,
    marginBottom: 26,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
  },
  chipsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chipTheme: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 999,
    padding: '6px 13px',
    fontSize: 12.5,
    fontWeight: 600,
    color: 'var(--accent)',
  },
  chipLevel: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 999,
    padding: '6px 13px',
    fontSize: 12.5,
    fontWeight: 600,
    color: 'var(--text-2)',
  },
  dateText: { fontSize: 13, color: 'var(--faint)' },
  title: {
    fontSize: 34,
    lineHeight: 1.12,
    fontWeight: 700,
    marginBottom: 18,
  },
  prompt: {
    fontSize: 19,
    lineHeight: 1.6,
    color: 'var(--text-bright)',
    background: 'var(--card)',
    borderLeft: '3px solid var(--accent)',
    borderRadius: '0 12px 12px 0',
    padding: '20px 24px',
    margin: '0 0 34px',
  },
  hintsHeading: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--dim)',
    fontWeight: 600,
    marginBottom: 14,
  },
  hintsHeadingSub: {
    color: 'var(--faint)',
    fontWeight: 500,
    textTransform: 'none',
    letterSpacing: 0,
  },
  hintsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBottom: 36,
  },
  inputCard: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: 26,
  },
}
