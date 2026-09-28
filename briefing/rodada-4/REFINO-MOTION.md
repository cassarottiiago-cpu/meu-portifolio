# Refino de movimento e performance

Pesquisa primária: Codrops, On-Scroll Sliced Text Animation (https://tympanus.net/codrops/2023/12/05/on-scroll-sliced-text-animation/), Making Stagger Reveal Animations for Text (https://tympanus.net/codrops/2020/06/17/making-stagger-reveal-animations-for-text/) e web.dev, How to create high-performance CSS animations (https://web.dev/articles/animations-guide). Referências de mecanismo; código próprio. A ponte Perplexity terminou com `app-server exited (1)`, sem consulta concluída.

O usuário rejeitou a primeira proposta com máscaras sobre imagens e pediu refino geral. Versão vigente: imagens sem animação de entrada; poucos títulos recebem uma impressão lateral de 420ms, sem cópias, deslocamento do texto, fade, blur ou divisão em letras. Aplicação única em Projetos selecionados, título de contexto de cada caso e duas linhas do encerramento. Preferência de movimento reduzido desativa as entradas. Scroll dos nomes e Work aprovados preservados.

Botões externos usam a família doodle, com desenho exclusivo de porta e passagem. Href original, nova aba e proteção noopener preservados. Peso dos nomes: 600. Encerramento com altura de linha 1.08 e espaço de .14em para descendentes, sem recorte permanente. A vinheta própria não disputa a navegação com a transição nativa no encerramento.

## Otimização medida

No roteiro local de 30 movimentos do cursor: chamadas fillText caíram de 102120 para zero após aquecer o atlas de caracteres. Leituras getBoundingClientRect caíram de 30 para zero. No roteiro de 30 passos de scroll: leituras caíram de 150 para zero. Em repouso: zero callbacks RAF nas duas versões. As contagens documentam operações evitadas; não representam ganho percentual de FPS ou medição em dispositivo físico.

Mecanismos: atlas de caracteres rasterizados por tamanho; posições de projetos recalculadas em resize/fontes, não por passo de scroll; callbacks agrupados em RAF; observadores interrompem Work fora da tela; acompanhamento do ponteiro restrito ao botão com olhos; código antigo de tabs removido.

Verificações: build, verificar-work.cjs, verificar-scroll-fechamento.cjs e verificar-refino-motion.cjs. Este último cobre os sete links externos, contraste de texto do botão por tema, controle de movimento, ausência de overlays nas imagens, larguras 1440/768/390/320 e fallback sem JS. Playwright configurado por PORTFOLIO_PLAYWRIGHT. Não equivale a validação em Safari/iOS ou aceite criativo.
