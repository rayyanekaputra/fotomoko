<script>
  import { ensureFonts } from '../lib/fonts.js';
  import { loadTemplateImages } from '../lib/assets.js';
  import { renderTo, resolveScale, canvasToBlob, downloadBlob } from '../lib/export.js';
  import { photosForSlots } from '../lib/photos.js';

  let {
    template, photos, fields,
    format = $bindable(), background = $bindable(), scale = $bindable(),
  } = $props();
  let exporting = $state(false);

  const usedScale = $derived(resolveScale(template, format, scale));

  async function download() {
    const t = template;
    const opts = { format, background, scale };
    exporting = true;
    try {
      const [, images] = await Promise.all([ensureFonts(t.fonts), loadTemplateImages(t)]);
      const canvas = document.createElement('canvas');
      renderTo(canvas, t, { photos: photosForSlots(t, photos), fields, images, ...opts });
      const blob = await canvasToBlob(canvas);
      canvas.width = canvas.height = 0; // free memory right away (iOS)
      const suffix = opts.format === 'native' ? '' : `-${opts.format}`;
      downloadBlob(blob, `fotomoko-${t.id}${suffix}-${opts.scale}x.png`);
    } catch (err) {
      console.error(err);
      alert('Export failed. Try a smaller size.');
    } finally {
      exporting = false;
    }
  }
</script>

<section>
  <h2>Export</h2>
  <label class="row">
    <span>Format</span>
    <select bind:value={format}>
      <option value="native">Template only</option>
      <option value="story">Story 9:16</option>
      <option value="square">Square 1:1</option>
    </select>
  </label>
  {#if format !== 'native'}
    <label class="row">
      <span>Background</span>
      <select bind:value={background}>
        <option value="light">Broken white</option>
        <option value="dark">Dark grey</option>
      </select>
    </label>
  {/if}
  <label class="row">
    <span>Size</span>
    <select bind:value={scale}>
      <option value={1}>1×</option>
      <option value={2}>2×</option>
      <option value={3}>3×</option>
      <option value={4}>4×</option>
    </select>
  </label>
  <p id="export-note">
    {#if usedScale < scale}Too big for some phones at {scale}×, so it will export at {usedScale.toFixed(2)}×.{/if}
  </p>
  <button type="button" disabled={exporting} onclick={download}>Download PNG</button>
</section>
