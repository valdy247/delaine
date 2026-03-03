const sectionsToReveal = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

sectionsToReveal.forEach((section) => observer.observe(section));

const menu = document.querySelector('.menu');
const menuToggle = document.querySelector('.menu-toggle');
const menuLinks = document.querySelectorAll('.menu-links a');

if (menu && menuToggle) {
  menuToggle.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isExpanded));
    menu.classList.toggle('menu-open', !isExpanded);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      menu.classList.remove('menu-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  menuLinks.forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('menu-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 680) {
      menu.classList.remove('menu-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}
