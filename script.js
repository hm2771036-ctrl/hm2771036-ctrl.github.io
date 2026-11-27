window.addEventListener("load", function () {
  // 1. Menu Button, Close Button, Escape Key & Outside Click
  var menu = document.getElementById("sideMenu");
  var menuBtn = document.getElementById("menuBtn");
  var closeBtn = document.getElementById("closeBtn");

  function openMenu() {
    if (!menu) return;
    menu.classList.add("open");
    menu.setAttribute("aria-hidden", "false");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    if (!menu) return;
    menu.classList.remove("open");
    menu.setAttribute("aria-hidden", "true");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
  }

  if (menuBtn) {
    menuBtn.onclick = function (e) {
      e.stopPropagation();
      openMenu();
    };
  }

  if (closeBtn) {
    closeBtn.onclick = closeMenu;
  }

  document.addEventListener("click", function (e) {
    if (menu && menu.classList.contains("open")) {
      if (!menu.contains(e.target) && e.target !== menuBtn) {
        closeMenu();
      }
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu && menu.classList.contains("open")) {
      closeMenu();
    }
  });

  // 2. Nigeria (NGN) vs International (USD) Price Switcher
  var currButtons = document.querySelectorAll(".curr-btn");
  var priceCells = document.querySelectorAll(".price-cell");

  currButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      currButtons.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");

      var region = btn.getAttribute("data-region");
      priceCells.forEach(function (cell) {
        cell.textContent = cell.getAttribute("data-" + region);
      });
    });
  });

  // 3. Scroll Up & Scroll Down Buttons
  var scrollTopBtn = document.getElementById("scrollTopBtn");
  var scrollDownBtn = document.getElementById("scrollDownBtn");

  function checkScroll() {
    var scrollPos = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    var pageHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    var windowHeight = window.innerHeight || document.documentElement.clientHeight;

    if (scrollTopBtn) {
      if (scrollPos > 200) {
        scrollTopBtn.classList.add("show");
      } else {
        scrollTopBtn.classList.remove("show");
      }
    }

    if (scrollDownBtn) {
      if (scrollPos + windowHeight >= pageHeight - 50) {
        scrollDownBtn.classList.add("hide");
      } else {
        scrollDownBtn.classList.remove("hide");
      }
    }
  }

  window.onscroll = checkScroll;
  checkScroll();

  if (scrollTopBtn) {
    scrollTopBtn.onclick = function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
  }

  if (scrollDownBtn) {
    scrollDownBtn.onclick = function () {
      var bottom = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      window.scrollTo({ top: bottom, behavior: "smooth" });
    };
  }

  // 4. Smooth Scroll-Reveal Animations for Sections & Cards
  var revealItems = document.querySelectorAll("section, .card, .pkg-card, .table-wrap, form");

  revealItems.forEach(function (el) {
    el.classList.add("reveal");
  });

  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });

    revealItems.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealItems.forEach(function (el) {
      el.classList.add("active");
    });
  }
});
