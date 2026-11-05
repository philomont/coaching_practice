/* THE VOYAGE — scroll choreography
   1. Reveal sections as they enter the viewport
   2. The boat sails across the sea strip as you scroll (signature move),
      turning around near the end to reach the far shore
   3. "Nautical miles logged" readout ties the metaphor together
*/

(function () {
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

  /* ── 2 & 3. boat steering + logbook ───────────────── */
  const boat = document.getElementById("boat");
  const rig = document.getElementById("boatRig");
  const logbook = document.getElementById("logbook");

  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const frac = Math.min(1, Math.max(0, window.scrollY / max));

    if (boat) {
      const vw = window.innerWidth;
      const width = boat.getBoundingClientRect().width || 74;
      const x = -90 + frac * (vw - 20 + 90); // off-screen left → almost off-screen right
      boat.style.left = x + "px";

      // near the end, the boat comes about to face landfall
      if (rig) {
        rig.setAttribute("transform", x > vw - 220 ? "translate(120,0) scale(-1,1)" : "");
      }
    }

    if (logbook) {
      const nm = 42.7 * frac; // one crossing ≈ 42.7 nm
      logbook.textContent = nm.toFixed(1).padStart(5, "0") + " nm logged";
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
})();