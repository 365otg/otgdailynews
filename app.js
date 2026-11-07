// OTG Daily News — loads Top Stories and Latest from the OTG Daily News blog
// (Blogger JSON feed). Each story links to its blog post, where comments live.
const FEED_URL = 'https://www.supplythework.xyz/feeds/posts/default?alt=json&max-results=12';

function postLink(entry) {
  const links = entry.link || [];
  const alt = links.find(function (l) { return l.rel === 'alternate'; });
  return alt ? alt.href : '#';
}
function postDate(entry) {
  const raw = (entry.published && entry.published.$t) || '';
  const d = new Date(raw);
  return isNaN(d) ? '' : d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
function postSummary(entry) {
  const s = (entry.summary && entry.summary.$t) || '';
  const clean = s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return clean.length > 220 ? clean.slice(0, 220).replace(/\s\S*$/, '') + '…' : clean;
}
function postLabels(entry) {
  return (entry.category || []).map(function (c) { return c.term; }).filter(Boolean).join(' • ');
}

async function loadStories() {
  const topEl = document.getElementById('top-stories');
  const latestEl = document.getElementById('latest-list');
  const statusEl = document.getElementById('feed-status');
  if (!topEl && !latestEl) return;
  try {
    const res = await fetch(FEED_URL);
    if (!res.ok) throw new Error('Feed returned ' + res.status);
    const data = await res.json();
    const entries = (data.feed && data.feed.entry) || [];
    if (!entries.length) throw new Error('No posts in feed');
    if (statusEl) statusEl.textContent = '';
    if (topEl) {
      topEl.innerHTML = '';
      entries.slice(0, 3).forEach(function (entry, i) {
        const labels = postLabels(entry);
        const card = document.createElement('article');
        card.className = 'card' + (i === 0 ? ' featured' : '');
        card.innerHTML =
          '<p class="kicker">' + (i === 0 ? 'Top Story' : 'Top Story') + (labels ? ' — ' + escapeHtml(labels) : '') + '</p>' +
          '<h3><a href="' + escapeHtml(postLink(entry)) + '">' + escapeHtml(entry.title.$t) + '</a></h3>' +
          '<p>' + escapeHtml(postSummary(entry)) + '</p>' +
          '<p class="meta">' + escapeHtml(postDate(entry)) + ' — Read it on the blog, where comments live</p>';
        topEl.appendChild(card);
      });
    }
    if (latestEl) {
      latestEl.innerHTML = '';
      entries.slice(3).forEach(function (entry) {
        const li = document.createElement('li');
        li.innerHTML =
          '<a href="' + escapeHtml(postLink(entry)) + '">' + escapeHtml(entry.title.$t) + '</a>' +
          '<span class="meta">' + escapeHtml(postDate(entry)) + (postLabels(entry) ? ' — ' + escapeHtml(postLabels(entry)) : '') + '</span>';
        latestEl.appendChild(li);
      });
      if (!entries.slice(3).length) latestEl.innerHTML = '<li>No older stories in this batch yet.</li>';
    }
  } catch (err) {
    if (statusEl) statusEl.textContent = 'Stories load from the OTG Daily News blog. If nothing appears here, read the latest posts on the blog directly.';
    if (topEl) topEl.innerHTML = '<p class="note">The latest stories could not be loaded from the blog feed right now. Please try again shortly.</p>';
  }
}
function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
// Footer / masthead date
(function () {
  const el = document.getElementById('today');
  if (el) el.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
})();
document.addEventListener('DOMContentLoaded', loadStories);
