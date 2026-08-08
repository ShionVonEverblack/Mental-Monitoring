const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    let c = (crc ^ buf[i]) & 0xff;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const crcVal = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createRimaPng(size) {
  const width = size;
  const height = size;

  // Raw image data: height rows, each row starts with filter byte 0, followed by width * 4 RGBA bytes
  const rawData = Buffer.alloc(height * (1 + width * 4));

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.45;

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter: none
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        // Gradient color: Blue (74, 124, 247) -> Purple (124, 92, 191) -> Teal (77, 184, 164)
        const t = (x + y) / (width + height);
        let r, g, b;
        if (t < 0.5) {
          const u = t * 2;
          r = Math.round(74 + (124 - 74) * u);
          g = Math.round(124 + (92 - 124) * u);
          b = Math.round(247 + (191 - 247) * u);
        } else {
          const u = (t - 0.5) * 2;
          r = Math.round(124 + (77 - 124) * u);
          g = Math.round(92 + (184 - 92) * u);
          b = Math.round(191 + (164 - 191) * u);
        }

        // Draw an 'R' shape or heart/mind shape in white inside
        // Simplified 'R' letter check using normalized coords (-1 to 1)
        const nx = (x - cx) / radius;
        const ny = (y - cy) / radius;

        let isR = false;
        // Vertical stem of R
        if (nx >= -0.35 && nx <= -0.15 && ny >= -0.45 && ny <= 0.45) isR = true;
        // Top loop of R
        if (nx >= -0.15 && nx <= 0.25 && ny >= -0.45 && ny <= -0.45 + 0.15) isR = true;
        if (nx >= -0.15 && nx <= 0.25 && ny >= -0.05 && ny <= 0.05) isR = true;
        if (nx >= 0.15 && nx <= 0.30 && ny >= -0.45 && ny <= 0.05) isR = true;
        // Diagonal leg of R
        if (nx >= -0.05 && nx <= 0.35 && ny >= 0.0 && ny <= 0.45) {
          const slope = (ny - 0.0) / (nx - (-0.05));
          if (slope >= 0.8 && slope <= 1.8) isR = true;
        }

        if (isR) {
          rawData[offset++] = 255;
          rawData[offset++] = 255;
          rawData[offset++] = 255;
          rawData[offset++] = 240;
        } else {
          rawData[offset++] = r;
          rawData[offset++] = g;
          rawData[offset++] = b;
          rawData[offset++] = 255;
        }
      } else {
        // Transparent outside circle
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
      }
    }
  }

  // PNG Signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA (6)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT Chunk (zlib compressed)
  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);

  // IEND Chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), createRimaPng(192));
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), createRimaPng(512));

console.log('✅ Generated public/icons/icon-192.png and icon-512.png successfully!');
