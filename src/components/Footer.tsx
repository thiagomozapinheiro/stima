import type { CSSProperties } from 'react'

/** Rodapé fixo do site. Réplica visual do <footer> do design original. */
export default function Footer() {
  return (
    <footer className="stima-footer" style={styles.footer}>
      Stima · Desafios diários de estimativa de mercado · Seu progresso é salvo neste navegador.
    </footer>
  )
}

const styles: Record<string, CSSProperties> = {
  footer: {
    borderTop: '1px solid var(--border-faint)',
    padding: '24px 28px',
    textAlign: 'center',
    color: 'var(--faint)',
    fontSize: 13,
  },
}
