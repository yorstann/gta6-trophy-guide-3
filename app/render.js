// List view: medal icons, trophy rows, per-kind stats, filter chips.
// Medals are small inline SVGs drawn here — no external images.
import { KIND_LABELS, filterTrophies } from './filters.js';

export function medalSvg(grade) {
  const shapes = {
    platinum: '<circle cx="12" cy="12" r="10" fill="#b8f0e8"/><circle cx="12" cy="12" r="6.5" fill="none" stroke="#0f3a35" stroke-width="1.6"/><path d="M12 7.5l1.4 2.9 3.1.4-2.3 2.2.6 3.1-2.8-1.5-2.8 1.5.6-3.1-2.3-2.2 3.1-.4z" fill="#0f3a35"/>',
    gold: '<circle cx="12" cy="12" r="10" fill="#f5c542"/><circle cx="12" cy="12" r="6.5" fill="none" stroke="#6b4d00" stroke-width="1.6"/><text x="12" y="16" text-anchor="middle" font-size="9" font-weight="700" fill="#6b4d00">1</text>',
    silver: '<circle cx="12" cy="12" r="10" fill="#cfd6dd"/><circle cx="12" cy="12" r="6.5" fill="none" stroke="#4a5560" stroke-width="1.6"/><text x="12" y="16" text-anchor="middle" font-size="9" font-weight="700" fill="#4a5560">2</text>',
    bronze: '<circle cx="12" cy="12" r="10" fill="#d08a4e"/><circle cx="12" cy="12" r="6.5" fill="none" stroke="#5a2f0e" stroke-width="1.6"/><text x="12" y="16" text-anchor="middle" font-size="9" font-weight="700" fill="#5a2f0e">3</text>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${shapes[grade] ?? shapes.bronze}</svg>`;
}

export function medalBadge(grade) {
  const label = grade[0].toUpperCase() + grade.slice(1);
  return `<span class="medal ${grade}">${medalSvg(grade)}${label}</span>`;
}

export function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

// A hidden trophy stays masked while the spoiler shield is on and it is unearned.
export function isMasked(trophy, shieldOn, store) {
  return shieldOn && trophy.hidden && !store.isEarned(trophy.id);
}

export function displayName(trophy, shieldOn, store) {
  return isMasked(trophy, shieldOn, store) ? 'Hidden trophy — earn it to reveal' : trophy.name;
}

export function displayDescription(trophy, shieldOn, store) {
  return isMasked(trophy, shieldOn, store)
    ? 'This trophy is hidden on PlayStation until you earn it.'
    : trophy.description;
}

function chipButton(label, pressed, onClick) {
  const b = el('button', 'chip');
  b.type = 'button';
  b.textContent = label;
  b.setAttribute('aria-pressed', String(pressed));
  b.addEventListener('click', onClick);
  return b;
}

export function renderKindStats(container, trophies, store) {
  container.replaceChildren();
  for (const [kind, label] of Object.entries(KIND_LABELS)) {
    const members = trophies.filter((t) => t.kind === kind);
    const earned = members.filter((t) => store.isEarned(t.id)).length;
    const pct = members.length ? Math.round((earned / members.length) * 100) : 0;
    const box = el('div', 'kind-stat');
    box.append(el('b', null, label));
    box.append(el('span', null, `${earned}/${members.length}`));
    const bar = el('div', 'mini-bar');
    const fill = el('i');
    fill.style.width = `${pct}%`;
    bar.append(fill);
    box.append(bar);
    container.append(box);
  }
}

function counterStepper(trophy, store) {
  const wrap = el('span', 'stepper');
  const minus = el('button', null, '−');
  minus.type = 'button';
  minus.setAttribute('aria-label', `Decrease ${trophy.name} count`);
  const out = document.createElement('output');
  const plus = el('button', null, '+');
  plus.type = 'button';
  plus.setAttribute('aria-label', `Increase ${trophy.name} count`);
  const paint = () => {
    out.textContent = `${store.countFor(trophy.id)} / ${trophy.count.toLocaleString()}`;
  };
  minus.addEventListener('click', () => { store.setCount(trophy.id, store.countFor(trophy.id) - 1, trophy.count); paint(); });
  plus.addEventListener('click', () => { store.setCount(trophy.id, store.countFor(trophy.id) + 1, trophy.count); paint(); });
  paint();
  wrap.append(minus, out, plus);
  return wrap;
}

export function trophyRow(trophy, shieldOn, store, onRerender) {
  const earned = store.isEarned(trophy.id);
  const li = el('li', `trophy-row${earned ? ' earned' : ''}`);
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned;
  box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  box.addEventListener('change', () => {
    store.setEarned(trophy.id, box.checked);
    onRerender();
  });
  const body = el('div');
  const name = el('div', 'trophy-name');
  const link = document.createElement('a');
  link.href = `#/trophy/${trophy.id}`;
  link.textContent = displayName(trophy, shieldOn, store);
  name.append(link);
  const desc = el('p', 'trophy-desc', displayDescription(trophy, shieldOn, store));
  const meta = el('div', 'trophy-meta');
  meta.innerHTML = medalBadge(trophy.grade);
  const kindTag = el('span', 'tag', KIND_LABELS[trophy.kind] ?? trophy.kind);
  meta.append(kindTag);
  if (trophy.effort) {
    meta.append(el('span', `tag effort-${trophy.effort.toLowerCase()}`, `${trophy.effort} effort`));
  }
  if (trophy.missable) meta.append(el('span', 'tag missable', 'Missable'));
  if (trophy.hidden) meta.append(el('span', 'tag hidden-tag', 'Hidden'));
  if (trophy.count) meta.append(counterStepper(trophy, store));
  body.append(name, desc, meta);
  const side = el('div');
  li.append(box, body, side);
  return li;
}

export function renderListView(view, trophies, store, ui, rerender) {
  view.replaceChildren();
  const stats = el('div', 'kind-stats');
  renderKindStats(stats, trophies, store);
  view.append(stats);

  const toolbar = el('div', 'toolbar');
  const search = document.createElement('input');
  search.type = 'search';
  search.placeholder = 'Search trophies…';
  search.value = ui.filters.query;
  search.setAttribute('aria-label', 'Search trophies');
  search.addEventListener('input', () => { ui.filters.query = search.value; paintList(); });
  const grade = document.createElement('select');
  grade.setAttribute('aria-label', 'Filter by grade');
  for (const [value, label] of [['all', 'All grades'], ['platinum', 'Platinum'], ['gold', 'Gold'], ['silver', 'Silver'], ['bronze', 'Bronze']]) {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    if (ui.filters.grade === value) opt.selected = true;
    grade.append(opt);
  }
  grade.addEventListener('change', () => { ui.filters.grade = grade.value; rerender(); });
  const shieldLabel = el('label', 'shield-toggle', 'Spoiler shield');
  const shield = document.createElement('input');
  shield.type = 'checkbox';
  shield.checked = ui.shieldOn;
  shield.addEventListener('change', () => { ui.shieldOn = shield.checked; rerender(); });
  shieldLabel.prepend(shield);
  toolbar.append(search, grade, shieldLabel);
  view.append(toolbar);

  const kindChips = el('div', 'chips');
  kindChips.append(el('span', 'chip-label', 'Kind:'));
  const kinds = [['all', 'All'], ['story', 'Story'], ['missable', 'Missable'], ['collectibles', 'Collectibles'], ['activities', 'Activities'], ['online', 'Online']];
  for (const [value, label] of kinds) {
    kindChips.append(chipButton(label, ui.filters.kind === value, () => { ui.filters.kind = value; rerender(); }));
  }
  view.append(kindChips);

  const effortChips = el('div', 'chips');
  effortChips.append(el('span', 'chip-label', 'Effort:'));
  for (const [value, label] of [['all', 'All efforts'], ['Quick', 'Quick'], ['Moderate', 'Moderate'], ['Grind', 'Grind']]) {
    effortChips.append(chipButton(label, ui.filters.effort === value, () => { ui.filters.effort = value; rerender(); }));
  }
  view.append(effortChips);

  if (ui.filters.kind === 'online') {
    const empty = el('div', 'empty-state');
    empty.innerHTML = '<strong>No online trophies here.</strong> The PS5 list has no online trophies — the partner trophies (Hot Together, Retail Therapy) are story co-op, played with your in-game partner, not online multiplayer.';
    view.append(empty);
  }

  const next = trophies.find((t) => !store.isEarned(t.id) && (t.kind === 'story' || t.missable));
  if (next && ui.filters.kind === 'all' && !ui.filters.query) {
    const box = el('div', 'next-up');
    box.append(el('h2', null, 'Next up'));
    const p = el('p');
    p.innerHTML = '';
    const a = document.createElement('a');
    a.href = `#/trophy/${next.id}`;
    a.textContent = next.name;
    p.append('Your next story trophy: ', a, ` — ${next.description}`);
    box.append(p);
    view.append(box);
  }

  // The list itself repaints in place (search typing keeps focus).
  const listWrap = el('div');
  view.append(listWrap);
  function paintList() {
    const shownNow = filterTrophies(trophies, ui.filters);
    listWrap.replaceChildren();
    listWrap.append(el('p', 'result-count', `Showing ${shownNow.length} of ${trophies.length} trophies`));
    const list = el('ul', 'trophy-list');
    for (const t of shownNow) list.append(trophyRow(t, ui.shieldOn, store, rerender));
    listWrap.append(list);
  }
  paintList();
}
