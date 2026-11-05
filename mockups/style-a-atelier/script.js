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
})();
