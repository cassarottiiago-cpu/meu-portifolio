const {chromium}=require(process.env.PORTFOLIO_PLAYWRIGHT||'playwright-core');
const fs=require('node:fs'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1400,height:1000}});
  await page.setContent('<video muted preload="auto"></video><canvas></canvas>');
  const info=await page.evaluate(async src=>{
   const video=document.querySelector('video');video.src=src;
   await new Promise((resolve,reject)=>{video.onloadeddata=resolve;video.onerror=reject;});
   return {duration:video.duration,width:video.videoWidth,height:video.videoHeight};
  },'data:video/mp4;base64,'+fs.readFileSync('C:/Users/bmkld/Downloads/WhatsApp Video 2026-09-28 at 01.33.27.mp4').toString('base64'));
  console.log(info);
  const start=Number(process.argv[2]||0),step=Number(process.argv[3]||1),count=Math.min(24,Math.ceil((info.duration-start)/step));
  await page.evaluate(async({start,step,count})=>{
   const video=document.querySelector('video'),canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d');
   const crop=step<1,w=crop?480:320,sy=crop?260:0,sh=crop?250:video.videoHeight,h=sh/video.videoWidth*w;
   canvas.width=w*4;canvas.height=(h+24)*Math.ceil(count/4);
   for(let i=0;i<count;i++){
    video.currentTime=Math.min(video.duration-.01,start+i*step+.001);
    await new Promise(r=>video.onseeked=r);
    const x=i%4*w,y=Math.floor(i/4)*(h+24);
    ctx.drawImage(video,0,sy,video.videoWidth,sh,x,y,w,h);ctx.fillStyle='white';ctx.fillRect(x,y+h,w,24);ctx.fillStyle='black';ctx.font='16px Arial';ctx.fillText((start+i*step).toFixed(2)+'s',x+8,y+h+18);
   }
   video.remove();
  },{start,step,count});
  await page.locator('canvas').screenshot({path:path.join(__dirname,'work-video-'+start+'-'+step+'.png')});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
