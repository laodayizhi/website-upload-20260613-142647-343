
(function () {
    const header = document.querySelector('[data-header]');
    const menuButton = document.querySelector('[data-menu-button]');
    const mobileNav = document.querySelector('[data-mobile-nav]');
    const backToTop = document.querySelector('[data-back-to-top]');

    function updateHeaderState() {
        if (!header) {
            return;
        }

        if (window.scrollY > 48) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    function updateBackToTopState() {
        if (!backToTop) {
            return;
        }

        if (window.scrollY > 420) {
            backToTop.classList.add('is-visible');
        } else {
            backToTop.classList.remove('is-visible');
        }
    }

    window.addEventListener('scroll', function () {
        updateHeaderState();
        updateBackToTopState();
    });

    updateHeaderState();
    updateBackToTopState();

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            const isOpen = mobileNav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', String(isOpen));
        });
    }

    if (backToTop) {
        backToTop.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    document.querySelectorAll('.search-redirect').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            const input = form.querySelector('input[name="q"]');
            const query = input ? input.value.trim() : '';

            if (!query) {
                event.preventDefault();
                window.location.href = 'search.html';
                return;
            }

            event.preventDefault();
            window.location.href = 'search.html?q=' + encodeURIComponent(query);
        });
    });

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let currentSlide = 0;
    let heroTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === currentSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === currentSlide);
        });
    }

    function startHeroTimer() {
        if (heroTimer || slides.length <= 1) {
            return;
        }

        heroTimer = window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            const index = Number(dot.getAttribute('data-hero-dot')) || 0;
            showSlide(index);

            if (heroTimer) {
                window.clearInterval(heroTimer);
                heroTimer = null;
            }

            startHeroTimer();
        });
    });

    showSlide(0);
    startHeroTimer();

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        const container = scope.parentElement;
        const searchInput = scope.querySelector('[data-local-search]');
        const countElement = scope.querySelector('[data-filter-count]');
        const cards = Array.from(container.querySelectorAll('[data-card]'));
        const typeButtons = Array.from(scope.querySelectorAll('[data-type-filter]'));
        let activeType = '全部';

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function cardMatchesType(card) {
            if (activeType === '全部') {
                return true;
            }

            const rawType = card.getAttribute('data-type') || '';
            if (activeType === '剧集') {
                return rawType.includes('剧');
            }
            if (activeType === '纪录片') {
                return rawType.includes('纪录');
            }
            if (activeType === '动画') {
                return rawType.includes('动画') || rawType.includes('动漫') || rawType.includes('Animation');
            }
            if (activeType === '综艺') {
                return rawType.includes('综艺');
            }
            if (activeType === '电影') {
                return !rawType.includes('剧') && !rawType.includes('纪录') && !rawType.includes('动画') && !rawType.includes('动漫') && !rawType.includes('综艺');
            }

            return rawType.includes(activeType);
        }

        function applyFilter() {
            const query = normalize(searchInput ? searchInput.value : '');
            let visibleCount = 0;

            cards.forEach(function (card) {
                const haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type')
                ].join(' '));
                const matchesQuery = !query || haystack.includes(query);
                const matchesType = cardMatchesType(card);
                const visible = matchesQuery && matchesType;

                card.classList.toggle('is-hidden-by-filter', !visible);

                if (visible) {
                    visibleCount += 1;
                }
            });

            if (countElement) {
                countElement.textContent = visibleCount + ' 部影片';
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', applyFilter);
        }

        typeButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeType = button.getAttribute('data-type-filter') || '全部';
                typeButtons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                applyFilter();
            });
        });

        applyFilter();
    });
}());
