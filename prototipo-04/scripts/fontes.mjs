// Baixa as fontes dos casos do Google Fonts como WOFF2 variável, só o subconjunto latino (português e inglês),
// e grava assets/fonts/<família>.css + a licença OFL. Rodar só ao trocar fontes: node scripts/fontes.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../assets');
// User-agent moderno: o Google só entrega WOFF2 com unicode-range para navegadores atuais.
const agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const families=[
 ['inter','Inter','wght@400..800'],
 ['plus-jakarta-sans','Plus Jakarta Sans','wght@400..700'],
 ['outfit','Outfit','wght@400..800'],
 ['instrument-serif','Instrument Serif',''],
 ['instrument-sans','Instrument Sans','wght@400..700'],
 ['bebas-neue','Bebas Neue',''],
 ['montserrat','Montserrat','wght@400..800'],
 ['archivo','Archivo','wght@400..800']
];
for(const [slug,family,axes] of families){
 const url='https://fonts.googleapis.com/css2?family='+encodeURIComponent(family)+(axes?':'+axes:'')+'&display=swap';
 const response=await fetch(url,{headers:{'User-Agent':agent}});
 if(!response.ok)throw Error(family+': '+response.status);
 const css=await response.text();
 // Cada bloco vem precedido de um comentário com o subconjunto (/* latin */, /* cyrillic */...).
 const latin=[...css.matchAll(/\/\*\s*([a-z-]+)\s*\*\/\s*(@font-face\s*{[^}]*})/g)].filter(m=>m[1]==='latin').map(m=>m[2]);
 if(!latin.length)throw Error(family+': subconjunto latino não encontrado');
 let local=[];
 for(const [index,face] of latin.entries()){
  const source=face.match(/url\(([^)]+\.woff2)\)/)[1];
  const file=slug+(latin.length>1?'-'+index:'')+'.woff2';
  const data=await fetch(source);if(!data.ok)throw Error(file+': '+data.status);
  await fs.writeFile(path.join(root,'fonts',file),Buffer.from(await data.arrayBuffer()));
  local.push(face.replace(source,'assets/fonts/'+file).replace(/\s+/g,' ').replace(/\s*([{};:])\s*/g,'$1'));
 }
 await fs.writeFile(path.join(root,'fonts',slug+'.css'),local.join('\n')+'\n');
 const license=await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/'+slug.replaceAll('-','')+'/OFL.txt');
 if(!license.ok)throw Error('Licença ausente: '+family);
 await fs.writeFile(path.join(root,'licenses',slug+'.txt'),await license.text());
 console.log(family.padEnd(18),latin.length,'arquivo(s) WOFF2 latino(s)');
}
