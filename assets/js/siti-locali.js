(function () {
  var header = document.querySelector("[data-header]");
  var hero = document.querySelector(".hero");
  var toggle = document.querySelector("[data-menu-toggle]");
  var nav = document.querySelector("[data-nav]");
  var navIndicator = document.querySelector("[data-nav-indicator]");
  var brandTopLink = document.querySelector('.brand[href="#top"]');

  var clamp = function (value, min, max) {
    return Math.min(Math.max(value, min), max);
  };

  var mixColor = function (from, to, progress) {
    return "rgb(" + from.map(function (channel, index) {
      return Math.round(channel + (to[index] - channel) * progress);
    }).join(", ") + ")";
  };

  var updateHeaderMetrics = function () {
    if (!header) {
      return;
    }

    document.documentElement.style.setProperty(
      "--header-current-height",
      header.getBoundingClientRect().height.toFixed(2) + "px"
    );
  };

  var updateHeroHeader = function () {
    if (!header || !hero) {
      return;
    }

    updateHeaderMetrics();

    var fadeEnd = Math.max(hero.offsetHeight - header.offsetHeight, 1);
    var progress = clamp(window.scrollY / fadeEnd, 0, 1);
    var root = document.documentElement;

    root.style.setProperty("--header-bg-alpha", (0.78 * progress).toFixed(3));
    root.style.setProperty("--header-border-alpha", (0.46 * progress).toFixed(3));
    root.style.setProperty("--header-shadow-alpha", (0.06 * progress).toFixed(3));
    root.style.setProperty("--header-blur", (22 * progress).toFixed(2) + "px");
    root.style.setProperty("--header-saturate", (100 + 50 * progress).toFixed(0) + "%");
    root.style.setProperty("--default-logo-opacity", progress.toFixed(3));
    root.style.setProperty("--hero-logo-opacity", (1 - progress).toFixed(3));
    root.style.setProperty("--brand-suffix-color", mixColor([255, 255, 255], [0, 140, 149], progress));
    root.style.setProperty("--nav-link-color", mixColor([255, 255, 255], [95, 107, 103], progress));
    root.style.setProperty("--nav-link-active-color", mixColor([255, 255, 255], [0, 140, 149], progress));
    root.style.setProperty("--menu-line-color", mixColor([255, 255, 255], [0, 140, 149], progress));
    root.style.setProperty("--nav-cta-bg", mixColor([255, 255, 255], [0, 140, 149], progress).replace("rgb", "rgba").replace(")", ", " + (0.14 + 0.86 * progress).toFixed(3) + ")"));
    root.style.setProperty("--nav-cta-hover-bg", mixColor([255, 255, 255], [0, 112, 120], progress).replace("rgb", "rgba").replace(")", ", " + (0.24 + 0.76 * progress).toFixed(3) + ")"));
    root.style.setProperty("--nav-cta-border", "rgba(255, 255, 255, " + (0.44 * (1 - progress)).toFixed(3) + ")");
    root.style.setProperty("--nav-cta-hover-border", "rgba(255, 255, 255, " + (0.62 * (1 - progress)).toFixed(3) + ")");
    root.style.setProperty("--nav-cta-shadow-color", "rgba(0, 140, 149, " + (0.12 + 0.12 * progress).toFixed(3) + ")");
  };

  if (brandTopLink) {
    brandTopLink.addEventListener("click", function (event) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      history.replaceState(null, "", window.location.pathname + window.location.search);
    });
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.addEventListener("click", function (event) {
      if (event.target.tagName === "A") {
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (nav && navIndicator) {
    var navLinks = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
    var sections = navLinks
      .map(function (link) {
        return document.querySelector(link.getAttribute("href"));
      })
      .filter(Boolean);

    var setActiveLink = function (activeLink) {
      navLinks.forEach(function (link) {
        link.classList.toggle("is-active", link === activeLink);
      });

      if (!activeLink || window.matchMedia("(max-width: 820px)").matches) {
        nav.style.setProperty("--nav-indicator-opacity", "0");
        return;
      }

      var navRect = nav.getBoundingClientRect();
      var linkRect = activeLink.getBoundingClientRect();
      nav.style.setProperty("--nav-indicator-x", (linkRect.left - navRect.left) + "px");
      nav.style.setProperty("--nav-indicator-width", linkRect.width + "px");
      nav.style.setProperty("--nav-indicator-opacity", "1");
    };

    var getCurrentLink = function () {
      var checkpoint = window.innerHeight * 0.32;
      var currentId = "";

      sections.forEach(function (section) {
        if (section.getBoundingClientRect().top <= checkpoint) {
          currentId = section.id;
        }
      });

      return navLinks.find(function (link) {
        return link.getAttribute("href") === "#" + currentId;
      });
    };

    var updateActiveNav = function () {
      setActiveLink(getCurrentLink());
    };

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        setActiveLink(link);
      });
    });

    window.addEventListener("scroll", updateActiveNav, { passive: true });
    window.addEventListener("resize", updateActiveNav);
    window.addEventListener("load", updateActiveNav);
    updateActiveNav();
  }

  if (header && hero) {
    window.addEventListener("scroll", updateHeroHeader, { passive: true });
    window.addEventListener("resize", updateHeroHeader);
    window.addEventListener("load", updateHeroHeader);
    updateHeroHeader();
  } else {
    window.addEventListener("resize", updateHeaderMetrics);
    window.addEventListener("load", updateHeaderMetrics);
    updateHeaderMetrics();
  }

  document.querySelectorAll("details").forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (!item.open) {
        return;
      }

      document.querySelectorAll("details[open]").forEach(function (openItem) {
        if (openItem !== item && openItem.closest(".faq-list")) {
          openItem.open = false;
        }
      });
    });
  });

  var problemSection = document.querySelector("#problema");

  if (problemSection && "IntersectionObserver" in window) {
    var mobileCtaObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
          document.body.classList.add("show-mobile-cta");
        } else {
          document.body.classList.remove("show-mobile-cta");
        }
      });
    }, {
      rootMargin: "-25% 0px -70% 0px",
      threshold: 0
    });

    mobileCtaObserver.observe(problemSection);
  } else {
    window.addEventListener("scroll", function () {
      if (!problemSection) {
        return;
      }

      document.body.classList.toggle(
        "show-mobile-cta",
        problemSection.getBoundingClientRect().top < window.innerHeight * 0.75
      );
    }, { passive: true });
  }
})();
