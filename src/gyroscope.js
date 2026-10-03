// Gyroscope & Spatial Motion Manager for Bake Berry Foods
// Handles real-time device orientation (iOS & Android) with desktop mouse fallback and smooth damping

class GyroscopeManager {
  constructor() {
    this.tilt = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.listeners = [];
    this.hasPermission = false;
    this.isSupported = false;
    this.isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    this.initialBeta = null;

    this.init();
  }

  init() {
    // Check for DeviceOrientationEvent support
    if (window.DeviceOrientationEvent) {
      this.isSupported = true;

      // On iOS 13+, DeviceOrientationEvent.requestPermission is required
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        this.setupIOSPermissionPrompt();
      } else {
        // Android and standard mobile browsers
        this.startListening();
      }
    }

    this.loop();
  }

  setupIOSPermissionPrompt() {
    // Create an elegant, floating golden pill on mobile if permission is required
    const prompt = document.createElement('div');
    prompt.id = 'gyro-permission-pill';
    prompt.className = 'gyro-permission-pill';
    prompt.innerHTML = `
      <button id="btn-request-gyro" class="btn-gyro-prompt">
        <span>✨ Tap to Enable 3D Tilt</span>
      </button>
    `;

    const handleRequest = async () => {
      try {
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === 'granted') {
          this.hasPermission = true;
          this.startListening();
          prompt.classList.add('hide');
          setTimeout(() => prompt.remove(), 500);
        }
      } catch (err) {
        console.warn('Gyroscope permission:', err);
      }
    };

    document.addEventListener('DOMContentLoaded', () => {
      // Only show on iOS mobile devices
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        document.body.appendChild(prompt);
        const btn = document.getElementById('btn-request-gyro');
        if (btn) btn.addEventListener('click', handleRequest);
      }
    });

    // Also trigger on first screen tap for seamless UX
    const firstTouchHandler = async () => {
      if (!this.hasPermission && typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          const res = await DeviceOrientationEvent.requestPermission();
          if (res === 'granted') {
            this.hasPermission = true;
            this.startListening();
            if (prompt) prompt.remove();
          }
        } catch (_) {}
      }
      window.removeEventListener('touchend', firstTouchHandler);
    };
    window.addEventListener('touchend', firstTouchHandler, { once: true });
  }

  startListening() {
    window.addEventListener(
      'deviceorientation',
      (e) => {
        if (e.gamma === null || e.beta === null) return;

        // Calibrate resting angle (natural phone holding angle is ~45°)
        if (this.initialBeta === null) {
          this.initialBeta = e.beta;
        }

        // Clamp & normalize gamma (-35 to +35 degrees -> -1 to +1)
        const normalizedX = Math.min(1, Math.max(-1, e.gamma / 30));

        // Clamp & normalize beta relative to natural resting angle
        const deltaBeta = e.beta - (this.initialBeta || 45);
        const normalizedY = Math.min(1, Math.max(-1, deltaBeta / 30));

        this.tilt.targetX = normalizedX;
        this.tilt.targetY = normalizedY;
      },
      { passive: true }
    );
  }

  onTilt(callback) {
    this.listeners.push(callback);
  }

  loop() {
    // Smooth damping / interpolation for jitter-free 3D tilt
    this.tilt.x += (this.tilt.targetX - this.tilt.x) * 0.1;
    this.tilt.y += (this.tilt.targetY - this.tilt.y) * 0.1;

    const data = {
      x: this.tilt.x,
      y: this.tilt.y,
      degX: -this.tilt.y * 14, // Tilt angle in degrees for CSS rotateX
      degY: this.tilt.x * 16,  // Tilt angle in degrees for CSS rotateY
    };

    for (let i = 0; i < this.listeners.length; i++) {
      this.listeners[i](data);
    }

    requestAnimationFrame(() => this.loop());
  }
}

export const gyro = new GyroscopeManager();
