// options.js - Logic for extension settings

document.addEventListener('DOMContentLoaded', () => {
    const siteInput = document.getElementById('siteInput');
    const addBtn = document.getElementById('addBtn');
    const customList = document.getElementById('customList');
    const blockShorts = document.getElementById('blockShorts');
    const blockReels = document.getElementById('blockReels');
    const blockAds = document.getElementById('blockAds');
    const focusDuration = document.getElementById('focusDuration');

    // Load saved settings
    chrome.storage.local.get(['customBlocklist', 'blockShorts', 'blockReels', 'blockAds', 'focusDuration'], (result) => {
        const list = result.customBlocklist || [];
        list.forEach(site => addSiteToUI(site));

        blockShorts.checked = result.blockShorts !== false;
        blockReels.checked = result.blockReels !== false;
        blockAds.checked = result.blockAds !== false;
        focusDuration.value = result.focusDuration || 25;
    });

    // Add site event
    addBtn.addEventListener('click', () => {
        const site = siteInput.value.trim().toLowerCase();
        if (site) {
            chrome.storage.local.get(['customBlocklist'], (result) => {
                const list = result.customBlocklist || [];
                if (!list.includes(site)) {
                    list.push(site);
                    chrome.storage.local.set({ customBlocklist: list }, () => {
                        addSiteToUI(site);
                        siteInput.value = '';
                        notifyBackground();
                    });
                }
            });
        }
    });

    // Toggle preferences
    blockShorts.addEventListener('change', () => {
        chrome.storage.local.set({ blockShorts: blockShorts.checked }, notifyBackground);
    });

    blockReels.addEventListener('change', () => {
        chrome.storage.local.set({ blockReels: blockReels.checked }, notifyBackground);
    });

    blockAds.addEventListener('change', () => {
        chrome.storage.local.set({ blockAds: blockAds.checked }, notifyBackground);
    });

    focusDuration.addEventListener('change', () => {
        const val = parseInt(focusDuration.value);
        if (val > 0 && val <= 180) {
            chrome.storage.local.set({ focusDuration: val });
        }
    });

    function addSiteToUI(site) {
        const li = document.createElement('li');
        li.className = 'list-item';
        li.innerHTML = `
            <span class="site-name">${site}</span>
            <button class="remove-btn" data-site="${site}">REMOVE</button>
        `;
        customList.appendChild(li);

        li.querySelector('.remove-btn').addEventListener('click', (e) => {
            const siteToRemove = e.target.getAttribute('data-site');
            removeSite(siteToRemove, li);
        });
    }

    function removeSite(site, element) {
        chrome.storage.local.get(['customBlocklist'], (result) => {
            let list = result.customBlocklist || [];
            list = list.filter(s => s !== site);
            chrome.storage.local.set({ customBlocklist: list }, () => {
                element.remove();
                notifyBackground();
            });
        });
    }

    function notifyBackground() {
        chrome.runtime.sendMessage({ action: 'updateRules' });
    }
});
