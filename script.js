const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const heroPortrait = document.querySelector('.portrait-wrap');

document.getElementById('year').textContent = new Date().getFullYear();

window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 20), { passive: true });

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  navLinks.classList.toggle('open', !open);
});

navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  navLinks.classList.remove('open');
}));

if (!reduceMotion && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
  }), { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
} else document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));

const sections = [...document.querySelectorAll('main section[id]')];
const menuLinks = [...document.querySelectorAll('.nav-links a')];
const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) menuLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
}), { rootMargin: '-40% 0px -50% 0px' });
sections.forEach(section => sectionObserver.observe(section));

const skillsSection = document.querySelector('.skills');
if (skillsSection) {
  if (reduceMotion || !('IntersectionObserver' in window)) {
    skillsSection.classList.add('skills-animated');
  } else {
    const skillsObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        skillsSection.classList.add('skills-animated');
        skillsObserver.disconnect();
      }
    }, { threshold: 0.2 });
    skillsObserver.observe(skillsSection);
  }

  if (!reduceMotion) {
    skillsSection.querySelectorAll('.expertise-card').forEach(card => {
      card.addEventListener('pointermove', event => {
        const bounds = card.getBoundingClientRect();
        card.style.setProperty('--glow-x', `${event.clientX - bounds.left}px`);
        card.style.setProperty('--glow-y', `${event.clientY - bounds.top}px`);
      });
    });
  }
}

if (!reduceMotion && heroPortrait) {
  let ticking = false;
  const updatePortraitMotion = () => {
    const progress = Math.min(window.scrollY / Math.max(window.innerHeight * 0.75, 1), 1);
    heroPortrait.style.transform = `translate3d(0, ${progress * -42}px, 0) rotate(${progress * -3}deg) scale(${1 - progress * 0.06})`;
    heroPortrait.style.opacity = String(1 - progress * 0.55);
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(updatePortraitMotion); ticking = true; } }, { passive: true });
  window.addEventListener('resize', updatePortraitMotion, { passive: true });
  updatePortraitMotion();
}

// UI Design Explorations modal and image lightbox.
const explorationModal = document.getElementById('exploration-modal');
const explorationModalContent = explorationModal?.querySelector('.exploration-modal-content');
const explorationOpeners = [...document.querySelectorAll('.exploration-open-visual, .exploration-open-button')];
const designLightbox = document.getElementById('design-lightbox');
const lightboxImage = designLightbox?.querySelector('.lightbox-image');
const lightboxCaption = designLightbox?.querySelector('.lightbox-caption');
const designButtons = explorationModal ? [...explorationModal.querySelectorAll('[data-design-index]')] : [];
let explorationTrigger = null;
let lightboxTrigger = null;
let currentDesignIndex = 0;
let modalScrollPosition = 0;

const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const openExplorationModal = event => {
  if (!explorationModal || !explorationModalContent) return;
  explorationTrigger = event.currentTarget;
  modalScrollPosition = window.scrollY;
  explorationModal.classList.add('is-open');
  explorationModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  explorationModalContent.scrollTop = 0;
  requestAnimationFrame(() => explorationModalContent.focus({ preventScroll: true }));
};

const closeExplorationModal = () => {
  if (!explorationModal || !explorationModal.classList.contains('is-open')) return;
  if (designLightbox?.classList.contains('is-open')) closeDesignLightbox();
  explorationModal.classList.remove('is-open');
  explorationModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  window.scrollTo({ top: modalScrollPosition, behavior: 'auto' });
  explorationTrigger?.focus({ preventScroll: true });
};

const showDesign = index => {
  if (!designButtons.length || !lightboxImage || !lightboxCaption) return;
  currentDesignIndex = (index + designButtons.length) % designButtons.length;
  const button = designButtons[currentDesignIndex];
  const image = button.querySelector('img');
  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = button.closest('.exploration-card')?.querySelector('h4')?.textContent || image.alt;
};

const openDesignLightbox = event => {
  if (!designLightbox) return;
  lightboxTrigger = event.currentTarget;
  showDesign(Number(event.currentTarget.dataset.designIndex));
  designLightbox.classList.add('is-open');
  designLightbox.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => designLightbox.querySelector('.lightbox-close')?.focus({ preventScroll: true }));
};

function closeDesignLightbox() {
  if (!designLightbox?.classList.contains('is-open')) return;
  designLightbox.classList.remove('is-open');
  designLightbox.setAttribute('aria-hidden', 'true');
  lightboxTrigger?.focus({ preventScroll: true });
}

const trapDialogFocus = (event, dialog) => {
  const focusable = [...dialog.querySelectorAll(focusableSelector)].filter(element => element.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
};

explorationOpeners.forEach(button => button.addEventListener('click', openExplorationModal));
explorationModal?.querySelectorAll('[data-close-exploration]').forEach(button => button.addEventListener('click', closeExplorationModal));
designButtons.forEach(button => button.addEventListener('click', openDesignLightbox));
designLightbox?.querySelectorAll('[data-close-lightbox]').forEach(button => button.addEventListener('click', closeDesignLightbox));
designLightbox?.querySelector('[data-lightbox-previous]')?.addEventListener('click', () => showDesign(currentDesignIndex - 1));
designLightbox?.querySelector('[data-lightbox-next]')?.addEventListener('click', () => showDesign(currentDesignIndex + 1));

document.addEventListener('keydown', event => {
  if (designLightbox?.classList.contains('is-open')) {
    if (event.key === 'Escape') closeDesignLightbox();
    else if (event.key === 'ArrowLeft') showDesign(currentDesignIndex - 1);
    else if (event.key === 'ArrowRight') showDesign(currentDesignIndex + 1);
    else if (event.key === 'Tab') trapDialogFocus(event, designLightbox);
    return;
  }
  if (explorationModal?.classList.contains('is-open')) {
    if (event.key === 'Escape') closeExplorationModal();
    else if (event.key === 'Tab') trapDialogFocus(event, explorationModal);
  }
});

// Social Media Design modal, reusable carousels, and category lightbox.
const socialModal = document.getElementById('social-modal');
const socialModalContent = socialModal?.querySelector('.social-modal-content');
const socialOpeners = [...document.querySelectorAll('.social-project-open-visual, .social-project-open-button')];
const socialLightbox = document.getElementById('social-lightbox');
const socialLightboxImage = socialLightbox?.querySelector('.social-lightbox-image');
const socialLightboxCaption = socialLightbox?.querySelector('.social-lightbox-caption');
const socialCarouselUpdates = [];
let socialTrigger = null;
let socialLightboxTrigger = null;
let socialModalScrollPosition = 0;
let activeSocialDesigns = [];
let activeSocialIndex = 0;

const updateSocialLightbox = index => {
  if (!activeSocialDesigns.length || !socialLightboxImage || !socialLightboxCaption) return;
  activeSocialIndex = (index + activeSocialDesigns.length) % activeSocialDesigns.length;
  const button = activeSocialDesigns[activeSocialIndex];
  const image = button.querySelector('img');
  socialLightboxImage.src = image.currentSrc || image.src;
  socialLightboxImage.alt = image.alt;
  socialLightboxCaption.textContent = button.closest('.social-design-card')?.querySelector('h4')?.textContent || image.alt;
};

const openSocialLightbox = event => {
  if (!socialLightbox) return;
  socialLightboxTrigger = event.currentTarget;
  const carousel = event.currentTarget.closest('.social-carousel');
  activeSocialDesigns = [...carousel.querySelectorAll('.social-design-image')];
  updateSocialLightbox(activeSocialDesigns.indexOf(event.currentTarget));
  socialLightbox.classList.add('is-open');
  socialLightbox.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => socialLightbox.querySelector('.social-lightbox-close')?.focus({ preventScroll: true }));
};

const closeSocialLightbox = () => {
  if (!socialLightbox?.classList.contains('is-open')) return;
  socialLightbox.classList.remove('is-open');
  socialLightbox.setAttribute('aria-hidden', 'true');
  socialLightboxTrigger?.focus({ preventScroll: true });
};

const openSocialModal = event => {
  if (!socialModal || !socialModalContent) return;
  socialTrigger = event.currentTarget;
  socialModalScrollPosition = window.scrollY;
  socialModal.classList.add('is-open');
  socialModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  socialModalContent.scrollTop = 0;
  requestAnimationFrame(() => {
    socialCarouselUpdates.forEach(update => update());
    socialModalContent.focus({ preventScroll: true });
  });
};

const closeSocialModal = () => {
  if (!socialModal?.classList.contains('is-open')) return;
  if (socialLightbox?.classList.contains('is-open')) closeSocialLightbox();
  socialModal.classList.remove('is-open');
  socialModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  window.scrollTo({ top: socialModalScrollPosition, behavior: 'auto' });
  socialTrigger?.focus({ preventScroll: true });
};

document.querySelectorAll('.social-carousel').forEach(carousel => {
  const category = carousel.closest('.social-category');
  const previous = category.querySelector('.carousel-prev');
  const next = category.querySelector('.carousel-next');
  const progress = category.querySelector('.carousel-progress');
  const cards = [...carousel.querySelectorAll('.social-design-card')];
  let scrollFrame = null;

  const cardStep = () => {
    const gap = Number.parseFloat(getComputedStyle(carousel.querySelector('.social-carousel-track')).gap) || 0;
    return (cards[0]?.getBoundingClientRect().width || carousel.clientWidth) + gap;
  };

  const updateCarousel = () => {
    const maximum = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
    const current = Math.min(cards.length, Math.round(carousel.scrollLeft / Math.max(cardStep(), 1)) + 1);
    previous.disabled = carousel.scrollLeft <= 2;
    next.disabled = carousel.scrollLeft >= maximum - 2;
    progress.textContent = `${current} / ${cards.length}`;
  };

  const moveCarousel = direction => carousel.scrollBy({ left: cardStep() * direction, behavior: reduceMotion ? 'auto' : 'smooth' });
  previous.addEventListener('click', () => moveCarousel(-1));
  next.addEventListener('click', () => moveCarousel(1));
  carousel.addEventListener('scroll', () => {
    if (scrollFrame) cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(updateCarousel);
  }, { passive: true });
  carousel.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); moveCarousel(-1); }
    else if (event.key === 'ArrowRight') { event.preventDefault(); moveCarousel(1); }
  });
  cards.forEach(card => card.querySelector('.social-design-image').addEventListener('click', openSocialLightbox));
  socialCarouselUpdates.push(updateCarousel);
  updateCarousel();
});

socialOpeners.forEach(button => button.addEventListener('click', openSocialModal));
socialModal?.querySelectorAll('[data-close-social]').forEach(button => button.addEventListener('click', closeSocialModal));
socialLightbox?.querySelectorAll('[data-close-social-lightbox]').forEach(button => button.addEventListener('click', closeSocialLightbox));
socialLightbox?.querySelector('[data-social-previous]')?.addEventListener('click', () => updateSocialLightbox(activeSocialIndex - 1));
socialLightbox?.querySelector('[data-social-next]')?.addEventListener('click', () => updateSocialLightbox(activeSocialIndex + 1));
window.addEventListener('resize', () => socialCarouselUpdates.forEach(update => update()), { passive: true });

document.addEventListener('keydown', event => {
  if (socialLightbox?.classList.contains('is-open')) {
    if (event.key === 'Escape') closeSocialLightbox();
    else if (event.key === 'ArrowLeft') updateSocialLightbox(activeSocialIndex - 1);
    else if (event.key === 'ArrowRight') updateSocialLightbox(activeSocialIndex + 1);
    else if (event.key === 'Tab') trapDialogFocus(event, socialLightbox);
    return;
  }
  if (socialModal?.classList.contains('is-open')) {
    if (event.key === 'Escape') closeSocialModal();
    else if (event.key === 'Tab') trapDialogFocus(event, socialModal);
  }
});
