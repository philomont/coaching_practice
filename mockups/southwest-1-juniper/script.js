/* SOUTHWEST VARIANTS · scroll choreography (shared by all three mock-ups)
   1. Reveal sections as they enter the viewport
   2. The canoe drifts downstream along the river as you scroll
      (CSS owns the bob via the inner <g>; JS steers with `left`, so
      the two transforms never collide)
   3. Understated river-mile readout
   4. Foreground scenery drifts with parallax
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

  /* ── 2 & 3. canoe steering + mileage ──────────────── */
  const canoe = document.getElementById("canoe");
  const mileage = document.getElementById("mileage");

  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const frac = Math.min(1, Math.max(0, window.scrollY / max));

    if (canoe) {
      const vw = window.innerWidth;
      const w = canoe.getBoundingClientRect().width || 110;
      const x = -(w + 10) + frac * (vw + 10); // fully off-screen left → right
      canoe.style.left = x + "px";
    }
    if (mileage) {
      const miles = 226 * frac; // one full run down the canyon ≈ 226 river miles
      mileage.textContent = "river mile " + miles.toFixed(1);
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

  /* ── 4. scenery parallax ─────────────────────────── */
  if (!prefersReduced) {
    const drifts = document.querySelectorAll(".drift");
    let pTicking = false;
    window.addEventListener("scroll", () => {
      if (!pTicking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          drifts.forEach((el, i) => {
            const speed = el.classList.contains("drift-slow") ? 0.06 : 0.14;
            el.style.transform = `translateY(${y * speed}px)`;
          });
          pTicking = false;
        });
        pTicking = true;
      }
    }, { passive: true });
  }
})();