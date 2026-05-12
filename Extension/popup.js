// popup.js - logic for the extension popup

document.addEventListener('DOMContentLoaded', () => {
  const focusToggle = document.getElementById('focusToggle');
  const statusText = document.getElementById('statusText');
  const blockedList = document.getElementById('blockedList');

  // Load initial state
  chrome.storage.local.get(['focusMode'], (result) => {
    const isOn = result.focusMode || false;
    focusToggle.checked = isOn;
    updateStatusText(isOn);
  });

  // Handle toggle change
  focusToggle.addEventListener('change', () => {
    const isChecked = focusToggle.checked;
    
    // Send message to background script to toggle focus mode
    chrome.runtime.sendMessage({ action: 'toggleFocus' }, (response) => {
      if (response && response.hasOwnProperty('focusMode')) {
        updateStatusText(response.focusMode);
      }
    });
  });

  const timerDisplay = document.getElementById('timerDisplay');
  const timerLabel = document.querySelector('.timer-label');

  // Settings button
  const settingsBtn = document.querySelector('.settings-btn');
  if (settingsBtn) {
      settingsBtn.onclick = () => {
          if (chrome.runtime.openOptionsPage) {
              chrome.runtime.openOptionsPage();
          } else {
              window.open(chrome.runtime.getURL('options.html'));
          }
      };
  }

  function updateStatusText(isOn) {
    statusText.innerText = isOn ? 'ON' : 'OFF';
    statusText.style.color = isOn ? '#00F5FF' : '#849495';
    
    if (isOn) {
      timerDisplay.classList.add('active');
      timerDisplay.style.fontSize = '32px';
      timerDisplay.textContent = "STAY HARD";
      if (timerLabel) timerLabel.textContent = "DISTRACTIONS BLOCKED";
    } else {
      timerDisplay.classList.remove('active');
      timerDisplay.style.fontSize = '36px';
      timerDisplay.textContent = "READY";
      if (timerLabel) timerLabel.textContent = "ACTIVATE TO FOCUS";
    }
  }

  // Load blocked sites list
  const DEFAULT_SITES = ['Instagram', 'Facebook', 'Reddit', 'Twitter', 'Netflix', 'YouTube Shorts'];
  
  chrome.storage.local.get(['customBlocklist'], (result) => {
    const custom = result.customBlocklist || [];
    const allSites = [...DEFAULT_SITES, ...custom];
    
    blockedList.innerHTML = ''; // Clear
    allSites.forEach(site => {
        const li = document.createElement('li');
        li.textContent = site;
        blockedList.appendChild(li);
    });
  });
});
