const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const slug = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function inline(value) {
  const tokens = [];
  const hold = html => { const key = `INLINETOKEN${tokens.length}END`; tokens.push([key, html]); return key; };
  value = value.replace(/`([^`]+)`/g, (_, text) => hold(`<code>${escape(text)}</code>`));
  value = value.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => hold(`<a href="${escape(href)}">${escape(text)}</a>`));
  value = escape(value).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  for (const [key, html] of tokens) value = value.replaceAll(key, html);
  return value;
}
function render(markdown) {
  const lines = markdown.replaceAll('\r', '').split('\n');
  const output = [];
  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    if (!line.trim()) { index++; continue; }
    const heading = line.match(/^(#{1,3}) (.+)$/);
    if (heading) { output.push(`<h${heading[1].length} id="${slug(heading[2])}">${inline(heading[2])}</h${heading[1].length}>`); index++; continue; }
    if (line.startsWith('|')) {
      const rows = [];
      while (index < lines.length && lines[index].startsWith('|')) rows.push(lines[index++].split('|').slice(1, -1).map(cell => cell.trim()));
      output.push('<div class="table-scroll" role="region" aria-label="Decisões de direção" tabindex="0"><table><thead><tr>' + rows[0].map(cell => `<th scope="col">${inline(cell)}</th>`).join('') + '</tr></thead><tbody>' + rows.slice(2).map(row => '<tr>' + row.map(cell => `<td>${inline(cell)}</td>`).join('') + '</tr>').join('') + '</tbody></table></div>'); continue;
    }
    if (/^\d+\. /.test(line)) {
      const items = [];
      while (index < lines.length && /^\d+\. /.test(lines[index])) items.push(`<li>${inline(lines[index++].replace(/^\d+\. /, ''))}</li>`);
      output.push('<ol>' + items.join('') + '</ol>'); continue;
    }
    const paragraph = [];
    while (index < lines.length && lines[index].trim() && !/^(#{1,3} |\||\d+\. )/.test(lines[index])) paragraph.push(lines[index++]);
    output.push(`<p>${inline(paragraph.join(' '))}</p>`);
  }
  return output.join('\n');
}
const storyboards = `
<section class="storyboards" aria-labelledby="sequencias"><h2 id="sequencias">Sequências para discutir</h2>
<p>Os quadros abaixo explicam a ordem dos acontecimentos. São esquemas de conteúdo, não layouts finais nem demonstrações do movimento já implementado.</p>
<h3>A. Corte contínuo</h3><p>Uma sequência de trabalho ocupa o campo principal. A rolagem liga enquadramentos do mesmo projeto e depois abre o próximo.</p>
<div class="sequence">
<figure><div class="frame"><img src="../../prototipo/assets/qozt.webp" alt="Captura real da QOZT, proposta como assunto dominante da entrada."><span class="frame-label">01 · O trabalho já está em cena</span></div><figcaption>Identificar Iago e sua atuação. Mostrar o projeto, sem uma ilustração lateral.</figcaption></figure>
<figure><div class="frame detail"><img src="../../prototipo/assets/qozt.webp" alt="Recorte ampliado da interface da QOZT para representar uma mudança de enquadramento."><span class="frame-label">02 · A rolagem muda o enquadramento</span></div><figcaption>Relacionar detalhe e conjunto. A mesma imagem continua reconhecível durante a passagem.</figcaption></figure>
<figure><div class="frame"><img src="assets/phron-noturno.webp" alt="Captura real do PHRON em modo noturno, em desenvolvimento, como exemplo de próximo trabalho da sequência."><span class="frame-label">03 · O campo se abre para outro trabalho</span></div><figcaption>PHRON em modo noturno, conforme solicitado. Captura de uma versão em desenvolvimento de 7 de setembro; o menu direto permanece acessível.</figcaption></figure>
</div>
<p><strong>O que precisa provar:</strong> atração visual e continuidade. <strong>Risco:</strong> parecer um vídeo que obriga a esperar. Nenhuma reprodução deve bloquear o acesso aos projetos.</p>
<h3>B. Ponto de vista</h3><p>A interface já aparece pronta. Um comando explícito permite observar uma escolha e experimentar uma consequência.</p>
<div class="sequence">
<figure><div class="frame"><img src="../../prototipo/assets/qozt.webp" alt="Captura real da QOZT antes da observação de uma decisão."><span class="frame-label">01 · Ver o resultado</span></div><figcaption>O trabalho se sustenta mesmo sem interação. O convite é claro: “Ver uma escolha”.</figcaption></figure>
<figure><div class="frame focus"><img src="../../prototipo/assets/qozt.webp" alt="Esquema de foco sobre a relação entre informação e pedido de demonstração na QOZT."><span class="focus-mark" aria-hidden="true"></span><span class="frame-label">02 · Encontrar uma relação</span></div><figcaption>Revelar uma relação de interface. Confirmar a justificativa com Iago antes de atribuí-la ao processo original.</figcaption></figure>
<figure><div class="frame consequence"><div><span>MESMA INFORMAÇÃO</span><div class="wide">Conteúdo &nbsp; → &nbsp; Ação</div><div class="narrow">Conteúdo<br>↓<br>Ação</div></div><span class="frame-label">03 · Testar o que muda</span></div><figcaption>Esquema de uma consequência possível: outra largura. O comportamento real ainda precisa ser verificado.</figcaption></figure>
</div>
<p><strong>O que precisa provar:</strong> participação que ensina algo sobre o trabalho. <strong>Risco:</strong> virar uma aula ou um editor fictício. A prova deve explorar uma escolha por vez.</p>
<p><strong>Prioridade sugerida:</strong> testar A para a entrada. B é uma alternativa a comparar, não um efeito extra para empilhar na mesma abertura.</p>
</section>
<section class="visual-references" aria-labelledby="recortes"><h2 id="recortes">Recortes do repertório</h2><p>As imagens documentam obras de terceiros. Não são templates e não serão usadas como assets do portfólio.</p>
<figure><a href="https://www.dia.studio/work/adidas-sb"><img src="capturas/adidas-abertura.jpg" alt="DIA, Adidas Skateboarding: aplicações com padrões tipográficos e imagens de produto e skate."></a><figcaption><a href="https://www.dia.studio/work/adidas-sb">DIA · Adidas Skateboarding</a>. Observar como a identidade usa um sistema gráfico ligado ao assunto. Os padrões e as fotografias não são propostas para Iago.</figcaption></figure>
<figure><a href="https://www.dia.studio/work/scan-type"><img src="capturas/scan-type-abertura.jpg" alt="DIA, Scan Type: exemplos de tipografia em transformação."></a><figcaption><a href="https://www.dia.studio/work/scan-type">DIA · Scan Type</a>. Observar regras de comportamento tipográfico. O próprio estúdio descreve esse efeito como muito reproduzido; não é a solução recomendada para buscar originalidade.</figcaption></figure>
<p>Para a ligação entre skate, hip-hop e linguagem gráfica, a referência cultural mais pertinente desta rodada é <a href="https://order.design/project/all-the-streets-are-silent">All the Streets Are Silent, da Order</a>. A proposta é estudar os títulos e seu sistema, não copiar a página do case.</p>
</section>`;
const styles = `
*{box-sizing:border-box}html{scroll-behavior:auto}body{margin:0;color:#222;background:#fff;font:17px/1.65 'Segoe UI',Arial,sans-serif}main{max-width:1190px;margin:auto;padding:45px 35px 90px}h1,h2,h3{line-height:1.18;letter-spacing:-.025em}h1{font-size:clamp(31px,4vw,51px);font-weight:550;max-width:900px;margin:0 0 30px}h2{font-size:29px;margin:58px 0 24px;padding-top:20px;border-top:1px solid #bbb}h3{font-size:22px;margin:32px 0 16px}p{max-width:85ch;margin:0 0 20px}a{color:#17478e;text-underline-offset:3px}a:focus-visible,[tabindex]:focus-visible{outline:3px solid #17478e;outline-offset:4px}.navigation{display:flex;flex-wrap:wrap;gap:14px 25px;font-size:14px;margin:0 0 35px;padding-bottom:20px;border-bottom:1px solid #aaa}.sequence{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:23px;margin:25px 0 28px}figure{margin:0;min-width:0}.frame{aspect-ratio:1.6;position:relative;overflow:hidden;background:#f5f5f5;border:1px solid #aaa}.frame>img{width:100%;height:100%;object-fit:contain}.frame-label{position:absolute;bottom:0;left:0;right:0;background:#fff;padding:7px 8px;border-top:1px solid #aaa;font-size:10px;line-height:1.3;color:#222}.detail>img{position:absolute;width:180%;max-width:none;height:auto;left:-7%;top:-16%;object-fit:initial}.focus>img{opacity:.3}.focus-mark{position:absolute;left:2%;top:39%;width:48%;height:20%;border:2px solid #252525;background:#ffffff30}.consequence{display:grid;place-items:center;padding:14px 10px 36px}.consequence>div{width:90%;font-size:8px}.consequence .wide,.consequence .narrow{border:1px solid #666;text-align:center;padding:6px;margin:6px 0;background:white}.consequence .narrow{width:43%;margin-left:auto}.consequence .wide{width:100%}figcaption{font-size:13px;line-height:1.55;margin-top:11px;color:#444}.visual-references figure{margin:28px 0 36px}.visual-references img{width:100%;display:block;border:1px solid #ccc}.table-scroll{overflow:auto;margin:25px 0}table{width:100%;border-collapse:collapse;font-size:14px}th,td{text-align:left;vertical-align:top;border-bottom:1px solid #ccc;padding:12px 14px}th{background:#f2f2f2}code{font:12px/1.5 Consolas,monospace;overflow-wrap:anywhere}ol{padding-left:24px;max-width:90ch}li{padding-left:4px;margin-bottom:15px}.document-links{margin-top:40px}article{min-width:0}article>h1{display:none}.storyboards{margin-bottom:55px}.small-note{font-size:13px;color:#555}
@media(max-width:760px){main{padding:25px 21px 60px}.sequence{grid-template-columns:1fr;gap:25px}.frame{aspect-ratio:1.6}.frame-label{font-size:12px}.consequence>div{font-size:12px}h2{font-size:26px}h3{font-size:21px}table{min-width:650px}.navigation{font-size:13px;gap:12px 18px}body{font-size:16px}}
@media print{@page{size:A4;margin:17mm 16mm}body{font-size:10.5pt;line-height:1.45}main{padding:0;max-width:none}.navigation,.document-links{display:none}h1{font-size:28pt;margin-bottom:20pt}h2{font-size:17pt;margin:25pt 0 13pt;break-after:avoid}h3{font-size:12pt;margin:20pt 0 10pt;break-after:avoid}p{orphans:3;widows:3;margin-bottom:10pt}.sequence{gap:12px}.sequence figure{break-inside:avoid}.frame-label{font-size:6pt;padding:4px}figcaption{font-size:8pt}table{font-size:8pt;min-width:0}th,td{padding:7px}tr{break-inside:avoid}.visual-references figure{break-inside:avoid}.visual-references img{max-height:105mm;object-fit:contain}.table-scroll{overflow:visible}code{font-size:8pt}a{color:#222;text-decoration:none}.storyboards{break-before:page}.visual-references{break-before:page}}
`;
const source = fs.readFileSync(path.join(__dirname, 'REVISAO_DE_DIRECAO.md'), 'utf8');
const body = render(source);
const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Direção de experiência para o portfólio de Iago Cassarotti</title><style>${styles}</style></head><body><main><nav class="navigation" aria-label="Conteúdo"><a href="#resumo">Resumo</a><a href="#sequencias">Duas sequências</a><a href="#recortes">Recortes visuais</a><a href="#diagnostico-da-primeira-versao">Diagnóstico</a><a href="#fontes">Fontes</a><a href="REVISAO_DE_DIRECAO.pdf">PDF</a></nav><h1 id="resumo">Direção de experiência para o portfólio de Iago Cassarotti</h1><p>A paleta e a tipografia receberam uma reação positiva. A composição da abertura foi rejeitada. A próxima prova deve mudar a organização da experiência, sem presumir que outro objeto ao lado do nome resolveria o problema.</p><p><strong>Aposta principal:</strong> começar com os trabalhos em uma sequência visual contínua. O nome identifica a autoria; a rolagem muda o enquadramento e revela relações entre as interfaces. A alternativa é uma entrada que permite explorar uma decisão de design.</p><p class="small-note">Este é um caderno de direção. O portfólio existente não foi alterado. As sequências são hipóteses para discussão, não layouts aprovados.</p>${storyboards}<article aria-label="Análise completa">${body}</article><p class="document-links"><a href="REVISAO_DE_DIRECAO.md">Texto-fonte</a> · <a href="REVISAO_DE_DIRECAO.pdf">Versão em PDF</a></p></main></body></html>`;
fs.writeFileSync(path.join(__dirname, 'CADERNO.html'), html);
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const result = { checkedAt: new Date().toISOString(), pages: [], errors: [] };
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.on('pageerror', error => result.errors.push(error.message));
    await page.goto(pathToFileURL(path.join(__dirname, 'CADERNO.html')).href);
    result.missingAnchors = await page.locator('a[href^="#"]').evaluateAll(els => els.filter(el => !document.getElementById(el.hash.slice(1))).map(el => el.hash));
    result.brokenImages = await page.locator('img').evaluateAll(els => els.filter(el => !el.complete || !el.naturalWidth).map(el => el.src));
    await page.pdf({ path: path.join(__dirname, 'REVISAO_DE_DIRECAO.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true, tagged: true, outline: true });
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
      await page.screenshot({ path: path.join(__dirname, `caderno-${width}.png`) });
      result.pages.push({ width, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth) });
    }
  } finally { await browser.close(); fs.writeFileSync(path.join(__dirname, 'verificacao-caderno.json'), JSON.stringify(result, null, 2)); }
  console.log(JSON.stringify(result));
  if (result.errors.length || result.missingAnchors.length || result.brokenImages.length || result.pages.some(p => p.overflow)) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
