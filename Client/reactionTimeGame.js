// === API config ===
const API_BASE = 'http://localhost:3000';             // change to your deployed API
const POST_URL  = `${API_BASE}/api/reaction-time`;

// === DOM ===
const gameArea   = document.getElementById('gameArea');
const scoreboard = document.getElementById('scoreboard');
const startBtn   = document.getElementById('startBtn');

// === Game constants (tweak as needed) ===
const GAME_DURATION_MS   = 30_000;                    // whole game duration
const TARGET_SIZE_PX     = 80;                        // matches your CSS .target size
const TARGET_DELAY_MINMS = 500;                       // delay before next target (min)
const TARGET_DELAY_SPREAD= 1000;                      // +random up to this
const TRIAL_TIMEOUT_MS   = 2000;                      // miss if not clicked in this time

// === Utilities ===
async function postJSON(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`POST ${url} failed ${res.status}: ${txt}`);
  }
  return res.json();
}

// === One game run state (reset every start) ===
let state = null;

function newState() {
  return {
    // scoreboard metrics
    score: 0,
    totalReaction: 0,
    attempts: 0,

    // trial tracking
    trialIndex: 0,
    playing: false,
    startTime: 0,

    // handles to clear on restart
    nextSpawnTimer: null,
    gameEndTimer: null,
    trialTimeoutTimer: null,

    // active target element
    targetEl: null,
  };
}

function clearTimers(s) {
  if (!s) return;
  [s.nextSpawnTimer, s.gameEndTimer, s.trialTimeoutTimer]
    .forEach(h => h && clearTimeout(h));
  s.nextSpawnTimer = s.gameEndTimer = s.trialTimeoutTimer = null;
}

function removeTarget(s) {
  if (s?.targetEl && s.targetEl.parentNode) {
    s.targetEl.remove();
  }
  s.targetEl = null;
}

// === Core game functions ===
function spawnTarget() {
  if (!state?.playing) return;

  // Clean previous target/timeout if any
  removeTarget(state);
  if (state.trialTimeoutTimer) {
    clearTimeout(state.trialTimeoutTimer);
    state.trialTimeoutTimer = null;
  }

  // Create target
  const target = document.createElement('div');
  target.classList.add('target');
  target.style.position = 'absolute';
  const x = Math.random() * Math.max(0, gameArea.clientWidth  - TARGET_SIZE_PX);
  const y = Math.random() * Math.max(0, gameArea.clientHeight - TARGET_SIZE_PX);
  target.style.left = `${x}px`;
  target.style.top  = `${y}px`;

  gameArea.appendChild(target);
  state.targetEl = target;

  // Start trial
  const thisTrial = state.trialIndex++;               // increment per trial
  state.startTime = Date.now();

  // CLICK handler (hit = not missed)
  const onClick = () => {
    if (!state.playing) return;
    const reactionTime = Date.now() - state.startTime;

    state.totalReaction += reactionTime;
    state.attempts += 1;
    state.score += 1;

    updateScoreboard();

    // Send to backend (Missed: false)
    const payload = {
      TrialIndex: thisTrial,
      reactionTimeMS: reactionTime,
      Missed: false,
      // If your backend requires AvgReactionTime, you can include:
      // AvgReactionTime: Math.round(state.totalReaction / state.attempts)
    };
    postJSON(POST_URL, payload).catch(err => console.error('POST fail:', err));

    // Clean up and schedule next
    target.removeEventListener('click', onClick);
    removeTarget(state);
    if (state.trialTimeoutTimer) {
      clearTimeout(state.trialTimeoutTimer);
      state.trialTimeoutTimer = null;
    }

    if (state.playing) {
      const delay = TARGET_DELAY_MINMS + Math.random() * TARGET_DELAY_SPREAD;
      state.nextSpawnTimer = setTimeout(spawnTarget, delay);
    }
  };

  target.addEventListener('click', onClick);

  // TRIAL TIMEOUT → Missed
  state.trialTimeoutTimer = setTimeout(() => {
    if (!state.playing || !state.targetEl) return;

    state.attempts += 1; // an attempt happened but missed
    updateScoreboard();

    // Send to backend (Missed: true)
    const payload = {
      TrialIndex: thisTrial,
      reactionTimeMS: 0, // or null if your backend allows
      Missed: true,
      // AvgReactionTime: Math.round(state.attempts ? state.totalReaction / state.attempts : 0)
    };
    postJSON(POST_URL, payload).catch(err => console.error('POST fail:', err));

    removeTarget(state);

    if (state.playing) {
      const delay = TARGET_DELAY_MINMS + Math.random() * TARGET_DELAY_SPREAD;
      state.nextSpawnTimer = setTimeout(spawnTarget, delay);
    }
  }, TRIAL_TIMEOUT_MS);
}

function updateScoreboard() {
  const avg = state.attempts ? Math.round(state.totalReaction / state.attempts) : 0;
  scoreboard.innerText = `Score: ${state.score} | Avg Reaction: ${avg} ms`;
}

function startGame() {
  // Reset previous game safely
  clearTimers(state);
  removeTarget(state);

  // Fresh state
  state = newState();
  state.playing = true;

  // UI reset
  scoreboard.innerText = 'Score: 0 | Avg Reaction: 0 ms';
  startBtn.disabled = true;

  // Start spawning targets
  spawnTarget();

  // End the game after GAME_DURATION_MS
  state.gameEndTimer = setTimeout(() => {
    state.playing = false;

    // Clear any pending timers/targets
    clearTimers(state);
    removeTarget(state);

    const avg = state.attempts ? Math.round(state.totalReaction / state.attempts) : 0;
    alert(`⏱️ Time's up!\nYour Score: ${state.score}\nAvg Reaction: ${avg} ms`);

    startBtn.disabled = false;
  }, GAME_DURATION_MS);
}

// === Wire start button ===
startBtn.addEventListener('click', startGame);
