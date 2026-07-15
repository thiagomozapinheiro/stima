import type { CSSProperties } from 'react'

export type Screen = 'home' | 'challenge' | 'archive'

export interface HeaderProps {
  /** Tela atualmente ativa, usada só para destacar o item de navegação certo. */
  activeScreen: Screen
  onNavigateHome: () => void
  onNavigateArchive: () => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

/**
 * Cabeçalho fixo (sticky) com logo, navegação Home/Archive e alternância de tema.
 * Réplica visual da seção <!-- HEADER --> do design original.
 */
export default function Header({
  activeScreen,
  onNavigateHome,
  onNavigateArchive,
  theme,
  onToggleTheme,
}: HeaderProps) {
  const isHome = activeScreen === 'home'
  const isArchive = activeScreen === 'archive'

  return (
    <header style={styles.header}>
      <div className="stima-header-container" style={styles.container}>
        <div
          onClick={onNavigateHome}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onNavigateHome()
            }
          }}
          className="stima-header-logo"
          style={styles.logoWrap}
        >
          <span className="stima-header-logo-icon" style={styles.logoIconWrap}>
            <img src="/stima-icon.png" alt="Stima" style={styles.logoImg} />
          </span>
          <span className="stima-header-logo-text" style={styles.logoText}>
            Stima
          </span>
        </div>
        <nav className="stima-header-nav" style={styles.nav}>
          <button
            onClick={onNavigateHome}
            className="stima-header-navbtn"
            style={{
              ...styles.navBtn,
              color: isHome ? 'var(--accent)' : 'var(--text-2)',
              background: isHome ? 'var(--accent-chip)' : 'transparent',
            }}
          >
            Desafio do Dia
          </button>
          <button
            onClick={onNavigateArchive}
            className="stima-header-navbtn"
            style={{
              ...styles.navBtn,
              color: isArchive ? 'var(--accent)' : 'var(--text-2)',
              background: isArchive ? 'var(--accent-chip)' : 'transparent',
            }}
          >
            Outros Desafios
          </button>
          <button
            onClick={onToggleTheme}
            title="Alternar modo claro / escuro"
            className="stima-theme-toggle stima-header-theme-btn"
            style={styles.themeBtn}
          >
            {theme === 'light' ? '☀' : '☾'}
          </button>
        </nav>
      </div>
    </header>
  )
}

const styles: Record<string, CSSProperties> = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    background: 'var(--header-bg)',
    backdropFilter: 'blur(14px)',
    borderBottom: '1px solid var(--border-faint)',
  },
  container: {
    maxWidth: 1120,
    margin: '0 auto',
    padding: '16px 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 11,
    cursor: 'pointer',
  },
  logoIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    overflow: 'hidden',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
  },
  logoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  logoText: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 600,
    fontSize: 20,
    letterSpacing: '-0.01em',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  navBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 15,
    fontWeight: 500,
    padding: '9px 16px',
    borderRadius: 999,
    transition: 'color .15s',
  },
  themeBtn: {
    marginLeft: 4,
    background: 'var(--accent-chip)',
    border: '1px solid var(--border)',
    cursor: 'pointer',
    width: 40,
    height: 40,
    borderRadius: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    color: 'var(--accent)',
    transition: 'background .15s, border-color .15s',
  },
}
