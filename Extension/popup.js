// popup.js — Frame-Out Extension Popup Logic

document.addEventListener('DOMContentLoaded', () => {

    const timerDisplay  = document.getElementById('timerDisplay');
    const timerLabel    = document.getElementById('timerLabel');
    const stateOff      = document.getElementById('stateOff');
    const stateOn       = document.getElementById('stateOn');
    const activateBtn   = document.getElementById('activateBtn');
    const gameBtn       = document.getElementById('gameBtn');
    const settingsBtn   = document.getElementById('settingsBtn');
    const blockedList   = document.getElementById('blockedList');

    // ── Load initial state from storage ──────────────────────────────
    chrome.storage.local.get(['focusMode'], (result) => {
        const isOn = result.focusMode === true;
        renderState(isOn);
    });

    // ── ACTIVATE button (OFF → ON) ───────────────────────────────────
    activateBtn.addEventListener('click', () => {
        activateBtn.disabled = true;
        activateBtn.textContent = '...';

        chrome.runtime.sendMessage({ action: 'enableFocus' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Popup: sendMessage error:", chrome.runtime.lastError.message);
                activateBtn.disabled = false;
                activateBtn.innerHTML = '<span class="btn-icon">⚡</span> ACTIVATE FOCUS';
                return;
            }
            
            activateBtn.disabled = false;
            activateBtn.innerHTML = '<span class="btn-icon">⚡</span> ACTIVATE FOCUS';
            if (response && response.focusMode !== undefined) {
                renderState(response.focusMode);
            }
        });
    });

    // ── GAME button (ON → open game page) ────────────────────────────
    gameBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('game.html') });
        window.close();
    });

    // ── Settings button ───────────────────────────────────────────────
    settingsBtn.addEventListener('click', () => {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open(chrome.runtime.getURL('options.html'));
        }
    });

    // ── Render state (ON / OFF views) ────────────────────────────────
    function renderState(isOn) {
        if (isOn) {
            // Focus is ACTIVE
            timerDisplay.textContent    = 'LOCKED IN';
            timerDisplay.style.fontSize = '30px';
            timerDisplay.classList.add('active');
            timerLabel.textContent      = 'DISTRACTIONS BLOCKED';

            stateOn.style.display  = 'flex';
            stateOff.style.display = 'none';
        } else {
            // Focus is OFF
            timerDisplay.textContent    = 'READY';
            timerDisplay.style.fontSize = '42px';
            timerDisplay.classList.remove('active');
            timerLabel.textContent      = 'ACTIVATE TO FOCUS';

            stateOn.style.display  = 'none';
            stateOff.style.display = 'flex';
        }
    }

    // ── Load blocked sites list ───────────────────────────────────────
    const DEFAULT_SITES = ['Instagram', 'Facebook', 'Reddit', 'Twitter', 'Netflix', 'YouTube Shorts'];

    chrome.storage.local.get(['customBlocklist'], (result) => {
        const custom   = result.customBlocklist || [];
        const allSites = [...DEFAULT_SITES, ...custom];

        blockedList.innerHTML = '';
        allSites.forEach(site => {
            const li = document.createElement('li');
            li.textContent = site;
            blockedList.appendChild(li);
        });
    });

});
