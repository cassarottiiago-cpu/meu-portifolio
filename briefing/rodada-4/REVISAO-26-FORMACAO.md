# Revisão de 24–26/09: uma composição, não uma sequência de slides

Pedido de Iago: substituir completamente a hero lateral, corrigir Limozine, quebrar a regularidade do arquivo e desenhar outro percurso de pincel. O aceite criativo desta implementação continua aberto.

## Pesquisa aplicada

- [On-Scroll Layout Formations, Manoela Ilic](https://tympanus.net/codrops/2024/09/18/exploration-of-on-scroll-layout-formations/): o objeto animado é o arranjo completo. Demo observado em Edge em `referencias-24/formation-*.png`. É experimento técnico com imagens geradas, não um portfólio real; nenhum asset ou código do demo foi copiado. Aplicação: AUTOPOST inteiro se desdobra numa composição de quatro trabalhos reais, num único percurso curto. Não existe troca de projeto ativo como no slideshow anterior.
- [Stewart & Partners](https://www.stewartpartners.studio/): referência real citada pela autora do experimento. Capturas em `referencias-24/stewart-*.png` mostram peças assentando em posições diferentes. A linguagem institucional, a repetição e a extensão do percurso não foram transferidas.
- [Mike van der Sanden, Cases](https://mikevandersanden.com/cases/): inspecionado em Edge, `referencias-24/mike-*.png`. O [relato do próprio autor](https://tympanus.net/codrops/2025/09/17/the-making-of-a-personal-project-platform-a-portfolio-that-grew-out-of-process-and-play/) descreve calcular a altura de mídia e legenda. Aplicação: alturas reais e faixas independentes, sem esticar cards até a próxima linha; nenhuma adoção de pills, fundo escuro ou miniaturas aleatórias.
- [Lax Space, relato do autor](https://tympanus.net/codrops/2025/09/23/lax-space-designing-with-duct-tape-and-everyday-chaos/): gesto com retornos e trajetória variável como repertório. O site retornou canvas branco nesta inspeção; não afirmar sucesso visual ao vivo. Não copiamos fita 3D, objetos, WebGL ou controles. O pincel local continua SVG, com percurso autoral de oito Béziers e textura restrita ao pigmento.

## Implementação

- Hero: composição nativa com quatro capturas proporcionais; nenhuma rotação, sombra, molde de dispositivo, frase nova ou segunda assinatura. As peças emergem de trás da capa AUTOPOST, chegam a posições próprias e continuam acessíveis por clique/teclado. A passagem caiu de 460svh para 235svh em desktop, 210svh no celular. Header continua dentro da hero.
- No estado estático e com movimento reduzido, os quatro trabalhos ficam presentes em fluxo de leitura, sem precisar realizar o movimento. Scroll reversível; nenhum loop de renderização em repouso.
- Auditoria adicional detectou colisões em 844×390. Abertura passa ao fluxo estático em telas até 600px de altura e acima de 760px de largura. `data-opening` é independente de `data-motion`, portanto o fallback de paisagem não desliga indevidamente o vídeo do rodapé.
- Arquivo: duas faixas desiguais calculadas com alturas reais, pequenas mudanças de borda interna, uma coluna no celular. Fundo opaco e contorno mantêm cada card legível. Nenhum rótulo adicional cobre o print.
- Pincel: oito curvas com retornos verticais, variação de pressão e falhas longitudinais. Não acompanha mecanicamente cada fileira. Tinta continua atrás dos cards e texto.
- Limozine: a capa volta à abertura fotográfica, com logo completo atravessando o limite da hero original. Captura 2880×1636; não foi removido nem reposicionado componente do site. Origem e medições em `assets/revisao-23/limozine-metadata.json`.

## Perplexity

Chamado novamente em 24 e 26/09, antes das escolhas/avaliações visuais. Resposta: `insufficient_credits`, motivo `feature_not_available`. Nenhuma conversa criada, nenhum `thread_id` disponível. Não houve colaboração ao vivo; a pesquisa acima foi feita diretamente.

## Verificação

`npm.cmd run verify`, `node scripts/revisar-grid.cjs`, `node scripts/verificar-linha.cjs`, `node scripts/revisar-formacao-24.cjs` e build estático. Resultados visuais ficam em `validacao/formacao-24/`, `arquivo-livre-24/`, `pincel-livre-24/` e conferência final `entrega-26/`.

Testes funcionais não são aceite estético nem evidência de conversão. Safari/iOS e dispositivos físicos não foram testados nesta máquina.

## Fechamento em 27/09

- Paisagem e rotação retrato → paisagem → retrato verificadas também por `scripts/qa-formacao-landscape.cjs`, com 47 assertions, sem colisões ou peças inacessíveis.
- A página longa da Limozine exigiu composição: `content-visibility:auto` deixava seções vazias no screenshot único. A abertura/história são capturadas em um único estado para não emendar estados diferentes do parallax; o restante usa recortes visíveis contíguos, abaixo do header fixo. Nenhum DOM/conteúdo/CSS do site foi alterado. O caso informa que a página é composta de capturas reais. Arquivo anterior preservado em `validacao/limo-26/`.
- Recaptura dedicada: `briefing/rodada-4/capturar-limo-completo-26.cjs --tiles`. Promoção somente após inspeção visual, via `prototipo-03/scripts/promover-limo-completo-27.cjs`. O script genérico preserva essa captura longa para não reintroduzir vazios.
- Nova tentativa Perplexity em 27/09 retornou a mesma indisponibilidade da conta/plano, sem criar thread.
