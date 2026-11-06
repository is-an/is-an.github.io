import importlib.util
from datetime import date
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('security_news', Path(__file__).with_name('security-news.py'))
news = importlib.util.module_from_spec(spec)
spec.loader.exec_module(news)
social_spec = importlib.util.spec_from_file_location('social', Path(__file__).with_name('publish-security-social.py'))
social = importlib.util.module_from_spec(social_spec)
social_spec.loader.exec_module(social)


class BulletinTests(unittest.TestCase):
    def setUp(self):
        self.row = {'cveID': 'CVE-2026-12345', 'dateAdded': '2026-11-06', 'vendorProject': 'Example <vendor>', 'product': 'Demo Product', 'vulnerabilityName': 'Demo vulnerability', 'shortDescription': '<script>alert(1)</script> is plain source text.', 'requiredAction': 'Apply vendor updates.'}

    def test_selection_deduplicates_and_ignores_old_future_or_invalid(self):
        today = date(2026, 11, 6)
        feed = {'vulnerabilities': [self.row]}
        self.assertEqual(news.select_entry(feed, [], today), self.row)
        self.assertIsNone(news.select_entry(feed, [{'cve': self.row['cveID']}], today))
        for changes in ({'dateAdded': '2025-01-01'}, {'dateAdded': '2027-01-01'}, {'cveID': '../escape'}, {'dateAdded': 'broken'}):
            self.assertIsNone(news.select_entry({'vulnerabilities': [dict(self.row, **changes)]}, [], today))

    def test_generate_escapes_source_and_updates_only_security(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            template = root / 'guide/posts/example/index.html'
            template.parent.mkdir(parents=True)
            template.write_text('<script>/* theme */</script>', encoding='utf-8')
            index = root / 'guide/index.html'
            index.write_text('<section id="news">keep</section><section id="security"><p class="v2-tech-empty">empty</p></section>', encoding='utf-8')
            post = news.generate(self.row, '2026-11-06', root)
            news.update_index([post], root)
            once = index.read_text(encoding='utf-8')
            news.update_index([post], root)
            self.assertEqual(index.read_text(encoding='utf-8'), once)
            self.assertIn('<section id="news">keep</section>', once)
            self.assertIn('Example &lt;vendor&gt;', once)
            folder = template.parent.parent / post['slug']
            cards = root / '.tmp/security-cards' / post['slug']
            self.assertEqual(len(list(cards.glob('card-*.html'))), 5)
            self.assertNotIn('<script>alert(1)', (cards / 'card-2.html').read_text(encoding='utf-8'))
            self.assertIn('&lt;script&gt;', (folder / 'index.html').read_text(encoding='utf-8'))


class SocialTests(unittest.TestCase):
    def test_missing_credentials_do_not_call_meta(self):
        with patch.dict('os.environ', {}, clear=True), patch.object(social, 'api') as api:
            social.publish('instagram', {'slug': 'demo'}, {})
            api.assert_not_called()

    def test_pending_receipt_prevents_second_publish(self):
        with patch.dict('os.environ', {'THREADS_ACCESS_TOKEN': 'synthetic', 'THREADS_USER_ID': '123'}, clear=True), patch.object(social, 'api') as api:
            with self.assertRaisesRegex(RuntimeError, 'uncertain'):
                social.publish('threads', {'slug': 'demo'}, {'threads:demo': {'status': 'pending'}})
            api.assert_not_called()

    def test_wrong_account_stops_before_creation(self):
        with patch.dict('os.environ', {'THREADS_ACCESS_TOKEN': 'synthetic', 'THREADS_USER_ID': '123'}, clear=True), patch.object(social, 'api', return_value={'username': 'wrong'}) as api:
            with self.assertRaisesRegex(ValueError, 'does not match'):
                social.publish('threads', {'slug': 'demo'}, {})
            self.assertEqual(api.call_count, 1)

    def test_publish_saves_pending_before_request_and_success_after(self):
        with tempfile.TemporaryDirectory() as directory, patch.dict('os.environ', {'THREADS_ACCESS_TOKEN': 'synthetic', 'THREADS_USER_ID': '123'}, clear=True), patch.object(social, 'RECEIPTS', Path(directory) / 'receipt.json'):
            def fake_api(base, token, endpoint, fields=None, post=False):
                if endpoint == '123':
                    return {'username': 'tech.alert.kr'}
                if endpoint == '123/threads':
                    return {'id': '456'}
                if endpoint == '456':
                    return {'status': 'FINISHED'}
                self.assertEqual(json.loads(social.RECEIPTS.read_text())['threads:demo']['status'], 'pending')
                return {'id': '789'}
            with patch.object(social, 'api', side_effect=fake_api):
                social.publish('threads', {'slug': 'demo', 'title': 'Synthetic example'}, {})
            self.assertEqual(json.loads(social.RECEIPTS.read_text())['threads:demo'], {'status': 'published', 'id': '789'})


if __name__ == '__main__':
    unittest.main()
