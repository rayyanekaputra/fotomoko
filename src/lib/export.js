// Rendering a template to a canvas, in the three export formats:
// native (template only), story (9:16) and square (1:1).

import { roundRectPath } from './draw_utils.js';

export const FORMATS = {
  native: null,
  story: { w: 1080, h: 1920 },
  square: { w: 1080, h: 1080 },
};

export const BACKGROUNDS = {
  light: '#F5F2EA',
  dark: '#1E1E1E',
  transparent: null,
};

// Story/square: template size stops (S, M, L, XL) as a fraction of the full fit.
export const ZOOMS = [0.4, 0.6, 0.8, 1];

// Story/square: a very soft shadow right under the template, no offset.
const SHADOW_COLOR = 'rgba(0, 0, 0, 0.08)';
const SHADOW_BLUR = 0.015; // fraction of the card width

// iOS Safari refuses canvases above ~16.7 MP; stay just under it.
const MAX_PIXELS = 16_000_000;

// Story/square: how much of the card the template may cover.
const FIT_W = 0.82;
const FIT_H = 0.88;

function baseSize(template, format) {
  const f = FORMATS[format];
  return f ? { w: f.w, h: f.h } : { w: template.width, h: template.height };
}

// Largest multiplier ≤ requested that fits the pixel limit.
export function resolveScale(template, format, scale) {
  const { w, h } = baseSize(template, format);
  const max = Math.sqrt(MAX_PIXELS / (w * h));
  return Math.min(scale, Math.floor(max * 100) / 100);
}

// Draw `template` onto `canvas`. `scale` is the export multiplier (1–4) for
// export, or any number for previews. Returns the scale actually used.
export function renderTo(canvas, template, { photos, fields, images = {}, format = 'native', background = 'light', zoom = 1, scale = 1 }) {
  const used = resolveScale(template, format, scale);
  const { w, h } = baseSize(template, format);
  canvas.width = Math.round(w * used);
  canvas.height = Math.round(h * used);

  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (format === 'native') {
    ctx.setTransform(used, 0, 0, used, 0, 0);
  } else {
    const fill = BACKGROUNDS[background];
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    const fit = Math.min((w * FIT_W) / template.width, (h * FIT_H) / template.height);
    const k = fit * zoom * used;
    const dx = (canvas.width - template.width * k) / 2;
    const dy = (canvas.height - template.height * k) / 2;
    ctx.setTransform(k, 0, 0, k, dx, dy);

    // Shadow: draw the card's shape off-canvas and offset only its shadow
    // back under the card, so no fill shows through rounded corners.
    // Shadow sizes are in canvas pixels (the transform doesn't apply).
    const away = canvas.width / k + template.width;
    ctx.save();
    ctx.shadowColor = SHADOW_COLOR;
    ctx.shadowBlur = w * SHADOW_BLUR * used;
    ctx.shadowOffsetX = away * k;
    roundRectPath(ctx, -away, 0, template.width, template.height, template.radius ?? 0);
    ctx.fill();
    ctx.restore();
  }

  // Clip to the frame, like a Figma frame does.
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, template.width, template.height);
  ctx.clip();
  template.draw(ctx, { photos, fields, images });
  ctx.restore();
  return used;
}

export function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('export failed'))), 'image/png');
  });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
