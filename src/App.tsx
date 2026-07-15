import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import Header, { type Screen } from './components/Header'
import Footer from './components/Footer'
import HomeContainer from './pages/HomeContainer'
import ArchiveContainer from './pages/ArchiveContainer'
import ChallengeContainer from './pages/ChallengeContainer'
import { ProgressProvider } from './state/ProgressProvider'

/**
 * Layout comum (Header + rotas + Footer). Fica dentro do `BrowserRouter`
 * porque usa `useLocation`/`useNavigate` para destacar a navegação ativa no
 * `Header` e alternar de tela.
 */
function Layout() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const activeScreen: Screen = location.pathname.startsWith('/arquivo')
    ? 'archive'
    : location.pathname.startsWith('/desafio')
      ? 'challenge'
      : 'home'

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header
        activeScreen={activeScreen}
        onNavigateHome={() => navigate('/')}
        onNavigateArchive={() => navigate('/arquivo')}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
      />

      <Routes>
        <Route path="/" element={<HomeContainer />} />
        <Route path="/arquivo" element={<ArchiveContainer />} />
        <Route path="/desafio/:id" element={<ChallengeContainer />} />
        {/* Rota desconhecida: volta para o início em vez de tela em branco. */}
        <Route path="*" element={<HomeContainer />} />
      </Routes>

      <Footer />
    </div>
  )
}

/**
 * Raiz do app: dados reais (src/data), lógica numérica (src/lib) e
 * componentes visuais (src/components, src/pages) já conectados.
 *
 * O progresso de desafios resolvidos (`ProgressProvider`) é persistido entre
 * visitas via `localStorage` (ver `src/lib/storage.ts`), sem backend nem
 * login.
 */
export default function App() {
  return (
    <ProgressProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </ProgressProvider>
  )
}
