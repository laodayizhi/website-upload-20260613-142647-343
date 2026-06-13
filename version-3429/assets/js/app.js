(function () {
    var header = document.querySelector(".site-header");
    var navToggle = document.querySelector("[data-nav-toggle]");
    var navMenu = document.querySelector("[data-nav-menu]");

    function updateHeader() {
        if (!header) {
            return;
        }

        if (window.scrollY > 12) {
            header.classList.add("is-scrolled");
        } else {
            header.classList.remove("is-scrolled");
        }
    }

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", function () {
            navMenu.classList.toggle("is-open");
        });
    }

    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === activeSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === activeSlide);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            var index = parseInt(dot.getAttribute("data-hero-dot"), 10);
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    var filterPanels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

    filterPanels.forEach(function (panel) {
        var input = panel.querySelector("[data-filter-input]");
        var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter]"));
        var section = panel.parentElement;
        var cards = section ? Array.prototype.slice.call(section.querySelectorAll(".search-card")) : [];
        var activeFilter = "all";

        function applyFilter() {
            var query = input ? input.value.trim().toLowerCase() : "";

            cards.forEach(function (card) {
                var haystack = card.getAttribute("data-search") || "";
                var kind = card.getAttribute("data-kind") || "";
                var matchesText = !query || haystack.indexOf(query) !== -1;
                var matchesFilter = activeFilter === "all" || kind.indexOf(activeFilter) !== -1;

                card.classList.toggle("is-hidden", !(matchesText && matchesFilter));
            });
        }

        if (input) {
            var params = new URLSearchParams(window.location.search);
            var queryValue = params.get("q");

            if (queryValue) {
                input.value = queryValue;
            }

            input.addEventListener("input", applyFilter);
        }

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeFilter = button.getAttribute("data-filter") || "all";

                buttons.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });

                applyFilter();
            });
        });

        applyFilter();
    });

    var searchForms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));

    searchForms.forEach(function (form) {
        form.addEventListener("submit", function (event) {
            var input = form.querySelector("input[name='q']");

            if (!input || !input.value.trim()) {
                event.preventDefault();
                window.location.href = "./search.html";
            }
        });
    });
}());
