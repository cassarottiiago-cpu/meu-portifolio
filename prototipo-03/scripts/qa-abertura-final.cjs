const { chromium } = require('C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');
const { createServer } = require('./servidor.cjs');
const sharp = require('C:/Users/iago cassarotti/site-nat-work/node_modules/sharp');

(async () => {
  const server = createServer();
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const issues = [];
  try {
    const page = await browser.newPage();
    page.on('pageerror', e => issues.push({ type: 'pageerror', message: String(e) }));
    for (const [width, height] of [[320,740],[390,844],[768,1024],[1440,1000],[844,390]]) {
      await page.setViewportSize({width,height});
      await page.emulateMedia({reducedMotion:'no-preference'});
      await page.goto('http://127.0.0.1:' + server.address().port);
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => Promise.all([...document.querySelectorAll('.scene img')].map(img => img.decode())));
      const samples = [];
      for (let step=0;step<=40;step++) {
        const progress = step/40;
        await page.evaluate(p => scrollTo(0, (document.querySelector('.journey').offsetHeight - innerHeight)*p), progress);
        await page.waitForTimeout(24);
        const state = await page.evaluate(() => {
          const rect = el => { const r=el.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom}; };
          const visible = r => ({x:Math.max(0,r.x),y:Math.max(0,r.y),right:Math.min(innerWidth,r.right),bottom:Math.min(innerHeight,r.bottom)});
          const overlaps = (a,b) => { a=visible(a);b=visible(b);return Math.min(a.right,b.right)-Math.max(a.x,b.x)>2 && Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>2; };
          const names = [...document.querySelectorAll('.opening-type span')].map(rect);
          const panels = [...document.querySelectorAll('.scene')].map(rect);
          const header=rect(document.querySelector('.masthead'));
          const captionEl=document.querySelector('.case-caption');
          const caption=getComputedStyle(captionEl).display === 'none' ? null : rect(captionEl);
          const footer=rect(document.querySelector('.stage-footer'));
          const children=caption ? [...captionEl.children].map(rect) : [];
          return {
            progress:document.querySelector('.stage').style.getPropertyValue('--progress'),
            overflow:document.documentElement.scrollWidth>innerWidth,
            namePanel:names.flatMap((n,i)=>panels.filter(p=>overlaps(n,p)).map(p=>({name:i,n,p}))),
            nameHeader:names.filter(n=>overlaps(n,header)),
            nameName:overlaps(names[0],names[1]) ? names : [],
            captionPanel:caption ? panels.filter(p=>overlaps(caption,p)) : [],
            captionFooter:caption && overlaps(caption,footer),
            captionChildOverflow:children.filter(c=>c.x<caption.x-1 || c.right>caption.right+1 || c.bottom>caption.bottom+1),
            captionChildrenOverlap:children.flatMap((a,i)=>children.slice(i+1).filter(b=>overlaps(a,b))),
            caption,footer,
          };
        });
        if (state.namePanel.length) {
          const before = await sharp(await page.screenshot()).removeAlpha().raw().toBuffer();
          await page.locator('.opening-type').evaluate(el=>el.style.visibility='hidden');
          const after = await sharp(await page.screenshot()).removeAlpha().raw().toBuffer();
          await page.locator('.opening-type').evaluate(el=>el.style.visibility='');
          state.namePanelPaintedPixels = state.namePanel.map(({n,p})=> {
            let different = 0;
            for (let y=Math.max(0,Math.ceil(n.y),Math.ceil(p.y));y<Math.min(height,n.bottom,p.bottom);y++) {
              for(let x=Math.max(0,Math.ceil(n.x),Math.ceil(p.x));x<Math.min(width,n.right,p.right);x++) {
                const at=(y*width+x)*3;
                if(Math.abs(before[at]-after[at])+Math.abs(before[at+1]-after[at+1])+Math.abs(before[at+2]-after[at+2])>30) different++;
              }
            }
            return different;
          });
        }
        if (state.overflow || state.namePanel.length || state.nameHeader.length || state.nameName.length || state.captionPanel.length || state.captionFooter || state.captionChildOverflow.length || state.captionChildrenOverlap.length) samples.push({progress,...state});
      }
      issues.push({width,height,samples});
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.waitForFunction(()=>document.documentElement.dataset.motion === 'off');
      issues.push({width,height,reduced:await page.evaluate(()=>({motion:document.documentElement.dataset.motion,journeyVisible:getComputedStyle(document.querySelector('.journey')).display,selectionVisible:getComputedStyle(document.querySelector('.static-selection')).display,overflow:document.documentElement.scrollWidth>innerWidth}))});
    }
    console.log(JSON.stringify(issues,null,2));
  } finally { await browser.close(); await new Promise(r=>server.close(r)); }
})().catch(e=>{console.error(e);process.exitCode=1;});
