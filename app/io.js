// Export / import of tracker progress as a JSON file download.
// Everything is client-side: no server, no network.
import { STORAGE_KEY } from './store.js';

export function exportProgress(progress) {
  const payload = {
    app: 'Leonida Legend 3',
    exportedAt: new Date().toISOString(),
    ...progress,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leonida-legend-3-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function readImportFile(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  if (!data || typeof data !== 'object') throw new Error('Not a progress file.');
  return data;
}

export { STORAGE_KEY };
