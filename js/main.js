import { SoundEngine } from './audio.js';
import { WebGLEffects } from './webgl-effects.js';
import { BatSystem } from './bats.js';
import { ParallaxController } from './parallax.js';

document.addEventListener('DOMContentLoaded', () => {
  const glCanvas = document.getElementById('gl-canvas');
  const batsCanvas = document.getElementById('bats-canvas');
  const sceneViewport = document.getElementById('scene-viewport');
  const musicToggleBtn = document.getElementById('music-toggle');
  const musicStatusText = document.getElementById('music-status');
  const audioWave = document.getElementById('audio-wave');
  const startBtn = document.getElementById('start-btn');
  const flashOverlay = document.getElementById('flash-overlay');
  const audioHint = document.getElementById('audio-hint');
  const preloader = document.getElementById('preloader');
  const preloaderProgressBar = document.getElementById('preloader-progress-bar');

  // Preload key assets in the browser
  const ASSETS_TO_PRELOAD = [
    'https://ik.imagekit.io/HUDs/halloween/out%20image.png',
    'https://ik.imagekit.io/HUDs/halloween/logo.png',
    'assets/pub-bg.png',
    'assets/front-parallax.png',
    'https://ik.imagekit.io/HUDs/halloween/paper%20background.png',
    'https://ik.imagekit.io/HUDs/halloween/charct%20er%201.png?updatedAt=1789840793159',
    'https://ik.imagekit.io/HUDs/halloween/charct%20er%202.png?updatedAt=1789840793292',
    'https://ik.imagekit.io/HUDs/halloween/charct%20er%203.png?updatedAt=1789840794166',
    'https://ik.imagekit.io/HUDs/halloween/charct%20er%204.png?updatedAt=1789840794599',
    'https://ik.imagekit.io/HUDs/halloween/charct%20er%205.png?updatedAt=1789840794723',
    'https://ik.imagekit.io/HUDs/halloween/charct%20er%206.png?updatedAt=1789840794024',
    'https://ik.imagekit.io/HUDs/halloween/character%201/character%201%20-%20hand%202.png?updatedAt=1789912365395',
    'https://ik.imagekit.io/HUDs/halloween/character%202/character%202%20-%20hand%202.png?updatedAt=1789912384034',
    'https://ik.imagekit.io/HUDs/halloween/character%203/character%203%20-%20hand%202.png?updatedAt=1789912400038',
    'https://ik.imagekit.io/HUDs/halloween/character%204/character%204%20-%20hand%202.png?updatedAt=1789912413816',
    'https://ik.imagekit.io/HUDs/halloween/character%205/character%205%20-%20hand%202.png?updatedAt=1789912430323',
    'https://ik.imagekit.io/HUDs/halloween/character%206/character%206%20-%20hand%202.png?updatedAt=1789912446562',
    'https://ik.imagekit.io/HUDs/halloween/sharing%20card%202.png',
    'https://ik.imagekit.io/HUDs/halloween/pumpkin%20half%20filled.svg?updatedAt=1789896688386',
    'https://ik.imagekit.io/HUDs/halloween/pumpkin%20filled.svg?updatedAt=1789896688565',
    'https://ik.imagekit.io/HUDs/halloween/favicon.png',
    'assets/audio/halloween-theme.mp3'
  ];

  let loadedCount = 0;
  let allAssetsLoaded = false;
  let preloaderDismissed = false;
  const dismissPreloader = () => {
    if (preloaderDismissed) return;
    preloaderDismissed = true;
    if (preloader) {
      preloader.classList.add('fade-out');
      setTimeout(() => {
        if (preloader.parentNode) preloader.remove();
      }, 900);
    }
  };

  const startTime = Date.now();
  const MIN_DURATION = 2500; // 2.5s duration (within 2-3 seconds)

  const updateProgress = () => {
    if (preloaderDismissed) return;
    const elapsed = Date.now() - startTime;
    const timeProgress = Math.min(100, (elapsed / MIN_DURATION) * 100);
    const currentProgress = Math.min(100, Math.floor(timeProgress));
    
    if (preloaderProgressBar) {
      preloaderProgressBar.style.width = `${currentProgress}%`;
    }

    if (elapsed >= MIN_DURATION && allAssetsLoaded) {
      if (preloaderProgressBar) preloaderProgressBar.style.width = '100%';
      setTimeout(dismissPreloader, 250);
    } else {
      requestAnimationFrame(updateProgress);
    }
  };
  requestAnimationFrame(updateProgress);

  const onAssetLoad = () => {
    loadedCount++;
    if (loadedCount >= ASSETS_TO_PRELOAD.length) {
      allAssetsLoaded = true;
    }
  };

  ASSETS_TO_PRELOAD.forEach((src) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = onAssetLoad;
    img.onerror = onAssetLoad;
    img.src = src;
  });

  // Safety fallback after 4s
  setTimeout(() => {
    allAssetsLoaded = true;
  }, 3500);
  setTimeout(dismissPreloader, 4000);

  // Initialize Sound Engine
  const soundEngine = new SoundEngine();

  // Initialize WebGL Effects
  const webgl = new WebGLEffects(glCanvas);

  // Initialize Bat System – no time-travel surge callback (ripple/sound removed)
  const batSystem = new BatSystem(batsCanvas, null);

  const isMobileOrTablet = () => {
    return window.innerWidth < 1024 ||
      (window.matchMedia && window.matchMedia('(max-height: 500px) and (orientation: landscape) and (max-width: 1023px)').matches);
  };

  // Music on by default on desktop — attempt immediately, and unlock on any user gesture
  if (!isMobileOrTablet()) {
    soundEngine.start();
  }

  let userExplicitlyMuted = false;
  const unlockAudio = () => {
    if (isMobileOrTablet()) return;
    soundEngine.resumeContext();
    if (!userExplicitlyMuted) {
      if (!soundEngine.isPlaying || soundEngine.isMuted) {
        soundEngine.start();
      }
      updateMusicUI(true);
    }
    hideAudioHint();
  };
  ['pointerdown', 'click', 'touchstart', 'keydown'].forEach((evt) => {
    window.addEventListener(evt, unlockAudio, { passive: true });
  });

  window.addEventListener('resize', () => {
    if (isMobileOrTablet() && soundEngine.isPlaying) {
      soundEngine.mute();
    }
  });

  // Handle browser back button (pageshow event / bfcache restore)
  // Ensures returning to page 1 never gets stuck on black overlay
  const resetOverlay = () => {
    const overlay = document.getElementById('transition-overlay');
    if (overlay) {
      overlay.style.transition = 'none';
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      requestAnimationFrame(() => {
        overlay.style.transition = 'opacity 1.2s ease';
      });
    }
  };
  window.addEventListener('pageshow', resetOverlay);
  resetOverlay();

  // Initialize Parallax Controller
  const parallax = new ParallaxController(sceneViewport, (data) => {
    webgl.setParallax(data.x, data.y);
    webgl.setMouse(data.mouseX, data.mouseY);
    batSystem.setParallax(data.x, data.y);
  });

  // Music Toggle Button Interaction
  const updateMusicUI = (isOn) => {
    if (isOn) {
      musicStatusText.textContent = 'on';
      musicToggleBtn.classList.remove('muted');
      musicToggleBtn.classList.add('active');
      audioWave.classList.remove('muted');
      audioWave.classList.add('playing');
    } else {
      musicStatusText.textContent = 'off';
      musicToggleBtn.classList.remove('active');
      musicToggleBtn.classList.add('muted');
      audioWave.classList.remove('playing');
      audioWave.classList.add('muted');
    }
  };

  musicToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isNowPlaying = soundEngine.toggle();
    userExplicitlyMuted = !isNowPlaying;
    updateMusicUI(isNowPlaying);
    hideAudioHint();
  });

  // Start Experience Button Interaction (Figma node 7:5)
  startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    soundEngine.playClick();
    unlockAudio();

    // Fade to black then navigate smoothly
    const overlay = document.getElementById('transition-overlay');
    if (overlay) {
      overlay.style.transition = 'opacity 0.7s ease';
      overlay.style.pointerEvents = 'auto';
      overlay.style.opacity = '1';
    }
    setTimeout(() => {
      window.location.href = `page2.html?music=${userExplicitlyMuted ? 'off' : 'on'}`;
    }, 750);
  });

  // First interaction hint
  const showAudioHint = () => {
    if (audioHint && (!soundEngine.isPlaying || soundEngine.ctx?.state === 'suspended')) {
      audioHint.classList.add('visible');
      setTimeout(() => {
        audioHint.classList.remove('visible');
      }, 5000);
    }
  };

  const hideAudioHint = () => {
    if (audioHint) {
      audioHint.classList.remove('visible');
    }
  };

  // Subtle user prompt if not interacted after 3 seconds
  setTimeout(showAudioHint, 3000);

  // Main Render Loop
  const animate = () => {
    parallax.update();
    webgl.render();
    batSystem.updateAndRender();
    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
});
