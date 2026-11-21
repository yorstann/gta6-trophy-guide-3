// Filter state and matching for the trophy list.
// Kind chips: all, story, missable, collectibles, activities, online.
// Effort chips: all, Quick, Moderate, Grind. Grade select + text search.
export const KIND_LABELS = {
  story: 'Story',
  collectibles: 'Collectibles',
  activities: 'Activities',
  freeroam: 'Freeroam',
  progress: 'Progress',
};

export function defaultFilters() {
  return { kind: 'all', effort: 'all', grade: 'all', query: '' };
}

export function trophyMatches(t, filters) {
  if (filters.kind === 'missable' && !t.missable) return false;
  if (filters.kind === 'online') return false; // the PS5 list has no online trophies
  if (filters.kind !== 'all' && filters.kind !== 'missable' && t.kind !== filters.kind) return false;
  if (filters.effort !== 'all' && t.effort !== filters.effort) return false;
  if (filters.grade !== 'all' && t.grade !== filters.grade) return false;
  if (filters.query) {
    const q = filters.query.toLowerCase();
    const hay = `${t.name} ${t.description} ${t.guide ?? ''}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

export function filterTrophies(trophies, filters) {
  return trophies.filter((t) => trophyMatches(t, filters));
}
