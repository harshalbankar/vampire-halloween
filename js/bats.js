/**
 * Bat Flight System
 *
 * Behaviours:
 * 1. ROAMING BATS  – 1–2 bats fly continuously left→right (or right→left)
 *    at mid-screen heights, with gentle sinusoidal undulation.
 *    After exiting the right edge they reset and repeat with slight variation.
 *
 * 2. TIME-TRAVEL SWARM – Every 5–6 s a surge triggers:  7–11 bats burst from
 *    the moon and swoop toward the camera (Bézier, 3-D scale-up).
 *
 * 3. AMBIENT BATS – 2–3 tiny bats circle the moon constantly.
 */

export class BatSystem {
  constructor(canvas, onTimeTravelTrigger) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext('2d');
    this.onTT    = onTimeTravelTrigger;

    this.roaming  = [];   // persistent left-to-right bats
    this.swarm    = [];   // time-travel burst bats
    this.ambient  = [];   // tiny moon-orbit bats

    this.parallax = { x: 0, y: 0 };

    this._resize();
    window.addEventListener('resize', () => this._resize());

    this._initRoaming();
    // Swarm disabled — roaming L→R bats only
  }

  /* ─── Resize ─── */
  _resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = this.canvas.clientWidth || Math.floor(window.innerWidth * 1.3);
    const h = this.canvas.clientHeight || Math.floor(window.innerHeight * 1.3);
    if (w <= 0 || h <= 0) return;
    this.canvas.width  = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.W = w;
    this.H = h;
  }

  setParallax(x, y) {
    this.parallax.x = x;
    this.parallax.y = y;
  }

  /* ═══════════════════════════════════════════
     1. ROAMING BATS  (left → right)
  ═══════════════════════════════════════════ */
  _initRoaming() {
    // 1 to 3 bats active at a time (guaranteed 2, 60% chance of a 3rd)
    const count = 2 + (Math.random() > 0.4 ? 1 : 0);
    for (let i = 0; i < count; i++) {
      this.roaming.push(this._newRoamingBat(i));
    }
  }

  _newRoamingBat(index = 0) {
    // Always start from off-screen LEFT, travel to the RIGHT
    // Stagger bats across time and space so 1-3 are seen crossing
    const staggerOffset = index * 0.42;
    return {
      px:           -0.15 - staggerOffset - Math.random() * 0.12, // start staggered off-screen left
      py:           0.10 + Math.random() * 0.48,                  // vertical band 10–58% from top
      speed:        0.0065 + Math.random() * 0.0025,              // faster flight across the sky
      undulateAmp:  0.018 + Math.random() * 0.014,
      undulateFreq: 0.75  + Math.random() * 0.35,
      undulatePhase: Math.random() * Math.PI * 2,
      size:         22 + Math.random() * 12,
      flapSpeed:    0.34 + Math.random() * 0.12,                  // lively, faster wing flaps
      flapPhase:    Math.random() * Math.PI * 2
    };
  }

  _updateRoaming() {
    for (let i = 0; i < this.roaming.length; i++) {
      const b = this.roaming[i];
      b.px += b.speed;          // always moving left → right
      b.flapPhase += b.flapSpeed;

      // Reset off the RIGHT edge → re-enter from LEFT with fresh variation
      if (b.px > 1.15) {
        b.px           = -0.15 - Math.random() * 0.25;
        b.py           = 0.08 + Math.random() * 0.50;
        b.undulateAmp  = 0.020 + Math.random() * 0.018;
        b.undulateFreq = 0.90  + Math.random() * 0.50;
        b.undulatePhase = Math.random() * Math.PI * 2;
        b.size         = 20 + Math.random() * 14;
        b.speed        = 0.0065 + Math.random() * 0.0025;         // maintain faster flight speed on reset
        b.flapSpeed    = 0.34  + Math.random() * 0.12;           // maintain faster wing flaps
      }

      const undulate = Math.sin(b.flapPhase * b.undulateFreq + b.undulatePhase)
                       * b.undulateAmp * this.H;

      const screenX = b.px * this.W  + this.parallax.x * 20;
      const screenY = b.py * this.H  + undulate + this.parallax.y * 16;

      // Bat always faces right (PI/2), subtle banking from undulation
      const angle     = Math.PI / 2 + Math.sin(b.flapPhase * 0.38) * 0.10;
      const wingAngle = Math.sin(b.flapPhase) * 0.70;

      // Fade in from left edge, fade out toward right edge
      let alpha = 1.0;
      if (b.px < 0.05)      alpha = Math.max(0, (b.px + 0.15) / 0.20);
      else if (b.px > 0.90) alpha = Math.max(0, (1.15 - b.px) / 0.25);

      this._drawBat(screenX, screenY, b.size, angle, wingAngle, alpha * 0.94);
    }
  }

  /* ═══════════════════════════════════════════
     2. TIME-TRAVEL SWARM BATS (moon burst)
  ═══════════════════════════════════════════ */
  _scheduleSwarm() {
    const delay = 5000 + Math.random() * 1000;
    setTimeout(() => {
      this._triggerSwarm();
      this._scheduleSwarm();
    }, delay);
  }

  _triggerSwarm() {
    if (this.onTT) this.onTT();

    const count = 7 + Math.floor(Math.random() * 5);
    const mx = this.W * 0.5;
    const my = this.H * 0.20;

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const side   = Math.random() > 0.5 ? 1 : -1;
        const endX   = side > 0
          ? this.W * (1.1 + Math.random() * 0.3)
          : -this.W * (0.1 + Math.random() * 0.3);
        const endY   = this.H * (0.1 + Math.random() * 0.85);
        const cpX    = mx + (Math.random() - 0.5) * this.W * 0.85;
        const cpY    = this.H * (0.38 + Math.random() * 0.52);

        this.swarm.push({
          t: 0,
          speed:  0.0055 + Math.random() * 0.005,
          sx: mx + (Math.random() - 0.5) * 45,
          sy: my + (Math.random() - 0.5) * 30,
          cpX, cpY, endX, endY,
          baseSize: 9 + Math.random() * 7,
          maxScale: 3.0 + Math.random() * 2.5,
          flapSpeed: 0.48 + Math.random() * 0.28,
          flapPhase: Math.random() * Math.PI * 2,
          wob: Math.random() * 100,
          alpha: 0
        });
      }, i * 85 + Math.random() * 110);
    }
  }

  _updateSwarm() {
    for (let i = this.swarm.length - 1; i >= 0; i--) {
      const b = this.swarm[i];
      b.t += b.speed;
      b.flapPhase += b.flapSpeed;
      if (b.t >= 1.0) { this.swarm.splice(i, 1); continue; }

      const it = 1 - b.t;
      const rx = it*it*b.sx + 2*it*b.t*b.cpX + b.t*b.t*b.endX;
      const ry = it*it*b.sy + 2*it*b.t*b.cpY + b.t*b.t*b.endY;

      const wobX = Math.sin(b.t * 17 + b.wob) * 11 * b.t;
      const wobY = Math.cos(b.t * 14 + b.wob) * 15 * b.t;

      const px = rx + wobX + this.parallax.x * 38 * b.t;
      const py = ry + wobY + this.parallax.y * 38 * b.t;

      const ddx = 2*(1-b.t)*(b.cpX-b.sx) + 2*b.t*(b.endX-b.cpX);
      const ddy = 2*(1-b.t)*(b.cpY-b.sy) + 2*b.t*(b.endY-b.cpY);
      const angle = Math.atan2(ddy, ddx) + Math.PI / 2;

      const scale = 1.0 + (b.maxScale - 1.0) * Math.pow(b.t, 1.9);

      b.alpha = b.t < 0.15 ? b.t / 0.15
              : b.t > 0.82 ? (1 - b.t) / 0.18
              : 1.0;

      this._drawBat(px, py, b.baseSize * scale, angle,
                    Math.sin(b.flapPhase) * 0.78, b.alpha);
    }
  }

  /* ═══════════════════════════════════════════
     3. AMBIENT MOON-ORBIT BATS
  ═══════════════════════════════════════════ */
  _initAmbient() {
    for (let i = 0; i < 3; i++) {
      this.ambient.push({
        rx:    45 + Math.random() * 75,
        ry:    16 + Math.random() * 28,
        angle: (i / 3) * Math.PI * 2,
        speed: 0.014 + Math.random() * 0.010,
        size:  7 + Math.random() * 5,
        flapSpeed: 0.32 + Math.random() * 0.12,
        flapPhase: Math.random() * Math.PI * 2
      });
    }
  }

  _updateAmbient() {
    const cx = this.W * 0.5 + this.parallax.x * 14;
    const cy = this.H * 0.21 + this.parallax.y * 14;
    for (const b of this.ambient) {
      b.angle     += b.speed;
      b.flapPhase += b.flapSpeed;
      const bx = cx + Math.cos(b.angle) * b.rx;
      const by = cy + Math.sin(b.angle) * b.ry;
      this._drawBat(bx, by, b.size, b.angle + Math.PI / 2,
                    Math.sin(b.flapPhase) * 0.62, 0.70);
    }
  }

  /* ═══════════════════════════════════════════
     BAT DRAW (Canvas 2D silhouette)
  ═══════════════════════════════════════════ */
  _drawBat(x, y, size, angle, wingAngle, alpha = 1) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

    ctx.fillStyle = '#0a0a10';

    // Body ellipse
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.21, size * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    [[- 1], [1]].forEach(([s]) => {
      ctx.beginPath();
      ctx.moveTo(s * size * 0.14, -size * 0.38);
      ctx.lineTo(s * size * 0.26, -size * 0.76);
      ctx.lineTo(s * size * 0.04, -size * 0.48);
      ctx.fill();
    });

    // Wings
    [-1, 1].forEach(side => {
      ctx.save();
      ctx.translate(side * size * 0.14, -size * 0.10);
      ctx.rotate(-side * wingAngle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(side * size * 0.85, -size * 0.68, side * size * 1.80, -side * size * 0.28);
      ctx.quadraticCurveTo(side * size * 1.42, size * 0.08,  side * size * 1.12, size * 0.42);
      ctx.quadraticCurveTo(side * size * 0.80, size * 0.18,  side * size * 0.58, size * 0.44);
      ctx.quadraticCurveTo(side * size * 0.30, size * 0.18,  0, 0);
      ctx.fill();
      ctx.restore();
    });

    // Red eye glow for bigger bats
    if (size > 16) {
      ctx.fillStyle = 'rgba(255,55,55,0.88)';
      ctx.beginPath();
      ctx.arc(-size * 0.09, -size * 0.34, size * 0.042, 0, Math.PI * 2);
      ctx.arc( size * 0.09, -size * 0.34, size * 0.042, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /* ═══════════════════════════════════════════
     PUBLIC: main render call
  ═══════════════════════════════════════════ */
  updateAndRender() {
    this.ctx.clearRect(0, 0, this.W, this.H);
    this._updateRoaming();
    this._updateSwarm();
  }

  // Expose swarm trigger for external (Start Experience button)
  triggerTimeTravelSwarm() { this._triggerSwarm(); }
}
