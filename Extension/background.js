// background.js - Service Worker for Frame-Out Focus Extension

const DEFAULT_BLOCKED_SITES = [
  "instagram.com",
  "facebook.com",
  "reddit.com",
  "twitter.com",
  "x.com",
  "discord.com",
  "netflix.com"
];

const AD_DOMAINS = [
  "doubleclick.net",
  "googleadservices.com",
  "googlesyndication.com",
  "moatads.com",
  "adservice.google.com",
  "adform.net",
  "adnxs.com"
];

// Get all sites (default + custom + ads)
async function getFullBlocklist() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['customBlocklist', 'blockAds'], (result) => {
      const custom = result.customBlocklist || [];
      const ads = result.blockAds !== false ? AD_DOMAINS : [];
      const fullList = [...new Set([...DEFAULT_BLOCKED_SITES, ...custom, ...ads])];
      resolve(fullList);
    });
  });
}

// Enable focus mode: add redirection rules
async function enableFocusMode() {
  const sites = await getFullBlocklist();
  
  const rules = sites.map((site, index) => ({
    id: index + 1,
    priority: 1,
    action: { 
      type: 'redirect', 
      redirect: { extensionPath: '/blocked.html' } 
    },
    condition: { 
      urlFilter: site, 
      resourceTypes: ['main_frame'] 
    },
  }));

  // Clear existing rules first
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const existingIds = existingRules.map(r => r.id);

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingIds,
    addRules: rules,
  });
  
  await chrome.storage.local.set({ focusMode: true });
}

// Disable focus mode: remove all rules
async function disableFocusMode() {
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const existingIds = existingRules.map(r => r.id);

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingIds,
    addRules: [],
  });
  
  await chrome.storage.local.set({ focusMode: false });
}

// Update rules in real-time if focus mode is ON
async function refreshRules() {
  chrome.storage.local.get('focusMode', (data) => {
    if (data.focusMode) {
      enableFocusMode();
    }
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleFocus') {
    chrome.storage.local.get('focusMode', (data) => {
      const currentlyOn = data.focusMode === true;
      const operation = currentlyOn ? disableFocusMode() : enableFocusMode();
      
      operation.then(() => {
        sendResponse({ focusMode: !currentlyOn });
      }).catch(err => {
        console.error("Error toggling focus mode:", err);
        sendResponse({ error: err.message });
      });
    });
    return true; // async response
  }

  if (request.action === 'updateRules') {
    refreshRules();
    sendResponse({ success: true });
  }
});

// Initialize state on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ focusMode: false });
  disableFocusMode();
});
