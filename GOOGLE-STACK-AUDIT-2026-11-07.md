# Google Stack Audit — OTG Daily News

Filed: November 7, 2026
Audited by: Window 1 (Maker) — from the live dashboards, signed in as Charles Paris (mrotg1@gmail.com)
Scope: audit and prep only. Nothing was enrolled, changed, or applied for.
Costs: $0 to enroll in every item below. Nothing was bought; no account was created.
Mirror: a copy of this file is filed in Drive 01 Front Door (OTG SYSTEM).

## 1. Google News Publisher Center — ENROLLED, with gaps

- Current state (verified): a publication named "OTG Daily News" already exists (ID CAow2LSaCw), organization also "OTG Daily News". Primary URL: http://www.otgdailynews.com — VERIFIED (the one Verified row; note it is http, not https). It already has 1 Google News follower. Per Google's March 2025 update shown on the page, Google News now automatically generates publication pages — there is no separate manual News enrollment step anymore; the publication is in.
- Not using: Reader Revenue Manager is NOT STARTED (subscriptions/contributions, free to set up, needs an https publication URL and a payments profile). The Primary URL should be changed to https://www.otgdailynews.com (the page itself warns Reader Revenue Manager requires HTTPS). Several legacy feedproxy.google.com feed sources (TechnologyOtgDailyNews, DiyHomeImprovementOtgDailyNews, otgdailynews) and stale domains (apocalypsevegas.com, otgdaily.news, secureserver.net) sit unverified with a "Verify owner" warning — they need cleanup, not enrollment.
- Steps + cost to enroll: none needed for News itself. Reader Revenue Manager: open the publication in Publisher Center → Reader Revenue Manager → set up (free; subscriptions need a payments profile).
- Needs Charles: approve the Reader Revenue Manager model (subscriptions vs contributions) and the https primary-URL fix when we get there.

## 2. Google Search Console — EMPTY

- Current state (verified): ZERO verified properties in this Google account. The welcome page shows only "Add a website" and an empty property search. Nothing for supplythe.work, the blogs, otgdailynews.com, or the GitHub Pages site. (Properties may exist under a different Google account, e.g. 365otg@gmail.com — not verified here.)
- Not using: everything — no Performance data, no News performance report, no index coverage, and the new social-platform linking (Instagram / TikTok / X / YouTube) is untouched.
- Steps + cost to enroll (free): add a domain property for otgdailynews.com (needs a DNS TXT verification record in GoDaddy), and URL-prefix properties for otgdailynews.blogspot.com and supplythework.xyz (Blogger auto-verifies the blog owner via the Settings → Google Search Console link).
- Needs Charles: approve creating the properties. The otgdailynews.com verification needs a DNS TXT record — that is a DNS change, currently HELD, and needs his call.

## 3. Google Analytics — BLOGS LIVE, NEWS + HUB NOT MEASURED

- Current state (verified): accounts found — "OTGAutos.com" (103014665), "OTGDailyNews" (39917331), "Over Time Grind" (216281491), "So-StadiumStatud" (51330359). In Over Time Grind: property "OTG Blogs" (562278774) is LIVE and collecting — last 7 days 77 active users, 428 events, 158 views; top pages PARIS EIGHTY (58 views) and Supply The Work (47). Its two streams are pariseighty.blogspot.com and supplythework.blogspot.com, both receiving traffic in the past 48 hours. Property "Over Time Grind" (298254984, measurement ID G-FY84X60FT2) has one stream, OTG SYSTEMS / https://otgsystems.io, and "No data received" — not the hub, not the news site. The "OTGDailyNews" account (39917331) exists but contains NO property at all — no measurement ID, no stream. The new blog's Blogger Settings show a BLANK Google Analytics Measurement ID, and no GA stream exists for otgdailynews.blogspot.com, supplythe.work, or the GitHub Pages site (the site has no gtag).
- Not using: key events = 0 on OTG Blogs (no conversion tracking — e.g. Gumroad outbound clicks, Get Covered views); the whole OTGDailyNews account shell sits empty.
- Steps + cost to enroll (free): create a property in the OTGDailyNews account and paste its measurement ID into the new blog's Settings and the site's pages.
- Needs Charles: approval only (no payment, no identity step).

## 4. Google Business Profile — REPORT ONLY

- Current state (verified): one business, 100% verified — Charles Paris Music, 111 North Macdade Boulevard, Darby, Pennsylvania 19023 (Verified) — the one W3 is reconnecting in Content Studio. A group "OverTimeGrind" also exists. NO Over Time Grind / OTG Daily News profile exists.
- Advisability: a GBP listing requires a business customers can visit or a service area — an online-only news outlet does not qualify under Google's guidelines, so a standalone OTG Daily News profile is NOT advisable unless there is a real public-facing OTG newsroom/studio at the Darby address; a second profile at the same address as Charles Paris Music would risk a duplicate/suspension.
- Not using on the existing profile: 0 Google updates — its "Create post" / "Add photo" tools are untouched (GBP posts could promote stories).
- Needs Charles: the decision on an OTG News profile (recommendation: no, unless a public-facing newsroom address exists).

## 5. AdSense — YOUTUBE-HOSTED ACCOUNT ONLY; WEB ADS NOT SET UP

- Current state (verified): an AdSense account exists — pub-9886523940555791, balance $0.00, last payment $233.31 (YouTube earnings). But its dashboard is "AdSense for YouTube" only — no Sites/Ads sections, meaning it is a YouTube-hosted account (YouTube Partner Program). No web AdSense, no site approved or applied for. The OTG Blogs GA property has 0 AdSense links. The new blog's Blogger Earnings page says "Looks like you have an AdSense account" with a CONNECT ADSENSE button, AND "Your blog isn't ready to show ads yet / You need to fix some things to continue — check your email or go to AdSense to find out how to fix the issue." So there is an outstanding AdSense issue to resolve before any blog can show ads.
- Steps + cost to enroll (free): upgrade the account to web AdSense and get each site approved (otgdailynews.com, pariseighty.blog, supplythework.xyz; Google reviews each site for original content, navigation, privacy policy).
- Needs Charles: the "fix some things" issue likely involves identity/payment verification — check his AdSense email. Do not click CONNECT ADSENSE until approved.

## 6. Podcasts / YouTube — SEAM ONLY, NOT DUPLICATED

- Covered by W9/W10. Seams noted: the shared monetization account is AdSense for YouTube (pub-9886523940555791, last payment $233.31), and Search Console now offers linking a YouTube channel — that link is a W9/W10 + Search Console joint step, left to them.

## Check-in batch for Charles (needs him)

1. Approve creating Search Console properties — otgdailynews.com verification needs a DNS TXT record (DNS hold applies).
2. Approve creating the GA4 property in the existing OTGDailyNews account and adding its measurement ID to the new blog + site.
3. The AdSense "fix some things" blocker — needs his AdSense email/identity check.
4. Decide on a GBP profile for OTG News (recommendation: no, unless a public-facing newsroom address exists).
5. Approve Reader Revenue Manager model + https primary-URL fix in Publisher Center.

All costs: $0 to enroll. Nothing bought, no account created.
