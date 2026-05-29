/* === Banner video background === */
(function() {
  var banner = document.getElementById('banner');
  if (!banner) return;

  var video = document.createElement('video');
  video.autoplay = true;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.poster = '/img/banner.webp';
  video.style.cssText = [
    'position: absolute',
    'inset: 0',
    'width: 100%',
    'height: 100%',
    'object-fit: cover',
    'z-index: 0'
  ].join(';');

  var source = document.createElement('source');
  source.src = '/video/banner.mp4';
  source.type = 'video/mp4';

  var sourceWebm = document.createElement('source');
  sourceWebm.src = '/video/banner.webm';
  sourceWebm.type = 'video/webm';

  video.appendChild(source);
  video.appendChild(sourceWebm);
  banner.style.background = 'none';
  banner.style.position = 'relative';
  banner.style.overflow = 'hidden';
  banner.insertBefore(video, banner.firstChild);

  // Fallback: if video fails to load, the poster image (banner.webp) shows instead
  video.onerror = function() {
    video.style.display = 'none';
  };
})();
