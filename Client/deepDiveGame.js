// === API config ===
const API_BASE = 'http://localhost:3000'; // change to your deployed API later
const POST_URL  = `${API_BASE}/api/deep-dive-game`;

// === DOM elements (assumes these IDs exist) ===
const totalScoreEl  = document.getElementById('totalScore');
const currentDiveEl = document.getElementById('currentDive');
const diverEl       = document.getElementById('diver');
const startBtn      = document.getElementById('startDeepDive'); // optional "New Game" button
const surfaceBtn    = document.getElementById('surfaceBtn');     // your Surface button
const diveBtn       = document.getElementById('diveBtn');        // your Dive button

// === Helpers ===
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

// === Game state (reset per "game instance") ===
let game = null;

function newGame() {
  game = {
    // totals across this game instance
    totalScore: 0,
    roundsCompleted: 0,
    totalClicksAllRounds: 0,
    maxPointsSoFar: 0,

    // per-round counters
    divePoints: 0,       // points accumulated this round
    clicksThisRound: 0,  // number of times "Dive" clicked this round
    risk: 0.05,
    depth: 0,
  };

  updateScores();             // update UI
  setDiverY(0);
  console.log('DeepDive: new game started');
}

// === UI helpers ===
function updateScores() {
  totalScoreEl.textContent  = `Total Score: ${game.totalScore}`;
  currentDiveEl.textContent = `Current Dive Points: ${game.divePoints}`;
}

function setDiverY(px) {
  diverEl.style.transform = `translateY(${px}px)`;
}

// === Round lifecycle ===
function endRound({ reason }) {
  // Determine points for this round:
  // - If surfaced: points = divePoints (already added to totalScore by surface()).
  // - If failed:   points = 0 (you already apply -5 to totalScore elsewhere).
  const pointsThisRound = (reason === 'surface') ? game.divePoints : 0;

  // Update running totals
  game.roundsCompleted += 1;
  game.totalClicksAllRounds += game.clicksThisRound;
  game.maxPointsSoFar = Math.max(game.maxPointsSoFar, pointsThisRound);

  const avgClicks =
    game.roundsCompleted > 0
      ? game.totalClicksAllRounds / game.roundsCompleted
      : 0;

  // Build payload for backend
  const payload = {
    roundIndex: game.roundsCompleted - 1,             // 0-based
    clicksPerRound: game.clicksThisRound,
    AvgClicksPerRound: Number(avgClicks.toFixed(2)),
    points: pointsThisRound,
    maxPoints: game.maxPointsSoFar,
  };

  // POST one record per round
  postJSON(POST_URL, payload)
    .then(res => console.log('DeepDive round saved:', res))
    .catch(err => console.error('DeepDive POST failed:', err));

  // Reset per-round counters
  game.divePoints = 0;
  game.clicksThisRound = 0;
  game.risk = 0.05;
  game.depth = 0;
  updateScores();
  setDiverY(0);
}

// === Original actions (instrumented) ===
function dive() {
  // per-round counters
  game.clicksThisRound += 1;
  game.divePoints += 1;
  game.depth += 30;          // move diver down
  game.risk += 0.02;

  currentDiveEl.textContent = `Current Dive Points: ${game.divePoints}`;
  setDiverY(game.depth);

  // Risk check → failure ends the round
  if (Math.random() < game.risk) {
    alert('⚠️ Equipment failure! You lost 5 points.');
    game.totalScore = Math.max(0, game.totalScore - 5);
    updateScores();
    endRound({ reason: 'fail' });    // points = 0 for this round
  }
}

function surface() {
  // Banking current round points
  game.totalScore += game.divePoints;
  updateScores();
  endRound({ reason: 'surface' });   // points = divePoints for this round
}

// === Wire buttons ===
if (diveBtn)    diveBtn.addEventListener('click', dive);
if (surfaceBtn) surfaceBtn.addEventListener('click', surface);
if (startBtn)   startBtn.addEventListener('click', newGame);

// Start first game on page load
newGame();
