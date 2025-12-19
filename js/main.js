/**
 * Portfolio Main JavaScript
 * Handles navigation, lightbox, and interactions
 */

// ==========================================================================
// iOS Safe Area Fix
// Creates a solid color overlay at the top to cover notch/Dynamic Island
// Only activates when scrolled (when Safari's address bar minimizes)
// ==========================================================================
(function() {
  // Only run on iOS devices
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (!isIOS) return;

  // Create safe area cover element
  const safeAreaCover = document.createElement('div');
  safeAreaCover.id = 'ios-safe-area-cover';
  safeAreaCover.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 0;
    background: #fafaf8;
    z-index: 10001;
    pointer-events: none;
    transition: height 0.1s ease;
  `;
  document.body.appendChild(safeAreaCover);

  // Detect if safe area is active (env returns non-zero when scrolled on notch devices)
  let lastScrollY = 0;
  let isScrolled = false;

  function updateSafeAreaCover() {
    const scrolled = window.scrollY > 50;
    if (scrolled !== isScrolled) {
      isScrolled = scrolled;
      // When scrolled, use env() value or fallback to 47px for notch devices
      safeAreaCover.style.height = scrolled ? 'env(safe-area-inset-top, 47px)' : '0';
    }
    lastScrollY = window.scrollY;
  }

  // Use passive scroll listener for performance
  window.addEventListener('scroll', updateSafeAreaCover, { passive: true });
  updateSafeAreaCover();
})();

// ==========================================================================
// Mobile Navigation
// ==========================================================================
const navToggle = document.querySelector('.nav__toggle');
const navMenu = document.querySelector('.nav__menu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('nav__menu--active');
    navToggle.classList.toggle('nav__toggle--active');
  });
}

// ==========================================================================
// Lightbox
// ==========================================================================
class Lightbox {
  constructor() {
    this.images = [];
    this.currentIndex = 0;
    this.lightbox = null;
    this.init();
  }

  init() {
    // Create lightbox element
    this.createLightbox();

    // Attach click handlers to gallery items
    const galleryItems = document.querySelectorAll('.gallery-grid__item');
    galleryItems.forEach((item, index) => {
      item.addEventListener('click', () => this.open(index));
    });

    // Collect all images
    this.images = Array.from(galleryItems).map(item => {
      const img = item.querySelector('img');
      return {
        src: img.dataset.full || img.src,
        alt: img.alt
      };
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.lightbox.classList.contains('lightbox--active')) return;

      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });
  }

  createLightbox() {
    this.lightbox = document.createElement('div');
    this.lightbox.className = 'lightbox';
    this.lightbox.innerHTML = `
      <button class="lightbox__close" aria-label="Close">&times;</button>
      <button class="lightbox__nav lightbox__nav--prev" aria-label="Previous">&larr;</button>
      <button class="lightbox__nav lightbox__nav--next" aria-label="Next">&rarr;</button>
      <div class="lightbox__content">
        <img src="" alt="">
        <div class="lightbox__counter"></div>
      </div>
    `;

    document.body.appendChild(this.lightbox);

    // Event listeners
    this.lightbox.querySelector('.lightbox__close').addEventListener('click', () => this.close());
    this.lightbox.querySelector('.lightbox__nav--prev').addEventListener('click', () => this.prev());
    this.lightbox.querySelector('.lightbox__nav--next').addEventListener('click', () => this.next());

    // Click outside to close
    this.lightbox.addEventListener('click', (e) => {
      if (e.target === this.lightbox) this.close();
    });
  }

  open(index) {
    this.currentIndex = index;
    this.updateImage();
    this.lightbox.classList.add('lightbox--active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.lightbox.classList.remove('lightbox--active');
    document.body.style.overflow = '';
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.updateImage();
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.updateImage();
  }

  updateImage() {
    const img = this.lightbox.querySelector('.lightbox__content img');
    const counter = this.lightbox.querySelector('.lightbox__counter');
    const image = this.images[this.currentIndex];
    if (image) {
      img.src = image.src;
      img.alt = image.alt;
    }
    // Cassette futurism: Technical readout format with leading zeros and pipe separator
    const current = String(this.currentIndex + 1).padStart(2, '0');
    const total = String(this.images.length).padStart(2, '0');
    counter.textContent = `${current} │ ${total}`;
  }
}

// Initialize lightbox if gallery exists (desktop only)
const isMobile = () => window.innerWidth <= 768;

if (document.querySelector('.gallery-grid') && !isMobile()) {
  new Lightbox();
}

// ==========================================================================
// Lazy Loading Images
// ==========================================================================
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px 0px'
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

// ==========================================================================
// Smooth Page Transitions (optional enhancement)
// ==========================================================================
document.querySelectorAll('a[href^="/"], a[href^="./"]').forEach(link => {
  link.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href.includes('#')) return; // Skip anchor links

    // Add fade-out class for transition
    document.body.style.opacity = '0.5';

    setTimeout(() => {
      document.body.style.opacity = '1';
    }, 300);
  });
});

// ==========================================================================
// Contact Form Loading State
// ==========================================================================
const contactForm = document.querySelector('.contact__form');
const submitBtn = document.querySelector('.btn-submit');

if (contactForm && submitBtn) {
  const originalText = submitBtn.querySelector('span').textContent;
  const originalSvg = submitBtn.querySelector('svg').outerHTML;

  // Spinner SVG for loading state
  const spinnerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`;

  contactForm.addEventListener('submit', function() {
    // Add loading state
    submitBtn.classList.add('is-loading');
    submitBtn.querySelector('span').textContent = 'Sending...';
    submitBtn.querySelector('svg').outerHTML = spinnerSvg;
  });
}
