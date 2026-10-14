# 002 — Migrate to Svelte

Status: done (2026-10-14). Steps 3 and 4 landed as one commit; all 18 template/format screenshots matched the vanilla app byte for byte.

Goal: same app, same features, same pixels, rebuilt as a Svelte 5 app with a Vite build. It stays fully client-side and deploys as static files to Cloudflare Pages.

## Approach

**Plain Svelte 5 + Vite, not SvelteKit.** fotomoko is one page with no routes, so SvelteKit's router, `adapter-static`, and prerender config add complexity for nothing. If we ever need routes, moving to SvelteKit later is easy.

**Keep the drawing code as-is.** `draw_utils.mjs`, `export.mjs`, `fonts.mjs`, `assets.mjs`, and `templates/*.mjs` are framework-free canvas code. They move into `src/lib/` unchanged except for import paths and asset URLs. The rewrite only touches the UI layer (`index.html` markup/CSS, `main.mjs`, `elements.mjs`).

**JavaScript, not TypeScript.** Keeps the code like it is today. (We can drop `tsconfig.json` and the `@types/bun` / `typescript` leftovers from `bun init`.)

## Target layout

| Path | Role |
| --- | --- |
| `index.html` | Vite entry: `<div id="app">`, Google Fonts `<link>`, `<script type="module" src="/src/main.js">` |
| `src/main.js` | `mount(App, …)` |
| `src/App.svelte` | Layout and state (template, photos, field values, export options). Replaces `main.mjs` + `elements.mjs` |
| `src/components/TemplatePicker.svelte` | Template `<select>` |
| `src/components/PhotoInput.svelte` | File input + "Use sample photos" |
| `src/components/Fields.svelte` | Text inputs generated from `template.fields` |
| `src/components/ExportOptions.svelte` | Format / background / scale + note + Download |
| `src/components/Preview.svelte` | Preview canvas, rAF-throttled render, resize handling |
| `src/lib/photos.js` | `loadImage`, `shrink`, `loadFiles`, sample list (moved out of `main.mjs`) |
| `src/lib/draw_utils.js`, `export.js`, `fonts.js`, `assets.js` | Moved as-is |
| `src/lib/templates/*.js` | Moved as-is |
| `src/app.css` | The inline CSS from today's `index.html` |
| `public/assets/svg/`, `public/assets/photo/` | Static assets, copied verbatim to `dist/` (so runtime paths like `assets/svg/x.svg` keep working) |
| `vite.config.js` | Svelte plugin, `base: './'` |
| `dist/` | Build output (gitignored) |

`.mjs` → `.js` because `package.json` gets `"type": "module"`; optional, but it's the normal Vite convention. I'll keep `.mjs` if you prefer.

## Behaviour to preserve (checked after each step)

- All 6 templates render identically (screenshot compare old vs new with headless Firefox at the same URL).
- Dev shortcuts: `?template=<id>&format=story&bg=dark&samples`.
- Photos downscaled to 2400px on load; repeated across slots.
- Field values remembered per template while switching.
- Export: native/story/square, 1×–4×, iOS size cap note, `toBlob` download, canvas freed after.
- Preview re-renders throttled with `requestAnimationFrame`; stale renders dropped when the template changes mid-load.

## Steps (one commit each)

1. `chore: add vite and svelte` — deps, `vite.config.js`, scripts (`dev`, `build`, `preview`), `.gitignore` (`node_modules`, `dist`, `.tmp`), remove `bun init` leftovers.
2. `refactor: move drawing code into src/lib` — move files, fix paths, move assets to `public/`. The old vanilla UI may be broken between steps 2 and 4; pixels are compared at the end of step 4.
3. `feat: svelte app shell` — `index.html`, `main.js`, `App.svelte`, `app.css`, components.
4. `refactor: remove vanilla ui` — delete `main.mjs`, `elements.mjs`; screenshot-compare all 6 templates (+ story/square, dark bg) against the pre-migration screenshots.
5. `docs: update agents.md and readme for svelte` — new layout table, "no build step" rule replaced, run/build/deploy instructions, Cloudflare Pages section; README rewritten; backlog item removed.

Before step 1 I take baseline screenshots of the current app (all templates × native/story/square) into `.tmp/` for the comparison.

## Deploy (Cloudflare Pages)

- Build command `bun run build`, output dir `dist`.
- Either `bunx wrangler pages deploy dist`, or connect the Git repo in the dashboard. Repo connection needs the code on GitHub/GitLab first, so I'll document both and not set up either (that's outward-facing; you do it).

## What you need to install

Nothing globally. In the project, I'll run (or you can):

```sh
bun add -d vite svelte @sveltejs/vite-plugin-svelte
bun remove @types/bun typescript
```

`wrangler` only if you deploy from the CLI, and `bunx wrangler` fetches it on demand.

## Rules for this migration

- I commit after each step myself (only for this migration), on a new branch `svelte-migration` off `master`. I won't push or merge.
- I work through all steps without stopping for GO between them; you QA at the end.
- AGENTS.md's "no build step / no bundler" constraint is lifted by this plan once you say GO.

## Questions

1. Branch `svelte-migration`, and you merge — OK? Or commit straight to `master`?
2. The uncommitted changes in `AGENTS.md`, `CLAUDE.md`, `backlog.md`: commit them first as `chore: update agent docs and backlog`?
3. `.mjs` → `.js` rename OK?
