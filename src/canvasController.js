// Canvas Frame Controller for Bake Berry Foods
// 50-frame sequence loading (1920x1080 Full HD), high-DPI canvas drawing, mobile-aware framing, and gyroscope 3D tilt integration

import { sound } from './audio.js';
import { gyro } from './gyroscope.js';

export class CanvasFrameController {
  constructor(options) {
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.heroTrack = options.heroTrack;
    this.cardOverlay = options.cardOverlay;
    this.scrollCta = options.scrollCta;
    this.progressBar = options.progressBar;
    this.progressText = options.progressText;
    this.preloader = options.preloader;

    this.totalFrames = 50;
    this.images = [];
    this.isLoaded = false;

    this.currentProgress = 0;
    this.targetProgress = 0;
    this.currentFrameIndex = 0;
    this.lastSoundFrame = -1;

    this.tilt = { x: 0, y: 0, degX: 0, degY: 0 };
    this.mouseTilt = { x: 0, y: 0, targetX: 0, targetY: 0 };

    this.init();
  }

  async init() {
    this.setupResize();
    this.setupGyroscope();
    this.setupCardMouseTilt();
    await this.preloadImages();
    this.renderLoop();
  }

  setupResize() {
    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      const width = window.innerWidth;
      const height = window.innerHeight;

      this.canvas.width = Math.round(width * dpr);
      this.canvas.height = Math.round(height * dpr);
      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;

      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(dpr, dpr);
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'high';

      this.drawFrame(this.currentFrameIndex);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
  }

  setupGyroscope() {
    // Subscribe to gyroscope updates (mobile hardware motion)
    gyro.onTilt((data) => {
      this.tilt = data;
    });
  }

  setupCardMouseTilt() {
    // Desktop interactive 3D mouse parallax tilt specifically for the invitation card
    window.addEventListener(
      'mousemove',
      (e) => {
        if (this.currentProgress < 0.5) return;

        const card = this.cardOverlay;
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;
        const cardCenterY = rect.top + rect.height / 2;

        const rangeX = Math.max(window.innerWidth * 0.45, rect.width * 1.5);
        const rangeY = Math.max(window.innerHeight * 0.45, rect.height * 1.5);

        const dx = (e.clientX - cardCenterX) / rangeX;
        const dy = (e.clientY - cardCenterY) / rangeY;

        this.mouseTilt.targetX = Math.min(1, Math.max(-1, dx));
        this.mouseTilt.targetY = Math.min(1, Math.max(-1, dy));
      },
      { passive: true }
    );

    window.addEventListener('mouseleave', () => {
      this.mouseTilt.targetX = 0;
      this.mouseTilt.targetY = 0;
    });
  }

  preloadImages() {
    return new Promise((resolve) => {
      let loadedCount = 0;
      const pad = (n) => String(n).padStart(3, '0');
      const base = import.meta.env.BASE_URL || './';
      const cleanBase = base.endsWith('/') ? base : `${base}/`;

      for (let i = 1; i <= this.totalFrames; i++) {
        const img = new Image();
        img.src = `${cleanBase}Frames/frame-${pad(i)}.webp`;

        img.onload = () => {
          loadedCount++;
          const percent = Math.round((loadedCount / this.totalFrames) * 100);
          if (this.progressBar) this.progressBar.style.width = `${percent}%`;
          if (this.progressText) this.progressText.textContent = `${percent}%`;

          if (loadedCount === this.totalFrames) {
            this.isLoaded = true;
            setTimeout(() => {
              if (this.preloader) {
                this.preloader.classList.add('loaded');
                setTimeout(() => {
                  this.preloader.style.display = 'none';
                }, 700);
              }
              this.drawFrame(0);
              resolve();
            }, 250);
          }
        };

        img.onerror = () => {
          img.src = `${cleanBase}Frames/ezgif-frame-${pad(i)}.png`;
        };

        this.images.push(img);
      }
    });
  }

  setProgress(progress) {
    this.targetProgress = Math.min(1, Math.max(0, progress));

    if (this.scrollCta) {
      if (this.targetProgress > 0.04) {
        this.scrollCta.style.opacity = '0';
        this.scrollCta.style.pointerEvents = 'none';
        this.scrollCta.style.transform = 'translate(-50%, 15px)';
      } else {
        this.scrollCta.style.opacity = '1';
        this.scrollCta.style.pointerEvents = 'auto';
        this.scrollCta.style.transform = 'translate(-50%, 0)';
      }
    }
  }

  drawFrame(frameIndex) {
    if (!this.isLoaded || !this.images[frameIndex]) return;
    const img = this.images[frameIndex];
    if (!img.complete || img.naturalWidth === 0) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const imgWidth = 1920;
    const imgHeight = 1080;
    const imgAspect = imgWidth / imgHeight;
    const screenAspect = width / height;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (screenAspect < 1.0) {
      // Mobile Portrait View:
      const mobileScale = Math.max(width / 1360, height / 1080);
      drawWidth = imgWidth * mobileScale;
      drawHeight = imgHeight * mobileScale;
      offsetX = (width - drawWidth) / 2;
      offsetY = (height - drawHeight) / 2;
    } else if (screenAspect > imgAspect) {
      // Desktop Landscape:
      drawWidth = width;
      drawHeight = width / imgAspect;
      offsetX = 0;
      offsetY = (height - drawHeight) / 2;

      if (offsetY < 0) {
        offsetY = Math.min(0, offsetY * 0.25);
      }
    } else {
      drawHeight = height;
      drawWidth = height * imgAspect;
      offsetX = (width - drawWidth) / 2;
      offsetY = 0;
    }

    // Dynamic Gyroscope Parallax Shift (shifts the background & 3D treats)
    const shiftX = this.tilt.x * 14;
    const shiftY = this.tilt.y * 14;

    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    this.ctx.drawImage(
      img,
      offsetX + shiftX,
      offsetY + shiftY,
      drawWidth,
      drawHeight
    );
  }

  updateCardOverlay(frameIndex, progress) {
    if (!this.cardOverlay) return;

    const cardStart = 0.65;
    const cardFull = 0.92;

    let cardOpacity = 0;
    let cardScale = 0.95;
    let cardTranslateY = 25;

    if (progress >= cardStart) {
      const t = Math.min(1, (progress - cardStart) / (cardFull - cardStart));
      cardOpacity = t;
      cardScale = 0.95 + 0.05 * t;
      cardTranslateY = 25 * (1 - t);
    }

    this.cardOverlay.style.opacity = cardOpacity.toFixed(3);
    this.cardOverlay.style.pointerEvents = cardOpacity > 0.75 ? 'auto' : 'none';

    // 3D Spatial Motion on the Card: Hardware Gyroscope (Mobile) + Mouse Parallax (Desktop)
    const combinedX = this.tilt.x + this.mouseTilt.x;
    const combinedY = this.tilt.y + this.mouseTilt.y;

    const tiltDegX = this.tilt.degX + (-this.mouseTilt.y * 15);
    const tiltDegY = this.tilt.degY + (this.mouseTilt.x * 17);

    this.cardOverlay.style.transform = `
      translate(-50%, -50%)
      translateY(${cardTranslateY}px)
      scale(${cardScale})
      perspective(1000px)
      rotateX(${tiltDegX.toFixed(2)}deg)
      rotateY(${tiltDegY.toFixed(2)}deg)
    `;

    // Dynamic Foil Sheen Reflection based on tilt
    const sheen = this.cardOverlay.querySelector('.card-foil-sheen');
    if (sheen) {
      const lightX = 50 + combinedX * 42;
      const lightY = 50 + combinedY * 42;
      sheen.style.background = `radial-gradient(circle at ${lightX.toFixed(1)}% ${lightY.toFixed(1)}%, rgba(255, 255, 255, 0.45) 0%, rgba(212, 175, 55, 0.15) 35%, rgba(255, 255, 255, 0) 70%)`;
    }
  }

  renderLoop() {
    this.currentProgress += (this.targetProgress - this.currentProgress) * 0.14;

    // Smooth damping / lerp for desktop mouse card tilt
    this.mouseTilt.x += (this.mouseTilt.targetX - this.mouseTilt.x) * 0.1;
    this.mouseTilt.y += (this.mouseTilt.targetY - this.mouseTilt.y) * 0.1;

    const frameIdx = Math.min(
      this.totalFrames - 1,
      Math.max(0, Math.floor(this.currentProgress * (this.totalFrames - 1)))
    );

    if (frameIdx !== this.currentFrameIndex) {
      this.currentFrameIndex = frameIdx;
      this.drawFrame(frameIdx);

      if (
        (frameIdx >= 14 && frameIdx <= 18 && this.lastSoundFrame < 14) ||
        (frameIdx >= 32 && frameIdx <= 36 && this.lastSoundFrame < 32)
      ) {
        sound.playEnvelopeOpenSound(this.currentProgress);
        this.lastSoundFrame = frameIdx;
      } else if (frameIdx < 10) {
        this.lastSoundFrame = 0;
      }
    } else {
      // Redraw frame if gyroscope tilt is active
      if (Math.abs(this.tilt.x) > 0.005 || Math.abs(this.tilt.y) > 0.005) {
        this.drawFrame(this.currentFrameIndex);
      }
    }

    this.updateCardOverlay(this.currentFrameIndex, this.currentProgress);

    requestAnimationFrame(() => this.renderLoop());
  }
}
