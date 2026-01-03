document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.getElementById('nav-menu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      const expanded = hamburger.getAttribute('aria-expanded') === 'true' || false;
      hamburger.setAttribute('aria-expanded', String(!expanded));
      navMenu.classList.toggle('open');
    });
  }
});

