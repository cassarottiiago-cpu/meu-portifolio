const {chromium}=require(process.env.PORTFOLIO_PLAYWRIGHT||'playwright-core');
const fs=require('node:fs'),path=require('node:path');
const {createServer}=require('./servidor.cjs');
(async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  await page.addInitScript(()=>{
   window.metrics={frames:0,text:0,rects:0};
   const raf=requestAnimationFrame,fill=CanvasRenderingContext2D.prototype.fillText,rect=Element.prototype.getBoundingClientRect;
   window.requestAnimationFrame=fn=>raf(t=>{metrics.frames++;fn(t);});
   CanvasRenderingContext2D.prototype.fillText=function(...args){metrics.text++;return fill.apply(this,args);};
   Element.prototype.getBoundingClientRect=function(...args){metrics.rects++;return rect.apply(this,args);};
  });
  const base='http://127.0.0.1:'+server.address().port;
  await page.goto(base);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1500);
  await page.evaluate(()=>{metrics.frames=metrics.text=metrics.rects=0;});
  for(let i=0;i<30;i++){await page.mouse.move(120+i*33,300+Math.sin(i*.3)*150);await page.waitForTimeout(16);}
  await page.waitForTimeout(1000);
  const pointer=await page.evaluate(()=>({...metrics}));
  await page.evaluate(()=>{metrics.frames=metrics.text=metrics.rects=0;});await page.waitForTimeout(500);
  const idle=await page.evaluate(()=>({...metrics}));
  await page.evaluate(()=>{metrics.frames=metrics.text=metrics.rects=0;});
  for(let i=0;i<30;i++){await page.evaluate(i=>scrollTo(0,900+i*40),i);await page.waitForTimeout(16);}
  await page.waitForTimeout(600);
  const scroll=await page.evaluate(()=>({...metrics}));
  const result={pointer,idle,scroll,note:'Contagens instrumentadas, não benchmark de FPS; frames dependem do agendamento do navegador.'};
  const output=path.resolve(__dirname,'../validacao/motion-'+(process.argv[2]||'after')+'.json');fs.writeFileSync(output,JSON.stringify(result,null,2));console.log(result);
  await page.goto(base+'/encerramento.html');await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1200);
  await page.screenshot({path:path.resolve(__dirname,'../validacao/closing-'+(process.argv[2]||'after')+'.png')});
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
