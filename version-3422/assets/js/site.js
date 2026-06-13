(function () {
    var toArray = function (nodes) {
        return Array.prototype.slice.call(nodes || []);
    };

    var escapeHTML = function (value) {
        return String(value || "").replace(/[&<>'"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                "\"": "&quot;"
            }[char];
        });
    };

    toArray(document.querySelectorAll("[data-mobile-toggle]")).forEach(function (button) {
        button.addEventListener("click", function () {
            var menu = document.querySelector("[data-mobile-menu]");
            if (menu) {
                menu.classList.toggle("is-open");
            }
        });
    });

    toArray(document.querySelectorAll("img[data-cover]")).forEach(function (image) {
        image.addEventListener("error", function () {
            var frame = image.closest(".poster-frame, .rank-poster, .detail-poster");
            image.style.display = "none";
            if (frame) {
                frame.classList.add("poster-fallback");
            }
        });
    });

    toArray(document.querySelectorAll("[data-hero-slider]")).forEach(function (slider) {
        var slides = toArray(slider.querySelectorAll("[data-hero-slide]"));
        var dots = toArray(slider.querySelectorAll("[data-hero-dot]"));
        var index = 0;
        var timer;

        var show = function (nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        };

        var start = function () {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        };

        var restart = function () {
            window.clearInterval(timer);
            start();
        };

        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                restart();
            });
        });

        show(0);
        start();
    });

    toArray(document.querySelectorAll("[data-filter-root]")).forEach(function (root) {
        var input = root.querySelector("[data-filter-input]");
        var cards = toArray(root.querySelectorAll("[data-card]"));
        var count = root.querySelector("[data-filter-count]");
        var activeValue = "all";

        var apply = function () {
            var query = input ? input.value.trim().toLowerCase() : "";
            var visible = 0;

            cards.forEach(function (card) {
                var content = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-keywords"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-region")
                ].join(" ").toLowerCase();
                var matchesText = !query || content.indexOf(query) !== -1;
                var matchesChip = activeValue === "all" || content.indexOf(activeValue.toLowerCase()) !== -1;
                var matches = matchesText && matchesChip;
                card.style.display = matches ? "" : "none";
                if (matches) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = visible ? "当前筛选结果已更新" : "没有找到匹配影片";
            }
        };

        if (input) {
            input.addEventListener("input", apply);
        }

        toArray(root.querySelectorAll("[data-filter-value]")).forEach(function (button) {
            button.addEventListener("click", function () {
                activeValue = button.getAttribute("data-filter-value") || "all";
                toArray(root.querySelectorAll("[data-filter-value]")).forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                apply();
            });
        });

        apply();
    });

    var searchPage = document.querySelector("[data-search-page]");
    if (searchPage && window.MOVIE_SEARCH_INDEX) {
        var searchInput = searchPage.querySelector("[data-search-input]");
        var results = searchPage.querySelector("[data-search-results]");
        var countNode = searchPage.querySelector("[data-search-count]");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";

        if (searchInput) {
            searchInput.value = initialQuery;
        }

        var render = function (query) {
            var value = (query || "").trim().toLowerCase();
            var list = window.MOVIE_SEARCH_INDEX.filter(function (item) {
                if (!value) {
                    return item.hot >= 92;
                }
                return item.search.toLowerCase().indexOf(value) !== -1;
            }).slice(0, 96);

            if (countNode) {
                countNode.textContent = list.length ? "已为你匹配到相关影片" : "没有找到匹配影片";
            }

            if (!results) {
                return;
            }

            if (!list.length) {
                results.innerHTML = '<div class="empty-state">换一个关键词试试</div>';
                return;
            }

            results.innerHTML = list.map(function (item) {
                return '' +
                    '<article class="movie-card group">' +
                        '<a class="poster-frame" href="' + escapeHTML(item.url) + '" data-title="' + escapeHTML(item.title) + '">' +
                            '<img src="' + escapeHTML(item.cover) + '" alt="' + escapeHTML(item.title) + '" loading="lazy" data-cover>' +
                            '<span class="poster-year">' + escapeHTML(item.year) + '</span>' +
                            '<span class="poster-play">▶</span>' +
                        '</a>' +
                        '<div class="movie-card-body">' +
                            '<a class="movie-title" href="' + escapeHTML(item.url) + '">' + escapeHTML(item.title) + '</a>' +
                            '<p class="movie-one-line">' + escapeHTML(item.oneLine) + '</p>' +
                            '<div class="movie-meta"><span>' + escapeHTML(item.region) + '</span><span>' + escapeHTML(item.type) + '</span></div>' +
                            '<a class="movie-category" href="' + escapeHTML(item.categoryUrl) + '">' + escapeHTML(item.category) + '</a>' +
                        '</div>' +
                    '</article>';
            }).join("");

            toArray(results.querySelectorAll("img[data-cover]")).forEach(function (image) {
                image.addEventListener("error", function () {
                    var frame = image.closest(".poster-frame");
                    image.style.display = "none";
                    if (frame) {
                        frame.classList.add("poster-fallback");
                    }
                });
            });
        };

        if (searchInput) {
            searchInput.addEventListener("input", function () {
                render(searchInput.value);
            });
        }

        render(initialQuery);
    }

    var attachPlayer = function (shell) {
        var video = shell.querySelector("video[data-hls-player]");
        var button = shell.querySelector("[data-player-button]");
        var message = shell.querySelector("[data-player-message]");
        if (!video) {
            return;
        }

        var src = video.getAttribute("data-src");
        var hls;

        var setMessage = function (text) {
            if (message) {
                message.textContent = text || "";
                message.style.display = text ? "" : "none";
            }
        };

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                setMessage("");
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                        setMessage("正在重新连接");
                    } else {
                        setMessage("播放遇到网络问题，请稍后重试");
                    }
                }
            });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
        } else {
            setMessage("当前浏览器暂不支持该播放方式");
        }

        var play = function () {
            video.play().then(function () {
                shell.classList.add("is-playing");
                setMessage("");
            }).catch(function () {
                setMessage("点击视频区域继续播放");
            });
        };

        var toggle = function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
                shell.classList.remove("is-playing");
            }
        };

        if (button) {
            button.addEventListener("click", play);
        }

        video.addEventListener("click", toggle);
        video.addEventListener("play", function () {
            shell.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
            shell.classList.remove("is-playing");
        });
    };

    toArray(document.querySelectorAll("[data-player-shell]")).forEach(attachPlayer);
})();
