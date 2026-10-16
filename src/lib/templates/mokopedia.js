// Mokopedia (Figma 24:1062): parcel shipping label parody. Header with invoice and
// tracking code, a wide barcode, 3 black & white photos side by side, the
// SIFOTO logo with 4 shipping details, and a yellow smiley cropped at the bottom.

import { drawCover, drawText, drawRotatedImage, fillRect } from '../draw_utils.js';

const W = 482;
const H = 490;
const DARK = '#212121';
const YELLOW = '#f2d965';

// Inter's "normal" line height is 1.2109 × size; used to centre rows like Figma's auto layout.
const LINE = 1.2109;

const brand = { font: '700 20px "Inter"', size: 20, color: YELLOW };
const medium = { font: '500 12px "Inter"', size: 12, color: DARK };
const bold = { font: '700 12px "Inter"', size: 12, color: DARK };

// Photo panel (24:1125): 474 wide at (3, 191), 1px border, padding 24, gap 12.
const PANEL = { x: 3, y: 191, w: 474 };
const INNER_X = PANEL.x + 1 + 24; // 28
const INNER_Y = PANEL.y + 1 + 24; // 216
const INNER_W = PANEL.w - 2 - 48; // 424
const SLOT_GAP = 8.932;
const SLOT_H = 167;
const SLOT_W = (INNER_W - SLOT_GAP * 2) / 3; // 135.379
const FOOT_Y = INNER_Y + SLOT_H + 12; // 395
const FOOT_H = LINE * 12 * 2; // two lines of 12px text
const PANEL_H = FOOT_Y + FOOT_H + 24 + 1 - PANEL.y;

// Shipping details (24:1141): 334 wide, right-aligned in the footer.
const DETAILS_W = 334;
const DETAILS = [
  ['Layanan:', 'service'],
  ['SiFoto NGARET:', 'ngaret'],
  ['Berat:', 'weight'],
  ['Ongkir:', 'cost'],
];

function strokeBox(ctx, x, y, w, h, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
}

function textWidth(ctx, text, style) {
  ctx.save();
  ctx.font = style.font;
  const w = ctx.measureText(text).width;
  ctx.restore();
  return w;
}

export default {
  id: 'mokopedia',
  name: 'Mokopedia',
  width: W,
  height: H,
  slots: [0, 1, 2].map((i) => ({ x: INNER_X + i * (SLOT_W + SLOT_GAP), y: INNER_Y, w: SLOT_W, h: SLOT_H })),
  fonts: [brand.font, medium.font, bold.font],
  images: {
    smiley: 'assets/svg/mokopedia-smiley.svg',
    barcode: 'assets/svg/mokopedia-barcode.svg',
    sifoto: 'assets/svg/mokopedia-sifoto.svg',
  },
  fields: [
    { key: 'invoice', label: 'Invoice', default: 'INV/231/FOTO/2/MOKO' },
    { key: 'tracking', label: 'Tracking code', default: 'B2JE-ASX3-ADSV -4K4K' },
    { key: 'service', label: 'Layanan', default: 'Drop Off' },
    { key: 'ngaret', label: 'SiFoto NGARET', default: 'NGARET' },
    { key: 'weight', label: 'Berat', default: 'Banget' },
    { key: 'cost', label: 'Ongkir', default: 'Rp36,000' },
  ],

  draw(ctx, { photos, fields, images }) {
    fillRect(ctx, 0, 0, W, H, '#ffffff');

    // Smiley (24:1063): 280.331 square at -15°, centred in a 343.334 box at (157.33, 278.33).
    drawRotatedImage(ctx, images.smiley, 157.33 + 343.334 / 2, 278.33 + 343.334 / 2, 280.331, 280.331, -15);

    // Label box (24:1068).
    strokeBox(ctx, 4, 4, 474, 482, DARK);

    // Header (24:1069): brand left, invoice right, centred on one row.
    const row = { x: 14, y: 13, w: 451 };
    drawText(ctx, 'Mokopedia', { ...row, h: LINE * 20 }, brand);
    drawText(ctx, fields.invoice, { ...row, y: row.y + (LINE * 20 - LINE * 12) / 2 }, { ...medium, align: 'right' });

    // Tracking code (24:1072).
    strokeBox(ctx, 14, 49, 451, 31, DARK);
    drawText(ctx, fields.tracking, { x: 14, y: 49 + (31 - LINE * 12) / 2, w: 451 }, { ...medium, align: 'center' });

    // Barcode (24:1074).
    if (images.barcode) ctx.drawImage(images.barcode, 21.02, 93.98, 448.999, 82);

    strokeBox(ctx, PANEL.x, PANEL.y, PANEL.w, PANEL_H, '#000000');
    this.slots.forEach((slot, i) => {
      drawCover(ctx, photos[i], slot, { tone: { type: 'luminosity', color: '#000000' } });
      strokeBox(ctx, slot.x, slot.y, slot.w, slot.h, '#000000');
    });

    // Footer (24:1133): logo left, details right, centred on one row.
    if (images.sifoto) ctx.drawImage(images.sifoto, INNER_X, FOOT_Y + (FOOT_H - 24.4189) / 2, 78.0809, 24.4189);

    // Details spread like justify-content: space-between.
    const items = DETAILS.map(([label, key]) => ({
      label,
      value: fields[key],
      w: Math.max(textWidth(ctx, label, medium), textWidth(ctx, fields[key], bold)),
    }));
    const gap = (DETAILS_W - items.reduce((sum, it) => sum + it.w, 0)) / (items.length - 1);
    let x = INNER_X + INNER_W - DETAILS_W;
    for (const it of items) {
      drawText(ctx, it.label, { x, y: FOOT_Y }, medium);
      drawText(ctx, it.value, { x, y: FOOT_Y + LINE * 12 }, bold);
      x += it.w + gap;
    }
  },
};
