import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../assets');
const families=[
['inter','Inter','wght@400;500;600;700;800'],
['plus-jakarta-sans','Plus Jakarta Sans','wght@400;500;600;700'],
['outfit','Outfit','wght@400;500;600;700;800'],
['instrument-serif','Instrument Serif','ital@0;1'],
['instrument-sans','Instrument Sans','wght@400;500;600;700'],
['bebas-neue','Bebas Neue',''],
['montserrat','Montserrat','wght@400;500;600;700;800'],
['archivo','Archivo','wght@400;500;600;700;800']
];
for(const [slug,family,axes] of families){
  const url='https://fonts.googleapis.com/css2?family='+encodeURIComponent(family)+(axes?':'+axes:'')+'&display=swap';
  const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'}});
  if(!response.ok)throw Error(family+': '+response.status);
  const css=await response.text();
  const urls=[...new Set([...css.matchAll(/url\(([^)]+)\)/g)].map(m=>m[1]))];
  let index=0,local=css;
  for(const url of urls){
    const ext=url.includes('.woff2')?'woff2':url.includes('.woff')?'woff':'ttf';
    const file=slug+'-'+index+++'.'+ext;
    const data=await fetch(url);if(!data.ok)throw Error(file+': '+data.status);
    await fs.writeFile(path.join(root,'fonts',file),Buffer.from(await data.arrayBuffer()));
    local=local.split(url).join('assets/fonts/'+file);
  }
  await fs.writeFile(path.join(root,'fonts',slug+'.css'),local);
  const dir=slug.replaceAll('-','');
  const license=await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/'+dir+'/OFL.txt');
  if(!license.ok)throw Error('Licença ausente: '+family);
  await fs.writeFile(path.join(root,'licenses',slug+'.txt'),await license.text());
  console.log(family+': '+urls.length+' arquivo(s), licença OFL.');
}
