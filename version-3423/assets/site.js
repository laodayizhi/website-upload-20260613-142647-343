(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var toggle = document.querySelector('.mobile-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var slides = all('[data-hero-slide]');
        var dots = all('[data-hero-dot]');
        var prev = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        restart();
    }

    function setupFilters() {
        var inputs = all('[data-filter-input]');
        if (!inputs.length) {
            return;
        }
        inputs.forEach(function (input) {
            var form = input.closest('form');
            var list = document.querySelector('[data-filter-list]');
            var empty = document.querySelector('[data-empty-state]');
            var items = list ? all('[data-search]', list) : [];

            function filter() {
                var term = input.value.trim().toLowerCase();
                var visible = 0;
                items.forEach(function (item) {
                    var text = (item.getAttribute('data-search') || '').toLowerCase();
                    var match = !term || text.indexOf(term) !== -1;
                    item.classList.toggle('is-filter-hidden', !match);
                    if (match) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            if (form) {
                form.addEventListener('submit', function (event) {
                    event.preventDefault();
                    filter();
                });
            }

            input.addEventListener('input', filter);

            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');
            if (query && input.name === 'q') {
                input.value = query;
                filter();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
    });
})();
