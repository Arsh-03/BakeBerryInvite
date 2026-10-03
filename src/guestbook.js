// Congratulatory Wishes & Guest Wall for Bakeberry Bakery & Cafe
import confetti from 'canvas-confetti';
import { sound } from './audio.js';

export class Guestbook {
  constructor() {
    this.form = document.getElementById('wishes-form');
    this.container = document.getElementById('wishes-list');
    this.toggleBtn = document.getElementById('btn-toggle-wishes-expand');
    this.scrollHint = document.getElementById('wishes-scroll-hint');
    this.countBadge = document.getElementById('wishes-count-badge');
    
    this.defaultWishes = [
      {
        name: "Dr. Sandeep & Sunita Joshi",
        location: "Tilakwadi, Belagavi",
        message: "Heartiest congratulations to Malikrehan & Khubeb! Bakeberry has always delivered the freshest croissants and artisanal cakes. Can't wait to visit the new 4th outlet opp DMart!",
        date: "Just now"
      },
      {
        name: "Pooja Patil & Family",
        location: "Camp, Belagavi",
        message: "Belagavi loves Bakeberry! Wishing the entire Bakeberry Bakery & Cafe family boundless success and sweetness for the grand 4th outlet opening.",
        date: "2 hours ago"
      },
      {
        name: "Vikram Kulkarni",
        location: "Shahapur, Belagavi",
        message: "Your Belgian Chocolate gateau and berry pastries are legendary in town. Super excited for the live baking counters at Nehru Nagar!",
        date: "Yesterday"
      },
      {
        name: "Rajesh & Meera Chougule",
        location: "Nehru Nagar, Belagavi",
        message: "Warmest congratulations on opening right opposite DMart! We are thrilled to have our favorite bakery & cafe in our neighborhood.",
        date: "2 days ago"
      }
    ];
    this.init();
  }

  init() {
    this.renderWishes();
    this.initScrollControls();
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.addWish(e));
    }
  }

  initScrollControls() {
    if (!this.container) return;

    // Ensure Lenis never hijacks touch or wheel on the wishes list
    this.container.setAttribute('data-lenis-prevent', 'true');
    this.container.setAttribute('data-lenis-prevent-touch', 'true');
    this.container.setAttribute('data-lenis-prevent-wheel', 'true');

    // Touch event management: enable buttery smooth mobile swiping without parent scroll trapping
    let touchStartY = 0;
    this.container.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    this.container.addEventListener('touchmove', (e) => {
      if (!e.touches || e.touches.length !== 1) return;
      const currentY = e.touches[0].clientY;
      const deltaY = touchStartY - currentY;
      const { scrollTop, scrollHeight, clientHeight } = this.container;
      const maxScroll = scrollHeight - clientHeight;

      if (maxScroll > 2) {
        const atTop = scrollTop <= 0 && deltaY < 0;
        const atBottom = scrollTop >= maxScroll - 1 && deltaY > 0;
        // Keep scroll gesture local to wishes container
        if (!atTop && !atBottom) {
          e.stopPropagation();
        }
      }
    }, { passive: false });

    // Scroll listener to update scroll hint / indicator
    this.container.addEventListener('scroll', () => {
      this.updateScrollHint();
    }, { passive: true });

    // Expand / Collapse toggle for effortless mobile viewing
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => {
        const isExpanded = this.container.classList.toggle('expanded');
        const textSpan = this.toggleBtn.querySelector('.toggle-text');
        const iconSpan = this.toggleBtn.querySelector('.toggle-icon');
        
        if (textSpan) textSpan.textContent = isExpanded ? 'Collapse' : 'Expand All';
        if (iconSpan) iconSpan.textContent = isExpanded ? '⤡' : '⤢';
        
        sound.playChime(659, 0.2);
        this.updateScrollHint();
      });
    }

    // Click hint bar to scroll smoothly
    if (this.scrollHint) {
      this.scrollHint.addEventListener('click', () => {
        this.container.scrollBy({ top: 180, behavior: 'smooth' });
        sound.playChime(587, 0.15);
      });
    }

    this.updateScrollHint();
  }

  updateScrollHint() {
    if (!this.scrollHint || !this.container) return;

    if (this.container.classList.contains('expanded')) {
      this.scrollHint.style.display = 'none';
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = this.container;
    const maxScroll = scrollHeight - clientHeight;

    if (maxScroll <= 5) {
      this.scrollHint.style.display = 'none';
    } else {
      this.scrollHint.style.display = 'flex';
      if (scrollTop >= maxScroll - 15) {
        this.scrollHint.innerHTML = '<span>End of blessings ❦</span>';
        this.scrollHint.classList.add('at-bottom');
      } else {
        this.scrollHint.innerHTML = '<span>Scroll for more blessings</span><span class="scroll-hint-arrow">↓</span>';
        this.scrollHint.classList.remove('at-bottom');
      }
    }
  }

  getSavedWishes() {
    try {
      const stored = localStorage.getItem('bakeberry_wishes');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  renderWishes() {
    if (!this.container) return;
    const userWishes = this.getSavedWishes();
    const all = [...userWishes, ...this.defaultWishes];

    if (this.countBadge) {
      this.countBadge.textContent = all.length;
    }

    this.container.innerHTML = all
      .map(
        (w) => `
      <div class="wish-card glass-panel">
        <div class="wish-header">
          <div class="wish-avatar">${w.name.charAt(0)}</div>
          <div>
            <h4 class="wish-author">${w.name}</h4>
            <span class="wish-location"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${w.location || 'Belagavi'}</span>
          </div>
          <span class="wish-date">${w.date}</span>
        </div>
        <p class="wish-body">"${w.message}"</p>
        <div class="wish-seal">🍓</div>
      </div>
    `
      )
      .join('');

    setTimeout(() => this.updateScrollHint(), 50);
  }

  addWish(e) {
    e.preventDefault();
    const nameInput = document.getElementById('wish-name');
    const locInput = document.getElementById('wish-location');
    const msgInput = document.getElementById('wish-text');

    const name = nameInput.value.trim();
    const location = locInput.value.trim() || 'Belagavi';
    const message = msgInput.value.trim();

    if (!name || !message) return;

    const newWish = {
      name,
      location,
      message,
      date: 'Just now'
    };

    const current = this.getSavedWishes();
    current.unshift(newWish);
    try {
      localStorage.setItem('bakeberry_wishes', JSON.stringify(current));
    } catch (e) {
      console.warn(e);
    }

    sound.playChime(784, 0.4);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#D4AF37', '#8A1538']
    });

    this.renderWishes();
    this.form.reset();
  }
}
