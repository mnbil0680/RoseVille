/* =============================================
   RoseVille Landing Page – JavaScript
   ============================================= */

(function () {
    'use strict';

    // ───── State ─────
    let currentLang = 'en';

    // ───── DOM Cache ─────
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

    const header = $('#header');
    const nav = $('#nav');
    const navToggle = $('#navToggle');
    const langToggle = $('#langToggle');
    const langText = $('.lang-toggle__text');
    const backToTop = $('#backToTop');
    const contactForm = $('#contactForm');
    const formStatus = $('#formStatus');
    const filterBtns = $$('.products__filter');
    const productCards = $$('.product-card');
    const navLinks = $$('.nav__link');

    // ───── Language Toggle ─────
    function setLanguage(lang) {
        currentLang = lang;
        const html = document.documentElement;

        html.setAttribute('lang', lang);
        html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

        // Update text content for all translatable elements
        $$('[data-en]').forEach(el => {
            const text = el.getAttribute(`data-${lang}`);
            if (text) el.textContent = text;
        });

        // Update placeholders
        $$('[data-en-placeholder]').forEach(el => {
            const placeholder = el.getAttribute(`data-${lang}-placeholder`);
            if (placeholder) el.placeholder = placeholder;
        });

        // Update title attributes
        $$('[data-en-title]').forEach(el => {
            const title = el.getAttribute(`data-${lang}-title`);
            if (title) el.title = title;
        });

        // Toggle button text
        langText.textContent = lang === 'en' ? 'عربي' : 'English';

        // Update page title & meta description
        document.title = lang === 'en'
            ? 'RoseVille – Premium Flower Bouquets'
            : 'روزفيل – باقات الزهور الفاخرة';

        const metaDesc = $('meta[name="description"]');
        if (metaDesc) {
            metaDesc.content = lang === 'en'
                ? 'RoseVille – Premium natural and artificial flower bouquets for every occasion. Order fresh roses, tulips, and elegant arrangements delivered to your door.'
                : 'روزفيل – باقات زهور طبيعية وصناعية فاخرة لكل مناسبة. اطلب الورود الطازجة والتوليب والتنسيقات الأنيقة لتصل إلى باب منزلك.';
        }

        // Save preference
        try { localStorage.setItem('roseville-lang', lang); } catch (_) { }

        // Sync rotating headline phrase to new language
        const rotEl = $('#heroRotatingText');
        if (rotEl && typeof rotEl._syncLang === 'function') rotEl._syncLang();
    }

    langToggle.addEventListener('click', () => {
        setLanguage(currentLang === 'en' ? 'ar' : 'en');
    });

    // ───── Mobile Nav Toggle ─────
    navToggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close nav on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Close nav on outside click
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !navToggle.contains(e.target)) {
            nav.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // ───── Header Scroll Effect ─────
    let lastScroll = 0;

    function onScroll() {
        const scrollY = window.scrollY;

        // Header shadow
        header.classList.toggle('scrolled', scrollY > 50);

        // Back to top visibility
        backToTop.classList.toggle('visible', scrollY > 600);

        lastScroll = scrollY;
    }

    // Throttled scroll
    let scrollTicking = false;
    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            requestAnimationFrame(() => {
                onScroll();
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }, { passive: true });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ───── Active Nav Link on Scroll ─────
    const sections = $$('section[id]');

    function updateActiveNav() {
        const scrollY = window.scrollY + 120;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollY >= top && scrollY < top + height) {
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }

    window.addEventListener('scroll', () => {
        requestAnimationFrame(updateActiveNav);
    }, { passive: true });

    // ───── Product Filters ─────
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;

            // Update active state
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            // Filter products
            productCards.forEach(card => {
                const category = card.dataset.category;
                if (filter === 'all' || category === filter) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // ───── Contact Form ─────
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Simple validation
        const name = $('#name');
        const email = $('#email');
        const message = $('#message');
        let isValid = true;

        [name, email, message].forEach(input => {
            input.classList.remove('error');
            if (!input.value.trim()) {
                input.classList.add('error');
                isValid = false;
            }
        });

        // Email pattern check
        if (email.value && !/^\S+@\S+\.\S+$/.test(email.value.trim())) {
            email.classList.add('error');
            isValid = false;
        }

        if (!isValid) {
            formStatus.className = 'form__status error';
            formStatus.textContent = currentLang === 'en'
                ? 'Please fill in all required fields correctly.'
                : 'يرجى ملء جميع الحقول المطلوبة بشكل صحيح.';
            return;
        }

        // Simulate success
        formStatus.className = 'form__status success';
        formStatus.textContent = currentLang === 'en'
            ? 'Thank you! Your message has been sent. We\'ll get back to you soon. 🌹'
            : 'شكراً لك! تم إرسال رسالتك. سنتواصل معك قريباً. 🌹';

        contactForm.reset();

        // Clear success message after 5s
        setTimeout(() => {
            formStatus.className = 'form__status';
            formStatus.textContent = '';
        }, 5000);
    });

    // ───── Scroll Reveal (Intersection Observer) ─────
    function setupReveal() {
        const revealElements = $$('.about__card, .product-card, .testimonial-card, .contact__info-card, .section__header');

        revealElements.forEach(el => el.classList.add('reveal'));

        if (!('IntersectionObserver' in window)) {
            revealElements.forEach(el => el.classList.add('revealed'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach((el, i) => {
            el.style.transitionDelay = `${(i % 4) * 0.1}s`;
            observer.observe(el);
        });
    }

    // ───── Smooth Scroll for anchor links ─────
    $$('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;

            const target = $(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ───── Hero Image Slider ─────
    function setupHeroSlider() {
        const slides = $$('.hero__slide');
        const dots = $$('.hero__slider-dot');
        if (!slides.length) return;

        const DURATION = 4500;
        let current = 0;
        let timer;

        function goTo(next) {
            if (next === current) return;

            // Exit current slide
            slides[current].classList.remove('hero__slide--active');
            slides[current].classList.add('hero__slide--exiting');
            dots[current].classList.remove('hero__slider-dot--active');
            dots[current].setAttribute('aria-selected', 'false');

            const prev = current;
            setTimeout(() => slides[prev].classList.remove('hero__slide--exiting'), 1200);

            // Restart dot animation by forcing reflow
            const newDot = dots[next];
            newDot.classList.remove('hero__slider-dot--active');
            void newDot.offsetWidth; // reflow
            newDot.classList.add('hero__slider-dot--active');
            newDot.setAttribute('aria-selected', 'true');

            current = next;
            slides[current].classList.add('hero__slide--active');
        }

        function advance() {
            goTo((current + 1) % slides.length);
        }

        function resetTimer() {
            clearInterval(timer);
            timer = setInterval(advance, DURATION);
        }

        // Manual dot navigation
        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                if (i === current) return;
                goTo(i);
                resetTimer();
            });
        });

        // Pause on hover
        const frame = document.querySelector('.hero__visual-main');
        if (frame) {
            frame.addEventListener('mouseenter', () => clearInterval(timer));
            frame.addEventListener('mouseleave', resetTimer);
        }

        // Start auto-advance
        timer = setInterval(advance, DURATION);
    }

    // ───── Rotating Hero Phrases ─────
    function setupRotatingText() {
        const el = $('#heroRotatingText');
        if (!el) return;

        const phrasesEn = JSON.parse(el.dataset.phrasesEn || '[]');
        const phrasesAr = JSON.parse(el.dataset.phrasesAr || '[]');
        let index = 0;

        // Show correct language from the start
        el.textContent = currentLang === 'ar' ? phrasesAr[0] : phrasesEn[0];

        // Expose sync handle so setLanguage() can update the text live
        el._syncLang = () => {
            const phrases = currentLang === 'ar' ? phrasesAr : phrasesEn;
            el.textContent = phrases[index];
        };

        function cyclePhrase() {
            index = (index + 1) % phrasesEn.length;

            el.classList.add('is-exiting');

            setTimeout(() => {
                const phrases = currentLang === 'ar' ? phrasesAr : phrasesEn;
                el.textContent = phrases[index];
                el.classList.remove('is-exiting');
                el.classList.add('is-entering');
                setTimeout(() => el.classList.remove('is-entering'), 560);
            }, 380);
        }

        setInterval(cyclePhrase, 3400);
    }

    // ───── Initialize ─────
    // ───── About cards staggered entrance ─────
    function setupAboutCards() {
        const cards = $$('.about__card');
        if (!cards.length) return;

        if (!('IntersectionObserver' in window)) {
            cards.forEach(c => c.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        cards.forEach(c => observer.observe(c));
    }

    function init() {
        // Restore language preference
        try {
            const savedLang = localStorage.getItem('roseville-lang');
            if (savedLang && (savedLang === 'en' || savedLang === 'ar')) {
                setLanguage(savedLang);
            }
        } catch (_) { }

        setupReveal();
        setupAboutCards();
        setupHeroSlider();
        setupRotatingText();
        onScroll();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
