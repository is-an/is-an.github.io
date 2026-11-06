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
    getAttribute(name) { return this.attributes[name]; },
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
      'directory_favorite', 'directory_unfavorite',
      'footer_toolsTitle', 'footer_infoTitle', 'footer_brand_copy', 'footer_privacy_note',
      ...Object.keys(context.window.I18N_DATA.ko).filter(key => /^(tech_|blog_|header_menu_)/.test(key)),
      ...data.GUIDES.flatMap(guide => [guide.key, guide.descKey]),
      ...data.TOOLS.flatMap(tool => [tool.key, tool.descKey])]) {
    assert.ok(key, 'Tool translation key missing');
    const translated = context.translate(key, lang);
    assert.ok(typeof translated === 'string' && translated && translated !== key, lang + ': missing ' + key);
    assert.ok(Object.hasOwn(context.window.I18N_DATA[lang], key), lang + ': fallback used for ' + key);
  }
}
for (const tool of data.TOOLS) assert.ok(data.CATEGORIES.some(cat => cat.id === tool.cat), 'Unknown category');

run('assets/js/common.js');
// Both reading lists use the six canonical articles, including a prefixed deployment.
for (const base of ['', '/preview']) {
  const readingList = element();
  document.scripts = [{src: 'https://is-an.github.io' + base + '/assets/js/common.js'}];
  document.getElementById = id => id === 'guideList' ? readingList : null;
  run('assets/js/blog-index.js');
  assert.equal(readingList.children.length, 6);
  assert.deepEqual(readingList.children.map(article => article.children[1].children[0].href),
    Array.from(data.GUIDES, guide => base + guide.href));
  for (const article of readingList.children) {
    assert.equal(article.children[0].dateTime, '2026-09-01');
    assert.ok(article.children[2].attributes['data-i18n']);
  }
}
document.getElementById = () => null;
const links = ['tech', 'tools', 'etc'].map(route => Object.assign(element(), {dataset: {route}}));
const techCategories = ['news', 'sharing', 'incidents', 'security', 'ai'];
const techLinks = techCategories.map(techCategory => ({dataset: {techCategory}}));
const logoImage = {};
const header = {querySelector(selector) { return selector === '.logo-img' ? logoImage : null; },
  querySelectorAll(selector) { return selector === '[data-tech-category]' ? techLinks : links; }};
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
    assert.equal(logoImage.src, base + '/isa-logo.svg');
    assert.deepEqual(techLinks.map(link => link.href), techCategories.map(id => base + '/guide/#' + id));
  }
}

// Footer links and logo must work at the site root and under a repository prefix.
for (const base of ['', '/preview']) {
  const footerLinks = ['/', '/guide/', '/tools/', '/faq/', '/privacy/'].map(href => {
    const link = element(); link.setAttribute('href', href); return link;
  });
  const footerLogo = {};
  const footer = {querySelectorAll() { return footerLinks; }, querySelector() { return footerLogo; }};
  document.querySelector = selector => selector === '.v2-footer' ? footer : null;
  document.scripts = [{src: 'https://is-an.github.io' + base + '/assets/js/common.js'}];
  context.applyFooterLinks();
  context.applyFooterLinks();
  assert.deepEqual(footerLinks.map(link => link.getAttribute('href')),
    ['/', '/guide/', '/tools/', '/faq/', '/privacy/'].map(href => base + href));
  assert.equal(footerLogo.src, base + '/isa-logo.svg');
}
assert.equal(context.translate('footer.toolsTitle', 'ko'), '\uCE74\uD14C\uACE0\uB9AC');

// Mobile menu: keyboard, outside click/focus, popup coordination, and resize.
const menuListeners = {};
const menuDocument = {
  readyState: 'complete',
  addEventListener(type, callback) { (menuListeners[type] ||= []).push(callback); },
  dispatchEvent(event) { (menuListeners[event.type] || []).forEach(callback => callback(event)); }
};
const menuToggle = Object.assign(element(), {dataset: {}, focus() { menuDocument.activeElement = this; }});
const menuLink = {focus() { menuDocument.activeElement = this; }};
const menuNav = Object.assign(element(), {
  querySelector() { return menuLink; },
  contains(target) { return target === this || target === menuLink; }
});
menuToggle.contains = target => target === menuToggle;
const menuHeader = {querySelector(selector) {
  return selector === '#navToggle' ? menuToggle : selector === '#mainNav' ? menuNav : null;
}};
menuDocument.getElementById = () => ({querySelector() { return menuHeader; }});
const mobile = {matches: true, addEventListener(type, callback) { this[type] = callback; }};
const menuContext = vm.createContext({document: menuDocument, CustomEvent: context.CustomEvent,
  window: {matchMedia() { return mobile; }},
  translate: key => context.translate(key, 'en'), getCurrentLanguage: () => 'en'});
vm.runInContext(fs.readFileSync('assets/js/header-nav.js', 'utf8'), menuContext);
let lastPopup = null;
menuDocument.addEventListener('v2:popup', event => { lastPopup = event.detail; });
function openMenu() {
  menuToggle.events.click();
  assert.equal(menuToggle.attributes['aria-expanded'], 'true');
  assert.ok(menuNav.classList.contains('is-open'));
  assert.equal(menuDocument.activeElement, menuLink);
  assert.equal(lastPopup, 'menu');
  assert.equal(menuToggle.attributes['data-i18n-aria-label'], 'header_menu_close');
}
for (const detail of ['search', 'lang']) {
  openMenu();
  menuDocument.dispatchEvent({type: 'v2:popup', detail});
  assert.equal(menuToggle.attributes['aria-expanded'], 'false');
}
openMenu();
menuNav.events.keydown({key: 'Escape', preventDefault() {}, stopPropagation() {}});
assert.equal(menuToggle.attributes['aria-expanded'], 'false');
assert.equal(menuDocument.activeElement, menuToggle);
for (const type of ['click', 'focusin']) {
  openMenu();
  menuDocument.dispatchEvent({type, target: {}});
  assert.ok(!menuNav.classList.contains('is-open'));
}
openMenu();
menuNav.events.click({target: {closest() { return menuLink; }}});
assert.equal(menuToggle.attributes['aria-expanded'], 'false');
openMenu();
mobile.matches = false;
mobile.change();
assert.equal(menuToggle.attributes['aria-expanded'], 'false');
menuToggle.events.click();
assert.ok(!menuNav.classList.contains('is-open'), 'Desktop must not open a hidden mobile menu');

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
