/**
 * BM.modules.home — Home page: card scroll reveals, parallax, background breathing
 * Intensity: full (all), reduced (card reveals only, no parallax/breathing)
 */
;(function () {
  'use strict';
  if (typeof window.BM === 'undefined') return;

  var T = BM.tokens;
  var core = BM.core;
  var _init = false;
  var _ctx = null;
  var _ctxScope = null;
  var _unregLoop = null;

  // Parallax refs
  var _bannerText = null;
  var _profileCard = null;

  BM.modules.home = {
    page: ['home'],
    intensity: ['full', 'reduced'],

    init: function (ctx) {
      if (_init) { core.warn('Duplicate init — home'); return null; }
      _init = true;
      _ctx = ctx;

      _ctxScope = gsap.context(function () {

        // --- Card scroll reveals (full + reduced) ---
        setupCardReveals();

        if (ctx.intensity === 'full') {
          // --- Mouse parallax ---
          setupParallax();

          // --- Background breathing ---
          setupBreathing();

          // --- Hero fade scrub ---
          setupHeroFade();
        }

      });

      core.log('module init — home (intensity:' + ctx.intensity + ')');

      return {
        destroy: destroy.bind(this),
        refresh: refresh.bind(this)
      };
    }
  };

  // ============================================
  // CARD SCROLL REVEALS
  // ============================================
  function setupCardReveals() {
    var cards = document.querySelectorAll('.index-card');
    if (!cards.length) return;

    ScrollTrigger.batch(cards, {
      interval: T.stagger.tight,
      batchMax: 8,
      onEnter: function (elements) {
        gsap.from(elements, {
          y: T.distance.tight,
          autoAlpha: T.opacity.fade,
          duration: T.duration.slow,
          stagger: T.stagger.tight,
          ease: T.ease.out,
          force3D: true,
          backfaceVisibility: 'hidden',
          willChange: 'transform, opacity',
          onComplete: function () { gsap.set(elements, { clearProps: 'willChange' }); }
        });
      },
      start: 'top 88%',
      once: true
    });

    core.registerST('home', 'cardReveals', null);
  }

  // ============================================
  // MOUSE PARALLAX
  // ============================================
  function setupParallax() {
    _bannerText = document.querySelector('#banner .banner-text');
    _profileCard = document.querySelector('.hero-profile');
    if (!_bannerText) return;

    var bannerEl = document.getElementById('banner');
    var toTextX = gsap.quickTo(_bannerText, 'x', { duration: 0.8, ease: T.ease.soft });
    var toTextY = gsap.quickTo(_bannerText, 'y', { duration: 0.8, ease: T.ease.soft });

    var toCardX = null;
    var toCardY = null;
    if (_profileCard) {
      toCardX = gsap.quickTo(_profileCard, 'x', { duration: 0.8, ease: T.ease.soft });
      toCardY = gsap.quickTo(_profileCard, 'y', { duration: 0.8, ease: T.ease.soft });
    }

    function onMove(e) {
      var cx = window.innerWidth / 2;
      var cy = window.innerHeight / 2;
      var dx = (e.clientX - cx) / cx;
      var dy = (e.clientY - cy) / cy;

      toTextX(dx * T.distance.micro);
      toTextY(dy * T.distance.micro);
      if (toCardX && toCardY) {
        toCardX(dx * T.distance.tight * -1);
        toCardY(dy * T.distance.tight * -1);
      }
    }

    bannerEl.addEventListener('mousemove', onMove, { passive: true });
  }

  // ============================================
  // BACKGROUND BREATHING
  // ============================================
  function setupBreathing() {
    var bg = document.querySelector('#banner .full-bg-img');
    if (!bg) return;

    gsap.to(bg, {
      scale: T.scale.subtle,
      duration: 4.5,
      ease: T.ease.soft,
      yoyo: true,
      repeat: -1,
      force3D: true
    });

    _unregLoop = core.registerLoop();
  }

  // ============================================
  // HERO FADE ON SCROLL (scrub)
  // ============================================
  function setupHeroFade() {
    var bannerEl = document.getElementById('banner');
    var bannerContent = document.querySelectorAll('#banner .banner-text, .hero-profile, .scroll-indicator');
    if (!bannerEl || !bannerContent.length) return;

    var st = ScrollTrigger.create({
      trigger: '#board',
      start: 'top 85%',
      end: 'bottom 20%',
      scrub: 0.5,
      onUpdate: function (self) {
        gsap.to(bannerContent, {
          y: T.distance.tight * -1 * self.progress,
          autoAlpha: 1 - self.progress,
          duration: 0,
          overwrite: 'auto'
        });
      }
    });

    core.registerST('home', 'heroFade', st);
  }

  // ============================================
  // LIFECYCLE
  // ============================================
  function destroy() {
    core.killAllST('home');
    if (_ctxScope) { _ctxScope.revert(); _ctxScope = null; }
    if (_unregLoop) { _unregLoop(); _unregLoop = null; }
    _bannerText = null;
    _profileCard = null;
    _init = false;
    core.log('module destroy — home');
  }

  function refresh() {
    ScrollTrigger.refresh();
  }
})();
