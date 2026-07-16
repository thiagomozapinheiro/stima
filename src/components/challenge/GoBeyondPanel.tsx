import type { CSSProperties } from 'react'

export interface MaterialComplementarDisplay {
  titulo: string
  url: string
}

export interface GoBeyondPanelProps {
  impact: string
  strategicQuestion: string
  opportunities: string[]
  /** Links de leitura complementar, exibidos dentro de "Oportunidades". Ausente/vazio = lista não aparece. */
  materiaisComplementares?: MaterialComplementarDisplay[]
  whatIfPremise: string
  whatIfQuestions: string[]
}

/**
 * Painel "Vá além" — impactos, pergunta estratégica, oportunidades
 * (com materiais complementares, se houver) e "E se...". Réplica visual da
 * seção VÁ ALÉM.
 *
 * No design original, esta seção é sempre renderizada quando `checked` é
 * verdadeiro (não há um "sc-if" próprio para ausência de conteúdo). Como o
 * schema definitivo (data-architect) trata "Vá Além" como opcional por
 * desafio, este componente deve simplesmente não ser renderizado pelo
 * `ChallengePage`/`ui-builder` quando os dados não existirem — decisão
 * documentada aqui em vez de assumida silenciosamente.
 */
export default function GoBeyondPanel({
  impact,
  strategicQuestion,
  opportunities,
  materiaisComplementares,
  whatIfPremise,
  whatIfQuestions,
}: GoBeyondPanelProps) {
  return (
    <div className="stima-gobeyond-wrap" style={styles.wrap}>
      <div style={styles.eyebrow}>↗ Vá além</div>
      <div style={styles.subEyebrow}>
        Da estimativa ao pensamento estratégico — pense por conta própria.
      </div>

      <div style={styles.section}>
        <h4 style={styles.h4}>Impactos</h4>
        <p className="stima-gobeyond-paragraph" style={styles.paragraph}>
          {impact}
        </p>
      </div>

      <div className="stima-gobeyond-strategic-box" style={styles.strategicBox}>
        <div style={styles.strategicLabel}>Pergunta estratégica</div>
        <p className="stima-gobeyond-strategic-text" style={styles.strategicText}>
          {strategicQuestion}
        </p>
      </div>

      <div style={styles.section}>
        <h4 style={styles.h4}>Oportunidades</h4>
        <div style={styles.listCol}>
          {opportunities.map((o, i) => (
            <div key={i} style={styles.bulletRow}>
              <span style={styles.bulletDot} />
              <span style={styles.bulletText}>{o}</span>
            </div>
          ))}
        </div>
        {materiaisComplementares && materiaisComplementares.length > 0 && (
          <>
            <p
              className="stima-gobeyond-paragraph"
              style={{ ...styles.paragraph, marginTop: 18, marginBottom: 10 }}
            >
              Vale a pena ler sobre:
            </p>
            <div className="stima-gobeyond-materials" style={styles.materialsCol}>
              {materiaisComplementares.map((m, i) => (
                <a
                  key={i}
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="stima-gobeyond-material-link"
                  style={styles.materialLink}
                >
                  ↗ {m.titulo}
                </a>
              ))}
            </div>
          </>
        )}
      </div>

      <div style={styles.sectionBordered}>
        <h4 style={styles.h4}>E se...</h4>
        <p className="stima-gobeyond-whatif-premise" style={styles.whatIfPremise}>
          {whatIfPremise}
        </p>
        <div style={styles.listCol}>
          {whatIfQuestions.map((q, i) => (
            <div key={i} style={styles.bulletRow}>
              <span style={styles.arrow}>→</span>
              <span style={styles.bulletText}>{q}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  wrap: {
    marginTop: 28,
    background: 'var(--card-2)',
    border: '1px dashed var(--border-strong)',
    borderRadius: 18,
    padding: '28px 28px 30px',
  },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--accent)',
    marginBottom: 6,
  },
  subEyebrow: { fontSize: 14, color: 'var(--faint2)', marginBottom: 26 },
  section: { marginBottom: 26 },
  sectionBordered: {
    marginBottom: 26,
    borderTop: '1px solid var(--border-2)',
    paddingTop: 24,
  },
  h4: { fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 8 },
  paragraph: { fontSize: 15.5, lineHeight: 1.62, color: 'var(--text-3)', margin: 0 },
  strategicBox: {
    marginBottom: 26,
    background: 'var(--card)',
    borderLeft: '3px solid var(--accent)',
    borderRadius: '0 12px 12px 0',
    padding: '16px 20px',
  },
  strategicLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--dim)',
    fontWeight: 600,
    marginBottom: 8,
  },
  strategicText: {
    fontSize: 16.5,
    lineHeight: 1.55,
    color: 'var(--text)',
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 500,
    margin: 0,
  },
  listCol: { display: 'flex', flexDirection: 'column', gap: 9 },
  bulletRow: { display: 'flex', gap: 11, alignItems: 'flex-start' },
  bulletDot: {
    flexShrink: 0,
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--accent)',
    marginTop: 8,
  },
  bulletText: { fontSize: 15.5, lineHeight: 1.5, color: 'var(--text-3)' },
  materialsCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginTop: 14,
  },
  materialLink: {
    fontSize: 13.5,
    color: 'var(--dim)',
    textDecoration: 'none',
    width: 'fit-content',
  },
  whatIfPremise: {
    fontSize: 16,
    lineHeight: 1.55,
    color: 'var(--text)',
    fontWeight: 600,
    margin: '0 0 12px',
  },
  arrow: { flexShrink: 0, color: 'var(--accent)', fontSize: 15, marginTop: 1 },
}
