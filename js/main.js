/**
 * Portfolio Main JavaScript
 * Handles navigation, lightbox, and interactions
 */

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
      <div class="lightbox__counter"></div>
      <div class="lightbox__content">
        <img src="" alt="">
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
    counter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;
  }
}

// Initialize lightbox if gallery exists
if (document.querySelector('.gallery-grid')) {
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
