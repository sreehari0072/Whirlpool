/**
 * Goat State Machine & Dynamic SVG Animation Controller
 * Handles states: SLEEPING, WATCHING, HUNGRY, EATING, FULL, BURPING
 * Manages procedural eye tracking, jaw chomping, belly scaling, and accessories.
 */

class GoatController {
  constructor() {
    this.state = 'SLEEPING';
    this.bellyScale = 1.0;
    this.totalEaten = 0;
    this.isChomping = false;
    this.chompInterval = null;
    this.zzzInterval = null;
    this.targetPos = { x: 0, y: 0 };
    this.isFrenzy = false;
    this.isSunglassesOn = false;

    // DOM Elements (cached on init)
    this.container = null;
    this.svg = null;
    this.pupils = [];
    this.jaw = null;
    this.belly = null;
    this.eyesClosed = null;
    this.eyesOpen = null;
    this.mouth = null;
    this.exclamation = null;
    this.speechBubble = null;
    this.speechText = null;
    this.drool = null;
    this.sunglasses = null;
  }

  init() {
    this.container = document.getElementById('goat-stage');
    this.svg = document.getElementById('goat-svg');
    this.jaw = document.getElementById('goat-jaw');
    this.belly = document.getElementById('goat-belly');
    this.eyesClosed = document.querySelectorAll('.goat-eye-closed');
    this.eyesOpen = document.querySelectorAll('.goat-eye-open');
    this.pupils = document.querySelectorAll('.goat-pupil');
    this.exclamation = document.getElementById('goat-alert-mark');
    this.speechBubble = document.getElementById('goat-speech-bubble');
    this.speechText = document.getElementById('goat-speech-text');
    this.drool = document.getElementById('goat-drool');
    this.sunglasses = document.getElementById('goat-sunglasses');

    this.setupEyeTracking();
    this.setState('SLEEPING');
  }

  setState(newState) {
    if (this.state === newState && newState !== 'BURPING') return;
    this.state = newState;

    if (!this.container) return;
    this.container.setAttribute('data-state', newState);

    switch (newState) {
      case 'SLEEPING':
        this.setEyes(false);
        this.stopChomping();
        this.hideDrool();
        this.hideAlert();
        this.startZzz();
        break;

      case 'WATCHING':
      case 'AWAKE':
        this.stopZzz();
        this.setEyes(true);
        this.stopChomping();
        this.showAlert();
        this.hideDrool();
        break;

      case 'HUNGRY':
        this.stopZzz();
        this.setEyes(true);
        this.stopChomping();
        this.showDrool();
        this.hideAlert();
        break;

      case 'WALKING_TO_TEXT':
        this.stopZzz();
        this.setEyes(true);
        this.stopChomping();
        this.hideAlert();
        this.hideDrool();
        this.walkTo(this.calculateWalkToTextOffset(), 1, 1100, () => {
          this.setState('EATING');
        });
        break;

      case 'EATING':
        this.stopZzz();
        this.setEyes(true);
        this.hideDrool();
        this.hideAlert();
        this.startChomping();
        break;

      case 'FULL':
        this.stopZzz();
        this.setEyes(true);
        this.stopChomping();
        this.hideDrool();
        break;

      case 'WALKING_BACK':
        this.stopZzz();
        this.setEyes(true);
        this.stopChomping();
        this.hideAlert();
        this.hideDrool();
        this.walkTo(0, -1, 1100, () => {
          this.setState('BURPING');
        });
        break;

      case 'BURPING':
        this.stopZzz();
        this.setEyes(true);
        this.stopChomping();
        this.hideDrool();
        if (this.container) {
          this.container.style.setProperty('--face-dir', 1);
        }
        this.performBurpAnimation();
        break;
    }
  }

  calculateWalkToTextOffset() {
    const field = document.querySelector('.terrain-field');
    if (!field) return -280;
    const fieldWidth = field.clientWidth;
    if (fieldWidth < 480) {
      return -Math.min(180, fieldWidth * 0.35);
    }
    return -Math.min(420, fieldWidth * 0.48);
  }

  walkTo(targetOffset, faceDir, durationMs, onArrival) {
    if (this.isWalking) return;
    this.isWalking = true;
    this.currentWalkOffset = targetOffset;
    this.faceDir = faceDir;

    if (!this.container) {
      this.isWalking = false;
      if (onArrival) onArrival();
      return;
    }

    this.container.classList.add('is-walking');
    this.container.style.setProperty('--face-dir', faceDir);
    this.container.style.setProperty('--walk-offset', `${targetOffset}px`);

    setTimeout(() => {
      if (this.container) {
        this.container.classList.remove('is-walking');
        if (targetOffset === 0) {
          this.faceDir = 1;
          this.container.style.setProperty('--face-dir', 1);
        }
      }
      this.isWalking = false;
      if (onArrival) onArrival();
    }, durationMs);
  }

  setEyes(open) {
    if (this.eyesOpen) {
      this.eyesOpen.forEach(el => el.style.display = open ? 'block' : 'none');
    }
    if (this.eyesClosed) {
      this.eyesClosed.forEach(el => el.style.display = open ? 'none' : 'block');
    }
  }

  showAlert() {
    if (this.exclamation) {
      this.exclamation.classList.add('active');
      setTimeout(() => {
        if (this.exclamation) this.exclamation.classList.remove('active');
      }, 1500);
    }
  }

  hideAlert() {
    if (this.exclamation) this.exclamation.classList.remove('active');
  }

  showDrool() {
    if (this.drool) this.drool.style.opacity = '1';
  }

  hideDrool() {
    if (this.drool) this.drool.style.opacity = '0';
  }

  startZzz() {
    this.stopZzz();
    const spawnZzz = () => {
      if (this.state !== 'SLEEPING') return;
      const zzzContainer = document.getElementById('zzz-layer');
      if (!zzzContainer) return;

      const z = document.createElement('span');
      z.className = 'zzz-letter';
      z.textContent = 'Z';
      z.style.left = `${30 + Math.random() * 20}%`;
      z.style.fontSize = `${14 + Math.random() * 12}px`;
      zzzContainer.appendChild(z);

      setTimeout(() => {
        if (z.parentNode) z.parentNode.removeChild(z);
      }, 2000);
    };

    spawnZzz();
    this.zzzInterval = setInterval(spawnZzz, 1200);
  }

  stopZzz() {
    if (this.zzzInterval) {
      clearInterval(this.zzzInterval);
      this.zzzInterval = null;
    }
    const zzzContainer = document.getElementById('zzz-layer');
    if (zzzContainer) zzzContainer.innerHTML = '';
  }

  startChomping() {
    if (this.isChomping) return;
    this.isChomping = true;
    if (this.container) {
      this.container.classList.add('is-chomping');
    }
  }

  stopChomping() {
    this.isChomping = false;
    if (this.container) {
      this.container.classList.remove('is-chomping');
    }
    if (this.jaw) {
      this.jaw.style.transform = 'translateY(0px) rotate(0deg)';
    }
  }

  /**
   * Snaps jaw shut momentarily when a letter is swallowed
   */
  triggerChompBite() {
    if (!this.jaw) return;
    this.jaw.style.transform = 'translateY(8px) rotate(4deg)';
    setTimeout(() => {
      if (this.jaw) {
        this.jaw.style.transform = 'translateY(0px) rotate(0deg)';
      }
    }, 90);
  }

  /**
   * Increases belly size incrementally as characters are eaten
   */
  feed(count = 1) {
    this.totalEaten += count;
    // Belly growth curve: asymptotically scales from 1.0 to 1.75
    this.bellyScale = 1.0 + Math.min(0.75, Math.log10(1 + this.totalEaten * 0.08) * 0.55);
    
    if (this.belly) {
      this.belly.style.transform = `scale(${this.bellyScale.toFixed(3)})`;
    }

    // Trigger mouth bite visual
    this.triggerChompBite();
  }

  resetBelly() {
    this.totalEaten = 0;
    this.bellyScale = 1.0;
    if (this.belly) {
      this.belly.style.transform = 'scale(1)';
    }
  }

  /**
   * Eyes dynamically track cursor / text focus
   */
  setupEyeTracking() {
    window.addEventListener('mousemove', (e) => {
      if (this.state === 'SLEEPING') return;
      this.updatePupils(e.clientX, e.clientY);
    });
  }

  updatePupils(targetX, targetY) {
    if (!this.pupils || this.pupils.length === 0) return;

    this.pupils.forEach((pupil) => {
      const rect = pupil.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;

      const deltaX = targetX - eyeCenterX;
      const deltaY = targetY - eyeCenterY;
      const angle = Math.atan2(deltaY, deltaX);

      // Max eye travel distance
      const maxDistance = 3.5;
      const distance = Math.min(maxDistance, Math.hypot(deltaX, deltaY) * 0.04);

      const pupilX = Math.cos(angle) * distance;
      const pupilY = Math.sin(angle) * distance;

      pupil.style.transform = `translate(${pupilX.toFixed(1)}px, ${pupilY.toFixed(1)}px)`;
    });
  }

  /**
   * Perform dramatic burp sequence
   */
  performBurpAnimation() {
    if (!this.container) return;

    // 1. Inhale bulge
    this.container.classList.add('burp-prep');
    if (this.belly) {
      this.belly.style.transform = `scale(${(this.bellyScale * 1.15).toFixed(3)})`;
    }

    setTimeout(() => {
      // 2. Burp release!
      this.container.classList.remove('burp-prep');
      this.container.classList.add('burping');

      // Screen shake
      const app = document.getElementById('app-wrapper');
      if (app) {
        app.classList.add('screen-shake');
        setTimeout(() => app.classList.remove('screen-shake'), 700);
      }

      // Procedural burp audio
      if (window.soundEngine) {
        window.soundEngine.playBurp();
      }

      // Burp smoke cloud
      this.spawnBurpCloud();

      // Recoil belly slightly
      setTimeout(() => {
        if (this.belly) {
          this.belly.style.transform = `scale(${this.bellyScale.toFixed(3)})`;
        }
        if (this.container) {
          this.container.classList.remove('burping');
        }
        if (this.onBurpComplete) {
          this.onBurpComplete();
        }
      }, 800);
    }, 350);
  }

  spawnBurpCloud() {
    const mouthPos = this.getMouthCoordinates();
    const cloudLayer = document.getElementById('fx-layer');
    if (!cloudLayer) return;

    const cloud = document.createElement('div');
    cloud.className = 'burp-cloud';
    cloud.innerHTML = `<span>💨</span><span class="burp-text">BURRRRP!</span><span>🫧</span>`;
    cloud.style.left = `${mouthPos.x}px`;
    cloud.style.top = `${mouthPos.y - 30}px`;

    cloudLayer.appendChild(cloud);

    setTimeout(() => {
      if (cloud.parentNode) cloud.parentNode.removeChild(cloud);
    }, 1600);
  }

  /**
   * Returns viewport coordinates of the goat's mouth for flying letters target
   */
  getMouthCoordinates() {
    const mouthEl = document.getElementById('goat-mouth-target');
    if (mouthEl) {
      const rect = mouthEl.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }
    // Fallback based on goat container
    if (this.container) {
      const rect = this.container.getBoundingClientRect();
      return {
        x: rect.left + rect.width * 0.45,
        y: rect.top + rect.height * 0.35
      };
    }
    return { x: window.innerWidth / 2, y: window.innerHeight * 0.75 };
  }

  /**
   * Speech Bubble Display
   */
  say(text, duration = 3000) {
    if (!this.speechBubble || !this.speechText) return;

    this.speechText.textContent = text;
    this.speechBubble.classList.add('visible');

    if (this.speechTimeout) clearTimeout(this.speechTimeout);
    this.speechTimeout = setTimeout(() => {
      if (this.speechBubble) {
        this.speechBubble.classList.remove('visible');
      }
    }, duration);
  }

  /**
   * Toggle cool sunglasses (easter egg)
   */
  toggleSunglasses(show = null) {
    this.isSunglassesOn = show !== null ? show : !this.isSunglassesOn;
    if (this.sunglasses) {
      this.sunglasses.style.display = this.isSunglassesOn ? 'block' : 'none';
      if (this.isSunglassesOn) {
        this.say("😎 Too cool to eat paper. Just kidding, NOM!");
        if (window.soundEngine) window.soundEngine.playBleat('excited');
      }
    }
  }

  /**
   * Set Grass Frenzy visual mode
   */
  setFrenzy(frenzy) {
    this.isFrenzy = frenzy;
    if (this.container) {
      if (frenzy) {
        this.container.classList.add('frenzy-mode');
        this.say("GRRRRAAAASSSS!!! 🌿🌾🤤", 4000);
      } else {
        this.container.classList.remove('frenzy-mode');
      }
    }
  }
}

// Export singleton
window.goat = new GoatController();
