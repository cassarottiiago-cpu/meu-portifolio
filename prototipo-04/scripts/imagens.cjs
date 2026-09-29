// Gera versões menores (WebP) das capturas, para cada tela baixar só o tamanho de que precisa.
// Os originais ficam como fonte; o site usa só as versões geradas aqui. Rodar ao trocar capturas:
//   node scripts/imagens.cjs
const fs=require('node:fs'),path=require('node:path');
const sharp=require('sharp');
const projects=require('../data/projects.cjs');
const assets=path.resolve(__dirname,'../assets'),out=path.join(assets,'img');
// Larguras para as capturas exibidas nas páginas; página completa só precisa de uma versão leve para o celular.
const DISPLAY=[480,800,1200,1600,2000],FULL=[1080];
const jobs=new Map();
for(const p of projects){
 for(const key of ['image','detail','mobile','extraPrint'])if(p[key])jobs.set(p[key],DISPLAY);
 if(p.full)jobs.set(p.full,FULL);
}
(async()=>{
 fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
 const manifest={};let before=0,after=0;
 for(const [file,widths] of jobs){
  const source=path.join(assets,file),image=sharp(source,{limitInputPixels:false});
  const {width,height}=await image.metadata();
  const base=path.basename(file).replace(/\.[a-z]+$/i,'');
  // Sempre inclui a largura cheia recomprimida: os originais são quase sem perda e pesam três vezes mais.
  const list=[...widths.filter(w=>w<width*.9),width];
  const variants=[];
  for(const w of list){
   const name=base+'-'+w+'.webp';
   await sharp(source,{limitInputPixels:false}).resize({width:w}).webp({quality:82,effort:5,smartSubsample:true}).toFile(path.join(out,name));
   variants.push([w,'img/'+name]);after+=fs.statSync(path.join(out,name)).size;
  }
  before+=fs.statSync(source).size;
  manifest[file]={width,height,variants};
  console.log(file.padEnd(40),width+'x'+height,'→',variants.map(v=>v[0]).join(', ')||'(sem versões)');
 }
 fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,1)+'\n');
 console.log('originais',(before/1048576).toFixed(1),'MB; versões menores',(after/1048576).toFixed(1),'MB em',path.relative(process.cwd(),out));
})().catch(error=>{console.error(error);process.exitCode=1;});
