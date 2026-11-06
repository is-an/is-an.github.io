/* =========================================================
   header-nav.js — 도구 검색 팝업 (탐색 메뉴는 모든 화면에서 표시)
   ---------------------------------------------------------
   ▸ common.js 는 헤더를 fetch 로 주입하므로 주입 시점을 기다립니다.
   ▸ common.js 다음에 로드하세요. 모든 페이지에 넣어도 안전합니다.
   ========================================================= */

(function () {
  function basePath() {
    if (typeof getSiteBasePath === 'function') {
      try { return getSiteBasePath() || ''; } catch (e) {}
    }
    return '';
  }

  function t(key, fallback) {
    if (!key) { return fallback; }
    try {
      if (typeof translate === 'function' && typeof getCurrentLanguage === 'function') {
        var v = translate(key, getCurrentLanguage());
        if (v && v !== key) { return v; }
      }
    } catch (e) {}
    return fallback;
  }

  /* ---------- 도구 검색 팝업 ---------- */
  var overlay, input, resultsEl, tools = null, toolsPromise, activeIdx = -1, savedOverflow;

  function loadTools(cb) {
    if (window.SITE_TOOLS && window.SITE_TOOLS.TOOLS) {
      tools = window.SITE_TOOLS.TOOLS;
      cb();
      return;
    }
    if (!toolsPromise) {
      toolsPromise = new Promise(function (resolve, reject) {
        var s = document.createElement('script');
        s.src = basePath() + '/assets/js/tools-data.js';
        s.onload = function () {
          if (window.SITE_TOOLS && Array.isArray(window.SITE_TOOLS.TOOLS)) { resolve(window.SITE_TOOLS.TOOLS); }
          else { reject(new Error('Invalid tools-data')); }
        };
        s.onerror = function () { s.remove(); reject(new Error('tools-data load failed')); };
        document.head.appendChild(s);
      });
    }
    toolsPromise.then(function (loaded) { tools = loaded; cb(); }).catch(function () {
      toolsPromise = null;
      resultsEl.textContent = t('header_search_error', '도구 목록을 불러오지 못했습니다. 검색을 닫고 다시 열어 주세요.');
    });
  }

  function catName(cat) {
    var cats = window.SITE_TOOLS && window.SITE_TOOLS.CATEGORIES;
    if (!cats) { return ''; }
    for (var i = 0; i < cats.length; i++) {
      if (cats[i].id === cat) { return t(cats[i].key, cats[i].name); }
    }
    return '';
  }

  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'v2-search-overlay';
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="v2-search-modal" role="dialog" aria-modal="true" data-i18n-aria-label="home_searchLabel" aria-label="도구 검색">' +
      '<div class="v2-search-modal-head">' +
      '<input type="text" class="v2-search-modal-input" id="siteSearchInput" autocomplete="off" ' +
      'spellcheck="false" data-i18n-aria-label="home_searchLabel" aria-label="도구 검색" data-i18n-placeholder="home_searchLabel" placeholder="도구 검색">' +
      '<button type="button" class="v2-search-close" data-i18n-aria-label="header_search_close" aria-label="검색 닫기">&times;</button></div>' +
      '<div class="v2-search-modal-results" id="siteSearchResults" aria-live="polite"></div>' +
      '</div>';
    document.body.appendChild(overlay);
    input = overlay.querySelector('#siteSearchInput');
    resultsEl = overlay.querySelector('#siteSearchResults');
    input.placeholder = t('home_searchLabel', '도구 검색');

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) { closeSearch(); }
    });
    input.addEventListener('input', renderResults);
    input.addEventListener('keydown', onKey);
    overlay.querySelector('.v2-search-close').addEventListener('click', closeSearch);
    overlay.addEventListener('keydown', function (e) {
      // 검색 중 입력이 페이지의 게임 단축키로 전달되지 않도록 한다.
      e.stopPropagation();
      if (e.key === 'Escape') { e.preventDefault(); closeSearch(); return; }
      if (e.key !== 'Tab') { return; }
      var focusable = overlay.querySelectorAll('input, button, a[href]');
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });
  }

  function openSearch(trigger) {
    if (!overlay) { buildOverlay(); }
    // 헤더 팝업은 한 번에 하나만: 다른 팝업(메뉴/언어)을 닫는다.
    document.dispatchEvent(new CustomEvent('v2:popup', { detail: 'search' }));
    if (overlay.hidden) { savedOverflow = document.body.style.overflow; }
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    overlay._trigger = trigger || null;
    if (trigger) { trigger.setAttribute('aria-expanded', 'true'); }
    if (typeof applyLanguage === 'function') { applyLanguage(getCurrentLanguage()); }
    resultsEl.textContent = t('header_search_loading', '도구 목록을 불러오는 중입니다.');
    loadTools(renderResults);
    input.focus();
  }

  document.addEventListener('v2:popup', function (e) {
    if (e.detail !== 'search') { closeSearch(); }
  });

  function closeSearch() {
    if (!overlay || overlay.hidden) { return; }
    overlay.hidden = true;
    document.body.style.overflow = savedOverflow;
    activeIdx = -1;
    if (overlay._trigger) {
      overlay._trigger.setAttribute('aria-expanded', 'false');
      overlay._trigger.focus();
    }
  }

  function renderResults() {
    if (!resultsEl) { return; }
    var q = (input.value || '').trim().toLowerCase();
    var words = q.split(/\s+/).filter(Boolean);
    var list = [];
    if (tools && tools.length) {
      list = tools.filter(function (item) {
        if (!words.length) { return true; }
        var hay = (item.name + ' ' + t(item.key, item.name) + ' ' + t(item.descKey, item.desc || '') + ' ' + (item.short || '') + ' ' + (item.keywords || '')).toLowerCase();
        return words.every(function (w) { return hay.indexOf(w) > -1; });
      }).slice(0, 8);
    }

    resultsEl.innerHTML = '';
    activeIdx = -1;

    if (!list.length) {
      var empty = document.createElement('p');
      empty.className = 'v2-search-modal-empty';
      empty.textContent = q
        ? t('home_empty_title', '검색 결과가 없습니다.')
        : t('header_search_hint', '도구 이름을 입력하세요.');
      resultsEl.appendChild(empty);
      return;
    }

    list.forEach(function (item) {
      var a = document.createElement('a');
      a.className = 'v2-search-result';
      a.href = basePath() + item.href;
      var name = document.createElement('span');
      name.className = 'v2-search-result-name';
      name.textContent = t(item.key, item.name);
      var cat = document.createElement('span');
      cat.className = 'v2-search-result-cat';
      cat.textContent = catName(item.cat);
      a.appendChild(name);
      a.appendChild(cat);
      resultsEl.appendChild(a);
    });
  }

  function onKey(e) {
    var items = resultsEl.querySelectorAll('.v2-search-result');
    if (e.key === 'Escape') {
      closeSearch();
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!items.length) { return; }
      e.preventDefault();
      activeIdx += (e.key === 'ArrowDown' ? 1 : -1);
      if (activeIdx < 0) { activeIdx = items.length - 1; }
      if (activeIdx >= items.length) { activeIdx = 0; }
      for (var i = 0; i < items.length; i++) {
        items[i].classList.toggle('is-active', i === activeIdx);
      }
      items[activeIdx].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      var target = activeIdx > -1 ? items[activeIdx] : items[0];
      if (target) { window.location.href = target.href; }
    }
  }

  /* ---------- 헤더 바인딩 ---------- */
  function bind(header) {
    var search = header.querySelector('#headerSearch');

    if (search && search.dataset.searchBound !== 'true') {
      search.dataset.searchBound = 'true';
      search.addEventListener('click', function (e) {
        e.preventDefault();
        openSearch(search);
      });
    }

  }

  function start() {
    var slot = document.getElementById('site-header');
    if (!slot) { return; }

    var existing = slot.querySelector('.site-header');
    if (existing) { bind(existing); return; }

    var observer = new MutationObserver(function () {
      var header = slot.querySelector('.site-header');
      if (header) {
        observer.disconnect();
        bind(header);
      }
    });
    observer.observe(slot, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
