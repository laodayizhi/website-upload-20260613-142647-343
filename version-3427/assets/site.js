(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("open");
            document.body.classList.toggle("menu-open", nav.classList.contains("open"));
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("active", position === index);
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
                timer = null;
            }
        }
        dots.forEach(function (dot, position) {
            dot.addEventListener("click", function () {
                show(position);
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        start();
    }

    function setupFilters() {
        var areas = Array.prototype.slice.call(document.querySelectorAll("[data-search-area]"));
        areas.forEach(function (area) {
            var scope = area.parentElement || document;
            var input = area.querySelector("[data-filter-input]");
            var year = area.querySelector("[data-filter-year]");
            var category = area.querySelector("[data-filter-category]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }
            function apply() {
                var term = normalize(input && input.value);
                var yearTerm = normalize(year && year.value);
                var categoryTerm = normalize(category && category.value);
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-category")
                    ].join(" "));
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var cardCategory = normalize(card.getAttribute("data-category"));
                    var matched = true;
                    if (term && haystack.indexOf(term) === -1) {
                        matched = false;
                    }
                    if (yearTerm && cardYear.indexOf(yearTerm) === -1) {
                        matched = false;
                    }
                    if (categoryTerm && cardCategory !== categoryTerm) {
                        matched = false;
                    }
                    card.hidden = !matched;
                });
            }
            [input, year, category].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            var query = new URLSearchParams(window.location.search).get("q");
            if (query && input) {
                input.value = query;
                apply();
            }
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (frame) {
            var video = frame.querySelector("video");
            var button = frame.querySelector(".player-overlay");
            var src = frame.getAttribute("data-src");
            var loaded = false;
            var hls = null;
            function attach() {
                if (!video || !src) {
                    return;
                }
                if (loaded) {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                } else {
                    video.src = src;
                }
                loaded = true;
                video.controls = true;
            }
            function play() {
                attach();
                frame.classList.add("is-ready");
                var request = video.play();
                if (request && typeof request.catch === "function") {
                    request.catch(function () {
                        frame.classList.remove("is-ready");
                    });
                }
            }
            if (button) {
                button.addEventListener("click", play);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (!loaded || video.paused) {
                        play();
                    }
                });
                video.addEventListener("ended", function () {
                    if (hls && typeof hls.stopLoad === "function") {
                        hls.stopLoad();
                    }
                });
            }
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
