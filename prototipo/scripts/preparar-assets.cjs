const fs = require('node:fs');
const path = require('node:path');
const sharp = require('C:/Users/iago cassarotti/site-nat-work/node_modules/sharp');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'assets');
async function main(){
 fs.mkdirSync(path.join(out,'fonts'),{recursive:true});
 fs.mkdirSync(path.join(out,'licenses'),{recursive:true});
 const downloads=[
  ['fonts/bowlby-one-sc.ttf','https://raw.githubusercontent.com/google/fonts/main/ofl/bowlbyonesc/BowlbyOneSC-Regular.ttf'],
  ['licenses/bowlby-one-sc.txt','https://raw.githubusercontent.com/google/fonts/main/ofl/bowlbyonesc/OFL.txt'],
  ['fonts/barlow-condensed-bold.ttf','https://raw.githubusercontent.com/google/fonts/main/ofl/barlowcondensed/BarlowCondensed-Bold.ttf'],
  ['licenses/barlow-condensed.txt','https://raw.githubusercontent.com/google/fonts/main/ofl/barlowcondensed/OFL.txt'],
 ];
 for(const [name,url] of downloads){const file=path.join(out,name);if(fs.existsSync(file))continue;const response=await fetch(url);if(!response.ok)throw new Error(url+': '+response.status);fs.writeFileSync(file,Buffer.from(await response.arrayBuffer()));}
 fs.copyFileSync('C:/Users/iago cassarotti/site-nat-work/public/fontes/dm-sans.woff2',path.join(out,'fonts/dm-sans.woff2'));
 fs.copyFileSync('C:/Users/iago cassarotti/site-nat-work/public/fontes/licencas/dm-sans.txt',path.join(out,'licenses/dm-sans.txt'));
 const images=[
  ['skate','C:/Users/iago cassarotti/.codex/generated_images/01a08d6e-6f53-7d40-9102-b4c12eb58914/exec-727dc0f1-fd59-437f-8a2a-147a19c90729.png'],
  ['phron','C:/Users/iago cassarotti/PHRON-revisao/cockpit-refinado-light.png'],
  ['natalia','C:/Users/iago cassarotti/site-nat-work/validacao/desktop-dobra.png'],
  ['consulting','C:/Users/iago cassarotti/portfolio-iago/briefing/capturas/consultingnow-inicio.png'],
 ];
 const report=[];
 for(const [name,source] of images){const file=path.join(out,name+'.webp');const metadata=await sharp(source).metadata();await sharp(source).webp({quality:87,alphaQuality:100}).toFile(file);report.push({name,source,width:metadata.width,height:metadata.height,hasAlpha:metadata.hasAlpha,bytes:fs.statSync(file).size});}
 fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
