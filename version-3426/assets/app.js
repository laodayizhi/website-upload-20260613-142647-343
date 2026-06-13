(function () {
  function query(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function goSearch(term) {
    var keyword = String(term || '').trim();
    if (keyword) {
      window.location.href = './search.html?q=' + encodeURIComponent(keyword);
    }
  }

  function setupSearchForms() {
    query('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        goSearch(input ? input.value : '');
      });
    });
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero-slider]');
    if (!root) {
      return;
    }
    var slides = query('.hero-slide', root);
    var chips = query('[data-hero-chip]', root);
    var previous = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      chips.forEach(function (chip, chipIndex) {
        chip.classList.toggle('is-active', chipIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    chips.forEach(function (chip, chipIndex) {
      chip.addEventListener('click', function () {
        show(chipIndex);
        start();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupPageFilter() {
    var input = document.querySelector('[data-page-filter]');
    if (!input) {
      return;
    }
    var cards = query('.movie-card');
    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.textContent
        ].join(' ').toLowerCase();
        card.style.display = text.indexOf(keyword) >= 0 ? '' : 'none';
      });
    });
  }

  function buildCard(item) {
    var tags = String(item.tags || '').split(',').filter(Boolean).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag.trim()) + '</span>';
    }).join('');
    return '<article class="movie-card">' +
      '<a class="poster-link" href="' + escapeHtml(item.url) + '">' +
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + ' 在线观看" loading="lazy">' +
      '<span class="card-badge">' + escapeHtml(item.type) + '</span>' +
      '<span class="card-score">' + escapeHtml(item.rating) + '</span>' +
      '</a>' +
      '<div class="card-body">' +
      '<div class="card-meta">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + '</div>' +
      '<h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>' +
      '<p>' + escapeHtml(item.oneLine) + '</p>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function setupSearchPage() {
    var box = document.querySelector('[data-search-results]');
    var input = document.querySelector('[data-search-input]');
    if (!box || !input || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render(keyword) {
      var value = String(keyword || '').trim().toLowerCase();
      var list = window.SEARCH_INDEX.filter(function (item) {
        if (!value) {
          return true;
        }
        return [item.title, item.genre, item.region, item.year, item.type, item.tags, item.oneLine].join(' ').toLowerCase().indexOf(value) >= 0;
      }).slice(0, 96);
      if (!list.length) {
        box.innerHTML = '<div class="empty-state">没有找到匹配影片</div>';
        return;
      }
      box.innerHTML = list.map(buildCard).join('');
    }

    var panel = document.querySelector('[data-search-panel]');
    if (panel) {
      panel.addEventListener('submit', function (event) {
        event.preventDefault();
        render(input.value);
        var nextUrl = './search.html?q=' + encodeURIComponent(input.value.trim());
        window.history.replaceState(null, '', nextUrl);
      });
    }
    input.addEventListener('input', function () {
      render(input.value);
    });
    render(initial);
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupSearchForms();
    setupMenu();
    setupHero();
    setupPageFilter();
    setupSearchPage();
  });
})();
