<script>
  let { templates, template = $bindable() } = $props();
</script>

<section>
  <h2>Template</h2>
  <select
    aria-label="Template"
    value={template.id}
    onchange={(e) => (template = templates.find((t) => t.id === e.currentTarget.value))}
  >
    {#each templates as t (t.id)}
      <option value={t.id}>{t.name}</option>
    {/each}
  </select>
</section>
