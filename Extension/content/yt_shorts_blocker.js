// yt_shorts_blocker.js - blocks YouTube Shorts and hides Shorts UI

// Hide Shorts tab and shelf if present
function hideShortsUI() {
  // Shorts tab in the top navigation
  const shortsTab = document.querySelector('a[href*="/shorts"]');
  if (shortsTab) shortsTab.style.display = 'none';
  // Shorts shelf on home page
  const shortsShelf = document.querySelector('ytd-rich-shelf-renderer');
  if (shortsShelf && shortsShelf.innerText.includes('Shorts')) {
    shortsShelf.style.display = 'none';
  }
}

// Block Shorts URL
function blockShortsPage() {
  if (location.pathname.startsWith('/shorts')) {
    location.replace(chrome.runtime.getURL('blocked.html'));
  }
}

// Run on load and when navigating via SPA (YouTube uses history API)
function init() {
  hideShortsUI();
  blockShortsPage();
}

// Listen to pushState / replaceState navigation changes
['yt-navigate-finish', 'spfdone'].forEach(event => {
  window.addEventListener(event, init);
});

// Initial execution
init();
