# Portfólio de Iago Cassarotti

## Revelação imóvel das frases — vigente

Usuário autorizou abandonar o deslocamento lateral. Nos casos, apenas o título original ganha contraste com o scroll, sem cópias, máscaras, divisão em linhas ou transform. Opacidade inicial calculada para preservar pelo menos 3.2:1 nos títulos grandes; cresce linearmente até 1 no percurso entre 94% e 22% da viewport (72vh, limitado pelo final da página). Ao parar o scroll, para; ao completar, mantém texto integral. Hero, nomes, prints e demais superfícies preservados. Instruções abaixo de recortes/linhas nas frases são históricas. Teste vigente: scripts/verificar-frases-scroll.cjs.

## Frases vinculadas à rolagem — atualização vigente

Somente a entrada interna dos casos foi revisada após o usuário apontar rapidez e falta de vínculo com o scroll. Hero e nomes preservados. Linhas dos títulos abaixo da dobra agora avançam pela posição de rolagem, sem timeline autônoma: percurso entre 94% e 50% da altura da viewport, pequeno desfasamento entre linhas, todas na mesma direção. Parar a rolagem congela a entrada; voltar reverte enquanto incompleta. Ao completar, remove camadas e mantém o texto legível definitivamente. Movimento reduzido, resize e aba oculta finalizam o efeito. Teste atual: scripts/verificar-frases-scroll.cjs; nove casos em desktop/mobile, parada, reversão parcial e conclusão. As durações fixas das frases documentadas abaixo são históricas.

## Hero aprovada; recortes dos nomes e frases — vigente

Usuário aprovou a hero em 28/09 e pediu preservá-la. Não alterar sua montagem. Rejeitou novamente os nomes com máscara vertical e as frases cortadas pelo bloco. Pesquisa consultada: Codrops On-Scroll Sliced Text Animation (2023/12/05) e case de Eloy Benoffi (2025/10/15). Nomes passam em três faixas horizontais alternadas, 780ms + stagger de 55ms, curva igual à hero. Sem dissolução; apenas uma transição ativa, seguida do último alvo da rolagem. Frases abaixo da dobra usam linhas medidas via Range após document.fonts.ready; conteúdo original não é dividido nem refluído. Camadas temporárias aria-hidden deslizam lateralmente por linha e são removidas ao concluir/cancelar. Texto já visível no carregamento não some para reaparecer. Prints, parágrafos e títulos pequenos das decisões permanecem imóveis. Teste específico: scripts/verificar-recortes.cjs, incluindo quadros intermediários e geometria de nove casos. Detalhes e limites: briefing/rodada-4/RECORTES-TIPOGRAFICOS.md.

## Correção após rejeição dos três efeitos — versão anterior rejeitada

O usuário rejeitou a dissolução sobreposta dos nomes, a entrada por palavras e a diferença pouco perceptível na hero. Os nomes agora usam um único nó: recorte de saída (240ms), troca enquanto oculto e revelação (480ms), sem cópias ou transparências. Rolagem rápida cancela a transição anterior. Frases dos casos recebem recorte vertical do bloco original (850ms), sem dividir palavras, alterar HTML ou reconstruir quebras de linha. Prints continuam estáticos. Hero recebe entrada lateral ampla das faixas e formação dos caracteres dispersos do IC em 1450ms, sem overlay. Movimento reduzido e rolagem interrompem a montagem. Testes técnicos não significam aprovação estética.

## Entrada das frases e hero — versão anterior rejeitada

Troca dos nomes: saída e entrada simultâneas, 650ms, deslocamento de 28% da altura e dissolução breve, reversível conforme a direção da rolagem. Uma cópia temporária no máximo; rolagem rápida cancela a transição anterior sem acumular nomes. Movimento reduzido troca imediatamente.

Frases de abertura dos casos, títulos de contexto e decisões recebem impressão breve por palavras, com atraso máximo de 280ms. Títulos das seções recebem recorte lateral simples. Parágrafos de leitura e todos os prints continuam estáticos. Wrappers de palavras são temporários e removidos ao concluir ou cancelar a entrada.

Hero mantém layout aprovado: as palavras principais chegam por direções opostas dentro dos recortes; ecos se alinham em seguida e o monograma IC se monta em cerca de 850ms. Não é overlay, loader ou nova vinheta. Rolagem interrompe a montagem; movimento reduzido apresenta o estado final. Canvas continua sem RAF em repouso.

## Refino de movimento — correção após avaliação

Usuário rejeitou as entradas das imagens dos projetos selecionados. Imagens ficam no fluxo, sem máscaras, shutters, zoom ou animação de entrada. Também foram removidas as cópias de texto em metades; entradas novas limitam-se a uma impressão lateral breve em Projetos selecionados, títulos de contexto dos casos e as duas linhas do encerramento. Não aplicar a todo parágrafo/título. Nomes em peso 600, mantendo vermelho.

Visitar o projeto usa botão doodle-visit com porta e passagem, preservando href real e nova aba. Da ideia à execução tem line-height 1.08, folga para descendentes e nenhum clip permanente. A transição nativa do navegador é desativada só no encerramento, que já possui sua própria vinheta.

Performance: posições de projetos em cache, glyph atlas no canvas, interações dos olhos só nos botões com olhos, Work interrompido fora da tela. Medições locais em validacao/motion-before.json e motion-after.json; contagens de operações, não benchmark de FPS.

## Correção posterior — vídeo do Work e abertura

O vídeo local `WhatsApp Video 2026-09-28 at 01.33.27.mp4` foi inspecionado quadro a quadro. Prevalece sobre o pedido histórico de fragmentação: martelo bate a cada aproximadamente 640ms enquanto hover/foco permanece; letras inteiras se deslocam e inclinam progressivamente, voltando ao sair. Não recriar fragmentos das letras. Botão permanece compacto e navegação imediata.

Nomes da ficha de projetos em vermelho `--red`. A vinheta tipográfica nova é exclusiva do encerramento. Não criar overlay vermelho na home ao retornar. A miniabertura é a entrada breve dos próprios recortes CREATIVE/DEVELOPER, respeita movimento reduzido e termina se o usuário começar a rolar.

## Revisão de scroll e fechamento — 28/09

Pedido posterior: na home, uma ficha acompanha a rolagem e troca nome, descrição e link conforme o projeto em leitura. Implementação em `app.js` e `interactions.css`, com sticky dentro da galeria; no celular, altura reservada evita saltos ao trocar texto. Mantidos os quatro trabalhos e um print por trabalho da seleção atual. Sem JavaScript, as fichas individuais continuam disponíveis. Movimento reduzido troca o conteúdo sem animar.

PHRON é explicitamente um projeto pessoal em desenvolvimento. Copy-fonte em `prototipo-04/data/projects.cjs`; não apresentar capturas ou o teste de WhatsApp como produto concluído.

O retorno do encerramento usa faixas tipográficas de OBRIGADO e CREATIVE DEVELOPER, seguidas pela revelação da abertura. Retorno manual e contagem de 40 segundos com pausa mantidos. Pesquisa e limites em `briefing/rodada-4/SCROLL-E-FECHAMENTO.md`. Teste focado: `scripts/verificar-scroll-fechamento.cjs`, com módulo Playwright configurável por `PORTFOLIO_PLAYWRIGHT`.

## ATUAL: reconstrução integral em 27/09/2026

### Ajustes aprovados em 28/09

Work: pedido posterior exige quebra mais forte, como no vídeo. Cada letra tem três fragmentos recortados; após as batidas eles se separam e se recompõem. Botão continua compacto, link nativo sem atraso e movimento reduzido sem fragmentação. Teste específico: `node scripts/verificar-work.cjs`.

**Esclarecimento final, prevalece sobre o parágrafo seguinte:** “Projetos selecionados” é uma sequência contínua de AUTOPOST, Dr. Paulo, Dra. Natália e QOZT, com **exatamente um print por trabalho**, todos visíveis no fluxo e textos rolando normalmente. Sem seletor, tabs ou painel trocado. Demais trabalhos somente no percurso de nove casos aberto pelo rodapé. Botões do header foram reduzidos após rejeição do tamanho: 42 px de altura, texto 12 px, ícone 27 px. Creative e Developer principais continuam vermelhos; rodapé mantém o aumento de frequência solicitado.

**Correção posterior, vigente:** Iago pediu Developer em vermelho também e os demais trabalhos de volta à primeira página. Portanto a home tem os nove casos, começando por AUTOPOST, Dr. Paulo, Natália e QOZT, seguidos por PHRON, Limozine, Domino’s, Blink BMK e OdontoCompany. As duas palavras principais da hero são vermelhas; ecos continuam escuros. Rodapé com frequência 50% maior que a revisão suavizada (intervalo de distância 220/1,5 px), cópias temporárias de 1,5 s, limite de oito. Botões refinados: ícones maiores no header, martelo com impacto sincronizado nas letras, olhos orgânicos, voltar com folha que dobra em vez de rebobinar. As instruções de quatro destaques e Developer escuro abaixo são históricas.

Iago gostou da reconstrução e pediu refinamentos, não outra mudança de direção. A home mostra somente AUTOPOST, Dr. Paulo, Dra. Natália e QOZT, nesta ordem. A correção final foi **AUTOPOST, não PHRON**. Todos os nove casos continuam no percurso completo. Apenas a palavra Creative principal recebe vermelho; os recortes e Developer continuam escuros. Rodapé com cópias menores, temporárias e no máximo cinco.

Botões seguem o vídeo fornecido por Iago em 28/09: Work com martelo e letras reativas; WhatsApp com olhos; voltar com dois sinais de rebobinar, sem a longa seta do vídeo. O pedido autoriza expressamente os botões arredondados dessa referência, sem estender essa exceção a cards/pills decorativos. SVG e movimentos próprios em `scripts/botoes.cjs`, `interactions.css` e `app.js`.

Encerramento profissional com capacidades de UX/UI, full-stack e IA aplicada, baseadas no currículo lido em 28/09, e agradecimento. WhatsApp usa o número do currículo, conforme pedido de contato. Não publicar endereço, dados sensíveis ou o currículo completo. Retorno após 40 segundos, contado somente quando os controles finais entram na tela, com pausa e retorno manual. Estas instruções substituem os detalhes correspondentes abaixo.

A versão de trabalho é **`prototipo-04/`**. Ler `briefing/rodada-4/REVISAO-27-RECONSTRUCAO.md`. O pedido mais recente de Iago substitui as direções anteriores de hero, arquivo, pincel e rodapé: reformulação agressiva do conjunto inspirada especificamente em Eloy Benoffi e Stefan Vitasović. As seções seguintes documentam o histórico, não são a direção visual vigente. `prototipo-03/` e `prototipo/` estão preservados.

- Abertura Creative Developer, tipografia recortada e monograma IC em caracteres. Fundo retangular lo-fi solicitado por Iago; não retornar à escultura, zoom de screenshots ou pincel antigo.
- Projetos na própria home, índice lateral e previews. **Não existe mais `projetos.html`**. AUTOPOST é o primeiro da seleção, com calendário. PHRON usa Home noturna e WhatsApp fornecidos em 27/09.
- Rodapé tipográfico interativo inicia o percurso AUTOPOST → PHRON → QOZT → Natália → Dr. Paulo → Limozine → Domino’s → Blink BMK → OdontoCompany → encerramento. A vinheta retorna à abertura, com pausa e retorno manual.
- Cada caso recebe fontes, paleta e composição derivadas do trabalho original. Esta solicitação explícita substitui a restrição antiga de uma única display para todos os casos; a home usa DM Sans. O fundo lo-fi explicitamente pedido também substitui a proibição histórica de textura/grão nesta superfície.
- Conteúdo em `prototipo-04/data/projects.cjs`; gerador em `scripts/gerar.cjs`. Não editar apenas os HTML gerados. Imagens reais em proporção natural, ampliação e página completa quando disponível.
- Comandos dentro de `prototipo-04/`: `npm.cmd run dev`, `npm.cmd run verify`, `npm.cmd run build`. Host habitual `http://127.0.0.1:4177`; build em `dist/`.
- Perplexity foi consultado novamente nesta reconstrução e retornou `insufficient_credits` / `feature_not_available`. Nenhum thread criado; não inventar `.codex/pplx-thread`, parecer ou colaboração ao vivo.
- Testes técnicos não substituem aprovação estética de Iago. Não alterar outros repositórios, publicar, fazer commit ou push sem autorização.

## Direção vigente

Leia integralmente `briefing/rodada-4/DIRECAO-03-MECANISMOS.md` antes de alterar o visual. A seção 5 contém proibições expressas do usuário. Não reintroduzir seus itens. A abertura em revisão está em `prototipo-03/`; `prototipo/` é a versão anterior, rejeitada, preservada como histórico.

Mecanismos centrais: tinta sólida com `mix-blend-mode: difference` e zoom out contínuo dirigido pela rolagem. O usuário aprovou a abertura desta versão em 12/09/2026 ("ficou bom") e pediu as alterações registradas abaixo. Não tratar verificações técnicas como aceite criativo da expansão, teste de satisfação ou prova de conversão.

## Colaboração com Perplexity Computer

Antes de decidir direção visual, escolher referência, gerar asset ou avaliar uma tela, chamar `call_perplexity_computer`, conforme instrução de Iago. Reutilizar o `thread_id` real salvo em `.codex/pplx-thread`.

Se a ferramenta não estiver exposta na sessão, a ponte local `briefing/rodada-4/perplexity.cjs` usa o MCP autenticado pelo app-server do Codex. Não extrai credenciais nem inicia outro modelo Codex. Exemplo:

```text
node briefing/rodada-4/perplexity.cjs briefing/rodada-4/consulta-inicial.json
```

A ponte pode exigir autorização de rede/execução fora do sandbox. Não contornar permissões. Nunca imprimir tokens, ler o cofre de credenciais ou inventar um thread_id.

Em 12/09/2026, o MCP conectou com OAuth, mas duas consultas retornaram `insufficient_credits`, com motivo `feature_not_available`. O serviço informou que o Computer não está disponível para a conta/plano. Nenhuma conversa foi criada. O status está em `.codex/pplx-status.json`; a resposta bruta em `briefing/rodada-4/conversas/`. A implementação desta rodada se baseou no documento que o usuário trouxe, sem parecer ao vivo do Perplexity. Não afirmar o contrário. Código, build e eventual commit continuam sob responsabilidade do Codex.

## Conteúdo e limites

- Prioridade: trabalho como designer, desenvolvedor e UI/UX. Não fazer site institucional semelhante ao da Dra. Natália.
- PHRON somente noturno. QOZT, `https://www.qozt.com.br/`, substituiu Consulting Now. Dra. Natália é um trabalho apresentado, não a identidade do portfólio.
- Sem fotos pessoais. Não divulgar biografia sensível, dados privados do currículo ou métricas de resultado inventadas.
- Uma display (Barlow Condensed) e uma de texto (DM Sans) nesta versão. Fontes e licenças locais.
- Capturas devem continuar reais. Não remover componentes dos projetos para fingir interfaces melhores. Máscaras e enquadramentos do portfólio não alteram os arquivos de origem.
- Não modificar os repositórios PHRON e site-nat-work como parte do portfólio. Para capturar PHRON, usar banco temporário e sessão exclusiva, como no script de captura.
- Nenhuma autorização para publicar, contratar serviço ou enviar mensagem a terceiros além da consulta de pesquisa expressamente solicitada ao Perplexity.

## Revisão solicitada após aprovação da abertura

- Preservar PHRON noturno, QOZT e Dra. Natália na abertura. A seleção abaixo passa a Dr. Paulo, Limozine e Blink BMK, nessa ordem. Hachimitsu e Galpão Nelore foram removidos desta rodada.
- Vermelho volta como acento de área e título, sem ocupar a página inteira.
- Menu no header e `projetos.html` com nove trabalhos. BMK, Union Biologicals e OdontoCompany Morro Agudo completam a seleção. Cada trabalho tem caso estático em `projetos/`.
- Conteúdo dos casos em `prototipo-03/scripts/projetos.cjs`; páginas geradas por `gerar-paginas.cjs` e pelo build. Editar a fonte, não só os HTML gerados.
- Usar `>>` nas indicações de navegação. Não reintroduzir setas diagonais ou verticais.
- Remover: o parágrafo sobre estudar desde os 14, "Design. Código. Curiosidade.", indicação de rolar, "Detalhe / Interface" e a faixa branca final de identificação/revisão.
- Rodapé com edição real de esportes, conforme pedido posterior do usuário. Isso autoriza cenas de skate, surf, snowboard e paraquedas, não ilustrações temáticas ou apropriação de vídeos da Red Bull.
- Cenas Mixkit verificadas sob Stock Video Free License. Fontes e cortes em `briefing/rodada-4/esportes/`; créditos públicos em `creditos.html`. Sem áudio, sem atribuir os atletas a Iago. Vídeo só carrega ao entrar na tela, com pausa manual, respeito a movimento reduzido/economia de dados e pausa fora de tela.
- Dr. Paulo foi recapturado do endereço correto informado por Iago: `https://drpaulo-eight.vercel.app/`. Não usar as capturas antigas de `BMK/site/dist` ou `antigravity`.
- O Blink correto da BMK é `https://blink.bmkgow.com/`; não usar o antigo `bmk-omega.vercel.app` como substituto.
- Limozine correto desta seleção: `https://lplimozine-nu.vercel.app/`; não reintroduzir Galpão Nelore nesta posição.
- Capturas externas precisam aguardar fontes, imagens, hero e carrosséis estabilizarem; um primeiro screenshot de carregamento não representa o projeto.
- Nova consulta ao Perplexity para a expansão também foi recusada pelo plano. Resposta em `briefing/rodada-4/conversas/consulta-expansao-resposta.json`. Nenhum thread_id foi criado.

## Revisão editorial solicitada em 12/09/2026

Esta revisão substitui as orientações anteriores de menu expansível e seleção de nove projetos:

- A seleção tem oito casos. Domino’s Chácara Flora (`https://dominosblink.vercel.app/`) substitui Brave. Union Biologicals foi retirada. As capturas antigas permanecem como acervo; as páginas geradas correspondem somente à seleção atual.
- Header com assinatura tipográfica e dois acessos diretos, sem dropdown redundante nem botão "Sem movimento". Na home, fica preso à hero e sai com ela. A preferência de movimento reduzido do sistema continua respeitada.
- Abertura com o mesmo zoom contínuo; filtro SVG de duas tintas mapeia as capturas para os tons exatos do portfólio. Os arquivos originais e as páginas dos casos mantêm as cores próprias dos projetos. PHRON continua sendo a interface noturna.
- Estilos desta revisão em `prototipo-03/editorial.css`, após `style.css`. Não alterar repositórios dos trabalhos apresentados.
- A continuação usa revelação por recorte de imagens e títulos; sem fade de bloco, rotação, parallax decorativo ou ocultação de conteúdo sem JavaScript.
- Todas as letras das fichas dos três trabalhos da home são vermelhas, inclusive categoria, frase, estado e links.
- Arquivo com composição assimétrica e capturas de celular reais para Domino’s e BMK. Casos com impressão em proporção natural e ampliação acessível em dialog, com ajuste à tela ou tamanho real.
- Novas capturas em `briefing/rodada-4/revisar-capturas.cjs`. Aguardar carregamento e carrosséis; metadados e imagens de revisão em `acervo/`.
- Edição do rodapé ampliada para seis cenas e 24 segundos. BMX e motocross foram adicionados, com origem/licença registradas em `esportes/bmx-origem.json` e `esportes/moto-origem.json`. Script `ampliar-esportes.cjs --encode` recompõe a edição sem alterar as capturas dos projetos.
- A consulta real ao MCP Perplexity voltou a retornar `insufficient_credits` / `feature_not_available`. Registro em `conversas/consulta-revisao-editorial-resposta.json`; nenhum `thread_id` foi inventado.

## Comandos e verificação

## Revisão do arquivo em 14/09/2026

- Escopo exclusivo da aba de projetos. Iago rejeitou os vazios e tamanhos da composição em escada. Arquivo agora com duas peças maiores e duas fileiras de três, duas colunas no tablet e uma no celular; sem margens negativas.
- Spray vermelho autorizado expressamente nesta revisão, implementado como SVG local `assets/spray-vermelho.svg`. Não é overlay sobre as interfaces: fica atrás do arquivo. Fichas têm fundo papel opaco, títulos escuros e indicações vermelhas para proteger o contraste.
- Miniaturas usam capturas desktop em proporção natural; capturas de celular continuam dentro dos respectivos casos. Entradas por recorte preservadas e indicação de abrir no hover/foco.
- Nova consulta real ao Perplexity retornou `insufficient_credits` / `feature_not_available`, sem criar conversa ou thread_id.
- `node scripts/revisar-grid.cjs` verifica encaixe das fileiras, fundo das fichas e sete larguras, guardando capturas em `validacao/grid/`.

## Linha do arquivo em 17/09/2026

- Iago rejeitou o spray granulado ("grãos feios por toda parte"); o pedido original era uma linha. `spray-vermelho.svg` saiu do site e está em `briefing/rodada-4/acervo/descartados/`. Não reintroduzir grão, spray ou textura.
- No lugar: uma única linha vermelha contínua, desenhada pela rolagem (`site.js`, bloco `archive`). O traçado é calculado a partir das posições reais dos cards e passa só pelas margens laterais e pelos vãos entre fileiras, nunca sobre título, texto ou captura. Termina entrando no rodapé vermelho.
- Vãos entre fileiras ampliados (76px desktop, 56px até 760px) e `--pad` próprio da página para dar espaço à linha. Com movimento reduzido, a linha aparece inteira e parada.
- Perplexity não consultado nesta alteração.

## Comandos locais

## Abertura e tinta em revisão em 22/09/2026

- Iago rejeitou a linha fina sinuosa feita na revisão anterior e o zoom cinza/frase "POR DENTRO". Estas decisões substituem o mecanismo inicial A+B na hero: manter scroll nativo como motor, não o antigo zoom de pergunta do PHRON.
- `opening.css` e `app.js`: capa com Iago Cassarotti em vermelho e três recortes reais simultâneos. O nome sai lateralmente e é recortado na borda das imagens; a primeira captura se expande e as seguintes entram por uma borda móvel. Fundo papel estável, screenshots em cores originais, sem filtro cinza. Sem nova frase de efeito. Header continua exclusivo da hero.
- `archive-ink.css` e bloco archive de `site.js`: um único traço largo em curva diagonal por trás do arquivo, sem serpentina, grão, spray ou textura. Fichas opacas mantêm contraste; não ampliar vãos para acomodar a linha. Scroll reversível, reduced-motion estático e sem RAF contínuo em repouso.
- Gerador liga o CSS da tinta somente ao arquivo. Build inclui os dois novos CSS. Casos, rodapé de esportes e conteúdo dos trabalhos preservados.
- Perplexity consultado novamente no início da revisão; retornou `insufficient_credits`/`feature_not_available`. Nenhum thread foi criado. Resposta registrada em `briefing/rodada-4/conversas/consulta-abertura-linha-resposta.json`.
- Os testes de zoom antigo/blend foram substituídos por expansão proporcional/reversível, impressão real do nome vermelho, estabilidade da paleta externa e recorte dos projetos. Axe agora exige zero violações sem exceção para blend (mecanismo retirado).
- Scripts de revisão: `scripts/revisar-abertura.cjs`, `scripts/verificar-linha.cjs`. Aceite criativo desta proposta ainda depende de Iago; os testes não o substituem.

## Execução

## Cards e pincel: ajuste posterior em 22/09/2026

- Iago rejeitou a faixa diagonal chapada por ser grossa, seguir uma única direção e não parecer tinta. Pedido novo autoriza textura discreta dentro do próprio traço; não reintroduzir grão espalhado nem textura de papel no fundo.
- Nova tinta em SVG usa pressão variável, borda sutilmente irregular e falhas longitudinais de pincel seco. Percurso global muda de direção sem acompanhar cada fileira. Scroll reversível e preferência de movimento reduzido preservados.
- Cards da aba Projetos têm superfície clara própria `#faf7f1`, contorno fechado, legenda com respiro interno e indicação quadrada `>>`. Sem sombras, moldura de dispositivo, cantos arredondados ou alteração dos prints. Grid continua 2+3+3 no desktop.
- Consulta real ao Perplexity novamente indisponível para a conta/plano (`insufficient_credits`/`feature_not_available`), sem novo thread. Registro em `conversas/consulta-cards-pincel-resposta.json`.

## Comandos

## Correções de 23/09/2026

- AUTOPOST é o primeiro trabalho visível na home, antes de rolar, e também consta no arquivo e em seu case. Os três prints enviados por Iago são reais: `autopost-hero.jpg` mostra a fila; `autopost-calendar.jpg`, apesar do nome legado, mostra o cadastro de unidades; `autopost-queue.jpg` mostra o calendário. Não trocar essas legendas.
- Iago rejeitou o nome duplicado e a abertura de três miniaturas. Agora a hero apresenta o projeto já inteiro; scroll nativo percorre AUTOPOST, PHRON noturno, QOZT e Natália. Sem a segunda assinatura gigante, sem contador de projetos, sem “O que me move”. Header continua apenas na hero. Sem JavaScript/reduced-motion, AUTOPOST permanece visível e os links funcionam.
- As capturas novas ficam em `prototipo-03/assets/revisao-23/`. PHRON usa Agenda como capa horizontal e Home completa como detalhe, sempre em banco temporário isolado. Casos oferecem também a página completa dos sites, com ampliação rolável. `scripts/dimensoes.cjs` lê as dimensões reais dos arquivos, sem adivinhá-las pelo nome.
- Pincel com a mesma textura e trajeto, largura-base maior: máximo 64px em desktop (antes 52px), 27,7px em uma tela de 390px (antes 23px). A leitura continua protegida pelo fundo opaco dos cards.
- Nove projetos no arquivo, fileiras 2/3/2/2 em desktop, 1/2/2/2/2 em tablet e uma coluna no celular. Nenhum card solitário no final do desktop.
- Perplexity foi chamado novamente para esta correção e para a revisão da hero, mas o serviço retornou `insufficient_credits` / `feature_not_available`. Não há thread novo nem parecer ao vivo.

Em `prototipo-03/`: `npm.cmd run dev`, `npm.cmd run verify`, `npm.cmd run build`.

## Revisão de 24–26/09/2026

- Pedido posterior de Iago rejeitou a hero lateral e o grid certinho. A direção aplicada e as referências observadas estão em `briefing/rodada-4/REVISAO-26-FORMACAO.md`; estas decisões substituem a sequência lateral de 23/09.
- Hero em `opening.css` e `app.js`: AUTOPOST inteiro desdobra uma única composição com PHRON, QOZT e Natália. `data-layout` muda entre cover, assembling e spread; não existe mais seleção automática de um único projeto pelo scroll. Sem JS/movimento reduzido, os quatro trabalhos ficam no fluxo. Não reintroduzir `.case-caption`, `.project-index` ou `data-jump` antigos.
- `data-opening` controla apenas a formação da hero. Telas baixas em paisagem (altura até 600px, largura acima de 760px) usam fluxo estático; `data-motion` continua ligado se o usuário não pediu redução de movimento, preservando vídeo e demais interações.
- Arquivo masonry em duas faixas desiguais, alturas naturais, pincel com oito curvas e retornos verticais. Legendas opacas; sem rótulo sobre a imagem. Testes não devem voltar a exigir fileiras de mesma altura.
- Capa Limozine recapturada com fotografia e logo inteiro, 2880×1636. HTML da home, dados do gerador e metadados devem concordar. Não reutilizar a abertura de galeria rejeitada.
- Em 27/09 a captura longa Limozine também foi substituída. `content-visibility:auto` deixava seções vazias no print único; agora é composição de capturas reais, declarada na legenda do caso. Usar `capturar-limo-completo-26.cjs --tiles` e inspeção antes de promover. O script público genérico preserva esse arquivo longo, não o sobrescreve com fullPage. Abertura/história capturadas num só estado para não emendar o parallax; recortes restantes não repetem header fixo.
- Perplexity consultado novamente, mas respondeu `feature_not_available`. Nenhum thread foi criado. Não afirmar colaboração ao vivo.

O servidor local abre `http://127.0.0.1:4177`. O build estático fica em `prototipo-03/dist/`. Sem dependências de runtime. Scripts de teste reutilizam Playwright, Sharp e axe já instalados nesta máquina; dependências de desenvolvimento não são distribuídas no build.

## Revisão posterior de 27/09/2026

- Iago rejeitou a formação de prints que encolhem. A proposta atual é `briefing/rodada-4/REVISAO-27-RECORTES.md`: interfaces imóveis, passagem em onze recortes alternados, rolagem nativa. Substitui as instruções de formação anteriores; não reintroduzir zoom/encolhimento como mecanismo desta hero.
- AUTOPOST usa o calendário `autopost-queue.jpg` como capa em todas as superfícies, com fila como detalhe. O nome legado do arquivo não determina a legenda.
- PHRON usa os arquivos fornecidos por Iago em 27/09: `phron-home-27.png` e `phron-whatsapp-27.jpeg`. Não dizer que estas capturas são de banco de demonstração sem dados pessoais. WhatsApp é um registro de teste, não prova de todas as integrações concluídas.
- Consulta Perplexity novamente recusada pelo plano. Nenhum thread criado. Aceite criativo pendente.

A verificação de contraste atual exige zero violações do axe; não suprimir a regra de contraste. O teste de pixels verifica que a assinatura e o nome estão efetivamente pintados. Safari/iOS e dispositivos físicos continuam pendentes.

## Pôster tipográfico, após escolha de Eloy e Stefan em 27/09

- Iago rejeitou os recortes entrelaçados e autorizou reformulação inspirada em Eloy Benoffi e Stefan Vitasović. Direção atual: `briefing/rodada-4/REVISAO-27-POSTER.md`, substituindo as instruções de recortes e formação.
- Hero em fluxo, com DESIGN/CÓDIGO em composição cinética e calendário AUTOPOST já presente. Não voltar a slideshow sticky de prints ou encolhimento. Header sticky fica limitado à hero.
- PHRON, QOZT e Natália aparecem no fluxo antes da seleção Paulo/Limo/BMK. `expression.css` é compartilhado pelo gerador e incluído no build.
- Prints e paleta aprovados, arquivo, pincel e rodapé mantidos. Preferência de movimento reduzido desliga efeitos sem mudar a posição de leitura. Sem JS, links nativos e conteúdo completo.
- Consulta real ao Perplexity recusada pelo plano. Nenhum thread inventado. Aceite criativo depende de Iago.
