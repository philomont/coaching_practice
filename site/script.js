/* SOUTHWEST 5 — "CLEAN"
   1. Reveal sections on scroll.
   2. Horizontal parallax: faded/background scenery moves slower,
      darker/lower scenery moves faster, as the user scrolls down.
   3. Honors prefers-reduced-motion. */

(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── 1. reveal on scroll ─────────────────────────── */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          revealObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  /* ── 2. horizontal parallax — depth-sorted speeds ─── */
  if (!reduced) {
    const layers = [
      { el: document.querySelector(".mountains-far"),  maxVw: 14 },
      { el: document.querySelector(".mountains-near"), maxVw: 26 },
      { el: document.querySelector(".sand"),           maxVw: 38 },
    ];

    let ticking = false;
    function update() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const t = max > 0 ? (window.scrollY / max) * 2 - 1 : 0; // -1 → +1
      const vw = window.innerWidth;
      layers.forEach((l) => {
        if (l.el) {
          const px = -t * (l.maxVw / 100) * vw;
          l.el.style.transform = "translateX(" + px + "px)";
        }
      });
      ticking = false;
    }
    function onScroll() {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  /* ── 3. testimonial modal ────────────────────────── */
  const modal = document.getElementById("t-modal");
  if (modal) {
    const nameEl = modal.querySelector(".modal-name");
    const bodyEl = modal.querySelector(".modal-body");
    const closeBtn = modal.querySelector(".modal-close");
    const scroller = modal.querySelector(".modal-scroll");
    const rail = modal.querySelector(".scroll-rail");
    const thumb = modal.querySelector(".scroll-thumb");
    let lastFocus = null;

    function updateBar() {
      if (!modal.classList.contains("open")) return;
      const { scrollTop, scrollHeight, clientHeight } = scroller;
      const track = rail.clientHeight;
      const thumbH = Math.max(40, Math.round((clientHeight / scrollHeight) * track));
      const maxScroll = Math.max(1, scrollHeight - clientHeight);
      const top = Math.round((scrollTop / maxScroll) * (track - thumbH));
      const show = scrollHeight > clientHeight + 4;
      rail.style.display = show ? "block" : "none";
      thumb.style.height = thumbH + "px";
      thumb.style.top = top + "px";
    }

    function open(fig) {
      const tpl = fig.querySelector("template.t-full");
      const name = fig.querySelector(".story-more")?.dataset.name
        || (fig.querySelector("figcaption")?.textContent || "").replace(/^[—\\s]+/, "");
      nameEl.textContent = name.trim();
      bodyEl.innerHTML = tpl ? tpl.innerHTML : "";
      lastFocus = document.activeElement;
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      scroller.scrollTop = 0;                 /* always open at the top */
      requestAnimationFrame(updateBar);
      closeBtn.focus();
    }

    function close() {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }

    document.querySelectorAll(".story").forEach((fig) => {
      if (!fig.querySelector(".story-more")) return;
      fig.addEventListener("click", () => open(fig));
      fig.style.cursor = "pointer";
    });

    /* custom rail: drag the thumb; wheel/touch still work natively */
    let dragging = false, dragStartY = 0, dragStartTop = 0;
    thumb.addEventListener("pointerdown", (e) => {
      dragging = true;
      dragStartY = e.clientY;
      dragStartTop = parseFloat(thumb.style.top) || 0;
      thumb.classList.add("is-dragging");
      thumb.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    thumb.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const track = rail.clientHeight - thumb.clientHeight;
      const maxScroll = Math.max(1, scroller.scrollHeight - scroller.clientHeight);
      const top = Math.min(track, Math.max(0, dragStartTop + e.clientY - dragStartY));
      thumb.style.top = top + "px";
      scroller.scrollTop = (top / (track || 1)) * maxScroll;
    });
    const stopDrag = () => { dragging = false; thumb.classList.remove("is-dragging"); };
    thumb.addEventListener("pointerup", stopDrag);
    thumb.addEventListener("pointercancel", stopDrag);

    /* wheel/touch/kbd scrolling moves the thumb too */
    scroller.addEventListener("scroll", updateBar, { passive: true });
    window.addEventListener("resize", updateBar);

    closeBtn.addEventListener("click", close);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) close(); /* backdrop click */
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("open")) close();
    });
  }

  /* ── 4. testimonial carousel — continuous slide ── */
  const storiesTrack = document.getElementById("storiesTrack");
  if (storiesTrack) {
    const cards = Array.from(storiesTrack.children);
    /* every card owns a virtual slot; its x position = (slot - offset) * step.
       Cards teleport around the ends of the virtual strip only while they
       are fully outside the viewport, so movement is always one direction. */
    const pos = new Map();
    cards.forEach((c, i) => {
      pos.set(c, i + Math.floor(Math.random() * 50) * cards.length);
    });

    let offset = 0;             /* continuous position, card units */
    let slotW = 0, stepPx = 0;  /* card width / card width + gap */
    let vis = 3;                /* visible cards at the current width */
    let gap = 32;               /* 2rem */
    let measuredAtWidth = 0;
    let animating = false;

    function visibleCount() {
      if (window.matchMedia("(max-width: 640px)").matches) return 1;
      if (window.matchMedia("(max-width: 960px)").matches) return 2;
      return 3;
    }

    function layout() {
      const w = storiesTrack.clientWidth;
      if (w === measuredAtWidth && slotW) { applyPositions(); return; }
      measuredAtWidth = w;
      vis = visibleCount();
      gap = parseFloat(getComputedStyle(document.documentElement).fontSize) * 2;
      slotW = (w - (vis - 1) * gap) / vis;
      stepPx = slotW + gap;
      /* natural heights, then fix a uniform height across the deck */
      cards.forEach(c => { c.style.width = slotW + "px"; c.style.height = "auto"; });
      let max = 0;
      cards.forEach(c => { max = Math.max(max, c.offsetHeight); });
      cards.forEach(c => { c.style.height = max + "px"; });
      const cs = getComputedStyle(storiesTrack);
      storiesTrack.style.height =
        (max + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)) + "px";
      applyPositions();
    }

    /* wrap virtual slots back around to just outside the current window;
       only ever happens to cards that are fully off-screen */
    function normalize() {
      cards.forEach(c => {
        let p = pos.get(c);
        while (p < offset - 1) p += cards.length;
        while (p > offset + vis) p -= cards.length;
        pos.set(c, p);
      });
      applyPositions();
    }

    function applyPositions() {
      cards.forEach(c => {
        const x = (pos.get(c) - offset) * stepPx;
        c.style.transform = "translateX(" + x + "px)";
      });
    }

    function shift(dir) {
      if (animating) return;
      animating = true;
      storiesTrack.classList.add("is-animating");
      const from = offset, to = offset + dir;

      const done = () => {
        offset = to;
        normalize();
        storiesTrack.classList.remove("is-animating");
        animating = false;
      };

      if (reduced) { done(); return; }

      /* rAF-driven slide: one continuous motion, ease-out cubic */
      const dur = 480, t0 = performance.now();
      const ease = t => 1 - Math.pow(1 - t, 3);
      (function frame(now) {
        const t = Math.min(1, (now - t0) / dur);
        offset = from + (to - from) * ease(t);
        applyPositions();
        if (t < 1) requestAnimationFrame(frame);
        else done();
      })(t0);
    }

    storiesTrack.parentElement.querySelector(".t-prev")
      ?.addEventListener("click", () => shift(-1));
    storiesTrack.parentElement.querySelector(".t-next")
      ?.addEventListener("click", () => shift(1));
    window.matchMedia("(max-width: 960px)").addEventListener?.("change", () => {
      measuredAtWidth = 0; layout(); normalize();
    });
    window.matchMedia("(max-width: 640px)").addEventListener?.("change", () => {
      measuredAtWidth = 0; layout(); normalize();
    });
    window.addEventListener("resize", () => {
      if (storiesTrack.clientWidth !== measuredAtWidth) { layout(); normalize(); }
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { measuredAtWidth = 0; layout(); normalize(); });
    }

    layout();
  }
})();
