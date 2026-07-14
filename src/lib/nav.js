document.addEventListener("astro:page-load", () => {
  // Wire EACH header's mobile toggle to its OWN menu, so multiple headers on a
  // page (e.g. the chrome preview) don't collide. Scope is relative to the
  // toggle's own header, not a global id lookup.
  document.querySelectorAll("[data-nav-toggle]").forEach((toggle) => {
    if (toggle.dataset.navWired) return; // avoid double-binding across page-loads
    toggle.dataset.navWired = "1";

    const scope = toggle.closest("[data-header]") || toggle.closest("header");
    const menu = (scope || document).querySelector("[data-nav-menu]");
    const lines = toggle.querySelectorAll("[data-hamburger-line]");
    if (!menu) return;

    const setLines = (open) => {
      lines[0]?.classList.toggle("rotate-45", open);
      lines[0]?.classList.toggle("translate-y-2", open);
      lines[1]?.classList.toggle("opacity-0", open);
      lines[2]?.classList.toggle("-rotate-45", open);
      lines[2]?.classList.toggle("-translate-y-2", open);
    };

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      menu.classList.toggle("hidden");
      setLines(!isOpen);
    });

    // Close this menu when clicking outside of it (and its toggle).
    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.classList.add("hidden");
        toggle.setAttribute("aria-expanded", "false");
        setLines(false);
      }
    });
  });

  // Mobile dropdown toggles (already scoped via closest()).
  document.querySelectorAll("[data-dropdown-trigger]").forEach((trigger) => {
    if (trigger.dataset.navWired) return;
    trigger.dataset.navWired = "1";
    trigger.addEventListener("click", (e) => {
      // Desktop opens dropdowns on hover and lets <a> parents navigate; only
      // intercept on mobile, where tapping a parent expands/collapses it.
      if (window.innerWidth >= 1024) return;
      if (trigger.tagName === "A") e.preventDefault();
      e.stopPropagation();
      const dropdown = trigger.closest("[data-dropdown]");
      const isOpen = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", String(!isOpen));
      dropdown?.classList.toggle("mobile-open");
    });
  });

  // Mobile nested dropdown toggles.
  document.querySelectorAll("[data-nested-trigger]").forEach((trigger) => {
    if (trigger.dataset.navWired) return;
    trigger.dataset.navWired = "1";
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      trigger.closest("[data-dropdown-nested]")?.classList.toggle("mobile-open");
    });
  });

  // Sticky header shadow on scroll — applies to every header on the page.
  const headers = document.querySelectorAll("[data-header]");
  if (headers.length) {
    window.addEventListener(
      "scroll",
      () => {
        const scrolled = window.scrollY > 10;
        headers.forEach((h) => h.classList.toggle("shadow-md", scrolled));
      },
      { passive: true },
    );
  }
});
