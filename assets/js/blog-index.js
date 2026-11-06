/* Shared article index; canonical guide data lives in tools-data.js. */
(function () {
  var list = document.getElementById('guideList');
  if (!list || !window.SITE_TOOLS) { return; }
  var base = getSiteBasePath();
  window.SITE_TOOLS.GUIDES.forEach(function (guide) {
    var article = document.createElement('article');
    article.className = 'v2-editorial-post';
    var time = document.createElement('time');
    time.dateTime = guide.date;
    time.textContent = guide.date;
    var heading = document.createElement('h3');
    var link = document.createElement('a');
    link.href = base + guide.href;
    link.textContent = guide.title;
    link.setAttribute('data-i18n', guide.key);
    heading.appendChild(link);
    var summary = document.createElement('p');
    summary.textContent = guide.desc;
    summary.setAttribute('data-i18n', guide.descKey);
    article.appendChild(time);
    article.appendChild(heading);
    article.appendChild(summary);
    list.appendChild(article);
  });
  if (typeof applyLanguage === 'function') { applyLanguage(getCurrentLanguage()); }
})();
