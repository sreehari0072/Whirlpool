/**
 * Typing & Character-Eating Physics Engine for baa-bye.com
 * Handles character extraction, floating letter projectile animations,
 * crumb particle bursts, caret positioning, and typing cadence tracking.
 */

class EatingEngine {
  constructor() {
    this.textarea = null;
    this.counterEl = null;
    this.speedEl = null;
    this.fullnessEl = null;

    this.totalEaten = 0;
    this.sessionEaten = 0;
    this.eatenHistory = '';
    this.recentChars = [];

    this.isEating = false;
    this.eatQueue = [];
    this.eatInterval = null;

    // Typing speed calculation
    this.keystrokes = [];
    this.currentCpm = 0;

    // Wakeup threshold: characters required before goat starts eating
    this.WAKE_THRESHOLD = 3;
    this.HUNGRY_THRESHOLD = 5;

    this.onBurpNeeded = null;
  }

  init(textareaEl, counterEl, speedEl, fullnessEl, onBurpCallback) {
    this.textarea = textareaEl;
    this.counterEl = counterEl;
    this.speedEl = speedEl;
    this.fullnessEl = fullnessEl;
    this.onBurpNeeded = onBurpCallback;

    this.setupListeners();
  }

  setupListeners() {
    if (!this.textarea) return;

    this.textarea.addEventListener('input', (e) => {
      this.handleInput(e);
    });

    this.textarea.addEventListener('keydown', (e) => {
      // Audio warmup on first keystroke
      if (window.soundEngine) window.soundEngine.init();
      this.recordKeystroke();
    });
  }

  recordKeystroke() {
    const now = performance.now();
    this.keystrokes.push(now);
    // Keep only strokes from last 3 seconds
    this.keystrokes = this.keystrokes.filter(t => now - t < 3000);

    // Characters per minute calculation
    const cpm = Math.round((this.keystrokes.length / 3) * 60);
    this.currentCpm = cpm;
    if (this.speedEl) {
      this.speedEl.textContent = `${cpm} CPM`;
    }

    // Check for high-speed frenzy
    if (cpm > 260 && window.easterEggs) {
      window.easterEggs.triggerSpeedFrenzy();
    }
  }

  handleInput(e) {
    const text = this.textarea.value;
    const len = text.length;

    // Check Easter egg keywords
    if (window.easterEggs) {
      window.easterEggs.checkKeywords(text);
    }

    // State 1: Sleeping if empty
    if (len === 0) {
      if (this.totalEaten === 0) {
        window.goat.setState('SLEEPING');
      }
      return;
    }

    // State 2: Watching (first 1 to 4 letters)
    if (len > 0 && len < this.WAKE_THRESHOLD) {
      window.goat.setState('WATCHING');
      return;
    }

    // State 3: Hungry (3-5 letters)
    if (len >= this.WAKE_THRESHOLD && len < this.HUNGRY_THRESHOLD) {
      window.goat.setState('HUNGRY');
      return;
    }

    // State 4: EATING! (5+ letters)
    if (len >= this.HUNGRY_THRESHOLD) {
      window.goat.setState('EATING');
      this.scheduleMeal();
    }
  }

  /**
   * Schedules character consumption
   */
  scheduleMeal() {
    if (this.eatInterval) return;

    // Eating cadence: faster if user types fast or if in frenzy mode
    const intervalMs = window.goat.isFrenzy ? 80 : Math.max(90, 220 - Math.min(130, this.currentCpm * 0.5));

    this.eatInterval = setInterval(() => {
      const text = this.textarea.value;

      // Stop eating when down to 1 character so user isn't left completely blank instantly
      if (text.length <= 1) {
        this.stopEatingLoop();
        if (text.length === 0 && this.sessionEaten === 0) {
          window.goat.setState('SLEEPING');
        } else {
          window.goat.setState('FULL');
        }
        return;
      }

      this.eatNextCharacter();
    }, intervalMs);
  }

  stopEatingLoop() {
    if (this.eatInterval) {
      clearInterval(this.eatInterval);
      this.eatInterval = null;
    }
    if (window.goat.state === 'EATING') {
      window.goat.stopChomping();
      window.goat.setState('FULL');
    }
  }

  /**
   * Eats one character from the textarea, creates a flying token, and sends it to the goat's mouth
   */
  eatNextCharacter() {
    const val = this.textarea.value;
    if (!val || val.length === 0) return;

    // Take character from end or cursor
    const charIndex = val.length - 1;
    const eatenChar = val[charIndex];
    
    // Remove the character from textarea cleanly
    this.textarea.value = val.slice(0, charIndex);

    // Save to eaten history
    this.eatenHistory += eatenChar;
    this.sessionEaten++;
    this.totalEaten++;

    // Calculate source coordinate
    const sourcePos = this.getCaretPositionEstimate();

    // Spawn flying animated letter token
    this.spawnFlyingLetter(eatenChar, sourcePos);

    // Update counters
    this.updateHUD();
  }

  /**
   * Approximates caret position inside textarea for projectile origin
   */
  getCaretPositionEstimate() {
    const rect = this.textarea.getBoundingClientRect();
    // Position near the bottom-right of typed text
    const textLen = this.textarea.value.length;
    const padding = 20;
    const lineHeight = 24;
    const approxCharWidth = 9;

    const availableWidth = rect.width - padding * 2;
    const charsPerLine = Math.max(10, Math.floor(availableWidth / approxCharWidth));
    const lineNumber = Math.min(8, Math.floor(textLen / charsPerLine));
    const colNumber = textLen % charsPerLine;

    const x = rect.left + padding + colNumber * approxCharWidth;
    const y = rect.top + padding + lineNumber * lineHeight;

    return {
      x: Math.min(rect.right - 15, Math.max(rect.left + 15, x)),
      y: Math.min(rect.bottom - 15, Math.max(rect.top + 15, y))
    };
  }

  /**
   * Spawns a floating letter projectile that travels in an arc to the goat's mouth
   */
  spawnFlyingLetter(char, startPos) {
    // Play detach pop
    if (window.soundEngine) {
      window.soundEngine.playPop();
    }

    const fxLayer = document.getElementById('fx-layer');
    if (!fxLayer) return;

    const token = document.createElement('div');
    token.className = 'flying-letter';
    token.textContent = char === ' ' ? '␣' : char;

    token.style.left = `${startPos.x}px`;
    token.style.top = `${startPos.y}px`;

    fxLayer.appendChild(token);

    // Target mouth coordinates
    const mouthPos = window.goat.getMouthCoordinates();

    // Random trajectory curvature
    const midX = (startPos.x + mouthPos.x) / 2 + (Math.random() * 80 - 40);
    const midY = Math.min(startPos.y, mouthPos.y) - (40 + Math.random() * 60);

    const startTime = performance.now();
    const duration = window.goat.isFrenzy ? 280 : 380; // ms flight duration

    const animateFlight = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);

      // Quadratic bezier curve interpolation
      const invT = 1 - t;
      const currentX = invT * invT * startPos.x + 2 * invT * t * midX + t * t * mouthPos.x;
      const currentY = invT * invT * startPos.y + 2 * invT * t * midY + t * t * mouthPos.y;

      const scale = 1.0 + Math.sin(t * Math.PI) * 0.4 - t * 0.5;
      const rot = t * 360 * (startPos.x > mouthPos.x ? -1 : 1);

      token.style.transform = `translate(${currentX - startPos.x}px, ${currentY - startPos.y}px) rotate(${rot}deg) scale(${scale})`;

      if (t < 1) {
        requestAnimationFrame(animateFlight);
      } else {
        // Impact at goat mouth!
        this.onLetterEaten(char, mouthPos);
        if (token.parentNode) token.parentNode.removeChild(token);
      }
    };

    requestAnimationFrame(animateFlight);
  }

  /**
   * Called when a flying letter lands in the goat's mouth
   */
  onLetterEaten(char, mouthPos) {
    // 1. Play crunch audio with pitch modulation
    if (window.soundEngine) {
      const pitchMultiplier = 1.0 + Math.min(0.8, this.currentCpm / 250);
      window.soundEngine.playNom(pitchMultiplier);
    }

    // 2. Feed goat visually (belly scales, jaw snaps)
    window.goat.feed(1);

    // 3. Burst of crumbs
    this.spawnCrumbs(mouthPos);

    // 4. Update stats
    if (window.leaderboard) {
      window.leaderboard.recordLetterEaten();
    }

    // 5. Notify activity to keep idle burp timer armed
    if (this.onBurpNeeded) {
      this.onBurpNeeded();
    }
  }

  /**
   * Spawns crunchy letter crumbs / particles bursting from goat's mouth
   */
  spawnCrumbs(mouthPos) {
    const fxLayer = document.getElementById('fx-layer');
    if (!fxLayer) return;

    const crumbChars = ['.', '·', '°', '•', '*', '✨'];
    const crumbCount = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < crumbCount; i++) {
      const crumb = document.createElement('span');
      crumb.className = 'crumb-particle';
      crumb.textContent = crumbChars[Math.floor(Math.random() * crumbChars.length)];

      const angle = Math.random() * Math.PI * 2;
      const speed = 25 + Math.random() * 45;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed - 15;

      crumb.style.left = `${mouthPos.x}px`;
      crumb.style.top = `${mouthPos.y}px`;
      crumb.style.setProperty('--dx', `${dx}px`);
      crumb.style.setProperty('--dy', `${dy}px`);

      fxLayer.appendChild(crumb);

      setTimeout(() => {
        if (crumb.parentNode) crumb.parentNode.removeChild(crumb);
      }, 500);
    }
  }

  updateHUD() {
    if (this.counterEl) {
      this.counterEl.textContent = `GOAT ATE: ${this.totalEaten} LETTERS`;
    }

    if (this.fullnessEl) {
      let status = 'STARVING';
      if (this.totalEaten > 150) status = 'ABSOLUTE UNIT 🪐';
      else if (this.totalEaten > 80) status = 'CHUNKY BOY 🦹';
      else if (this.totalEaten > 40) status = 'STUFFED 🍗';
      else if (this.totalEaten > 15) status = 'SNACKING 🍪';
      else if (this.totalEaten > 0) status = 'AWAKE 👀';

      this.fullnessEl.textContent = `HUNGER: ${status}`;
    }
  }

  resetSession() {
    this.sessionEaten = 0;
    this.eatenHistory = '';
    this.stopEatingLoop();
  }
}

// Export singleton
window.eatingEngine = new EatingEngine();
