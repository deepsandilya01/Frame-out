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

// -----------------------------------------------------------------------------
// SMART SCREEN TIME & ACTIVITY TRACKING
// -----------------------------------------------------------------------------

const BACKEND_URL = "https://hackathon-1-2wnx.onrender.com/api";
let activeTabInfo = null; 
let activityLog = {}; // { "github.com": { duration: 120, visits: 2, lastUpdated: 123 } }
let lastSyncTime = Date.now();
let lastActiveTime = Date.now();
const IDLE_THRESHOLD = 60; // 60 seconds

// Start periodic sync alarm
chrome.alarms.create("syncActivity", { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "syncActivity") {
    syncActivityToBackend();
  }
});

// Track active tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  updateCurrentTabDuration();
  const tab = await chrome.tabs.get(activeInfo.tabId);
  setActiveTab(tab);
});

// Track URL changes within the same tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && activeTabInfo && tabId === activeTabInfo.id) {
    updateCurrentTabDuration();
    setActiveTab(tab);
  }
});

// Handle window focus changes
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    updateCurrentTabDuration();
    activeTabInfo = null; // Browser lost focus
  } else {
    const tabs = await chrome.tabs.query({ active: true, windowId: windowId });
    if (tabs.length > 0) {
      updateCurrentTabDuration();
      setActiveTab(tabs[0]);
    }
  }
});

// Idle state detection
chrome.idle.setDetectionInterval(IDLE_THRESHOLD);
chrome.idle.onStateChanged.addListener((state) => {
  if (state === "idle" || state === "locked") {
    updateCurrentTabDuration();
    activeTabInfo = null;
  } else if (state === "active") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) setActiveTab(tabs[0]);
    });
  }
});

function setActiveTab(tab) {
  if (!tab || !tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
    activeTabInfo = null;
    return;
  }
  
  try {
    const url = new URL(tab.url);
    const domain = url.hostname.replace("www.", "");
    
    activeTabInfo = {
      id: tab.id,
      domain: domain,
      startTime: Date.now()
    };
    
    // Record visit
    if (!activityLog[domain]) {
      activityLog[domain] = { duration: 0, visits: 0 };
    }
    activityLog[domain].visits += 1;
  } catch (e) {
    activeTabInfo = null;
  }
}

function updateCurrentTabDuration() {
  if (activeTabInfo) {
    const now = Date.now();
    const durationSecs = Math.floor((now - activeTabInfo.startTime) / 1000);
    
    if (durationSecs > 0) {
      if (!activityLog[activeTabInfo.domain]) {
        activityLog[activeTabInfo.domain] = { duration: 0, visits: 0 };
      }
      activityLog[activeTabInfo.domain].duration += durationSecs;
    }
    activeTabInfo.startTime = now;
    lastActiveTime = now;
  }
}

async function syncActivityToBackend() {
  updateCurrentTabDuration();
  
  const entries = Object.keys(activityLog);
  if (entries.length === 0) return;
  
  // Prepare payload
  const payload = entries.map(domain => ({
    website: domain,
    duration: activityLog[domain].duration,
    visits: activityLog[domain].visits
  })).filter(e => e.duration > 0 || e.visits > 0);
  
  if (payload.length === 0) return;
  
  try {
    // Get token from cookies
    const cookie = await new Promise(resolve => {
      chrome.cookies.get({ url: BACKEND_URL, name: "token" }, (c) => resolve(c));
    });
    
    let token = cookie ? cookie.value : null;
    
    if (!token) {
      console.warn("No auth token found, cannot sync activity.");
      return;
    }

    const res = await fetch(`${BACKEND_URL}/analytics/sync-extension`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ activities: payload })
    });
    
    if (res.ok) {
      // Clear log after successful sync
      activityLog = {};
      if (activeTabInfo) activeTabInfo.startTime = Date.now();
    }
  } catch (error) {
    console.error("Failed to sync activity to backend:", error);
  }
}
