(function () {
    function setupVideoPlayer(options) {
        var video = document.getElementById(options.videoId);
        var cover = document.getElementById(options.overlayId);
        var source = options.source;
        var hls = null;
        var loaded = false;

        if (!video || !cover || !source) {
            return;
        }

        function loadSource() {
            if (loaded) {
                return;
            }

            loaded = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                return;
            }

            video.src = source;
        }

        function playVideo() {
            loadSource();
            cover.classList.add("is-hidden");

            var promise = video.play();

            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    cover.classList.remove("is-hidden");
                });
            }
        }

        cover.addEventListener("click", playVideo);

        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            } else {
                video.pause();
            }
        });

        video.addEventListener("play", function () {
            cover.classList.add("is-hidden");
        });

        video.addEventListener("ended", function () {
            cover.classList.remove("is-hidden");
        });

        window.addEventListener("beforeunload", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }

    window.setupVideoPlayer = setupVideoPlayer;
}());
