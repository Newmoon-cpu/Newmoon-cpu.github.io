/**
 * BrightNewMoon — Interactive Effects
 * Click heart particles + scroll-aware nav + smooth transitions
 */
(function () {
  'use strict';

  // ============================================
  // CLICK HEART PARTICLES
  // ============================================
  var heartSymbols = [
    '❤', '✨', '💫', '🌟', '💜', '🔮', '⭐',
    '♪', '♫', '☀', '🌙', '❄', '🌸', '💎',
    '⚡', '☁', '◌', '✧', '˚', '·'
  ];

  function randomHeart() {
    return heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
  }

  function randomColor() {
    var h = Math.floor(Math.random() * 360);
    var s = 60 + Math.floor(Math.random() * 30);
    var l = 55 + Math.floor(Math.random() * 30);
    return 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
  }

  function createParticle(x, y) {
    var span = document.createElement('span');
    span.textContent = randomHeart();
    span.className = 'heart-particle';
    span.style.left = x + 'px';
    span.style.top = y + 'px';
    span.style.color = randomColor();
    span.style.fontSize = (12 + Math.random() * 16) + 'px';

    document.body.appendChild(span);

    // Clean up after animation
    setTimeout(function () {
      if (span.parentNode) {
        span.parentNode.removeChild(span);
      }
    }, 2100);
  }

  document.addEventListener('click', function (e) {
    // Don't create particles when clicking links or buttons
    var tag = e.target.tagName.toLowerCase();
    if (tag === 'a' || tag === 'button' || tag === 'input' || tag === 'textarea') return;
    if (e.target.closest('a, button, input, textarea, .modal, .navbar')) return;

    createParticle(e.pageX, e.pageY);
  });

  // ============================================
  // SCROLL-AWARE NAVIGATION
  // ============================================
  var lastScroll = 0;
  var navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', function () {
      var currentScroll = window.pageYOffset || document.documentElement.scrollTop;
      if (currentScroll <= 0) {
        navbar.style.transform = 'translateY(0)';
        return;
      }
      if (currentScroll > lastScroll && currentScroll > 80) {
        // Scrolling down — hide nav
        navbar.style.transform = 'translateY(-100%)';
      } else if (currentScroll < lastScroll) {
        // Scrolling up — show nav
        navbar.style.transform = 'translateY(0)';
      }
      lastScroll = currentScroll;
    });
  }

  // ============================================
  // SMOOTH BANNER PARALLAX (subtle)
  // ============================================
  var banner = document.querySelector('#banner');
  if (banner) {
    window.addEventListener('scroll', function () {
      var scroll = window.pageYOffset || document.documentElement.scrollTop;
      if (scroll < window.innerHeight) {
        var rate = scroll * 0.15;
        banner.style.opacity = Math.max(0, 1 - scroll / 500);
        banner.style.transform = 'translateY(' + rate + 'px)';
      }
    }, { passive: true });
  }

  console.log('%c🌙 BrightNewMoon %c— interactive effects ready',
    'font-weight:bold;color:#818cf8;', 'color:#888;');
})();
