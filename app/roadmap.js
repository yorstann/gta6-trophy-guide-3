// Roadmap view: the seven stages to the platinum, each with an hour
// estimate, a focus note and its trophies in order, plus a platinum
// checklist wired to real earned state. Also the missables view.
import { el } from './render.js';

export const ROADMAP = [
  { id: 1, title: 'Story first', hours: '≈ 25–35 hrs', focus: 'Play the chapters in order and enjoy Leonida; keep a backup save before big story choices.', ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] },
  { id: 2, title: 'Strangers & strands', hours: '≈ 12–18 hrs', focus: 'Finish every strand finale and all 8 strands BEFORE starting the final mission — these are missable.', ids: [22, 23, 24, 25, 26, 27] },
  { id: 3, title: 'Activities sweep', hours: '≈ 20–30 hrs', focus: 'Sweep the repeatable activities in one pass; gold the range early so the 42 challenges feel like practice, not a grind.', ids: [15, 16, 17, 18, 19, 20, 21, 28, 29, 32] },
  { id: 4, title: 'Collectibles & exploration', hours: '≈ 15–25 hrs', focus: 'Pair card sets and WAiNK spots with exploring new districts so every drive counts twice.', ids: [30, 31, 35, 42, 55] },
  { id: 5, title: 'Crime & money', hours: '≈ 10–15 hrs', focus: 'Bank vaults and gang operations fund the $250,000 laundering total; spend it on garages last.', ids: [39, 40, 41, 43, 52, 53, 54] },
  { id: 6, title: 'Partner & one-offs', hours: '≈ 6–10 hrs', focus: 'Mop up the partner escapes and single moments — most take one good attempt once you know the trigger.', ids: [33, 34, 36, 37, 38, 44, 45, 46, 47, 49, 50, 51] },
  { id: 7, title: '100% & platinum', hours: '≈ 5–10 hrs', focus: 'Clear the last 100% checklist items, then the platinum pops on its own.', ids: [14, 1] },
];

export const MISSABLE_STRANDS = {
  22: 'Andy — Road to Rehabilitation',
  23: 'Kenton — This Was No Boat Accident',
  24: 'Billy — The Lone Rider',
  25: 'Strangers & Freaks — 8 strands',
  26: 'Randy — Supply & Demand',
  27: 'Tyrone — Spin On This!',
  48: 'Story choices — Actions Speak Louder',
};

export function renderRoadmapView(view, trophies, store) {
  view.replaceChildren();
  view.append(el('h2', null, 'Roadmap to the platinum'));
  view.append(el('p', null, 'Seven stages, in the order that wastes the least time — story first, strands before the finale, then the sweeps.'));
  const byId = new Map(trophies.map((t) => [t.id, t]));
  for (const stage of ROADMAP) {
    const card = el('section', 'stage');
    card.append(el('h2', null, `Stage ${stage.id} — ${stage.title}`));
    card.append(el('p', 'stage-meta', `${stage.hours} · ${stage.focus}`));
    const ol = el('ol');
    for (const id of stage.ids) {
      const t = byId.get(id);
      if (!t) continue;
      const li = el('li', store.isEarned(id) ? 'done' : '');
      const a = document.createElement('a');
      a.href = `#/trophy/${id}`;
      a.textContent = t.name;
      li.append(a, document.createTextNode(` — ${t.description}`));
      ol.append(li);
    }
    card.append(ol);
    view.append(card);
  }
  const check = el('section', 'stage platinum-check');
  check.append(el('h2', null, 'Platinum checklist — the final sweep'));
  const rows = [
    ['All 7 missables secured (strands done, choices saved)', [22, 23, 24, 25, 26, 27, 48]],
    ['Every counter maxed (stunts, range, races, challenges)', [15, 17, 19, 32]],
    ['Every collectible set complete', [30, 31, 35, 42, 55]],
    ['Money goals done (laundered, spent, garages bought)', [52, 53, 54]],
    ['100% completion reached', [14]],
  ];
  for (const [label, ids] of rows) {
    const done = ids.every((id) => store.isEarned(id));
    const line = el('div', 'checkline');
    line.append(el('span', `mark ${done ? 'yes' : 'no'}`, done ? '✓' : '○'));
    line.append(el('span', null, label));
    check.append(line);
  }
  const platinum = byId.get(1);
  const platLine = el('p', null, store.isEarned(1) ? '🏆 Platinum earned — you are a Leonida Legend.' : 'When every box above is ticked, the platinum — Vice Got a Price! — is yours.');
  check.append(platLine);
  if (platinum) void platinum;
  view.append(check);
}

export function renderMissablesView(view, trophies, store) {
  view.replaceChildren();
  const intro = el('section', 'missable-intro');
  intro.append(el('h2', null, 'Missable trophies — handle before the final mission'));
  intro.append(el('p', null, 'Seven trophies can be missed for good on a single playthrough. Finish every stranger strand finale and keep a backup save before story choices — do all of this BEFORE starting the final mission.'));
  const ul = document.createElement('ul');
  for (const id of [22, 23, 24, 25, 26, 27, 48]) {
    const t = trophies.find((x) => x.id === id);
    const li = el('li', store.isEarned(id) ? 'done' : '');
    const a = document.createElement('a');
    a.href = `#/trophy/${id}`;
    a.textContent = MISSABLE_STRANDS[id];
    li.append(a, document.createTextNode(store.isEarned(id) ? ' — secured ✓' : ' — not yet done'));
    if (t) void t;
    ul.append(li);
  }
  intro.append(ul);
  view.append(intro);
  const list = el('ul', 'trophy-list');
  for (const t of trophies.filter((x) => x.missable)) {
    const li = el('li', 'trophy-row');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = store.isEarned(t.id);
    box.setAttribute('aria-label', `Mark ${t.name} as earned`);
    box.addEventListener('change', () => store.setEarned(t.id, box.checked));
    const body = el('div');
    const name = el('div', 'trophy-name');
    const a = document.createElement('a');
    a.href = `#/trophy/${t.id}`;
    a.textContent = t.name;
    name.append(a);
    body.append(name, el('p', 'trophy-desc', t.description));
    if (t.missableNote) body.append(el('p', null, t.missableNote));
    li.append(box, body, el('div'));
    list.append(li);
  }
  view.append(list);
}
