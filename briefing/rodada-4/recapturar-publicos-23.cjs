const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');
const sharp = require('C:/Users/iago cassarotti/site-nat-work/node_modules/sharp');
const out = path.resolve(__dirname, '../../prototipo-03/assets/revisao-23');
const targets = [
  { id: 'qozt', url: 'https://www.qozt.com.br/', regions: { cover: 'section', detail: '#app-mobile' } },
  { id: 'dr-paulo', url: 'https://drpaulo-eight.vercel.app/', regions: { cover: '#hero', detail: '#atendimento' } },
  // The logo straddles hero/history. End before the next heading's painted accents,
  // not at the hero section boundary (which cuts the brand).
  { id: 'limozine', url: 'https://lplimozine-nu.vercel.app/', viewport: { width: 1440, height: 700 }, regions: { coverBefore: '#historia h2', coverInset: 17, detail: '#galeria' } },
  { id: 'dominos', url: 'https://dominosblink.vercel.app/', mobile: true, regions: { cover: '.links-section', detail: 'section:not(.links-section)' } },
  { id: 'bmk-blink', url: 'https://blink.bmkgow.com/', mobile: true, regions: { coverBefore: 'main > .flex-col.gap-3', detail: '#pricing-carousel-container' } },
  { id: 'odonto', url: 'https://lpodcmorroagudo.vercel.app/', regions: { cover: 'section', detail: '#tratamentos' } },
];
const inspectOnly = process.argv.includes('--inspect');
const detailsOnly = process.argv.includes('--details-only');
const requested = process.argv.find(a => a.startsWith('--only='))?.slice(7).split(',');
const selected = requested ? targets.filter(t => requested.includes(t.id)) : targets;

async function settle(page, delay = 1000) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(delay);
  await page.evaluate(async () => {
    const images = [...document.images].filter(i => { const r = i.getBoundingClientRect(); return r.bottom > -500 && r.top < innerHeight + 500; });
    await Promise.race([Promise.all(images.map(i => i.decode().catch(() => {}))), new Promise(r => setTimeout(r, 8000))]);
  });
}

async function inspect(page) {
  return page.evaluate(() => ({
    title: document.title, pageHeight: document.documentElement.scrollHeight,
    text: document.body.innerText.slice(0, 6000),
    sections: [...document.querySelectorAll('section, main > div, main > header, body > header')].map(e => {
      const r = e.getBoundingClientRect(); return { tag: e.tagName, id: e.id, class: String(e.className).slice(0, 160), top: Math.round(r.top + scrollY), height: Math.round(r.height), width: Math.round(r.width), heading: e.querySelector('h1,h2,h3')?.textContent.trim().slice(0, 200), text: e.innerText.slice(0, 150) };
    }).filter(e => e.height > 150),
    buttons: [...document.querySelectorAll('button')].map(e => ({ text: e.textContent.trim().slice(0, 100), aria: e.getAttribute('aria-label'), visible: !!e.getClientRects().length })),
    images: [...document.images].map(e => {const r=e.getBoundingClientRect();return {src:e.currentSrc||e.src, width:e.naturalWidth,height:e.naturalHeight,complete:e.complete,loading:e.loading,alt:e.alt,rect:{top:r.top+scrollY,left:r.left,width:r.width,height:r.height}};}),
    videos: [...document.querySelectorAll('video')].map(e => ({ src:e.currentSrc, ready:e.readyState, width:e.videoWidth, height:e.videoHeight })),
  }));
}

async function runTarget(browser, target, mobile = false) {
  const suffix = mobile ? '-mobile' : '';
  const context = await browser.newContext({ viewport: mobile ? {width:430,height:932} : (target.viewport || {width:1440,height:1000}), deviceScaleFactor:2, isMobile:mobile, hasTouch:mobile, locale:'pt-BR', timezoneId:'America/Sao_Paulo' });
  const page = await context.newPage();
  const failed = [];
  page.on('requestfailed', r => failed.push({url:r.url(), error:r.failure()?.errorText}));
  page.on('response', r => { if(r.status()>=400) failed.push({url:r.url(),status:r.status()}); });
  try {
    const response = await page.goto(target.url, {waitUntil:'domcontentloaded',timeout:90000});
    await settle(page,10000);
    for(const name of [/^(recusar|rejeitar)( todos)?$/i, /^aceitar apenas necess[aá]rios$/i]) {
      const button = page.getByRole('button',{name}).first();
      if(await button.isVisible().catch(()=>false)) { await button.click(); await settle(page); }
    }
    const before = await inspect(page);
    if(inspectOnly) {
      await page.screenshot({path:path.join(out,target.id+suffix+'-inspecao.png')});
      fs.writeFileSync(path.join(out,target.id+suffix+'-inspecao.json'),JSON.stringify({...before,failed},null,2));
      console.log(JSON.stringify({id:target.id,mobile,status:response.status(),...before,images:before.images.map(i=>({src:i.src,width:i.width,height:i.height})),failed}));
      return;
    }
    for(let y=0;y<await page.evaluate(()=>document.documentElement.scrollHeight);y+=600) {
      await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),y);
      await settle(page,500);
    }
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
    await settle(page,2500);
    const ready = await inspect(page);
    const priorFile = path.join(out,target.id+suffix+'-metadata.json');
    const prior = fs.existsSync(priorFile) ? JSON.parse(fs.readFileSync(priorFile,'utf8')) : null;
    const preserveFull = target.id === 'limozine';
    const files = detailsOnly && prior ? prior.files.filter(f=>f.role!=='secao') : (preserveFull && prior ? prior.files.filter(f=>f.role==='completo') : []);
    async function save(buffer, name, width) {
      const filename=target.id+suffix+'-'+name+'.webp';
      let pipeline=sharp(buffer); if(width) pipeline=pipeline.resize({width,withoutEnlargement:true});
      const info=await pipeline.webp({quality:92}).toFile(path.join(out,filename));
      files.push({role:name,filename:'revisao-23/'+filename,width:info.width,height:info.height,bytes:info.size});
      return filename;
    }
    // Each target's cover and detail capture regions are configured after real DOM inspection.
    const regions = target.regions || {};
    if (!detailsOnly && regions.coverSection) {
      const coverSection = page.locator(regions.coverSection).first();
      await coverSection.scrollIntoViewIfNeeded(); await settle(page,1500);
      const box = await coverSection.boundingBox();
      if (regions.coverThrough) {
        const end = await page.locator(regions.coverThrough).nth(2).boundingBox();
        box.height = end.y + end.height - box.y;
      }
      const y = box.y + await page.evaluate(()=>scrollY);
      await page.evaluate(()=>scrollTo({top:0,behavior:'instant'})); await settle(page,1800);
      await save(await page.screenshot({fullPage:true,clip:{x:box.x,y,width:box.width,height:box.height}}),'cover');
    } else if (!detailsOnly && (regions.cover || regions.coverBefore)) {
      const clip=await page.locator(regions.cover || regions.coverBefore).first().boundingBox();
      if(!clip) throw new Error('Cover region unavailable: '+regions.cover);
      const height=Math.ceil(regions.coverBefore ? clip.y-(regions.coverInset ?? 12) : clip.y+clip.height + (target.id === 'dominos' ? 20 : 0));
      await save(await page.screenshot({fullPage:true,clip:{x:0,y:0,width:page.viewportSize().width,height}}),'cover');
    } else if (!detailsOnly) {
      await save(await page.screenshot(),'cover');
    }
    if (!detailsOnly && !preserveFull) {
      const full = await page.screenshot({fullPage:true,timeout:60000});
      await save(full,'completo',mobile?860:1920);
    }
    if(regions.detail) {
      const section=page.locator(regions.detail).first();
      await section.scrollIntoViewIfNeeded(); await settle(page,1500);
      const box=await section.boundingBox();
      const absoluteY=box.y+await page.evaluate(()=>scrollY);
      // Return the viewport to the top before the document-coordinate capture.
      // Fixed headers stay at the page top, not across this section's heading.
      await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
      await settle(page,1800);
      await save(await page.screenshot({fullPage:true,clip:{x:box.x,y:absoluteY,width:box.width,height:box.height},timeout:60000}),'secao',1920);
    }
    // Limozine uses content-visibility and parallax: use the dedicated --tiles
    // script for its full capture, never overwrite it with a blank fullPage shot.
    const record={id:target.id,mobile,url:target.url,finalUrl:page.url(),status:response.status(),capturedAt:new Date().toISOString(),viewport:page.viewportSize(),files,ready,failed,...(preserveFull && prior?.fullCapture ? {fullCapture:prior.fullCapture} : {})};
    fs.writeFileSync(path.join(out,target.id+suffix+'-metadata.json'),JSON.stringify(record,null,2));
    console.log(JSON.stringify({id:target.id,mobile,files,brokenImages:ready.images.filter(i=>!i.width),failed}));
  } finally { await context.close(); }
}

(async()=>{
  fs.mkdirSync(out,{recursive:true});
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  const jobs=selected.flatMap(t=>[{target:t,mobile:false},...(t.mobile?[{target:t,mobile:true}]:[])]);
  let next=0;
  try {
    await Promise.all(Array.from({length:2},async()=>{
      while(next<jobs.length) {
        const {target,mobile}=jobs[next++];
        try { await runTarget(browser,target,mobile); }
        catch(error) { console.error(target.id+(mobile?'-mobile':'')+': '+error.stack); process.exitCode=1; }
      }
    }));
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
