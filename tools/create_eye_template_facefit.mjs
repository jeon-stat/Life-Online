import { mkdirSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";

const width = 1024;
const height = 1024;
const outDir = "public/templates";
const outPath = `${outDir}/chibi_eye_template_facefit.png`;

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

const drawEllipseOutline = (cx, cy, rx, ry, color, outlineWidth = 0.045) => {
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

const drawCircleOutline = (cx, cy, r, color, outlineWidth = 0.04) => {
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

mkdirSync(outDir, { recursive: true });

const guide = [123, 138, 145, 70];
const subtle = [34, 30, 28, 120];
const soft = [34, 30, 28, 90];

// Face alignment guides based on the current chibi head proportions.
drawEllipseOutline(512, 448, 248, 210, [150, 150, 150, 35], 0.02);
drawLine(512, 220, 512, 840, guide, 1);
drawLine(210, 448, 814, 448, guide, 1);

// Eye sockets / placement guides.
drawEllipseOutline(382, 438, 90, 72, subtle, 0.06);
drawEllipseOutline(642, 438, 90, 72, subtle, 0.06);

// Iris guides to help artist keep expressions centered.
drawCircleOutline(382, 444, 40, soft, 0.05);
drawCircleOutline(642, 444, 40, soft, 0.05);
drawCircleOutline(382, 444, 14, [255, 255, 255, 95], 0.12);
drawCircleOutline(642, 444, 14, [255, 255, 255, 95], 0.12);

// Very light nose/mouth anchors, mostly for proportion.
drawCircleOutline(512, 538, 8, [120, 120, 120, 40], 0.25);
drawLine(498, 584, 526, 584, [120, 120, 120, 40], 1);

writeFileSync(outPath, PNG.sync.write(png, { colorType: 6 }));
console.log(outPath);
