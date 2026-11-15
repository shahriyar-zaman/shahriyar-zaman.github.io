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

  /* ---------------------------------------------------------- theme toggle */
  var root = document.documentElement;
  var currentTheme = function () {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  };
  var themeButtons = Array.prototype.slice.call(document.querySelectorAll("[data-theme-toggle]"));
  var syncThemeButtons = function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    var label = "Switch to " + next + " theme";
    themeButtons.forEach(function (btn) {
      btn.setAttribute("aria-label", label);
      btn.setAttribute("title", label);
    });
  };
  themeButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {}
      syncThemeButtons();
    });
  });
  syncThemeButtons();

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

  /* ------------------------------------------- publications: group + filter */
  var pubHost = document.querySelector("[data-pub-groups]");
  if (pubHost) {
    var TYPES = [
      { key: "conference", label: "Conference Papers" },
      { key: "journal", label: "Journal Articles" },
      { key: "workshop", label: "Workshop Papers" },
      { key: "review", label: "Under Review" }
    ];
    var allPubs = Array.prototype.slice.call(pubHost.querySelectorAll(".pub"));
    allPubs.forEach(function (pub, i) {
      pub.setAttribute("data-order", i);
    });
    var search = document.querySelector(".pub-filter");
    var typeBtns = Array.prototype.slice.call(document.querySelectorAll("[data-type-filter]"));
    var leadBtn = document.querySelector("[data-lead-filter]");
    var groupBtns = Array.prototype.slice.call(document.querySelectorAll("[data-group-by]"));
    var countLine = document.querySelector("[data-pub-count]");
    var emptyMsg = document.querySelector(".pub-empty");
    var state = { type: "all", lead: false, group: "type", q: "" };
    try {
      var savedGroup = localStorage.getItem("pubGroup");
      if (savedGroup === "type" || savedGroup === "year") state.group = savedGroup;
    } catch (e) {}

    var countOf = function (fn) {
      return allPubs.filter(fn).length;
    };
    typeBtns.forEach(function (btn) {
      var key = btn.getAttribute("data-type-filter");
      var n = countOf(function (p) {
        return key === "all" || p.getAttribute("data-type") === key;
      });
      var slot = btn.querySelector(".pub-chip__n");
      if (slot) slot.textContent = n;
      if (!n && key !== "all") btn.hidden = true;
    });
    if (leadBtn) {
      var leadSlot = leadBtn.querySelector(".pub-chip__n");
      if (leadSlot)
        leadSlot.textContent = countOf(function (p) {
          return p.hasAttribute("data-lead");
        });
    }

    var byOrder = function (a, b) {
      return a.getAttribute("data-order") - b.getAttribute("data-order");
    };

    var apply = function () {
      var shown = 0;
      allPubs.forEach(function (p) {
        var hit =
          (state.type === "all" || p.getAttribute("data-type") === state.type) &&
          (!state.lead || p.hasAttribute("data-lead")) &&
          (!state.q || p.textContent.toLowerCase().indexOf(state.q) !== -1);
        p.hidden = !hit;
        if (hit) shown++;
      });
      Array.prototype.forEach.call(pubHost.querySelectorAll("[data-year-group]"), function (g) {
        var visible = g.querySelectorAll(".pub:not([hidden])").length;
        g.hidden = !visible;
        var n = g.querySelector(".pub-year__n");
        if (n) n.textContent = visible;
      });
      typeBtns.forEach(function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-type-filter") === state.type ? "true" : "false");
      });
      if (leadBtn) leadBtn.setAttribute("aria-pressed", state.lead ? "true" : "false");
      if (countLine) {
        countLine.textContent =
          shown === allPubs.length
            ? allPubs.length + " publications"
            : "Showing " + shown + " of " + allPubs.length + " publications";
      }
      if (emptyMsg) emptyMsg.hidden = shown > 0;
    };

    var build = function () {
      var groups = [];
      if (state.group === "type") {
        TYPES.forEach(function (t) {
          groups.push({
            label: t.label,
            items: allPubs.filter(function (p) {
              return p.getAttribute("data-type") === t.key;
            })
          });
        });
      } else {
        var years = [];
        allPubs.forEach(function (p) {
          var y = p.getAttribute("data-pub-year");
          if (years.indexOf(y) === -1) years.push(y);
        });
        years.sort(function (a, b) {
          return b - a;
        });
        years.forEach(function (y) {
          groups.push({
            label: y,
            items: allPubs.filter(function (p) {
              return p.getAttribute("data-pub-year") === y;
            })
          });
        });
      }
      pubHost.innerHTML = "";
      groups.forEach(function (g) {
        if (!g.items.length) return;
        var section = document.createElement("section");
        section.setAttribute("data-year-group", "");
        var h = document.createElement("h2");
        h.className = "pub-year";
        h.appendChild(document.createTextNode(g.label));
        var n = document.createElement("span");
        n.className = "pub-year__n";
        h.appendChild(n);
        var ul = document.createElement("ul");
        ul.className = "pub-list";
        g.items.sort(byOrder).forEach(function (p) {
          ul.appendChild(p);
        });
        section.appendChild(h);
        section.appendChild(ul);
        pubHost.appendChild(section);
      });
      groupBtns.forEach(function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-group-by") === state.group ? "true" : "false");
      });
      apply();
    };

    typeBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        state.type = b.getAttribute("data-type-filter");
        apply();
      });
    });
    if (leadBtn)
      leadBtn.addEventListener("click", function () {
        state.lead = !state.lead;
        apply();
      });
    groupBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        state.group = b.getAttribute("data-group-by");
        try {
          localStorage.setItem("pubGroup", state.group);
        } catch (e) {}
        build();
      });
    });
    if (search)
      search.addEventListener("input", function () {
        state.q = search.value.trim().toLowerCase();
        apply();
      });

    Array.prototype.forEach.call(document.querySelectorAll("[data-pub-controls]"), function (el) {
      el.hidden = false;
    });
    build();
    if (location.hash) {
      var target = document.getElementById(location.hash.slice(1));
      if (target && target.classList.contains("pub")) target.scrollIntoView();
    }
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

  /* ------------------------------------------- home news: scroll viewport */
  document.querySelectorAll("[data-news-scroll]").forEach(function (box) {
    var list = box.querySelector(".news-list");
    var items = box.querySelectorAll(".news-item");
    var visible = parseInt(box.getAttribute("data-news-visible"), 10) || 5;
    var hint = box.parentNode.querySelector("[data-news-hint]");

    if (!list || items.length <= visible) {
      box.classList.add("is-static");
      box.removeAttribute("tabindex");
      box.removeAttribute("role");
      box.removeAttribute("aria-label");
      return;
    }

    if (hint) {
      var earlier = items.length - visible;
      hint.innerHTML =
        '<svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg>' +
        "<span>Scroll for " + earlier + " earlier update" + (earlier === 1 ? "" : "s") + "</span>";
      hint.hidden = false;
    }

    // Height of the first N entries, plus a faded peek of the next one so it's
    // clear the list continues.
    var fit = function () {
      var peek = parseFloat(getComputedStyle(box).fontSize) * 2.5;
      var height = items[visible].offsetTop - items[0].offsetTop + peek;
      box.style.maxHeight = Math.ceil(height) + "px";
      sync();
    };

    var sync = function () {
      var end = box.scrollHeight - box.clientHeight;
      var atEnd = box.scrollTop >= end - 2;
      box.classList.toggle("is-scrollable", end > 2);
      box.classList.toggle("is-scrolled", box.scrollTop > 2);
      box.classList.toggle("is-at-end", atEnd);
      if (hint) hint.classList.toggle("is-done", atEnd);
    };

    box.addEventListener("scroll", sync, { passive: true });
    if ("ResizeObserver" in window) {
      new ResizeObserver(fit).observe(list);
    } else {
      window.addEventListener("resize", fit);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    fit();
  });

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
