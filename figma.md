# Figma guide

A map of the Fotomoko Figma file, so agents don't have to rescan it. Read this before calling the Figma MCP. How to use the MCP (cloud server, rate limits, `get_design_context` rules) is in `CLAUDE.md`.

Last synced: 2026-10-16, from one `get_metadata` call on the Frames page.

## File

- File key: `ECge2TwI3tAvp2la9VQgb0` (Fotomoko).
- **Frames** page (`23:162`) holds every template frame, and nothing else. This is the source of truth.
- **Page 1** (`0:1`) holds ~40 reference images and the original `21:*` frames the first 6 templates were built from. Don't query it; it's huge.
- Frame names follow `Frames / <Name>`. The user renames freely; **node ids never change on rename**, so this guide is keyed by id. Copying a frame to another page gives it a new id.

## Looking things up

- Spot new or renamed frames: `get_metadata` on `23:162`. It's ~60 KB, so the tool saves it to a file; list the top-level frames from that file (lines with 2-space indent) instead of reading it whole.
- One frame: `get_metadata` or `get_design_context` on its id from the table below. Never on `0:1`.
- If the user links a node, use the `node-id` from the URL (`23-163` → `23:163`).
- Starter plan rate limits: batch calls, and don't re-fetch numbers that are already in the template code.

## Frames

Sizes are in Figma units and match the template `W`/`H`. Slot sizes are the photo boxes.

| Node | Figma name | Template id | Code | Size | Photos | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `23:550` | Frames / Minimal Strip | `strip-classic` | `strip_classic.js` | 401×1391 | 4 (3:4) | Built (from `21:2`) |
| `23:494` | Frames / Disco | `film` | `film.js` | 400×1391 | 4 (3:4) | Built (from `21:234`) |
| `23:534` | Frames / Ducky | `strip-wide` | `strip_wide.js` | 1064.8×359.73 | 3 (3:4) | Built (from `21:21`) |
| `23:474` | Frames / Floaters | `polaroid` | `polaroid.js` | 1073.07×1404.59 | 3 (3:4) | Built (from `21:274`) |
| `23:373` | Frames / Airplane Ticket | `ticket-wide` | `ticket_wide.js` | 1368×463 | 3 (~1:1) | Built (from `21:37`) |
| `23:277` | Frames / Airplan Ticket Shot | `ticket-tall` | `ticket_tall.js` | 559×1064.06 | 1 | Built (from `21:138`) |
| `23:163` | Frames / Filmy | — | — | 401×1390 | 4 (226.2×329.5) | New, not built |
| `24:1062` | Frames / Mokopedia | — | — | 482×490 | 3 (135.3×167) | New, not built |

The built templates were made from the `21:*` originals on Page 1. The `23:*` copies on the Frames page have the same sizes. If a copy now differs from the code, the user probably changed the design on purpose: ask before changing the template.

## Frame notes

### Built

- **Minimal Strip** (`strip-classic`): white strip, B&W photos, a sideways band with "FOTOMOKO", the date (`11 OCT` / `2026`), a device label (`PIXEL 6A`) and a code string. The 4 colour swatches come from the photos (`src/lib/palette.js`), not from Figma.
- **Disco** (`film`): black film strip, duotone photos, shape markers per frame (`film-markers-1..4.svg`, `film-marker-dot.svg`), sideways yellow text in Khand (`FOTO`, `MOKO`, a code string) and a 3-colour bar on the right.
- **Ducky** (`strip-wide`): yellow strip, 3 B&W photos, a rotated date, "Fotomoko" in Inter, and a big cropped smiley (`smiley-wide.svg`).
- **Floaters** (`polaroid`): cream paper, colour photos in a 2×2 grid with the 4th cell empty, a handwritten name ("Eka Putra, Rayyan"), a big yellow "fotomoko" and smiley stamps (`polaroid-stamp-1/2.svg`).
- **Airplane Ticket** (`ticket-wide`): boarding pass in IBM Plex Mono with a red header, flight fields, a barcode and a smiley watermark. Its SVGs are `ticket-smiley`, `icon-ticket`, `icon-seat`, `ticket-divider`, `icon-takeoff` and `barcode-wide`. The shared parts are in `ticket_parts.js`.
- **Airplan Ticket Shot** (`ticket-tall`): portrait boarding pass with the photo on top and the ticket below. Its SVGs are the `ticket-tall-*` files and `barcode-tall`. **Intentional difference:** the photo's bottom corners are square, while Figma rounds all four. Don't fix this.

### New, not built

These come from structure only; no `get_design_context` has been run on them yet.

- **Filmy** (`23:163`), 401×1390. A film strip:
  - Left: a 286-wide column (`23:169`) with 4 photo slots stacked at x 12 (`23:171`, `23:173`, `23:175`, `23:177`; 226.2×329.5, 16 apart).
  - Next to the photos: a column of 44 sprocket holes (`23:179`; rounded rects 19.8×12.5, 31.46 apart).
  - Right side: a vertical barcode (Union `23:224`), sideways "Fotomoko" text (`23:275`) and a small 42×24 badge at the top (`23:276`).
  - A big smiley (Union `23:164`, 343×343) overflows the bottom right and gets cropped.
- **Mokopedia** (`24:1062`), 482×490. A parcel-shipping-label parody:
  - Header (`24:1068`): "Mokopedia" and an invoice `INV/231/FOTO/2/MOKO`, then a tracking code `B2JE-ASX3-ADSV -4K4K`.
  - A wide barcode (Union `24:1074`, 449×82).
  - A panel (`24:1125`) with 3 photo slots side by side (`24:1127`, `24:1129`, `24:1131`; 135.3×167, about 4:5).
  - Footer: a "SIFOTO" logo (`24:1134`) and 4 detail texts (`Layanan: Drop Off`, `SiFoto NGARET: NGARET`, `Berat: Banget`, `Ongkir: Rp36,000`). These are likely editable `fields`.
  - A smiley watermark (Union `24:1063`) that overflows the bottom.

## Keeping this file current

- Whenever you pull Figma data for a frame, update its row and notes in the same change.
- When the user adds or renames frames, do one `get_metadata` on `23:162`, compare its top-level frames with the table, and update only the rows that changed.
- When a new frame is built, fill in its template id and code file, and add it to `TEMPLATES`.
- Update "Last synced" at the top.
