/*
 * form.js — FORM SUBMIT HANDLER
 * Handles the lead capture form submission via Formspree.
 * Swap ENDPOINT to update where submissions go.
 * Never put the endpoint URL in index.html.
 */

(function () {
  const FORM_ID    = 'leadForm';
  const MSG_ID     = 'formMsg';
  const ENDPOINT   = 'https://formspree.io/f/mdaweopa';
  const SUCCESS_MSG = "Got it. We'll be in touch within 24 hours to get you set up.";
  const ERROR_MSG   = 'Something went wrong. Please try again or email us directly.';

  function initForm() {
    const form = document.getElementById(FORM_ID);
    const msg  = document.getElementById(MSG_ID);

    if (!form || !msg) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = form.querySelector('button[type="submit"]');

      // Disable button during submission
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending...';
      }

      try {
        const data = new FormData(form);

        const response = await fetch(ENDPOINT, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          form.style.display = 'none';
          msg.style.display = 'block';
          msg.textContent = SUCCESS_MSG;
        } else {
          throw new Error('Response not ok');
        }

      } catch (err) {
        // Re-enable button on error so user can retry
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Book My Diagnostic';
        }
        msg.style.display = 'block';
        msg.textContent = ERROR_MSG;
        msg.style.color = '#c0392b';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initForm);
  } else {
    initForm();
  }
})();