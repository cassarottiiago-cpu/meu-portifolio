# Portfólio de Iago Cassarotti

Site estático em `prototipo-04/` (HTML/CSS/JS nativos, português na raiz e inglês em `/en/`). O diário antigo de decisões, com direções já descartadas, está em `briefing/HISTORICO-AGENTS.md`: é histórico, não vale como regra.

## Ajustes de 29/09/2026, tarde (Claude Code, a pedido de Iago)
- Casos: topo com Work e WhatsApp (lugar do WhatsApp, não mexer). Voltar e Próximo ficam no fim do caso (`.case-steps`, acima de Explorar projetos); `next` é o bumerangue do voltar espelhado. Próximo segue a ordem de `projects.cjs` e volta ao primeiro no fim.
- About: Voltar ao início dentro de `.closing-thanks`, na linha do agradecimento; sem faixa isolada no rodapé. LinkedIn (`site.linkedin`) ao lado de WhatsApp e Email.
- Sem hífens nem travessões no texto visível (pt e en): "full stack", "front end", "Email", nomes das fontes nos créditos por extenso. Não reintroduzir.
- Link in bio (Domino's e Blink BMK): só a capa em janela de navegador; o resto em três telas de iPhone (`phones` em projects.cjs, capturas de `briefing/rodada-4/capturar-celulares-29.cjs`, 402×820 pt). Mock de celular é um iPhone 17 Pro em CSS (`.device-phone`, cor da moldura em `--frame` por caso; barra de status desenhada com a cor do topo da captura, lida em `imagens.cjs`). O site do Domino's teve os ícones corrigidos no repo `dominos-blink`.
- AUTOPOST: prints novos `autopost-calendario.webp`, `autopost-unidades.webp`, `autopost-fila.webp`, capturados da interface real rodando local com banco de demonstração (unidades fictícias, sem telefones). Legendas dizem "dados de demonstração". Os JPGs antigos continuam em `assets/` sem uso.

## Estado atual (29/09/2026)
- Fonte de conteúdo: `data/projects.cjs` (pt) e `data/projects.en.cjs` (en), `data/textos.cjs` (interface), `data/site.cjs` (domínio, e-mail, indexação). Páginas geradas por `scripts/gerar.cjs`; nunca editar os HTML.
- Comandos em `prototipo-04/`: `npm run dev` (host em http://127.0.0.1:4177), `npm run build` (dist/ minificado), `npm test`, `npm run imagens` (versões leves das capturas), `npm run og` (prévias de compartilhamento).
- Botões: pílula `#ded7c8` com textura de papel (a cor original; Iago rejeitou bege do vídeo, vermelho e branco). Work e WhatsApp seguem o vídeo de referência; o Work racha e se parte na 5ª batida; Voltar é um bumerangue.
- Cabeçalho de jornal (botões nas pontas, nome pequeno ao centro), falha de sinal na troca de nomes (sem linhas), entrada de títulos por `data-enter`, olhos nos "O", favicon-olho que segue o mouse, faixa Processo, fechamento em duas telas.
- Projetos selecionados na home: AUTOPOST, Dr. Paulo, Dra. Natália, Limozine. Sites: Natália em dranataliamessias.com.br, Dr. Paulo em drpauloseraphim.com.br.
- `projetos.html` (`en/projects.html`) lista os cinco trabalhos restantes, com capas clicáveis e ficha que acompanha o scroll. Casos voltam ao catálogo; não existe percurso obrigatório pelos nove projetos.
- A assinatura do cabeçalho e os botões About levam a `encerramento.html` (`en/thanks.html`): apresentação, formação em curso em Publicidade e Propaganda e desenvolvimento autodidata. A vinheta de retorno continua no fim dessa página.
- Mockups web são janelas com três bolinhas coloridas (não notebooks físicos); mobile usa celular. As imagens conservam proporção e ampliação. O botão About aparece só no rodapé da home. O catálogo usa a chamada “Quem está por trás?” e um botão de retorno com ícone/animação próprios (`selected`).
- Melhem Odontologia substitui ODC, preservando o identificador `odonto` para manter os links antigos. Contatos ficam juntos na apresentação do About, sem exibir o endereço de e-mail como texto.
- Pendências: e-mail profissional (`email` em data/site.cjs liga o botão de e-mail com copiar) e domínio final (`url`, gera canonical/og:image/sitemap).
- Não publicar nem dar push sem Iago pedir. Aceite criativo é dele; testes não o substituem.
