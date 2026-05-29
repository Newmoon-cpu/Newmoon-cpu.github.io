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
  // METEOR TRAIL ON MOUSEMOVE
  // ============================================
  var meteorThrottle = 0;

  function createMeteorParticle(x, y) {
    var dot = document.createElement('div');
    dot.className = 'meteor-particle';
    var size = 2 + Math.random() * 4;
    dot.style.left = x + 'px';
    dot.style.top = y + 'px';
    dot.style.width = size + 'px';
    dot.style.height = size + 'px';
    document.body.appendChild(dot);

    // Clean up after animation
    setTimeout(function () {
      if (dot.parentNode) dot.parentNode.removeChild(dot);
    }, 850);
  }

  document.addEventListener('mousemove', function (e) {
    var now = Date.now();
    if (now - meteorThrottle < 28) return;
    meteorThrottle = now;

    createMeteorParticle(e.clientX + (Math.random() - 0.5) * 6, e.clientY + (Math.random() - 0.5) * 6);
  }, { passive: true });

  // ============================================
  // STAR CLICK PARTICLES
  // ============================================
  var starSymbols = ['✦', '✧', '⭑', '✶', '✵', '✴', '⋆', '⚝', '✬', '✫', '✩', '★'];

  function randomStar() {
    return starSymbols[Math.floor(Math.random() * starSymbols.length)];
  }

  function randomStarColor() {
    var palette = [
      '#a78bfa', '#c4b5fd', '#7c3aed', '#818cf8',
      '#f9a8d4', '#fde68a', '#67e8f9', '#a7f3d0',
      '#fca5a5', '#fdba74', '#d8b4fe', '#86efac'
    ];
    return palette[Math.floor(Math.random() * palette.length)];
  }

  function createStarParticle(x, y) {
    var span = document.createElement('span');
    span.textContent = randomStar();
    span.className = 'star-particle';
    span.style.left = x + 'px';
    span.style.top = y + 'px';
    span.style.color = randomStarColor();
    span.style.fontSize = (12 + Math.random() * 16) + 'px';

    document.body.appendChild(span);

    setTimeout(function () {
      if (span.parentNode) span.parentNode.removeChild(span);
    }, 1900);
  }

  document.addEventListener('click', function (e) {
    var tag = e.target.tagName.toLowerCase();
    if (tag === 'a' || tag === 'button' || tag === 'input' || tag === 'textarea') return;
    if (e.target.closest && e.target.closest('a, button, input, textarea, .modal, .navbar, #search-btn, #local-search-input')) return;

    var count = 1 + Math.floor(Math.random() * 3);
    for (var i = 0; i < count; i++) {
      createStarParticle(
        e.clientX + (Math.random() - 0.5) * 28,
        e.clientY + (Math.random() - 0.5) * 18
      );
    }
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
  // INIT
  // ============================================
  function init() {
    injectProfileCard();
    injectScrollIndicator();
    injectStatsRow();
    updateRuntime();
    updateStats();
    setInterval(updateRuntime, 1000);
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
