# AGENTS.md

Guidance for AI coding agents working on **fotomoko**: a webcam photobooth that runs in the browser.

## Hard constraints

- **Everything runs client-side in the browser.** No backend, no server, no login, no accounts, no pricing, no analytics. Camera frames and photos must never leave the device. Do not add an API route or any dependency that needs a server.
- **It's a static site.** It's deployed as plain files, like its sibling project strukfoto (strukfoto.rayyanekaputra.com).
- **Phones are first-class users.** Assume a mid-range phone with limited memory, a small viewport, touch input, and a slow CPU. iOS Safari must work.
- **No build step.** Plain HTML plus native ES modules (`.mjs`), served as static files. Don't introduce a bundler, framework, or transpiler without asking first.
- Prefer zero runtime dependencies. Don't add CDN scripts. Google Fonts is acceptable for typography.

## Project layout

The project is new. Keep this table up to date as files are added.

| File | Role |
| --- | --- |
| `index.html` | Markup, inline CSS, and the single `<script type="module">` entry point (`main.mjs`) |
| `main.mjs` | App wiring: template picker, photo loading, text fields, preview, download |
| `elements.mjs` | Central DOM lookups (`elements` object). Add new control IDs here |
| `export.mjs` | `renderTo()`: draws a template as native / story 9:16 / square 1:1 at 1×–4×, with the iOS canvas size cap |
| `draw_utils.mjs` | Shared canvas helpers: `drawCover` (crop, zoom, Figma luminosity blend), `drawText` (Figma text boxes incl. cap-trim and rotation), `drawRotatedImage`, round rects, `dates` |
| `fonts.mjs` | `ensureFonts()`: waits for a template's fonts before drawing. Families are loaded by the Google Fonts `<link>` in `index.html` |
| `assets.mjs` | `loadTemplateImages()`: loads and caches the SVGs a template lists in `images` |
| `templates/index.mjs` | `TEMPLATES` list (picker order) |
| `templates/<name>.mjs` | One template each: `{ id, name, width, height, slots, fonts, images, fields, draw(ctx, { photos, fields, images }) }`, all in Figma units. The file header names the Figma frame and node id |
| `templates/ticket_parts.mjs` | Shared boarding-pass pieces (styles, fields, info block) |
| `assets/svg/` | Logos, icons, markers and barcodes exported from Figma |
| `assets/photo/` | Sample photos (loaded only when the user asks) |
| `plans/` | Implementation plans. `backlog.md` holds unscheduled ideas |

Templates are drawn on a canvas in Figma coordinates; `export.mjs` sets the transform for the chosen scale and format, so templates never deal with export sizes. Dev shortcut: `?template=<id>&format=story&bg=dark&samples` opens a template with the sample photos loaded.

Figma source: file `ECge2TwI3tAvp2la9VQgb0` (Fotomoko). When changing a template, pull `get_design_context` for its node and copy the numbers; don't eyeball them.

## Environment and file safety

- **The user's runtime and package manager is Bun.** Use `bun` / `bunx` for anything that needs a JS runtime (serving, one-off scripts, syntax checks). Don't use `node`, `npm`, or `npx`; they aren't installed.
- **Work strictly inside the project working directory.** Never write, create, or delete files outside it. That includes `/tmp`, `~`, browser profile folders, and any scratchpad or system temp directory.
- Put temporary files (screenshots, scratch scripts, browser profiles) in `./.tmp/` inside the project, and delete it when done. Don't commit it.
- Read only from the working directory. If something outside it seems needed, ask the user first.

## Running and testing

- No install needed. Serve the directory statically, e.g. `bunx serve .`, and open it in a browser. ES modules don't load over `file://`.
- **Don't use `bun index.html`.** That's Bun's bundling dev server: it answers every path it didn't bundle with `index.html`, so SVGs and sample photos that templates load at runtime fail ("asset failed to load").
- **`getUserMedia` requires a secure context.** `localhost` works. Testing on a phone over the LAN needs HTTPS (or a tunnel).
- There is no test suite or linter. Verify changes by loading the page, granting camera access, and taking photos. Test at phone width (DevTools device emulation) as well as desktop.

## Conventions

- Vanilla JS, 2-space indent, single quotes, semicolons, `camelCase` identifiers.
- Keep DOM lookups in one place (e.g. an `elements` object) rather than scattered `querySelector` calls.
- Keep `readme.md` in sync when user-facing features change.
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

- **Plan first, then wait for "GO".** For every feature or fix request, start by presenting an implementation plan (what changes, which files, any trade-offs) plus any questions you have. Do not edit code until the user reviews it and replies "GO".
- Ask before adding dependencies, a build step, or changing the client-only architecture.
- Keep changes small and focused; this is a simple tool and should stay simple.
