/*
 * animations.js — ALL MOTION AND BEHAVIOR
 * Deferred. Loaded on every page.
 * No inline scripts anywhere in HTML.
 */

(function () {
  'use strict';

  /* ── UTILITIES ───────────────────────────────────────────── */

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  function mapRange(val, inMin, inMax, outMin, outMax) {
    return outMin + ((val - inMin) / (inMax - inMin)) * (outMax - outMin);
  }

  var raf = window.requestAnimationFrame;
  var scrollY = 0;
  var lastScrollY = 0;
  var scrollVelocity = 0;
  var ticking = false;

  /* ── HEADER HEIGHT → body padding ───────────────────────── */

  function setBodyPad() {
    var h = document.getElementById('header-stack');
    if (!h) return;
    document.body.style.paddingTop = h.offsetHeight + 'px';
  }

  setBodyPad();
  window.addEventListener('resize', setBodyPad, { passive: true });


  /* ── SCROLL TRACKING ─────────────────────────────────────── */

  window.addEventListener('scroll', function () {
    scrollY = window.scrollY;
    scrollVelocity = scrollY - lastScrollY;
    lastScrollY = scrollY;

    if (!ticking) {
      raf(onScroll);
      ticking = true;
    }
  }, { passive: true });

  function onScroll() {
    ticking = false;
    updateParallax();
    updateNavState();
    updateProgressBar();
    updateSectionWatchers();
  }


  /* ── NAV SCROLL STATE ────────────────────────────────────── */

  var nav = document.getElementById('nav');

  function updateNavState() {
    if (!nav) return;
    nav.classList.toggle('scrolled', scrollY > 20);
  }


  /* ── SCROLL PROGRESS BAR ─────────────────────────────────── */
  /*
   * A 1px line at the very top of the page (inside the nav)
   * that fills left to right as the user scrolls.
   * Signals reading progress on long pages like research.
   */

  var progressBar = null;

  (function initProgressBar() {
    if (!document.querySelector('.paper') && !document.querySelector('.page-body')) return;

    progressBar = document.createElement('div');
    progressBar.style.cssText = [
      'position: fixed',
      'top: 0',
      'left: 0',
      'width: 0%',
      'height: 2px',
      'background: rgba(0,0,0,0.35)',
      'z-index: 9999',
      'transition: width 0.1s linear',
      'pointer-events: none'
    ].join(';');

    document.body.appendChild(progressBar);
  })();

  function updateProgressBar() {
    if (!progressBar) return;
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docH > 0 ? (scrollY / docH) * 100 : 0;
    progressBar.style.width = clamp(pct, 0, 100) + '%';
  }


  /* ── PARALLAX ────────────────────────────────────────────── */
  /*
   * Multi-layer parallax on the hero.
   * Each element with data-parallax="N" moves at N * scroll speed.
   * Negative N moves up faster (retreats), positive moves slower (advances).
   * The hero eyebrow, h1, sub, and stat bar all move at different rates
   * creating the illusion of depth without 3D transforms.
   */

  var parallaxEls = [];

  function initParallax() {
    document.querySelectorAll('[data-parallax]').forEach(function (el) {
      parallaxEls.push({
        el: el,
        rate: parseFloat(el.dataset.parallax) || 0,
        currentY: 0,
        targetY: 0
      });
    });
  }

  function updateParallax() {
    if (!parallaxEls.length) return;

    parallaxEls.forEach(function (item) {
      item.targetY = scrollY * item.rate;
    });
  }

  /* Smooth parallax via RAF loop */
  function parallaxLoop() {
    parallaxEls.forEach(function (item) {
      item.currentY = lerp(item.currentY, item.targetY, 0.08);
      item.el.style.transform = 'translateY(' + item.currentY.toFixed(2) + 'px)';
    });
    raf(parallaxLoop);
  }

  initParallax();
  if (parallaxEls.length) parallaxLoop();


  /* ── HERO ENTRANCE ───────────────────────────────────────── */
  /*
   * Staggered entrance with spring easing.
   * Elements with .fade-up and .delay-N classes animate in sequence.
   * The animation is CSS-driven but JS adds the trigger class
   * after a short delay to ensure fonts are loaded.
   */

  function initHeroEntrance() {
    var fadeEls = document.querySelectorAll('.fade-up');
    if (!fadeEls.length) return;

    // Already handled by CSS animation + delay classes
    // But we add a class to the hero to signal JS is ready
    var hero = document.querySelector('.hero');
    if (hero) {
      setTimeout(function () {
        hero.classList.add('js-ready');
      }, 50);
    }
  }

  initHeroEntrance();


  /* ── SCROLL REVEAL ───────────────────────────────────────── */

  var revealEls = [];
  var revealObserver = null;

  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -48px 0px'
    });

    els.forEach(function (el) {
      revealEls.push(el);
      revealObserver.observe(el);
    });
  }

  initReveal();


  /* ── STAGGERED CHILDREN ──────────────────────────────────── */
  /*
   * When a parent with .stagger-children enters the viewport,
   * its direct children animate in sequence with increasing delay.
   * Used on pain list, process steps, testimonials, trust bar.
   */

  function initStagger() {
    var parents = document.querySelectorAll('.stagger-children');
    if (!parents.length) return;

    if (!('IntersectionObserver' in window)) return;

    var staggerObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var children = entry.target.children;
        Array.from(children).forEach(function (child, i) {
          setTimeout(function () {
            child.classList.add('visible');
          }, i * 90);
        });

        staggerObserver.unobserve(entry.target);
      });
    }, { threshold: 0.05 });

    parents.forEach(function (el) {
      Array.from(el.children).forEach(function (child) {
        child.classList.add('reveal');
      });
      staggerObserver.observe(el);
    });
  }

  initStagger();


  /* ── SECTION WATCHERS ────────────────────────────────────── */
  /*
   * Track which section is in view.
   * Adds .in-view to the active section.
   * Used for line draw animations and section-specific effects.
   */

  var sectionWatchers = [];

  function initSectionWatchers() {
    document.querySelectorAll('section[id], .section[id]').forEach(function (el) {
      sectionWatchers.push(el);
    });
  }

  function updateSectionWatchers() {
    var viewportMid = scrollY + window.innerHeight * 0.5;

    sectionWatchers.forEach(function (el) {
      var top = el.getBoundingClientRect().top + scrollY;
      var bottom = top + el.offsetHeight;
      var inView = viewportMid >= top && viewportMid <= bottom;
      el.classList.toggle('in-view', inView);
    });
  }

  initSectionWatchers();


  /* ── LINE DRAW ANIMATION ─────────────────────────────────── */
  /*
   * Elements with .line-draw get a width animation from 0 to 100%
   * when they enter the viewport.
   */

  function initLineDraws() {
    var els = document.querySelectorAll('.line-draw');
    if (!els.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    els.forEach(function (el) { io.observe(el); });
  }

  initLineDraws();


  /* ── STAT COUNTER ────────────────────────────────────────── */
  /*
   * Elements with data-target and data-suffix animate from 0 to target.
   * Uses cubic ease-out for a satisfying deceleration.
   */

  function initCounters() {
    var counters = document.querySelectorAll('.stat-num[data-target]');
    if (!counters.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var el = entry.target;
        var target = parseInt(el.dataset.target, 10);
        var suffix = el.dataset.suffix || '';
        var dur = 1400;
        var start = null;

        function tick(ts) {
          if (!start) start = ts;
          var progress = Math.min((ts - start) / dur, 1);
          var ease = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(ease * target) + suffix;
          if (progress < 1) raf(tick);
        }

        raf(tick);
        io.unobserve(el);
      });
    }, { threshold: 0.6 });

    counters.forEach(function (el) { io.observe(el); });
  }

  initCounters();


  /* ── MAGNETIC BUTTONS ────────────────────────────────────── */
  /*
   * Buttons with .btn-primary shift slightly toward the cursor
   * when hovered. Adds depth and responsiveness.
   * Effect resets smoothly on mouse leave.
   */

  function initMagneticButtons() {
    var btns = document.querySelectorAll('.btn-primary, .demo-cta__btn, .paper-cta__btn, .intro-strip__btn');
    if (!btns.length || window.matchMedia('(pointer: coarse)').matches) return;

    btns.forEach(function (btn) {
      var currentX = 0;
      var currentY = 0;
      var targetX = 0;
      var targetY = 0;
      var active = false;
      var animId = null;

      function loop() {
        currentX = lerp(currentX, targetX, 0.12);
        currentY = lerp(currentY, targetY, 0.12);

        btn.style.transform = 'translate(' + currentX.toFixed(2) + 'px, ' + currentY.toFixed(2) + 'px)';

        if (active || Math.abs(currentX) > 0.1 || Math.abs(currentY) > 0.1) {
          animId = raf(loop);
        }
      }

      btn.addEventListener('mouseenter', function () {
        active = true;
        if (!animId) loop();
      });

      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = e.clientX - cx;
        var dy = e.clientY - cy;
        targetX = dx * 0.22;
        targetY = dy * 0.22;
      });

      btn.addEventListener('mouseleave', function () {
        active = false;
        targetX = 0;
        targetY = 0;
      });
    });
  }

  initMagneticButtons();


  /* ── REPORT UNFOLD (demo page) ───────────────────────────── */
  /*
   * On the demo page the report sections reveal sequentially
   * as the user scrolls, like reading through a real document.
   * Each major block fades and slides in with a slight delay
   * relative to the previous block.
   *
   * Additionally the score bars animate their fill width
   * when they enter the viewport rather than being static.
   */

  function initReportUnfold() {
    var report = document.querySelector('.report');
    if (!report) return;

    /* Sequential section reveals */
    var blocks = report.querySelectorAll([
      '.report-header',
      '.r-title',
      '.r-subtitle',
      '.client-box',
      '.summary-grid',
      '.benchmark',
      '.score-section',
      '.findings',
      'div[style*="margin-bottom:32px"]',
      '.recommendations',
      '.next-steps',
      '.report-footer'
    ].join(','));

    /* Set initial state */
    blocks.forEach(function (block) {
      block.style.opacity = '0';
      block.style.transform = 'translateY(16px)';
      block.style.transition = 'opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)';
    });

    var blockObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var index = Array.from(blocks).indexOf(entry.target);
        setTimeout(function () {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 60);

        blockObserver.unobserve(entry.target);
      });
    }, { threshold: 0.06 });

    blocks.forEach(function (block) {
      blockObserver.observe(block);
    });

    /* Score bar animation */
    var bars = report.querySelectorAll('.score-bar-fill');
bars.forEach(function (bar) {
  var targetWidth = bar.dataset.width || bar.style.width;
  bar.style.width = '0%';
      bar.style.transition = 'width 0.9s cubic-bezier(0.16,1,0.3,1)';

      var barObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          setTimeout(function () {
            bar.style.width = targetWidth;
          }, 200);
          barObserver.unobserve(entry.target);
        });
      }, { threshold: 0.8 });

      barObserver.observe(bar);
    });
  }

  initReportUnfold();


  /* ── RESEARCH TOC ACTIVE STATE ───────────────────────────── */
  /*
   * On the research page, the active TOC link highlights
   * as the corresponding section scrolls into view.
   */

  function initTocHighlight() {
    var toc = document.querySelector('.toc');
    if (!toc) return;

    var links = toc.querySelectorAll('.toc__link');
    var sections = [];

    links.forEach(function (link) {
      var id = link.getAttribute('href').replace('#', '');
      var section = document.getElementById(id);
      if (section) sections.push({ link: link, section: section });
    });

    if (!sections.length) return;

    var tocObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var match = sections.find(function (s) { return s.section === entry.target; });
        if (!match) return;

        if (entry.isIntersecting) {
          links.forEach(function (l) { l.style.color = ''; l.style.fontWeight = ''; });
          match.link.style.color = 'var(--text)';
          match.link.style.fontWeight = '500';
        }
      });
    }, { threshold: 0.3, rootMargin: '-80px 0px -40% 0px' });

    sections.forEach(function (s) { tocObserver.observe(s.section); });
  }

  initTocHighlight();


  /* ── FAQ ACCORDION ───────────────────────────────────────── */

  function initFaq() {
    var triggers = document.querySelectorAll('.faq-q');
    if (!triggers.length) return;

    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var item = trigger.parentElement;
        var isOpen = item.classList.contains('open');

        document.querySelectorAll('.faq-item').forEach(function (i) {
          i.classList.remove('open');
        });

        if (!isOpen) item.classList.add('open');
      });
    });
  }

  initFaq();


  /* ── FORM SUBMIT ─────────────────────────────────────────── */

  function initForm() {
    var form = document.getElementById('leadForm');
    var msg = document.getElementById('formMsg');
    var ENDPOINT = 'https://formspree.io/f/mdaweopa';

    if (!form || !msg) return;

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending...';
      }

      try {
        var res = await fetch(ENDPOINT, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          form.style.display = 'none';
          msg.style.display = 'block';
          msg.textContent = "Got it. We'll be in touch within 24 hours.";
        } else {
          throw new Error();
        }
      } catch (err) {
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Book My Diagnostic';
        }
        msg.style.display = 'block';
        msg.textContent = 'Something went wrong. Please try again.';
        msg.style.color = 'var(--r-red, #B83232)';
      }
    });
  }

  initForm();


  /* ── CURSOR GLOW (desktop only) ──────────────────────────── */
  /*
   * A soft radial glow that follows the cursor on the hero section.
   * Adds depth without being distracting.
   * Disabled on touch devices.
   */

  function initCursorGlow() {
    var hero = document.querySelector('.hero');
    if (!hero || window.matchMedia('(pointer: coarse)').matches) return;

    var glow = document.createElement('div');
    glow.style.cssText = [
      'position: absolute',
      'width: 500px',
      'height: 500px',
      'border-radius: 50%',
      'background: radial-gradient(circle, rgba(0,0,0,0.06) 0%, transparent 70%)',
      'pointer-events: none',
      'transform: translate(-50%, -50%)',
      'transition: opacity 0.3s ease',
      'opacity: 0',
      'z-index: 0'
    ].join(';');

    hero.style.position = 'relative';
    hero.appendChild(glow);

    var glowX = 0;
    var glowY = 0;
    var targetGlowX = 0;
    var targetGlowY = 0;
    var glowActive = false;

    hero.addEventListener('mouseenter', function () {
      glow.style.opacity = '1';
      glowActive = true;
    });

    hero.addEventListener('mouseleave', function () {
      glow.style.opacity = '0';
      glowActive = false;
    });

    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      targetGlowX = e.clientX - rect.left;
      targetGlowY = e.clientY - rect.top;
    });

    function glowLoop() {
      glowX = lerp(glowX, targetGlowX, 0.06);
      glowY = lerp(glowY, targetGlowY, 0.06);
      glow.style.left = glowX + 'px';
      glow.style.top = glowY + 'px';
      raf(glowLoop);
    }

    glowLoop();
  }

  initCursorGlow();


  /* ── HORIZONTAL SCROLL VELOCITY TILT ─────────────────────── */
  /*
   * On scroll, elements with .velocity-tilt rotate very slightly
   * in the direction of scroll. Returns to 0 when scroll stops.
   * Adds a sense of physical momentum to the page.
   */

  var tiltEls = document.querySelectorAll('.velocity-tilt');
  var currentTilt = 0;
  var targetTilt = 0;

  if (tiltEls.length && !window.matchMedia('(pointer: coarse)').matches) {
    window.addEventListener('scroll', function () {
      targetTilt = clamp(scrollVelocity * 0.04, -1.2, 1.2);
    }, { passive: true });

    function tiltLoop() {
      currentTilt = lerp(currentTilt, targetTilt, 0.08);
      targetTilt = lerp(targetTilt, 0, 0.12);

      tiltEls.forEach(function (el) {
        el.style.transform = 'rotate(' + currentTilt.toFixed(3) + 'deg)';
      });

      raf(tiltLoop);
    }

    tiltLoop();
  }


  /* ── RESEARCH FINDING HOVER ──────────────────────────────── */
  /*
   * On the research page, hovering a .finding block
   * slightly shifts it left to signal interactivity
   * and draws a left border.
   */

  function initFindingHover() {
    var findings = document.querySelectorAll('.finding');
    if (!findings.length) return;

    findings.forEach(function (finding) {
      finding.style.transition = 'transform 0.2s ease, border-left 0.2s ease';
      finding.style.borderLeft = '2px solid transparent';
      finding.style.paddingLeft = '0px';

      finding.addEventListener('mouseenter', function () {
        finding.style.borderLeft = '2px solid var(--text)';
        finding.style.paddingLeft = '16px';
        finding.style.transform = 'translateX(4px)';
      });

      finding.addEventListener('mouseleave', function () {
        finding.style.borderLeft = '2px solid transparent';
        finding.style.paddingLeft = '0px';
        finding.style.transform = 'translateX(0)';
      });
    });
  }

  initFindingHover();


  /* ── SMOOTH ANCHOR SCROLL ────────────────────────────────── */
  /*
   * Intercepts anchor clicks and scrolls smoothly
   * accounting for the fixed header height.
   */

  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href').slice(1);
        var target = document.getElementById(id);
        if (!target) return;

        e.preventDefault();

        var header = document.getElementById('header-stack');
        var offset = header ? header.offsetHeight : 0;
        var top = target.getBoundingClientRect().top + window.scrollY - offset - 16;

        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  initSmoothAnchors();

})();