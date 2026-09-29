# Portfólio de Iago Cassarotti

Site estático em `prototipo-04/` (HTML/CSS/JS nativos, português na raiz e inglês em `/en/`). O diário antigo de decisões, com direções já descartadas, está em `briefing/HISTORICO-AGENTS.md`: é histórico, não vale como regra.

## Estado atual (29/09/2026)
- Fonte de conteúdo: `data/projects.cjs` (pt) e `data/projects.en.cjs` (en), `data/textos.cjs` (interface), `data/site.cjs` (domínio, e-mail, indexação). Páginas geradas por `scripts/gerar.cjs`; nunca editar os HTML.
- Comandos em `prototipo-04/`: `npm run dev` (host em http://127.0.0.1:4177), `npm run build` (dist/ minificado), `npm test`, `npm run imagens` (versões leves das capturas), `npm run og` (prévias de compartilhamento).
- Botões: pílula `#ded7c8` com textura de papel (a cor original; Iago rejeitou bege do vídeo, vermelho e branco). Work e WhatsApp seguem o vídeo de referência; o Work racha e se parte na 5ª batida; Voltar é um bumerangue.
- Cabeçalho de jornal (botões nas pontas, nome pequeno ao centro), falha de sinal na troca de nomes (sem linhas), entrada de títulos por `data-enter`, olhos nos "O", favicon-olho que segue o mouse, faixa Processo, fechamento em duas telas.
- Projetos selecionados na home: AUTOPOST, Dr. Paulo, Dra. Natália, Limozine. Sites: Natália em dranataliamessias.com.br, Dr. Paulo em drpauloseraphim.com.br.
- `projetos.html` (`en/projects.html`) lista os cinco trabalhos restantes, com capas clicáveis e ficha que acompanha o scroll. Casos voltam ao catálogo; não existe percurso obrigatório pelos nove projetos.
- A assinatura do cabeçalho e os botões About levam a `encerramento.html` (`en/thanks.html`): apresentação, formação em curso em Publicidade e Propaganda e desenvolvimento autodidata. A vinheta de retorno continua no fim dessa página.
- Mockups são molduras CSS em `scripts/gerar.cjs` / `site.css`; as imagens conservam proporção e ampliação. Capturas altas usam janela de desktop; mobile usa celular. Não gerar interfaces fictícias para substituir os prints reais.
- Pendências: e-mail profissional (`email` em data/site.cjs liga o botão de e-mail com copiar) e domínio final (`url`, gera canonical/og:image/sitemap).
- Não publicar nem dar push sem Iago pedir. Aceite criativo é dele; testes não o substituem.
