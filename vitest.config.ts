import { defineConfig } from 'vitest/config'

// Configuração dos testes unitários (Vitest). A lógica numérica crítica
// (src/lib) é testada em ambiente Node, sem DOM, com imports explícitos de
// `describe/it/expect` (por isso `globals: false`).
export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['src/**/*.test.ts'],
  },
})
