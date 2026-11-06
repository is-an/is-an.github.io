"""Publish an already-deployed bulletin. Never log credentials or provider bodies."""
import json
import os
from pathlib import Path
import re
import sys
import time
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
RECEIPTS = ROOT / 'assets/data/security-social.json'


def api(base, token, endpoint, fields=None, post=False):
    payload = urlencode(fields or {}).encode()
    url = base + '/' + endpoint
    if not post and payload:
        url += '?' + payload.decode()
    request = Request(url, data=payload if post else None, headers={'Authorization': 'Bearer ' + token}, method='POST' if post else 'GET')
    try:
        with urlopen(request, timeout=45) as response:
            result = json.load(response)
    except HTTPError as error:
        raise RuntimeError(f'Meta API HTTP {error.code}; check permissions/token in Meta dashboard') from None
    if 'error' in result:
        raise RuntimeError('Meta API rejected request; check Meta dashboard')
    return result


def ready(base, token, container, status_field):
    for attempt in range(6):
        status = api(base, token, container, {'fields': status_field}).get(status_field)
        if status in ('FINISHED', 'PUBLISHED'):
            return
        if status in ('ERROR', 'EXPIRED'):
            raise RuntimeError('Media processing failed')
        if attempt < 5:
            time.sleep(60)
    raise RuntimeError('Media processing timed out')


def publish(channel, post, receipts):
    prefix = 'INSTAGRAM' if channel == 'instagram' else 'THREADS'
    token = os.environ.get(prefix + '_ACCESS_TOKEN', '')
    user = os.environ.get(prefix + '_USER_ID', '')
    if not token or not user:
        print(prefix + ': skipped (account ID/token not configured).')
        return
    key = channel + ':' + post['slug']
    if key in receipts:
        if receipts[key]['status'] == 'published':
            print(prefix + ': already published.')
            return
        raise RuntimeError(prefix + ': previous publish outcome uncertain; reconcile receipt before retry')
    if not user.isdigit():
        raise ValueError('Account ID must be numeric')
    if channel == 'instagram':
        version = os.environ.get('META_GRAPH_VERSION', '')
        mode = os.environ.get('INSTAGRAM_LOGIN_MODE', 'instagram')
        if not re.fullmatch(r'v\d+\.\d+', version) or mode not in ('instagram', 'facebook'):
            raise ValueError('Set META_GRAPH_VERSION and INSTAGRAM_LOGIN_MODE to match the Meta app')
        host = 'graph.instagram.com' if mode == 'instagram' else 'graph.facebook.com'
        base = f'https://{host}/{version}'
    else:
        base = 'https://graph.threads.net/v1.0'
    # Verify the token targets the intended account before any publishing call.
    identity = api(base, token, user, {'fields': 'id,username'})
    expected = os.environ.get(prefix + '_USERNAME', 'tech.alert.kr').lstrip('@')
    if identity.get('username', '').lower() != expected.lower():
        raise ValueError(prefix + ': connected account does not match expected username')
    folder = ROOT / 'guide/posts' / post['slug']
    url = 'https://is-an.github.io/guide/posts/' + post['slug'] + '/'
    if channel == 'instagram':
        children = []
        for i in range(1, 6):
            image = url + f'card-{i}.jpg'
            # Do not send token-bearing requests to an image host.
            with urlopen(Request(image), timeout=30) as response:
                if response.read() != (folder / f'card-{i}.jpg').read_bytes():
                    raise RuntimeError('Public JPEG does not match this run; wait for Pages deployment')
            child = api(base, token, user + '/media', {'image_url': image, 'is_carousel_item': 'true'}, True)['id']
            ready(base, token, child, 'status_code')
            children.append(child)
        container = api(base, token, user + '/media', {'media_type': 'CAROUSEL', 'children': ','.join(children), 'caption': (folder / 'caption.txt').read_text(encoding='utf-8')[:2200]}, True)['id']
        ready(base, token, container, 'status_code')
        endpoint = user + '/media_publish'
    else:
        text = f"실제 악용 확인 취약점\n{post['title']}\n\n대상 제품 사용 여부와 공급사 보안 업데이트를 확인하세요.\n출처: CISA KEV\n{url}"
        container = api(base, token, user + '/threads', {'media_type': 'TEXT', 'text': text[:500]}, True)['id']
        ready(base, token, container, 'status')
        endpoint = user + '/threads_publish'
    # Persist BEFORE publishing: on a timeout, never blindly publish a duplicate.
    receipts[key] = {'status': 'pending', 'container': container}
    RECEIPTS.write_text(json.dumps(receipts, indent=2) + '\n', encoding='utf-8')
    result = api(base, token, endpoint, {'creation_id': container}, True)
    receipts[key] = {'status': 'published', 'id': result['id']}
    RECEIPTS.write_text(json.dumps(receipts, indent=2) + '\n', encoding='utf-8')
    print(prefix + ': published successfully.')


def main():
    posts = json.loads((ROOT / 'assets/data/security-news.json').read_text(encoding='utf-8'))
    receipts = json.loads(RECEIPTS.read_text(encoding='utf-8')) if RECEIPTS.exists() else {}
    failures = []
    for channel in ('instagram', 'threads'):
        try:
            publish(channel, posts[-1], receipts)
        except Exception as error:
            # Provider/network exceptions can embed sensitive URLs; output only our safe errors.
            print(str(error) if isinstance(error, (ValueError, RuntimeError)) else channel + ': request failed; check connection and credentials')
            failures.append(channel)
    return bool(failures)


if __name__ == '__main__':
    sys.exit(main())
