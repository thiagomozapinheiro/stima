import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ChallengePage, { type ResultsDisplayData } from './ChallengePage'
import type { ResolutionMode } from '../components/challenge/ModeSelector'
import type { GuidedStageDisplay } from '../components/challenge/challengeUiTypes'
import type { GoBeyondPanelProps } from '../components/challenge/GoBeyondPanel'
import { getChallengeById } from '../data'
import type { Challenge, Magnitude } from '../types/challenge'
import { isMagnitude, normalizeAmount, normalizeQuantity, parseAmountInput } from '../lib/numericInput'
import { compareToRange } from '../lib/rangeComparison'
import {
  buildFinalVerdict,
  buildMagnitudeOptions,
  buildStepFeedback,
  computeBarLayout,
  formatAbsoluteValue,
} from '../lib/challengeDisplay'
import { formatShortDateLabel } from '../lib/formatDate'
import { useProgress } from '../state/useProgress'

/** Entrada bruta (ainda não validada) de uma microetapa guiada. */
interface GuidedInputState {
  raw: string
  magnitude: Magnitude
}

function toMagnitude(value: string, fallback: Magnitude): Magnitude {
  return isMagnitude(value) ? value : fallback
}

/**
 * Resolve o `id` da rota para um `Challenge` e trata o caso de id
 * inexistente. A interação em si vive em `ChallengeView`, montada com
 * `key={challenge.id}` — assim, ao navegar de um desafio para outro (sem
 * desmontar esta rota), o React remonta `ChallengeView` do zero e todo o
 * estado de interação (dicas, modo, respostas) reinicia naturalmente, sem
 * precisar de um efeito imperativo para "limpar" o estado antigo.
 */
export default function ChallengeContainer() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const challenge = id ? getChallengeById(id) : undefined

  if (!challenge) {
    // Não há uma tela de "não encontrado" definida pelo design ainda
    // (ambiguidade: nenhuma referência visual para id inválido/removido).
    // Por ora devolvemos um estado mínimo com um caminho de volta ao início.
    return (
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '60px 28px', textAlign: 'center' }}>
        <p>Desafio não encontrado.</p>
        <button onClick={() => navigate('/')}>Voltar para o início</button>
      </main>
    )
  }

  return <ChallengeView key={challenge.id} challenge={challenge} />
}

function ChallengeView({ challenge }: { challenge: Challenge }) {
  const navigate = useNavigate()
  const { markSolved, recordGuess, isSolved, getLastGuess } = useProgress()

  const [openHints, setOpenHints] = useState<Record<number, boolean>>({})
  const [mode, setMode] = useState<ResolutionMode>(challenge.guided ? 'guided' : 'free')
  const [guidedInputs, setGuidedInputs] = useState<Record<string, GuidedInputState>>({})
  const [guessRaw, setGuessRaw] = useState('')
  const [guessMagnitude, setGuessMagnitude] = useState<Magnitude>('milhoes')
  // Se o desafio já foi resolvido antes (localStorage), reabrimos direto na
  // tela de resultado com o último chute salvo, em vez de mandar o usuário
  // de volta a um formulário em branco (o CTA na Home/Archive diz "Rever
  // solução" — precisa mostrar a solução de fato). `resultGuessAbs` guarda o
  // valor absoluto do chute exibido no painel de resultado; ao recalcular a
  // resposta (`checkAnswer`), ele passa a refletir o chute novo.
  const [resultGuessAbs, setResultGuessAbs] = useState<number | undefined>(() =>
    isSolved(challenge.id) ? getLastGuess(challenge.id) : undefined,
  )
  const [checked, setChecked] = useState(() => resultGuessAbs !== undefined)

  // Sobe a página ao abrir um desafio (efeito colateral externo ao React,
  // não estado — por isso não entra em conflito com o remount via `key`).
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const hasGuidedMode = !!challenge.guided
  const showGuided = mode === 'guided' && hasGuidedMode

  function toggleHint(index: number) {
    setOpenHints((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  function selectGuidedMode() {
    // O `ModeSelector` do design não tem uma variante "desabilitada" para
    // quando o desafio não tem roteiro guiado — por isso o botão continua
    // clicável, mas simplesmente não tem efeito nesse caso (decisão
    // documentada aqui em vez de assumida em silêncio).
    if (hasGuidedMode) setMode('guided')
  }
  function selectFreeMode() {
    setMode('free')
  }

  // --- microetapas do modo guiado -------------------------------------
  let guidedFilled = 0
  let guidedTotal = 0
  const guidedStages: GuidedStageDisplay[] | undefined = challenge.guided?.stages.map(
    (stage, stageIndex) => ({
      title: stage.title,
      steps: stage.steps.map((step, stepIndex) => {
        const key = `${stageIndex}:${stepIndex}`
        const input = guidedInputs[key] ?? { raw: '', magnitude: step.defaultMagnitude }
        guidedTotal += 1

        const parsed = parseAmountInput(input.raw)
        if (parsed.ok) guidedFilled += 1

        const feedback =
          parsed.ok && step.acceptableRange
            ? buildStepFeedback(
                compareToRange(normalizeAmount(parsed.value, input.magnitude), step.acceptableRange),
              )
            : undefined

        return {
          question: step.question,
          explain: step.explanation,
          unit: step.unit,
          numberValue: input.raw,
          magnitude: input.magnitude,
          magnitudeOptions: buildMagnitudeOptions(input.magnitude),
          onNumberChange: (value: string) =>
            setGuidedInputs((prev) => ({
              ...prev,
              [key]: { ...(prev[key] ?? { magnitude: step.defaultMagnitude }), raw: value },
            })),
          onMagnitudeChange: (value: string) =>
            setGuidedInputs((prev) => ({
              ...prev,
              [key]: {
                ...(prev[key] ?? { raw: '' }),
                magnitude: toMagnitude(value, step.defaultMagnitude),
              },
            })),
          feedback,
        }
      }),
    }),
  )

  const modeExplainText = showGuided
    ? 'Divida o problema em etapas, estime cada variável e construa sua resposta progressivamente.'
    : hasGuidedMode
      ? 'Estruture o problema do seu jeito e registre apenas sua linha de raciocínio e a estimativa final.'
      : 'Estruture o problema do seu jeito e registre sua estimativa final. Este desafio ainda não tem roteiro guiado.'

  // --- estimativa final -------------------------------------------------
  const parsedGuess = parseAmountInput(guessRaw)
  const checkDisabled = !parsedGuess.ok

  function checkAnswer() {
    if (!parsedGuess.ok) return
    const guessAbs = normalizeAmount(parsedGuess.value, guessMagnitude)
    recordGuess(challenge.id, guessAbs)
    setResultGuessAbs(guessAbs)
    setChecked(true)
    markSolved(challenge.id)
    window.scrollTo(0, 0)
  }

  let results: ResultsDisplayData | undefined
  if (checked && resultGuessAbs !== undefined) {
    const guessAbs = resultGuessAbs
    const lowAbs = normalizeQuantity(challenge.solution.referenceRange.min)
    const highAbs = normalizeQuantity(challenge.solution.referenceRange.max)
    const pointAbs = normalizeQuantity(challenge.solution.referenceValue)
    const state = compareToRange(guessAbs, challenge.solution.referenceRange)
    const bar = computeBarLayout(lowAbs, highAbs, pointAbs, guessAbs)

    results = {
      guessDisplay: formatAbsoluteValue(guessAbs, challenge.currency),
      rangeDisplay: `${formatAbsoluteValue(lowAbs, challenge.currency)} – ${formatAbsoluteValue(highAbs, challenge.currency)}`,
      bandLeft: bar.bandLeft,
      bandWidth: bar.bandWidth,
      pointPos: bar.pointPos,
      guessPos: bar.guessPos,
      guessColor: state === 'dentro_da_faixa' ? 'var(--accent)' : 'var(--warn)',
      verdict: buildFinalVerdict(state, guessAbs, pointAbs),
      steps: challenge.solution.reasoning.map((step, i) => ({
        n: i + 1,
        label: step.label,
        value: step.value,
        note: step.note,
      })),
      pointDisplay: formatAbsoluteValue(pointAbs, challenge.currency),
    }
  }

  const goBeyond: GoBeyondPanelProps | undefined = challenge.goBeyond
    ? {
        impact: challenge.goBeyond.impact,
        strategicQuestion: challenge.goBeyond.strategicQuestion,
        opportunities: challenge.goBeyond.opportunities,
        materiaisComplementares: challenge.goBeyond.materiaisComplementares,
        whatIfPremise: challenge.goBeyond.whatIf.premise,
        whatIfQuestions: challenge.goBeyond.whatIf.questions,
      }
    : undefined

  return (
    <ChallengePage
      // `navigate(-1)` volta para a Home ou o Arquivo, de onde quer que o
      // usuário tenha vindo. Em acesso direto por link (sem histórico), o
      // React Router simplesmente não navega — ambiguidade de design (não
      // há uma tela de "desafio isolado" prevista) resolvida da forma mais
      // simples possível aqui.
      onGoBack={() => navigate(-1)}
      theme={challenge.theme}
      level={challenge.level}
      dateShort={formatShortDateLabel(challenge.publishedAt)}
      title={challenge.title}
      prompt={challenge.prompt}
      unit={challenge.unit}
      hints={challenge.hints.map((hint, i) => ({
        n: i + 1,
        label: hint.label,
        text: hint.text,
        isOpen: !!openHints[i],
        onToggle: () => toggleHint(i),
      }))}
      checked={checked}
      mode={mode}
      onSelectGuidedMode={selectGuidedMode}
      onSelectFreeMode={selectFreeMode}
      modeExplainText={modeExplainText}
      hasGuidedMode={hasGuidedMode}
      showGuided={showGuided}
      guidedStages={guidedStages}
      guidedFilledCount={guidedFilled}
      guidedTotalCount={guidedTotal}
      guidedProgressPercent={guidedTotal ? Math.round((guidedFilled / guidedTotal) * 100) : 0}
      guidedFormula={challenge.guided?.formula}
      finalEstimateLabel={showGuided ? 'Sua estimativa final' : 'Sua estimativa'}
      guessNumberValue={guessRaw}
      onGuessNumberChange={setGuessRaw}
      guessMagnitude={guessMagnitude}
      onGuessMagnitudeChange={(value) => setGuessMagnitude(toMagnitude(value, guessMagnitude))}
      magnitudeOptions={buildMagnitudeOptions(guessMagnitude)}
      onCheckAnswer={checkAnswer}
      checkDisabled={checkDisabled}
      results={results}
      goBeyond={goBeyond}
    />
  )
}
