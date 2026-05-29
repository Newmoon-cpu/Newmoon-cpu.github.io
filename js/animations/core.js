/**
 * BM.core — Foundation layer
 * Motion tokens, namespace, ST registry, debug, intensity, lifecycle utilities
 */
;(function () {
  'use strict';

  // ============================================
  // NAMESPACE
  // ============================================
  var BM = window.BM || {};
  window.BM = BM;

  BM.version = '2.0.0';
  BM.modules = BM.modules || {};
  BM.debug = (function () {
    try { return localStorage.getItem('bm-debug') === '1'; } catch (e) { return false; }
  })();

  function log() {
    if (!BM.debug) return;
    var args = Array.prototype.slice.call(arguments);
    args[0] = '%cBM%c ' + args[0];
    console.log.apply(console, [args[0], 'color:#a78bfa;font-weight:bold', 'color:#888'].concat(args.slice(1)));
  }

  function warn() {
    if (!BM.debug) return;
    var args = Array.prototype.slice.call(arguments);
    args[0] = '%cBM%c ⚠ ' + args[0];
    console.warn.apply(console, [args[0], 'color:#f59e0b;font-weight:bold', 'color:#888'].concat(args.slice(1)));
  }

  // ============================================
  // MOTION TOKEN SYSTEM
  // ============================================
  BM.tokens = {
    duration:   { fast: 0.25, normal: 0.45, slow: 0.7, cinematic: 1.0 },
    ease:       { out: 'power3.out', inOut: 'power3.inOut', soft: 'power2.out', linear: 'none' },
    stagger:    { micro: 0.04, tight: 0.08, normal: 0.12, wide: 0.18 },
    distance:   { micro: 4, tight: 12, normal: 30, wide: 60 },
    opacity:    { subtle: 0.85, fade: 0, visible: 1 },
    scale:      { subtle: 1.015, hover: 1.03 },
    rotation:   { micro: 3, subtle: 5 }
  };

  // ============================================
  // UTILITIES
  // ============================================
  var T = BM.tokens;

  function detectPage() {
    var p = window.location.pathname;
    if (p === '/' || p === '/index.html') return 'home';
    if (p.indexOf('/archives/') === 0) return 'archive';
    if (p.indexOf('/categories/') === 0) return 'categories';
    if (p.indexOf('/tags/') === 0) return 'tags';
    if (p.indexOf('/projects/') === 0) return 'projects';
    if (p.indexOf('/timeline/') === 0) return 'timeline';
    if (p.indexOf('/about/') === 0) return 'about';
    if (p.indexOf('/links/') === 0) return 'links';
    if (p.indexOf('/contact/') === 0) return 'contact';
    if (p.indexOf('/resume/') === 0) return 'resume';
    if (p.indexOf('/404') === 0) return '404';
    // Match year/month/slug pattern for posts
    if (/\/\d{4}\/\d{2}\//.test(p)) return 'post';
    return 'page';
  }

  function isReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function isMobile() {
    return window.matchMedia('(max-width: 768px)').matches;
  }

  function isTouch() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  function isHoverDevice() {
    return window.matchMedia('(hover: hover)').matches;
  }

  function intensity() {
    if (isReducedMotion()) return 'reduced';
    if (isMobile() && window.navigator && window.navigator.hardwareConcurrency < 4) return 'minimal';
    return 'full';
  }

  function debounce(fn, ms) {
    var timer;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(ctx, args); }, ms);
    };
  }

  function throttle(fn, ms) {
    var last = 0;
    return function () {
      var now = Date.now();
      if (now - last < ms) return;
      last = now;
      fn.apply(this, arguments);
    };
  }

  function getActiveNavLink() {
    var links = document.querySelectorAll('#navbar .nav-link');
    var current = window.location.pathname;
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href');
      if (href === current || (href !== '/' && current.indexOf(href) === 0)) return links[i];
    }
    return null;
  }

  // Expose utilities
  BM.core = {
    log: log,
    warn: warn,
    detectPage: detectPage,
    isReducedMotion: isReducedMotion,
    isMobile: isMobile,
    isTouch: isTouch,
    isHoverDevice: isHoverDevice,
    intensity: intensity,
    debounce: debounce,
    throttle: throttle,
    getActiveNavLink: getActiveNavLink
  };

  // ============================================
  // SCROLLTRIGGER REGISTRY
  // ============================================
  var _stRegistry = {};

  BM.core.registerST = function (moduleName, id, st) {
    if (!_stRegistry[moduleName]) _stRegistry[moduleName] = [];
    _stRegistry[moduleName].push({ id: id, instance: st });
    log('ST registered: ' + moduleName + '/' + id + ' (total: ' + BM.core.activeSTCount() + ')');
  };

  BM.core.killAllST = function (moduleName) {
    var list = _stRegistry[moduleName];
    if (!list) return;
    for (var i = 0; i < list.length; i++) {
      try { list[i].instance.kill(); } catch (e) {}
      if (BM.debug) log('ST killed: ' + moduleName + '/' + list[i].id);
    }
    delete _stRegistry[moduleName];
    log('ST registry: ' + BM.core.activeSTCount() + ' active after killing ' + moduleName);
  };

  BM.core.activeSTCount = function () {
    var count = 0;
    var keys = Object.keys(_stRegistry);
    for (var i = 0; i < keys.length; i++) {
      var list = _stRegistry[keys[i]];
      if (list) count += list.length;
    }
    if (count > 12 && BM.debug) warn('High ST count: ' + count + ' — consider batching');
    return count;
  };

  // ============================================
  // AMBIENT LOOP COUNTER (max 2)
  // ============================================
  var _loopCount = 0;

  BM.core.registerLoop = function () {
    _loopCount++;
    if (_loopCount > 2 && BM.debug) warn('Loop count: ' + _loopCount + ' — max 2 recommended');
    return function unregisterLoop() { _loopCount = Math.max(0, _loopCount - 1); };
  };

  BM.core.loopCount = function () { return _loopCount; };

  // ============================================
  // DEFERRED INITIALIZATION
  // ============================================
  var _domReady = false;
  var _domReadyCallbacks = [];

  function signalDOMReady() {
    if (_domReady) return;
    _domReady = true;
    log('DOM ready signal received');
    for (var i = 0; i < _domReadyCallbacks.length; i++) {
      requestAnimationFrame(_domReadyCallbacks[i]);
    }
    _domReadyCallbacks = [];
  }

  BM.core.signalDOMReady = signalDOMReady;

  BM.core.onLayoutReady = function (callback) {
    if (_domReady) {
      requestAnimationFrame(callback);
      return;
    }
    _domReadyCallbacks.push(callback);
    // Timeout fallback: fire anyway after 3s
    if (_domReadyCallbacks.length === 1) {
      setTimeout(function () { signalDOMReady(); }, 3000);
    }
  };

  // Auto-detect DOM ready
  if (document.readyState === 'complete') {
    setTimeout(signalDOMReady, 100);
  } else {
    window.addEventListener('load', function () { setTimeout(signalDOMReady, 100); });
  }

  // ============================================
  // RESIZE RECALCULATION
  // ============================================
  var _resizeCallbacks = [];
  var _resizeRunning = false;

  BM.core.onResize = function (callback) {
    _resizeCallbacks.push(callback);
    return function unsubscribe() {
      var idx = _resizeCallbacks.indexOf(callback);
      if (idx !== -1) _resizeCallbacks.splice(idx, 1);
    };
  };

  var _fireResize = debounce(function () {
    log('Resize recalc — ' + _resizeCallbacks.length + ' callbacks');
    for (var i = 0; i < _resizeCallbacks.length; i++) {
      try { _resizeCallbacks[i](); } catch (e) {}
    }
  }, 250);

  window.addEventListener('resize', _fireResize, { passive: true });

  // ============================================
  // WINDOW UNLOAD — kill everything
  // ============================================
  window.addEventListener('beforeunload', function () {
    log('Teardown — killing all STs');
    var keys = Object.keys(_stRegistry);
    for (var i = 0; i < keys.length; i++) {
      BM.core.killAllST(keys[i]);
    }
    _resizeCallbacks = [];
    _domReadyCallbacks = [];
  });

  log('core loaded — tokens, registry, intensity, lifecycle');
})();
