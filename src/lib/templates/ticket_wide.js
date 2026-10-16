// Airplane Ticket (Figma 23:373, originally 21:37): landscape boarding pass. Red header, 3 photos,
// flight details on the right, barcode and a faint smiley watermark.

import { drawCover, drawText, drawRotatedImage, fillRect, roundRectPath } from '../draw_utils.js';
import { RED, styles, TICKET_FONTS, TICKET_FIELDS, drawTicketInfo } from './ticket_parts.js';

const W = 1368;
const H = 463;
const RADIUS = 24;
const SLOT_W = 288;
const SLOT_H = 299;

export default {
  id: 'ticket-wide',
  name: 'Boarding pass (wide)',
  width: W,
  height: H,
  radius: RADIUS, // rounded card; the story/square shadow follows it
  slots: [0, 1, 2].map((i) => ({ x: 16 + i * (SLOT_W + 16), y: 103, w: SLOT_W, h: SLOT_H })),
  fonts: [...TICKET_FONTS, '700 52.645px "IBM Plex Mono"'],
  images: {
    smiley: 'assets/svg/ticket-smiley.svg',
    ticket: 'assets/svg/icon-ticket.svg',
    seat: 'assets/svg/icon-seat.svg',
    divider: 'assets/svg/ticket-divider.svg',
    takeoff: 'assets/svg/icon-takeoff.svg',
    barcode: 'assets/svg/barcode-wide.svg',
  },
  fields: TICKET_FIELDS,

  draw(ctx, { photos, fields, images }) {
    // Rounded card.
    roundRectPath(ctx, 0, 0, W, H, RADIUS);
    ctx.clip();
    fillRect(ctx, 0, 0, W, H, '#ffffff');

    const box = 331.674;
    drawRotatedImage(ctx, images.smiley, 1085 + box / 2, -4 + box / 2, 280.331, 280.331, -11.78);

    // Header.
    fillRect(ctx, 0, 0, W, 80, RED);
    drawText(ctx, fields.title, { x: 16, y: 21 }, styles.title(52.645));
    drawText(ctx, fields.subtitle, { x: 954, y: 30 }, styles.subtitle(32));
    if (images.ticket) ctx.drawImage(images.ticket, 826, 13, 53, 53);
    if (images.seat) ctx.drawImage(images.seat, 1308, 26, 32, 32);
    if (images.divider) ctx.drawImage(images.divider, 930, 12, 4, 57);

    // Photo overflows its slot in Figma (359×477 in 288×299).
    const zoom = 477 / (SLOT_W * (4 / 3));
    this.slots.forEach((slot, i) => drawCover(ctx, photos[i], slot, { zoom }));

    drawTicketInfo(ctx, 954, 135, fields, images);

    drawText(ctx, fields.note, { x: 16, y: 425 }, styles.note);
    if (images.barcode) ctx.drawImage(images.barcode, 954.04, 421, 391, 42);
  },
};
