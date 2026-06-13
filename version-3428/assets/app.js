(function () {
    var header = document.querySelector('[data-header]');
    var menu = document.querySelector('[data-menu]');
    var toggle = document.querySelector('[data-menu-toggle]');

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 32) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var active = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        setInterval(function () {
            showSlide(active + 1);
        }, 5600);
    }

    var searchInput = document.querySelector('[data-search-input]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var filterWrap = document.querySelector('[data-category-filter]');
    var scope = document.querySelector('[data-search-scope]');
    var empty = document.querySelector('[data-empty]');
    var category = '';

    function getQueryFromUrl() {
        try {
            var params = new URLSearchParams(window.location.search);
            return params.get('q') || '';
        } catch (error) {
            return '';
        }
    }

    if (searchInput && !searchInput.value) {
        searchInput.value = getQueryFromUrl();
    }

    function applyFilters() {
        if (!scope) {
            return;
        }
        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var year = yearFilter ? yearFilter.value : '';
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
        var visible = 0;

        cards.forEach(function (card) {
            var text = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-tags') || '',
                card.textContent || ''
            ].join(' ').toLowerCase();
            var cardYear = card.getAttribute('data-year') || '';
            var cardCategory = card.getAttribute('data-category') || '';
            var matched = true;

            if (query && text.indexOf(query) === -1) {
                matched = false;
            }
            if (year && cardYear !== year) {
                matched = false;
            }
            if (category && cardCategory.indexOf(category) === -1) {
                matched = false;
            }

            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    }

    if (filterWrap) {
        Array.prototype.slice.call(filterWrap.querySelectorAll('button')).forEach(function (button) {
            button.addEventListener('click', function () {
                category = button.getAttribute('data-filter-value') || '';
                Array.prototype.slice.call(filterWrap.querySelectorAll('button')).forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                applyFilters();
            });
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    if (yearFilter) {
        yearFilter.addEventListener('change', applyFilters);
    }
    applyFilters();
}());

function initializeMoviePlayer(sourceUrl) {
    var video = document.querySelector('[data-player-video]');
    var cover = document.querySelector('[data-player-cover]');
    var hlsInstance = null;
    var loaded = false;

    if (!video || !sourceUrl) {
        return;
    }

    function bindSource() {
        if (loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }
    }

    function start() {
        bindSource();
        if (cover) {
            cover.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    if (cover) {
        cover.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
        if (!loaded) {
            start();
        }
    });
    video.addEventListener('play', function () {
        if (cover) {
            cover.classList.add('is-hidden');
        }
    });
    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
