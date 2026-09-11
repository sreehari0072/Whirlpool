/**
 * Procedural Web Audio Engine for baa-bye.com
 * Synthesizes all sound effects in real-time using native Web Audio API.
 * Zero external audio files required — zero 404s, zero latency, zero dependencies!
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.initialized = false;
  }

  /**
   * Initializes or resumes the AudioContext on user gesture (browser requirement)
   */
  init() {
    if (this.initialized && this.ctx && this.ctx.state !== 'suspended') return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  setMute(mute) {
    this.isMuted = !!mute;
  }

  /**
   * NOM / CHOMP sound: Crispy bite with pitch variation
   * @param {number} pitchMultiplier - for fast typing excitement
   */
  playNom(pitchMultiplier = 1.0) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const baseFreq = (450 + Math.random() * 250) * pitchMultiplier;

      // 1. Tonal bite transient
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = Math.random() > 0.5 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.35, now + 0.08);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);

      // 2. Crunchy noise click
      const bufferSize = this.ctx.sampleRate * 0.04;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 1200 + Math.random() * 800;
      noiseFilter.Q.value = 3.0;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.22, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.05);
    } catch (e) {
      // Graceful fallback
    }
  }

  /**
   * COMIC BURP SOUND: Deep resonant downward rumble with noisy rattle
   */
  playBurp() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const duration = 0.65;

      // Master burp gain
      const master = this.ctx.createGain();
      master.gain.setValueAtTime(0.45, now);
      master.gain.exponentialRampToValueAtTime(0.001, now + duration);
      master.connect(this.ctx.destination);

      // Oscillator: Low sawtooth with downward pitch dive
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(145, now);
      osc.frequency.linearRampToValueAtTime(95, now + 0.2);
      osc.frequency.exponentialRampToValueAtTime(45, now + duration);

      // Burp throat vibrato (LFO)
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(26, now); // Gut rumble flutter
      lfoGain.gain.setValueAtTime(35, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + duration);

      // Resonant throat filter
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(480, now);
      filter.frequency.exponentialRampToValueAtTime(220, now + duration);
      filter.Q.value = 4.5;

      osc.connect(filter);
      filter.connect(master);

      osc.start(now);
      osc.stop(now + duration);

      // Add noisy gut eruption texture
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const noiseFilt = this.ctx.createBiquadFilter();
      noiseFilt.type = 'bandpass';
      noiseFilt.frequency.setValueAtTime(320, now);
      noiseFilt.Q.value = 2.0;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.18, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseSource.connect(noiseFilt);
      noiseFilt.connect(noiseGain);
      noiseGain.connect(master);

      noiseSource.start(now);
      noiseSource.stop(now + duration);
    } catch (e) {
      // Graceful fallback
    }
  }

  /**
   * COMIC GOAT BLEAT: "Baaaa-a-a-ah!"
   * Dual formant oscillators with rapid pitch vibrato
   * @param {'normal'|'excited'|'grumpy'} mood
   */
  playBleat(mood = 'normal') {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      let baseFreq = 220;
      let duration = 0.75;
      let vibratoRate = 7.5;
      let vibratoDepth = 22;

      if (mood === 'excited') {
        baseFreq = 310;
        duration = 0.55;
        vibratoRate = 11.0;
        vibratoDepth = 35;
      } else if (mood === 'grumpy') {
        baseFreq = 160;
        duration = 0.9;
        vibratoRate = 5.5;
        vibratoDepth = 15;
      }

      const master = this.ctx.createGain();
      master.gain.setValueAtTime(0.01, now);
      master.gain.linearRampToValueAtTime(0.35, now + 0.08);
      master.gain.setValueAtTime(0.35, now + duration - 0.15);
      master.gain.exponentialRampToValueAtTime(0.001, now + duration);
      master.connect(this.ctx.destination);

      // Goat vocal cord oscillator (Sawtooth + Triangle blend)
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(baseFreq, now);

      const osc2 = this.ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(baseFreq * 1.01, now);

      // Bleat vibrato / wobble
      const vibrato = this.ctx.createOscillator();
      const vibGain = this.ctx.createGain();
      vibrato.frequency.setValueAtTime(vibratoRate, now);
      vibGain.gain.setValueAtTime(vibratoDepth, now);
      vibrato.connect(vibGain);
      vibGain.connect(osc1.frequency);
      vibGain.connect(osc2.frequency);

      vibrato.start(now);
      vibrato.stop(now + duration);

      // Formant filter (nasal goat 'aaaa')
      const formant1 = this.ctx.createBiquadFilter();
      formant1.type = 'bandpass';
      formant1.frequency.setValueAtTime(750, now);
      formant1.Q.value = 4.0;

      const formant2 = this.ctx.createBiquadFilter();
      formant2.type = 'peaking';
      formant2.frequency.setValueAtTime(1400, now);
      formant2.gain.value = 6.0;

      osc1.connect(formant1);
      osc2.connect(formant1);
      formant1.connect(formant2);
      formant2.connect(master);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    } catch (e) {
      // Graceful fallback
    }
  }

  /**
   * GENTLE WELCOME BLEAT: Played softly on site open
   */
  playWelcomeBleat() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const baseFreq = 235;
      const duration = 0.45;
      const vibratoRate = 6.5;
      const vibratoDepth = 15;

      const master = this.ctx.createGain();
      master.gain.setValueAtTime(0.01, now);
      master.gain.linearRampToValueAtTime(0.2, now + 0.05);
      master.gain.setValueAtTime(0.2, now + duration - 0.12);
      master.gain.exponentialRampToValueAtTime(0.001, now + duration);
      master.connect(this.ctx.destination);

      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(baseFreq, now);

      const osc2 = this.ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(baseFreq * 1.01, now);

      const vibrato = this.ctx.createOscillator();
      const vibGain = this.ctx.createGain();
      vibrato.frequency.setValueAtTime(vibratoRate, now);
      vibGain.gain.setValueAtTime(vibratoDepth, now);
      vibrato.connect(vibGain);
      vibGain.connect(osc1.frequency);
      vibGain.connect(osc2.frequency);

      vibrato.start(now);
      vibrato.stop(now + duration);

      const formant = this.ctx.createBiquadFilter();
      formant.type = 'bandpass';
      formant.frequency.setValueAtTime(720, now);
      formant.Q.value = 3.5;

      osc1.connect(formant);
      osc2.connect(formant);
      formant.connect(master);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    } catch (e) {
      // Graceful fallback
    }
  }

  /**
   * POP: When a character detaches from input
   */
  playPop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(650 + Math.random() * 200, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.05);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {
      // Graceful fallback
    }
  }

  /**
   * FANFARE: Easter egg jingle
   */
  playFanfare() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
      const now = this.ctx.currentTime;

      notes.forEach((freq, index) => {
        const start = now + index * 0.09;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.26);
      });
    } catch (e) {
      // Graceful fallback
    }
  }
}

// Export singleton
window.soundEngine = new SoundEngine();
