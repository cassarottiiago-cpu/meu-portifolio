const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { chromium } = require('C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');
const projects = require('./projetos.cjs');
const dimensions = require('./dimensoes.cjs');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'validacao/entrega-26');
const url = 'http://127.0.0.1:4177';
const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const report = { host: url, checkedAt: new Date().toISOString(), originals: [], projects: [], errors: [] };
  const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const homeImages = [...home.matchAll(/<img\b[^>]*src="assets\/([^"]+)"[^>]*width="(\d+)"[^>]*height="(\d+)"/g)];
  for (const [, file, width, height] of homeImages) assert.deepEqual([Number(width), Number(height)], dimensions(file), file);
  report.homeImageAttributesChecked = homeImages.length;
  for (const [file, original] of [['autopost-hero.jpg','11.07.00'],['autopost-calendar.jpg','11.06.23'],['autopost-queue.jpg','11.05.57']]) {
    const digest = hash(path.join(root,'assets',file));
    assert.equal(digest, hash('D:/HD NOVO/DOWNLOADS/WhatsApp Image 2026-09-23 at '+original+'.jpeg'));
    report.originals.push({file, sha256:digest, unchanged:true});
  }
  const browser = await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  try {
    const page = await browser.newPage({viewport:{width:1440,height:1000}});
    page.on('pageerror', e => report.errors.push(e.message));
    await page.goto(url);
    await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.querySelectorAll('.scene img')].map(img=>img.decode()));});
    for(const [id,progress,state] of [['capa',0,'cover'],['montagem',.48,'assembling'],['composicao',.84,'spread']]) {
      await page.evaluate(p=>scrollTo(0,(document.querySelector('.journey').offsetHeight-innerHeight)*p),progress);
      await page.waitForTimeout(240);
      assert.equal(await page.locator('.stage').getAttribute('data-layout'),state);
      await page.screenshot({path:path.join(out,'home-'+id+'.png')});
    }
    await page.setViewportSize({width:390,height:844});
    await page.goto(url); await page.evaluate(()=>document.fonts.ready); await page.waitForTimeout(300);
    await page.screenshot({path:path.join(out,'home-mobile.png')});
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.setViewportSize({width:1440,height:1000});
    await page.goto(url+'/projetos.html');
    await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(img=>{img.loading='eager';return img.decode();}));});
    await page.screenshot({path:path.join(out,'projetos.png'),fullPage:true});
    for(const project of projects) {
      await page.goto(url+'/projetos/'+project.id+'.html');
      await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(img=>{img.loading='eager';return img.decode();}));});
      const prints = await page.locator('.project-visual img').evaluateAll(images=>images.map(img=>({src:img.getAttribute('src'),native:[img.naturalWidth,img.naturalHeight],declared:[Number(img.getAttribute('width')),Number(img.getAttribute('height'))],displayed:[img.getBoundingClientRect().width,img.getBoundingClientRect().height]})));
      for(const print of prints) {
        assert.deepEqual(print.native,print.declared,print.src);
        assert.ok(Math.abs((print.displayed[0]/print.displayed[1])/(print.native[0]/print.native[1])-1)<.005,print.src);
      }
      report.projects.push({id:project.id,prints,source:{file:project.image,dimensions:dimensions(project.image),sha256:hash(path.join(root,'assets',project.image))}});
      if(project.id==='autopost') await page.screenshot({path:path.join(out,'autopost-caso.png'),fullPage:true});
    }
    assert.deepEqual(report.errors,[]);
    fs.writeFileSync(path.join(out,'conferencia.json'),JSON.stringify(report,null,2));
    console.log('Host confirmado; 4 projetos na hero, 9 cases, proporções nativas e 3 originais AUTOPOST intactos.');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
