/**
 * BM.modules.pageEntrance — page-load entrance timelines
 * Home: full stagger sequence. Inner pages: simplified. Reduced: opacity-only.
 */
;(function () {
  'use strict';
  if (typeof window.BM === 'undefined') return;

  var T = BM.tokens;
  var core = BM.core;
  var _init = false;
  var _ctx = null;
  var _tl = null;

  BM.modules.pageEntrance = {
    page: [],
    intensity: ['full', 'reduced'],

    init: function (ctx) {
      if (_init) { core.warn('Duplicate init — pageEntrance'); return null; }
      _init = true;
      _ctx = ctx;

      var isHome = ctx.page === 'home';
      var isFull = ctx.intensity === 'full';

      if (isHome) {
        buildHomeEntrance(isFull);
      } else {
        buildInnerEntrance(isFull);
      }

      core.log('module init — pageEntrance (page:' + ctx.page + ', intensity:' + ctx.intensity + ')');

      return {
        destroy: function () {
          if (_tl) { _tl.kill(); _tl = null; }
          _init = false;
          core.log('module destroy — pageEntrance');
        },
        refresh: function () { /* static timelines — no refresh needed */ }
      };
    }
  };

  function buildHomeEntrance(full) {
    _tl = gsap.timeline({ paused: true, defaults: { overwrite: 'auto' } });

    if (full) {
      // Full entrance: staggered, cinematic
      _tl
        .from('#banner .banner-text .h2', {
          y: T.distance.tight,
          autoAlpha: T.opacity.fade,
          duration: T.duration.slow,
          ease: T.ease.out,
          willChange: 'transform, opacity',
          onComplete: function () { gsap.set('#banner .banner-text .h2', { clearProps: 'willChange' }); }
        })
        .from('#banner #subtitle', {
          y: T.distance.micro,
          autoAlpha: T.opacity.fade,
          duration: T.duration.normal,
          ease: T.ease.out
        }, '-=0.3')
        .from('.hero-profile', {
          x: T.distance.tight,
          autoAlpha: T.opacity.fade,
          duration: T.duration.normal,
          ease: T.ease.out
        }, '-=0.35')
        .from('.scroll-indicator', {
          autoAlpha: T.opacity.fade,
          y: T.distance.micro * 2,
          duration: T.duration.normal,
          ease: T.ease.soft
        }, '-=0.15')
        .from('#board', {
          y: T.distance.normal,
          autoAlpha: T.opacity.fade,
          duration: T.duration.slow,
          ease: T.ease.out
        }, '-=0.1');
    } else {
      // Reduced entrance: opacity-only, shorter, no stagger
      _tl
        .from('#banner .banner-text .h2', {
          autoAlpha: T.opacity.fade,
          duration: T.duration.fast,
          ease: T.ease.soft
        })
        .from('#banner #subtitle', {
          autoAlpha: T.opacity.fade,
          duration: T.duration.fast,
          ease: T.ease.soft
        }, '-=0.15')
        .from('#board', {
          autoAlpha: T.opacity.fade,
          duration: T.duration.fast,
          ease: T.ease.soft
        }, '-=0.1');
    }

    _tl.play();
  }

  function buildInnerEntrance(full) {
    _tl = gsap.timeline({ paused: true, defaults: { overwrite: 'auto' } });

    if (full) {
      _tl
        .from('#banner .banner-text h1, #banner .banner-text .h2', {
          y: T.distance.tight,
          autoAlpha: T.opacity.fade,
          duration: T.duration.normal,
          ease: T.ease.out,
          willChange: 'transform, opacity',
          onComplete: function () { gsap.set('#banner .banner-text h1, #banner .banner-text .h2', { clearProps: 'willChange' }); }
        })
        .from('#board', {
          y: T.distance.normal,
          autoAlpha: T.opacity.fade,
          duration: T.duration.slow,
          ease: T.ease.out
        }, '-=0.15');
    } else {
      _tl
        .from('#banner .banner-text h1, #banner .banner-text .h2', {
          autoAlpha: T.opacity.fade,
          duration: T.duration.fast,
          ease: T.ease.soft
        })
        .from('#board', {
          autoAlpha: T.opacity.fade,
          duration: T.duration.fast,
          ease: T.ease.soft
        }, '-=0.1');
    }

    _tl.play();
  }
})();
