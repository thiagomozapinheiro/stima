/**
 * PERSISTÊNCIA LOCAL DO PROGRESSO DO USUÁRIO — sem backend, sem login.
 * =====================================================================
 * Tudo que o app "lembra" entre visitas (quais desafios já foram resolvidos,
 * o histórico de chutes de cada um e a sequência de dias ativos) fica salvo
 * só no `localStorage` do navegador. Este é o ÚNICO arquivo do projeto que
 * pode tocar em `localStorage` diretamente — nenhum componente de UI (nem o
 * `ProgressProvider`) deve chamar `window.localStorage` fora daqui. Isso
 * mantém a lógica de armazenamento isolada e fácil de testar/trocar depois
 * (ex.: se um dia o produto ganhar login e backend).
 *
 * O QUE É SALVO (e por quê é seguro):
 *   - `id` do desafio (já é um identificador público de conteúdo, não do
 *     usuário).
 *   - Valores numéricos normalizados dos chutes (nenhum texto livre digitado).
 *   - Timestamps ISO de quando cada chute/desafio foi resolvido.
 * NADA de nome, e-mail, IP ou qualquer identificador do usuário é salvo aqui
 * — não há usuário "de verdade", só um navegador anônimo.
 *
 * NAMESPACE E VERSIONAMENTO:
 * Tudo fica embaixo de UMA chave só (`fermi:v1:progress`), com um campo
 * `version` dentro do JSON. Isso evita colidir com outros dados que o site
 * (ou outros sites na mesma origem, improvável mas grátis de evitar) possam
 * guardar no navegador, e permite migrar o formato no futuro sem quebrar
 * dados antigos: quando o formato mudar, cria-se uma versão nova (ex. `v2`)
 * e um passo de migração aqui dentro (`readStore` já tem o ponto de extensão
 * comentado abaixo). Dados de um formato desconhecido/incompatível são
 * tratados como "sem progresso salvo" em vez de arriscar interpretar algo
 * errado — pior caso, o usuário perde o progresso local, mas o site nunca
 * quebra por causa disso.
 *
 * DEGRADAÇÃO GRACIOSA:
 * `localStorage` pode não existir ou lançar exceção em vários cenários reais
 * (modo privado de alguns navegadores, cota excedida, bloqueio por política
 * do navegador/extensão, execução em ambiente sem `window`, etc.). TODA
 * leitura e escrita aqui é protegida por `try/catch`: se falhar, a função
 * simplesmente se comporta como se não houvesse nada salvo (leitura) ou não
 * faz nada (escrita) — nunca lança para quem chamou. O site continua
 * funcionando normalmente, só não persiste entre visitas nesse caso.
 * =====================================================================
 */

const STORAGE_KEY = 'fermi:v1:progress'
const CURRENT_VERSION = 1

/** Máximo de chutes guardados por desafio (evita crescimento sem limite). */
const MAX_GUESSES_PER_CHALLENGE = 50

/** Um chute registrado: valor já normalizado (valor absoluto) + quando. */
export interface GuessRecord {
  /** Valor absoluto do chute (ver `normalizeAmount`/`normalizeQuantity`), não o texto digitado. */
  value: number
  /** Timestamp ISO 8601 (`Date.toISOString()`) de quando o chute foi registrado. */
  timestamp: string
}

/** Progresso de um desafio específico. */
interface ChallengeProgress {
  solved: boolean
  /** Timestamp ISO de quando o desafio foi marcado como resolvido pela 1ª vez. */
  solvedAt?: string
  /** Histórico de chutes registrados para este desafio, do mais antigo ao mais novo. */
  guesses: GuessRecord[]
}

/** Formato completo salvo em `localStorage` (versão atual). */
interface ProgressStoreV1 {
  version: 1
  /** Progresso por `Challenge.id`. */
  challenges: Record<string, ChallengeProgress>
  /**
   * Datas ("AAAA-MM-DD", no fuso local do navegador) em que pelo menos um
   * desafio foi resolvido. Base para o cálculo do streak. Mantido como lista
   * própria (em vez de derivar de `solvedAt` toda vez) para o cálculo de
   * streak ser O(1) por dia, e para sobreviver mesmo que no futuro um
   * desafio resolvido seja removido do catálogo.
   */
  solvedDates: string[]
}

function emptyStore(): ProgressStoreV1 {
  return { version: CURRENT_VERSION, challenges: {}, solvedDates: [] }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Valida (de forma tolerante) que um valor parseado do JSON tem a forma
 * mínima esperada de um `ChallengeProgress`. Campos ausentes/errados viram
 * valores neutros em vez de derrubar a leitura inteira — um usuário não deve
 * perder TODO o progresso por causa de uma entrada corrompida.
 */
function sanitizeChallengeProgress(value: unknown): ChallengeProgress {
  if (!isPlainObject(value)) return { solved: false, guesses: [] }

  const guessesRaw = Array.isArray(value.guesses) ? value.guesses : []
  const guesses: GuessRecord[] = guessesRaw
    .filter(
      (g): g is GuessRecord =>
        isPlainObject(g) && typeof g.value === 'number' && typeof g.timestamp === 'string',
    )
    .map((g) => ({ value: g.value, timestamp: g.timestamp }))

  return {
    solved: value.solved === true,
    solvedAt: typeof value.solvedAt === 'string' ? value.solvedAt : undefined,
    guesses,
  }
}

/**
 * Interpreta o JSON bruto lido do `localStorage`, migrando/validando o
 * formato. Qualquer coisa fora do esperado (versão desconhecida, JSON
 * corrompido, tipos errados) resulta em "sem progresso salvo" em vez de
 * lançar — ver nota de degradação graciosa no topo do arquivo.
 */
function parseStore(raw: string): ProgressStoreV1 {
  const parsed: unknown = JSON.parse(raw)
  if (!isPlainObject(parsed)) return emptyStore()

  // PONTO DE EXTENSÃO PARA MIGRAÇÃO: quando existir uma v2, trate aqui, ex.:
  //   if (parsed.version === 1) return migrateV1ToV2(parsed as ProgressStoreV1)
  // Por ora só existe a v1; qualquer outra versão (inclusive ausente) é
  // tratada como dado incompatível/desconhecido.
  if (parsed.version !== CURRENT_VERSION) return emptyStore()

  const challengesRaw = isPlainObject(parsed.challenges) ? parsed.challenges : {}
  const challenges: Record<string, ChallengeProgress> = {}
  for (const [id, value] of Object.entries(challengesRaw)) {
    challenges[id] = sanitizeChallengeProgress(value)
  }

  const solvedDates = Array.isArray(parsed.solvedDates)
    ? parsed.solvedDates.filter((d): d is string => typeof d === 'string')
    : []

  return { version: CURRENT_VERSION, challenges, solvedDates }
}

/**
 * Acesso ao `localStorage` do jeito mais defensivo possível: além de checar
 * se `window`/`localStorage` existem (SSR, navegadores sem suporte), o
 * simples "existir" não garante que ler/escrever funcione (ex.: Safari em
 * modo privado expõe o objeto normalmente, mas `setItem` lança na hora).
 */
function getLocalStorage(): Storage | undefined {
  try {
    if (typeof globalThis === 'undefined') return undefined
    const storage = (globalThis as { localStorage?: Storage }).localStorage
    return storage
  } catch {
    return undefined
  }
}

/** Lê e valida o progresso salvo. Nunca lança — na falha, devolve um progresso vazio. */
function readStore(): ProgressStoreV1 {
  const storage = getLocalStorage()
  if (!storage) return emptyStore()

  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return emptyStore()
    return parseStore(raw)
  } catch {
    // JSON corrompido, `getItem` bloqueado por política do navegador, etc.
    return emptyStore()
  }
}

/**
 * Grava o progresso. Nunca lança — na falha (cota excedida, modo privado,
 * storage indisponível), simplesmente não persiste e devolve `false`, para o
 * chamador decidir se quer registrar/ignorar (hoje ninguém precisa agir
 * sobre isso: a UI já reflete o estado em memória de qualquer forma).
 */
function writeStore(store: ProgressStoreV1): boolean {
  const storage = getLocalStorage()
  if (!storage) return false

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(store))
    return true
  } catch {
    return false
  }
}

/** "AAAA-MM-DD" na data LOCAL (não UTC) — mesma convenção de `formatDate.ts`. */
function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(date: Date, deltaDays: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + deltaDays)
  return next
}

function getOrCreateChallengeProgress(
  store: ProgressStoreV1,
  challengeId: string,
): ChallengeProgress {
  return store.challenges[challengeId] ?? { solved: false, guesses: [] }
}

// =====================================================================
// API pública
// =====================================================================

/** Verifica se o desafio já foi marcado como resolvido nesta máquina. */
export function isChallengeSolved(challengeId: string): boolean {
  return readStore().challenges[challengeId]?.solved === true
}

/** Ids de todos os desafios já resolvidos (para hidratar o estado em memória da UI). */
export function getSolvedChallengeIds(): string[] {
  const store = readStore()
  return Object.keys(store.challenges).filter((id) => store.challenges[id].solved)
}

/**
 * Marca um desafio como resolvido (idempotente: chamar de novo não altera
 * `solvedAt` nem duplica a data no streak). Também registra o dia de hoje
 * como um "dia ativo" para o cálculo de streak.
 */
export function markChallengeSolved(challengeId: string, when: Date = new Date()): void {
  const store = readStore()
  const progress = getOrCreateChallengeProgress(store, challengeId)

  if (!progress.solved) {
    progress.solved = true
    progress.solvedAt = when.toISOString()
  }
  store.challenges[challengeId] = progress

  const dateKey = toDateKey(when)
  if (!store.solvedDates.includes(dateKey)) {
    store.solvedDates = [...store.solvedDates, dateKey].sort()
  }

  writeStore(store)
}

/**
 * Registra um chute do usuário para um desafio (valor já normalizado +
 * timestamp). Mantém no máximo `MAX_GUESSES_PER_CHALLENGE` entradas por
 * desafio (descarta as mais antigas) para o armazenamento não crescer sem
 * limite ao longo do tempo.
 */
export function recordGuess(
  challengeId: string,
  normalizedValue: number,
  when: Date = new Date(),
): void {
  const store = readStore()
  const progress = getOrCreateChallengeProgress(store, challengeId)

  const guesses = [...progress.guesses, { value: normalizedValue, timestamp: when.toISOString() }]
  progress.guesses =
    guesses.length > MAX_GUESSES_PER_CHALLENGE
      ? guesses.slice(guesses.length - MAX_GUESSES_PER_CHALLENGE)
      : guesses

  store.challenges[challengeId] = progress
  writeStore(store)
}

/** Histórico de chutes registrados para um desafio, do mais antigo ao mais novo. */
export function getGuessHistory(challengeId: string): GuessRecord[] {
  return readStore().challenges[challengeId]?.guesses ?? []
}

/**
 * Valor absoluto do último chute registrado para um desafio, ou `undefined`
 * se nunca houve chute. Usado para reabrir um desafio já resolvido direto na
 * tela de resultado (ver `ChallengeContainer.tsx`), em vez de mandar o
 * usuário de volta a um formulário em branco.
 */
export function getLastGuess(challengeId: string): number | undefined {
  const guesses = getGuessHistory(challengeId)
  return guesses.length > 0 ? guesses[guesses.length - 1].value : undefined
}

/**
 * Calcula o streak (nº de dias SEGUIDOS com pelo menos um desafio resolvido),
 * contando a partir de `referenceDate` (padrão: agora).
 *
 * Regra: o streak é "vivo" tanto se hoje já teve desafio resolvido quanto se
 * só ontem teve (ainda dá tempo de resolver algo hoje sem perder a
 * sequência) — por isso a contagem começa em hoje OU, se hoje ainda estiver
 * vazio, em ontem. Se nem ontem nem hoje tiverem desafio resolvido, o
 * streak já está quebrado e o resultado é 0.
 */
export function getStreak(referenceDate: Date = new Date()): number {
  const store = readStore()
  if (store.solvedDates.length === 0) return 0

  const solvedSet = new Set(store.solvedDates)
  let cursor = referenceDate
  if (!solvedSet.has(toDateKey(cursor))) {
    cursor = addDays(cursor, -1)
  }

  let streak = 0
  while (solvedSet.has(toDateKey(cursor))) {
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}

/**
 * Indica se a persistência está disponível neste navegador/contexto agora.
 * Não é necessária para o funcionamento normal (todas as funções acima já
 * degradam sozinhas), mas fica exposta caso a UI queira, no futuro, avisar
 * discretamente o usuário que o progresso não está sendo salvo.
 */
export function isStorageAvailable(): boolean {
  const storage = getLocalStorage()
  if (!storage) return false
  const probeKey = `${STORAGE_KEY}:__probe__`
  try {
    storage.setItem(probeKey, '1')
    storage.removeItem(probeKey)
    return true
  } catch {
    return false
  }
}
