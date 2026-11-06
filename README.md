# is-an.github.io

HTML·CSS·Vanilla JavaScript로 만든 무료 유틸리티 사이트입니다.
프레임워크·외부 패키지·빌드 과정 없이 GitHub Pages로 제공합니다.

## 탐색 구조

- `tech` → `/guide/`: 기술뉴스·기술공유·장애노트·보안·AI·자동화
- `tools` → `/tools/`: 계산기·변환기·게임·로또·사주·투자 도구 통합 목록
- `etc` → `/faq/`: FAQ와 사이트 정보

tech의 다섯 분류는 `/guide/#news`, `#sharing`, `#incidents`, `#security`, `#ai`로 연결됩니다.
아직 새 글이 없는 분류는 빈 상태를 표시하며, 기존 가이드 글과 주소는 그대로 유지합니다.
760px 이하에서는 상위 메뉴와 tech 하위 분류를 햄버거 팝업으로 표시합니다.
검색·언어·메뉴 팝업은 한 번에 하나만 열립니다.

기존 `/cal/`, `/games/`, `/lotto/`, `/saju/`, `/stock/` 및 개별 도구 URL을 유지합니다.
도구 목록 원본은 `assets/js/tools-data.js`의 `window.SITE_TOOLS`입니다.

## 로컬 실행과 검사

Python 3와 Node.js가 필요합니다. npm 패키지 설치는 필요 없습니다.

```bash
npm start
npm test
```

`http://localhost:8000/`에서 확인합니다. 공용 컴포넌트가 fetch로 로드되므로
`file://`로 열지 마세요. 로컬 전용 서버는 아래 명령을 사용합니다.

```bash
python -m http.server 8000 --bind 127.0.0.1
```

PowerShell 실행 정책으로 차단되면 `npm.cmd start`, `npm.cmd test`를 사용합니다.

`npm test` 검사 범위:

- HTML·CSS 및 도구 목록의 내부 경로·앵커·대소문자 확인
- 중복 ID, 페이지 제목/H1, JSON-LD, 외부/인라인 JS 문법 검사
- 도구·tech·메뉴의 ko/en/zh/ja 번역 확인
- 탐색 활성 상태, 하위 경로, 검색, 저장소 차단·손상, 운세 캐시 회귀 검사
- 모바일 메뉴 열기·닫기, Esc, 바깥 클릭·포커스, 팝업 조정과 화면 폭 전환

브라우저 화면·Console·Network 및 외부 링크 가용성은 이 명령이 검증하지 않습니다.
UI 변경은 320·375·768·1024·1440px와 라이트/다크·4개 언어를 실제 브라우저에서 확인합니다.
`npm run build`는 placeholder이며 실제 빌드를 수행하지 않습니다.

## 파일 역할

- `components/`: 공용 헤더·푸터·광고
- `assets/css/v2.css`: 공용 v2 스타일과 반응형 헤더
- `assets/css/tool-directory.css`: 홈·tools의 공용 목록 레이아웃
- `assets/css/tech.css`: tech 분류 화면
- `assets/js/common.js`: 컴포넌트 로더·경로·테마·공용 기능
- `assets/js/header-nav.js`: 모바일 메뉴·도구 검색 팝업
- `assets/js/tool-directory.js`: 홈·tools의 검색·목록·즐겨찾기·최근 사용
- `assets/js/i18n.js`, `assets/i18n/`: 번역과 언어 전환
- `scripts/check-site.py`, `scripts/check-navigation.js`: 설치 없는 정적·회귀 검사

## 배포와 작업 지침

`main`에 push하면 `.github/workflows/static.yml`을 통해 GitHub Pages에 배포됩니다.
`.nojekyll`로 Jekyll을 비활성화하며 `config.yml`을 사용하지 않습니다.
배포는 요청받았을 때만 진행합니다. 개발·보안·개인정보·검수 기준은 [AGENTS.md](./AGENTS.md)를 따릅니다.
