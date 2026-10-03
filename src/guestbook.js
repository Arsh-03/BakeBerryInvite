// Congratulatory Wishes & Guest Wall for Bake Berry Foods
import confetti from 'canvas-confetti';
import { sound } from './audio.js';

export class Guestbook {
  constructor() {
    this.form = document.getElementById('wishes-form');
    this.container = document.getElementById('wishes-list');
    this.defaultWishes = [
      {
        name: "Dr. Sandeep & Sunita Joshi",
        location: "Tilakwadi, Belagavi",
        message: "Heartiest congratulations on the grand opening! Bake Berry has always delivered the freshest croissants and cakes. Can't wait to visit the new branch!",
        date: "Just now"
      },
      {
        name: "Pooja Patil & Family",
        location: "Camp, Belagavi",
        message: "Belagavi needed a premier French patisserie like this! Wishing the entire Bake Berry Foods family boundless success and sweetness.",
        date: "2 hours ago"
      },
      {
        name: "Vikram Kulkarni",
        location: "Shahapur, Belagavi",
        message: "Your Belgian Chocolate gateau is already legendary in town. Super excited for the live baking counters!",
        date: "Yesterday"
      }
    ];
    this.init();
  }

  init() {
    this.renderWishes();
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.addWish(e));
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
