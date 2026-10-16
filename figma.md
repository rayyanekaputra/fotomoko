# Figma guide

A map of the Fotomoko Figma file, so agents don't have to rescan it. Read this before calling the Figma MCP. How to use the MCP (cloud server, rate limits, `get_design_context` rules) is in `CLAUDE.md`.

Last synced: 2026-10-16, from one `get_metadata` call on the Frames page (9 frames), then `get_design_context` on the 3 new frames.

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
| `23:277` | Frames / Airplane Ticket Shot | `ticket-tall` | `ticket_tall.js` | 559×1064.06 | 1 | Built (from `21:138`) |
| `23:163` | Frames / Filmy | `filmy` | `filmy.js` | 401×1390 | 4 (226.2×329.5) | Built |
| `24:1062` | Frames / Mokopedia | `mokopedia` | `mokopedia.js` | 482×490 | 3 (135.4×167) | Built |
| `24:1403` | Frames / LINES | `lines` | `lines.js` | 401×1390 | 4 (228×347.5) | Built |

The first 6 templates were made from the `21:*` originals on Page 1; Filmy, Mokopedia and LINES straight from the Frames page. The `23:*` copies on the Frames page have the same sizes. If a copy now differs from the code, the user probably changed the design on purpose: ask before changing the template.

## Frame notes

### Built

- **Minimal Strip** (`strip-classic`): white strip, B&W photos, a sideways band with "FOTOMOKO", the date (`11 OCT` / `2026`), a device label (`PIXEL 6A`) and a code string. The 4 colour swatches come from the photos (`src/lib/palette.js`), not from Figma.
- **Disco** (`film`): black film strip, duotone photos, shape markers per frame (`film-markers-1..4.svg`, `film-marker-dot.svg`), sideways yellow text in Khand (`FOTO`, `MOKO`, a code string) and a 3-colour bar on the right.
- **Ducky** (`strip-wide`): yellow strip, 3 B&W photos, a rotated date, "Fotomoko" in Inter, and a big cropped smiley (`smiley-wide.svg`).
- **Floaters** (`polaroid`): cream paper, colour photos in a 2×2 grid with the 4th cell empty, a handwritten name ("Eka Putra, Rayyan"), a big yellow "fotomoko" and smiley stamps (`polaroid-stamp-1/2.svg`).
- **Airplane Ticket** (`ticket-wide`): boarding pass in IBM Plex Mono with a red header, flight fields, a barcode and a smiley watermark. Its SVGs are `ticket-smiley`, `icon-ticket`, `icon-seat`, `ticket-divider`, `icon-takeoff` and `barcode-wide`. The shared parts are in `ticket_parts.js`.
- **Airplane Ticket Shot** (`ticket-tall`): portrait boarding pass with the photo on top and the ticket below. Its SVGs are the `ticket-tall-*` files and `barcode-tall`. **Intentional difference:** the photo's bottom corners are square, while Figma rounds all four. Don't fix this.

- **Filmy** (`filmy`): white card, a `#212121` film column (286 wide, padding 12) with 4 B&W photos and 44 white sprocket holes, a sideways barcode (`filmy-barcode.svg`), sideways "Fotomoko" in Koulen (editable), and a faint smiley (`filmy-smiley.svg`, 5% opacity in the SVG) cropped at the bottom right.
- **Mokopedia** (`mokopedia`): shipping-label parody in Inter (500/700). Outlined box, yellow "Mokopedia", invoice and boxed tracking code, a wide barcode (`mokopedia-barcode.svg`), 3 B&W photos with 1px borders, the SIFOTO logo (`mokopedia-sifoto.svg`) and 4 details (labels fixed, values editable), over a yellow smiley (`mokopedia-smiley.svg`).
- **LINES** (`lines`): orange `#ff9500`, 4 B&W photos edge to edge in the middle, two 86.5-wide side bands with sideways "FOTOMOKO" (Momo Trust Display), "#FOTODULS" and time + "WITA" (Momo Trust Sans), spread like `justify-between`. The time defaults to the browser's local time; the zone stays "WITA" on purpose (the user's city). Smileys: `lines-smiley-1.svg` under the left band's text and the photos, `lines-smiley-2.svg` on top of the right band and the photos.
- **Skipped on purpose:** the empty 42×24 box at the top of Filmy and LINES (`23:276`, `24:1404`) is a leftover, not part of the design.

## Keeping this file current

- Whenever you pull Figma data for a frame, update its row and notes in the same change.
- When the user adds or renames frames, do one `get_metadata` on `23:162`, compare its top-level frames with the table, and update only the rows that changed.
- When a new frame is built, fill in its template id and code file, and add it to `TEMPLATES`.
- Update "Last synced" at the top.
