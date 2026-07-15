import type { CSSProperties } from 'react'

export interface HintBoxProps {
  /** Número de exibição da dica (1, 2, 3...). */
  n: number
  label: string
  text: string
  isOpen: boolean
  onToggle: () => void
}

/**
 * Caixa de dica expansível (accordion). Réplica visual da seção HINTS.
 *
 * A abertura/fechamento é controlada externamente (isOpen/onToggle) —
 * este componente é só apresentação; o comportamento real de accordion
 * (independente entre dicas) é responsabilidade do agente `ui-builder`.
 */
export default function HintBox({ n, label, text, isOpen, onToggle }: HintBoxProps) {
  return (
    <div style={styles.wrap}>
      <button onClick={onToggle} className="stima-hint-header" style={styles.headerBtn}>
        <span style={styles.headerLeft}>
          <span style={styles.badge}>{n}</span>
          {label}
        </span>
        <span
          style={{
            ...styles.plus,
            transform: isOpen ? 'rotate(45deg)' : 'none',
          }}
        >
          +
        </span>
      </button>
      {isOpen && (
        <div className="stima-hint-body" style={styles.body}>
          {text}
        </div>
      )}
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  wrap: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 13,
    overflow: 'hidden',
  },
  headerBtn: {
    width: '100%',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '15px 18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    color: 'var(--text)',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 15,
    fontWeight: 500,
    textAlign: 'left',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 7,
    background: 'var(--accent-chip)',
    color: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
    flexShrink: 0,
  },
  plus: {
    color: 'var(--accent)',
    fontSize: 20,
    transition: 'transform .2s',
  },
  body: {
    padding: '0 18px 16px 54px',
    fontSize: 15,
    lineHeight: 1.6,
    color: 'var(--text-2)',
  },
}
