/**
 * BM.modules.timeline — Stats counter animation + card sequential reveals
 * Intensity: full + reduced
 */
;(function () {
  'use strict';
  if (typeof window.BM === 'undefined') return;

  var T = BM.tokens;
  var core = BM.core;
  var _init = false;
  var _ctx = null;
  var _ctxScope = null;

  BM.modules.timeline = {
    page: ['timeline'],
    intensity: ['full', 'reduced'],

    init: function (ctx) {
      if (_init) { core.warn('Duplicate init — timeline'); return null; }
      _init = true;
      _ctx = ctx;

      _ctxScope = gsap.context(function () {

        // Stats counter
        var statValues = document.querySelectorAll('.stat-value');
        statValues.forEach(function (el) {
          // Skip runtime counter (handled by custom.js setInterval)
          if (el.id === 'site-runtime') return;
          var finalValue = parseInt(el.textContent, 10);
          if (isNaN(finalValue) || finalValue === 0) return;

          gsap.from(el, {
            textContent: 0,
            duration: T.duration.slow,
            ease: T.ease.out,
            snap: { textContent: 1 },
            scrollTrigger: {
              trigger: el.closest('.stats-row') || el,
              start: 'top 85%',
              once: true
            }
          });
        });

        // Card reveals
        var cards = document.querySelectorAll('.index-card');
        if (cards.length) {
          ScrollTrigger.batch(cards, {
            interval: T.stagger.normal,
            batchMax: 8,
            onEnter: function (elements) {
              gsap.from(elements, {
                y: T.distance.tight,
                autoAlpha: T.opacity.fade,
                duration: T.duration.normal,
                stagger: T.stagger.normal,
                ease: T.ease.out,
                force3D: true,
                backfaceVisibility: 'hidden'
              });
            },
            start: 'top 88%',
            once: true
          });
        }

      });

      core.log('module init — timeline (intensity:' + ctx.intensity + ')');

      return {
        destroy: destroy.bind(this),
        refresh: refresh.bind(this)
      };
    }
  };

  function destroy() {
    core.killAllST('timeline');
    if (_ctxScope) { _ctxScope.revert(); _ctxScope = null; }
    _init = false;
    core.log('module destroy — timeline');
  }

  function refresh() {
    ScrollTrigger.refresh();
  }
})();
