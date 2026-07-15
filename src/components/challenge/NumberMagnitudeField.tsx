import type { CSSProperties } from 'react'
import type { MagnitudeOption } from './challengeUiTypes'

export interface NumberMagnitudeFieldProps {
  numberValue: string
  onNumberChange: (value: string) => void
  magnitude: string
  onMagnitudeChange: (value: string) => void
  magnitudeOptions: MagnitudeOption[]
  /** Texto fixo de unidade mostrado à direita (ex.: "corridas/dia"). Opcional. */
  unitLabel?: string
  placeholder?: string
  /** Variante visual: "final" (estimativa final, maior) ou "step" (microetapa guiada, menor). */
  size?: 'final' | 'step'
}

/**
 * Campo composto "número + ordem de grandeza (+ unidade)" reutilizado tanto
 * na estimativa final quanto em cada microetapa do modo guiado.
 *
 * Este componente é puramente apresentacional: NÃO faz parsing/validação do
 * número digitado (isso é responsabilidade de `src/lib/numericInput.ts`,
 * do agente `numeric-logic-engineer`). O valor de `numberValue` é exibido
 * como veio e `onNumberChange` repassa o texto bruto digitado.
 */
export default function NumberMagnitudeField({
  numberValue,
  onNumberChange,
  magnitude,
  onMagnitudeChange,
  magnitudeOptions,
  unitLabel,
  placeholder,
  size = 'step',
}: NumberMagnitudeFieldProps) {
  const isFinal = size === 'final'

  return (
    <div
      className={`stima-input-wrap stima-num-wrap ${isFinal ? 'stima-num-wrap-final' : 'stima-num-wrap-step'}`}
      style={isFinal ? styles.wrapFinal : styles.wrapStep}
    >
      <input
        type="text"
        inputMode="decimal"
        value={numberValue}
        onChange={(e) => onNumberChange(e.target.value)}
        placeholder={placeholder ?? '0,0'}
        className={`stima-num-input ${isFinal ? 'stima-num-input-final' : 'stima-num-input-step'}`}
        style={isFinal ? styles.inputFinal : styles.inputStep}
      />
      <select
        value={magnitude}
        onChange={(e) => onMagnitudeChange(e.target.value)}
        className="stima-select stima-num-select"
        style={isFinal ? styles.selectFinal : styles.selectStep}
      >
        {magnitudeOptions.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
      {unitLabel && (
        <span
          className="stima-num-unit"
          style={isFinal ? styles.unitFinal : styles.unitStep}
        >
          {unitLabel}
        </span>
      )}
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  wrapStep: {
    display: 'flex',
    gap: 9,
    alignItems: 'center',
    background: 'var(--card)',
    border: '1px solid var(--muted)',
    borderRadius: 10,
    padding: '5px 8px 5px 12px',
    maxWidth: 420,
  },
  inputStep: {
    flex: 1,
    minWidth: 56,
    background: 'transparent',
    border: 'none',
    color: 'var(--text)',
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 19,
    fontWeight: 700,
    outline: 'none',
    padding: '6px 0',
  },
  selectStep: {
    flexShrink: 0,
    background: 'var(--bg)',
    border: '1px solid var(--muted)',
    borderRadius: 7,
    padding: '8px 9px',
    color: 'var(--text)',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13.5,
    fontWeight: 600,
    outline: 'none',
    cursor: 'pointer',
  },
  unitStep: {
    flexShrink: 0,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--dim)',
    whiteSpace: 'nowrap',
    paddingRight: 4,
  },
  wrapFinal: {
    display: 'flex',
    gap: 10,
    flex: 1,
    minWidth: 280,
    alignItems: 'center',
    background: 'var(--bg)',
    border: '1px solid var(--muted)',
    borderRadius: 11,
    padding: '6px 8px 6px 14px',
  },
  inputFinal: {
    flex: 1,
    minWidth: 80,
    background: 'transparent',
    border: 'none',
    color: 'var(--text)',
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 26,
    fontWeight: 700,
    outline: 'none',
    padding: '8px 0',
  },
  selectFinal: {
    flexShrink: 0,
    background: 'var(--card)',
    border: '1px solid var(--muted)',
    borderRadius: 8,
    padding: '10px 12px',
    color: 'var(--text)',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 15,
    fontWeight: 600,
    outline: 'none',
    cursor: 'pointer',
  },
  unitFinal: {
    flexShrink: 0,
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--dim)',
    whiteSpace: 'nowrap',
    paddingRight: 6,
  },
}
