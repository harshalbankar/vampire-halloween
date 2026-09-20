/**
 * Cursor & Gyroscope 3D Parallax Controller
 * Smooth damped mouse tracking for 2.5D perspective tilt, depth UV shift,
 * and cursor-reactive WebGL distortion field.
 */

export class ParallaxController {
  constructor(viewportElement, onUpdate) {
    this.viewport  = viewportElement;
    this.onUpdate  = onUpdate;

    // Raw target values (set immediately from events)
    this.targetX = 0;
    this.targetY = 0;

    // Smoothed current values (lerped each frame)
    this.currentX = 0;
    this.currentY = 0;

    // Normalized mouse 0-1 (for WebGL shader)
    this.mouseNX = 0.5;
    this.mouseNY = 0.5;

    // Tuning - slow, calm, cinematic inertia
    this.maxTilt      = 2.0;   // degrees
    this.maxTranslate = 10;    // px
    this.lerp         = 0.022; // lower = slower, smoother, more atmospheric inertia

    this._listen();
  }

  _listen() {
    window.addEventListener('mousemove', (e) => {
      const hw = window.innerWidth  / 2;
      const hh = window.innerHeight / 2;
      this.targetX = (e.clientX - hw) / hw;         // -1 … +1
      this.targetY = (e.clientY - hh) / hh;         // -1 … +1

      const glCanvas = document.getElementById('gl-canvas');
      if (glCanvas) {
        const rect = glCanvas.getBoundingClientRect();
        this.mouseNX = (e.clientX - rect.left) / rect.width;
        // In WebGL vertex shader: vUv = vec2(aPos.x*0.5+0.5, 0.5-aPos.y*0.5)
        // At top of canvas: vUv.y = 0.0. At bottom of canvas: vUv.y = 1.0.
        // Therefore mouseNY must be 0 at top and 1 at bottom to track cursor 1:1.
        this.mouseNY = (e.clientY - rect.top) / rect.height;
      } else {
        this.mouseNX = e.clientX / window.innerWidth;
        this.mouseNY = e.clientY / window.innerHeight;
      }
    });

    // Gyroscope for mobile
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (e) => {
        if (e.gamma != null && e.beta != null) {
          this.targetX = Math.max(-1, Math.min(1, e.gamma / 28));
          this.targetY = Math.max(-1, Math.min(1, (e.beta - 40) / 28));
        }
      });
    }

    // Ease back to center when mouse leaves
    document.addEventListener('mouseleave', () => {
      this.targetX = 0;
      this.targetY = 0;
    });
  }

  update() {
    // Smooth inertial lerp
    this.currentX += (this.targetX - this.currentX) * this.lerp;
    this.currentY += (this.targetY - this.currentY) * this.lerp;

    // Apply 3-D perspective tilt to the viewport wrapper
    if (this.viewport) {
      const rx = -this.currentY * this.maxTilt;
      const ry =  this.currentX * this.maxTilt;
      const tx = -this.currentX * this.maxTranslate;
      const ty = -this.currentY * this.maxTranslate;
      this.viewport.style.transform =
        `perspective(1200px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) ` +
        `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,0px)`;
    }

    // Notify WebGL / bat layers
    if (this.onUpdate) {
      this.onUpdate({
        x:      this.currentX,
        y:      this.currentY,
        mouseX: this.mouseNX,
        mouseY: this.mouseNY
      });
    }
  }
}
