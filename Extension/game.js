// game.js — Frame-Out Sliding Puzzle Challenge

let tiles = []; // [1, 2, 3, 4, 5, 6, 7, 8, null]
let moves = 0;
let seconds = 0;
let timerInterval = null;
const gridElement = document.getElementById('puzzleGrid');

// ─── Screen helpers ────────────────────────────────────────────────
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });
    const target = document.getElementById(id);
    target.style.display = 'flex';
    target.classList.add('active');
}

// ─── Puzzle Logic ──────────────────────────────────────────────────
function initPuzzle() {
    tiles = [1, 2, 3, 4, 5, 6, 7, 8, null];
    shuffleTiles();
    renderGrid();
    moves = 0;
    seconds = 0;
    updateHUD();
    startTimer();
}

function shuffleTiles() {
    // To ensure solvability, we do random valid moves instead of random shuffle
    let shuffleMoves = 100;
    while (shuffleMoves > 0) {
        const emptyIndex = tiles.indexOf(null);
        const neighbors = getNeighbors(emptyIndex);
        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        
        // Swap
        tiles[emptyIndex] = tiles[randomNeighbor];
        tiles[randomNeighbor] = null;
        shuffleMoves--;
    }
}

function getNeighbors(index) {
    const neighbors = [];
    const row = Math.floor(index / 3);
    const col = index % 3;

    if (row > 0) neighbors.push(index - 3); // top
    if (row < 2) neighbors.push(index + 3); // bottom
    if (col > 0) neighbors.push(index - 1); // left
    if (col < 2) neighbors.push(index + 1); // right
    
    return neighbors;
}

function renderGrid() {
    gridElement.innerHTML = '';
    tiles.forEach((tile, index) => {
        const div = document.createElement('div');
        div.className = `tile ${tile === null ? 'empty' : ''}`;
        if (tile !== null) {
            div.textContent = tile;
            // Highlight if in correct position
            if (tile === index + 1) div.classList.add('correct');
            div.addEventListener('click', () => handleTileClick(index));
        }
        gridElement.appendChild(div);
    });
}

function handleTileClick(index) {
    const emptyIndex = tiles.indexOf(null);
    const neighbors = getNeighbors(index);

    if (neighbors.includes(emptyIndex)) {
        // Swap
        tiles[emptyIndex] = tiles[index];
        tiles[index] = null;
        moves++;
        renderGrid();
        updateHUD();
        checkWin();
    }
}

function checkWin() {
    const isWin = tiles.slice(0, 8).every((tile, index) => tile === index + 1);
    if (isWin) {
        endGame(true);
    }
}

// ─── HUD & Timer ───────────────────────────────────────────────────
function updateHUD() {
    document.getElementById('moveDisplay').textContent = moves;
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        seconds++;
        const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        document.getElementById('timerDisplay').textContent = `${mins}:${secs}`;
    }, 1000);
}

// ─── End Game ──────────────────────────────────────────────────────
function endGame(won) {
    clearInterval(timerInterval);
    if (won) {
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.sendMessage({ action: 'disableFocus' }, (response) => {
                if (chrome.runtime.lastError) console.warn(chrome.runtime.lastError.message);
            });
        }
        document.getElementById('winStats').textContent = `Solved in ${moves} moves and ${seconds}s`;
        showScreen('screen-win');
    }
}

// ─── Listeners ─────────────────────────────────────────────────────
document.getElementById('startBtn').addEventListener('click', () => {
    showScreen('screen-game');
    initPuzzle();
});

document.getElementById('resetBtn').addEventListener('click', () => {
    initPuzzle();
});

document.getElementById('winCloseBtn').addEventListener('click', () => {
    window.close();
});

// Init
showScreen('screen-intro');
