const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { escapeHtml } = require('./render-preview');
const root = path.join(__dirname, '..', 'public');
const files = ['index.html', 'hours-and-contacts.html', 'location.html', 'it/index.html', 'it/orari-e-contatti.html', 'it/dove-si-trova.html'];
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const pages = new Map();

for (const file of files) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  assert.strictEqual((source.match(/<h1[ >]/g) || []).length, 1, `${file}: one h1`);
  assert.strictEqual((source.match(/<main[ >]/g) || []).length, 1, `${file}: main landmark`);
  assert(source.includes('href="#main"'), `${file}: skip link`);
  assert(!source.includes('cdn.tailwindcss.com') && !source.includes('lunr.min.js'), `${file}: local assets`);
  const canonical = source.match(/rel="canonical" href="([^"]+)"/)[1];
  assert(sitemap.includes(`<loc>${canonical}</loc>`), `${file}: canonical in sitemap`);
  const alternates = [...source.matchAll(/rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)];
  assert.strictEqual(alternates.length, 3, `${file}: bilingual alternates`);
  pages.set(canonical, { source, alternates });
  for (const match of source.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    const data = JSON.parse(match[1]);
    assert(data['@graph'].some(item => item['@type'] === 'WebPage' && item.url === canonical));
  }
  const ids = [...source.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  assert.strictEqual(new Set(ids).size, ids.length, `${file}: unique IDs`);
  for (const match of source.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const href = match[1];
    if (/^(https?:|mailto:|tel:|#)/.test(href)) continue;
    const resolved = path.resolve(path.dirname(path.join(root, file)), href);
    assert([resolved, resolved + '.html', path.join(resolved, 'index.html')].some(candidate => fs.existsSync(candidate)), `${file}: missing ${href}`);
  }
}
for (const [canonical, { alternates }] of pages) {
  for (const [, , url] of alternates) {
    assert(pages.has(url), `Unknown alternate ${url}`);
    assert(pages.get(url).alternates.some(item => item[2] === canonical), `Nonreciprocal alternate ${canonical}`);
  }
}
// Public discovery documents must stay linked, current and parseable without JS.
const llms = fs.readFileSync(path.join(root, 'llms.txt'), 'utf8');
const full = fs.readFileSync(path.join(root, 'llms-full.txt'), 'utf8');
const books = JSON.parse(fs.readFileSync(path.join(root, 'books.json'), 'utf8'));
assert(llms.startsWith('# ') && llms.includes('\n> '), 'llms.txt proposal structure');
assert(llms.includes('/books.json') && llms.includes('/llms-full.txt'));
for (const file of files) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const markdownFile = file.replace(/\.html$/, '.md');
  const markdown = fs.readFileSync(path.join(root, markdownFile), 'utf8');
  assert(html.includes('rel="describedby"') && html.includes('type="text/markdown"'));
  assert(llms.includes(`/${markdownFile}`));
  assert(full.includes(markdown), `${file}: full documentation contains current page`);
  assert(!/^#{1,6}\s*$/m.test(markdown), `${file}: no empty Markdown headings`);
  assert(!/<(?:script|form|iframe|nav)\b/.test(markdown), `${file}: no interactive HTML`);
  if (file.endsWith('index.html')) {
    assert(html.includes(`<span data-catalogue-count>${books.length}</span>`));
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
    const dataset = graph.find(item => item['@type'] === 'Dataset');
    assert.strictEqual(dataset.distribution.contentUrl, 'https://biblioteca.acisantantonio.org/books.json');
    assert.strictEqual(dataset.distribution.encodingFormat, 'application/json');
  }
}
for (const [, href] of llms.matchAll(/\]\((https:\/\/biblioteca\.acisantantonio\.org\/[^)]+)\)/g)) {
  const pathname = new URL(href).pathname;
  assert(fs.existsSync(path.join(root, pathname)), `Missing LLM resource: ${pathname}`);
}
assert.strictEqual((sitemap.match(/<xhtml:link /g) || []).length, 18);
assert(/User-agent: \*\s+Allow: \//.test(fs.readFileSync(path.join(root, 'robots.txt'), 'utf8')));

assert.strictEqual(escapeHtml('<script>"&\''), '&lt;script&gt;&quot;&amp;&#39;');

// Exercise the actual browser script with a minimal DOM, including loading failures.
function element() {
  return { value: '', textContent: '', hidden: false, disabled: false, children: [], listeners: {},
    append(child) { this.children.push(child); },
    replaceChildren(child) { this.children = child.children; },
    addEventListener(name, fn) { this.listeners[name] = fn; },
    focus() { this.focused = true; }
  };
}
async function checkCatalogue(lang) {
  const elements = new Map();
  const get = id => {
    if (!elements.has(id)) elements.set(id, element());
    return elements.get(id);
  };
  get('search-form').dataset = { source: '../books.json' };
  const fixture = [
    { id: 1, title: 1984, author: 'George Orwell', year: 1949 },
    { id: 2, title: '<img src=x onerror=alert(1)>', author: 'Émile', year: 2000 },
    ...Array.from({ length: 11 }, (_, index) => ({ id: index + 3, title: `Book ${index}`, year: 2000 }))
  ];
  let fail = true;
  const context = {
    document: { documentElement: { lang }, getElementById: get, createDocumentFragment: element, createElement: element },
    fetch: async () => ({ ok: !fail, status: fail ? 503 : 200, json: async () => fixture }),
    console: { error() {} }, setTimeout, clearTimeout
  };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/catalogue.js'), 'utf8'), context);
  await new Promise(resolve => setImmediate(resolve));
  assert.strictEqual(get('retry').hidden, false, 'Failure exposes retry');
  fail = false;
  await get('retry').listeners.click();
  assert.strictEqual(get('search-fields').disabled, false);
  assert.strictEqual(get('results-body').children.length, 10);
  const search = (q, year = '', inventory = '') => {
    get('fulltext-search').value = q;
    get('year-search').value = year;
    get('id-search').value = inventory;
    get('search-form').listeners.submit({ preventDefault() {} });
  };
  search('1984', '1949', '1');
  assert.strictEqual(get('results-body').children.length, 1);
  assert.strictEqual(get('results-body').children[0].children[1].textContent, 1984);
  search('emile');
  assert.strictEqual(get('results-body').children[0].children[1].textContent, fixture[1].title, 'Catalogue strings are rendered as text');
  search('b');
  assert.strictEqual(get('next-page').disabled, false, 'Single-character search works');
  search('no-such-book');
  assert.strictEqual(get('next-page').disabled, true);
  assert.strictEqual(get('pagination').hidden, true);
  get('search-form').listeners.reset();
  get('next-page').listeners.click();
  assert.strictEqual(get('results-body').children.length, 3);
  assert.strictEqual(get('results-heading').focused, true);
  assert.strictEqual(get('next-page').disabled, true);
}
Promise.all(['it', 'en'].map(checkCatalogue)).then(() => {
  console.log('PASS: six pages, local links, canonical/hreflang, JSON-LD, LLM/Markdown resources, dataset, preview escaping and bilingual search regressions.');
}).catch(error => { console.error(error); process.exitCode = 1; });
