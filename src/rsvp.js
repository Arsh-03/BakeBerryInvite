// VIP RSVP & Digital Pass Generator for Bake Berry Foods
import confetti from 'canvas-confetti';
import { sound } from './audio.js';

export class RSVPManager {
  constructor() {
    this.form = document.getElementById('rsvp-form');
    this.passModal = document.getElementById('pass-modal');
    this.passCard = document.getElementById('digital-pass-card');
    this.init();
  }

  init() {
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Modal close triggers
    document.querySelectorAll('[data-close-pass]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.passModal) {
          this.passModal.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });

    // Check if user has an existing saved RSVP
    this.loadSavedRSVP();
  }

  loadSavedRSVP() {
    try {
      const saved = localStorage.getItem('bakeberry_rsvp');
      if (saved) {
        const data = JSON.parse(saved);
        const alertBanner = document.getElementById('rsvp-saved-banner');
        if (alertBanner) {
          alertBanner.style.display = 'flex';
          alertBanner.querySelector('.saved-guest-name').textContent = data.name;
          alertBanner.querySelector('.view-saved-pass-btn').onclick = () => {
            this.showPass(data);
          };
        }
      }
    } catch (e) {
      console.warn('Storage read error', e);
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    sound.init();

    const name = document.getElementById('guest-name').value.trim();
    const phone = document.getElementById('guest-phone').value.trim();
    const guests = document.getElementById('guest-count').value;
    const dietary = document.querySelector('input[name="dietary"]:checked')?.value || 'Pure Vegetarian & Eggless';
    const message = document.getElementById('guest-message').value.trim();

    if (!name || !phone) {
      alert('Please provide your name and contact number.');
      return;
    }

    const passId = 'BBF-BLG-' + Math.floor(1000 + Math.random() * 9000);
    const rsvpData = {
      name,
      phone,
      guests,
      dietary,
      message,
      passId,
      timestamp: new Date().toISOString()
    };

    try {
      localStorage.setItem('bakeberry_rsvp', JSON.stringify(rsvpData));
    } catch (err) {
      console.warn('Storage write error', err);
    }

    // Celebration sounds and confetti
    sound.playCelebration();
    this.triggerConfetti();

    // Show VIP pass
    setTimeout(() => {
      this.showPass(rsvpData);
    }, 600);
  }

  triggerConfetti() {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#D4AF37', '#E5C07B', '#8A1538', '#FFFFFF', '#E63946']
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }

  showPass(data) {
    if (!this.passModal) return;

    // Populate Pass Fields
    document.getElementById('pass-guest-name').textContent = data.name;
    document.getElementById('pass-seat-count').textContent = `${data.guests} Guest(s)`;
    document.getElementById('pass-code').textContent = `#${data.passId}`;
    document.getElementById('pass-dietary-badge').textContent = data.dietary;

    // Generate QR Code SVG
    const qrContainer = document.getElementById('pass-qr-box');
    if (qrContainer) {
      qrContainer.innerHTML = this.generateQRCodeSVG(`BAKEBERRY-INVITE:${data.passId}:${encodeURIComponent(data.name)}`);
    }

    // Bind action buttons
    this.bindPassActions(data);

    this.passModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  bindPassActions(data) {
    // Add to Google Calendar
    const gcalBtn = document.getElementById('btn-add-gcal');
    if (gcalBtn) {
      const title = encodeURIComponent("Bake Berry Foods - Grand Flagship Opening");
      const details = encodeURIComponent(`VIP Invitation Pass: #${data.passId}\nGuest: ${data.name}\n\nJoin us for the Grand Inauguration, Auspicious Ribbon Cutting, Chef's Tasting Flights, and French Viennoiserie.`);
      const location = encodeURIComponent("Bake Berry Foods, 142/A Khanapur Road, Tilakwadi, Belagavi, Karnataka 590006");
      const dates = "20261011T103000Z/20261011T153000Z"; // 4:00 PM to 9:00 PM IST (UTC +5:30)
      gcalBtn.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
    }

    // Download iCal (.ics)
    const icalBtn = document.getElementById('btn-add-ical');
    if (icalBtn) {
      icalBtn.onclick = (e) => {
        e.preventDefault();
        this.downloadICS(data);
      };
    }

    // Share via WhatsApp
    const whatsappBtn = document.getElementById('btn-share-whatsapp');
    if (whatsappBtn) {
      const text = encodeURIComponent(
        `🍓✨ *Exclusive Invitation: Bake Berry Foods Grand Opening*\n\n` +
        `I have reserved my VIP Presence for the Inauguration of Bake Berry Foods' new flagship bakery in Belagavi!\n\n` +
        `📅 Date: Sunday, 11 October 2026 at 4:00 PM\n` +
        `📍 Venue: Tilakwadi, Belagavi\n\n` +
        `You're invited too! Unfold the 3D invitation and reserve your VIP pass here:\n` +
        `${window.location.href}`
      );
      whatsappBtn.href = `https://api.whatsapp.com/send?text=${text}`;
    }

    // Download Pass as Image (Canvas)
    const downloadPassBtn = document.getElementById('btn-download-pass');
    if (downloadPassBtn) {
      downloadPassBtn.onclick = () => this.downloadPassCard(data);
    }
  }

  downloadICS(data) {
    const icsContent = 
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Bake Berry Foods//Inaugural Invitation//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:Bake Berry Foods - Grand Opening Ceremony (Belagavi)
DESCRIPTION:VIP Pass #${data.passId} for ${data.name}. Auspicious Ribbon Cutting, Patisserie Tasting Flight & Celebration.
LOCATION:Bake Berry Foods, 142/A Khanapur Road, Tilakwadi, Belagavi, Karnataka 590006
DTSTART:20261011T103000Z
DTEND:20261011T153000Z
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `BakeBerry-Invite-${data.passId}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  downloadPassCard(data) {
    // Generate clean canvas snapshot of the pass card
    const canvas = document.createElement('canvas');
    const width = 800;
    const height = 1100;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Rich cream & marble textured background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#FCFAF7');
    bgGrad.addColorStop(0.5, '#F7F2EA');
    bgGrad.addColorStop(1, '#EDE4D5');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Gold borders
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    ctx.strokeStyle = '#E5C07B';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(38, 38, width - 76, height - 76);

    // Header Monogram
    ctx.fillStyle = '#8A1538';
    ctx.font = 'bold 36px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.fillText('BAKE BERRY FOODS', width / 2, 110);

    ctx.fillStyle = '#C5A059';
    ctx.font = '500 16px "Outfit", sans-serif';
    ctx.fillText('BELAGAVI • ARTISANAL PATISSERIE & BOUTIQUE', width / 2, 140);

    // Decorative line
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(250, 160);
    ctx.lineTo(550, 160);
    ctx.stroke();

    // Pass Title
    ctx.fillStyle = '#1F1B18';
    ctx.font = '600 24px "Cinzel", serif';
    ctx.fillText('OFFICIAL VIP INAUGURAL PASS', width / 2, 210);

    ctx.fillStyle = '#8A1538';
    ctx.font = 'italic 18px "Playfair Display", serif';
    ctx.fillText('Valid for Grand Inaugural Day Access', width / 2, 240);

    // Pass Box
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0,0,0,0.06)';
    ctx.shadowBlur = 15;
    ctx.fillRect(70, 270, width - 140, 520);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = '#EADDC7';
    ctx.lineWidth = 1;
    ctx.strokeRect(70, 270, width - 140, 520);

    // Guest Info inside box
    ctx.textAlign = 'left';
    ctx.fillStyle = '#8A6D3B';
    ctx.font = '600 14px "Outfit", sans-serif';
    ctx.fillText('GUEST OF HONOR', 110, 330);

    ctx.fillStyle = '#1A1614';
    ctx.font = 'bold 32px "Cinzel", serif';
    ctx.fillText(data.name.toUpperCase(), 110, 375);

    ctx.fillStyle = '#8A6D3B';
    ctx.font = '600 14px "Outfit", sans-serif';
    ctx.fillText('INVITATION CODE', 110, 440);
    ctx.fillStyle = '#8A1538';
    ctx.font = 'bold 22px "Outfit", monospace';
    ctx.fillText(`#${data.passId}`, 110, 470);

    ctx.fillStyle = '#8A6D3B';
    ctx.font = '600 14px "Outfit", sans-serif';
    ctx.fillText('ADMITTANCE', 480, 440);
    ctx.fillStyle = '#1A1614';
    ctx.font = 'bold 20px "Outfit", sans-serif';
    ctx.fillText(`${data.guests} Guest(s)`, 480, 470);

    // Divider
    ctx.strokeStyle = '#F0E7D8';
    ctx.beginPath();
    ctx.moveTo(110, 510);
    ctx.lineTo(width - 110, 510);
    ctx.stroke();

    // Event Info
    ctx.fillStyle = '#8A6D3B';
    ctx.font = '600 14px "Outfit", sans-serif';
    ctx.fillText('DATE & CEREMONY', 110, 555);
    ctx.fillStyle = '#1A1614';
    ctx.font = 'bold 20px "Outfit", sans-serif';
    ctx.fillText('Sunday, October 11, 2026', 110, 585);
    ctx.fillStyle = '#555';
    ctx.font = '16px "Outfit", sans-serif';
    ctx.fillText('Ribbon Cutting & High Tea: 4:00 PM Onwards', 110, 615);

    ctx.fillStyle = '#8A6D3B';
    ctx.font = '600 14px "Outfit", sans-serif';
    ctx.fillText('FLAGSHIP VENUE', 110, 670);
    ctx.fillStyle = '#1A1614';
    ctx.font = 'bold 18px "Outfit", sans-serif';
    ctx.fillText('Bake Berry Foods, Khanapur Road, Tilakwadi', 110, 700);
    ctx.fillStyle = '#666';
    ctx.font = '15px "Outfit", sans-serif';
    ctx.fillText('Belagavi, Karnataka 590006 • Valet Parking Available', 110, 725);

    // Footer Stamp
    ctx.textAlign = 'center';
    ctx.fillStyle = '#8A1538';
    ctx.font = 'bold 16px "Cinzel", serif';
    ctx.fillText('BAKE BERRY FOODS • PRIVILEGE ADMITTANCE', width / 2, 850);
    ctx.fillStyle = '#666';
    ctx.font = '14px "Outfit", sans-serif';
    ctx.fillText('Please present this digital pass or QR at the reception desk.', width / 2, 880);

    // Download image
    const link = document.createElement('a');
    link.download = `BakeBerry-VIP-Pass-${data.passId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  generateQRCodeSVG(data) {
    // Elegant procedural decorative QR visual
    // Generates a clean, crisp 21x21 stylized SVG QR matrix with corner markers and golden gradient
    const size = 150;
    const modules = 21;
    const cellSize = size / modules;
    
    // Seeded pseudo random pattern based on data
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = (hash << 5) - hash + data.charCodeAt(i);
      hash |= 0;
    }

    let rects = '';

    // Draw finder patterns
    const drawFinder = (startX, startY) => {
      // 7x7 outer
      rects += `<rect x="${startX * cellSize}" y="${startY * cellSize}" width="${7 * cellSize}" height="${7 * cellSize}" fill="#8A1538" rx="3"/>`;
      rects += `<rect x="${(startX + 1) * cellSize}" y="${(startY + 1) * cellSize}" width="${5 * cellSize}" height="${5 * cellSize}" fill="#FFF" rx="2"/>`;
      rects += `<rect x="${(startX + 2) * cellSize}" y="${(startY + 2) * cellSize}" width="${3 * cellSize}" height="${3 * cellSize}" fill="#8A1538" rx="1"/>`;
    };

    drawFinder(0, 0);
    drawFinder(modules - 7, 0);
    drawFinder(0, modules - 7);

    // Fill data grid
    for (let r = 0; r < modules; r++) {
      for (let c = 0; c < modules; c++) {
        // Skip finder zones
        if ((r < 7 && c < 7) || (r < 7 && c >= modules - 7) || (r >= modules - 7 && c < 7)) {
          continue;
        }
        const val = ((hash ^ (r * 31 + c * 17)) + (r * c)) % 3 === 0;
        if (val) {
          rects += `<rect x="${c * cellSize + 0.5}" y="${r * cellSize + 0.5}" width="${cellSize - 1}" height="${cellSize - 1}" fill="#2E241E" rx="1.5"/>`;
        }
      }
    }

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="#FFFFFF" rx="8"/>
        ${rects}
      </svg>
    `;
  }
}
