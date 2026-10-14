// Central DOM lookups. Add new control IDs here.

const $ = (id) => document.getElementById(id);

export const elements = {
  templateSelect: $('template-select'),
  photoInput: $('photo-input'),
  sampleBtn: $('sample-btn'),
  fields: $('fields'),
  formatSelect: $('format-select'),
  backgroundSelect: $('background-select'),
  backgroundRow: $('background-row'),
  scaleSelect: $('scale-select'),
  downloadBtn: $('download-btn'),
  exportNote: $('export-note'),
  preview: $('preview'),
  previewWrap: $('preview-wrap'),
};
