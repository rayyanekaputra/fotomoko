<script>
  import { loadFiles, loadSamples } from '../lib/photos.js';

  let { photos = $bindable() } = $props();
  let loadingSamples = $state(false);

  async function onFiles(e) {
    const input = e.currentTarget;
    const files = [...input.files];
    if (!files.length) return;
    photos = await loadFiles(files);
    input.value = '';
  }

  async function useSamples() {
    loadingSamples = true;
    try {
      photos = await loadSamples();
    } finally {
      loadingSamples = false;
    }
  }
</script>

<section>
  <h2>Photos</h2>
  <input type="file" accept="image/*" multiple aria-label="Load photos" onchange={onFiles}>
  <button class="secondary" type="button" disabled={loadingSamples} onclick={useSamples}>Use sample photos</button>
</section>
