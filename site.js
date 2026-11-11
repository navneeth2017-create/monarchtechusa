(() => {
  const page = document.body.dataset.page || "";
  const sprite = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  sprite.setAttribute("aria-hidden", "true");
  sprite.setAttribute("focusable", "false");
  sprite.setAttribute("style", "position:absolute;width:0;height:0;overflow:hidden");
  sprite.innerHTML = `
    <symbol id="i-arrow" viewBox="0 0 20 20"><path d="M3 10h13M11 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></symbol>
    <symbol id="i-check" viewBox="0 0 20 20"><path d="M4 10.5l3.6 3.6L16 5.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
    <symbol id="i-pin" viewBox="0 0 20 20"><path d="M10 18s6-5.1 6-10a6 6 0 1 0-12 0c0 4.9 6 10 6 10Z" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="10" cy="8" r="2.2" fill="none" stroke="currentColor" stroke-width="1.5"/></symbol>
    <symbol id="i-phone" viewBox="0 0 20 20"><path d="M6.1 3.2l2.1 3.2-1.4 1.7c.7 1.6 2.1 3 3.7 3.7l1.7-1.4 3.2 2.1-.5 2.4c-.2.8-.9 1.4-1.7 1.4C8.2 16.3 3.7 11.8 3.7 6.1c0-.8.6-1.5 1.4-1.7l1-.2Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></symbol>
    <symbol id="i-message" viewBox="0 0 20 20"><path d="M3.5 4.5h13v9h-7l-3.5 2.7v-2.7h-2.5v-9Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M6.5 8h7M6.5 10.7h4.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></symbol>
    <symbol id="i-mail" viewBox="0 0 20 20"><rect x="2.8" y="4.5" width="14.4" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M3.5 5.5 10 11l6.5-5.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></symbol>
    <symbol id="i-spark" viewBox="0 0 20 20"><path d="M10 2.5l1.4 4.6 4.6 1.4-4.6 1.4L10 14.5l-1.4-4.6L4 8.5l4.6-1.4L10 2.5Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M15.5 13.5l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z" fill="currentColor"/></symbol>
    <symbol id="i-chart" viewBox="0 0 20 20"><path d="M3.5 16.5v-13M3.5 16.5h13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M6 13l3-4 3 2.2 4.5-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
    <symbol id="i-users" viewBox="0 0 20 20"><circle cx="7.5" cy="6.8" r="2.8" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M2.8 16c.4-3 2.3-4.6 4.7-4.6s4.3 1.6 4.7 4.6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="14" cy="7.5" r="2.1" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M13.5 11.5c2.1 0 3.5 1.4 3.8 3.8" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></symbol>
    <symbol id="i-route" viewBox="0 0 20 20"><circle cx="4.5" cy="14.5" r="2.2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="15.5" cy="5.5" r="2.2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M6.7 14.5h3.1a3 3 0 0 0 3-3V8.7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="2 3"/></symbol>
    <symbol id="i-shield" viewBox="0 0 20 20"><path d="M10 2.8l6 2.3v4.4c0 3.8-2.4 6.6-6 7.7-3.6-1.1-6-3.9-6-7.7V5.1l6-2.3Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M7 10l2 2 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
    <symbol id="i-sliders" viewBox="0 0 20 20"><path d="M3 6h14M3 14h14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="7" cy="6" r="2" fill="currentColor"/><circle cx="13" cy="14" r="2" fill="currentColor"/></symbol>
    <symbol id="i-search" viewBox="0 0 20 20"><circle cx="8.8" cy="8.8" r="5.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M13 13l4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>`;
  document.body.prepend(sprite);

  const nav = [
    ["platform", "Platform", "platform.html"],
    ["custom", "Custom systems", "custom.html"],
    ["process", "Process", "process.html"],
    ["contact", "Contact", "contact.html"],
  ];

  const current = (key) => (key === page ? ' aria-current="page"' : "");
  const navLinks = nav
    .map(([key, label, href]) => `<a href="${href}"${current(key)}>${label}</a>`)
    .join("");

  const header = document.querySelector("[data-site-header]");
  if (header) {
    header.innerHTML = `
      <div class="shell header-inner">
        <a class="brand" href="index.html" aria-label="Monarch home">
          <img src="assets/monarch-mark.svg" alt="" width="34" height="34">
          <span>Monarch</span>
        </a>
        <nav class="site-nav" aria-label="Main">${navLinks}</nav>
        <a class="btn btn-small header-cta" href="contact.html">Request a session</a>
        <button class="menu-button" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-nav">
          <span></span><span></span>
        </button>
      </div>
      <div class="mobile-nav" id="mobile-nav" hidden>
        <nav aria-label="Mobile">
          ${navLinks}
          <a class="btn" href="contact.html">Request a working session</a>
        </nav>
        <p class="mobile-nav-note">Monarch Technologies · Tempe, Arizona</p>
      </div>`;
  }

  const footer = document.querySelector("[data-site-footer]");
  if (footer) {
    footer.innerHTML = `
      <div class="shell footer-main">
        <div class="footer-brand">
          <a class="brand" href="index.html" aria-label="Monarch home">
            <img src="assets/monarch-mark.svg" alt="" width="38" height="38">
            <span>Monarch</span>
          </a>
          <p>Custom CRM, local demand, and multi-channel follow-up for service businesses that run on relationships.</p>
          <a class="footer-email" href="mailto:team@monarchtechusa.com">team@monarchtechusa.com</a>
        </div>
        <div class="footer-cols">
          <div>
            <p class="footer-label">Explore</p>
            ${nav.filter(([key]) => key !== "contact").map(([key, label, href]) => `<a href="${href}"${current(key)}>${label}</a>`).join("")}
          </div>
          <div>
            <p class="footer-label">Start</p>
            <a href="contact.html">Request a working session</a>
            <a href="mailto:team@monarchtechusa.com">Email Monarch</a>
            <a href="proposal.html" target="_blank" rel="noopener">Ozone proposal <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </div>
      <div class="shell footer-base">
        <span>© <span data-year>2026</span> Monarch Technologies</span>
        <span>Tempe, Arizona · Working across the U.S.</span>
        <a href="#top">Back to top ↑</a>
      </div>`;
  }

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  const button = document.querySelector(".menu-button");
  const mobileNav = document.querySelector(".mobile-nav");
  if (button && mobileNav) {
    const setOpen = (open) => {
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      mobileNav.hidden = !open;
      document.documentElement.classList.toggle("nav-open", open);
    };
    button.addEventListener("click", () => setOpen(button.getAttribute("aria-expanded") !== "true"));
    mobileNav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        button.focus();
      }
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 980 && button.getAttribute("aria-expanded") === "true") setOpen(false);
    });
  }

  // --- Motion: scroll reveal + hero entrance (fluid, like our other sites) ---
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
    // Staggered entrance for the hero, right on load.
    const hero = document.querySelector(".hero");
    if (hero) {
      const kids = hero.querySelectorAll(".hero-copy > *, .hero-visual");
      kids.forEach((el, i) => {
        el.classList.add("reveal");
        el.style.animationDelay = i * 85 + "ms";
      });
      requestAnimationFrame(() => requestAnimationFrame(() => kids.forEach((el) => el.classList.add("is-in"))));
    }

    // Reveal section heads and cards as they scroll into view.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );

    const groups = document.querySelectorAll(".section-head, .router-grid, .steps-strip, .cap-grid, .check-grid, .quote-grid, .stats-row");
    groups.forEach((el) => {
      el.classList.add("stagger");
      io.observe(el);
    });
  }
})();
