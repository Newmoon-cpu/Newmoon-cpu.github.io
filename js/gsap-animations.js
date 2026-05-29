/**
 * BrightNewMoon — GSAP Scroll Animations
 * Core: page-load entrance, scroll-triggered reveals, parallax
 */
(function () {
  'use strict';

  // Wait for GSAP to be available (loaded via CDN in custom_js)
  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      // GSAP not loaded yet, retry
      setTimeout(init, 80);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Project-wide defaults
    gsap.defaults({ duration: 0.6, ease: 'power2.out' });

    // ============================================
    // RESPONSIVE + REDUCED MOTION
    // ============================================
    var mm = gsap.matchMedia();

    // Reduced motion: skip all animations
    mm.add('(prefers-reduced-motion: reduce)', function () {
      // No animations — just return empty cleanup
      return function () {};
    });

    // Desktop + normal motion
    mm.add('(prefers-reduced-motion: no-preference)', function () {
      initAllAnimations();
      return function () {
        ScrollTrigger.getAll().forEach(function (t) { return t.kill(); });
      };
    });

    // ============================================
    // ALL ANIMATIONS
    // ============================================
    function initAllAnimations() {

      // ---- Page Load: Hero entrance ----
      var heroTl = gsap.timeline({ defaults: { duration: 0.7, ease: 'power3.out' } });
      heroTl
        .from('#banner .banner-text .h2', {
          y: 40,
          autoAlpha: 0,
          duration: 0.9
        })
        .from('#banner #subtitle', {
          y: 20,
          autoAlpha: 0,
          duration: 0.6
        }, '-=0.4')
        .from('.hero-profile', {
          x: 30,
          autoAlpha: 0,
          duration: 0.7
        }, '-=0.5')
        .from('.scroll-indicator', {
          autoAlpha: 0,
          y: 10,
          duration: 0.5
        }, '-=0.3');

      // ---- Nav entrance ----
      gsap.from('.navbar', {
        y: -50,
        autoAlpha: 0,
        duration: 0.6,
        delay: 0.1,
        ease: 'power3.out'
      });

      // ---- Banner parallax on scroll ----
      gsap.to('#banner .full-bg-img', {
        y: 120,
        ease: 'none',
        scrollTrigger: {
          trigger: '#banner',
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        }
      });

      // Banner content fade + move on scroll
      gsap.to(['#banner .banner-text', '.hero-profile', '.scroll-indicator'], {
        y: -60,
        autoAlpha: 0,
        ease: 'power2.in',
        scrollTrigger: {
          trigger: '#banner',
          start: 'top top',
          end: 'bottom 60%',
          scrub: 0.5
        }
      });

      // ---- Board entrance ----
      gsap.from('#board', {
        y: 80,
        autoAlpha: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#board',
          start: 'top 92%',
          once: true
        }
      });

      // ---- Blog cards: staggered reveal on scroll ----
      ScrollTrigger.batch('.index-card', {
        interval: 0.08,
        batchMax: 4,
        onEnter: function (elements) {
          gsap.from(elements, {
            y: 40,
            autoAlpha: 0,
            duration: 0.65,
            stagger: 0.1,
            ease: 'power2.out'
          });
        },
        start: 'top 88%',
        once: true
      });

      // ---- Stats row entrance (timeline page) ----
      var statsRow = document.querySelector('.stats-row');
      if (statsRow) {
        gsap.from('.stat-item', {
          y: 30,
          autoAlpha: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.stats-row',
            start: 'top 90%',
            once: true
          }
        });
      }

      // ---- Post content entrance ----
      var postContent = document.querySelector('.post-content');
      if (postContent) {
        gsap.from(postContent, {
          y: 30,
          autoAlpha: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: postContent,
            start: 'top 92%',
            once: true
          }
        });
      }

      // ---- Archive/tag/category list staggered ----
      var archiveItems = document.querySelectorAll('.archive-item');
      if (archiveItems.length) {
        ScrollTrigger.batch(archiveItems, {
          interval: 0.05,
          batchMax: 8,
          onEnter: function (elements) {
            gsap.from(elements, {
              x: -20,
              autoAlpha: 0,
              duration: 0.4,
              stagger: 0.06,
              ease: 'power2.out'
            });
          },
          start: 'top 94%',
          once: true
        });
      }

      // ---- Footer subtle entrance ----
      gsap.from('footer', {
        y: 20,
        autoAlpha: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: 'footer',
          start: 'top 96%',
          once: true
        }
      });

      // ---- Profile card hover (desktop only) ----
      var profileCard = document.querySelector('.hero-profile');
      if (profileCard && window.matchMedia('(hover: hover)').matches) {
        profileCard.addEventListener('mouseenter', function () {
          gsap.to(profileCard, {
            scale: 1.03,
            duration: 0.35,
            ease: 'power2.out'
          });
        });
        profileCard.addEventListener('mouseleave', function () {
          gsap.to(profileCard, {
            scale: 1,
            duration: 0.35,
            ease: 'power2.out'
          });
        });
      }

      // ---- Scroll to top button ----
      var scrollBtn = document.getElementById('scroll-top-button');
      if (scrollBtn) {
        gsap.set(scrollBtn, { autoAlpha: 0, y: 20 });
        ScrollTrigger.create({
          trigger: '#board',
          start: 'top 40%',
          onEnter: function () {
            gsap.to(scrollBtn, { autoAlpha: 1, y: 0, duration: 0.3 });
          },
          onLeaveBack: function () {
            gsap.to(scrollBtn, { autoAlpha: 0, y: 20, duration: 0.3 });
          }
        });
      }

    } // end initAllAnimations

    console.log(
      '%c🎬 GSAP %c— scroll animations ready',
      'font-weight:bold;color:#0fa;',
      'color:#888;'
    );
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
