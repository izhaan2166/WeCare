// Static site build for the hospital website.
// Usage: node build.mjs   ->  writes the finished site to ./dist
// No dependencies. Pages live in src/pages, shared pieces in src/partials,
// hospital details in site.config.json, department content in src/data.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const PREVIEW = process.env.PREVIEW === '1'; // offline preview: photo areas become labelled placeholders
const out = join(root, PREVIEW ? 'dist-preview' : 'dist');
const site = JSON.parse(readFileSync(join(root, 'site.config.json'), 'utf8'));
const departments = JSON.parse(readFileSync(join(root, 'src/data/departments.json'), 'utf8'));
const images = JSON.parse(readFileSync(join(root, 'src/data/images.json'), 'utf8'));

// Responsive image from the Unsplash CDN, or from local copies once scripts/fetch-images.mjs has run.
// Usage in pages: {{img:key:sizes-preset:eager}}
const sizePresets = { full: '100vw', half: '(min-width: 1000px) 50vw, 100vw', third: '(min-width: 1000px) 33vw, (min-width: 640px) 50vw, 100vw', small: '(min-width: 1000px) 25vw, 50vw' };
function img(key, preset = 'half', loading = 'lazy') {
  const im = images[key];
  if (!im) throw new Error(`Unknown image ${key}`);
  const base = `https://images.unsplash.com/${im.id}?auto=format&amp;fit=crop&amp;q=75`;
  const widths = [480, 800, 1200, 1600, 2000];
  const sizes = ` sizes="${sizePresets[preset] || preset}"`;
  let src, srcset;
  if (im.local) { // self-hosted copies from scripts/fetch-images.mjs
    src = `${im.local}-1600.jpg`;
    srcset = ` srcset="${im.local}-800.jpg 800w, ${im.local}-1600.jpg 1600w"${sizes}`;
  } else {
    src = `${base}&amp;w=1200`;
    srcset = ` srcset="${widths.map((w) => `${base}&amp;w=${w} ${w}w`).join(', ')}"${sizes}`;
  }
  const prio = loading === 'eager' ? ' loading="eager" fetchpriority="high"' : ' loading="lazy"';
  if (PREVIEW) return `<span class="photo-ph" role="img" aria-label="${esc(im.alt)}"><span class="photo-ph__label">Photo: ${esc(im.alt)}</span></span>`;
  return `<img src="${src}"${srcset} alt="${esc(im.alt)}" width="1200" height="900" decoding="async"${prio} style="object-position:${im.pos || '50% 50%'}">`;
}

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);


// Telephone helper: click-to-call only for verified numbers.
function tel(key, cls = '') {
  const p = site[key];
  if (!p || !p.display) return '';
  if (p.verified) return `<a class="tel ${cls}" href="tel:${esc(p.tel)}">${esc(p.display)}</a>`;
  return `<span class="tel tel--pending ${cls}" title="Placeholder number. Click-to-call switches on once the hospital confirms this number.">${esc(p.display)}</span>`;
}

const icon = (id, cls = 'icon') => `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="#${id}"></use></svg>`;

const renderers = {
  'dept-cards': () => departments.map((d, i) => `
      <li class="dept-card reveal" style="--d:${i % 4}">
        <a class="dept-card__link" href="specialities.html#${d.id}">
          <span class="dept-card__icon">${icon(d.icon)}</span>
          <span class="dept-card__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
          <h3 class="dept-card__title">${esc(d.name)}</h3>
          <p class="dept-card__text">${esc(d.short)}</p>
          <span class="dept-card__more">Explore Department ${icon('i-arrow', 'icon icon--sm')}</span>
        </a>
      </li>`).join(''),

  // Home bento: tile 1 is the large feature, tile 4 the wide one; both carry the department portrait.
  'dept-bento': () => departments.map((d, i) => {
    const size = i === 0 ? ' bento__tile--feature' : i === 3 ? ' bento__tile--wide' : '';
    const pic = size && d.portrait ? `<span class="bento__pic"><img src="${d.portrait.src}-900.jpg" srcset="${d.portrait.src}-480.jpg 480w, ${d.portrait.src}-900.jpg 900w" sizes="(min-width: 1000px) 30vw, 90vw" alt="" width="900" height="810" loading="lazy" decoding="async"></span>` : '';
    return `
      <li class="bento__tile${size} reveal" style="--d:${i % 4}">
        <a class="bento__link" href="specialities.html#${d.id}">
          <span class="bento__top"><span class="bento__icon">${icon(d.icon)}</span><span class="bento__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span></span>
          <div class="bento__copy">
            <h3 class="bento__title">${esc(d.name)}</h3>
            <p class="bento__text">${esc(d.short)}</p>
            <span class="bento__more">Explore Department ${icon('i-arrow-ne', 'icon icon--sm')}</span>
          </div>${pic}
        </a>
      </li>`;
  }).join(''),

  'dept-marquee': () => departments.map((d) => `<span class="marquee__item">${esc(d.name)}</span><span class="marquee__dot" aria-hidden="true"></span>`).join(''),

  'dept-index': () => departments.map((d) => `
        <li><a href="#${d.id}">${icon(d.icon, 'icon icon--sm')}<span>${esc(d.name)}</span></a></li>`).join(''),

  'dept-detail': () => departments.map((d, i) => `
      <article class="dept-row reveal" id="${d.id}" aria-labelledby="${d.id}-title">
        <div class="dept-row__head">
          <span class="dept-row__icon">${icon(d.icon)}</span>
          <span class="dept-row__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
        </div>
        <div class="dept-row__body">
          <h2 class="dept-row__title" id="${d.id}-title">${esc(d.name)}</h2>
          <p class="dept-row__intro">${esc(d.intro)}</p>
          <a class="link-arrow" href="doctors.html?dept=${d.id}">See ${esc(d.name)} consultants ${icon('i-arrow', 'icon icon--sm')}</a>
        </div>
        <div class="dept-row__areas">
          <h3 class="label">People often come to us for</h3>
          <ul class="tick-list">${d.areas.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
          <a class="btn btn--outline btn--sm" href="appointment.html?dept=${d.id}">Request an appointment</a>
        </div>
      </article>`).join(''),

  'dept-options': () => departments.map((d) => `<option value="${d.id}">${esc(d.name)}</option>`).join(''),

  'dept-footer': () => departments.map((d) => `<li><a href="specialities.html#${d.id}">${esc(d.name)}</a></li>`).join(''),

  'dept-chips': () => departments.map((d) => `<button type="button" class="chip" data-filter="${d.id}" aria-pressed="false">${esc(d.name)}</button>`).join(''),

  // Doctor directory: one editable profile slot per department until verified profiles are supplied.
  'doctor-cards': (limit) => departments.slice(0, limit ? Number(limit) : undefined).map((d) => `
      <li class="doc-card reveal" data-dept="${d.id}" data-name="">
        <div class="doc-card__portrait">
          ${d.portrait ? `<img src="${d.portrait.src}-900.jpg" srcset="${d.portrait.src}-480.jpg 480w, ${d.portrait.src}-900.jpg 900w" sizes="(min-width: 1000px) 25vw, (min-width: 560px) 50vw, 80vw" alt="${esc(d.name)} consultant" width="900" height="810" loading="lazy" decoding="async" style="object-position:${d.portrait.pos}">` : `<svg class="doc-card__silhouette" viewBox="0 0 120 120" role="img" aria-label="Portrait placeholder"><circle cx="60" cy="46" r="22"/><path d="M18 120c4-26 21-40 42-40s38 14 42 40z"/></svg>`}
        </div>
        <div class="doc-card__body">
          <p class="doc-card__dept">${esc(d.name)}</p>
          <h3 class="doc-card__name">${esc(d.name)} Consultant</h3>
          <a class="btn btn--outline btn--sm btn--block" href="appointment.html?dept=${d.id}">Request appointment</a>
        </div>
      </li>`).join(''),
};

function jsonLd(page) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Hospital',
    name: site.name,
    url: site.siteUrl,
    email: site.email,
    telephone: site.phone.verified ? site.phone.tel : undefined,
    medicalSpecialty: departments.map((d) => d.name),
  };
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

const partials = {};
for (const f of readdirSync(join(root, 'src/partials'))) partials[f.replace(/\.\w+$/, '')] = readFileSync(join(root, 'src/partials', f), 'utf8');

function render(tpl, page, depth = 0) {
  if (depth > 5) throw new Error('Include depth exceeded');
  return tpl
    .replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, n) => {
      if (!(n in partials)) throw new Error(`Missing partial: ${n}`);
      return render(partials[n], page, depth + 1);
    })
    .replace(/\{\{#if\s+([\w.]+)\s*\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, k, body) => (get(site, k) ? body : ''))
    .replace(/\{\{@([\w-]+)(?::(\w+))?\s*\}\}/g, (_, n, arg) => renderers[n](arg))
    .replace(/\{\{tel:(\w+)(?::([\w-]+))?\}\}/g, (_, k, cls) => tel(k, cls || ''))
    .replace(/\{\{img:(\w+)(?::([\w-]+))?(?::(\w+))?\}\}/g, (_, k, p, l) => img(k, p, l))
    .replace(/\{\{credit:(\w+)\}\}/g, (_, k) => esc(images[k].credit))
    .replace(/\{\{icon:([\w-]+)(?::([\w -]+))?\}\}/g, (_, id, cls) => icon(id, cls || 'icon'))
    .replace(/\{\{nav:(\w+)\}\}/g, (_, n) => (page.nav === n ? 'aria-current="page"' : ''))
    .replace(/\{\{jsonld\}\}/g, () => jsonLd(page))
    .replace(/\{\{page\.(\w+)\}\}/g, (_, k) => esc(page[k] ?? ''))
    .replace(/\{\{([\w.]+)\}\}/g, (m, k) => {
      const v = get(site, k);
      if (v === undefined) throw new Error(`Unknown token ${m} in ${page.file}`);
      return esc(v);
    });
}

if (existsSync(out)) rmSync(out, { recursive: true });
mkdirSync(out, { recursive: true });
cpSync(join(root, 'assets'), join(out, 'assets'), { recursive: true });

for (const file of readdirSync(join(root, 'src/pages')).filter((f) => f.endsWith('.html'))) {
  const raw = readFileSync(join(root, 'src/pages', file), 'utf8');
  const m = raw.match(/^<!--page\s+(\{[\s\S]*?\})\s*-->\n?/);
  if (!m) throw new Error(`${file} is missing its <!--page {...} --> header`);
  const page = { ...JSON.parse(m[1]), file };
  page.canonical = `${site.siteUrl}/${file === 'index.html' ? '' : file}`;
  const body = raw.slice(m[0].length);
  const html = render(partials.layout.replace('{{content}}', () => body), page);
  writeFileSync(join(out, file), html);
  console.log('built', file);
}
