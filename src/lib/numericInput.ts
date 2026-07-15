/**
 * MOTOR DE ENTRADA NUMÉRICA — parsing, validação e normalização.
 * =====================================================================
 * Esta é a lógica numérica crítica do produto. Ela transforma o que o
 * usuário digita ("125,5" + "milhões") no VALOR ABSOLUTO usado para
 * comparar respostas (125.500.000). Se ela tiver bugs, toda comparação
 * de resposta no site fica silenciosamente errada — por isso trate cada
 * função aqui como código de alta criticidade e não a reimplemente na UI:
 * consuma-a diretamente.
 *
 * Divisão de responsabilidades:
 *   - `parseAmountInput`   : texto livre digitado -> número validado (0..999,9).
 *   - `normalizeAmount`    : (número + ordem de grandeza) -> valor absoluto.
 *   - `normalizeQuantity`  : mesmo que acima, mas a partir de um `Quantity`.
 *
 * A UI decide o TEXTO das mensagens; aqui só devolvemos estados/códigos
 * neutros e valores. Nada de copy amigável neste arquivo.
 * =====================================================================
 */

import type { Magnitude, Quantity } from '../types/challenge'
import { MAGNITUDES } from '../types/challenge'

/**
 * Multiplicador de cada ordem de grandeza. As chaves são exatamente as de
 * `MAGNITUDES` (sem acento), então adicionar uma nova ordem no schema quebra
 * este objeto em tempo de compilação (o `Record<Magnitude, number>` obriga a
 * mapear todas). Isso é proposital: garante que o motor nunca fique defasado.
 */
export const MAGNITUDE_MULTIPLIERS: Record<Magnitude, number> = {
  unidades: 1,
  mil: 1_000,
  milhoes: 1_000_000,
  bilhoes: 1_000_000_000,
  trilhoes: 1_000_000_000_000,
}

/** Menor valor aceito no campo de entrada do usuário. */
export const MIN_AMOUNT = 0
/** Maior valor aceito no campo de entrada do usuário. */
export const MAX_AMOUNT = 999.9
/** Número máximo de casas decimais aceitas no campo de entrada. */
export const MAX_DECIMAL_PLACES = 1

/**
 * Códigos NEUTROS de motivo pelos quais uma entrada não é aceita.
 * São chaves técnicas, não texto de UI: o componente que consome traduz
 * cada código para uma mensagem pedagógica. Nenhum termo punitivo aqui.
 *
 *   - `vazio`               : campo em branco / só espaços.
 *   - `caractere_invalido`  : contém algo além de dígitos e um separador decimal.
 *   - `formato_invalido`    : estrutura numérica não reconhecida (ex.: "1,2,3").
 *   - `negativo`            : valor abaixo de 0.
 *   - `acima_do_maximo`     : valor acima de 999,9.
 *   - `casas_decimais_em_excesso` : mais de uma casa decimal.
 */
export type AmountRejectionReason =
  | 'vazio'
  | 'caractere_invalido'
  | 'formato_invalido'
  | 'negativo'
  | 'acima_do_maximo'
  | 'casas_decimais_em_excesso'

/**
 * Resultado do parsing de uma entrada digitada. É uma união discriminada
 * pelo campo `ok`, então a UI faz `if (result.ok)` e o TypeScript estreita
 * o tipo para expor `value` (aceito) ou `reason` (não aceito).
 */
export type ParseAmountResult =
  | { ok: true; value: number }
  | { ok: false; reason: AmountRejectionReason }

/**
 * Faz o parsing e a validação do NÚMERO digitado pelo usuário (apenas a
 * parte numérica; a ordem de grandeza vem do seletor à parte).
 *
 * Regras de aceitação:
 *   - Aceita vírgula OU ponto como separador decimal ("125,5" e "125.5").
 *   - Aceita espaços nas bordas (são aparados).
 *   - Recusa negativos, valores acima de 999,9 e mais de uma casa decimal.
 *   - Recusa qualquer caractere fora de dígitos e de um único separador.
 *
 * Não lança exceções: sempre devolve um `ParseAmountResult`. Assim a UI pode
 * validar a cada tecla sem try/catch.
 *
 * @param raw Texto cru vindo do campo (ex.: "  125,5 ").
 * @returns `{ ok: true, value }` com o número (separador já convertido para
 *          ponto) ou `{ ok: false, reason }` com o código neutro do motivo.
 */
export function parseAmountInput(raw: string): ParseAmountResult {
  const trimmed = raw.trim()

  if (trimmed.length === 0) {
    return { ok: false, reason: 'vazio' }
  }

  // Um sinal de menos explícito é tratado como "negativo" (motivo mais
  // específico e útil para a UI do que "caractere inválido").
  if (trimmed.startsWith('-')) {
    return { ok: false, reason: 'negativo' }
  }

  // Só são permitidos dígitos e UM separador decimal (vírgula ou ponto).
  // Qualquer outro caractere (letras, %, espaço interno, +, etc.) é inválido.
  if (!/^[0-9]+([.,][0-9]*)?$/.test(trimmed)) {
    // Distingue "tem caractere que nem deveria existir" de "estrutura de
    // número quebrada" (ex.: "1,2,3" ou ",5" ou "1."), ambos úteis à UI.
    if (/[^0-9.,]/.test(trimmed)) {
      return { ok: false, reason: 'caractere_invalido' }
    }
    return { ok: false, reason: 'formato_invalido' }
  }

  // Normaliza o separador para ponto antes de medir casas decimais / converter.
  const normalizedSeparator = trimmed.replace(',', '.')
  const decimalPart = normalizedSeparator.split('.')[1] ?? ''

  if (decimalPart.length > MAX_DECIMAL_PLACES) {
    return { ok: false, reason: 'casas_decimais_em_excesso' }
  }

  const value = Number(normalizedSeparator)

  // Guarda de segurança: a regex já garante um número finito, mas mantemos
  // a checagem para blindar contra mudanças futuras na regex.
  if (!Number.isFinite(value)) {
    return { ok: false, reason: 'formato_invalido' }
  }

  if (value < MIN_AMOUNT) {
    return { ok: false, reason: 'negativo' }
  }

  if (value > MAX_AMOUNT) {
    return { ok: false, reason: 'acima_do_maximo' }
  }

  return { ok: true, value }
}

/**
 * Verifica se uma chave de ordem de grandeza é uma das reconhecidas por
 * `MAGNITUDES`. Útil para validar dados vindos de JSON antes de normalizar.
 */
export function isMagnitude(value: string): value is Magnitude {
  return (MAGNITUDES as readonly string[]).includes(value)
}

/**
 * Converte (número + ordem de grandeza) no VALOR ABSOLUTO correspondente.
 *
 * Exemplos (os mesmos exigidos pela especificação):
 *   normalizeAmount(125.5, 'milhoes')  === 125_500_000
 *   normalizeAmount(2.3,   'bilhoes')  === 2_300_000_000
 *   normalizeAmount(800,   'mil')      === 800_000
 *   normalizeAmount(45,    'unidades') === 45
 *
 * Cuidado com ponto flutuante: NÃO fazemos `amount * multiplicador` direto,
 * porque produtos como `2.3 * 1e9` podem gerar ruído binário. Como o campo
 * admite no máximo UMA casa decimal, primeiro levamos o número para inteiro
 * (× 10, arredondando o ruído), multiplicamos, e só então dividimos por 10.
 * Para todas as ordens de `mil` para cima o resultado é um inteiro exato;
 * para `unidades` a divisão final por 10 devolve o próprio número.
 *
 * @param amount    Número já validado (idealmente vindo de `parseAmountInput`).
 * @param magnitude Ordem de grandeza selecionada.
 * @returns Valor absoluto como `number`.
 */
export function normalizeAmount(amount: number, magnitude: Magnitude): number {
  const multiplier = MAGNITUDE_MULTIPLIERS[magnitude]
  // (round(amount*10) * multiplier) / 10 — a divisão fica por último para
  // manter tudo inteiro o máximo possível e evitar erro de arredondamento.
  return (Math.round(amount * 10) * multiplier) / 10
}

/**
 * Igual a `normalizeAmount`, mas a partir de um `Quantity` (a forma usada no
 * schema: estimativa final, microetapas guiadas e extremos de faixa).
 *
 * @param quantity `{ amount, magnitude }`.
 * @returns Valor absoluto como `number`.
 */
export function normalizeQuantity(quantity: Quantity): number {
  return normalizeAmount(quantity.amount, quantity.magnitude)
}
