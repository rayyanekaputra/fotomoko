import { elements } from './elements.mjs';
import { TEMPLATES } from './templates/index.mjs';
import { ensureFonts } from './fonts.mjs';
import { loadTemplateImages } from './assets.mjs';
import { renderTo, resolveScale, canvasToBlob, downloadBlob } from './export.mjs';

const SAMPLES = [
  'assets/photo/PXL_20261011_104010409.jpg.jpeg',
  'assets/photo/PXL_20261011_104012242.jpg.jpeg',
  'assets/photo/PXL_20261011_104014157.jpg.jpeg',
  'assets/photo/PXL_20261011_104015738.jpg.jpeg',
];

// Photos are downscaled once on load so we never keep full camera
// resolution around (12MP+ photos are heavy on phones).
const MAX_PHOTO_EDGE = 2400;

const state = {
  template: TEMPLATES[0],
  photos: [],
  fieldValues: {}, // { [templateId]: { [key]: value } }
};

// ---- photos ---------------------------------------------------------------

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${src}`));
    img.src = src;
  });
}

function shrink(img) {
  const k = Math.min(1, MAX_PHOTO_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement('canvas');
  c.width = Math.round(img.naturalWidth * k);
  c.height = Math.round(img.naturalHeight * k);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return c;
}

async function loadFiles(files) {
  const photos = [];
  for (const file of files) {
    const url = URL.createObjectURL(file);
    try {
      photos.push(shrink(await loadImage(url)));
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  return photos;
}

elements.photoInput.addEventListener('change', async () => {
  const files = [...elements.photoInput.files];
  if (!files.length) return;
  state.photos = await loadFiles(files);
  elements.photoInput.value = '';
  scheduleRender();
});

elements.sampleBtn.addEventListener('click', async () => {
  elements.sampleBtn.disabled = true;
  try {
    state.photos = await Promise.all(SAMPLES.map(async (src) => shrink(await loadImage(src))));
    scheduleRender();
  } finally {
    elements.sampleBtn.disabled = false;
  }
});

// Fill every slot, repeating photos if there are fewer photos than slots.
function photosForSlots(template) {
  const n = template.slots.length;
  if (!state.photos.length) return new Array(n).fill(null);
  return Array.from({ length: n }, (_, i) => state.photos[i % state.photos.length]);
}

// ---- fields ---------------------------------------------------------------

function fieldsFor(template) {
  const saved = state.fieldValues[template.id] || {};
  const out = {};
  for (const f of template.fields) out[f.key] = saved[f.key] ?? f.default;
  return out;
}

function buildFieldInputs() {
  const t = state.template;
  const values = fieldsFor(t);
  elements.fields.replaceChildren(...t.fields.map((f) => {
    const label = document.createElement('label');
    label.className = 'row';
    const span = document.createElement('span');
    span.textContent = f.label;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = values[f.key];
    input.addEventListener('input', () => {
      state.fieldValues[t.id] = { ...state.fieldValues[t.id], [f.key]: input.value };
      scheduleRender();
    });
    label.append(span, input);
    return label;
  }));
}

// ---- template picker -------------------------------------------------------

elements.templateSelect.replaceChildren(...TEMPLATES.map((t) => new Option(t.name, t.id)));
elements.templateSelect.addEventListener('change', () => {
  state.template = TEMPLATES.find((t) => t.id === elements.templateSelect.value);
  buildFieldInputs();
  scheduleRender();
});

// ---- export options -------------------------------------------------------

function exportOptions() {
  return {
    format: elements.formatSelect.value,
    background: elements.backgroundSelect.value,
    scale: Number(elements.scaleSelect.value),
  };
}

function updateExportNote() {
  const { format, scale } = exportOptions();
  elements.backgroundRow.hidden = format === 'native';
  const used = resolveScale(state.template, format, scale);
  elements.exportNote.textContent = used < scale
    ? `Too big for some phones at ${scale}×, so it will export at ${used.toFixed(2)}×.`
    : '';
}

for (const el of [elements.formatSelect, elements.backgroundSelect, elements.scaleSelect]) {
  el.addEventListener('change', scheduleRender);
}

// ---- preview ----------------------------------------------------------------

let frame = 0;
function scheduleRender() {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(render);
}

async function render() {
  const t = state.template;
  const [, images] = await Promise.all([ensureFonts(t.fonts), loadTemplateImages(t)]);
  if (t !== state.template) return; // template changed while loading

  updateExportNote();
  const { format, background } = exportOptions();

  // Preview resolution: fit the wrapper, times devicePixelRatio, capped.
  const box = elements.previewWrap.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const base = format === 'native' ? { w: t.width, h: t.height } : format === 'story' ? { w: 1080, h: 1920 } : { w: 1080, h: 1080 };
  const fit = Math.min(box.width / base.w, box.height / base.h);
  const scale = Math.max(0.1, fit * dpr);

  renderTo(elements.preview, t, { photos: photosForSlots(t), fields: fieldsFor(t), images, format, background, scale });
  elements.preview.style.width = `${Math.floor(base.w * fit)}px`;
  elements.preview.style.height = `${Math.floor(base.h * fit)}px`;
}

window.addEventListener('resize', scheduleRender);

// ---- download -------------------------------------------------------------

elements.downloadBtn.addEventListener('click', async () => {
  const t = state.template;
  const opts = exportOptions();
  elements.downloadBtn.disabled = true;
  try {
    const [, images] = await Promise.all([ensureFonts(t.fonts), loadTemplateImages(t)]);
    const canvas = document.createElement('canvas');
    renderTo(canvas, t, { photos: photosForSlots(t), fields: fieldsFor(t), images, ...opts });
    const blob = await canvasToBlob(canvas);
    canvas.width = canvas.height = 0; // free memory right away (iOS)
    const suffix = opts.format === 'native' ? '' : `-${opts.format}`;
    downloadBlob(blob, `fotomoko-${t.id}${suffix}-${opts.scale}x.png`);
  } catch (err) {
    console.error(err);
    alert('Export failed. Try a smaller size.');
  } finally {
    elements.downloadBtn.disabled = false;
  }
});

// ---- start ----------------------------------------------------------------

// Dev shortcuts for checking templates: ?template=<id>&format=story&bg=dark&samples
const params = new URLSearchParams(location.search);
if (params.get('format')) elements.formatSelect.value = params.get('format');
if (params.get('bg')) elements.backgroundSelect.value = params.get('bg');
const startTemplate = TEMPLATES.find((t) => t.id === params.get('template'));
if (startTemplate) {
  state.template = startTemplate;
  elements.templateSelect.value = startTemplate.id;
}

buildFieldInputs();
scheduleRender();
if (params.has('samples')) elements.sampleBtn.click();
