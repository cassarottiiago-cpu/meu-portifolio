// Gera as páginas estáticas do portfólio: português na raiz e inglês em /en/.
// Conteúdo: data/projects.cjs (+ projects.en.cjs), data/textos.cjs e data/site.cjs. Não editar os HTML gerados.
//   node scripts/gerar.cjs                         páginas na raiz do projeto (desenvolvimento)
//   require('./gerar.cjs').generate({dir,bundle})   build: bundle=true liga um único estilo.css
const fs=require('node:fs'),path=require('node:path');
const projects=require('../data/projects.cjs');
const english=require('../data/projects.en.cjs');
const textos=require('../data/textos.cjs');
const site=require('../data/site.cjs');
const {button,icon}=require('./botoes.cjs');
const root=path.resolve(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/img/manifest.json'),'utf8'));
const FEATURED=['autopost','dr-paulo','natalia','limozine'];
// Cor da barra do navegador no celular: o fundo de cada caso.
const THEME={autopost:'#f6f8fc',phron:'#0e131d',qozt:'#fffdf9',natalia:'#edeee6','dr-paulo':'#edeee6',limozine:'#151311',dominos:'#f5f8fb','bmk-blink':'#fff9f5',odonto:'#202325'};
const PAPER='#eee9df';

const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const chevron='<span aria-hidden="true">&gt;&gt;</span>';
const para=list=>list.map(s=>'<p>'+esc(s)+'</p>').join('');
const localized=(p,L)=>L.code==='en'?{...p,...english[p.id]}:p;
const external='target="_blank" rel="noopener noreferrer"';

// ——— Endereços. Cada página conhece o caminho até a raiz do site (assets) e até a raiz do idioma. ———
const LANG_ROOT={pt:'',en:'en/'};
const pagePath=(L,kind,id)=>LANG_ROOT[L.code]+(kind==='case'?L.files.caseDir+id+'.html':L.files[kind]);
function context(L,kind,id){
 const file=pagePath(L,kind,id),depth=file.split('/').length-1;
 const other=textos[L.code==='pt'?'en':'pt'],base='../'.repeat(depth);
 return {L,kind,id,file,base,toLang:kind==='case'?'../':'',counterpart:base+pagePath(other,kind,id),otherPath:pagePath(other,kind,id)};
}
const caseHref=(c,id)=>(c.kind==='case'?'':c.L.files.caseDir)+id+'.html';
const absolute=file=>site.url.replace(/\/$/,'')+'/'+file.replace(/(^|\/)index\.html$/,'$1');

// ——— Capturas responsivas: versões em assets/img geradas por scripts/imagens.cjs ———
function variants(file){const entry=manifest[file];if(!entry)throw Error('Sem versões para '+file+': rode node scripts/imagens.cjs');return entry;}
const srcset=(file,base)=>variants(file).variants.map(([w,f])=>base+'assets/'+f+' '+w+'w').join(', ');
const largest=file=>variants(file).variants.at(-1)[1];
function img(file,alt,base,sizes,eager=false){
 const {width,height,variants:list}=variants(file);
 const fallback=(list.find(([w])=>w>=1200)||list.at(-1))[1];
 return '<img src="'+base+'assets/'+fallback+'" srcset="'+srcset(file,base)+'" sizes="'+sizes+'" width="'+width+'" height="'+height+'" alt="'+esc(alt)+'" '+(eager?'fetchpriority="high"':'loading="lazy"')+' decoding="async">';
}
const SIZES={panel:'(max-width:700px) calc(100vw - 36px), 56vw',cover:'(max-width:700px) 100vw, 92vw',detail:'(max-width:700px) calc(100vw - 36px), 62vw',mobile:'(max-width:700px) 66vw, 26vw'};

// Molduras em CSS: a captura continua sendo uma imagem responsiva, sem cortes ou distorção.
// Barra de status do iPhone: sinal, Wi-Fi e bateria.
const STATUS_ICONS='<svg viewBox="0 0 68 13" fill="currentColor" aria-hidden="true" focusable="false"><rect x="0" y="8.5" width="3" height="4" rx=".8"/><rect x="4.5" y="6.3" width="3" height="6.2" rx=".8"/><rect x="9" y="3.8" width="3" height="8.7" rx=".8"/><rect x="13.5" y="1.2" width="3" height="11.3" rx=".8"/><path d="M29 12.2 26.5 9.6a3.5 3.5 0 0 1 5 0Z"/><path d="M24.8 7.9a5.9 5.9 0 0 1 8.4 0l1.4-1.4a7.9 7.9 0 0 0-11.2 0Z"/><path d="M22.2 5.3a9.6 9.6 0 0 1 13.6 0l1.4-1.4a11.5 11.5 0 0 0-16.4 0Z"/><rect x="41.5" y="1.5" width="23" height="11" rx="3.4" fill="none" stroke="currentColor" stroke-opacity=".4"/><rect x="43.5" y="3.5" width="19" height="7" rx="1.9"/><path d="M66 5.2v3.6c.8-.3 1.3-1 1.3-1.8S66.8 5.5 66 5.2Z" fill-opacity=".45"/></svg>';
function statusBar(file){
 const top=variants(file).top||'#000000',[r,g,b]=[1,3,5].map(i=>parseInt(top.slice(i,i+2),16));
 const ink=(r*299+g*587+b*114)/1000>150?'#0b0b0b':'#ffffff';
 return '<span class="phone-status" style="--status-bg:'+top+';--status-ink:'+ink+'" aria-hidden="true"><span class="phone-time">9:41</span>'+STATUS_ICONS+'</span>';
}
// phone: false (janela de navegador), 'plain' (captura já feita num iPhone) ou 'status' (captura de navegador: desenha a barra).
function mock(file,alt,base,sizes,eager=false,phone=false){
 if(phone)return '<span class="device-mock device-phone" style="--capture-width:'+variants(file).width+'px"><span class="device-screen"><span class="phone-display">'+(phone==='status'?statusBar(file):'')+img(file,alt,base,sizes,eager)+'</span><span class="phone-island" aria-hidden="true"></span></span></span>';
 const type='window';
 return '<span class="device-mock device-'+type+'" style="--capture-width:'+variants(file).width+'px"><span class="device-screen">'+img(file,alt,base,sizes,eager)+'</span><span class="device-base" aria-hidden="true"></span></span>';
}
function projectPanels(c,list){
 const heading=c.kind==='catalog'?'h2':'h3';
 return list.map(p=>localized(p,c.L)).map(p=>
  '<div class="project-story" id="panel-'+p.id+'" aria-labelledby="project-title-'+p.id+'" data-project="'+p.id+'"><div class="panel-heading"><div><'+heading+' id="project-title-'+p.id+'">'+esc(p.name)+'</'+heading+'><p>'+esc(p.kind)+' / '+esc(p.scope)+'</p></div>'+button(caseHref(c,p.id),c.L.viewCase,'open')+'</div>'+
  '<div class="panel-media"><a href="'+caseHref(c,p.id)+'" aria-label="'+esc(c.L.home.meet+' '+p.name)+'">'+mock(p.image,p.alt,c.base,SIZES.panel)+'</a></div></div>').join('');
}
function invitation(c,about=false){
 const L=c.L,H=about?L.catalog:L.home;
 const index=about?button('index.html#trabalhos',L.catalog.selected,'selected'):'<nav class="invitation-index" aria-label="'+esc(H.footerIndex)+'"><ol>'+projects.map((p,i)=>'<li><a href="'+L.files.caseDir+p.id+'.html"><span aria-hidden="true">'+String(i+1).padStart(2,'0')+'</span>'+esc(p.name)+'</a></li>').join('')+'</ol></nav>';
 return '<footer id="percurso" class="end-invitation'+(about?' about-invitation':'')+'" aria-labelledby="invitation-title"><div class="invitation-top"><p>'+esc(H.footerTop)+'</p>'+(about?'':button(L.files.closing,'About','about'))+'</div><div class="clone-field" aria-hidden="true"></div>'+
 '<a id="invitation-title" class="invitation-link" href="'+(about?L.files.closing:L.files.catalog)+'" data-copy="'+esc(H.footerCopy)+'"><span data-enter="title">'+esc(H.footerLink[0])+'</span><span data-enter="title">'+esc(H.footerLink[1])+' '+chevron+'</span></a>'+
 '<div class="invitation-bottom"><p>'+H.footerNote+'</p>'+index+'</div></footer>';
}

// ——— Cabeça do documento ———
// Registra os eventos de transição antes do app.js (que é defer e chegaria tarde para o pagereveal).
const GUARD='<script>try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("js-enter")}catch(e){}addEventListener("pagereveal",event=>{window.__pageTransition=event.viewTransition||null});for(const type of ["pageswap","pagereveal"])addEventListener(type,event=>{const transition=event.viewTransition;if(!transition)return;for(const promise of [transition.ready,transition.finished,transition.updateCallbackDone])promise?.catch(error=>{if(!["AbortError","InvalidStateError"].includes(error.name))reportError(error);});if(window.__replaying||(type==="pagereveal"&&new URLSearchParams(location.search).has("replay")))transition.skipTransition();});</script>';
function head(c,{title,description,theme=PAPER,og='home',bundle}){
 const L=c.L,full=title+L.titleSuffix;
 let html='<!doctype html><html lang="'+L.lang+'"><head><meta charset="utf-8"><style>@view-transition{navigation:auto}</style>'+GUARD+'<meta name="viewport" content="width=device-width, initial-scale=1">';
 if(!site.indexar)html+='<meta name="robots" content="noindex,nofollow">';
 html+='<meta name="theme-color" content="'+theme+'"><title>'+esc(full)+'</title><meta name="description" content="'+esc(description)+'">';
 html+='<meta property="og:type" content="website"><meta property="og:site_name" content="Iago Cassarotti"><meta property="og:title" content="'+esc(full)+'"><meta property="og:description" content="'+esc(description)+'"><meta property="og:locale" content="'+L.locale+'"><meta name="twitter:card" content="summary_large_image">';
 if(site.url){
  const [pt,en]=c.L.code==='pt'?[c.file,c.otherPath]:[c.otherPath,c.file];
  html+='<link rel="canonical" href="'+absolute(c.file)+'"><meta property="og:url" content="'+absolute(c.file)+'"><meta property="og:image" content="'+absolute('assets/og/'+(L.code==='en'?'en-':'')+og+'.jpg')+'"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">';
  html+='<link rel="alternate" hreflang="pt-BR" href="'+absolute(pt)+'"><link rel="alternate" hreflang="en" href="'+absolute(en)+'"><link rel="alternate" hreflang="x-default" href="'+absolute(pt)+'">';
 }
 html+='<link rel="icon" href="'+c.base+'icon.svg" type="image/svg+xml"><link rel="icon" href="'+c.base+'assets/icon-32.png" sizes="32x32" type="image/png"><link rel="apple-touch-icon" href="'+c.base+'assets/apple-touch-icon.png"><link rel="manifest" href="'+c.base+'manifest.webmanifest"><link rel="preload" href="'+c.base+'assets/fonts/dm-sans.woff2" as="font" type="font/woff2" crossorigin>';
 html+=bundle?'<link rel="stylesheet" href="'+c.base+'estilo.css">':['fonts','site','cases'].map(name=>'<link rel="stylesheet" href="'+c.base+name+'.css">').join('');
 return html+'<script src="'+c.base+'app.js" defer></script></head>';
}

// ——— Cabeçalho de jornal: botões nas pontas, assinatura e idioma ao centro, entre duas réguas ———
const rule='<span class="masthead-rule" aria-hidden="true"></span>';
function masthead(c,className,label,left,right){
 const L=c.L,[first,second]=L.role.split(' · ');
 const brand='<div class="brand-tag"><a class="owner" href="'+c.toLang+L.files.closing+'" aria-label="Iago Cassarotti, About"'+(c.kind==='closing'?' aria-current="page"':'')+'>Iago Cassarotti</a><p class="owner-role"><span class="role-text">'+esc(first)+' <span aria-hidden="true">·</span> '+esc(second)+'</span><span class="role-dot" aria-hidden="true">·</span><a class="lang-switch" href="'+c.counterpart+'" hreflang="'+L.switchTo.lang+'" lang="'+L.switchTo.lang+'" aria-label="'+esc(L.switchTo.title)+'">'+L.switchTo.label+'</a></p></div>';
 return '<header class="'+className+'"><nav aria-label="'+esc(label)+'">'+left+rule+brand+rule+right+'</nav></header>';
}

// ——— Ampliação das capturas ———
function print(c,file,alt,cls,sizes,eager=false){
 return '<figure class="case-print '+cls+'"><a href="'+c.base+'assets/'+largest(file)+'" data-print aria-label="'+esc(c.L.enlarge+': '+alt)+'">'+mock(file,alt,c.base,sizes,eager,cls.includes('case-phone')?'status':cls==='case-mobile'?'plain':false)+'<span class="print-hint">'+esc(c.L.enlarge)+' '+chevron+'</span></a><figcaption>'+esc(alt)+'</figcaption></figure>';
}
function viewer(L){
 const V=L.viewer;
 return '<dialog class="print-viewer" aria-labelledby="print-title"><div class="print-toolbar"><h2 id="print-title">'+esc(V.title)+'</h2><button type="button" data-size aria-pressed="false" data-actual="'+esc(V.actual)+'" data-fit="'+esc(V.fit)+'">'+esc(V.actual)+' '+chevron+'</button><button type="button" data-close autofocus>'+esc(V.close)+' '+chevron+'</button></div><div class="print-canvas" tabindex="0" aria-label="'+esc(V.canvas)+'" data-full-alt="'+esc(V.fullAlt)+'"></div></dialog>';
}

// ——— Home ———
function renderHome(c,bundle){
 const L=c.L,H=L.home,whatsapp=button(site.whatsapp,'WhatsApp','chat',external);
 const panels=projectPanels(c,FEATURED.map(id=>projects.find(p=>p.id===id)));
 const steps=H.process.steps.map(([title,text],i)=>'<li><span class="step-number" aria-hidden="true">'+String(i+1).padStart(2,'0')+'</span><h3>'+esc(title)+'</h3><p>'+esc(text)+'</p></li>').join('');
 return head(c,{title:H.title,description:H.description,bundle})+
 '<body class="home"><a class="skip" href="#trabalhos">'+esc(H.skip)+'</a><main>'+
 '<section class="intro" id="inicio" aria-labelledby="intro-title">'+masthead(c,'home-nav',L.navMain,button('#trabalhos',L.work,'work'),whatsapp)+
 '<div class="brand-field" aria-hidden="true"><canvas id="brand-canvas"></canvas></div>'+
 '<h1 id="intro-title" class="intro-type" aria-label="Creative Developer"><span class="type-group type-creative" aria-hidden="true"><span class="type-echo"><span>CREATIVE</span></span><span class="type-full"><span>CREATIVE</span></span><span class="type-fragment"><span>CREATIVE</span></span><span class="type-extra x1"><span>CREATIVE</span></span><span class="type-extra x2"><span>CREATIVE</span></span></span><span class="type-group type-developer" aria-hidden="true"><span class="type-full"><span>DEVELOPER</span></span><span class="type-echo"><span>DEVELOPER</span></span><span class="type-fragment"><span>DEVELOPER</span></span><span class="type-extra x1"><span>DEVELOPER</span></span><span class="type-extra x2"><span>DEVELOPER</span></span><span class="type-extra x3"><span>DEVELOPER</span></span></span></h1></section>'+
 '<section id="trabalhos" class="work-stage work-continuous" tabindex="-1" aria-labelledby="work-title" data-rail-label="'+esc(H.rail)+'"><div class="work-heading"><h2 id="work-title" data-enter="title">'+H.workTitle+'</h2></div><div class="work-panels">'+panels+'</div></section>'+
 '<section class="process" aria-labelledby="process-title"><div class="process-head"><span class="process-mark" aria-hidden="true">'+icon('process',83)+'</span><h2 id="process-title" data-enter="title">'+esc(H.process.title)+'</h2><p class="process-lead" data-enter="line">'+esc(H.process.lead)+'</p></div><ol class="process-steps">'+steps+'</ol></section></main>'+
 invitation(c)+'</body></html>';
}

function renderCatalog(c,bundle){
 const L=c.L,A=L.catalog;
 return head(c,{title:A.title,description:A.description,bundle})+'<body class="catalog-page"><a class="skip" href="#trabalhos">'+esc(L.home.skip)+'</a>'+
 masthead(c,'case-nav',L.navPortfolio,button('index.html#trabalhos',L.work,'work'),button(site.whatsapp,'WhatsApp','chat',external))+
 '<main><section id="trabalhos" class="work-stage work-continuous catalog-stage" tabindex="-1" aria-labelledby="work-title" data-rail-label="'+esc(L.home.rail)+'"><div class="work-heading"><p class="catalog-kicker">05 / '+esc(A.title)+'</p><h1 id="work-title" data-enter="title">'+A.heading+'</h1><p class="catalog-lead">'+esc(A.lead)+'</p></div><div class="work-panels">'+projectPanels(c,projects.filter(p=>!FEATURED.includes(p.id)))+'</div></section></main>'+invitation(c,true)+'</body></html>';
}

// ——— Casos ———
function renderCase(c,index,bundle){
 const L=c.L,C=L.case,p=localized(projects[index],L);
 const visit=p.url?'<div class="visit-cta">'+button(p.url,L.visit,'visit',external)+'<p class="visit-url"><span>'+esc(C.newTab)+'</span><strong>'+esc(new URL(p.url).hostname.replace(/^www\./,''))+'</strong></p></div>':'';
 const gallery=p.phones?p.phones.map(([file,caption])=>print(c,file,caption,'case-mobile case-phone',SIZES.mobile)).join(''):(p.detail&&p.detail!==p.image?print(c,p.detail,p.detailCaption,'case-detail',SIZES.detail):'')+(p.mobile?print(c,p.mobile,p.mobileCaption||C.mobileCaption(p.name),'case-mobile',SIZES.mobile):'')+(p.extraPrint?print(c,p.extraPrint,p.extraCaption||p.alt,'case-detail',SIZES.detail):'');
 const full=p.full?'<p class="full-page"><a href="'+c.base+'assets/'+largest(p.full)+'" data-print data-full data-srcset="'+srcset(p.full,c.base)+'">'+esc(C.fullPage)+' '+chevron+'</a>'+(p.fullCaption?'<small>'+esc(p.fullCaption)+'</small>':'')+'</p>':'';
 return head(c,{title:p.name,description:p.line,theme:THEME[p.id],og:p.id,bundle})+
 '<body class="case-page case-'+p.id+'"><a class="skip" href="#conteudo">'+esc(C.skip)+'</a>'+
 masthead(c,'case-nav',L.navPortfolio,button('../index.html#trabalhos',L.work,'work'),button(site.whatsapp,'WhatsApp','chat',external))+
 '<main id="conteudo" tabindex="-1"><header class="case-opening"><p class="case-eyebrow" data-enter="fade">'+esc(p.kind)+(p.location?' / '+esc(p.location):'')+'</p><div class="case-title-row"><h1 data-enter="title">'+esc(p.name)+'</h1><p class="case-line" data-enter="line">'+esc(p.line)+'</p></div><dl class="case-meta" data-enter="fade"><div><dt>'+esc(C.role)+'</dt><dd>'+esc(p.scope)+'</dd></div><div><dt>'+esc(C.status)+'</dt><dd>'+esc(p.status)+'</dd></div></dl></header>'+
 print(c,p.image,p.alt,'case-cover',SIZES.cover,true)+
 '<section class="case-context"><p class="section-label">'+esc(C.start)+'</p><h2 data-enter="head">'+esc(p.heading)+'</h2><div class="case-copy">'+para(p.context)+'</div></section>'+
 '<section class="case-decisions"><h2 data-enter="head">'+C.inside+'</h2><div class="decisions-list">'+p.decisions.map(([title,text])=>'<article><h3>'+esc(title)+'</h3><p>'+esc(text)+'</p></article>').join('')+'</div></section>'+
 '<div class="case-gallery'+(p.phones?' case-phones':'')+'">'+gallery+'</div>'+full+
 '<section class="case-development"><div><p class="section-label">'+esc(C.development)+'</p><h2 data-enter="head">'+C.build+'</h2></div><div class="case-copy">'+para(p.development)+visit+'</div></section>'+
 '<footer class="case-exit"><nav class="case-steps" aria-label="'+esc(L.stepsLabel)+'">'+button('../'+L.files.catalog,L.back,'back')+button(projects[(index+1)%projects.length].id+'.html',L.nextCase,'next')+'</nav><a class="next-case" href="../'+L.files.catalog+'"><span>'+esc(L.catalog.choose)+'</span><strong>'+esc(L.catalog.all)+'</strong>'+chevron+'</a></footer></main>'+
 viewer(L)+'</body></html>';
}

// ——— Fechamento: apresentação e agradecimento em duas telas ———
function renderClosing(c,bundle){
 const L=c.L,F=L.closing,whatsapp=button(site.whatsapp,'WhatsApp','chat',external);
 const email=site.email?button('mailto:'+site.email,F.email,'mail'):'';
 const linkedin=site.linkedin?button(site.linkedin,'LinkedIn','linkedin',external):'';
 return head(c,{title:F.title,description:F.description,og:'encerramento',bundle})+
 '<body class="closing">'+masthead(c,'case-nav closing-nav',L.navPortfolio,button('index.html#trabalhos',L.work,'work'),button('index.html',L.back,'back'))+
 '<main class="closing-stage"><section class="closing-presentation" aria-labelledby="closing-title"><div class="about-heading"><p class="about-kicker">ABOUT / IAGO CASSAROTTI</p><h1 id="closing-title"><span data-enter="title">'+esc(F.heading[0])+'</span><span data-enter="title">'+esc(F.heading[1])+'</span></h1><dl class="about-facts">'+F.facts.map(([label,value])=>'<div><dt>'+esc(label)+'</dt><dd>'+esc(value)+'</dd></div>').join('')+'</dl></div><div class="about-copy"><p class="closing-intro" data-enter="line">'+esc(F.intro)+'</p><p class="about-story">'+esc(F.story)+'</p><div class="closing-contact about-contact">'+whatsapp+email+linkedin+'</div></div><dl class="closing-capabilities">'+
 F.capabilities.map(([kind,title,text],i)=>'<div data-enter="head"><dt><span class="cap-icon" aria-hidden="true">'+icon(kind,71+i*4)+'</span>'+esc(title)+'</dt><dd>'+esc(text)+'</dd></div>').join('')+'</dl></section>'+
 '<section class="closing-sign" aria-labelledby="thanks-title"><h2 id="thanks-title" class="thanks-word" aria-label="'+esc(F.thanksLabel)+'">'+F.thanks.map(part=>'<span>'+esc(part)+'</span>').join('')+'</h2><div class="closing-thanks"><p data-enter="head">'+esc(F.lead)+'</p><p>'+esc(F.text)+'</p>'+
 '<div class="closing-bottom">'+button('index.html?replay=1#inicio',L.backToStart,'back')+'</div></div></section></main></body></html>';
}

// ——— Créditos ———
function renderCredits(c,bundle){
 const L=c.L,K=L.credits;
 const licenses=fs.readdirSync(path.join(root,'assets/licenses')).filter(f=>f.endsWith('.txt'));
 const refs=esc(K.references).replace('{eloy}','<a href="https://eloyb.design/" target="_blank" rel="noopener">Eloy Benoffi</a>').replace('{stefan}','<a href="https://stefanvitasovic.dev/" target="_blank" rel="noopener">Stefan Vitasović</a>');
 return head(c,{title:K.title,description:K.description,bundle})+'<body class="credits-page">'+
 masthead(c,'case-nav',L.navPortfolio,button('index.html#trabalhos',L.work,'work'),button('index.html',L.back,'back'))+
 '<main class="credits"><h1>'+K.heading+'</h1>'+para(K.paragraphs)+'<ul>'+licenses.map(f=>'<li><a href="'+c.base+'assets/licenses/'+f+'">'+esc(f.replace('.txt','').split('-').map(w=>w[0].toUpperCase()+w.slice(1)).join(' '))+' / '+esc(K.license)+'</a></li>').join('')+'</ul><p>'+refs+'</p><a href="index.html">'+esc(L.backToStart)+' '+chevron+'</a></main></body></html>';
}

function fontCss(){
 const families=fs.readdirSync(path.join(root,'assets/fonts')).filter(f=>f.endsWith('.css')).sort();
 return ['@font-face{font-family:DM;src:url(assets/fonts/dm-sans.woff2) format("woff2");font-weight:100 1000;font-display:swap}',
  '@font-face{font-family:Marble;src:url(assets/fonts/marble-regular.woff2) format("woff2");font-weight:400;font-display:swap}',
  '@font-face{font-family:Marble;src:url(assets/fonts/marble-bold.woff2) format("woff2");font-weight:700;font-display:swap}',
  ...families.map(f=>fs.readFileSync(path.join(root,'assets/fonts',f),'utf8').trim())].join('\n')+'\n';
}

function generate({dir=root,bundle=false}={}){
 const pages=[];
 const write=(c,html)=>{const target=path.join(dir,c.file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,html);pages.push(c.file);};
 for(const L of Object.values(textos)){
  write(context(L,'home'),renderHome(context(L,'home'),bundle));
  write(context(L,'catalog'),renderCatalog(context(L,'catalog'),bundle));
  projects.forEach((p,i)=>write(context(L,'case',p.id),renderCase(context(L,'case',p.id),i,bundle)));
  write(context(L,'closing'),renderClosing(context(L,'closing'),bundle));
  write(context(L,'credits'),renderCredits(context(L,'credits'),bundle));
 }
 fs.writeFileSync(path.join(dir,'fonts.css'),fontCss());
 return pages;
}
if(require.main===module){const pages=generate();console.log(pages.length+' páginas geradas (português e inglês).');}
module.exports={generate,fontCss};
