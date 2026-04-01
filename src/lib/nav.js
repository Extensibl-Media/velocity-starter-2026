document.addEventListener("astro:page-load", () => {
  // Mobile menu toggle
  const toggle = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("[data-nav-menu]");
  const lines = document.querySelectorAll("[data-hamburger-line]");

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      menu.classList.toggle("hidden");

      // Animate hamburger lines
      if (!isOpen) {
        lines[0]?.classList.add("rotate-45", "translate-y-2");
        lines[1]?.classList.add("opacity-0");
        lines[2]?.classList.add("-rotate-45", "-translate-y-2");
      } else {
        lines[0]?.classList.remove("rotate-45", "translate-y-2");
        lines[1]?.classList.remove("opacity-0");
        lines[2]?.classList.remove("-rotate-45", "-translate-y-2");
      }
    });
  }

  // Mobile dropdown toggles
  document.querySelectorAll("[data-dropdown-trigger]").forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const dropdown = trigger.closest("[data-dropdown]");
      const isOpen = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", String(!isOpen));
      dropdown?.classList.toggle("mobile-open");
    });
  });

  // Mobile nested dropdown toggles
  document.querySelectorAll("[data-nested-trigger]").forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      trigger
        .closest("[data-dropdown-nested]")
        ?.classList.toggle("mobile-open");
    });
  });

  // Close menu on outside click
  document.addEventListener("click", (e) => {
    if (!menu?.contains(e.target) && !toggle?.contains(e.target)) {
      menu?.classList.add("hidden");
      toggle?.setAttribute("aria-expanded", "false");
      lines[0]?.classList.remove("rotate-45", "translate-y-2");
      lines[1]?.classList.remove("opacity-0");
      lines[2]?.classList.remove("-rotate-45", "-translate-y-2");
    }
  });

  // Sticky header shadow on scroll
  const header = document.querySelector("[data-header]");
  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY > 10) {
        header?.classList.add("shadow-md");
      } else {
        header?.classList.remove("shadow-md");
      }
    },
    { passive: true },
  );
});
