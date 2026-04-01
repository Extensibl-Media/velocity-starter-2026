document.addEventListener("astro:page-load", () => {
    (() => {
      const CONFIG = {
        BREAKPOINTS: {
          MOBILE: 1023.5,
        },
        SELECTORS: {
          body: "body",
          navigation: "#cs-navigation",
          hamburger: "#cs-navigation .cs-toggle",
          menuWrapper: "#cs-ul-wrapper",
          dropdownToggle: ".cs-dropdown-toggle",
          dropdown: ".cs-dropdown",
          dropdownMenu: ".cs-drop-ul",
          navButton: ".cs-nav-button",
          darkModeToggle: "#dark-mode-toggle",
        },
        CLASSES: {
          active: "cs-active",
          menuOpen: "cs-open",
        },
      };
  
      const elements = {
        body: document.querySelector(CONFIG.SELECTORS.body),
        navigation: document.querySelector(CONFIG.SELECTORS.navigation),
        hamburger: document.querySelector(CONFIG.SELECTORS.hamburger),
        menuWrapper: document.querySelector(CONFIG.SELECTORS.menuWrapper),
        navButton: document.querySelector(CONFIG.SELECTORS.navButton),
        darkModeToggle: document.querySelector(CONFIG.SELECTORS.darkModeToggle),
      };
  
      const isMobile = () =>
        window.matchMedia(`(max-width: ${CONFIG.BREAKPOINTS.MOBILE}px)`).matches;
  
      const toggleAttribute = (element, attribute, value1 = "true", value2 = "false") => {
        if (!element) return;
        const current = element.getAttribute(attribute);
        element.setAttribute(attribute, current === value1 ? value2 : value1);
      };
  
      const toggleInert = (element) => element && (element.inert = !element.inert);
  
      const dropdownManager = {
        // Close a single dropdown and all its nested children recursively
        close(dropdown, shouldFocus = false) {
            if (!dropdown || !dropdown.classList.contains(CONFIG.CLASSES.active)) return false;
          
            // Also close any open third level dropdowns inside this dropdown
            dropdown.querySelectorAll('.cs-drop3-main.drop3-active').forEach((item) => {
              item.classList.remove('drop3-active');
            });
          
            // rest of existing close logic stays the same
            dropdown.classList.remove(CONFIG.CLASSES.active);
            const button = dropdown.querySelector(`:scope > ${CONFIG.SELECTORS.dropdownToggle}`);
            const menu = dropdown.querySelector(`:scope > ${CONFIG.SELECTORS.dropdownMenu}`);
          
            if (button) {
              button.setAttribute("aria-expanded", "false");
              shouldFocus && button.focus();
            }
          
            if (menu) {
              menu.inert = true;
            }
          
            return true;
          },
  
        // Toggle a single dropdown — closes siblings at the same level
        toggle(element) {
          const isOpening = !element.classList.contains(CONFIG.CLASSES.active);
  
          // Close sibling dropdowns at the same level before opening
          if (isOpening) {
            const parent = element.parentElement;
            if (parent) {
              parent
                .querySelectorAll(`:scope > ${CONFIG.SELECTORS.dropdown}.${CONFIG.CLASSES.active}`)
                .forEach((sibling) => {
                  if (sibling !== element) this.close(sibling, false);
                });
            }
          }
  
          element.classList.toggle(CONFIG.CLASSES.active);
          const button = element.querySelector(`:scope > ${CONFIG.SELECTORS.dropdownToggle}`);
          const menu = element.querySelector(`:scope > ${CONFIG.SELECTORS.dropdownMenu}`);
  
          button && toggleAttribute(button, "aria-expanded");
          menu && toggleInert(menu);
        },
  
        // Close all top-level dropdowns
        closeAll() {
          if (!elements.navigation) return false;
          let closed = false;
  
          elements.navigation
            .querySelectorAll(`:scope .cs-ul > ${CONFIG.SELECTORS.dropdown}.${CONFIG.CLASSES.active}`)
            .forEach((dropdown) => {
              this.close(dropdown, true);
              closed = true;
            });
  
          return closed;
        },
      };
  
      const menuManager = {
        toggle() {
          if (!elements.hamburger || !elements.navigation) return;
  
          const isClosing = elements.navigation.classList.contains(CONFIG.CLASSES.active);
  
          [elements.hamburger, elements.navigation].forEach((el) =>
            el.classList.toggle(CONFIG.CLASSES.active)
          );
          elements.body.classList.toggle(CONFIG.CLASSES.menuOpen);
          toggleAttribute(elements.hamburger, "aria-expanded");
  
          if (elements.menuWrapper && isMobile()) {
            toggleInert(elements.menuWrapper);
          }
  
          isClosing && dropdownManager.closeAll();
        },
      };
  
      const keyboardManager = {
        handleEscape() {
          if (!elements.navigation) return;
  
          const dropdownsClosed = dropdownManager.closeAll();
          if (dropdownsClosed) return;
  
          if (
            elements.hamburger &&
            elements.hamburger.classList.contains(CONFIG.CLASSES.active)
          ) {
            menuManager.toggle();
            elements.hamburger.focus();
          }
        },
      };
  
      const eventManager = {
        handleDropdownClick(event) {
          if (!isMobile()) return;
  
          const button = event.target.closest(CONFIG.SELECTORS.dropdownToggle);
          if (!button) return;
  
          event.preventDefault();
          const dropdown = button.closest(CONFIG.SELECTORS.dropdown);
          if (dropdown) {
            dropdownManager.toggle(dropdown);
          }
        },
  
        handleDropdownKeydown(event) {
          if (event.key !== "Enter" && event.key !== " ") return;
  
          const button = event.target.closest(CONFIG.SELECTORS.dropdownToggle);
          if (!button) return;
  
          event.preventDefault();
          const dropdown = button.closest(CONFIG.SELECTORS.dropdown);
          if (dropdown) {
            dropdownManager.toggle(dropdown);
          }
        },
  
        handleFocusOut(event) {
          setTimeout(() => {
            if (!event.relatedTarget) return;
  
            const dropdown = event.target.closest(CONFIG.SELECTORS.dropdown);
            if (
              dropdown?.classList.contains(CONFIG.CLASSES.active) &&
              !dropdown.contains(event.relatedTarget)
            ) {
              dropdownManager.close(dropdown);
            }
          }, 10);
        },
  
        handleMobileFocus(event) {
          if (
            !isMobile() ||
            !elements.navigation.classList.contains(CONFIG.CLASSES.active)
          )
            return;
          if (
            elements.menuWrapper.contains(event.target) ||
            elements.hamburger.contains(event.target)
          )
            return;
  
          menuManager.toggle();
        },
  
        handleDropdownHover(event) {
          if (isMobile()) return;
  
          const dropdown = event.target.closest(CONFIG.SELECTORS.dropdown);
          if (!dropdown) return;
  
          const menu = dropdown.querySelector(`:scope > ${CONFIG.SELECTORS.dropdownMenu}`);
          if (!menu) return;
  
          if (event.type === "mouseenter") {
            menu.inert = false;
          } else if (event.type === "mouseleave") {
            setTimeout(() => {
              if (!dropdown.matches(":hover")) {
                menu.inert = true;
                // Also close nested dropdowns when parent loses hover
                dropdown
                  .querySelectorAll(`${CONFIG.SELECTORS.dropdown}.${CONFIG.CLASSES.active}`)
                  .forEach((child) => dropdownManager.close(child, false));
              }
            }, 1);
          }
        },
      };
  
      const init = {
        inertState() {
          if (!elements.menuWrapper) return;
  
          elements.menuWrapper.inert = isMobile();
  
          if (elements.navigation) {
            const dropdownMenus = elements.navigation.querySelectorAll(
              CONFIG.SELECTORS.dropdownMenu
            );
            dropdownMenus.forEach((dropdown) => {
              dropdown.inert = true;
            });
          }
        },
  
        eventListeners() {
          if (!elements.hamburger || !elements.navigation) return;
  
          elements.hamburger.addEventListener("click", menuManager.toggle.bind(menuManager));
          elements.navigation.addEventListener("click", (e) => {
            if (
              e.target === elements.navigation &&
              elements.navigation.classList.contains(CONFIG.CLASSES.active)
            ) {
              menuManager.toggle();
            }
          });
  
          elements.navigation.addEventListener("click", eventManager.handleDropdownClick);
          elements.navigation.addEventListener("keydown", eventManager.handleDropdownKeydown);
          elements.navigation.addEventListener("focusout", eventManager.handleFocusOut);
  
          elements.navigation.addEventListener(
            "mouseenter",
            eventManager.handleDropdownHover,
            true
          );
          elements.navigation.addEventListener(
            "mouseleave",
            eventManager.handleDropdownHover,
            true
          );
  
          document.addEventListener(
            "keydown",
            (e) => e.key === "Escape" && keyboardManager.handleEscape()
          );
          document.addEventListener("focusin", eventManager.handleMobileFocus);
  
          window.addEventListener("resize", () => {
            this.inertState();
            if (
              !isMobile() &&
              elements.navigation.classList.contains(CONFIG.CLASSES.active)
            ) {
              menuManager.toggle();
            }
          });

          elements.navigation.addEventListener('click', (e) => {
            const drop3Main = e.target.closest('.cs-drop3-main');
            if (!drop3Main) return;
            if (!isMobile()) return;
            
            e.stopPropagation();
            drop3Main.classList.toggle('drop3-active');
          });
        },
      };
  
      // Dark mode scroll behavior
      const initScroll = () => {
        window.addEventListener("scroll", () => {
          if (window.scrollY > 100) {
            document.body.classList.add("scroll");
          } else {
            document.body.classList.remove("scroll");
          }
        }, { passive: true });
      };
  
      init.inertState();
      init.eventListeners();
      initScroll();
    })();
  });