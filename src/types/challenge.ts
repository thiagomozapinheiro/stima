/**
 * SCHEMA DE DADOS DOS DESAFIOS — Fonte única da verdade.
 * =====================================================================
 * Este arquivo define a FORMA (o "molde") de cada desafio de estimativa.
 * Todo o resto do app — as telas, a validação numérica, a persistência —
 * depende exatamente destes campos e destes nomes.
 *
 * Os dados de verdade ficam em `src/data/challenges/*.json` (um arquivo
 * por desafio) e são carregados por `src/data/index.ts`. Quem for escrever
 * ou editar desafios deve ler `src/data/README.md` — lá está a explicação
 * em português, para leigos, de como preencher cada campo.
 *
 * Convenções gerais:
 * - Campos marcados com `?` são OPCIONAIS: se você não tem a informação,
 *   simplesmente não inclua a linha no JSON (não coloque null nem "").
 * - Nada aqui contém lógica de cálculo. A conversão "número + ordem de
 *   grandeza -> valor absoluto" e a comparação com as faixas são feitas
 *   pelo agente `numeric-logic-engineer` (src/lib/*). Este arquivo só
 *   garante que os campos necessários existem.
 * =====================================================================
 */

/** Nível de dificuldade do desafio. Um desafio pertence a exatamente um nível. */
export type ChallengeLevel = 'Iniciante' | 'Interessado' | 'Expert'

/**
 * Ordens de grandeza aceitas no seletor "mil / milhões / ...".
 * São CHAVES canônicas sem acento (evita erro de digitação em JSON).
 * A ordem do array é a ordem crescente de tamanho — a UI usa esta ordem
 * para montar o seletor e o motor numérico usa a chave para multiplicar.
 *
 * Mapa chave -> rótulo exibido -> multiplicador:
 *   'unidades' -> "unidades" -> x1
 *   'mil'      -> "mil"       -> x1.000
 *   'milhoes'  -> "milhões"   -> x1.000.000
 *   'bilhoes'  -> "bilhões"   -> x1.000.000.000
 *   'trilhoes' -> "trilhões"  -> x1.000.000.000.000
 */
export const MAGNITUDES = ['unidades', 'mil', 'milhoes', 'bilhoes', 'trilhoes'] as const

export type Magnitude = (typeof MAGNITUDES)[number]

/**
 * Um valor no formato do app: um número + a ordem de grandeza que o
 * multiplica. É o mesmo formato usado no campo de estimativa final e em
 * cada microetapa guiada.
 *
 * Ex.: 1,6 milhões  ->  { "amount": 1.6, "magnitude": "milhoes" }
 *      800 mil      ->  { "amount": 800, "magnitude": "mil" }
 */
export interface Quantity {
  /**
   * O número em si. Para a estimativa do usuário o intervalo é 0,0 a 999,9
   * (uma casa decimal). Para valores definidos pelo administrador (faixas e
   * referência) recomenda-se ficar nessa mesma escala legível, escolhendo a
   * ordem de grandeza adequada. Em JSON use PONTO como separador decimal
   * (ex.: 1.6), nunca vírgula.
   */
  amount: number
  /** Ordem de grandeza que multiplica `amount`. */
  magnitude: Magnitude
}

/** Uma faixa (mínimo e máximo), cada extremo no formato número + ordem de grandeza. */
export interface QuantityRange {
  min: Quantity
  max: Quantity
}

/** Uma dica em texto. Um desafio tem, em geral, de 2 a 3 dicas. */
export interface Hint {
  /** Título curto da dica (aparece sempre). Ex.: "Encontre um ponto de partida". */
  label: string
  /** Texto completo da dica (aparece ao expandir). Nunca deve entregar a resposta. */
  text: string
}

/**
 * Uma microetapa (variável) do modo guiado: uma pergunta curta cujo valor o
 * usuário estima. Várias etapas juntas constroem a resposta final.
 */
export interface GuidedStep {
  /** Pergunta curta e direta. Ex.: "Quantas pessoas vivem na cidade?". */
  question: string
  /** Explicação/apoio opcional, em uma frase, exibida abaixo da pergunta. */
  explanation?: string
  /** Unidade fixa desta etapa, mostrada ao lado do campo. Ex.: "pessoas", "%". Opcional. */
  unit?: string
  /** Ordem de grandeza pré-selecionada no seletor desta etapa. */
  defaultMagnitude: Magnitude
  /** Dica contextual opcional, específica desta etapa. */
  hint?: string
  /**
   * Faixa aceitável (mín/máx) definida pelo administrador para avaliação
   * PEDAGÓGICA (não punitiva) da premissa do usuário. OMITA este campo
   * quando a etapa não tiver faixa definida ("Sem faixa definida") — nesse
   * caso a UI não mostra avaliação para a etapa.
   */
  acceptableRange?: QuantityRange
}

/** Um grupo de microetapas com um título de seção. Ex.: "Etapa 1 — Universo de usuários". */
export interface GuidedStage {
  title: string
  steps: GuidedStep[]
}

/** Uma linha da "estrutura construída" (fórmula visual) do modo guiado. */
export interface FormulaLine {
  /** Operador que liga esta linha à anterior. Ex.: "×", "÷", "+". A 1ª linha usa "". */
  operator: string
  /** Descrição da grandeza. Ex.: "população da cidade". */
  text: string
}

/** A "estrutura construída" mostrada ao final do roteiro guiado (opcional). */
export interface Formula {
  /** Título do resultado da fórmula. Ex.: "Corridas por dia". */
  title: string
  lines: FormulaLine[]
}

/**
 * Modo guiado do desafio. Presente apenas nos desafios que o administrador
 * pré-quebrou em etapas. OMITA o bloco `guided` inteiro para desafios que
 * só têm modo livre.
 */
export interface GuidedMode {
  stages: GuidedStage[]
  /** Fórmula visual final. Opcional. */
  formula?: Formula
}

/**
 * Um passo do "Raciocínio passo a passo" exibido junto da resposta oficial.
 * É o raciocínio estruturado do administrador (não depende do modo escolhido).
 */
export interface ReasoningStep {
  /** Rótulo do passo. Ex.: "População da cidade". */
  label: string
  /**
   * Valor/explicação do passo, em texto livre (não é um número calculado).
   * Ex.: "12.000.000", "~25% → 3.000.000".
   */
  value: string
  /** Observação complementar opcional, em uma frase. */
  note?: string
}

/**
 * A resposta oficial do desafio: referência, faixa esperada e o raciocínio
 * estruturado completo. Vale para os dois modos (guiado e livre).
 */
export interface Solution {
  /** Estimativa de referência (o "ponto" central da resposta). */
  referenceValue: Quantity
  /** Faixa de referência (mín/máx) usada para avaliar a estimativa final. */
  referenceRange: QuantityRange
  /** Raciocínio estruturado, passo a passo. */
  reasoning: ReasoningStep[]
}

/**
 * Um link de leitura complementar (artigo, relatório, etc.) exibido dentro
 * de "Oportunidades", abaixo do texto "Vale a pena ler sobre". Abre em uma
 * aba nova.
 */
export interface MaterialComplementar {
  /** Texto do link. Ex.: "Artigo da McKinsey sobre o tema". */
  titulo: string
  /** Endereço do link (URL completa, com "https://"). */
  url: string
}

/** Bloco "E se..." dentro da seção "Vá Além". */
export interface WhatIf {
  /** Premissa hipotética. Ex.: "…metade das corridas fosse feita por carros autônomos?". */
  premise: string
  /** Perguntas provocativas derivadas da premissa. */
  questions: string[]
}

/**
 * Seção opcional "Vá Além": leva da estimativa ao pensamento estratégico.
 * OMITA o bloco `goBeyond` inteiro nos desafios que não têm esta seção.
 */
export interface GoBeyond {
  /** Parágrafo sobre os impactos do tema. */
  impact: string
  /** Uma pergunta estratégica de destaque. */
  strategicQuestion: string
  /** Lista de oportunidades (negócios, tecnologias, etc.). */
  opportunities: string[]
  /**
   * Links de leitura complementar (artigos, relatórios), exibidos dentro de
   * "Oportunidades". OPCIONAL — omita o campo inteiro quando não houver nenhum.
   */
  materiaisComplementares?: MaterialComplementar[]
  /** Bloco "E se...". */
  whatIf: WhatIf
}

/**
 * UM DESAFIO COMPLETO. É a raiz de cada arquivo em `src/data/challenges/`.
 */
export interface Challenge {
  /**
   * Identificador único e estável (usado para salvar o progresso do usuário).
   * Convenção sugerida: "AAAA-MM-DD-nivel". Ex.: "2026-07-14-iniciante".
   * Uma vez publicado, NÃO mude o id (o usuário perderia o progresso salvo).
   */
  id: string
  /**
   * Tema / categoria do desafio — CAMPO LIVRE (texto). Ex.: "Mobilidade e
   * Infra", "Saúde", "Fora da Caixa". Não há lista fixa: escreva o tema.
   * Desafios do mesmo dia normalmente compartilham o mesmo tema.
   */
  theme: string
  level: ChallengeLevel
  /** Data de publicação no formato "AAAA-MM-DD". Ex.: "2026-07-14". */
  publishedAt: string
  /** Título do desafio. Ex.: "Corridas de aplicativo em São Paulo". */
  title: string
  /** Resumo de uma linha, usado nos cartões da Home e do arquivo. */
  teaser: string
  /** Enunciado completo do problema. */
  prompt: string
  /** Unidade fixa da resposta final. Ex.: "corridas/dia", "litros/dia", "por ano". */
  unit: string
  /**
   * Marque como true quando a resposta é um valor em dinheiro (R$), para a UI
   * formatar como moeda. Omita (ou false) caso contrário.
   */
  currency?: boolean
  /** As dicas do desafio (recomendado: 2 a 3). */
  hints: Hint[]
  /** Modo guiado. OMITA para desafios só com modo livre. */
  guided?: GuidedMode
  /** Resposta oficial (referência, faixa e raciocínio). Obrigatória. */
  solution: Solution
  /** Seção "Vá Além". OMITA quando o desafio não tiver esta seção. */
  goBeyond?: GoBeyond
}
