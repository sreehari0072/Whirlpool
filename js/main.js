/**
 * Main Application Coordinator for baa-bye.com
 * Glues together the UI, Goat Controller, Eating Engine, Roasts, Audio, and Modals.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const textarea = document.getElementById('user-input');
  const counterEl = document.getElementById('hud-counter');
  const speedEl = document.getElementById('hud-speed');
  const fullnessEl = document.getElementById('hud-fullness');
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const soundIcon = document.getElementById('sound-icon');
  const statsModalBtn = document.getElementById('stats-modal-btn');
  const closeStatsBtn = document.getElementById('close-stats-btn');
  const statsModal = document.getElementById('stats-modal');
  const clearBtn = document.getElementById('clear-btn');
  const burpBanner = document.getElementById('burp-result-banner');
  const burpEatenCount = document.getElementById('burp-eaten-count');
  const burpScrambled = document.getElementById('burp-scrambled-text');
  const burpRoast = document.getElementById('burp-roast-text');
  const saveScoreBtn = document.getElementById('save-score-btn');
  const feedAgainBtn = document.getElementById('feed-again-btn');
  const aiKeyBtn = document.getElementById('ai-key-btn');
  const aiKeyModal = document.getElementById('ai-key-modal');
  const closeAiKeyBtn = document.getElementById('close-ai-btn');
  const saveAiKeyBtn = document.getElementById('save-ai-key-btn');
  const apiKeyInput = document.getElementById('api-key-input');

  let idleTimer = null;
  const IDLE_DELAY_MS = 2400; // 2.4s idle triggers burp event

  function armIdleBurpTimer() {
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
    if (window.eatingEngine.sessionEaten > 0) {
      idleTimer = setTimeout(() => {
        triggerBurpSequence();
      }, IDLE_DELAY_MS);
    }
  }

  // 1. Initialize Subsystems
  window.goat.init();
  window.easterEggs.init();
  window.eatingEngine.init(textarea, counterEl, speedEl, fullnessEl, armIdleBurpTimer);

  // 2. Typing & Idle Burp Tracking
  textarea.addEventListener('input', () => {
    // Dismiss old burp banner if user starts a new sentence
    if (burpBanner && burpBanner.classList.contains('visible')) {
      burpBanner.classList.remove('visible');
      window.eatingEngine.resetSession();
    }

    armIdleBurpTimer();
  });

  /**
   * Triggers the hilarious burp sequence after typing ceases
   */
  async function triggerBurpSequence() {
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }

    const eatenCount = window.eatingEngine.sessionEaten;
    if (eatenCount === 0) return;

    // Stop active eating loop
    window.eatingEngine.stopEatingLoop();

    // Trigger Goat Burp State (screen shake, burp audio, smoke puff)
    window.goat.setState('BURPING');

    // Scramble sample of eaten text for comedic reveal
    const rawEaten = window.eatingEngine.eatenHistory;
    const scrambled = scrambleText(rawEaten.slice(-60));

    // Record stats
    window.leaderboard.recordBurp(eatenCount);

    // Fetch funny contextual roast
    const roast = await window.roastEngine.getRoast(rawEaten, eatenCount);

    // Display Goat speech
    window.goat.say(`*BURP!* ${roast}`, 5500);

    // Populate burp summary banner
    if (burpEatenCount) burpEatenCount.textContent = eatenCount;
    if (burpScrambled) burpScrambled.textContent = `"${scrambled}"`;
    if (burpRoast) burpRoast.textContent = `"${roast}"`;
    if (burpBanner) {
      setTimeout(() => {
        burpBanner.classList.add('visible');
      }, 500);
    }
  }

  /**
   * Scrambles text characters humorously
   */
  function scrambleText(str) {
    if (!str || str.length === 0) return '...burp...';
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  }

  // 3. Audio / Sound Toggle
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      window.soundEngine.init();
      const isMuted = window.soundEngine.toggleMute();
      soundIcon.textContent = isMuted ? '🔇' : '🔊';
      soundToggleBtn.classList.toggle('muted', isMuted);
    });
  }

  // 4. Feed Again / Clear
  function resetFeedSession() {
    if (idleTimer) clearTimeout(idleTimer);
    textarea.value = '';
    window.eatingEngine.resetSession();
    if (burpBanner) burpBanner.classList.remove('visible');
    window.goat.setState('SLEEPING');
    textarea.focus();
  }

  if (feedAgainBtn) feedAgainBtn.addEventListener('click', resetFeedSession);
  if (clearBtn) clearBtn.addEventListener('click', resetFeedSession);

  // 5. Save Score Button
  if (saveScoreBtn) {
    saveScoreBtn.addEventListener('click', () => {
      const count = window.eatingEngine.sessionEaten;
      if (count > 0) {
        const playerName = prompt("Enter your feeder name for the leaderboard:", window.leaderboard.stats.playerName || "HungryHuman");
        if (playerName !== null) {
          window.leaderboard.stats.playerName = playerName;
          window.leaderboard.addScore(playerName, count);
          openLeaderboard();
        }
      }
    });
  }

  // 6. Leaderboard Modal
  function openLeaderboard() {
    window.leaderboard.renderModal();
    if (statsModal) statsModal.classList.add('open');
  }

  function closeLeaderboard() {
    if (statsModal) statsModal.classList.remove('open');
  }

  if (statsModalBtn) statsModalBtn.addEventListener('click', openLeaderboard);
  if (closeStatsBtn) closeStatsBtn.addEventListener('click', closeLeaderboard);
  if (statsModal) {
    statsModal.addEventListener('click', (e) => {
      if (e.target === statsModal) closeLeaderboard();
    });
  }

  // 7. Optional AI Roast Key Modal
  if (aiKeyBtn) {
    aiKeyBtn.addEventListener('click', () => {
      if (apiKeyInput) apiKeyInput.value = window.roastEngine.geminiApiKey || '';
      if (aiKeyModal) aiKeyModal.classList.add('open');
    });
  }

  if (closeAiKeyBtn) {
    closeAiKeyBtn.addEventListener('click', () => {
      if (aiKeyModal) aiKeyModal.classList.remove('open');
    });
  }

  if (saveAiKeyBtn) {
    saveAiKeyBtn.addEventListener('click', () => {
      if (apiKeyInput) {
        window.roastEngine.setApiKey(apiKeyInput.value);
        if (aiKeyModal) aiKeyModal.classList.remove('open');
        alert(apiKeyInput.value ? "Gemini AI Roasts enabled!" : "Using offline roast library.");
      }
    });
  }

  // 8. Auto-focus textarea for quick hackathon demo
  setTimeout(() => {
    if (textarea) textarea.focus();
  }, 400);
});
