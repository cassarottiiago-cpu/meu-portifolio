const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');
const root = __dirname;
const escape = s => s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const slug = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function inline(s) {
  const tokens=[];
  const hold = html => { const key='TOKENPLACEHOLDER'+tokens.length+'ENDTOKEN'; tokens.push([key,html]); return key; };
  s=s.replace(/`([^`]+)`/g,(_,t)=>hold('<code>'+escape(t)+'</code>'));
  s=s.replace(/\[([^\]]+)\]\(([^)]+)\)/g,(_,label,url)=>hold('<a href="'+escape(url)+'">'+escape(label)+'</a>'));
  s=escape(s).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>');
  for(const [key,value] of tokens)s=s.replaceAll(key,value);
  return s;
}
function render(md) {
  const lines=md.replaceAll('\r','').split('\n'), html=[], sections=[];
  for(let i=0;i<lines.length;) {
    const l=lines[i];
    if(!l.trim()){i++;continue;}
    const heading=l.match(/^(#{1,3}) (.+)$/);
    if(heading){const level=heading[1].length,id=slug(heading[2]);html.push(`<h${level} id="${id}">${inline(heading[2])}</h${level}>`);if(level===2)sections.push({id,label:heading[2]});i++;continue;}
    if(/^<a id="fonte-\d+"><\/a>$/.test(l)){html.push(l);i++;continue;}
    if(l.startsWith('|')) {
      const rows=[];
      while(i<lines.length&&lines[i].startsWith('|'))rows.push(lines[i++].split('|').slice(1,-1).map(s=>s.trim()));
      html.push('<div class="table-wrap" tabindex="0" role="region" aria-label="Tabela de comparação"><table><thead><tr>'+rows[0].map(c=>'<th scope="col">'+inline(c)+'</th>').join('')+'</tr></thead><tbody>'+rows.slice(2).map(r=>'<tr>'+r.map(c=>'<td>'+inline(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>');
      continue;
    }
    const li=l.match(/^(\d+)\. (.+)$/);
    if(li){const items=[];const start=li[1];while(i<lines.length&&/^\d+\. /.test(lines[i]))items.push('<li>'+inline(lines[i++].replace(/^\d+\. /,''))+'</li>');html.push('<ol start="'+start+'">'+items.join('')+'</ol>');continue;}
    const paragraph=[];
    while(i<lines.length&&lines[i].trim()&&!/^(#{1,3} |\||<a id=|\d+\. )/.test(lines[i]))paragraph.push(lines[i++]);
    if(paragraph.length)html.push('<p>'+inline(paragraph.join(' '))+'</p>');else i++;
  }
  return {html:html.join('\n'),sections};
}
const styles=`
*{box-sizing:border-box}html{scroll-behavior:auto}body{margin:0;background:#fff;color:#252525;font:17px/1.65 'Segoe UI',Arial,sans-serif}a{color:#254fa0;text-decoration-thickness:1px;text-underline-offset:3px}a:hover{color:#162c57}a:focus-visible,button:focus-visible,summary:focus-visible,[tabindex]:focus-visible{outline:3px solid #254fa0;outline-offset:5px}h1,h2,h3{line-height:1.18;font-weight:600;letter-spacing:-.025em}h1{font-family:Georgia,serif;font-size:clamp(35px,4vw,58px);font-weight:400;margin:0 0 35px}h2{font-size:28px;margin:64px 0 22px;padding-top:22px;border-top:1px solid #bcbcbc}h3{font-size:21px;margin:32px 0 16px}p{margin:0 0 19px}strong{font-weight:650}main{max-width:1440px;margin:auto;display:grid;grid-template-columns:255px minmax(0,1fr);gap:54px;padding:46px 42px 100px}article{min-width:0;max-width:970px}nav{position:sticky;top:30px;align-self:start;max-height:calc(100vh - 65px);overflow:auto;font-size:13px;line-height:1.5;padding-right:18px}nav a{display:block;color:#454545;margin:0 0 10px;text-decoration:none}nav .document-links{padding-bottom:20px;margin-bottom:20px;border-bottom:1px solid #bcbcbc}nav .document-links a{color:#254fa0}nav summary{font-weight:600;cursor:pointer;margin-bottom:16px}.table-wrap{overflow:auto;margin:24px 0 30px}table{border-collapse:collapse;table-layout:fixed;width:100%;font-size:14px;line-height:1.5}th{text-align:left;font-weight:650;background:#f1f1f1}th,td{vertical-align:top;padding:12px 13px;border-bottom:1px solid #d0d0d0;overflow-wrap:anywhere}td:first-child{font-weight:500}ol{padding-left:26px;margin:20px 0}li{padding-left:4px;margin-bottom:12px}code{font:0.84em/1.5 Consolas,monospace;overflow-wrap:anywhere;background:#f3f3f3;padding:1px 3px}article>p,article>ol{max-width:85ch}a[id]{scroll-margin-top:30px}.reference-sheet{display:block;max-width:1150px;padding:60px 45px}.reference-sheet>p{max-width:78ch}.reference{margin:48px 0 65px;padding-top:25px;border-top:1px solid #aaa}.reference h2{border:0;margin:0 0 15px;padding:0}.reference figure{margin:24px 0}.reference img{display:block;width:100%;height:auto;border:1px solid #ddd}.reference figcaption{font-size:13px;color:#555;margin-top:10px}.reference .columns{display:grid;grid-template-columns:1fr 1fr;gap:28px}.reference p{max-width:80ch}.note{color:#555;font-size:14px}.toolbar{display:flex;gap:24px;align-items:center;margin:0 0 36px;font-size:14px}button{font:inherit;border:1px solid #999;border-radius:0;background:white;padding:6px 12px;cursor:pointer}
@media(max-width:1000px){main{grid-template-columns:1fr;padding:28px 24px 70px;gap:30px}nav{position:static;max-height:none;padding:0}nav details:not([open]){margin:0}nav .document-links{display:flex;gap:20px;flex-wrap:wrap}h2{font-size:25px}.reference-sheet{padding:28px 22px}table{min-width:680px}.reference .columns{grid-template-columns:1fr}}
@media print{@page{size:A4;margin:17mm 16mm 18mm}body{font:10.5pt/1.45 'Segoe UI',Arial,sans-serif;color:#111}main,.reference-sheet{display:block;padding:0;margin:0;max-width:none}nav,.toolbar{display:none}article{max-width:none}h1{font-size:29pt;margin-bottom:20pt}h2{font-size:17pt;margin:27pt 0 12pt;padding-top:12pt;break-after:avoid}h3{font-size:12pt;margin:18pt 0 10pt;break-after:avoid}p{margin-bottom:10pt;orphans:3;widows:3}table{font-size:8.4pt;min-width:0;line-height:1.35}th,td{padding:6pt}thead{display:table-header-group}tr{break-inside:avoid}.table-wrap{overflow:visible;margin:14pt 0}a{color:#1e4076;text-decoration:none}code{font-size:8pt}li{margin-bottom:8pt}.reference{break-inside:avoid}.reference img{max-height:130mm;object-fit:contain}.reference figcaption{font-size:9pt}}
`;
const md=fs.readFileSync(path.join(root,'BRIEFING.md'),'utf8');
const result=render(md);
const doc=(title,body)=>`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)}</title><style>${styles}</style></head><body>${body}<script>const summary=document.querySelector('nav details');if(summary){const narrow=matchMedia('(max-width:1000px)');const adjust=()=>{summary.open=!narrow.matches};adjust();narrow.addEventListener('change',adjust);}</script></body></html>`;
const nav='<nav aria-label="Sumário do briefing"><div class="document-links"><a href="ABERTURAS.html">Nova seleção com vídeos</a><a href="REFERENCIAS.html">Histórico de referências</a><a href="BRIEFING.pdf">Versão em PDF</a><a href="BRIEFING.md">Texto em Markdown</a></div><details open><summary>Conteúdo do briefing</summary>'+result.sections.map(s=>'<a href="#'+s.id+'">'+escape(s.label)+'</a>').join('')+'</details></nav>';
fs.writeFileSync(path.join(root,'BRIEFING.html'),doc('Briefing do portfólio de Iago Cassarotti','<main>'+nav+'<article>'+result.html+'</article></main>'));
const refs=[
 {name:'Bruno Arizio',url:'https://brunoarizio.com/',image:'bruno-arizio-inicio.png',kind:'Portfólio de design e direção criativa',observe:'Observe a relação entre o índice lateral, as imagens de projeto e o espaço em branco. O acervo organiza a identidade visual da página.',application:'Referência para a apresentação editorial dos seus trabalhos. A tipografia de contexto precisa ser maior no seu projeto para permitir leitura confortável.'},
 {name:'Rauno Freiberg',url:'https://rauno.me/',image:'rauno-inicio.png',kind:'Interesse parcial nas abas; abertura rejeitada',observe:'Iago relatou que a abertura desagradou e que chegou ao fim da rolagem com a impressão de haver pouco conteúdo. Só depois percebeu a interação por clique. As abas despertaram interesse parcial.',application:'Investigar o mecanismo de abas sem presumir sua adoção. O conteúdo principal deve ser percebido durante a navegação natural, com controles reconhecíveis. Esta é uma interpretação do relato pessoal, não uma conclusão sobre todos os visitantes.'},
 {name:'Dennis Snellenberg',url:'https://dennissnellenberg.com/',image:'dennis-snellenberg-inicio.png',kind:'Portfólio de designer e desenvolvedor',observe:'Observe a presença da pessoa e a identificação direta da atuação. Explore a passagem da apresentação aos projetos.',application:'Ajuda a avaliar quanto você quer aparecer na abertura. O retrato, a faixa de texto e o elemento arredondado são assinaturas dessa referência, não instruções para reproduzir seu layout.'},
 {name:'Bartosz Ciechanowski',url:'https://ciechanow.ski/mechanical-watch/',kind:'Ensaio interativo: Mechanical Watch',observe:'Experimente os controles que desmontam e explicam um relógio mecânico. É a referência mais próxima de descobrir uma relação pela própria participação.',application:'Aplicar esse princípio a decisões reais de interface: comparar estados, explorar hierarquia e observar consequências. O artigo abriu; a demonstração gráfica estava em carregamento na captura, por isso não há prévia ilustrativa aqui.'},
 {name:'Josh W. Comeau',url:'https://www.joshwcomeau.com/',image:'josh-comeau-inicio.png',kind:'Site autoral de conteúdo e demonstração técnica',observe:'Observe a voz pessoal e os exemplos em que o leitor modifica parâmetros. A personalidade convive com conteúdo que pode ser consultado diretamente.',application:'Referência para pequenos experimentos técnicos dentro dos casos. As etiquetas arredondadas da página não fazem parte da direção proposta para Iago.'},
 {name:'Bruno Simon',url:'https://bruno-simon.com/',kind:'Portfólio como mundo 3D',observe:'A proposta do autor é explorar seus trabalhos dirigindo por um mundo interativo. Abra com tempo para carregar e avaliar a experiência.',application:'Referência de ambição espacial e coerência entre habilidade e demonstração. A inspeção confirmou página e controles documentados, mas não validou o mundo completo; não há taxa de contratação pública analisada.'},
 {name:'Masayuki Daijima',url:'https://daijima.jp/',kind:'Portfólio japonês de interação e programação criativa',observe:'Observe o repertório de forma, gesto e audiovisual e sua relação com uma trajetória profissional concreta.',application:'Amplia o repertório além dos portfólios ocidentais. Inspeção visual parcial: a página retornou conteúdo, mas o percurso completo não foi validado.'},
 {name:'Nicky Case',url:'https://ncase.me/',kind:'Acervo autoral de experiências e explicações',observe:'Explore como perguntas e escolhas se tornam experiências que permitem entender um tema.',application:'Referência para participação significativa. É um acervo de projetos autorais, com proposta diferente de um currículo de UX/UI.'},
];
let refsBody='<div class="toolbar"><a href="BRIEFING.html">Ler o briefing completo</a><a href="BRIEFING.pdf">Baixar PDF</a></div><h1>Referências para o portfólio</h1><p>Histórico da primeira seleção e do feedback de Iago, atualizado em 10 de setembro de 2026. Nenhuma referência está aprovada como direção visual.</p><p>Rauno despertou interesse parcial pelas abas, com rejeição à abertura. As demais referências foram rejeitadas em conjunto: simples demais, com texto demais e sem um gancho visual imediato. Iago quer ser atraído nos primeiros três segundos; esse tempo passa a ser uma meta criativa para avaliar a abertura, não uma regra universal de abandono.</p><p>As observações originais abaixo ficam como registro da pesquisa, não como orientação para implementar o portfólio. A próxima direção precisa apresentar trabalho visualmente desde a entrada, com uma transformação que convide a continuar e explicações distribuídas ao longo da exploração. A proposta editorial inicial deixa de ser a recomendação principal.</p>';
refsBody+='<p><a href="ABERTURAS.html">Abrir a segunda rodada com vídeos, preparada em 11/09/2026</a>. Esta página preserva apenas o histórico da primeira seleção.</p>';
for(const r of refs){const partial=r.name==='Rauno Freiberg';refsBody+='<section class="reference"><h2><a href="'+r.url+'">'+escape(r.name)+'</a></h2><p class="note">'+escape(partial?r.kind:'Descartada como direção visual na rejeição conjunta da seleção')+'</p><div class="columns"><p>'+escape((partial?'':'Análise inicial da pesquisa: ')+r.observe)+'</p><p>'+escape(partial?r.application:'Não adotar como referência visual. O feedback coletivo não especificou quais elementos desta página motivaram a rejeição.')+'</p></div>'+(r.image?'<figure><a href="'+r.url+'"><img src="capturas/'+r.image+'" alt="Captura da página de '+escape(r.name)+'" loading="lazy"></a><figcaption>Fonte: '+escape(r.name)+', site oficial. Captura de 10 de setembro de 2026. A imagem registra um momento da página e não demonstra toda a interação.</figcaption></figure>':'')+'</section>';}
refsBody+='<section class="reference"><h2>Estúdios incluídos na seleção inicial</h2><p><a href="https://lusion.co/">Lusion</a> e <a href="https://activetheory.net/">Active Theory</a> também constavam da prancha. A seleção foi rejeitada em conjunto; não houve avaliação individual detalhada destes estúdios. Não há aprovação para usá-los como direção visual. São equipes e modelos de trabalho distintos de um portfólio individual, e as capturas automáticas tiveram carregamento parcial.</p></section><p class="note">Nenhuma destas referências foi selecionada por taxa de conversão comprovada. Para evidências de contratação, satisfação e usabilidade, consulte as fontes do briefing.</p>';
fs.writeFileSync(path.join(root,'REFERENCIAS.html'),doc('Referências para o portfólio','<main class="reference-sheet">'+refsBody+'</main>'));
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const checks=[];
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  for(const name of ['BRIEFING.html','REFERENCIAS.html']){
   await page.goto(pathToFileURL(path.join(root,name)).href,{waitUntil:'load'});
   checks.push({file:name,title:await page.title(),h1:await page.locator('h1').count(),missingAnchors:await page.locator('a[href^="#"]').evaluateAll(links=>links.filter(a=>!document.getElementById(decodeURIComponent(a.hash.slice(1)))).map(a=>a.hash))});
   await page.screenshot({path:path.join(root,name.replace('.html','-desktop.png'))});
   if(name==='BRIEFING.html')await page.pdf({path:path.join(root,'BRIEFING.pdf'),format:'A4',printBackground:true,preferCSSPageSize:true,tagged:true,outline:true});
   await page.setViewportSize({width:390,height:844});
   await page.screenshot({path:path.join(root,name.replace('.html','-mobile.png'))});
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth);
   checks[checks.length-1].mobileOverflow=overflow;
   await page.setViewportSize({width:1440,height:1000});
  }
 }finally{await browser.close();}
 fs.writeFileSync(path.join(root,'verificacao-documentos.json'),JSON.stringify(checks,null,2));
 if(checks.some(c=>c.h1!==1||c.missingAnchors.length||c.mobileOverflow)){console.error(JSON.stringify(checks,null,2));process.exitCode=1;return;}
 console.log(JSON.stringify({ok:true,words:md.split(/\s+/).filter(Boolean).length,checks},null,2));
})();
