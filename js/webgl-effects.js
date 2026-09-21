/**
 * WebGL Interactive Experience Engine
 *
 * Features:
 * - Background image with cursor-reactive UV parallax & 2.5D tilt
 * - Cursor ripple / distortion field (strong mouse interaction)
 * - Rain streaks, screen-space water droplets, drip trails, puddle splashes
 * - Volumetric ground fog / graveyard mist (FBM noise, cursor fluid wake)
 * - Dynamic candle flicker lighting (pumpkins, lanterns, moon glow)
 * - Time-travel dimensional warp surge (chromatic aberration + shockwave)
 * - Atmospheric cinematic vignette
 */

export class WebGLEffects {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl', {
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });

    if (!this.gl) {
      console.warn('WebGL not supported');
      return;
    }

    this.program       = null;
    this.bgTexture     = null;
    this.startTime     = performance.now();

    // Smoothed values (all lerped in render())
    this.parallax      = { x: 0, y: 0, tx: 0, ty: 0 };
    this.mouse         = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    this.prevMouse     = { x: 0.5, y: 0.5 };
    this.velo          = 0.0;
    this.timeSurge     = 0.0;
    this.timeSurgeTgt  = 0.0;
    this.imageRes      = { w: 1936, h: 1097 };

    this._build();
  }

  /* ─────────────────────────── SHADER BUILD ─────────────────────────── */

  _build() {
    const gl = this.gl;

    /* ── Vertex shader ── */
    const VS = `
attribute vec2 aPos;
varying   vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

    /* ── Fragment shader ── */
    const FS = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec2 vUv;

uniform sampler2D uTex;
uniform vec2      uRes;
uniform vec2      uImageRes;
uniform float     uTime;
uniform vec2      uParallax;
uniform vec2      uMouse;
uniform float     uVelo;
uniform float     uSurge;

/* ═══════════════════ ASPECT RATIO FILL / COVER ═══════════════════ */
vec2 getCoverUv(vec2 uv) {
  if (uRes.y <= 0.0 || uImageRes.y <= 0.0) return uv;
  float sAspect = uRes.x / uRes.y;
  float iAspect = uImageRes.x / uImageRes.y;
  vec2 cUv = uv;
  if (sAspect > iAspect) {
    // Screen is wider than image: crop top and bottom evenly to fill width
    cUv.y = (uv.y - 0.5) * (iAspect / sAspect) + 0.5;
  } else {
    // Screen is narrower than image: crop left and right evenly to fill height
    cUv.x = (uv.x - 0.5) * (sAspect / iAspect) + 0.5;
  }
  return cUv;
}

/* ═══════════════════ NOISE UTILITIES ═══════════════════ */

float hash(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float hash12(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

vec2 hash22(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  q += dot(q, q.yzx + 33.33);
  return fract((q.xx + q.yz) * q.zy);
}

float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i),             hash(i + vec2(1,0)), f.x),
    mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
    f.y
  );
}

// 5-octave FBM
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2  R = mat2(0.8660, 0.5, -0.5, 0.8660);
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p  = R * p * 2.03 + vec2(12.4, 7.8);
    a *= 0.5;
  }
  return v;
}

/* ═══════════════════ AKELLA WEBGL MOUSEOVER EFFECT ═══════════════════ */
// Based on Yuri Artiukh (akella/webgl-mouseover-effects)
float circle(vec2 uv, vec2 disc_center, float disc_radius, float border_size) {
  vec2 d = (uv - disc_center) * vec2(uRes.x / uRes.y, 1.0);
  float dist = length(d);
  return smoothstep(disc_radius + border_size, disc_radius - border_size, dist);
}

vec2 akellaDisplacement(vec2 uv, vec2 mouse, float velo) {
  float c = circle(uv, mouse, 0.0, 0.18 + velo * 0.15) * (1.0 + velo * 6.0);
  vec2 dir = uv - mouse;
  return dir * c * 0.12;
}

/* ═══════════════════ RANDOMIZED RAIN STREAKS (no line/grid alignment) ═══════════════════ */
float rainLayer(vec2 uv, float t, vec2 scale, float speed, float slant) {
  vec2 p = vec2(uv.x + uv.y * slant, uv.y) * scale;
  p.y -= t * speed;

  vec2 id = floor(p);
  vec2 f  = fract(p);

  float rain = 0.0;

  // Check 3 horizontal neighbor cells to scatter drops completely across space without clipping
  for (int x = -1; x <= 1; x++) {
    vec2 cellId = id + vec2(float(x), 0.0);
    vec2 rnd = hash22(cellId);

    // Density threshold: ~32% of cells contain a raindrop
    if (rnd.x > 0.68) {
      // Randomized horizontal center within the cell (completely eliminates vertical columns!)
      float dropCenterX = float(x) + 0.12 + (rnd.y * 0.76);
      float dx = abs(f.x - dropCenterX);

      // Random length and vertical start offset
      float dropLen = 0.38 + rnd.x * 0.48;
      float dy = f.y - (rnd.y * 0.45);

      if (dy > 0.0 && dy < dropLen) {
        float streak = (1.0 - dy / dropLen) * smoothstep(0.065, 0.0, dx);
        rain += streak * (0.35 + rnd.y * 0.65);
      }
    }
  }

  return rain;
}

float rainStreaks(vec2 uv, float t) {
  // Rain strictly in upper ~85% of screen, fading gently toward bottom
  float rainMask = 1.0 - smoothstep(0.68, 0.88, uv.y);
  if (rainMask < 0.01) return 0.0;

  // Multi-scale randomized layers with brisk, natural rainfall speeds
  float lA = rainLayer(uv, t, vec2(110.0, 7.0), 22.0, 0.14) * 0.35;
  float lB = rainLayer(uv, t, vec2(190.0, 11.0), 30.0, 0.12) * 0.24;
  float lC = rainLayer(uv, t, vec2(290.0, 15.0), 38.0, 0.15) * 0.15;

  return (lA + lB + lC) * rainMask;
}

/* ═══════════════════ GROUND FOG / MIST ═══════════════════ */
float groundFog(vec2 uv, float t, vec2 mouse) {
  float hGrad = smoothstep(0.35, 1.0, uv.y);
  if (hGrad < 0.001) return 0.0;

  vec2 toMouse = uv - mouse;
  float mDist  = length(toMouse);
  vec2  mPush  = normalize(toMouse + 0.001) * exp(-mDist * 10.0) * 0.02;

  vec2 c1 = (uv + mPush)       * vec2(3.0, 1.6) + vec2( t * 0.038, -t * 0.014);
  vec2 c2 = (uv + mPush * 0.5) * vec2(5.0, 2.4) + vec2(-t * 0.026,  t * 0.009);

  float n1   = fbm(c1);
  float n2   = fbm(c2 + vec2(n1 * 0.5, 0.0));
  float dens = smoothstep(0.20, 0.78, n2) * hGrad;

  float wisp = vnoise(uv * vec2(2.8, 1.4) + vec2(t * 0.022, 0.0));
  dens += smoothstep(0.3, 0.8, wisp) * smoothstep(0.52, 0.86, uv.y) * 0.20;

  return clamp(dens, 0.0, 1.0);
}

/* ═══════════════════ MAIN ═══════════════════ */
void main() {
  vec2 uv = vUv;

  // 1. Subtle Parallax UV shift (CSS 3D perspective already tilts viewport)
  vec2 pUv = uv + uParallax * 0.005;

  // 2. Akella mouseover liquid displacement effect
  vec2 disp   = akellaDisplacement(uv, uMouse, uVelo);
  vec2 dUv    = pUv + disp;

  // 3. Time-travel shockwave
  if (uSurge > 0.001) {
    vec2  ctr  = vec2(0.5, 0.20);
    vec2  dir  = uv - ctr;
    float dist = length(dir);
    float wave = sin(dist * 30.0 - uTime * 14.0) * exp(-dist * 2.8);
    dUv += normalize(dir + 0.001) * wave * 0.028 * uSurge;
  }

  // Responsive desktop fill (aspect-ratio preserving cover)
  vec2 coverUv = getCoverUv(dUv);
  vec2 sampleUv = clamp(coverUv, 0.001, 0.999);

  // 4. Sample texture with Akella RGB split chromatic aberration
  float ca = length(disp) * 0.45;
  if (uSurge > 0.01) {
    ca += uSurge * 0.009;
  }

  vec4 col;
  if (ca > 0.001) {
    vec2 dir = normalize(disp + 0.0001);
    vec2 rUv = clamp(sampleUv + dir * ca * 1.5, 0.001, 0.999);
    vec2 gUv = sampleUv;
    vec2 bUv = clamp(sampleUv - dir * ca * 1.5, 0.001, 0.999);
    col = vec4(
      texture2D(uTex, rUv).r,
      texture2D(uTex, gUv).g,
      texture2D(uTex, bUv).b,
      1.0
    );
  } else {
    col = texture2D(uTex, sampleUv);
  }

  // 5. Calm atmospheric warm light (pumpkins & lanterns anchored to image coords)
  vec2 texUv = getCoverUv(uv);
  float f1 = sin(uTime * 3.5) * 0.06 + cos(uTime * 6.0) * 0.04;
  float f2 = sin(uTime * 4.0 + 1.1) * 0.05 + cos(uTime * 5.5) * 0.04;

  float gL = smoothstep(0.45, 0.0, length(texUv - vec2(0.07, 0.83))) * (1.0 + f1);
  float gR = smoothstep(0.45, 0.0, length(texUv - vec2(0.89, 0.85))) * (1.0 + f2);
  float gC = smoothstep(0.35, 0.0, length(texUv - vec2(0.50, 0.77))) * (1.0 + f1 * 0.9);
  col.rgb += vec3(1.0, 0.52, 0.16) * (gL * 0.30 + gR * 0.36 + gC * 0.24);

  // Moon glow anchored to image
  float mDist = length((texUv - vec2(0.5, 0.17)) * vec2(1.3, 1.0));
  float moon  = smoothstep(0.33, 0.0, mDist) * (0.13 + sin(uTime * 1.4) * 0.03);
  col.rgb    += vec3(0.60, 0.78, 1.0) * moon;

  // 6. Randomized WebGL Rain streaks (organic scatter, no line alignment)
  col.rgb += vec3(0.72, 0.84, 0.98) * rainStreaks(uv, uTime);

  // 7. Ground fog
  float fog   = groundFog(uv, uTime, uMouse);
  vec3 fogCol = mix(vec3(0.15, 0.18, 0.30), vec3(0.35, 0.26, 0.42),
                    sin(uTime * 0.45) * 0.5 + 0.5);
  fogCol += vec3(0.38, 0.18, 0.04) * (gL + gR);
  col.rgb  = mix(col.rgb, fogCol, fog * 0.44);

  // 8. Surge boost
  if (uSurge > 0.001) col.rgb += vec3(0.65, 0.82, 1.0) * uSurge * 0.38;

  // 9. Vignette & Soft edge fade to deep black
  vec2  vc  = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  float vig = smoothstep(0.90, 0.28, length(vc));
  col.rgb  *= clamp(vig + 0.15, 0.0, 1.0);

  // Deep black edge fade on outer 3.5%
  float edgeFade = smoothstep(0.0, 0.035, uv.x) * smoothstep(1.0, 0.965, uv.x) *
                   smoothstep(0.0, 0.035, uv.y) * smoothstep(1.0, 0.965, uv.y);
  col.rgb *= edgeFade;

  gl_FragColor = vec4(col.rgb, 1.0);
}`;

    const vs = this._compile(gl.VERTEX_SHADER,   VS);
    const fs = this._compile(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return;

    this.program = gl.createProgram();
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error('WebGL link error:', gl.getProgramInfoLog(this.program));
      return;
    }

    // Full-screen triangle pair
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1,-1,  1,-1,  -1,1,
      -1, 1,  1,-1,   1,1
    ]), gl.STATIC_DRAW);

    const loc = gl.getAttribLocation(this.program, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    this.U = {
      tex:     gl.getUniformLocation(this.program, 'uTex'),
      res:     gl.getUniformLocation(this.program, 'uRes'),
      imgRes:  gl.getUniformLocation(this.program, 'uImageRes'),
      time:    gl.getUniformLocation(this.program, 'uTime'),
      par:     gl.getUniformLocation(this.program, 'uParallax'),
      mouse:   gl.getUniformLocation(this.program, 'uMouse'),
      velo:    gl.getUniformLocation(this.program, 'uVelo'),
      surge:   gl.getUniformLocation(this.program, 'uSurge')
    };

    this._loadTex('https://ik.imagekit.io/HUDs/halloween/out%20image.png');
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  /* ─────────────────────────── HELPERS ─────────────────────────── */

  _compile(type, src) {
    const gl = this.gl;
    const s  = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('Shader error:', gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  _loadTex(url) {
    const gl = this.gl;
    this.bgTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.bgTexture);
    // Placeholder pure black pixel
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                  new Uint8Array([0, 0, 0, 255]));
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      this.imageRes.w = img.naturalWidth || img.width || 1936;
      this.imageRes.h = img.naturalHeight || img.height || 1097;
      gl.bindTexture(gl.TEXTURE_2D, this.bgTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    };
    img.onerror = () => {
      console.warn('Failed to load texture from remote, trying local fallback:', url);
      if (!url.startsWith('assets/')) {
        this._loadTex('assets/background.png');
      }
    };
    img.src = url;
  }

  _resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = this.canvas.clientWidth || Math.floor(window.innerWidth * 1.3);
    const h = this.canvas.clientHeight || Math.floor(window.innerHeight * 1.3);
    if (w <= 0 || h <= 0) return;
    this.canvas.width  = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  /* ─────────────────────────── PUBLIC API ─────────────────────────── */

  setParallax(x, y) {
    this.parallax.tx = x;
    this.parallax.ty = y;
  }

  setMouse(x, y) {
    this.mouse.tx = x;
    this.mouse.ty = y;
  }

  triggerTimeTravelSurge() {
    this.timeSurgeTgt = 1.0;
  }

  render() {
    const gl = this.gl;
    if (!gl || !this.program) return;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const L = 0.035; // lerp factor for parallax (slower, smoother)
    this.parallax.x  += (this.parallax.tx - this.parallax.x)  * L;
    this.parallax.y  += (this.parallax.ty - this.parallax.y)  * L;

    // Smoothed mouse lerp so mouseover wave flows gently and gracefully
    this.mouse.x     += (this.mouse.tx    - this.mouse.x)     * 0.14;
    this.mouse.y     += (this.mouse.ty    - this.mouse.y)     * 0.14;

    // Compute cursor velocity with relaxed dampening
    const dx = this.mouse.tx - this.prevMouse.x;
    const dy = this.mouse.ty - this.prevMouse.y;
    const speed = Math.sqrt(dx * dx + dy * dy);
    const targetVelo = Math.min(1.0, speed * 10.0);
    this.velo += (targetVelo - this.velo) * 0.08;
    this.prevMouse.x = this.mouse.tx;
    this.prevMouse.y = this.mouse.ty;

    this.timeSurge   += (this.timeSurgeTgt - this.timeSurge)  * 0.10;
    this.timeSurgeTgt *= 0.93;

    gl.useProgram(this.program);

    // Reduced time uniform speed for calm, slow, atmospheric shader movement
    const t = (performance.now() - this.startTime) * 0.00045;
    gl.uniform1f(this.U.time,   t);
    gl.uniform2f(this.U.res,    this.canvas.width, this.canvas.height);
    gl.uniform2f(this.U.imgRes, this.imageRes.w, this.imageRes.h);
    gl.uniform2f(this.U.par,    this.parallax.x, this.parallax.y);
    gl.uniform2f(this.U.mouse,  this.mouse.x,    this.mouse.y);
    gl.uniform1f(this.U.velo,   this.velo);
    gl.uniform1f(this.U.surge,  this.timeSurge);

    if (this.bgTexture) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.bgTexture);
      gl.uniform1i(this.U.tex, 0);
    }

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}
