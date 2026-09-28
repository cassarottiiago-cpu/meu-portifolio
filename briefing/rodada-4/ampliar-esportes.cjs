const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { chromium } = require('C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');
const ffmpeg = 'C:/Users/iago cassarotti/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffmpeg.exe';
const source = path.join(__dirname, 'esportes');
const assets = path.resolve(__dirname, '../../prototipo-03/assets');
const additions = [
  { id: 'bmx', title: 'BMX', slug: 'biker-doing-bmx-tricks-198' },
  { id: 'moto', title: 'Motocross', slug: 'tacking-view-of-a-motorcyclist-in-the-desert-43101' }
];
(async () => {
  if (!process.argv.includes('--encode')) {
    const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
    try {
      const page = await browser.newPage();
      for (const item of additions) {
        const url = 'https://mixkit.co/free-stock-video/' + item.slug + '/';
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        const record = await page.evaluate(() => ({ text: document.body.innerText, inputs: [...document.querySelectorAll('input[name="download-option"]')].map(el => ({ value: el.value, label: el.dataset.label })) }));
        if (!record.text.includes('commercial or personal use, under the Mixkit Stock Video Free License')) throw Error('Licença livre não confirmada: ' + item.id);
        const download = record.inputs.find(el => el.label === 'Full HD');
        if (!download) throw Error('Download Full HD indisponível: ' + item.id);
        const downloadUrl = new URL(download.value, url).href;
        let response = await page.request.get(downloadUrl, { timeout: 120000 });
        if (/text\/html/.test(response.headers()['content-type'])) {
          const html = await response.text();
          const videos = [...html.matchAll(/https?:[^\s"'<>]+\.mp4(?:\?[^\s"'<>]*)?/g)].map(m => m[0].replace(/&amp;/g, '&'));
          const video = videos.find(v => /1080/.test(v)) || videos.find(v => /assets\.mixkit\.co/.test(v));
          if (!video) throw Error('Vídeo não localizado no download: ' + item.id);
          response = await page.request.get(video, { timeout: 120000 });
        }
        if (!response.ok() || !/video|octet-stream/.test(response.headers()['content-type'])) throw Error('Download inválido: ' + item.id);
        fs.writeFileSync(path.join(source, item.id + '.mp4'), await response.body());
        fs.writeFileSync(path.join(source, item.id + '-origem.json'), JSON.stringify({ ...item, url, checkedAt: new Date().toISOString(), license: 'Mixkit Stock Video Free License', licenseText: record.text, download: response.url() }, null, 2));
        execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', path.join(source, item.id + '.mp4'), '-vf', 'fps=1,scale=400:-1,tile=3x2', '-frames:v', '1', path.join(source, item.id + '-quadros.jpg')]);
        console.log(item.id + ': baixado e quadros de revisão gerados.');
      }
    } finally { await browser.close(); }
    return;
  }
  const clips = [['skate', 1.5], ['bmx', 1], ['surf', 3], ['moto', .5], ['neve', 4], ['salto', 2.5]];
  const inputs = clips.flatMap(([id, start]) => ['-ss', String(start), '-t', '4', '-i', path.join(source, id + '.mp4')]);
  const filters = clips.map((_, i) => `[${i}:v]scale=1600:900:force_original_aspect_ratio=increase,crop=1600:900,setsar=1,fps=24,setpts=PTS-STARTPTS[v${i}]`).join(';') + ';' + clips.map((_, i) => `[v${i}]`).join('') + 'concat=n=6:v=1:a=0,format=yuv420p[out]';
  execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...inputs, '-filter_complex', filters, '-map', '[out]', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '25', '-movflags', '+faststart', path.join(assets, 'liberdade.mp4')]);
  const manifest = { duration: 24, dimensions: [1600, 900], fps: 24, audio: false, cuts: clips.map(([id, start]) => ({ source: id + '.mp4', in: start, duration: 4 })), bytes: fs.statSync(path.join(assets, 'liberdade.mp4')).size };
  fs.writeFileSync(path.join(source, 'edicao.json'), JSON.stringify(manifest, null, 2));
  console.log(JSON.stringify(manifest));
})().catch(error => { console.error(error); process.exitCode = 1; });
