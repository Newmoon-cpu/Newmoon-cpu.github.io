/**
 * BM.modules.navbar — underline hover, hide-on-scroll, magnetic
 * Applies to: all pages (no page restriction)
 * Intensity: full (underline + hide + magnetic), reduced (underline + hide only), minimal (underline only)
 */
;(function () {
  'use strict';
  if (typeof window.BM === 'undefined') return;

  var T = BM.tokens;
  var core = BM.core;
  var _init = false;
  var _ctx = null;
  var _api = null;

  // Element refs
  var navbar = null;
  var underline = null;
  var links = null;
  var container = null;

  // QuickTo refs
  var toX = null;
  var toW = null;
  var toO = null;

  // Scroll hide state
  var _scrollDir = 0;
  var _lastScroll = 0;
  var _hideTween = null;

  // Magnetic state
  var _magLinks = [];
  var _magUnsubs = [];

  // ============================================
  // UNDERLINE
  // ============================================
  function setupUnderline() {
    container = navbar.querySelector('.container');
    if (!container) return;
    container.style.position = 'relative';

    underline = document.createElement('div');
    underline.className = 'nav-underline';
    container.appendChild(underline);

    toX = gsap.quickTo(underline, 'x', { duration: T.duration.normal, ease: T.ease.out });
    toW = gsap.quickTo(underline, 'width', { duration: T.duration.normal, ease: T.ease.out });
    toO = gsap.quickTo(underline, 'autoAlpha', { duration: T.duration.fast });

    // Set initial position to active link
    var active = core.getActiveNavLink();
    if (active) {
      var r = active.getBoundingClientRect();
      var cr = container.getBoundingClientRect();
      gsap.set(underline, { x: r.left - cr.left, width: r.width, autoAlpha: 0.5 });
    }
  }

  function bindUnderlineEvents() {
    if (!underline || !links) return;
    links.forEach(function (link) {
      link.addEventListener('mouseenter', function () {
        var r = link.getBoundingClientRect();
        var cr = container.getBoundingClientRect();
        toX(r.left - cr.left);
        toW(r.width);
        toO(1);
      });
    });

    navbar.addEventListener('mouseleave', function () {
      var active = core.getActiveNavLink();
      if (active) {
        var r = active.getBoundingClientRect();
        var cr = container.getBoundingClientRect();
        toX(r.left - cr.left);
        toW(r.width);
        toO(0.5);
      } else {
        toO(0);
      }
    });
  }

  // ============================================
  // HIDE ON SCROLL
  // ============================================
  function setupScrollHide() {
    if (_ctx.intensity === 'minimal') return;

    _lastScroll = window.pageYOffset || document.documentElement.scrollTop;

    gsap.ticker.add(onTick);
  }

  function onTick() {
    var s = window.pageYOffset || document.documentElement.scrollTop;
    if (s <= 0) {
      showNav();
      _lastScroll = s;
      return;
    }
    if (Math.abs(s - _lastScroll) < 4) return;
    if (s > _lastScroll && s > 80) {
      hideNav();
    } else if (s < _lastScroll) {
      showNav();
    }
    _lastScroll = s;
  }

  function hideNav() {
    if (_hideTween) _hideTween.kill();
    _hideTween = gsap.to(navbar, {
      yPercent: -100,
      duration: T.duration.fast,
      ease: T.ease.soft,
      force3D: false  // false: navbar has backdrop-filter which creates its own GPU layer
    });
  }

  function showNav() {
    if (_hideTween) _hideTween.kill();
    _hideTween = gsap.to(navbar, {
      yPercent: 0,
      duration: T.duration.fast,
      ease: T.ease.soft,
      force3D: false
    });
  }

  // ============================================
  // MAGNETIC
  // ============================================
  function setupMagnetic() {
    if (_ctx.intensity !== 'full') return;
    if (!core.isHoverDevice()) return;

    links.forEach(function (link, i) {
      (function bindMag(linkEl) {
        var bounds = null;
        var qx = gsap.quickTo(linkEl, 'x', { duration: 0.6, ease: T.ease.out });
        var qy = gsap.quickTo(linkEl, 'y', { duration: 0.6, ease: T.ease.out });

        function updateBounds() { bounds = linkEl.getBoundingClientRect(); }
        updateBounds();

        function onMove(e) {
          if (!bounds) return;
          var cx = bounds.left + bounds.width / 2;
          var cy = bounds.top + bounds.height / 2;
          var dx = (e.clientX - cx) * 0.15;
          var dy = (e.clientY - cy) * 0.15;
          qx(dx);
          qy(dy);
        }

        function onLeave() { qx(0); qy(0); }

        linkEl.addEventListener('mousemove', onMove, { passive: true });
        linkEl.addEventListener('mouseleave', onLeave);

        var unsub = core.onResize(updateBounds);
        _magLinks.push({ el: linkEl, onMove: onMove, onLeave: onLeave, unsub: unsub });
      })(links[i]);
    });
  }

  function teardownMagnetic() {
    for (var i = 0; i < _magLinks.length; i++) {
      var m = _magLinks[i];
      m.el.removeEventListener('mousemove', m.onMove);
      m.el.removeEventListener('mouseleave', m.onLeave);
      if (m.unsub) m.unsub();
      gsap.set(m.el, { x: 0, y: 0 });
    }
    _magLinks = [];
  }

  // ============================================
  // LIFECYCLE
  // ============================================
  BM.modules.navbar = {
    page: [],
    intensity: ['full', 'reduced', 'minimal'],

    init: function (ctx) {
      if (_init) { core.warn('Duplicate init — navbar'); return _api; }
      _init = true;
      _ctx = ctx;

      navbar = document.getElementById('navbar');
      if (!navbar) { core.warn('navbar: #navbar not found'); _init = false; return null; }

      links = navbar.querySelectorAll('.nav-link');

      // Underline — all intensities
      setupUnderline();
      bindUnderlineEvents();

      // Scroll hide — full + reduced
      if (ctx.intensity !== 'minimal') {
        setupScrollHide();
      }

      // Magnetic — full only, hover devices
      setupMagnetic();

      core.log('module init — navbar (intensity:' + ctx.intensity + ')');

      _api = {
        destroy: destroy.bind(this),
        refresh: refresh.bind(this)
      };
      return _api;
    }
  };

  function destroy() {
    // Kill scroll hide
    gsap.ticker.remove(onTick);
    if (_hideTween) { _hideTween.kill(); _hideTween = null; }

    // Teardown magnetic
    teardownMagnetic();

    // Remove underline
    if (underline && underline.parentNode) {
      underline.parentNode.removeChild(underline);
    }

    // Clear refs
    toX = null; toW = null; toO = null;
    underline = null; links = null; container = null; navbar = null;
    _init = false;
    core.log('module destroy — navbar');
  }

  function refresh() {
    // Recalibrate underline for current active link
    var active = core.getActiveNavLink();
    if (active && underline) {
      var r = active.getBoundingClientRect();
      var cr = container ? container.getBoundingClientRect() : { left: 0 };
      gsap.set(underline, { x: r.left - cr.left, width: r.width });
    }
  }
})();
