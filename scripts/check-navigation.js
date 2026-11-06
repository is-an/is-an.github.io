// Node-only regression checks. These fixtures do not replace browser tests.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

function element() {
  const classes = new Set();
  return {
    children: [], attributes: {}, events: {}, style: {},
    classList: {
      add(name) { classes.add(name); },
      remove(name) { classes.delete(name); },
      contains(name) { return classes.has(name); },
      toggle(name, force) { if (force) classes.add(name); else classes.delete(name); }
    },
    setAttribute(name, value) { this.attributes[name] = value; },
    removeAttribute(name) { delete this.attributes[name]; },
    appendChild(child) { this.children.push(child); },
    addEventListener(name, callback) { this.events[name] = callback; },
    set innerHTML(value) { assert.equal(value, '', 'Untrusted HTML rendering'); this.children = []; }
  };
}

const document = {
  readyState: 'loading', currentScript: {src: 'https://is-an.github.io/assets/js/i18n.js'},
  documentElement: element(), addEventListener() {}, dispatchEvent() {}, querySelectorAll() { return []; },
  querySelector() { return null; }, getElementById() { return null; }, createElement: element
};
const context = vm.createContext({URL, CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
  window: {location: {pathname: '/tools/'}},
  navigator: {language: 'ko'}, localStorage: {getItem() { return null; }, setItem() {}}, document});
function run(file) { vm.runInContext(fs.readFileSync(file, 'utf8'), context, {filename: file}); }
for (const file of ['assets/js/tools-data.js', 'assets/js/i18n.js',
    ...['en', 'zh', 'ja'].map(lang => 'assets/i18n/' + lang + '.js')]) run(file);
const data = context.window.SITE_TOOLS;
assert.equal(new Set(data.TOOLS.map(tool => tool.id)).size, data.TOOLS.length, 'Duplicate tool IDs');
for (const lang of ['ko', 'en', 'zh', 'ja']) {
  context.registerLanguage(lang);
  for (const key of ['header_home', 'header_navigation', 'header_search_close', 'header_search_error',
      'header_search_loading', 'header_search_hint', 'directory_meta_title', 'directory_title', 'directory_copy',
      'directory_favorite', 'directory_unfavorite', ...data.TOOLS.flatMap(tool => [tool.key, tool.descKey])]) {
    assert.ok(key, 'Tool translation key missing');
    const translated = context.translate(key, lang);
    assert.ok(typeof translated === 'string' && translated && translated !== key, lang + ': missing ' + key);
    assert.ok(Object.hasOwn(context.window.I18N_DATA[lang], key), lang + ': fallback used for ' + key);
  }
}
for (const tool of data.TOOLS) assert.ok(data.CATEGORIES.some(cat => cat.id === tool.cat), 'Unknown category');

run('assets/js/common.js');
const links = ['tech', 'tools', 'etc'].map(route => Object.assign(element(), {dataset: {route}}));
const header = {querySelector() { return null; }, querySelectorAll() { return links; }};
document.querySelector = selector => selector === '.site-header' ? header : null;
for (const base of ['', '/preview']) {
  document.scripts = [{src: 'https://is-an.github.io' + base + '/assets/js/common.js'}];
  for (const [path, active] of [['/', null], ['/tools/', 'tools'], ['/tools/salary/', 'tools'],
      ['/cal/age/', 'tools'], ['/games/sudoku/', 'tools'], ['/lotto/', 'tools'], ['/saju/', 'tools'],
      ['/stock/', 'tools'], ['/guide/posts/example/', 'tech'], ['/faq/', 'etc'], ['/privacy/', 'etc']]) {
    context.window.location = {pathname: base + path, href: 'https://is-an.github.io' + base + path};
    context.applyHeaderLinks();
    assert.deepEqual(links.filter(link => link.classList.contains('active')).map(link => link.dataset.route), active ? [active] : []);
    assert.equal(links[0].href, base + '/guide/');
    assert.equal(links[1].href, base + '/tools/');
    assert.equal(links[2].href, base + '/faq/');
  }
}
context.localStorage.getItem = () => { throw new Error('Storage blocked'); };
context.localStorage.setItem = () => { throw new Error('Quota exceeded'); };
assert.equal(context.readStoredNumber('best'), 0);
assert.doesNotThrow(() => context.writeStoredNumber('best', 12));
for (const saved of ['NaN', 'Infinity', '-1', 'broken']) {
  context.localStorage.getItem = () => saved;
  assert.equal(context.readStoredNumber('best'), 0);
}
context.localStorage.getItem = () => '42';
assert.equal(context.readStoredNumber('best'), 42);

// The directory must still show all tools when browser storage is malformed/denied.
for (const saved of ['{}', 'null', '{broken', '[null, 12, "unknown"]', null]) {
  const fields = Object.fromEntries(['toolSearch', 'toolIndex', 'indexCount', 'emptyState'].map(id => [id, element()]));
  document.scripts = [{src: 'https://is-an.github.io/assets/js/common.js'}];
  context.window.location = {pathname: '/tools/', href: 'https://is-an.github.io/tools/'};
  document.getElementById = id => fields[id] || null;
  document.querySelector = () => null;
  context.localStorage.getItem = key => {
    if (key === 'language') return 'en';
    if (saved === null) throw new Error('Storage denied');
    return saved;
  };
  run('assets/js/tool-directory.js');
  assert.equal(fields.indexCount.textContent, String(data.TOOLS.length));
  function directoryLinks() {
    return fields.toolIndex.children.flatMap(group => group.children)
      .filter(row => row.className === 'v2-row').map(row => row.children[0].href);
  }
  assert.deepEqual(directoryLinks().sort(), Array.from(data.TOOLS, tool => tool.href).sort());
  fields.toolSearch.events.input({target: {value: 'salary'}});
  assert.deepEqual(directoryLinks(), ['/tools/salary/']);
  fields.toolSearch.events.input({target: {value: '<img src=x onerror=alert(1)>'}});
  assert.equal(directoryLinks().length, 0);
  assert.equal(fields.emptyState.hidden, false);
}

// A malformed fortune cache must be discarded without changing generated scores.
const cache = new Map();
context.window.localStorage = {
  getItem(key) { return cache.get(key) || null; },
  setItem(key, value) { cache.set(key, value); },
  removeItem(key) { cache.delete(key); }, key(index) { return Array.from(cache.keys())[index]; },
  get length() { return cache.size; }
};
run('assets/js/saju/saju-fortune.js');
const fortune = context.window.SajuFortune;
const generated = fortune.generateFortune({pillars: [{stem: 0, branch: 0}]}, '2026-11-06', {birthDate: '2000-01-01'});
const key = fortune.createFortuneCacheKey(generated.userId, generated.date);
assert.deepEqual(fortune.loadFortuneCache(key), generated);
cache.set(key, JSON.stringify({version: '1.0', fortune: null}));
assert.equal(fortune.loadFortuneCache(key), null);
const poisoned = JSON.parse(JSON.stringify(generated));
poisoned.fortune[0].score = '50%;" onmouseover="alert(1)';
cache.set(key, JSON.stringify(poisoned));
assert.equal(fortune.loadFortuneCache(key), null);
assert.equal(JSON.stringify(fortune.generateFortune({pillars: [{stem: 0, branch: 0}]}, generated.date,
  {birthDate: '2000-01-01'}).fortune), JSON.stringify(generated.fortune));
const view = fs.readFileSync('assets/js/saju-view.js', 'utf8');
vm.runInContext(view.slice(view.indexOf('  function escapeFortuneText('), view.indexOf('  function renderFortune(')), context);
assert.equal(context.escapeFortuneText('<img src=x onerror="x">&'), '&lt;img src=x onerror=&quot;x&quot;&gt;&amp;');

// Language selection must work in memory even if persistence is denied.
context.setLanguage('ja');
Promise.resolve().then(() => {
  assert.equal(context.getCurrentLanguage(), 'ja');
  assert.equal(document.documentElement.attributes.lang, 'ja');
  process.stdout.write(JSON.stringify(data));
});
