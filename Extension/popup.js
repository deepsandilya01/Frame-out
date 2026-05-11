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

  let timerInterval;
  const timerDisplay = document.getElementById('timerDisplay');

  function startTimer(duration) {
    clearInterval(timerInterval);
    let timer = duration, minutes, seconds;
    timerInterval = setInterval(() => {
      minutes = parseInt(timer / 60, 10);
      seconds = parseInt(timer % 60, 10);

      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;

      timerDisplay.textContent = minutes + ":" + seconds;

      if (--timer < 0) {
        clearInterval(timerInterval);
        timerDisplay.textContent = "00:00";
      }
    }, 1000);
  }

    // Settings button
    const settingsBtn = document.querySelector('.settings-btn');
    if (settingsBtn) {
        settingsBtn.onclick = () => {
            console.log("Settings button clicked");
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
      chrome.storage.local.get(['focusDuration'], (result) => {
        const duration = (result.focusDuration || 25) * 60;
        startTimer(duration);
      });
    } else {
      timerDisplay.classList.remove('active');
      clearInterval(timerInterval);
      timerDisplay.textContent = "00:00";
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
