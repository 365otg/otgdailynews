"use strict";
/* ============================================================
   O.T.G Daily News — Sports Ticker
   Data: ESPN public scoreboard API (no key required, CORS: *)
   Fallback chain: live API -> ticker-snapshot.json -> built-in
   ============================================================ */
var OTG_ENDPOINTS = [
  { league: "NFL", url: "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard" },
  { league: "NBA", url: "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard" },
  { league: "NHL", url: "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard" },
  { league: "CFB", url: "https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard" },
  { league: "MLB", url: "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard" }
];
var OTG_REFRESH_MS = 60000;      /* refresh scores every 60 seconds */
var OTG_PX_PER_SEC = 110;        /* scroll speed */

/* Last-resort scores, used only if both the live API and the
   snapshot file are unreachable (e.g. file:// with no network). */
var OTG_BUILTIN_FALLBACK = [
  { league:"NBA", away:"IND", awayScore:"102", home:"DEN", homeScore:"114", state:"post", detail:"Final" },
  { league:"NBA", away:"ATL", awayScore:"124", home:"BKN", homeScore:"121", state:"post", detail:"Final" },
  { league:"NHL", away:"WSH", awayScore:"4",   home:"FLA", homeScore:"3",   state:"post", detail:"Final" },
  { league:"CFB", away:"ND",  awayScore:"31",  home:"MIA", homeScore:"24",  state:"post", detail:"Final" },
  { league:"NFL", away:"DAL", awayScore:"",    home:"IND", homeScore:"",    state:"pre",  detail:"11/8 - 1:00 PM EST" }
];

/* ---- pure helpers (also exercised by the build-time check) ---- */
function otgParseEvent(league, ev) {
  try {
    var comp = ev.competitions[0];
    var byHomeAway = {};
    comp.competitors.forEach(function (c) { byHomeAway[c.homeAway] = c; });
    var away = byHomeAway.away, home = byHomeAway.home;
    if (!away || !home) return null;
    var st = (ev.status && ev.status.type) || {};
    return {
      league: league,
      away: (away.team && away.team.abbreviation) || "?",
      awayScore: away.score == null ? "" : String(away.score),
      home: (home.team && home.team.abbreviation) || "?",
      homeScore: home.score == null ? "" : String(home.score),
      state: st.state || "",
      detail: st.shortDetail || ""
    };
  } catch (e) { return null; }
}

function otgStatusText(it) {
  if (it.state === "post") return "FINAL";
  return (it.detail || "").toUpperCase();
}

/* "NBA — LAL 112 @ BOS 108 • FINAL" */
function otgItemText(it) {
  var scorePart = (it.state === "pre")
    ? it.away + " @ " + it.home
    : it.away + " " + it.awayScore + " @ " + it.home + " " + it.homeScore;
  return { league: it.league, body: scorePart, status: otgStatusText(it) };
}

function otgEscape(s) {
  return String(s).replace(/[&<>"']/g, function (ch) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
  });
}

function otgRenderHTML(items) {
  var parts = items.map(function (raw) {
    var it = otgItemText(raw);
    return '<span class="otg-ticker__item"><span class="lg">' + otgEscape(it.league) +
           "</span> &mdash; " + otgEscape(it.body) +
           ' <span class="st">&bull; ' + otgEscape(it.status) + "</span></span>";
  });
  var half = parts.join('<span class="otg-ticker__sep">&bull;</span>') +
             '<span class="otg-ticker__sep">&bull;</span>';
  return half + half; /* duplicated for a seamless -50% loop */
}

/* ---- browser runtime ---- */
function otgSetMode(mode) {
  var el = document.getElementById("otgMode");
  if (el) el.textContent = mode;
}

function otgShowItems(items) {
  var track = document.getElementById("otgTrack");
  if (!track || !items.length) return;
  track.innerHTML = otgRenderHTML(items);
  /* size the animation to the content so speed stays constant */
  requestAnimationFrame(function () {
    var halfWidth = track.scrollWidth / 2;
    if (halfWidth > 0) {
      track.style.animationDuration = (halfWidth / OTG_PX_PER_SEC) + "s";
    }
  });
}

function otgFetchLive() {
  return Promise.all(OTG_ENDPOINTS.map(function (ep) {
    return fetch(ep.url, { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (data) {
        return (data.events || []).map(function (ev) { return otgParseEvent(ep.league, ev); })
                                  .filter(Boolean);
      })
      .catch(function () { return []; }); /* one dead league shouldn't kill the ticker */
  })).then(function (perLeague) {
    var all = [];
    perLeague.forEach(function (list) { all = all.concat(list); });
    if (!all.length) throw new Error("no events from any league");
    return all;
  });
}

function otgFetchSnapshot() {
  return fetch("ticker-snapshot.json", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(function (snap) { return snap.items || []; });
}

function otgRefresh() {
  otgFetchLive()
    .then(function (items) { otgSetMode("LIVE"); otgShowItems(items); })
    .catch(function () {
      otgFetchSnapshot()
        .then(function (items) {
          if (!items.length) throw new Error("empty snapshot");
          otgSetMode("SNAPSHOT"); otgShowItems(items);
        })
        .catch(function () { otgSetMode("SNAPSHOT"); otgShowItems(OTG_BUILTIN_FALLBACK); });
    });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      otgRefresh();
      setInterval(otgRefresh, OTG_REFRESH_MS);
    });
  } else {
    otgRefresh();
    setInterval(otgRefresh, OTG_REFRESH_MS);
  }
}

/* Node export for the build-time sanity check (ignored by browsers). */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { otgParseEvent: otgParseEvent, otgItemText: otgItemText,
                     otgRenderHTML: otgRenderHTML, OTG_ENDPOINTS: OTG_ENDPOINTS };
}
