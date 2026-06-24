/* ===== SRI RADHAI INDUSTRIES — v3 SCRIPT =====
   Parallax | Scroll-Triggered Animations | Counters
   ================================================= */

document.addEventListener('DOMContentLoaded', () => {

    // ───── Preloader ─────
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => setTimeout(() => preloader.classList.add('loaded'), 300));
    setTimeout(() => preloader.classList.add('loaded'), 3000);

    // ───── Navbar ─────
    const navbar = document.getElementById('navbar');
    function handleScroll() {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // ───── Mobile Menu ─────
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('open');
            document.body.classList.toggle('menu-open');
        });
        mobileMenu.querySelectorAll('.mobile-link, .mobile-cta').forEach(l => {
            l.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('open');
                document.body.classList.remove('menu-open');
            });
        });
    }

    // ───── Footer Year ─────
    const yr = document.getElementById('currentYear');
    if (yr) yr.textContent = new Date().getFullYear();

    // ───── Active Nav ─────
    function updateActiveNav() {
        const page = window.location.pathname.split('/').pop() || 'index.html';
        const currentHash = window.location.hash;
        
        document.querySelectorAll('.nav-link, .mobile-link').forEach(l => {
            const href = l.getAttribute('href');
            if (!href) return;
            const [cleanHref, hash] = href.split('#');
            let isActive = href === page || cleanHref === page;
            
            // Parent active states for dropdowns
            if (page === 'certifications.html' && href === 'about.html') {
                isActive = true;
            }
            if (page === 'infrastructure.html' && href === 'infrastructure.html') {
                isActive = true;
            }
            
            // For anchor links on the active page, check hash
            if (hash && (href === page || cleanHref === page)) {
                if (currentHash) {
                    isActive = currentHash === '#' + hash;
                } else {
                    // Default to the first anchor section (e.g. infrastructure)
                    isActive = hash === 'infrastructure';
                }
            }
            
            l.classList.toggle('active', isActive);
        });
    }
    
    updateActiveNav();
    window.addEventListener('hashchange', updateActiveNav);

    // ───── Lenis Smooth Scroll ─────
    let lenis;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // premium easing
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            smoothTouch: false,
            touchMultiplier: 1.5,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Map anchor click events to Lenis scrollTo
        document.querySelectorAll('a[href^="#"]').forEach(a => {
            a.addEventListener('click', function(e) {
                const id = this.getAttribute('href');
                if (id === '#') return;
                const t = document.querySelector(id);
                if (t) {
                    e.preventDefault();
                    const navOffset = navbar ? navbar.offsetHeight + 20 : 80;
                    lenis.scrollTo(t, { offset: -navOffset });
                }
            });
        });
    } else {
        // Fallback for anchor links if Lenis fails to load
        document.querySelectorAll('a[href^="#"]').forEach(a => {
            a.addEventListener('click', function(e) {
                const id = this.getAttribute('href');
                if (id === '#') return;
                const t = document.querySelector(id);
                if (t) {
                    e.preventDefault();
                    window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight - 20, behavior: 'smooth' });
                }
            });
        });
    }

    // ═══════════════════════════════════════════
    //  PARALLAX ENGINE
    // ═══════════════════════════════════════════

    const parallaxElements = document.querySelectorAll('[data-parallax]');
    let ticking = false;

    function applyTransform(el) {
        const scrollY = el._scrollOffset || 0;
        const mouseX = el._mouseOffsetX || 0;
        const mouseY = el._mouseOffsetY || 0;
        el.style.transform = `translate3d(${mouseX}px, ${scrollY + mouseY}px, 0)`;
    }

    function updateParallax() {
        const scrollY = window.scrollY;
        const vh = window.innerHeight;

        parallaxElements.forEach(el => {
            const speed = parseFloat(el.getAttribute('data-parallax')) || 0.3;
            const parent = el.closest('section') || el.parentElement;
            const rect = parent.getBoundingClientRect();

            // Only process if section is in view (with buffer)
            if (rect.bottom < -200 || rect.top > vh + 200) return;

            // Calculate offset relative to section being centered
            const sectionCenter = rect.top + rect.height / 2;
            const viewCenter = vh / 2;
            const offset = (sectionCenter - viewCenter) * speed;

            el._scrollOffset = offset;
            applyTransform(el);
        });

        ticking = false;
    }

    function onParallaxScroll() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }

    // Only enable parallax on desktop (no mobile for performance)
    if (window.innerWidth > 768) {
        window.addEventListener('scroll', onParallaxScroll, { passive: true });
        updateParallax();
    }

    // ═══════════════════════════════════════════
    //  SCROLL-TRIGGERED ANIMATIONS (IntersectionObserver)
    // ═══════════════════════════════════════════

    const animTriggers = document.querySelectorAll('.anim-trigger');

    if ('IntersectionObserver' in window) {
        const animObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const delay = parseInt(el.getAttribute('data-delay')) || 0;

                    setTimeout(() => {
                        el.classList.add('triggered');
                    }, delay);

                    // Don't unobserve — we keep it triggered permanently
                    animObserver.unobserve(el);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        animTriggers.forEach(el => animObserver.observe(el));
    } else {
        // Fallback: reveal all immediately
        animTriggers.forEach(el => el.classList.add('triggered'));
    }

    // ═══════════════════════════════════════════
    //  COUNTER ANIMATION
    // ═══════════════════════════════════════════

    const counters = document.querySelectorAll('[data-count]');
    let countersRun = new Set();

    if ('IntersectionObserver' in window) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !countersRun.has(entry.target)) {
                    countersRun.add(entry.target);
                    const counter = entry.target;
                    const target = parseInt(counter.getAttribute('data-count'));
                    const duration = 1600;
                    const start = performance.now();

                    function tick(now) {
                        const progress = Math.min((now - start) / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
                        counter.textContent = Math.round(eased * target);
                        if (progress < 1) {
                            requestAnimationFrame(tick);
                        } else {
                            counter.textContent = target;
                        }
                    }
                    requestAnimationFrame(tick);
                    counterObserver.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(c => counterObserver.observe(c));
    }

    // ═══════════════════════════════════════════
    //  ICON VISIBILITY (pause when off-screen)
    // ═══════════════════════════════════════════

    if ('IntersectionObserver' in window) {
        const iconObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const icons = entry.target.querySelectorAll('.anim-icon, .cap-anim-icon, .logo-gear, .badge-ring');
                icons.forEach(icon => {
                    icon.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
                });
            });
        }, { threshold: 0.05 });

        document.querySelectorAll('.section, .hero, .footer').forEach(s => iconObserver.observe(s));
    }

    // ═══════════════════════════════════════════
    //  CARD INTERACTIONS
    // ═══════════════════════════════════════════

    // Capability cards: pause icon on hover
    document.querySelectorAll('.cap-card').forEach(card => {
        const icon = card.querySelector('.cap-anim-icon');
        if (icon) {
            card.addEventListener('mouseenter', () => icon.style.animationPlayState = 'paused');
            card.addEventListener('mouseleave', () => icon.style.animationPlayState = 'running');
        }
    });

    // Gallery hover
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('mouseenter', () => { item.style.zIndex = '3'; });
        item.addEventListener('mouseleave', () => { item.style.zIndex = '1'; });
    });

    // Float cards subtle mouse parallax (desktop only)
    if (window.innerWidth > 1024) {
        const floatCards = document.querySelectorAll('.hero-float-card');
        window.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;

            floatCards.forEach(card => {
                const speed = parseFloat(card.getAttribute('data-parallax')) || 0.1;
                const moveX = x * speed * 30;
                const moveY = y * speed * 20;
                card._mouseOffsetX = moveX;
                card._mouseOffsetY = moveY;
                applyTransform(card);
            });
        }, { passive: true });
    }

    // ───── Hero title underline draw-in animation ─────
    const underline = document.querySelector('.hero-title-underline');
    if (underline) {
        const path = underline.querySelector('path');
        if (path) {
            const length = path.getTotalLength();
            path.style.strokeDasharray = length;
            path.style.strokeDashoffset = length;
            path.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1) 0.6s';

            setTimeout(() => {
                path.style.strokeDashoffset = '0';
            }, 400);
        }
    }

    // ───── FAQ Accordion ─────
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const toggle = item.querySelector('.faq-toggle');
        const content = item.querySelector('.faq-content');
        if (toggle && content) {
            toggle.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all other items first
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        const otherContent = otherItem.querySelector('.faq-content');
                        if (otherContent) otherContent.style.maxHeight = null;
                    }
                });
                
                // Toggle active class
                item.classList.toggle('active', !isActive);
                if (!isActive) {
                    content.style.maxHeight = content.scrollHeight + 'px';
                } else {
                    content.style.maxHeight = null;
                }
            });
        }
    });

});
