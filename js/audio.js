/**
 * HALLOWEEN VAMPIRE PUB — AUDIO ENGINE
 * Features:
 * - 50% volume Halloween music on continuous loop (assets/audio/halloween-theme.mp3)
 * - 20% opacity subtle rain ambience (soft pink noise filtered)
 * - Clean UI sound effects (clue chimes, click, victory/defeat stings, heartbeat)
 * - Zero glitch TV drones, zero cracking door wolf barks
 */
export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.rainGain = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.initialized = false;

    // Dedicated HTML5 Audio element for reliable seamless looping
    this.music = new Audio('assets/audio/halloween-theme.mp3');
    this.music.loop = true;
    this.music.volume = 0.50; // 50% subtle background music
  }

  init() {
    if (this.initialized) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      console.warn('Web Audio API is not supported in this browser.');
      return;
    }

    this.ctx = new AudioContextClass();

    // Master gain for SFX and rain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Setup very subtle rain at 20% opacity
    this.setupRainAmbience();

    this.initialized = true;
  }

  resumeContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      return this.ctx.resume();
    }
    return Promise.resolve();
  }

  /**
   * Generates a loopable noise buffer (pink noise approximation)
   */
  createNoiseBuffer(duration = 4) {
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99 * b0 + white * 0.05;
      b1 = 0.96 * b1 + white * 0.11;
      b2 = 0.86 * b2 + white * 0.25;
      data[i] = (b0 + b1 + b2) * 0.25;
    }
    return buffer;
  }

  /**
   * Very subtle rain ambience (20% opacity = 0.20 gain)
   * Soft, gentle filtered rain without harsh frequencies
   */
  setupRainAmbience() {
    if (!this.ctx) return;

    const rainNoiseBuffer = this.createNoiseBuffer(4);
    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = rainNoiseBuffer;
    rainSource.loop = true;

    // Gentle low-pass + band-pass for soothing rainfall
    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.setValueAtTime(950, this.ctx.currentTime);
    rainFilter.Q.setValueAtTime(0.7, this.ctx.currentTime);

    this.rainGain = this.ctx.createGain();
    // 20% opacity subtle rain sound
    this.rainGain.gain.setValueAtTime(0.20, this.ctx.currentTime);

    rainSource.connect(rainFilter);
    rainFilter.connect(this.rainGain);
    this.rainGain.connect(this.masterGain);
    rainSource.start();

    // Occasional gentle soft droplet
    this.startGentleDroplets();
  }

  startGentleDroplets() {
    const playDroplet = () => {
      if (!this.isPlaying || this.isMuted || !this.ctx) {
        setTimeout(playDroplet, 1200 + Math.random() * 2000);
        return;
      }

      const dropOsc = this.ctx.createOscillator();
      const dropGain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      const baseFreq = 900 + Math.random() * 700;
      dropOsc.frequency.setValueAtTime(baseFreq, now);
      dropOsc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, now + 0.03);
      dropOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, now + 0.09);

      dropGain.gain.setValueAtTime(0.0001, now);
      dropGain.gain.linearRampToValueAtTime(0.015 + Math.random() * 0.01, now + 0.02);
      dropGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

      dropOsc.connect(dropGain);
      dropGain.connect(this.rainGain);

      dropOsc.start(now);
      dropOsc.stop(now + 0.10);

      setTimeout(playDroplet, 1800 + Math.random() * 3200);
    };

    setTimeout(playDroplet, 2000);
  }

  /**
   * Subtle soft bat flutter swoosh
   */
  playBatSwoop() {
    if (!this.ctx || !this.isPlaying || this.isMuted) return;
    const now = this.ctx.currentTime;

    const flapNoise = this.ctx.createBufferSource();
    flapNoise.buffer = this.createNoiseBuffer(1.2);

    const flapFilter = this.ctx.createBiquadFilter();
    flapFilter.type = 'bandpass';
    flapFilter.frequency.setValueAtTime(300, now);
    flapFilter.Q.setValueAtTime(2.0, now);

    const flapGain = this.ctx.createGain();
    flapGain.gain.setValueAtTime(0.0001, now);
    flapGain.gain.linearRampToValueAtTime(0.05, now + 0.2);
    flapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

    flapNoise.connect(flapFilter);
    flapFilter.connect(flapGain);
    flapGain.connect(this.masterGain);

    flapNoise.start(now);
    flapNoise.stop(now + 1.0);
  }

  /**
   * UI Click Sound
   */
  playClick() {
    if (!this.ctx) return;
    this.resumeContext();
    const now = this.ctx.currentTime;

    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(520, now);
    clickOsc.frequency.exponentialRampToValueAtTime(160, now + 0.08);

    clickGain.gain.setValueAtTime(0.12, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    clickOsc.connect(clickGain);
    clickGain.connect(this.ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.09);
  }

  /**
   * Toggle music on/off
   */
  toggle() {
    if (!this.initialized) {
      this.init();
    }
    this.resumeContext();

    if (!this.isPlaying) {
      this.start();
      this.playClick();
      return true;
    } else {
      if (this.isMuted) {
        this.unmute();
        this.playClick();
        return true;
      } else {
        this.playClick();
        this.mute();
        return false;
      }
    }
  }

  start() {
    this.init();
    this.resumeContext();
    this.isPlaying = true;
    this.isMuted = false;

    // Start background music at 50% volume
    if (this.music) {
      this.music.volume = 0.50;
      this.music.play().catch(() => {
        // Autoplay policy awaiting user gesture
      });
    }

    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(1.0, now);
    }

    if (this.rainGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.rainGain.gain.cancelScheduledValues(now);
      this.rainGain.gain.setValueAtTime(0.20, now);
    }
  }

  mute() {
    this.isMuted = true;
    if (this.music) {
      this.music.pause();
    }
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(0, now);
    }
  }

  unmute() {
    this.isMuted = false;
    this.resumeContext();
    if (this.music) {
      this.music.volume = 0.50;
      this.music.play().catch(() => {});
    }
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(1.0, now);
    }
    if (this.ctx && this.rainGain) {
      const now = this.ctx.currentTime;
      this.rainGain.gain.cancelScheduledValues(now);
      this.rainGain.gain.setValueAtTime(0.20, now);
    }
  }

  /**
   * Tension hold oscillator when discovering clue
   */
  playHoldProgress(ratio) {
    if (!this.ctx || this.isMuted) return;
    this.resumeContext();
    const now = this.ctx.currentTime;

    if (!this.holdOsc) {
      this.holdOsc = this.ctx.createOscillator();
      this.holdGain = this.ctx.createGain();
      this.holdFilter = this.ctx.createBiquadFilter();

      this.holdOsc.type = 'sine';
      this.holdOsc.frequency.setValueAtTime(140, now);

      this.holdFilter.type = 'lowpass';
      this.holdFilter.frequency.setValueAtTime(360, now);

      this.holdGain.gain.setValueAtTime(0.001, now);
      this.holdGain.gain.linearRampToValueAtTime(0.12, now + 0.1);

      this.holdOsc.connect(this.holdFilter);
      this.holdFilter.connect(this.holdGain);
      this.holdGain.connect(this.masterGain);
      this.holdOsc.start(now);
    }

    const targetFreq = 140 + ratio * 260;
    this.holdOsc.frequency.cancelScheduledValues(now);
    this.holdOsc.frequency.setValueAtTime(this.holdOsc.frequency.value, now);
    this.holdOsc.frequency.exponentialRampToValueAtTime(Math.max(60, targetFreq), now + 0.08);

    const targetGain = 0.08 + ratio * 0.12;
    this.holdGain.gain.cancelScheduledValues(now);
    this.holdGain.gain.setValueAtTime(this.holdGain.gain.value, now);
    this.holdGain.gain.linearRampToValueAtTime(targetGain, now + 0.08);
  }

  stopHoldSound() {
    if (this.holdOsc) {
      try {
        const now = this.ctx.currentTime;
        this.holdGain.gain.linearRampToValueAtTime(0.0001, now + 0.1);
        setTimeout(() => {
          if (this.holdOsc) {
            this.holdOsc.stop();
            this.holdOsc.disconnect();
            this.holdOsc = null;
            this.holdGain = null;
            this.holdFilter = null;
          }
        }, 120);
      } catch (e) {}
    }
  }

  /**
   * Resonant gothic chime on clue discovered
   */
  playClueChime() {
    this.stopHoldSound();
    if (!this.ctx || this.isMuted) return;
    this.resumeContext();
    const now = this.ctx.currentTime;

    const chords = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    chords.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.04 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8 + idx * 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + idx * 0.04);
      osc.stop(now + 2.0);
    });
  }

  /**
   * Suspense heartbeat pulse during verification
   */
  playSuspenseHeartbeat() {
    if (!this.ctx || this.isMuted) return;
    this.resumeContext();
    const now = this.ctx.currentTime;

    const pulse = (time, gainVal) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(58, time);
      osc.frequency.exponentialRampToValueAtTime(32, time + 0.15);

      gain.gain.setValueAtTime(gainVal, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(time);
      osc.stop(time + 0.2);
    };

    pulse(now, 0.28);
    pulse(now + 0.22, 0.2);
  }

  stopSuspenseHeartbeat() {
    // Fire-and-forget oscillators
  }

  /**
   * Gothic victory choral chime
   */
  playVictorySting() {
    if (!this.ctx || this.isMuted) return;
    this.resumeContext();
    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A major
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0.001, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.18, now + i * 0.08 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * 0.08);
      osc.stop(now + 3.2);
    });
  }

  /**
   * Dissonant defeat chime
   */
  playDefeatSting() {
    if (!this.ctx || this.isMuted) return;
    this.resumeContext();
    const now = this.ctx.currentTime;
    const notes = [220, 233.08, 155.56];
    notes.forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 2.6);
    });
  }
}
