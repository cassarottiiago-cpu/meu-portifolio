const fs=require('node:fs');
const path=require('node:path');
const projects=require('../data/projects.cjs');
const {button,whatsapp}=require('./botoes.cjs');
const featured=['autopost','dr-paulo','natalia','qozt'].map(id=>projects.find(p=>p.id===id));
const dimensions=require('./dimensoes.cjs');
const root=path.resolve(__dirname,'..');
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const chevron='<span aria-hidden="true">&gt;&gt;</span>';
const para=list=>list.map(s=>'<p>'+esc(s)+'</p>').join('');
function img(file,alt,prefix='',eager=false){const [w,h]=dimensions(file);return '<img src="'+prefix+'assets/'+file+'" width="'+w+'" height="'+h+'" alt="'+esc(alt)+'" '+(eager?'fetchpriority="high"':'loading="lazy"')+' decoding="async">';}
function head(title,description,prefix=''){return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#eee9df"><title>'+esc(title)+' | Iago Cassarotti</title><meta name="description" content="'+esc(description)+'"><link rel="icon" href="'+prefix+'icon.svg"><link rel="preload" href="'+prefix+'assets/fonts/dm-sans.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="'+prefix+'fonts.css"><link rel="stylesheet" href="'+prefix+'site.css"><link rel="stylesheet" href="'+prefix+'cases.css"><link rel="stylesheet" href="'+prefix+'interactions.css"><script src="'+prefix+'app.js" defer></script></head>';}
function mark(prefix=''){return '<a class="owner" href="'+prefix+'index.html">Iago Cassarotti</a>';}
function print(file,alt,cls='',eager=false){return '<figure class="case-print '+cls+'"><a href="../assets/'+file+'" data-print aria-label="Ampliar: '+esc(alt)+'">'+img(file,alt,'../',eager)+'<span class="print-hint">Ampliar '+chevron+'</span></a><figcaption>'+esc(alt)+'</figcaption></figure>';}
function viewer(){return '<dialog class="print-viewer" aria-labelledby="print-title"><div class="print-toolbar"><h2 id="print-title">Imagem do projeto</h2><button type="button" data-size aria-pressed="false">Tamanho real '+chevron+'</button><button type="button" data-close autofocus>Fechar '+chevron+'</button></div><div class="print-canvas" tabindex="0" aria-label="Imagem ampliada; use a rolagem para explorar"></div></dialog>';}
function renderHome(){

const panels=featured.map(p=>{
 const media=[p.image];
 return '<div class="project-panel project-story" id="panel-'+p.id+'" aria-labelledby="project-title-'+p.id+'" data-project="'+p.id+'"><div class="panel-heading"><div><h3 id="project-title-'+p.id+'">'+esc(p.name)+'</h3><p>'+esc(p.kind)+' / '+esc(p.scope)+'</p></div>'+button('projetos/'+p.id+'.html','Ver caso','open')+'</div><div class="panel-media">'+media.map((f,i)=>'<a href="projetos/'+p.id+'.html" class="'+(f===p.mobile?'portrait':'landscape')+'" aria-label="Conhecer '+esc(p.name)+'">'+img(f,i===0?p.alt:f===p.mobile?(p.mobileCaption||p.alt):(p.detailCaption||p.alt),'',false)+'</a>').join('')+'</div></div>';
}).join('');
return head('Creative Developer','Design de interfaces, UI/UX e desenvolvimento. Os trabalhos de Iago Cassarotti.')+
'<body class="home"><a class="skip" href="#trabalhos">Pular para os trabalhos</a><main>'+
'<section class="intro" id="inicio" aria-labelledby="intro-title"><header class="home-nav">'+mark()+'<nav aria-label="Navegação principal">'+button('#trabalhos','Work','work')+button(whatsapp,'WhatsApp','chat','target="_blank" rel="noopener noreferrer"')+'</nav></header>'+
'<div class="brand-field" aria-hidden="true"><canvas id="brand-canvas"></canvas></div>'+
'<h1 id="intro-title" class="intro-type" aria-label="Creative Developer"><span class="type-group type-creative" aria-hidden="true"><span class="type-echo"><span>CREATIVE</span></span><span class="type-full"><span>CREATIVE</span></span><span class="type-fragment"><span>CREATIVE</span></span></span><span class="type-group type-developer" aria-hidden="true"><span class="type-full"><span>DEVELOPER</span></span><span class="type-echo"><span>DEVELOPER</span></span><span class="type-fragment"><span>DEVELOPER</span></span></span></h1>'+
'<div class="intro-bottom"><p>Design de interfaces<br>Experiência & desenvolvimento</p>'+button('#trabalhos','Explorar','open')+'</div></section>'+
'<section id="trabalhos" class="work-stage work-continuous" tabindex="-1" aria-labelledby="work-title"><div class="work-heading"><h2 id="work-title">Projetos<br> selecionados</h2><p>UI / UX<br>Design & desenvolvimento</p></div><div class="work-panels">'+panels+'</div></section></main>'+
'<footer id="percurso" class="end-invitation" aria-labelledby="invitation-title"><div class="invitation-top"><p>Agora, por dentro.</p>'+button('#inicio','Voltar','back')+'</div><div class="clone-field" aria-hidden="true"></div><a id="invitation-title" class="invitation-link" href="projetos/autopost.html"><span>VER TODOS</span><span>OS PROJETOS '+chevron+'</span></a><div class="invitation-bottom"><p>Da primeira ideia<br>ao que foi construído.</p><a href="creditos.html">Fontes & créditos</a></div></footer></body></html>';
}
function renderCase(p,index){
const next=projects[index+1],previous=projects[index-1];
const parts=[head(p.name,p.line,'../'),'<body class="case-page case-'+p.id+'"><a class="skip" href="#conteudo">Pular para o caso</a><header class="case-nav">'+mark('../')+'<nav aria-label="Navegação do portfólio">'+button('../index.html#trabalhos','Work','work')+button(previous?previous.id+'.html':'../index.html',previous?'Anterior':'Voltar','back')+'</nav></header><main id="conteudo" tabindex="-1">',
'<header class="case-opening"><p class="case-eyebrow">'+esc(p.kind)+(p.location?' / '+esc(p.location):'')+'</p><div class="case-title-row"><h1>'+esc(p.name)+'</h1><p class="case-line">'+esc(p.line)+'</p></div><dl class="case-meta"><div><dt>Meu papel</dt><dd>'+esc(p.scope)+'</dd></div><div><dt>Estado</dt><dd>'+esc(p.status)+'</dd></div></dl></header>',
print(p.image,p.alt,'case-cover',true),
'<section class="case-context"><p class="section-label">O ponto de partida</p><h2>'+esc(p.heading)+'</h2><div class="case-copy">'+para(p.context)+'</div></section>',
'<section class="case-decisions"><h2>Por dentro<br>da interface.</h2><div class="decisions-list">'+p.decisions.map(([title,text])=>'<article><h3>'+esc(title)+'</h3><p>'+esc(text)+'</p></article>').join('')+'</div></section>',
'<div class="case-gallery">'+(p.detail&&p.detail!==p.image?print(p.detail,p.detailCaption,'case-detail'):'')+(p.mobile?print(p.mobile,p.mobileCaption||'Interface '+p.name+' no celular.','case-mobile'):'')+(p.extraPrint?print(p.extraPrint,p.extraCaption||p.alt,'case-detail'):'')+'</div>',
p.full?'<p class="full-page"><a href="../assets/'+p.full+'" data-print data-full>Ver a página completa '+chevron+'</a>'+(p.fullCaption?'<small>'+esc(p.fullCaption)+'</small>':'')+'</p>':'',
'<section class="case-development"><div><p class="section-label">Desenvolvimento</p><h2>Do desenho<br>à construção.</h2></div><div class="case-copy">'+para(p.development)+(p.url?'<a class="visit-project" href="'+p.url+'" target="_blank" rel="noopener noreferrer">Visitar o projeto '+chevron+'</a>':'')+'</div></section>',
'<a class="next-case" href="'+(next?next.id+'.html':'../encerramento.html')+'"><span>'+(next?'Próximo trabalho':'O último trabalho termina aqui.')+'</span><strong>'+(next?esc(next.name):'Fechar o percurso')+'</strong>'+chevron+'</a></main>',viewer(),'</body></html>'];
return parts.join('');
}
function renderClosing(){return head('Design, desenvolvimento e IA aplicada','Conheça as capacidades por trás dos projetos de Iago Cassarotti.')+'<body class="closing"><main class="closing-stage"><p class="closing-kicker">Iago Cassarotti / Creative Developer</p><div class="closing-presentation"><h1><span>Da ideia</span><span>à execução.</span></h1><p class="closing-intro">Sou designer e desenvolvedor. Uno estratégia de comunicação, experiência do usuário e execução técnica para levar produtos digitais do conceito à produção.</p><dl class="closing-capabilities"><div><dt>Design & UX/UI</dt><dd>Pesquisa, arquitetura de informação, prototipação e interfaces responsivas.</dd></div><div><dt>Desenvolvimento full-stack</dt><dd>React e TypeScript, APIs, bancos de dados, segurança e deploy.</dd></div><div><dt>IA aplicada & automação</dt><dd>Integração de modelos de linguagem e automações conectadas a fluxos reais de trabalho.</dd></div></dl><div class="closing-thanks"><p>Obrigado por conhecer meu trabalho.</p><p>Se essas capacidades fizerem sentido para o seu próximo projeto ou para a sua equipe, vamos conversar.</p>'+button(whatsapp,'WhatsApp','chat','target="_blank" rel="noopener noreferrer"')+'</div></div><div class="closing-bottom">'+button('index.html?replay=1#inicio','Voltar ao início','back')+'<p class="closing-timer" hidden>De volta à abertura em <span data-seconds>40</span>s.</p><button type="button" data-pause hidden>Permanecer aqui</button></div></main></body></html>';}
function generate(){
fs.mkdirSync(path.join(root,'projetos'),{recursive:true});
fs.writeFileSync(path.join(root,'index.html'),renderHome());
projects.forEach((p,i)=>fs.writeFileSync(path.join(root,'projetos',p.id+'.html'),renderCase(p,i)));
fs.writeFileSync(path.join(root,'encerramento.html'),renderClosing());
const familyFiles=fs.readdirSync(path.join(root,'assets/fonts')).filter(f=>f.endsWith('.css'));
const fontCss=['@font-face{font-family:DM;src:url("assets/fonts/dm-sans.woff2") format("woff2");font-weight:100 1000;font-display:swap}','@font-face{font-family:Marble;src:url("assets/fonts/marble-regular.ttf") format("truetype");font-weight:400;font-display:swap}','@font-face{font-family:Marble;src:url("assets/fonts/marble-bold.ttf") format("truetype");font-weight:700;font-display:swap}',...familyFiles.map(f=>fs.readFileSync(path.join(root,'assets/fonts',f),'utf8'))].join('\n');
fs.writeFileSync(path.join(root,'fonts.css'),fontCss);
const licenses=fs.readdirSync(path.join(root,'assets/licenses')).filter(f=>f.endsWith('.txt'));
fs.writeFileSync(path.join(root,'creditos.html'),head('Fontes & créditos','Créditos tipográficos e visuais.')+'<body class="credits-page"><header class="case-nav">'+mark()+'<a href="index.html#trabalhos">Trabalhos '+chevron+'</a></header><main class="credits"><h1>Fontes<br>& créditos.</h1><p>Interfaces e capturas dos projetos apresentados: trabalhos de Iago Cassarotti. A fotografia de WhatsApp é um registro de teste fornecido por Iago; não representa uma validação completa do PHRON.</p><p>Tipografias abertas distribuídas com suas licenças. Marble foi fornecida nos arquivos do projeto da Dra. Natália e preserva a identidade do trabalho.</p><ul>'+licenses.map(f=>'<li><a href="assets/licenses/'+f+'">'+esc(f.replace('.txt',''))+' / licença</a></li>').join('')+'</ul><p>Direção e referências de interação: <a href="https://eloyb.design/" target="_blank" rel="noopener">Eloy Benoffi</a> e <a href="https://stefanvitasovic.dev/" target="_blank" rel="noopener">Stefan Vitasović</a>. Elementos gráficos e código desta versão desenvolvidos para este portfólio; nenhum asset dos autores foi reutilizado.</p><a href="index.html">Voltar ao início '+chevron+'</a></main></body></html>');
console.log('Home, nove casos, encerramento e créditos gerados. Sem página separada de projetos.');
}
if(require.main===module)generate();
module.exports={generate};
