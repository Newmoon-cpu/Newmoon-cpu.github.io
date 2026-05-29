/**
 * BrightNewMoon — Meteor trail + profile card + star particles
 */
(function () {
  'use strict';

  // ============================================
  // PROFILE CARD INJECTION
  // ============================================
  function injectProfileCard() {
    var mask = document.querySelector('#banner .mask');
    if (!mask) return;

    var card = document.createElement('div');
    card.className = 'hero-profile';
    card.innerHTML =
      '<img class="profile-avatar" src="/img/avatar.png" alt="avatar" onerror="this.style.display=\'none\'">' +
      '<div class="profile-name">BrightNewMoon</div>' +
      '<div class="profile-bio">探索技术，记录生活 🌙<br>Stay hungry, stay foolish.</div>' +
      '<div class="profile-tags">' +
        '<span class="profile-tag">Hexo</span>' +
        '<span class="profile-tag">Fluid</span>' +
        '<span class="profile-tag">GitHub Pages</span>' +
      '</div>' +
      '<div class="profile-links">' +
        '<a href="https://github.com/Newmoon-cpu" target="_blank" rel="noopener" title="GitHub">' +
          '<i class="iconfont icon-github-fill"></i>' +
        '</a>' +
      '</div>';
    mask.appendChild(card);
  }

  // ============================================
  // SCROLL INDICATOR INJECTION
  // ============================================
  function injectScrollIndicator() {
    var banner = document.querySelector('#banner .mask');
    if (!banner) return;

    var indicator = document.createElement('div');
    indicator.className = 'scroll-indicator';
    indicator.innerHTML = '<span>向下滚动</span><span class="scroll-arrow">&#x2304;</span>';

    indicator.addEventListener('click', function () {
      var board = document.getElementById('board');
      if (board) {
        board.scrollIntoView({ behavior: 'smooth' });
      }
    });

    banner.appendChild(indicator);
  }

  // ============================================
  // STATS ROW INJECTION
  // ============================================
  function injectStatsRow() {
    // Only show stats on timeline page
    if (window.location.pathname.indexOf('/timeline/') !== 0) return;

    var board = document.getElementById('board');
    if (!board) return;

    var container = board.querySelector('.container > .row > .col-12');
    if (!container) return;

    var stats = document.createElement('div');
    stats.className = 'stats-row';
    stats.innerHTML =
      '<div class="stat-item">' +
        '<div class="stat-value" id="post-count">--</div>' +
        '<div class="stat-label">文章</div>' +
      '</div>' +
      '<div class="stat-item">' +
        '<div class="stat-value" id="tag-count">--</div>' +
        '<div class="stat-label">标签</div>' +
      '</div>' +
      '<div class="stat-item">' +
        '<div class="stat-value" id="cat-count">--</div>' +
        '<div class="stat-label">分类</div>' +
      '</div>' +
      '<div class="stat-item stat-runtime">' +
        '<div class="stat-value" id="site-runtime">--</div>' +
        '<div class="stat-label">运行时间</div>' +
      '</div>';

    // Insert stats before the first index-card
    var firstCard = container.querySelector('.index-card');
    if (firstCard) {
      firstCard.parentNode.insertBefore(stats, firstCard);
    } else {
      container.insertBefore(stats, container.firstChild);
    }
  }

  // ============================================
  // RUNTIME COUNTER
  // ============================================
  var startDate = new Date('2026-05-29T00:00:00');

  function updateRuntime() {
    var el = document.getElementById('site-runtime');
    if (!el) return;
    var now = new Date();
    var diff = now - startDate;
    var days = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var minutes = Math.floor((diff % 3600000) / 60000);
    var seconds = Math.floor((diff % 60000) / 1000);
    el.textContent = days + ' 天 ' + hours + ' 时 ' + minutes + ' 分 ' + seconds + ' 秒';
  }

  // ============================================
  // CANVAS OVERLAY — meteor trail + star particles
  // Canvas bypasses DOM stacking context (backdrop-filter) issues entirely
  // ============================================
  var _cv = null;
  var _ctx = null;
  var _paused = false;
  var _trailParts = [];
  var _starParts = [];
  var _lastX = 0;
  var _lastY = 0;
  var _hasLast = false;
  var _cvW = 0;
  var _cvH = 0;

  function ensureCanvas() {
    if (_cv) return;
    _cv = document.createElement('canvas');
    _cv.id = 'fx-canvas';
    _cv.style.cssText =
      'position:fixed;top:0;left:0;z-index:2147483647;pointer-events:none;display:block;';
    document.documentElement.appendChild(_cv);
    _ctx = _cv.getContext('2d');
    resizeCanvas();
    requestAnimationFrame(tick);
  }

  function resizeCanvas() {
    if (!_cv) return;
    _cvW = window.innerWidth;
    _cvH = window.innerHeight;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    _cv.width = _cvW * dpr;
    _cv.height = _cvH * dpr;
    _cv.style.width = _cvW + 'px';
    _cv.style.height = _cvH + 'px';
    if (_ctx) _ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener('resize', resizeCanvas);

  // ============================================
  // TRAIL PARTICLES
  // ============================================
  function spawnTrail(x, y) {
    if (!_hasLast) { _lastX = x; _lastY = y; _hasLast = true; _trailParts.push({ x: x, y: y, s: 3, o: 0.75, life: 1 }); return; }

    var dx = x - _lastX;
    var dy = y - _lastY;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var steps = Math.max(1, Math.floor(dist / 5));
    var sx = dx / steps;
    var sy = dy / steps;

    for (var i = 0; i < steps; i++) {
      _trailParts.push({
        x: _lastX + sx * i + (Math.random() - 0.5) * 3,
        y: _lastY + sy * i + (Math.random() - 0.5) * 3,
        s: 1.5 + Math.random() * 3.5,
        o: 0.55 + Math.random() * 0.4,
        life: 1
      });
    }
    _lastX = x;
    _lastY = y;
  }

  // ============================================
  // STAR PARTICLES
  // ============================================
  var _starShapes = ['✦', '✧', '⭑', '✶', '✵', '✴', '⋆', '⚝', '✬', '✫', '✩', '★'];
  var _starColors = ['#a78bfa', '#c4b5fd', '#7c3aed', '#818cf8', '#f9a8d4', '#fde68a', '#67e8f9', '#a7f3d0', '#fca5a5', '#fdba74', '#d8b4fe', '#86efac'];

  function spawnStars(cx, cy) {
    var count = 1 + Math.floor(Math.random() * 3);
    for (var i = 0; i < count; i++) {
      _starParts.push({
        x: cx + (Math.random() - 0.5) * 28,
        y: cy + (Math.random() - 0.5) * 18,
        vx: (Math.random() - 0.5) * 30,
        vy: -40 - Math.random() * 60,
        ch: _starShapes[Math.floor(Math.random() * _starShapes.length)],
        c: _starColors[Math.floor(Math.random() * _starColors.length)],
        fs: 10 + Math.random() * 16,
        rot: (Math.random() - 0.5) * 360,
        rv: (Math.random() - 0.5) * 180,
        life: 1
      });
    }
  }

  // ============================================
  // RENDER LOOP
  // ============================================
  function tick(ts) {
    if (!_ctx || _cvW === 0) { requestAnimationFrame(tick); return; }
    var dt = Math.min(50, ts ? 16.67 : 16.67) / 1000;

    _ctx.clearRect(0, 0, _cvW, _cvH);

    // Draw trail
    for (var i = _trailParts.length - 1; i >= 0; i--) {
      var p = _trailParts[i];
      p.life -= dt * 1.15;
      if (p.life <= 0) { _trailParts.splice(i, 1); continue; }
      var alpha = p.o * p.life;
      var rad = p.s * (0.3 + p.life * 0.7);
      _ctx.beginPath();
      _ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
      _ctx.fillStyle = 'rgba(255,255,255,' + alpha + ')';
      _ctx.shadowColor = 'rgba(200,210,255,' + (alpha * 0.5) + ')';
      _ctx.shadowBlur = rad * 2.5;
      _ctx.fill();
    }
    // Reset shadow for stars
    _ctx.shadowColor = 'transparent';
    _ctx.shadowBlur = 0;

    // Draw stars
    _ctx.textAlign = 'center';
    _ctx.textBaseline = 'middle';
    for (var j = _starParts.length - 1; j >= 0; j--) {
      var sp = _starParts[j];
      sp.life -= dt * 0.55;
      if (sp.life <= 0) { _starParts.splice(j, 1); continue; }
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      sp.rot += sp.rv * dt;
      var sa = sp.life;
      _ctx.save();
      _ctx.translate(sp.x, sp.y);
      _ctx.rotate(sp.rot * Math.PI / 180);
      _ctx.font = sp.fs + 'px sans-serif';
      _ctx.fillStyle = sp.c;
      _ctx.globalAlpha = sa;
      _ctx.fillText(sp.ch, 0, 0);
      _ctx.restore();
    }

    // Garbage collect
    if (_trailParts.length > 200) _trailParts.splice(0, _trailParts.length - 200);
    if (_starParts.length > 60) _starParts.splice(0, _starParts.length - 60);

    requestAnimationFrame(tick);
  }

  document.addEventListener('mousemove', function (e) {
    if (!_cv) ensureCanvas();
    spawnTrail(e.clientX, e.clientY);
  }, { passive: true });

  document.addEventListener('click', function (e) {
    var tag = e.target.tagName.toLowerCase();
    if (tag === 'a' || tag === 'button' || tag === 'input' || tag === 'textarea') return;
    if (e.target.closest && e.target.closest('a, button, input, textarea, .modal, .navbar, #search-btn, #local-search-input')) return;
    if (!_cv) ensureCanvas();
    spawnStars(e.clientX, e.clientY);
  });

  // ============================================
  // STATS COUNTS (from DOM)
  // ============================================
  function updateStats() {
    try {
      var posts = document.querySelectorAll('.index-card').length;
      var postEl = document.getElementById('post-count');
      if (postEl) postEl.textContent = posts || '1';
    } catch (e) {}

    try {
      var tagEl = document.getElementById('tag-count');
      if (tagEl) {
        var tags = document.querySelectorAll('.post-metas .post-meta a[href*="/tags/"]');
        var tagSet = {};
        tags.forEach(function (a) { tagSet[a.textContent.trim()] = true; });
        tagEl.textContent = Object.keys(tagSet).length || '1';
      }
    } catch (e) {}

    try {
      var catEl = document.getElementById('cat-count');
      if (catEl) catEl.textContent = '1';
    } catch (e) {}
  }

  // ============================================
  // FOOTER ENHANCEMENT
  // ============================================
  function enhanceFooter() {
    var footerContent = document.querySelector('.footer-content');
    if (!footerContent) return;

    var startYear = 2026;
    var currentYear = new Date().getFullYear();
    var yearText = startYear === currentYear ? String(startYear) : startYear + ' - ' + currentYear;

    var wrapper = document.createElement('div');
    wrapper.className = 'footer-enhanced';
    wrapper.innerHTML =
      '<div class="footer-copyright">&copy; ' + yearText + ' BrightNewMoon. All rights reserved.</div>' +
      '<div class="footer-runtime">' +
        '<span class="footer-dot"></span>' +
        '已运行 <strong id="footer-runtime">--</strong>' +
      '</div>';

    footerContent.parentNode.insertBefore(wrapper, footerContent.nextSibling);
  }

  function updateFooterRuntime() {
    var el = document.getElementById('footer-runtime');
    if (!el) return;
    var now = new Date();
    var diff = now - startDate;
    var days = Math.floor(diff / 86400000);
    el.textContent = days + ' 天';
  }

  // ============================================
  // COPY BUTTON FEEDBACK
  // ============================================
  function enhanceCodeCopy() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('.copy-btn');
      if (!btn) return;
      if (btn.classList.contains('copied')) return;
      btn.classList.add('copied');
      setTimeout(function () { btn.classList.remove('copied'); }, 1500);
    });
  }

  // ============================================
  // INIT
  // ============================================
  function init() {
    injectProfileCard();
    injectScrollIndicator();
    injectStatsRow();
    enhanceFooter();
    enhanceCodeCopy();
    updateRuntime();
    updateStats();
    updateFooterRuntime();
    setInterval(function () {
      updateRuntime();
      updateFooterRuntime();
    }, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.log(
    '%c🌙 BrightNewMoon %c— ready',
    'font-weight:bold;color:#a78bfa;',
    'color:#888;'
  );
})();
