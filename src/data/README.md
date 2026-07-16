# Como cadastrar desafios (guia para leigos)

Este é o "banco de desafios" do Fermi. Aqui você adiciona, edita ou remove os
desafios de estimativa que aparecem no site. **Você não precisa saber programar**
para mexer aqui — só precisa preencher um arquivo de texto seguindo o modelo.

---

## 1. A ideia geral

- **Cada desafio fica no seu próprio arquivo**, dentro da pasta `challenges/`.
- Esses arquivos são do tipo **JSON** — um formato de texto simples, com uma
  estrutura de "campo": "valor".
- O site descobre os arquivos **sozinho**. Você não precisa avisar o site que
  criou um desafio novo: basta colocar o arquivo na pasta `challenges/`.
- Para **tirar** um desafio do ar, apague (ou tire da pasta) o arquivo dele.

> Dica: a maneira mais segura de criar um desafio novo é **copiar um arquivo que
> já existe**, renomear e ir trocando os textos. Assim a estrutura já vem pronta.

---

## 2. Nome do arquivo

Use o padrão: **`AAAA-MM-DD-nivel.json`**

Exemplos:

- `2026-07-14-iniciante.json`
- `2026-07-14-interessado.json`
- `2026-07-14-expert.json`

(Um dia normalmente tem 3 desafios, um de cada nível, com o mesmo tema.)

---

## 3. Regras de ouro do JSON (leia com atenção)

O JSON é exigente com pontuação. Se um sinal estiver errado, o site não carrega.

1. Todo texto fica **entre aspas duplas**: `"assim"`. Nunca use aspas curvas
   (`“ ”`) — só as retas (`"`).
2. Cada campo é separado do próximo por **vírgula**. O **último** campo de um
   bloco **não** leva vírgula.
3. Números **não** levam aspas e usam **ponto** como separador decimal:
   escreva `1.6`, nunca `1,6` nem `"1.6"`.
   (A vírgula você só usa dentro de textos normais, como em `"cerca de 1,6 mi"`.)
4. Se você **não tem** uma informação opcional, **apague a linha inteira**.
   Não deixe em branco nem escreva `null`.
5. Ao terminar, vale a pena colar o conteúdo em um validador online de JSON
   (busque por "JSON validator") para conferir se está tudo certo.

---

## 4. Número + ordem de grandeza

Muitos valores no Fermi são escritos como **um número** mais **uma ordem de
grandeza** (mil, milhões, etc.). No arquivo isso vira dois campos:

```json
{ "amount": 1.6, "magnitude": "milhoes" }
```

Isso significa **1,6 milhões**.

- `amount` é o número (de 0.0 até 999.9, com no máximo uma casa decimal).
- `magnitude` é a ordem de grandeza. Os valores permitidos (escreva exatamente
  assim, tudo minúsculo e **sem acento**):

| Escreva     | Significa | Multiplica por        |
| ----------- | --------- | --------------------- |
| `unidades`  | unidades  | 1                     |
| `mil`       | mil       | 1.000                 |
| `milhoes`   | milhões   | 1.000.000             |
| `bilhoes`   | bilhões   | 1.000.000.000         |
| `trilhoes`  | trilhões  | 1.000.000.000.000     |

Exemplos:

- 800 mil → `{ "amount": 800, "magnitude": "mil" }`
- 12 milhões → `{ "amount": 12, "magnitude": "milhoes" }`
- 0,4 (menos que 1) → `{ "amount": 0.4, "magnitude": "unidades" }`

---

## 5. Os campos do desafio, um por um

### Dados básicos (sempre obrigatórios)

- **`id`**: um código único do desafio. Use o mesmo nome do arquivo (sem o
  `.json`). Ex.: `"2026-07-14-iniciante"`.
  ⚠️ Depois de publicado, **não mude o id** — se mudar, quem já resolveu o
  desafio perde o registro de que resolveu.
- **`theme`**: o tema/categoria. **Texto livre**, escreva o que quiser. Ex.:
  `"Mobilidade e Infra"`, `"Saúde"`, `"Fora da Caixa"`.
- **`level`**: o nível. Só três opções, escritas exatamente assim:
  `"Iniciante"`, `"Interessado"` ou `"Expert"`.
- **`publishedAt`**: a data de publicação no formato `"AAAA-MM-DD"`. Ex.:
  `"2026-07-14"`.
- **`title`**: o título do desafio.
- **`teaser`**: um resumo de uma linha (aparece nos cartões da tela inicial).
- **`prompt`**: o enunciado completo do problema.
- **`unit`**: a unidade da resposta final. Ex.: `"corridas/dia"`, `"litros/dia"`,
  `"por ano"`.
- **`currency`** (opcional): escreva `true` **apenas** quando a resposta for em
  dinheiro (R$). Se não for dinheiro, **apague esta linha**.

### Dicas

- **`hints`**: uma lista de 2 a 3 dicas. Cada dica tem:
  - `label`: o título curto da dica.
  - `text`: o texto completo (não pode entregar a resposta!).

### Modo guiado (opcional)

O bloco **`guided`** existe só nos desafios que você quebrou em etapas.
**Se o desafio for só de modo livre, apague o bloco `guided` inteiro.**

- **`stages`**: a lista de etapas agrupadas. Cada grupo tem:
  - `title`: o título do grupo. Ex.: `"Etapa 1 — Universo de usuários"`.
  - `steps`: as microetapas (perguntas). Cada microetapa tem:
    - `question`: a pergunta curta.
    - `explanation` (opcional): uma frase de apoio.
    - `unit` (opcional): a unidade daquela etapa. Ex.: `"pessoas"`, `"%"`.
    - `defaultMagnitude`: a ordem de grandeza já selecionada no campo
      (`unidades`, `mil`, `milhoes`...).
    - `hint` (opcional): uma dica só daquela etapa.
    - `acceptableRange` (opcional): a **faixa aceitável** (mínimo e máximo) que
      você define para dar uma avaliação **amigável** ao usuário (nunca "errado").
      **Se aquela etapa não tem faixa definida, apague o `acceptableRange` dela.**
- **`formula`** (opcional): a "estrutura construída" mostrada no fim. Tem:
  - `title`: o nome do resultado. Ex.: `"Corridas por dia"`.
  - `lines`: as linhas da conta. Cada linha tem `operator` (ex.: `"×"`, `"÷"`;
    a primeira linha usa `""`) e `text` (ex.: `"população da cidade"`).

### Resposta oficial (sempre obrigatória)

O bloco **`solution`** tem a resposta certa e a explicação:

- **`referenceValue`**: a estimativa de referência (o número "central").
  É um número + ordem de grandeza (veja a seção 4).
- **`referenceRange`**: a faixa esperada, com `min` e `max` (cada um é número +
  ordem de grandeza).
- **`reasoning`**: o raciocínio passo a passo. Uma lista em que cada passo tem:
  - `label`: o nome do passo. Ex.: `"População da cidade"`.
  - `value`: o valor/explicação em texto. Ex.: `"~25% → 3.000.000"`.
  - `note` (opcional): um comentário extra.

### Vá Além (opcional)

O bloco **`goBeyond`** é a seção extra de pensamento estratégico.
**Se o desafio não tem essa seção, apague o bloco `goBeyond` inteiro.**

- `impact`: um parágrafo sobre os impactos do tema.
- `strategicQuestion`: uma pergunta estratégica de destaque.
- `opportunities`: uma lista de oportunidades (cada item é um texto).
- `materiaisComplementares` (opcional): links de leitura complementar,
  exibidos dentro de "Oportunidades", abaixo do texto "Vale a pena ler
  sobre" (abrem em uma aba nova). **Se não tiver nenhum link para indicar,
  apague o campo inteiro.** Cada item tem:
  - `titulo`: o texto do link. Ex.: `"Artigo da McKinsey sobre o tema"`.
  - `url`: o endereço completo, começando com `"https://"`.
- `whatIf`: o bloco "E se...", com:
  - `premise`: a hipótese. Ex.: `"…metade das corridas fosse autônoma?"`.
  - `questions`: uma lista de perguntas provocativas.

---

## 6. Os três casos-limite (importante!)

1. **Desafio só com modo livre (sem roteiro guiado):**
   simplesmente **não inclua** o bloco `guided`.
   → Veja o exemplo `challenges/2026-07-14-expert.json`.

2. **Etapa guiada sem faixa de referência ("Sem faixa definida"):**
   dentro daquela microetapa, **não inclua** o campo `acceptableRange`.
   → Veja a última etapa em `challenges/2026-07-14-interessado.json`.

3. **Desafio sem a seção "Vá Além":**
   simplesmente **não inclua** o bloco `goBeyond`.
   → Veja o exemplo `challenges/2026-07-14-expert.json`.

4. **"Vá Além" sem materiais complementares (sem links de leitura):**
   dentro do bloco `goBeyond`, **não inclua** o campo `materiaisComplementares`.
   → Veja o exemplo `challenges/2026-07-14-interessado.json`.

---

## 7. Modelos prontos para copiar

Já existem três exemplos completos na pasta `challenges/`, cobrindo todos os
casos acima:

- `2026-07-14-iniciante.json` — desafio completo (guiado com faixas + Vá Além).
- `2026-07-14-interessado.json` — guiado, com uma etapa **sem** faixa definida.
- `2026-07-14-expert.json` — **só modo livre**, em dinheiro (R$), **sem** Vá Além.

Copie o que mais se parece com o que você quer criar e vá adaptando.

---

## 8. Onde a "regra" está definida (para curiosos/técnicos)

A estrutura oficial (nomes e tipos de cada campo) está em
`src/types/challenge.ts`. É esse arquivo que garante, na hora de compilar o
site, que os desafios têm o formato certo.
