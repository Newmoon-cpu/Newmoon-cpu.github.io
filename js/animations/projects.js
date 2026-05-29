/**
 * BM.modules.projects — Card hover lift + 3D tilt
 * Intensity: full only, hover devices only
 */
;(function () {
  'use strict';
  if (typeof window.BM === 'undefined') return;

  var T = BM.tokens;
  var core = BM.core;
  var _init = false;
  var _ctx = null;

  var _cards = [];
  var _unsubResize = null;

  BM.modules.projects = {
    page: ['projects'],
    intensity: ['full'],

    init: function (ctx) {
      if (_init) { core.warn('Duplicate init — projects'); return null; }
      if (!core.isHoverDevice()) {
        core.log('projects: skipped — no hover support');
        return null;
      }
      _init = true;
      _ctx = ctx;

      var cards = document.querySelectorAll('.index-card');
      if (!cards.length) {
        core.log('projects: no cards found on this page');
        _init = false;
        return null;
      }

      cards.forEach(function (card, i) {
        bindCard.call(null, card, i);
      });

      _unsubResize = core.onResize(refreshBounds);

      core.log('module init — projects (' + _cards.length + ' cards)');

      return {
        destroy: destroy.bind(this),
        refresh: refresh.bind(this)
      };
    }
  };

  function bindCard(card, idx) {
    var qx = gsap.quickTo(card, 'x', { duration: T.duration.normal, ease: T.ease.out });
    var qy = gsap.quickTo(card, 'y', { duration: T.duration.normal, ease: T.ease.out });
    var qs = gsap.quickTo(card, 'scale', { duration: T.duration.normal, ease: T.ease.out });
    var qrx = gsap.quickTo(card, 'rotationY', { duration: T.duration.normal, ease: T.ease.out });
    var qry = gsap.quickTo(card, 'rotationX', { duration: T.duration.normal, ease: T.ease.out });

    var bounds = null;
    function updateBounds() { bounds = card.getBoundingClientRect(); }
    updateBounds();

    function onEnter() {
      qs(T.scale.hover);
      qy(-T.distance.micro);
    }

    function onLeave() {
      qs(1);
      qy(0);
      qx(0);
      qrx(0);
      qry(0);
    }

    function onMove(e) {
      if (!bounds) return;
      var cx = bounds.left + bounds.width / 2;
      var cy = bounds.top + bounds.height / 2;
      var rx = ((e.clientY - cy) / (bounds.height / 2)) * T.rotation.subtle * -1;
      var ry = ((e.clientX - cx) / (bounds.width / 2)) * T.rotation.subtle;
      qrx(rx);
      qry(ry);
    }

    card.addEventListener('mouseenter', onEnter);
    card.addEventListener('mouseleave', onLeave);
    card.addEventListener('mousemove', onMove, { passive: true });
    card.style.perspective = '800px';
    card.style.transformStyle = 'preserve-3d';

    _cards.push({
      el: card,
      onEnter: onEnter,
      onLeave: onLeave,
      onMove: onMove,
      updateBounds: updateBounds,
      quicks: [qx, qy, qs, qrx, qry]
    });
  }

  function refreshBounds() {
    for (var i = 0; i < _cards.length; i++) {
      _cards[i].updateBounds();
    }
  }

  function destroy() {
    for (var i = 0; i < _cards.length; i++) {
      var c = _cards[i];
      c.el.removeEventListener('mouseenter', c.onEnter);
      c.el.removeEventListener('mouseleave', c.onLeave);
      c.el.removeEventListener('mousemove', c.onMove);
      gsap.set(c.el, { x: 0, y: 0, scale: 1, rotationX: 0, rotationY: 0, clearProps: 'all' });
    }
    _cards = [];
    if (_unsubResize) { _unsubResize(); _unsubResize = null; }
    _init = false;
    core.log('module destroy — projects');
  }

  function refresh() {
    refreshBounds();
  }
})();
