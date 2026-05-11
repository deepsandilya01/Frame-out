// ig_reels_blocker.js - blocks Instagram Reels and hides UI

// Hide Reels button on navigation bar
function hideReelsButton() {
  const reelsBtn = document.querySelector('a[href*="/reels"]');
  if (reelsBtn) reelsBtn.style.display = 'none';
}

// Block Reels page navigation
function blockReelsPage() {
  if (location.pathname.startsWith('/reels')) {
    location.replace(chrome.runtime.getURL('blocked.html'));
  }
}

function init() {
  hideReelsButton();
  blockReelsPage();
}

// Instagram also uses SPA navigation
window.addEventListener('popstate', init);
window.addEventListener('pushstate', init);
window.addEventListener('replacestate', init);

// Initial run
init();
