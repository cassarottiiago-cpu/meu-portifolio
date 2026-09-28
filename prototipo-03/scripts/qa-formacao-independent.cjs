const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');
const { createServer } = require('./servidor.cjs');
const out = path.resolve(__dirname, '../validacao/qa-formacao-independent');
fs.mkdirSync(out, { recursive: true });

async function inspect(page) {
  return page.evaluate(() => {
    const rect = node => { const r = node.getBoundingClientRect(); return { x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom }; };
    const overlap = (a,b) => Math.max(0,Math.min(a.right,b.right)-Math.max(a.x,b.x)) * Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y));
    const pieces = [...document.querySelectorAll('.scene')].map(e => {
      const title = e.querySelector('h2'), caption = e.querySelector('.piece-caption'), p = caption.querySelector('p'), image = e.querySelector('.piece-image');
      const range = document.createRange(); range.selectNodeContents(title);
      const r = range.getBoundingClientRect();
      const text = {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom};
      return {id:e.dataset.piece,box:rect(e),image:rect(image),caption:rect(caption),title:rect(title),text,description:rect(p),inert:e.inert,visible:getComputedStyle(e).visibility,titleDescriptionOverlap:overlap(text,rect(p)),assets:[...e.querySelectorAll('img')].map(i=>({file:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0,display:getComputedStyle(i).display,natural:[i.naturalWidth,i.naturalHeight],box:rect(i)}))};
    });
    const intersections=[];
    for(let i=0;i<pieces.length;i++) for(let j=i+1;j<pieces.length;j++) {
      const area=overlap(pieces[i].box,pieces[j].box); if(area>1) intersections.push({a:pieces[i].id,b:pieces[j].id,area});
    }
    return {width:innerWidth,height:innerHeight,scroll:scrollY,scrollWidth:document.documentElement.scrollWidth,motion:document.documentElement.dataset.motion,opening:document.documentElement.dataset.opening,stage:document.querySelector('.stage').dataset.layout,fonts:document.fonts.status,signatureCount:document.querySelectorAll('.signature').length,header:rect(document.querySelector('.masthead')),pieces,intersections};
  });
}

(async()=>{
 const server=createServer(); await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const report=[];
 try {
  const sizes = process.argv.includes('--compact') ? [[320,568],[390,600],[844,390]] : [[320,740],[390,844],[700,900],[1024,768],[1366,768],[1440,1000]];
  for(const [width,height] of sizes) {
    const page=await browser.newPage({viewport:{width,height}}), errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}`,{waitUntil:'networkidle'});
    await page.evaluate(()=>document.fonts.ready);
    const entry={width,height,errors,states:[]};
    for(const p of [0,.22,.48,.84]) {
      await page.evaluate(p=>scrollTo({top:(document.querySelector('.journey').offsetHeight-innerHeight)*p,behavior:'instant'}),p);
      await page.waitForTimeout(160);
      entry.states.push({p,...await inspect(page)});
      await page.screenshot({path:path.join(out,`${width}x${height}-${p}.png`)});
    }
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'})); await page.waitForTimeout(80);
    const animated=await page.evaluate(()=>document.documentElement.dataset.opening==='on');
    await page.locator('[data-board="qozt"]').focus();
    await page.keyboard.press('Enter'); await page.waitForTimeout(100);
    if(!animated) {
      await page.waitForURL('**/projetos/qozt.html');
      entry.fallbackHref=page.url();
      assert.ok(entry.fallbackHref.endsWith('/projetos/qozt.html'),'Static navigation uses the real case href');
      await page.goto(`http://127.0.0.1:${server.address().port}`,{waitUntil:'networkidle'});
      await page.locator('[data-piece="qozt"] .piece-image').scrollIntoViewIfNeeded();
      await page.locator('[data-piece="qozt"] .piece-image').focus();
    }
    entry.jump={...(await inspect(page)),focused:await page.evaluate(()=>({text:document.activeElement.getAttribute('aria-label'),outer:document.activeElement.outerHTML.slice(0,140)}))};
    const before=await page.evaluate(()=>scrollY);
    await page.keyboard.press('Enter');
    entry.dialog={open:await page.locator('.project-dialog').evaluate(e=>e.open),title:await page.locator('#dialog-title').innerText(),before,after:await page.evaluate(()=>scrollY)};
    await page.keyboard.press('Escape'); await page.waitForTimeout(80);
    entry.closed={after:await page.evaluate(()=>scrollY),focus:await page.evaluate(()=>document.activeElement.getAttribute('aria-label'))};
    await page.emulateMedia({reducedMotion:'reduce'}); await page.waitForTimeout(120);
    entry.reduced=await inspect(page);
    await page.evaluate(()=>scrollTo(0,0));
    await page.screenshot({path:path.join(out,`${width}x${height}-reduced.png`)});
    await page.emulateMedia({reducedMotion:'no-preference'}); await page.waitForTimeout(120);
    entry.motionRestored=await inspect(page);
    assert.equal(errors.length,0,'No page errors');
    assert.ok(entry.states.every(s=>s.scrollWidth===s.width),'No horizontal overflow');
    assert.ok(entry.states.every(s=>s.fonts==='loaded'&&s.pieces.every(p=>p.assets.every(i=>i.loaded))),'Fonts and screenshots loaded');
    assert.ok(entry.states.every(s=>s.signatureCount===1),'Single signature');
    assert.equal(entry.states.at(-1).intersections.length,0,'No final card overlaps');
    assert.equal(entry.dialog.open,true,'QOZT modal opens by keyboard');
    assert.equal(entry.dialog.before,entry.dialog.after,'Opening the modal preserves scroll');
    assert.equal(entry.closed.after,entry.dialog.before,'Closing the modal preserves scroll');
    assert.equal(entry.closed.focus,'Conhecer QOZT','Closing restores focus');
    assert.equal(entry.reduced.motion,'off','Reduced motion disables global motion');
    assert.ok(entry.reduced.pieces.every(p=>!p.inert),'Reduced-motion pieces remain interactive');
    if(!animated) {
      assert.equal(entry.motionRestored.motion,'on','Landscape preserves global motion');
      assert.equal(entry.motionRestored.opening,'off','Landscape only disables opening motion');
      assert.ok(entry.motionRestored.pieces.every(p=>!p.inert),'Landscape pieces remain interactive');
    }
    report.push(entry); await page.close();
  }
  fs.writeFileSync(path.join(out,process.argv.includes('--compact')?'report-compact.json':'report.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report.map(e=>({size:[e.width,e.height],errors:e.errors,cover:e.states[0].pieces[0].box,spread:e.states[3].pieces.map(p=>({id:p.id,box:p.box,text:p.text,titleDescriptionOverlap:p.titleDescriptionOverlap})),intersections:e.states[3].intersections,jumpFocus:e.jump.focused,dialog:e.dialog,closed:e.closed,reduced:{motion:e.reduced.motion,scroll:e.reduced.scroll,inert:e.reduced.pieces.map(p=>p.inert)},restored:e.motionRestored.stage})),null,2));
 } finally {await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
