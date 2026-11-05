/* DIRECTION C — CANYON PASSAGE · scroll choreography
   1. Reveal sections as they enter the viewport
   2. The canoe drifts downstream along the river as you scroll,
      bobbing gently (CSS handles the bob; JS steers with `left`,
      which is why the two never collide)
   3. Understated river-mile readout
   4. Canyon-wall silhouettes drift with parallax
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
      const x = -110 + frac * (vw + 110 - 30); // off-screen left → off-screen right
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

  /* ── 4. canyon-wall parallax ─────────────────────── */
  if (!prefersReduced) {
    const drifts = document.querySelectorAll(".drift");
    let pTicking = false;
    window.addEventListener("scroll", () => {
      if (!pTicking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          drifts.forEach((el, i) => {
            const speed = i % 2 === 0 ? 0.08 : 0.16;
            el.style.transform = `translateY(${y * speed}px)`;
          });
          pTicking = false;
        });
        pTicking = true;
      }
    }, { passive: true });
  }
})();