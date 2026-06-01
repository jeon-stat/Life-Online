import { mkdirSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";

const width = 1024;
const height = 1024;
const outDir = "public/templates";
const outPath = `${outDir}/chibi_eye_template.png`;

const png = new PNG({ width, height });
const data = png.data;

const setPixel = (x, y, r, g, b, a) => {
  if (x < 0 || y < 0 || x >= width || y >= height) return;

  const i = (width * y + x) << 2;
  const srcA = a / 255;
  const dstA = data[i + 3] / 255;
  const outA = srcA + dstA * (1 - srcA);

  if (outA <= 0) return;

  const blend = (src, dst) =>
    Math.round(((src * srcA) + (dst * dstA * (1 - srcA))) / outA);

  data[i] = blend(r, data[i]);
  data[i + 1] = blend(g, data[i + 1]);
  data[i + 2] = blend(b, data[i + 2]);
  data[i + 3] = Math.round(outA * 255);
};

const drawLine = (x0, y0, x1, y1, color, thickness = 1) => {
  const dx = Math.abs(x1 - x0);
  const sx = x0 < x1 ? 1 : -1;
  const dy = -Math.abs(y1 - y0);
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;

  while (true) {
    for (let oy = -Math.floor(thickness / 2); oy <= Math.floor(thickness / 2); oy += 1) {
      for (let ox = -Math.floor(thickness / 2); ox <= Math.floor(thickness / 2); ox += 1) {
        setPixel(x0 + ox, y0 + oy, ...color);
      }
    }

    if (x0 === x1 && y0 === y1) break;

    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
};

const drawEllipseOutline = (cx, cy, rx, ry, color, outlineWidth = 0.06) => {
  const xMin = Math.max(0, Math.floor(cx - rx - 4));
  const xMax = Math.min(width - 1, Math.ceil(cx + rx + 4));
  const yMin = Math.max(0, Math.floor(cy - ry - 4));
  const yMax = Math.min(height - 1, Math.ceil(cy + ry + 4));

  for (let y = yMin; y <= yMax; y += 1) {
    for (let x = xMin; x <= xMax; x += 1) {
      const nx = (x - cx) / rx;
      const ny = (y - cy) / ry;
      const d = Math.sqrt(nx * nx + ny * ny);
      const delta = Math.abs(d - 1);
      if (delta <= outlineWidth) {
        const t = 1 - delta / outlineWidth;
        const alpha = Math.round(color[3] * t);
        if (alpha > 0) {
          setPixel(x, y, color[0], color[1], color[2], alpha);
        }
      }
    }
  }
};

const drawCircleOutline = (cx, cy, r, color, outlineWidth = 0.045) => {
  const xMin = Math.max(0, Math.floor(cx - r - 4));
  const xMax = Math.min(width - 1, Math.ceil(cx + r + 4));
  const yMin = Math.max(0, Math.floor(cy - r - 4));
  const yMax = Math.min(height - 1, Math.ceil(cy + r + 4));

  for (let y = yMin; y <= yMax; y += 1) {
    for (let x = xMin; x <= xMax; x += 1) {
      const d = Math.hypot(x - cx, y - cy) / r;
      const delta = Math.abs(d - 1);
      if (delta <= outlineWidth) {
        const t = 1 - delta / outlineWidth;
        const alpha = Math.round(color[3] * t);
        if (alpha > 0) {
          setPixel(x, y, color[0], color[1], color[2], alpha);
        }
      }
    }
  }
};

const drawSoftDot = (cx, cy, r, color) => {
  const xMin = Math.max(0, Math.floor(cx - r - 2));
  const xMax = Math.min(width - 1, Math.ceil(cx + r + 2));
  const yMin = Math.max(0, Math.floor(cy - r - 2));
  const yMax = Math.min(height - 1, Math.ceil(cy + r + 2));

  for (let y = yMin; y <= yMax; y += 1) {
    for (let x = xMin; x <= xMax; x += 1) {
      const d = Math.hypot(x - cx, y - cy) / r;
      if (d <= 1) {
        const alpha = Math.round(color[3] * (1 - d) * 0.9);
        if (alpha > 0) {
          setPixel(x, y, color[0], color[1], color[2], alpha);
        }
      }
    }
  }
};

mkdirSync(outDir, { recursive: true });

const guide = [120, 140, 150, 65];
const strong = [35, 30, 28, 190];
const soft = [35, 30, 28, 110];

const eyeY = 452;
const leftEye = { cx: 374, cy: eyeY, rx: 128, ry: 108 };
const rightEye = { cx: 650, cy: eyeY, rx: 128, ry: 108 };
const irisR = 56;

drawLine(184, eyeY, 840, eyeY, guide, 1);
drawLine(512, 232, 512, 840, guide, 1);
drawEllipseOutline(512, 448, 272, 218, [130, 130, 130, 28], 0.02);
drawEllipseOutline(leftEye.cx, leftEye.cy, leftEye.rx, leftEye.ry, strong, 0.06);
drawEllipseOutline(rightEye.cx, rightEye.cy, rightEye.rx, rightEye.ry, strong, 0.06);
drawCircleOutline(leftEye.cx + 16, leftEye.cy + 8, irisR, soft, 0.055);
drawCircleOutline(rightEye.cx - 16, rightEye.cy + 8, irisR, soft, 0.055);
drawSoftDot(leftEye.cx + 10, leftEye.cy + 4, 14, [35, 30, 28, 170]);
drawSoftDot(rightEye.cx - 10, rightEye.cy + 4, 14, [35, 30, 28, 170]);
drawSoftDot(leftEye.cx + 32, leftEye.cy - 18, 8, [255, 255, 255, 120]);
drawSoftDot(rightEye.cx + 12, rightEye.cy - 18, 8, [255, 255, 255, 120]);

writeFileSync(outPath, PNG.sync.write(png, { colorType: 6 }));
console.log(outPath);
