/* Shahriyar Zaman Ridoy — portfolio scripts (no dependencies) */
(function () {
  "use strict";

  /* ------------------------------------------------------------ mobile nav */
  var navToggle = document.querySelector(".nav-toggle");
  var navLinks = document.querySelector(".nav__links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ------------------------------------------- on-this-page rail (home) */
  var tocHost = document.querySelector("[data-toc]");
  if (tocHost) {
    var heads = Array.prototype.slice.call(tocHost.querySelectorAll("h2[id]"));
    if (heads.length > 1) {
      var rail = document.createElement("nav");
      rail.className = "toc";
      rail.setAttribute("aria-label", "On this page");
      var title = document.createElement("div");
      title.className = "toc__title";
      title.textContent = "Page Contents";
      rail.appendChild(title);
      var railLinks = heads.map(function (h) {
        var a = document.createElement("a");
        a.href = "#" + h.id;
        var glyph = h.getAttribute("data-toc-icon");
        if (glyph) {
          var icon = document.createElement("span");
          icon.className = "toc__icon";
          icon.setAttribute("aria-hidden", "true");
          icon.textContent = glyph;
          a.appendChild(icon);
        }
        var label = document.createElement("span");
        label.className = "toc__label";
        label.textContent = h.getAttribute("data-toc-label") || h.textContent.trim();
        a.appendChild(label);
        rail.appendChild(a);
        return a;
      });
      document.body.appendChild(rail);

      var updateRail = function () {
        var y = window.scrollY + window.innerHeight * 0.3;
        var current = 0;
        heads.forEach(function (h, i) {
          if (h.getBoundingClientRect().top + window.scrollY <= y) current = i;
        });
        railLinks.forEach(function (a, i) {
          a.classList.toggle("active", i === current);
        });
      };
      window.addEventListener("scroll", updateRail, { passive: true });
      window.addEventListener("resize", updateRail);
      updateRail();
    }
  }

  /* ---------------------------------------------- publication panel toggles */
  document.querySelectorAll("[data-panel]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = document.getElementById(btn.getAttribute("data-panel"));
      if (!target) return;
      var willOpen = target.hidden;
      // close sibling panels within the same publication
      var pub = btn.closest(".pub");
      if (pub) {
        pub.querySelectorAll(".pub__panel").forEach(function (p) {
          p.hidden = true;
        });
        pub.querySelectorAll("[data-panel]").forEach(function (b) {
          b.setAttribute("aria-expanded", "false");
        });
      }
      target.hidden = !willOpen;
      btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
    });
  });

  /* ------------------------------------------------- more authors expand */
  document.querySelectorAll("[data-more-authors]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var span = btn.previousElementSibling;
      if (span && span.classList.contains("pub__more")) {
        span.hidden = false;
        btn.remove();
      }
    });
  });

  /* ---------------------------------------------------- publication filter */
  var filter = document.querySelector(".pub-filter");
  if (filter) {
    var pubs = Array.prototype.slice.call(document.querySelectorAll(".pub"));
    var groups = Array.prototype.slice.call(document.querySelectorAll("[data-year-group]"));
    var empty = document.querySelector(".pub-empty");
    filter.addEventListener("input", function () {
      var q = filter.value.trim().toLowerCase();
      var shown = 0;
      pubs.forEach(function (pub) {
        var hit = !q || pub.textContent.toLowerCase().indexOf(q) !== -1;
        pub.hidden = !hit;
        if (hit) shown++;
      });
      groups.forEach(function (g) {
        var any = g.querySelector(".pub:not([hidden])");
        g.hidden = !any;
      });
      if (empty) empty.hidden = shown > 0;
    });
  }

  /* -------------------------------------------------- CV table of contents */
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll(".cv-toc a"));
  if (tocLinks.length && "IntersectionObserver" in window) {
    var sections = tocLinks
      .map(function (a) {
        return document.querySelector(a.getAttribute("href"));
      })
      .filter(Boolean);
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            tocLinks.forEach(function (a) {
              a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id);
            });
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    sections.forEach(function (s) {
      observer.observe(s);
    });
  }

  /* --------------------------------------------------------- back to top */
  var toTop = document.querySelector(".to-top");
  if (toTop) {
    window.addEventListener(
      "scroll",
      function () {
        toTop.classList.toggle("is-visible", window.scrollY > 600);
      },
      { passive: true }
    );
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* -------------------------------------------------- footer current year */
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
