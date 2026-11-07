// OTG Daily News — comments (native build, Firebase Firestore, Spark $0).
// Every comment starts as "pending" and stays invisible until a moderator
// approves it in the Firebase console. Readers post with a display name;
// there is no reader sign-in. OTG staff comments are made in the console
// (staff: true, status: "approved", pinned as needed).
// Styled to the locked OTG system: Cream / Black / Crimson / Gold, Anton.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js';
import { getFirestore, collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js';

var FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDixZYH8s_mKIpg9cb2p-ULHLM_q8cLy18',
  authDomain: 'otg-daily-news.firebaseapp.com',
  projectId: 'otg-daily-news',
  storageBucket: 'otg-daily-news.firebasestorage.app',
  messagingSenderId: '510830685822',
  appId: '1:510830685822:web:0090c8498093e4c30cf22f'
};

// Word filters. BLOCK: refused outright (spam / scams).
// HOLD: accepted but flagged for the moderators — the comment still
// starts "pending", like every comment, so nothing goes live unseen.
var BLOCKLIST = [
  'free money', 'crypto giveaway', 'double your bitcoin', 'click here to win',
  'make money fast', 'earn $', 'send bitcoin', 'send btc'
];
var HOLDLIST = ['scam', 'fake news', 'stupid', 'idiot', 'hate', 'kill'];

var MAX_TEXT = 1000;
var MAX_NAME = 40;
var MAX_LINKS = 1;
var SUBMIT_GAP_MS = 60000;
var MAX_PER_DAY = 5;

var db = null;
try {
  db = getFirestore(initializeApp(FIREBASE_CONFIG));
} catch (e) {
  db = null;
}

var current = { postId: null, postUrl: null };

function el(tag, cls, text) {
  var n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined && text !== null) n.textContent = text;
  return n;
}

function containsWord(text, list) {
  var t = ' ' + String(text || '').toLowerCase() + ' ';
  for (var i = 0; i < list.length; i++) {
    if (t.indexOf(list[i].toLowerCase()) !== -1) return list[i];
  }
  return null;
}

function countLinks(text) {
  var m = String(text || '').match(/https?:\/\/|www\./gi);
  return m ? m.length : 0;
}

function rateKey(postId) { return 'otg-comment-rate:' + postId; }

function dayKey(postId) {
  var d = new Date();
  return 'otg-comment-day:' + postId + ':' + d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}

function rateLimited(postId) {
  try {
    var last = parseInt(localStorage.getItem(rateKey(postId)) || '0', 10);
    if (Date.now() - last < SUBMIT_GAP_MS) return 'Please wait a minute between comments.';
    var count = parseInt(localStorage.getItem(dayKey(postId)) || '0', 10);
    if (count >= MAX_PER_DAY) return 'You have reached the daily comment limit for this story.';
    return null;
  } catch (e) { return null; }
}

function markPosted(postId) {
  try {
    localStorage.setItem(rateKey(postId), String(Date.now()));
    var k = dayKey(postId);
    localStorage.setItem(k, String((parseInt(localStorage.getItem(k) || '0', 10) || 0) + 1));
  } catch (e) {}
}

function relTime(ts) {
  var d = null;
  if (ts && typeof ts.toDate === 'function') d = ts.toDate();
  else if (ts instanceof Date) d = ts;
  else if (ts) d = new Date(ts);
  if (!d || isNaN(d.getTime())) return '';
  var mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  var hours = Math.floor(mins / 60);
  if (hours < 24) return hours + 'h ago';
  var days = Math.floor(hours / 24);
  if (days < 7) return days + 'd ago';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function commentNode(c) {
  var wrap = el('article', 'comment' + (c.pinned ? ' comment-pinned' : ''));
  var head = el('p', 'comment-head');
  head.appendChild(el('span', 'comment-author', c.author || 'Reader'));
  if (c.staff) head.appendChild(el('span', 'comment-staff-badge', 'OTG DAILY NEWS'));
  if (c.pinned) head.appendChild(el('span', 'comment-pinned-badge', 'Pinned by OTG'));
  head.appendChild(el('span', 'comment-time', relTime(c.createdAt)));
  wrap.appendChild(head);
  wrap.appendChild(el('p', 'comment-text', c.text || ''));
  return wrap;
}

function renderList(host, items) {
  host.textContent = '';
  if (!items.length) {
    host.appendChild(el('p', 'comments-empty', 'No comments yet — start the conversation.'));
    return;
  }
  var sorted = items.slice().sort(function (a, b) {
    var pin = (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
    if (pin) return pin;
    var ta = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
    var tb = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
    return ta - tb;
  });
  sorted.forEach(function (c) {
    if (c.parentId) return; // staff replies render under their parent
    var node = commentNode(c);
    var replies = sorted.filter(function (r) { return r.parentId === c.id; });
    if (replies.length) {
      var box = el('div', 'comment-replies');
      replies.forEach(function (r) { box.appendChild(commentNode(r)); });
      node.appendChild(box);
    }
    host.appendChild(node);
  });
}

function shell(section, postUrl) {
  section.textContent = '';
  var title = el('h3', 'comments-title', 'Discussion');
  section.appendChild(title);
  section.appendChild(el('p', 'comments-note', 'Comments are moderated: new comments appear here only after OTG approves them.'));
  var list = el('div', 'comments-list');
  section.appendChild(list);
  var form = el('form', 'comment-form');
  form.setAttribute('novalidate', '');
  var nameLabel = el('label', null, 'Your name');
  nameLabel.setAttribute('for', 'comment-name');
  var name = document.createElement('input');
  name.id = 'comment-name';
  name.type = 'text';
  name.maxLength = MAX_NAME;
  name.autocomplete = 'nickname';
  name.placeholder = 'Your name';
  form.appendChild(nameLabel);
  form.appendChild(name);
  var textLabel = el('label', null, 'Your comment');
  textLabel.setAttribute('for', 'comment-text');
  var text = document.createElement('textarea');
  text.id = 'comment-text';
  text.rows = 4;
  text.maxLength = MAX_TEXT;
  text.placeholder = 'Join the discussion — keep it respectful.';
  form.appendChild(textLabel);
  form.appendChild(text);
  var trap = document.createElement('input');
  trap.type = 'text';
  trap.name = 'website';
  trap.tabIndex = -1;
  trap.autocomplete = 'off';
  trap.style.cssText = 'position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;';
  trap.setAttribute('aria-hidden', 'true');
  form.appendChild(trap);
  var btn = document.createElement('button');
  btn.type = 'submit';
  btn.textContent = 'Post comment';
  form.appendChild(btn);
  var status = el('p', 'comments-status');
  status.setAttribute('role', 'status');
  form.appendChild(status);
  section.appendChild(form);
  var fallback = el('p', 'comments-fallback', 'The full story and its Blogger comments are also on the blog: ');
  var a = el('a', null, 'Join the discussion on the blog');
  a.href = postUrl || 'https://otgdailynews.blogspot.com/';
  a.target = '_blank';
  a.rel = 'noopener';
  fallback.appendChild(a);
  section.appendChild(fallback);
  return { title: title, list: list, form: form, name: name, text: text, trap: trap, btn: btn, status: status };
}

async function loadComments(postId) {
  var q = query(
    collection(db, 'comments'),
    where('postId', '==', postId),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'asc'),
    limit(50)
  );
  var snap = await getDocs(q);
  var out = [];
  snap.forEach(function (doc) {
    var d = doc.data();
    d.id = doc.id;
    out.push(d);
  });
  return out;
}

async function open(postId, postUrl) {
  var section = document.getElementById('comments-section');
  if (!section) return;
  current = { postId: postId, postUrl: postUrl };
  var ui = shell(section, postUrl);
  if (!db) {
    ui.list.appendChild(el('p', 'comments-empty', 'Comments are unavailable right now.'));
    ui.form.style.display = 'none';
    return;
  }
  ui.list.appendChild(el('p', 'comments-empty', 'Loading comments...'));
  try {
    var items = await loadComments(postId);
    if (current.postId !== postId) return; // reader already moved on
    var top = items.filter(function (c) { return !c.parentId; });
    ui.title.textContent = top.length ? 'Discussion (' + top.length + ')' : 'Discussion';
    renderList(ui.list, items);
  } catch (e) {
    ui.list.textContent = '';
    ui.list.appendChild(el('p', 'comments-empty', 'Comments could not be loaded.'));
  }
  ui.form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    submitComment(ui, postId);
  });
}

async function submitComment(ui, postId) {
  var name = ui.name.value.trim();
  var text = ui.text.value.trim();
  function fail(msg) { ui.status.textContent = msg; }
  if (ui.trap.value) { // honeypot: silently pretend it worked
    ui.status.textContent = 'Thanks — your comment is waiting for review.';
    ui.form.reset();
    return;
  }
  if (name.length < 2) return fail('Please add your name (at least 2 characters).');
  if (name.length > MAX_NAME) return fail('Please keep your name under 40 characters.');
  if (text.length < 2) return fail('Please write a comment first.');
  if (text.length > MAX_TEXT) return fail('Please keep your comment under 1,000 characters.');
  if (containsWord(text, BLOCKLIST) || containsWord(name, BLOCKLIST)) {
    return fail('That comment cannot be posted. Please keep it clean and on-topic.');
  }
  if (countLinks(text) > MAX_LINKS) {
    return fail('Please post your comment without links — links are not accepted here.');
  }
  var limited = rateLimited(postId);
  if (limited) return fail(limited);
  ui.btn.disabled = true;
  ui.status.textContent = 'Posting...';
  try {
    await addDoc(collection(db, 'comments'), {
      postId: postId,
      postUrl: current.postUrl || '',
      author: name,
      text: text,
      status: 'pending',
      createdAt: serverTimestamp(),
      pinned: false,
      staff: false,
      parentId: null,
      flagged: !!containsWord(text, HOLDLIST)
    });
    markPosted(postId);
    ui.text.value = '';
    ui.status.textContent = 'Thanks — your comment is waiting for review. It will appear here once OTG approves it.';
  } catch (e) {
    ui.status.textContent = 'Your comment could not be posted. Please try again in a moment.';
  } finally {
    ui.btn.disabled = false;
  }
}

window.OTGComments = { open: open };
