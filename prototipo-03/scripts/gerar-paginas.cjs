const fs = require('node:fs');
const path = require('node:path');
const projects = require('./projetos.cjs');
const dimensions = require('./dimensoes.cjs');
const root = path.resolve(__dirname, '..');
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const chevron = '<span aria-hidden="true">&gt;&gt;</span>';
const paragraphs = items => items.map(item => '<p>' + esc(item) + '</p>').join('\n');
function shell(title, description, content, prefix = '', pageClass = '') {
  return [
    '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#eee9df">',
    '<meta name="description" content="' + esc(description) + '"><title>' + esc(title) + ' | Iago Cassarotti</title>',
    '<link rel="icon" href="' + prefix + 'icon.svg"><link rel="preload" href="' + prefix + 'assets/fonts/barlow-condensed-bold.ttf" as="font" type="font/ttf" crossorigin>',
    '<link rel="stylesheet" href="' + prefix + 'style.css"><link rel="stylesheet" href="' + prefix + 'editorial.css">' + (pageClass === 'archive-page' ? '<link rel="stylesheet" href="archive-ink.css">' : '') + '<link rel="stylesheet" href="' + prefix + 'expression.css"><script src="' + prefix + 'site.js" defer></script></head>',
    '<body class="' + pageClass + '"><a class="skip" href="#conteudo">Pular para o conteúdo</a>',
    '<header class="masthead"><a class="signature" href="' + prefix + 'index.html"><span>Iago</span> <span>Cassarotti</span></a><p class="profession">Design & desenvolvimento<br>UI / UX</p>',
    '<nav class="direct-nav" aria-label="Navegação principal"><a href="' + prefix + 'projetos.html"' + (pageClass === 'archive-page' ? ' aria-current="page"' : '') + '>Projetos ' + chevron + '</a></nav></header>',
    content, '</body></html>'
  ].join('\n');
}
function print(file, caption, options = {}) {
  const [width, height] = dimensions(file);
  return '<figure class="project-visual ' + (options.className || '') + '" data-reveal><a class="print-open" href="../assets/' + file + '" data-print aria-label="Ampliar: ' + esc(caption) + '"><img src="../assets/' + file + '" width="' + width + '" height="' + height + '" alt="' + esc(caption) + '" ' + (options.eager ? 'fetchpriority="high"' : 'loading="lazy"') + '><span class="print-action">Ampliar ' + chevron + '</span></a><figcaption>' + esc(caption) + '</figcaption></figure>';
}
function viewer() {
  return '<dialog class="print-viewer" aria-labelledby="print-title"><div class="print-toolbar"><h2 id="print-title">Por dentro da imagem</h2><button type="button" class="text-link print-size" aria-pressed="false">Tamanho real ' + chevron + '</button><button type="button" class="text-link print-close" autofocus>Fechar ' + chevron + '</button></div><div class="print-canvas" tabindex="0" aria-label="Imagem ampliada; use a rolagem para explorar"></div></dialog>';
}
function generate() {
  fs.mkdirSync(path.join(root, 'projetos'), { recursive: true });
  const validCaseFiles = new Set(projects.map(p => p.id + '.html'));
  for (const file of fs.readdirSync(path.join(root, 'projetos'))) {
    if (file.endsWith('.html') && !validCaseFiles.has(file)) fs.unlinkSync(path.join(root, 'projetos', file));
  }
  const archiveEntries = projects.map(p => {
    const image = p.thumb;
    const [w, h] = dimensions(image);
    return '<article class="archive-entry' + (p.mobile ? ' archive-mobile' : '') + '" data-project="' + p.id + '" data-reveal><a class="archive-cover" href="projetos/' + p.id + '.html" aria-label="Conhecer ' + esc(p.name) + (p.location ? ' ' + esc(p.location) : '') + '"><img src="assets/' + image + '" width="' + w + '" height="' + h + '" alt="' + esc(p.alt) + '" loading="lazy"></a><div class="archive-caption"><p class="work-kind">' + esc(p.kind) + (p.location ? ' / ' + esc(p.location) : '') + '</p><h2><a href="projetos/' + p.id + '.html">' + esc(p.name) + ' ' + chevron + '</a></h2><p>' + esc(p.line) + '</p></div></article>';
  }).join('\n');
  const archive = '<main id="conteudo" tabindex="-1"><div class="archive-intro" data-reveal><p class="archive-kicker">Design, interfaces & desenvolvimento</p><h1 data-type-reveal><span>TRABALHOS.</span></h1><div class="archive-intro-bottom"><p>Produtos, sites e interfaces.<br>Cada trabalho, um ponto de partida.</p><a class="text-link" href="#selecao">Explorar a seleção ' + chevron + '</a></div></div><div class="archive-grid" id="selecao">' + archiveEntries + '</div></main><footer><a class="case-next" href="index.html#liberdade"><div><strong>APRENDER ME DÁ LIBERDADE.</strong></div>' + chevron + '</a></footer>';
  fs.writeFileSync(path.join(root, 'projetos.html'), shell('Projetos', 'Projetos de design e desenvolvimento de Iago Cassarotti.', archive, '', 'archive-page'));
  projects.forEach((p, index) => {
    const next = projects[(index + 1) % projects.length];
    const detail = p.detail ? print(p.detail, p.detailCaption, { className: 'print-detail' }) : '';
    const mobile = p.mobile ? print(p.mobile, p.mobileCaption || 'A interface ' + p.name + ' na versão de celular.', { className: 'print-mobile' }) : '';
    const extra = p.extraPrint ? print(p.extraPrint, p.extraCaption || p.alt, { className: 'print-detail' }) : '';
    const full = p.full ? '<p class="complete-print"><a class="text-link" href="../assets/' + p.full + '" data-print data-full aria-label="Ampliar a página completa de ' + esc(p.name) + '">Ver a página completa ' + chevron + '</a>' + (p.fullCaption ? '<small class="capture-note">' + esc(p.fullCaption) + '</small>' : '') + '</p>' : '';
    const spread = detail || mobile || extra ? '<div class="print-spread' + (mobile ? ' has-mobile' : '') + '">' + mobile + detail + extra + '</div>' : '';
    const content = [
      '<main class="project-page" id="conteudo" tabindex="-1"><div class="project-top" data-reveal><div class="project-crumb"><a class="text-link" href="../projetos.html">Voltar aos projetos ' + chevron + '</a><span>' + esc(p.kind) + (p.location ? ' / ' + esc(p.location) : '') + '</span></div><h1 data-type-reveal><span>' + esc(p.name) + '</span></h1><div class="project-lede"><p>' + esc(p.line) + '</p><dl class="project-facts"><div><dt>Trabalho</dt><dd>' + esc(p.scope) + '</dd></div><div><dt>Estado</dt><dd>' + esc(p.status) + '</dd></div></dl></div></div>',
      print(p.image, p.alt, { eager: true, className: 'print-hero' }),
      full,
      '<section class="project-story" aria-labelledby="contexto" data-reveal><h2 id="contexto">' + esc(p.heading) + '</h2><div>' + paragraphs(p.context) + '</div></section>',
      '<section class="project-decisions" aria-labelledby="decisoes" data-reveal><h2 id="decisoes">Por dentro da interface.</h2><div class="decision-grid">' + p.decisions.map(([title, text]) => '<article data-reveal><h3>' + esc(title) + '</h3><p>' + esc(text) + '</p></article>').join('') + '</div></section>',
      spread,
      '<section class="project-story development" aria-labelledby="desenvolvimento" data-reveal><h2 id="desenvolvimento">Do desenho<br>à construção.</h2><div>' + paragraphs(p.development) + (p.url ? '<a class="text-link" href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer">Visitar o site ' + chevron + '</a>' : '') + '</div></section></main>',
      '<footer><a class="case-next" href="' + next.id + '.html"><div><small>Próximo projeto</small><strong>' + esc(next.name) + '</strong></div>' + chevron + '</a></footer>', viewer()
    ].join('\n');
    fs.writeFileSync(path.join(root, 'projetos', p.id + '.html'), shell(p.name, p.line + ' ' + p.scope + '.', content, '../', 'case-page'));
  });
  const footage = [
    ['Skate', 'a-skater-doing-skateboarding-on-a-vert-ramp-1366'], ['BMX', 'biker-doing-bmx-tricks-198'],
    ['Surf', 'person-surfing-1127'], ['Motocross', 'tacking-view-of-a-motorcyclist-in-the-desert-43101'],
    ['Snowboard', 'person-practicing-snowboarding-3373'], ['Salto de paraquedas / BASE jump', 'extreme-skydiving-3478']
  ];
  const credits = '<main class="credits" id="conteudo" tabindex="-1"><h1>Créditos das cenas.</h1><p>A sequência do rodapé reúne seis cenas de banco de vídeo. São referências aos esportes que me interessam, não registros pessoais meus.</p><ul>' + footage.map(([title, slug]) => '<li><a href="https://mixkit.co/free-stock-video/' + slug + '/" target="_blank" rel="noopener noreferrer">' + title + ' · Mixkit ' + chevron + '</a></li>').join('') + '</ul><p>Cenas disponíveis sob a <a href="https://mixkit.co/license/#videoFree" target="_blank" rel="noopener noreferrer">Mixkit Stock Video Free License</a>. Edição sem áudio.</p><p>As capturas mostram interfaces reais, com suas proporções e cores originais. Marcas, fotografias e conteúdos de terceiros presentes dentro delas permanecem de seus respectivos titulares.</p><a class="text-link" href="index.html#liberdade">Voltar às cenas ' + chevron + '</a></main>';
  fs.writeFileSync(path.join(root, 'creditos.html'), shell('Créditos', 'Fontes e licença da edição de esportes no rodapé.', credits, '', 'credits-page'));
  console.log('Arquivo com ' + projects.length + ' projetos, casos e créditos gerados.');
}
if (require.main === module) generate();
module.exports = { generate };
