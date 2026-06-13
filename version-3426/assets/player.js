(function () {
  window.initVideo = function (streamUrl) {
    var video = document.querySelector('[data-video]');
    var layer = document.querySelector('[data-play-layer]');
    var attached = false;
    var hls = null;

    function attach() {
      if (!video || attached) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = streamUrl;
      }
      attached = true;
    }

    function play() {
      if (!video) {
        return;
      }
      attach();
      if (layer) {
        layer.classList.add('is-hidden');
      }
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          video.controls = true;
        });
      }
    }

    if (layer) {
      layer.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
    }
  };
})();
