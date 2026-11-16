(function () {
  'use strict';

  var videos = Array.prototype.slice.call(document.querySelectorAll('.demo-video'));
  var states = new Map();
  var activeVideo = null;
  var lightboxOpen = false;
  var dialogVideo = null;
  var pendingFrame = 0;

  videos.forEach(function (video) {
    states.set(video, { userPaused: false, managedPause: false, pending: false, blocked: false });
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = true;
  });

  function pauseVideo(video) {
    if (!video.paused) {
      states.get(video).managedPause = true;
      video.pause();
    }
  }

  function playVideo(video, explicit) {
    var state = states.get(video);
    if (explicit) {
      state.userPaused = false;
      state.blocked = false;
    }
    if (document.hidden || state.userPaused || state.blocked || (state.pending && !explicit) || !video.paused) return;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    state.pending = true;
    var promise = video.play();
    if (promise && promise.then) {
      promise.then(function () {
        state.pending = false;
        state.blocked = false;
      }, function (error) {
        state.pending = false;
        state.blocked = error.name === 'NotAllowedError';
      });
    } else {
      state.pending = false;
    }
  }

  function visibilityScore(video) {
    if (!video.closest('.video-frame')) return 0;
    var rect = video.getBoundingClientRect();
    var topbar = document.querySelector('.topbar');
    var top = topbar ? Math.max(0, topbar.getBoundingClientRect().bottom) : 0;
    var viewportHeight = window.innerHeight;
    var height = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, top));
    var width = Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0));
    var minimumHeight = Math.min(160, rect.height * 0.25, (viewportHeight - top) * 0.25);
    return rect.width > 1 && rect.height > 1 && height >= minimumHeight ? height * width : 0;
  }

  function updatePlayback() {
    pendingFrame = 0;
    if (lightboxOpen || document.hidden) {
      videos.forEach(function (video) { if (video !== dialogVideo || document.hidden) pauseVideo(video); });
      return;
    }
    var candidate = null;
    var score = 0;
    videos.forEach(function (video) {
      var state = states.get(video);
      var visible = visibilityScore(video);
      if (!state.userPaused && visible > score) {
        candidate = video;
        score = visible;
      }
    });
    if (activeVideo && !activeVideo.paused && !states.get(activeVideo).userPaused && visibilityScore(activeVideo)) candidate = activeVideo;
    activeVideo = candidate;
    videos.forEach(function (video) { if (video !== candidate) pauseVideo(video); });
    if (candidate) playVideo(candidate, false);
  }

  function schedulePlayback() {
    if (!pendingFrame) pendingFrame = requestAnimationFrame(updatePlayback);
  }

  videos.forEach(function (video) {
    video.addEventListener('pause', function () {
      var state = states.get(video);
      if (state.managedPause) state.managedPause = false;
      else state.userPaused = true;
    });
    video.addEventListener('play', function () {
      states.get(video).userPaused = false;
      activeVideo = video;
      videos.forEach(function (other) { if (other !== video) pauseVideo(other); });
    });
    video.addEventListener('canplay', schedulePlayback);
  });

  if ('IntersectionObserver' in window) {
    var posters = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.poster = entry.target.getAttribute('data-poster');
        posters.unobserve(entry.target);
      });
    }, { rootMargin: '400px 0px' });
    videos.forEach(function (video) { posters.observe(video); });
  } else {
    videos.forEach(function (video) { video.poster = video.getAttribute('data-poster'); });
  }

  window.addEventListener('scroll', schedulePlayback, { passive: true });
  window.addEventListener('resize', schedulePlayback);
  window.addEventListener('pageshow', schedulePlayback);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && dialogVideo && !states.get(dialogVideo).userPaused) playVideo(dialogVideo, false);
    schedulePlayback();
  });
  function retryBlocked() {
    videos.forEach(function (video) { states.get(video).blocked = false; });
    if (!lightboxOpen) updatePlayback();
  }
  document.addEventListener('pointerdown', retryBlocked, { passive: true });
  document.addEventListener('keydown', retryBlocked);
  schedulePlayback();

  if (!window.HTMLDialogElement) return;
  var dialog = document.createElement('dialog');
  dialog.className = 'media-lightbox';
  dialog.innerHTML = '<button class="media-lightbox-close" type="button" aria-label="关闭" title="关闭">×</button><div class="media-lightbox-content"></div>';
  document.body.appendChild(dialog);
  var content = dialog.querySelector('.media-lightbox-content');
  var returnFocus = null;
  var videoPlaceholder = null;

  function moveVideo(video, parent, before) {
    var time = video.currentTime;
    // Atomic moves keep the decoder and playhead alive in supporting browsers.
    if (typeof parent.moveBefore === 'function') {
      parent.moveBefore(video, before);
    } else {
      var state = states.get(video);
      var version = state.moveVersion = (state.moveVersion || 0) + 1;
      if (time > 0) video.addEventListener('loadedmetadata', function () {
        if (state.moveVersion === version) video.currentTime = time;
      }, { once: true });
      parent.insertBefore(video, before);
      if (time > 0) video.currentTime = time;
    }
  }

  function openDialog(trigger, label) {
    returnFocus = trigger;
    lightboxOpen = true;
    videos.forEach(pauseVideo);
    dialog.setAttribute('aria-label', label);
    dialog.showModal();
    document.documentElement.classList.add('media-lightbox-open');
  }

  document.querySelectorAll('[data-media-image]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      var image = document.createElement('img');
      image.src = link.href;
      image.alt = link.querySelector('img').alt;
      content.replaceChildren(image);
      openDialog(link, image.alt);
    });
  });

  document.querySelectorAll('[data-media-video]').forEach(function (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      var video = button.closest('.video-frame').querySelector('video');
      openDialog(button, video.getAttribute('aria-label'));
      videoPlaceholder = document.createComment('inline video');
      video.parentNode.insertBefore(videoPlaceholder, video);
      moveVideo(video, content, null);
      dialogVideo = video;
      playVideo(video, true);
    });
  });

  dialog.querySelector('button').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (event) { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', function () {
    if (dialogVideo) {
      pauseVideo(dialogVideo);
      moveVideo(dialogVideo, videoPlaceholder.parentNode, videoPlaceholder);
      videoPlaceholder.remove();
      dialogVideo = null;
      videoPlaceholder = null;
    }
    content.replaceChildren();
    lightboxOpen = false;
    document.documentElement.classList.remove('media-lightbox-open');
    if (returnFocus) returnFocus.focus({ preventScroll: true });
    schedulePlayback();
  });
})();
