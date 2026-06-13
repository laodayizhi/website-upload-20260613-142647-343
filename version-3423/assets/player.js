(function () {
    function initMoviePlayer(playerId, sourceUrl) {
        var root = document.getElementById(playerId);
        if (!root) {
            return;
        }
        var video = root.querySelector('video');
        var cover = root.querySelector('.player-cover');
        var message = root.querySelector('.player-message');
        var hls = null;
        var prepared = false;

        function setMessage(text) {
            if (message) {
                message.textContent = text || '';
            }
        }

        function prepare() {
            if (prepared || !video) {
                return;
            }
            prepared = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal) {
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            setMessage('播放加载中，请稍后重试');
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            setMessage('正在恢复播放');
                            hls.recoverMediaError();
                        } else {
                            setMessage('播放暂时不可用');
                        }
                    }
                });
            } else {
                video.src = sourceUrl;
            }
        }

        function start() {
            prepare();
            root.classList.add('is-started');
            setMessage('');
            var attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {
                    root.classList.remove('is-started');
                    setMessage('点击播放按钮开始观看');
                });
            }
        }

        if (cover) {
            cover.addEventListener('click', start);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener('play', function () {
                root.classList.add('is-started');
                setMessage('');
            });
        }

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
