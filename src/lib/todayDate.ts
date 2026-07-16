/**
 * Data "de hoje" no fuso de Brasília (America/Sao_Paulo), independente do
 * fuso horário do dispositivo de quem está acessando o site.
 *
 * Usado para decidir quais desafios já podem ser exibidos (ver
 * `src/data/index.ts`): um desafio com `publishedAt` no futuro (em relação a
 * "agora" em Brasília) fica invisível — não aparece na Home, no Arquivo, nem
 * é acessível por link direto — até a data virar.
 */

/** "AAAA-MM-DD" de agora, no fuso America/Sao_Paulo (locale "en-CA" já formata nesse padrão ISO). */
export function getTodayDateKeyBrasilia(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
}
