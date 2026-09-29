// Build de publicação em dist/: páginas com um único estilo.css minificado, app.js minificado e só os arquivos que as
// páginas usam (os originais pesados das capturas ficam de fora). Uso: npm run build
const fs=require('node:fs'),path=require('node:path');
const esbuild=require('esbuild');
const {generate,fontCss}=require('./gerar.cjs');
const site=require('../data/site.cjs');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');

fs.rmSync(dist,{recursive:true,force:true});fs.mkdirSync(dist,{recursive:true});
generate(); // mantém as páginas de desenvolvimento em dia
const pages=generate({dir:dist,bundle:true});
fs.rmSync(path.join(dist,'fonts.css'),{force:true});

const css=[fontCss(),...['site.css','cases.css'].map(f=>fs.readFileSync(path.join(root,f),'utf8'))].join('\n');
fs.writeFileSync(path.join(dist,'estilo.css'),esbuild.transformSync(css,{loader:'css',minify:true}).code);
fs.writeFileSync(path.join(dist,'app.js'),esbuild.transformSync(fs.readFileSync(path.join(root,'app.js'),'utf8'),{loader:'js',minify:true,target:'es2020'}).code);

// Arquivos referenciados pelas páginas, pelo CSS e pelo manifesto.
const needed=new Set(['icon.svg','manifest.webmanifest']);
const local=ref=>!/^(?:[a-z]+:|#|\/\/)/i.test(ref);
function collect(fromFile,ref){
 const clean=ref.split(/[?#]/)[0];if(!clean||!local(clean))return;
 const target=path.relative(dist,path.resolve(dist,path.dirname(fromFile),clean));
 if(target.startsWith('..'))throw Error('Referência fora do site: '+fromFile+' -> '+ref);
 needed.add(target.split(path.sep).join('/'));
}
for(const page of pages){
 const html=fs.readFileSync(path.join(dist,page),'utf8');
 for(const [,ref] of html.matchAll(/(?:href|src)="([^"]+)"/g))collect(page,ref);
 for(const [,list] of html.matchAll(/(?:data-)?srcset="([^"]+)"/g))for(const item of list.split(','))collect(page,item.trim().split(/\s+/)[0]);
}
const bundle=fs.readFileSync(path.join(dist,'estilo.css'),'utf8');
for(const [,ref] of bundle.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g))if(!ref.startsWith('data:'))collect('estilo.css',ref);
for(const icon of JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8')).icons)collect('manifest.webmanifest',icon.src);
for(const file of needed){
 if(fs.existsSync(path.join(dist,file)))continue;
 const source=path.join(root,file);
 if(!fs.existsSync(source))throw Error('Arquivo ausente: '+file);
 fs.mkdirSync(path.dirname(path.join(dist,file)),{recursive:true});fs.copyFileSync(source,path.join(dist,file));
}

// Buscadores e pré-visualização: só fazem sentido com o endereço final.
if(site.url){
 fs.cpSync(path.join(root,'assets/og'),path.join(dist,'assets/og'),{recursive:true});
 const urls=pages.map(p=>site.url+'/'+p.replace(/(^|\/)index\.html$/,'$1'));
 fs.writeFileSync(path.join(dist,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(u=>' <url><loc>'+u+'</loc></url>').join('\n')+'\n</urlset>\n');
}
fs.writeFileSync(path.join(dist,'robots.txt'),site.indexar?'User-agent: *\nAllow: /\n'+(site.url?'Sitemap: '+site.url+'/sitemap.xml\n':''):'User-agent: *\nDisallow: /\n');

const size=dir=>fs.readdirSync(dir,{withFileTypes:true}).reduce((sum,e)=>sum+(e.isDirectory()?size(path.join(dir,e.name)):fs.statSync(path.join(dir,e.name)).size),0);
console.log('Build: '+pages.length+' páginas, '+needed.size+' arquivos usados, '+(size(dist)/1048576).toFixed(1)+' MB em dist/'+(site.url?' ('+site.url+')':' (sem endereço final: sem og:image nem sitemap)')+'.');
