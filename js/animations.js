/*
 * animations.js — ALL SITE-WIDE JS BEHAVIOR
 * Load this file deferred at the bottom of every page.
 * No inline scripts in HTML. Everything lives here.
 */

(function () {

  // ── HEADER HEIGHT → body padding ──────────────────────────
  function setBodyPad() {
    const h = document.getElementById('header-stack');
    if (!h) return;
    document.body.style.paddingTop = h.offsetHeight + 'px';
  }

  setBodyPad();
  window.addEventListener('resize', setBodyPad, { passive: true });


  // ── NAV SCROLL SHADOW ──────────────────────────────────────
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }


  // ── SCROLL REVEAL ──────────────────────────────────────────
  (function () {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el) { io.observe(el); });
  })();


  // ── PAIN ITEM STAGGER ──────────────────────────────────────
  (function () {
    const items = document.querySelectorAll('.pain-item.reveal');
    if (!items.length) return;

    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const index = Array.from(items).indexOf(entry.target);
          setTimeout(function () {
            entry.target.classList.add('visible');
          }, index * 80);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    items.forEach(function (el) { io.observe(el); });
  })();


  // ── STEP STAGGER ──────────────────────────────────────────
  (function () {
    const steps = document.querySelectorAll('.step.reveal');
    if (!steps.length) return;

    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const index = Array.from(steps).indexOf(entry.target);
          setTimeout(function () {
            entry.target.classList.add('visible');
          }, index * 100);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    steps.forEach(function (el) { io.observe(el); });
  })();


  // ── STAT COUNTER ANIMATION ─────────────────────────────────
  (function () {
    const counters = document.querySelectorAll('.stat-num[data-target]');
    if (!counters.length) return;

    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        const el     = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        const dur    = 1200;
        const start  = performance.now();

        function tick(now) {
          const progress = Math.min((now - start) / dur, 1);
          const ease     = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(ease * target) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { io.observe(el); });
  })();


  // ── FAQ ACCORDION ──────────────────────────────────────────
  (function () {
    const triggers = document.querySelectorAll('.faq-q');
    if (!triggers.length) return;

    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        const item   = trigger.parentElement;
        const isOpen = item.classList.contains('open');

        document.querySelectorAll('.faq-item').forEach(function (i) {
          i.classList.remove('open');
        });

        if (!isOpen) item.classList.add('open');
      });
    });
  })();


  // ── FORM SUBMIT ────────────────────────────────────────────
  (function () {
    const form     = document.getElementById('leadForm');
    const msg      = document.getElementById('formMsg');
    const ENDPOINT = 'https://formspree.io/f/mdaweopa';

    if (!form || !msg) return;

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }

      try {
        const res = await fetch(ENDPOINT, {
          method:  'POST',
          body:    new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          form.style.display = 'none';
          msg.style.display  = 'block';
          msg.textContent    = "Got it. We'll be in touch within 24 hours to get you set up.";
        } else {
          throw new Error();
        }
      } catch (err) {
        if (btn) { btn.disabled = false; btn.textContent = 'Book My Diagnostic'; }
        msg.style.display = 'block';
        msg.textContent   = 'Something went wrong. Please try again.';
        msg.style.color   = '#c00';
      }
    });
  })();

})();