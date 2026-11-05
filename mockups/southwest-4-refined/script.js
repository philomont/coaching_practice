/* SOUTHWEST 4 — scroll choreography
   1. Reveal sections as they enter the viewport.
   2. The canoe drifts downstream along the river as you scroll.
      - The outer .canoe-wrap receives the scroll-driven `left` value (JS).
      - The inner .canoe-bob carries the CSS bob animation.
      - They never share a transform property.
   3. Foreground scenery drifts gently with parallax.
   4. Honor prefers-reduced-motion.
*/

(function () {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  /* ── 2. canoe steering (no mileage readout) ─────── */
  const canoe = document.getElementById("canoeWrap");

  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const frac = Math.min(1, Math.max(0, window.scrollY / max));

    if (canoe) {
      const vw = window.innerWidth;
      const w = canoe.getBoundingClientRect().width || 134;
      const start = -(w + 30);
      const end = vw + 30;
      const x = start + frac * (end - start); // fully off-screen left → right
      canoe.style.left = x + "px";
    }
  }

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => { onScroll(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  /* ── 3. scenery parallax ─────────────────────────── */
  if (!prefersReduced) {
    const drifts = document.querySelectorAll(".drift, .drift-slow");
    let pTicking = false;
    window.addEventListener("scroll", () => {
      if (!pTicking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          drifts.forEach((el) => {
            const speed = el.classList.contains("drift-slow") ? 0.05 : 0.12;
            el.style.transform = `translateY(${y * speed}px)`;
          });
          pTicking = false;
        });
        pTicking = true;
      }
    }, { passive: true });
  }
})();
