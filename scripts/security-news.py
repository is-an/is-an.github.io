"""Daily CISA KEV bulletin and five cards. Python standard library only."""
import argparse
from datetime import date, datetime, timedelta, timezone
from html import escape
import json
from pathlib import Path
import re
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
FEED = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json'
CATALOG = 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog'
ORIGIN = 'https://is-an.github.io'
STATE = ROOT / 'assets/data/security-news.json'
START, END = '<!-- security-news:start -->', '<!-- security-news:end -->'


def read_json(path, fallback):
    return json.loads(path.read_text(encoding='utf-8')) if path.exists() else fallback


def select_entry(feed, posts, today):
    seen = {p['cve'] for p in posts}
    candidates = []
    for row in feed.get('vulnerabilities', []):
        cve = row.get('cveID', '')
        if not re.fullmatch(r'CVE-\d{4}-\d{4,}', cve) or cve in seen:
            continue
        try:
            added = date.fromisoformat(row.get('dateAdded', ''))
        except ValueError:
            continue
        if not today - timedelta(days=14) <= added <= today:
            continue
        for key in ('vendorProject', 'product', 'vulnerabilityName', 'shortDescription', 'requiredAction'):
            if not isinstance(row.get(key), str) or not 1 <= len(row[key]) <= 6000:
                raise ValueError('Invalid CISA field: ' + key)
        candidates.append(row)
    return max(candidates, key=lambda r: (r['dateAdded'], r['cveID']), default=None)


def card_html(title, body, cve, day, number):
    # Fixed-size export artwork, separate from the responsive website UI.
    return f'''<!doctype html><html lang="ko"><meta charset="utf-8">
<title>{escape(cve)} · {number}/5</title><style>
*{{box-sizing:border-box}}html,body{{margin:0;width:1080px;height:1350px;background:#10274c;color:white}}
body{{font-family:"Malgun Gothic","Noto Sans CJK KR",sans-serif;padding:80px;display:flex;flex-direction:column}}
header{{display:flex;justify-content:space-between;font-size:25px;color:#c6d4e8;border-bottom:2px solid #8198b8;padding-bottom:28px}}
main{{flex:1;display:flex;flex-direction:column;justify-content:center;gap:40px;min-height:0}}
h1{{font-size:72px;line-height:1.23;letter-spacing:-3px;margin:0;word-break:keep-all;overflow-wrap:anywhere}}
p{{font-size:38px;line-height:1.65;margin:0;white-space:pre-line;overflow-wrap:anywhere}}
.cve{{font-size:29px;color:#c6d4e8;letter-spacing:0}}footer{{font-size:24px;border-top:2px solid #8198b8;padding-top:25px;display:flex;justify-content:space-between}}
</style><body><header><span>tech.alert.kr</span><span>{day}</span></header>
<main><div class="cve">{escape(cve)}</div><h1>{escape(title)}</h1><p>{escape(body)}</p></main>
<footer><span>출처 CISA KEV · is-an.github.io</span><span>{number} / 5</span></footer></body></html>'''


def generate(row, day, root=ROOT):
    cve = row['cveID']
    slug = day + '-' + cve.lower()
    folder = root / 'guide/posts' / slug
    folder.mkdir(parents=True, exist_ok=True)
    card_folder = root / '.tmp/security-cards' / slug
    card_folder.mkdir(parents=True, exist_ok=True)
    title = f"{row['vendorProject']} {row['product']} — {cve}"
    cards = [
        ('실제 악용이 확인된\n보안 취약점', f"{row['vendorProject']}\n{row['product']}"),
        ('어떤 문제인가요?', row['shortDescription']),
        ('무엇을 확인해야 하나요?', f"대상 제품: {row['product']}\n공급사: {row['vendorProject']}\n영향 버전과 패치는 공급사 공지에서 확인하세요."),
        ('어떻게 대응하나요?', row['requiredAction']),
        ('지금 확인할 세 가지', '제품 사용 여부 확인\n공급사 보안 공지와 패치 확인\n업데이트 적용 후 정상 동작 확인\n\n상세 내용과 원문: is-an.github.io/guide/#security'),
    ]
    for i, (heading, body) in enumerate(cards, 1):
        (card_folder / f'card-{i}.html').write_text(card_html(heading, body, cve, day, i), encoding='utf-8')
    template = (root / 'guide/posts/example/index.html').read_text(encoding='utf-8')
    theme = re.search(r'<script>.*?</script>', template, re.S).group()
    sections = ''.join(f'<h2 class="v2-card-title">{escape(h)}</h2><p class="v2-card-copy">{escape(b)}</p>' for h, b in cards[1:4])
    images = ''.join(f'<figure><img src="card-{i}.jpg" alt="{escape(cards[i-1][0])}" width="1080" height="1350" style="max-width:100%;height:auto"></figure>' for i in range(1, 6))
    article = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
{theme}<title>{escape(title)} | is-an 보안</title><meta name="description" content="{escape(title)}: CISA 실제 악용 확인 취약점과 대응 안내.">
<meta name="robots" content="index,follow"><link rel="canonical" href="{ORIGIN}/guide/posts/{slug}/">
<link rel="stylesheet" href="../../../assets/css/style.css"><link rel="stylesheet" href="../../../assets/css/v2.css"></head>
<body class="v2-page"><div id="site-header"></div><main><div class="v2-simple-layout"><article class="v2-card">
<h1 class="v2-page-title">{escape(title)}</h1><p class="blog-meta"><time datetime="{day}">{day}</time> · CISA KEV</p>
<p class="v2-card-copy">CISA가 실제 공격에 악용된 것으로 확인한 취약점입니다. KEV 등록일은 {escape(row['dateAdded'])}입니다. 이 글의 게시일과 취약점 최초 공개일은 다를 수 있습니다.</p>
{sections}<p class="v2-card-copy">기술 설명과 조치 문구는 CISA 영어 원문을 인용합니다. 정확한 영향 버전과 패치 정보는 공급사 공지를 확인하세요.</p>
<p><a href="{CATALOG}" target="_blank" rel="noopener noreferrer">CISA KEV 원문</a> · <a href="https://nvd.nist.gov/vuln/detail/{cve}" target="_blank" rel="noopener noreferrer">NVD 상세 정보</a></p>
<p><a href="../../#security">보안 글 목록</a></p>{images}</article></div></main><div id="ads-slot" class="ads-slot"></div><div id="site-footer"></div>
<script src="../../../assets/js/i18n.js"></script><script src="../../../assets/js/common.js"></script><script src="../../../assets/js/header-nav.js"></script></body></html>'''
    (folder / 'index.html').write_text(article, encoding='utf-8')
    post = {'cve': cve, 'date': day, 'slug': slug, 'title': title, 'source': CATALOG, 'sourceRecord': row}
    (folder / 'caption.txt').write_text(f"실제 악용 확인 취약점: {title}\n\n대상 제품 사용 여부와 공급사 패치를 확인하세요.\nCISA KEV 등록: {row['dateAdded']}\n출처: {CATALOG}\n상세: {ORIGIN}/guide/posts/{slug}/\n\n#보안뉴스 #취약점 #사이버보안 #TechAlert", encoding='utf-8')
    return post


def update_index(posts, root=ROOT):
    index = root / 'guide/index.html'
    text = index.read_text(encoding='utf-8')
    links = '\n'.join(f'<article class="v2-editorial-post"><time datetime="{p["date"]}">{p["date"]}</time><h3 class="v2-card-title"><a href="./posts/{p["slug"]}/">{escape(p["title"])}</a></h3></article>' for p in reversed(posts[-30:]))
    block = START + '\n' + links + '\n' + END
    if START in text:
        text = re.sub(re.escape(START) + '.*?' + re.escape(END), lambda _: block, text, flags=re.S)
    else:
        pattern = r'(<section\b[^>]*\bid="security"[^>]*>.*?)(<p class="v2-tech-empty"[^>]*>.*?</p>)'
        text, count = re.subn(pattern, lambda m: m[1] + block, text, count=1, flags=re.S)
        if count != 1:
            raise ValueError('Security section not found; refusing to overwrite index')
    index.write_text(text, encoding='utf-8')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--fixture', type=Path)
    parser.add_argument('--date', default=datetime.now(timezone(timedelta(hours=9))).date().isoformat())
    args = parser.parse_args()
    today = date.fromisoformat(args.date)
    posts = read_json(STATE, [])
    # A rerun uses the same day's post, including when image export previously failed.
    existing = next((p for p in posts if p['date'] == args.date), None)
    if existing:
        generate(existing['sourceRecord'], args.date)
        print(existing['slug'])
        return
    if args.fixture:
        feed = read_json(args.fixture, {})
    else:
        with urlopen(Request(FEED, headers={'User-Agent': 'tech.alert.kr security bulletin'}), timeout=45) as response:
            raw = response.read(15_000_001)
        if len(raw) > 15_000_000:
            raise ValueError('Feed exceeds size limit')
        feed = json.loads(raw)
    row = select_entry(feed, posts, today)
    if row is None:
        print('No new KEV in the last 14 days; no post generated.')
        return
    post = generate(row, args.date)
    posts.append(post)
    update_index(posts)
    STATE.parent.mkdir(parents=True, exist_ok=True)
    STATE.write_text(json.dumps(posts, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(post['slug'])


if __name__ == '__main__':
    main()
