/* =========================================================
   tool-directory.js - tools search, favorites, and recently used tools
   ---------------------------------------------------------
   ▸ 데이터는 assets/js/tools-data.js 한 곳에서만 옵니다.
   ▸ 전역 스크립트 (ES 모듈 아님). common.js 다음에 로드합니다.
   ▸ common.js 의 initToolsFilter() 는 .tool-card 가 있을 때만
     동작하므로 이 페이지와 충돌하지 않습니다.
   ========================================================= */

(function () {
  var DATA = window.SITE_TOOLS;
  if (!DATA) { return; }

  var FAV_KEY = 'isan:favorites';
  var RECENT_KEY = 'isan:recent';
  var RECENT_MAX = 5;

  var base = getSiteBasePath();

  function url(href) { return base + href; }

  function read(key, fallback) {
    try {
      var saved = JSON.parse(localStorage.getItem(key) || fallback);
      return Array.isArray(saved) ? saved.filter(function (id) { return typeof id === 'string'; }) : [];
    } catch (e) { return JSON.parse(fallback); }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  var favs = read(FAV_KEY, '[]');
  var recent = read(RECENT_KEY, '[]');
  var query = '';

  var el = {
    layout: document.querySelector('.v2-home-body'),
    search: document.getElementById('toolSearch'),
    searchBtn: document.getElementById('toolSearchBtn'),
    index: document.getElementById('toolIndex'),
    indexTitle: document.getElementById('indexTitle'),
    indexCount: document.getElementById('indexCount'),
    empty: document.getElementById('emptyState'),
    clearSearch: document.getElementById('clearSearchBtn'),
    recentSection: document.getElementById('recentSection'),
    recent: document.getElementById('recentList'),
    clearRecent: document.getElementById('clearRecentBtn'),
    favSection: document.getElementById('favoriteSection'),
    favs: document.getElementById('favoriteList')
  };

  function byId(id) {
    for (var i = 0; i < DATA.TOOLS.length; i++) { if (DATA.TOOLS[i].id === id) { return DATA.TOOLS[i]; } }
    return null;
  }

  function matches(tool, q) {
    if (!q) { return true; }
    var hay = (tool.name + ' ' + translated(tool.key, tool.name) + ' ' + translated(tool.descKey, tool.desc) + ' ' + (tool.short || '') + ' ' + (tool.keywords || '')).toLowerCase();
    return q.toLowerCase().split(/\s+/).filter(Boolean).every(function (w) { return hay.indexOf(w) > -1; });
  }

  function translated(key, fallback) {
    if (!key || typeof translate !== 'function') { return fallback; }
    var result = translate(key, getCurrentLanguage());
    return result && result !== key ? result : fallback;
  }

  function node(tag, className, text) {
    var n = document.createElement(tag);
    if (className) { n.className = className; }
    if (text != null) { n.textContent = text; }
    return n;
  }

  function label(tag, className, tool, field) {
    var n = node(tag, className, field === 'desc' ? tool.desc : tool.name);
    var key = field === 'desc' ? tool.descKey : tool.key;
    if (key) { n.setAttribute('data-i18n', key); }
    return n;
  }

  function trackOpen(id) {
    recent = [id].concat(recent.filter(function (x) { return x !== id; })).slice(0, RECENT_MAX);
    write(RECENT_KEY, recent);
  }

  function toggleFav(id) {
    favs = favs.indexOf(id) > -1
      ? favs.filter(function (x) { return x !== id; })
      : [id].concat(favs);
    write(FAV_KEY, favs);
    render();
  }

  /* ---------- 렌더 ---------- */

  function renderIndex() {
    if (!el.index) { return; }
    var filtered = DATA.TOOLS.filter(function (t) { return matches(t, query); });

    el.index.innerHTML = '';
    DATA.CATEGORIES.forEach(function (c) {
      var items = filtered.filter(function (t) { return t.cat === c.id; });
      if (!items.length) { return; }

      var group = node('div', 'v2-group');
      var head = node('div', 'v2-group-head');
      var dot = node('span', 'v2-group-dot');
      dot.style.background = c.dot;
      dot.setAttribute('aria-hidden', 'true');
      head.appendChild(dot);

      var h3 = node('h3', null, c.name);
      if (c.key) { h3.setAttribute('data-i18n', c.key); }
      head.appendChild(h3);
      head.appendChild(node('span', 'v2-count', String(items.length)));
      head.appendChild(node('span', 'v2-spacer'));

      var all = node('a', 'v2-all', '전체 보기 →');
      all.href = url(c.href);
      all.setAttribute('data-i18n', 'home_view_all');
      head.appendChild(all);
      group.appendChild(head);

      items.forEach(function (t) {
        var row = node('div', 'v2-row');
        var link = node('a', 'v2-row-link');
        link.href = url(t.href);
        link.addEventListener('click', function () { trackOpen(t.id); });
        link.appendChild(label('span', 'v2-row-name', t, 'name'));
        link.appendChild(label('span', 'v2-row-short', t, 'desc'));
        row.appendChild(link);

        var isFav = favs.indexOf(t.id) > -1;
        var star = node('button', 'v2-star-btn', isFav ? '★' : '☆');
        star.type = 'button';
        star.setAttribute('aria-pressed', isFav ? 'true' : 'false');
        star.setAttribute('aria-label', translated(isFav ? 'directory_unfavorite' : 'directory_favorite', '즐겨찾기') + ': ' + translated(t.key, t.name));
        star.addEventListener('click', function () { toggleFav(t.id); });
        row.appendChild(star);

        group.appendChild(row);
      });

      el.index.appendChild(group);
    });

    if (el.indexTitle) {
      el.indexTitle.textContent = query ? '검색 결과' : '전체 도구';
      el.indexTitle.setAttribute('data-i18n', query ? 'home_search_results' : 'home_index_title');
    }
    if (el.indexCount) { el.indexCount.textContent = String(filtered.length); }
    if (el.empty) { el.empty.hidden = !(query && filtered.length === 0); }
  }

  // 사이드바 행: 도구 이름(좌) + 짧은 라벨(우). tool-sidebar.js 의 관련 도구와 동일한 형태.
  function sideRow(t) {
    var a = node('a', 'v2-side-row');
    a.href = url(t.href);
    a.appendChild(label('span', 'v2-side-name', t, 'name'));
    a.appendChild(node('span', 'v2-side-short', t.short || ''));
    return a;
  }

  // 즐겨찾기 행: 링크 + 즐겨찾기 해제(★) 버튼
  function favRow(t) {
    var row = node('div', 'v2-fav-row');
    var link = node('a', 'v2-fav-link');
    link.href = url(t.href);
    link.appendChild(label('span', 'v2-side-name', t, 'name'));
    link.appendChild(node('span', 'v2-side-short', t.short || ''));
    row.appendChild(link);

    var btn = node('button', 'v2-fav-remove', '★');
    btn.type = 'button';
    btn.setAttribute('aria-label', translated('directory_unfavorite', '즐겨찾기 해제') + ': ' + translated(t.key, t.name));
    btn.addEventListener('click', function () { toggleFav(t.id); });
    row.appendChild(btn);
    return row;
  }

  function renderRecent() {
    if (!el.recent) { return; }
    var list = recent.map(byId).filter(Boolean);
    el.recent.innerHTML = '';
    list.forEach(function (t) { el.recent.appendChild(sideRow(t)); });
    if (el.recentSection) { el.recentSection.hidden = !list.length || !!query; }
  }

  function renderFavs() {
    if (!el.favs) { return; }
    var list = favs.map(byId).filter(Boolean);
    el.favs.innerHTML = '';
    list.forEach(function (t) { el.favs.appendChild(favRow(t)); });
    if (el.favSection) { el.favSection.hidden = !list.length || !!query; }
  }

  // 최근 사용·즐겨찾기가 모두 비어 있으면 사이드바를 접고 메인이 전체 폭을 쓴다.
  function syncSidebar() {
    if (!el.layout) { return; }
    var visible = (el.recentSection && !el.recentSection.hidden) ||
                  (el.favSection && !el.favSection.hidden);
    el.layout.classList.toggle('has-side', visible);
  }

  function render() {
    renderIndex();
    renderRecent();
    renderFavs();
    syncSidebar();
    // 동적으로 만든 노드의 data-i18n 적용
    if (typeof applyLanguage === 'function' && typeof getCurrentLanguage === 'function') {
      applyLanguage(getCurrentLanguage());
    }
  }

  /* ---------- 이벤트 ---------- */

  if (el.search) {
    el.search.addEventListener('input', function (e) {
      query = e.target.value.trim();
      render();
    });
  }
  if (el.searchBtn) {
    el.searchBtn.addEventListener('click', function () { if (el.search) { el.search.focus(); } });
  }
  if (el.clearSearch) {
    el.clearSearch.addEventListener('click', function () {
      query = '';
      if (el.search) { el.search.value = ''; }
      render();
    });
  }
  if (el.clearRecent) {
    el.clearRecent.addEventListener('click', function () {
      recent = [];
      write(RECENT_KEY, recent);
      render();
    });
  }

  document.addEventListener('v2:language', render);

  render();
})();
