/* THE ASCENT — scroll choreography
   1. Reveal sections as they enter the viewport
   2. Move the flag marker along the trail squiggle with scroll progress
   3. Highlight the current way-station on the rail
   4. Gentle parallax drift on contour-line layers
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

  /* ── 2. trail marker travels the squiggle ─────────── */
  const path = document.getElementById("trailPath");
  const marker = document.getElementById("railMarker");
  const railAlt = document.getElementById("railAlt");
  const railBox = document.querySelector(".rail");

  if (path && marker && railBox) {
    const totalLen = path.getTotalLength();
    const BASE_ELEV = 1240; // trailhead altitude (m) — summit at +860 m

    function placeMarker(frac) {
      const pt = path.getPointAtLength(totalLen * frac);
      const railRect = railBox.getBoundingClientRect();
      const pathRect = path.getBoundingClientRect();
      // convert path coords (viewBox 60×800) to viewport px
      const scaleY = pathRect.height / 800;
      const scaleX = pathRect.width / 60;
      marker.style.left = pathRect.left - railRect.left + pt.x * scaleX + "px";
      marker.style.top = pathRect.top - railRect.top + pt.y * scaleY + "px";
      if (railAlt) {
        railAlt.textContent = Math.round(BASE_ELEV + 860 * frac).toLocaleString() + " m";
      }
    }

    /* ── 3. active way-station + progress ───────────── */
    const stations = Array.from(document.querySelectorAll("section[id]"));
    const railLinks = document.querySelectorAll(".rail-labels a");

    function onScroll() {
      const scrollFrac = Math.min(
        1,
        Math.max(
          0,
          (window.scrollY - stations[0].offsetTop) /
            (document.documentElement.scrollHeight - window.innerHeight)
        )
      );
      placeMarker(scrollFrac);

      // highlight nearest way-station
      const mid = window.scrollY + window.innerHeight * 0.4;
      let current = stations[0];
      stations.forEach((s) => { if (s.offsetTop <= mid) current = s; });
      railLinks.forEach((a) => {
        a.classList.toggle("active", a.getAttribute("href") === "#" + current.id);
      });
    }

    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => { onScroll(); ticking = false; });
        ticking = true;
      }
    }, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
  }

  /* ── 4. contour parallax drift ───────────────────── */
  if (!prefersReduced) {
    const drifts = document.querySelectorAll(".drift");
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          drifts.forEach((el, i) => {
            const speed = i % 2 === 0 ? 0.12 : 0.22;
            el.style.transform = `translateY(${y * speed}px)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
})();