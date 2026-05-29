/**
 * BrightNewMoon — GodplaceBlog Full Integration
 * Sakura petals + click particles + context menu + scroll nav + stats
 */
(function () {
  'use strict';

  // ============================================
  // SAKURA FALLING PETALS
  // ============================================
  var sakuraCount = 25;
  var sakuraContainer = null;

  function createSakuraPetals() {
    sakuraContainer = document.createElement('div');
    sakuraContainer.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99998;';
    document.body.appendChild(sakuraContainer);

    for (var i = 0; i < sakuraCount; i++) {
      var petal = document.createElement('div');
      petal.className = 'sakura-petal';
      var size = Math.random() * 8 + 4;
      petal.style.cssText =
        'width:' + size + 'px;' +
        'height:' + size + 'px;' +
        'left:' + (Math.random() * 100) + '%;' +
        'animation-duration:' + (Math.random() * 6 + 8) + 's;' +
        'animation-delay:' + (Math.random() * 10) + 's;';
      sakuraContainer.appendChild(petal);
    }
  }

  // ============================================
  // CLICK HEART PARTICLES
  // ============================================
  var symbols = [
    '❤', '✨', '💫', '🌟', '💜', '🔮', '⭐',
    '♪', '♫', '☀', '🌙', '❄', '🌸', '💎',
    '⚡', '☁', '⚔', '💥', '🔥', '💧', '🌀',
    '🌌', '💿', '🌊', '🪐', '🌷', '🍀', '🦋'
  ];

  function randomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
  }

  function randomParticleColor() {
    var h = Math.floor(Math.random() * 360);
    var s = 55 + Math.floor(Math.random() * 35);
    var l = 55 + Math.floor(Math.random() * 30);
    return 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
  }

  function createParticle(x, y) {
    var span = document.createElement('span');
    span.textContent = randomSymbol();
    span.className = 'heart-particle';
    span.style.left = x + 'px';
    span.style.top = y + 'px';
    span.style.color = randomParticleColor();
    span.style.fontSize = (12 + Math.random() * 18) + 'px';

    document.body.appendChild(span);

    setTimeout(function () {
      if (span.parentNode) span.parentNode.removeChild(span);
    }, 2100);
  }

  document.addEventListener('click', function (e) {
    var tag = e.target.tagName.toLowerCase();
    if (tag === 'a' || tag === 'button' || tag === 'input' || tag === 'textarea') return;
    if (e.target.closest('a, button, input, textarea, .modal, .navbar, #search-btn')) return;

    // Burst: 1-3 particles per click
    var count = 1 + Math.floor(Math.random() * 3);
    for (var i = 0; i < count; i++) {
      createParticle(
        e.pageX + (Math.random() - 0.5) * 30,
        e.pageY + (Math.random() - 0.5) * 20
      );
    }
  });

  // ============================================
  // SCROLL-AWARE NAVIGATION
  // ============================================
  var lastScroll = 0;
  var navbar = document.querySelector('.navbar');
  if (navbar) {
    navbar.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    window.addEventListener('scroll', function () {
      var currentScroll = window.pageYOffset || document.documentElement.scrollTop;
      if (currentScroll <= 0) {
        navbar.style.transform = 'translateY(0)';
        return;
      }
      if (currentScroll > lastScroll && currentScroll > 80) {
        navbar.style.transform = 'translateY(-100%)';
      } else if (currentScroll < lastScroll) {
        navbar.style.transform = 'translateY(0)';
      }
      lastScroll = currentScroll;
    }, { passive: true });
  }

  // ============================================
  // BANNER PARALLAX
  // ============================================
  var banner = document.querySelector('#banner');
  if (banner) {
    window.addEventListener('scroll', function () {
      var scroll = window.pageYOffset || document.documentElement.scrollTop;
      if (scroll < window.innerHeight) {
        var rate = scroll * 0.08;
        banner.style.opacity = Math.max(0, 1 - scroll / 500);
        banner.style.transform = 'translateY(' + rate + 'px)';
      }
    }, { passive: true });
  }

  // ============================================
  // CUSTOM RIGHT-CLICK CONTEXT MENU
  // ============================================
  (function () {
    var menuEl = document.createElement('div');
    menuEl.className = 'custom-context-menu';
    document.body.appendChild(menuEl);

    var menuVisible = false;

    document.addEventListener('contextmenu', function (e) {
      if (menuEl.querySelector('img')) {
        menuEl.style.display = 'block';
        menuEl.style.left = (e.clientX + 30) + 'px';
        menuEl.style.top = e.clientY + 'px';
        menuVisible = true;
      }
    });

    document.addEventListener('click', function () {
      if (menuVisible) {
        menuEl.style.display = 'none';
        menuVisible = false;
      }
    });
  })();

  // ============================================
  // STATS RUNTIME COUNTER
  // ============================================
  var runtimeEl = document.getElementById('site-runtime');
  var startDate = new Date('2026-05-29T00:00:00');

  function updateRuntime() {
    if (!runtimeEl) return;
    var now = new Date();
    var diff = now - startDate;
    var days = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var minutes = Math.floor((diff % 3600000) / 60000);
    var seconds = Math.floor((diff % 60000) / 1000);
    runtimeEl.textContent = days + ' 天 ' + hours + ' 时 ' + minutes + ' 分 ' + seconds + ' 秒';
  }

  if (runtimeEl) {
    updateRuntime();
    setInterval(updateRuntime, 1000);
  }

  // ============================================
  // INIT
  // ============================================
  function init() {
    createSakuraPetals();
    updateRuntime();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.log(
    '%c🌙 BrightNewMoon %c— GodplaceBlog integration ready',
    'font-weight:bold;color:#818cf8;',
    'color:#888;'
  );
})();
