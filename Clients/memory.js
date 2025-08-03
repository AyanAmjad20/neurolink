//API
const API_BASE = 'http://localhost:3000';                
const POST_URL = `${API_BASE}/api/memory-game`;

//start or restart
function startGame() {
  const state = {
    totalCards: 0,
    timeTaken: 0,
    mistakes: 0,
    totalClicks: 0,
    correctFirstTry: 0,
    averageTimePerMatch: 0,
    completed: false,

    _pairAttempts: new Map(),     
    _matches: 0,
    _start: performance.now(),
    _posted: false,               
  };

  
  const emojis = ['🍎','🍌','🍇','🍒']; // 4 pairs
  const cards = [...emojis, ...emojis].sort(() => 0.5 - Math.random());
  state.totalCards = cards.length;

  const board = document.getElementById('game-board');
  const messageEl = document.getElementById('message');

  // Clear previous UI
  board.innerHTML = '';
  messageEl.textContent = '';

  if (board._handler) board.removeEventListener('click', board._handler);

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

      // Counting for first card emoji
      const key = a.dataset.emoji;
      state._pairAttempts.set(key, (state._pairAttempts.get(key) || 0) + 1);

      if (same) {
        state._matches++;

        if (state._pairAttempts.get(key) === 1) state.correctFirstTry++;

        flipped = [];
        lockBoard = false;

        // Win condition
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


  board._handler = onClick;
  board.addEventListener('click', onClick);
}


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


startGame();

// play again button
const playAgainBtn = document.getElementById('play-again');
if (playAgainBtn) {
  playAgainBtn.addEventListener('click', () => {
    startGame(); 
  });
}
