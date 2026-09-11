/**
 * Easter Eggs & Fun Interactions for baa-bye.com
 * Handles:
 * - "grass" easter egg (frenzy mode + clover confetti + rapid eating)
 * - "goat" easter egg (sunglasses + royalty message + fanfare)
 * - Typing speed frenzy detector
 * - Random idle goat speech comments
 * - Poke / click interaction on the goat
 */

class EasterEggManager {
  constructor() {
    this.randomComments = [
      "MORE.",
      "I'M HUNGRY.",
      "KEEP TYPING.",
      "THAT'S IT?",
      "WHERE IS THE GRASS?",
      "DON'T STOP.",
      "Mmm, crispy vowels.",
      "The punctuation is a bit spicy today.",
      "Are you typing or taking a nap?",
      "Need more fiber in my web diet.",
      "FEED THE BEAST!",
      "I like the letter 'e'. Tastes like chicken."
    ];

    this.idleCommentTimer = null;
    this.grassTriggered = false;
    this.goatTriggered = false;
  }

  init() {
    this.startRandomComments();
    this.setupGoatClick();
  }

  /**
   * Scans typed text for easter egg triggers
   */
  checkKeywords(text) {
    const lower = (text || '').toLowerCase();

    // 1. GRASS EASTER EGG
    if (lower.includes('grass') && !this.grassTriggered) {
      this.triggerGrassMode();
    }

    // 2. GOAT EASTER EGG
    if (lower.includes('goat') && !this.goatTriggered) {
      this.triggerGoatMode();
    }
  }

  /**
   * "grass" easter egg: Wild frenzy eating, clover confetti, celebratory bleat
   */
  triggerGrassMode() {
    this.grassTriggered = true;
    window.goat.setFrenzy(true);

    if (window.soundEngine) {
      window.soundEngine.playBleat('excited');
      window.soundEngine.playFanfare();
    }

    this.spawnGrassConfetti();

    // Frenzy lasts 6 seconds then calms down
    setTimeout(() => {
      window.goat.setFrenzy(false);
      this.grassTriggered = false;
    }, 6000);
  }

  /**
   * "goat" easter egg: Sunglasses, golden glow, royal message
   */
  triggerGoatMode() {
    this.goatTriggered = true;
    window.goat.toggleSunglasses(true);

    setTimeout(() => {
      this.goatTriggered = false;
    }, 8000);
  }

  /**
   * High typing speed (> 260 CPM) trigger
   */
  triggerSpeedFrenzy() {
    if (window.goat.state === 'EATING' && !window.goat.isFrenzy) {
      window.goat.say("⚡ TURBO NOM! ⚡", 1500);
    }
  }

  /**
   * Confetti explosion of clovers and grass blades
   */
  spawnGrassConfetti() {
    const fxLayer = document.getElementById('fx-layer');
    if (!fxLayer) return;

    const emojis = ['🌿', '🍀', '🌱', '🌾', '☘️'];
    const count = 35;

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'grass-particle';
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];

      el.style.left = `${Math.random() * 100}vw`;
      el.style.top = `-40px`;
      el.style.fontSize = `${18 + Math.random() * 22}px`;
      el.style.animationDuration = `${1.8 + Math.random() * 2.2}s`;
      el.style.animationDelay = `${Math.random() * 0.5}s`;

      fxLayer.appendChild(el);

      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 4500);
    }
  }

  /**
   * Poke / Click the goat
   */
  setupGoatClick() {
    const goatStage = document.getElementById('goat-stage');
    if (!goatStage) return;

    goatStage.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.init();

      if (window.goat.state === 'SLEEPING') {
        window.goat.setState('WATCHING');
        window.goat.say("WHAT?! I was dreaming of clover!", 3000);
        if (window.soundEngine) window.soundEngine.playBleat('grumpy');
      } else {
        const reactions = [
          "Hey! Don't poke me, feed me letters!",
          "Baaaa! Keep typing!",
          "I'm not a touchscreen animal!",
          "Less poking, more typing!"
        ];
        const quote = reactions[Math.floor(Math.random() * reactions.length)];
        window.goat.say(quote, 2500);
        if (window.soundEngine) window.soundEngine.playBleat('normal');
      }

      // Little bounce animation
      goatStage.classList.add('poked-bounce');
      setTimeout(() => goatStage.classList.remove('poked-bounce'), 400);
    });
  }

  /**
   * Periodic random thoughts from the goat while user is resting
   */
  startRandomComments() {
    this.idleCommentTimer = setInterval(() => {
      if (window.goat.state === 'WATCHING' || window.goat.state === 'FULL') {
        // 40% chance of random quip
        if (Math.random() < 0.4) {
          const comment = this.randomComments[Math.floor(Math.random() * this.randomComments.length)];
          window.goat.say(comment, 2500);
        }
      }
    }, 8000);
  }
}

// Export singleton
window.easterEggs = new EasterEggManager();
