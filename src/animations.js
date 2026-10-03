// Scroll-driven Animation Engine for Bake Berry Foods
// Powered by GSAP & ScrollTrigger synchronized with Lenis
// Zero horizontal layout shifts for perfect symmetrical mobile safe-area alignment

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScrollAnimations(lenis) {
  // 1. Sync Lenis and GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // 2. Text Reveal for Headlines
  setupHeadlineReveals();

  // 3. Section Story & Highlights
  setupStoryAnimations();

  // 4. Countdown Strip
  setupCountdownAnimations();

  // 5. Timeline Ceremony Cards
  setupTimelineAnimations();

  // 6. Menu Cards Cascade
  setupMenuAnimations();

  // 7. RSVP Proclamation Box
  setupRSVPAnimations();

  // 8. Venue & Map Cards
  setupVenueAnimations();

  // 9. Wishes Wall
  setupWishesAnimations();
}

// Split text into words for masked rise-up reveal
function setupHeadlineReveals() {
  const headlines = document.querySelectorAll('.section-headline');
  headlines.forEach((headline) => {
    const words = headline.textContent.trim().split(/\s+/);
    headline.innerHTML = words
      .map(
        (w) =>
          `<span class="reveal-word-mask"><span class="reveal-word-inner">${w}</span></span>`
      )
      .join(' ');

    const innerWords = headline.querySelectorAll('.reveal-word-inner');

    gsap.fromTo(
      innerWords,
      { yPercent: 120, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        stagger: 0.04,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: headline,
          start: 'top 88%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });

  // Taglines cursive reveal
  const taglines = document.querySelectorAll('.section-tagline');
  taglines.forEach((tagline) => {
    gsap.fromTo(
      tagline,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: tagline,
          start: 'top 90%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });

  // Gold divider expansion
  const dividers = document.querySelectorAll('.gold-divider');
  dividers.forEach((divider) => {
    gsap.fromTo(
      divider,
      { scaleX: 0, opacity: 0 },
      {
        scaleX: 1,
        opacity: 1,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: divider,
          start: 'top 88%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });
}

function setupStoryAnimations() {
  const storySection = document.getElementById('our-story');
  if (!storySection) return;

  const lead = storySection.querySelector('.story-lead');
  if (lead) {
    gsap.fromTo(
      lead,
      { opacity: 0, y: 35 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: lead,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }

  const paragraphs = storySection.querySelectorAll('.story-p, .founder-signature-box');
  if (paragraphs.length) {
    gsap.fromTo(
      paragraphs,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: lead || storySection,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }

  const card = storySection.querySelector('.story-highlights-card');
  const rows = storySection.querySelectorAll('.highlight-row');
  if (card) {
    gsap.fromTo(
      card,
      { opacity: 0, y: 45, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    if (rows.length) {
      gsap.fromTo(
        rows,
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.12,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }
  }
}

function setupCountdownAnimations() {
  const strip = document.querySelector('.countdown-strip');
  if (!strip) return;

  const heading = strip.querySelector('.countdown-heading');
  const units = strip.querySelectorAll('.timer-unit');

  if (heading) {
    gsap.fromTo(
      heading,
      { opacity: 0, y: 25 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: strip,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }

  if (units.length) {
    gsap.fromTo(
      units,
      { opacity: 0, y: 30, scale: 0.88 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        stagger: 0.08,
        duration: 0.75,
        ease: 'back.out(1.5)',
        scrollTrigger: {
          trigger: strip,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }
}

function setupTimelineAnimations() {
  const scheduleSection = document.getElementById('schedule');
  if (!scheduleSection) return;

  const cards = scheduleSection.querySelectorAll('.timeline-card');
  cards.forEach((card) => {
    const badge = card.querySelector('.timeline-time-badge');
    const content = card.querySelector('.timeline-content');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });

    tl.fromTo(
      card,
      { opacity: 0, y: 35, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: 'power3.out' }
    );

    if (badge) {
      tl.fromTo(
        badge,
        { scale: 0, rotate: -45 },
        { scale: 1, rotate: 0, duration: 0.55, ease: 'back.out(1.8)' },
        '-=0.45'
      );
    }

    if (content) {
      tl.fromTo(
        content.children,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, stagger: 0.07, duration: 0.45, ease: 'power2.out' },
        '-=0.35'
      );
    }
  });
}

export function animateMenuCards() {
  const cards = document.querySelectorAll('.menu-card');
  if (!cards.length) return;

  gsap.fromTo(
    cards,
    { opacity: 0, y: 40, scale: 0.96 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      stagger: 0.08,
      duration: 0.65,
      ease: 'power3.out',
      overwrite: 'auto'
    }
  );
}

function setupMenuAnimations() {
  const creations = document.getElementById('creations');
  if (!creations) return;

  const tabs = creations.querySelectorAll('.menu-tab');
  if (tabs.length) {
    gsap.fromTo(
      tabs,
      { opacity: 0, y: 18, scale: 0.92 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        stagger: 0.05,
        duration: 0.55,
        ease: 'back.out(1.4)',
        scrollTrigger: {
          trigger: creations.querySelector('.menu-tabs'),
          start: 'top 88%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }

  ScrollTrigger.create({
    trigger: '#menu-grid',
    start: 'top 85%',
    onEnter: () => animateMenuCards(),
    once: true
  });
}

function setupRSVPAnimations() {
  const rsvp = document.getElementById('rsvp');
  if (!rsvp) return;

  const wrapper = rsvp.querySelector('.rsvp-wrapper');
  const fields = rsvp.querySelectorAll('.form-group, .btn-rsvp-submit');

  if (wrapper) {
    gsap.fromTo(
      wrapper,
      { opacity: 0, y: 50, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: wrapper,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }

  if (fields.length) {
    gsap.fromTo(
      fields,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.08,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: wrapper,
          start: 'top 75%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }
}

function setupVenueAnimations() {
  const venue = document.getElementById('venue');
  if (!venue) return;

  const details = venue.querySelector('.venue-details-card');
  const map = venue.querySelector('.venue-map-card');
  const items = venue.querySelectorAll('.venue-item');

  // Both details and map cards animate strictly along Y axis (0 horizontal shift)
  if (details) {
    gsap.fromTo(
      details,
      { opacity: 0, y: 45, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: details,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }

  if (items.length) {
    gsap.fromTo(
      items,
      { opacity: 0, y: 18 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.12,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: details,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }

  if (map) {
    gsap.fromTo(
      map,
      { opacity: 0, y: 45, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: map,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }
}

function setupWishesAnimations() {
  const wishes = document.getElementById('wishes');
  if (!wishes) return;

  const formCard = wishes.querySelector('.wishes-form-card');
  const wishItems = wishes.querySelectorAll('.wish-card');

  if (formCard) {
    gsap.fromTo(
      formCard,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: formCard,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }

  if (wishItems.length) {
    gsap.fromTo(
      wishItems,
      { opacity: 0, y: 25 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.12,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: wishes.querySelector('.wishes-list'),
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }
}
