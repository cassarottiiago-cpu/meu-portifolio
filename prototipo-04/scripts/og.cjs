// Imagens de pré-visualização (1200×630) para WhatsApp, LinkedIn etc.: a primeira dobra de cada página, em português e
// inglês, em assets/og/. Rodar ao mudar títulos ou capas: node scripts/og.cjs
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright-core');
const {createServer}=require('./servidor.cjs');
const projects=require('../data/projects.cjs');
const out=path.resolve(__dirname,'../assets/og');
const pages=[['home','index.html','en/index.html'],['encerramento','encerramento.html','en/thanks.html'],...projects.map(p=>[p.id,'projetos/'+p.id+'.html','en/work/'+p.id+'.html'])];
(async()=>{
 fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
 const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port+'/';
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  // Movimento reduzido: a página aparece já montada, sem entradas pela metade.
  const page=await browser.newPage({viewport:{width:1200,height:630},reducedMotion:'reduce'});
  for(const [name,pt,en] of pages){
   for(const [prefix,url] of [['',pt],['en-',en]]){
    await page.goto(base+url,{waitUntil:'load'});
    // Imagens abaixo da dobra são lazy e nunca carregam sozinhas: forçar o carregamento e limitar a espera.
    await page.evaluate(async()=>{await document.fonts.ready;[...document.images].forEach(i=>{i.loading="eager";});await Promise.race([Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))),new Promise(resolve=>setTimeout(resolve,4000))]);});
    await page.waitForTimeout(400);
    await page.screenshot({path:path.join(out,prefix+name+'.jpg'),type:'jpeg',quality:82});
   }
  }
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
 const files=fs.readdirSync(out),bytes=files.reduce((sum,f)=>sum+fs.statSync(path.join(out,f)).size,0);
 console.log(files.length+' imagens de pré-visualização em assets/og ('+Math.round(bytes/1024)+' KB).');
})().catch(error=>{console.error(error);process.exitCode=1;});
