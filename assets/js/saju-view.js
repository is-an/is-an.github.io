/* =========================================================
   saju-view.js — 사주 페이지 DOM 렌더 (계산은 assets/js/saju/* 모듈 담당)
   ---------------------------------------------------------
   계산 로직: assets/js/saju/saju-calculator.js
   원시 데이터: assets/js/saju/saju-data.js
   해석 문구: assets/js/saju/saju-interpretation.js
   오늘의 운세 + 캐시: assets/js/saju/saju-fortune.js
   이 파일은 위 모듈을 불러 화면에 그리는 역할만 담당한다.
   ========================================================= */

(function () {
  var D = window.SajuData;
  var Calc = window.SajuCalculator;
  var Interp = window.SajuInterpretation;
  var Fortune = window.SajuFortune;
  if (!D || !Calc || !Interp || !Fortune) { return; }

  var PILLAR_READINGS = ['뿌리·환경', '성장기·사회', '자기 자신', '말년·결실'];

  function pad(n) { return String(n).padStart(2, '0'); }

  var el = {
    date: document.getElementById('birthDate'),
    time: document.getElementById('birthTime'),
    gender: document.getElementById('gender'),
    calendarSolar: document.getElementById('calendarSolar'),
    btn: document.getElementById('sajuBtn'),
    error: document.getElementById('sajuError'),
    result: document.getElementById('sajuResult'),
    meta: document.getElementById('sajuMeta'),
    pillars: document.getElementById('pillars'),
    hourNotice: document.getElementById('hourNotice'),
    timeCorrectionNote: document.getElementById('timeCorrectionNote'),
    elements: document.getElementById('elements'),
    yinYangBar: document.getElementById('yinYangBar'),
    yinYangCopy: document.getElementById('yinYangCopy'),
    dayLabel: document.getElementById('dayStemLabel'),
    dayCopy: document.getElementById('dayStemCopy'),
    tenGods: document.getElementById('tenGods'),
    relationsBlock: document.getElementById('relationsBlock'),
    relations: document.getElementById('relations'),
    fortuneDate: document.getElementById('fortuneDate'),
    fortuneList: document.getElementById('fortuneList'),
    luckyInfo: document.getElementById('luckyInfo'),
    copy: document.getElementById('copyBtn'),
    share: document.getElementById('shareBtn')
  };
  if (!el.date) { return; }

  var current = null;

  function fillHours() {
    var opts = ['<option value="">모름</option>'];
    for (var i = 0; i < 24; i++) {
      var v = pad(i);
      opts.push('<option value="' + v + '"' + (v === '09' ? ' selected' : '') + '>' + v + ':00</option>');
    }
    el.time.innerHTML = opts.join('');
  }

  function renderPillars(saju) {
    el.pillars.innerHTML = saju.pillars.map(function (p, i) {
      var stem = p.stem === null ? '—' : D.STEMS[p.stem];
      var branch = p.branch === null ? '—' : D.BRANCHES[p.branch];
      var stemColor = p.stem === null ? 'var(--v2-ink-muted)' : D.ELEMENTS[D.STEM_ELEMENT[p.stem]].color;
      var branchColor = p.branch === null ? 'var(--v2-ink-muted)' : D.ELEMENTS[D.BRANCH_ELEMENT[p.branch]].color;
      var reading = p.stem === null ? '출생시간 미입력' : PILLAR_READINGS[i];
      return '<div class="v2-pillar">' +
        '<p class="v2-pillar-label">' + D.PILLAR_LABELS[i] + '</p>' +
        '<div class="v2-pillar-char" style="color:' + stemColor + '">' + stem + '</div>' +
        '<div class="v2-pillar-char" style="color:' + branchColor + '">' + branch + '</div>' +
        '<p class="v2-pillar-reading">' + reading + '</p>' +
      '</div>';
    }).join('');
    el.hourNotice.hidden = saju.hour !== null;
    el.timeCorrectionNote.hidden = saju.solarTimeCorrectionMin === null;
  }

  function renderElements(elements) {
    el.elements.innerHTML = elements.map(function (e) {
      var w = Math.round(e.ratio * 100);
      return '<div class="v2-element-row">' +
        '<span class="v2-element-name">' + e.name + '</span>' +
        '<span class="v2-element-track"><span class="v2-element-bar" style="width:' + w + '%;background:' + e.color + '"></span></span>' +
        '<span class="v2-element-count">' + e.count + '</span>' +
        '<span class="v2-element-trait">' + e.trait + '</span>' +
      '</div>';
    }).join('');
  }

  function renderYinYang(saju) {
    var summary = Interp.getYinYangSummary(saju.yinYang);
    el.yinYangBar.style.width = summary.yangPct + '%';
    el.yinYangBar.textContent = '양 ' + summary.yangPct + '% · 음 ' + summary.eumPct + '%';
    el.yinYangCopy.textContent = summary.copy;
  }

  function renderDayStem(saju) {
    var summary = Interp.getDayStemSummary(saju.pillars[2].stem, saju.pillars[2].branch);
    el.dayLabel.textContent = summary.label;
    el.dayCopy.textContent = summary.copy;
  }

  function renderTenGods(saju) {
    el.tenGods.innerHTML = saju.tenGods.map(function (t) {
      if (t.isSelf) {
        return '<div class="v2-tengod-row v2-tengod-self">' +
          '<span class="v2-tengod-pillar">' + t.pillar + '</span>' +
          '<span class="v2-tengod-name">일간(나)</span>' +
        '</div>';
      }
      if (!t.god) {
        return '<div class="v2-tengod-row">' +
          '<span class="v2-tengod-pillar">' + t.pillar + '</span>' +
          '<span class="v2-tengod-name">—</span>' +
          '<span class="v2-tengod-desc">출생시간 미입력</span>' +
        '</div>';
      }
      return '<div class="v2-tengod-row">' +
        '<span class="v2-tengod-pillar">' + t.pillar + '</span>' +
        '<span class="v2-tengod-name">' + t.god + '</span>' +
        '<span class="v2-tengod-desc">' + Interp.getTenGodDescription(t.god) + '</span>' +
      '</div>';
    }).join('');
  }

  function renderRelations(saju) {
    var groups = Interp.describeRelations(saju.relations);
    if (!groups.length) {
      el.relationsBlock.hidden = true;
      return;
    }
    el.relationsBlock.hidden = false;
    el.relations.innerHTML = groups.map(function (g) {
      var names = g.items.map(function (item) {
        return '<span class="v2-relation-tag">' + item.name + ' (' + item.pillars.join('·') + ')</span>';
      }).join('');
      return '<div class="v2-relation-group">' +
        '<div class="v2-relation-tags">' + names + '</div>' +
        '<p class="v2-relation-desc">' + g.description + '</p>' +
      '</div>';
    }).join('');
  }

  function scoreLevelClass(score) {
    if (score < 40) { return 'v2-fortune-low'; }
    if (score < 70) { return 'v2-fortune-mid'; }
    return 'v2-fortune-high';
  }

  // 캐시에서 읽은 문구도 HTML이 아닌 텍스트로 표시한다.
  function escapeFortuneText(text) {
    var entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(text).replace(/[&<>"']/g, function (character) { return entities[character]; });
  }

  function renderFortune(fortuneData) {
    el.fortuneDate.textContent = fortuneData.date + ' 기준';
    el.fortuneList.innerHTML = fortuneData.fortune.map(function (f) {
      return '<div class="v2-fortune-row">' +
        '<div class="v2-fortune-row-head">' +
          '<span class="v2-fortune-label">' + escapeFortuneText(f.label) + '</span>' +
          '<span class="v2-fortune-score">' + f.score + '점</span>' +
        '</div>' +
        '<div class="v2-fortune-track"><span class="v2-fortune-bar ' + scoreLevelClass(f.score) + '" style="width:' + f.score + '%"></span></div>' +
        '<p class="v2-fortune-message">' + escapeFortuneText(f.message) + '</p>' +
      '</div>';
    }).join('');

    var lucky = fortuneData.lucky;
    el.luckyInfo.innerHTML =
      '<div class="v2-lucky-item"><span class="v2-lucky-label">행운의 색</span><span class="v2-lucky-value">' + escapeFortuneText(lucky.color) + '</span></div>' +
      '<div class="v2-lucky-item"><span class="v2-lucky-label">행운의 숫자</span><span class="v2-lucky-value">' + escapeFortuneText(lucky.number) + '</span></div>' +
      '<div class="v2-lucky-item"><span class="v2-lucky-label">행운의 시간</span><span class="v2-lucky-value">' + escapeFortuneText(lucky.time) + '</span></div>' +
      '<div class="v2-lucky-item"><span class="v2-lucky-label">오늘의 키워드</span><span class="v2-lucky-value">' + escapeFortuneText(lucky.keyword) + '</span></div>';
  }

  function calculate() {
    el.error.hidden = true;
    if (!el.date.value) { el.result.hidden = true; current = null; return; }

    var input = {
      birthDate: el.date.value,
      birthTime: el.time.value,
      gender: el.gender.value,
      calendarType: (el.calendarSolar && el.calendarSolar.checked) ? 'solar' : 'lunar'
    };

    var saju = Calc.calculateSaju(input);
    if (!saju.ok) {
      el.result.hidden = true;
      current = null;
      el.error.hidden = false;
      el.error.textContent = saju.errors.join(' ');
      return;
    }

    renderPillars(saju);
    renderElements(saju.elements);
    renderYinYang(saju);
    renderDayStem(saju);
    renderTenGods(saju);
    renderRelations(saju);

    var todayStr = dateToInputValue(new Date());
    var fortuneData = Fortune.generateFortune(saju, todayStr, input);
    renderFortune(fortuneData);

    el.meta.textContent = saju.effectiveYear + '년 기준 · ' +
      (el.gender.value === 'male' ? '남성' : '여성') +
      (saju.hour === null ? ' · 시주 제외' : ' · ' + pad(saju.hour) + ':00');

    current = saju;
    el.result.hidden = false;
    el.copy.textContent = '결과 복사';
    el.share.textContent = '링크 공유';
  }

  el.btn.addEventListener('click', calculate);

  el.copy.addEventListener('click', function () {
    if (!current) { return; }
    var text = '사주팔자 · ' + current.pillars.map(function (p) {
      return (p.stem === null ? '—' : D.STEMS[p.stem]) + (p.branch === null ? '—' : D.BRANCHES[p.branch]);
    }).join(' ') + ' (일간 ' + D.STEMS[current.pillars[2].stem] + ')';
    try { navigator.clipboard.writeText(text); } catch (e) {}
    el.copy.textContent = '복사됨';
  });

  el.share.addEventListener('click', function () {
    var url = window.location.origin + window.location.pathname +
      '?d=' + el.date.value + (el.time.value ? '&t=' + el.time.value : '');
    if (navigator.share) {
      try { navigator.share({ title: '무료 사주팔자 풀이', url: url }); } catch (e) {}
    } else {
      try { navigator.clipboard.writeText(url); } catch (e) {}
    }
    el.share.textContent = '링크 복사됨';
  });

  /* 초기화 */
  fillHours();

  var params = new URLSearchParams(window.location.search);
  var d = params.get('d');
  var t = params.get('t');
  if (/^\d{4}-\d{2}-\d{2}$/.test(d || '')) { el.date.value = d; }
  if (/^\d{2}$/.test(t || '')) { el.time.value = t; }

  calculate();

  if (typeof renderRelatedTools === 'function') {
    renderRelatedTools('relatedList', ['age', 'dday', 'lotto', 'discharge']);
  }
})();
