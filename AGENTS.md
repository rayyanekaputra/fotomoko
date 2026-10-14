# AGENTS.md

Guidance for AI coding agents working on **fotomoko**: a webcam photobooth that runs in the browser.

## Hard constraints

- **Everything runs client-side in the browser.** No backend, no server, no login, no accounts, no pricing, no analytics. Camera frames and photos must never leave the device. Do not add an API route or any dependency that needs a server.
- **It's a static site.** It's deployed as plain files, like its sibling project strukfoto (strukfoto.rayyanekaputra.com).
- **Phones are first-class users.** Assume a mid-range phone with limited memory, a small viewport, touch input, and a slow CPU. iOS Safari must work.
- **Svelte 5 + Vite, plain JavaScript.** `bun run build` writes static files to `dist/`. No SvelteKit, no TypeScript, no other framework or transpiler without asking first.
- Prefer zero runtime dependencies (Svelte compiles away). Don't add CDN scripts. Google Fonts is acceptable for typography.

## Project layout

Keep this table up to date as files are added.

| File | Role |
| --- | --- |
| `index.html` | Vite entry: Google Fonts `<link>` and `<script type="module" src="/src/main.js">` |
| `vite.config.js` | Svelte plugin, `base: './'` so `dist/` works from any path |
| `src/main.js` | Mounts `App` into `<body>` and imports `app.css` |
| `src/app.css` | Global styles (the body grid: `<aside>` controls, `<main>` preview) |
| `src/App.svelte` | App state (template, photos, per-template field values, export options) and layout. Handles the dev URL params |
| `src/components/TemplatePicker.svelte` | Template `<select>` |
| `src/components/PhotoInput.svelte` | File input and "Use sample photos" |
| `src/components/Fields.svelte` | Text inputs built from `template.fields` |
| `src/components/ExportOptions.svelte` | Format / background / size, size-cap note, PNG download |
| `src/components/Preview.svelte` | Preview canvas; re-renders once per animation frame on changes and on resize |
| `src/lib/photos.js` | Photo loading (downscaled to 2400px), sample list, `photosForSlots` |
| `src/lib/export.js` | `renderTo()`: draws a template as native / story 9:16 / square 1:1 at 1×–4×, with the iOS canvas size cap. Story/square add the background (light/dark/transparent), template size (`ZOOMS`) and a soft 0-offset shadow |
| `src/lib/draw_utils.js` | Shared canvas helpers: `drawCover` (crop, zoom, Figma luminosity blend), `drawText` (Figma text boxes incl. cap-trim and rotation), `drawRotatedImage`, round rects, `dates` |
| `src/lib/fonts.js` | `ensureFonts()`: waits for a template's fonts before drawing. Families are loaded by the Google Fonts `<link>` in `index.html` |
| `src/lib/assets.js` | `loadTemplateImages()`: loads and caches the SVGs a template lists in `images` |
| `src/lib/templates/index.js` | `TEMPLATES` list (picker order) |
| `src/lib/templates/<name>.js` | One template each: `{ id, name, width, height, radius?, slots, fonts, images, fields, draw(ctx, { photos, fields, images }) }`, all in Figma units. `radius` (rounded card corners) shapes the story/square shadow. The file header names the Figma frame and node id |
| `src/lib/templates/ticket_parts.js` | Shared boarding-pass pieces (styles, fields, info block) |
| `public/assets/svg/` | Logos, icons, markers and barcodes exported from Figma. Served as-is at `assets/svg/...` |
| `public/assets/photo/` | Sample photos, loaded only when the user asks. They get deployed, so keep them free of EXIF/GPS metadata |
| `dist/` | Build output (gitignored) |
| `plans/` | Implementation plans (`001-templates.md` = the 6 templates, `002-svelte-migration.md`) |
| `backlog.md` | Unscheduled ideas (photo filters, capture aspect, camera, share, PWA) |

`src/lib/` is framework-free canvas code; keep it that way so the drawing stays testable and portable. Templates are drawn on a canvas in Figma coordinates; `export.js` sets the transform for the chosen scale and format, so templates never deal with export sizes. Dev shortcut: `?template=<id>&format=story&bg=dark&samples` opens a template with the sample photos loaded.

Adding a template: create `src/lib/templates/<name>.js`, add it to `TEMPLATES`, add any new Google Font family to the `<link>` in `index.html`, and put its SVGs in `public/assets/svg/` (referenced as `assets/svg/<file>.svg`). Text that users can change goes in `fields` (the UI builds inputs from it automatically); defaults are placeholders.

Figma source: file `ECge2TwI3tAvp2la9VQgb0` (Fotomoko). When changing a template, pull the design data for its node and copy the numbers; don't eyeball them.

| Template id | Figma frame | Node |
| --- | --- | --- |
| `strip-classic` | Frame 39 | `21:2` |
| `film` | Frame 43 | `21:234` |
| `strip-wide` | Frame 40 | `21:21` |
| `polaroid` | Frame 44 | `21:274` |
| `ticket-wide` | Frame 41 | `21:37` |
| `ticket-tall` | Frame 42 | `21:138` |

Intentional differences from Figma (don't "fix" them back):
- `ticket-tall`: the photo's bottom corners are square (Figma rounds all four). The user asked for this.

## Current status (2026-10-14)

- Done: migrated to Svelte 5 + Vite (`plans/002-svelte-migration.md`), output pixel-identical to the vanilla version.
- Done: all 6 templates, export (native / story / square, 1×–4×, light/dark background), editable text fields, sample photos. See `plans/001-templates.md`.
- Done: canvas fixes. Story/square now have a soft 0-offset shadow, a transparent background option and an S/M/L/XL template-size slider. The default export size is 2× (labelled recommended). Checked in headless Firefox screenshots only; PNG download and the slider in a real browser are untested.
- The current UI is a dev test bench for the canvas (templates, filters later). The real UI will be designed in Figma later; see `backlog.md`. The sample photos (the user's own) stay in `public/` as deployed placeholders.
- Waiting: the user's QA of the templates and the Svelte UI. Not yet tested after the migration: PNG download, loading photos through the file picker, typing in text fields, and a real phone (only one phone-width screenshot was checked).
- The built app loads much faster than the old unbundled `.mjs` setup (one bundled file instead of a chain of module requests). Canvas drawing cost is unchanged.
- Not started: camera capture, photo filters, share sheet, PWA (see `backlog.md`).
- Git repo on `master`, not pushed anywhere yet. Ask before committing code or pushing. Exception: agents may commit changes to `AGENTS.md`, `CLAUDE.md` and `backlog.md` themselves, without asking. Keep those commits to just those files, and use `docs:` messages.
- Deploy target: Cloudflare Pages (static, `dist/`). Not set up yet; see `README.md`.

## Environment and file safety

- **The user's runtime and package manager is Bun.** Use `bun` / `bunx` for anything that needs a JS runtime (serving, one-off scripts, syntax checks). Don't use `node`, `npm`, or `npx`; they aren't installed.
- **Work strictly inside the project working directory.** Never write, create, or delete files outside it. That includes `/tmp`, `~`, browser profile folders, and any scratchpad or system temp directory.
- Put temporary files (screenshots, scratch scripts, browser profiles) in `./.tmp/` inside the project, and delete it when done. Don't commit it.
- Read only from the working directory. If something outside it seems needed, ask the user first.

## Running and testing

- `bun install`, then `bun run dev` (Vite dev server with hot reload). `bun run build` builds to `dist/`; `bun run preview` serves the build.
- Don't serve the repo root with a plain static server any more: `index.html` points at `/src/main.js`, which only Vite understands. Don't use `bun index.html` either.
- **`getUserMedia` requires a secure context.** `localhost` works. Testing on a phone over the LAN needs HTTPS (or a tunnel).
- There is no test suite or linter. `bun run build` is the check: it fails on syntax and Svelte compile errors. Verify changes by loading the page (and later, granting camera access and taking photos). Test at phone width (DevTools device emulation) as well as desktop.
- Headless check: `firefox --headless --no-remote --profile "$PWD/.tmp/ff" --window-size=1600,1400 --screenshot "$PWD/.tmp/out.png" "http://localhost:<port>/?template=<id>&samples"`, using absolute paths. It screenshots at the page's `load` event, so without `&samples` the canvas may not have rendered yet. Firefox is the only browser installed; Chrome and Safari are untested.
- If you start a server in the background, stop it with `kill $(lsof -t -i:<port>)`. Don't use `pkill -f` with a pattern that also matches your own shell command.

## Conventions

- JavaScript (no TypeScript), Svelte 5 runes (`$state`, `$derived`, `$props`, `$effect`), 2-space indent, single quotes, semicolons, `camelCase` identifiers.
- No `querySelector`; use Svelte bindings (`bind:this`, `bind:value`). Keep components small and drawing logic in `src/lib/`.
- Keep `README.md` in sync when user-facing features change.
- Commit messages follow a conventional style (`chore:`, `feat:`, `fix:`, `refactor:`), lowercase.

## Camera and performance (important for mobile)

- Request the camera only after a user gesture, and handle denial, missing cameras, and `NotReadableError` (camera in use) with a clear message.
- Stop all `MediaStream` tracks when the camera isn't needed (page hidden, after the session, on teardown).
- Use `playsinline` and `muted` on the `<video>` element. iOS needs them.
- The front-camera preview is usually mirrored. Decide explicitly whether captured output is mirrored, and keep it consistent.
- Capture frames by drawing the video into a canvas. Don't run per-pixel work at full sensor resolution; downscale to the output size first.
- Avoid heavy work on every frame or `input` event without throttling (`requestAnimationFrame` or debouncing).
- Reuse canvases rather than creating new ones per capture. iOS Safari enforces canvas size and memory limits.
- Prefer `canvas.toBlob` over `toDataURL` for exports, and release object URLs (`URL.revokeObjectURL`) when done.

## Privacy

- Do not log, store, or transmit image data. No `localStorage`/IndexedDB of photos unless the user explicitly asks for it. No third-party embeds.
- Keep the app working offline once loaded where practical.

## Working with the user

- **Plan first, then wait for "GO".** For every feature request, start by presenting an implementation plan (what changes, which files, any trade-offs) plus any questions you have. Do not edit code until the user reviews it and replies "GO". Small, clearly specified fixes (e.g. "unround the bottom corners") can be done directly. If the user says to work through a batch until it's done, don't stop for GO between items; they'll QA at the end.
- Stay within the current focus the user sets. Put unrelated ideas in `backlog.md` instead of building them.
- Ask before adding dependencies or changing the client-only architecture.
- Keep changes small and focused; this is a simple tool and should stay simple.
