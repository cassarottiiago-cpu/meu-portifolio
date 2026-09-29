# Acabamento de 28/09/2026 (Claude Sonnet 5.5)

Pedido de Iago: o portfólio estava ~95% (Astra 6 e Gemini), e esta rodada leva ao 100% sem trocar a direção. Itens: abertura da hero, cabeçalho parecido demais com Dr. Paulo e Dra. Natália, Work e WhatsApp idênticos ao vídeo, troca de nomes com "falha de sinal", rodapé, abas de projeto, entrada de fontes que estava bugada, botão de visitar, fechamento e vinheta de retorno.

## Vídeo de referência, medido quadro a quadro

`WhatsApp Video 2026-09-28 at 01.33.27.mp4` (60 fps, na prática 30 fps únicos). O que o vídeo mostra e o que foi reproduzido:

- **Martelo do Work.** Ciclo de 633 ms de impacto a impacto. Descanso a ~3° por ~115 ms, armação para a esquerda até −17,5° (parada de ~130 ms), golpe até ~90° em ~100 ms. A primeira batida vem ~450 ms depois do hover. Keyframes em `HAMMER` (app.js).
- **Letras do Work.** Cada batida acrescenta um deslocamento fixo e as letras ficam soltas entre as batidas (não voltam sozinhas). Por batida, em px do vídeo com botão de 88 px de altura: W (1,5; 5,5; 4°), o (0,6; 6,8; 5°), r (−0,5; 7,4; 5°), k (3,7; 7,7; 6°). No impacto há um tranco seco de 10 a 16 px para a direita, parado ~170 ms, sem interpolar. Ao sair, tudo volta em ~150 ms. O vídeo mostra até ~7 batidas; o código limita o acúmulo a 10 para o texto nunca sair de vista.
- **Olhos do WhatsApp.** Pupilas redondas (~24% da largura do olho) que seguem o ponteiro pela página inteira, não só sobre o botão. Contorno com traço duplo.
- **Contorno tremido.** Todos os ícones são desenhados três vezes com pequenas variações e o CSS alterna entre elas ~7 vezes por segundo (`.boil`). Movimento reduzido mostra só a primeira.
- **Cor.** Pílula #d2c4a9 em repouso, #bfad88 no hover, grão fino de papel, texto #17140f, preenchimento dos ícones #efe6d8. Tudo em quatro variáveis `--btn-*` no fim de `interactions.css`.

Os outros botões (Ver caso, Anterior/Voltar, Visitar) ficam livres, no mesmo estilo: mesma paleta, grão e contorno tremido, com movimentos próprios (página que vira, folha que dobra, cursor que clica na janela). As letras dão um pulinho em onda no hover.

## O que mudou

- **Cabeçalho de jornal** (`masthead()` em gerar.cjs): botões nas pontas, assinatura ao centro entre duas réguas com marcações. Nada de logo à esquerda e botão à direita, que era a estrutura do site do Dr. Paulo e da Dra. Natália. Vale para home, casos, créditos e fechamento. Em telas de até 430 px a assinatura passa para cima e os botões para baixo. Entrada: as réguas se desenham a partir do nome e os botões saltam.
- **Abertura.** O "O" de DEVELOPER virou um olho cuja pupila segue o ponteiro e pisca de tempos em tempos (`letterEyes()`); em telas de toque a pupila passeia sozinha. Os caracteres do IC piscam perto do ponteiro. Sem RAF em repouso.
- **Falha de sinal** na troca do nome dos projetos selecionados (`glitchTo()`): o nome perde a sintonia (fatias deslocadas, franjas ciano e magenta, linhas de varredura), vira estática com os caracteres do portfólio (# = : ▮), o novo nome entra fora de sintonia e assenta enquanto uma barra de rastreio o varre. ~650 ms. Rolagem rápida termina no último projeto lido. Substitui as três faixas deslizantes.
- **Entrada dos títulos nos casos** (`[data-enter]`, cases.css e app.js). Um motor, um gesto por projeto pelas variáveis `--enter-*`: AUTOPOST desliza e desentorta, PHRON entra em foco, QOZT e Domino's "pulam", Natália assenta com um leve giro, Dr. Paulo respira (foco suave lento), Limozine sobe seco, BMK varre, OdontoCompany cresce. Só títulos e frases de abertura, uma vez por elemento. Substitui o contraste por rolagem, que deixava o texto cinza. Nunca há corte, máscara, cópia ou reflow. A fonte e a transição de página são esperadas (com teto de tempo). Sem JavaScript ou com movimento reduzido tudo aparece já; se o script falhar, tudo aparece em 3,5 s.
- **Visitar o projeto.** Chamada com a cor de cada caso (texto com contraste calculado em `--case-on-accent`), ícone de janela com cursor que clica e endereço do site ao lado. Natália só ganha a chamada quando tiver `url` em `data/projects.cjs`.
- **Próximo trabalho.** O nome já aparece na tipografia do próximo caso; ao passar o mouse a cor dele sobe pela faixa.
- **Decisões.** A linha do topo acende na cor do projeto.
- **Rodapé da home.** Índice direto dos nove casos, seta que avança no hover e entrada das duas linhas ao aparecer.
- **Fechamento.** Cabeçalho novo, capacidades com ícones desenhados a mão que reagem ao mouse, e uma segunda tela com OBRIGADO. gigante em que os dois "O" são olhos de pupila vermelha.
- **Vinheta de retorno.** As faixas vermelhas entram, OBRIGADO. perde o sinal, as faixas saem e a própria abertura sintoniza por baixo. O último quadro da vinheta é o primeiro quadro da home, então não há corte. Com `?replay=1` a home não repete a entrada das palavras (já estão no lugar) e mantém a montagem do IC e a entrada do cabeçalho. Nenhum overlay vermelho na home.

## Ajustes rápidos

- Cores dos botões: `--btn-bg`, `--btn-bg-hover`, `--btn-ink`, `--btn-paper`.
- Réguas do cabeçalho: `.masthead-rule{display:none}` em interactions.css.
- Olhos nos "O": `.o-eyes{display:none}`.
- Entrada de um projeto: `--enter-*` da classe `.case-<id>` em cases.css (duração, curva, deslocamento, desfoque, escala, giro, inclinação). Para desligar num elemento, tire o `data-enter` no gerador.
- Falha de sinal: tempos (200, 290 e 630 ms) e amplitudes em `glitchTo()`.

## Testes

Novo: `scripts/verificar-acabamento.cjs` (cabeçalho em cinco larguras, ângulos do martelo, letras, olhos, falha de sinal com rolagem rápida, entrada dos nove casos, chamada de visita, próximo trabalho, rodapé, fechamento, vinheta contínua, movimento reduzido e sem JS). Atualizados para o estado atual (o temporizador do fechamento já tinha saído): `verificar.cjs`, `verificar-work.cjs`, `verificar-refino-motion.cjs`, `verificar-refinamentos.cjs`, `verificar-scroll-fechamento.cjs`. O axe agora espera as animações finitas terminarem antes de medir contraste. Removidos por testarem efeitos que deixaram de existir: `verificar-recortes.cjs`, `verificar-frases-hero.cjs`, `verificar-frases-scroll.cjs`.

Playwright fora do repositório: `PORTFOLIO_PLAYWRIGHT` aponta para o módulo (`C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core` nesta máquina).

## Pendências e limites

- Falta o endereço do site da Dra. Natália para ligar a chamada de visita e trocar "em desenvolvimento" e as menções a "versão local" em `data/projects.cjs`.
- Aceite criativo é de Iago. Testes verificam comportamento, contraste e ausência de erros, não gosto. Safari/iOS e aparelhos físicos continuam sem teste.
- Nada foi publicado, commitado ou enviado.
