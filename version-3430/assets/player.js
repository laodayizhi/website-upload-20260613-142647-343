
import { H as Hls } from './hls-video.js';

const players = Array.from(document.querySelectorAll('[data-player]'));

function showMessage(player, message) {
    const messageBox = player.querySelector('[data-player-message]');

    if (!messageBox) {
        return;
    }

    messageBox.textContent = message;
    messageBox.classList.add('is-visible');

    window.setTimeout(function () {
        messageBox.classList.remove('is-visible');
    }, 4200);
}

function initializePlayer(player) {
    if (player.dataset.initialized === 'true') {
        return Promise.resolve();
    }

    const video = player.querySelector('video');
    const source = player.getAttribute('data-video-src');

    if (!video || !source) {
        showMessage(player, '当前影片缺少播放源。');
        return Promise.reject(new Error('Missing video element or source.'));
    }

    player.dataset.initialized = 'true';

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return Promise.resolve();
    }

    if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        player.hlsInstance = hls;

        hls.on(Hls.Events.ERROR, function (_, data) {
            if (!data || !data.fatal) {
                return;
            }

            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                showMessage(player, '网络加载异常，正在尝试恢复播放。');
                hls.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                showMessage(player, '媒体解码异常，正在尝试恢复。');
                hls.recoverMediaError();
            } else {
                showMessage(player, '播放器暂时无法播放当前视频源。');
                hls.destroy();
            }
        });

        return Promise.resolve();
    }

    video.src = source;
    showMessage(player, '当前浏览器可能不支持 HLS，已尝试使用原生播放。');
    return Promise.resolve();
}

players.forEach(function (player) {
    const video = player.querySelector('video');
    const startButton = player.querySelector('[data-player-start]');

    function startPlayback() {
        initializePlayer(player)
            .then(function () {
                if (startButton) {
                    startButton.classList.add('is-hidden');
                }

                if (video) {
                    return video.play();
                }

                return null;
            })
            .catch(function () {
                showMessage(player, '播放启动失败，请稍后重试。');
            });
    }

    if (startButton) {
        startButton.addEventListener('click', startPlayback);
    }

    if (video) {
        video.addEventListener('play', function () {
            if (startButton) {
                startButton.classList.add('is-hidden');
            }
        });

        video.addEventListener('pause', function () {
            if (startButton && video.currentTime === 0) {
                startButton.classList.remove('is-hidden');
            }
        });
    }
});
