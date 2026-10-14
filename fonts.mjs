// Font loading. Templates list the CSS font shorthands they draw with
// (e.g. '700 24px "Bebas Neue"'); we wait for them before drawing so the
// canvas never falls back to a system font. The families themselves are
// requested by the Google Fonts <link> in index.html.

const loaded = new Set();

export async function ensureFonts(fonts = []) {
  const pending = fonts.filter((f) => !loaded.has(f));
  if (!pending.length) return;
  await Promise.all(pending.map(async (f) => {
    try {
      await document.fonts.load(f);
      loaded.add(f);
    } catch (err) {
      console.warn('font failed to load:', f, err);
    }
  }));
}
