/**
 * Leaderboard & Player Stats Manager for baa-bye.com
 * Handles localStorage persistence, rank titles, and the high scores modal.
 */

class LeaderboardManager {
  constructor() {
    this.STORAGE_KEY = 'goatlife_leaderboard';
    this.STATS_KEY = 'goatlife_stats';

    this.stats = this.loadStats();
    this.scores = this.loadScores();
  }

  loadStats() {
    const raw = localStorage.getItem(this.STATS_KEY) || localStorage.getItem('baa_bye_stats');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        // Fall through
      }
    }
    return {
      allTimeLetters: 0,
      totalBurps: 0,
      bestSession: 0,
      playerName: 'HungryHuman'
    };
  }

  saveStats() {
    localStorage.setItem(this.STATS_KEY, JSON.stringify(this.stats));
  }

  loadScores() {
    const raw = localStorage.getItem(this.STORAGE_KEY) || localStorage.getItem('baa_bye_leaderboard');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }
    // Default mock leaderboard for initial fun
    return [
      { name: 'EssayProcrastinator', letters: 412, title: 'Alphabet Black Hole 🪐' },
      { name: 'BillyTheKid', letters: 265, title: 'Master Grazier 🌾' },
      { name: 'CatOnKeyboard', letters: 180, title: 'Keysmash Gourmet 🐾' },
      { name: 'GrassEnthusiast', letters: 135, title: 'Clover Snacker 🍀' },
      { name: 'SleepyCoder', letters: 88, title: 'Diet Ruiner 🥱' }
    ];
  }

  saveScores() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.scores));
  }

  recordLetterEaten() {
    this.stats.allTimeLetters++;
    this.saveStats();
  }

  recordBurp(sessionLetters) {
    this.stats.totalBurps++;
    if (sessionLetters > this.stats.bestSession) {
      this.stats.bestSession = sessionLetters;
    }
    this.saveStats();
  }

  getTitleForScore(letters) {
    if (letters >= 300) return 'Alphabet Black Hole 🪐';
    if (letters >= 200) return 'Absolute Planetary Unit 🐐';
    if (letters >= 120) return 'Master Grazier 🌾';
    if (letters >= 60) return 'Cardboard Connoisseur 📦';
    if (letters >= 25) return 'Snack Supplier 🍪';
    return 'Light Appetizer 🥗';
  }

  addScore(name, letters) {
    if (!letters || letters <= 0) return;
    const cleanName = (name || 'Anonymous Feeder').trim().slice(0, 18);
    const title = this.getTitleForScore(letters);

    this.scores.push({
      name: cleanName,
      letters: letters,
      title: title,
      date: new Date().toLocaleDateString()
    });

    // Sort descending by letters
    this.scores.sort((a, b) => b.letters - a.letters);
    // Keep top 10
    this.scores = this.scores.slice(0, 10);
    this.saveScores();
    this.renderModal();
  }

  renderModal() {
    const listEl = document.getElementById('leaderboard-list');
    const allTimeEl = document.getElementById('stats-alltime');
    const bestEl = document.getElementById('stats-best');
    const burpsEl = document.getElementById('stats-burps');

    if (allTimeEl) allTimeEl.textContent = this.stats.allTimeLetters;
    if (bestEl) bestEl.textContent = this.stats.bestSession;
    if (burpsEl) burpsEl.textContent = this.stats.totalBurps;

    if (!listEl) return;
    listEl.innerHTML = '';

    this.scores.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'leaderboard-row';
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;

      row.innerHTML = `
        <span class="lb-rank">${medal}</span>
        <div class="lb-info">
          <span class="lb-name">${this.escapeHTML(item.name)}</span>
          <span class="lb-title">${item.title}</span>
        </div>
        <span class="lb-score">${item.letters} <small>letters</small></span>
      `;
      listEl.appendChild(row);
    });
  }

  escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }
}

// Export singleton
window.leaderboard = new LeaderboardManager();
