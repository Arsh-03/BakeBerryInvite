// Main Application Script for Bake Berry Foods Grand Opening Invitation
import './style.css';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { CanvasFrameController } from './canvasController.js';
import { AmbientBackground } from './ambientBackground.js';
import { initScrollAnimations, animateMenuCards } from './animations.js';
import { sound } from './audio.js';
import { RSVPManager } from './rsvp.js';
import { Guestbook } from './guestbook.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Moving Textured Ambient Background
  new AmbientBackground();

  // 2. Initialize Lenis Smooth Scroll with Mobile Touch Momentum
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.8,
    syncTouch: true,
  });

  // 3. Initialize Frame Controller with Mobile-Aware Sizing
  const heroTrack = document.getElementById('hero-track');
  const frameController = new CanvasFrameController({
    canvas: document.getElementById('envelope-canvas'),
    heroTrack: heroTrack,
    cardOverlay: document.getElementById('invitation-card-overlay'),
    scrollCta: document.getElementById('scroll-cta'),
    progressBar: document.getElementById('loader-progress-bar'),
    progressText: document.getElementById('loader-percent'),
    preloader: document.getElementById('preloader')
  });

  // 4. Connect Lenis Scroll to 3D Envelope Scrubbing
  lenis.on('scroll', (e) => {
    const scrollY = e.scroll;
    const trackHeight = heroTrack.offsetHeight - window.innerHeight;

    if (trackHeight > 0) {
      const progress = Math.min(1, Math.max(0, scrollY / trackHeight));
      frameController.setProgress(progress);
    }
  });

  const initialScrollY = window.scrollY || window.pageYOffset || 0;
  const initialTrackHeight = heroTrack.offsetHeight - window.innerHeight;
  if (initialTrackHeight > 0) {
    frameController.setProgress(initialScrollY / initialTrackHeight);
  }

  // 4b. Tap to Reveal Feature: Tap or Click unfolds the 3D envelope automatically
  const triggerAutoReveal = () => {
    const trackHeight = heroTrack.offsetHeight - window.innerHeight;
    if (trackHeight > 0) {
      lenis.scrollTo(trackHeight, {
        duration: 2.4,
        easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      });
    }
  };

  const scrollCta = document.getElementById('scroll-cta');
  if (scrollCta) {
    scrollCta.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      triggerAutoReveal();
    });
  }

  const canvasEl = document.getElementById('envelope-canvas');
  if (canvasEl) {
    canvasEl.style.cursor = 'pointer';
    canvasEl.addEventListener('click', () => {
      if (frameController.currentProgress < 0.18) {
        triggerAutoReveal();
      }
    });
  }

  // 5. Initialize GSAP ScrollTrigger Animations
  initScrollAnimations(lenis);

  // 6. RSVP & Guestbook Managers
  new RSVPManager();
  new Guestbook();

  // 7. Minimalist Audio Atmosphere Toggle
  const audioBtn = document.getElementById('audio-toggle');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      const isPlaying = sound.toggleMute();
      audioBtn.classList.toggle('playing', isPlaying);
    });
  }

  // 8. Countdown Timer
  setupCountdown();

  // 9. Signature Creations Filter
  setupMenuShowcase();

  // 10. Smooth Anchor Links via Lenis
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: 0, duration: 1.4 });
      }
    });
  });
});

// Countdown Timer logic
function setupCountdown() {
  const targetDate = new Date('2026-10-11T16:00:00+05:30').getTime();

  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-mins');
  const secsEl = document.getElementById('cd-secs');

  if (!daysEl) return;

  function update() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minsEl.textContent = '00';
      secsEl.textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minsEl.textContent = String(mins).padStart(2, '0');
    secsEl.textContent = String(secs).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

// Menu Showcase logic
const menuItems = [
  {
    category: 'berry',
    name: 'Belagavi Wild Berry Charlotte',
    badge: 'Chef Signature',
    tag: 'Eggless Available',
    desc: 'Handcrafted ladyfingers crown a luscious wild blackberry & raspberry Bavarian cream, topped with fresh farm-plucked berries and edible 24k gold leaf.',
    highlights: 'Fresh Mahabaleshwar berries • Madagascar Bourbon Vanilla • 24k Gold'
  },
  {
    category: 'berry',
    name: 'Ruby Raspberry Rose Cruffin',
    badge: 'Patisserie Special',
    tag: 'Signature Flaky',
    desc: 'Hybrid flaky croissant-muffin rolled in aromatic raspberry sugar, piped generously with ruby chocolate ganache and Persian rose berry compote.',
    highlights: 'French Butter • Pure Raspberry Purée • Ruby Callebaut'
  },
  {
    category: 'viennoiserie',
    name: '72-Hour Butter Croissant',
    badge: 'Artisan Classic',
    tag: 'French Viennoiserie',
    desc: 'Laminated slowly over three days with premium French Isigny Ste Mère butter for an extraordinary honeycomb open crumb and unmatched crispness.',
    highlights: 'AOP French Butter • Stone-ground T55 Flour • Flaky Honeycomb'
  },
  {
    category: 'viennoiserie',
    name: 'Artisan Berry Cranberry Sourdough',
    badge: 'Naturally Leavened',
    tag: 'Pure Veg',
    desc: 'Crispy crackling crust with a tender, moist interior loaded with slow-fermented cranberries, toasted walnuts, and a 6-year-old mother sourdough starter.',
    highlights: 'Wild Sourdough Yeast • Cranberries & Walnuts • 36h Fermentation'
  },
  {
    category: 'patisserie',
    name: 'Royal Belgian Dark Chocolate Gateau',
    badge: 'Best Seller',
    tag: 'Eggless Option',
    desc: 'Rich 70% Callebaut dark chocolate truffle layers, delicate feuilletine hazelnut praline crunch, and a mirror glaze finished with dark cocoa dust.',
    highlights: '70% Belgian Dark Chocolate • Hazelnut Praline • Valrhona Glaze'
  },
  {
    category: 'patisserie',
    name: 'Blueberry Lavender Velvet Cheesecake',
    badge: 'Gourmet Cold Bake',
    tag: 'Velvet Soft',
    desc: 'Silky Philadelphia cream cheese infused with subtle culinary lavender essence, smothered in a homemade crushed wild blueberry reduction on a buttery biscuit base.',
    highlights: 'Philadelphia Cream Cheese • Whole Blueberries • Provencal Lavender'
  },
  {
    category: 'macarons',
    name: 'Haute Macaron Gifting Box',
    badge: 'Luxury Box of 6',
    tag: 'Gluten-Free Recipe',
    desc: 'Delicate Parisian almond meringue shells filled with handcrafted ganaches: Raspberry Rose, Sicilian Pistachio, Salted Caramel, and Blackberry Vanilla.',
    highlights: 'California Almond Flour • Belgian White Chocolate • Natural Colors'
  },
  {
    category: 'beverages',
    name: 'Bake Berry Signature Velvet Latte',
    badge: 'Barista Exclusive',
    tag: 'Hot / Iced',
    desc: 'Freshly pulled single-origin Chikmagalur espresso gently poured over velvet steamed berry-infused milk and finished with dusted cocoa berries.',
    highlights: 'Single Estate Arabica • Natural Berry Essence • Velvety Microfoam'
  }
];

function setupMenuShowcase() {
  const grid = document.getElementById('menu-grid');
  const tabs = document.querySelectorAll('.menu-tab');
  if (!grid) return;

  function render(category = 'all') {
    const filtered = category === 'all' 
      ? menuItems 
      : menuItems.filter((item) => item.category === category);

    grid.innerHTML = filtered.map((item) => `
      <div class="menu-card glass-panel" data-category="${item.category}">
        <div class="menu-card-top">
          <span class="menu-badge">${item.badge}</span>
          <span class="menu-tag">${item.tag}</span>
        </div>
        <h3 class="menu-title">${item.name}</h3>
        <p class="menu-desc">${item.desc}</p>
        <div class="menu-footer">
          <span class="menu-highlights">✨ ${item.highlights}</span>
        </div>
      </div>
    `).join('');

    animateMenuCards();
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      render(tab.dataset.filter);
    });
  });

  render('all');
}
