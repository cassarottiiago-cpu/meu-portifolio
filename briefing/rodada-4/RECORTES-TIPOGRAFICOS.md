# Recortes tipográficos — 28/09/2026

Hero aprovada pelo usuário e preservada integralmente nesta rodada. A máscara vertical dos nomes e a entrada das frases foram rejeitadas.

## Referências consultadas

- https://tympanus.net/codrops/2023/12/05/on-scroll-sliced-text-animation/ — segmentação de texto em janelas e recomposição por translação. Adaptação própria em três linhas horizontais, não cópia da demo em colunas.
- https://tympanus.net/codrops/2025/10/15/from-blank-canvas-to-mayhem-eloy-benoffis-brutalist-glitchy-portfolio-built-with-webflow-and-gsap/ — linguagem de tipografia segmentada e ASCII que já orienta a hero. Sem alterar a abertura aprovada ou importar assets/código.

Consulta pela ponte Perplexity tentou executar, mas retornou `app-server exited (1)`. Não houve resposta de pesquisa nem thread criado. Artigos consultados diretamente pela web; não afirmar nova inspeção ao vivo dos sites dos autores.

## Diagnóstico e correção

O recorte vertical aplicado ao bloco inteiro das frases atravessava linhas no meio das letras. O observer também podia iniciar antes das fontes definitivas, e fazer texto já visto desaparecer. A verificação antiga olhava sobretudo o estado final, insuficiente para julgar esse comportamento.

Agora somente títulos ainda abaixo da dobra recebem entrada. As linhas são medidas com Range após fontes carregadas; o texto original mantém seus nós e sua geometria. Cópias decorativas temporárias, ocultas da árvore acessível, recebem máscaras fixas nas fronteiras entre linhas e translação horizontal alternada. Nenhuma máscara animada varre verticalmente o texto. Redimensionamento, movimento reduzido e aba oculta finalizam a entrada. Sem animações em prints ou parágrafos.

Nomes: três faixas espaciais sem blend/opacity, com trilhos velho/novo que se movem juntos, 780ms, atraso 55ms, curva `.76,0,.24,1` da hero. Scroll rápido guarda apenas o último alvo, sem interromper uma faixa no meio ou criar uma fila crescente. Nome, descrição e link estabilizam juntos ao terminar. Não há duplicação acessível.

## Verificação

`scripts/verificar-recortes.cjs`: 1440/390/320px nos nomes; reversão rápida; nove casos em 1440/390; HTML e tamanho do título antes/depois; nenhuma animação nos prints; movimento reduzido. Capturas de etapas em `prototipo-04/validacao/recortes/`. Casos cujo contexto já está visível no primeiro quadro não são ocultados/reanimados.

Inspeção em Edge local. Safari/iOS físico não testado. Testes técnicos e capturas não equivalem à aprovação estética do usuário.
