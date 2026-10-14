// Photo palette: the dominant colours of a set of photos, nudged towards the
// lively ones. Pixels are counted on a coarse OKLab (perceptual) grid, look-alike
// cells are merged, then the groups are scored by size × saturation and picked
// so no two look alike. Deterministic: pixel order doesn't matter.

const SAMPLE_EDGE = 64;
const BIN_L = 0.08; // grid cell size in OKLab lightness
const BIN_AB = 0.03; // grid cell size in OKLab a/b
const MERGE_DISTANCE = 0.08; // cells closer than this become one colour
const CHROMA_REF = 0.05; // chroma that doubles a colour's score; vivid ≈ 0.1–0.25, greys < 0.03
const MIN_SHARE = 0.01; // ignore colours covering less than 1% of the pixels
const MIN_DISTANCE = 0.08; // OKLab distance between picked colours

const scratch = document.createElement('canvas');
const scratchCtx = scratch.getContext('2d', { willReadFrequently: true });

// ---- colour conversion ------------------------------------------------------

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function rgbToOklab(r8, g8, b8) {
  const r = toLinear(r8 / 255);
  const g = toLinear(g8 / 255);
  const b = toLinear(b8 / 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function oklabToHex(L, A, B) {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return '#' + rgb
    .map((c) => Math.round(Math.min(1, Math.max(0, toGamma(c))) * 255).toString(16).padStart(2, '0'))
    .join('');
}

// ---- counting ---------------------------------------------------------------

// Grid cells (count + summed OKLab) for every photo, each downscaled to SAMPLE_EDGE.
function countColours(photos) {
  const cells = new Map();
  let total = 0;
  for (const img of photos) {
    const srcW = img.naturalWidth || img.width;
    const srcH = img.naturalHeight || img.height;
    const k = Math.min(1, SAMPLE_EDGE / Math.max(srcW, srcH));
    scratch.width = Math.max(1, Math.round(srcW * k));
    scratch.height = Math.max(1, Math.round(srcH * k));
    scratchCtx.imageSmoothingQuality = 'high'; // average the pixels, not just pick some
    scratchCtx.drawImage(img, 0, 0, scratch.width, scratch.height);
    const px = scratchCtx.getImageData(0, 0, scratch.width, scratch.height).data;
    for (let i = 0; i < px.length; i += 4) {
      if (px[i + 3] < 128) continue;
      const [L, A, B] = rgbToOklab(px[i], px[i + 1], px[i + 2]);
      const key = `${Math.round(L / BIN_L)},${Math.round(A / BIN_AB)},${Math.round(B / BIN_AB)}`;
      let cell = cells.get(key);
      if (!cell) cells.set(key, (cell = { key, count: 0, sum: [0, 0, 0] }));
      cell.count++;
      cell.sum[0] += L;
      cell.sum[1] += A;
      cell.sum[2] += B;
      total++;
    }
  }
  return [...cells.values()].map((c) => ({
    key: c.key,
    lab: c.sum.map((v) => v / c.count),
    share: c.count / total,
  }));
}

// ---- palette ----------------------------------------------------------------

const labDistance = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);

// Biggest cells first; each cell joins the first group it looks like.
function merge(cells) {
  const groups = [];
  const sorted = [...cells].sort((a, b) => b.share - a.share || (a.key < b.key ? -1 : 1));
  for (const c of sorted) {
    const into = groups.find((g) => labDistance(g.lab, c.lab) < MERGE_DISTANCE);
    if (!into) {
      groups.push({ lab: [...c.lab], share: c.share });
      continue;
    }
    const share = into.share + c.share;
    into.lab = into.lab.map((v, j) => (v * into.share + c.lab[j] * c.share) / share);
    into.share = share;
  }
  return groups;
}

function pick(groups, count) {
  const ranked = groups
    .filter((g) => g.share >= MIN_SHARE)
    .map((g) => ({ ...g, score: g.share * (1 + (Math.hypot(g.lab[1], g.lab[2]) / CHROMA_REF) ** 2) }))
    .sort((a, b) => b.score - a.score);
  // Relax the distance rule until there are enough colours.
  for (let minD = MIN_DISTANCE; ; minD /= 2) {
    const chosen = [];
    for (const g of ranked) {
      if (chosen.every((p) => labDistance(p.lab, g.lab) >= minD)) chosen.push(g);
      if (chosen.length === count) break;
    }
    if (chosen.length === count || minD < 1e-4) return chosen;
  }
}

const ids = new WeakMap();
let nextId = 0;
let cache = { key: '', palette: null };

// Hex colours, strongest first. Returns null when there are no photos.
export function extractPalette(photos, count = 4) {
  const unique = [...new Set(photos.filter(Boolean))];
  if (!unique.length) return null;
  const key = count + ':' + unique.map((p) => {
    if (!ids.has(p)) ids.set(p, ++nextId);
    return ids.get(p);
  }).join(',');
  if (cache.key === key) return cache.palette;

  const palette = pick(merge(countColours(unique)), count).map((c) => oklabToHex(...c.lab));
  while (palette.length < count) palette.push(palette[palette.length - 1] ?? '#d9d9d9');
  cache = { key, palette };
  return palette;
}
