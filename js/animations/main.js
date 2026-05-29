/**
 * BM.main — Orchestrator
 * Detects page + intensity, initializes matching modules, stores APIs for teardown
 */
;(function () {
  'use strict';
  if (typeof window.BM === 'undefined') {
    console.warn('BM: core.js not loaded — animations disabled');
    return;
  }

  var core = BM.core;
  var started = false;
  var _moduleAPIs = {};

  function init() {
    if (started) { core.warn('Duplicate orchestrator init — skipped'); return; }
    started = true;

    // Wait for GSAP
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setTimeout(init, 60);
      return;
    }

    // Register plugins + defaults
    gsap.registerPlugin(ScrollTrigger);

    gsap.defaults({
      duration: BM.tokens.duration.normal,
      ease: BM.tokens.ease.out,
      overwrite: 'auto',
      force3D: true
    });

    // Detect context
    var page = core.detectPage();
    var intens = core.intensity();

    var ctx = {
      page: page,
      intensity: intens,
      isReducedMotion: intens !== 'full',
      isMobile: core.isMobile(),
      isTouch: core.isTouch(),
      isHoverDevice: core.isHoverDevice()
    };

    // Signal that DOM injections are likely done
    // custom.js fires after us; its injections complete by DOMContentLoaded
    setTimeout(function () { core.signalDOMReady(); }, 300);

    // Initialize modules
    var modules = BM.modules || {};
    var modNames = Object.keys(modules);
    var initCount = 0;

    modNames.forEach(function (name) {
      var mod = modules[name];
      var pages = mod.page || [];
      var intensities = mod.intensity || ['full'];

      // Page match?
      if (pages.length > 0 && pages.indexOf(page) === -1) return;
      // Intensity match?
      if (intensities.indexOf(intens) === -1) return;

      try {
        var api = mod.init(ctx);
        if (api) {
          _moduleAPIs[name] = api;
          initCount++;
        }
      } catch (e) {
        core.warn('Module "' + name + '" init failed: ' + e.message);
      }
    });

    core.log(
      'ready — intensity:' + intens +
      ', modules:' + initCount +
      ', page:' + page +
      ', STs:' + core.activeSTCount() +
      ', loops:' + core.loopCount()
    );

    // Store teardown
    BM._moduleAPIs = _moduleAPIs;
    BM._destroy = destroyAll;
  }

  function destroyAll() {
    var names = Object.keys(_moduleAPIs);
    names.forEach(function (name) {
      try { _moduleAPIs[name].destroy(); } catch (e) {}
    });
    _moduleAPIs = {};
    core.killAllST('*');
    started = false;
    core.log('all modules destroyed');
  }

  // ---- Start ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
