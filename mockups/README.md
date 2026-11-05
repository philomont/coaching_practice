# Website Mock-ups — Coaching Practice

Self-contained static mock-ups (no build step, no dependencies). Open any
`index.html` directly in a browser, or serve the folder and click around:

```bash
cd mockups
python3 -m http.server 8000
# visit http://localhost:8000/<direction-folder>/
```

---

### Style E — "Gallery Modern" (`style-e-gallery-modern/`) ← blend
The requested mix: **layout & components from D** (floating pill nav,
rounded translucent panels, chip labels, 2×2 step grid, tilted story
cards, glassy dusk panel) painted with **C's palette** — warm near-white
walls (#f4f2ee), deep ink, one terracotta accent, and the scenery as
grayscale ghosts drifting behind. Ends on a near-black gallery room
with a glassy panel.

---

## Style explorations

Five restyles of the approved *southwest-5-clean* baseline — same
content, same parallax machinery, different visual personalities. Each
has a small chip in the bottom-right corner naming it. All use Fraunces
+ Inter, no prices, professional copy.

**All five now carry the v2 features:** clickable testimonial cards
(excerpt on the card, full text in a modal), role-based attributions
(former direct report, mentee, coaching supervisor), and the journal
reflecting the three post formats — **Essay / Note / Link** style
labels (in `style-e-gallery-modern`: mixed cards demonstrating each —
entry labels show `date · minutes · type`, the note card is visually
quieter, and the link card opens the external piece directly). The
production build implements all of this in `build.js` + `EDITING.md`.

### Style A — "Atelier" (`style-a-atelier/`)
Refined editorial. Warm paper grounds, hairline rules between sections,
quiet luxury shadows, italic serif numerals for the approach steps,
terracotta left-rule testimonials. Scenery nearly idle (very faint).

### Style B — "Letters" (`style-b-letters/`)
Stationery / letterpress. Typewritten mono labels, double-ruled
letterhead nav, sheets of paper with print-plate offset shadows, ruled
note-card testimonials, dashed dividers. The most personal.

### Style C — "Gallery" (`style-c-gallery/`)
Near-white gallery walls, enormous light Fraunces display, outlined
ghost step numerals, outline-offset photo frames, uppercase micro-labels.
The most restrained and professional; scenery survives as grayscale
ghosts; ends on a near-black gallery room.

### Style D — "Canyon Modern" (`style-d-modern/`)
Keeps the sandstone scenery clearly visible behind translucent rounded
panels; floating pill nav, rounded step cards, chip-style labels,
slightly tilted story cards. The most approachable and friendly.

---

## Frontrunners (previous round)

The last version felt busy, so these two simplify and calm things down.
Generated with Claude Code on `deepseek-v4-pro:cloud` (Ollama Cloud).
No canoe, no water/river, no mileage — the canyon now reads through
color, strata, and light. Decorative art remains external, hand-editable
SVGs (fewer of them).

### Southwest 5 — clean vertical scroll (`southwest-5-clean/`)
A calm top-to-bottom descent (dawn → golden → green band → red rock →
dusk). Generous whitespace, four approach steps on a single thin line,
one subtle yucca silhouette, 4 editable SVG assets.

### Southwest 6 — side-scrolling traverse (`southwest-6-horizontal/`)
Normal vertical wheel/trackpad scroll drives a horizontal `translateX`
through the canyon (sticky full-viewport frame + long track). Seven
"waypoint" panels, distant strata + two rock silhouettes at three
parallax speeds, progress bar + waypoint dots. Falls back to a normal
vertical stack below 960px and respects reduced-motion.

---

## Earlier frontrunner

### Southwest 4 — "Juniper Morning, refined" (`southwest-4-refined/`)
The chosen successor to Southwest 1, generated with a different model
(Claude Code running on an Ollama Cloud model). Same approved palette
and structure, with richer hand-editable art and the river cleaned up:

- **Decorative art externalized** to 9 standalone SVG files in
  `assets/` (juniper, yucca, Arizona sycamore, canyon strata, canoe,
  seamless ripples, campfire) — clean, valid, layered `<g>` documents
  meant to be hand-edited in Inkscape / Illustrator / Figma.
- **River-mile readout removed** — no distance counter anywhere.
- **Water animation fixed** — seamless `repeat-x` wave tiles that
  translate horizontally only (no more scaling/distortion).
- Canoe bob and scroll travel live on separate elements so they never
  conflict.
- Still no published pricing; "Ways to Work Together" section retained.

---

## Current round — three southwestern canyon variants

Same bones in all three: the page descends a canyon; a canoe drifts
down the river strip at the bottom of the screen as you scroll (with a
quiet `river mile 226.0` readout); sections reveal with soft motion;
**no published pricing** — packages have been replaced by a
professional "Ways to Work Together" section (single sessions, monthly
partnership, long-term retainer, described without prices, with a
note that details and pricing are shared on the discovery call and
booking runs through the scheduler).

### Southwest 1 — "Juniper Morning" (`southwest-1-juniper/`)
The bright, airy take. Sandstone walls, juniper and yucca silhouettes
in the hero, and the green of the pinyon-juniper band as a full section
of the descent (the "Ways to Work Together" section sits in it).
Amber-to-terra accents, teal river.

### Southwest 2 — "Sycamore Creek" (`southwest-2-sycamore/`)
The greenest, most riparian take — Oak Creek / Sycamore Canyon energy.
Pale-barked **Arizona sycamores** flank the hero, boulders and yucca in
the foreground, emerald creek below. The whole page walks down a green
canyon: sage → moss → forest-green to deep dusk. Sandstone only as a
distant wall. The calmest and most "executive" of the three.

### Southwest 3 — "Yucca Dusk" (`southwest-3-yucca/`)
The most dramatic. Golden hour into night: a low sun on the horizon,
silhouetted juniper and yucca, deep red rock, then indigo night with a
flickering campfire under the stars. The river runs dark with the
sun's reflection, and the canoe carries a warm rim-light along its hull.

## What to react to

Copy, name, and photos are **placeholders** — react to feel, palette,
motion, and structure, not words. Useful things to tell me:

1. **Which variant** (or a blend — e.g. variant 2's palette with
   variant 3's dusk ending)?
2. **How much green** — variant 1 sprinkles it, variant 2 is soaked
   in it, variant 3 uses it as silhouette.
3. **How dramatic** the light progression should be — 1 is a gentle
   morning, 3 is a full sunset-to-nightfall.
4. **The canoe** — redesigned with a proper hull, gunwale, seated
   paddler, paddle, wake, and water reflection. Right size, or bigger?
5. **Photography** — one headshot, or headshot + 2–3 field/lifestyle
   shots (you on a trail, at a desk, at a campfire)?
6. **Typography** — currently classic serif (Georgia). For the real
   build we can license something with more character (e.g. Fraunces
   or Recoleta) — worth it?

## Earlier directions (kept for reference)

- `direction-a-ascent/` — trail-map aesthetic, elevation rail on the
  right edge (flag climbs a topographic squiggle as you scroll).
- `direction-b-voyage/` — nautical sailing theme; superseded by the
  canyon direction.
- `direction-c-canyon/` — the first canyon draft; superseded by the
  three variants above (it still contains the old price cards).

## Planned architecture (after direction is locked)

- **Static site, no framework** — plain HTML/CSS/JS, ideal for GitHub Pages.
- **Blog as markdown**: entries live in `/journal/<slug>/index.md` with a
  front-matter block; a tiny build script (run locally, commit the
  output) renders them to HTML. Zero third-party runtime dependencies.
- **Scheduling**: Calendly (or similar) embed for discovery calls.
- **Contact form**: Formspree / GitHub Pages-friendly service, with a
  mailto fallback.