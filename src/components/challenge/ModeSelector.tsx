import type { CSSProperties } from 'react'

export type ResolutionMode = 'guided' | 'free'

export interface ModeSelectorProps {
  mode: ResolutionMode
  onSelectGuided: () => void
  onSelectFree: () => void
  /**
   * Texto explicativo do modo atual. O texto exato depende de regras de
   * negócio (ex.: desafio sem modo guiado disponível) que cabem ao
   * agente `ui-builder` decidir/computar — aqui só exibimos o que vier.
   */
  explainText: string
  /** `false` quando o desafio não tem roteiro guiado — desabilita visualmente o botão "Raciocínio guiado". */
  guidedAvailable?: boolean
}

/**
 * Alternador "Raciocínio guiado" / "Raciocínio livre".
 * Réplica visual da seção MODE SELECTOR.
 *
 * AMBIGUIDADE NO DESIGN: o texto "↺ Trocar de modo pode reorganizar a área
 * de resposta." sugere que trocar de modo pode descartar/reorganizar
 * respostas já preenchidas, mas o design não deixa claro se os valores já
 * digitados no modo guiado são perdidos ao voltar para o modo livre (ou
 * vice-versa). Deixando como decisão do agente `ui-builder`.
 */
export default function ModeSelector({
  mode,
  onSelectGuided,
  onSelectFree,
  explainText,
  guidedAvailable = true,
}: ModeSelectorProps) {
  const isGuided = mode === 'guided'

  return (
    <div>
      <div className="stima-mode-toggle-wrap" style={styles.toggleWrap}>
        <button
          onClick={onSelectGuided}
          disabled={!guidedAvailable}
          aria-disabled={!guidedAvailable}
          title={guidedAvailable ? undefined : 'Este desafio ainda não tem roteiro guiado.'}
          className="stima-mode-toggle-btn"
          style={{
            ...styles.toggleBtn,
            background: isGuided ? 'var(--accent)' : 'transparent',
            color: isGuided ? 'var(--on-accent)' : 'var(--text-2)',
            opacity: guidedAvailable ? 1 : 0.45,
            cursor: guidedAvailable ? 'pointer' : 'not-allowed',
          }}
        >
          Raciocínio guiado
        </button>
        <button
          onClick={onSelectFree}
          className="stima-mode-toggle-btn"
          style={{
            ...styles.toggleBtn,
            background: !isGuided ? 'var(--accent)' : 'transparent',
            color: !isGuided ? 'var(--on-accent)' : 'var(--text-2)',
          }}
        >
          Raciocínio livre
        </button>
      </div>
      <div style={styles.explain}>{explainText}</div>
      <div style={styles.note}>↺ Trocar de modo pode reorganizar a área de resposta.</div>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  toggleWrap: {
    display: 'inline-flex',
    background: 'var(--bg)',
    border: '1px solid var(--muted)',
    borderRadius: 12,
    padding: 4,
    gap: 4,
    marginBottom: 12,
  },
  toggleBtn: {
    border: 'none',
    borderRadius: 9,
    padding: '9px 18px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14.5,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background .15s, color .15s',
  },
  explain: {
    fontSize: 13.5,
    lineHeight: 1.55,
    color: 'var(--faint2)',
    marginBottom: 6,
    maxWidth: 640,
  },
  note: {
    fontSize: 12.5,
    color: 'var(--faint)',
    marginBottom: 22,
  },
}
