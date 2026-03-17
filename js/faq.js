/*
 * faq.js — FAQ ACCORDION
 * Toggles .open on .faq-item when its question is clicked.
 * Only one item open at a time.
 * CSS in components.css handles the visual transition.
 */

(function () {
  const ITEM_SELECTOR = '.faq-item';
  const TRIGGER_SELECTOR = '.faq-q';

  function initFaq() {
    const items = document.querySelectorAll(ITEM_SELECTOR);

    if (!items.length) return;

    items.forEach(item => {
      const trigger = item.querySelector(TRIGGER_SELECTOR);

      if (!trigger) return;

      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Close all
        items.forEach(i => i.classList.remove('open'));

        // If it wasn't open, open it
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFaq);
  } else {
    initFaq();
  }
})();