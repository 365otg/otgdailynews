// OTG Daily News — front page data layer + PWA app shell logic.
// FEED_URL is the single configurable constant for the story feed.
// It points at the Supply The Work Blogger feed for now; when the new
// OTG Daily News blog (otgdailynews.blogspot.com) is live, swap this
// one line to its feed and the whole front page follows.
const FEED_URL = 'https://www.supplythework.xyz/feeds/posts/default?alt=json&max-results=30';
var ALL_ENTRIES = [];

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function postLink(entry) {
  var links = entry.link || [];
  var alt = links.find(function (l) { return l.rel === 'alternate'; });
  return alt ? alt.href : '#';
}
function postDate(entry) {
  var raw = (entry.published && entry.published.$t) || '';
  return new Date(raw);
}
function relTimeFromDate(d) {
  if (!d || isNaN(d)) return '';
  var mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  var hours = Math.floor(mins / 60);
  if (hours < 24) return hours + 'h ago';
  var days = Math.floor(hours / 24);
  if (days < 7) return days + 'd ago';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function relativeTime(entry) {
  return relTimeFromDate(postDate(entry));
}
function postLabels(entry) {
  return (entry.category || []).map(function (c) { return c.term; }).filter(Boolean);
}
function postSummary(entry, max) {
  var s = (entry.summary && entry.summary.$t) || '';
  var clean = s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  var limit = max || 180;
  return clean.length > limit ? clean.slice(0, limit).replace(/\s\S*$/, '') + '…' : clean;
}
// Thumbnails come from each post's first image via the feed.
function bloggerSized(url, size) {
  if (!url) return '';
  return url.replace(/\/s\d+(-c)?\//, '/s' + size + '/');
}
function firstImage(entry) {
  var t = entry['media$thumbnail'] && entry['media$thumbnail'].$t;
  if (t) return t;
  var c = (entry.content && entry.content.$t) || '';
  var m = c.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : '';
}
// Fixed-ratio crops: the CSS box sets the aspect ratio and object-fit: cover
// fills it (no stretching, no letterboxing). Text renders first; only the
// lead image loads eagerly — rail and card images are lazy and use
// responsive sizes (small file on phones, large on desktops).
function thumbHtml(entry, kind) {
  var img = firstImage(entry);
  var title = escapeHtml(entry.title.$t);
  if (!img) return '<div class="thumb-wrap no-img" aria-hidden="true"></div>';
  var small = bloggerSized(img, 400);
  var large = bloggerSized(img, 800);
  var lazy = kind === 'lead' ? 'eager' : 'lazy';
  var fetch = kind === 'lead' ? ' fetchpriority="high"' : '';
  var sizes = kind === 'lead' ? '(max-width: 600px) 100vw, 800px' : '(max-width: 600px) 100vw, 400px';
  return '<div class="thumb-wrap"><img src="' + escapeHtml(large) + '" srcset="' + escapeHtml(small) + ' 400w, ' + escapeHtml(large) + ' 800w" sizes="' + sizes + '" alt="' + title + '" loading="' + lazy + '" decoding="async"' + fetch + '></div>';
}
function sourceLine(entry) {
  return '<p class="source">OTG Daily News <span class="dot">&bull;</span> ' + escapeHtml(relativeTime(entry)) + '</p>';
}
function headlineHtml(entry) {
  return '<a href="' + escapeHtml(postLink(entry)) + '">' + escapeHtml(entry.title.$t) + '</a>';
}
function entryIndex(entry) {
  return ALL_ENTRIES.indexOf(entry);
}
function previewSaveButtons(entry) {
  var i = entryIndex(entry);
  var saved = isSaved(postLink(entry));
  return '<p><button type="button" class="save-btn' + (saved ? ' saved' : '') + '" data-save="' + i + '">' + (saved ? 'Saved' : 'Save') + '</button> ' +
    '<button type="button" class="save-btn" data-preview="' + i + '">Preview</button></p>';
}

// Section blocks: each nav section filters the feed by the post's labels.
var SECTIONS = [
  { id: 'hip-hop-history', keywords: ['hip hop history', 'history'] },
  { id: 'hip-hop-news', keywords: ['hip hop', 'rap', 'rap beef'] },
  { id: 'court-legal', keywords: ['court', 'legal', 'laws', 'trial', 'law enforcement'] },
  { id: 'philly', keywords: ['philadelphia', 'philly'] },
  { id: 'sports', keywords: ['sports', 'nfl', 'nba', 'basketball', 'football', 'boxing', 'mlb', 'tennis', 'mma'] },
  { id: 'tech', keywords: ['tech', 'technology', 'apple', 'iphone', 'android', 'smartphones'] },
  { id: 'weird-news', keywords: ['weird news', 'crazy news', 'funny news', 'florida man'] },
  { id: 'music', keywords: ['music', 'new music', 'music news'] }
];
function sectionEntries(entries, keywords, count) {
  var matched = entries.filter(function (e) {
    var labels = postLabels(e).map(function (t) { return t.toLowerCase(); });
    return keywords.some(function (k) {
      return labels.some(function (t) { return t.indexOf(k) !== -1; });
    });
  });
  var out = matched.slice(0, count);
  entries.forEach(function (e) {
    if (out.length >= count) return;
    if (out.indexOf(e) === -1) out.push(e);
  });
  return out;
}

function renderFrontPage(entries) {
  var leadEl = document.getElementById('lead-story');
  var railEl = document.getElementById('rail-stories');
  var briefEl = document.getElementById('brief-list');
  var statusEl = document.getElementById('feed-status');
  if (!leadEl && !railEl) return;
  if (statusEl) statusEl.textContent = '';
  if (leadEl && entries[0]) {
    var lead = entries[0];
    leadEl.innerHTML = thumbHtml(lead, 'lead') +
      '<h2 class="headline">' + headlineHtml(lead) + '</h2>' +
      '<p class="dek">' + escapeHtml(postSummary(lead, 220)) + '</p>' +
      sourceLine(lead) + previewSaveButtons(lead);
  }
  if (railEl) {
    railEl.innerHTML = '';
    entries.slice(1, 5).forEach(function (entry) {
      var item = document.createElement('article');
      item.className = 'rail-story';
      item.innerHTML = thumbHtml(entry, 'rail') +
        '<div><h3 class="headline">' + headlineHtml(entry) + '</h3>' + sourceLine(entry) + previewSaveButtons(entry) + '</div>';
      railEl.appendChild(item);
    });
  }
  if (briefEl) {
    briefEl.innerHTML = '';
    entries.slice(0, 5).forEach(function (entry) {
      var li = document.createElement('li');
      li.innerHTML = headlineHtml(entry);
      briefEl.appendChild(li);
    });
  }
  SECTIONS.forEach(function (section) {
    var grid = document.getElementById('section-' + section.id);
    if (!grid) return;
    grid.innerHTML = '';
    sectionEntries(entries, section.keywords, 3).forEach(function (entry) {
      var card = document.createElement('article');
      card.className = 'story-card';
      card.innerHTML = thumbHtml(entry, 'card') +
        '<div class="card-body"><h3 class="headline">' + headlineHtml(entry) + '</h3>' +
        '<p class="dek">' + escapeHtml(postSummary(entry, 140)) + '</p>' +
        sourceLine(entry) + previewSaveButtons(entry) + '</div>';
      grid.appendChild(card);
    });
  });
  renderHeadlines(entries);
}

// Legacy containers used by the section pages (Research, Music, Brief).
function renderLegacy(entries) {
  var topEl = document.getElementById('top-stories');
  var latestEl = document.getElementById('latest-list');
  var statusEl = document.getElementById('feed-status');
  if (!topEl && !latestEl) return;
  if (statusEl) statusEl.textContent = '';
  if (topEl) {
    topEl.innerHTML = '';
    entries.slice(0, 3).forEach(function (entry, i) {
      var card = document.createElement('article');
      card.className = 'card' + (i === 0 ? ' featured' : '');
      card.innerHTML = '<p class="kicker">Top Story</p>' +
        '<h3><a href="' + escapeHtml(postLink(entry)) + '">' + escapeHtml(entry.title.$t) + '</a></h3>' +
        '<p>' + escapeHtml(postSummary(entry, 220)) + '</p>' +
        '<p class="meta">OTG Daily News &bull; ' + escapeHtml(relativeTime(entry)) + ' &mdash; read it on the blog, where comments live</p>';
      topEl.appendChild(card);
    });
  }
  if (latestEl) {
    latestEl.innerHTML = '';
    entries.slice(3).forEach(function (entry) {
      var li = document.createElement('li');
      li.innerHTML = '<a href="' + escapeHtml(postLink(entry)) + '">' + escapeHtml(entry.title.$t) + '</a>' +
        '<span class="meta">OTG Daily News &bull; ' + escapeHtml(relativeTime(entry)) + '</span>';
      latestEl.appendChild(li);
    });
  }
}

function wireSearch() {
  var form = document.getElementById('site-search');
  var input = document.getElementById('search-input');
  var box = document.getElementById('search-results');
  if (!form || !input || !box) return;
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var q = input.value.trim().toLowerCase();
    if (!q) { box.hidden = true; return; }
    var hits = ALL_ENTRIES.filter(function (e) {
      var hay = (e.title.$t + ' ' + postSummary(e, 300) + ' ' + postLabels(e).join(' ')).toLowerCase();
      return hay.indexOf(q) !== -1;
    });
    box.hidden = false;
    box.innerHTML = '<h2>Search: ' + escapeHtml(input.value.trim()) + '</h2>' +
      (hits.length ? '<ul>' + hits.slice(0, 10).map(function (e) {
        return '<li><h3 class="headline">' + headlineHtml(e) + '</h3>' + sourceLine(e) + '</li>';
      }).join('') + '</ul>' : '<p>No stories matched. Try another word from the headlines above.</p>');
    box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

// Blogger's plain JSON feed does not allow cross-origin fetch from this
// site, so if fetch fails we load the same feed as JSON-in-script
// (a <script> tag, which is not blocked by CORS). Same FEED_URL, same posts.
function loadViaJsonp() {
  return new Promise(function (resolve, reject) {
    var done = false;
    var script = document.createElement('script');
    var timer = setTimeout(function () { finish(new Error('Feed timed out')); }, 12000);
    function finish(err, data) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      delete window.otgFeedReady;
      if (script.parentNode) script.parentNode.removeChild(script);
      if (err) reject(err); else resolve(data);
    }
    window.otgFeedReady = function (data) { finish(null, data); };
    script.onerror = function () { finish(new Error('Feed script failed to load')); };
    var url = FEED_URL.replace('alt=json', 'alt=json-in-script');
    url += (url.indexOf('?') === -1 ? '?' : '&') + 'callback=otgFeedReady';
    script.src = url;
    document.head.appendChild(script);
  });
}
async function loadStories() {
  var statusEl = document.getElementById('feed-status');
  try {
    var data;
    try {
      var res = await fetch(FEED_URL);
      if (!res.ok) throw new Error('Feed returned ' + res.status);
      data = await res.json();
    } catch (fetchErr) {
      data = await loadViaJsonp();
    }
    var entries = (data.feed && data.feed.entry) || [];
    if (!entries.length) throw new Error('No posts in feed');
    ALL_ENTRIES = entries;
    renderFrontPage(entries);
    // Legacy containers live only on the section pages; the front page
    // has a lead story instead, so skip the legacy renderer there.
    if (!document.getElementById('lead-story')) renderLegacy(entries);
  } catch (err) {
    if (statusEl) statusEl.textContent = 'Stories load from the OTG Daily News blog. If nothing appears here, read the latest posts on the blog directly.';
  }
}

// ---- App views: For You / Headlines / Topics / Saved (bottom tab bar) ----
function switchView(name) {
  var views = ['for-you', 'headlines', 'topics', 'saved'];
  views.forEach(function (v) {
    var el = document.getElementById('view-' + v);
    if (el) el.hidden = (v !== name);
  });
  document.querySelectorAll('.app-tabs button').forEach(function (b) {
    if (b.getAttribute('data-view') === name) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  if (name === 'saved') renderSaved();
  if (name === 'headlines') renderHeadlines(ALL_ENTRIES);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function renderHeadlines(entries) {
  var list = document.getElementById('headline-list');
  if (!list) return;
  list.innerHTML = '';
  entries.slice(0, 20).forEach(function (entry) {
    var li = document.createElement('li');
    li.innerHTML = '<h3 class="headline">' + headlineHtml(entry) + '</h3>' + sourceLine(entry) + previewSaveButtons(entry);
    list.appendChild(li);
  });
  if (!entries.length) list.innerHTML = '<li>Headlines are loading&hellip;</li>';
}

// ---- Article view: in-app preview that hands off to the blog post ----
function openArticle(entry) {
  var view = document.getElementById('article-view');
  var content = document.getElementById('article-content');
  if (!view || !content || !entry) return;
  content.innerHTML = thumbHtml(entry, 'lead') +
    '<h2 id="article-title">' + escapeHtml(entry.title.$t) + '</h2>' +
    sourceLine(entry) +
    '<p style="font-size:18px">' + escapeHtml(postSummary(entry, 400)) + '</p>' +
    '<p class="note">This is a preview. The full story — and the comments — live on the OTG Daily News blog.</p>' +
    '<p><a class="read-full" href="' + escapeHtml(postLink(entry)) + '" target="_blank" rel="noopener">Read the full story on the blog &rarr;</a></p>' +
    previewSaveButtons(entry);
  view.hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeArticle() {
  var view = document.getElementById('article-view');
  if (view) view.hidden = true;
  document.body.style.overflow = '';
}

// ---- Saved stories (localStorage) ----
function getSaved() {
  try { return JSON.parse(localStorage.getItem('otg-saved') || '[]'); } catch (e) { return []; }
}
function isSaved(link) {
  return getSaved().some(function (s) { return s.link === link; });
}
function toggleSave(entry) {
  var saved = getSaved();
  var link = postLink(entry);
  var i = saved.findIndex(function (s) { return s.link === link; });
  if (i === -1) saved.push({ title: entry.title.$t, link: link, time: (entry.published && entry.published.$t) || '' });
  else saved.splice(i, 1);
  try { localStorage.setItem('otg-saved', JSON.stringify(saved)); } catch (e) {}
  renderFrontPage(ALL_ENTRIES);
  renderSaved();
}
function renderSaved() {
  var list = document.getElementById('saved-list');
  if (!list) return;
  var saved = getSaved();
  if (!saved.length) {
    list.innerHTML = '<li>No saved stories yet. Tap Save on any story to keep it here.</li>';
    return;
  }
  list.innerHTML = saved.map(function (s) {
    var d = new Date(s.time);
    return '<li><h3 class="headline"><a href="' + escapeHtml(s.link) + '" target="_blank" rel="noopener">' + escapeHtml(s.title) + '</a></h3>' +
      '<p class="source">OTG Daily News <span class="dot">&bull;</span> ' + escapeHtml(relTimeFromDate(d)) + '</p></li>';
  }).join('');
}

// ---- Around the Culture: aggregation from other outlets ----
// Outlet name + headline + time only. Headlines link OUT to the outlet's
// own site. No other outlet's text, photos or logos are used here.
function parseRssXml(text, outlet, max) {
  try {
    var doc = new DOMParser().parseFromString(text, 'text/xml');
    var nodes = doc.querySelectorAll('item');
    var out = [];
    for (var i = 0; i < nodes.length && out.length < max; i++) {
      var n = nodes[i];
      var title = n.querySelector('title') ? n.querySelector('title').textContent : '';
      var link = n.querySelector('link') ? n.querySelector('link').textContent : '';
      var pub = n.querySelector('pubDate') ? n.querySelector('pubDate').textContent : '';
      if (title && link) out.push({ outlet: outlet, title: title, link: link, date: new Date(pub) });
    }
    return out;
  } catch (e) { return []; }
}
function showAggItems(items) {
  var list = document.getElementById('agg-list');
  if (!list) return;
  if (!items.length) {
    list.innerHTML = '<p class="agg-note">Around the Culture is updating — check back shortly.</p>';
    return;
  }
  list.innerHTML = items.map(function (it) {
    return '<div class="agg-item"><span class="agg-outlet">' + escapeHtml(it.outlet) + '</span>' +
      '<a href="' + escapeHtml(it.link) + '" target="_blank" rel="noopener">' + escapeHtml(it.title) + '</a>' +
      '<span class="source">' + escapeHtml(relTimeFromDate(it.date)) + '</span></div>';
  }).join('');
}
function loadAggregation() {
  var section = document.getElementById('around-culture');
  var list = document.getElementById('agg-list');
  if (!section || !list) return;
  fetch('sources.json').then(function (r) { return r.json(); }).then(function (cfg) {
    var per = cfg.per_outlet || 3;
    var jobs = (cfg.outlets || []).map(function (o) {
      var url = cfg.proxy + encodeURIComponent(o.rss) + '&count=' + per;
      return fetch(url).then(function (r) { return r.json(); }).then(function (d) {
        if (!d || d.status !== 'ok' || !d.items) return [];
        return d.items.slice(0, per).map(function (it) {
          return { outlet: o.name, title: it.title, link: it.link, date: new Date(it.pubDate) };
        });
      }).catch(function () { return []; });
    });
    return Promise.all(jobs).then(function (groups) {
      var items = [];
      groups.forEach(function (g) { items = items.concat(g); });
      if (items.length) return items;
      var fallbackJobs = (cfg.outlets || []).map(function (o) {
        return fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent(o.rss))
          .then(function (r) { return r.text(); })
          .then(function (t) { return parseRssXml(t, o.name, per); })
          .catch(function () { return []; });
      });
      return Promise.all(fallbackJobs).then(function (fgroups) {
        var fitems = [];
        fgroups.forEach(function (g) { fitems = fitems.concat(g); });
        return fitems;
      });
    });
  }).then(function (items) {
    items.sort(function (a, b) { return b.date - a.date; });
    showAggItems(items.slice(0, 12));
  }).catch(function () {
    showAggItems([]);
  });
}

function wireApp() {
  document.addEventListener('click', function (ev) {
    var t = ev.target;
    var preview = t.closest ? t.closest('[data-preview]') : null;
    if (preview) { var pe = ALL_ENTRIES[parseInt(preview.getAttribute('data-preview'), 10)]; if (pe) openArticle(pe); return; }
    var save = t.closest ? t.closest('[data-save]') : null;
    if (save) { var se = ALL_ENTRIES[parseInt(save.getAttribute('data-save'), 10)]; if (se) toggleSave(se); return; }
    var tab = t.closest ? t.closest('.app-tabs button[data-view]') : null;
    if (tab) { switchView(tab.getAttribute('data-view')); return; }
    var chip = t.closest ? t.closest('[data-topic]') : null;
    if (chip) {
      var target = chip.getAttribute('data-topic');
      if (target === 'research.html') { window.location.href = 'research.html'; return; }
      switchView('for-you');
      var el = document.getElementById(target);
      if (el) setTimeout(function () { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
      return;
    }
    if (t.id === 'article-close' || t.id === 'article-view') closeArticle();
  });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') closeArticle(); });
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }
}

(function () {
  var today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  var el = document.getElementById('today');
  if (el) el.textContent = today;
  var briefDate = document.getElementById('brief-date');
  if (briefDate) briefDate.textContent = today;
})();
document.addEventListener('DOMContentLoaded', function () { wireSearch(); wireApp(); loadStories(); loadAggregation(); });
