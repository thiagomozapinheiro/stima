# Fermi — Desafios de Estimativa de Mercado

Site de desafios diários de estimativa de mercado (market sizing), sem login,
com progresso salvo no `localStorage` do navegador.

Projeto construído com [Vite](https://vite.dev/) + React + TypeScript.

## Estrutura do projeto

```
src/
  components/   componentes de UI reutilizáveis
  data/         arquivos JSON dos desafios
  lib/          lógica utilitária (normalização numérica, storage, etc.)
  pages/        páginas: Home, Desafio, Archive
  styles/       tokens de CSS / variáveis de tema
design-original/  design exportado do Claude Design (referência visual, não editar)
```

## Como rodar localmente

1. Instale as dependências (só precisa fazer isso uma vez, ou quando o
   `package.json` mudar):

   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

3. Abra o endereço mostrado no terminal (normalmente
   [http://localhost:5173](http://localhost:5173)) no navegador.

Outros comandos disponíveis:

| Comando              | O que faz                                               |
| -------------------- | ------------------------------------------------------- |
| `npm run dev`        | inicia o servidor local (só acessível neste computador) |
| `npm run dev:mobile` | inicia o servidor exposto na rede local (ver abaixo)    |
| `npm run build`      | gera a versão de produção na pasta `dist/`              |
| `npm run preview`    | serve localmente a versão gerada por `npm run build`    |
| `npm run lint`       | verifica o código com ESLint                            |
| `npm run format`     | formata o código com Prettier                           |

## Como acessar pelo celular (preview no celular)

O celular precisa estar conectado na **mesma rede Wi-Fi** do computador.

1. No computador, rode:

   ```bash
   npm run dev:mobile
   ```

   (equivalente a `npm run dev -- --host`)

2. O terminal vai mostrar algo como:

   ```
   ➜  Local:   http://localhost:5173/
   ➜  Network: http://192.168.0.42:5173/
   ```

3. No celular, abra o navegador e digite o endereço da linha **Network**
   (o número de IP varia conforme a sua rede).

Se o endereço "Network" não aparecer, descubra o IP local do computador:

- **Windows:** abra o Prompt de Comando e rode `ipconfig`, procure por
  "Endereço IPv4" na sua conexão Wi-Fi.

Se o celular não conseguir acessar, verifique se o Firewall do Windows não
está bloqueando conexões de entrada para o Node.js/Vite na rede
(normalmente aparece um aviso do Firewall na primeira vez — escolha
"permitir acesso" para redes privadas).

## Requisitos

- [Node.js](https://nodejs.org/) 20 ou superior (inclui o `npm`).
