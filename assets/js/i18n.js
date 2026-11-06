// ============ 다국어(i18n) 번역 시스템 ============
// 지원 언어: ko(한국어), en(English), zh(中文), ja(日本語)
// 저장 위치: localStorage("language")
// 우선순위: 사용자가 저장한 언어 > 브라우저 언어 > 한국어(기본값)

const SUPPORTED_LANGUAGES = ['ko', 'en', 'zh', 'ja'];
const DEFAULT_LANGUAGE = 'ko';
const LANGUAGE_STORAGE_KEY = 'language';
const LANGUAGE_NAMES = { ko: '한국어', en: 'English', zh: '中文', ja: '日本語' };
let selectedLanguage = null;

// ============ 언어 데이터 지연 로딩 ============
// 기본 언어(ko)는 이 파일에 인라인으로 포함되어 첫 화면에서 즉시 적용된다.
// en/zh/ja 는 사용자가 해당 언어를 선택할 때만 assets/i18n/<lang>.js 를 <script> 로 주입해 로드하고
// window.I18N_DATA 에 캐싱한다. (빌드 단계 없음 / HTML 파일 수정 없음)
window.I18N_DATA = window.I18N_DATA || {};

// 이 스크립트(assets/js/i18n.js)의 경로에서 사이트 루트를 유도한다. common.js 의 getSiteBasePath() 와 동일한 방식.
const I18N_BASE = (function () {
  let src = (document.currentScript && document.currentScript.src) || '';
  if (!src) {
    const nodes = document.querySelectorAll('script[src*="/assets/js/i18n.js"]');
    src = nodes.length ? nodes[nodes.length - 1].src : '';
  }
  return src.replace(/\/assets\/js\/i18n\.js.*$/, '');
})();

const languageLoadPromises = {};

// 로드된 언어 데이터로 translate() 가 쓰는 카탈로그를 구성한다.
function registerLanguage(lang) {
  if (!window.I18N_DATA[lang] || translations[lang]) return;
  translations[lang] = buildTranslationCatalog(lang);
  Object.assign(translations[lang], window.I18N_DATA[lang]);
}

// 해당 언어 데이터가 준비되면 resolve. 이미 있으면 즉시 resolve(동기적으로 처리됨).
function ensureLanguage(lang) {
  if (window.I18N_DATA[lang]) {
    registerLanguage(lang);
    return Promise.resolve();
  }
  if (SUPPORTED_LANGUAGES.indexOf(lang) === -1) return Promise.resolve();
  if (languageLoadPromises[lang]) return languageLoadPromises[lang];

  languageLoadPromises[lang] = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = I18N_BASE + '/assets/i18n/' + lang + '.js';
    script.async = true;
    script.onload = () => { registerLanguage(lang); resolve(); };
    script.onerror = () => {
      console.warn('[i18n] ' + lang + ' 번역을 불러오지 못했습니다. 기본 언어로 표시합니다.');
      resolve();
    };
    document.head.appendChild(script);
  });
  return languageLoadPromises[lang];
}

const legacyTranslations = {
  ko: {
    header_menu_open: '메뉴 열기',
    header_menu_close: '메뉴 닫기',
    tech_meta_title: '기술뉴스·기술공유·장애노트·보안·AI | is-an',
    tech_copy: '기술뉴스, 개발 경험, 장애 해결, 보안과 AI 활용을 기록합니다. 다섯 가지 주제별로 글을 찾아보세요.',
    tech_categories: 'tech 하위 카테고리',
    tech_news: '기술뉴스',
    tech_sharing: '기술공유',
    tech_incidents: '장애노트',
    tech_security: '보안',
    tech_ai: 'AI·자동화',
    tech_news_copy: 'IT 동향과 신기술, 제품·서비스 업데이트를 살펴봅니다.',
    tech_sharing_copy: '개발·서버·네트워크 구축과 설정, 실습 경험을 공유합니다.',
    tech_incidents_copy: '장애 증상과 원인, 해결 과정과 재발 방지 방법을 기록합니다.',
    tech_security_copy: '보안뉴스와 취약점·패치, 보안 설정과 대응 방법을 다룹니다.',
    tech_ai_copy: 'AI 활용 사례와 업무 자동화, 스크립트 작성 경험을 모읍니다.',
    tech_empty: '아직 등록된 글이 없습니다.',
    tech_guides: '기존 도구 활용 가이드',
    header_home: 'is-an 홈',
    header_navigation: '주요 메뉴',
    header_search_close: '검색 닫기',
    header_search_hint: '도구 이름을 입력하세요.',
    header_search_loading: '도구 목록을 불러오는 중입니다.',
    header_search_error: '도구 목록을 불러오지 못했습니다. 검색을 닫고 다시 열어 주세요.',
    directory_meta_title: '모든 도구 · 계산기·게임·로또·사주 | is-an',
    directory_title: '모든 도구',
    directory_copy: '계산기, 변환기, 게임, 로또와 사주를 한곳에서 찾아보세요. 기존 기능을 모두 모았습니다.',
    directory_favorite: '즐겨찾기 추가',
    directory_unfavorite: '즐겨찾기 해제',
    nav_home: "홈",
    nav_calculator: "계산기",
    nav_lotto: "로또",
    nav_tools: "도구",
    nav_games: "게임",
    nav_saju: "사주·운세",
    nav_guide: "설명서",
    nav_faq: "자주 묻는 질문",

    footer_toolsTitle: "카테고리",
    footer_infoTitle: "이용 안내",
    footer_brand_copy: "기술을 읽고, 일상에 필요한 도구를 씁니다.",
    footer_socialTitle: "소셜",
    footer_calculatorLink: "계산기",
    footer_lottoLink: "로또",
    footer_toolsLink: "도구",
    footer_gamesLink: "게임",
    footer_sajuLink: "사주·운세",
    footer_home: "홈",
    footer_contact: "의견 보내기",
    footer_guide: "설명서",
    footer_faq: "자주 묻는 질문",
    footer_privacy: "개인정보처리방침",
    footer_social_github: "GitHub",

    privacy_meta_title: "개인정보처리방침 | is-an",
    privacy_meta_description: "is-an.github.io의 개인정보처리방침입니다. 수집하는 정보, 브라우저 저장소 사용, Google AdSense 광고 쿠키에 관해 안내합니다.",
    privacy_eyebrow: "정보",
    privacy_title: "개인정보처리방침",
    privacy_updated: "최종 업데이트: 2026년 9월 1일",
    privacy_intro_title: "개요",
    privacy_intro_body: "is-an.github.io(이하 “사이트”)는 회원가입과 로그인이 없는 무료 온라인 도구 모음입니다. 계산기·변환기 등 대부분의 기능은 사용자의 브라우저에서만 동작하며, 입력한 값은 서버로 전송되지 않습니다.",
    privacy_collect_title: "수집하는 정보",
    privacy_collect_body: "사이트는 이름, 이메일, 전화번호 등 개인을 식별할 수 있는 정보를 직접 수집하거나 저장하지 않습니다. 계산기·도구에 입력한 숫자나 텍스트는 브라우저 안에서만 처리되고 저장·전송되지 않습니다. 의견 보내기 링크로 이메일을 보내는 경우, 사용자가 작성해 보낸 내용과 발신 이메일 주소가 문의 처리 목적으로만 이용됩니다.",
    privacy_storage_title: "브라우저 저장소(localStorage) 사용",
    privacy_storage_body: "사이트는 화면 테마(라이트/다크), 표시 언어, 일부 미니게임의 최고 기록을 사용자 브라우저의 localStorage에 저장합니다. 이 값은 서버로 전송되지 않으며 다른 사용자와 공유되지 않습니다. 브라우저의 사이트 데이터 삭제 기능으로 언제든지 지울 수 있습니다.",
    privacy_ads_title: "광고와 쿠키",
    privacy_ads_body: "사이트는 Google AdSense를 통해 광고를 게재합니다. Google을 비롯한 제3자 광고 사업자는 쿠키를 사용해 사용자가 이 사이트와 다른 사이트를 방문한 기록을 바탕으로 맞춤 광고를 제공할 수 있습니다. 광고 쿠키 자체는 사이트가 아니라 해당 광고 사업자가 관리합니다.",
    privacy_ads_optout: "맞춤 광고는 아래에서 끌 수 있습니다.",
    privacy_ads_link_google: "Google 광고 설정",
    privacy_ads_link_aboutads: "aboutads.info 광고 선택",
    privacy_hosting_title: "호스팅과 접속 기록",
    privacy_hosting_body: "사이트는 GitHub Pages(GitHub, Inc.)로 호스팅됩니다. 페이지를 제공하는 과정에서 IP 주소, 브라우저 종류 등 표준 웹 서버 접속 기록이 호스팅 사업자에 의해 처리될 수 있습니다.",
    privacy_children_title: "아동의 개인정보",
    privacy_children_body: "사이트는 만 14세 미만 아동을 대상으로 하지 않으며, 아동의 개인정보를 의도적으로 수집하지 않습니다.",
    privacy_changes_title: "방침의 변경",
    privacy_changes_body: "이 방침은 법령이나 서비스 변경에 따라 수정될 수 있으며, 변경 시 이 페이지에 게시합니다.",
    privacy_contact_title: "문의",
    privacy_contact_body: "개인정보 처리에 관한 문의는 아래 이메일로 보내주세요.",
    privacy_contact_email: "isablog@naver.com",
    privacy_related: "관련 링크",

    darkMode: "다크모드로 전환",
    lightMode: "라이트모드로 전환",
    language: "언어 선택",

    meta_title: "무료 온라인 도구 모음 | 계산기, 변환기, 생성기",
    meta_description: "계산기, 변환기, 생성기, 게임 등 15가지 무료 온라인 도구를 한곳에서 만나보세요.",
    og_title: "무료 온라인 도구 모음",
    og_description: "퍼센트, 나이, 글자수, 단위 변환, BMI, 연봉, 대출, 이미지 처리 등 15개 도구 모음",
    calculator_meta_title: "계산기 카테고리 - 무료 온라인 계산기 모음",
    calculator_meta_description: "퍼센트·나이·D-Day·전역일 계산기부터 연봉·대출·예금·퇴직금·부가세·BMI 계산기까지 무료 온라인 계산기를 한곳에 모았습니다.",
    tools_meta_title: "도구 카테고리 - 무료 온라인 도구 모음",
    tools_meta_description: "글자수·바이트 계산기, 단위 변환기, 텍스트 변환 도구, 카메라 셔터카운트 확인기 등 무료 온라인 유틸리티 도구 모음입니다.",
    lotto_meta_title: "로또번호 생성기 - 무료 로또번호 추천 | 온라인 도구",
    lotto_meta_description: "1부터 45까지의 숫자 중 6개를 무작위로 선택하여 로또번호를 추천하는 무료 도구입니다.",
    games_meta_title: "미니게임 - 무료 온라인 게임 모음",
    games_meta_description: "반응속도 테스트, 스도쿠, 타자 속도 테스트, 블록 퍼즐을 무료로 즐길 수 있는 온라인 미니게임 모음입니다.",
    nav_guide: "설명서",
    guide_meta_title: "연봉·대출·나이 계산 설명서 | is-an",
    guide_meta_description: "연봉 실수령액, 대출 상환 방식, 만 나이, 적금 이자, 적립식 투자 등 자주 헷갈리는 금융·생활 계산을 예시와 기준으로 정리한 설명서입니다.",
    guide_eyebrow: "계산 설명서",
    guide_title: "설명서",
    guide_copy: "매달 마주치는 돈과 생활 속 계산을, 계산기와 함께 예시로 정리합니다.",
    guide_read: "읽기",
    guide_related: "관련 글",
    guide_back: "목록으로 돌아가기",
    games_eyebrow: "무료 온라인 미니게임",
    games_title: "게임 모음",
    games_copy: "짧은 시간에 즐기면서 반응속도, 집중력, 타자 실력을 확인해 보세요.",
    shutter_meta_title: "카메라 셔터카운트 확인기 - EXIF 사진 정보 분석",
    shutter_meta_description: "사진을 브라우저에서 분석하여 카메라 EXIF 정보와 확인 가능한 셔터카운트를 표시하는 무료 도구입니다.",

    home_categories_title: "카테고리",
    home_eyebrow_calc: "무료 온라인 계산기",
    home_eyebrow: "무료 온라인 도구",
    home_title: "필요한 계산, 여기서 바로",
    home_copy: "계산기·변환기·게임·로또·사주까지, 자주 쓰는 도구를 한곳에 모았습니다.",
    home_trust: "회원가입 없이 · 브라우저에서 계산 · 완전 무료",
    home_searchPlaceholder: "도구 검색... (예: BMI, 연봉, 로또)",
    home_about_title: "is-an 도구 모음이란",
    home_about_copy: "is-an은 회원가입 없이 바로 쓰는 무료 온라인 도구 모음입니다. 연봉·대출·나이 계산부터 단위 변환, 미니게임, 로또번호 생성까지 자주 찾는 기능을 모았습니다. 모든 계산은 브라우저에서 처리되어 입력값이 서버로 전송되지 않습니다.",
    home_allTools: "전체 카테고리 둘러보기",
    cal_finance_title: "금융·생활 계산기",
    tools_calc_note: "연봉·대출·예금·퇴직금·BMI 등 계산기는 계산기 카테고리에서 이용할 수 있습니다.",

    filter_all: "전체",
    filter_calculator: "계산기",
    filter_converter: "변환기",
    filter_generator: "생성기",

    cat_calculator: "📊 계산기",
    cat_converter: "🔄 변환기",
    cat_finance: "💰 금융 계산기",
    cat_generator: "🎰 생성기",
    cat_popular: "⭐ 인기 도구",
    cat_faq: "❓ 자주 묻는 질문",

    tool_calculator_title: "계산기 모음",
    tool_calculator_desc: "필요한 계산을 빠르게 확인할 수 있는 공식 기반 도구들을 한곳에 정리했습니다.",
    tool_percent_title: "퍼센트 계산기",
    tool_percent_desc: "A의 B%, A는 B의 몇 %, 증감 비율 등을 빠르게 계산합니다.",
    tool_age_title: "나이 계산기",
    tool_age_desc: "생년월일을 입력하면 만 나이, 경과 일수, 다음 생일까지의 날짜를 계산합니다.",
    tool_dday_title: "D-Day 계산기",
    tool_dday_desc: "목표 날짜를 입력하면 오늘을 기준으로 D-Day까지 남은 날짜를 계산합니다.",
    tool_discharge_title: "전역일 계산기",
    tool_discharge_desc: "입대일과 복무기간으로부터 전역일을 계산합니다.",
    tools_eyebrow: "무료 온라인 도구",
    tools_title: "도구 모음",
    tools_copy: "글자수 세기, 단위 변환, 텍스트 변환, 사진 EXIF 분석 등 실생활에 필요한 유틸리티 도구를 모았습니다.",

    tool_charcount_title: "글자수/바이트 계산기",
    tool_charcount_desc: "텍스트의 글자수, 공백 포함/제외 글자수, 바이트 수를 실시간으로 계산합니다.",
    tool_unit_title: "단위 변환기",
    tool_unit_desc: "길이, 무게, 온도, 면적, 부피, 시간, 데이터 용량을 변환합니다.",
    tool_textconv_title: "텍스트 변환 도구",
    tool_textconv_desc: "텍스트를 다양한 방식으로 변환하고 처리합니다.",
    tool_shutter_count_title: "카메라 셔터카운트 확인기",
    tool_shutter_count_desc: "사진의 EXIF 정보를 브라우저에서 분석하여 카메라 정보와 확인 가능한 셔터카운트를 표시합니다.",

    tool_bmi_title: "BMI 계산기",
    tool_bmi_desc: "키와 체중을 입력하면 BMI와 건강 상태를 표시합니다.",
    tool_salary_title: "연봉 계산기",
    tool_salary_desc: "연봉으로부터 월급, 세전/세후 금액을 계산합니다.",
    tool_vat_title: "부가세 계산기",
    tool_vat_desc: "공급가액, 부가세, 합계금액을 계산하고 역산합니다.",
    tool_loan_title: "대출 이자 계산기",
    tool_loan_desc: "대출금액, 이율, 기간으로부터 월 상환액과 총 이자를 계산합니다.",
    tool_savings_title: "예금/적금 이자 계산기",
    tool_savings_desc: "예치금과 이율로부터 이자와 만기 수령액을 계산합니다.",
    tool_retirement_title: "퇴직금 계산기",
    tool_retirement_desc: "입사일과 퇴사일로부터 예상 퇴직금을 계산합니다.",
    lotto_eyebrow: "무료 온라인 로또 생성기",
    lotto_title: "로또번호 생성기",
    lotto_copy: "1부터 45까지의 숫자 중 6개를 무작위로 선택하여 로또번호를 추천합니다.",
    lotto_intro: "1부터 45까지 중 서로 다른 6개 번호를 무작위로 생성합니다.",
    lotto_fixedLabel: "번호 고정 설정 (1~6자리)",
    lotto_slot1: "1번째", lotto_slot2: "2번째", lotto_slot3: "3번째",
    lotto_slot4: "4번째", lotto_slot5: "5번째", lotto_slot6: "6번째",
    lotto_generateOne: "1개 생성", lotto_generateFive: "5개 생성", lotto_reset: "초기화",
    lotto_how_title: "로또번호 생성기 사용 방법",
    lotto_how_1: "‘1개 생성’을 누르면 1~45 중 서로 다른 6개 번호가 무작위로 나옵니다.",
    lotto_how_2: "‘5개 생성’은 서로 다른 6개 번호 조합을 한 번에 5줄 만들어 줍니다.",
    lotto_how_3: "‘번호 고정’에서 1~6칸에 숫자를 지정하면 그 번호는 항상 포함되고 나머지 칸만 무작위로 채워집니다.",
    lotto_how_4: "‘초기화’는 고정한 번호와 생성 결과를 모두 지웁니다.",
    lotto_how_note: "생성된 번호는 저장되지 않으며, 새로 생성하면 이전 결과는 사라집니다.",
    lotto_odds_title: "로또 6/45 당첨 확률",
    lotto_odds_intro: "대한민국 로또 6/45는 1~45의 숫자 중 6개를 맞히는 방식입니다. 나올 수 있는 조합은 모두 8,145,060가지이며, 1등(6개 일치) 확률은 8,145,060분의 1입니다.",
    lotto_odds_th_rank: "등수",
    lotto_odds_th_cond: "조건",
    lotto_odds_th_prob: "1회 기준 확률",
    lotto_odds_rank_suffix: "등",
    lotto_odds_r1: "6개 번호 일치",
    lotto_odds_r2: "5개 번호 + 보너스 번호 일치",
    lotto_odds_r3: "5개 번호 일치",
    lotto_odds_r4: "4개 번호 일치",
    lotto_odds_r5: "3개 번호 일치",
    lotto_odds_note: "확률은 매 회차 동일하며, 자동·수동 또는 과거 당첨 이력과 관계없이 모든 조합의 당첨 가능성은 같습니다.",
    lotto_random_title: "무작위 번호 생성의 의미",
    lotto_random_p1: "이 도구는 브라우저의 난수 생성기로 매번 새로운 조합을 만듭니다. 특정 번호가 '잘 나오는 번호'이거나 '나올 때가 된 번호'라는 통계적 근거는 없습니다. 로또 추첨은 매 회차 독립적이어서, 과거에 자주 나온 번호와 적게 나온 번호 모두 다음 회차에 나올 확률은 같습니다.",
    lotto_random_p2: "번호 고정 기능은 생일·기념일처럼 의미 있는 숫자를 포함하고 싶을 때 쓰는 편의 기능이며, 당첨 확률을 높이지는 않습니다.",
    lotto_notice_title: "이용 시 유의사항",
    lotto_notice_1: "이 생성기는 재미와 편의를 위한 도구이며, 당첨이나 수익을 보장하지 않습니다.",
    lotto_notice_2: "복권은 만 19세 이상만 구매할 수 있습니다.",
    lotto_notice_3: "구매는 여윳돈 범위에서 하고 과도한 몰입에 주의하세요. 도박 문제 상담은 한국도박문제예방치유원(국번 없이 1336)에서 받을 수 있습니다.",
    lotto_notice_4: "실제 번호 구매와 당첨 확인은 공식 판매처 및 동행복권에서 진행됩니다.",
    lotto_faq_title: "❓ 자주 묻는 질문",
    lotto_faq1_q: "판매점 자동 번호와 무엇이 다른가요?",
    lotto_faq1_a: "차이가 없습니다. 판매점 자동도 무작위 추출이며, 이 도구도 같은 방식으로 서로 다른 6개 번호를 무작위로 고릅니다.",
    lotto_faq2_q: "여러 번 생성하면 같은 조합이 나올 수 있나요?",
    lotto_faq2_a: "한 조합 안에서는 번호가 중복되지 않습니다. 다만 여러 조합을 생성하면 조합끼리 겹칠 수는 있으며, 그 확률은 매우 낮습니다.",
    lotto_faq3_q: "번호를 고정하면 당첨 확률이 올라가나요?",
    lotto_faq3_a: "아니요. 어떤 번호를 고르든 6개 조합 하나의 1등 확률은 8,145,060분의 1로 동일합니다.",
    lotto_faq4_q: "생성한 번호가 서버에 저장되나요?",
    lotto_faq4_a: "아니요. 번호 생성은 모두 사용자의 브라우저에서 처리되며 서버로 전송되거나 저장되지 않습니다.",
    lotto_related_title: "🔗 관련 도구",

    loan_method_title: "상환 방식 이해하기",
    loan_method_intro: "대출 상환 방식에 따라 매달 내는 금액과 총 이자가 달라집니다. 이 계산기는 두 가지 방식을 지원합니다.",
    loan_method_equal_payment: "원리금균등상환: 매달 갚는 금액(원금+이자)이 일정합니다. 초반에는 이자 비중이 크고 갈수록 원금 비중이 커집니다. 매달 나가는 돈이 일정해 계획을 세우기 쉽습니다.",
    loan_method_equal_principal: "원금균등상환: 매달 갚는 원금이 일정하고, 남은 원금에 대한 이자가 줄어들어 매달 상환액이 조금씩 감소합니다. 총 이자는 원리금균등보다 대체로 적습니다.",
    loan_method_formula: "원리금균등의 월 상환액은 ‘원금 × 월이율 × (1+월이율)^개월수 ÷ ((1+월이율)^개월수 − 1)’ 공식으로 계산하며, 월이율은 연이율을 12로 나눈 값입니다.",
    loan_example_title: "계산 예시",
    loan_example_intro: "대출금액 3,000만 원, 연이율 4.5%, 기간 60개월(5년)로 이 계산기에서 계산하면 다음과 같습니다.",
    loan_example_th_type: "상환 방식",
    loan_example_th_monthly: "월 상환액",
    loan_example_th_interest: "총 이자",
    loan_example_r1_type: "원리금균등",
    loan_example_r1_monthly: "약 559,000원 (매달 동일)",
    loan_example_r1_interest: "약 356만 원",
    loan_example_r2_type: "원금균등",
    loan_example_r2_monthly: "첫 달 약 612,500원 → 마지막 달 약 501,900원",
    loan_example_r2_interest: "약 343만 원",
    loan_example_note: "같은 조건이라도 원금균등이 총 이자는 적지만 초기 상환 부담은 더 큽니다.",
    loan_notice_title: "이용 시 유의사항",
    loan_notice_1: "이 계산기는 입력한 이율이 만기까지 고정된다고 가정합니다. 변동금리 대출은 시장금리에 따라 상환액이 달라집니다.",
    loan_notice_2: "중도상환수수료, 인지세, 근저당 설정비 등 부대비용과 거치기간(원금 없이 이자만 내는 기간)은 반영하지 않습니다.",
    loan_notice_3: "실제 대출 한도와 금리는 소득, 신용점수, DSR·LTV 규제 등에 따라 결정되므로 금융회사 상담이 필요합니다.",
    loan_notice_4: "계산 결과는 참고용이며 실제 대출 상품의 상환 일정과 다를 수 있습니다.",
    loan_faq_title: "❓ 자주 묻는 질문",
    loan_faq1_q: "원리금균등과 원금균등, 어떤 게 유리한가요?",
    loan_faq1_a: "총 이자만 보면 원금균등이 대체로 적습니다. 다만 원금균등은 초기 상환액이 크기 때문에, 매달 나가는 돈을 일정하게 관리하고 싶다면 원리금균등이 편할 수 있습니다.",
    loan_faq2_q: "거치기간이 있으면 어떻게 되나요?",
    loan_faq2_a: "거치기간에는 이자만 납부하고 원금 상환은 이후에 시작됩니다. 이 계산기는 거치기간을 지원하지 않으므로, 거치 후 상환 개월수만 따로 입력해 대략적인 금액을 확인하세요.",
    loan_faq3_q: "중도상환하면 이자가 줄어드나요?",
    loan_faq3_a: "네, 남은 원금이 줄어 이후 이자가 감소합니다. 다만 대출 실행 후 일정 기간 안에는 중도상환수수료가 붙을 수 있어 실제 이득은 상품 조건에 따라 다릅니다.",
    loan_faq4_q: "입력한 값이 저장되나요?",
    loan_faq4_a: "아니요. 계산은 모두 브라우저에서 처리되며 입력값은 서버로 전송되지 않습니다.",
    loan_related_title: "🔗 관련 도구",

    vat_method_title: "부가세 계산 방법",
    vat_method_intro: "부가세(부가가치세)는 재화나 서비스의 공급가액에 매기는 세금입니다. 한국의 표준 세율은 10%입니다.",
    vat_method_forward: "공급가액에서 합계 구하기: 부가세 = 공급가액 × 10%, 합계 = 공급가액 + 부가세. 예를 들어 공급가액이 100,000원이면 부가세는 10,000원, 합계는 110,000원입니다.",
    vat_method_reverse: "합계에서 공급가액 구하기: 공급가액 = 합계 ÷ 1.1, 부가세 = 합계 − 공급가액. 예를 들어 합계가 110,000원이면 공급가액은 100,000원, 부가세는 10,000원입니다.",
    vat_method_note: "카드 영수증이나 간이영수증에 표시된 금액은 보통 부가세가 포함된 합계 금액입니다. 이때는 ‘합계 → 공급가액’ 탭을 사용하세요.",
    vat_notice_title: "이용 시 유의사항",
    vat_notice_1: "면세 사업자나 면세 품목(기초 생필품, 도서, 일부 농수산물 등)에는 부가세가 붙지 않습니다.",
    vat_notice_2: "간이과세자는 업종별 부가가치율이 적용되어 실제 납부세액이 이 계산과 다릅니다.",
    vat_notice_3: "매입세액 공제, 의제매입세액 등은 반영하지 않습니다. 실제 신고세액은 매출세액에서 매입세액을 뺀 금액입니다.",
    vat_notice_4: "계산 결과는 참고용이며 세무 신고 시에는 국세청 홈택스 또는 세무 전문가의 확인이 필요합니다.",
    vat_faq_title: "❓ 자주 묻는 질문",
    vat_faq1_q: "한국의 부가세율은 몇 %인가요?",
    vat_faq1_a: "표준 세율은 10%입니다. 수출 등 영세율이 적용되는 거래는 0%, 면세 거래는 부가세가 없습니다.",
    vat_faq2_q: "합계 금액에서 부가세만 빠르게 알고 싶어요.",
    vat_faq2_a: "‘합계 → 공급가액’ 탭에 합계 금액을 넣으면 공급가액과 부가세가 분리되어 표시됩니다. 세율 10% 기준 부가세는 대략 합계의 1/11입니다.",
    vat_faq3_q: "세율을 10%가 아닌 값으로 바꿀 수 있나요?",
    vat_faq3_a: "네, 세율 입력란의 값을 바꾸면 해당 세율로 계산됩니다. 다른 나라의 부가세(VAT/GST) 계산에도 사용할 수 있습니다.",
    vat_faq4_q: "입력한 금액이 저장되나요?",
    vat_faq4_a: "아니요. 계산은 모두 브라우저에서 처리되며 입력값은 서버로 전송되지 않습니다.",
    vat_related_title: "🔗 관련 도구",

    salary_about_title: "실수령액은 어떻게 정해지나요",
    salary_about_intro: "세전 월급에서 아래 항목이 빠진 금액이 실제로 통장에 들어오는 실수령액입니다.",
    salary_about_1: "국민연금·건강보험·장기요양보험·고용보험 등 4대 보험료(근로자 부담분)",
    salary_about_2: "근로소득세와 지방소득세(소득세의 10%)",
    salary_about_note: "소득세는 부양가족 수와 공제 항목에 따라 간이세액표로 정해지고, 국민연금은 기준소득월액 상한이 있으며 건강보험료율은 해마다 조정됩니다. 이 계산기는 이해를 돕기 위한 단순화된 비율을 사용하므로, 실제 급여명세서 금액과는 차이가 있을 수 있습니다.",
    salary_example_title: "계산 예시",
    salary_example_body: "연봉 3,600만 원을 입력하면 세전 월급은 300만 원이고, 이 계산기의 단순 모델 기준 공제액은 약 50만 원, 월 실수령액은 약 250만 원으로 표시됩니다. 실제 금액은 공제 조건에 따라 달라집니다.",
    salary_notice_title: "이용 시 유의사항",
    salary_notice_1: "비과세 항목(식대, 자가운전보조금 등), 부양가족, 연장근로수당, 성과급은 반영하지 않습니다.",
    salary_notice_2: "연말정산 결과에 따라 실제 부담하는 세액은 매달 원천징수액과 달라질 수 있습니다.",
    salary_notice_3: "4대 보험료율과 소득세 간이세액표는 매년 바뀌므로 정확한 금액은 급여명세서나 국세청·건강보험공단 자료로 확인하세요.",
    salary_notice_4: "계산 결과는 참고용입니다.",
    salary_faq_title: "❓ 자주 묻는 질문",
    salary_faq1_q: "세전과 세후는 무엇이 다른가요?",
    salary_faq1_a: "세전은 4대 보험료와 세금을 빼기 전 금액, 세후(실수령액)는 이 공제를 모두 뺀 뒤 실제로 받는 금액입니다.",
    salary_faq2_q: "왜 이 계산기 결과가 실제 월급과 다른가요?",
    salary_faq2_a: "실제 공제액은 부양가족 수, 비과세 급여, 국민연금 상한, 건강보험료율 변동 등에 따라 달라집니다. 이 계산기는 고정 비율을 쓰는 단순 모델이라 근사값만 제공합니다.",
    salary_faq3_q: "연봉에 퇴직금이 포함되나요?",
    salary_faq3_a: "회사마다 다릅니다. ‘연봉에 퇴직금 포함’인 경우 실제 매달 받는 급여는 연봉을 13으로 나눈 값에 가깝습니다. 근로계약서를 확인하세요.",
    salary_faq4_q: "입력한 연봉이 저장되나요?",
    salary_faq4_a: "아니요. 계산은 모두 브라우저에서 처리되며 입력값은 서버로 전송되지 않습니다.",
    salary_related_title: "🔗 관련 도구",

    savings_about_title: "예금과 적금, 단리와 복리",
    savings_about_deposit: "정기예금: 목돈을 한 번에 맡기고 만기에 원금과 이자를 받습니다. 이 계산기의 ‘정기예금(단리)’은 예치금 칸에 맡기는 금액을 입력합니다.",
    savings_about_savings: "적금: 매달 일정액을 나눠 넣습니다. 이 계산기의 ‘적금(월복리)’은 예치금 칸에 매달 넣는 금액을 입력합니다.",
    savings_about_simple: "단리는 원금에만 이자가 붙고, 복리는 이자에 다시 이자가 붙습니다.",
    savings_about_tax: "이자에는 이자소득세 15.4%(소득세 14% + 지방소득세 1.4%)가 원천징수됩니다. 이 계산기는 세전 이자와 세후 이자를 함께 보여 줍니다.",
    savings_example_title: "계산 예시",
    savings_example_body: "정기예금에 1,000만 원을 연 3.5%로 12개월 맡기면, 세전 이자는 35만 원, 세금 15.4%를 뺀 세후 이자는 약 29만 6천 원, 만기액은 약 1,029만 6천 원입니다.",
    savings_example_note: "적금은 매달 나눠 넣기 때문에 먼저 넣은 돈만 전체 기간 이자가 붙고, 나중에 넣은 돈은 짧게 붙습니다. 그래서 표시 이율이 같아도 적금의 실제 수령 이자는 같은 금액의 예금보다 적습니다.",
    savings_notice_title: "이용 시 유의사항",
    savings_notice_1: "실제 은행 적금은 대부분 단리로, 월별 예치 개월수에 따라 이자를 계산합니다. 이 계산기의 ‘적금(월복리)’ 결과는 실제 상품보다 이자가 다소 높게 나올 수 있습니다.",
    savings_notice_2: "우대금리 조건, 중도해지 시 약정이율 미적용, 비과세·세금우대 상품 여부는 반영하지 않습니다.",
    savings_notice_3: "계산 결과는 참고용이며, 정확한 금액은 가입하려는 상품의 약관과 은행 안내로 확인하세요.",
    savings_faq_title: "❓ 자주 묻는 질문",
    savings_faq1_q: "적금인데 왜 예치금 칸에 월 납입액을 넣나요?",
    savings_faq1_a: "이 계산기의 적금 모드는 매달 같은 금액을 넣는다고 가정합니다. 예치금 칸에 매달 넣을 금액을, 기간 칸에 납입 개월수를 입력하세요.",
    savings_faq2_q: "이자소득세는 왜 15.4%인가요?",
    savings_faq2_a: "이자·배당 소득에는 소득세 14%와 그에 대한 지방소득세 1.4%가 함께 부과되어 합계 15.4%가 원천징수됩니다.",
    savings_faq3_q: "표시 이율이 같은데 예금과 적금 이자가 왜 다른가요?",
    savings_faq3_a: "적금은 나중에 넣은 돈일수록 이자가 붙는 기간이 짧기 때문입니다. 대략 같은 이율이라면 적금의 실효 이자는 예금의 절반 안팎입니다.",
    savings_faq4_q: "입력한 금액이 저장되나요?",
    savings_faq4_a: "아니요. 계산은 모두 브라우저에서 처리되며 입력값은 서버로 전송되지 않습니다.",
    savings_related_title: "🔗 관련 도구",

    retirement_about_title: "퇴직금은 어떻게 계산되나요",
    retirement_about_intro: "법정 퇴직금은 계속 근로기간 1년에 대해 30일분의 평균임금을 지급하는 것이 기준입니다. 공식은 대략 ‘1일 평균임금 × 30 × (재직일수 ÷ 365)’ 입니다.",
    retirement_about_1: "계속 근로기간이 1년 미만이면 법정 퇴직금 지급 대상이 아닙니다.",
    retirement_about_2: "평균임금은 퇴직 직전 3개월 동안 받은 임금 총액을 그 기간의 총일수로 나눈 값이며, 연간 상여금과 연차수당의 일부도 포함됩니다.",
    retirement_about_3: "주 15시간 미만 초단시간 근로 등 일부 예외가 있습니다.",
    retirement_about_note: "이 계산기는 입력한 마지막 월급과 보너스를 바탕으로 한 단순 추정치를 보여 줍니다. 실제 평균임금 산정과는 차이가 있을 수 있습니다.",
    retirement_example_title: "계산 예시",
    retirement_example_body: "마지막 월급 300만 원, 보너스 없음, 3년(약 1,096일) 근무로 계산하면 예상 퇴직금은 약 900만 원으로 표시됩니다. 대략 ‘월급 × 근속연수’ 수준입니다.",
    retirement_notice_title: "이용 시 유의사항",
    retirement_notice_1: "퇴직소득세는 별도로 공제되며 이 계산기 결과에는 반영되지 않습니다. 근속연수가 길수록 세 부담은 낮아집니다.",
    retirement_notice_2: "확정기여형(DC) 퇴직연금은 회사가 매년 납입한 금액과 운용 수익에 따라 최종 수령액이 달라집니다.",
    retirement_notice_3: "회사 규정이 법정 기준보다 유리한 경우 그 규정이 우선 적용됩니다.",
    retirement_notice_4: "계산 결과는 참고용이며, 정확한 금액은 고용노동부 퇴직금 계산기나 회사 인사 담당에게 확인하세요.",
    retirement_faq_title: "❓ 자주 묻는 질문",
    retirement_faq1_q: "1년을 딱 채우면 퇴직금을 받나요?",
    retirement_faq1_a: "계속 근로기간이 1년 이상이면 지급 대상입니다. 1년에서 하루라도 모자라면 법정 퇴직금은 발생하지 않습니다.",
    retirement_faq2_q: "평균임금과 통상임금은 무엇이 다른가요?",
    retirement_faq2_a: "평균임금은 실제로 받은 임금(상여·수당 포함) 기준이고, 통상임금은 정기적·일률적으로 지급되는 기본 임금 기준입니다. 퇴직금은 원칙적으로 평균임금으로 계산하되, 평균임금이 통상임금보다 적으면 통상임금을 씁니다.",
    retirement_faq3_q: "아르바이트도 퇴직금을 받을 수 있나요?",
    retirement_faq3_a: "고용 형태와 상관없이 1년 이상 계속 근로하고 주 소정근로시간이 15시간 이상이면 퇴직금 지급 대상입니다.",
    retirement_faq4_q: "입력한 정보가 저장되나요?",
    retirement_faq4_a: "아니요. 계산은 모두 브라우저에서 처리되며 입력값은 서버로 전송되지 않습니다.",
    retirement_related_title: "🔗 관련 도구",

    bmi_about_title: "BMI란 무엇인가",
    bmi_about_intro: "BMI(체질량지수, Body Mass Index)는 체중(kg)을 키(m)의 제곱으로 나눈 값입니다. 키 170cm, 체중 68kg이면 68 ÷ (1.7 × 1.7) ≈ 23.5입니다. 키 대비 체중이 어느 정도인지 간단히 가늠하는 지표로, 세계보건기구(WHO)와 여러 보건기관이 비만 정도를 분류할 때 사용합니다.",
    bmi_table_title: "BMI 판정 기준",
    bmi_table_intro: "이 계산기는 WHO 국제 기준을 사용합니다.",
    bmi_table_th_range: "BMI 범위",
    bmi_table_th_status: "분류",
    bmi_status_under: "저체중",
    bmi_status_normal: "정상체중",
    bmi_status_over: "과체중",
    bmi_status_obese: "비만",
    bmi_table_note: "대한비만학회 등 아시아·태평양 기준에서는 BMI 23 이상을 과체중(비만 전 단계), 25 이상을 비만으로 봅니다. 같은 체중이라도 적용 기준에 따라 분류가 달라질 수 있습니다.",
    bmi_limit_title: "결과 해석 시 주의할 점",
    bmi_limit_1: "BMI는 근육량과 체지방을 구분하지 못합니다. 근육량이 많은 사람은 실제 체지방이 적어도 BMI가 높게 나올 수 있습니다.",
    bmi_limit_2: "성장기 어린이·청소년, 임산부, 고령자에게는 그대로 적용하기 어렵습니다.",
    bmi_limit_3: "같은 BMI라도 복부 지방(허리둘레)에 따라 건강 위험도가 다릅니다.",
    bmi_limit_4: "BMI는 참고 지표이며 의학적 진단이 아닙니다. 체중 관리나 건강 상태가 걱정된다면 의료진과 상담하세요.",
    bmi_faq_title: "❓ 자주 묻는 질문",
    bmi_faq1_q: "적정 체중은 어떻게 나오나요?",
    bmi_faq1_a: "정상 범위인 BMI 18.5~25에 해당하는 체중을 계산해 표시합니다. 키(m)의 제곱에 18.5와 25를 각각 곱한 값입니다.",
    bmi_faq2_q: "한국 기준과 결과가 다른 것 같아요.",
    bmi_faq2_a: "이 계산기는 WHO 국제 기준(정상 18.5~24.9)을 씁니다. 대한비만학회 기준으로는 BMI 23부터 비만 전 단계로 보기 때문에 분류가 더 엄격합니다.",
    bmi_faq3_q: "BMI가 정상이면 건강한 건가요?",
    bmi_faq3_a: "BMI는 여러 지표 중 하나일 뿐입니다. 체지방률, 허리둘레, 혈압·혈당·콜레스테롤 등을 함께 봐야 건강 상태를 제대로 알 수 있습니다.",
    bmi_faq4_q: "입력한 키·체중이 저장되나요?",
    bmi_faq4_a: "아니요. 계산은 모두 브라우저에서 처리되며 입력값은 서버로 전송되지 않습니다.",
    bmi_related_title: "🔗 관련 도구",

    age_about_title: "만 나이·연 나이·세는 나이",
    age_about_1: "만 나이: 태어난 날을 0세로 시작해 생일마다 한 살씩 더합니다. 2023년 6월부터 법령·행정의 기본 기준입니다. 이 계산기가 계산하는 값입니다.",
    age_about_2: "연 나이: 생일과 관계없이 ‘올해 연도 − 태어난 연도’로 계산합니다. 병역법 등 일부 법률에서 사용합니다.",
    age_about_3: "세는 나이: 태어나면 1세, 매년 1월 1일에 한 살씩 더하는 전통 방식입니다. 만 나이보다 한두 살 많습니다.",
    age_example_title: "계산 예시",
    age_example_body: "1990년 5월 10일생을 2026년 9월 1일 기준으로 계산하면, 올해 생일이 지났으므로 만 36세입니다. 생일 전이라면 만 35세가 됩니다. 경과 일수는 태어난 날부터 기준일까지의 총 일수입니다.",
    age_faq_title: "❓ 자주 묻는 질문",
    age_faq1_q: "만 나이와 세는 나이의 차이는?",
    age_faq1_a: "만 나이는 출생 이후 실제로 지난 햇수이고, 세는 나이는 출생 시 1세로 시작해 새해마다 한 살을 더합니다. 그래서 세는 나이가 만 나이보다 한두 살 많습니다.",
    age_faq2_q: "기준 날짜를 바꿀 수 있나요?",
    age_faq2_a: "네. 기준 날짜를 직접 입력하면 그 날짜를 기준으로 나이와 경과 일수를 계산합니다. 특정 시점의 만 나이를 확인할 때 유용합니다.",
    age_faq3_q: "2월 29일생은 어떻게 계산되나요?",
    age_faq3_a: "평년에는 2월 28일 또는 3월 1일을 생일로 보는 견해가 있어 하루 차이가 날 수 있습니다. 이 계산기는 다음 생일을 표시할 때 3월 1일로 처리합니다.",
    age_faq4_q: "입력한 생년월일이 저장되나요?",
    age_faq4_a: "아니요. 계산은 모두 브라우저에서 처리되며 입력값은 서버로 전송되지 않습니다.",
    age_related_title: "🔗 관련 도구",

    dday_basis_title: "D-Day 계산 기준",
    dday_basis_body: "이 계산기는 ‘목표 날짜 − 오늘 날짜’를 계산합니다. 오늘은 0일째로 보며, 목표일이 내일이면 D-1, 오늘이면 D-Day, 어제였으면 D+1로 표시합니다.",
    dday_basis_note: "‘시험 100일 전’처럼 당일을 1일째로 세는 방식과는 하루 차이가 날 수 있습니다. 그럴 때는 목표 날짜를 하루 조정해 맞추세요.",
    dday_use_title: "이런 데 쓸 수 있어요",
    dday_use_1: "시험, 자격증 접수 마감, 원서 접수일까지 남은 날짜",
    dday_use_2: "기념일, 결혼식, 여행 출발일 카운트다운",
    dday_use_3: "출산 예정일, 프로젝트 마감일 등 지난 날짜 확인(D+)",
    dday_faq_title: "❓ 자주 묻는 질문",
    dday_faq1_q: "D-Day는 무엇인가요?",
    dday_faq1_a: "특정 목표일을 기준으로 남은 일수를 나타내는 형식입니다. 목표일까지 10일이 남으면 D-10, 당일은 D-Day, 지난 지 5일이면 D+5입니다.",
    dday_faq2_q: "과거 날짜를 입력할 수 있나요?",
    dday_faq2_a: "네. 과거 날짜를 입력하면 그 날짜로부터 며칠이 지났는지 D+ 형식으로 표시합니다.",
    dday_faq3_q: "‘시험 D-100’과 계산이 다른 것 같아요.",
    dday_faq3_a: "기관에 따라 시험 당일을 1일째로 세기도 합니다. 이 계산기는 당일을 0일째로 보므로, 필요하면 목표 날짜를 하루 앞당겨 입력하세요.",
    dday_faq4_q: "시간 단위로도 계산할 수 있나요?",
    dday_faq4_a: "현재는 날짜(일) 단위로만 계산합니다.",
    dday_related_title: "🔗 관련 도구",

    discharge_term_title: "군별 복무기간",
    discharge_term_th_branch: "군 종류",
    discharge_term_th_months: "복무기간",
    discharge_term_army: "육군·해병대",
    discharge_term_army_m: "18개월",
    discharge_term_navy: "해군",
    discharge_term_navy_m: "20개월",
    discharge_term_air: "공군",
    discharge_term_air_m: "21개월",
    discharge_term_note: "사회복무요원, 산업기능요원 등은 복무기간이 다릅니다. ‘기타(직접입력)’를 선택해 개월수를 입력하세요.",
    discharge_how_title: "전역일과 진행률 계산 방식",
    discharge_how_body: "전역일은 입대일에 복무 개월수를 더한 날의 전날을 기준으로 합니다(현역병은 만기 전역 시 전역일이 그렇게 정해집니다). 이 계산기는 입대일에 개월수를 더한 날짜를 전역일로 표시하고, 오늘까지 지난 비율을 진행률로 보여 줍니다. 진행률은 한 달을 30일로 어림해 계산하므로 실제와 소폭 차이가 있을 수 있습니다.",
    discharge_faq_title: "❓ 자주 묻는 질문",
    discharge_faq1_q: "복무기간은 얼마인가요?",
    discharge_faq1_a: "현재 기준 육군·해병대 18개월, 해군 20개월, 공군 21개월입니다. 복무기간은 정책에 따라 조정될 수 있으니 최신 정보는 병무청 안내를 확인하세요.",
    discharge_faq2_q: "조기 전역이나 분할 복무도 계산되나요?",
    discharge_faq2_a: "이 계산기는 입대일부터 연속 복무한다고 가정합니다. 휴가 미복귀, 조기 전역, 분할 복무 등은 반영되지 않습니다.",
    discharge_faq3_q: "입력한 입대일이 저장되나요?",
    discharge_faq3_a: "아니요. 계산은 모두 브라우저에서 처리되며 입력값은 서버로 전송되지 않습니다.",
    discharge_related_title: "🔗 관련 도구",

    percent_guide_title: "퍼센트 계산 공식",
    percent_guide_1: "A의 B%: A × (B ÷ 100). 예) 1,000의 15% = 1,000 × 0.15 = 150",
    percent_guide_2: "A는 B의 몇 %: (A ÷ B) × 100. 예) 150은 1,000의 (150 ÷ 1,000) × 100 = 15%",
    percent_guide_3: "증감 비율: (현재 값 − 이전 값) ÷ 이전 값 × 100. 예) 100 → 120이면 20% 증가, 100 → 80이면 20% 감소",
    percent_guide_note: "할인가는 ‘원래 가격 × (100 − 할인율) ÷ 100’으로 구합니다. 10,000원에서 20% 할인이면 10,000 × 0.8 = 8,000원입니다.",

    reaction_score_title: "반응속도 기준",
    reaction_score_body: "사람의 시각 반응속도는 보통 200~250밀리초(ms) 정도이며, 훈련된 사람은 180ms 안팎까지 나옵니다. 100ms보다 빠른 기록은 화면이 바뀌기 전에 누른 것으로 보고 무효 처리됩니다. 마우스·키보드·화면 주사율에 따라서도 수십 ms 차이가 날 수 있습니다.",
    reaction_tip_title: "기록을 높이는 팁",
    reaction_tip_1: "화면 변화에 반응만 하고, 언제 바뀔지 예측해서 미리 누르지 마세요. 예측 클릭은 무효가 됩니다.",
    reaction_tip_2: "손가락을 버튼에 살짝 얹고 힘을 뺀 상태로 기다리세요.",
    reaction_tip_3: "5회 평균 모드로 재서 한두 번의 우연을 걸러 내세요.",
    reaction_faq_title: "❓ 자주 묻는 질문",
    reaction_faq1_q: "기록이 너무 안 좋게 나와요.",
    reaction_faq1_a: "무선 마우스, 블루투스 지연, 60Hz 모니터, 브라우저 백그라운드 작업 등이 영향을 줍니다. 여러 번 측정한 평균을 참고하세요.",
    reaction_faq2_q: "모바일에서도 정확한가요?",
    reaction_faq2_a: "터치 입력도 측정되지만 화면 터치 인식 지연이 있어 PC보다 느리게 나오는 경향이 있습니다.",
    reaction_faq3_q: "기록이 저장되나요?",
    reaction_faq3_a: "최고 기록은 이 브라우저에만 저장되며 서버로 전송되지 않습니다.",

    sudoku_rule_title: "스도쿠 규칙",
    sudoku_rule_body: "9×9 칸을 1~9 숫자로 채우되, 각 가로줄·세로줄·굵은 선으로 나뉜 3×3 상자 안에서 같은 숫자가 두 번 나오면 안 됩니다. 처음 주어진 숫자만으로 나머지 칸이 하나의 답으로 결정됩니다.",
    sudoku_tip_title: "풀이 팁",
    sudoku_tip_1: "숫자가 많이 채워진 줄·상자부터 보면서 들어갈 수 있는 칸이 하나뿐인 숫자를 찾습니다.",
    sudoku_tip_2: "한 칸에 들어갈 후보가 둘뿐이면 연필로 적듯 기억해 두고 다른 칸을 먼저 풉니다.",
    sudoku_tip_3: "난이도가 높을수록 처음 주어지는 숫자가 적어 후보를 좁히는 과정이 길어집니다.",
    sudoku_faq_title: "❓ 자주 묻는 질문",
    sudoku_faq1_q: "난이도별로 무엇이 다른가요?",
    sudoku_faq1_a: "쉬움일수록 처음 채워진 숫자가 많아 논리만으로 빠르게 풀리고, 어려움은 주어진 숫자가 적어 여러 단계의 추론이 필요합니다.",
    sudoku_faq2_q: "정답이 여러 개일 수도 있나요?",
    sudoku_faq2_a: "아니요. 생성되는 퍼즐은 항상 유일한 정답을 갖습니다.",
    sudoku_faq3_q: "진행 상황이 저장되나요?",
    sudoku_faq3_a: "새 게임을 누르거나 페이지를 새로 고치면 초기화됩니다. 기록은 서버로 전송되지 않습니다.",

    typing_metric_title: "CPM·WPM과 정확도",
    typing_metric_body: "CPM(Characters Per Minute)은 1분당 입력한 글자 수, WPM(Words Per Minute)은 보통 5타를 한 단어로 환산한 값입니다. 한글은 자음·모음이 합쳐져 한 글자가 되므로 영문보다 타수가 낮게 나오는 경향이 있습니다. 정확도는 오타를 제외한 올바른 입력의 비율이며, 속도와 정확도를 함께 봐야 실제 타자 실력을 알 수 있습니다.",
    typing_tip_title: "타자 속도 올리는 팁",
    typing_tip_1: "틀린 글자를 그때그때 지우기보다, 정확도를 유지하는 선에서 리듬을 끊지 않는 편이 점수에 유리합니다.",
    typing_tip_2: "화면이 아니라 문장을 한두 단어 앞서 읽으면서 입력하세요.",
    typing_tip_3: "모든 손가락을 기본 위치(ASDF·JKL;)에 두고 시작하는 습관을 들이세요.",
    typing_faq_title: "❓ 자주 묻는 질문",
    typing_faq1_q: "평균 타자 속도는 어느 정도인가요?",
    typing_faq1_a: "일반적으로 한글 200~300타/분, 영문 30~50WPM 정도를 평균으로 봅니다. 숙련자는 그 두 배 이상입니다.",
    typing_faq2_q: "한국어와 영어 점수를 비교할 수 있나요?",
    typing_faq2_a: "입력 방식이 달라 직접 비교는 어렵습니다. 같은 언어에서 자신의 기록 변화를 보는 용도로 쓰세요.",
    typing_faq3_q: "입력한 내용이 저장되나요?",
    typing_faq3_a: "아니요. 입력과 채점은 브라우저에서만 이뤄지며 서버로 전송되지 않습니다.",

    block_score_title: "점수와 레벨",
    block_score_body: "한 번에 여러 줄을 동시에 지울수록 점수가 크게 오릅니다. 지운 줄이 쌓이면 레벨이 올라가고 블록이 떨어지는 속도가 빨라집니다. 블록이 화면 맨 위까지 쌓이면 게임이 끝납니다. 최고 점수는 이 브라우저에 저장됩니다.",
    block_tip_title: "더 오래 버티는 팁",
    block_tip_1: "바닥을 평평하게 유지하고, 한 칸짜리 깊은 골을 만들지 마세요.",
    block_tip_2: "긴 막대 블록을 기다리며 오른쪽 끝 한 줄을 비워 두면 한 번에 여러 줄을 지울 기회가 생깁니다.",
    block_tip_3: "속도가 빨라지면 즉시 떨어뜨리기(스페이스/DROP)로 판단 시간을 아끼세요.",
    block_faq_title: "❓ 자주 묻는 질문",
    block_faq1_q: "모바일에서도 할 수 있나요?",
    block_faq1_a: "네. 화면 아래 터치 버튼으로 이동·회전·낙하를 조작할 수 있습니다.",
    block_faq2_q: "한 번에 몇 줄까지 지울 수 있나요?",
    block_faq2_a: "최대 네 줄을 동시에 지울 수 있으며, 이때 점수가 가장 많이 오릅니다.",
    block_faq3_q: "기록이 서버에 저장되나요?",
    block_faq3_a: "아니요. 최고 점수는 이 브라우저에만 저장됩니다.",

    saju_struct_title: "사주팔자는 어떻게 구성되나요",
    saju_struct_body: "사주(四柱)는 태어난 연·월·일·시를 각각 하나의 기둥으로 삼은 네 기둥을 뜻합니다. 각 기둥은 하늘의 기운을 나타내는 천간(天干) 한 글자와 땅의 기운을 나타내는 지지(地支) 한 글자로 이루어져, 모두 여덟 글자가 됩니다. 그래서 사주팔자(四柱八字)라고 부릅니다.",
    saju_struct_1: "천간 10가지: 갑·을·병·정·무·기·경·신·임·계",
    saju_struct_2: "지지 12가지: 자·축·인·묘·진·사·오·미·신·유·술·해 (십이지, 띠와 연결됩니다)",
    saju_struct_3: "태어난 날의 천간(일간)을 자기 자신으로 보고, 나머지 글자와의 관계로 성향과 흐름을 해석합니다.",
    saju_ohaeng_title: "오행(五行)의 기본 개념",
    saju_ohaeng_body: "천간과 지지는 각각 목(木)·화(火)·토(土)·금(金)·수(水) 다섯 기운 중 하나에 속합니다. 오행은 서로 돕는 상생(목→화→토→금→수→목)과 서로 억제하는 상극 관계로 연결됩니다. 사주에 어떤 오행이 많고 적은지를 보고 성향의 균형을 살핍니다.",
    saju_ohaeng_th1: "오행",
    saju_ohaeng_th2: "대표 이미지",
    saju_ohaeng_wood: "목(木)",
    saju_ohaeng_wood_d: "성장, 뻗어 나감",
    saju_ohaeng_fire: "화(火)",
    saju_ohaeng_fire_d: "열정, 확산",
    saju_ohaeng_earth: "토(土)",
    saju_ohaeng_earth_d: "안정, 중재",
    saju_ohaeng_metal: "금(金)",
    saju_ohaeng_metal_d: "결단, 정리",
    saju_ohaeng_water: "수(水)",
    saju_ohaeng_water_d: "지혜, 유연함",
    saju_read_title: "결과를 어떻게 이해하면 되나요",
    saju_read_1: "이 페이지는 일간의 오행을 중심으로 성향, 관계, 재물, 직업 방향에 대한 일반적인 해석을 보여 줍니다.",
    saju_read_2: "같은 오행이라도 나머지 일곱 글자의 조합에 따라 실제 해석은 달라집니다. 여기서 보여 주는 것은 큰 방향의 참고입니다.",
    saju_read_3: "출생시간을 모르면 시주(時柱)를 뺀 정보로만 계산되어 결과에 차이가 있을 수 있습니다.",
    saju_read_4: "사주 해석은 전통 명리학에 근거한 참고용 콘텐츠이며, 미래를 확정적으로 예측하거나 객관적 사실을 보장하지 않습니다. 중요한 결정은 스스로 판단하세요.",
    saju_related_title: "🔗 관련 콘텐츠",

    unit_common_title: "자주 쓰는 변환",
    unit_common_th1: "구분",
    unit_common_th2: "환산",
    unit_common_len: "길이",
    unit_common_len_v: "1마일 ≈ 1.609km · 1인치 = 2.54cm · 1피트 = 30.48cm",
    unit_common_area: "면적",
    unit_common_area_v: "1평 ≈ 3.3058㎡ · 1㎡ ≈ 0.3025평 · 1에이커 ≈ 4,046.86㎡",
    unit_common_weight: "무게",
    unit_common_weight_v: "1근(고기) = 600g · 1근(채소) = 375g · 1파운드 ≈ 453.6g",
    unit_common_temp: "온도",
    unit_common_temp_v: "°F = °C × 9/5 + 32 · °C = (°F − 32) × 5/9",
    unit_common_data: "데이터",
    unit_common_data_v: "1KB = 1,024B · 1MB = 1,024KB · 1GB = 1,024MB",
    unit_use_title: "이런 데 쓸 수 있어요",
    unit_use_1: "해외 직구·레시피의 인치·파운드·화씨를 미터법으로 변환",
    unit_use_2: "부동산 매물의 ㎡와 평 상호 환산",
    unit_use_3: "저장 용량, 다운로드 크기의 KB·MB·GB 계산",
    unit_faq_title: "❓ 자주 묻는 질문",
    unit_faq1_q: "1평은 몇 제곱미터인가요?",
    unit_faq1_a: "1평은 약 3.3058㎡입니다. 반대로 1㎡는 약 0.3025평입니다. 면적을 선택하고 평↔㎡로 변환하세요.",
    unit_faq2_q: "데이터 용량은 왜 1,000이 아니라 1,024로 계산되나요?",
    unit_faq2_a: "이 도구는 2의 거듭제곱(1KB = 1,024B) 기준을 사용합니다. 저장장치 제조사는 1,000 단위를 쓰기도 해 표기 용량과 차이가 날 수 있습니다.",
    unit_faq3_q: "섭씨와 화씨는 어떻게 변환하나요?",
    unit_faq3_a: "화씨 = 섭씨 × 9/5 + 32, 섭씨 = (화씨 − 32) × 5/9입니다. 온도를 선택하면 자동으로 계산됩니다.",
    unit_related_title: "🔗 관련 도구",

    charcount_about_title: "글자수는 어떻게 세나요",
    charcount_about_1: "전체 글자수: 공백과 줄바꿈을 포함한 모든 문자 수입니다. 대부분의 지원서·SNS 입력란이 이 기준을 씁니다.",
    charcount_about_2: "공백 제외: 스페이스와 줄바꿈을 뺀 순수 문자 수입니다. ‘공백 제외 800자’ 같은 조건에서 사용합니다.",
    charcount_about_3: "바이트 수: UTF-8 기준으로 한글은 3바이트, 영문·숫자·기본 문장부호는 1바이트, 이모지는 4바이트 이상입니다.",
    charcount_about_4: "단어 수: 공백으로 구분된 덩어리 수로, 영문 글쓰기 분량을 볼 때 유용합니다.",
    charcount_use_title: "이런 데 쓸 수 있어요",
    charcount_use_1: "자기소개서·리포트의 글자수 제한 확인",
    charcount_use_2: "문자 메시지(SMS 90바이트, LMS) 분할 여부 확인",
    charcount_use_3: "메타 설명문, 게시글 제목 등 글자수 제한이 있는 텍스트 작성",
    charcount_faq_title: "❓ 자주 묻는 질문",
    charcount_faq1_q: "바이트와 글자수는 무엇이 다른가요?",
    charcount_faq1_a: "글자수는 문자의 개수, 바이트는 저장 공간의 크기입니다. UTF-8에서 한글 한 글자는 3바이트, 영문은 1바이트입니다. EUC-KR 환경이라면 한글은 2바이트입니다.",
    charcount_faq2_q: "공백을 포함해서 세야 하나요?",
    charcount_faq2_a: "공지에 별도 언급이 없으면 대개 공백 포함 기준입니다. ‘공백 제외’라고 명시된 경우에만 띄어쓰기를 뺀 수를 사용하세요.",
    charcount_faq3_q: "줄바꿈도 글자수에 포함되나요?",
    charcount_faq3_a: "전체 글자수에는 포함됩니다. 문서에서 복사해 붙여넣을 때 줄바꿈이 많으면 예상보다 글자수가 늘어날 수 있습니다.",
    charcount_faq4_q: "입력한 텍스트가 저장되나요?",
    charcount_faq4_a: "아니요. 글자수 계산은 모두 브라우저에서 처리되며 입력한 내용은 서버로 전송되지 않습니다.",
    charcount_related_title: "🔗 관련 도구",

    textconv_about_title: "각 버튼이 하는 일",
    textconv_about_1: "공백 제거: 스페이스·탭·줄바꿈 등 모든 공백 문자를 없앱니다.",
    textconv_about_2: "줄바꿈 제거: 줄바꿈을 공백 한 칸으로 바꿔 여러 줄을 한 줄로 만듭니다.",
    textconv_about_3: "대문자 / 소문자: 영문 알파벳의 대소문자를 일괄 변환합니다.",
    textconv_about_4: "정렬: 각 줄의 앞뒤 공백을 제거합니다(줄 순서는 그대로).",
    textconv_about_5: "역순: 전체 글자 순서를 거꾸로 뒤집습니다.",
    textconv_about_note: "변환 결과는 위 입력을 바꾸지 않고 아래 결과 칸에 표시되며, 복사 버튼으로 가져갈 수 있습니다.",
    textconv_use_title: "이런 데 쓸 수 있어요",
    textconv_use_1: "엑셀·표에서 복사한 텍스트의 불필요한 줄바꿈·공백 정리",
    textconv_use_2: "코드·상수 이름을 대문자 또는 소문자로 통일",
    textconv_use_3: "문장 부호나 공백이 섞인 목록을 한 줄로 합치기",
    textconv_faq_title: "❓ 자주 묻는 질문",
    textconv_faq1_q: "변환이 즉시 적용되나요?",
    textconv_faq1_a: "아니요. 원하는 변환 버튼을 눌러야 결과가 갱신됩니다. 여러 변환을 이어서 적용하려면 결과를 다시 입력란에 붙여넣고 다음 버튼을 누르세요.",
    textconv_faq2_q: "한글에도 대문자·소문자가 적용되나요?",
    textconv_faq2_a: "아니요. 대소문자는 영문 알파벳에만 적용되며 한글·숫자·기호는 그대로 유지됩니다.",
    textconv_faq3_q: "입력한 텍스트가 저장되나요?",
    textconv_faq3_a: "아니요. 모든 변환은 브라우저에서 처리되며 입력한 내용은 서버로 전송되지 않습니다.",
    textconv_related_title: "🔗 관련 도구",

    cal_intro: "날짜·비율 계산부터 연봉·대출·예금·퇴직금 같은 금융 계산까지, 자주 쓰는 계산을 공식 기반으로 정리했습니다. 모든 계산은 브라우저에서 처리되며 입력값은 저장되지 않습니다. 금융·세금 계산 결과는 참고용이며 실제 금액과 차이가 있을 수 있습니다.",
    cal_guide_title: "계산 가이드",
    cal_guide_loan: "원리금균등상환과 원금균등상환, 무엇이 유리한가",
    cal_guide_salary: "연봉 실수령액에서 빠지는 공제 항목 정리",
    cal_guide_age: "만 나이 통일, 내 나이는 어떻게 계산되나",
    cal_guide_savings: "적금 이자가 생각보다 적은 이유",
    cal_guide_tools_link: "글자수·단위 변환 등 다른 도구 보기 →",
    tools_intro: "글자수 세기, 단위 변환, 텍스트 정리, 사진 EXIF 확인 등 문서 작업과 일상에 필요한 도구를 모았습니다. 모든 처리는 브라우저에서 이뤄지며 입력한 내용은 서버로 전송되지 않습니다.",
    tools_guide_title: "도구 활용 가이드",
    tools_guide_charcount: "자기소개서 글자수, 공백 포함해서 세야 하나",
    games_intro: "설치 없이 브라우저에서 바로 즐기는 무료 미니게임입니다. 반응속도, 집중력, 타자 실력을 짧게 확인해 보세요. 모든 기록은 이 브라우저에만 저장되며 서버로 전송되지 않습니다.",
    games_faq_title: "❓ 자주 묻는 질문",
    games_faq1_q: "설치나 회원가입이 필요한가요?",
    games_faq1_a: "아니요. 모든 게임은 웹 브라우저에서 바로 실행되며 설치나 로그인이 필요 없습니다.",
    games_faq2_q: "모바일에서도 할 수 있나요?",
    games_faq2_a: "네. 스도쿠·타자·블록 퍼즐은 터치 조작을 지원하며, 반응속도 테스트도 화면 터치로 측정할 수 있습니다.",
    games_faq3_q: "기록이 저장되나요?",
    games_faq3_a: "최고 기록은 이 브라우저(로컬 저장소)에만 보관되며 서버로 전송되지 않습니다. 브라우저 데이터를 지우면 기록도 사라집니다.",

    tool_lotto_title: "로또번호 생성기",
    tool_lotto_desc: "1부터 45까지의 숫자 중 6개를 무작위로 선택하여 로또번호를 추천합니다.",

    popular_salary_desc: "연봉을 입력하고 실수령액을 확인하세요",
    popular_bmi_desc: "건강한 체중을 유지하세요",
    popular_dday_desc: "목표 날짜까지 남은 날짜를 확인하세요",

    faq_q1: "이 도구들을 사용하려면 회원가입이 필요한가요?",
    faq_a1: "아니요, 모든 도구는 완전히 무료이며 회원가입 없이 사용할 수 있습니다.",
    faq_q2: "계산 결과가 정확한가요?",
    faq_a2: "네, 모든 계산은 정확한 알고리즘으로 계산되지만, 세금이나 복지혜택 등 개인의 상황에 따라 실제 금액과 다를 수 있습니다.",
    faq_q3: "결과를 저장하거나 내보낼 수 있나요?",
    faq_a3: "각 도구의 복사 버튼으로 결과를 클립보드에 복사할 수 있습니다. 현재는 파일 저장 기능은 제공하지 않습니다.",
    faq_q4: "모바일에서도 사용할 수 있나요?",
    faq_a4: "네, 모든 도구는 모바일 기기에 최적화되어 있습니다.",

    faq_meta_title: "자주 묻는 질문 | is-an",
    faq_meta_description: "is-an.github.io 도구 이용에 관한 공통 질문과 각 서비스별 자주 묻는 질문을 한곳에 모았습니다.",
    faq_eyebrow: "도움말",
    faq_page_title: "자주 묻는 질문",
    faq_page_copy: "서비스 이용에 관한 공통 질문과 각 도구별 질문을 정리했습니다.",
    faq_cat_general: "공통 질문",

    saju_title: "사주·운세",
    saju_copy: "생년월일을 바탕으로 사주 정보를 확인합니다.",

    saju_meta_title: "무료 사주풀이 | 사주팔자 확인",
    saju_meta_description: "생년월일과 출생시간을 입력하여 사주 정보를 확인해보세요.",

    saju_eyebrow: "무료 온라인 사주풀이",
    saju_page_title: "무료 사주팔자 풀이",
    saju_page_copy: "생년월일과 출생시간을 입력하여 나의 사주 정보를 확인해보세요.",

    saju_input_title: "사주 정보 입력",
    saju_birth_date: "생년월일",
    saju_birth_time: "출생시간",
    saju_birth_time_unknown: "모름",
    saju_gender: "성별",
    saju_male: "남성",
    saju_female: "여성",
    saju_calculate: "사주 보기",
    saju_input_required: "생년월일을 입력해주세요.",

    saju_result_title: "사주 결과",
    saju_result_placeholder: "정보를 입력하면 결과가 표시됩니다.",
    saju_result_ready: "입력 정보가 확인되었습니다.",
    saju_result_demo: "현재는 사주 입력 및 결과 화면을 준비하는 단계입니다. 실제 만세력 계산 기능은 다음 단계에서 연결합니다.",

    saju_about_title: "사주란?",
    saju_about_copy: "사주는 태어난 연월일시를 기준으로 전통적인 명리학 관점에서 성향과 운세를 살펴보는 방법입니다.",

    saju_faq_title: "❓ 자주 묻는 질문",
    saju_faq1: "출생시간을 모르면 사주를 볼 수 있나요?",
    saju_faq1_answer: "출생시간을 모르는 경우에도 일부 정보를 기준으로 확인할 수 있지만 결과에 차이가 있을 수 있습니다.",
    saju_faq2: "사주 결과는 정확한가요?",
    saju_faq2_answer: "사주는 전통적인 명리학을 바탕으로 한 참고용 해석이며 미래를 확정적으로 예측하는 결과가 아닙니다.",
    saju_faq3: "입력한 정보가 저장되나요?",
    saju_faq3_answer: "아니요. 생년월일과 출생시간은 사용자의 브라우저에서만 계산에 사용되며 서버로 전송되거나 저장되지 않습니다.",

    stock_meta_title: "주식·ETF 적립식 투자 수익 계산기 - 과거 수익률 백테스트 | 무료 온라인 도구",
    stock_meta_description: "특정 시점부터 매달 일정 금액을 주식이나 ETF에 적립식으로 투자했다면 지금 얼마가 되었을지 계산합니다. SPY, QQQ, VOO 등 미국 상장 종목의 과거 수익률을 무료로 백테스트하세요.",
    stock_eyebrow: "과거 수익률 백테스트",
    stock_title: "주식·ETF 적립식 투자 수익 계산기",
    stock_copy: "특정 시점부터 매달 일정 금액을 주식이나 ETF에 적립식으로 투자했다면 지금 얼마가 되었을지 계산합니다.",
    stock_form_ticker: "종목 티커",
    stock_form_ticker_hint: "미국 상장 주식·ETF의 티커를 입력하세요. (예: SPY, QQQ, VOO, AAPL)",
    stock_form_amount: "매월 투자금액 (USD)",
    stock_form_amount_hint: "매달 같은 금액을 매수한다고 가정합니다. 금액은 미국 달러 기준이며 환율은 반영하지 않습니다.",
    stock_form_start: "투자 시작 월",
    stock_form_end: "투자 종료 월 (선택)",
    stock_form_end_hint: "비워 두면 가장 최근 월까지 계산합니다. 과거 데이터는 최대 약 10년까지 제공됩니다.",
    stock_form_dividend: "배당금 처리",
    stock_form_dividend_on: "배당 재투자 포함 (수정주가 기준)",
    stock_form_dividend_off: "배당 제외 (종가 기준)",
    stock_calculate: "계산하기",
    stock_copy_result: "결과 복사",
    stock_reset: "초기화",
    stock_chart_value: "평가금액",
    stock_chart_principal: "투자원금",
    stock_table_toggle: "월별 상세 내역 보기",
    stock_th_month: "월",
    stock_th_price: "주가",
    stock_th_bought: "매수 수량",
    stock_th_shares: "누적 수량",
    stock_th_invested: "누적 원금",
    stock_th_value: "평가금액",
    stock_data_source: "시세 데이터: stockanalysis.com · 참고용이며 실제 투자 결과와 다를 수 있습니다.",
    stock_about_title: "적립식 투자(적금식 투자)란?",
    stock_about_copy: "적립식 투자는 매달 정해진 금액으로 같은 종목을 꾸준히 매수하는 방법입니다. 가격이 쌀 때는 더 많은 수량을, 비쌀 때는 더 적은 수량을 사게 되어 평균 매입 단가가 자연스럽게 분산됩니다. 영어로는 DCA(Dollar Cost Averaging)라고 합니다.",
    stock_about_copy2: "이 계산기는 선택한 시작 월부터 매달 첫 거래일에 입력한 금액만큼 매수했다고 가정하고, 누적 수량과 현재 평가금액, 투자원금 대비 수익률, 연평균 수익률(투자금 가중 수익률)을 계산합니다.",
    stock_disclaimer_title: "계산 시 유의사항",
    stock_disclaimer_copy: "매매 수수료, 세금, 환율, 슬리피지는 반영하지 않습니다. '배당 재투자 포함'은 수정주가(Adjusted Close)를 사용해 배당을 같은 종목에 재투자한 경우를 근사한 값입니다. 과거 수익률은 미래 수익을 보장하지 않으며, 이 도구는 투자 자문이 아닙니다.",
    stock_faq_title: "❓ 자주 묻는 질문",
    stock_faq1_q: "어떤 종목을 조회할 수 있나요?",
    stock_faq1_a: "미국 거래소에 상장된 주식과 ETF를 티커로 조회할 수 있습니다. 예를 들어 SPY, QQQ, VOO, SCHD, AAPL 등입니다. 한국 거래소 종목은 지원하지 않습니다.",
    stock_faq2_q: "얼마나 과거까지 계산할 수 있나요?",
    stock_faq2_a: "시세 데이터 제공 범위에 따라 대략 최근 10년까지 계산할 수 있습니다. 그보다 이른 시작 월을 선택하면 데이터가 있는 가장 이른 월부터 계산합니다.",
    stock_faq3_q: "배당금은 어떻게 반영되나요?",
    stock_faq3_a: "'배당 재투자 포함'을 선택하면 배당락을 반영한 수정주가로 계산해 배당을 같은 종목에 재투자한 결과를 근사합니다. '배당 제외'는 단순 종가로만 계산합니다.",
    stock_faq4_q: "연평균 수익률은 어떻게 계산하나요?",
    stock_faq4_a: "매달 현금을 넣는 적립식 특성을 반영해 투자금 가중 수익률(내부수익률, IRR)을 구한 뒤 연 단위로 환산합니다. 단순히 최종 수익률을 기간으로 나눈 값과는 다릅니다.",
    stock_related_title: "🔗 관련 도구",
    stock_loading: "시세 데이터를 불러오는 중입니다...",
    stock_err_symbol: "해당 티커의 시세 데이터를 찾을 수 없습니다. 티커를 다시 확인해 주세요. (미국 상장 종목만 지원)",
    stock_err_network: "시세 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요. (네트워크 또는 데이터 제공처 문제)",
    stock_err_range: "선택한 기간에 사용할 수 있는 시세 데이터가 없습니다. 시작 월과 종료 월을 확인해 주세요.",
    stock_err_input: "티커와 매월 투자금액, 시작 월을 올바르게 입력해 주세요.",
    stock_notice_clamped: "선택하신 시작 월보다 데이터가 늦게 시작합니다. {month}부터 계산했습니다.",
    stock_res_principal: "총 투자원금",
    stock_res_value: "최종 평가금액",
    stock_res_profit: "총 손익",
    stock_res_return: "누적 수익률",
    stock_res_cagr: "연평균 수익률",
    stock_res_months: "매수 횟수",
    stock_res_shares: "누적 수량",
    stock_res_avgprice: "평균 매입가",
    stock_months_unit: "회",
    stock_shares_unit: "주",
    stock_copied: "결과가 복사되었습니다.",
    tool_stock_title: "주식·ETF 적립식 투자 계산기",
    tool_stock_desc: "과거 특정 시점부터 매달 적립식으로 투자했을 때의 수익률을 계산합니다."
  }
};

const gameTranslations = {
  ko: {
    nav_games: '게임', filter_game: '게임', cat_games: '🎮 미니게임',
    game_start: '게임 시작', game_new: '새 게임', game_restart: '다시하기', game_result: '게임 결과', game_best: '최고 기록', game_share: '결과 공유', game_copyLink: '게임 링크 복사', game_other: '다른 게임', game_linkCopied: '링크가 복사되었습니다.', game_copyManual: '위 텍스트를 직접 복사하세요.', game_time: '시간', game_score: '점수', game_level: '레벨', game_lines: '줄', game_easy: '쉬움', game_medium: '보통', game_hard: '어려움', game_complete: '축하합니다!', game_gameOver: '게임 오버',
    game_reaction_title: '반응속도 테스트', game_reaction_desc: '화면이 바뀌는 순간을 눌러 내 반응 시간을 확인하세요.',
    game_sudoku_title: '스도쿠', game_sudoku_desc: '난이도를 고르고 새로운 9x9 퍼즐에 도전하세요.',
    game_typing_title: '타자 속도 테스트', game_typing_desc: '정확도와 분당 속도를 측정해 보세요.',
    game_block_title: '블록 퍼즐', game_block_desc: '블록을 쌓고 줄을 완성해 최고 점수에 도전하세요.'
  }
};

Object.keys(gameTranslations).forEach((lang) => Object.assign(legacyTranslations[lang], gameTranslations[lang]));

const gamePageTranslations = {
  ko: { sudoku_copy: '난이도를 선택하고 새로운 9x9 퍼즐을 완성하세요.', sudoku_difficulty: '난이도', sudoku_mistakes: '실수', sudoku_check: '정답 확인', sudoku_how: '게임 방법', sudoku_info: '빈 칸을 선택한 뒤 아래 숫자 버튼 또는 키보드 숫자를 입력하세요. 같은 숫자는 강조되고, 틀린 답은 표시됩니다.', typing_copy: '문장을 정확하게 입력하고 타자 속도를 확인하세요.', typing_language: '언어', typing_duration: '시간', typing_placeholder: '시작 후 여기에 입력하세요.', typing_how: '게임 방법', typing_info: '시작을 누른 뒤 표시된 문장을 입력하세요. 선택한 시간이 끝나면 실제 입력을 기준으로 속도와 정확도를 계산합니다.', block_copy: '블록을 쌓고 줄을 완성해 최고 점수에 도전하세요.', block_how: '게임 방법', block_info: '왼쪽/오른쪽 화살표로 이동하고 위쪽 화살표로 회전합니다. 아래쪽 화살표는 빠르게 내리고, 스페이스바는 즉시 떨어뜨립니다.' }
};

Object.keys(gamePageTranslations).forEach((lang) => Object.assign(legacyTranslations[lang], gamePageTranslations[lang]));

const shutterTranslations = {
  ko: { shutter_eyebrow: '브라우저에서 안전하게 분석', shutter_title: '카메라 셔터카운트 확인기', shutter_copy: '사진을 선택하면 EXIF 정보를 분석하여 카메라 모델과 확인 가능한 셔터카운트를 표시합니다.', shutter_upload: '사진 업로드', shutter_formats: 'JPG / JPEG / TIFF / RAW', shutter_choose: '사진 선택', shutter_ready: '사진은 이 기기에서만 분석되며 서버로 전송되지 않습니다.', shutter_reading: '사진 정보를 분석하는 중입니다...', shutter_complete: '분석이 완료되었습니다.', shutter_remove: '사진 제거', shutter_again: '다시 확인', shutter_share: '결과 공유', shutter_copyLink: '링크 복사', shutter_unknown: '확인할 수 없음', shutter_cameraInfo: '카메라 정보', shutter_count: '셔터카운트', shutter_confirmed: '🟢 사진 EXIF에서 확인된 값입니다.', shutter_missing: '🟡 카메라는 확인했지만 이 사진에 셔터카운트 정보가 없습니다.', shutter_missingShort: '셔터카운트: 확인할 수 없음', shutter_undecodable: '⚪ 이 제조사는 확인했지만, 셔터카운트 저장 방식이 기종마다 달라 이 도구가 아직 해석하지 못합니다.', shutter_unsupported: '🔴 지원 제조사 여부를 확인할 수 없으며 셔터카운트 정보도 없습니다.', shutter_make: '제조사', shutter_model: '모델', shutter_date: '촬영일시', shutter_lens: '렌즈', shutter_speed: '셔터스피드', shutter_aperture: '조리개', shutter_focal: '초점거리', shutter_file: '파일 형식', shutter_size: '이미지 크기', shutter_noExif: '이 파일에서 읽을 수 있는 EXIF 정보를 찾지 못했습니다.', shutter_rafInvalid: 'RAF 파일 구조는 인식되었지만 내부 JPEG/EXIF 영역을 찾지 못했습니다.', shutter_error: 'EXIF 정보를 분석할 수 없습니다.', shutter_privacyTitle: '🔒 개인정보 보호', shutter_privacyCopy: '사진은 서버에 업로드되지 않습니다. 모든 파일 읽기와 EXIF 분석은 사용자의 브라우저에서만 처리됩니다.', shutter_aboutTitle: '셔터카운트와 EXIF', shutter_aboutCopy: '셔터카운트는 카메라가 촬영한 횟수를 나타내는 기록입니다. 일부 카메라는 이를 사진의 MakerNote에 저장하지만, 모든 파일과 모든 제조사에서 제공하는 것은 아닙니다. 이 도구는 파일에 명시적으로 저장된 값만 표시하며, 파일명이나 촬영일로 숫자를 추정하지 않습니다.', shutter_rawNote: 'RAW 파일은 카메라 및 브라우저에 따라 EXIF 정보를 읽지 못할 수 있습니다.', shutter_coverageNote: '현재 Fujifilm·Sony·Leica 카메라는 셔터카운트가 저장되어 있으면 바로 확인됩니다. Canon·Panasonic은 카메라 정보는 읽지만 제조사마다 저장 방식이 달라 셔터카운트 해석은 아직 지원하지 않습니다. 스마트폰(iPhone, 대부분의 안드로이드 폰 등)은 애초에 셔터카운트라는 개념이 없어 확인할 수 없습니다.', shutter_faqTitle: '자주 묻는 질문', shutter_faq1q: '셔터카운트란 무엇인가요?', shutter_faq1a: '카메라가 촬영한 횟수를 뜻하는 기록입니다.', shutter_faq2q: '사진만으로 항상 확인할 수 있나요?', shutter_faq2a: '아니요. 카메라와 파일에 따라 셔터카운트가 EXIF에 저장되지 않을 수 있습니다.', shutter_faq3q: '사진이 서버에 업로드되나요?', shutter_faq3a: '아니요. 이 페이지는 네트워크로 사진을 전송하지 않고 브라우저에서만 분석합니다.', shutter_related: '관련 도구', shutter_shareTitle: '카메라 셔터카운트 확인 결과' }
};

Object.keys(shutterTranslations).forEach((lang) => Object.assign(legacyTranslations[lang], shutterTranslations[lang]));

// 홈 리디자인(1a Index) + 공용 헤더/푸터 리디자인 전용 문구.
// legacyTranslations 에는 ko 객체만 존재하므로 ko 만 병합한다.
// en/zh/ja 는 assets/i18n/<lang>.js 의 window.I18N_DATA.<lang> 에 같은 키를 추가했다.
const homeIndexTranslations = {
  ko: {
    home_searchLabel: '도구 검색', home_searchButton: '검색',
    home_index_title: '전체 도구', home_search_results: '검색 결과',
    home_view_all: '전체 보기 →', home_recent_title: '최근 사용', home_recent_clear: '기록 지우기',
    home_favorites_title: '즐겨찾기', home_empty_title: '검색 결과가 없습니다',
    home_empty_copy: '다른 검색어를 입력하거나 전체 도구를 살펴보세요.', home_empty_action: '전체 도구 보기',
    home_guides_title: '계산 가이드',
    header_tagline: '도구 모음', header_menuLabel: '메뉴 열기',
    footer_privacy_note: '개인정보 및 광고·쿠키 안내'
  }
};

Object.keys(homeIndexTranslations).forEach((lang) => Object.assign(legacyTranslations[lang], homeIndexTranslations[lang]));

// 기본 언어 데이터를 지연 로딩 언어와 동일한 형태로 등록(항상 즉시 사용 가능 + translate() 폴백).
window.I18N_DATA.ko = legacyTranslations.ko;

const subpageTranslations = {
  age: {
    ko: { title: '나이 계산기 - 만 나이, 경과 일수 계산 | 무료 온라인 도구', description: '나이 계산기. 생년월일을 입력하면 만 나이, 경과 일수, 다음 생일까지 남은 날짜를 계산합니다.', h1: '나이 계산기', copy: '생년월일을 입력하면 만 나이와 경과 일수를 계산합니다.', birth: '생년월일', base: '기준 날짜', today: '오늘로 설정', calculate: '계산하기', copyButton: '복사', reset: '초기화', faq: '❓ 자주 묻는 질문', related: '🔗 관련 도구' },
    en: { title: 'Age Calculator - Exact Age and Days Elapsed', description: 'Enter a birth date to calculate exact age, elapsed days, and days until the next birthday.', h1: 'Age Calculator', copy: 'Enter a birth date to calculate exact age and days elapsed.', birth: 'Birth date', base: 'Base date', today: 'Set today', calculate: 'Calculate', copyButton: 'Copy', reset: 'Reset', faq: '❓ Frequently asked questions', related: '🔗 Related tools' },
    zh: { title: '年龄计算器 - 周岁与经过天数计算', description: '输入出生日期，计算周岁、经过天数以及距下次生日的天数。', h1: '年龄计算器', copy: '输入出生日期即可计算周岁和经过天数。', birth: '出生日期', base: '基准日期', today: '设为今天', calculate: '计算', copyButton: '复制', reset: '重置', faq: '❓ 常见问题', related: '🔗 相关工具' },
    ja: { title: '年齢計算機 - 満年齢と経過日数を計算', description: '生年月日を入力すると、満年齢、経過日数、次の誕生日までの日数を計算します。', h1: '年齢計算機', copy: '生年月日を入力すると満年齢と経過日数を計算します。', birth: '生年月日', base: '基準日', today: '今日に設定', calculate: '計算する', copyButton: 'コピー', reset: 'リセット', faq: '❓ よくある質問', related: '🔗 関連ツール' }
  },
  dday: {
    ko: { title: 'D-Day 계산기 - 남은 날짜 계산 | 무료 온라인 도구', h1: 'D-Day 계산기', calculate: '계산하기', reset: '초기화', copyButton: '결과 복사', faq: '❓ 자주 묻는 질문', related: '🔗 관련 도구' },
    en: { title: 'D-Day Calculator - Days Remaining', h1: 'D-Day Calculator', calculate: 'Calculate', reset: 'Reset', copyButton: 'Copy result', faq: '❓ Frequently asked questions', related: '🔗 Related tools' },
    zh: { title: 'D-Day 倒数计算器 - 剩余天数计算', h1: 'D-Day 倒数计算器', calculate: '计算', reset: '重置', copyButton: '复制结果', faq: '❓ 常见问题', related: '🔗 相关工具' },
    ja: { title: 'D-Day計算機 - 残り日数を計算', h1: 'D-Day計算機', calculate: '計算する', reset: 'リセット', copyButton: '結果をコピー', faq: '❓ よくある質問', related: '🔗 関連ツール' }
  },
  discharge: {
    ko: { title: '전역일 계산기 - 군 복무기간 계산 | 무료 온라인 도구', h1: '전역일 계산기', calculate: '계산하기', copyButton: '복사', reset: '초기화', faq: '❓ 자주 묻는 질문' },
    en: { title: 'Discharge Date Calculator - Military Service Period', h1: 'Discharge Date Calculator', calculate: 'Calculate', copyButton: 'Copy', reset: 'Reset', faq: '❓ Frequently asked questions' },
    zh: { title: '退伍日期计算器 - 服役期限计算', h1: '退伍日期计算器', calculate: '计算', copyButton: '复制', reset: '重置', faq: '❓ 常见问题' },
    ja: { title: '除隊日計算機 - 服務期間を計算', h1: '除隊日計算機', calculate: '計算する', copyButton: 'コピー', reset: 'リセット', faq: '❓ よくある質問' }
  },
  percent: {
    ko: { title: '퍼센트 계산기 - 할인, 증감 비율 계산 | 무료 온라인 도구', h1: '퍼센트 계산기', copy: 'A의 B%, A는 B의 몇%, 증감 비율을 쉽고 빠르게 계산하세요.', tabOf: 'A의 B%', tabIs: 'A는 B의 몇%', increase: '증가 비율', decrease: '감소 비율', base: 'A (기준값)', percent: 'B (%)', value: 'A (값)', previous: '이전 값', current: '현재 값', calculate: '계산하기', copyButton: '복사', reset: '초기화', faq: '❓ 자주 묻는 질문', faq1: '1000의 15%는 얼마인가요?', faq1a: '첫 번째 탭 "A의 B%"에서 A에 1000, B에 15를 입력하면 150이라는 답을 얻을 수 있습니다.', faq2: '할인가를 계산하려면?', faq2a: '10,000원에서 20% 할인받으면 "A의 B%"에서 10000의 80%를 계산하면 됩니다. 원래 가격의 80%가 할인가입니다.', faq3: '증감 비율을 어떻게 계산하나요?', faq3a: '"증가 비율" 탭에서 이전 값과 현재 값을 입력하면 증가율을 계산할 수 있습니다.', related: '🔗 관련 도구', vat: '부가세 계산기', vatDesc: '공급가액과 부가세 계산', salary: '연봉 계산기', salaryDesc: '연봉에서 세후 급여 계산' },
    en: { title: 'Percentage Calculator - Discount and Change Rate', h1: 'Percentage Calculator', copy: 'Quickly calculate B% of A, what percentage A is of B, and the rate of change.', tabOf: 'B% of A', tabIs: 'What percent is A of B?', increase: 'Increase rate', decrease: 'Decrease rate', base: 'A (base value)', percent: 'B (%)', value: 'A (value)', previous: 'Previous value', current: 'Current value', calculate: 'Calculate', copyButton: 'Copy', reset: 'Reset', faq: '❓ Frequently asked questions', faq1: 'What is 15% of 1000?', faq1a: 'Enter 1000 for A and 15 for B in the "B% of A" tab to get 150.', faq2: 'How do I calculate a discount price?', faq2a: 'For a 20% discount on 10,000 won, calculate 80% of 10,000 in the "B% of A" tab.', faq3: 'How do I calculate a change rate?', faq3a: 'Enter the previous and current values in the "Increase rate" tab to calculate the increase percentage.', related: '🔗 Related tools', vat: 'VAT Calculator', vatDesc: 'Calculate supply price and VAT', salary: 'Salary Calculator', salaryDesc: 'Calculate take-home pay from salary' },
    zh: { title: '百分比计算器 - 折扣与增减比例计算', h1: '百分比计算器', copy: '快速计算 A 的 B%、A 是 B 的百分之多少以及增减比例。', tabOf: 'A 的 B%', tabIs: 'A 是 B 的百分之多少', increase: '增加比例', decrease: '减少比例', base: 'A（基准值）', percent: 'B（%）', value: 'A（数值）', previous: '之前的值', current: '当前值', calculate: '计算', copyButton: '复制', reset: '重置', faq: '❓ 常见问题', faq1: '1000 的 15% 是多少？', faq1a: '在“A 的 B%”标签中输入 A=1000、B=15，即可得到 150。', faq2: '如何计算折后价格？', faq2a: '例如 10000 打八折，在“A 的 B%”标签中计算 10000 的 80% 即可。', faq3: '如何计算增减比例？', faq3a: '在“增加比例”标签中输入之前的值和当前值即可计算增加百分比。', related: '🔗 相关工具', vat: '增值税计算器', vatDesc: '计算供货价和增值税', salary: '薪资计算器', salaryDesc: '根据年薪计算税后工资' },
    ja: { title: 'パーセント計算機 - 割引と増減率を計算', h1: 'パーセント計算機', copy: 'AのB%、AはBの何%か、増減率を簡単に計算します。', tabOf: 'AのB%', tabIs: 'AはBの何%', increase: '増加率', decrease: '減少率', base: 'A（基準値）', percent: 'B（%）', value: 'A（値）', previous: '以前の値', current: '現在の値', calculate: '計算する', copyButton: 'コピー', reset: 'リセット', faq: '❓ よくある質問', faq1: '1000の15%はいくつですか？', faq1a: '「AのB%」タブでAに1000、Bに15を入力すると150になります。', faq2: '割引価格を計算するには？', faq2a: '10,000円を20%割引する場合、「AのB%」で10,000の80%を計算します。', faq3: '増減率を計算するには？', faq3a: '「増加率」タブで以前の値と現在の値を入力すると増加率を計算できます。', related: '🔗 関連ツール', vat: '付加価値税計算機', vatDesc: '供給価額と税額を計算', salary: '年俸計算機', salaryDesc: '年俸から手取り給与を計算' }
  },
  bmi: {
    ko: { title: 'BMI 계산기 - 건강 체중 계산 | 무료 온라인 도구', h1: 'BMI 계산기', calculate: '계산하기', copyButton: '복사', reset: '초기화', faq: '❓ 자주 묻는 질문' },
    en: { title: 'BMI Calculator - Healthy Weight Calculator', h1: 'BMI Calculator', calculate: 'Calculate', copyButton: 'Copy', reset: 'Reset', faq: '❓ Frequently asked questions' },
    zh: { title: 'BMI 计算器 - 健康体重计算', h1: 'BMI 计算器', calculate: '计算', copyButton: '复制', reset: '重置', faq: '❓ 常见问题' },
    ja: { title: 'BMI計算機 - 健康体重を計算', h1: 'BMI計算機', calculate: '計算する', copyButton: 'コピー', reset: 'リセット', faq: '❓ よくある質問' }
  },
  charcount: {
    ko: { title: '글자수/바이트 계산기 - 텍스트 글자수 세기 | 무료 온라인 도구', h1: '글자수/바이트 계산기', copyButton: '복사', reset: '초기화', faq: '❓ 자주 묻는 질문' },
    en: { title: 'Character/Byte Counter - Count Text Characters', h1: 'Character/Byte Counter', copyButton: 'Copy', reset: 'Reset', faq: '❓ Frequently asked questions' },
    zh: { title: '字数/字节计算器 - 文本字数统计', h1: '字数/字节计算器', copyButton: '复制', reset: '重置', faq: '❓ 常见问题' },
    ja: { title: '文字数/バイト計算機 - テキスト文字数カウント', h1: '文字数/バイト計算機', copyButton: 'コピー', reset: 'リセット', faq: '❓ よくある質問' }
  },
  unit: {
    ko: { title: '단위 변환기 - 길이, 무게, 온도 변환 | 무료 온라인 도구', h1: '단위 변환기', copyButton: '복사', reset: '초기화', faq: '❓ 자주 묻는 질문' },
    en: { title: 'Unit Converter - Length, Weight, and Temperature', h1: 'Unit Converter', copyButton: 'Copy', reset: 'Reset', faq: '❓ Frequently asked questions' },
    zh: { title: '单位换算器 - 长度、重量和温度换算', h1: '单位换算器', copyButton: '复制', reset: '重置', faq: '❓ 常见问题' },
    ja: { title: '単位変換機 - 長さ、重さ、温度を変換', h1: '単位変換機', copyButton: 'コピー', reset: 'リセット', faq: '❓ よくある質問' }
  },
  textconv: {
    ko: { title: '텍스트 변환 도구 - 대소문자, 공백 제거 | 무료 온라인 도구', h1: '텍스트 변환 도구', copyButton: '복사', reset: '초기화', faq: '❓ 자주 묻는 질문' },
    en: { title: 'Text Converter - Case and Space Tools', h1: 'Text Converter', copyButton: 'Copy', reset: 'Reset', faq: '❓ Frequently asked questions' },
    zh: { title: '文本转换工具 - 大小写与空格处理', h1: '文本转换工具', copyButton: '复制', reset: '重置', faq: '❓ 常见问题' },
    ja: { title: 'テキスト変換ツール - 大文字・空白を処理', h1: 'テキスト変換ツール', copyButton: 'コピー', reset: 'リセット', faq: '❓ よくある質問' }
  },
  loan: {
    ko: { title: '대출 이자 계산기 - 월 상환액 계산 | 무료 온라인 도구', h1: '대출 이자 계산기', calculate: '계산하기', copyButton: '복사', reset: '초기화', faq: '❓ 자주 묻는 질문' },
    en: { title: 'Loan Interest Calculator - Monthly Payment', h1: 'Loan Interest Calculator', calculate: 'Calculate', copyButton: 'Copy', reset: 'Reset', faq: '❓ Frequently asked questions' },
    zh: { title: '贷款利息计算器 - 月供计算', h1: '贷款利息计算器', calculate: '计算', copyButton: '复制', reset: '重置', faq: '❓ 常见问题' },
    ja: { title: 'ローン利息計算機 - 月々の返済額を計算', h1: 'ローン利息計算機', calculate: '計算する', copyButton: 'コピー', reset: 'リセット', faq: '❓ よくある質問' }
  },
  retirement: {
    ko: { title: '퇴직금 계산기 - 예상 퇴직금 계산 | 무료 온라인 도구', h1: '퇴직금 계산기', calculate: '계산하기', copyButton: '복사', reset: '초기화', faq: '❓ 자주 묻는 질문' },
    en: { title: 'Severance Pay Calculator - Estimate Severance', h1: 'Severance Pay Calculator', calculate: 'Calculate', copyButton: 'Copy', reset: 'Reset', faq: '❓ Frequently asked questions' },
    zh: { title: '退休金计算器 - 预计退休金计算', h1: '退休金计算器', calculate: '计算', copyButton: '复制', reset: '重置', faq: '❓ 常见问题' },
    ja: { title: '退職金計算機 - 予想退職金を計算', h1: '退職金計算機', calculate: '計算する', copyButton: 'コピー', reset: 'リセット', faq: '❓ よくある質問' }
  },
  salary: {
    ko: { title: '연봉 계산기 - 세후 실수령액 계산 | 무료 온라인 도구', h1: '연봉 계산기', calculate: '계산하기', copyButton: '복사', reset: '초기화', faq: '❓ 자주 묻는 질문' },
    en: { title: 'Salary Calculator - Estimate Take-Home Pay', h1: 'Salary Calculator', calculate: 'Calculate', copyButton: 'Copy', reset: 'Reset', faq: '❓ Frequently asked questions' },
    zh: { title: '薪资计算器 - 税后收入计算', h1: '薪资计算器', calculate: '计算', copyButton: '复制', reset: '重置', faq: '❓ 常见问题' },
    ja: { title: '年俸計算機 - 手取り額を計算', h1: '年俸計算機', calculate: '計算する', copyButton: 'コピー', reset: 'リセット', faq: '❓ よくある質問' }
  },
  savings: {
    ko: { title: '예금/적금 이자 계산기 - 만기액 계산 | 무료 온라인 도구', h1: '예금/적금 이자 계산기', calculate: '계산하기', copyButton: '복사', reset: '초기화', faq: '❓ 자주 묻는 질문' },
    en: { title: 'Savings Interest Calculator - Maturity Amount', h1: 'Savings Interest Calculator', calculate: 'Calculate', copyButton: 'Copy', reset: 'Reset', faq: '❓ Frequently asked questions' },
    zh: { title: '存款利息计算器 - 到期金额计算', h1: '存款利息计算器', calculate: '计算', copyButton: '复制', reset: '重置', faq: '❓ 常见问题' },
    ja: { title: '預金・積立金利計算機 - 満期額を計算', h1: '預金・積立金利計算機', calculate: '計算する', copyButton: 'コピー', reset: 'リセット', faq: '❓ よくある質問' }
  },
  vat: {
    ko: { title: '부가세 계산기 - 공급가액, 부가세 계산 | 무료 온라인 도구', h1: '부가세 계산기', calculate: '계산하기', copyButton: '복사', reset: '초기화', faq: '❓ 자주 묻는 질문' },
    en: { title: 'VAT Calculator - Supply Price and VAT', h1: 'VAT Calculator', calculate: 'Calculate', copyButton: 'Copy', reset: 'Reset', faq: '❓ Frequently asked questions' },
    zh: { title: '增值税计算器 - 供货价与增值税计算', h1: '增值税计算器', calculate: '计算', copyButton: '复制', reset: '重置', faq: '❓ 常见问题' },
    ja: { title: '付加価値税計算機 - 供給価額と税額を計算', h1: '付加価値税計算機', calculate: '計算する', copyButton: 'コピー', reset: 'リセット', faq: '❓ よくある質問' }
  }
};

const translations = {};

function pickTranslationKeys(source, keys) {
  return keys.reduce((group, key) => {
    if (source[key] !== undefined) group[key] = source[key];
    return group;
  }, {});
}

function buildTranslationCatalog(lang) {
  const source = window.I18N_DATA[lang];
  const gameCommon = pickTranslationKeys(source, [
    'nav_games', 'filter_game', 'cat_games', 'game_start', 'game_new', 'game_restart', 'game_result',
    'game_best', 'game_share', 'game_copyLink', 'game_other', 'game_linkCopied', 'game_copyManual',
    'game_time', 'game_score', 'game_level', 'game_lines', 'game_easy', 'game_medium', 'game_hard',
    'game_complete', 'game_gameOver', 'game_reaction_title', 'game_reaction_desc', 'game_sudoku_title',
    'game_sudoku_desc', 'game_typing_title', 'game_typing_desc', 'game_block_title', 'game_block_desc',
    'sudoku_copy', 'sudoku_difficulty', 'sudoku_mistakes', 'sudoku_check', 'sudoku_how', 'sudoku_info',
    'typing_copy', 'typing_language', 'typing_duration', 'typing_placeholder', 'typing_how', 'typing_info',
    'block_copy', 'block_how', 'block_info'
  ]);
  const games = {
    common: gameCommon,
    reaction: { title: source.game_reaction_title, desc: source.game_reaction_desc },
    sudoku: { title: source.game_sudoku_title, desc: source.game_sudoku_desc, copy: source.sudoku_copy },
    typing: { title: source.game_typing_title, desc: source.game_typing_desc, copy: source.typing_copy },
    blockPuzzle: { title: source.game_block_title, desc: source.game_block_desc, copy: source.block_copy }
  };
  const cal = {
    age: subpageTranslations.age[lang],
    dday: subpageTranslations.dday[lang],
    discharge: subpageTranslations.discharge[lang],
    percent: Object.assign({}, subpageTranslations.percent[lang], {
      sub_percent_copy: subpageTranslations.percent[lang].copy,
      sub_percent_tabOf: subpageTranslations.percent[lang].tabOf,
      sub_percent_tabIs: subpageTranslations.percent[lang].tabIs,
      sub_percent_increase: subpageTranslations.percent[lang].increase,
      sub_percent_decrease: subpageTranslations.percent[lang].decrease,
      sub_percent_base: subpageTranslations.percent[lang].base,
      sub_percent_percent: subpageTranslations.percent[lang].percent,
      sub_percent_value: subpageTranslations.percent[lang].value,
      sub_percent_previous: subpageTranslations.percent[lang].previous,
      sub_percent_current: subpageTranslations.percent[lang].current,
      sub_percent_faq1: subpageTranslations.percent[lang].faq1,
      sub_percent_faq1a: subpageTranslations.percent[lang].faq1a,
      sub_percent_faq2: subpageTranslations.percent[lang].faq2,
      sub_percent_faq2a: subpageTranslations.percent[lang].faq2a,
      sub_percent_faq3: subpageTranslations.percent[lang].faq3,
      sub_percent_faq3a: subpageTranslations.percent[lang].faq3a,
      sub_percent_vat: subpageTranslations.percent[lang].vat,
      sub_percent_vatDesc: subpageTranslations.percent[lang].vatDesc,
      sub_percent_salary: subpageTranslations.percent[lang].salary,
      sub_percent_salaryDesc: subpageTranslations.percent[lang].salaryDesc
    })
  };
  const tools = {
    bmi: subpageTranslations.bmi[lang],
    charcount: subpageTranslations.charcount[lang],
    loan: subpageTranslations.loan[lang],
    retirement: subpageTranslations.retirement[lang],
    salary: subpageTranslations.salary[lang],
    savings: subpageTranslations.savings[lang],
    shutterCount: pickTranslationKeys(source, Object.keys(shutterTranslations.ko)),
    textconv: subpageTranslations.textconv[lang],
    unit: subpageTranslations.unit[lang],
    vat: subpageTranslations.vat[lang]
  };
  return {
    common: pickTranslationKeys(source, [
      'language', 'darkMode', 'lightMode', 'meta_title', 'meta_description', 'og_title', 'og_description',
      'filter_all', 'filter_calculator', 'filter_converter', 'filter_generator', 'filter_game', 'cat_calculator',
      'cat_converter', 'cat_finance', 'cat_generator', 'cat_popular', 'cat_faq', 'faq_q1', 'faq_a1',
      'faq_q2', 'faq_a2', 'faq_q3', 'faq_a3', 'faq_q4', 'faq_a4'
    ]),
    nav: {
      home: source.nav_home,
      calculator: source.nav_calculator,
      saju: source.nav_saju,
      lotto: source.nav_lotto,
      tools: source.nav_tools,
      games: source.nav_games,
      guide: source.nav_guide,
      faq: source.nav_faq,
      contact: source.nav_contact
    },
    footer: {
      toolsTitle: source.footer_toolsTitle,
      infoTitle: source.footer_infoTitle,
      socialTitle: source.footer_socialTitle,
      calculatorLink: source.footer_calculatorLink,
      lottoLink: source.footer_lottoLink,
      toolsLink: source.footer_toolsLink,
      gamesLink: source.footer_gamesLink,
      sajuLink: source.footer_sajuLink,
      home: source.footer_home,
      guide: source.footer_guide,
      faq: source.footer_faq,
      contact: source.footer_contact,
      privacy: source.footer_privacy
    },
    cal: cal,
    games: games,
    lotto: {
      meta: pickTranslationKeys(source, ['lotto_meta_title', 'lotto_meta_description']),
      eyebrow: source.lotto_eyebrow,
      title: source.lotto_title,
      copy: source.lotto_copy,
      intro: source.lotto_intro,
      fixedLabel: source.lotto_fixedLabel,
      slot1: source.lotto_slot1, slot2: source.lotto_slot2, slot3: source.lotto_slot3,
      slot4: source.lotto_slot4, slot5: source.lotto_slot5, slot6: source.lotto_slot6,
      generateOne: source.lotto_generateOne, generateFive: source.lotto_generateFive, reset: source.lotto_reset,
      toolTitle: source.tool_lotto_title, toolDesc: source.tool_lotto_desc
    },
    tools: Object.assign(tools, pickTranslationKeys(source, ['tools_meta_title', 'tools_meta_description', 'tools_eyebrow', 'tools_title', 'tools_copy', 'tool_charcount_title', 'tool_charcount_desc', 'tool_unit_title', 'tool_unit_desc', 'tool_textconv_title', 'tool_textconv_desc', 'tool_shutter_count_title', 'tool_shutter_count_desc', 'tool_bmi_title', 'tool_bmi_desc', 'tool_salary_title', 'tool_salary_desc', 'tool_vat_title', 'tool_vat_desc', 'tool_loan_title', 'tool_loan_desc', 'tool_savings_title', 'tool_savings_desc', 'tool_retirement_title', 'tool_retirement_desc'])),
    guide: {
      nav: source.nav_guide,
      meta: { title: source.guide_meta_title, description: source.guide_meta_description },
      eyebrow: source.guide_eyebrow, title: source.guide_title, copy: source.guide_copy, read: source.guide_read,
      related: source.guide_related, back: source.guide_back
    },
    saju: {
      meta_title: source.saju_meta_title,
      meta_description: source.saju_meta_description,
      eyebrow: source.saju_eyebrow,
      title: source.saju_page_title,
      copy: source.saju_page_copy,
      input_title: source.saju_input_title,
      birth_date: source.saju_birth_date,
      birth_time: source.saju_birth_time,
      birth_time_unknown: source.saju_birth_time_unknown,
      gender: source.saju_gender,
      male: source.saju_male,
      female: source.saju_female,
      calculate: source.saju_calculate,
      result_title: source.saju_result_title,
      result_placeholder: source.saju_result_placeholder,
      about_title: source.saju_about_title,
      about_copy: source.saju_about_copy,
      faq_title: source.saju_faq_title,
      faq1: source.saju_faq1,
      faq1_answer: source.saju_faq1_answer,
      faq2: source.saju_faq2,
      faq2_answer: source.saju_faq2_answer,
      faq3: source.saju_faq3,
      faq3_answer: source.saju_faq3_answer
    },
  };
}

// 시작 시점에는 기본 언어(ko)만 카탈로그를 구성한다. 나머지는 ensureLanguage() 로 로드될 때 등록된다.
registerLanguage(DEFAULT_LANGUAGE);

function getSubpageName() {
  const path = window.location.pathname;
  const match = path.match(/\/(?:cal|tools)\/([^/]+)\/(?:index\.html?)?$/);
  return match ? match[1] : null;
}

function applySubpageLanguage(lang) {
  const page = getSubpageName();
  const dictionary = page && subpageTranslations[page] && subpageTranslations[page][lang];
  if (!dictionary) return;
  if (page === 'percent') {
    const percentKeys = {
      copy: 'copy', tabOf: 'tabOf', tabIs: 'tabIs', increase: 'increase', decrease: 'decrease',
      base: 'base', percent: 'percent', value: 'value', previous: 'previous', current: 'current',
      faq1: 'faq1', faq1a: 'faq1a', faq2: 'faq2', faq2a: 'faq2a', faq3: 'faq3', faq3a: 'faq3a', vat: 'vat', vatDesc: 'vatDesc', salary: 'salary', salaryDesc: 'salaryDesc'
    };
    document.querySelectorAll('[data-i18n^="sub_percent_"]').forEach((element) => {
      const suffix = element.getAttribute('data-i18n').replace('sub_percent_', '');
      const field = percentKeys[suffix];
      if (field && dictionary[field]) element.textContent = dictionary[field];
    });
  }
  if (dictionary.title) document.title = dictionary.title;
  const description = document.querySelector('meta[name="description"]');
  if (description && dictionary.description) description.setAttribute('content', dictionary.description);
  const h1 = document.querySelector('main h1');
  if (h1 && dictionary.h1) h1.textContent = dictionary.h1;
  const copy = document.querySelector('main .hero-copy');
  if (copy && dictionary.copy) copy.textContent = dictionary.copy;
  document.querySelectorAll('main h2').forEach((heading) => {
    if (heading.textContent.includes('자주') || heading.textContent.includes('Frequently') || heading.textContent.includes('常见') || heading.textContent.includes('よく')) heading.textContent = dictionary.faq || heading.textContent;
    if (heading.textContent.includes('관련') || heading.textContent.includes('Related') || heading.textContent.includes('相关') || heading.textContent.includes('関連')) heading.textContent = dictionary.related || heading.textContent;
  });
  document.querySelectorAll('.primary-btn').forEach((button) => { if (dictionary.calculate && button.textContent.trim() === '계산하기') button.textContent = dictionary.calculate; });
  document.querySelectorAll('.secondary-btn').forEach((button) => { if (dictionary.copyButton && (button.textContent.trim() === '복사' || button.textContent.trim() === '결과 복사')) button.textContent = dictionary.copyButton; });
  document.querySelectorAll('.text-button').forEach((button) => { if (dictionary.reset && button.textContent.trim() === '초기화') button.textContent = dictionary.reset; });
  if (page === 'age') {
    const labels = document.querySelectorAll('label');
    if (labels[0] && dictionary.birth) labels[0].textContent = dictionary.birth;
    if (labels[1] && dictionary.base) labels[1].textContent = dictionary.base;
    const today = document.getElementById('setTodayBtn');
    if (today && dictionary.today) today.textContent = dictionary.today;
  }
}

function getStoredLanguage() {
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch (e) {
    return null;
  }
}

function detectBrowserLanguage() {
  const raw = ((navigator.language || navigator.userLanguage || '') + '').toLowerCase();
  if (raw.indexOf('ko') === 0) return 'ko';
  if (raw.indexOf('en') === 0) return 'en';
  if (raw.indexOf('zh') === 0) return 'zh';
  if (raw.indexOf('ja') === 0) return 'ja';
  return DEFAULT_LANGUAGE;
}

function getCurrentLanguage() {
  if (selectedLanguage) { return selectedLanguage; }
  const stored = getStoredLanguage();
  if (stored && SUPPORTED_LANGUAGES.indexOf(stored) !== -1) {
    return stored;
  }
  return detectBrowserLanguage();
}

function findGroupedTranslation(group, key) {
  if (!group || typeof group !== 'object') return undefined;
  if (key.includes('.')) {
    const value = key.split('.').reduce((current, segment) => {
      return current && typeof current === 'object' ? current[segment] : undefined;
    }, group);
    if (value !== undefined) return value;
  }
  if (Object.prototype.hasOwnProperty.call(group, key)) return group[key];
  for (const child of Object.values(group)) {
    const value = findGroupedTranslation(child, key);
    if (value !== undefined) return value;
  }
  return undefined;
}

function translate(key, lang) {
  const grouped = findGroupedTranslation(translations[lang], key);
  if (grouped !== undefined) return grouped;
  const fallbackGrouped = findGroupedTranslation(translations[DEFAULT_LANGUAGE], key);
  return fallbackGrouped !== undefined ? fallbackGrouped : key;
}

function applyLanguage(lang) {
  const activeLang = SUPPORTED_LANGUAGES.indexOf(lang) !== -1 ? lang : DEFAULT_LANGUAGE;

  // 해당 언어 데이터가 아직 로드되지 않았으면 로드 후 다시 적용(중간 상태 렌더 없음).
  // 로드에 실패하면 기본 언어로 폴백한다(무한 재시도 방지).
  if (!translations[activeLang]) {
    ensureLanguage(activeLang).then(() => {
      applyLanguage(translations[activeLang] ? activeLang : DEFAULT_LANGUAGE);
    });
    return;
  }

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    el.textContent = translate(key, activeLang);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.setAttribute('placeholder', translate(key, activeLang));
  });

  document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria-label');
    el.setAttribute('aria-label', translate(key, activeLang));
  });

  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    el.setAttribute('title', translate(key, activeLang));
  });

  document.querySelectorAll('[data-i18n-content]').forEach((el) => {
    const key = el.getAttribute('data-i18n-content');
    el.setAttribute('content', translate(key, activeLang));
  });

  document.documentElement.setAttribute('lang', activeLang);

  const langCurrentEl = document.getElementById('langCurrent');
  if (langCurrentEl) {
    langCurrentEl.textContent = LANGUAGE_NAMES[activeLang] || LANGUAGE_NAMES[DEFAULT_LANGUAGE];
  }

  document.querySelectorAll('.lang-dropdown [data-lang]').forEach((item) => {
    item.setAttribute('aria-selected', item.getAttribute('data-lang') === activeLang ? 'true' : 'false');
  });

  if (typeof updateThemeToggleLabel === 'function') {
    updateThemeToggleLabel();
  }
  applySubpageLanguage(activeLang);
}

function setLanguage(lang) {
  const activeLang = SUPPORTED_LANGUAGES.indexOf(lang) !== -1 ? lang : DEFAULT_LANGUAGE;
  selectedLanguage = activeLang;
  // 데이터가 준비된 뒤 한 번만 적용 → 언어 전환 시 중간 깜빡임 없음.
  ensureLanguage(activeLang).then(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, activeLang);
    } catch (e) {
      // localStorage 사용 불가 환경에서도 언어 전환은 동작하도록 유지
    }
    applyLanguage(activeLang);
    document.dispatchEvent(new CustomEvent('v2:language', { detail: activeLang }));
  });
}

function initI18n() {
  const lang = getCurrentLanguage();
  ensureLanguage(lang).then(() => {
    applyLanguage(lang);
    document.dispatchEvent(new CustomEvent('v2:language', { detail: lang }));
  });
}

function attachLanguageSwitcher() {
  const toggle = document.getElementById('langToggle');
  const dropdown = document.getElementById('langDropdown');
  if (!toggle || !dropdown || toggle.dataset.langBound === 'true') {
    return;
  }
  toggle.dataset.langBound = 'true';

  function closeDropdown() {
    dropdown.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  function openDropdown() {
    // 헤더 팝업은 한 번에 하나만: 다른 팝업(메뉴/검색)을 닫는다.
    document.dispatchEvent(new CustomEvent('v2:popup', { detail: 'lang' }));
    dropdown.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
  }

  document.addEventListener('v2:popup', (e) => {
    if (e.detail !== 'lang') { closeDropdown(); }
  });

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (dropdown.classList.contains('open')) {
      closeDropdown();
    } else {
      openDropdown();
    }
  });

  dropdown.querySelectorAll('[data-lang]').forEach((item) => {
    item.addEventListener('click', () => {
      setLanguage(item.getAttribute('data-lang'));
      closeDropdown();
      toggle.focus();
    });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setLanguage(item.getAttribute('data-lang'));
        closeDropdown();
        toggle.focus();
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && e.target !== toggle) {
      closeDropdown();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dropdown.classList.contains('open')) {
      closeDropdown();
      toggle.focus();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initI18n);
} else {
  initI18n();
}
