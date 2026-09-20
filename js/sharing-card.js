/**
 * HALLOWEEN VAMPIRE PUB — SHARING CARD CONTROLLER
 * 3D perspective tilt with moving reflective stroke, top-half rain effect (no ground droplets), and flying bat.
 */

export class SharingCard {
  constructor(soundEngine) {
    this.sound = soundEngine;
    this.modal = document.getElementById('share-card-modal');
    this.backdrop = document.getElementById('share-card-backdrop');
    this.wrapper = document.getElementById('share-card-wrapper');
    this.frame = document.getElementById('share-card-frame');
    this.closeBtn = document.getElementById('share-card-close');
    this.canvas = document.getElementById('share-card-canvas');
    this.glare = document.getElementById('share-card-glare');
    this.stroke = document.getElementById('share-card-stroke');
    this.cta = document.getElementById('share-card-cta');
    this.toast = document.getElementById('share-toast');

    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.animId = null;
    this.isOpen = false;

    // Simulation states
    this.drops = [];
    this.bat = {
      x: -50,
      baseY: 95,
      y: 95,
      speedX: 1.6,
      amplitude: 7,
      wingPhase: 0,
      wingSpeed: 0.26
    };

    this.init();
  }

  init() {
    if (!this.modal || !this.canvas) return;

    this.initDrops(45);
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Event listeners
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sound.playClick();
        this.close();
      });
    }

    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => this.close());
    }

    if (this.cta) {
      this.cta.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sound.playClick();
        this.copyLink();
      });
    }

    if (this.frame) {
      // 3D Tilt, moving reflective stroke, and glare
      this.frame.addEventListener('pointermove', (e) => this.handlePointerMove(e));
      this.frame.addEventListener('pointerleave', () => this.handlePointerLeave());
    }
  }

  initDrops(count) {
    this.drops = [];
    for (let i = 0; i < count; i++) {
      this.drops.push({
        x: Math.random() * 360,
        y: Math.random() * 300,
        speed: 7 + Math.random() * 6,
        len: 12 + Math.random() * 10,
        alpha: 0.25 + Math.random() * 0.45
      });
    }
  }

  resizeCanvas() {
    if (!this.frame || !this.canvas) return;
    const rect = this.frame.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = (rect.width || 360) * dpr;
    this.canvas.height = (rect.height || 600) * dpr;
    if (this.ctx) {
      this.ctx.scale(dpr, dpr);
    }
  }

  handlePointerMove(e) {
    if (!this.frame) return;
    const rect = this.frame.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const nx = (x / rect.width) * 2 - 1; // -1 to 1
    const ny = (y / rect.height) * 2 - 1; // -1 to 1

    const rotX = -ny * 12; // deg
    const rotY = nx * 14;  // deg

    this.frame.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`;

    // Moving reflective stroke angle following 3D tilt
    const strokeAngle = (Math.atan2(ny, nx) * (180 / Math.PI) + 90).toFixed(1);
    this.frame.style.setProperty('--stroke-angle', `${strokeAngle}deg`);

    if (this.glare) {
      this.glare.style.opacity = '1';
      this.glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.22) 0%, transparent 65%)`;
    }
  }

  handlePointerLeave() {
    if (!this.frame) return;
    this.frame.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    this.frame.style.setProperty('--stroke-angle', '135deg');
    if (this.glare) {
      this.glare.style.opacity = '0';
    }
  }

  open() {
    if (!this.modal) return;
    this.isOpen = true;
    this.modal.style.display = 'flex';
    requestAnimationFrame(() => {
      this.modal.classList.add('visible');
      this.resizeCanvas();
    });

    this.bat.x = -50;
    this.bat.baseY = 85 + Math.random() * 50;

    this.startLoop();
  }

  close() {
    if (!this.modal) return;
    this.isOpen = false;
    this.modal.classList.remove('visible');
    setTimeout(() => {
      if (!this.isOpen) {
        this.modal.style.display = 'none';
        this.stopLoop();
      }
    }, 400);
    this.handlePointerLeave();
  }

  copyLink() {
    const url = window.location.href.split('#')[0].split('?')[0];
    const text = `🦇 The Vampire Pub Mystery — Can you find the vampire among the 6 patrons before midnight? Play here: ${url}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    this.showToast('Mystery invitation copied to clipboard!');
  }

  showToast(msg) {
    if (!this.toast) return;
    this.toast.textContent = msg;
    this.toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this.toast.classList.remove('show');
    }, 2800);
  }

  startLoop() {
    if (this.animId) cancelAnimationFrame(this.animId);
    const loop = () => {
      if (!this.isOpen) return;
      this.render();
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  stopLoop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  render() {
    if (!this.ctx || !this.frame) return;
    const rect = this.frame.getBoundingClientRect();
    const W = rect.width || 360;
    const H = rect.height || 600;
    const maxRainY = H * 0.5; // Rain happens strictly in the top half of the card

    this.ctx.clearRect(0, 0, W, H);

    // 1. Rain drops (top half only, no ground droplet effect)
    this.ctx.lineWidth = 1.2;
    this.drops.forEach((d) => {
      d.y += d.speed;
      d.x += d.speed * 0.16; // Subtle angle

      if (d.y > maxRainY) {
        d.y = -d.len;
        d.x = Math.random() * (W + 50) - 25;
      }

      // Fade out smoothly as it approaches maxRainY
      const fadeProgress = Math.max(0, 1 - (d.y / maxRainY));
      const currentAlpha = d.alpha * fadeProgress;

      this.ctx.strokeStyle = `rgba(215, 230, 255, ${currentAlpha.toFixed(3)})`;
      this.ctx.beginPath();
      this.ctx.moveTo(d.x, d.y);
      this.ctx.lineTo(d.x + 2, d.y + d.len);
      this.ctx.stroke();
    });

    // 2. Small bat flying from left to right inside card only
    this.bat.x += this.bat.speedX;
    this.bat.y = this.bat.baseY + Math.sin(this.bat.x * 0.035) * this.bat.amplitude;
    this.bat.wingPhase += this.bat.wingSpeed;

    if (this.bat.x > W + 45) {
      this.bat.x = -50;
      this.bat.baseY = 70 + Math.random() * 60;
    }

    this.drawBat(this.bat.x, this.bat.y, this.bat.wingPhase);
  }

  drawBat(x, y, wingPhase) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    // Subtle dark bat silhouette
    ctx.fillStyle = '#100a12';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;

    // Head and body
    ctx.beginPath();
    ctx.ellipse(0, 0, 3.5, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Small pointed ears
    ctx.beginPath();
    ctx.moveTo(-1.8, -1.8);
    ctx.lineTo(-2.8, -4.2);
    ctx.lineTo(-0.8, -2.2);
    ctx.moveTo(1.8, -1.8);
    ctx.lineTo(2.8, -4.2);
    ctx.lineTo(0.8, -2.2);
    ctx.fill();

    // Flapping wings
    const flap = Math.sin(wingPhase); // -1 (up) to 1 (down)
    const tipY = flap * 6.5;
    const midY = flap * 3.2;

    // Left Wing
    ctx.beginPath();
    ctx.moveTo(0, -0.5);
    ctx.quadraticCurveTo(-6, -4 + midY, -13, -1 + tipY);
    ctx.quadraticCurveTo(-9, 2.5 + midY * 0.5, -4, 1);
    ctx.closePath();
    ctx.fill();

    // Right Wing
    ctx.beginPath();
    ctx.moveTo(0, -0.5);
    ctx.quadraticCurveTo(6, -4 + midY, 13, -1 + tipY);
    ctx.quadraticCurveTo(9, 2.5 + midY * 0.5, 4, 1);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
