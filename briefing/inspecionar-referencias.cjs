const { chromium } = require('C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');
const fs = require('node:fs');
const path = require('node:path');
const targets = process.argv.includes('--complementar') ? [
  ['ciechanowski', 'https://ciechanow.ski/mechanical-watch/', 'referencia'],
  ['nicky-case', 'https://ncase.me/', 'referencia'],
  ['dennis-snellenberg', 'https://dennissnellenberg.com/', 'referencia'],
] : process.argv.includes('--refinar') ? [
  ['bruno-arizio', 'https://brunoarizio.com/', 'referencia'],
  ['bruno-simon', 'https://bruno-simon.com/', 'referencia'],
  ['masayuki-daijima', 'https://daijima.jp/', 'referencia'],
  ['lusion', 'https://lusion.co/', 'estudio'],
] : [
  ['bruno-arizio', 'https://brunoarizio.com/', 'referencia'],
  ['rauno', 'https://rauno.me/', 'referencia'],
  ['josh-comeau', 'https://www.joshwcomeau.com/', 'referencia'],
  ['bruno-simon', 'https://bruno-simon.com/', 'referencia'],
  ['masayuki-daijima', 'https://daijima.jp/', 'referencia'],
  ['robby-leonardi', 'https://www.rleonardi.com/interactive-resume/', 'referencia'],
  ['lusion', 'https://lusion.co/', 'estudio'],
  ['active-theory', 'https://activetheory.net/', 'estudio'],
  ['hachimitsu', 'https://hachimitsuatelierdedelicias.vercel.app/', 'projeto'],
  ['consultingnow', 'https://lpconsultingnow.vercel.app/', 'projeto'],
  ['odc-morro-agudo', 'https://lpodcmorroagudo.vercel.app/', 'projeto'],
  ['bmk', 'https://bmk-omega.vercel.app/', 'projeto'],
  ['autopost', 'https://autopost.op7franquia.com.br/', 'projeto'],
  ['flamex', 'https://lp.flamexfranchising.com.br/', 'projeto'],
];
(async () => {
  const out = path.join(__dirname, 'capturas');
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const results = [];
  let next = 0;
  try {
    await Promise.all(Array.from({ length: 2 }, async () => {
      while (next < targets.length) {
        const [id, url, type] = targets[next++];
        const context = await browser.newContext({viewport:{width:1440,height:1000}});
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        const result = { id, url, type, checkedAt:new Date().toISOString() };
        try {
          const response = await page.goto(url, {waitUntil:'domcontentloaded',timeout:30000});
          result.status = response?.status();
          await page.waitForTimeout(process.argv.includes('--refinar') ? 18000 : 5000);
          result.title = await page.title();
          result.finalUrl = page.url();
          result.text = (await page.locator('body').innerText({timeout:6000})).slice(0,22000);
          result.headings = await page.locator('h1,h2,h3').allTextContents();
          result.links = await page.locator('a[href]').evaluateAll(links => links.slice(0,60).map(a=>({text:a.innerText,href:a.href})));
          await page.screenshot({path:path.join(out,id+'-inicio.png'),timeout:10000});
          await page.evaluate(() => window.scrollBy(0, 850));
          await page.waitForTimeout(1500);
          await page.screenshot({path:path.join(out,id+'-rolagem.png'),timeout:10000});
          if (type === 'referencia' && id !== 'bruno-simon') {
            await page.setViewportSize({width:390,height:844});
            await page.evaluate(() => window.scrollTo(0,0));
            await page.waitForTimeout(1000);
            await page.screenshot({path:path.join(out,id+'-mobile.png'),timeout:10000});
          }
        } catch(error) { result.error=error.message; }
        result.scriptErrors=errors.slice(0,10);
        results.push(result);
        console.log(JSON.stringify({id,status:result.status,title:result.title,error:result.error,headings:result.headings?.slice(0,4)}));
        await context.close();
      }
    }));
  } finally {
    await browser.close();
    const suffix = process.argv.includes('--complementar') ? '-complementar' : process.argv.includes('--refinar') ? '-refinada' : '';
    fs.writeFileSync(path.join(__dirname,'inspecao-referencias'+suffix+'.json'), JSON.stringify(results,null,2));
  }
})();
