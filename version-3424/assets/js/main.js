(function () {
  const mobileToggle = document.querySelector(".mobile-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
    const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
    const dots = Array.from(carousel.querySelectorAll(".hero-dot"));
    const prev = carousel.querySelector(".hero-prev");
    const next = carousel.querySelector(".hero-next");
    let activeIndex = 0;
    let timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === activeIndex);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-slide")) || 0);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(activeIndex - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(activeIndex + 1);
        startTimer();
      });
    }

    carousel.addEventListener("mouseenter", stopTimer);
    carousel.addEventListener("mouseleave", startTimer);
    showSlide(0);
    startTimer();
  });

  document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
    const keywordInput = panel.querySelector("[data-filter-keyword]");
    const yearSelect = panel.querySelector("[data-filter-year]");
    const typeSelect = panel.querySelector("[data-filter-type]");
    const regionSelect = panel.querySelector("[data-filter-region]");
    const list = panel.parentElement.querySelector(".filter-list");
    const emptyState = panel.parentElement.querySelector("[data-empty-state]");
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";

    if (keywordInput && query) {
      keywordInput.value = query;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
      if (!list) {
        return;
      }
      const keyword = normalize(keywordInput ? keywordInput.value : "");
      const year = normalize(yearSelect ? yearSelect.value : "");
      const type = normalize(typeSelect ? typeSelect.value : "");
      const region = normalize(regionSelect ? regionSelect.value : "");
      let visibleCount = 0;

      list.querySelectorAll(".movie-card").forEach(function (card) {
        const haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type")
        ].join(" "));
        const matchedKeyword = !keyword || haystack.includes(keyword);
        const matchedYear = !year || normalize(card.getAttribute("data-year")) === year;
        const matchedType = !type || normalize(card.getAttribute("data-type")) === type;
        const matchedRegion = !region || normalize(card.getAttribute("data-region")) === region;
        const matched = matchedKeyword && matchedYear && matchedType && matchedRegion;
        card.hidden = !matched;
        if (matched) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visibleCount !== 0;
      }
    }

    [keywordInput, yearSelect, typeSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  });

  document.querySelectorAll("[data-player]").forEach(function (player) {
    const video = player.querySelector("video");
    const trigger = player.querySelector(".play-mask");
    let loaded = false;
    let hlsInstance = null;

    function loadVideo() {
      if (!video || loaded) {
        return;
      }
      const stream = video.getAttribute("data-stream");
      if (!stream) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
      loaded = true;
    }

    function playVideo() {
      loadVideo();
      if (trigger) {
        trigger.hidden = true;
      }
      if (video) {
        video.controls = true;
        const playTask = video.play();
        if (playTask && typeof playTask.catch === "function") {
          playTask.catch(function () {});
        }
      }
    }

    if (trigger) {
      trigger.addEventListener("click", playVideo);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener("play", function () {
        if (trigger) {
          trigger.hidden = true;
        }
      });
      video.addEventListener("emptied", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
        loaded = false;
      });
    }
  });
})();
