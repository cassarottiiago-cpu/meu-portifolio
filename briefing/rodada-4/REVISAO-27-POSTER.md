# Pôster tipográfico: Eloy + Stefan

Iago aprovou Eloy Benoffi e Stefan Vitasović como referências e pediu uma reformulação inspirada nos dois, mantendo seu estilo. A passagem entrelaçada anterior foi rejeitada e substituída.

## O que foi aproveitado

- Eloy: tipografia como composição gráfica principal, ocupação forte da tela, linguagem crua. Não copiar grafismos, flores, ASCII, glitch incessante, cor fluorescente ou decoração literal.
- Stefan: letras tratadas como elementos programáveis e movimento como parte da identidade. Não copiar o fundo, a arte WebGL, textos biográficos ou controlador de scroll.
- As referências foram abertas no navegador na rodada de pesquisa anterior. Capturas em `prototipo-03/validacao/referencia-hero-2.png` e `referencia-hero-3.png`. Os artigos dos próprios autores documentam o processo; isso não prova conversão.

Fontes:
https://eloyb.design/
https://stefanvitasovic.dev/
https://tympanus.net/codrops/2025/10/15/from-blank-canvas-to-mayhem-eloy-benoffis-brutalist-glitchy-portfolio-built-with-webflow-and-gsap/
https://tympanus.net/codrops/2025/03/05/case-study-stefan-vitasovic-portfolio-2025/

## Mecanismo aplicado

- Hero em fluxo nativo, aproximadamente uma tela, sem slideshow sticky, zoom ou máscaras entre screenshots. Header sticky pertence apenas à hero e sai ao terminar o seu contêiner.
- Duas linhas tipográficas: DESIGN e CÓDIGO. O ponteiro redistribui a largura das letras; a rolagem altera sua pressão e registro. Entrada curta por letras, sem loading obrigatório. Sem RAF contínuo em repouso.
- Papel, vermelho e tinta mantidos. Barlow Condensed e DM Sans locais, sem novas fontes. Nome aparece uma vez.
- AUTOPOST já aparece na hero, com o calendário real e link para o caso. PHRON, QOZT e Natália seguem em composição editorial no fluxo, antes de Paulo, Limozine e BMK.
- Novos prints PHRON mantidos: Home noturna e conversa de teste no WhatsApp. Capturas não foram filtradas, deformadas ou substituídas por mockups.
- `expression.css` leva a linguagem tipográfica a navegação, arquivo, títulos dos casos e continuação. Layout editorial dos casos, arquivo masonry, pincel e vídeos do rodapé preservados.
- Sem JavaScript, os títulos, imagens e links existem no HTML. Movimento reduzido elimina efeitos, sem exigir percurso alternativo e sem saltar o scroll.

Perplexity Computer foi consultado antes da decisão; respondeu `insufficient_credits` / `feature_not_available`. Nenhum thread ou parecer ao vivo obtido.

## Validação e limites

`scripts/revisar-poster.cjs` captura sete larguras/alturas. `scripts/verificar.cjs` verifica tipografia interativa/reversível, scroll nativo, foco dos modais, prints, arquivo, nove casos, contraste e vídeo. Testes funcionais não equivalem a aceite criativo, retenção ou conversão. Safari/iOS físico continua pendente.
