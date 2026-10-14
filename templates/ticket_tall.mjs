// Frame 42 (Figma 21:138): portrait boarding pass. One photo on top, red
// header, flight details, barcode and a faint smiley watermark.

import { drawCover, drawText, drawRotatedImage, fillRect, roundRectPath } from '../draw_utils.mjs';
import { RED, styles, TICKET_FONTS, TICKET_FIELDS, drawTicketInfo } from './ticket_parts.mjs';

const W = 559;
const H = 1064.062;
const PHOTO_H = 580.351;
const HEADER_H = 93; // 24 padding + 45 icon + 24 padding
const BODY_Y = PHOTO_H + HEADER_H;
const PAD = 24;

export default {
  id: 'ticket-tall',
  name: 'Boarding pass (tall)',
  width: W,
  height: H,
  slots: [{ x: 0, y: 0, w: W, h: PHOTO_H }],
  fonts: TICKET_FONTS,
  images: {
    smiley: 'assets/svg/ticket-tall-smiley.svg',
    ticket: 'assets/svg/ticket-tall-icon-ticket.svg',
    takeoff: 'assets/svg/ticket-tall-takeoff.svg',
    barcode: 'assets/svg/barcode-tall.svg',
  },
  fields: TICKET_FIELDS,

  draw(ctx, { photos, fields, images }) {
    // Rounded card. The photo has its own rounded corners on top of the panel.
    roundRectPath(ctx, 0, 0, W, H, 24);
    ctx.clip();

    // Photo overflows its slot in Figma (577×768 in 559×580).
    const zoom = 768.084 / (W * (4 / 3));
    drawCover(ctx, photos[0], this.slots[0], { zoom, radius: 24 });

    // Header.
    fillRect(ctx, 0, PHOTO_H, W, HEADER_H, RED);
    drawText(ctx, fields.title, { x: PAD, y: PHOTO_H + PAD }, styles.title(28));
    drawText(ctx, fields.subtitle, { x: PAD, y: PHOTO_H + PAD + 28 * 0.698 + 10 }, styles.subtitle(18));
    if (images.ticket) ctx.drawImage(images.ticket, W - PAD - 45, PHOTO_H + PAD, 45, 45);

    // Body, clipped so the smiley watermark doesn't spill into the header.
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, BODY_Y, W, H - BODY_Y);
    ctx.clip();
    fillRect(ctx, 0, BODY_Y, W, H - BODY_Y, '#ffffff');
    const box = 331.674;
    drawRotatedImage(ctx, images.smiley, 321 + box / 2, BODY_Y - 109.35 + box / 2, 280.331, 280.331, -11.78);

    const infoH = drawTicketInfo(ctx, PAD, BODY_Y + PAD, fields, images);
    const barcodeY = BODY_Y + PAD + infoH + PAD;
    if (images.barcode) ctx.drawImage(images.barcode, PAD, barcodeY, 511, 49.711);
    drawText(ctx, fields.note, { x: PAD, y: barcodeY + 49.711 + PAD }, styles.note);
    ctx.restore();
  },
};
