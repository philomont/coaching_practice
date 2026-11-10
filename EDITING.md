# Editing the Site — the content guide

Everything visitors see lives in `content/` as plain markdown. You never
touch HTML to change words. This is the complete reference.

## Quick start

```bash
# make changes under content/ … then:
node build.js

# preview:
cd docs && python3 -m http.server 8000   # http://localhost:8000
```

To publish: `git add content/ && git commit -m "new post" && git push` —
the included GitHub Action rebuilds and deploys automatically.

---

## File map

```
content/
├── site.md                 global settings
├── home.md                 landing page copy
├── about.md                about section (headings + body paragraphs)
├── approach.md             "How We Work Together" headings
├── engagements.md          "Ways to Work Together" headings, note, CTAs
├── journal-preview.md      "Field Notes" section headings
├── stories.md              "Words from Those I've Worked With" headings
├── call.md                 discovery-call copy
├── steps/*.md              one file per approach step      (1 file = 1 step)
├── formats/*.md            one file per engagement format  (1 file = 1 format)
├── facts/*.md              one file per fact line in About (1 file = 1 line)
├── journal/*.md            journal posts                   (1 file = 1 post)
└── testimonials/*.md       testimonials                    (1 file = 1 person)
```

Ordering rule: for `steps/`, `formats/`, and `facts/`, the numeric prefix
of the filename controls display order (`01-understand.md` comes first).
To reorder, rename the files. To insert, use a fresh number.

Deleting a file removes that item from the site on the next build.

---

## Front matter reference

Front matter is the block between the two `---` lines at the top of each
file — a list of `key: value` pairs. One line per key. The text **below**
front matter is the markdown body.

### `site.md` — global settings

| Key | Meaning |
|---|---|
| `title` | browser-tab title |
| `email` | contact email (used site-wide) |
| `schedule_url` | your Calendly/discovery-call booking link |
| `linkedin_url` | link in the footer |

### Page sections (`home.md`, `about.md`, `approach.md`, `engagements.md`,
`journal-preview.md`, `stories.md`, `call.md`)

| Key | Used for |
|---|---|
| `station` | the small number above the heading (01, 02…) |
| `title` | the section heading |
| `sub` | the italic line under the heading |
| `pull_quote` / `photo_caption` | About extras |
| `note`, `cta_primary`, `cta_secondary` | engagements + call CTAs |
| `body` | discovery-call paragraph (call.md) |

> **Voice rule:** quotes and captions written by Phil are kept *exactly*
> as written, even when they read unconventionally — only spelling
> errors and mechanical typos get fixed. "Generate you a plan" and
> "communicate on" are Phil's deliberate phrasing and are left alone.

Everything below the front matter in these files is ignored — keep notes
to yourself there if you like.

### `home.md`

| Key | Meaning |
|---|---|
| `kicker` | small caps line above the headline |
| `h1`, `h1_em` | headline (regular, then italic accent part) |
| `lede` | the intro paragraph |
| `cta_primary`, `cta_secondary` | hero button labels |
| `photo_caption` | the line under your headshot |

### Testimonials (`content/testimonials/*.md`)

```markdown
---
name: J. T. — former direct report · engineering leadership
excerpt: One short punchy sentence shown on the card.
---

The full testimonial lives here, as many paragraphs as you like.
Visitors see the excerpt on the main page; clicking the card opens
a modal with this full text.
```

- `name` — shown under the quote and as the modal heading. Format it as
  *"Initials — role · context"* for privacy.
- `excerpt` — the teaser on the home page. If you omit it, the build
  uses the first sentence of the body, trimmed.
- Body — full testimonial, plain markdown (paragraphs, bold, lists).

### Journal posts (`content/journal/*.md`)

Filename becomes the URL: `2025-10-14-the-trapdoor-promotion.md` →
`/journal/2025-10-14-the-trapdoor-promotion/`. Keep the `YYYY-MM-DD-`
prefix so posts sort correctly.

Posts come in **three formats** via the `type` field:

**1. `essay` (default — full-length post, own page)**

```markdown
---
title: The trapdoor promotion
date: 2025-10-14
minutes: 6
excerpt: A one-sentence teaser for the listing.
---

Full post body in markdown. Section headings (## like this), lists,
> quotes, **bold**, *italic*, `code`, and [links](https://example.com)
all render.
```

**2. `note` (short observation, own page, smaller listing)**

```markdown
---
title: On carrying the map
date: 2025-07-20
minutes: 2
type: note
excerpt: A short teaser… (required)
---

Two or three short paragraphs. No `##` headings needed at this length.
```

**3. `link` (point to someone else's piece)**

```markdown
---
title: "HBR: the transition curve"
date: 2025-06-30
type: link
link_url: https://example.org/article
excerpt: Why you're pointing people here (optional commentary — your
words on the card itself).
---

Anything below the front matter is optional extra context; link posts do
not get their own page — the card opens the external link directly.
```

Mixing formats is encouraged — a journal that alternates essays, short
notes, and shared reads reads like a person, not a publication.

### Markdown syntax the build understands

- Paragraphs: separate blocks with a blank line
- `## Heading` / `### Heading` (and `#` behaves like `##`)
- `**bold**`, `*italic*`, `_italic_`
- `` `code` ``
- `[text](https://url)`
- `- list item` (consecutive `-` lines form one list)
- `> quoted line` (consecutive `>` lines form one blockquote)

Anything else (tables, images inside posts, raw HTML) is not rendered —
images are best added to a post's *excerpt* spot or `site/assets/` with
help from the templates; ask when you want that.

---

## Common tasks

**Post a new journal entry**
1. Create `content/journal/2025-11-04-my-new-post.md`.
2. Fill front matter (`title`, `date`, `minutes`, `excerpt`, optional `type`).
3. Write the body.
4. `node build.js`, preview, push.

**Remove a post** — delete its file from `content/journal/`.

**Edit a testimonial** — edit its file; both the card and the modal
update on the next build.

**Change the email or booking link** — `content/site.md`.

**Add photos** — put image files in `site/assets/` using conventional
file names; the build picks them up automatically:

| File name | Appears as |
|---|---|
| `headshot.jpg` (or `.png`/`.webp`/…) | landing-page headshot (≈4:5 portrait) |
| `about.jpg` (or other image extension) | the second photo in the About section |
| `favicon.svg` (or `.ico`/`.png`) | browser-tab icon — used automatically on every page |
| `logo.svg` (or other image extension) | small mark shown before the "2π" wordmark in the nav |

**Favicons:** SVG is recommended (it scales); if you provide a `.png`,
export it at 512×512 so it stays crisp. If several are present, all are
declared and the browser picks. A first-cut "2π" favicon ships with the
site — overwrite `favicon.svg` with your own mark any time.

Until a file exists, the corresponding placeholder stays visible.
Captions come from `content/home.md` (`photo_caption`) — the About
placeholder text lives in the About photo file itself.

**Change anything visual** — `site/style.css` (theme), `site/template.html`
(structure), `site/assets/*.svg` (scenery artwork, hand-editable in
Inkscape/Illustrator/Figma).

---

## Troubleshooting

- **Unfilled `{{LIKE_THIS}}` in the output** — a token mismatch between a
  template and `build.js`; check the spelling in `site/template.html`.
- **Content not updating** — did you re-run `node build.js`? The site
  serves `docs/`, not `content/`.
- **Build crashes with ENOENT** — a template or content file moved;
  check the paths printed in the error.
