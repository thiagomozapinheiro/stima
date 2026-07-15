/**
 * Formatação de datas de publicação ("AAAA-MM-DD") para os textos em
 * português usados pela Home ("Segunda, 14 de julho de 2026") e pelos
 * cartões do Arquivo ("14 jul 2026").
 *
 * Escrito manualmente (sem depender de `Intl`/locale do ambiente) para dar
 * um resultado previsível em qualquer máquina que rode o build, e para
 * casar exatamente com os textos do design original.
 */

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]
const MONTHS_SHORT = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
]

/** Interpreta "AAAA-MM-DD" como data local (evita o deslocamento de fuso de `new Date(string)`). */
function parsePublishedDate(publishedAt: string): Date {
  const [year, month, day] = publishedAt.split('-').map(Number)
  return new Date(year, (month || 1) - 1, day || 1)
}

/** Ex.: "Segunda, 14 de julho de 2026" (usado no cabeçalho do "Desafio do Dia"). */
export function formatFullDateLabel(publishedAt: string): string {
  const date = parsePublishedDate(publishedAt)
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} de ${MONTHS[date.getMonth()]} de ${date.getFullYear()}`
}

/** Ex.: "14 jul 2026" (usado nos cartões do Arquivo e no cabeçalho do desafio). */
export function formatShortDateLabel(publishedAt: string): string {
  const date = parsePublishedDate(publishedAt)
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`
}
