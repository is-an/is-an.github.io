// ============ 공통 유틸리티 함수 ============

/**
 * 숫자를 천 단위 구분자로 포매팅
 */
function formatNumber(num) {
  return Math.round(num).toLocaleString("en-US");
}

/**
 * 숫자를 지정된 소수 자리로 반올림
 */
function formatDecimal(num, digits = 2) {
  return Number(num).toFixed(digits);
}

// 저장소 차단/손상으로 게임 진행이 멈추지 않게 기록만 기본값으로 처리한다.
function readStoredNumber(key) {
  try {
    const number = Number(localStorage.getItem(key));
    return Number.isFinite(number) && number >= 0 ? number : 0;
  } catch (e) { return 0; }
}

function writeStoredNumber(key, number) {
  try { localStorage.setItem(key, String(number)); } catch (e) {}
}

/**
 * 텍스트를 클립보드에 복사
 */
function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).catch(() => legacyCopyText(text));
  } else {
    legacyCopyText(text);
  }
  alert("복사되었습니다!");
}

function legacyCopyText(text) {
  const el = document.createElement("textarea");
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
}

// ============ 날짜 관련 유틸리티 함수 ============

/**
 * 시간 부분을 제거한 날짜만 반환
 */
function localDateOnly(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * 한국어 형식으로 날짜 포매팅
 */
function formatDate(date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
}

/**
 * Date 객체를 input type="date" 형식 (YYYY-MM-DD)으로 변환
 */
function dateToInputValue(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * input type="date" 형식 (YYYY-MM-DD)을 Date 객체로 파싱
 */
function parseInputDate(value) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// ============ 탭 전환 로직 (하위 페이지용) ============

/**
 * 계산기 탭 전환 (동일 페이지 내의 여러 탭)
 */
function switchCalcTab(tabName) {
  const contents = document.querySelectorAll(".calc-tab-content");
  const buttons = document.querySelectorAll(".calc-tab-btn");
  
  contents.forEach(c => c.classList.remove("active"));
  buttons.forEach(b => b.classList.remove("active"));
  
  const activeContent = document.getElementById(tabName);
  const activeBtn = document.querySelector(`.calc-tab-btn[data-calc="${tabName}"]`);
  
  if (activeContent) activeContent.classList.add("active");
  if (activeBtn) activeBtn.classList.add("active");
}

/**
 * 계산기 탭 버튼 이벤트 리스너 초기화
 */
function initCalcTabButtons() {
  const calcTabBtns = document.querySelectorAll(".calc-tab-btn");
  calcTabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabName = btn.getAttribute("data-calc");
      switchCalcTab(tabName);
    });
  });
}

// ============ 다크모드 ============

const THEME_STORAGE_KEY = 'theme';

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch (e) {
    return null;
  }
}

function getPreferredTheme() {
  const stored = getStoredTheme();
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
}

function applyTheme(theme) {
  const activeTheme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', activeTheme);
  updateThemeToggleLabel();
}

function setTheme(theme) {
  const activeTheme = theme === 'dark' ? 'dark' : 'light';
  try {
    localStorage.setItem(THEME_STORAGE_KEY, activeTheme);
  } catch (e) {
    // localStorage 사용 불가 환경(프라이벌 모드 등)에서도 테마 전환은 동작하도록 유지
  }
  applyTheme(activeTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  setTheme(current === 'dark' ? 'light' : 'dark');
}

function updateThemeToggleLabel() {
  const btn = document.getElementById('themeToggle');
  if (!btn) {
    return;
  }

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const icon = btn.querySelector('.theme-toggle-icon');
  if (icon) {
    icon.textContent = isDark ? '☀️' : '🌙';
  }

  if (typeof translate === 'function' && typeof getCurrentLanguage === 'function') {
    const lang = getCurrentLanguage();
    const key = isDark ? 'lightMode' : 'darkMode';
    btn.setAttribute('aria-label', translate(key, lang));
  }
}

function initTheme() {
  applyTheme(getPreferredTheme());
}

function attachThemeToggle() {
  const btn = document.getElementById('themeToggle');
  if (!btn || btn.dataset.themeBound === 'true') {
    return;
  }
  btn.dataset.themeBound = 'true';
  btn.addEventListener('click', toggleTheme);
  updateThemeToggleLabel();
}

// 페이지 로드 즉시 테마 상태를 동기화(인라인 스크립트와 중복되어도 안전)
initTheme();

// ============ 공통 Header/Footer 로딩 ============

function getSiteRootPath() {
  const commonScript = Array.from(document.scripts).find(script =>
    script.src && /assets\/js\/common\.js(?:\?.*)?$/.test(script.src)
  );

  if (!commonScript) {
    return '/';
  }

  const scriptUrl = new URL(commonScript.src, window.location.href);
  const pathname = scriptUrl.pathname.replace(/\/assets\/js\/common\.js.*$/, '');
  return pathname || '/';
}

function getSiteBasePath() {
  const siteRoot = getSiteRootPath();
  return siteRoot === '/' ? '' : siteRoot;
}

function ensureFavicon() {
  if (document.querySelector('link[rel~="icon"]')) {
    return;
  }
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/svg+xml';
  link.href = `${getSiteBasePath()}/isa-logo.svg`;
  document.head.appendChild(link);
}

function applyHeaderLinks() {
  const header = document.querySelector('.site-header');
  if (!header) {
    return;
  }

  const siteRootPath = getSiteBasePath();
  const logoLink = header.querySelector('.logo');
  const logoImage = header.querySelector('.logo-img');

  if (logoLink) {
    logoLink.href = `${siteRootPath}/`;
  }

  if (logoImage) {
    logoImage.src = `${siteRootPath}/isa-logo.svg`;
  }

  header.querySelectorAll('[data-tech-category]').forEach((link) => {
    link.href = `${siteRootPath}/guide/#${link.dataset.techCategory}`;
  });

  const currentPath = window.location.pathname.replace(/\/+$/, '');
  const normalizedCurrent = currentPath || '/';

  header.querySelectorAll('.nav-link').forEach((link) => {
    const route = link.dataset.route;
    const routeMap = {
      home: `${siteRootPath}/`,
      tech: `${siteRootPath}/guide/`,
      etc: `${siteRootPath}/faq/`,
      cal: `${siteRootPath}/cal/`,
      lotto: `${siteRootPath}/lotto/`,
      tools: `${siteRootPath}/tools/`,
      games: `${siteRootPath}/games/`,
      blog: `${siteRootPath}/guide/`,
      saju: `${siteRootPath}/saju/`
    };

    const href = routeMap[route] || `${siteRootPath}/`;
    link.href = href;
    link.classList.remove('active');
    link.removeAttribute('aria-current');

    const localPath = normalizedCurrent.slice(siteRootPath.length) || '/';
    const section = /^\/(?:cal|tools|games|lotto|saju|stock)(?:\/|$)/.test(localPath)
      ? 'tools' : /^\/(?:guide|blog)(?:\/|$)/.test(localPath)
        ? 'tech' : /^\/(?:faq|privacy)(?:\/|$)/.test(localPath) ? 'etc' : 'home';
    if (route === section) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'location');
    }
  });
}

function loadComponent(targetId, componentPath) {
  const target = document.getElementById(targetId);
  if (!target) {
    return Promise.resolve();
  }

  return fetch(componentPath, { cache: 'no-cache' })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load ${componentPath}: ${response.status}`);
      }
      return response.text();
    })
    .then((html) => {
      target.innerHTML = html;
      if (targetId === 'site-header') {
        applyHeaderLinks();
        attachThemeToggle();
        if (typeof attachLanguageSwitcher === 'function') {
          attachLanguageSwitcher();
        }
      }
      if (typeof applyLanguage === 'function' && typeof getCurrentLanguage === 'function') {
        applyLanguage(getCurrentLanguage());
      }
    })
    .catch((error) => {
      console.warn(error.message);
      target.innerHTML = '';
    });
}

function initSharedComponents() {
  ensureFavicon();
  const siteRootPath = getSiteBasePath();
  const headerUrl = `${siteRootPath}/components/header.html`;
  const footerUrl = `${siteRootPath}/components/footer.html`;
  const adUrl = `${siteRootPath}/components/ads.html`;

  const headerPromise = loadComponent('site-header', headerUrl);
  const footerPromise = loadComponent('site-footer', footerUrl);
  const adPromise = loadComponent('ads-slot', adUrl);

  return Promise.all([headerPromise, footerPromise, adPromise]);
}

// ============ 메인 홈페이지 검색 및 필터 기능 ============

/**
 * 메인 홈페이지의 도구 검색 및 필터 초기화
 */
function initToolsFilter() {
  const searchInput = document.getElementById('toolSearch');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const toolCards = document.querySelectorAll('.tool-card');
  const categorySections = Array.from(document.querySelectorAll('main section.container'))
    .filter(section => section.querySelector('.tools-grid') && !section.classList.contains('popular-tools') && !section.classList.contains('faq-section'));
  const extraSections = document.querySelectorAll('main section.container.popular-tools, main section.container.faq-section');
  
  if (!searchInput || !toolCards.length) {
    return; // 홈페이지가 아닐 경우 실행하지 않음
  }
  
  function filterTools() {
    const searchTerm = searchInput.value.toLowerCase();
    const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    
    toolCards.forEach(card => {
      const name = card.dataset.name?.toLowerCase() || '';
      const category = card.parentElement.dataset.category || '';
      
      const matchesSearch = name.includes(searchTerm);
      const matchesFilter = activeFilter === 'all' || category === activeFilter;
      
      card.style.display = (matchesSearch && matchesFilter) ? '' : 'none';
    });

    if (activeFilter === 'all') {
      categorySections.forEach(section => {
        section.style.display = '';
      });
      extraSections.forEach(section => {
        section.style.display = '';
      });
      return;
    }

    categorySections.forEach(section => {
      const grid = section.querySelector('.tools-grid');
      const sectionCategory = grid ? grid.dataset.category : '';
      const visibleCards = Array.from(grid ? grid.querySelectorAll('.tool-card') : []).filter(card => {
        const name = card.dataset.name?.toLowerCase() || '';
        return name.includes(searchTerm) && sectionCategory === activeFilter;
      });

      section.style.display = (sectionCategory === activeFilter && visibleCards.length > 0) ? '' : 'none';
    });

    extraSections.forEach(section => {
      section.style.display = 'none';
    });
  }
  
  searchInput.addEventListener('input', filterTools);
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterTools();
    });
  });
}

// 페이지 로드 시 공통 컴포넌트와 필터 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initSharedComponents().then(() => {
      initToolsFilter();
    });
  });
} else {
  initSharedComponents().then(() => {
    initToolsFilter();
  });
}
