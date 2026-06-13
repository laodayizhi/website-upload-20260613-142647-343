(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function bindMenu() {
    var button = one('.menu-toggle');
    var menu = one('.mobile-nav');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('is-open');
      button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      button.textContent = isOpen ? '×' : '☰';
    });
  }

  function bindSearchForms() {
    all('.site-search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = one('input[name="q"], input[type="search"]', form);
        if (!input || !input.value.trim()) {
          return;
        }
        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
      });
    });
  }

  function filterCards(input, cards, status) {
    var keyword = normalize(input.value);
    var visible = 0;
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search') || card.textContent);
      var matched = !keyword || text.indexOf(keyword) !== -1;
      card.classList.toggle('is-hidden', !matched);
      if (matched) {
        visible += 1;
      }
    });
    if (status) {
      status.textContent = keyword ? '搜索：' + input.value.trim() + ' · 匹配 ' + visible + ' 部' : '影视片库';
    }
  }

  function bindLocalFilters() {
    all('[data-local-filter]').forEach(function (form) {
      var input = one('input[type="search"]', form);
      if (!input) {
        return;
      }
      var scope = form.closest('main') || document;
      var cards = all('.searchable-card', scope);
      var run = function () {
        filterCards(input, cards, null);
      };
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        run();
      });
      input.addEventListener('input', run);
    });
  }

  function bindSearchPage() {
    var params = new URLSearchParams(window.location.search);
    var keyword = params.get('q') || '';
    var input = one('.search-main-form input[name="q"]');
    var status = one('[data-search-status]');
    var cards = all('[data-search-results] .searchable-card');
    if (!input || !cards.length) {
      return;
    }
    input.value = keyword;
    var run = function () {
      filterCards(input, cards, status);
    };
    input.addEventListener('input', run);
    run();
  }

  function bindHero() {
    var hero = one('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = all('[data-hero-slide]', hero);
    var dots = all('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var current = 0;
    var activate = function (next) {
      current = (next + slides.length) % slides.length;
      slides.forEach(function (slide, index) {
        slide.classList.toggle('is-active', index === current);
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle('is-active', index === current);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        activate(index);
      });
    });
    window.setInterval(function () {
      activate(current + 1);
    }, 5200);
  }

  window.initPagePlayer = function (source) {
    var video = document.getElementById('main-video');
    var button = document.getElementById('player-play');
    if (!video || !button || !source) {
      return;
    }
    var attached = false;
    var hlsInstance = null;
    var attach = function () {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    };
    var start = function () {
      attach();
      button.classList.add('is-hidden');
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
    };
    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        button.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    bindMenu();
    bindSearchForms();
    bindLocalFilters();
    bindSearchPage();
    bindHero();
  });
})();
