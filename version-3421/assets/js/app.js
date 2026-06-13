(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"]/g, function (item) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[item];
        });
    }

    function buildCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span class="tag">' + escapeHtml(tag) + '</span>';
        }).join("");
        return [
            '<article class="movie-card">',
            '<a class="movie-cover" href="./' + escapeHtml(movie.file) + '" style="background-image: linear-gradient(180deg, rgba(17, 24, 39, 0.05), rgba(17, 24, 39, 0.72)), url(\'' + escapeHtml(movie.cover) + '\');">',
            '<span class="badge">' + escapeHtml(movie.year) + '</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<h3 class="movie-title"><a href="./' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
            '<p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>',
            '<div class="tag-list">' + tags + '</div>',
            '</div>',
            '</article>'
        ].join("");
    }

    function setupMobileMenu() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
            });
        });
        show(0);
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function setupSearchForms() {
        selectAll('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                }
            });
        });
    }

    function setupSearchPage() {
        var resultBox = document.querySelector('[data-search-results]');
        if (!resultBox || !window.MovieIndex) {
            return;
        }
        var keyword = document.querySelector('[data-search-input]');
        var typeFilter = document.querySelector('[data-filter-type]');
        var regionFilter = document.querySelector('[data-filter-region]');
        var yearFilter = document.querySelector('[data-filter-year]');
        var params = new URLSearchParams(window.location.search);
        if (keyword && params.get('q')) {
            keyword.value = params.get('q');
        }
        function fillSelect(select, values) {
            if (!select) {
                return;
            }
            values.forEach(function (value) {
                var option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        }
        fillSelect(typeFilter, Array.from(new Set(window.MovieIndex.map(function (movie) { return movie.type; }))).filter(Boolean).slice(0, 30));
        fillSelect(regionFilter, Array.from(new Set(window.MovieIndex.map(function (movie) { return movie.region; }))).filter(Boolean).slice(0, 40));
        fillSelect(yearFilter, Array.from(new Set(window.MovieIndex.map(function (movie) { return String(movie.year); }))).filter(Boolean).sort().reverse().slice(0, 60));
        function render() {
            var q = keyword ? keyword.value.trim().toLowerCase() : "";
            var type = typeFilter ? typeFilter.value : "";
            var region = regionFilter ? regionFilter.value : "";
            var year = yearFilter ? yearFilter.value : "";
            var list = window.MovieIndex.filter(function (movie) {
                var text = [movie.title, movie.region, movie.type, movie.genre, movie.oneLine, (movie.tags || []).join(' ')].join(' ').toLowerCase();
                return (!q || text.indexOf(q) >= 0) && (!type || movie.type === type) && (!region || movie.region === region) && (!year || String(movie.year) === year);
            }).slice(0, 96);
            if (!list.length) {
                resultBox.innerHTML = '<div class="search-panel"><h2>暂无匹配影片</h2><p>可以更换关键词、地区、类型或年份继续查找。</p></div>';
                return;
            }
            resultBox.innerHTML = '<div class="movie-grid is-wide">' + list.map(buildCard).join('') + '</div>';
        }
        [keyword, typeFilter, regionFilter, yearFilter].forEach(function (el) {
            if (el) {
                el.addEventListener('input', render);
                el.addEventListener('change', render);
            }
        });
        render();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHero();
        setupSearchForms();
        setupSearchPage();
    });
}());
