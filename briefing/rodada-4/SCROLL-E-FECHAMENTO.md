# Scroll e fechamento — 28/09/2026

Pedido: uma ficha que acompanha a rolagem dos projetos, copy clara sobre o estágio do PHRON e uma vinheta que conecta encerramento e abertura.

## Referências consultadas

- Codrops, Kinetic Typography Page Transition: https://tympanus.net/codrops/2021/09/29/kinetic-typography-page-transition/ — letras que ganham o primeiro plano e revelam o próximo conteúdo. A tradução aqui usa faixas horizontais alternadas e recomposição tipográfica, sem copiar assets ou código.
- Eloy Benoffi, relato do próprio autor: https://tympanus.net/codrops/2025/10/15/from-blank-canvas-to-mayhem-eloy-benoffis-brutalist-glitchy-portfolio-built-with-webflow-and-gsap/ — tipografia, recortes e movimento como continuidade da identidade. Foram consultados os artigos; não se afirma inspeção interativa das demos externas nesta revisão.

A ponte Perplexity foi tentada, inclusive com permissão de execução externa, e terminou com `app-server exited (1)`. Não houve resposta de pesquisa nem novo thread confirmado.

## Implementação

Orientação de pinning da skill gpt-taste aplicada ao layout existente com CSS sticky e scroll nativo. Os demais padrões de reformulação integral da skill não pertencem a este pedido. Sem novas dependências de runtime, transformação ou recorte das capturas. Uma ficha compartilha título, descrição e link do projeto em leitura. Altura estável no celular evita mudanças de scroll causadas pela troca de conteúdo. Fallback sem JavaScript mantém os títulos originais. Preferência por movimento reduzido mantém a troca sem deslocamento animado.

Copy-persuasiva orientou a separação entre objetivo e estado entregue: PHRON é um produto pessoal em desenvolvimento, com registros pontuais da interface e da integração WhatsApp. Nenhuma promessa nova de capacidade validada.

A vinheta manual/automática usa cinco faixas OBRIGADO que abrem espaço para CREATIVE DEVELOPER e revelam a home. O retorno automático continua após 40 segundos de controles finais visíveis, com pausa. Movimento reduzido retorna diretamente. Sem JavaScript, permanece o link normal.

Verificação focada em scroll nos dois sentidos, três larguras, links sincronizados, estado do PHRON, retorno manual, pausa/retorno automático, movimento reduzido e navegação sem JavaScript. O teste geral legado depende de caminhos de outra máquina; não se afirma que foi executado. Aceite estético depende de Iago.
