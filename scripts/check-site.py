"""Dependency-free static link, HTML, JS syntax, and tool-catalog checks."""

import json
import os
import re
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = "https://is-an.github.io"


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.references, self.scripts, self.ids, self.duplicate_ids = [], [], set(), []
        self.h1_count = 0
        self.has_title = self.redirect = False
        self.script = None
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get("id"):
            if attrs["id"] in self.ids:
                self.duplicate_ids.append(attrs["id"])
            self.ids.add(attrs["id"])
        if tag == "a" and attrs.get("name"):
            self.ids.add(attrs["name"])
        for name in ("href", "src", "poster"):
            if attrs.get(name):
                self.references.append((self.getpos()[0], attrs[name]))
        if tag == "h1":
            self.h1_count += 1
        if tag == "title":
            self.has_title = True
        if tag == "meta" and attrs.get("http-equiv", "").lower() == "refresh":
            self.redirect = True
        if tag == "script" and not attrs.get("src"):
            self.script = [self.getpos()[0], attrs.get("type", ""), ""]

    def handle_data(self, text):
        if self.script is not None:
            self.script[2] += text

    def handle_endtag(self, tag):
        if tag == "script" and self.script is not None:
            self.scripts.append(self.script)
            self.script = None


def local_target(source, reference):
    if reference.strip() in ("", "#"):
        return None
    url = urlsplit(urljoin(ORIGIN + "/" + source, reference.strip()))
    if url.scheme not in ("http", "https") or url.netloc != urlsplit(ORIGIN).netloc:
        return None
    path = unquote(url.path).lstrip("/")
    if not path or path.endswith("/"):
        path += "index.html"
    return path, unquote(url.fragment)


def self_check():
    assert local_target("cal/age/index.html", "../../tools/?q=x#list") == ("tools/index.html", "list")
    assert local_target("index.html", "https://example.com/") is None
    assert local_target("index.html", "mailto:hello@example.com") is None
    assert local_target("tools/index.html", "#entry") == ("tools/index.html", "entry")
    page = Page('<h1>Title</h1><a href="/tools/?a=1&amp;b=2" id="entry">link</a><b id="entry"></b>')
    assert page.h1_count == 1 and page.duplicate_ids == ["entry"]
    assert page.references == [(1, "/tools/?a=1&b=2")]


def check_site():
    files = {}
    for directory, folders, names in os.walk(ROOT):
        folders[:] = [name for name in folders if not name.startswith(".") and name not in ("node_modules", "test", "__pycache__")]
        for name in names:
            path = Path(directory, name)
            files[path.relative_to(ROOT).as_posix()] = path
    pages = {name: Page(path.read_text(encoding="utf-8-sig")) for name, path in files.items() if name.endswith(".html")}
    errors, references = [], []
    javascript_count = 0

    def check_javascript(name, source):
        nonlocal javascript_count
        result = subprocess.run(["node", "--check"], input=source, capture_output=True, text=True, encoding="utf-8")
        javascript_count += 1
        if result.returncode:
            errors.append(f"{name}: {result.stderr.strip()}")

    for name, page in pages.items():
        references.extend((name, line, url) for line, url in page.references)
        errors.extend(f"{name}: duplicate id: {element_id}" for element_id in page.duplicate_ids)
        if not name.startswith("components/") and not page.redirect:
            if not page.has_title or page.h1_count != 1:
                errors.append(f"{name}: expected title and one h1 (found {page.h1_count} h1)")
        for line, kind, source in page.scripts:
            if kind == "application/ld+json":
                try:
                    json.loads(source)
                except ValueError as error:
                    errors.append(f"{name}:{line}: invalid JSON-LD: {error}")
            elif kind in ("", "text/javascript", "application/javascript"):
                check_javascript(f"{name}:{line}", source)
    for name, path in files.items():
        if name.endswith(".js"):
            check_javascript(name, path.read_text(encoding="utf-8-sig"))
        elif name.endswith(".css"):
            source = re.sub(r"/\*.*?\*/", "", path.read_text(encoding="utf-8-sig"), flags=re.S)
            references.extend((name, 0, match.group(2)) for match in re.finditer(r"url\(\s*(['\"]?)(.*?)\1\s*\)", source))

    result = subprocess.run(["node", "scripts/check-navigation.js"], cwd=ROOT,
                            capture_output=True, text=True, encoding="utf-8")
    if result.returncode:
        errors.append("Tool catalog/i18n: " + result.stderr.strip())
    else:
        catalog = json.loads(result.stdout)
        for group in catalog.values():
            references.extend(("assets/js/tools-data.js", 0, entry["href"]) for entry in group)
        print(f"Catalog: {len(catalog['TOOLS'])} tools; ko/en/zh/ja verified.")

    checked = 0
    for source, line, reference in references:
        try:
            target = local_target(source, reference)
        except ValueError:
            errors.append(f"{source}:{line}: invalid URL")
            continue
        if target is None:
            continue
        checked += 1
        name, fragment = target
        if name not in files:
            errors.append(f"{source}:{line}: missing file (exact case): {reference}")
        elif fragment and name in pages and fragment not in pages[name].ids:
            errors.append(f"{source}:{line}: missing anchor: {reference}")
    for error in errors:
        print(error)
    print(f"Checked {len(pages)} HTML files, {checked} local references, {javascript_count} JS sources; {len(errors)} errors.")
    print("Not checked: browser layout/runtime, external URL availability, dynamically constructed URLs other than the catalog.")
    return bool(errors)


if __name__ == "__main__":
    self_check()
    sys.exit(check_site())
