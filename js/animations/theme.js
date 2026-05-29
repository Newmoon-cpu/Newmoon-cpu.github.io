/**
 * BM.modules.theme — Dark/light mode transition via opacity pulse
 * Intensity: all (subtle enough for any tier)
 */
;(function () {
  'use strict';
  if (typeof window.BM === 'undefined') return;

  var T = BM.tokens;
  var core = BM.core;
  var _init = false;
  var _observer = null;
  var _transitionTween = null;

  BM.modules.theme = {
    page: [],
    intensity: ['full', 'reduced', 'minimal'],

    init: function (ctx) {
      if (_init) { core.warn('Duplicate init — theme'); return null; }
      _init = true;

      _observer = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var m = mutations[i];
          if (m.attributeName === 'data-user-color-scheme' && m.oldValue !== null) {
            // Actual change detected (not initial render)
            if (_transitionTween) _transitionTween.kill();
            _transitionTween = gsap.fromTo('body',
              { autoAlpha: T.opacity.subtle },
              { autoAlpha: 1, duration: T.duration.fast, ease: T.ease.soft }
            );
          }
        }
      });

      _observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-user-color-scheme'],
        attributeOldValue: true
      });

      core.log('module init — theme');

      return {
        destroy: destroy.bind(this),
        refresh: function () {}
      };
    }
  };

  function destroy() {
    if (_observer) { _observer.disconnect(); _observer = null; }
    if (_transitionTween) { _transitionTween.kill(); _transitionTween = null; }
    _init = false;
    core.log('module destroy — theme');
  }
})();
