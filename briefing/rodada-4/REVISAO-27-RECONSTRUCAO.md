# Reconstrução integral — 27/09/2026

## Pedido que substitui as tentativas anteriores

Iago pediu reformulação agressiva do conjunto, reaproveitando conteúdo e capturas. Rejeitou as esculturas e efeitos sem relação com as referências. Escolheu o termo Creative Developer; a abertura e o rodapé de Eloy; o fundo, a lista lateral e a apresentação de projetos de Stefan. Pediu eliminar a página separada de todos os projetos, dar identidade própria a cada caso e terminar o percurso com uma vinheta que volta ao início.

Implementação nova em `prototipo-04/`. As outras versões não foram apagadas. A copy dos nove projetos foi preservada, sem inventar resultados, prêmios ou métricas. A antiga publicação de vídeos de esportes dá lugar ao rodapé tipográfico solicitado mais recentemente.

## Mecanismos efetivamente traduzidos

### Abertura

De Eloy: escala de texto, faixas repetidas e recortadas, campo de caracteres que responde ao ponteiro e se desfaz na rolagem. O elemento aqui é IC, não a flor/olho do autor. De Stefan: construção grotesca, fundo com áreas retangulares sutis e ruído pequeno. Papel, preto e vermelho pertencem ao repertório já usado por Iago. Sem assets ou código dos autores.

Rolagem é nativa; o header fica limitado à abertura. Não existe slideshow lateral, escultura 3D, zoom de interface ou frase biográfica nova. O canvas interrompe trabalho quando está parado, fora da tela ou em aba oculta. Movimento reduzido mantém composição estática.

### Projetos na home

Índice lateral compacto e grande área de capturas, seguindo o mecanismo de seleção de Stefan. Troca de preview por deslocamento breve de faixas horizontais; o arquivo real continua inteiro e inalterado. Teclado, links nativos, fallback sem JavaScript com todos os trabalhos no fluxo. AUTOPOST usa o calendário `autopost-queue.jpg`, apesar do nome legado. PHRON usa os dois arquivos fornecidos em 27/09, sempre noturno; WhatsApp identificado como teste.

### Casos individuais

| Caso | Linguagem tipográfica | Tratamento |
| --- | --- | --- |
| AUTOPOST | Inter | Azul, interface operacional, hierarquia e decisões em duas colunas |
| PHRON | Plus Jakarta Sans / Inter | Noturno e ciano, abertura deslocada e registro do WhatsApp |
| QOZT | Outfit | Coral, título central e composição ampla |
| Dra. Natália | Marble | Azul e papel claro, blocos suaves das decisões |
| Dr. Paulo | Instrument Serif / Instrument Sans | Verde profundo, leitura editorial e serifas |
| Limozine | Bebas Neue / Montserrat | Título condensado, preto e fotografia ampla |
| Domino’s | Inter | Azul e vermelho, interface de celular |
| Blink BMK | Archivo / Inter | Magenta e laranja, identidade da página real |
| OdontoCompany | Montserrat | Verde, abertura de marca e fechamento do percurso |

Fontes dos sites públicos foram verificadas no navegador; PHRON e Natália também nos arquivos locais, somente leitura. Inter do AUTOPOST foi escolhido pela interface fornecida. Google Fonts e suas licenças são locais. Marble vem do projeto da Natália; não se afirma licença aberta para ela.

As capturas não ganham inclinação, moldura falsa ou distorção. Ampliação em dialog oferece ajuste à tela ou tamanho real. A captura longa da Limozine preserva a legenda que informa sua composição a partir de capturas reais.

### Rodapé e fechamento

De Eloy: convite tipográfico grande e duplicações de texto sob o ponteiro, com blend difference e limite de elementos. Link principal continua legível, focável e operável sem mouse. Leva diretamente ao primeiro caso, não a uma nova página de catálogo.

Cada caso aponta ao próximo. O último abre uma breve impressão tipográfica de agradecimento. Retorno automático em 20 segundos, com pausa explícita e link para voltar imediatamente. Abas ocultas não consomem a contagem. Histórico/BFCache retoma corretamente o timer. Sem JS o retorno é manual.

## Pesquisa e limites

Fontes primárias consultadas e inspecionadas:

- https://eloyb.design/
- https://stefanvitasovic.dev/
- https://stefanvitasovic.dev/projects
- https://tympanus.net/codrops/2025/10/15/from-blank-canvas-to-mayhem-eloy-benoffis-brutalist-glitchy-portfolio-built-with-webflow-and-gsap/
- https://tympanus.net/codrops/2025/03/05/case-study-stefan-vitasovic-portfolio-2025/

Perplexity Computer foi chamado antes das decisões e novamente antes da avaliação. Retornou indisponibilidade da conta/plano; não criou thread e não forneceu parecer. Registro da última resposta em `conversas/consulta-reconstrucao-04-resposta.json`.

`npm.cmd run verify` usa Edge, Playwright e axe. Verifica proporções das imagens, várias larguras, controles, movimento reduzido, fallback sem JS, sequência, retorno, contraste e ausência de erros de runtime. `npm.cmd run build` valida referências dos HTML/CSS e empacota a versão estática. Resultados em `prototipo-04/validacao/resultado.json`. Safari/iOS e dispositivos físicos não testados. Nenhum teste é aceite criativo, pesquisa de satisfação ou prova de conversão.
