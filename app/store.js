// Progress store: earned trophies and counter values, kept in localStorage.
// Keyed by trophy id so a renamed guide never loses a tick.
export const STORAGE_KEY = 'leonida-legend-v3';

export function loadProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (!raw || typeof raw !== 'object') return { earned: [], counts: {} };
    return {
      earned: Array.isArray(raw.earned) ? raw.earned.filter((n) => Number.isInteger(n)) : [],
      counts: raw.counts && typeof raw.counts === 'object' ? raw.counts : {},
    };
  } catch {
    return { earned: [], counts: {} };
  }
}

export function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function createStore() {
  let progress = loadProgress();
  const listeners = new Set();
  const notify = () => listeners.forEach((fn) => fn(progress));
  return {
    get progress() { return progress; },
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    isEarned(id) { return progress.earned.includes(id); },
    setEarned(id, earned) {
      const set = new Set(progress.earned);
      if (earned) set.add(id); else set.delete(id);
      progress = { ...progress, earned: [...set].sort((a, b) => a - b) };
      saveProgress(progress);
      notify();
    },
    countFor(id) { return progress.counts[id] ?? 0; },
    setCount(id, value, max) {
      const clamped = Math.max(0, Math.min(max, Math.trunc(value) || 0));
      progress = { ...progress, counts: { ...progress.counts, [id]: clamped } };
      saveProgress(progress);
      notify();
    },
    reset() {
      progress = { earned: [], counts: {} };
      saveProgress(progress);
      notify();
    },
    replace(next) {
      progress = {
        earned: Array.isArray(next.earned) ? next.earned.filter((n) => Number.isInteger(n)) : [],
        counts: next.counts && typeof next.counts === 'object' ? next.counts : {},
      };
      saveProgress(progress);
      notify();
    },
  };
}
