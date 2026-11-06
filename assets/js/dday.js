/* =========================================================
   dday.js — D-Day 계산기
   ---------------------------------------------------------
   계산 규칙: 목표 날짜 − 오늘 날짜. 오늘은 0일째.
     diff > 0  → D-N   (남은 날짜)
     diff = 0  → D-Day (오늘)
     diff < 0  → D+N   (지난 날짜)
   ========================================================= */

(function () {
  var FAV_KEY = 'isan:favorites';
  var TOOL_ID = 'dday';
  var KO_DAY = ['일', '월', '화', '수', '목', '금', '토'];

  function pad(n) { return String(n).padStart(2, '0'); }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function dayOnly(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function fmt(d) {
    return d.getFullYear() + '년 ' + (d.getMonth() + 1) + '월 ' + d.getDate() + '일 (' + KO_DAY[d.getDay()] + ')';
  }
  function read(key, fallback) {
    try {
      var saved = JSON.parse(localStorage.getItem(key) || fallback);
      return Array.isArray(saved) ? saved.filter(function (id) { return typeof id === 'string'; }) : [];
    } catch (e) { return JSON.parse(fallback); }
  }

  var el = {
    date: document.getElementById('targetDate'),
    today: document.getElementById('todayText'),
    presets: document.getElementById('presetRow'),
    calc: document.getElementById('calcBtn'),
    reset: document.getElementById('resetBtn'),
    result: document.getElementById('result'),
    label: document.getElementById('resultLabel'),
    number: document.getElementById('resultNumber'),
    detail: document.getElementById('resultDetail'),
    copy: document.getElementById('copyBtn'),
    share: document.getElementById('shareBtn'),
    fav: document.getElementById('favBtn')
  };
  if (!el.date) { return; }

  var favs = read(FAV_KEY, '[]');
  var current = null;

  function calculate() {
    var v = el.date.value;
    if (!v) { el.result.hidden = true; current = null; return; }

    var p = v.split('-').map(Number);
    var target = new Date(p[0], p[1] - 1, p[2]);
    if (isNaN(target.getTime())) { el.result.hidden = true; current = null; return; }

    var diff = Math.round((target - dayOnly(new Date())) / 86400000);
    var label, number, detail;

    if (diff > 0) {
      label = '남은 날짜'; number = 'D-' + diff;
      detail = fmt(target) + '까지 ' + diff + '일 남았습니다.';
    } else if (diff === 0) {
      label = '오늘'; number = 'D-Day';
      detail = fmt(target) + ', 바로 오늘입니다.';
    } else {
      label = '지난 날짜'; number = 'D+' + Math.abs(diff);
      detail = fmt(target) + '로부터 ' + Math.abs(diff) + '일 지났습니다.';
    }

    current = { number: number, detail: detail };
    el.label.textContent = label;
    el.number.textContent = number;
    el.detail.textContent = detail;
    el.result.hidden = false;
    el.copy.textContent = '결과 복사';
    el.share.textContent = '링크 공유';
  }

  function buildPresets() {
    var today = new Date();
    var list = [
      { label: '30일 후', days: 30 },
      { label: '100일 후', days: 100 },
      { label: '1년 후', days: 365 },
      { label: '올해 12월 31일', date: today.getFullYear() + '-12-31' }
    ];
    list.forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'v2-preset';
      b.textContent = p.label;
      b.addEventListener('click', function () {
        el.date.value = p.date
          ? p.date
          : iso(new Date(today.getFullYear(), today.getMonth(), today.getDate() + p.days));
        calculate();
      });
      el.presets.appendChild(b);
    });
  }

  function paintFav() {
    var on = favs.indexOf(TOOL_ID) > -1;
    el.fav.textContent = on ? '★ 즐겨찾기 해제' : '☆ 즐겨찾기';
    el.fav.setAttribute('aria-pressed', on ? 'true' : 'false');
  }

  el.date.addEventListener('change', calculate);
  el.calc.addEventListener('click', calculate);
  el.reset.addEventListener('click', function () {
    el.date.value = '';
    el.result.hidden = true;
    current = null;
  });

  el.copy.addEventListener('click', function () {
    if (!current) { return; }
    var text = 'D-Day 계산기 · ' + current.number + ' — ' + current.detail;
    try { navigator.clipboard.writeText(text); } catch (e) {}
    el.copy.textContent = '복사됨';
  });

  el.share.addEventListener('click', function () {
    var url = window.location.origin + window.location.pathname + '?date=' + el.date.value;
    if (navigator.share) {
      try { navigator.share({ title: 'D-Day 계산기', url: url }); } catch (e) {}
    } else {
      try { navigator.clipboard.writeText(url); } catch (e) {}
    }
    el.share.textContent = '링크 복사됨';
  });

  el.fav.addEventListener('click', function () {
    favs = favs.indexOf(TOOL_ID) > -1
      ? favs.filter(function (x) { return x !== TOOL_ID; })
      : [TOOL_ID].concat(favs);
    try { localStorage.setItem(FAV_KEY, JSON.stringify(favs)); } catch (e) {}
    paintFav();
  });

  /* 초기화 */
  var today = new Date();
  el.today.textContent = fmt(today);
  buildPresets();
  paintFav();

  var fromUrl = new URLSearchParams(window.location.search).get('date');
  el.date.value = /^\d{4}-\d{2}-\d{2}$/.test(fromUrl || '')
    ? fromUrl
    : iso(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 120));
  calculate();

  if (typeof renderRelatedByCategory === 'function') {
    renderRelatedByCategory('relatedList', 'cal', TOOL_ID, 5);
  }
  if (typeof renderGuideList === 'function') {
    renderGuideList('guideList', 3);
  }
})();
