# AGENTS.md

## Project

`is-an.github.io` is a static, dependency-free Korean utility website.

Purpose: free utilities, calculators, generators, games, lotto, saju, SEO traffic, and AdSense.

### Stack

* HTML
* CSS
* Vanilla JavaScript
* GitHub Pages

No frameworks, TypeScript, npm packages, bundlers, modules, or build steps unless explicitly requested.

---

## Commands

```bash
npm start
```

Runs:

```bash
python -m http.server 8000
```

Use HTTP, not `file://`. Shared components use `fetch()`.

`npm run build` is a placeholder. `npm test` runs `python scripts/check-site.py`:
static HTML/CSS/catalog links, anchors, duplicate IDs, JSON-LD, JS syntax,
navigation/storage regression checks, and tool translations (ko/en/zh/ja).

The build placeholder does not verify anything. Passing static checks does not
prove browser rendering or runtime behavior.
On Windows PowerShell, use `npm.cmd start` if execution policy blocks `npm.ps1`;
do not weaken the machine's execution policy.

Deployment:

```text
push main
→ .github/workflows/static.yml
→ GitHub Pages
```

`.nojekyll` disables Jekyll. Do not rely on Jekyll or `config.yml`.

---

# Architecture

## Shared components

Pages use:

```html
<div id="site-header"></div>
<div id="ads-slot"></div>
<div id="site-footer"></div>
```

`assets/js/common.js` loads:

```text
components/header.html
components/ads.html
components/footer.html
```

Component paths are derived from the `common.js` script path.

Do not hardcode component paths unnecessarily.

## Header

Header navigation uses `data-route`.

Routes:

```text
assets/js/common.js
→ routeMap
```

Adding a top-level section requires updating `routeMap`.

The primary navigation is `tech` (`/guide/`), `tools` (`/tools/`), and `etc`
(`/faq/`). All existing calculators, converters, games, lotto, saju, and stock
tools belong under the tools navigation section, without moving their URLs.
On narrow screens, the three navigation links remain visible on a second row.

Header:

```css
#site-header { position: sticky; }
```

---

# CSS

## Load order

```text
style.css
→ v2.css
→ page CSS
```

## File responsibility

```text
assets/css/style.css
→ legacy/global styles

assets/css/v2.css
→ v2 design system + shared v2 components

tool-directory.css
→ shared home/tools directory layout

saju.css
→ saju only

game.css
→ game only
```

### Legacy

`style.css` contains legacy tokens, base, layout, components, and page styles.

Legacy tokens include:

```text
--text
--bg
--accent
...
```

### v2

`v2.css` contains:

* `--v2-*` tokens
* `body.v2-page`
* v2 header/footer/ads layout
* `.v2-*` components
* search popup
* responsive layout

v2 theme tokens are defined under:

```css
:root
[data-theme="dark"]
```

### Page CSS

Page-specific CSS must be scoped:

```text
body.home-v2
body.v2-page
```

Do not place page-specific styles in `v2.css`.

`body.v2-page` identifies the shared design system, not one specific page.
For page-only rules, also use a page class (such as `.home-v2`) or a
feature-specific component class (such as `.v2-saju-hero`).

## CSS decision rule

```text
Global/shared v2
→ v2.css

Legacy/shared
→ style.css

One page only
→ page CSS
```

New/redesigned pages use v2:

```text
--v2-*
.v2-*
```

Avoid legacy patterns such as:

```text
.tool-card
.primary-btn
```

unless maintaining an existing legacy page.

## CSS rules

* Reuse existing variables/components.
* Do not duplicate tokens or components.
* Do not use `!important`.
* Prefer classes over IDs.
* Avoid unnecessarily deep selectors.
* Keep page styles scoped.
* Do not create independent theme systems.
* Do not rewrite unrelated CSS.
* Do not change existing class names unnecessarily.
* Remove CSS only after confirming it is unused.
* Preserve responsive behavior.

### New CSS component

Before adding CSS:

```text
1. Search existing CSS.
2. Check v2.css.
3. Reuse an existing component if possible.
4. Create a new class only when responsibility is different.
```

### Layout

Legacy `.container` may use:

```css
width: min(920px, calc(100% - 32px));
```

v2 uses:

```text
--v2-max
1160px
```

Do not use legacy `.container` for new v2 layouts.

Prevent horizontal overflow.

Test widths:

```text
320, 375, 768, 1024, 1440 CSS px
```

Check intermediate widths when wrapping or breakpoints could cause overflow.

---

# JavaScript

## Script order

```text
i18n.js
→ common.js
→ header-nav.js
→ [tools-data.js]
→ page script
```

`header-nav.js` is required for pages using the shared v2 header.

## File responsibility

```text
assets/js/i18n.js
→ language/translation

assets/js/common.js
→ shared site utilities/components

assets/js/header-nav.js
→ header/menu/search

assets/js/tools-data.js
→ tool data

assets/js/share.js
→ sharing

page JS
→ page-specific logic
```

## JavaScript decision rule

```text
Used by multiple pages
→ existing shared JS/common.js

Header/menu/search
→ header-nav.js

Data
→ tools-data.js

Sharing
→ share.js

One page only
→ page JS
```

Do not put unrelated page functionality into `common.js`.

Before creating a helper:

```text
1. Search existing JS.
2. Reuse existing functionality.
3. Create only when necessary.
```

Existing shared helpers include:

```javascript
formatNumber
formatDecimal
copyToClipboard
localDateOnly
formatDate
dateToInputValue
parseInputDate
switchCalcTab
readStoredNumber
writeStoredNumber
```

Avoid name collisions.

JavaScript currently uses global scope. Do not introduce ES modules unless explicitly requested.

### JS rules

* One file = clear primary responsibility.
* Keep data, UI, and calculation logic reasonably separated.
* Reuse existing functions.
* Avoid duplicate functions.
* Avoid global name collisions.
* Do not modify shared JS for page-only features.
* Do not rename stable public/global functions unnecessarily.
* Before renaming, search all references.
* Remove JS only after confirming it is unused.
* Preserve script order.

---

# Header Popups

Managed by:

```text
assets/js/header-nav.js
→ search dialog

assets/js/i18n.js
→ language dropdown
```

Features:

```text
search popup
header interactions
```

Popup types:

```text
lang
search
```

These are the exact `v2:popup` event `detail` values.

Popup coordination:

```text
document
→ v2:popup
```

Only one header popup may be open at a time.

New header popups must use the existing `v2:popup` mechanism.

Do not create another popup state system.

Search may lazy-load `tools-data.js`.

`assets/js/tool-directory.js` renders the home and tools directories from
`SITE_TOOLS`. `v2:language` is dispatched after initial language loading or
language selection so dynamic directory labels/search can refresh.

---

# i18n

Files:

```text
assets/js/i18n.js
→ language switching, Korean strings, subpage catalogs

assets/i18n/en.js
assets/i18n/zh.js
assets/i18n/ja.js
→ lazy-loaded language data
```

Languages:

```text
ko
en
zh
ja
```

Priority:

```text
localStorage("language")
→ browser language
→ ko
```

Translation data flows through:

```javascript
legacyTranslations.ko // copied into window.I18N_DATA.ko
window.I18N_DATA[lang] // en/zh/ja loaded by ensureLanguage()
buildTranslationCatalog(lang)
```

Do not add `legacyTranslations.en/zh/ja`; these objects do not exist.
Inspect the existing key and subpage catalog before choosing its update location.
The language files carry generated-file warnings referencing
`scratchpad/split-i18n.js`, but that generator is not present in this checkout.
Do not invent a regeneration command. If the generator is unavailable, make
the required minimal language-data edits consistently and report that limitation.

Supported forms:

```html
data-i18n="nav.home"
data-i18n="nav_home"
```

Supported attributes:

```text
data-i18n
data-i18n-placeholder
data-i18n-aria-label
data-i18n-title
data-i18n-content
```

New user-visible strings require all four languages.

Do not refactor the existing i18n architecture unless explicitly requested.

## Subpages

`/cal/*` and `/tools/*` use:

```text
subpageTranslations
applySubpageLanguage()
getSubpageName()
```

New `/cal/` or `/tools/` pages may require:

```text
subpageTranslations
buildTranslationCatalog()
```

Existing translation logic may depend on:

```text
.primary-btn
.secondary-btn
.text-button
```

Do not rename/remove these without checking i18n dependencies.

---

# Theme

Theme:

```text
light / dark
```

Stored in:

```javascript
localStorage("theme")
```

Every page has an inline blocking theme script in `<head>`.

New pages must copy the existing theme script.

Do not create independent theme systems.

New v2 colors use:

```text
--v2-*
```

---

# Tools Data

Single source of truth:

```text
assets/js/tools-data.js
→ window.SITE_TOOLS = { CATEGORIES, TOOLS, GUIDES }
```

`TOOLS` is local to that file's closure. Consumers use `window.SITE_TOOLS.TOOLS`.

Used by:

* home index
* search popup
* tool sidebars
* tool counts/indexes

Adding a tool normally means updating `TOOLS`.

Do not duplicate tool lists in HTML/JS.

For i18n tools use:

```text
key
descKey
```

Reuse `TOOLS` before creating another registry.

---

# Feature Structure

Typical:

```text
category/name/
├── index.html
└── name.js
```

Examples:

```text
cal/
tools/
games/
lotto/
saju/
```

Games reuse:

```javascript
window.shareGameResult()
window.copyGameLink()
```

from:

```text
assets/js/share.js
```

Do not duplicate existing sharing functionality.

---

# File / Naming Management

## Core rule

After every CSS/JS/HTML modification:

```text
No unnecessary files.
No duplicate files.
No obsolete files.
No ambiguous names.
```

Before creating, renaming, or replacing a file:

```text
1. Search existing files.
2. Check responsibility and references.
3. Reuse/consolidate when safe.
4. Remove obsolete files only after confirming they are unused.
5. Verify all references.
```

Do not leave temporary, backup, old, duplicate, or unused files created by the task.

## Naming

Use intuitive, searchable names.

Preferred:

```text
header-nav.js
tools-data.js
search-popup.js
mobile-menu.js
fortune-result.js

style.css
v2.css
tool-directory.css
saju.css
game.css
```

Avoid:

```text
new.js
temp.js
test.js
script2.js
common2.js
utils-new.js
style-new.css
final.css
backup.css
misc.js
```

Use:

```text
lowercase
kebab-case
```

Names should reveal the feature/responsibility immediately.

Do not add version suffixes such as `-new`, `-v2`, `-final`, or `-old` unless versioning is an intentional architectural requirement.

## CSS naming

Prefer clear component names:

```text
.v2-header
.v2-header-nav
.v2-mobile-menu
.v2-search-popup
.v2-tool-card
.v2-tool-sidebar
```

Avoid vague names:

```text
.box
.item
.wrap
.content2
.new-box
```

Before creating a class:

```text
Search existing CSS
→ reuse if responsibility matches
→ create only if necessary
```

Do not create duplicate classes for the same UI responsibility.

## Variable/function naming

Prefer:

```javascript
const mobileMenu
const searchPopup
const languageButton

function openMobileMenu() {}
function closeSearchPopup() {}
function updateToolList() {}
```

Avoid vague names:

```javascript
data
item
temp
value2
run()
process()
handle()
```

unless the meaning is obvious from a very small local scope.

Rules:

* Use descriptive, domain-specific names.
* Do not duplicate names with different meanings.
* Do not rename stable names unnecessarily.
* Before renaming, search all references.
* Update every reference when renaming.

---

# Duplicate / Obsolete Cleanup

When modifying a feature:

```text
Search
→ inspect related files
→ check references
→ consolidate duplicates
→ remove confirmed obsolete files/code
→ verify references
```

Check:

```text
duplicate CSS
duplicate JS
duplicate functions
duplicate data sources
unused CSS classes
unused JS files
unused variables/functions
obsolete HTML references
broken link/script references
```

Do not keep both old and new implementations when only one is required.

Never delete code merely because it appears unused. Confirm references first.

---

# File Creation Rule

Before creating a new CSS/JS/HTML file:

```text
Existing file with same responsibility?
        ↓
       YES
        ↓
Use/reuse existing file

        NO
        ↓
Clearly independent responsibility?
        ↓
       YES
        ↓
Create new file
```

Prefer:

```text
few
clear
well-scoped
files
```

Avoid unnecessary file fragmentation.

---

# Paths

New depth-1 pages use:

```text
../assets/
```

Do not copy the existing incorrect:

```text
../../assets/
```

pattern.

Do not rename directories or change URLs without explicit instruction.

Existing URLs may be indexed.

---

# Working Rules

## Priority

```text
1. Preserve existing functionality
2. Preserve existing URLs
3. Make the smallest safe change
4. Preserve project architecture
5. Implement the requested feature
6. Improve code only when relevant
```

## Before Editing

```text
1. Read relevant files.
2. Inspect the current implementation.
3. Search for reusable code/references.
4. Identify affected files.
5. Make the smallest necessary change.
```

Do not guess.

For changes affecting shared architecture, `common.js`, `header-nav.js`, i18n, global CSS, theme, or shared components:

```text
analyze impact
→ identify affected files/risks
→ modify minimally
```

## Do Not

* delete existing functionality
* rewrite unrelated files
* refactor unrelated code
* rename functions/classes unnecessarily
* move files unnecessarily
* create duplicate implementations
* leave obsolete files
* add dependencies
* add frameworks
* add TypeScript
* add bundlers/build systems
* introduce modules unless requested

Do not change calculation, game, or saju logic unless explicitly requested.

---

# Security and Privacy

Apply these checks to the changed feature and affected shared paths, without
waiting for a separate security-review request. Do not claim a full security
audit or legal compliance from a checklist or source scan.

## Public files and secrets

* Treat browser-delivered HTML, JS, JSON, assets, and deployment artifacts as public.
* Never put private API keys, tokens, passwords, personal records, `.env` files,
  or real-user test data in source, static assets, logs, screenshots, or reports.
* Frontend environment variables and obfuscation do not hide secrets.
  Existing public AdSense publisher IDs are not secret credentials.
* `.gitignore` does not remove already-tracked files or guarantee exclusion from
  deployment artifacts. The current Pages workflow uploads from the repository root;
  inspect artifact scope when adding files or changing deployment.
* If a secret is found, do not quote it. Identify its location, report the exposure,
  and require rotation/revocation; removing the current file alone is insufficient.
* Do not run `npm run deploy`, commit, push, or publish merely to verify a change.
  Deployment requires the user's instruction. Keep Actions permissions minimal
  when changing workflows and do not run untrusted content with secrets.

## Input, DOM, and URLs

* Treat form values, URL query/hash values, imported files, localStorage,
  postMessage data, and API responses as untrusted.
* Validate type, length/size, range, and format at the point data enters a feature.
  Handle empty, malformed, oversized, and unsupported inputs without crashing.
* Use `textContent` and DOM creation for untrusted display text. Do not interpolate
  untrusted values into `innerHTML`, `outerHTML`, or `insertAdjacentHTML`.
* Existing fixed templates and repository-owned shared HTML can keep their current
  rendering path; trace interpolated values before judging it safe or changing it.
* Do not use `eval`, `new Function`, string-based timers, or executable imported HTML
  to process user input. Parse JSON as data and validate its expected structure.
* Parse dynamic URLs with `URL`; allow only protocols and destinations required by
  the feature. Block executable URLs such as `javascript:`. Permit `blob:`/`data:`
  only in controlled local preview/download paths, not arbitrary navigation.
* New `target="_blank"` links use `rel="noopener"`; add `noreferrer` when referrer
  disclosure is unnecessary. Keep private inputs out of URLs and share text by default.
* If adding cross-window messaging, validate the sender origin, source, and message
  schema, and use the specific target origin when sending private data.

## Personal data and browser storage

* Prefer in-memory, on-device processing for utility inputs and imported files.
  Do not upload them or attach them to analytics, ads, logs, or error reports by default.
* Collect only what the requested feature needs. Before adding collection,
  transmission, persistent storage, or a new recipient, identify the data, purpose,
  destination, retention, and deletion behavior; make the behavior clear to users.
* Do not newly persist birth details, salary/financial inputs, file contents/EXIF,
  credentials, or other private inputs in localStorage/sessionStorage by default.
  Inspect existing storage behavior when modifying a feature; do not silently clear it.
* Browser storage is not a secure vault. Validate stored data on read, tolerate
  storage denial/quota errors, and delete only feature-owned keys when reset is requested.
* File `accept` and MIME/extension checks alone are insufficient: validate file
  structure and sizes before parsing, bound offsets/lengths, handle damaged files,
  and release object URLs when previews/downloads no longer need them.
* Check actual network and storage behavior against `/privacy/` and its translations.
  Do not claim that no data leaves the device while ignoring ads, third-party resources,
  or hosting logs. Fix disclosures affected by the requested feature.
* For changes involving consent, tracking, personal-data transfers, or retention,
  verify applicable current official legal/provider requirements for the intended
  audience. Do not assert that a generic cookie banner establishes compliance.

## External services and hosting limits

* Use HTTPS in production. Local development over localhost HTTP remains valid.
* Do not add analytics, third-party scripts, embeds, external APIs, or proxy services
  unrelated to the request. Check their data recipients and failure behavior when used.
* Use integrity metadata for eligible fixed-version third-party resources when
  supported; do not invent hashes or apply SRI to changing AdSense resources.
* GitHub Pages hosts static files. Client-side checks, hidden URLs, CORS, and
  `robots.txt` are not authorization or confidentiality controls. A feature needing
  private credentials, authorization, or protected data needs a separately designed backend.
* Do not add nonfunctional server configs or claim headers are active without checking
  the hosting capability and response. A meta CSP is not a replacement for all HTTP headers.
* Before changing CSP, sandboxing, or referrer policy, account for existing inline
  theme scripts, translations, shared components, and AdSense. Test compatibility;
  do not weaken policy broadly merely to suppress errors.

References: [OWASP DOM XSS](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html),
[OWASP HTML5 Security](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html),
[GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).

---

# Protected Files

Do not modify unless explicitly requested:

```text
ads.txt
robots.txt
sitemap.xml
```

Do not remove or restructure AdSense code in:

```text
components/ads.html
index.html
```

Do not modify `sitemap.xml` for normal page creation unless explicitly requested.

---

# New Pages

New/redesigned pages use v2:

```html
<body class="v2-page">
```

CSS:

```text
style.css
→ v2.css
→ page CSS
```

Use:

```text
.v2-*
--v2-*
```

Include:

```text
unique <title>
unique meta description
exactly one <h1>
canonical URL
robots=index,follow
useful explanatory content
related internal links
responsive layout
inline theme script
i18n.js
common.js
header-nav.js
page script when page-specific behavior is needed
shared component placeholders
```

Copy `<head>` structure from an existing sibling page.

New `/cal/` or `/tools/` pages must update required i18n structures.

Link new pages from appropriate category/home pages.

Add FAQ or JSON-LD (`WebApplication` / `VideoGame`) only when appropriate.

---

# Completion Checklist

Perform applicable verification without a separate user request. Documentation-only
changes need reference/consistency checks, not unrelated browser tests.

For UI changes, serve the site over HTTP and check the changed pages at the listed
widths in light/dark mode. Check all four languages for changed text/layout.
Verify keyboard focus, accessible control names, and Escape/focus return for changed popups.
Use browser tools when available; source inspection alone does not prove rendering.

For link/path changes, check the changed pages' links, anchors, images, stylesheets,
and scripts, including case-sensitive paths and relative URL depth. Also exercise
links created by shared components, `data-route`, and `SITE_TOOLS` in the browser.
For shared changes, inspect consumers and test representative home, category,
and depth-2 tool pages plus any exceptional affected page. Expand when issues appear.

Check Console and Network after load and relevant interactions. Separate first-party
errors from ad blocking, offline conditions, and external-service failures. A blocked
or timed-out external link is inconclusive, not automatically a broken URL.
Fix in-scope failures and recheck; report unrelated existing failures without broadening scope.

For input/storage/network changes, trace data from entry through rendering, storage,
and transmission. Exercise applicable malformed-input, injection-text, invalid-URL,
and storage/network failure cases. Use synthetic data, not real personal information.
New nontrivial logic needs a small meaningful test or reproducible self-check;
placeholder npm commands do not satisfy this requirement.

Before finishing, check applicable items:

```text
Functionality preserved
URLs unchanged
No unnecessary files
No duplicate/obsolete files
No unnecessary dependencies
File/class/function names are clear
i18n updated for ko/en/zh/ja when required
Light/dark mode works
Shared header/footer/ads load
Sticky header works
Language/search popups are mutually exclusive
No horizontal scroll at 320–1440px
Mobile/tablet/desktop layout works
No Console errors
No Network errors
No JavaScript errors
No 404 errors
New-page SEO requirements present
No new secret exposure or unsafe untrusted-data rendering
Input/storage/transmission behavior matches the feature and privacy disclosures
```

Report the actual commands, tested pages/widths/modes, and results concisely.
Mark checks as passed, failed, not applicable, or not run with a reason.
Never mark an unavailable browser check as passed, or imply device emulation is
physical-device testing. Do not install dependencies or change hosting solely to
complete an unavailable check without authorization.

---

# Final Response

Report only:

1. Modified files
2. What changed
3. Existing functionality impact
4. Verification performed/results and how to reproduce
5. Notes/risks, if any

Keep the final response concise.
