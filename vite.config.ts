import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Porta fixa para facilitar acessar sempre o mesmo endereço no celular.
    // O host (localhost vs. rede local) é controlado pela flag --host,
    // usada pelo script "dev:mobile" (veja package.json e README.md).
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
})
