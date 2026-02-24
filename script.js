/* =============================================
   RoseVille Landing Page – JavaScript
   ============================================= */

(function () {
    'use strict';

    // ───── State ─────
    let currentLang = 'ar';

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
        const revealElements = $$('.about__card, .product-card, .testimonials__slider, .faq__item, .contact__info-card, .contact__form-panel, .contact__map, .section__header');

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

    // ───── Sound Engine (Web Audio API — no external files) ─────
    const SoundEngine = (() => {
        let _ctx = null;

        function ctx() {
            if (!_ctx) {
                try { _ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { }
            }
            // Resume if browser suspended it (autoplay policy)
            if (_ctx && _ctx.state === 'suspended') _ctx.resume();
            return _ctx;
        }

        function tone(ac, freq, type, t0, duration, peak) {
            const osc = ac.createOscillator();
            const gain = ac.createGain();
            osc.connect(gain);
            gain.connect(ac.destination);
            osc.type = type;
            osc.frequency.setValueAtTime(freq, t0);
            gain.gain.setValueAtTime(0, t0);
            gain.gain.linearRampToValueAtTime(peak, t0 + 0.012);
            gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
            osc.start(t0);
            osc.stop(t0 + duration + 0.01);
        }

        // Dreamy three-note ascending chime — card image tap
        function chime() {
            const ac = ctx(); if (!ac) return;
            const t = ac.currentTime;
            tone(ac, 523.25, 'sine', t, 0.55, 0.10); // C5
            tone(ac, 659.25, 'sine', t + 0.09, 0.50, 0.08); // E5
            tone(ac, 783.99, 'sine', t + 0.18, 0.65, 0.07); // G5
            // Subtle shimmer overtone
            tone(ac, 1046.5, 'sine', t + 0.27, 0.55, 0.04); // C6
        }

        // Soft heart pop — wishlist toggle
        function heartPop(saved) {
            const ac = ctx(); if (!ac) return;
            const t = ac.currentTime;
            if (saved) {
                // Ascending "in" pop
                tone(ac, 440, 'sine', t, 0.18, 0.13);
                tone(ac, 880, 'sine', t + 0.09, 0.32, 0.09);
                tone(ac, 1320, 'triangle', t + 0.18, 0.28, 0.05);
            } else {
                // Descending "out" pop
                tone(ac, 660, 'sine', t, 0.18, 0.09);
                tone(ac, 440, 'sine', t + 0.09, 0.28, 0.06);
            }
        }

        // Satisfying four-note purchase chime — Order Now
        function orderChime() {
            const ac = ctx(); if (!ac) return;
            const t = ac.currentTime;
            tone(ac, 523.25, 'sine', t, 0.40, 0.09); // C5
            tone(ac, 659.25, 'sine', t + 0.07, 0.40, 0.09); // E5
            tone(ac, 783.99, 'sine', t + 0.14, 0.40, 0.09); // G5
            tone(ac, 1046.5, 'sine', t + 0.21, 0.70, 0.10); // C6 — long tail
        }

        return { chime, heartPop, orderChime };
    })();

    // ───── Product Cards: wishlist toggle + sounds ─────
    function setupProductCards() {
        const cards = $$('.product-card');
        if (!cards.length) return;

        cards.forEach(card => {
            // ── Sound on image area click ──
            const imgWrap = card.querySelector('.product-card__img');
            if (imgWrap) {
                imgWrap.style.cursor = 'pointer';
                imgWrap.addEventListener('click', (e) => {
                    // Don't fire if clicking wishlist button inside the img area
                    if (e.target.closest('.product-card__wishlist')) return;
                    SoundEngine.chime();
                    // Ripple burst on the overlay
                    const overlay = imgWrap.querySelector('.product-card__img-overlay');
                    if (overlay) {
                        overlay.style.transition = 'opacity 0.08s ease';
                        overlay.style.opacity = '0.55';
                        setTimeout(() => { overlay.style.opacity = ''; overlay.style.transition = ''; }, 180);
                    }
                });
            }

            // ── Wishlist heart toggle ──
            const btn = card.querySelector('.product-card__wishlist');
            if (!btn) return;

            // Restore saved state from sessionStorage (per page session)
            const productTitle = card.querySelector('.product-card__title');
            const key = 'wishlist-' + (productTitle ? productTitle.textContent.trim() : Math.random());

            try {
                if (sessionStorage.getItem(key) === '1') btn.classList.add('is-saved');
            } catch (_) { }

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const saved = btn.classList.toggle('is-saved');
                btn.setAttribute('aria-label', saved ? 'Remove from wishlist' : 'Save to wishlist');
                // Heartbeat pop animation
                btn.style.transform = 'scale(1.35)';
                setTimeout(() => { btn.style.transform = ''; }, 220);
                SoundEngine.heartPop(saved);
                try { sessionStorage.setItem(key, saved ? '1' : '0'); } catch (_) { }
            });

            // ── Order Now button chime ──
            const orderBtn = card.querySelector('.btn--primary');
            if (orderBtn) {
                orderBtn.addEventListener('click', () => SoundEngine.orderChime());
            }
        });
    }

    // ───── Testimonials Slider ─────
    function setupTestimonialsSlider() {
        const slider = document.querySelector('.testimonials__slider');
        if (!slider) return;

        const track = slider.querySelector('.testimonials__track');
        const cards = [...slider.querySelectorAll('.testimonial-card')];
        const dotWrap = slider.querySelector('.testimonials__dots');
        const prevBtn = slider.querySelector('.testimonials__btn--prev');
        const nextBtn = slider.querySelector('.testimonials__btn--next');
        if (!cards.length || !track) return;

        let current = 0;
        let autoTimer = null;
        const AUTO_MS = 5500;

        // Build dots
        const dots = cards.map((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'testimonials__dot' + (i === 0 ? ' is-active' : '');
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
            dot.addEventListener('click', () => { goTo(i); resetAuto(); });
            dotWrap.appendChild(dot);
            return dot;
        });

        function goTo(index) {
            cards[current].classList.remove('is-active');
            cards[current].setAttribute('aria-hidden', 'true');
            dots[current].classList.remove('is-active');

            current = ((index % cards.length) + cards.length) % cards.length;

            track.style.transform = 'translateX(' + -(current * 100) + '%)';

            cards[current].classList.add('is-active');
            cards[current].setAttribute('aria-hidden', 'false');
            dots[current].classList.add('is-active');

            // Re-fire star + verified animations for the active card
            const el = cards[current];
            const stars = el.querySelectorAll('.testimonial-card__star');
            const verified = el.querySelector('.testimonial-card__verified');
            stars.forEach(s => { s.style.cssText = 'transition:none;opacity:0;transform:scale(0.4) translateY(4px)'; });
            if (verified) verified.style.cssText = 'transition:none;opacity:0;transform:scale(0.5)';
            requestAnimationFrame(() => {
                stars.forEach(s => { s.style.cssText = ''; });
                if (verified) verified.style.cssText = '';
                requestAnimationFrame(() => {
                    stars.forEach(s => { s.style.opacity = '1'; s.style.transform = 'scale(1) translateY(0)'; });
                    if (verified) { verified.style.opacity = '1'; verified.style.transform = 'scale(1)'; }
                });
            });
        }

        // Initialise first card
        cards[0].classList.add('is-active');
        cards[0].setAttribute('aria-hidden', 'false');

        prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
        nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

        function startAuto() {
            autoTimer = setInterval(() => goTo(current + 1), AUTO_MS);
        }
        function resetAuto() {
            clearInterval(autoTimer);
            startAuto();
        }

        // Touch/swipe support
        let touchStartX = 0;
        track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
        track.addEventListener('touchend', e => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(dx) > 48) {
                goTo(current + (dx < 0 ? 1 : -1));
                resetAuto();
            }
        }, { passive: true });

        // Pause auto-play when user hovers
        slider.addEventListener('mouseenter', () => clearInterval(autoTimer));
        slider.addEventListener('mouseleave', () => resetAuto());

        startAuto();
    }

    // ───── FAQ Accordion ─────
    function setupFaq() {
        const items = $$('.faq__item');
        if (!items.length) return;

        function openItem(item) {
            const btn = item.querySelector('.faq__question');
            const answer = item.querySelector('.faq__answer');
            item.classList.add('is-open');
            btn.setAttribute('aria-expanded', 'true');
            answer.setAttribute('aria-hidden', 'false');
            answer.style.maxHeight = answer.scrollHeight + 'px';
        }

        function closeItem(item) {
            const btn = item.querySelector('.faq__question');
            const answer = item.querySelector('.faq__answer');
            item.classList.remove('is-open');
            btn.setAttribute('aria-expanded', 'false');
            answer.setAttribute('aria-hidden', 'true');
            answer.style.maxHeight = null;
        }

        items.forEach(item => {
            const btn = item.querySelector('.faq__question');
            if (!btn) return;

            btn.addEventListener('click', () => {
                const isOpen = item.classList.contains('is-open');
                // Close all
                items.forEach(i => closeItem(i));
                // Toggle open if it was closed
                if (!isOpen) openItem(item);
            });

            // Keyboard: Enter / Space already fires click on <button>
            // Support Home/End/ArrowUp/ArrowDown within the list
            btn.addEventListener('keydown', (e) => {
                const list = Array.from(items);
                const idx = list.indexOf(item);
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const next = list[idx + 1];
                    if (next) next.querySelector('.faq__question').focus();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prev = list[idx - 1];
                    if (prev) prev.querySelector('.faq__question').focus();
                } else if (e.key === 'Home') {
                    e.preventDefault();
                    list[0].querySelector('.faq__question').focus();
                } else if (e.key === 'End') {
                    e.preventDefault();
                    list[list.length - 1].querySelector('.faq__question').focus();
                }
            });
        });

        // Open first item by default once revealed
        requestAnimationFrame(() => openItem(items[0]));
    }

    function init() {
        // Restore language preference
        try {
            const savedLang = localStorage.getItem('roseville-lang');
            setLanguage((savedLang === 'en' || savedLang === 'ar') ? savedLang : 'ar');
        } catch (_) {
            setLanguage('ar');
        }

        setupReveal();
        setupAboutCards();
        setupProductCards();
        setupTestimonialsSlider();
        setupFaq();
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
