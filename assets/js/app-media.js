(function () {
  'use strict';

  var videos = Array.prototype.slice.call(document.querySelectorAll('.demo-video'));
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  var autoPaused = new WeakSet();
  var userPaused = new WeakSet();
  var visible = new Set();
  var lightboxOpen = false;

  function allowAutoPlay() {
    return !reduceMotion.matches && !(connection && connection.saveData);
  }

  function pauseVideo(video) {
    if (!video.paused) {
      autoPaused.add(video);
      video.pause();
    }
  }

  function playVideo(video) {
    if (document.hidden || lightboxOpen || !allowAutoPlay() || userPaused.has(video) || !video.hasAttribute('data-auto-play')) return;
    var promise = video.play();
    if (promise && promise.catch) promise.catch(function () { /* Native controls remain available. */ });
  }

  videos.forEach(function (video) {
    video.addEventListener('pointerdown', function () {
      if (!video.poster) video.poster = video.getAttribute('data-poster');
    }, { once: true });
    video.addEventListener('pause', function () {
      if (autoPaused.has(video)) autoPaused.delete(video);
      else userPaused.add(video);
    });
    video.addEventListener('play', function () {
      userPaused.delete(video);
      // Only one recording should play at a time, including manually started guides.
      videos.forEach(function (other) { if (other !== video) pauseVideo(other); });
    });
  });

  if ('IntersectionObserver' in window) {
    var posterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.poster = entry.target.getAttribute('data-poster');
        posterObserver.unobserve(entry.target);
      });
    }, { rootMargin: '400px 0px' });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var video = entry.target;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
          visible.add(video);
          playVideo(video);
        } else {
          visible.delete(video);
          pauseVideo(video);
        }
      });
    }, { threshold: [0, 0.4] });
    videos.forEach(function (video) { posterObserver.observe(video); observer.observe(video); });
  } else {
    videos.forEach(function (video) { video.poster = video.getAttribute('data-poster'); });
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) videos.forEach(pauseVideo);
    else visible.forEach(playVideo);
  });

  function motionChanged() {
    if (!allowAutoPlay()) {
      videos.forEach(function (video) { if (video.hasAttribute('data-auto-play')) pauseVideo(video); });
    }
  }
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', motionChanged);
  if (connection && connection.addEventListener) connection.addEventListener('change', motionChanged);

  if (!window.HTMLDialogElement) return;
  var dialog = document.createElement('dialog');
  dialog.className = 'media-lightbox';
  dialog.setAttribute('aria-label', '应用截图大图');
  dialog.innerHTML = '<div class="media-lightbox-bar"><button type="button" data-zoom>原始尺寸</button><button type="button" data-close aria-label="关闭截图">关闭 ×</button></div><div class="media-lightbox-scroll"><img alt=""></div><p class="media-lightbox-caption"></p>';
  document.body.appendChild(dialog);
  var image = dialog.querySelector('img');
  var caption = dialog.querySelector('.media-lightbox-caption');
  var zoom = dialog.querySelector('[data-zoom]');
  var returnFocus;

  document.querySelectorAll('[data-media-image]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      returnFocus = link;
      image.src = link.href;
      image.alt = link.querySelector('img').alt;
      caption.textContent = link.getAttribute('data-caption') || image.alt;
      dialog.classList.remove('is-original');
      zoom.textContent = '原始尺寸';
      dialog.showModal();
      lightboxOpen = true;
      document.documentElement.classList.add('media-lightbox-open');
      videos.forEach(pauseVideo);
    });
  });
  zoom.addEventListener('click', function () {
    var original = dialog.classList.toggle('is-original');
    zoom.textContent = original ? '适应窗口' : '原始尺寸';
  });
  dialog.querySelector('[data-close]').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (event) { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', function () {
    lightboxOpen = false;
    document.documentElement.classList.remove('media-lightbox-open');
    image.removeAttribute('src');
    if (returnFocus) returnFocus.focus({ preventScroll: true });
    visible.forEach(playVideo);
  });
})();
