document.addEventListener('DOMContentLoaded', function() {
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', function() {
        const expanded = hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const animateElements = document.querySelectorAll('.project-card, .skill-category, .about-text');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navbar = document.querySelector('.navbar');
                const offset = navbar ? navbar.offsetHeight : 70;
                const rectTop = target.getBoundingClientRect().top + window.pageYOffset;
                const offsetTop = rectTop - offset;
                window.scrollTo({
                    top: offsetTop,
                    behavior: reduceMotion ? 'auto' : 'smooth'
                });
            }
        });
    });

    const skillItems = document.querySelectorAll('.skill-list li');
    skillItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
        item.classList.add('skill-item-animate');
    });

    const projectCards = document.querySelectorAll('.project-card');
    if (!isTouch) {
        projectCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton && !reduceMotion) {
        ctaButton.addEventListener('mouseenter', function() {
            this.style.animation = 'pulse 0.6s ease-in-out';
        });
        
        ctaButton.addEventListener('animationend', function() {
            this.style.animation = '';
        });
    }

    const style = document.createElement('style');
    style.textContent = `
        .skill-item-animate {
            animation: fadeInLeft 0.5s ease forwards;
            opacity: 0;
            transform: translateX(-20px);
        }

        @keyframes fadeInLeft {
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }

        .hamburger.active .bar:nth-child(2) {
            opacity: 0;
        }

        .hamburger.active .bar:nth-child(1) {
            transform: translateY(9px) rotate(45deg);
        }

        .hamburger.active .bar:nth-child(3) {
            transform: translateY(-9px) rotate(-45deg);
        }
    `;
    document.head.appendChild(style);

    if (!isMobile && !reduceMotion) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.hero');
            
            parallaxElements.forEach(element => {
                const speed = 0.5;
                element.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }

    // Bottom nav active state
    (function setBottomNavActive(){
        const items = document.querySelectorAll('.bottom-nav__item');
        if (!items.length) return;
        const path = location.pathname + location.hash;
        items.forEach(a => a.classList.remove('active'));
        const matchers = [
            {key: 'home', test: () => location.pathname === '/' || /portfolio\.html$/.test(location.pathname)},
            {key: 'tools', test: () => location.pathname.startsWith('/tool')},
            {key: 'games', test: () => location.pathname.startsWith('/game')},
            {key: 'webapps', test: () => /#webapps$/.test(path)},
            {key: 'blog', test: () => location.hostname.indexOf('pokoroblog.com') !== -1}
        ];
        const current = matchers.find(m => m.test());
        if (current) {
            const el = document.querySelector(`.bottom-nav__item[data-route="${current.key}"]`);
            if (el) el.classList.add('active');
        } else {
            const el = document.querySelector('.bottom-nav__item[data-route="home"]');
            if (el) el.classList.add('active');
        }
    })();

    const typeWriter = (element, text, delay = 100) => {
        let i = 0;
        element.innerHTML = '';
        
        const timer = setInterval(() => {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
            } else {
                clearInterval(timer);
            }
        }, delay);
    };

    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && !reduceMotion) {
        const originalText = heroTitle.textContent;
        setTimeout(() => {
            typeWriter(heroTitle, originalText, 80);
        }, 500);
    }

    // Advanced particle system
    function createAdvancedParticles() {
        const particleContainer = document.querySelector('.floating-particles');
        if (!particleContainer) return;

        // Create multiple particles
        const count = isMobile ? 8 : 20;
        for (let i = 0; i < (reduceMotion ? 0 : count); i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random properties
            const size = Math.random() * 4 + 2;
            const x = Math.random() * window.innerWidth;
            const duration = Math.random() * 20 + 10;
            const delay = Math.random() * 5;
            
            const colors = ['#667eea', '#764ba2', '#f093fb', '#348fe2', '#7b68ee'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                left: ${x}px;
                bottom: -10px;
                opacity: 0.6;
                animation: floatUp ${duration}s ${delay}s infinite linear;
                box-shadow: 0 0 10px ${color};
                pointer-events: none;
            `;
            
            particleContainer.appendChild(particle);
        }
    }

    // Add particle animation keyframes
    const particleStyle = document.createElement('style');
    particleStyle.textContent = `
        @keyframes floatUp {
            0% {
                transform: translateY(0) translateX(0) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 0.6;
            }
            90% {
                opacity: 0.6;
            }
            100% {
                transform: translateY(-100vh) translateX(${Math.random() * 200 - 100}px) rotate(360deg);
                opacity: 0;
            }
        }

        .particle {
            filter: blur(0.5px);
        }

        /* Glitch effect for hero title */
        .hero-title.glitch {
            animation: glitch 0.3s ease-in-out;
        }

        @keyframes glitch {
            0% { transform: translate(0); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(-2px, -2px); }
            60% { transform: translate(2px, 2px); }
            80% { transform: translate(2px, -2px); }
            100% { transform: translate(0); }
        }

        /* Enhanced project card animations */
        .project-card {
            animation: cardEntry 0.6s ease-out forwards;
            opacity: 0;
            transform: translateY(30px);
        }

        @keyframes cardEntry {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(particleStyle);

    // Initialize particles
    createAdvancedParticles();

    // Add glitch effect on hero title hover
    const heroTitleElement = document.querySelector('.hero-title');
    if (heroTitleElement && !reduceMotion) {
        heroTitleElement.addEventListener('mouseenter', () => {
            heroTitleElement.classList.add('glitch');
            setTimeout(() => heroTitleElement.classList.remove('glitch'), 300);
        });
    }

    // Animate project cards on scroll
    const projectCards2 = document.querySelectorAll('.project-card');
    projectCards2.forEach((card, index) => {
        card.style.animationDelay = reduceMotion ? '0s' : `${index * 0.2}s`;
    });

    // Advanced cursor trail effect
    let mouseTrail = [];
    const maxTrailLength = 20;

    if (!isTouch && !reduceMotion) {
        document.addEventListener('mousemove', (e) => {
            mouseTrail.push({ x: e.clientX, y: e.clientY, time: Date.now() });
            
            if (mouseTrail.length > maxTrailLength) {
                mouseTrail.shift();
            }

            // Remove old trail elements
            const oldTrails = document.querySelectorAll('.mouse-trail');
            oldTrails.forEach(trail => {
                if (Date.now() - trail.dataset.time > 500) {
                    trail.remove();
                }
            });

            // Create new trail element
            if (mouseTrail.length > 1) {
                const trail = document.createElement('div');
                trail.className = 'mouse-trail';
                trail.dataset.time = Date.now();
                trail.style.cssText = `
                    position: fixed;
                    width: 6px;
                    height: 6px;
                    background: radial-gradient(circle, rgba(102, 126, 234, 0.8) 0%, transparent 70%);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 9999;
                    left: ${e.clientX - 3}px;
                    top: ${e.clientY - 3}px;
                    animation: trailFade 0.5s ease-out forwards;
                `;
                document.body.appendChild(trail);
            }
        });
    }

    const trailStyle = document.createElement('style');
    trailStyle.textContent = `
        @keyframes trailFade {
            0% { opacity: 0.8; transform: scale(1); }
            100% { opacity: 0; transform: scale(0.3); }
        }
    `;
    document.head.appendChild(trailStyle);
});
    // Force same-tab behavior just in case some anchors still have target
    document.querySelectorAll('a[target="_blank"]').forEach(a => a.removeAttribute('target'));
    document.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (!a) return;
        if (a.getAttribute('target') === '_blank') {
            e.preventDefault();
            a.removeAttribute('target');
            window.location.href = a.href;
        }
    }, { capture: true });
