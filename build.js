#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   BUILD — zero-dependency static site generator for GitHub Pages.

   Reads markdown from content/ and templates from site/,
   renders everything into docs/, ready to serve.

   Usage:  node build.js
   ═══════════════════════════════════════════════════════════════ */

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const CONTENT = path.join(ROOT, "content");
const SITE = path.join(ROOT, "site");
const OUT = path.join(ROOT, "docs");

/* ── front matter + markdown parsing ─────────────────────────── */

function readMd(file) {
  const raw = fs.readFileSync(file, "utf8");
  return parseRaw(raw);
}

function parseRaw(raw) {
  const fm = {};
  let body = raw;
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (m) {
    for (const line of m[1].split(/\r?\n/)) {
      const kv = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
      if (kv) fm[kv[1].trim()] = kv[2].trim().replace(/^["'](.*)["']$/, "$1");
    }
    body = m[2];
  }
  return { fm, body: body.trim() };
}

/* ── minimal markdown → HTML ─────────────────────────────────── */

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
}

function inline(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>")
    .replace(/(^|[\s(])_([^_\s][^_]*)_/g, "$1<em>$2</em>");
}

function blockToHtml(block) {
  const lines = block.split(/\r?\n/);
  if (/^###\s+/.test(lines[0])) {
    return "<h3>" + inline(lines[0].replace(/^###\s+/, "")) + "</h3>";
  }
  if (/^##\s+/.test(lines[0])) {
    return "<h2>" + inline(lines[0].replace(/^##\s+/, "")) + "</h2>";
  }
  if (/^#\s+/.test(lines[0])) {
    return "<h2>" + inline(lines[0].replace(/^#\s+/, "")) + "</h2>";
  }
  if (lines.every((l) => /^>\s?/.test(l))) {
    return "<blockquote>" + lines.map((l) => inline(l.replace(/^>\s?/, ""))).join(" ") + "</blockquote>";
  }
  if (lines.every((l) => /^-\s+/.test(l))) {
    return "<ul>" + lines.map((l) => "<li>" + inline(l.replace(/^-\s+/, "")) + "</li>").join("") + "</ul>";
  }
  return "<p>" + block.split(/\r?\n/).map(inline).join(" ") + "</p>";
}

function md(body) {
  if (!body) return "";
  const blocks = body.split(/\r?\n\r?\n+/).map((b) => b.trim()).filter(Boolean);
  return blocks.map(blockToHtml).join("\n");
}

const mdInline = (s) => (s ? inline(s) : "");

/* ── collections ─────────────────────────────────────────────── */

function collect(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => {
      const parsed = readMd(path.join(dir, f));
      return {
        slug: f.replace(/\.md$/, ""),
        fm: parsed.fm,
        body: parsed.body,
      };
    });
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const PHOTO_EXTS = ["jpg", "jpeg", "png", "webp", "avif", "gif"];
const ICON_EXTS = ["svg", "png", "jpg", "jpeg", "webp"];
function findAsset(stem, exts) {
  for (const ext of exts) {
    if (fs.existsSync(path.join(SITE, "assets", stem + "." + ext))) {
      return stem + "." + ext;
    }
  }
  return null;
}

/* favicon: prefers favicon.svg, then .ico, then .png */
function faviconLinks(root) {
  const links = [];
  if (fs.existsSync(path.join(SITE, "assets", "favicon.svg")))
    links.push(`<link rel="icon" type="image/svg+xml" href="${root}assets/favicon.svg">`);
  if (fs.existsSync(path.join(SITE, "assets", "favicon.ico")))
    links.push(`<link rel="icon" href="${root}assets/favicon.ico" sizes="any">`);
  if (fs.existsSync(path.join(SITE, "assets", "favicon.png")))
    links.push(`<link rel="icon" type="image/png" href="${root}assets/favicon.png">`);
  return links.length ? "\n" + links.join("\n") : "";
}

/* nav logo: logo.svg preferred, then raster; falls back to the "2π" text glyph */
function logoHtml(root) {
  const file = findAsset("logo", ICON_EXTS);
  if (file) return `<img src="${root}assets/${file}" alt="2\u03c0" class="wordmark-logo"> `;
  return "2\u03c0";
}

function findPhoto(stem) {
  return findAsset(stem, PHOTO_EXTS);
}

function heroPhoto(root) {
  const file = findPhoto("headshot");
  return file
    ? `<img src="${root}assets/${file}" alt="Phil Rogers">`
    : '<div class="photo-placeholder">your headshot here</div>';
}

function aboutPhoto(root) {
  const file = findPhoto("about");
  return file
    ? `<img src="${root}assets/${file}" alt="Phil in the field" class="about-photo">`
    : '<div class="photo-placeholder small">photo: you, at home in the field</div>';
}
function fmtDate(iso) {
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return String(iso);
  return `${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}

/* ── fragments ───────────────────────────────────────────────── */

function factsHtml() {
  return collect(path.join(CONTENT, "facts"))
    .map((it) => `<li>${inline(it.body.trim())}</li>`)
    .join("\n        ");
}

function stepsHtml() {
  const delays = ["", " delay-1", " delay-2", " delay-3"];
  return collect(path.join(CONTENT, "steps")).map((it, i) => {
    const d = delays[i % delays.length];
    return `<article class="step reveal${d}">
      <span class="step-num">${i + 1}</span>
      <div>
        <h3>${esc(it.fm.title || "")}</h3>
        <p>${md(it.body)}</p>
      </div>
    </article>`;
  }).join("\n    ");
}

function formatsHtml() {
  const delays = ["", " delay-1", " delay-2", " delay-3"];
  return collect(path.join(CONTENT, "formats")).map((it, i) => {
    const d = delays[i % delays.length];
    return `<article class="format reveal${d}">
      <h3>${esc(it.fm.title || "")}</h3>
      <p>${md(it.body)}</p>
    </article>`;
  }).join("\n    ");
}

const TYPE_LABEL = { essay: "Essay", note: "Note", link: "Link" };

function entriesHtml(posts, root, startDelayAt = 0) {
  const delays = ["", " delay-1", " delay-2", " delay-3"];
  return posts.map((p, i) => {
    const type = p.fm.type || "essay";
    const d = delays[(i + startDelayAt) % delays.length];
    const isLink = type === "link";
    const metaParts = [fmtDate(p.fm.date), TYPE_LABEL[type] || "Essay"];
    const href = isLink ? esc(p.fm.link_url || "#") : `${root}journal/${p.slug}/`;
    const more = isLink ? "Visit the linked piece &rarr;"
      : type === "note" ? "Read the note &rarr;"
      : "Read the entry &rarr;";
    return `<a class="entry entry--${type} reveal${d}" href="${href}"${isLink ? ' target="_blank" rel="noopener"' : ""}>
      <p class="entry-date">${metaParts.join(" &middot; ")}</p>
      <h3>${esc(p.fm.title || "")}</h3>
      <p>${esc(p.fm.excerpt || "")}</p>
      <span class="entry-more">${more}</span>
    </a>`;
  }).join("\n    ");
}

function storiesHtml() {
  const delays = ["", " delay-1", " delay-2", " delay-3"];
  return collect(path.join(CONTENT, "testimonials")).map((it, i) => {
    const d = delays[i % delays.length];
    const excerpt = it.fm.excerpt || fallbackExcerpt(it.body);
    const full = md(it.body);
    const open = full
      ? `<button class="story-more" type="button" data-name="${esc(it.fm.name || "")}">Read the full note &rarr;</button>`
      : "";
    const tpl = full ? `<template class="t-full">${full}</template>` : "";
    return `<figure class="story reveal${d}">
      <blockquote>&ldquo;${esc(excerpt)}&rdquo;</blockquote>
      <figcaption>&mdash; ${esc(it.fm.name || "")}</figcaption>
      ${open}
      ${tpl}
    </figure>`;
  }).join("\n    ");
}

function fallbackExcerpt(body) {
  const first = (body || "").split(/\r?\n\r?\n/)[0] || "";
  const text = first.replace(/\*\*/g, "").replace(/\*/g, "");
  return text.length > 160 ? text.slice(0, 157).replace(/\s+\S*$/, "") + "…" : text;
}

/* ── page assembly ───────────────────────────────────────────── */

function replaceTokens(template, map, root) {
  const full = { ...map, FAVICON_LINKS: faviconLinks(root), LOGO: logoHtml(root) };
  return template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (all, key) =>
    full[key] !== undefined ? full[key] : all
  );
}

function subst(template, map) {
  return template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (all, key) =>
    map[key] !== undefined ? map[key] : all
  );
}

function navMap(root, site) {
  const digits = String(site.fm.phone || "").replace(/[^0-9+]/g, "");
  const phoneDisplay = String(site.fm.phone || "")
    .replace(/^(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  return {
    TITLE: site.fm.title,
    EMAIL: site.fm.email,
    PHONE: phoneDisplay,
    PHONE_HREF: digits ? "tel:" + digits : "#",
    LINKEDIN_URL: site.fm.linkedin_url || "#",
    FOOTER_NOTE: site.fm.footer_note,
    YEAR: new Date().getFullYear(),
    ROOT: root,
    BUILD_STAMP: Math.floor(fs.statSync(__filename).mtimeMs),
    FAVICON_LINKS: faviconLinks(root),
    LOGO: logoHtml(root),
  };
}

function write(file, html) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  console.log("wrote", path.relative(ROOT, file));
}

function main() {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

  const site = readMd(path.join(CONTENT, "site.md"));
  const home = readMd(path.join(CONTENT, "home.md"));
  const about = readMd(path.join(CONTENT, "about.md"));
  const approach = readMd(path.join(CONTENT, "approach.md"));
  const engagements = readMd(path.join(CONTENT, "engagements.md"));
  const journalPreview = readMd(path.join(CONTENT, "journal-preview.md"));
  const stories = readMd(path.join(CONTENT, "stories.md"));
  const call = readMd(path.join(CONTENT, "call.md"));

  const posts = collect(path.join(CONTENT, "journal"))
    .map((p) => ({ ...p, _date: String(p.fm.date || "") }))
    .sort((a, b) => b._date.localeCompare(a._date));

  /* ── home page ── */
  const homeTemplate = fs.readFileSync(path.join(SITE, "template.html"), "utf8");
  const homeHtml = subst(homeTemplate, {
    ...navMap("", site),
    KICKER: esc(home.fm.kicker),
    H1: esc(home.fm.h1),
    H1_EM: esc(home.fm.h1_em),
    LEDE: esc(home.fm.lede),
    CTA_PRIMARY: esc(home.fm.cta_primary),
    CTA_SECONDARY: esc(home.fm.cta_secondary),
    PHOTO_CAPTION: esc(home.fm.photo_caption),
    HERO_PHOTO: heroPhoto(""),
    ABOUT_STATION: esc(about.fm.station),
    ABOUT_TITLE: esc(about.fm.title),
    ABOUT_SUB: esc(about.fm.sub),
    ABOUT_BODY: md(about.body),
    ABOUT_PHOTO: aboutPhoto(""),
    PULL_QUOTE: esc(about.fm.pull_quote),
    FACTS_HTML: factsHtml(),
    APPROACH_STATION: esc(approach.fm.station),
    APPROACH_TITLE: esc(approach.fm.title),
    APPROACH_SUB: esc(approach.fm.sub),
    STEPS_HTML: stepsHtml(),
    FORMATS_HTML: formatsHtml(),
    ENGAGEMENTS_STATION: esc(engagements.fm.station),
    ENGAGEMENTS_TITLE: esc(engagements.fm.title),
    ENGAGEMENTS_SUB: esc(engagements.fm.sub),
    ENGAGEMENTS_NOTE: esc(engagements.fm.note),
    ENGAGEMENTS_CTA_PRIMARY: esc(engagements.fm.cta_primary),
    ENGAGEMENTS_CTA_SECONDARY: esc(engagements.fm.cta_secondary),
    JOURNAL_STATION: esc(journalPreview.fm.station),
    JOURNAL_TITLE: esc(journalPreview.fm.title),
    JOURNAL_SUB: esc(journalPreview.fm.sub),
    JOURNAL_MORE: esc(journalPreview.fm.more_label),
    ENTRIES_HTML: entriesHtml(posts.slice(0, 3), ""),
    STORIES_STATION: esc(stories.fm.station),
    STORIES_TITLE: esc(stories.fm.title),
    STORIES_SUB: esc(stories.fm.sub),
    STORIES_HTML: storiesHtml(),
    CALL_STATION: esc(call.fm.station),
    CALL_TITLE: esc(call.fm.title),
    CALL_BODY: esc(call.fm.body),
    CALL_NOTE: esc(call.fm.note),
    CALL_CTA: esc(call.fm.cta_label),
    SCHEDULE_URL: esc(site.fm.schedule_url || "#"),
  });
  write(path.join(OUT, "index.html"), homeHtml);

  /* ── journal index ── */
  const jTemplate = fs.readFileSync(path.join(SITE, "journal-index-template.html"), "utf8");
  write(path.join(OUT, "journal", "index.html"), subst(jTemplate, {
    ...navMap("../", site),
    JOURNAL_STATION: esc(journalPreview.fm.station),
    JOURNAL_TITLE: esc(journalPreview.fm.title),
    JOURNAL_SUB: esc(journalPreview.fm.sub),
    ENTRIES_HTML: entriesHtml(posts, "../"),
  }));

  /* ── individual posts (essay + note; link posts have no local page) ── */
  const pTemplate = fs.readFileSync(path.join(SITE, "post-template.html"), "utf8");
  posts.forEach((p) => {
    const type = p.fm.type || "essay";
    if (type === "link") return;
    const metaParts = [fmtDate(p.fm.date)];
    write(path.join(OUT, "journal", p.slug, "index.html"), subst(pTemplate, {
      ...navMap("../../", site),
      POST_TITLE: esc(p.fm.title),
      POST_META: metaParts.join(" &middot; "),
      POST_EXCERPT: esc(p.fm.excerpt || ""),
      POST_BODY: md(p.body),
    }));
  });

  /* ── static assets ── */
  fs.rmSync(path.join(OUT, "assets"), { recursive: true, force: true }); /* clear stale files */
  fs.mkdirSync(path.join(OUT, "assets"), { recursive: true });
  for (const f of ["style.css", "script.js"]) {
    fs.copyFileSync(path.join(SITE, f), path.join(OUT, f));
  }
  const assetsDir = path.join(SITE, "assets");
  for (const f of fs.readdirSync(assetsDir)) {
    fs.copyFileSync(path.join(assetsDir, f), path.join(OUT, "assets", f));
  }
  console.log("copied style.css, script.js, assets/ → docs/");
  console.log(`\nBuilt ${posts.length} journal post(s). Done.`);
}

main();
