// Ambient Moving Textured Background Engine for Bake Berry Foods
// Renders luxury tactile parchment grain, soft drifting warm bakery bokeh, and floating golden confection dust reacting to gyroscope tilt

import { gyro } from './gyroscope.js';

export class AmbientBackground {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'ambient-bg-canvas';
    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.particles = [];
    this.numParticles = window.innerWidth < 768 ? 26 : 48;
    this.scrollY = 0;
    this.tilt = { x: 0, y: 0 };
    this.time = 0;

    this.init();
  }

  init() {
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '0';
    this.canvas.style.opacity = '0.9';
    document.body.prepend(this.canvas);

    this.setupResize();
    this.initParticles();
    this.setupListeners();
    this.animate();
  }

  setupResize() {
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = Math.round(this.width * dpr);
      this.canvas.height = Math.round(this.height * dpr);
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(dpr, dpr);
    };
    window.addEventListener('resize', resize, { passive: true });
    resize();
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 2.2 + 0.8,
        baseAlpha: Math.random() * 0.35 + 0.15,
        speedY: Math.random() * 0.35 + 0.15,
        speedX: (Math.random() - 0.5) * 0.2,
        oscillation: Math.random() * Math.PI * 2,
        color: Math.random() > 0.4 ? '#D4AF37' : '#E5C07B'
      });
    }
  }

  setupListeners() {
    window.addEventListener('scroll', () => {
      this.scrollY = window.scrollY || window.pageYOffset || 0;
    }, { passive: true });

    // Connect Gyroscope tilt
    gyro.onTilt((data) => {
      this.tilt.x = data.x;
      this.tilt.y = data.y;
    });
  }

  animate() {
    this.time += 0.015;
    const w = this.width;
    const h = this.height;

    this.ctx.clearRect(0, 0, w, h);

    // 1. Moving Warm Bakery Light Gradients with Gyroscope Parallax
    const driftX1 = Math.sin(this.time * 0.5) * (w * 0.15) + this.tilt.x * 30;
    const driftY1 = Math.cos(this.time * 0.4) * (h * 0.12) + this.tilt.y * 30;

    const grad1 = this.ctx.createRadialGradient(
      w * 0.2 + driftX1,
      h * 0.25 + driftY1,
      10,
      w * 0.2 + driftX1,
      h * 0.25 + driftY1,
      w * 0.5
    );
    grad1.addColorStop(0, 'rgba(255, 243, 220, 0.45)');
    grad1.addColorStop(1, 'rgba(250, 247, 242, 0)');

    this.ctx.fillStyle = grad1;
    this.ctx.fillRect(0, 0, w, h);

    const driftX2 = Math.cos(this.time * 0.35) * (w * 0.12) - this.tilt.x * 25;
    const driftY2 = Math.sin(this.time * 0.45) * (h * 0.15) - this.tilt.y * 25;

    const grad2 = this.ctx.createRadialGradient(
      w * 0.8 + driftX2,
      h * 0.7 + driftY2,
      20,
      w * 0.8 + driftX2,
      h * 0.7 + driftY2,
      w * 0.55
    );
    grad2.addColorStop(0, 'rgba(255, 235, 215, 0.35)');
    grad2.addColorStop(1, 'rgba(250, 247, 242, 0)');

    this.ctx.fillStyle = grad2;
    this.ctx.fillRect(0, 0, w, h);

    // 2. Floating Golden Confection Dust Particles with Gravity Tilt
    const gravityShiftX = this.tilt.x * 20;

    for (const p of this.particles) {
      p.oscillation += 0.02;
      p.y -= p.speedY;
      p.x += p.speedX + Math.sin(p.oscillation) * 0.35 + this.tilt.x * 0.4;

      if (p.y < -10) {
        p.y = h + 10;
        p.x = Math.random() * w;
      }
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;

      const shiftY = (this.scrollY * 0.05) % h;
      const drawY = (p.y - shiftY + h) % h;

      this.ctx.beginPath();
      this.ctx.arc(p.x + gravityShiftX, drawY, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.baseAlpha + Math.sin(this.time + p.oscillation) * 0.1;
      this.ctx.fill();
    }

    this.ctx.globalAlpha = 1.0;

    requestAnimationFrame(() => this.animate());
  }
}
