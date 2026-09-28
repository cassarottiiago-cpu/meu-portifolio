# Direção 03 — mecanismos observados, não referências citadas

Documento escrito em 12 de setembro de 2026, a partir de inspeção em browser real de 10 sites, feita nesta sessão. Cada mecanismo abaixo foi observado no DOM ou em captura, não lido em descrição de terceiros. O dossiê bruto com dados de DOM, tipografias computadas, bibliotecas detectadas e 43 capturas está em `refs/DOSSIE-MECANISMOS.md` e `refs/`.

Onde não houve observação, está escrito "não observado". Nenhuma afirmação aqui é promessa de originalidade, retenção ou conversão.

---

## 1. Por que o protótipo 01 parece genérico

Não é a paleta e não é a tipografia. É a **estrutura**, e ela é uma fórmula de mercado:

| Elemento presente em `prototipo/index.html` | Por que enfraquece |
|---|---|
| Nome monumental à esquerda, arte à direita | Divisão lateral de hero é o layout mais replicado de portfólio desde 2021 |
| Screenshot inclinado com sombra projetada | Mockup em ângulo sinaliza "template"; nenhum dos 10 sites inspecionados usa moldura inclinada |
| Asterisco `✳` decorativo solto | Ornamento sem função, marca registrada de starter kit |
| `VOL. 01 / 2026`, `001`, `UM PORTFÓLIO EM MOVIMENTO` | Metadado editorial falso: numera uma coleção que não existe |
| Fundo de papel + vermelho como único acento | Correto, mas está fazendo o trabalho sozinho |
| Movimento = pequenas translações e rotações | A revisão de direção anterior já apontou isso; o protótipo não corrigiu |

O diagnóstico da rodada anterior estava certo — "a pesquisa não foi convertida em comportamento". O que faltou foi um mecanismo verificável. Abaixo eles estão nomeados, com gatilho e implementação.

---

## 2. Mecanismos que eu de fato observei

### 2.1 Inversão por `mix-blend-mode` — OFF+BRAND, Site of the Year 2026

Observado em `https://www.itsoffbrand.com/` (capturas `refs/offbrand-loaded.jpg`, `refs/offbrand-work-1.jpg`).

Dados brutos: fundo do body `rgb(229,228,224)` — papel, não branco. Nenhuma cor de texto além de preto, `rgb(29,29,29)`, `rgb(51,51,51)` e a própria cor do papel. Tipografia display proprietária `Ataero Retina OB Edition`. `window.Lenis = true`; `gsap`, `THREE`, `PIXI`, `barba` não expostos. Um único canvas 554×554.

O mecanismo: o H1 tem atributo `split-hero` e cada letra é uma `div.char` com `transform` própria, animada de posição dispersa até assentar. Elementos de texto (`.hh-text-block`, `.mbm-diff`) e o cursor customizado (`.cursor-w`) carregam `mix-blend-mode: difference`; os preenchimentos de botão usam `exclusion`. Um único objeto contínuo atravessa a página inteira, crescendo conforme a rolagem, e **o texto inverte de cor onde ele passa por baixo** — não há troca de classe, é composição.

Por que importa para o seu caso: você já tem papel claro, tinta escura e vermelho aprovados. `mix-blend-mode: difference` transforma essas três cores em um sistema em vez de uma decoração. Custo: zero WebGL, zero imagem, zero biblioteca.

### 2.2 Capa full-bleed com legenda de canto — Studio Dumbar

Observado em `https://www.studiodumbar.com/`. Body `rgb(0,0,0)`, `window.gsap = true`, `window.Lenis = true`, scripts `ScrollTrigger.min.js` e `ScrollToPlugin.min.js` carregados, 14 elementos `<video>`, altura de documento 14014px, nenhum canvas.

Cada trabalho ocupa uma unidade de viewport inteira, em escala de pôster, com o título pequeno e ancorado num canto. Nenhuma moldura, nenhum card, nenhuma sombra. O scroll troca a peça; o título é discreto de propósito.

### 2.3 Índice lateral com tipografia monumental — Corentin Bernadou

Observado em `https://www.corentinbernadou.com/`. Palco preto, tipografia vermelha gigantesca, lista de títulos fixa à direita, documento de 3285px com rolagem real. Scripts entregues incluem `gsap-DDlvirwQ.js` e `three-CZcCwkUH.js`. O objeto central é um volume 3D com faces fotográficas — essa parte **não** é transferível para você, porque suas faces seriam screenshots de interface e um cubo giratório de UI fica ilegível.

O que é transferível: o alto contraste, o índice que marca o projeto ativo, e a escala tipográfica.

### 2.4 Case editorial de duas colunas — Antinomy Studio

Observado em `https://www.antinomy.studio/`. Body branco, tipografia `ABCDiatype`, 11 vídeos, documento de 10200px com rolagem real, apenas um canvas 2D de 300×150 (provavelmente utilitário). Cada case entra com mídia ampla à esquerda e ficha à direita. Sem moldura de dispositivo.

### 2.5 O que inspecionei e descarto

- **Obys, Phantom, Lusion, Joseph Santamaria:** todos retêm a rolagem do documento e conduzem a navegação por canvas WebGL de viewport inteiro (altura de body reportada em 59px a 1001px, `scrollY` não se move). Belíssimos, e inadequados: seu conteúdo é screenshot estático de interface, e um palco 3D em tempo real esconderia justamente o que você precisa mostrar.
- **DIA (`dia.tv`):** `ERR_CONNECTION_TIMED_OUT` nas duas tentativas. Não observado. A rodada anterior tratou a DIA como referência central lendo fichas de projeto; eu não consigo confirmar nada sobre o site.
- **Robin Payot:** `NET::ERR_CERT_COMMON_NAME_INVALID`, certificado emitido para `cluster115.hosting.ovh.net`. Não atravessei o aviso. Não observado.
- **Ordinary Folk:** falha de renderização no browser nas duas tentativas. Não observado.
- **Mat Voyce:** tipografia cinética em vídeo, `F37Judge` e `F37Judge-Extended` sobre fundo `rgb(255,254,248)`. O ofício é tipografia animada em peças de vídeo, não estrutura de site navegável. Útil como repertório de letra, não como modelo de abertura.

---

## 3. Três direções, com comportamento definido

Nenhuma delas usa ilustração temática, objeto de subcultura ou mockup inclinado.

### Direção A — Tinta

**Ideia:** a página é uma folha de papel e existe um único campo de tinta que atravessa o site inteiro. Não é um blob com gradiente — é um retângulo de tinta sólida, de borda dura, como área chapada de impressão riso ou serigrafia.

**Primeiro estado:** papel quase vazio. Seu nome em tinta, em escala grande mas não monumental, e uma linha do que você faz.

**Gatilho:** a rolagem move e expande o campo de tinta por baixo de tudo. Todo texto da página fica em `mix-blend-mode: difference`. Quando o campo passa sob uma palavra, ela inverte: tinta sobre papel vira papel sobre tinta, no meio da própria palavra, com a borda dura cortando as letras.

**Papel do trabalho:** o campo de tinta também é a máscara. Cada screenshot seu aparece **dentro** do campo, revelado por `clip-path`, em vez de flutuar num card. A interface emerge da tinta.

**Ligação com o repertório:** duotone de alto contraste, borda chapada, corte seco. É a gramática de capa de disco e de gráfica de skate, sem desenhar um skate. O vermelho entra em uma única função: o estado ativo.

**Implementação:** CSS puro. Um `div` de tinta em `position: fixed`, animado por `scroll-timeline` / `animation-timeline: view()` com fallback em rAF. `mix-blend-mode: difference` nos blocos de texto. `clip-path: inset()` nas imagens. Nenhuma biblioteca obrigatória. Confirmado viável porque é exatamente a técnica que a OFF+BRAND usa, e eu li o `getComputedStyle` deles.

**Risco:** `mix-blend-mode` exige que o texto não esteja dentro de um contexto de empilhamento que isole a mistura. Precisa de teste em Safari iOS.

### Direção B — Corte contínuo, executado de verdade

**Ideia:** a hipótese que a rodada anterior escreveu e não implementou. Nenhum screenshot inteiro aparece no primeiro contato.

**Primeiro estado:** um recorte extremo de um elemento real de uma interface sua — uma célula de tabela do PHRON, um gráfico, um estado de campo — em escala de pôster, tão ampliado que lê como grafismo abstrato. Seu nome como assinatura pequena, não como monumento.

**Gatilho:** a rolagem faz um **zoom out contínuo**, não um corte. O mesmo pixel que você estava olhando vai diminuindo até você reconhecer a tela inteira, e depois o produto inteiro. Detalhe para conjunto, sem nenhuma seção desaparecendo.

**Segunda mudança:** ao chegar no conjunto, o enquadramento desliza lateralmente para o próximo projeto usando uma relação gráfica real entre as duas interfaces — uma coluna que continua, uma linha de base que coincide. Essa relação tem que ser desenhada olhando os três screenshots juntos; não é automática.

**Papel do trabalho:** o trabalho **é** a abertura. Não existe hero separado do portfólio.

**Implementação:** um contêiner `position: sticky` de altura alta, com `transform: scale()` e `transform-origin` fixado nas coordenadas do recorte, dirigido por `scrollY` num único rAF. A legenda do projeto troca por `IntersectionObserver` em marcos. Exige screenshots em resolução alta o suficiente para suportar o recorte inicial — os `.webp` atuais provavelmente não bastam, e recapturar em 2x ou 3x é pré-requisito.

**Risco:** zoom dirigido por scroll é desconfortável se a curva estiver errada, e é o mecanismo que mais precisa de teste em trackpad, roda de mouse e toque. Precisa de rota alternativa acessível e de respeito a `prefers-reduced-motion`.

### Direção C — Régua

**Ideia:** o site se apresenta como um artefato de construção seu. Tipografia editorial grande por cima, e uma calha de metadado em monoespaçada por baixo com números reais: data de captura, stack, o que era antes e o que virou.

**Gatilho:** cada projeto abre como um comparativo de estados, com divisor arrastável entre "antes" e "depois", ou entre modo claro e modo noturno do PHRON.

**Ligação com o repertório:** o corte. Sem fade, sem easing longo. Seções cortam duro, como edição de faixa.

**Risco:** "portfólio de terminal" é um clichê próprio, e fortíssimo. Só funciona se a monoespaçada ficar restrita a metadado e nunca virar a estética principal. É a direção que eu recomendo menos.

---

## 4. Recomendação

**A como sistema visual, B como abertura.** A tinta com inversão por blend resolve a identidade em três cores e sem imagem nenhuma, e o corte contínuo resolve a objeção real de que a entrada não mostra trabalho. As duas se combinam: o campo de tinta é a máscara através da qual o recorte inicial aparece, e o zoom out revela a interface enquanto a tinta recua.

C fica de fora desta rodada.

---

## 5. Lista do que não repetir

Isto não é preferência, é o que faz o resultado parecer gerado:

1. Screenshot inclinado com sombra projetada.
2. Moldura de dispositivo, notebook ou navegador falso.
3. Asterisco, cruz ou ponto decorativo sem função.
4. `VOL. 01`, `001`, numeração de coleção inexistente.
5. Nome de um lado, arte do outro.
6. Textura de papel como camada de overlay.
7. Objeto ilustrado representando subcultura — skate, caveira, fita, vinil, tênis.
8. Movimento como enfeite: rotação de 8 graus, parallax leve, fade de entrada em bloco.
9. Gradiente iridescente. A OFF+BRAND usa um e consegue sustentar porque é o único elemento colorido do site inteiro; em papel com vermelho, viraria enfeite.
10. Mais de uma família display. Uma display, uma de texto, e no máximo uma monoespaçada para metadado.

---

## 6. Tipografia — decisão ainda aberta

`Bowlby One SC` está aprovada em termos gerais, mas vale um teste de especimen antes de fechar: em escala de pôster o desenho arredondado dela lê como cartoon, e as duas direções recomendadas pedem borda seca de impressão. `Barlow Condensed Bold` e `DM Sans` seguem coerentes.

Alternativa real verificada: `Clash Display` está disponível na Fontshare em seis pesos com versão variável, da Indian Type Foundry. Não é uma recomendação fechada — é o candidato que eu confirmei existir e que serve a um teste lado a lado com a Bowlby, no mesmo tamanho e na mesma palavra.

Nenhuma das tipografias que eu observei nas referências é utilizável: `Ataero Retina OB Edition`, `F37Judge`, `ABCDiatype`, `Aeonik` e `PPNeueMontreal` são todas proprietárias e licenciadas.

---

## 7. Próximo passo proposto

Protótipo de **abertura apenas**, das direções A+B combinadas, em página única, para julgar em movimento antes de reconstruir o site. Pré-requisito: recapturar PHRON, Dra. Natália e QOZT em resolução 2x ou 3x, porque o recorte inicial da direção B depende disso e os `.webp` atuais não suportam a ampliação.

## Fontes

- OFF+BRAND, inspeção direta em browser: https://www.itsoffbrand.com/
- Studio Dumbar, inspeção direta: https://www.studiodumbar.com/
- Corentin Bernadou, inspeção direta: https://www.corentinbernadou.com/
- Antinomy Studio, inspeção direta: https://www.antinomy.studio/
- Obys Agency, inspeção direta: https://www.obys.agency/
- Phantom, inspeção direta: https://phantom.land/
- Lusion, inspeção direta: https://lusion.co/
- Joseph Santamaria, inspeção direta: https://joseph-san.com/
- Mat Voyce, inspeção direta: https://matvoyce.tv/
- Awwwards, Sites of the Year: https://www.awwwards.com/websites/sites_of_the_year/
- Codrops, estudo de caso de transição em shader num portfólio: https://tympanus.net/codrops/2026/04/28/more-than-a-portfolio-building-a-scroll-driven-3d-world-with-something-to-say/
- Codrops, estudo de caso de máscara de navegação com GSAP: https://tympanus.net/codrops/2026/03/05/inside-corentin-bernadous-portfolio-swiss-inspired-layouts-webgl-geometry-and-thoughtful-motion/
- Fontshare, catálogo de display: https://www.fontshare.com/?q=display
