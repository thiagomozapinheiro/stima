/**
 * Tipos de PROPS (apresentação/UI) usados pelos subcomponentes da tela de
 * desafio (src/components/challenge/*).
 *
 * IMPORTANTE: estes NÃO são o schema de dados do desafio (isso é
 * responsabilidade do agente `data-architect`, em `src/types/challenge.ts`).
 * São apenas o formato "já pronto para renderizar" que cada componente
 * visual espera receber — o agente `ui-builder` é quem vai montar esses
 * objetos a partir do schema real + do estado de interação + da lógica em
 * src/lib/numericInput.ts e src/lib/rangeComparison.ts.
 *
 * TODO: quando o schema real existir, revisar se algum desses campos deve
 * passar a vir diretamente do schema em vez de ser um valor já computado.
 */

export interface MagnitudeOption {
  value: string
  label: string
  selected: boolean
}

export interface StepFeedback {
  icon: string
  text: string
  color: string
  background: string
  borderColor: string
}

export interface GuidedStepDisplay {
  question: string
  explain?: string
  unit?: string
  numberValue: string
  magnitude: string
  magnitudeOptions: MagnitudeOption[]
  onNumberChange: (value: string) => void
  onMagnitudeChange: (value: string) => void
  /** Avaliação pedagógica da premissa (nunca punitiva/"errado"). Ausente = ainda sem feedback. */
  feedback?: StepFeedback
}

export interface GuidedStageDisplay {
  title: string
  steps: GuidedStepDisplay[]
}

export interface FormulaLine {
  operator: string
  text: string
}

export interface FormulaDisplay {
  title: string
  lines: FormulaLine[]
}

export interface HintDisplay {
  n: number
  label: string
  text: string
  isOpen: boolean
  onToggle: () => void
}

export interface ReasoningStepDisplay {
  n: number
  label: string
  value: string
  note?: string
}

export interface VerdictDisplay {
  icon: string
  text: string
  color: string
  background: string
  borderColor: string
}
