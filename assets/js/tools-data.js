/* =========================================================
   tools-data.js — 사이트 도구 목록 (단일 관리 지점)
   ---------------------------------------------------------
   ▸ 도구 추가:   TOOLS 배열에 항목 하나 추가
   ▸ 카테고리 추가: CATEGORIES 배열에 항목 하나 추가
   ▸ 개수/인기/검색 색인은 모두 자동 계산됩니다. 하드코딩 금지.
   ▸ ES 모듈이 아닌 전역 스크립트입니다 (저장소 규칙).

   항목 필드
     id        고유값
     cat       CATEGORIES 의 id
     name      한국어 표시명 (i18n 키가 없을 때 그대로 출력)
     key       i18n 키 (없으면 null)
     href      사이트 루트 기준 경로
     desc      카드용 한 줄 설명
     descKey   설명 i18n 키 (없으면 null)
     short     인덱스 목록 오른쪽에 붙는 짧은 라벨
     keywords  검색 보조 키워드
   ========================================================= */

window.SITE_TOOLS = (function () {
  var CATEGORIES = [
    { id: 'cal',   name: '계산기',    key: 'tool_calculator_title', href: '/cal/',   dot: '#2f7d55' },
    { id: 'tools', name: '도구',      key: 'tools_title',           href: '/tools/', dot: '#3d6ea8' },
    { id: 'games', name: '게임',      key: 'games_title',           href: '/games/', dot: '#a15c00' },
    { id: 'lotto', name: '로또',      key: 'lotto_title',           href: '/lotto/', dot: '#8a5cb8' },
    { id: 'saju',  name: '사주·운세', key: 'saju_title',            href: '/saju/',  dot: '#b3455e' }
  ];

  var TOOLS = [
    { id: 'salary', cat: 'cal', name: '연봉 계산기', key: 'tool_salary_title', href: '/tools/salary/',
      desc: '연봉을 입력하고 실수령액을 확인하세요.', descKey: 'popular_salary_desc',
      short: '월급·세전/세후', keywords: '월급 실수령액 세후' },

    { id: 'dday', cat: 'cal', name: 'D-Day 계산기', key: 'tool_dday_title', href: '/cal/dday/',
      desc: '목표 날짜까지 남은 날짜를 확인하세요.', descKey: 'popular_dday_desc',
      short: '남은 날짜', keywords: '디데이 날짜' },

    { id: 'lotto', cat: 'lotto', name: '로또번호 생성기', key: 'tool_lotto_title', href: '/lotto/',
      desc: '간편하게 로또 번호를 생성하세요.', descKey: 'tool_lotto_desc',
      short: '번호 생성', keywords: '로또 추천 번호' },

    { id: 'bmi', cat: 'cal', name: 'BMI 계산기', key: 'tool_bmi_title', href: '/tools/bmi/',
      desc: '키와 체중으로 BMI를 계산하세요.', descKey: 'tool_bmi_desc',
      short: '체질량지수', keywords: '비만도 건강 체중' },

    { id: 'percent', cat: 'cal', name: '퍼센트 계산기', key: 'tool_percent_title', href: '/cal/percent/',
      desc: 'A의 B%, A는 B의 몇 %, 증감 비율 등을 빠르게 계산합니다.', descKey: 'tool_percent_desc',
      short: '증감 비율', keywords: '비율 할인' },

    { id: 'age', cat: 'cal', name: '나이 계산기', key: 'tool_age_title', href: '/cal/age/',
      desc: '생년월일을 입력하면 만 나이, 경과 일수, 다음 생일까지의 날짜를 계산합니다.', descKey: 'tool_age_desc',
      short: '만 나이·다음 생일', keywords: '만나이 생일' },

    { id: 'discharge', cat: 'cal', name: '전역일 계산기', key: 'tool_discharge_title', href: '/cal/discharge/',
      desc: '입대일과 복무기간으로부터 전역일을 계산합니다.', descKey: 'tool_discharge_desc',
      short: '입대일·복무기간', keywords: '군대 전역' },

    { id: 'loan', cat: 'cal', name: '대출 이자 계산기', key: 'tool_loan_title', href: '/tools/loan/',
      desc: '대출금액, 이율, 기간으로부터 월 상환액과 총 이자를 계산합니다.', descKey: 'tool_loan_desc',
      short: '월 상환액·총 이자', keywords: '원리금 원금균등' },

    { id: 'savings', cat: 'cal', name: '예금/적금 이자 계산기', key: 'tool_savings_title', href: '/tools/savings/',
      desc: '예치금과 이율로부터 이자와 만기 수령액을 계산합니다.', descKey: 'tool_savings_desc',
      short: '만기 수령액', keywords: '예금 적금 이자' },

    { id: 'retirement', cat: 'cal', name: '퇴직금 계산기', key: 'tool_retirement_title', href: '/tools/retirement/',
      desc: '입사일과 퇴사일로부터 예상 퇴직금을 계산합니다.', descKey: 'tool_retirement_desc',
      short: '예상 퇴직금', keywords: '퇴사 평균임금' },

    { id: 'vat', cat: 'cal', name: '부가세 계산기', key: 'tool_vat_title', href: '/tools/vat/',
      desc: '공급가액, 부가세, 합계금액을 계산하고 역산합니다.', descKey: 'tool_vat_desc',
      short: '공급가·역산', keywords: '세금 부가가치세' },

    { id: 'stock', cat: 'cal', name: '주식·ETF 적립식 투자 계산기', key: 'tool_stock_title', href: '/stock/',
      desc: '과거 특정 시점부터 매달 적립식으로 투자했을 때의 수익률을 계산합니다.', descKey: 'stock_copy',
      short: '수익률', keywords: 'ETF 투자 적립' },

    { id: 'charcount', cat: 'tools', name: '글자수/바이트 계산기', key: 'tool_charcount_title', href: '/tools/charcount/',
      desc: '텍스트의 글자수, 공백 포함/제외 글자수, 바이트 수를 실시간으로 계산합니다.', descKey: 'tool_charcount_desc',
      short: '공백 포함/제외', keywords: '자소서 글자수' },

    { id: 'unit', cat: 'tools', name: '단위 변환기', key: 'tool_unit_title', href: '/tools/unit/',
      desc: '길이, 무게, 온도, 면적, 부피, 시간, 데이터 용량을 변환합니다.', descKey: 'tool_unit_desc',
      short: '길이·무게·온도', keywords: '변환 인치 킬로' },

    { id: 'textconv', cat: 'tools', name: '텍스트 변환 도구', key: 'tool_textconv_title', href: '/tools/textconv/',
      desc: '텍스트를 다양한 방식으로 변환하고 처리합니다.', descKey: 'tool_textconv_desc',
      short: '대소문자·정리', keywords: '텍스트 정리' },

    { id: 'shutter-count', cat: 'tools', name: '카메라 셔터카운트 확인기', key: 'tool_shutter_count_title', href: '/tools/shutter-count/',
      desc: '사진의 EXIF 정보를 브라우저에서 분석하여 카메라 정보와 확인 가능한 셔터카운트를 표시합니다.', descKey: 'tool_shutter_count_desc',
      short: 'EXIF 분석', keywords: '카메라 사진' },

    { id: 'reaction', cat: 'games', name: '반응속도 테스트', key: 'game_reaction_title', href: '/games/reaction/',
      desc: '화면이 바뀌는 순간을 눌러 내 반응 시간을 측정합니다.', descKey: 'game_reaction_desc',
      short: '반응속도', keywords: '테스트 기록' },

    { id: 'sudoku', cat: 'games', name: '스도쿠', key: 'game_sudoku_title', href: '/games/sudoku/',
      desc: '난이도를 선택하고 새로운 9x9 숫자 퍼즐을 완성하세요.', descKey: 'game_sudoku_desc',
      short: '숫자 퍼즐', keywords: '숫자 퍼즐' },

    { id: 'typing', cat: 'games', name: '타자 속도 테스트', key: 'game_typing_title', href: '/games/typing/',
      desc: '문장을 입력하며 정확도와 분당 타자 속도를 확인합니다.', descKey: 'game_typing_desc',
      short: '타수·정확도', keywords: '타자 속도' },

    { id: 'block-puzzle', cat: 'games', name: '블록 퍼즐', key: 'game_block_title', href: '/games/block-puzzle/',
      desc: '블록을 쌓고 줄을 완성해 최고 점수에 도전하세요.', descKey: 'game_block_desc',
      short: '점수 도전', keywords: '블록 퍼즐' },

    { id: 'saju', cat: 'saju', name: '사주·운세', key: 'saju_title', href: '/saju/',
      desc: '생년월일을 바탕으로 사주 정보를 확인합니다.', descKey: 'saju_copy',
      short: '생년월일 기반', keywords: '사주팔자 운세 궁합' }
  ];

  var GUIDES = [
    { title: '원리금균등상환과 원금균등상환, 무엇이 유리한가', href: '/guide/posts/example/', tool: '대출 이자 계산기' },
    { title: '연봉 실수령액에서 빠지는 공제 항목 정리', href: '/guide/posts/salary-net-pay/', tool: '연봉 계산기' },
    { title: '만 나이 통일, 내 나이는 어떻게 계산되나', href: '/guide/posts/legal-age/', tool: '나이 계산기' },
    { title: '적금 이자가 생각보다 적은 이유', href: '/guide/posts/savings-interest/', tool: '예금/적금 이자 계산기' }
  ];

  return { CATEGORIES: CATEGORIES, TOOLS: TOOLS, GUIDES: GUIDES };
})();
