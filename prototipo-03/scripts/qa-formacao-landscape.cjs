const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');
const { createServer } = require('./servidor.cjs');
const out = path.resolve(__dirname, '../validacao/qa-formacao-landscape');
fs.mkdirSync(out, { recursive:true });
const report = {checks:[],states:[],errors:[]};
function check(label, condition) { assert.ok(condition,label); report.checks.push(label); }
async function state(page,label) {
 const result = await page.evaluate(()=>{
  const rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y+scrollY,w:r.width,h:r.height,right:r.right,bottom:r.bottom+scrollY};};
  const intersection=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y));
  const pieces=[...document.querySelectorAll('.scene')].map(e=>{
   const caption=e.querySelector('.piece-caption'),title=caption.querySelector('h2'),description=caption.querySelector('p');
   return{id:e.dataset.piece,box:rect(e),image:rect(e.querySelector('.piece-image')),caption:rect(caption),title:rect(title),description:rect(description),titleDescriptionOverlap:intersection(rect(title),rect(description)),visibility:getComputedStyle(e).visibility,inert:e.inert,href:e.querySelector('a').getAttribute('href'),assets:[...e.querySelectorAll('img')].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0,visible:getComputedStyle(i).display!=='none'}))};
  });
  const overlaps=[];for(let i=0;i<pieces.length;i++)for(let j=i+1;j<pieces.length;j++){const area=intersection(pieces[i].box,pieces[j].box);if(area>1)overlaps.push({a:pieces[i].id,b:pieces[j].id,area});}
  return{motion:document.documentElement.dataset.motion,opening:document.documentElement.dataset.opening,layout:document.querySelector('.stage').dataset.layout,width:innerWidth,height:innerHeight,scroll:scrollY,scrollWidth:document.documentElement.scrollWidth,fonts:document.fonts.status,journey:rect(document.querySelector('.journey')),pieces,overlaps};
 });
 report.states.push({label,...result});return result;
}
function validateStatic(s,label) {
 check(label+': global motion remains on',s.motion==='on');
 check(label+': opening static only',s.opening==='off'&&s.layout==='static');
 check(label+': no scene remains inert or hidden',s.pieces.every(p=>!p.inert&&p.visibility==='visible'));
 check(label+': no card intersections',!s.overlaps.length);
 check(label+': no title and description collisions',s.pieces.every(p=>p.titleDescriptionOverlap<1));
 check(label+': all scene content contained by journey',s.pieces.every(p=>p.box.bottom<=s.journey.bottom+.5&&p.caption.bottom<=p.box.bottom+.5&&p.title.right<=s.width+.5&&p.description.right<=s.width+.5));
 check(label+': no horizontal overflow',s.scrollWidth===s.width);
 check(label+': correct four case hrefs',s.pieces.every(p=>p.href===`projetos/${p.id}.html`));
 check(label+': images loaded',s.pieces.every(p=>p.assets.every(i=>i.loaded)));
}
async function captureFormation(page,name) {
 for(const piece of await page.locator('.scene').all()) {
  await piece.scrollIntoViewIfNeeded();
  await piece.locator('img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
  await page.waitForTimeout(100);
 }
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
 await page.waitForTimeout(120);
 const bounds=await page.locator('.journey').evaluate(e=>({x:0,y:0,width:innerWidth,height:Math.ceil(e.getBoundingClientRect().bottom+scrollY)}));
 await page.screenshot({path:path.join(out,name),fullPage:true,clip:bounds});
}
(async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const base=`http://127.0.0.1:${server.address().port}`;
  const page=await browser.newPage({viewport:{width:844,height:390}});page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(base,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  validateStatic(await state(page,'landscape-load'),'landscape-load');
  await captureFormation(page,'844x390-formation.png');
  for(const id of ['autopost','phron','qozt','natalia']){
   const image=page.locator(`[data-piece="${id}"] .piece-image`);await image.scrollIntoViewIfNeeded();await image.focus();
   const before=await page.evaluate(()=>scrollY);await page.keyboard.press('Enter');
   check(id+': modal opens with keyboard',await page.locator('.project-dialog').evaluate(e=>e.open));
   await page.keyboard.press('Escape');await page.waitForTimeout(70);
   check(id+': close preserves scroll',Math.abs(await page.evaluate(()=>scrollY)-before)<2);
   check(id+': close restores focus',await image.evaluate(e=>e===document.activeElement));
  }
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);
  const reduced=await state(page,'landscape-reduced');check('reduced-motion globally off',reduced.motion==='off'&&reduced.opening==='off');check('reduced-motion pieces interactive',reduced.pieces.every(p=>!p.inert));
  await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(100);validateStatic(await state(page,'landscape-motion-restored'),'landscape-motion-restored');
  await page.locator('[data-board="qozt"]').focus();await page.keyboard.press('Enter');await page.waitForURL('**/projetos/qozt.html');check('fallback navigation reaches real QOZT case',page.url().endsWith('/projetos/qozt.html'));
  await page.setViewportSize({width:390,height:844});await page.goto(base,{waitUntil:'networkidle'});
  await page.evaluate(()=>scrollTo({top:(document.querySelector('.journey').offsetHeight-innerHeight)*.84,behavior:'instant'}));await page.waitForTimeout(100);
  const portrait=await state(page,'portrait-before-rotation');check('portrait animation enabled',portrait.opening==='on'&&portrait.layout==='spread');
  await page.setViewportSize({width:844,height:390});await page.waitForTimeout(180);validateStatic(await state(page,'rotated-landscape'),'rotated-landscape');
  await captureFormation(page,'rotated-landscape-formation.png');
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(180);const restored=await state(page,'rotated-portrait');check('return to portrait restores motion',restored.motion==='on'&&restored.opening==='on');
  await page.evaluate(()=>scrollTo({top:(document.querySelector('.journey').offsetHeight-innerHeight)*.84,behavior:'instant'}));await page.waitForTimeout(100);
  const assembled=await state(page,'restored-spread');check('restored spread no overlaps',assembled.layout==='spread'&&!assembled.overlaps.length);check('restored spread no inert pieces',assembled.pieces.every(p=>!p.inert));
  await page.screenshot({path:path.join(out,'restored-portrait.png')});
  check('no page errors',!report.errors.length);
  console.log(JSON.stringify({checks:report.checks,errors:report.errors},null,2));
 }catch(e){report.failure=e.stack;throw e;}finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
