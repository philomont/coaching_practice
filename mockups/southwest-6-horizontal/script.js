/* SOUTHWEST 6 — "HORIZONTAL"
   Vertical wheel/trackpad scroll drives the horizontal translateX of a
   sticky full-viewport track. Distant strata + two rock silhouettes
   slide past at different parallax speeds. On narrow screens it falls
   back to a normal vertical stack (handled here + in CSS). */

(function () {
  const space = document.getElementById("scrollSpace");
  const viewport = document.getElementById("viewport");
  const track = document.getElementById("track");
  const parallax = document.querySelectorAll(".parallax");
  const progressBar = document.getElementById("progressBar");
  const dots = document.querySelectorAll(".dot");
  const waypoints = document.querySelectorAll(".waypoint");

  const desktopMQ = window.matchMedia("(min-width: 960px)");
  const reducedMQ = window.matchMedia("(prefers-reduced-motion: reduce)");

  const isDesktop = () => desktopMQ.matches;
  const reduced = () => reducedMQ.matches;

  let travel = 0;
  let spaceH = 0;

  /* reveal-on-scroll: observe waypoints as they slide into view */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          revealObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  waypoints.forEach((el) => {
    el.classList.add("reveal");
    revealObserver.observe(el);
  });

  function measure() {
    if (!isDesktop()) {
      space.style.height = "auto";
      track.style.transform = "none";
      parallax.forEach((p) => { p.style.transform = "none"; p.style.width = "100vw"; });
      return;
    }
    const vw = window.innerWidth;
    const trackW = track.scrollWidth;
    travel = Math.max(0, trackW - vw);
    spaceH = travel + window.innerHeight;
    space.style.height = spaceH + "px";
    // widen each tiled layer so it covers the viewport across the full travel
    parallax.forEach((p) => { p.style.width = (vw + travel) + "px"; });
  }

  function render() {
    if (!isDesktop()) return;
    const max = spaceH - window.innerHeight;
    const frac = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    const shift = frac * travel;

    track.style.transform = "translateX(" + (-shift) + "px)";
    parallax.forEach((p) => {
      const s = reduced() ? 0 : parseFloat(p.dataset.speed || "0");
      p.style.transform = "translateX(" + (-shift * s) + "px)";
    });

    if (progressBar) progressBar.style.width = (frac * 100) + "%";
    updateActive(frac);
  }

  function updateActive(frac) {
    const vw = window.innerWidth;
    const centerX = frac * travel + vw / 2;
    let best = null;
    let bestDist = Infinity;
    waypoints.forEach((wp) => {
      const left = wp.offsetLeft;
      const w = wp.offsetWidth;
      const c = left + w / 2;
      const d = Math.abs(c - centerX);
      if (d < bestDist) { bestDist = d; best = wp.id; }
    });
    document.querySelectorAll(".topnav nav a[data-goto]").forEach((a) => {
      a.classList.toggle("active", a.getAttribute("data-goto") === best);
    });
    dots.forEach((d) => {
      d.classList.toggle("active", d.getAttribute("data-dot") === best);
    });
  }

  function goTo(id) {
    const el = document.getElementById(id);
    if (!el) return;
    if (!isDesktop()) {
      el.scrollIntoView({ behavior: reduced() ? "auto" : "smooth" });
      return;
    }
    const x = Math.max(0, el.offsetLeft - 40);
    const frac = travel > 0 ? Math.min(1, x / travel) : 0;
    const targetY = frac * (spaceH - window.innerHeight);
    window.scrollTo({ top: targetY, behavior: reduced() ? "auto" : "smooth" });
  }

  /* nav links drive the traverse on desktop; native anchors on mobile */
  document.querySelectorAll("a[data-goto]").forEach((a) => {
    a.addEventListener("click", (e) => {
      if (!isDesktop()) return; // let the browser's anchor jump handle mobile
      e.preventDefault();
      goTo(a.getAttribute("data-goto"));
    });
  });
  dots.forEach((d) => {
    d.addEventListener("click", () => goTo(d.getAttribute("data-dot")));
  });

  /* scroll + resize choreography */
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => { render(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener("resize", () => {
    measure();
    render();
  });

  measure();
  render();
})();
