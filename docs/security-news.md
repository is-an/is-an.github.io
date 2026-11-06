# 보안 카드뉴스 자동화

매일 한국 시간 오전 9시 GitHub Actions가 CISA KEV에서 최근 14일 내 추가된 미게시 CVE 하나를 골라 보안 글과 1080×1350 JPEG 카드 5장을 만듭니다. 새 항목이 없으면 건너뜁니다. 재실행은 같은 날짜의 글을 재사용합니다. KEV 등록일은 취약점 최초 공개일이 아닙니다.

기술 설명과 조치는 영어 원문을 유지합니다. 한국어 제목·확인 목록을 더하지만 AI 번역이나 검증되지 않은 영향 버전·패치 정보를 생성하지 않습니다. NVD 및 뉴스 RSS 수집은 이 첫 버전에 포함하지 않습니다.

## 활성화

1. 이 변경을 main에 적용합니다. 예약 실행은 기본 브랜치에서만 작동합니다.
2. Actions의 **Daily security bulletin → Run workflow**로 첫 실행을 확인합니다.
3. 글·카드 생성과 Pages 배포는 Meta 인증 없이 실행됩니다. 기존 Pages 배포와 같은 concurrency 그룹을 사용합니다.
4. 인스타그램·Threads는 아래 인증 정보가 없는 채널을 건너뜁니다. 토큰은 Settings → Secrets and variables → Actions → Secrets에 저장합니다. 소스·채팅·Variables에는 저장하지 않습니다.

| 이름 | 종류 | 값 |
|---|---|---|
| INSTAGRAM_ACCESS_TOKEN | Secret | 게시 권한이 있는 Instagram 토큰 |
| INSTAGRAM_USER_ID | Secret | 숫자로 된 Instagram 계정 ID |
| THREADS_ACCESS_TOKEN | Secret | Threads 게시 토큰 |
| THREADS_USER_ID | Secret | 숫자로 된 Threads 계정 ID |
| INSTAGRAM_LOGIN_MODE | Variable | Instagram 로그인은 `instagram`, Facebook/SUAT 구성은 `facebook` |
| META_GRAPH_VERSION | Variable | Meta 앱에 표시된 지원 Graph API 버전(예: `v25.0`) |

Instagram 로그인은 `instagram_business_basic`, `instagram_business_content_publish`, Facebook 로그인은 해당 구성의 `instagram_basic`, `instagram_content_publish` 및 Meta가 요구하는 자산 권한이 필요합니다. Threads는 `threads_basic`, `threads_content_publish`를 승인합니다. 본인 계정의 테스터/앱 역할과 실제 접근 수준은 Meta 대시보드에서 확인하세요. 이 코드는 OAuth 로그인 페이지를 제공하거나 토큰을 발급하지 않습니다. 토큰 만료 시 갱신해야 합니다.

Instagram은 카드 5장 캐러셀, Threads는 요약과 원문 링크를 게시합니다. 두 계정의 username이 `tech.alert.kr`인지 먼저 검증합니다. Threads 이름이 다르면 workflow의 THREADS_USERNAME을 바꿉니다.

## 실패와 재실행

네트워크/긴 원문으로 이미지가 잘리면 실패하고 사이트에 커밋하지 않습니다. 생성 뒤 정적 검사에 통과한 파일만 커밋합니다. GITHUB_TOKEN으로 커밋해도 다른 배포 workflow가 자동 실행되지 않으므로 이 workflow가 직접 Pages를 배포합니다.

게시 직전 `assets/data/security-social.json`에 pending 기록을 저장하고 성공 시 게시 ID를 기록합니다. 타임아웃·프로세스 중단으로 pending이 남으면 중복 게시 방지를 위해 자동 재게시하지 않습니다. 실제 계정과 컨테이너 상태를 확인하고 기록을 published로 보정하거나 미게시 확인 후 해당 키를 제거합니다. Actions의 마지막 단계가 영수증을 커밋하지 못했다면 재실행 전에 계정의 실제 게시 여부를 수동 확인하세요.

공개 저장소에는 게시 기록과 공개 이미지·캡션만 저장합니다. 액세스 토큰이나 API 응답 본문은 로그에 출력하지 않습니다. GitHub Actions의 예약 실행은 지연되거나 누락될 수 있고, 공개 저장소는 60일간 활동이 없으면 예약이 비활성화될 수 있습니다. 정상 실행은 매일 생성 커밋으로 활동을 남깁니다.

## 확인

```sh
python -m unittest discover -s scripts -p 'test_security_news.py'
python scripts/security-news.py
node scripts/render-security-cards.cjs guide/posts/생성된-slug
npm test
```

Python 3, Node 24, 설치된 Chrome이 필요합니다. npm 패키지는 추가하지 않습니다. CHROME_PATH로 Chrome 실행 파일을 지정할 수 있습니다. GitHub ubuntu-latest의 Chrome을 사용하며, 한글 폰트가 없으면 작업용 러너에 fonts-noto-cjk만 설치합니다. 글꼴이 없는 로컬 환경에서는 한글 폰트를 먼저 제공해야 합니다.

공식 문서: [CISA KEV](https://www.cisa.gov/known-exploited-vulnerabilities-catalog), [GitHub Actions 예약](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule), [Instagram](https://www.postman.com/meta/instagram/collection/6yqw8pt/instagram-api), [Threads](https://www.postman.com/meta/threads/collection/dht3nzz/threads-api).

