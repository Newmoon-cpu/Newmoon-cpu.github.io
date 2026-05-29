/**
 * BM.modules.search — Search modal GSAP enhancement
 * Intensity: all (polish only, tiny animation)
 */
;(function () {
  'use strict';
  if (typeof window.BM === 'undefined') return;

  var T = BM.tokens;
  var core = BM.core;
  var _init = false;
  var _modal = null;

  // Store bound handlers for teardown
  var _onShow = null;
  var _onHide = null;

  BM.modules.search = {
    page: [],
    intensity: ['full', 'reduced', 'minimal'],

    init: function (ctx) {
      if (_init) { core.warn('Duplicate init — search'); return null; }
      _init = true;

      _modal = document.getElementById('modalSearch');
      if (!_modal) { _init = false; return null; }

      var content = _modal.querySelector('.modal-content');

      _onShow = function () {
        gsap.fromTo(content,
          { autoAlpha: 0, y: T.distance.tight, scale: 0.98 },
          { autoAlpha: 1, y: 0, scale: 1, duration: T.duration.fast, ease: T.ease.out }
        );
      };

      _onHide = function () {
        gsap.to(content, {
          autoAlpha: 0, y: T.distance.micro * 2, duration: T.duration.fast, ease: T.ease.soft
        });
      };

      // Bootstrap 4 modal events
      $(_modal).on('show.bs.modal', _onShow);
      $(_modal).on('hide.bs.modal', _onHide);

      core.log('module init — search');

      return {
        destroy: destroy.bind(this),
        refresh: function () {}
      };
    }
  };

  function destroy() {
    if (_modal) {
      $(_modal).off('show.bs.modal', _onShow);
      $(_modal).off('hide.bs.modal', _onHide);
    }
    _onShow = null;
    _onHide = null;
    _modal = null;
    _init = false;
    core.log('module destroy — search');
  }
})();
