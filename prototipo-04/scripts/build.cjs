const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
execFileSync(process.execPath,['--check',path.join(root,'app.js')]);
require('./gerar.cjs').generate();
const files=['index.html','encerramento.html','creditos.html','site.css','cases.css','interactions.css','fonts.css','app.js','icon.svg'];
const dest=path.join(root,'dist');fs.mkdirSync(dest,{recursive:true});
for(const file of files)fs.copyFileSync(path.join(root,file),path.join(dest,file));
for(const directory of ['projetos','assets'])fs.cpSync(path.join(root,directory),path.join(dest,directory),{recursive:true});
const pages=['index.html','encerramento.html','creditos.html',...require('../data/projects.cjs').map(p=>'projetos/'+p.id+'.html')];
for(const name of pages){
 const html=fs.readFileSync(path.join(dest,name),'utf8');
 for(const [,ref]of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  if(/^(?:https?:|#)/.test(ref))continue;
  const target=path.resolve(dest,path.dirname(name),ref.split(/[?#]/)[0]);
  if(path.relative(dest,target).startsWith('..')||!fs.existsSync(target))throw Error('Recurso ausente: '+name+' -> '+ref);
 }
 if(html.includes('projetos.html'))throw Error('Navegação antiga em '+name);
}
for(const css of ['site.css','cases.css','interactions.css','fonts.css']){
 for(const [,ref]of fs.readFileSync(path.join(dest,css),'utf8').matchAll(/url\(['"]?([^'")]+)['"]?\)/g)){
  if(!fs.existsSync(path.resolve(dest,ref)))throw Error('Asset CSS ausente: '+ref);
 }
}
console.log('Build verificado: '+pages.length+' páginas, nove casos, ciclo completo e nenhuma aba de projetos separada.');
