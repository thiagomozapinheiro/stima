import type { CSSProperties } from 'react'
import type { MagnitudeOption } from './challengeUiTypes'
import NumberMagnitudeField from './NumberMagnitudeField'

export interface FinalEstimateInputProps {
  /** "Sua estimativa final" (modo guiado) ou "Sua estimativa" (modo livre). */
  label: string
  numberValue: string
  onNumberChange: (value: string) => void
  magnitude: string
  onMagnitudeChange: (value: string) => void
  magnitudeOptions: MagnitudeOption[]
  /** Unidade fixa do desafio (ex.: "corridas/dia", "por ano"). */
  unit: string
  onCheck: () => void
  /**
   * Se o botão "Checar resposta" deve ficar desabilitado. A regra de
   * quando habilitar (preenchimento válido) é decidida pelo
   * `numeric-logic-engineer`/`ui-builder`, não aqui.
   */
  checkDisabled: boolean
}

/**
 * Campo de estimativa final (usado nos dois modos) + botão "Checar resposta".
 * Réplica visual da seção FINAL ESTIMATE.
 */
export default function FinalEstimateInput({
  label,
  numberValue,
  onNumberChange,
  magnitude,
  onMagnitudeChange,
  magnitudeOptions,
  unit,
  onCheck,
  checkDisabled,
}: FinalEstimateInputProps) {
  return (
    <div>
      <label style={styles.label}>{label}</label>
      <div style={styles.helper}>
        Digite um número (0 a 999,9, uma casa decimal), escolha a ordem de grandeza e confira.
      </div>
      <div style={styles.row}>
        <NumberMagnitudeField
          numberValue={numberValue}
          onNumberChange={onNumberChange}
          magnitude={magnitude}
          onMagnitudeChange={onMagnitudeChange}
          magnitudeOptions={magnitudeOptions}
          unitLabel={unit}
          placeholder="125,5"
          size="final"
        />
        <button
          onClick={onCheck}
          disabled={checkDisabled}
          className="stima-final-check-btn"
          style={{
            ...styles.checkBtn,
            background: checkDisabled ? 'var(--muted)' : 'var(--accent)',
            color: checkDisabled ? 'var(--faint)' : 'var(--on-accent)',
            cursor: checkDisabled ? 'not-allowed' : 'pointer',
          }}
        >
          Checar resposta
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  label: {
    display: 'block',
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 6,
  },
  helper: {
    fontSize: 13.5,
    color: 'var(--dim)',
    marginBottom: 16,
  },
  row: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    alignItems: 'stretch',
  },
  checkBtn: {
    border: 'none',
    borderRadius: 11,
    padding: '14px 26px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 16,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    transition: 'background .15s',
  },
}
