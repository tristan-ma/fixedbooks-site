/*
 * reveal.js — SCROLL REVEAL
 * Observes all .reveal elements and adds .visible when they enter the viewport.
 * Never manually toggle .visible — let this observer handle it.
 */

(function () {
  const THRESHOLD = 0.12;
  const SELECTOR  = '.reveal';

  function initReveal() {
    const elements = document.querySelectorAll(SELECTOR);

    if (!elements.length) return;

    // Fallback: if IntersectionObserver not supported, show all immediately
    if (!('IntersectionObserver' in window)) {
      elements.forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: THRESHOLD });

    elements.forEach(el => observer.observe(el));
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveal);
  } else {
    initReveal();
  }
})();