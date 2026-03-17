/*
 * announcement.js — ANNOUNCEMENT BAR
 * Handles dismiss button and persists dismissed state in sessionStorage.
 * Bar stays hidden for the session once dismissed.
 * Adjust STORAGE_KEY if you run multiple campaigns simultaneously.
 */

(function () {
  const BAR_ID      = 'announcementBar';
  const DISMISS_ID  = 'announcementDismiss';
  const STORAGE_KEY = 'fb_announcement_dismissed';

  function initAnnouncement() {
    const bar     = document.getElementById(BAR_ID);
    const dismiss = document.getElementById(DISMISS_ID);

    if (!bar) return;

    // If already dismissed this session, hide immediately
    if (sessionStorage.getItem(STORAGE_KEY) === 'true') {
      bar.style.display = 'none';
      return;
    }

    // Show bar
    bar.style.display = 'flex';

    // Dismiss handler
    if (dismiss) {
      dismiss.addEventListener('click', () => {
        bar.style.opacity = '0';
        bar.style.transition = 'opacity 0.3s ease';

        setTimeout(() => {
          bar.style.display = 'none';
        }, 300);

        sessionStorage.setItem(STORAGE_KEY, 'true');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnnouncement);
  } else {
    initAnnouncement();
  }
})();