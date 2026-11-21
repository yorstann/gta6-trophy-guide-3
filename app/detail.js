// Trophy detail view: full guide with numbered steps, sources, missable
// banner, effort chip, count progress and roadmap stage.
import { medalBadge, el, displayName, displayDescription, isMasked } from './render.js';
import { KIND_LABELS } from './filters.js';
import { ROADMAP } from './roadmap.js';

function guideSteps(guide) {
  const lines = guide.split('\n').map((s) => s.trim()).filter(Boolean);
  const intro = lines[0] ?? '';
  const steps = lines.slice(1);
  const wrap = document.createDocumentFragment();
  if (intro) wrap.append(el('p', null, intro));
  if (steps.length) {
    const ol = el('ol', 'guide-steps');
    for (const step of steps) ol.append(el('li', null, step));
    wrap.append(ol);
  }
  return wrap;
}

export function renderDetailView(view, trophy, trophies, store, shieldOn, rerender) {
  view.replaceChildren();
  const masked = isMasked(trophy, shieldOn, store);
  const box = el('article', 'detail');
  const back = document.createElement('a');
  back.href = '#/';
  back.textContent = '← All trophies';
  box.append(back);
  box.append(el('h2', null, displayName(trophy, shieldOn, store)));
  const meta = el('div', 'trophy-meta');
  meta.innerHTML = medalBadge(trophy.grade);
  meta.append(el('span', 'tag', KIND_LABELS[trophy.kind] ?? trophy.kind));
  if (trophy.effort) meta.append(el('span', `tag effort-${trophy.effort.toLowerCase()}`, `${trophy.effort} effort`));
  if (trophy.missable) meta.append(el('span', 'tag missable', 'Missable'));
  if (trophy.hidden) meta.append(el('span', 'tag hidden-tag', 'Hidden'));
  box.append(meta);
  box.append(el('p', 'official', `Official: “${displayDescription(trophy, shieldOn, store)}”`));
  if (masked) {
    box.append(el('p', null, 'The guide for this trophy stays hidden while the spoiler shield is on. Earn it — or switch the shield off — to read the steps.'));
  } else {
    if (trophy.missable && trophy.missableNote) {
      const warn = el('div', 'warn-banner');
      warn.innerHTML = '';
      const strong = el('strong', null, '⚠ Missable — read this first. ');
      warn.append(strong, document.createTextNode(trophy.missableNote));
      box.append(warn);
    }
    box.append(el('h3', null, 'How to earn it'));
    box.append(guideSteps(trophy.guide));
    if (trophy.count) {
      const p = el('p', null, `Tracked total: ${store.countFor(trophy.id).toLocaleString()} / ${trophy.count.toLocaleString()}. Use the +/− stepper on the list to log your progress — reaching the total suggests the trophy is done.`);
      box.append(p);
    }
    const stage = ROADMAP.find((s) => s.id === trophy.stage);
    if (stage) box.append(el('p', null, `Roadmap: Stage ${stage.id} — ${stage.title}.`));
    if (trophy.sources && trophy.sources.length) {
      const src = el('p', 'sources');
      src.append(el('b', null, 'Sources: '), document.createTextNode(trophy.sources.join(' · ')));
      box.append(src);
    }
  }
  const earned = store.isEarned(trophy.id);
  const toggle = el('button', null, earned ? '✓ Earned — unmark' : 'Mark as earned');
  toggle.type = 'button';
  toggle.addEventListener('click', () => { store.setEarned(trophy.id, !store.isEarned(trophy.id)); rerender(); });
  box.append(toggle);

  const nav = el('div', 'detail-nav');
  const idx = trophies.findIndex((t) => t.id === trophy.id);
  const prev = trophies[idx - 1];
  const next = trophies[idx + 1];
  if (prev) {
    const a = document.createElement('a');
    a.href = `#/trophy/${prev.id}`;
    a.textContent = `← ${prev.name}`;
    nav.append(a);
  } else nav.append(el('span'));
  if (next) {
    const a = document.createElement('a');
    a.href = `#/trophy/${next.id}`;
    a.textContent = `${next.name} →`;
    nav.append(a);
  }
  box.append(nav);
  view.append(box);
}
