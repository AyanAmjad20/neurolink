// memory.js

// --- API config ---
const API_BASE = 'http://localhost:3000';                // your Express server
const POST_URL = `${API_BASE}/api/memory-game`;

// --- start (or restart) a game ---
function startGame() {
  // Fresh state for THIS game instance
  const state = {
    totalCards: 0,
    timeTaken: 0,
    mistakes: 0,
    totalClicks: 0,
    correctFirstTry: 0,
    averageTimePerMatch: 0,
    completed: false,

    _pairAttempts: new Map(),     // internal helper (not sent)
    _matches: 0,
    _start: performance.now(),
    _posted: false,               // guard against double-post
  };

  // Build deck and UI
  const emojis = ['🍎','🍌','🍇','🍒']; // 4 pairs
  const cards = [...emojis, ...emojis].sort(() => 0.5 - Math.random());
  state.totalCards = cards.length;

  const board = document.getElementById('game-board');
  const messageEl = document.getElementById('message');

  // Clear previous game UI
  board.innerHTML = '';
  messageEl.textContent = '';

  // Remove any previous click handler (prevents stacking when restarting mid-game)
  if (board._handler) board.removeEventListener('click', board._handler);

  // Render cards
  cards.forEach((emoji) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.emoji = emoji;
    card.innerHTML = `<div class="front">?</div><div class="back">${emoji}</div>`;
    board.appendChild(card);
  });

  let flipped = [];
  let lockBoard = false;

  function onClick(e) {
    const card = e.target.closest('.card');
    if (!card || lockBoard || card.classList.contains('flip')) return;

    state.totalClicks++;
    card.classList.add('flip');
    flipped.push(card);

    if (flipped.length === 2) {
      lockBoard = true;
      const [a, b] = flipped;
      const same = a.dataset.emoji === b.dataset.emoji;

      // Count attempt for first card's emoji
      const key = a.dataset.emoji;
      state._pairAttempts.set(key, (state._pairAttempts.get(key) || 0) + 1);

      if (same) {
        state._matches++;
        // First-try success if we matched on the first attempt for this pair
        if (state._pairAttempts.get(key) === 1) state.correctFirstTry++;

        flipped = [];
        lockBoard = false;

        // Win condition: matched all pairs
        if (state._matches === emojis.length) {
          state.completed = true;
          state.timeTaken = (performance.now() - state._start) / 1000; // seconds
          state.averageTimePerMatch = state.timeTaken / emojis.length;

          messageEl.textContent = '🎉 You Win!';

          if (!state._posted) {
            state._posted = true;

            const payload = {
              totalCards: state.totalCards,
              timeTaken: Number(state.timeTaken.toFixed(3)),
              mistakes: state.mistakes,
              totalClicks: state.totalClicks,
              correctFirstTry: state.correctFirstTry,
              averageTimePerMatch: Number(state.averageTimePerMatch.toFixed(3)),
              completed: true
            };

            postJSON(POST_URL, payload)
              .then((res) => console.log('Saved memory game:', res))
              .catch((err) => console.error('POST failed:', err))
              .finally(() => {
                // Remove handler for this instance
                board.removeEventListener('click', onClick);
              });
          }
        }
      } else {
        state.mistakes++;
        setTimeout(() => {
          a.classList.remove('flip');
          b.classList.remove('flip');
          flipped = [];
          lockBoard = false;
        }, 800);
      }
    }
  }

  // Save handler reference on the DOM node so we can remove it later
  board._handler = onClick;
  board.addEventListener('click', onClick);
}

// Simple JSON POST helper
async function postJSON(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`POST ${url} failed ${res.status}: ${text}`);
  }
  return res.json();
}

// Start first game on page load
startGame();

// Optional: “Play Again” button
const playAgainBtn = document.getElementById('play-again');
if (playAgainBtn) {
  playAgainBtn.addEventListener('click', () => {
    startGame(); // new state, counters reset
  });
}
