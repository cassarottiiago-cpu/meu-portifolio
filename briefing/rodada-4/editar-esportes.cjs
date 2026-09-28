const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const sharp = require('C:/Users/iago cassarotti/site-nat-work/node_modules/sharp');
const ffmpeg = 'C:/Users/iago cassarotti/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffmpeg.exe';
const source = path.join(__dirname, 'esportes');
const assets = path.resolve(__dirname, '../../prototipo-03/assets');
const clips = [['skate', 1.5], ['surf', 3], ['neve', 4], ['salto', 2.5]];
(async () => {
  const preview = process.argv.includes('--inspecionar');
  if (preview) {
    for (const [id] of clips) {
      execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', path.join(source, id + '.mp4'), '-vf', 'fps=1/3,scale=480:-1,tile=2x2', '-frames:v', '1', path.join(source, id + '-quadros.jpg')]);
    }
    console.log('Quadros de inspeção salvos.'); return;
  }
  const inputs = clips.flatMap(([id, start]) => ['-ss', String(start), '-t', '4', '-i', path.join(source, id + '.mp4')]);
  const filters = clips.map((_, i) => `[${i}:v]scale=1600:900:force_original_aspect_ratio=increase,crop=1600:900,setsar=1,fps=24,setpts=PTS-STARTPTS[v${i}]`).join(';') + ';' + clips.map((_, i) => `[v${i}]`).join('') + 'concat=n=4:v=1:a=0,format=yuv420p[out]';
  execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...inputs, '-filter_complex', filters, '-map', '[out]', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '25', '-movflags', '+faststart', path.join(assets, 'liberdade.mp4')]);
  execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-ss', '9', '-i', path.join(assets, 'liberdade.mp4'), '-frames:v', '1', '-c:v', 'libwebp', '-quality', '88', path.join(assets, 'liberdade-poster.webp')]);
  const sources = { 'dr-paulo': 'paulo-live', 'limozine': 'limozine', 'brave': 'brave', 'bmk-blink': 'bmk-blink', 'union': 'union', 'odonto': 'odonto' };
  for (const id of Object.keys(sources)) {
    const sourceId = sources[id];
    const input = path.join(__dirname, 'acervo', sourceId + '-2x.webp');
    fs.copyFileSync(input, path.join(assets, id + '-2x.webp'));
    await sharp(input).resize(1600).webp({ quality: 85 }).toFile(path.join(assets, id + '.webp'));
    fs.copyFileSync(path.join(__dirname, 'acervo', sourceId + '-detalhe.webp'), path.join(assets, id + '-detalhe.webp'));
  }
  const manifest = { edit: 'liberdade.mp4', duration: 16, dimensions: [1600, 900], fps: 24, audio: false, cuts: clips.map(([id, start]) => ({ source: id + '.mp4', in: start, duration: 4 })), bytes: fs.statSync(path.join(assets, 'liberdade.mp4')).size };
  fs.writeFileSync(path.join(source, 'edicao.json'), JSON.stringify(manifest, null, 2));
  console.log(JSON.stringify(manifest));
})().catch(error => { console.error(error); process.exitCode = 1; });
