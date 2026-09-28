const fs = require('node:fs');
const path = require('node:path');
const cache = new Map();

// Read the actual raster headers. Filenames and viewport presets are not sizes.
function dimensions(file) {
  const absolute = path.resolve(__dirname, '../assets', file);
  if (cache.has(absolute)) return cache.get(absolute);
  const bytes = fs.readFileSync(absolute);
  let size;
  if (bytes.toString('ascii', 1, 4) === 'PNG') {
    size = [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
  } else if (bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') {
    const format = bytes.toString('ascii', 12, 16);
    if (format === 'VP8X') size = [bytes.readUIntLE(24, 3) + 1, bytes.readUIntLE(27, 3) + 1];
    if (format === 'VP8 ') size = [bytes.readUInt16LE(26) & 0x3fff, bytes.readUInt16LE(28) & 0x3fff];
    if (format === 'VP8L') {
      const packed = bytes.readUInt32LE(21);
      size = [(packed & 0x3fff) + 1, ((packed >>> 14) & 0x3fff) + 1];
    }
  } else if (bytes.readUInt16BE(0) === 0xffd8) {
    for (let offset = 2; offset < bytes.length - 9;) {
      if (bytes[offset] !== 0xff) break;
      while (bytes[offset] === 0xff) offset++;
      const marker = bytes[offset++];
      if (marker === 0xd9 || marker === 0xda) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        size = [bytes.readUInt16BE(offset + 5), bytes.readUInt16BE(offset + 3)];
        break;
      }
      offset += bytes.readUInt16BE(offset);
    }
  }
  if (!size || !size.every(value => Number.isInteger(value) && value > 0)) throw new Error('Dimensões não identificadas: ' + file);
  cache.set(absolute, size);
  return size;
}

module.exports = dimensions;
