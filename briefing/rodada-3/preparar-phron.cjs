const fs = require('node:fs');
const path = require('node:path');
const sharp = require('C:/Users/iago cassarotti/site-nat-work/node_modules/sharp');
const source = 'C:/Users/iago cassarotti/PHRON-revisao/hoje-dark.png';
const out = path.join(__dirname, 'assets');
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const metadata = await sharp(source).metadata();
  const destination = path.join(out, 'phron-noturno.webp');
  await sharp(source).webp({ quality: 89 }).toFile(destination);
  const record = { source, file: 'phron-noturno.webp', width: metadata.width, height: metadata.height, sourceModifiedAt: fs.statSync(source).mtime.toISOString(), preparedAt: new Date().toISOString(), note: 'Captura existente de 7 de setembro de 2026, em desenvolvimento. Modo noturno solicitado por Iago em 12 de setembro. Não é apresentada como captura da versão atual. Apenas conversão para WebP, sem recriação ou edição semântica.' };
  fs.writeFileSync(path.join(out, 'phron-source.json'), JSON.stringify(record, null, 2));
  console.log(JSON.stringify(record));
})().catch(error => { console.error(error); process.exitCode = 1; });
