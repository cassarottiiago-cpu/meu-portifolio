const { chromium } = require('C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const candidates = [
  {id:'noomo-story',url:'https://storytelling.noomoagency.com/'},
  {id:'noomo-labs',url:'https://labs.noomoagency.com/'},
  {id:'igloo',url:'https://www.igloo.inc/'},
  {id:'unseen',url:'https://unseen.co/'},
  {id:'aristide',url:'https://aristidebenoist.com/'},
  {id:'resn',url:'https://resn.co.nz/'},
  {id:'kikk',url:'https://2025.kikk.be/'},
];
const selected=process.argv.find(a=>a.startsWith('--ids='))?.slice(6).split(',');
const targets=selected?candidates.filter(c=>selected.includes(c.id)):candidates;
const record=process.argv.includes('--record');
const mobile=process.argv.includes('--mobile');
const settleMs=Number(process.argv.find(a=>a.startsWith('--settle='))?.slice(9)||12000);
const out=path.join(__dirname,'aberturas');
const suffix=mobile?'-mobile':record?'-video':'-scout';
fs.mkdirSync(out,{recursive:true});
const ffmpeg='C:/Users/iago cassarotti/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffmpeg.exe';

async function recorder(context,page,file){
  const session=await context.newCDPSession(page);
  const child=spawn(ffmpeg,['-hide_banner','-loglevel','error','-y','-f','image2pipe','-framerate','20','-vcodec','mjpeg','-i','pipe:0','-an','-c:v','libx264','-preset','veryfast','-crf','24','-pix_fmt','yuv420p','-movflags','+faststart',file],{windowsHide:true,stdio:['pipe','ignore','pipe']});
  let last=null,frames=0,errors='',blocked=false;
  child.stderr.on('data',data=>errors+=data.toString());
  child.stdin.on('error',()=>{});
  child.stdin.on('drain',()=>blocked=false);
  const finished=new Promise((resolve,reject)=>{child.on('error',reject);child.on('close',code=>code===0?resolve():reject(new Error(errors||'ffmpeg exit '+code)));});
  session.on('Page.screencastFrame',event=>{last=Buffer.from(event.data,'base64');session.send('Page.screencastFrameAck',{sessionId:event.sessionId}).catch(()=>{});});
  await session.send('Page.startScreencast',{format:'jpeg',quality:78,maxWidth:1280,maxHeight:800,everyNthFrame:1});
  const timer=setInterval(()=>{if(last&&!blocked){blocked=!child.stdin.write(last);frames++;}},50);
  const stop=async()=>{clearInterval(timer);await session.send('Page.stopScreencast').catch(()=>{});child.stdin.end();await finished;await session.detach();return {frames,seconds:frames/20,notes:'Captura de navegador headless, sem áudio. Não é benchmark de desempenho nem medição de FPS do site.'};};
  stop.latestFrame=()=>last;
  stop.elapsed=()=>frames/20;
  return stop;
}

(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--mute-audio']});
  const results=[];
  let next=0;
  try{
    await Promise.all(Array.from({length:record?1:2},async()=>{
      while(next<targets.length){
        const target=targets[next++];
        const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:800},deviceScaleFactor:1,isMobile:mobile,hasTouch:mobile});
        const page=await context.newPage();
        const captureSession=await context.newCDPSession(page);
        const watchdog=setTimeout(()=>page.close().catch(()=>{}),110000);
        const result={...target,checkedAt:new Date().toISOString(),mobile,actions:[],frames:[],errors:[],failedRequests:[]};
        page.on('pageerror',e=>result.errors.push(e.message));
        page.on('requestfailed',r=>{if(result.failedRequests.length<12)result.failedRequests.push({url:r.url(),error:r.failure()?.errorText});});
        let stopRecording;
        const started=Date.now();
        const action=description=>result.actions.push({atMs:Date.now()-started,description});
        const snapshot=async(label)=>{const file=target.id+suffix+'-'+label+'.jpg';const startedAt=Date.now()-started;let buffer=stopRecording?.latestFrame();if(!buffer&&!record){const shot=await captureSession.send('Page.captureScreenshot',{format:'jpeg',quality:85,fromSurface:true});buffer=Buffer.from(shot.data,'base64');}if(buffer){fs.writeFileSync(path.join(out,file),buffer);result.frames.push({file,startedAtMs:startedAt,finishedAtMs:Date.now()-started,videoTimeSec:stopRecording?.elapsed()});}else result.frames.push({label,error:'Nenhum quadro recebido neste instante',startedAtMs:startedAt});};
        try{
          if(record)stopRecording=await recorder(context,page,path.join(out,target.id+'.mp4'));
          const navigation=page.goto(target.url,{waitUntil:'domcontentloaded',timeout:30000}).then(r=>{result.status=r?.status();result.domContentLoadedAtMs=Date.now()-started;}).catch(e=>{result.navigationError=e.message;});
          await page.waitForTimeout(3000);
          await snapshot('03s');
          await navigation;
          await page.waitForTimeout(Math.max(0,settleMs-(Date.now()-started)));
          await snapshot('loaded');
          result.title=await page.title();
          result.text=(await page.locator('body').innerText({timeout:5000})).slice(0,12000);
          result.controls=await page.locator('button,a,[role="button"]').evaluateAll(els=>els.filter(e=>e.getBoundingClientRect().width&&e.getBoundingClientRect().height).slice(0,40).map(e=>({tag:e.tagName,text:e.textContent.trim().slice(0,100),href:e.href||null})));
          let entered=false;
          if(target.id==='kikk'&&!mobile){await page.mouse.click(914,330);action('Fechar aviso de migração para KIKK 2026 pelo X visível');await page.waitForTimeout(1800);}
          if(target.id==='noomo-story'&&record){await page.mouse.click(640,400);action('Clique no centro da cena, conforme convite Click to start');await page.waitForTimeout(6000);entered=true;}
          for(const label of ['Enter without audio','Click to start','Enter','Start experience','start','Start']){
            if(entered)break;
            const locators=await page.getByText(label,{exact:true}).all();
            for(const locator of locators){
              if(await locator.isVisible().catch(()=>false)){
                try{await locator.click({timeout:3500});action('Clique de navegação: '+label);await page.waitForTimeout(6000);entered=true;break;}catch{}
              }
            }
            if(entered)break;
          }
          await snapshot('experience');
          if(!mobile){await page.mouse.move(270,250);await page.mouse.move(940,440,{steps:35});action('Movimento do cursor pela cena');await page.waitForTimeout(1800);}
          for(let i=0;i<4;i++){await page.mouse.wheel(0,460);await page.waitForTimeout(900);}
          action('Quatro rolagens de 460 px');
          await snapshot('scroll');
          result.afterText=(await page.locator('body').innerText()).slice(0,12000);
          result.finalUrl=page.url();
          if(record)await page.waitForTimeout(1500);
        }catch(e){result.error=e.message;}
        finally{
          clearTimeout(watchdog);
          if(stopRecording)try{result.video=await stopRecording();}catch(e){result.videoError=e.message;}
          await context.close();
          results.push(result);
          fs.writeFileSync(path.join(out,target.id+suffix+'.json'),JSON.stringify(result,null,2));
          console.log(JSON.stringify({id:target.id,status:result.status,title:result.title,error:result.error,video:result.video,videoError:result.videoError,frames:result.frames,actions:result.actions}));
          fs.writeFileSync(path.join(out,'inspecao'+suffix+'.json'),JSON.stringify(results,null,2));
        }
      }
    }));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
