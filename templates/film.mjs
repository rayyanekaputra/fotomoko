// Frame 43 (Figma 21:234): black film strip, 4 photos tinted with the
// palette colours, shape markers on the left, yellow sideways text and a
// 3-colour bar on the right.

import { drawCover, drawText, drawRotatedImage, fillRect, dates } from '../draw_utils.mjs';

const W = 400;
const H = 1391;
const SLOT_W = 246.2;
const SLOT_H = 327.734;
const GAP = 16;

const YELLOW = '#f1c332';
const CREAM = '#dbd2c1';
const BLUE = '#5985cc';

// Photo tints, top to bottom.
const TINTS = ['#f0c231', CREAM, BLUE, BLUE];

const text = { font: '400 24.231px "Khand"', size: 24.231, color: YELLOW, trim: 'cap', rotate: -90 };
const COL_X = 309;
const COL_W = 16;

// Marker strips: Figma box (rotated 90°) → image key.
const MARKERS = [
  { key: 'markers1', x: 16.5, y: 16, w: 24, h: 100 },
  { key: 'markers2', x: 16.5, y: 360, w: 24, h: 100 },
  { key: 'markers3', x: 16.5, y: 703, w: 24, h: 100 },
  { key: 'dot', x: 16.5, y: 1047, w: 24, h: 24 },
  { key: 'markers4', x: 16.5, y: 1274.5, w: 24, h: 100 },
];

export default {
  id: 'film',
  name: 'Film strip',
  width: W,
  height: H,
  slots: [0, 1, 2, 3].map((i) => ({ x: 52.8, y: 16 + i * (SLOT_H + GAP), w: SLOT_W, h: SLOT_H })),
  fonts: [text.font],
  images: {
    markers1: 'assets/svg/film-markers-1.svg',
    markers2: 'assets/svg/film-markers-2.svg',
    markers3: 'assets/svg/film-markers-3.svg',
    markers4: 'assets/svg/film-markers-4.svg',
    dot: 'assets/svg/film-marker-dot.svg',
  },
  fields: [
    { key: 'code', label: 'Code', default: '2XCCF - FFFFC - MASN - 44AA' },
    { key: 'year', label: 'Year', default: dates.year() },
    { key: 'day', label: 'Date', default: dates.dayMonth() },
    { key: 'word1', label: 'Word 1', default: 'FOTO' },
    { key: 'word2', label: 'Word 2', default: 'MOKO' },
  ],

  draw(ctx, { photos, fields, images }) {
    fillRect(ctx, 0, 0, W, H, '#000000');

    // Photo overflows its slot in Figma (342×455 in 246×328).
    this.slots.forEach((slot, i) => {
      drawCover(ctx, photos[i], slot, { tone: { type: 'luminosity', color: TINTS[i] }, zoom: 455 / SLOT_H });
    });

    // Markers are 100×24 images rotated 90° into a 24×100 box.
    for (const m of MARKERS) {
      const img = images[m.key];
      if (!img) continue;
      const iw = m.h; // unrotated width
      const ih = m.w;
      drawRotatedImage(ctx, img, m.x + m.w / 2, m.y + m.h / 2, iw, ih, 90);
    }

    const col = (y, h) => ({ x: COL_X, y, w: COL_W, h });
    drawText(ctx, fields.code, col(16, 225), text);
    drawText(ctx, fields.year, col(358, 41), text);
    drawText(ctx, '-', col(516, 6), text);
    drawText(ctx, fields.day, col(639, 48), text);
    drawText(ctx, fields.word2, col(983, 48), text);
    drawText(ctx, fields.word1, col(703, 40), text);
    drawText(ctx, fields.word2, col(1047, 48), text);
    drawText(ctx, fields.word1, col(1335, 40), text);

    // Colour bar.
    fillRect(ctx, 352, 18, 32, 403, YELLOW);
    fillRect(ctx, 352, 421, 32, 103, CREAM);
    fillRect(ctx, 352, 522, 32, 853, BLUE);
  },
};
