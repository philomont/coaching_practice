# Phil Rogers — Coaching Practice Website

Static site for a boutique transition & executive leadership coaching
practice, hosted on **GitHub Pages**. All content is plain **markdown**;
a zero-dependency build script turns it into the finished site.

📖 **Full content guide: [`EDITING.md`](EDITING.md)** — every markdown file
explained, how to post a journal entry, the three post formats, and
testimonial modal usage.

```
repo/
├── content/            ← EDIT HERE — all the site's words
│   ├── site.md         global settings (title, email, Calendly URL, footer)
│   ├── home.md         landing page copy (kicker, headline, intro, CTAs)
│   ├── about.md        about section (title, sub, pull quote, body paragraphs)
│   ├── approach.md     "How We Work Together" headings
│   ├── engagements.md  "Ways to Work Together" headings + note + CTAs
│   ├── journal-preview.md   titles for the Field Notes section
│   ├── stories.md      "Words from Those I've Worked With" headings
│   ├── call.md         discovery call copy
│   ├── steps/          one file per "How We Work" step (numbered = order)
│   ├── formats/        one file per engagement format (numbered = order)
│   ├── facts/          the little fact lines in About (one per file)
│   ├── journal/        ← one markdown file per journal post
│   └── testimonials/   ← one markdown file per testimonial
├── site/               ← the template + design (edit only to change design)
│   ├── template.html            home page template
│   ├── journal-index-template.html
│   ├── post-template.html       individual journal post template
│   ├── style.css                all styling (Gallery Modern theme)
│   ├── script.js                scroll reveal + parallax
│   └── assets/                  SVG scenery + your photos go here
├── build.js            zero-dependency Node build (content × template → docs/)
├── docs/               GENERATED OUTPUT — served by GitHub Pages (gitignored)
├── mockups/            design mockups kept for reference (not deployed)
└── .github/workflows/deploy.yml   builds & deploys on every push to main
```

## Editing content (the normal workflow)

Every content file is markdown with a small front-matter block:

```markdown
---
title: The trapdoor promotion
date: 2025-10-14
minutes: 6
excerpt: A one-sentence teaser shown in the journal listing.
---

Your post body here. Plain markdown: paragraphs, **bold**, *italic*,
### sub-headings, - lists, > quotes, and [links](https://example.com).
```

- **New journal post:** create `content/journal/YYYY-MM-DD-<slug>.md`.
  Front matter: `title`, `date` (YYYY-MM-DD), `minutes`, `excerpt`.
  It appears on the home page preview and `/journal/`, and gets its own page.
- **New testimonial:** create `content/testimonials/anything.md` with a
  `name:` field ("M. S. — coaching supervisor · context") and put the
  quote as the body.
- **Reorder or add steps/formats/facts:** the number prefix in the
  filename controls order (e.g. `02-direction.md`).
- **Global details:** email, Calendly link, title, footer text live in
  `content/site.md`.

The build renders markdown strictly for safety — no raw HTML in content.

## Building & previewing locally

```bash
node build.js        # renders content/ + site/ → docs/
# then open docs/index.html in a browser, or:
cd docs && python3 -m http.server 8000
```

## Publishing

The included GitHub Actions workflow (`.github/workflows/deploy.yml`)
builds and deploys automatically on every push to `main`. The site
publishes to GitHub Pages: **https://philomont.github.io/coaching_practice/**
(Pages source is already set to GitHub Actions; DNS/CI verified working).

The build uses only relative links, so it also works if you later serve
the site from a different Pages path.

## Custom domain setup (Cloudflare)

Once you have a domain on Cloudflare:

1. **Tell the build the domain:** create `content/domain.txt` containing
   the domain (e.g. `2pi-coaching.com`). The build then emits a `CNAME`
   file into `docs/` on every deploy, which keeps the Pages custom
   domain binding alive. Also tell me the domain so it gets configured
   in the repo's Pages settings.

2. **Add DNS records in the Cloudflare dashboard** (domain → DNS →
   Records). For the apex domain and `www`:

   | Type | Name | Content | Proxy status |
   |---|---|---|---|
   | A | `@` | `185.199.108.153` | **DNS only** (gray cloud) |
   | A | `@` | `185.199.109.153` | **DNS only** |
   | A | `@` | `185.199.110.153` | **DNS only** |
   | A | `@` | `185.199.111.153` | **DNS only** |
   | CNAME | `www` | `philomont.github.io` | **DNS only** |

   **The proxy toggle is the one Cloudflare-specific gotcha:** records
   for GitHub Pages must be **DNS only (gray cloud)**, not proxied
   (orange). Proxied records hide the GitHub IPs, which breaks GitHub's
   custom-domain verification and Let's Encrypt certificate issuance
   (and can cause redirect loops). If you later want Cloudflare's
   proxy/DDoS protection back in front, that's a post-launch project
   with its own SSL/TLS mode configuration (Full) — not day one.

3. **Verify before wiring GitHub:** once records are added, check them
   from a terminal: `nslookup yourdomain.com` should return the four
   `185.199.x` IPs (if it returns Cloudflare IPs, the proxy toggle is
   still orange).

4. **Enable Enforce HTTPS:** after GitHub verifies the domain (I'll do
   the Pages-side custom-domain step), flip on *Settings → Pages →
   Enforce HTTPS*. The certificate auto-issues within a few minutes to
   an hour of DNS going live.

5. **Optional Cloudflare niceties** (any time): *SSL/TLS → Edge
   Certificates → Always Use HTTPS* for redirecting http→https, and a
   redirect rule from the bare domain to `www` (or vice versa) if you
   have a canonical preference.

One-time setup on GitHub:
1. Repo → **Settings → Pages** → Source: **GitHub Actions**.
2. Ensure the default branch is `main`.
3. Push. The site goes live at `https://<user>.github.io/<repo>/`.

The build uses only relative links, so it works at any Pages sub-path.

**Testimonial cards** show a short excerpt; clicking a card opens a
modal with the full testimonial text.

**Journal posts** support three formats via the `type` field:
`essay` (full-length, own page), `note` (short observation, own page),
and `link` (card opens an external article directly).

## Before going live

- **Headshot:** drop your photo into `site/assets/` as `headshot.jpg`
  (or `.png`, `.webp`, etc.). The build picks it up automatically —
  the hero placeholder is replaced with your photo. Use roughly a
  **4:5 portrait** (e.g. 1200×1500 or so); any size works, it is
  cropped to fit. The About-section photo works the same way with the
  filename `about.jpg`.
- **Calendar:** set `schedule_url` in `content/site.md` to your Calendly
  (or other scheduler) link.
- **Contact form/email:** the buttons currently use `mailto:`; a
  Formspree-style form can be slotted into the discovery-call section.
- **Journal posts / testimonials / prices:** all placeholder copy — edit
  freely under `content/`.

## Design

"Gallery Modern" — layout and components from the Canyon Modern mockup
(floating pill nav, rounded translucent panels, chip labels, 2×2 step
grid, tilted story cards, glassy dusk panel) with the Gallery palette
(warm near-white walls, deep ink, one terracotta accent) and the
canyon scenery drifting horizontally behind the page as a grayscale
parallax layer as you scroll.

Earlier design explorations are kept in `mockups/` for reference.
