# THE O.T.G NETWORK bar — implementation spec (PROPOSED)

Date: November 7, 2026
Status: PROPOSED in the Design Registry. The identity element (THE O.T.G NETWORK bar + link block on every surface) is LOCKED; this site/app implementation is PROPOSED and awaits Charles's approval. No site change has been made from this spec — this file is the record only.

## The bar

Standard strip, header and footer, on every page of the site/app:

"THE O.T.G NETWORK — OTG Daily News • Paris Eighty • Supply The Work • Charles Paris Music • BeatStars • The Store (Gumroad) • O.T.G News on Substack • Teemsterrs Union"

Every page also carries the OTG bug and, on news surfaces, "EST. 2010".

## Verified links (Nov 7, 2026)

Each URL below was read off the hub's own outbound links or the destination's own page — none guessed. Verified in the link-verification pass of Nov 7, 2026.

- **OTG Daily News** — https://365otg.github.io/otgdailynews/
  The news site itself, live. (otgdailynews.com currently forwards to the blog per the GoDaddy forward; the site home is the Pages URL.)
- **Paris Eighty** — https://www.pariseighty.blog/
  Custom domain, loaded live Nov 7. The hub and Linktree link the same blog at https://pariseighty.blogspot.com.
- **Supply The Work** — https://www.supplythework.xyz/
  Custom domain, loaded live Nov 7. The hub and Linktree link the same blog at https://supplythework.blogspot.com.
- **Charles Paris Music** — https://supplythe.work/
  The hub itself ("Charles Paris Music | Paris Eighty — Brother OTG"). Linktree's P80OTG tile goes to the same hub at https://365otg.github.io/365CP.
- **BeatStars** — https://www.beatstars.com/pariseighty
  Found via BeatStars' own Musicians search for "Paris Eighty" and opened live: "O.T.G", Philadelphia, 48 tracks. It is not linked anywhere on the hub, Linktree, the digital business card, or Gumroad — the bar closes that gap.
- **The Store (Gumroad)** — https://charlesparismusic.gumroad.com/
  "PARIS EIGHTY (P80) | O.T.G", 79 products. Confirmed three ways: hub footer "Follow Charles Paris Music on Gumroad", Linktree "Free Stuff — Drum Kits & Guides" tile, and the supplythework.shop forward target.
- **O.T.G News on Substack** — https://brotherotg.substack.com/
  Confirmed twice from the hub: Link Hub "Substack — O.T.G News" and Services & Contact "Brother OTG's Newsletter".
- **Teemsterrs Union** — INTERIM: https://charlesparismusic.gumroad.com/l/teemsterrs
  See the Teemsterrs note below. This is the interim target recorded for the PROPOSED bar.

## Teemsterrs Union — interim target

- The standalone home https://www.teemsterrs.org/ does NOT resolve as of Nov 7, 2026 (www and apex both fail DNS, NXDOMAIN). Google last indexed it Aug 21, 2025 as "the official hub for The International Teemsterrs Union, The Teem community, and founder Charles A. Paris (Brother OTG)".
- INTERIM bar target: the live free Founding Member Kit on Gumroad, https://charlesparismusic.gumroad.com/l/teemsterrs — "The Teemsterrs Union: Local #1 Founding Member Kit (Free)": mission statement, official digital assets (wallpapers), founder welcome audio, "The Sound of the Union" unreleased beat (MP3), contributor perks (Wall listing; $25+ directory; $100+ spotlight).
- The .org domain/renewal question is routed to W4. Switch the bar target back to https://www.teemsterrs.org/ only if the .org question resolves. Renew nothing without Charles's word.

## Implementation (when approved)

- Add the strip to the header and footer of all six pages (index, research, music, brief, gear, get-covered), with `.network-bar` styles in styles.css in the LOCKED palette (OTG Black #0A0A0A, Crimson #C8102E, Gold #C9A227, Archive Tan #D6C08A, Cream #F5EFE0).
- Each item links to its home, as listed above.
- Register the BUILT bar back through 2GG for Charles's verdict before it is treated as final (same as the comments UI, which stays PROPOSED until his verdict).

## Hub follow-ups — mine, when the bar work is approved

- **Fix the hub's Search box.** On supplythe.work, typing a query and clicking Search or pressing Enter does nothing — no results page. (Hub repo: 365otg/365CP.) Do not touch the hub before the bar work is approved.
- **Link Hub gaps.** The hub's Link Hub page does not link BeatStars, Teemsterrs Union, or OTG Daily News. Add them so the hub routes match the bar.
- These are hub (365CP) fixes, not news-repo changes.

## Still gated (not this doc)

- Comments write-path verification stays gated on Charles's verdict on the staged Firestore rules v2 (rules unpublished; see COMMENTS-2026-11-07.md).
- FEED_URL swap waits on the new blog feed (import target 13,484 posts); the bigger checker sample comes when that import lands.
