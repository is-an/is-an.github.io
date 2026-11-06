/* =========================================================
   saju-fortune.js — 오늘의 운세 (deterministic) + LocalStorage 캐시
   ---------------------------------------------------------
   ▸ Math.random()을 단독으로 쓰지 않는다. "사용자 사주 + 오늘 날짜"
     문자열을 해시해 시드로 삼고, 시드 기반 PRNG(mulberry32)로만
     점수/문구를 뽑는다 → 같은 사용자 + 같은 날짜는 새로고침해도
     항상 같은 결과.
   ▸ 오늘 하루치 결과는 LocalStorage에 캐시하고, 날짜가 바뀌면
     새 캐시 키를 쓰므로 자동으로 새 운세가 생성된다.
   ========================================================= */

(function (global) {
  var CACHE_PREFIX = 'fortune_';
  var CACHE_VERSION = '1.0';
  var CACHE_MAX_AGE_DAYS = 30;

  var CATEGORIES = [
    { key: 'overall', label: '전체운' },
    { key: 'love', label: '연애운' },
    { key: 'money', label: '재물운' },
    { key: 'career', label: '직업운' },
    { key: 'relationship', label: '대인관계운' },
    { key: 'health', label: '건강운' }
  ];

  var MESSAGE_POOL = {
    overall: {
      low: ['오늘은 무리한 결정을 미루고 흐름을 지켜보는 것이 좋습니다.', '평소보다 신중하게 움직이면 실수를 줄일 수 있는 하루입니다.'],
      mid: ['크게 튀지 않아도 계획한 만큼은 무난하게 진행되는 하루입니다.', '평소 페이스를 유지하는 것만으로 충분한 하루입니다.'],
      high: ['생각한 일들이 순조롭게 풀리는 흐름이니 적극적으로 움직여도 좋습니다.', '평소보다 자신감 있게 나서면 좋은 결과로 이어질 수 있는 하루입니다.']
    },
    love: {
      low: ['오늘은 감정 표현보다 상대의 말을 먼저 들어주는 것이 좋습니다.', '사소한 오해가 생기기 쉬우니 말투에 조금 더 신경 써보세요.'],
      mid: ['평소와 비슷한 편안한 흐름이 이어지는 하루입니다.', '무리한 기대보다는 있는 그대로의 관계를 즐기기 좋은 날입니다.'],
      high: ['솔직한 마음을 표현하면 관계가 한 걸음 더 가까워질 수 있습니다.', '새로운 인연이나 기분 좋은 연락이 생길 수 있는 하루입니다.']
    },
    money: {
      low: ['충동적인 지출은 피하고 계획한 예산만 사용하는 것이 좋습니다.', '큰 결정이나 계약은 하루 더 미뤄보는 것을 권합니다.'],
      mid: ['수입과 지출이 평소처럼 안정적으로 유지되는 하루입니다.', '무리한 투자보다는 현재 흐름을 유지하는 것이 좋습니다.'],
      high: ['예상하지 못한 좋은 소식이나 이득이 생길 수 있는 하루입니다.', '평소 미뤄둔 재정 계획을 실행하기에 좋은 흐름입니다.']
    },
    career: {
      low: ['새 일을 벌이기보다 마무리 짓는 데 집중하는 것이 좋습니다.', '동료와의 의견 차이가 생길 수 있으니 조율에 신경 써보세요.'],
      mid: ['맡은 업무를 무난하게 처리해 나갈 수 있는 하루입니다.', '평소 하던 방식대로 꾸준히 진행하면 충분한 하루입니다.'],
      high: ['적극적으로 제안하거나 나서면 좋은 평가로 이어질 수 있습니다.', '중요한 미팅이나 발표에서 좋은 흐름을 탈 수 있는 하루입니다.']
    },
    relationship: {
      low: ['말이 많아지면 오해가 생기기 쉬우니 한 번 더 생각하고 말해보세요.', '무리한 약속보다는 혼자만의 시간도 필요한 하루입니다.'],
      mid: ['평소와 비슷한 무난한 인간관계가 이어지는 하루입니다.', '가까운 사람과의 소통이 편안하게 흘러가는 날입니다.'],
      high: ['주변 사람들에게 도움을 받거나 좋은 제안을 받을 수 있습니다.', '오랜만에 반가운 사람과 연락이 닿을 수 있는 하루입니다.']
    },
    health: {
      low: ['평소보다 피로가 쉽게 쌓일 수 있으니 충분한 휴식을 챙기세요.', '무리한 일정보다는 컨디션 관리를 우선하는 것이 좋습니다.'],
      mid: ['컨디션이 대체로 평이하게 유지되는 하루입니다.', '가벼운 스트레칭이나 산책으로 몸을 가볍게 해보세요.'],
      high: ['활력이 좋아 평소보다 컨디션이 좋게 느껴질 수 있는 하루입니다.', '몸과 마음이 안정적이라 새로운 활동을 시작하기 좋습니다.']
    }
  };

  var LUCKY_COLORS = ['청록색', '붉은색', '노란색', '흰색', '검은색', '보라색', '주황색', '초록색'];
  var LUCKY_KEYWORDS = ['도전', '휴식', '정리', '소통', '인내', '기회', '균형', '집중', '여유', '성장', '경청', '결단'];
  var HOUR_BRANCH_LABEL = [
    '23:00~01:00(자시)', '01:00~03:00(축시)', '03:00~05:00(인시)', '05:00~07:00(묘시)',
    '07:00~09:00(진시)', '09:00~11:00(사시)', '11:00~13:00(오시)', '13:00~15:00(미시)',
    '15:00~17:00(신시)', '17:00~19:00(유시)', '19:00~21:00(술시)', '21:00~23:00(해시)'
  ];

  /* ---------- 해시 / 시드 PRNG ---------- */

  /** FNV-1a 32bit 문자열 해시 (Math.random 미사용, 완전 결정적) */
  function hashString(str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }

  /** mulberry32 — 시드 하나로 여러 개의 결정적 의사난수를 뽑는 소형 PRNG */
  function mulberry32(seed) {
    var t = seed >>> 0;
    return function () {
      t |= 0; t = (t + 0x6D2B79F5) | 0;
      var r = Math.imul(t ^ (t >>> 15), 1 | t);
      r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pick(rng, arr) {
    return arr[Math.floor(rng() * arr.length) % arr.length];
  }

  function scoreBand(score) {
    if (score < 40) { return 'low'; }
    if (score < 70) { return 'mid'; }
    return 'high';
  }

  /* ---------- 사용자 ID / 캐시 키 ---------- */

  function createUserId(input) {
    var raw = [
      input.birthDate || '',
      input.calendarType || 'solar',
      input.leapMonth ? '1' : '0',
      input.gender || '',
      input.birthTime === null || input.birthTime === undefined ? '' : input.birthTime
    ].join('|');
    return hashString(raw).toString(36);
  }

  function createFortuneCacheKey(userId, dateStr) {
    return CACHE_PREFIX + dateStr + '_' + userId;
  }

  function loadFortuneCache(cacheKey) {
    try {
      var raw = window.localStorage.getItem(cacheKey);
      if (!raw) { return null; }
      var data = JSON.parse(raw);
      if (!data || data.version !== CACHE_VERSION) { return null; }
      if (!Array.isArray(data.fortune) || data.fortune.length !== CATEGORIES.length ||
          !data.fortune.every(function (item, index) {
            return item && item.key === CATEGORIES[index].key &&
              typeof item.label === 'string' && typeof item.message === 'string' &&
              Number.isFinite(item.score) && item.score >= 0 && item.score <= 100;
          }) || !data.lucky ||
          typeof data.lucky.color !== 'string' || typeof data.lucky.time !== 'string' ||
          typeof data.lucky.keyword !== 'string' || !Number.isInteger(data.lucky.number) ||
          data.lucky.number < 1 || data.lucky.number > 9) { return null; }
      return data;
    } catch (e) {
      return null;
    }
  }

  function saveFortuneCache(cacheKey, data) {
    try {
      window.localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (e) { /* localStorage 사용 불가 환경은 조용히 무시 */ }
  }

  function cleanupOldCache() {
    try {
      var today = new Date();
      var keysToRemove = [];
      for (var i = 0; i < window.localStorage.length; i++) {
        var key = window.localStorage.key(i);
        if (!key || key.indexOf(CACHE_PREFIX) !== 0) { continue; }
        var dateMatch = key.slice(CACHE_PREFIX.length).match(/^(\d{4}-\d{2}-\d{2})_/);
        if (!dateMatch) { continue; }
        var cachedDate = new Date(dateMatch[1]);
        var ageDays = Math.floor((today - cachedDate) / 86400000);
        if (ageDays > CACHE_MAX_AGE_DAYS) { keysToRemove.push(key); }
      }
      keysToRemove.forEach(function (key) { window.localStorage.removeItem(key); });
      return keysToRemove.length;
    } catch (e) {
      return 0;
    }
  }

  /* ---------- 운세 생성 ---------- */

  function sajuFingerprint(sajuResult) {
    return sajuResult.pillars.map(function (p) { return p.stem + '-' + p.branch; }).join(',');
  }

  function buildFortune(seedString) {
    var seed = hashString(seedString);
    var rng = mulberry32(seed);

    var scores = {};
    var messages = {};
    CATEGORIES.forEach(function (cat) {
      var score = Math.floor(rng() * 101);
      scores[cat.key] = score;
      messages[cat.key] = pick(rng, MESSAGE_POOL[cat.key][scoreBand(score)]);
    });

    var lucky = {
      color: pick(rng, LUCKY_COLORS),
      number: Math.floor(rng() * 9) + 1,
      time: pick(rng, HOUR_BRANCH_LABEL),
      keyword: pick(rng, LUCKY_KEYWORDS)
    };

    return {
      categories: CATEGORIES.map(function (cat) {
        return { key: cat.key, label: cat.label, score: scores[cat.key], message: messages[cat.key] };
      }),
      lucky: lucky
    };
  }

  /**
   * 오늘의 운세를 생성하거나, 오늘자 캐시가 있으면 그대로 반환한다.
   * 같은 사용자(userInput) + 같은 dateStr → 항상 동일한 결과.
   */
  function generateFortune(sajuResult, dateStr, userInput) {
    cleanupOldCache();

    var userId = createUserId(userInput);
    var cacheKey = createFortuneCacheKey(userId, dateStr);
    var cached = loadFortuneCache(cacheKey);
    if (cached) { return cached; }

    var seedString = userId + '|' + dateStr + '|' + sajuFingerprint(sajuResult);
    var fortune = buildFortune(seedString);

    var data = {
      version: CACHE_VERSION,
      date: dateStr,
      userId: userId,
      scores: fortune.categories.reduce(function (acc, c) { acc[c.key] = c.score; return acc; }, {}),
      fortune: fortune.categories,
      lucky: fortune.lucky,
      createdAt: new Date().toISOString()
    };
    saveFortuneCache(cacheKey, data);
    return data;
  }

  global.SajuFortune = {
    CATEGORIES: CATEGORIES,
    createUserId: createUserId,
    createFortuneCacheKey: createFortuneCacheKey,
    loadFortuneCache: loadFortuneCache,
    saveFortuneCache: saveFortuneCache,
    cleanupOldCache: cleanupOldCache,
    generateFortune: generateFortune
  };
})(window);
