/**
 * BM.modules.scroll — Reading progress bar + scroll-to-top
 * Intensity: all (progress bar is functional, not decorative)
 */
;(function () {
  'use strict';
  if (typeof window.BM === 'undefined') return;

  var T = BM.tokens;
  var core = BM.core;
  var _init = false;
  var _ctx = null;
  var _bar = null;
  var _scrollBtnTween = null;

  BM.modules.scroll = {
    page: [],
    intensity: ['full', 'reduced', 'minimal'],

    init: function (ctx) {
      if (_init) { core.warn('Duplicate init — scroll'); return null; }
      _init = true;
      _ctx = ctx;

      // --- Reading progress bar ---
      _bar = document.createElement('div');
      _bar.className = 'reading-progress-bar';
      document.body.prepend(_bar);

      var progressST = ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.1,
        onUpdate: function (self) {
          gsap.set(_bar, { scaleX: self.progress });
        }
      });
      core.registerST('scroll', 'readingProgress', progressST);

      // --- Scroll-to-top button ---
      var scrollBtn = document.getElementById('scroll-top-button');
      if (scrollBtn) {
        gsap.set(scrollBtn, { autoAlpha: 0, y: T.distance.tight });

        var stBtn = ScrollTrigger.create({
          trigger: '#board',
          start: 'top 40%',
          onEnter: function () {
            if (_scrollBtnTween) _scrollBtnTween.kill();
            _scrollBtnTween = gsap.to(scrollBtn, { autoAlpha: 1, y: 0, duration: T.duration.fast });
          },
          onLeaveBack: function () {
            if (_scrollBtnTween) _scrollBtnTween.kill();
            _scrollBtnTween = gsap.to(scrollBtn, { autoAlpha: 0, y: T.distance.tight, duration: T.duration.fast });
          }
        });
        core.registerST('scroll', 'scrollToTop', stBtn);
      }

      core.log('module init — scroll');

      return {
        destroy: destroy.bind(this),
        refresh: refresh.bind(this)
      };
    }
  };

  function destroy() {
    core.killAllST('scroll');
    if (_bar && _bar.parentNode) _bar.parentNode.removeChild(_bar);
    if (_scrollBtnTween) { _scrollBtnTween.kill(); _scrollBtnTween = null; }
    _bar = null;
    _init = false;
    core.log('module destroy — scroll');
  }

  function refresh() {
    ScrollTrigger.refresh();
  }
})();
