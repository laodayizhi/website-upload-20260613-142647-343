(function () {
    window.initMoviePlayer = function (streamUrl) {
        var video = document.querySelector('[data-player-video]');
        var cover = document.querySelector('[data-player-cover]');
        var button = document.querySelector('[data-player-start]');
        if (!video || !streamUrl) {
            return;
        }
        var attached = false;
        var hls = null;
        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }
        function start() {
            attach();
            video.controls = true;
            if (cover) {
                cover.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }
        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                start();
            });
        }
        if (cover) {
            cover.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    };
}());
